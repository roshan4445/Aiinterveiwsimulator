/**
 * Interview API Service
 * Centralizes all HTTP calls to the Flask backend.
 * Vite proxies /api/* to http://localhost:5000 in development.
 */


const BASE_URL = import.meta.env.PROD 
  ? 'https://aiinterveiwsimulator-3.onrender.com/api' 
  : '/api'

/**

/**
 * Generic fetch wrapper with error handling and JSON parsing.
 */
async function request(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Server error: ${response.status}`)
  }

  const data = await response.json()
  console.log("🚀 API RESPONSE DATA:")
  console.log(data)
  return data
}

/**
 * Start a new interview session.
 * @param {{ role: string, name: string, resumeText: string }} params
 * @returns {{ question: string, question_number: number, total_questions: number }}
 */
export async function startInterview({ role, name, resumeText }) {
  return request('/start', { role, name, resume_text: resumeText })
}

/**
 * Submit an answer and receive feedback + next question.
 * @param {{ role, name, resumeText, question, answer, questionNumber, history, stage }} params
 * @returns {{ feedback: object, next_question: string, is_final: boolean, stage: string }}
 */
export async function submitAnswer({ role, name, resumeText, question, answer, questionNumber, history, stage }) {
  return request('/next', {
    role,
    name,
    resume_text: resumeText,
    question,
    answer,
    question_number: questionNumber,
    stage,
    history: history.map(s => ({
      question: s.question,
      answer: s.answer,
      weaknesses: s.feedback?.weaknesses || [],
    })),
  })
}

/**
 * Generate the final performance report.
 * @param {string} role
 * @param {Array} sessions - All completed question/answer/feedback sessions
 * @returns {{ report: object }}
 */
export async function generateReport({ role, sessions }) {
  return request('/report', { role, sessions })
}

/**
 * Upload a PDF resume to extract text dynamically securely from the backend.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function parsePdfResume(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/parse-pdf`, {
    method: 'POST',
    body: formData,
  })

  // Since it doesn't use the standard `request` utility due to FormData, handle fetch explicitly:
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PDF Parsing failed: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Unknown PDF parsing error')
  }

  return data.text
}
