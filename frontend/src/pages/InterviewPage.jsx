import { useState, useRef, useEffect, useCallback } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import { PHASES } from '../services/useInterview'
import styles from './InterviewPage.module.css'

const MIN_LEN = 20

// Premium SVG Icons
const MicIcon = ({sz="20", cl="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
const MicOffIcon = ({sz="20", cl="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
const CameraIcon = ({sz="20", cl="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
const CameraOffIcon = ({sz="20", cl="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"/><path d="M23 7l-7 5 7 5V7z"/><line x1="1" x2="23" y1="1" y2="23"/><path d="M11 5h3a2 2 0 0 1 2 2v3"/></svg>
const SettingsIcon = ({sz="20", cl="currentColor"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
const LineChartIcon = ({sz="22", cl="#4F9CF9"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
const BulbIcon = ({sz="22", cl="#f59e0b"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
const CheckIcon = ({sz="16", cl="#10b981"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ClockIcon = ({sz="18", cl="#9ca3af"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const CpuIcon = ({sz="20", cl="#4F9CF9"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>

// Calculates filler words in real-time
const countFillerWords = (text) => {
  const fillers = ["um", "uh", "like", "you know", "basically", "literally", "so yeah"]
  const lower = text.toLowerCase()
  return fillers.reduce((acc, word) => {
    const matches = lower.match(new RegExp(`\\b${word}\\b`, 'g'))
    return acc + (matches ? matches.length : 0)
  }, 0)
}

export default function InterviewPage({
  phase, role, candidateName, currentQuestion, questionNumber, totalQuestions,
  acknowledgment, error, onSubmit, onContinue, onRestart, onEnd, isAiSpeaking, sessions
}) {
  const [answer, setAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechErr, setSpeechErr] = useState('')
  const [localErr, setLocalErr] = useState(null)
  
  // Timer state
  const [seconds, setSeconds] = useState(0)

  // Camera State
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Typing effect state
  const [displayedQuestion, setDisplayedQuestion] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const isLoading = phase === PHASES.LOADING
  const isReportLoading = phase === PHASES.REPORT_LOADING

  const isAiActive = Boolean(isAiSpeaking)
  const isStudentActive = !isAiActive && isListening

  // ── Camera Logic
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported')
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraError('')
    } catch (err) {
      setCameraError('Camera access denied')
      setIsCameraOn(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera()
      setIsCameraOn(false)
    } else {
      setIsCameraOn(true)
      startCamera()
    }
  }

  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    }
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (phase === PHASES.INTERVIEW) {
      textareaRef.current?.focus()
    }
  }, [phase, currentQuestion])

  // ── Typing Effect
  useEffect(() => {
    if (phase === PHASES.INTERVIEW && currentQuestion) {
      setDisplayedQuestion('')
      setIsTyping(true)
      
      let index = 0
      const typingSpeed = 30 // ms per character
      
      const intervalId = setInterval(() => {
        setDisplayedQuestion(currentQuestion.slice(0, index + 1))
        index++
        if (index >= currentQuestion.length) {
          clearInterval(intervalId)
          setIsTyping(false)
        }
      }, typingSpeed)
      
      return () => clearInterval(intervalId)
    } else {
      setDisplayedQuestion('')
      setIsTyping(false)
    }
  }, [phase, currentQuestion])

  // ── Timer
  useEffect(() => {
    if (phase === PHASES.INTERVIEW && !isLoading) {
      setSeconds(0)
      const interval = setInterval(() => setSeconds(s => s + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [phase, currentQuestion, isLoading])

  useEffect(() => {
    if (phase === PHASES.INTERVIEW) { setAnswer(''); setLocalErr(null); setSpeechErr('') }
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

  // ── Speech Recognition
  const initRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSpeechErr('Speech recognition not supported.'); return null }
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
    setLocalErr(null)
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current = initRecognition()
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      }
    }
  }

  const chars = answer.length
  
  const aiImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(role?.label || 'AI')}&background=0f172a&color=4F9CF9&size=200`

  // Map stage to category name
  const categoryMap = {
    intro: 'Behavioral',
    resume: 'Experience',
    role_core: 'Technical Core',
    pressure: 'Problem Solving',
    final: 'Closing'
  }
  const currentCategory = categoryMap[sessions?.length > 0 && phase === PHASES.INTERVIEW ? sessions[sessions.length-1]?.stage || 'intro' : 'intro'] || 'Technical'

  // Progress Bar
  const completionPercent = (questionNumber / totalQuestions) * 100

  // Real-time Metrics
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }
  
  const words = answer.trim().split(/\s+/).filter(w => w.length > 0).length
  const wpm = seconds > 10 ? Math.round((words / seconds) * 60) : 0
  const fillerCount = countFillerWords(answer)

  if (isLoading || isReportLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <LoadingSpinner size="lg" label={isReportLoading ? 'Generating Full Analysis...' : 'Processing response...'} />
            <p className={styles.loadingHint}>
              {isReportLoading ? 'Compiling your full performance summary' : 'AI Interviewer is preparing the next question'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Progress calculations from real backend feedback context
  const prevSession = sessions?.length > 0 ? sessions[sessions.length - 1] : null
  const prevFeedback = prevSession?.feedback || null

  const rawRating = prevFeedback?.rating || 0
  
  // Mock 'Confidence/Clarity' slightly derived from the single rating provided by the AI
  const confidenceScore = prevFeedback ? Math.min(100, Math.max(0, rawRating * 10 + 5)) : 0
  const clarityScore = prevFeedback ? Math.min(100, Math.max(0, rawRating * 10 - 5)) : 0

  const buildSuggestions = () => {
    if (!prevFeedback) return []
    const suggs = []
    if (prevFeedback.strengths?.length > 0) {
      suggs.push({ text: prevFeedback.strengths[0], type: 'good' })
    }
    if (prevFeedback.weaknesses?.length > 0) {
      suggs.push({ text: prevFeedback.weaknesses[0], type: 'warn' })
    }
    if (prevFeedback.strengths?.length > 1) {
      suggs.push({ text: prevFeedback.strengths[1], type: 'good' })
    }
    if (suggs.length < 3 && prevFeedback.improved_answer) {
      suggs.push({ text: "Tip: " + prevFeedback.improved_answer.substring(0, 80) + "...", type: 'tip' })
    }
    return suggs
  }

  const activeSuggestions = buildSuggestions()

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Top Bar ── */}
        <header className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.brandWrap}>
              <div className={styles.logoIcon}>
                <CpuIcon />
              </div>
              <div>AI<span className={styles.brandAccent}>Interviewer</span></div>
            </div>
            <div className={styles.roleTag}>
              {role?.label || 'Software Engineer'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.questionCount}>
              Question {questionNumber} of {totalQuestions}
            </div>
            <button className={styles.quitBtn} onClick={onEnd}>End</button>
          </div>
          <div className={styles.topProgressTrack}>
            <div className={styles.topProgressFill} style={{width: `${completionPercent}%`}} />
          </div>
        </header>

        {(error || localErr || speechErr) && (
          <div className={styles.errorBanner}>{error || localErr || speechErr}</div>
        )}

        {/* ── 3-Column Main Grid ── */}
        {phase === PHASES.INTERVIEW && (
          <div className={styles.mainGrid}>
            
            {/* LEFT PANEL: Interviewer */}
            <div className={`${styles.card} ${styles.leftPanel}`}>
              <div className={styles.aiAvatarWrap}>
                <img src={aiImage} alt="AI Avatar" className={styles.aiAvatar} />
              </div>
              <div className={styles.aiName}>AI Interviewer</div>
              <div className={styles.aiRole}>{role?.label || 'Backend Specialist'}</div>

              <div className={styles.statusIndicator}>
                {isLoading ? (
                  <>
                    <span className={`${styles.glowDot} ${styles.glowDotAiSpeaking}`} style={{background: '#f59e0b', boxShadow: '0 0 12px #f59e0b'}} />
                    Thinking...
                  </>
                ) : (
                  <>
                    <span className={`${styles.glowDot} ${isAiActive ? styles.glowDotAiSpeaking : styles.glowDotListening}`} />
                    {isAiActive ? 'Speaking...' : 'Listening...'}
                  </>
                )}
              </div>
            </div>

            {/* CENTER PANEL: Main Focus (Q&A) */}
            <div className={`${styles.card} ${styles.centerPanel}`}>
              <div>
                <span className={styles.categoryTag}>{currentCategory}</span>
                <h2 className={styles.questionHighlight}>
                  {displayedQuestion ? (
                    <>
                      {displayedQuestion}
                      {isTyping && <span className={styles.typingCursor}>|</span>}
                    </>
                  ) : (
                    currentQuestion || "I'm ready for your answer."
                  )}
                </h2>
                <div className={styles.questionHint}>
                  Provide details and examples. Structure your answer clearly.
                </div>
              </div>

              <textarea
                ref={textareaRef}
                className={styles.inputArea}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer or use your microphone..."
                disabled={isAiActive}
              />

              <div className={styles.centerActions}>
                <button 
                  className={`${styles.btnPrimary} ${isListening ? styles.btnListening : ''}`}
                  onClick={toggleVoice} 
                  disabled={isAiActive}
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                  {isListening ? 'Stop Recording' : 'Start Speaking'}
                </button>
                <button 
                  className={styles.btnSecondary} 
                  onClick={submit}
                  disabled={isAiActive || (chars < MIN_LEN)}
                >
                  Submit Answer ({chars}/{MIN_LEN})
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Candidate Camera */}
            <div className={`${styles.card} ${styles.rightPanel}`}>
              
              <div className={styles.timerBox}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontWeight: 500}}>
                  <ClockIcon /> Session Time
                </div>
                <div className={styles.timeValue}>{formatTime(seconds)}</div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Speech Pace</div>
                  <div className={styles.metricValue}>
                    {wpm > 0 ? `${wpm} wpm` : '--'}
                  </div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Filler Words</div>
                  <div className={`${styles.metricValue} ${fillerCount > 3 ? styles.metricWarn : styles.metricGood}`}>
                    {fillerCount}
                  </div>
                </div>
              </div>

              <div className={styles.cameraContainer}>
                {isCameraOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className={styles.videoElement} />
                ) : (
                  <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', color: '#9ca3af'}}>
                    {cameraError || 'Camera Disabled'}
                  </div>
                )}
                
                <div className={styles.cameraOverlay}>
                   <div 
                     className={`${styles.circleControl} ${isListening ? '' : styles.controlActive}`} 
                     onClick={toggleVoice}
                   >
                     {isListening ? <MicIcon /> : <MicOffIcon />}
                   </div>
                   <div 
                     className={`${styles.circleControl} ${isCameraOn ? '' : styles.controlActive}`} 
                     onClick={toggleCamera}
                   >
                     {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
                   </div>
                   <div className={styles.circleControl}>
                     <SettingsIcon />
                   </div>
                </div>
              </div>
              
              <div className={styles.statsBox}>
                <div className={styles.statsRow}>
                   <span>Current Audio Level</span>
                   <span className={styles.statsValue}>{isListening ? 'Good' : 'Muted'}</span>
                </div>
                <div className={styles.statsRow}>
                   <span>Connection</span>
                   <span className={styles.statsValue} style={{color: '#10b981'}}>Excellent</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── BOTTOM PANEL: Real-time Feedback Snapshot ── */}
        {phase === PHASES.INTERVIEW && questionNumber > 1 && (
          <div className={styles.bottomSection}>
            <div className={styles.feedbackCard}>
              <div className={styles.feedbackHeader}>
                <LineChartIcon /> Previous Answer Analysis
              </div>
              
              <div className={styles.scoreRow}>
                <div className={styles.scoreLabel}>Confidence</div>
                <div className={styles.scoreBarBg}>
                  <div className={styles.scoreBarFill} style={{width: `${confidenceScore}%`}} />
                </div>
                <div style={{width: '30px', textAlign: 'right', fontSize: '13px', color: '#9ca3af'}}>{confidenceScore}%</div>
              </div>

              <div className={styles.scoreRow}>
                <div className={styles.scoreLabel}>Clarity</div>
                <div className={styles.scoreBarBg}>
                  <div className={styles.scoreBarFill} style={{width: `${clarityScore}%`, background: '#10b981'}} />
                </div>
                <div style={{width: '30px', textAlign: 'right', fontSize: '13px', color: '#9ca3af'}}>{clarityScore}%</div>
              </div>
            </div>

            <div className={styles.feedbackCard}>
              <div className={styles.feedbackHeader}>
                <BulbIcon /> Immediate Suggestions
              </div>
              <div className={styles.suggestionsList}>
                {activeSuggestions.length > 0 ? (
                  activeSuggestions.map((s, i) => (
                    <div key={i} className={styles.suggestionItem}>
                      <div className={styles.suggestionIcon}>
                        {s.type === 'good' ? <CheckIcon /> : <BulbIcon sz="16" cl="#f59e0b" />}
                      </div>
                      <div>{s.text}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.suggestionItem}>
                    <div className={styles.suggestionIcon}><BulbIcon sz="16" cl="#9ca3af" /></div>
                    <div style={{color: '#9ca3af'}}>Waiting for analysis to complete...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
