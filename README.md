# Doc2Action-Agent

Turn business documents into executable workflows with multi-agent AI.

## MVP
Upload PDF, DOCX, XLSX or TXT. AI extracts requirements, tasks, decisions, workflow steps, communication drafts and verification notes.

## Stack
React + Vite, FastAPI, Gemini API, PyMuPDF, python-docx, openpyxl.

## Run
Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
Frontend: `cd frontend && npm install && npm run dev`

Set `GEMINI_API_KEY` in `backend/.env`.
