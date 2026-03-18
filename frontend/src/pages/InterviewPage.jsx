import { useState, useRef, useEffect, useCallback } from 'react'
import ProgressBar from '../components/ProgressBar'
import FeedbackCard from '../components/FeedbackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import ActiveSpeaker from '../components/ActiveSpeaker'
import CameraWidget from '../components/CameraWidget'
import { PHASES } from '../services/useInterview'
import styles from './InterviewPage.module.css'

const MIN_LEN = 20

export default function InterviewPage({
  phase, role, candidateName, currentQuestion, questionNumber, totalQuestions,
  pendingFeedback, error, onSubmit, onContinue, onRestart, onEnd, isAiSpeaking
}) {
  const [answer, setAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechErr, setSpeechErr] = useState('')
  const [localErr, setLocalErr] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  const isLoading = phase === PHASES.LOADING
  const isFeedback = phase === PHASES.FEEDBACK
  const isReportLoading = phase === PHASES.REPORT_LOADING

  useEffect(() => {
    if (phase === PHASES.INTERVIEW) {
      textareaRef.current?.focus()
      setSeconds(0)
      const interval = setInterval(() => setSeconds(s => s + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [phase, currentQuestion])

  useEffect(() => {
    if (phase === PHASES.INTERVIEW) { setAnswer(''); setLocalErr(null) }
  }, [phase, currentQuestion])

  function submit() {
    if (answer.trim().length < MIN_LEN) {
      setLocalErr(`Write at least ${MIN_LEN} characters.`)
      textareaRef.current?.focus()
      return
    }
    setLocalErr(null)
    onSubmit(answer.trim())
  }

  const initRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSpeechErr('Speech recognition not supported here.'); return null }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setAnswer(t)
    }
    rec.onerror = (e) => { setSpeechErr(`Voice: ${e.error}`); setIsListening(false) }
    rec.onend = () => setIsListening(false)
    return rec
  }, [])

  function toggleVoice() {
    setSpeechErr('')
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    recognitionRef.current = initRecognition()
    if (recognitionRef.current) { recognitionRef.current.start(); setIsListening(true) }
  }

  const chars = answer.length
  const tooShort = chars < MIN_LEN && chars > 0

  // Mutually exclusive speaking logic
  const isAiActive = Boolean(isAiSpeaking)
  const isStudentActive = !isAiActive && phase === PHASES.INTERVIEW

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Top bar */}
        <header className={`${styles.topBar} anim-fade-in`}>
          <div className={styles.roleTag}>
            <span className={styles.roleDot} />
            {role?.label}
          </div>
          <div className={styles.timerTag}>
            ⏱ Time elapsed: {formatTime(seconds)}
          </div>
          <ProgressBar current={questionNumber} />
          <button className={styles.quitBtn} onClick={onEnd}>End</button>
        </header>

        {/* Active Speaker Component */}
        {(phase === PHASES.INTERVIEW || phase === PHASES.LOADING || phase === PHASES.FEEDBACK) && (
          <ActiveSpeaker 
            isAiSpeaking={isAiActive} 
            isStudentSpeaking={isStudentActive} 
            role={role} 
            candidateName={candidateName}
          />
        )}

        {(error || localErr) && (
          <ErrorBanner message={error || localErr} onDismiss={() => setLocalErr(null)} />
        )}

        {/* Loading */}
        {(isLoading || isReportLoading) && (
          <div className={styles.loadingState}>
            <LoadingSpinner
              label={isReportLoading ? 'Building your report…' : 'Evaluating…'}
              size="lg"
            />
            <p className={styles.loadingHint}>
              {isReportLoading
                ? 'Compiling your full performance summary'
                : 'The AI is analysing your answer and forming the next question'}
            </p>
          </div>
        )}

        {/* Active question */}
        {phase === PHASES.INTERVIEW && (
          <main className={`${styles.main} anim-fade-up`} key={currentQuestion}>

            <div className={styles.questionCard}>
              <div className={styles.questionMeta}>
                <span className={styles.questionBadge}>Question {questionNumber}</span>
              </div>
              <p className={styles.question}>{currentQuestion}</p>
            </div>

            <div className={styles.answerBlock}>
              <div className={styles.textareaWrap}>
                <textarea
                  ref={textareaRef}
                  className={`${styles.textarea} ${isListening ? styles.textareaListening : ''} ${chars > 0 && !isListening ? styles.textareaTyping : ''}`}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && submit()}
                  placeholder="Share your thoughts… be specific, use examples, explain your reasoning."
                  rows={6}
                  disabled={isLoading}
                />
                {isListening && (
                  <div className={styles.listeningBadge}>
                    <span className={styles.listeningDot} /> Recording...
                  </div>
                )}
              </div>

              <div className={styles.answerMeta}>
                <span className={`${styles.charCount} ${tooShort ? styles.charCountWarn : ''}`}>
                  {chars} chars{tooShort ? ` · ${MIN_LEN - chars} more needed` : ''}
                </span>
                <span className={styles.shortcutHint}>⌘↵ to submit</span>
              </div>

              {speechErr && <p className={styles.speechErr}>{speechErr}</p>}
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ''}`}
                onClick={toggleVoice}
                title={isListening ? 'Stop' : 'Voice input'}
              >
                <span>{isListening ? '■' : '🎤'}</span>
                {isListening ? 'Stop' : 'Voice'}
              </button>

              <button
                className={styles.submitBtn}
                onClick={submit}
                disabled={isLoading || chars < MIN_LEN}
              >
                Submit answer
                <span className={styles.submitArrow}>→</span>
              </button>
            </div>
          </main>
        )}

        {/* Feedback */}
        {isFeedback && pendingFeedback && (
          <div className={`${styles.feedbackState} anim-fade-up`}>
            <div className={styles.feedbackHeader}>
              <h2 className={styles.feedbackTitle}>
                Here's your feedback
              </h2>
              <p className={styles.feedbackSub}>
                Review this, then continue to your next adaptive question.
              </p>
            </div>

            <FeedbackCard feedback={pendingFeedback} defaultOpen />

            <button className={styles.continueBtn} onClick={onContinue}>
              Continue to Question {questionNumber + 1}
              <span>→</span>
            </button>
          </div>
        )}

        {/* Live Camera Widget */}
        <CameraWidget candidateName={candidateName} />
      </div>
    </div>
  )
}
