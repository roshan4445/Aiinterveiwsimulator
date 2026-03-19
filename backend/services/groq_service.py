import json
import re
from groq import Groq
from config import Config

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
        stop=None
    )

    full_response = ""
    for chunk in completion:
        full_response += chunk.choices[0].delta.content or ""

    print("\n" + "="*50)
    print("🤖 AI GENERATED RAW RESPONSE:")
    print("="*50)
    print(full_response)
    print("="*50 + "\n")

    return full_response


def _extract_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
             return json.loads(match.group())
    raise ValueError("Invalid JSON response")


def _build_evaluation_prompt(role, name, resume_text, question, answer, history, current_stage):
    questions_count = len(history) + 1 if history else 1
    history_context = ""
    if history:
        history_lines = []
        for i, h in enumerate(history, 1):
            history_lines.append(f"Q{i}: {h.get('question')}\nAnswer: {h.get('answer')}\nWeaknesses: {', '.join(h.get('weaknesses', []))}")
        history_context = "PREVIOUS INTERVIEW HISTORY:\n" + "\n\n".join(history_lines) + "\n\n"

    resume_context = ""
    if resume_text:
        resume_context = f"CANDIDATE'S RESUME TEXT:\n{resume_text[:2000]}\n\n(Use this to ask authentic, personalized context questions about their past projects, tech stack, and experience. Verify their authenticity.)\n\n"

    return f"""You are a professional, neutral, and slightly challenging technical interviewer.
You are interviewing '{name}' for the role of '{role}'.

CURRENT STAGE: '{current_stage}'
QUESTION COUNT: {questions_count}
MAXIMUM QUESTIONS: 7

STRICT FLOW RULES & DIFFICULTY PROGRESSION:
- "intro" stage: Very easy, conversational. Ask "Tell me about yourself" -> 1 intelligent follow-up. MUST move to "resume".
- "resume" stage: Easy to moderate. Based on candidate's projects/experience. -> MUST move to "role_core" after 1-2 questions.
- "role_core" stage (MOST IMPORTANT): Must dominate interview (60-70%). 
  * Progressive difficulty:
    - 1st question -> BASIC (definition-level)
    - 2nd question -> INTERMEDIATE (practical usage)
    - 3rd question -> ADVANCED (design / optimization)
- "pressure" stage: Advanced + edge cases. Ask failure scenarios.
- "final" stage: Wrap up interview and prepare to end.

ROLE ALIGNMENT & REALISTIC CONSTRAINTS:
- Questions MUST strictly match the '{role}' role.
- Convert resume-based topics into role-based questions (e.g., Instead of "How did you test APIs?", ask "How would you design and test an API?").
- DO NOT ask advanced/system design questions early.
- DO NOT jump directly to scaling/distributed systems.
- Always start with standard interview questions and build difficulty step-by-step.
- Prefer practical, real-world questions over theoretical abstract ones.

{resume_context}{history_context}CURRENT QUESTION:
"{question}"

CANDIDATE'S ANSWER:
"{answer}"

STRICT INSTRUCTIONS:
1. Act like a real interviewer. Be neutral and focused.
2. Based on the candidate's answer and current stage, decide:
   - Should you ask a follow-up question? ("follow_up")
   - Move to next question? ("next")
   - End the interview? ("end")
3. You MUST ask at least 5 main questions before ending the interview. Do NOT "end" before 5 questions.
4. Provide an honest score from 0-10.
5. Return your response ONLY as valid JSON matching the exact structure below.

Required JSON Output Format:
{{
  "score": <number 0-10>,
  "strengths": ["<observation 1>"],
  "weaknesses": ["<clear gap 1>", "<clear gap 2>"],
  "improvement": "<Concise better answer without tutoring or sugar-coating>",
  "action": "follow_up | next | end",
  "next_question": "<only if follow_up or next, else empty string>",
  "next_stage": "intro | resume | role_core | pressure | final"
}}
"""


