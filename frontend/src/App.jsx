/**
 * App.jsx — root component
 * Acts as a page router driven by the interview phase state machine.
 * All state lives in useInterview(); pages are purely presentational.
 */

import { useInterview, PHASES } from './services/useInterview'
import SetupPage from './pages/SetupPage'
import InterviewPage from './pages/InterviewPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  const {
    phase,
    role,
    candidateName,
    currentQuestion,
    questionNumber,
    totalQuestions,
    sessions,
    pendingFeedback,
    acknowledgment,
    report,
    error,
    handleStart,
    handleSubmitAnswer,
    handleContinue,
    handleRestart,
    handleForceEnd,
    isAiSpeaking,
  } = useInterview()

  // ── Route to the correct page based on phase ──────────────────────────

  if (phase === PHASES.SETUP) {
    return (
      <SetupPage
        onStart={handleStart}
        isLoading={false}
      />
    )
  }

  if (phase === PHASES.REPORT || phase === PHASES.REPORT_LOADING) {
    return (
      <ReportPage
        phase={phase}
        role={role}
        sessions={sessions}
        report={report}
        onRestart={handleRestart}
      />
    )
  }

  // All other phases (INTERVIEW, LOADING) render InterviewPage
  return (
    <InterviewPage
      phase={phase}
      role={role}
      candidateName={candidateName}
      currentQuestion={currentQuestion}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      sessions={sessions}
      pendingFeedback={pendingFeedback}
      acknowledgment={acknowledgment}
      error={error}
      onSubmit={handleSubmitAnswer}
      onContinue={handleContinue}
      onRestart={handleRestart}
      onEnd={handleForceEnd}
      isAiSpeaking={isAiSpeaking}
    />
  )
}
