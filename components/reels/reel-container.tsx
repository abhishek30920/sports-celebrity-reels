"use client"

import { useState, useEffect, useRef } from "react"
import { ReelItem } from "./reel-item"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Video } from "@/types/video"

export function ReelContainer() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/videos")
        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }
        const data = await response.json()
        setVideos(data.videos)
      } catch (error) {
        console.error("Error fetching videos:", error)
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

  useEffect(() => {
    if (containerRef.current && videos.length > 0) {
      const videoHeight = containerRef.current.clientHeight
      containerRef.current.scrollTo({
        top: currentIndex * videoHeight,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, videos.length])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (timeout) return

      timeout = setTimeout(() => {
        if (containerRef.current) {
          const scrollPosition = containerRef.current.scrollTop
          const videoHeight = containerRef.current.clientHeight
          const newIndex = Math.round(scrollPosition / videoHeight)

          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
            setCurrentIndex(newIndex)
          }

          timeout = null
        }
      }, 100)
    }

    const container = containerRef.current
    if (container) container.addEventListener('scroll', handleScroll)

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll)
      if (timeout) clearTimeout(timeout)
    }
  }, [currentIndex, videos.length])

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

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
      <div className="flex h-screen flex-col items-center justify-center text-center p-4">
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
      className="h-screen w-full overflow-y-auto overflow-x-hidden relative bg-black snap-y snap-mandatory scrollbar-hide"
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