def evaluate_answer_and_next_question(
    role, name, resume_text, question, answer, history, current_stage
):
    try:
        prompt = _build_evaluation_prompt(
            role, name, resume_text, question, answer, history, current_stage
        )

        messages = [
            {"role": "system", "content": "You are a professional technical interviewer simulator. Return ONLY strictly formatted JSON."},
            {"role": "user", "content": prompt},
        ]

        raw = _call_groq(messages)
        result = _extract_json(raw)

        action = result.get("action", "next").lower()
        next_stage_val = result.get("next_stage") or current_stage
        next_stage = str(next_stage_val).lower()
        
        questions = len(history) + 1 if history else 1
        
        # (C) FORCE FINAL STAGE
        if questions >= 5 and current_stage != "final":
            next_stage = "final"
            
        # (A) HARD LIMIT
        if questions >= 7:
            action = "end"
            next_stage = "final"
            
        # (B) & (D) DECISION LOGIC
        valid_end = action == "end" and next_stage == "final" and questions >= 5
        
        if valid_end:
            decision = "end"
        else:
            decision = "continue"

        feedback = {
            "rating": int(result.get("score", result.get("rating", 5))),
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "improved_answer": result.get("improvement", result.get("improved_answer", "")),
            "tone": result.get("tone", "neutral"),
            "focus_area": result.get("focus_area", "")
        }

        return {
            "feedback": feedback,
            "next_question": result.get("next_question", ""),
            "decision": decision,
            "next_stage": next_stage
        }

    except Exception as e:
        print("[ERROR] Groq generation failed:", e)
        return {
            "feedback": {
                "rating": 5,
                "strengths": ["Answer provided"],
                "weaknesses": ["Cannot evaluate deeply at this moment"],
                "improved_answer": "Provide more specific details if possible.",
                "tone": "neutral",
                "focus_area": "general"
            },
            "next_question": "Can you expand on your technical approach there?",
            "decision": "continue",
            "next_stage": current_stage,
            "fallback_used": True
        }


def generate_final_report(role: str, sessions: list) -> dict:
    try:
        session_lines = []
        for i, s in enumerate(sessions, 1):
            fb = s.get("feedback", {})
            session_lines.append(
                f"Q{i}: {s.get('question', '')}\nAnswer: {s.get('answer', '')[:300]}\nRating: {fb.get('rating', 'N/A')}/10\nWeaknesses: {', '.join(fb.get('weaknesses', []))}"
            )
        sessions_text = "\n\n".join(session_lines)

        prompt = f"""You are a senior {role} hiring manager writing a post-interview assessment based on the candidate's performance.

COMPLETE INTERVIEW TRANSCRIPT:
{sessions_text}

Write a comprehensive, professional, and honest hiring assessment as ONLY valid JSON. Focus on real hiring parameters, do not sugarcoat weaknesses.

{{
  "overall_assessment": "<3-4 sentences holistically evaluating the candidate's practical performance>",
  "metrics": {{
    "technical_knowledge": <number 0-10>,
    "communication": <number 0-10>,
    "problem_solving": <number 0-10>,
    "confidence": <number 0-10>
  }},
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_to_improve": ["<area 1>", "<area 2>", "<area 3>"],
  "hiring_recommendation": "<one of: Strong Hire | Hire | Maybe | No Hire>",
  "recommendation_reason": "<1-2 sentences strictly explaining the structural reasoning for the hiring decision>",
  "study_plan": ["<Resource or actionable topic 1>", "<Actionable topic 2>"]
}}"""
        messages = [
            {"role": "system", "content": "You are a strict, professional hiring manager. Output ONLY valid JSON."},
            {"role": "user", "content": prompt},
        ]
        raw = _call_groq(messages)
        return _extract_json(raw)

    except Exception as e:
        print("[ERROR] Final report generation failed:", e)
        return {
            "overall_assessment": "The interview concluded but dynamic report generation is unavailable.",
            "metrics": {
                "technical_knowledge": 5,
                "communication": 6,
                "problem_solving": 5,
                "confidence": 5
            },
            "top_strengths": ["Communicative"],
            "areas_to_improve": ["Requires deeper evaluation"],
            "hiring_recommendation": "Maybe",
            "recommendation_reason": "Fallback generated.",
            "study_plan": ["Review system design", "Practice technical deep-dives"],
            "fallback_used": True
        }