import { useMemo } from 'react'
import FeedbackCard from '../components/FeedbackCard'
import RatingRing from '../components/RatingRing'
import LoadingSpinner from '../components/LoadingSpinner'
import { PHASES } from '../services/useInterview'
import styles from './ReportPage.module.css'

const REC = {
  'Strong Hire': { color: '#3a7d5c', bg: '#eaf3ed', border: '#b8d8c8' },
  'Hire':        { color: '#9a6e20', bg: '#f8f2e4', border: '#ddd0b0' },
  'Maybe':       { color: '#c4603a', bg: '#f5ece7', border: '#e8c4b4' },
  'No Hire':     { color: '#b84040', bg: '#f5eaea', border: '#ddc0c0' },
}

function ScoreBar({ label, value }) {
  const pct = (value / 10) * 100
  const color = value >= 8 ? '#3a7d5c' : value >= 6 ? '#9a6e20' : '#b84040'
  return (
    <div className={styles.scoreBarRow}>
      <span className={styles.scoreBarLabel}>{label}</span>
      <div className={styles.scoreBarTrack}>
        <div className={styles.scoreBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.scoreBarVal} style={{ color }}>{value}/10</span>
    </div>
  )
}

function MetricBar({ label, value }) {
  const safeVal = value || 0
  const pct = (safeVal / 10) * 100
  const color = safeVal >= 8 ? '#3a7d5c' : safeVal >= 6 ? '#9a6e20' : '#b84040'
  return (
    <div className={styles.metricBarRow}>
      <span className={styles.metricBarLabel}>{label}</span>
      <div className={styles.scoreBarTrack}>
        <div className={styles.scoreBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.scoreBarVal} style={{ color }}>{safeVal}/10</span>
    </div>
  )
}

export default function ReportPage({ phase, role, sessions, report, onRestart }) {
  const isLoading = phase === PHASES.REPORT_LOADING

  const avgScore = useMemo(() => {
    const r = sessions.map(s => s.feedback?.rating || 0)
    return r.length ? +(r.reduce((a, b) => a + b, 0) / r.length).toFixed(1) : 0
  }, [sessions])

  const rec = report?.hiring_recommendation || 'Maybe'
  const recCfg = REC[rec] || REC['Maybe']

  if (isLoading) {
    return (
      <div className={styles.loadingPage}>
        <LoadingSpinner label="Compiling your report…" size="lg" />
        <p className={styles.loadingHint}>Synthesising all feedback into a final assessment</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Hero */}
        <div className="anim-fade-up">
          <div className={styles.heroTop}>
            <div className={styles.heroMeta}>
              <span className={styles.heroBadge}>Complete</span>
              <span className={styles.heroRole}>{role?.label}</span>
            </div>
            <button className={styles.restartBtn} onClick={onRestart}>↺ New Interview</button>
          </div>
          <h1 className={styles.heroTitle}>Your Report</h1>
        </div>

        {/* Score overview */}
        <div className={`${styles.scoreCard} anim-fade-up`} style={{ animationDelay: '0.07s' }}>
          <div className={styles.scoreLeft}>
            <RatingRing rating={avgScore} size={96} />
            <div className={styles.scoreInfo}>
              <p className={styles.scoreLabel}>Average Score</p>
              <p className={styles.scoreDesc}>{sessions.length} questions answered</p>
            </div>
          </div>
          <div className={styles.scoreRight}>
            {sessions.map((s, i) => (
              <ScoreBar key={i} label={`Q${i + 1}`} value={s.feedback?.rating || 0} />
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {report && !report.fallback && (
          <div className={`${styles.summaryCard} anim-fade-up`} style={{ animationDelay: '0.14s' }}>
            <div className={styles.summaryHead}>
              <span className={styles.summaryDot} />
              <span className={styles.summaryTitle}>AI Assessment</span>
            </div>
            <p className={styles.summaryText}>{report.overall_assessment}</p>
            <div
              className={styles.recBadge}
              style={{ background: recCfg.bg, borderColor: recCfg.border }}
            >
              <span className={styles.recLabel}>Recommendation</span>
              <span className={styles.recValue} style={{ color: recCfg.color }}>{rec}</span>
              {report.recommendation_reason && (
                <p className={styles.recReason}>{report.recommendation_reason}</p>
              )}
            </div>
          </div>
        )}

        {/* Competency Metrics Block */}
        {report?.metrics && !report.fallback && (
          <div className={`${styles.summaryCard} anim-fade-up`} style={{ animationDelay: '0.17s' }}>
            <div className={styles.summaryHead}>
              <span className={styles.summaryDot} style={{ background: '#9a6e20' }} />
              <span className={styles.summaryTitle}>Competency Evaluation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <MetricBar label="Technical Knowledge" value={report.metrics.technical_knowledge} />
              <MetricBar label="Communication" value={report.metrics.communication} />
              <MetricBar label="Problem Solving" value={report.metrics.problem_solving} />
              <MetricBar label="Confidence" value={report.metrics.confidence} />
            </div>
          </div>
        )}

        {/* Strengths / Improvements */}
        {report && !report.fallback && (
          <div className={`${styles.insightGrid} anim-fade-up`} style={{ animationDelay: '0.20s' }}>
            <div className={`${styles.insightPanel} ${styles.insightGreen}`}>
              <p className={styles.insightLabel}>✓ Top Strengths</p>
              <ul className={styles.insightList}>
                {report.top_strengths?.map((s, i) => <li key={i} className={styles.insightItem}>{s}</li>)}
              </ul>
            </div>
            <div className={`${styles.insightPanel} ${styles.insightRed}`}>
              <p className={styles.insightLabel}>◦ To Improve</p>
              <ul className={styles.insightList}>
                {report.areas_to_improve?.map((a, i) => <li key={i} className={styles.insightItem}>{a}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Study plan */}
        {report?.study_plan && !report.fallback && (
          <div className={`${styles.studyPlan} anim-fade-up`} style={{ animationDelay: '0.26s' }}>
            <p className={styles.studyTitle}>Recommended Study Plan</p>
            <div className={styles.studyItems}>
              {report.study_plan.map((item, i) => (
                <div key={i} className={styles.studyItem}>
                  <span className={styles.studyNum}>0{i + 1}</span>
                  <span className={styles.studyText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        <div className="anim-fade-up" style={{ animationDelay: '0.30s' }}>
          <h2 className={styles.breakdownTitle}>Question Breakdown</h2>
        </div>
        <div className={`${styles.sessionList} anim-fade-up`} style={{ animationDelay: '0.34s' }}>
          {sessions.map((s, i) => (
            <div key={i} className={styles.sessionItem}>
              <div className={styles.sessionMeta}>
                <span className={styles.sessionNum}>Q{i + 1}</span>
                <p className={styles.sessionAnswer}>
                  <span className={styles.sessionAnswerLabel}>Your answer: </span>
                  {s.answer.length > 180 ? s.answer.slice(0, 180) + '…' : s.answer}
                </p>
              </div>
              <FeedbackCard feedback={s.feedback} question={s.question} defaultOpen={i === 0} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`${styles.cta} anim-fade-up`} style={{ animationDelay: '0.38s' }}>
          <button className={styles.ctaBtn} onClick={onRestart}>Start a New Interview →</button>
          <p className={styles.ctaHint}>Try a different role or practice this one again</p>
        </div>

      </div>
    </div>
  )
}
