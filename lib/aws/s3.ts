import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import type { Video } from "@/types/video"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "sports-celebrity-reels"

// Function to generate S3 URLs
function getVideoUrl(videoId: string): string {
  const region = process.env.AWS_REGION || "us-east-1"
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/videos/${videoId}.mp4`
}

// Upload video to S3
export async function uploadVideo(
  videoId: string,
  videoBuffer: Buffer,
  metadata: {
    title: string
    description: string
    status: string
    createdAt: string
    likes: number
    shares: number
  },
) {
  // If videoBuffer is not empty, upload the video file
  if (videoBuffer.length > 0) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `videos/${videoId}.mp4`,
        Body: videoBuffer,
        ContentType: "video/mp4",
        ACL: "public-read", // Make the video publicly accessible
      }),
    )
  }

  // Upload metadata as a separate JSON file
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `metadata/${videoId}.json`,
      Body: JSON.stringify({
        ...metadata,
        url: getVideoUrl(videoId), // Include the URL in the metadata
      }),
      ContentType: "application/json",
      ACL: "public-read",
      
    }),
  )

  return {
    id: videoId,
    url: getVideoUrl(videoId),
    ...metadata,
  }
}

// List all videos
export async function listVideos(): Promise<Video[]> {
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "metadata/",
      }),
    )

    if (!response.Contents || response.Contents.length === 0) {
      return []
    }

    const videos: Video[] = []

    for (const object of response.Contents) {
      if (object.Key && object.Key.endsWith(".json")) {
        const metadataResponse = await s3Client.send(
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: object.Key,
          }),
        )

        if (metadataResponse.Body) {
          const metadataString = await metadataResponse.Body.transformToString()
          const metadata = JSON.parse(metadataString)
          const videoId = object.Key.replace("metadata/", "").replace(".json", "")

          videos.push({
            id: videoId,
            ...metadata,
          })
        }
      }
    }

    // Sort by creation date (newest first)
    return videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error listing videos:", error)
    // Return mock data as fallback during development
    return [
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
    ]
  }
}

// Get a specific video
export async function getVideo(videoId: string): Promise<Video> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `metadata/${videoId}.json`,
      }),
    )

    if (!response.Body) {
      throw new Error("Video not found")
    }

    const metadataString = await response.Body.transformToString()
    const metadata = JSON.parse(metadataString)

    return {
      id: videoId,
      ...metadata,
    }
  } catch (error) {
    console.error("Error getting video:", error)
    throw error
  }
}

// Delete a video
export async function deleteVideo(videoId: string): Promise<void> {
  try {
    // Delete video file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `videos/${videoId}.mp4`,
      }),
    )

    // Delete metadata file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `metadata/${videoId}.json`,
      }),
    )
  } catch (error) {
    console.error("Error deleting video:", error)
    throw error
  }
}

