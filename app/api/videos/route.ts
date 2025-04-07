import { type NextRequest, NextResponse } from "next/server"
import { listVideos, getVideo, deleteVideo } from "@/lib/aws/s3"

// Use Node.js runtime for this API route
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const videoId = searchParams.get("id")

  try {
    if (videoId) {
      // Get a specific video
      const video = await getVideo(videoId)
      return NextResponse.json({ video })
    } else {
      // List all videos
      const videos = await listVideos()
      return NextResponse.json({ videos })
    }
  } catch (error) {
    console.error("Error fetching videos:", error)

    // Return mock data during development if S3 access fails
    if (!videoId) {
      return NextResponse.json({
        videos: [
          {
            id: "michael-jordan-1234567890",
            title: "Michael Jordan - Basketball History",
            description:
              "Michael Jordan, widely regarded as the greatest basketball player of all time, transformed the NBA with his extraordinary skills and competitive drive...",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            status: "completed",
            createdAt: "2025-04-01T12:00:00Z",
            likes: 1245,
            shares: 423,
          },
          {
            id: "serena-williams-1234567891",
            title: "Serena Williams - Tennis History",
            description:
              "Serena Williams, one of the greatest tennis players of all time, dominated the sport with her powerful serve and athletic prowess...",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            status: "completed",
            createdAt: "2025-04-02T14:30:00Z",
            likes: 982,
            shares: 315,
          },
          {
            id: "lionel-messi-1234567892",
            title: "Lionel Messi - Soccer History",
            description:
              "Lionel Messi, often considered the greatest soccer player of all time, has mesmerized fans with his incredible dribbling skills and goal-scoring ability...",
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            status: "completed",
            createdAt: "2025-04-03T09:15:00Z",
            likes: 1876,
            shares: 642,
          },
        ],
      })
    }

    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const videoId = searchParams.get("id")

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  try {
    await deleteVideo(videoId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}

