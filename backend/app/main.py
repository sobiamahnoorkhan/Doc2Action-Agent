from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from .document_parser import extract_text
from .agents import run_document_workflow

load_dotenv()
app = FastAPI(title="Doc2Action-Agent API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TextRequest(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status":"ok","service":"Doc2Action-Agent"}

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        text = extract_text(file.filename or "", await file.read())
        if not text.strip():
            raise HTTPException(400, "No readable text found")
        return {"filename": file.filename, "result": run_document_workflow(text)}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, str(exc))

@app.post("/api/analyze-text")
def analyze_text(payload: TextRequest):
    if not payload.text.strip():
        raise HTTPException(400, "Text is required")
    try:
        return {"filename":"pasted-document.txt","result":run_document_workflow(payload.text)}
    except Exception as exc:
        raise HTTPException(500, str(exc))
