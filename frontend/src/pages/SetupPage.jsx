import { useState } from 'react'
import { parsePdfResume } from '../services/interviewApi'
import styles from './SetupPage.module.css'

const ROLES = [
  { id: 'frontend',    label: 'Frontend Dev',      icon: '◈', description: 'React, CSS, browser APIs' },
  { id: 'backend',     label: 'Backend Dev',        icon: '⬡', description: 'APIs, databases, systems' },
  { id: 'fullstack',   label: 'Full Stack',         icon: '◎', description: 'End-to-end engineering' },
  { id: 'devops',      label: 'DevOps Engineer',    icon: '⬢', description: 'CI/CD, cloud infra' },
  { id: 'datascience', label: 'Data Scientist',     icon: '◇', description: 'ML, stats, analytics' },
  { id: 'pm',          label: 'Product Manager',    icon: '◐', description: 'Roadmaps & strategy' },
  { id: 'hr',          label: 'HR Manager',         icon: '◉', description: 'People ops & culture' },
  { id: 'design',      label: 'UI/UX Designer',     icon: '◑', description: 'Research & systems' },
]

export default function SetupPage({ onStart, isLoading }) {
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) { setResumeText(''); return }
    setUploadingResume(true)
    setUploadError('')
    try {
      const text = await parsePdfResume(file)
      setResumeText(text)
    } catch (err) {
      setUploadError(err.message)
      setResumeText('')
    } finally {
      setUploadingResume(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Eyebrow badge */}
        <div className={`${styles.eyebrowWrap} anim-fade-up`}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            AI-Powered Interview Simulator
          </span>
        </div>

        {/* Hero */}
        <div className={`${styles.header} anim-fade-up`} style={{ animationDelay: '0.06s' }}>
          <h1 className={styles.title}>
            Ace your<br />next<br />
            <span className={styles.titleAccent}>interview.</span>
          </h1>
          <p className={styles.subtitle}>
            Answer adaptive questions, get instant AI feedback,<br />
            and land your dream role.
          </p>
        </div>

        {/* Name + Resume */}
        <div className={`${styles.inputsSection} anim-fade-up`} style={{ animationDelay: '0.12s' }}>
          <input
            id="candidate-name"
            type="text"
            className={styles.nameInput}
            placeholder="Your Name (Required)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className={styles.fileUploadWrapper}>
            <p className={styles.uploadLabel}>Upload resume (Optional PDF for personalized questions)</p>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              className={styles.fileInput}
              onChange={handleFileUpload}
              disabled={uploadingResume}
            />
            {uploadingResume && <p className={styles.fileStatusTxt}>Extracting text from PDF...</p>}
            {resumeText && !uploadingResume && <p className={styles.fileStatusTxtGreen}>✓ Resume extracted successfully.</p>}
            {uploadError && <p className={styles.fileStatusTxtRed}>✗ {uploadError}</p>}
          </div>
        </div>

        {/* Role picker */}
        <div className="anim-fade-up" style={{ animationDelay: '0.18s' }}>
          <p className={styles.sectionLabel}>01 — Choose your interview role</p>
          <div className={styles.grid}>
            {ROLES.map(role => (
              <button
                key={role.id}
                id={`role-${role.id}`}
                className={`${styles.roleCard} ${selected?.id === role.id ? styles.roleCardActive : ''}`}
                onClick={() => setSelected(role)}
              >
                <span className={styles.roleIcon}>{role.icon}</span>
                <span className={styles.roleLabel}>{role.label}</span>
                <span className={styles.roleDesc}>{role.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`${styles.cta} anim-fade-up`} style={{ animationDelay: '0.24s' }}>
          <button
            id="begin-interview-btn"
            className={styles.startBtn}
            onClick={() => selected && name && !isLoading && onStart({ role: selected, name, resumeText })}
            disabled={!selected || !name || isLoading}
          >
            {isLoading ? (
              <span className={styles.btnLoader}>
                <span className={styles.btnDot} /> Preparing…
              </span>
            ) : (
              <>
                Begin Interview
                {selected && <span className={styles.btnArrow}>→</span>}
              </>
            )}
          </button>
          <p className={styles.ctaHint}>
            adaptive questions
            <span className={styles.ctaDivider}>·</span>
            instant feedback
            <span className={styles.ctaDivider}>·</span>
            full report
          </p>
        </div>

      </div>
    </div>
  )
}
