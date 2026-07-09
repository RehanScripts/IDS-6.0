# IDS 6.0 - Intelligent Development Suite

IDS 6.0 is a full-stack placement preparation platform with role-based workflows for students and TPO users, AI-assisted roadmap generation, progress tracking, and interview support.

This repository contains:
- A FastAPI backend for authentication, profile management, dashboards, and student workflows
- A Node.js API for Gemini-powered roadmap generation
- A React frontend application for students and placement officers

## Table of Contents
- Overview
- Architecture
- Tech Stack
- Repository Structure
- Prerequisites
- Quick Start
- Environment Configuration
- API Overview
- Testing
- Deployment Notes
- Troubleshooting

## Overview
Core capabilities include:
- Role-based authentication and protected routes (student and TPO)
- Student profile and progress flows
- TPO dashboard metrics and readiness insights
- AI-generated roadmaps via Gemini with fallback roadmap generation
- Resume handling and document utilities in the Python backend

## Architecture
High-level request flow:

1. Frontend (React) handles user authentication, dashboards, and student workflows
2. Python backend (FastAPI) serves core platform APIs at port 8000 by default
3. Node API service handles roadmap generation at port 4000 by default
4. Supabase is used as the primary data layer for profiles, companies, roadmaps, and student progress

## Tech Stack
- Frontend: React, React Router, CRACO, Tailwind CSS, Radix UI, Axios, Recharts
- Backend (core): Python, FastAPI, Supabase client, JWT auth, document parsing utilities
- Backend (AI service): Node.js, Express, Google Generative AI SDK
- Data: Supabase (schema and migrations included)
- Testing: pytest (backend dependencies), script-based API checks via backend_test.py

## Repository Structure
Top-level layout:

- backend: FastAPI service, requirements, Supabase schema, migrations
- backend/node-api: Express service for Gemini roadmap generation
- frontend: React application
- tests: Python test package scaffold
- backend_test.py: API smoke/regression script
- test_reports: Generated test artifacts

## Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn
- Supabase project credentials
- Gemini API key (for AI roadmap generation)

## Quick Start

### 1) Start Core Backend (FastAPI)
From project root:

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000

### 2) Start Roadmap API (Node/Express)
Open a new terminal:

cd backend/node-api
npm install
npm run dev

The roadmap API defaults to port 4000.

### 3) Start Frontend (React)
Open a new terminal:

cd frontend
npm install
npm start

Frontend runs on port 3000 by default.

## Environment Configuration

Create and maintain environment files as described below.

### A) backend/.env (FastAPI and shared backend config)
Required keys:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET_KEY

Common optional keys:
- ENVIRONMENT, APP_ENV, PYTHON_ENV
- ACCESS_TOKEN_TTL_MINUTES, REFRESH_TOKEN_TTL_DAYS
- COOKIE_SECURE, COOKIE_SAMESITE, COOKIE_DOMAIN
- FRONTEND_URL, FRONTEND_ORIGIN
- CORS_ORIGINS, CORS_ORIGIN_REGEX
- CORS_ALLOW_ONRENDER, CORS_ALLOW_VERCEL
- SUPABASE_STORAGE_BUCKET, SUPABASE_RESUMES_FOLDER, SUPABASE_COMPANIES_FOLDER
- OCR_SPACE_API_KEY, OCR_SPACE_API_URL
- ADMIN_EMAIL, ADMIN_PASSWORD

### B) backend/node-api/.env or backend/.env (Node API reads backend/.env)
Required for AI generation:
- GEMINI_API_KEY

Common optional keys:
- PORT (default: 4000)
- FRONTEND_ORIGIN
- CORS_ORIGINS, CORS_ORIGIN_REGEX
- CORS_ALLOW_ONRENDER, CORS_ALLOW_VERCEL
- ENVIRONMENT, APP_ENV, NODE_ENV

### C) frontend/.env
Recommended keys:
- REACT_APP_API_URL=http://localhost:8000
- REACT_APP_BACKEND_URL=http://localhost:8000
- REACT_APP_ROADMAP_API_URL=http://localhost:4000

Notes:
- Some frontend modules use REACT_APP_API_URL.
- TPO dashboard calls use REACT_APP_BACKEND_URL.
- Roadmap generation uses REACT_APP_ROADMAP_API_URL.

## API Overview

### Core Backend (FastAPI)
Base URL: http://localhost:8000

Representative endpoints:
- GET /health
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh
- GET /api/tpo/dashboard/stats
- GET /api/tpo/dashboard/skill-gaps
- GET /api/tpo/dashboard/readiness

### Roadmap API (Node/Express)
Base URL: http://localhost:4000

Primary endpoint:
- POST /api/roadmap/generate

Example payload:
{
	"role": "Frontend Developer",
	"skillLevel": "Beginner",
	"goal": "Get internship in 3 months",
	"timeAvailable": "2 hours/day"
}

## Testing

### Scripted API checks
Run the helper script from project root:

python3 backend_test.py

Important:
- backend_test.py currently defaults to http://localhost:8001
- If your backend runs on 8000, update the default base_url in backend_test.py before running

### Python tests
The tests package exists, and pytest is included in backend dependencies.

## Deployment Notes
- Configure CORS origins explicitly for production domains
- Set secure cookie options in production (COOKIE_SECURE=true, appropriate COOKIE_SAMESITE)
- Provide production Supabase keys and JWT secret
- Keep GEMINI_API_KEY server-side only

## Troubleshooting
- Frontend cannot authenticate:
	- Verify REACT_APP_API_URL and REACT_APP_BACKEND_URL point to the running FastAPI service
	- Confirm CORS and cookie settings in backend environment

- Roadmap API network errors:
	- Ensure backend/node-api is running on the configured port
	- Validate REACT_APP_ROADMAP_API_URL and GEMINI_API_KEY

- Supabase-related failures:
	- Verify SUPABASE_URL and keys
	- Confirm expected tables exist via supabase_schema.sql and migrations
