# ============================================================
# llm.py — All AI API calls (HuggingFace version)
# ============================================================

import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI, APIConnectionError, RateLimitError, APIStatusError
from prompts import SYSTEM_PROMPT, COVER_LETTER_PROMPT, SKILL_GAP_PROMPT

load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_TOKEN"),
)

MODEL = "Qwen/Qwen3-8B"


def strip_thinking(text: str) -> str:
    """Removes Qwen3 <think>...</think> blocks."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE).strip()


def extract_json(text: str) -> dict | None:
    """
    Tries every known strategy to extract a JSON object from the text.
    Returns None if all strategies fail.

    Strategy 1: Parse the whole string directly
    Strategy 2: Strip markdown fences then parse
    Strategy 3: Find the first { and last } and parse what's between them
    Strategy 4: Find all {...} candidates and try each one
    """
    clean = strip_thinking(text).strip()

    # Strategy 1 — direct parse
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass

    # Strategy 2 — strip markdown fences
    no_fences = re.sub(r"```(?:json)?", "", clean).strip().strip("`").strip()
    try:
        return json.loads(no_fences)
    except json.JSONDecodeError:
        pass

    # Strategy 3 — extract outermost { ... }
    start = no_fences.find("{")
    end = no_fences.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(no_fences[start:end])
        except json.JSONDecodeError:
            pass

    # Strategy 4 — find all {...} blocks and try each
    candidates = re.findall(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", no_fences, re.DOTALL)
    for candidate in reversed(candidates):  # largest block last, try biggest first
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    return None


def call_llm(user_prompt: str, max_tokens: int = 1024) -> str:
    """Sends a prompt and returns the raw response text with thinking stripped."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.3,  # Lower temp = more predictable/structured output
    )
    return strip_thinking(response.choices[0].message.content)


def generate_cover_letter(job_description: str, resume_text: str) -> dict:
    """
    Returns:
    {
      "cover_letter": { "content": "..." }
    }
    Falls back to wrapping plain text if the model ignores the JSON instruction.
    """
    prompt = COVER_LETTER_PROMPT.format(
        job_description=job_description,
        resume_text=resume_text,
    )
    raw = call_llm(prompt, max_tokens=1024)

    # Try to extract JSON
    parsed = extract_json(raw)
    if parsed and "cover_letter" in parsed:
        return parsed

    # Fallback — model returned plain text instead of JSON.
    # We wrap it in the expected shape so the frontend never breaks.
    print(f"[cover_letter] JSON extraction failed. Wrapping raw text.\nRaw: {raw[:200]}")
    return {
        "cover_letter": {
            "content": raw.strip()
        }
    }


def generate_gap_analysis(job_description: str, resume_text: str) -> dict:
    """
    Returns:
    {
      "gap_analysis": {
        "match_score": int,
        "summary": str,
        "strong_matches": [...],
        "skill_gaps": [...],
        "experience_reframes": [{ "current_experience": ..., "better_positioning": ... }],
        "recommended_next_steps": [...]
      }
    }
    Falls back to a structured placeholder if the model ignores the JSON instruction.
    """
    prompt = SKILL_GAP_PROMPT.format(
        job_description=job_description,
        resume_text=resume_text,
    )
    raw = call_llm(prompt, max_tokens=2048)

    # Try to extract JSON
    parsed = extract_json(raw)
    if parsed and "gap_analysis" in parsed:
        return parsed

    # Fallback — parse what we can from the plain text response
    print(f"[gap_analysis] JSON extraction failed. Building fallback.\nRaw: {raw[:200]}")

    # Try to extract a match score from plain text (e.g. "MATCH SCORE: 68" or "68/100")
    score_match = re.search(r"(?:match\s*score|score)[:\s]*(\d{1,3})", raw, re.IGNORECASE)
    score = int(score_match.group(1)) if score_match else 0

    return {
        "gap_analysis": {
            "match_score": score,
            "summary": raw.strip(),
            "strong_matches": [],
            "skill_gaps": [],
            "experience_reframes": [],
            "recommended_next_steps": []
        }
    }


def safe_call_llm(user_prompt: str, max_tokens: int = 1024) -> dict:
    """Error-handling wrapper — use in production."""
    try:
        result = call_llm(user_prompt, max_tokens)
        return {"success": True, "text": result, "error": None}
    except RateLimitError:
        return {"success": False, "text": "", "error": "Rate limit reached. Please wait and try again."}
    except APIConnectionError:
        return {"success": False, "text": "", "error": "Could not connect to HuggingFace."}
    except APIStatusError as e:
        status = e.status_code
        if status == 401:
            msg = "Invalid or missing HF_TOKEN. Check your .env file."
        elif status == 503:
            msg = "Model is loading. Please try again in 20 seconds."
        else:
            msg = f"API error ({status}). Please try again."
        return {"success": False, "text": "", "error": msg}
    except Exception:
        return {"success": False, "text": "", "error": "An unexpected error occurred."}