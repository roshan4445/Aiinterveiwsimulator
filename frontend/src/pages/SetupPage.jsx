import { useState, useRef } from 'react'
import { parsePdfResume } from '../services/interviewApi'
import styles from './SetupPage.module.css'

// SVGs
const CodeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
const ServerIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
const LayersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>
const CloudIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
const ChartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const MapIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const PenIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
const UploadCloudIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>
const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>

const CpuIcon = ({sz="22", cl="#4F9CF9"}) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={cl} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>

const SmileIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const MehIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

const ROLES = [
  { id: 'frontend',    label: 'Frontend Developer', icon: <CodeIcon />,     description: 'React, Vue, Browser APIs' },
  { id: 'backend',     label: 'Backend Developer',  icon: <ServerIcon />,   description: 'APIs, Databases, System Design' },
  { id: 'fullstack',   label: 'Full Stack',         icon: <LayersIcon />,   description: 'End-to-End Engineering' },
  { id: 'devops',      label: 'DevOps Engineer',    icon: <CloudIcon />,    description: 'CI/CD, Cloud, Infrastructure' },
  { id: 'datascience', label: 'Data Scientist',     icon: <ChartIcon />,    description: 'ML, Statistics, Analytics' },
  { id: 'pm',          label: 'Product Manager',    icon: <MapIcon />,      description: 'Roadmaps, Strategy, Agile' },
  { id: 'hr',          label: 'HR Manager',         icon: <UsersIcon />,    description: 'People Ops, Culture' },
  { id: 'design',      label: 'UI/UX Designer',     icon: <PenIcon />,      description: 'Research, Design Systems' },
]

const PERSONALITIES = [
  { id: 'Friendly', label: 'Friendly', icon: <SmileIcon /> },
  { id: 'Neutral', label: 'Neutral', icon: <MehIcon /> },
  { id: 'Strict', label: 'Strict (FAANG)', icon: <ShieldIcon /> }
]

export default function SetupPage({ onStart, isLoading }) {
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [uploadState, setUploadState] = useState('idle') // idle, uploading, success, error
  const [uploadError, setUploadError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [personality, setPersonality] = useState('Neutral')

  const fileInputRef = useRef(null)

  const processFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a valid PDF file.')
      setUploadState('error')
      return
    }
    setUploadState('uploading')
    setUploadError('')
    try {
      const text = await parsePdfResume(file)
      setResumeText(text)
      setUploadState('success')
    } catch (err) {
      setUploadError(err.message)
      setUploadState('error')
      setResumeText('')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])
  }

  const handleStart = () => {
    if (selected && name && !isLoading) {
      onStart({ role: selected, name, resumeText })
    }
  }

  return (
    <div className={styles.page}>
      
      {/* BRANDING */}
      <div className={styles.brandLocation}>
        <div className={styles.logoIcon}><CpuIcon /></div>
        <div>AI<span className={styles.brandAccent}>Interviewer</span></div>
      </div>

      <div className={styles.glowOrb} />
      
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>
            Practice Real Interviews <br />
            with <span className={styles.titleAccent}>AI</span>
          </h1>
          <p className={styles.subtitle}>
            Experience highly adaptive interviews based on your resume. Get instant, tailored feedback to land your dream role.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={`${styles.step} ${styles.stepActive}`}>
            <span className={styles.stepIcon}>1</span> Profile Info & Role Setting
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>2</span> Interview Loop
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>3</span> Final Assessment
          </div>
        </div>

        <div className={styles.formCard}>
          
          {/* PROFILE INFO & UPLOAD */}
          <div>
            <div className={styles.sectionTitle}>1. Profile Details</div>
            <div className={styles.inputGroup} style={{marginBottom: '20px'}}>
              <label className={styles.label}>What should we call you?</label>
              <input
                type="text"
                className={styles.nameInput}
                placeholder="e.g. John Doe (Required)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Resume Upload (Optional PDF)</label>
              <div 
                className={`${styles.dragDropArea} ${dragActive ? styles.dragDropActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf" 
                  className={styles.fileInputHidden} 
                  onChange={e => processFile(e.target.files[0])} 
                />
                <div className={styles.uploadIcon}>
                  <UploadCloudIcon />
                </div>
                <div className={styles.uploadMainText}>Click to upload or drag and drop</div>
                <div className={styles.uploadSubText}>We personalize the interview questions based on your resume.</div>
              </div>
              
              {uploadState === 'uploading' && <div className={styles.fileStatus} style={{color: '#4F9CF9', background: 'rgba(79, 156, 249, 0.1)'}}>Extracting text from PDF...</div>}
              {uploadState === 'success' && <div className={styles.fileStatus}><CheckCircleIcon /> Resume parsed successfully.</div>}
              {uploadState === 'error' && <div className={styles.fileStatus} style={{color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>✗ {uploadError}</div>}
            </div>
          </div>

          {/* ROLE SETTING */}
          <div style={{marginTop: '16px'}}>
            <div className={styles.sectionTitle}>2. Select Interview Role</div>
            <div className={styles.roleGrid}>
              {ROLES.map(role => (
                <div
                  key={role.id}
                  className={`${styles.roleCard} ${selected?.id === role.id ? styles.roleCardActive : ''}`}
                  onClick={() => setSelected(role)}
                >
                  <div className={styles.roleIconWrap}>{role.icon}</div>
                  <div>
                    <div className={styles.roleTitle}>{role.label}</div>
                    <div className={styles.roleDesc}>{role.description}</div>
                  </div>
                  {selected?.id === role.id && (
                    <div className={styles.checkIndicator}>
                      <CheckCircleIcon />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI PERSONALITY */}
          <div className={styles.inputGroup} style={{marginTop: '16px'}}>
            <div className={styles.sectionTitle}>3. AI Personality Style</div>
            <div className={styles.personalityGrid}>
              {PERSONALITIES.map(mode => (
                <button
                  key={mode.id}
                  className={`${styles.personalityBtn} ${personality === mode.id ? styles.personalityBtnActive : ''}`}
                  onClick={() => setPersonality(mode.id)}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaWrap}>
            <button
              className={styles.startBtn}
              onClick={handleStart}
              disabled={!selected || !name || isLoading}
            >
              {isLoading ? 'Preparing Interview...' : 'Begin Interview'}
              {!isLoading && <span className={styles.btnArrow}>→</span>}
            </button>
            <div className={styles.ctaSubtext}>Start your highly-adaptive AI experience</div>
          </div>

        </div>
      </div>
    </div>
  )
}
