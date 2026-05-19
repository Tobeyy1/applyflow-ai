# ApplyFlow AI

**AI-powered job application assistant. Paste a job description, upload your resume — get a tailored cover letter, skill gap analysis, and match score in seconds.**

🔗 **[Live Demo](https://applyflow-ai.vercel.app)** &nbsp;·&nbsp; [Backend API](https://applyflow-backend-production.up.railway.app/docs)

![ApplyFlow AI Screenshot](./screenshot.png)

---

## What It Does

Most job applications fail before they're read. ApplyFlow AI helps candidates understand exactly how they match a role and gives them a tailored cover letter that doesn't sound like a template.

Upload your resume and paste a job description. The app returns:

- **Tailored cover letter** — written specifically for the role, using your actual experience and achievements
- **Match score (0–100)** — honest assessment of how well your background fits the requirements
- **Skill gap analysis** — what you have, what you're missing, and what to do about it
- **Experience reframes** — how to reword your existing experience to better match the job description's language

---

## Tech Stack

| Layer            | Technology                             | Why                                                             |
| ---------------- | -------------------------------------- | --------------------------------------------------------------- |
| Frontend         | Next.js 14 (App Router) + TypeScript   | Production-ready React with server components and strong typing |
| Styling          | Tailwind CSS                           | Utility-first — fast to build, easy to maintain                 |
| Backend          | FastAPI (Python)                       | Industry standard for AI/ML backends; native Python ecosystem   |
| AI               | Qwen3-8B via HuggingFace Inference API | Free tier, strong instruction following, good structured output |
| PDF parsing      | PyPDF2                                 | Lightweight, no dependencies, handles real-world resume PDFs    |
| Frontend hosting | Vercel                                 | Zero-config Next.js deployment                                  |
| Backend hosting  | Railway                                | Simple Python deployment with environment variable management   |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│                                                         │
│  UploadForm.tsx  →  lib/api.ts  →  ResultPanel.tsx      │
│  (job desc + PDF)   (FormData)    (cover letter +       │
│                      fetch()       gap analysis)         │
└──────────────────────┬──────────────────────────────────┘
                       │ POST /analyze
                       │ multipart/form-data
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                         │
│  main.py → resume_parser.py → prompts.py → llm.py      │
│  (routing)   (PDF → text)    (templates)  (AI calls)    │
└──────────────────────┬──────────────────────────────────┘
                       │ chat completions API
┌──────────────────────▼──────────────────────────────────┐
│           HuggingFace Inference Router                   │
│                  Qwen3-8B                                │
└─────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions

**Why FastAPI over Express or Flask?**
FastAPI is the industry standard for Python AI backends. It handles file uploads natively via `python-multipart`, generates interactive API docs at `/docs` automatically, and integrates with the Python AI ecosystem without any rewrites. Flask would have worked but requires more boilerplate for file handling. Express would have required rewriting the entire Python backend in JavaScript.

**Why HuggingFace over OpenAI?**
The free tier on HuggingFace's Inference Router (`router.huggingface.co/v1`) supports the OpenAI-compatible chat completions API, making it a drop-in replacement. Qwen3-8B provides strong structured output quality for prompt-heavy tasks like cover letter generation and JSON-formatted gap analysis — without the cost of GPT-4o.

**Why structured JSON output from the AI?**
The gap analysis returns a typed JSON object (`match_score`, `strong_matches`, `skill_gaps`, `experience_reframes`) rather than a plain string. This means the frontend can render each section independently — the match score drives the progress bar, the matches and gaps render as styled tags, and the reframes render as before/after pairs. Plain text output would require fragile regex parsing on the frontend.

**Why PyPDF2 over other PDF libraries?**
Lightweight, no system dependencies, and handles real-world PDFs from Canva, Google Docs, and Mac Preview with `strict=False`. The parser includes detection for image-based PDFs (scanned documents) which return empty text — caught early with a 422 error and a clear user message.

**Why Next.js App Router over Pages Router?**
App Router is the current Next.js standard and where the ecosystem is heading. Server Components reduce client bundle size, and the file-based routing in `app/` is cleaner for a single-page tool like this.

---

## Running Locally

**Prerequisites:** Node.js 18+, Python 3.10+, a HuggingFace account

**1. Clone the repo**

```bash
git clone https://github.com/yourusername/applyflow-ai.git
cd applyflow-ai
```

**2. Set up the backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
HF_TOKEN=hf_your_token_here
```

Get your token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — enable "Make calls to Inference Providers".

Start the backend:

```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` to confirm it's running.

**3. Set up the frontend**

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Project Structure

```
applyflow-ai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── UploadForm.tsx    # Job description + PDF upload
│   │   ├── ResultPanel.tsx   # Cover letter + gap analysis display
│   │   ├── MatchScoreBar.tsx # Animated 0–100 progress bar
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   └── api.ts            # fetch() wrapper for /analyze
│   └── types/
│       └── index.ts          # TypeScript types for API response
│
├── backend/
│   ├── main.py               # FastAPI app + /analyze route
│   ├── llm.py                # HuggingFace AI calls + JSON parsing
│   ├── resume_parser.py      # PDF text extraction
│   ├── prompts.py            # All AI prompt templates
│   ├── schemas.py            # Pydantic response models
│   └── requirements.txt
│
└── README.md
```

---

## What I'd Improve

**Streaming responses** — The cover letter currently appears all at once after ~15 seconds. Adding `stream=True` to the HuggingFace call and a `StreamingResponse` in FastAPI would let the cover letter render word by word in real time — a significantly better UX for a slow AI call.

**DOCX resume support** — Currently only PDF resumes are supported. Adding `python-docx` would handle Word documents, which many candidates still use.

**Interview question generator** — A natural third AI call: given the job description and the candidate's experience, generate the 8 most likely interview questions they'll face. The prompt and endpoint are already structured to make this a straightforward addition.

**Parallel AI calls** — The cover letter and gap analysis are currently generated sequentially. Wrapping both in `asyncio.gather()` would cut the response time roughly in half.

**Persistent history** — Right now every analysis is stateless. Adding a database (Supabase or PlanetScale) would let users save and compare analyses across multiple job applications.

---

## License

MIT
