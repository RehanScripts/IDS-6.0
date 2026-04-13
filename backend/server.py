from dotenv import load_dotenv
from pathlib import Path
import asyncio
import io
import re
from collections import Counter

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Form, UploadFile, File
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import requests
import smtplib
from urllib.parse import quote
from pydantic import BaseModel, Field, EmailStr
from typing import Any, List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets
from email.message import EmailMessage
from pypdf import PdfReader
from docx import Document
from fpdf import FPDF
from supabase import Client, create_client
from postgrest.exceptions import APIError

try:
    import pytesseract
    from PIL import Image
except Exception:
    pytesseract = None
    Image = None

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
OCR_SPACE_API_KEY = os.environ.get("OCR_SPACE_API_KEY", "").strip()
OCR_SPACE_API_URL = os.environ.get("OCR_SPACE_API_URL", "https://api.ocr.space/parse/image")

supabase_service: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase_service = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

supabase_public: Optional[Client] = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    supabase_public = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

class _SupabaseCursor:
    def __init__(self, rows: list[dict[str, Any]]):
        self._rows = rows

    async def to_list(self, _limit: int) -> list[dict[str, Any]]:
        return list(self._rows)

class _SupabaseCollection:
    def __init__(self, client: Client, table_name: str):
        self._client = client
        self._table = table_name

    def _apply_filters(self, query, filters: dict) -> Any:
        for key, value in (filters or {}).items():
            column = "id" if key == "_id" else key
            if isinstance(value, dict):
                if "$gte" in value:
                    query = query.gte(column, value["$gte"])
                if "$lt" in value:
                    query = query.lt(column, value["$lt"])
            else:
                query = query.eq(column, value)
        return query

    def _project_row(self, row: dict[str, Any], projection: Optional[dict]) -> dict[str, Any]:
        if not projection:
            return row

        include_keys = [k for k, v in projection.items() if v and k != "_id"]
        if include_keys:
            return {k: row.get(k) for k in include_keys}

        # Exclusion projection (e.g. {"_id": 0, "password_hash": 0})
        excluded = {k for k, v in projection.items() if v == 0}
        filtered = dict(row)
        for key in excluded:
            filtered.pop(key, None)
        return filtered

    def _normalize_json_value(self, value: Any) -> Any:
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {k: self._normalize_json_value(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._normalize_json_value(v) for v in value]
        return value

    def _missing_column_name(self, exc: Exception) -> Optional[str]:
        message = str(exc)
        match = re.search(r"Could not find the '([^']+)' column", message)
        if match:
            return match.group(1)
        return None

    def _is_invalid_uuid_error(self, exc: Exception) -> bool:
        return "invalid input syntax for type uuid" in str(exc).lower()

    async def find_one(self, filters: dict, projection: Optional[dict] = None) -> Optional[dict[str, Any]]:
        query = self._client.table(self._table).select("*")
        query = self._apply_filters(query, filters)
        response = query.limit(1).execute()
        rows = response.data or []
        if not rows:
            return None
        return self._project_row(rows[0], projection)

    async def insert_one(self, doc: dict[str, Any]):
        payload = self._normalize_json_value(dict(doc))
        payload.setdefault("id", str(uuid.uuid4()))
        while True:
            try:
                response = self._client.table(self._table).insert(payload).execute()
                break
            except APIError as exc:
                if self._is_invalid_uuid_error(exc) and "id" in payload:
                    payload.pop("id", None)
                    continue
                missing = self._missing_column_name(exc)
                if missing and missing in payload:
                    payload.pop(missing, None)
                    continue
                raise
        inserted = (response.data or [payload])[0]
        return type("_InsertResult", (), {"inserted_id": inserted.get("id")})()

    async def update_one(self, filters: dict, update: dict):
        update_fields = self._normalize_json_value(update.get("$set", update))
        while True:
            if not update_fields:
                return
            try:
                query = self._client.table(self._table).update(update_fields)
                query = self._apply_filters(query, filters)
                query.execute()
                return
            except APIError as exc:
                missing = self._missing_column_name(exc)
                if missing and missing in update_fields:
                    update_fields.pop(missing, None)
                    continue
                raise

    async def count_documents(self, filters: dict) -> int:
        query = self._client.table(self._table).select("id", count="exact", head=True)
        query = self._apply_filters(query, filters)
        response = query.execute()
        return response.count or 0

    def find(self, filters: dict, projection: Optional[dict] = None) -> _SupabaseCursor:
        query = self._client.table(self._table).select("*")
        query = self._apply_filters(query, filters)
        response = query.execute()
        rows = response.data or []
        projected = [self._project_row(row, projection) for row in rows]
        return _SupabaseCursor(projected)

    async def create_index(self, *_args, **_kwargs):
        return None

class _SupabaseDatabase:
    def __init__(self, client: Client):
        self.users = _SupabaseCollection(client, "profiles")
        self.companies = _SupabaseCollection(client, "companies")
        self.roadmaps = _SupabaseCollection(client, "roadmaps")
        self.student_progress = _SupabaseCollection(client, "student_progress")

db = _SupabaseDatabase(supabase_service) if supabase_service else None

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_MINUTES = int(os.environ.get("ACCESS_TOKEN_TTL_MINUTES", "60") or "60")
REFRESH_TOKEN_TTL_DAYS = int(os.environ.get("REFRESH_TOKEN_TTL_DAYS", "7") or "7")


def _is_truthy(value: Optional[str]) -> bool:
    return str(value or "").strip().lower() in {"1", "true", "yes", "on"}


def _is_production_env() -> bool:
    env_name = (
        os.environ.get("ENVIRONMENT")
        or os.environ.get("APP_ENV")
        or os.environ.get("PYTHON_ENV")
        or ""
    ).strip().lower()
    return env_name in {"prod", "production"} or bool(os.environ.get("RENDER"))


def _cookie_settings() -> tuple[bool, str, Optional[str]]:
    secure = _is_truthy(os.environ.get("COOKIE_SECURE")) if os.environ.get("COOKIE_SECURE") is not None else _is_production_env()
    configured_samesite = str(os.environ.get("COOKIE_SAMESITE", "")).strip().lower()
    if configured_samesite in {"lax", "strict", "none"}:
        samesite = configured_samesite
    else:
        samesite = "none" if secure else "lax"

    # Browsers require Secure when SameSite=None.
    if samesite == "none" and not secure:
        secure = True

    cookie_domain = str(os.environ.get("COOKIE_DOMAIN", "")).strip() or None
    return secure, samesite, cookie_domain


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure, samesite, cookie_domain = _cookie_settings()
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=900,
        path="/",
        domain=cookie_domain,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=604800,
        path="/",
        domain=cookie_domain,
    )


def _clear_auth_cookies(response: Response) -> None:
    _, _, cookie_domain = _cookie_settings()
    response.delete_cookie("access_token", path="/", domain=cookie_domain)
    response.delete_cookie("refresh_token", path="/", domain=cookie_domain)


def _parse_cors_origins() -> list[str]:
    def _normalize_origin(value: str) -> str:
        return value.strip().rstrip("/")

    extra_origins = []
    for key in ("FRONTEND_URL", "FRONTEND_ORIGIN"):
        value = str(os.environ.get(key, "")).strip()
        if value:
            extra_origins.append(_normalize_origin(value))

    raw = str(os.environ.get("CORS_ORIGINS", "")).strip()
    if raw:
        configured = [_normalize_origin(origin) for origin in raw.split(",") if origin.strip()]
        # Preserve order while de-duplicating.
        return list(dict.fromkeys([*configured, *extra_origins]))

    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://jovita-placement-platform-94c0ae.preview.emergentagent.com",
    ]
    return list(dict.fromkeys([*defaults, *extra_origins]))


def _cors_origin_regex() -> Optional[str]:
    explicit_regex = str(os.environ.get("CORS_ORIGIN_REGEX", "")).strip()
    if explicit_regex:
        return explicit_regex

    is_production = _is_production_env()
    allow_onrender = os.environ.get("CORS_ALLOW_ONRENDER")
    allow_vercel = os.environ.get("CORS_ALLOW_VERCEL")

    patterns = []
    # In production deployments, allow Render/Vercel-hosted frontend origins by default.
    if (allow_onrender is None and is_production) or _is_truthy(allow_onrender):
        patterns.append(r"[a-z0-9-]+\.onrender\.com")
    if (allow_vercel is None and is_production) or _is_truthy(allow_vercel):
        patterns.append(r"[a-z0-9-]+\.vercel\.app")

    if not patterns:
        return None
    return rf"^https://(?:{'|'.join(patterns)})$"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_TTL_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_TTL_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_TTL_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )

