"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ReelItem } from "./reel-item"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import type { Video } from "@/types/video"

export function ReelContainer() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos")
        if (!res.ok) throw new Error("Failed to fetch videos")
        const data = await res.json()
        setVideos(data.videos)
      } catch (err) {
        console.error(err)
        toast({
          title: "Error",
          description: "Failed to load videos. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [toast])

  // Smooth scroll for desktop only
  useEffect(() => {
    if (!isMobile && containerRef.current && videos.length > 0) {
      const container = containerRef.current
      const videoHeight = container.clientHeight
      container.scrollTo({
        top: currentIndex * videoHeight,
        behavior: "smooth",
      })
    }
  }, [currentIndex, videos.length, isMobile])

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (container) {
            const scrollPos = container.scrollTop
            const height = container.clientHeight
            const newIndex = Math.round(scrollPos / height)

            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
              setCurrentIndex(newIndex)
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    if (container && !isMobile) {
      container.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (container && !isMobile) {
        container.removeEventListener("scroll", handleScroll)
      }
    }
  }, [currentIndex, videos.length, isMobile])

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, videos.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading reels...</span>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-4">
        <div className="rounded-lg bg-muted p-6 shadow-md">
          <h3 className="mb-2 text-2xl font-bold">No videos available</h3>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    )
  }

  return (
    <div 
    ref={containerRef}
    className="h-screen w-full overflow-y-scroll snap-y snap-mandatory relative bg-black scrollbar-hide"
  >
    {videos.map((video, index) => (
      <ReelItem
        key={video.id}
        video={video}
        isActive={index === currentIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    ))}
  </div>
  
  )
}
