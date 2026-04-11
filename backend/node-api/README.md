# IDS Gemini Roadmap API

## Setup
1. Use the shared backend env file at `backend/.env`.
2. Ensure `GEMINI_API_KEY`, `PORT`, and `FRONTEND_ORIGIN` are present in `backend/.env`.
3. Install dependencies:
   npm install
4. Run the API:
   npm run dev

API base URL: `http://localhost:4000`

## Endpoint
`POST /api/roadmap/generate`

Request body:
```json
{
  "role": "Frontend Developer",
  "skillLevel": "Beginner",
  "goal": "Get internship in 3 months",
  "timeAvailable": "2 hours/day"
}
```
