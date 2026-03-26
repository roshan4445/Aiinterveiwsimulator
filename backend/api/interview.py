"""
Interview API Blueprint
Endpoints:
  POST /api/start  → Return the fixed first question
  POST /api/next   → Evaluate answer, return feedback + next question
  POST /api/report → Generate final performance report
"""

from flask import Blueprint, request, jsonify
from services.groq_service import (
    evaluate_answer_and_next_question,
    generate_final_report,
)
from services.murf_service import generate_speech
from config import Config

interview_bp = Blueprint("interview", __name__)

# The fixed opening question for every interview
FIRST_QUESTION = "Tell me about yourself — your background, experience, and what excites you about this role."


@interview_bp.route("/start", methods=["POST"])
def start_interview():
    """
    Initializes a new interview session.
    Expects JSON: { "role": "Frontend Developer" }
    Returns: { "question": "...", "question_number": 1 }
    """
    data = request.get_json(silent=True) or {}
    role = data.get("role", "Software Developer")
    name = data.get("name", "Candidate")
    resume_text = data.get("resume_text", "")

    first_question = f"Hi {name}, could you briefly introduce yourself?"
    audio_base64 = generate_speech(first_question)

    return jsonify({
        "success": True,
        "question": first_question,
        "audio": audio_base64,
        "question_number": 1,
        "total_questions": Config.MAX_QUESTIONS,
        "role": role,
        "stage": "intro"
    })


@interview_bp.route("/next", methods=["POST"])
def next_question():
    """
    Evaluates current answer and returns feedback + next question.
    """
    data = request.get_json(silent=True) or {}

    role = data.get("role", "Software Developer")
    name = data.get("name", "Candidate")
    resume_text = data.get("resume_text", "")
    question = data.get("question", "")
    answer = data.get("answer", "")
    question_number = data.get("question_number", 1)
    history = data.get("history", [])

    stage = data.get("stage", "intro")

    if not question or not answer:
        return jsonify({"success": False, "error": "Question and answer are required."}), 400

    result = evaluate_answer_and_next_question(
        role=role,
        name=name,
        resume_text=resume_text,
        question=question,
        answer=answer,
        history=history,
        current_stage=stage
    )

    decision = result.get("decision", "continue")
    is_final = (decision == "end")

    next_question_text = result.get("next_question")
    acknowledgment = result.get("acknowledgment", "")
    audio_base64 = ""
    if next_question_text and next_question_text != "INTERVIEW_COMPLETE":
        # Combine acknowledgment + question for natural TTS flow
        spoken_text = f"{acknowledgment} {next_question_text}".strip() if acknowledgment else next_question_text
        audio_base64 = generate_speech(spoken_text)

    return jsonify({
        "success": True,
        "feedback": result.get("feedback"),
        "acknowledgment": acknowledgment,
        "next_question": next_question_text,
        "decision": decision,
        "audio": audio_base64,
        "is_final": is_final,
        "stage": result.get("next_stage", stage)
    })


@interview_bp.route("/report", methods=["POST"])
def final_report():
    """
    Generates a comprehensive final report after all questions.
    Expects JSON:
      {
        "role": "Frontend Developer",
        "sessions": [
          {
            "question": "...",
            "answer": "...",
            "feedback": { rating, strengths, weaknesses, improved_answer }
          }, ...
        ]
      }
    Returns: { "report": { overall_assessment, top_strengths, areas_to_improve, hiring_recommendation, study_plan, avg_score } }
    """
    data = request.get_json(silent=True) or {}

    role = data.get("role", "Software Developer")
    sessions = data.get("sessions", [])

    if not sessions:
        return jsonify({"success": False, "error": "No session data provided."}), 400

    report = generate_final_report(role=role, sessions=sessions)

    # Compute average score from feedback ratings
    ratings = [s.get("feedback", {}).get("rating", 0) for s in sessions if s.get("feedback")]
    avg_score = round(sum(ratings) / len(ratings), 1) if ratings else 0

    return jsonify({
        "success": True,
        "report": {**report, "avg_score": avg_score},
    })


@interview_bp.route("/parse-pdf", methods=["POST"])
def parse_pdf():
    """
    Parses an uploaded PDF file and returns the extracted text.
    """
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file."}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        try:
            import fitz
            doc = fitz.open(stream=file.read(), filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
            return jsonify({"success": True, "text": text.strip()})
        except Exception as e:
            return jsonify({"success": False, "error": f"Failed to parse PDF: {str(e)}"}), 500
            
    return jsonify({"success": False, "error": "Invalid file format. Please upload a PDF."}), 400
