"use client"

import { useState, useRef, useEffect } from "react"
import { ReelControls } from "./reel-controls"
import type { Video } from "@/types/video"
import { useMobile } from "@/hooks/use-mobile"

interface ReelItemProps {
  video: Video
  isActive: boolean
  onNext: () => void
  onPrevious: () => void
}

export function ReelItem({ video, isActive, onNext, onPrevious }: ReelItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useMobile()

  // Control playback when video becomes active/inactive
  useEffect(() => {
    const vid = videoRef.current
    if (vid) {
      vid.onplay = () => console.log("Playing", video.title)
      vid.onpause = () => console.log("Paused", video.title)
      vid.onvolumechange = () => console.log("Volume changed", vid.muted)
    }
  }, [])
  

  // Track playback progress
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    const updateProgress = () => {
      if (vid.duration > 0) {
        setProgress((vid.currentTime / vid.duration) * 100)
      }
    }

    vid.addEventListener("timeupdate", updateProgress)
    return () => {
      vid.removeEventListener("timeupdate", updateProgress)
    }
  }, [])

  const togglePlayPause = () => {
    const vid = videoRef.current
    if (!vid) return

    if (isPlaying) {
      vid.pause()
    } else {
      vid.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  // Swipe detection (optimized)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const deltaY = touchStartY.current - e.changedTouches[0].clientY

    // Only trigger swipe if active
    if (Math.abs(deltaY) > 50 && isActive) {
      deltaY > 0 ? onNext() : onPrevious()
    }

    touchStartY.current = null
  }

  return (
    <div
      className={`h-screen w-full relative snap-start transition-opacity duration-200 ${!isActive ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onClick={togglePlayPause}
    >
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-10">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>

      {/* Video */}
      <video
  ref={videoRef}
  src={video.url}
  className="absolute inset-0 w-full h-full object-cover"
  loop
  playsInline
  muted={!isActive} // 🔥 Only muted when inactive
  preload="metadata"
/>


      {/* Caption */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
        <p className="text-white/80 text-sm">{video.description}</p>
      </div>

      {/* Controls */}
      <ReelControls
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
        likes={video.likes || 0}
        shares={video.shares || 0}
      />

      {/* Scroll hint */}
      <div className="hidden md:block absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white text-opacity-60 text-sm animate-pulse">
        <p>Scroll to navigate</p>
      </div>
    </div>
  )
}

