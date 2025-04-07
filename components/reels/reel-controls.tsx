"use client"

import { Heart, Share, Play, Pause } from "lucide-react"
import { useState } from "react"

interface ReelControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  likes: number
  shares: number
}

export function ReelControls({ isPlaying, onPlayPause, onNext, onPrevious, likes, shares }: ReelControlsProps) {
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(likes)
  
  const handleLike = (e: React.MouseEvent) => {
    // Stop event propagation to prevent triggering play/pause
    e.stopPropagation()
    
    if (liked) {
      setLocalLikes(localLikes - 1)
    } else {
      setLocalLikes(localLikes + 1)
    }
    setLiked(!liked)
  }
  
  return (
    <div className="absolute right-4 bottom-20 flex flex-col gap-6 z-10">
      <div className="flex flex-col items-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
          className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
        </button>
      </div>
      
      <button
        onClick={handleLike}
        className="flex flex-col items-center"
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart className={`h-8 w-8 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
        <span className="mt-1 text-white text-sm font-medium">{localLikes}</span>
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (navigator.share) {
            navigator.share({
              title: "Check out this sports celebrity reel!",
              url: window.location.href,
            })
          }
        }}
        className="flex flex-col items-center"
        aria-label="Share"
      >
        <Share className="h-8 w-8 text-white" />
        <span className="mt-1 text-white text-sm font-medium">{shares}</span>
      </button>
    </div>
  )
}