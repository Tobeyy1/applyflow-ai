# schemas.py
from pydantic import BaseModel

# What comes IN from Next.js
# (FastAPI handles Form + File automatically in main.py,
# so you won't use this directly — but it's good documentation)
class AnalyzeRequest(BaseModel):
    job_description: str

# What goes OUT to Next.js
class AnalyzeResponse(BaseModel):
    cover_letter: str
    gap_analysis: str

# If you upgrade to the metadata version of resume_parser later
class AnalyzeResponseDetailed(BaseModel):
    cover_letter: str
    gap_analysis: str
    match_score: int
    page_count: int