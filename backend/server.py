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

mongo_url = os.environ.get('MONGO_URL')
if mongo_url:
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ids')]
else:
    client = None
    db = None

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
        # For demo purposes, allow one mock user if no token
        return {"id": "mock_tpo_id", "email": "tpo@college.edu", "name": "TPO Admin", "role": "tpo"}
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Hardcoded check for mock IDs
        if payload["sub"] == "mock_tpo_id":
            return {"id": "mock_tpo_id", "email": "tpo@college.edu", "name": "TPO Admin", "role": "tpo"}
        if payload["sub"] == "mock_student_id":
            return {"id": "mock_student_id", "email": "student@college.edu", "name": "Abhay Patil", "role": "student", "branch": "Mechanical Engineering"}

        if not db:
             raise HTTPException(status_code=401, detail="Database not connected")
             
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
    
    # Mock login for demo users
    if email == "tpo@college.edu":
        user_id = "mock_tpo_id"
        user = {"email": email, "name": "TPO Admin", "role": "tpo", "branch": None}
    elif email == "student@college.edu":
        user_id = "mock_student_id"
        user = {"email": email, "name": "Abhay Patil", "role": "student", "branch": "Mechanical Engineering"}
    else:
        if not db:
            raise HTTPException(status_code=401, detail="Database not connected and user not in mock list")
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(input.password, user["password_hash"]):
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
    
    if not db:
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
    
    if not db:
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
    
    if not db:
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
    
    if not db:
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
    
    if not db:
        return {"readiness_score": 78, "active_roadmap": 2, "progress_percentage": 45}

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
    
    if not db:
        return MOCK_COMPANIES

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
    if not db:
        print("MongoDB is not connected. Skipping DB initialization.")
        return

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
