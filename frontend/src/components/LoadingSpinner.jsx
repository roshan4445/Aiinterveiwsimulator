import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ label = 'Thinking…', size = 'md' }) {
  return (
    <div className={`${styles.root} ${styles[size]}`} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="var(--cream-border)" strokeWidth="3" />
          <path d="M40 22c0-9.941-8.059-18-18-18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
