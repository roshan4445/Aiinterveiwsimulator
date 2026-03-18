import { useState, useEffect, useRef } from 'react'
import styles from './CameraWidget.module.css'

export default function CameraWidget({ candidateName }) {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = () => {
    setIsSwitching(true)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
    setIsSwitching(false)
  }

  const startCamera = async () => {
    setIsSwitching(true)
    setErrorMsg('')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported or requires localhost/HTTPS.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      setIsCameraOn(true) 
      
    } catch (err) {
      console.error('[Camera] Error starting stream:', err)
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Camera access denied. Please allow permissions.')
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No camera hardware found on your device.')
      } else {
        setErrorMsg(`Camera failed to start.`)
      }
      setIsCameraOn(false)
    } finally {
      setIsSwitching(false)
    }
  }

  // Once the UI mounts the video element, attach the stream to it
  useEffect(() => {
    if (isCameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOn])

  const toggleCamera = () => {
    if (isSwitching) return
    if (isCameraOn) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  useEffect(() => {
    // Automatically stop camera when unmounted
    return () => stopCamera()
  }, [])

  return (
    <div className={`${styles.container} anim-fade-up`}>
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
              <span className={styles.pulseDot}></span>
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
