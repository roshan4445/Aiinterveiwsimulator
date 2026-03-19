import json
import re
from groq import Groq
from config import Config


# ==============================
# 🔹 GROQ CALL
# ==============================
def _call_groq(messages: list, temperature: float = 0.7) -> str:
    if Config.GROQ_API_KEY == "YOUR_GROQ_API_KEY_HERE" or not Config.GROQ_API_KEY:
        raise ValueError("Groq API key not configured.")

    client = Groq(api_key=Config.GROQ_API_KEY)
    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=messages,
        temperature=temperature,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
    )

    full_response = ""
    for chunk in completion:
        full_response += chunk.choices[0].delta.content or ""

    return full_response


# ==============================
# 🔹 SAFE JSON EXTRACTOR
# ==============================
def _extract_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass

    raise ValueError("Invalid JSON response")


# ==============================
# 🔹 CHECK SAME QUESTION
# ==============================
def _is_similar(q1: str, q2: str) -> bool:
    if not q1 or not q2:
        return False
    return q1.strip().lower() == q2.strip().lower()


# ==============================
# 🔹 PROMPT BUILDER (SMART FLOW)
# ==============================
def _build_evaluation_prompt(role, name, resume_text, question, answer, history, current_stage):
    questions_count = len(history) + 1 if history else 1

    resume_context = f"CANDIDATE RESUME:\n{resume_text[:1500]}\n\n" if resume_text else ""

    return f"""
You are a professional technical interviewer.

ROLE: {role}
STAGE: {current_stage}
QUESTION NUMBER: {questions_count}

INTERVIEW FLOW RULES:

1. INTRO:
- Ask "Tell me about yourself"
- Then 1 simple follow-up
- Move to RESUME

2. RESUME:
- Ask about projects ONLY
- Example: "Explain one of your projects"
- DO NOT ask approach immediately

3. ROLE_CORE:
- Ask based on project
- Order:
  - Basic
  - Intermediate
  - Advanced

4. STRICT RULES:
- NEVER repeat questions
- NEVER jump to advanced early
- ONLY ask "approach" AFTER project explanation
- Questions MUST relate to resume or previous answers

{resume_context}

CURRENT QUESTION:
{question}

ANSWER:
{answer}

Return ONLY JSON:
{{
  "score": 0-10,
  "strengths": [],
  "weaknesses": [],
  "improvement": "",
  "action": "follow_up | next | end",
  "next_question": "",
  "next_stage": "intro | resume | role_core | pressure | final"
}}
"""


# ==============================
# 🔥 MAIN FUNCTION
# ==============================
def evaluate_answer_and_next_question(
    role, name, resume_text, question, answer, history, current_stage
):
    try:
        # ✅ 1. HANDLE WEAK ANSWERS
        if not answer or len(answer.strip()) < 10:
            return {
                "feedback": {
                    "rating": 2,
                    "strengths": [],
                    "weaknesses": ["Answer too short or unclear"],
                    "improved_answer": "Give a proper structured answer."
                },
                "next_question": question,
                "decision": "continue",
                "next_stage": current_stage
            }

        # ✅ 2. CALL AI
        prompt = _build_evaluation_prompt(
            role, name, resume_text, question, answer, history, current_stage
        )

        messages = [
            {"role": "system", "content": "Return ONLY JSON."},
            {"role": "user", "content": prompt},
        ]

        raw = _call_groq(messages)
        result = _extract_json(raw)

        score = int(result.get("score", 5))
        action = result.get("action", "next").lower()
        next_question = result.get("next_question", "").strip()
        next_stage = str(result.get("next_stage", current_stage)).lower()

        questions = len(history) + 1

        # ✅ 3. FOLLOW-UP LIMIT (STOP LOOP)
        follow_up_count = 0
        if history:
            follow_up_count = history[-1].get("follow_up_count", 0)

        if action == "follow_up":
            follow_up_count += 1
            if follow_up_count > 1:
                action = "next"

        # ✅ 4. PREVENT SAME QUESTION
        if history and next_question:
            last_q = history[-1].get("question", "").strip().lower()
            if next_question.lower() == last_q:
                action = "next"

        # ✅ 5. SAFE FALLBACK QUESTION
        if not next_question or len(next_question) < 5:
            if current_stage == "intro":
                next_question = "Tell me about yourself."
            elif current_stage == "resume":
                next_question = "Can you explain one of your projects?"
            else:
                next_question = "How did you implement this in your project?"

        # ✅ 6. CONTROL STAGE FLOW
        if current_stage == "intro" and questions >= 2:
            next_stage = "resume"

        elif current_stage == "resume" and questions >= 3:
            next_stage = "role_core"

        elif current_stage == "role_core" and questions >= 5:
            next_stage = "final"

        if questions >= 7:
            action = "end"
            next_stage = "final"

        # ✅ 7. FINAL DECISION
        decision = "end" if action == "end" and questions >= 5 else "continue"

        feedback = {
            "rating": score,
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "improved_answer": result.get("improvement", "")
        }

        return {
            "feedback": feedback,
            "next_question": next_question,
            "decision": decision,
            "next_stage": next_stage
        }

    except Exception as e:
        print("[ERROR]", e)

        return {
            "feedback": {
                "rating": 4,
                "strengths": ["Attempted answer"],
                "weaknesses": ["Evaluation failed"],
                "improved_answer": "Try answering clearly."
            },
            "next_question": "Let's move forward. Tell me about one of your projects.",
            "decision": "continue",
            "next_stage": "resume"
        }


# ==============================
# 🔹 FINAL REPORT
# ==============================
def generate_final_report(role: str, sessions: list) -> dict:
    try:
        session_lines = []
        for i, s in enumerate(sessions, 1):
            fb = s.get("feedback", {})
            session_lines.append(
                f"Q{i}: {s.get('question')}\nAnswer: {s.get('answer')[:200]}\nRating: {fb.get('rating')}"
            )

        prompt = f"""
You are a senior {role} hiring manager.

{chr(10).join(session_lines)}

Return JSON:
{{
  "overall_assessment": "",
  "metrics": {{
    "technical_knowledge": 0,
    "communication": 0,
    "problem_solving": 0,
    "confidence": 0
  }},
  "top_strengths": [],
  "areas_to_improve": [],
  "hiring_recommendation": "",
  "recommendation_reason": ""
}}
"""

        messages = [
            {"role": "system", "content": "Return ONLY JSON."},
            {"role": "user", "content": prompt},
        ]

        raw = _call_groq(messages)
        return _extract_json(raw)

    except Exception:
        return {
            "overall_assessment": "Report unavailable",
            "metrics": {
                "technical_knowledge": 5,
                "communication": 5,
                "problem_solving": 5,
                "confidence": 5
            },
            "top_strengths": [],
            "areas_to_improve": [],
            "hiring_recommendation": "Maybe",
            "recommendation_reason": "Fallback"
        }