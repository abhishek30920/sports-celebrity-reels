"use client"

import type React from "react"
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
  
  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch((err) => console.error("Error playing video:", err))
      setIsPlaying(true)
    } else {
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }, [isActive])
  
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const { currentTime, duration } = videoRef.current
        setProgress((currentTime / duration) * 100)
      }
    }
    
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener("timeupdate", updateProgress)
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", updateProgress)
      }
    }
  }, [])
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => console.error("Error playing video:", err))
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  // Handle touch events for mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartY = e.touches[0].clientY
    
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY
      const diff = touchStartY - touchY
      
      // Threshold for swipe detection
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe up - next video
          onNext()
        } else {
          // Swipe down - previous video
          onPrevious()
        }
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
    
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)
  }
  
  return (
    <div 
      className={`h-screen w-full relative snap-start ${!isActive ? 'opacity-80' : 'opacity-100'}`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onClick={togglePlayPause}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-10">
        <div 
          className="h-full bg-white" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
      />
      
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
        <p className="text-white/80 text-sm">{video.description}</p>
      </div>
      
      <ReelControls
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
        likes={video.likes || 0}
        shares={video.shares || 0}
      />

      {/* Desktop scroll hint */}
      <div className="hidden md:block absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white text-opacity-60 text-sm animate-pulse">
        <p>Scroll to navigate</p>
      </div>
    </div>
  )
}