def decode_refresh_token(refresh_token: str) -> dict[str, Any]:
    payload = jwt.decode(refresh_token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload

def create_supabase_auth_user(email: str, password: str, metadata: Optional[dict[str, Any]] = None) -> Optional[str]:
    if supabase_service is None:
        return None
    try:
        created = supabase_service.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": metadata or {},
            }
        )
        user = getattr(created, "user", None)
        return str(getattr(user, "id", "")) if user else None
    except Exception:
        return None

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        if os.environ.get("ALLOW_MOCK_AUTH", "false").lower() == "true":
            return {"id": "mock_tpo_id", "email": "tpo@college.edu", "name": "TPO Admin", "role": "tpo"}
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Hardcoded check for mock IDs
        if payload["sub"] == "mock_tpo_id":
            return {"id": "mock_tpo_id", "email": "tpo@college.edu", "name": "TPO Admin", "role": "tpo"}
        if payload["sub"] == "mock_student_id":
            return {"id": "mock_student_id", "email": "student@college.edu", "name": "Abhay Patil", "role": "student", "branch": "Mechanical Engineering"}

        if db is None:
            raise HTTPException(status_code=401, detail="Database not connected")
             
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(payload["sub"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    branch: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class StudentProfileUpdateRequest(BaseModel):
    about: str = Field(min_length=1, max_length=2000)

class QueryForwardRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=5, max_length=5000)

SKILL_KEYWORDS = [
    "python", "java", "c++", "javascript", "react", "node", "sql", "mongodb",
    "machine learning", "data analysis", "excel", "power bi", "autocad", "solidworks",
    "ansys", "matlab", "communication", "leadership", "teamwork", "problem solving",
]

def _extract_text_via_ocr_space(file_name: str, file_bytes: bytes) -> str:
    if not OCR_SPACE_API_KEY:
        return ""
    try:
        files = {
            "filename": (file_name or "resume", file_bytes),
        }
        data = {
            "language": "eng",
            "isOverlayRequired": "false",
            "OCREngine": "2",
            "scale": "true",
        }
        headers = {"apikey": OCR_SPACE_API_KEY}
        response = requests.post(OCR_SPACE_API_URL, files=files, data=data, headers=headers, timeout=30)
        response.raise_for_status()
        payload = response.json() or {}
        if payload.get("IsErroredOnProcessing"):
            return ""
        parsed = payload.get("ParsedResults") or []
        chunks = [str(item.get("ParsedText", "")).strip() for item in parsed if item.get("ParsedText")]
        return "\n".join(chunks).strip()
    except Exception:
        return ""

def _extract_text_from_resume(file_name: str, file_bytes: bytes, content_type: str) -> str:
    file_name = (file_name or "").lower()
    content_type = (content_type or "").lower()

    # OCR.Space is the primary extractor; local parsers are a reliability fallback.
    ocr_text = _extract_text_via_ocr_space(file_name, file_bytes)
    if ocr_text:
        return ocr_text

    if file_name.endswith(".pdf") or "pdf" in content_type:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            pages = [page.extract_text() or "" for page in reader.pages]
            text = "\n".join(pages).strip()
            if text:
                return text
        except Exception:
            pass

    if file_name.endswith(".docx") or "word" in content_type:
        try:
            document = Document(io.BytesIO(file_bytes))
            return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text).strip()
        except Exception:
            pass

    if file_name.endswith(".txt") or "text/plain" in content_type:
        try:
            return file_bytes.decode("utf-8", errors="ignore").strip()
        except Exception:
            pass

    if (file_name.endswith(".png") or file_name.endswith(".jpg") or file_name.endswith(".jpeg") or "image" in content_type) and pytesseract and Image:
        try:
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image).strip()
            if text:
                return text
        except Exception:
            pass

    return ""

def _nlp_resume_insights(text: str) -> dict:
    normalized = (text or "").lower()
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+.#-]{1,}", normalized)
    token_counts = Counter(tokens)

    phones = re.findall(r"(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){10,13}", text or "")
    emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text or "")
    links = re.findall(r"https?://\S+|www\.\S+", text or "")

    matched_skills = []
    for skill in SKILL_KEYWORDS:
        if skill in normalized:
            matched_skills.append(skill.title())

    top_terms = [term for term, _ in token_counts.most_common(8) if len(term) > 3]
    summary = " ".join((text or "").split())[:280]

    return {
        "skills": sorted(set(matched_skills)),
        "emails": sorted(set(emails))[:5],
        "phones": sorted(set(phones))[:5],
        "links": sorted(set(links))[:5],
        "top_terms": top_terms,
        "summary": summary,
        "text_preview": (text or "")[:800],
    }

def _send_query_email(name: str, sender_email: str, message: str) -> None:
    recipient = os.environ.get("ADMIN_QUERY_EMAIL", "").strip()
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_port = int(os.environ.get("SMTP_PORT", "587") or "587")
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    smtp_from = (os.environ.get("SMTP_FROM", "") or smtp_user).strip()

    if not recipient:
        raise RuntimeError("ADMIN_QUERY_EMAIL is not configured")
    if not smtp_host:
        raise RuntimeError("SMTP_HOST is not configured")
    if not smtp_from:
        raise RuntimeError("SMTP_FROM or SMTP_USER must be configured")

    email_body = (
        f"A new user query was submitted from Sankalp landing page.\n\n"
        f"Name: {name}\n"
        f"Email: {sender_email}\n\n"
        f"Message:\n{message.strip()}\n"
    )

    mail = EmailMessage()
    mail["Subject"] = f"Sankalp Query from {name}"
    # Preserve SMTP-delivery reliability while showing the user's email as sender context.
    mail["From"] = f"{name} <{sender_email}>"
    mail["Sender"] = smtp_from
    mail["To"] = recipient
    mail["Reply-To"] = sender_email
    mail.set_content(email_body)

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.ehlo()
        if smtp_password:
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
        server.send_message(mail)

def _build_query_mailto(name: str, sender_email: str, message: str) -> str:
    recipient = os.environ.get("ADMIN_QUERY_EMAIL", "").strip() or "aasuryavanshi370724@kkwagh.edu.in"
    subject = quote(f"Query from {name}")
    body = quote(f"Name: {name}\nEmail: {sender_email}\n\nMessage:\n{message.strip()}")
    return f"mailto:{recipient}?subject={subject}&body={body}"

@api_router.post("/auth/register")
async def register(input: RegisterRequest, response: Response):
    email = input.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    auth_user_id = create_supabase_auth_user(
        email,
        input.password,
        {"name": input.name, "role": input.role, "branch": input.branch},
    )
    if not auth_user_id:
        raise HTTPException(status_code=400, detail="Unable to create authentication user")
    
    user_doc = {
        "id": auth_user_id,
        "email": email,
        "name": input.name,
        "role": input.role,
        "branch": input.branch,
        "readiness_score": 0,
        "placement_status": "not_placed",
        "weak_skills": [],
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)
    user_id = auth_user_id
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    _set_auth_cookies(response, access_token, refresh_token)

    return {
        "id": user_id,
        "email": email,
        "name": input.name,
        "role": input.role,
        "branch": input.branch,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }

@api_router.post("/auth/register-profile")
async def register_profile(
    response: Response,
    name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    role: str = Form("student"),
    branch: Optional[str] = Form(None),
    college_name: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    normalized_email = email.lower()
    existing = await db.users.find_one({"email": normalized_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    auth_user_id = create_supabase_auth_user(
        normalized_email,
        password,
        {"name": name, "role": role, "branch": branch},
    )
    if not auth_user_id:
        raise HTTPException(status_code=400, detail="Unable to create authentication user")

    resume_file_name = None
    resume_storage_name = None
    resume_content_type = None
    resume_insights = {
        "skills": [],
        "emails": [],
        "phones": [],
        "links": [],
        "top_terms": [],
        "summary": "",
        "text_preview": "",
    }

    if resume is not None:
        file_bytes = await resume.read()
        resume_file_name = resume.filename
        resume_content_type = resume.content_type or "application/octet-stream"
        suffix = Path(resume.filename or "resume").suffix
        resume_storage_name = f"{secrets.token_urlsafe(18)}{suffix}"
        (UPLOADS_DIR / resume_storage_name).write_bytes(file_bytes)
        extracted_text = _extract_text_from_resume(resume.filename or "", file_bytes, resume.content_type or "")
        resume_insights = _nlp_resume_insights(extracted_text)

    user_doc = {
        "id": auth_user_id,
        "email": normalized_email,
        "name": name,
        "role": role,
        "branch": branch,
        "readiness_score": 0,
        "placement_status": "not_placed",
        "weak_skills": [],
        "created_at": datetime.now(timezone.utc),
    }

    await db.users.insert_one(user_doc)
    user_id = auth_user_id

    access_token = create_access_token(user_id, normalized_email)
    refresh_token = create_refresh_token(user_id)
    _set_auth_cookies(response, access_token, refresh_token)

    return {
        "id": user_id,
        "email": normalized_email,
        "name": name,
        "role": role,
        "branch": branch,
        "college_name": college_name,
        "year": year,
        "about": about,
        "resume_file_name": resume_file_name,
        "resume_storage_name": resume_storage_name,
        "resume_content_type": resume_content_type,
        "resume_insights": resume_insights,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }

@api_router.post("/auth/login")
async def login(input: LoginRequest, response: Response):
    email = input.email.lower()
    
    # Mock login for demo users
    if email == "tpo@college.edu":
        user_id = "mock_tpo_id"
        user = {"email": email, "name": "TPO Admin", "role": "tpo", "branch": None}
    elif email == "student@college.edu":
        user_id = "mock_student_id"
        user = {"email": email, "name": "Abhay Patil", "role": "student", "branch": "Mechanical Engineering"}
    else:
        if db is None:
            raise HTTPException(status_code=401, detail="Database not connected and user not in mock list")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        password_ok = False
        stored_hash = user.get("password_hash")
        if stored_hash:
            password_ok = verify_password(input.password, stored_hash)
        elif supabase_public is not None:
            try:
                auth_result = supabase_public.auth.sign_in_with_password({"email": email, "password": input.password})
                password_ok = bool(getattr(auth_result, "user", None))
            except Exception:
                password_ok = False

        if not password_ok:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id = str(user.get("id"))
        user.pop("password_hash", None)

    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    _set_auth_cookies(response, access_token, refresh_token)
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "branch": user.get("branch"),
        "college_name": user.get("college_name"),
        "year": user.get("year"),
        "about": user.get("about"),
        "resume_file_name": user.get("resume_file_name"),
        "resume_storage_name": user.get("resume_storage_name"),
        "resume_content_type": user.get("resume_content_type"),
        "resume_insights": user.get("resume_insights"),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }

@api_router.post("/public/query")
async def submit_public_query(input: QueryForwardRequest):
    try:
        _send_query_email(input.name.strip(), input.email.lower(), input.message)
        return {"message": "Query sent successfully", "delivery": "smtp"}
    except Exception as err:
        logger.error("Failed to forward query email: %s", err)
        return {
            "message": "Mail service unavailable, using email-client fallback.",
            "delivery": "mailto_fallback",
            "fallbackMailto": _build_query_mailto(input.name.strip(), input.email.lower(), input.message),
        }

@api_router.post("/auth/logout")
async def logout(response: Response):
    _clear_auth_cookies(response)
    return {"message": "Logged out successfully"}

@api_router.post("/auth/refresh")
async def refresh_auth_session(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        refresh_token = request.headers.get("X-Refresh-Token")
    if not refresh_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            refresh_token = auth_header[7:]
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = decode_refresh_token(refresh_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = str(payload.get("sub") or "")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if user_id == "mock_tpo_id":
        email = "tpo@college.edu"
    elif user_id == "mock_student_id":
        email = "student@college.edu"
    else:
        if db is None:
            raise HTTPException(status_code=401, detail="Database not connected")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
        if not user or not user.get("email"):
            raise HTTPException(status_code=401, detail="User not found")
        email = str(user["email"])

    new_access_token = create_access_token(user_id, email)
    new_refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, new_access_token, new_refresh_token)
    return {
        "message": "Session refreshed",
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "Bearer",
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# ── Mock data constants ──────────────────────────────────────────────
MOCK_COMPANIES = [
    # ── Large-Scale Companies & Manufacturers ──
    {"id": "comp1", "company_name": "Mahindra & Mahindra Ltd.", "role": "Graduate Engineer Trainee (Mechanical)", "date": "2026-04-18", "eligibility": "Mechanical / Automobile, CGPA >= 6.5", "status": "active", "package": "6.2 LPA", "industry": "Automotive"},
    {"id": "comp2", "company_name": "Hindustan Aeronautics Limited (HAL)", "role": "Management Trainee – Aerospace", "date": "2026-04-25", "eligibility": "Mechanical / Aerospace, CGPA >= 7.0", "status": "active", "package": "8.5 LPA", "industry": "Automotive"},
    {"id": "comp3", "company_name": "ABB Ltd.", "role": "Electrical Design Engineer", "date": "2026-05-02", "eligibility": "Electrical / Electronics, CGPA >= 7.0", "status": "active", "package": "7.8 LPA", "industry": "Engineering"},
    {"id": "comp4", "company_name": "Siemens Ltd.", "role": "Automation Engineer", "date": "2026-05-10", "eligibility": "E&TC / Electrical / Instrumentation, CGPA >= 7.0", "status": "active", "package": "9.0 LPA", "industry": "Engineering"},
    {"id": "comp5", "company_name": "Bosch Ltd.", "role": "R&D Engineer – Automotive Systems", "date": "2026-05-12", "eligibility": "Mechanical / E&TC, CGPA >= 7.5", "status": "active", "package": "10.2 LPA", "industry": "Automotive"},
    {"id": "comp6", "company_name": "Jindal SAW Ltd.", "role": "Production Engineer – SAW Pipes", "date": "2026-05-15", "eligibility": "Mechanical / Metallurgy, CGPA >= 6.5", "status": "active", "package": "5.8 LPA", "industry": "Engineering"},
    {"id": "comp7", "company_name": "Samsonite South Asia Pvt Ltd.", "role": "Industrial Engineer – Manufacturing", "date": "2026-05-20", "eligibility": "Mechanical / Production, CGPA >= 6.0", "status": "active", "package": "5.0 LPA", "industry": "Engineering"},
    {"id": "comp8", "company_name": "Crompton Greaves Consumer Electricals", "role": "Electrical Engineer", "date": "2026-05-22", "eligibility": "Electrical / Electronics, CGPA >= 6.5", "status": "active", "package": "6.5 LPA", "industry": "Engineering"},
    {"id": "comp9", "company_name": "Ashoka Buildcon Ltd.", "role": "Site Engineer – Infrastructure Projects", "date": "2026-05-28", "eligibility": "Civil / Mechanical, CGPA >= 6.0", "status": "active", "package": "5.5 LPA", "industry": "Infrastructure"},
    # ── Key Manufacturing & Engineering ──
    {"id": "comp10", "company_name": "Gabriel India Ltd.", "role": "Manufacturing Engineer", "date": "2026-06-01", "eligibility": "Mechanical / Production, CGPA >= 6.0", "status": "upcoming", "package": "5.5 LPA", "industry": "Automotive"},
    {"id": "comp11", "company_name": "Ring Plus Aqua Ltd.", "role": "Design Engineer – Automotive Components", "date": "2026-06-05", "eligibility": "Mechanical / Civil, CGPA >= 6.0", "status": "upcoming", "package": "4.5 LPA", "industry": "Automotive"},
    {"id": "comp12", "company_name": "Master Components Limited", "role": "Quality Engineer – Auto Components", "date": "2026-06-08", "eligibility": "Mechanical / Automobile, CGPA >= 6.0", "status": "upcoming", "package": "4.8 LPA", "industry": "Automotive"},
    {"id": "comp13", "company_name": "Arrowhead Separation Engineering Ltd.", "role": "Process Engineer", "date": "2026-06-10", "eligibility": "Chemical / Mechanical, CGPA >= 6.5", "status": "upcoming", "package": "5.2 LPA", "industry": "Engineering"},
    {"id": "comp14", "company_name": "MSRTC – Regional Workshop, Nashik", "role": "Workshop Engineer", "date": "2026-06-12", "eligibility": "Mechanical / Automobile, CGPA >= 6.0", "status": "upcoming", "package": "4.2 LPA", "industry": "Automotive"},
    {"id": "comp15", "company_name": "Metalgenesis Industries Pvt. Ltd.", "role": "CNC Programmer / Machinist", "date": "2026-06-14", "eligibility": "Mechanical / Production, CGPA >= 6.0", "status": "upcoming", "package": "4.0 LPA", "industry": "Engineering"},
    {"id": "comp16", "company_name": "Kupfertech Corporation", "role": "Electrical Systems Engineer", "date": "2026-06-18", "eligibility": "Electrical / E&TC, CGPA >= 6.0", "status": "upcoming", "package": "4.5 LPA", "industry": "Engineering"},
    {"id": "comp17", "company_name": "Ambar Forge Plant 2", "role": "Forging Process Engineer", "date": "2026-06-20", "eligibility": "Mechanical / Metallurgy, CGPA >= 6.0", "status": "upcoming", "package": "4.8 LPA", "industry": "Engineering"},
    {"id": "comp18", "company_name": "Efacec India Pvt. Ltd.", "role": "Transformers Design Engineer", "date": "2026-06-22", "eligibility": "Electrical / Electronics, CGPA >= 6.5", "status": "upcoming", "package": "5.5 LPA", "industry": "Engineering"},
    # ── Pharmaceuticals & Agro-Processing ──
    {"id": "comp19", "company_name": "Pfizer Ltd.", "role": "Quality Analyst – Pharma", "date": "2026-06-25", "eligibility": "Chemical / Pharmaceutical, CGPA >= 7.0", "status": "upcoming", "package": "7.5 LPA", "industry": "Pharma"},
    {"id": "comp20", "company_name": "Cipla Ltd.", "role": "Production Executive – Pharma Manufacturing", "date": "2026-06-28", "eligibility": "Chemical / Pharmaceutical, CGPA >= 7.0", "status": "upcoming", "package": "6.8 LPA", "industry": "Pharma"},
    {"id": "comp21", "company_name": "Sahyadri Farms", "role": "Agri-Processing Engineer", "date": "2026-07-01", "eligibility": "Mechanical / Agricultural, CGPA >= 6.0", "status": "upcoming", "package": "4.2 LPA", "industry": "Pharma"},
    {"id": "comp22", "company_name": "Sagar Industries & Distilleries Ltd.", "role": "Plant Operations Engineer", "date": "2026-07-05", "eligibility": "Mechanical / Chemical, CGPA >= 6.0", "status": "upcoming", "package": "4.5 LPA", "industry": "Engineering"},
    # ── IT & Professional Services ──
    {"id": "comp23", "company_name": "Capgemini", "role": "Associate Consultant – Technology", "date": "2026-04-20", "eligibility": "CS / IT / E&TC, CGPA >= 6.5", "status": "active", "package": "7.5 LPA", "industry": "IT"},
    {"id": "comp24", "company_name": "Infosys", "role": "Systems Engineer", "date": "2026-04-22", "eligibility": "All branches, CGPA >= 6.0", "status": "active", "package": "6.5 LPA", "industry": "IT"},
    {"id": "comp25", "company_name": "DreamSoft IT Solutions Pvt. Ltd.", "role": "Junior Software Developer", "date": "2026-07-08", "eligibility": "CS / IT, CGPA >= 6.0", "status": "upcoming", "package": "4.0 LPA", "industry": "IT"},
    {"id": "comp26", "company_name": "Finiq Consulting India Pvt Ltd", "role": "Business Analyst", "date": "2026-07-10", "eligibility": "CS / IT / MBA, CGPA >= 6.5", "status": "upcoming", "package": "5.0 LPA", "industry": "IT"},
]


MOCK_STUDENTS = [
    {"name": "Abhay Patil", "email": "abhay.patil@sandip.edu.in", "branch": "Mechanical", "readiness_score": 78, "weak_skills": ["Thermodynamics", "CAD"], "placement_status": "not_placed"},
    {"name": "Sneha Deshmukh", "email": "sneha.deshmukh@sandip.edu.in", "branch": "Computer Science", "readiness_score": 85, "weak_skills": ["System Design"], "placement_status": "placed"},
    {"name": "Rohit Wagh", "email": "rohit.wagh@sandip.edu.in", "branch": "Electronics", "readiness_score": 62, "weak_skills": ["VLSI", "Embedded C"], "placement_status": "not_placed"},
    {"name": "Priya Kulkarni", "email": "priya.kulkarni@sandip.edu.in", "branch": "Mechanical", "readiness_score": 71, "weak_skills": ["FEA", "Manufacturing"], "placement_status": "not_placed"},
    {"name": "Aditya Jadhav", "email": "aditya.jadhav@sandip.edu.in", "branch": "Civil", "readiness_score": 68, "weak_skills": ["Structural Analysis", "AutoCAD"], "placement_status": "not_placed"},
    {"name": "Sakshi Shirsat", "email": "sakshi.shirsat@sandip.edu.in", "branch": "Computer Science", "readiness_score": 91, "weak_skills": ["Cloud Computing"], "placement_status": "placed"},
    {"name": "Omkar Gaikwad", "email": "omkar.gaikwad@sandip.edu.in", "branch": "Mechanical", "readiness_score": 55, "weak_skills": ["SolidWorks", "GD&T", "Materials"], "placement_status": "not_placed"},
    {"name": "Rutuja Pawar", "email": "rutuja.pawar@sandip.edu.in", "branch": "Electronics", "readiness_score": 74, "weak_skills": ["PCB Design"], "placement_status": "not_placed"},
    {"name": "Tejas Sonawane", "email": "tejas.sonawane@sandip.edu.in", "branch": "Mechanical", "readiness_score": 80, "weak_skills": ["IC Engines"], "placement_status": "placed"},
    {"name": "Vaibhavi More", "email": "vaibhavi.more@sandip.edu.in", "branch": "Computer Science", "readiness_score": 88, "weak_skills": ["DSA", "React"], "placement_status": "placed"},
    {"name": "Aniket Bhosale", "email": "aniket.bhosale@sandip.edu.in", "branch": "Civil", "readiness_score": 60, "weak_skills": ["RCC Design", "Estimation"], "placement_status": "not_placed"},
    {"name": "Pooja Nikam", "email": "pooja.nikam@sandip.edu.in", "branch": "Electronics", "readiness_score": 82, "weak_skills": ["Signal Processing"], "placement_status": "placed"},
    {"name": "Saurabh Chavan", "email": "saurabh.chavan@sandip.edu.in", "branch": "Mechanical", "readiness_score": 66, "weak_skills": ["Fluid Mechanics", "Automation"], "placement_status": "not_placed"},
    {"name": "Anjali Thakare", "email": "anjali.thakare@sandip.edu.in", "branch": "Computer Science", "readiness_score": 76, "weak_skills": ["DBMS", "Python"], "placement_status": "not_placed"},
    {"name": "Yash Borse", "email": "yash.borse@sandip.edu.in", "branch": "Mechanical", "readiness_score": 70, "weak_skills": ["Machine Design"], "placement_status": "not_placed"},
    {"name": "Nikita Ahire", "email": "nikita.ahire@sandip.edu.in", "branch": "Electronics", "readiness_score": 58, "weak_skills": ["Control Systems", "IoT"], "placement_status": "not_placed"},
    {"name": "Pratik Deokar", "email": "pratik.deokar@sandip.edu.in", "branch": "Civil", "readiness_score": 73, "weak_skills": ["Surveying"], "placement_status": "not_placed"},
    {"name": "Shreya Londhe", "email": "shreya.londhe@sandip.edu.in", "branch": "Computer Science", "readiness_score": 93, "weak_skills": [], "placement_status": "placed"},
    {"name": "Akash Mane", "email": "akash.mane@sandip.edu.in", "branch": "Mechanical", "readiness_score": 64, "weak_skills": ["Robotics", "PLC"], "placement_status": "not_placed"},
    {"name": "Gauri Sawant", "email": "gauri.sawant@sandip.edu.in", "branch": "Electronics", "readiness_score": 77, "weak_skills": ["Microcontrollers"], "placement_status": "not_placed"},
]

@api_router.get("/tpo/dashboard/stats")
async def get_tpo_dashboard_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        total = len(MOCK_STUDENTS)
        active = len([c for c in MOCK_COMPANIES if c["status"] == "active"])
        avg = round(sum(s["readiness_score"] for s in MOCK_STUDENTS) / total, 1)
        placed = len([s for s in MOCK_STUDENTS if s["placement_status"] == "placed"])
        return {"total_students": total, "upcoming_companies": active, "avg_readiness_score": avg, "placement_status": f"{placed}/{total}"}
    
    total_students = await db.users.count_documents({"role": "student"})
    upcoming_companies = await db.companies.count_documents({"status": "active"})
    
    students = await db.users.find({"role": "student"}, {"readiness_score": 1}).to_list(1000)
    avg_readiness = sum([s.get("readiness_score", 0) for s in students]) / max(len(students), 1)
    
    placed_students = await db.users.count_documents({"role": "student", "placement_status": "placed"})
    
    return {
        "total_students": total_students,
        "upcoming_companies": upcoming_companies,
        "avg_readiness_score": round(avg_readiness, 1),
        "placement_status": f"{placed_students}/{total_students}"
    }

@api_router.get("/tpo/dashboard/skill-gaps")
async def get_skill_gaps(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return [
        {"skill": "Thermodynamics", "count": 42},
        {"skill": "CAD/CAM", "count": 38},
        {"skill": "Manufacturing", "count": 35},
        {"skill": "DSA", "count": 30},
        {"skill": "Embedded Systems", "count": 28},
        {"skill": "Communication", "count": 22}
    ]

@api_router.get("/tpo/dashboard/readiness")
async def get_readiness_distribution(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        ready = len([s for s in MOCK_STUDENTS if s["readiness_score"] >= 70])
        not_ready = len([s for s in MOCK_STUDENTS if s["readiness_score"] < 70])
        return [{"name": "Ready", "value": ready}, {"name": "Not Ready", "value": not_ready}]

    ready = await db.users.count_documents({"role": "student", "readiness_score": {"$gte": 70}})
    not_ready = await db.users.count_documents({"role": "student", "readiness_score": {"$lt": 70}})
    
    return [
        {"name": "Ready", "value": ready},
        {"name": "Not Ready", "value": not_ready}
    ]

@api_router.get("/tpo/companies")
async def get_companies(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        return MOCK_COMPANIES

    companies = await db.companies.find({}, {"_id": 0}).to_list(100)
    return companies

class CompanyCreate(BaseModel):
    company_name: str
    role: str
    date: str
    eligibility: str
    status: str
    package: Optional[str] = None
    requirements: Optional[str] = None

@api_router.post("/tpo/companies")
async def create_company(input: CompanyCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    company_doc = input.model_dump()
    company_doc["id"] = secrets.token_urlsafe(8)
    company_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.companies.insert_one(company_doc)
    company_doc.pop("_id", None)  # Remove ObjectId before returning
    return company_doc

@api_router.get("/tpo/students")
async def get_students(request: Request, branch: Optional[str] = None, min_readiness: Optional[int] = None):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        filtered = MOCK_STUDENTS
        if branch:
            filtered = [s for s in filtered if s["branch"] == branch]
        if min_readiness is not None:
            filtered = [s for s in filtered if s["readiness_score"] >= min_readiness]
        return filtered

    query = {"role": "student"}
    if branch:
        query["branch"] = branch
    if min_readiness is not None:
        query["readiness_score"] = {"$gte": min_readiness}
    
    students = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return students

@api_router.get("/student/dashboard/stats")
async def get_student_dashboard_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        return {"readiness_score": 78, "active_roadmap": 2, "progress_percentage": 45}

    student_data = await db.users.find_one({"email": user["email"]})
    readiness_score = student_data.get("readiness_score", 0)
    
    roadmaps = await db.roadmaps.count_documents({"student_id": user["id"]})
    
    progress_doc = await db.student_progress.find_one({"student_email": user["email"]})
    progress = progress_doc.get("progress_percentage", 0) if progress_doc else 0
    
    return {
        "readiness_score": readiness_score,
        "active_roadmap": roadmaps,
        "progress_percentage": progress
    }

@api_router.get("/student/companies")
async def get_student_companies(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    if db is None:
        return MOCK_COMPANIES

    companies = await db.companies.find({"status": "active"}, {"_id": 0}).to_list(100)
    return companies

@api_router.patch("/student/profile")
async def update_student_profile(input: StudentProfileUpdateRequest, request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    about_text = input.about.strip()
    await db.users.update_one({"email": user["email"]}, {"$set": {"about": about_text}})

    updated_user = await db.users.find_one({"email": user["email"]}, {"_id": 0})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user["id"] = user["id"]
    updated_user.pop("password_hash", None)
    return updated_user

@api_router.post("/student/resume")
async def update_student_resume(request: Request, resume: UploadFile = File(...)):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    db_user = await db.users.find_one({"email": user["email"]}, {"id": 1, "resume_storage_name": 1})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded resume file is empty")

    suffix = Path(resume.filename or "resume").suffix
    resume_storage_name = f"{secrets.token_urlsafe(18)}{suffix}"
    resume_file_name = resume.filename or "resume"
    resume_content_type = resume.content_type or "application/octet-stream"

    (UPLOADS_DIR / resume_storage_name).write_bytes(file_bytes)

    old_storage_name = db_user.get("resume_storage_name")
    if old_storage_name:
        old_path = UPLOADS_DIR / old_storage_name
        if old_path.exists() and old_path.is_file():
            old_path.unlink(missing_ok=True)

    extracted_text = _extract_text_from_resume(resume_file_name, file_bytes, resume_content_type)
    resume_insights = _nlp_resume_insights(extracted_text)

    await db.users.update_one(
        {"id": db_user["id"]},
        {
            "$set": {
                "resume_file_name": resume_file_name,
                "resume_storage_name": resume_storage_name,
                "resume_content_type": resume_content_type,
                "resume_insights": resume_insights,
            }
        },
    )

    updated_user = await db.users.find_one({"id": db_user["id"]}, {"_id": 0})
    updated_user["id"] = user["id"]
    updated_user.pop("password_hash", None)
    return updated_user

@api_router.get("/student/resume")
async def download_student_resume(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    db_user = await db.users.find_one(
        {"email": user["email"]},
        {"resume_storage_name": 1, "resume_file_name": 1, "resume_content_type": 1},
    )
    if not db_user or not db_user.get("resume_storage_name"):
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_path = UPLOADS_DIR / db_user["resume_storage_name"]
    if not resume_path.exists():
        raise HTTPException(status_code=404, detail="Resume file is unavailable")

    return FileResponse(
        path=resume_path,
        filename=db_user.get("resume_file_name") or "resume",
        media_type=db_user.get("resume_content_type") or "application/octet-stream",
    )

class RoadmapCreate(BaseModel):
    company_id: str
    company_name: str
    role: str

@api_router.post("/student/roadmaps")
async def create_roadmap(input: RoadmapCreate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    roadmap_doc = {
        "id": secrets.token_urlsafe(8),
        "student_id": user["id"],
        "student_email": user["email"],
        "company_id": input.company_id,
        "company_name": input.company_name,
        "role": input.role,
        "skill_gaps": ["DSA", "System Design", "React"],
        "plan": [
            {"day": 1, "task": "Arrays & Strings basics", "completed": False},
            {"day": 2, "task": "LinkedList fundamentals", "completed": False},
            {"day": 3, "task": "Stack & Queue problems", "completed": False},
            {"day": 4, "task": "Trees & BST", "completed": False},
            {"day": 5, "task": "Graph algorithms", "completed": False},
            {"day": 6, "task": "Dynamic Programming intro", "completed": False},
            {"day": 7, "task": "System Design basics", "completed": False},
            {"day": 8, "task": "Database design", "completed": False},
            {"day": 9, "task": "React fundamentals", "completed": False},
            {"day": 10, "task": "React hooks & state", "completed": False},
            {"day": 11, "task": "API integration", "completed": False},
            {"day": 12, "task": "Mock interviews", "completed": False},
            {"day": 13, "task": "Behavioral prep", "completed": False},
            {"day": 14, "task": "Final revision", "completed": False}
        ],
        "resources": [
            {"title": "LeetCode Top 150", "url": "https://leetcode.com"},
            {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"},
            {"title": "React Documentation", "url": "https://react.dev"}
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.roadmaps.insert_one(roadmap_doc)
    roadmap_doc.pop("_id", None)  # Remove ObjectId before returning
    return roadmap_doc

@api_router.get("/student/roadmaps")
async def get_roadmaps(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    roadmaps = await db.roadmaps.find({"student_id": user["id"]}, {"_id": 0}).to_list(100)
    return roadmaps

@api_router.get("/student/progress")
async def get_progress(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    roadmaps = await db.roadmaps.find({"student_id": user["id"]}, {"_id": 0}).to_list(100)
    
    all_tasks = []
    for roadmap in roadmaps:
        for task in roadmap.get("plan", []):
            all_tasks.append({
                "id": f"{roadmap['id']}-day{task['day']}",
                "task": task["task"],
                "day": task["day"],
                "company": roadmap["company_name"],
                "completed": task["completed"]
            })
    
    return all_tasks

class TaskUpdate(BaseModel):
    task_id: str
    completed: bool

@api_router.patch("/student/progress")
async def update_progress(input: TaskUpdate, request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    parts = input.task_id.split("-day")
    roadmap_id = parts[0]
    day = int(parts[1])
    
    roadmap = await db.roadmaps.find_one({"id": roadmap_id, "student_id": user["id"]})
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    plan = roadmap.get("plan", [])
    updated = False
    for task in plan:
        if task.get("day") == day:
            task["completed"] = input.completed
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.roadmaps.update_one(
        {"id": roadmap_id, "student_id": user["id"]},
        {"$set": {"plan": plan}}
    )
    
    return {"message": "Progress updated"}

# ══════════════════════════════════════════════════════════════════════════════
# AI MOCK INTERVIEW — Adapted from TalentTalk's interview system
# Uses Google Gemini API for LLM-powered interview conversations
# ══════════════════════════════════════════════════════════════════════════════

import google.generativeai as genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

ASSEMBLYAI_API_KEY = (os.environ.get("ASSEMBLYAI_API_KEY") or "").strip()
ELEVENLABS_API_KEY = (os.environ.get("ELEVENLABS_API_KEY") or "").strip()
ELEVENLABS_VOICE_ID = (os.environ.get("ELEVENLABS_VOICE_ID") or "").strip()

# In-memory storage for interview sessions
_interview_sessions: dict[str, dict] = {}
INTERVIEW_REPORTS_DIR = ROOT_DIR / "generated_reports"
INTERVIEW_REPORTS_DIR.mkdir(exist_ok=True)

INTERVIEW_SYSTEM_PROMPT = """You are an AI interviewer named Sankalp Buddy, a friendly and professional mock interview assistant for college students preparing for placements.

You are conducting a {mode} mock interview for a {position} position at {company_name}.

Your goal is to assess the candidate's technical skills, problem-solving abilities, communication skills, and experience relevant to the position.

RULES:
1. Start by introducing yourself warmly and asking the candidate to introduce themselves.
2. After the introduction, ask about their relevant projects or experience.
3. Then ask {num_of_q} technical questions related to the position, one at a time.
4. For each answer, if the answer is too vague or incomplete, ask up to {num_of_follow_up} follow-up question(s) to probe deeper.
5. If asked any irrelevant question, respond with: "Let's stay focused on the interview. Could you please answer the question?"
6. Keep responses concise but encouraging. Give brief feedback on answers when appropriate.
7. After all questions are done, say exactly: "Thank you, that's it for today! You did great. Let me prepare your evaluation."
8. Do NOT generate the evaluation yourself. Just end with the above phrase.
9. Ask ONLY ONE question at a time. Wait for the candidate's response before asking the next.
10. Keep track of which question number you are on.

IMPORTANT: You MUST maintain a {mode} tone throughout the interview. Be encouraging and supportive while being thorough.

Begin the interview now by introducing yourself."""

EVALUATION_PROMPT = """You are an expert interview evaluator. Analyze the following mock interview transcript and provide a detailed evaluation.

The interview was for a **{position}** position at **{company_name}**.

**Interview Transcript:**
{transcript}

Provide your evaluation in the following JSON format (return ONLY valid JSON, no markdown):
{{
  "overall_score": <number 1-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>", ...],
  "question_scores": [
    {{
      "question": "<the question asked>",
      "score": <number 1-10>,
      "feedback": "<specific feedback for this answer>"
    }}
  ],
  "communication_score": <number 1-10>,
  "technical_score": <number 1-10>,
  "confidence_score": <number 1-10>,
  "recommendation": "<one of: 'Excellent - Ready for interviews', 'Good - Minor improvements needed', 'Average - Practice more', 'Needs Work - Focus on fundamentals'>"
}}"""

REPORT_WRITER_PROMPT = """You are an AI HR Report Writer. Your task is to synthesize information from a job interview transcript and its evaluation into a concise, professional report for Human Resources at {company_name}.
The interview was for a **{position}** position.
Your report should focus on key takeaways relevant to HR's decision-making, including:
- Candidate's Overall Suitability
- Strengths
- Areas for Development/Weaknesses
- Key Technical Skills Demonstrated
- Problem-Solving Approach
- Communication Skills
- Relevant Experience Highlights
- Recommendation

Instructions:
- Keep the report concise and professional.
- Use only evidence from transcript and evaluation.
- Use clear headings.

Interview Transcript:
{transcript}

Evaluation Report (JSON):
{evaluation_json}
"""

CONTEXT_EXTENSION_PROMPT = """

Interview Context (strictly use only as relevant evidence):
Resume Highlights:
{resume_context}

Candidate Preferred/Custom Questions:
{question_context}

Instructions:
- Integrate resume context into questioning and evaluation.
- Use custom questions naturally when they match role relevance.
- If custom questions are missing, continue with default role-specific interview questions.
"""


def _clean_llm_json(text: str) -> str:
    cleaned = (text or "").strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


def _safe_pdf_text(text: str) -> str:
    # FPDF default font expects latin-1; replace unsupported characters safely.
    return (text or "").encode("latin-1", "replace").decode("latin-1")


def _generate_pdf_report(report_text: str, filename: str) -> str:
    pdf_path = INTERVIEW_REPORTS_DIR / filename
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)

    for line in _safe_pdf_text(report_text).split("\n"):
        pdf.multi_cell(0, 8, line)

    pdf.output(str(pdf_path))
    return str(pdf_path)


def _build_fallback_questions(position: str, num_of_q: int) -> list[str]:
    base = [
        f"What core skills are most important for a {position} role, and how have you practiced them?",
        "Describe a challenging bug or technical issue you solved recently. What was your debugging process?",
        "How do you ensure code quality, readability, and maintainability in your projects?",
        "Explain a project where you collaborated with others. What was your contribution and impact?",
        "If you had to optimize a slow feature, how would you identify bottlenecks and validate improvements?",
        "How do you prepare for technical interviews and communicate your problem-solving approach clearly?",
    ]
    return base[: max(1, min(num_of_q, len(base)))]


def _extract_custom_questions(raw_text: str) -> list[str]:
    if not raw_text:
        return []
    lines = [ln.strip(" -*\t") for ln in raw_text.splitlines()]
    cleaned = [ln for ln in lines if ln and len(ln) > 4]
    return cleaned[:10]


def _build_interview_prompt_with_context(base_prompt: str, session_context: dict[str, Any]) -> str:
    resume_context = (session_context.get("resume_text") or "").strip()
    if not resume_context:
        resume_context = "No resume uploaded."
    else:
        resume_context = resume_context[:2500]

    custom_questions = session_context.get("custom_questions") or []
    if custom_questions:
        question_context = "\n".join(f"- {q}" for q in custom_questions)
    else:
        question_context = "No custom questions uploaded."

    return base_prompt + CONTEXT_EXTENSION_PROMPT.format(
        resume_context=resume_context,
        question_context=question_context,
    )


def _merge_questions(default_questions: list[str], custom_questions: list[str], limit: int) -> list[str]:
    merged: list[str] = []
    for q in custom_questions:
        q_clean = q.strip()
        if q_clean and q_clean not in merged:
            merged.append(q_clean)
    for q in default_questions:
        q_clean = q.strip()
        if q_clean and q_clean not in merged:
            merged.append(q_clean)
    return merged[: max(1, min(limit, len(merged) if merged else 1))]


def _fallback_opening(mode: str, position: str, company_name: str) -> str:
    tone = {
        "friendly": "friendly and encouraging",
        "formal": "professional and structured",
        "technical": "technical and rigorous",
    }.get(mode, "professional")
    return (
        f"Hi! I'm Sankalp Buddy, your {tone} interviewer for the {position} role at {company_name}. "
        "Please introduce yourself briefly, and highlight one project most relevant to this role."
    )


def _fallback_next_message(session: dict, candidate_message: str) -> tuple[str, bool]:
    candidate_turns = session.get("candidate_turns", 0) + 1
    session["candidate_turns"] = candidate_turns
    questions = session.get("fallback_questions", [])

    # Turn 1: ask project deep-dive, then move to technical questions.
    if candidate_turns == 1:
        return (
            "Thanks for the introduction. Tell me about one project where you solved a meaningful problem: "
            "what was the context, your approach, and measurable outcome?",
            False,
        )

    tech_index = candidate_turns - 2
    if 0 <= tech_index < len(questions):
        return (f"Question {tech_index + 1}: {questions[tech_index]}", False)

    return ("Thank you, that's it for today! You did great. Let me prepare your evaluation.", True)


def _fallback_evaluation(session: dict) -> dict[str, Any]:
    candidate_answers = [m.get("content", "") for m in session.get("messages", []) if m.get("role") == "candidate"]
    interviewer_questions = [m.get("content", "") for m in session.get("messages", []) if m.get("role") == "interviewer"]

    avg_len = 0
    if candidate_answers:
        avg_len = sum(len(a.strip()) for a in candidate_answers) / len(candidate_answers)

    technical_score = 6 if avg_len < 120 else 7 if avg_len < 250 else 8
    communication_score = 6 if avg_len < 80 else 7 if avg_len < 220 else 8
    confidence_score = 7 if len(candidate_answers) >= 3 else 6
    overall = int(round((technical_score * 0.45 + communication_score * 0.35 + confidence_score * 0.20) * 10))

    if overall >= 85:
        recommendation = "Excellent - Ready for interviews"
    elif overall >= 70:
        recommendation = "Good - Minor improvements needed"
    elif overall >= 55:
        recommendation = "Average - Practice more"
    else:
        recommendation = "Needs Work - Focus on fundamentals"

    question_scores = []
    q_idx = 0
    for q in interviewer_questions:
        if q.startswith("Question") or "project" in q.lower() or "introduce" in q.lower():
            q_idx += 1
            per_q = max(1, min(10, technical_score + (1 if q_idx <= 2 else 0)))
            question_scores.append(
                {
                    "question": q,
                    "score": per_q,
                    "feedback": "Answer showed relevant structure. Add more measurable impact and deeper technical trade-offs.",
                }
            )

    return {
        "overall_score": overall,
        "summary": "The candidate demonstrated a reasonable interview baseline with clear responses. Greater technical depth and quantified outcomes would improve readiness.",
        "strengths": [
            "Maintained coherent responses throughout the interview",
            "Covered practical experience with understandable structure",
            "Showed consistent willingness to explain decisions",
        ],
        "improvements": [
            "Provide deeper technical trade-off analysis",
            "Quantify impact using metrics wherever possible",
            "Use more concise STAR-style examples for behavioral clarity",
        ],
        "question_scores": question_scores,
        "communication_score": communication_score,
        "technical_score": technical_score,
        "confidence_score": confidence_score,
        "recommendation": recommendation,
    }


def _fallback_report(session: dict, evaluation: dict[str, Any], transcript: str) -> str:
    return (
        f"Candidate Summary\n"
        f"Interview for {session.get('position')} at {session.get('company_name')}. "
        f"Overall score: {evaluation.get('overall_score')}/100.\n\n"
        f"Strengths\n- " + "\n- ".join(evaluation.get("strengths", [])) + "\n\n"
        f"Areas for Development\n- " + "\n- ".join(evaluation.get("improvements", [])) + "\n\n"
        f"Communication and Technical Assessment\n"
        f"Communication: {evaluation.get('communication_score')}/10\n"
        f"Technical: {evaluation.get('technical_score')}/10\n"
        f"Confidence: {evaluation.get('confidence_score')}/10\n\n"
        f"Recommendation\n{evaluation.get('recommendation')}\n"
    )


def _render_session_context_for_eval(session: dict[str, Any]) -> str:
    context = session.get("context") or {}
    resume_text = (context.get("resume_text") or "").strip()
    resume_name = context.get("resume_file_name") or "N/A"
    custom_questions = context.get("custom_questions") or []
    question_block = "\n".join(f"- {q}" for q in custom_questions) if custom_questions else "None"
    resume_block = resume_text[:2000] if resume_text else "None"
    return (
        "\n\nAdditional Candidate Context:\n"
        f"Resume File: {resume_name}\n"
        f"Resume Extract:\n{resume_block}\n"
        f"Custom Questions:\n{question_block}\n"
    )


class InterviewStartRequest(BaseModel):
    position: str = "Software Developer"
    company_name: str = "Tech Company"
    mode: str = "friendly"  # friendly, formal, technical
    num_of_q: int = 3
    num_of_follow_up: int = 1


class InterviewMessageRequest(BaseModel):
    session_id: str
    message: str


class InterviewEvaluateRequest(BaseModel):
    session_id: str


class InterviewQuestionsRequest(BaseModel):
    questions: List[str] = Field(default_factory=list)


class InterviewTextToSpeechRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None


@api_router.post("/student/mock-interview/start")
async def start_mock_interview(input: InterviewStartRequest, request: Request):
    """Start a new mock interview session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.")

    session_id = f"interview_{secrets.token_urlsafe(12)}"

    base_prompt = INTERVIEW_SYSTEM_PROMPT.format(
        mode=input.mode,
        position=input.position,
        company_name=input.company_name,
        num_of_q=input.num_of_q,
        num_of_follow_up=input.num_of_follow_up,
    )

    context_payload = {
        "resume_text": "",
        "resume_file_name": None,
        "custom_questions": [],
    }
    system_prompt = _build_interview_prompt_with_context(base_prompt, context_payload)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_prompt,
        )
        chat = model.start_chat(history=[])

        # Get the initial greeting from the interviewer
        response = chat.send_message("Start the interview. Introduce yourself and ask the first question.")

        initial_message = response.text

        _interview_sessions[session_id] = {
            "chat": chat,
            "model": model,
            "base_prompt": base_prompt,
            "system_prompt": system_prompt,
            "position": input.position,
            "company_name": input.company_name,
            "mode": input.mode,
            "num_of_q": input.num_of_q,
            "num_of_follow_up": input.num_of_follow_up,
            "user_id": user["id"],
            "messages": [
                {"role": "interviewer", "content": initial_message}
            ],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "status": "in_progress",
            "context": context_payload,
            "provider": "gemini",
        }

        return {
            "session_id": session_id,
            "message": initial_message,
            "status": "in_progress",
            "provider": "gemini",
        }

    except Exception as e:
        # Fallback: keep interview available even when Gemini API is rate-limited/unavailable.
        initial_message = _fallback_opening(input.mode, input.position, input.company_name)
        _interview_sessions[session_id] = {
            "chat": None,
            "model": None,
            "base_prompt": base_prompt,
            "system_prompt": system_prompt,
            "position": input.position,
            "company_name": input.company_name,
            "mode": input.mode,
            "num_of_q": input.num_of_q,
            "num_of_follow_up": input.num_of_follow_up,
            "user_id": user["id"],
            "messages": [{"role": "interviewer", "content": initial_message}],
            "fallback_questions": _build_fallback_questions(input.position, input.num_of_q),
            "candidate_turns": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "status": "in_progress",
            "provider": "fallback",
            "fallback_reason": str(e),
            "context": context_payload,
        }
        return {
            "session_id": session_id,
            "message": initial_message,
            "status": "in_progress",
            "provider": "fallback",
            "fallback_reason": "Gemini temporarily unavailable; running local interview engine.",
        }


@api_router.post("/student/mock-interview/message")
async def send_interview_message(input: InterviewMessageRequest, request: Request):
    """Send a message in the mock interview"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(input.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    if session["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Interview has already ended")

    try:
        if session.get("provider") == "fallback":
            ai_response, is_ended = _fallback_next_message(session, input.message)
        else:
            chat = session["chat"]
            response = chat.send_message(input.message)
            ai_response = response.text
            is_ended = "that's it for today" in ai_response.lower()

        session["messages"].append({"role": "candidate", "content": input.message})
        session["messages"].append({"role": "interviewer", "content": ai_response})

        # Check if interview has ended
        if is_ended:
            session["status"] = "completed"

        return {
            "message": ai_response,
            "status": session["status"],
            "is_ended": is_ended,
            "provider": session.get("provider", "gemini"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")


@api_router.post("/student/mock-interview/{session_id}/context/resume")
async def upload_mock_interview_resume_context(session_id: str, request: Request, resume: UploadFile = File(...)):
    """Upload resume context for an interview session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Resume file is empty")

    extracted_text = _extract_text_from_resume(resume.filename or "", file_bytes, resume.content_type or "")
    if not extracted_text.strip():
        extracted_text = "Resume uploaded but text extraction returned empty content."

    context = session.setdefault("context", {"resume_text": "", "resume_file_name": None, "custom_questions": []})
    context["resume_text"] = extracted_text
    context["resume_file_name"] = resume.filename or "resume"

    custom_questions = context.get("custom_questions") or []
    merged_fallback = _merge_questions(
        _build_fallback_questions(session.get("position", "Software Developer"), session.get("num_of_q", 3)),
        custom_questions,
        session.get("num_of_q", 3),
    )
    session["fallback_questions"] = merged_fallback

    if session.get("provider") == "gemini" and session.get("chat") is not None:
        context_msg = (
            "Use this candidate resume context for upcoming interview questions and follow-ups. "
            "Acknowledge internally and continue interview naturally.\n\n"
            f"Resume file: {context.get('resume_file_name')}\n"
            f"Resume text:\n{extracted_text[:2500]}"
        )
        try:
            session["chat"].send_message(context_msg)
        except Exception:
            pass

    return {
        "message": "Resume context uploaded",
        "resume_file_name": context["resume_file_name"],
        "resume_text_preview": extracted_text[:500],
        "status": session.get("status", "in_progress"),
    }


@api_router.post("/student/mock-interview/{session_id}/context/questions")
async def upload_mock_interview_questions_context(session_id: str, input: InterviewQuestionsRequest, request: Request):
    """Upload custom interview questions for an interview session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    cleaned_questions = []
    for q in input.questions:
        q_clean = (q or "").strip()
        if q_clean:
            cleaned_questions.append(q_clean)
    cleaned_questions = cleaned_questions[:10]

    context = session.setdefault("context", {"resume_text": "", "resume_file_name": None, "custom_questions": []})
    context["custom_questions"] = cleaned_questions

    fallback_defaults = _build_fallback_questions(session.get("position", "Software Developer"), session.get("num_of_q", 3))
    session["fallback_questions"] = _merge_questions(fallback_defaults, cleaned_questions, session.get("num_of_q", 3))

    if session.get("provider") == "gemini" and session.get("chat") is not None and cleaned_questions:
        context_msg = (
            "Use these custom candidate-provided interview questions where relevant. "
            "Ask one at a time and keep the interview flow natural.\n\n"
            + "\n".join(f"- {q}" for q in cleaned_questions)
        )
        try:
            session["chat"].send_message(context_msg)
        except Exception:
            pass

    return {
        "message": "Custom question context uploaded",
        "custom_questions": cleaned_questions,
        "status": session.get("status", "in_progress"),
    }


@api_router.post("/student/mock-interview/{session_id}/context/questions-file")
async def upload_mock_interview_questions_file_context(session_id: str, request: Request, questions_file: UploadFile = File(...)):
    """Upload custom questions from a text file"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    raw = (await questions_file.read()).decode("utf-8", errors="ignore")
    parsed = _extract_custom_questions(raw)
    if not parsed:
        raise HTTPException(status_code=400, detail="No valid questions found in uploaded file")

    return await upload_mock_interview_questions_context(
        session_id=session_id,
        input=InterviewQuestionsRequest(questions=parsed),
        request=request,
    )


@api_router.get("/student/mock-interview/{session_id}/context")
async def get_mock_interview_context(session_id: str, request: Request):
    """Get stored interview context for a session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    context = session.get("context") or {}
    return {
        "resume_file_name": context.get("resume_file_name"),
        "resume_text_preview": (context.get("resume_text") or "")[:500],
        "custom_questions": context.get("custom_questions") or [],
    }


@api_router.post("/student/mock-interview/speech-to-text")
async def mock_interview_speech_to_text(request: Request, audio: UploadFile = File(...)):
    """Convert interview speech audio to text (AssemblyAI provider)"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    if not ASSEMBLYAI_API_KEY:
        raise HTTPException(status_code=503, detail="AssemblyAI API key not configured")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    try:
        upload_response = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers={"authorization": ASSEMBLYAI_API_KEY, "content-type": "application/octet-stream"},
            data=audio_bytes,
            timeout=45,
        )
        upload_response.raise_for_status()
        upload_url = (upload_response.json() or {}).get("upload_url")
        if not upload_url:
            raise HTTPException(status_code=502, detail="AssemblyAI upload failed")

        transcript_response = requests.post(
            "https://api.assemblyai.com/v2/transcript",
            headers={"authorization": ASSEMBLYAI_API_KEY, "content-type": "application/json"},
            json={"audio_url": upload_url},
            timeout=45,
        )
        transcript_response.raise_for_status()
        transcript_id = (transcript_response.json() or {}).get("id")
        if not transcript_id:
            raise HTTPException(status_code=502, detail="AssemblyAI transcript init failed")

        for _ in range(30):
            poll_response = requests.get(
                f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                headers={"authorization": ASSEMBLYAI_API_KEY},
                timeout=20,
            )
            poll_response.raise_for_status()
            payload = poll_response.json() or {}
            status = payload.get("status")
            if status == "completed":
                return {"text": payload.get("text", ""), "provider": "assemblyai"}
            if status == "error":
                raise HTTPException(status_code=502, detail=payload.get("error") or "AssemblyAI transcription error")
            await asyncio.sleep(1)

        raise HTTPException(status_code=504, detail="Speech transcription timed out")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text failed: {str(e)}")


@api_router.post("/student/mock-interview/text-to-speech")
async def mock_interview_text_to_speech(input: InterviewTextToSpeechRequest, request: Request):
    """Convert text to speech audio (ElevenLabs provider)"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    text = (input.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="ElevenLabs API key not configured")

    voice_id = input.voice_id or ELEVENLABS_VOICE_ID
    if not voice_id:
        raise HTTPException(status_code=400, detail="No ElevenLabs voice configured")

    try:
        tts_response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "accept": "audio/mpeg",
                "content-type": "application/json",
            },
            json={
                "text": text[:1800],
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.4, "similarity_boost": 0.75},
            },
            timeout=60,
        )
        tts_response.raise_for_status()
        return Response(content=tts_response.content, media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech failed: {str(e)}")


@api_router.post("/student/mock-interview/evaluate")
async def evaluate_mock_interview(input: InterviewEvaluateRequest, request: Request):
    """Evaluate a completed mock interview"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(input.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    # Build transcript
    transcript_lines = []
    for msg in session["messages"]:
        role_label = "AI Interviewer" if msg["role"] == "interviewer" else "Candidate"
        transcript_lines.append(f"{role_label}: {msg['content']}")
    transcript = "\n\n".join(transcript_lines)

    eval_prompt = EVALUATION_PROMPT.format(
        position=session["position"],
        company_name=session["company_name"],
        transcript=transcript,
    )
    eval_prompt = eval_prompt + _render_session_context_for_eval(session)

    try:
        import json as json_module
        if session.get("provider") == "fallback":
            evaluation = _fallback_evaluation(session)
            report_text = _fallback_report(session, evaluation, transcript)
        else:
            eval_model = genai.GenerativeModel(model_name="gemini-2.0-flash")
            eval_response = eval_model.generate_content(eval_prompt)
            eval_text = eval_response.text

            cleaned = _clean_llm_json(eval_text)
            try:
                evaluation = json_module.loads(cleaned)
            except json_module.JSONDecodeError:
                evaluation = {
                    "overall_score": 70,
                    "summary": eval_text[:500],
                    "strengths": ["Could not parse detailed evaluation"],
                    "improvements": ["Try again for detailed feedback"],
                    "question_scores": [],
                    "communication_score": 7,
                    "technical_score": 7,
                    "confidence_score": 7,
                    "recommendation": "Average - Practice more",
                }

            report_prompt = REPORT_WRITER_PROMPT.format(
                company_name=session["company_name"],
                position=session["position"],
                transcript=transcript,
                evaluation_json=json_module.dumps(evaluation, ensure_ascii=False, indent=2),
            )
            report_response = eval_model.generate_content(report_prompt)
            report_text = (report_response.text or "").strip()

        pdf_filename = f"HR_Report_{session['company_name']}_{session['position']}_{input.session_id}.pdf"
        pdf_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", pdf_filename)
        pdf_path = _generate_pdf_report(report_text, pdf_filename)

        session["evaluation"] = evaluation
        session["report"] = report_text
        session["pdf_path"] = pdf_path
        session["status"] = "evaluated"

        return {
            "evaluation": evaluation,
            "transcript": session["messages"],
            "report": report_text,
            "pdf_download_url": f"/api/student/mock-interview/{input.session_id}/report/pdf",
            "provider": session.get("provider", "gemini"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate interview: {str(e)}")


@api_router.get("/student/mock-interview/{session_id}/report/pdf")
async def download_mock_interview_report_pdf(session_id: str, request: Request):
    """Download generated HR report PDF for an interview session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    pdf_path = session.get("pdf_path")
    if not pdf_path or not Path(pdf_path).exists():
        raise HTTPException(status_code=404, detail="Report PDF not found. Please run evaluation first.")

    return FileResponse(path=pdf_path, media_type="application/pdf", filename=Path(pdf_path).name)


@api_router.get("/student/mock-interview/sessions")
async def get_interview_sessions(request: Request):
    """Get all interview sessions for the current user"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    user_sessions = []
    for sid, session in _interview_sessions.items():
        if session["user_id"] == user["id"]:
            user_sessions.append({
                "session_id": sid,
                "position": session["position"],
                "company_name": session["company_name"],
                "mode": session["mode"],
                "status": session["status"],
                "started_at": session["started_at"],
                "message_count": len(session["messages"]),
                "evaluation": session.get("evaluation"),
            })

    return sorted(user_sessions, key=lambda x: x["started_at"], reverse=True)


@api_router.delete("/student/mock-interview/{session_id}")
async def end_mock_interview(session_id: str, request: Request):
    """End and clean up an interview session"""
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    session = _interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview session")

    del _interview_sessions[session_id]
    return {"message": "Interview session ended"}


app.include_router(api_router)

default_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "https://jovita-placement-platform-94c0ae.preview.emergentagent.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    if db is None:
        print("Supabase is not connected. Skipping DB initialization.")
        return

    try:
        await asyncio.to_thread(lambda: supabase_service.table("profiles").select("id", count="exact", head=True).execute())
    except Exception as err:
        print(f"Supabase is unavailable. Skipping DB initialization. Error: {err}")
        return

    # Skip auto-seeding when running with Supabase schema that may vary by project.
    return

    await db.users.create_index("email", unique=True)
    
    admin_email = os.environ.get("ADMIN_EMAIL", "tpo@college.edu")
    admin_password = os.environ.get("ADMIN_PASSWORD", "tpo123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin is None:
        hashed = hash_password(admin_password)
        try:
            await db.users.insert_one({
                "email": admin_email,
                "password_hash": hashed,
                "name": "TPO Admin",
                "role": "tpo",
                "created_at": datetime.now(timezone.utc)
            })
        except Exception:
            pass
    else:
        stored_hash = existing_admin.get("password_hash")
        if stored_hash and not verify_password(admin_password, stored_hash):
            try:
                await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
            except Exception:
                pass
    
    student_email = "student@college.edu"
    student_password = "student123"
    existing_student = await db.users.find_one({"email": student_email})
    if existing_student is None:
        hashed = hash_password(student_password)
        try:
            await db.users.insert_one({
                "email": student_email,
                "password_hash": hashed,
                "name": "John Doe",
                "role": "student",
                "branch": "Computer Science",
                "readiness_score": 72,
                "weak_skills": ["DSA", "System Design"],
                "placement_status": "not_placed",
                "created_at": datetime.now(timezone.utc)
            })
        except Exception:
            pass
    
    for i in range(2, 21):
        test_email = f"student{i}@college.edu"
        exists = await db.users.find_one({"email": test_email})
        if not exists:
            try:
                await db.users.insert_one({
                    "email": test_email,
                    "password_hash": hash_password("student123"),
                    "name": f"Student {i}",
                    "role": "student",
                    "branch": ["Computer Science", "Electronics", "Mechanical", "Civil"][i % 4],
                    "readiness_score": 50 + (i * 3) % 40,
                    "weak_skills": [["DSA", "React"], ["System Design", "SQL"], ["Python", "Communication"]][i % 3],
                    "placement_status": "placed" if i % 4 == 0 else "not_placed",
                    "created_at": datetime.now(timezone.utc)
                })
            except Exception:
                pass
    
    companies_data = [
        {"id": "comp1", "company_name": "Google", "role": "SDE", "date": "2026-02-15", "eligibility": "CGPA >= 7.5", "status": "active", "package": "25 LPA"},
        {"id": "comp2", "company_name": "Microsoft", "role": "Software Engineer", "date": "2026-02-20", "eligibility": "CGPA >= 7.0", "status": "active", "package": "22 LPA"},
        {"id": "comp3", "company_name": "Amazon", "role": "SDE-1", "date": "2026-03-01", "eligibility": "All branches", "status": "active", "package": "20 LPA"},
        {"id": "comp4", "company_name": "Flipkart", "role": "Backend Developer", "date": "2026-03-10", "eligibility": "CS/IT only", "status": "upcoming", "package": "18 LPA"},
    ]
    for company in companies_data:
        exists = await db.companies.find_one({"id": company["id"]})
        if not exists:
            await db.companies.insert_one(company)
    
    memory_dir = ROOT_DIR.parent / "memory"
    memory_dir.mkdir(exist_ok=True)
    with open(memory_dir / "test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## TPO Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: tpo\n\n")
        f.write("## Student Account\n")
        f.write("- Email: student@college.edu\n")
        f.write("- Password: student123\n")
        f.write("- Role: student\n\n")
        f.write("## Auth Endpoints\n")
        f.write("/api/auth/login\n")
        f.write("/api/auth/register\n")
        f.write("/api/auth/me\n")
        f.write("/api/auth/logout\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    return
