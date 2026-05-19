# ============================================================
# prompts.py — All AI prompt templates
# ============================================================

SYSTEM_PROMPT = """
You are an expert career coach and professional resume writer.
You analyze job descriptions and resumes with precision.

ABSOLUTE RULE: You must respond with a single valid JSON object.
- No text before the JSON
- No text after the JSON
- No markdown, no backticks, no code fences
- No explanations or commentary
- Just the raw JSON object, starting with { and ending with }
""".strip()


COVER_LETTER_PROMPT = """
Write a tailored cover letter based on the job description and resume below.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

RULES:
- Maximum 3 paragraphs
- Paragraph 1: Candidate's strongest qualification connected to the JD
- Paragraph 2: 2-3 specific achievements from the resume that match the JD
- Paragraph 3: Short confident closing with a call to action
- Professional but human tone
- Sign off with the candidate's full name from the resume
- Do NOT use: "I am excited", "I am passionate", "team player", "fast learner"

YOU MUST RESPOND WITH ONLY THIS JSON AND NOTHING ELSE:
{{"cover_letter": {{"content": "COVER LETTER TEXT HERE WITH \\n FOR LINE BREAKS"}}}}

Replace COVER LETTER TEXT HERE with the actual cover letter.
Start your response with {{ and end with }}. Nothing else.
""".strip()


SKILL_GAP_PROMPT = """
Analyze the fit between the resume and job description below.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

YOU MUST RESPOND WITH ONLY THIS JSON AND NOTHING ELSE:
{{
  "gap_analysis": {{
    "match_score": 0,
    "summary": "REPLACE WITH 2-3 sentence honest assessment",
    "strong_matches": ["REPLACE WITH skill they have", "another skill"],
    "skill_gaps": ["REPLACE WITH missing skill", "another gap"],
    "experience_reframes": [
      {{
        "current_experience": "REPLACE WITH experience from resume",
        "better_positioning": "REPLACE WITH how to reframe it"
      }}
    ],
    "recommended_next_steps": ["REPLACE WITH action step", "another step"]
  }}
}}

Fill in every field based on the candidate. Replace match_score with an integer 0-100.
Start your response with {{ and end with }}. Nothing else.
""".strip()