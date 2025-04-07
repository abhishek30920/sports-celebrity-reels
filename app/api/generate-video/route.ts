import { type NextRequest, NextResponse } from "next/server"
import { generateScript } from "@/lib/ai/script-generator"
import { sourceImages } from "@/lib/ai/image-sourcer"
import { generateSpeech } from "@/lib/video/text-to-speech"
import { composeVideo } from "@/lib/video/composer"

import { uploadVideo } from "@/lib/aws/s3"
import axios from "axios"
// Use Node.js runtime for this API route
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { celebrityName, sport, additionalInfo } = await request.json()

    if (!celebrityName || !sport) {
      return NextResponse.json({ error: "Celebrity name and sport are required" }, { status: 400 })
    }

    const videoId = `${celebrityName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`

    // Save metadata with "processing" status
    await uploadVideo(videoId, Buffer.from(""), {
      title: `${celebrityName} - ${sport} History`,
      description: `Generating video about ${celebrityName}'s career in ${sport}...`,
      status: "processing",
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
    })

    // ⚠️ Important change: Wait for generation to finish
    const result = await generateVideoProcess(videoId, celebrityName, sport, additionalInfo)

    // Respond when everything is done
    return NextResponse.json({
      success: true,
      videoId,
      message: "Video generated successfully",
      script: result.script,
      videoUrl: result.videoUrl,
    })
  } catch (error) {
    console.error("Error generating video:", error)
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 })
  }
}


// This function would typically be moved to a background job
async function generateVideoProcess(
  videoId: string,
  celebrityName: string,
  sport: string,
  additionalInfo?: string
): Promise<{ script: string; videoUrl: string }> {
  try {
    const script = await generateScript(celebrityName, sport, additionalInfo)
    const images = await sourceImages(celebrityName, sport, script)
    const bucketName = process.env.S3_BUCKET_NAME || "sports-celebrity-reels"
    const audioKey = `audio/${videoId}`
    const audioUrl = await generateSpeech(script, bucketName, audioKey)
    await waitForS3File(audioUrl)
    const videoUrl = await composeVideo(images, audioUrl, script, videoId)

    await uploadVideo(videoId, Buffer.from(""), {
      title: `${celebrityName} - ${sport} History`,
      description: script.substring(0, 100) + "...",
      status: "completed",
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
    })

    return { script, videoUrl }

  } catch (error: any) {
    await uploadVideo(videoId, Buffer.from(""), {
      title: `${celebrityName} - ${sport} History`,
      description: `Error generating video: ${error.message}`,
      status: "failed",
      createdAt: new Date().toISOString(),
      likes: 0,
      shares: 0,
    })
    throw error
  }
}


async function waitForS3File(url: string, maxRetries = 10, delayMs = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.head(url)
      if (response.status === 200) return
    } catch (error) {
      if (i === maxRetries - 1) throw new Error(`File not found after ${maxRetries} attempts: ${url}`)
    }
    await new Promise((res) => setTimeout(res, delayMs))
  }
}
