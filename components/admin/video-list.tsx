"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw, Trash2, ExternalLink, AlertCircle, Film } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Video } from "@/types/video"
import { Badge } from "@/components/ui/badge"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Ref to hold the latest videos
  const videosRef = useRef<Video[]>([])
  
  // Update the ref whenever videos changes
  useEffect(() => {
    videosRef.current = videos
  }, [videos])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/videos")
      if (!response.ok) {
        throw new Error("Failed to fetch videos")
      }
      const data = await response.json()
      setVideos(data.videos)
      
      // Show toast for newly processed videos
      const previousVideos = videosRef.current
      const newlyCompleted = data.videos.filter(
        (video: Video) => 
          video.status === "completed" && 
          previousVideos.some(v => v.id === video.id && v.status === "processing")
      )
      
      if (newlyCompleted.length > 0) {
        newlyCompleted.forEach((video: Video) => {
          toast({
            title: "Video Processing Complete",
            description: `"${video.title}" is ready to view.`,
            variant: "default",
          })
        })
      }
      
      // Check for failed videos
      const newlyFailed = data.videos.filter(
        (video: Video) => 
          video.status === "failed" && 
          previousVideos.some(v => v.id === video.id && v.status === "processing")
      )
      
      if (newlyFailed.length > 0) {
        newlyFailed.forEach((video: Video) => {
          toast({
            title: "Video Processing Failed",
            description: `"${video.title}" could not be processed.`,
            variant: "destructive",
          })
        })
      }
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

  // Set up polling only once on mount
  useEffect(() => {
    // Fetch videos initially
    fetchVideos()

    const pollingInterval = setInterval(() => {
      // Check the latest videos state using the ref
      if (videosRef.current.some((video) => video.status === "processing")) {
        fetchVideos()
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollingInterval)
  }, []) // Empty dependency array ensures this runs only once

  const openDeleteDialog = (videoId: string) => {
    setVideoToDelete(videoId)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!videoToDelete) return
    
    try {
      setShowDeleteDialog(false)
      
      // Show "deleting" toast
      const loadingToast = toast({
        title: "Deleting video...",
        description: "Please wait while we remove this video.",
      })
      
      const response = await fetch(`/api/videos?id=${videoToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete video")
      }

      // Remove the deleted video from the list
      setVideos((prev) => prev.filter((video) => video.id !== videoToDelete))
      
      // Dismiss loading toast and show success
      toast({
        id: loadingToast,
        title: "Success",
        description: "Video deleted successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setVideoToDelete(null)
    }
  }

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-50">
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50">
            {status}
          </Badge>
        )
    }
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-white border-b border-gray-100">
          <CardTitle className="text-lg font-medium text-gray-800 flex items-center">
            <Film className="h-5 w-5 mr-2 text-blue-600" />
            Your Videos
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchVideos} 
            className="h-8 text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p>Loading your videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center">
                <Film className="h-10 w-10 text-blue-400" />
              </div>
              <p className="text-gray-600">No videos generated yet.</p>
              <p className="text-gray-500 text-sm">Use the form to create your first video.</p>
            </div>
          ) : (
            <div>
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className={`p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    index !== videos.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{video.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {new Date(video.createdAt).toLocaleDateString()} at {new Date(video.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="mt-2">{renderStatusBadge(video.status)}</div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {video.status === "completed" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild 
                        className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300"
                      >
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(video.id)}
                      className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your video and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}