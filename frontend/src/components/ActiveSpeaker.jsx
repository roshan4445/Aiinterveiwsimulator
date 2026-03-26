import styles from './ActiveSpeaker.module.css'

export default function ActiveSpeaker({ isAiSpeaking, isStudentSpeaking, role, candidateName }) {
  const aiActive = isAiSpeaking
  const studentActive = isStudentSpeaking

  // Fallback icon for interviewer
  const aiFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(role?.label || 'AI')}&background=c4603a&color=fff&size=128`
  // Student avatar
  const studentFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName || 'You')}&background=b84040&color=fff&size=128`

  return (
    <div className={`${styles.activeSpeakerContainer} anim-fade-down`}>
      {/* AI Interviewer Side */}
      <div className={`${styles.profileBox} ${studentActive && !aiActive ? styles.inactive : ''}`}>
        <div className={styles.avatarContainer}>
          {aiActive && <div className={styles.glowAi} />}
          <img 
            className={styles.avatar} 
            src={aiFallback} 
            alt="AI Interviewer" 
          />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{role?.label || 'AI Interviewer'}</span>
          <span className={`${styles.status} ${aiActive ? styles.statusActiveAi : ''}`}>
            {aiActive ? 'Speaking...' : 'Listening'}
          </span>
          {aiActive && (
            <div className={styles.waveContainer} style={{ margin: '4px 0 0 0', height: '16px' }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className={`${styles.bar} ${styles.barAi}`} />)}
            </div>
          )}
        </div>
      </div>



      {/* Student Side */}
      <div 
        className={`${styles.profileBox} ${aiActive && !studentActive ? styles.inactive : ''}`} 
        style={{ flexDirection: 'row-reverse', textAlign: 'right' }}
      >
        <div className={styles.avatarContainer}>
          {studentActive && <div className={styles.glowStudent} />}
          <img 
            className={styles.avatar} 
            src={studentFallback} 
            alt="You" 
          />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{candidateName || 'You'}</span>
          <span className={`${styles.status} ${studentActive ? styles.statusActiveStudent : ''}`}>
            {studentActive ? 'Speaking...' : 'Listening'}
          </span>
          {studentActive && (
            <div className={styles.waveContainer} style={{ margin: '4px 0 0 0', height: '16px', justifyContent: 'flex-end' }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className={`${styles.bar} ${styles.barStudent}`} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
