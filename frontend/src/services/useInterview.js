/**
 * useInterview — custom hook
 * Manages all interview state and orchestrates API calls.
 * Keeps pages thin and logic centralized.
 */

import { useState, useCallback } from 'react'
import { startInterview, submitAnswer, generateReport } from '../services/interviewApi'

export const PHASES = {
  SETUP: 'setup',
  INTERVIEW: 'interview',
  LOADING: 'loading',      // Between questions (awaiting AI feedback)
  FEEDBACK: 'feedback',    // Showing feedback before next question
  REPORT_LOADING: 'report_loading',
  REPORT: 'report',
}

const TOTAL_QUESTIONS = 7

export function useInterview() {
  const [phase, setPhase] = useState(PHASES.SETUP)
  const [role, setRole] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [resumeText, setResumeText] = useState('')

  // Current question being answered
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionNumber, setQuestionNumber] = useState(0)
  const [stage, setStage] = useState('intro')

  // Completed sessions: [{ question, answer, feedback }]
  const [sessions, setSessions] = useState([])

  // Feedback from last submission (shown before moving on)
  const [pendingFeedback, setPendingFeedback] = useState(null)
  const [acknowledgment, setAcknowledgment] = useState('')  // AI's conversational reply
  const [nextQuestion, setNextQuestion] = useState('')
  const [nextAudio, setNextAudio] = useState(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)

  const playAudio = useCallback((base64Audio) => {
    if (base64Audio) {
      const sound = new Audio("data:audio/mp3;base64," + base64Audio)
      setIsAiSpeaking(true)
      sound.onended = () => setIsAiSpeaking(false)
      sound.play().catch(e => {
        console.error("Audio playback error:", e)
        setIsAiSpeaking(false)
      })
    }
  }, [])

  // Final report data
  const [report, setReport] = useState(null)

  // Error state
  const [error, setError] = useState(null)

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleStart = useCallback(async ({ role: selectedRole, name, resumeText }) => {
    setError(null)
    setRole(selectedRole)
    
    // Fix invalid name requirement
    const validName = (!name || name.trim().length < 3) ? 'Candidate' : name.trim()
    setCandidateName(validName)
    
    setResumeText(resumeText)
    setPhase(PHASES.LOADING)
    setSessions([])

    try {
      const data = await startInterview({ role: selectedRole.label, name: validName, resumeText })
      setCurrentQuestion(data.question)
      setQuestionNumber(1)
      setStage(data.stage || 'intro')
      setPhase(PHASES.INTERVIEW)
      playAudio(data.audio)
    } catch (err) {
      setError(err.message)
      setPhase(PHASES.SETUP)
    }
  }, [])

  const handleSubmitAnswer = useCallback(async (answer) => {
    setError(null)
    setPhase(PHASES.LOADING)

    try {
      const data = await submitAnswer({
        role: role.label,
        name: candidateName,
        resumeText: resumeText,
        question: currentQuestion,
        answer,
        questionNumber,
        history: sessions,
        stage: stage,
      })

      const newSession = {
        question: currentQuestion,
        answer,
        feedback: data.feedback,
        questionNumber,
        stage: stage,
      }

      const updatedSessions = [...sessions, newSession]
      setSessions(updatedSessions)
      setPendingFeedback(data.feedback)
      
      // Automatic flow routing based on decision
      const isEnd = data.decision === 'end' || data.is_final

      if (isEnd) {
        setPhase(PHASES.REPORT_LOADING)
        try {
          const reportData = await generateReport({ role: role.label, sessions: updatedSessions })
          setReport(reportData.report)
          setPhase(PHASES.REPORT)
        } catch (err) {
          setReport({ fallback: true })
          setPhase(PHASES.REPORT)
        }
      } else {
        // Skip FEEDBACK phase — go straight to next question like a real interview
        setAcknowledgment(data.acknowledgment || '')
        setCurrentQuestion(data.next_question)
        setQuestionNumber(n => n + 1)
        if (data.stage) setStage(data.stage)
        setPendingFeedback(null)
        setNextQuestion('')
        setPhase(PHASES.INTERVIEW)
        playAudio(data.audio)
      }
    } catch (err) {
      setError(err.message)
      setPhase(PHASES.INTERVIEW) // Return to interview on error
    }
  }, [role, currentQuestion, questionNumber, sessions])

  const handleContinue = useCallback(async () => {
    // Left for backwards compatibility, mostly unneeded now
    setPhase(PHASES.REPORT_LOADING)
  }, [])

  const handleRestart = useCallback(() => {
    setPhase(PHASES.SETUP)
    setRole(null)
    setCandidateName('')
    setResumeText('')
    setCurrentQuestion('')
    setQuestionNumber(0)
    setStage('intro')
    setSessions([])
    setPendingFeedback(null)
    setNextQuestion('')
    setNextAudio(null)
    setReport(null)
    setError(null)
  }, [])

  const handleForceEnd = useCallback(async () => {
    if (sessions.length === 0) {
      handleRestart()
      return
    }
    setPhase(PHASES.REPORT_LOADING)
    try {
      const data = await generateReport({ role: role.label, sessions })
      setReport(data.report)
      setPhase(PHASES.REPORT)
    } catch (err) {
      setReport({ fallback: true })
      setPhase(PHASES.REPORT)
    }
  }, [role, sessions, handleRestart])

  return {
    // State
    phase,
    role,
    candidateName,
    currentQuestion,
    questionNumber,
    stage,
    totalQuestions: TOTAL_QUESTIONS,
    sessions,
    pendingFeedback,
    acknowledgment,
    report,
    error,

    // Actions
    handleStart,
    handleSubmitAnswer,
    handleContinue,
    handleRestart,
    handleForceEnd,
    isAiSpeaking,
  }
}
