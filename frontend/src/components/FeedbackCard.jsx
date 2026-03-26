/**
 * FeedbackCard — displays structured AI feedback for one answer
 * Used both inline during interview (after submit) and on the Report page.
 */

import { useState } from 'react'
import RatingRing from './RatingRing'
import styles from './FeedbackCard.module.css'

export default function FeedbackCard({ feedback, question, answer, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!feedback) return null

  return (
    <div className={`${styles.card} animate-fade-up`}>
      {/* Header - always visible */}
      <button
        className={styles.header}
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.headerLeft}>
          <RatingRing rating={feedback.rating} size={72} />
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>AI Feedback</span>
            <span className={styles.headerSub}>
              {isOpen ? 'Click to collapse' : 'Click to expand'}
            </span>
          </div>
        </div>
        <span className={styles.chevron} aria-hidden>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div className={styles.body}>
          {/* Question context (used in Report page) */}
          {question && (
            <div className={styles.questionContext}>
              <span className={styles.contextLabel}>Question</span>
              <p className={styles.contextText}>{question}</p>
            </div>
          )}

          {/* Strengths + Weaknesses */}
          <div className={styles.grid}>
            <div className={`${styles.panel} ${styles.panelGreen}`}>
              <p className={styles.panelLabel}>✓ Strengths</p>
              <ul className={styles.list}>
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className={styles.listItem}>{s}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.panel} ${styles.panelRed}`}>
              <p className={styles.panelLabel}>◦ To Improve</p>
              <ul className={styles.list}>
                {feedback.weaknesses?.map((w, i) => (
                  <li key={i} className={styles.listItem}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improved Answer */}
          <div className={styles.improvedBlock}>
            <p className={styles.improvedLabel}>✦ Model Answer</p>
            <blockquote className={styles.improvedText}>
              {feedback.improved_answer}
            </blockquote>
          </div>
        </div>
      )}
    </div>
  )
}
