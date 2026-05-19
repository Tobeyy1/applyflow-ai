# ============================================================
# resume_parser.py — Extracts plain text from a PDF resume
#
# This file has one job: take a PDF file and return its text
# as a plain Python string so the AI can read it.
#
# Why a separate file?
#   Keeping this logic isolated means if you ever want to add
#   DOCX support later, you only touch this file — nothing else
#   in your codebase changes.
# ============================================================


# --- STEP 1: Imports ---

import PyPDF2
# PyPDF2 is the library that reads PDF files.
# It can open a PDF, loop through its pages, and pull out the text.
# Install it with: pip install PyPDF2

from io import BytesIO
# BytesIO lets us wrap raw bytes in a file-like object.
# When FastAPI receives an uploaded file, it gives you a stream of bytes.
# PyPDF2 needs something it can "seek" through like a real file —
# BytesIO bridges that gap.
# Think of it like a temporary in-memory file — no disk involved.

import re
# Python's built-in regex library.
# We'll use it to clean up the extracted text —
# PDFs often produce messy whitespace when parsed.


# --- STEP 2: The main extraction function ---
# This is the only function main.py imports from this file.
#
# Parameter:
#   file → the raw file stream from FastAPI's UploadFile.file
#           (this is what you pass in from main.py: resume.file)
#
# Returns:
#   A single cleaned string containing all the text from the PDF.
#   Returns an empty string "" if extraction fails — never crashes.

def extract_text_from_pdf(file) -> str:
    try:
        # --- Read the raw bytes from the file stream ---
        # file.read() grabs all the raw bytes from the uploaded PDF.
        # We then wrap those bytes in BytesIO so PyPDF2 can navigate
        # through the file (seek forward and backward).
        #
        # Why not pass file directly to PyPDF2?
        # FastAPI's file stream isn't always seekable — BytesIO guarantees it is.

        pdf_bytes = file.read()
        pdf_stream = BytesIO(pdf_bytes)

        # --- Create a PDF reader ---
        # PdfReader is the PyPDF2 object that understands PDF structure.
        # strict=False means it won't crash on slightly malformed PDFs —
        # real-world resumes from Canva, Google Docs, etc. are often imperfect.

        reader = PyPDF2.PdfReader(pdf_stream, strict=False)

        # --- Check if the PDF is encrypted ---
        # Some PDFs are password-protected. We can't read those.
        # Better to catch this early and return a clear empty string
        # than let it crash further down the chain.

        if reader.is_encrypted:
            return ""

        # --- Loop through every page and collect the text ---
        # reader.pages is a list of page objects.
        # page.extract_text() returns the text on that page as a string,
        # or None if the page has no extractable text (e.g. it's a scanned image).
        # The "or ''" handles the None case safely.

        raw_text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            raw_text += page_text + "\n"
            # We add a "\n" between pages so content from different pages
            # doesn't accidentally merge into one run-on line.

        # --- Clean up the extracted text ---
        # PDFs are notorious for producing messy text:
        # multiple spaces, random newlines mid-sentence, blank lines, etc.
        # We run it through a cleaner before sending it to the AI.

        cleaned_text = clean_text(raw_text)
        return cleaned_text

    except Exception:
        # If anything goes wrong (corrupted file, unsupported PDF version, etc.)
        # we return an empty string instead of crashing the whole server.
        # main.py checks for an empty string and returns a 422 error to the frontend.
        return ""


# --- STEP 3: The text cleaner ---
# PDFs produce whitespace noise when parsed. This function normalises it.
# It's a private helper — only used inside this file (hence the _ prefix convention).
#
# What it fixes:
#   "Hello     World"  →  "Hello World"     (multiple spaces → one)
#   "line1\n\n\n\nline2" → "line1\n\nline2" (3+ blank lines → one blank line)
#   "  leading/trailing spaces  " → "leading/trailing spaces"

def clean_text(text: str) -> str:
    if not text:
        return ""

    # Replace multiple spaces and tabs with a single space
    text = re.sub(r'[ \t]+', ' ', text)

    # Replace 3 or more consecutive newlines with just 2
    # (preserves paragraph breaks without excessive blank space)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Strip leading and trailing whitespace from each line
    lines = [line.strip() for line in text.splitlines()]
    text = '\n'.join(lines)

    # Final strip of the whole string
    return text.strip()


# --- STEP 4: A helper to check if a PDF is image-based ---
# Some PDFs are just scanned images — PyPDF2 can't extract text from those.
# This function detects that case so you can show a helpful error message
# instead of silently sending empty text to the AI.
#
# How it works: if we extracted barely any text (under 100 characters)
# from a multi-page PDF, it's almost certainly image-based.

def is_image_based_pdf(text: str, page_count: int) -> bool:
    if page_count == 0:
        return False
    average_chars_per_page = len(text) / page_count
    return average_chars_per_page < 100


# --- STEP 5: An enhanced version with better error reporting ---
# This version returns a dict with more detail instead of just a string.
# main.py uses the simple version above, but this is here if you want
# to show the user a more specific error (e.g. "your PDF is image-based").
#
# Returns:
#   {
#     "success": True/False,
#     "text": "extracted text or empty string",
#     "error": None or "human-readable error message",
#     "page_count": number of pages
#   }

def extract_text_with_metadata(file) -> dict:
    try:
        pdf_bytes = file.read()
        pdf_stream = BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_stream, strict=False)

        if reader.is_encrypted:
            return {
                "success": False,
                "text": "",
                "error": "This PDF is password-protected. Please upload an unlocked version.",
                "page_count": 0
            }

        page_count = len(reader.pages)
        raw_text = ""
        for page in reader.pages:
            raw_text += (page.extract_text() or "") + "\n"

        cleaned = clean_text(raw_text)

        if is_image_based_pdf(cleaned, page_count):
            return {
                "success": False,
                "text": "",
                "error": "This PDF appears to be a scanned image. Please upload a text-based PDF.",
                "page_count": page_count
            }

        if not cleaned:
            return {
                "success": False,
                "text": "",
                "error": "No text could be extracted from this PDF.",
                "page_count": page_count
            }

        return {
            "success": True,
            "text": cleaned,
            "error": None,
            "page_count": page_count
        }

    except Exception as e:
        return {
            "success": False,
            "text": "",
            "error": "Failed to read the PDF file. It may be corrupted.",
            "page_count": 0
        }