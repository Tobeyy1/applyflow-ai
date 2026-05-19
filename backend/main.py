# ============================================================
# main.py — FastAPI entry point for the Job Application Assistant
# ============================================================

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from resume_parser import extract_text_from_pdf
from llm import generate_cover_letter, generate_gap_analysis

app = FastAPI(
    title="Job Application Assistant API",
    description="Analyzes a resume against a job description using AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app"  # Replace with your Vercel URL at deploy time
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Job Application Assistant API is running"}


@app.post("/analyze")
# No response_model here — we're returning a free-form dict that
# matches the structured JSON coming back from the LLM.
# If you add schemas.py later you can re-add response_model=AnalyzeResponse.
async def analyze(
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):
    # --- Input validation ---
    if not job_description.strip():
        raise HTTPException(
            status_code=422,
            detail="Job description cannot be empty"
        )

    if resume.content_type != "application/pdf":
        raise HTTPException(
            status_code=422,
            detail="Resume must be a PDF file"
        )

    # --- Extract text from the PDF ---
    resume_text = extract_text_from_pdf(resume.file)

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from the PDF. The file may be image-based or corrupted."
        )

    # --- Call the AI ---
    # Each function returns a dict with one top-level key:
    #   generate_cover_letter → { "cover_letter": { "content": "..." } }
    #   generate_gap_analysis → { "gap_analysis": { "match_score": ..., ... } }
    #
    # ** unpacking merges them into one response object:
    #   { "cover_letter": { ... }, "gap_analysis": { ... } }

    cover_letter_data = generate_cover_letter(job_description, resume_text)
    gap_analysis_data = generate_gap_analysis(job_description, resume_text)

    return {**cover_letter_data, **gap_analysis_data}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)