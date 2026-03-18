/**
 * ErrorBanner — dismissible error message component
 */

import styles from './ErrorBanner.module.css'

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className={`${styles.banner} animate-fade-in`} role="alert">
      <div className={styles.icon} aria-hidden>⚠</div>
      <div className={styles.content}>
        <p className={styles.title}>Something went wrong</p>
        <p className={styles.message}>{message}</p>
        <p className={styles.hint}>
          Make sure the backend is running and your Groq API key is configured.
          The app will use fallback responses in the meantime.
        </p>
      </div>
      {onDismiss && (
        <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      )}
    </div>
  )
}
