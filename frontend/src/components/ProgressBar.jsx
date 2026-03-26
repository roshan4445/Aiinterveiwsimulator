/**
 * ProgressBar — shows interview progress as segmented dots
 */

import styles from './ProgressBar.module.css'

export default function ProgressBar({ current }) {
  return (
    <div className={styles.root} role="status">
      <span className={styles.label} style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink-500)' }}>
        Question {current}
      </span>
    </div>
  )
}
