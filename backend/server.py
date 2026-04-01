from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import secrets

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"_id": 0})
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

@api_router.post("/auth/register")
async def register(input: RegisterRequest, response: Response):
    email = input.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(input.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": input.name,
        "role": input.role,
        "branch": input.branch,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user_id, "email": email, "name": input.name, "role": input.role, "branch": input.branch}

@api_router.post("/auth/login")
async def login(input: LoginRequest, response: Response):
    email = input.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"id": user_id, "email": user["email"], "name": user["name"], "role": user["role"], "branch": user.get("branch")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.get("/tpo/dashboard/stats")
async def get_tpo_dashboard_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
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
        {"skill": "DSA", "count": 45},
        {"skill": "System Design", "count": 38},
        {"skill": "React", "count": 32},
        {"skill": "Python", "count": 28},
        {"skill": "SQL", "count": 25},
        {"skill": "Communication", "count": 22}
    ]

@api_router.get("/tpo/dashboard/readiness")
async def get_readiness_distribution(request: Request):
    user = await get_current_user(request)
    if user["role"] != "tpo":
        raise HTTPException(status_code=403, detail="Access denied")
    
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
    
    student_data = await db.users.find_one({"email": user["email"]})
    readiness_score = student_data.get("readiness_score", 0)
    
    roadmaps = await db.roadmaps.count_documents({"student_email": user["email"]})
    
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
    
    companies = await db.companies.find({"status": "active"}, {"_id": 0}).to_list(100)
    return companies

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
    
    roadmaps = await db.roadmaps.find({"student_email": user["email"]}, {"_id": 0}).to_list(100)
    return roadmaps

@api_router.get("/student/progress")
async def get_progress(request: Request):
    user = await get_current_user(request)
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    roadmaps = await db.roadmaps.find({"student_email": user["email"]}, {"_id": 0}).to_list(100)
    
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
    
    await db.roadmaps.update_one(
        {"id": roadmap_id, "student_email": user["email"], "plan.day": day},
        {"$set": {"plan.$.completed": input.completed}}
    )
    
    return {"message": "Progress updated"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jovita-placement-platform-94c0ae.preview.emergentagent.com"] if os.environ.get("CORS_ORIGINS", "*") == "*" else os.environ.get("CORS_ORIGINS", "*").split(","),
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
    await db.users.create_index("email", unique=True)
    
    admin_email = os.environ.get("ADMIN_EMAIL", "tpo@college.edu")
    admin_password = os.environ.get("ADMIN_PASSWORD", "tpo123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "TPO Admin",
            "role": "tpo",
            "created_at": datetime.now(timezone.utc)
        })
    elif not verify_password(admin_password, existing_admin["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    
    student_email = "student@college.edu"
    student_password = "student123"
    existing_student = await db.users.find_one({"email": student_email})
    if existing_student is None:
        hashed = hash_password(student_password)
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
    
    for i in range(2, 21):
        test_email = f"student{i}@college.edu"
        exists = await db.users.find_one({"email": test_email})
        if not exists:
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
    
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
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
    client.close()
