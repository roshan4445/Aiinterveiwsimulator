# AI Adaptive Interviewer

A full-stack interview simulator where the AI dynamically adapts questions based on your previous answers and provides detailed, actionable feedback.

---

## Features

- **Adaptive questioning** — the AI reads your weaknesses and targets them in the next question
- **Structured feedback** — rating (1–10), strengths, weaknesses, and a model answer per question
- **Final performance report** — overall assessment, hiring recommendation, and personalised study plan
- **Voice input** — optional browser-based speech recognition
- **Graceful fallback** — works with dummy responses if Groq is unavailable
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

All endpoints are `POST` and accept/return JSON.

### `POST /api/start`
Initialise a new interview session.

**Request:**
```json
{ "role": "Frontend Developer" }
```

**Response:**
```json
{
  "success": true,
  "question": "Tell me about yourself...",
  "question_number": 1,
  "total_questions": 3,
  "role": "Frontend Developer"
}
```

---

### `POST /api/next`
Submit an answer; receive feedback and the next adaptive question.

**Request:**
```json
{
  "role": "Frontend Developer",
  "question": "...",
  "answer": "...",
  "question_number": 1,
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
    "improved_answer": "..."
  },
  "next_question": "Can you elaborate on...",
  "is_final": false
}
```

---

### `POST /api/report`
Generate the final performance report.

**Request:**
```json
{
  "role": "Frontend Developer",
  "sessions": [
    {
      "question": "...",
      "answer": "...",
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
| `MAX_QUESTIONS` | `backend/config.py` | Questions per interview (default: 3) |
| `CORS_ORIGINS` | `backend/config.py` | Allowed frontend origins |

---

## How Adaptive Logic Works

1. User answers Q1 → AI extracts `weaknesses: ["lacks concrete examples", "no metrics mentioned"]`
2. Q2 is generated to directly probe those gaps: *"Walk me through a specific project where you can give concrete metrics on impact…"*
3. Q2 answer + Q1 weaknesses feed into Q3 prompt — the AI compounds insights across the full history
4. Final report synthesises all 3 sessions into holistic feedback

**Single API call per question** — feedback AND next question are generated in one Groq request for speed.
