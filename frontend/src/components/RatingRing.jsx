import styles from './RatingRing.module.css'

function getRatingMeta(rating) {
  if (rating >= 8) return { stroke: '#3a7d5c', text: '#3a7d5c', label: 'Excellent' }
  if (rating >= 6) return { stroke: '#9a6e20', text: '#9a6e20', label: 'Good' }
  if (rating >= 4) return { stroke: '#c4603a', text: '#c4603a', label: 'Fair' }
  return { stroke: '#b84040', text: '#b84040', label: 'Needs Work' }
}

export default function RatingRing({ rating, size = 88 }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const prog = (rating / 10) * circ
  const { stroke, text, label } = getRatingMeta(rating)

  return (
    <div className={styles.root} style={{ width: size, height: size }}>
      <svg viewBox="0 0 88 88" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--cream-border)" strokeWidth="5" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={stroke} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
          className={styles.ring}
        />
      </svg>
      <div className={styles.inner}>
        <span className={styles.score} style={{ color: text }}>{rating}</span>
        <span className={styles.max}>/10</span>
      </div>
      <div className={styles.label} style={{ color: text }}>{label}</div>
    </div>
  )
}
