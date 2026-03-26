# AI Adaptive Interviewer

A full-stack interview simulator where the AI dynamically adapts questions based on your previous answers and provides detailed, actionable feedback.

---

## Features

- **Stage-based progression** — Interviews logically progress through Intro, Resume, Role Core, Pressure, and Final stages
- **Gradual difficulty scaling** — Questions start easy and dynamically adapt, progressively scaling up in complexity
- **Structured feedback** — Rating (1–10), strengths, weaknesses, and a model answer per question
- **Competency Evaluation** — Core final metrics across Technical Knowledge, Communication, Problem Solving, and Confidence
- **PDF Resume parsing** — AI automatically context-matches your specific projects against the chosen role directly from uploaded resumes
- **Final performance report** — Overall assessment, hiring recommendation, and personalised study plan
- **Voice integration** — Features Murf speech synthesis and browser-based speech recognition
- **Graceful fallback** — Works robustly with fallback objects if underlying AI generation timeout limits are reached
- **8 interview roles** — Frontend, Backend, Full Stack, DevOps, Data Science, PM, HR, Design

---

## Project Structure

```
ai-interviewer/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── config.py               # API keys & settings  ← SET YOUR KEY HERE
│   ├── routes.py               # Blueprint registration
│   ├── requirements.txt
│   ├── .env.example
│   ├── api/
│   │   └── interview.py        # /start  /next  /report endpoints
│   └── services/
│       └── groq_service.py     # All Groq LLM calls & prompt engineering
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx             # Page router
        ├── styles/
        │   └── global.css
        ├── services/
        │   ├── interviewApi.js # All HTTP calls to Flask
        │   └── useInterview.js # State machine (custom hook)
        ├── components/
        │   ├── ProgressBar.jsx / .module.css
        │   ├── RatingRing.jsx  / .module.css
        │   ├── FeedbackCard.jsx / .module.css
        │   ├── LoadingSpinner.jsx / .module.css
        │   └── ErrorBanner.jsx  / .module.css
        └── pages/
            ├── SetupPage.jsx    / .module.css
            ├── InterviewPage.jsx / .module.css
            └── ReportPage.jsx   / .module.css
```

---

## Quick Start

### 1. Get a Groq API Key (free)

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up and create an API key
3. Copy the key

### 2. Configure the backend

**Option A — environment variable (recommended):**
```bash
export GROQ_API_KEY="your_key_here"
```

**Option B — edit config directly:**
Open `backend/config.py` and replace `"YOUR_GROQ_API_KEY_HERE"` with your actual key.

### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

All endpoints act on POST requests and transport data using JSON objects.

### `POST /api/start`
Initialise a new interview session and establish the first stage.

**Request:**
```json
{ 
  "role": "Frontend Developer",
  "name": "Alex",
  "resume_text": "Passionate Software Developer with..."
}
```

**Response:**
```json
{
  "success": true,
  "question": "Hi Alex, could you briefly introduce yourself?",
  "audio": "...",
  "question_number": 1,
  "total_questions": 7,
  "role": "Frontend Developer",
  "stage": "intro"
}
```

---

### `POST /api/next`
Submit an answer to receive structured feedback, adaptive text, audio output, and dynamic stage routing.

**Request:**
```json
{
  "role": "Frontend Developer",
  "name": "Alex",
  "resume_text": "...",
  "question": "...",
  "answer": "...",
  "question_number": 1,
  "stage": "intro",
  "history": []
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "rating": 7,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "improved_answer": "...",
    "tone": "neutral",
    "focus_area": "experience"
  },
  "next_question": "Can you elaborate on...",
  "decision": "continue",
  "audio": "...",
  "is_final": false,
  "stage": "resume"
}
```

---

### `POST /api/report`
Generate the final holistic performance report consisting of all 7 metrics.

**Request:**
```json
{
  "role": "Frontend Developer",
  "sessions": [
    {
      "question": "...",
      "answer": "...",
      "questionNumber": 1,
      "stage": "intro",
      "feedback": { "rating": 7, "strengths": [], "weaknesses": [], "improved_answer": "" }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "overall_assessment": "...",
    "metrics": {
      "technical_knowledge": 8,
      "communication": 7,
      "problem_solving": 8,
      "confidence": 6
    },
    "top_strengths": [],
    "areas_to_improve": [],
    "hiring_recommendation": "Hire",
    "recommendation_reason": "...",
    "study_plan": [],
    "avg_score": 7.3
  }
}
```

---

## Configuration

| Variable | File | Description |
|---|---|---|
| `GROQ_API_KEY` | `backend/config.py` | Your Groq API key |
| `GROQ_MODEL` | `backend/config.py` | LLM model (default: `llama3-8b-8192`) |
| `MAX_QUESTIONS` | `backend/config.py` | Questions per interview (default: 7) |
| `CORS_ORIGINS` | `backend/config.py` | Allowed frontend origins |

---

## How Adaptive Flow Logic Works

The entire flow is powered by a heavily detailed, stateful prompt algorithm structured into the following transitions:

1. **Intro:** Warm-up questions, strictly basic (e.g. "Tell me about yourself").
2. **Resume:** Tailored context extraction. The AI connects candidate resume points to the exact role applying for.
3. **Role Core:** Dominates 60% of the interview. The AI forces a structured 3-tier difficulty climb (Basic Definition → Practical Usage → Advanced Design/Optimization).
4. **Pressure:** Hardcore edge-cases designed to stress-test their fundamental knowledge.
5. **Final Stage:** Graceful wind-down and interview termination logic natively caught automatically if bounds are exceeded.

**Final assessment computation** takes all historic sessions and extracts competency grading (`Technical Knowledge`, `Communication`, `Problem Solving`, `Confidence`).
