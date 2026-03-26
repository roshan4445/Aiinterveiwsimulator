import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './CameraWidget.module.css'

export default function CameraWidget({ candidateName }) {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // ── Drag state ────────────────────────────────────────────────────────────
  const [pos, setPos] = useState({ x: null, y: null })   // null = use CSS default (bottom-right)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // ── Camera logic ──────────────────────────────────────────────────────────
  const stopCamera = () => {
    setIsSwitching(true)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraOn(false)
    setIsSwitching(false)
  }

  const startCamera = async () => {
    setIsSwitching(true)
    setErrorMsg('')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        throw new Error('getUserMedia is not supported or requires localhost/HTTPS.')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      setIsCameraOn(true)
    } catch (err) {
      if (err.name === 'NotAllowedError') setErrorMsg('Camera access denied. Please allow permissions.')
      else if (err.name === 'NotFoundError') setErrorMsg('No camera hardware found on your device.')
      else setErrorMsg('Camera failed to start.')
      setIsCameraOn(false)
    } finally {
      setIsSwitching(false)
    }
  }

  useEffect(() => {
    if (isCameraOn && videoRef.current && streamRef.current)
      videoRef.current.srcObject = streamRef.current
  }, [isCameraOn])

  useEffect(() => () => stopCamera(), [])

  const toggleCamera = () => {
    if (isSwitching || isDragging) return
    if (isCameraOn) stopCamera(); else startCamera()
  }

  // ── Mouse drag ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return   // don't drag on button clicks
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      const W = containerRef.current?.offsetWidth || 240
      const H = containerRef.current?.offsetHeight || 300
      setPos({
        x: Math.max(8, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - W - 8)),
        y: Math.max(8, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - H - 8)),
      })
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [isDragging])

  // ── Touch drag ────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    if (e.target.closest('button')) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const W = containerRef.current?.offsetWidth || 240
      const H = containerRef.current?.offsetHeight || 300
      setPos({
        x: Math.max(8, Math.min(touch.clientX - dragOffset.current.x, window.innerWidth - W - 8)),
        y: Math.max(8, Math.min(touch.clientY - dragOffset.current.y, window.innerHeight - H - 8)),
      })
    }
    const onEnd = () => setIsDragging(false)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [isDragging])

  // ── Inline position style (only set once user has dragged) ────────────────
  const posStyle = pos.x !== null
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {}

  return (
    <div
      ref={containerRef}
      className={`${styles.container} anim-fade-in ${isDragging ? styles.dragging : ''}`}
      style={posStyle}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* ── Drag handle dots ── */}
      <div className={styles.dragHandle}>
        <span /><span /><span /><span /><span /><span />
      </div>

      <div className={styles.videoWrapper}>
        {isCameraOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`${styles.videoElement} ${styles.fadeIn}`}
            />
            <div className={styles.liveIndicator}>
              <span className={styles.pulseDot} />
            </div>
          </>
        ) : (
          <div className={`${styles.placeholder} ${styles.fadeIn}`}>
            {errorMsg ? (
              <span className={styles.errorText}>✗ {errorMsg}</span>
            ) : (
              <div className={styles.avatarPlaceholder}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName || 'You')}&background=b84040&color=fff&size=256&font-size=0.4`}
                  alt={candidateName || 'You'}
                  className={styles.avatarImg}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className={`${styles.toggleBtn} ${isCameraOn ? styles.onState : styles.offState}`}
        onClick={toggleCamera}
        disabled={isSwitching}
      >
        {isSwitching ? 'Switching...' : isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
      </button>
    </div>
  )
}
