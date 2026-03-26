"""
Configuration file for AI Adaptive Interviewer backend.

HOW TO SET YOUR API KEY:
  Option 1 (Recommended): Set environment variable before running:
      export GROQ_API_KEY="your_actual_groq_api_key_here"

  Option 2: Replace the placeholder below directly (not recommended for production):
      GROQ_API_KEY = "your_actual_groq_api_key_here"

Get your free Groq API key at: https://console.groq.com
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Groq API ─────────────────────────────────────────────────────────────
    # INSERT YOUR GROQ API KEY HERE (or set via environment variable)
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
    MURF_API_KEY = os.environ.get("MURF_API_KEY", "")

    GROQ_MODEL = "llama-3.1-8b-instant"

    # Groq API base URL
    GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    # ── App settings ─────────────────────────────────────────────────────────
    DEBUG = False

    # Number of interview questions (keep low to reduce API usage)
    MAX_QUESTIONS = 7

    # Comma-separated list of allowed CORS origins
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
