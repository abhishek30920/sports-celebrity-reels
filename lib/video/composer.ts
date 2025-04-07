import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import axios from "axios"
import ffmpeg from "fluent-ffmpeg";

import { pipeline } from "stream";
import { promisify } from "util";

import fs from "fs"
import path from "path"
import os from "os"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function composeVideo(
  imagePaths: string[],
  audioUrl: string,
  script: string,
  videoId: string,
): Promise<string> {
  try {
    // Create a temporary directory for processing
    const tempDir = path.join(os.tmpdir(), videoId)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
console.log(tempDir)
    // Download images
    const imageFiles = await downloadImages(imagePaths, tempDir)
 console.log(imageFiles)
    // Download audio
    const audioFile = path.join(tempDir, "audio.mp3")
    console.log(audioUrl,audioFile)
    await downloadFile(audioUrl, audioFile)
console.log(audioFile)
    // Calculate video duration based on audio duration
    const audioDuration = await getAudioDuration(audioFile)

    // Calculate how long each image should be shown
    const imageDuration = audioDuration / imageFiles.length
    console.log("-0000000000000")
 

    // Generate video file
    const outputFile = path.join(tempDir, `${videoId}.mp4`)
    console.log("Output file path:", outputFile);
    await generateVideo(imageFiles, audioFile, outputFile, imageDuration, script)

    // Upload to S3
    const s3Key = `videos/${videoId}.mp4`
    await uploadToS3(outputFile, process.env.S3_BUCKET_NAME || "sports-celebrity-reels", s3Key)

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true })

    // Return the S3 URL
    const region = process.env.AWS_REGION || "us-east-1"
    return `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`
  } catch (error) {
    console.error("Error composing video:", error)
    throw error
  }
}

async function downloadImages(urls: string[], tempDir: string): Promise<string[]> {
  const imageFiles: string[] = []
 console.log(imageFiles)
  for (let i = 0; i < urls.length; i++) {
    const imageFile = path.join(tempDir, `image_${i}.jpg`)
    await downloadFile(urls[i], imageFile)
    imageFiles.push(imageFile)
  }

  return imageFiles
}


const streamPipeline = promisify(pipeline);

async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    url = url.trim();
    const safeUrl = encodeURI(url);
    console.log("Downloading from:", safeUrl);

    const response = await fetch(safeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0", // mimic browser
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(outputPath);
    await streamPipeline(response.body, fileStream);

    console.log("Download completed:", outputPath);
  } catch (error) {
    console.error("Download error:", error.message);
    throw error;
  }
}



async function getAudioDuration(audioFile: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioFile, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      resolve(metadata.format.duration || 60) // Default to 60 seconds if duration can't be determined
    })
  })
}



async function generateVideo(
  imageFiles: string[],
  audioFile: string,
  outputFile: string,
  imageDuration: number,
  script: string, // optional if you're no longer using subtitles
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Add image inputs
    imageFiles.forEach((imageFile) => {
      command.input(imageFile).inputOptions(['-loop 1', `-t ${imageDuration}`]);
    });

    // Add audio input
    command.input(audioFile);

    // Generate filters for images
    const imageFilters = imageFiles.map((_, i) =>
      `[${i}:v]scale=1080:604,setsar=1[v${i}]`
    );

    const videoInputs = imageFiles.map((_, i) => `[v${i}]`).join('');
    const concatFilter = `${videoInputs}concat=n=${imageFiles.length}:v=1:a=0[video]`;

    command
      .complexFilter([
        ...imageFilters,
        concatFilter
      ])
      .outputOptions([
        '-map [video]',             // use the filtered video stream
        `-map ${imageFiles.length}:a`, // map the audio stream (last input)
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-c:a aac',
        '-shortest',
      ])
      .output(outputFile)
      .on('start', (cmdLine) => console.log('FFmpeg command:', cmdLine))
      .on('stderr', (stderrLine) => console.log('FFmpeg stderr:', stderrLine))
      .on('end', () => {
        console.log('Video generation complete:', outputFile);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}



function generateSubtitles(script: string, outputFile: string, imageDuration: number, imageCount: number): void {
  console.log("in subtitle")
  console.log(outputFile)
  // Split script into sentences
  const sentences = script.match(/[^.!?]+[.!?]+/g) || [script]

  // Calculate time per sentence
  const totalDuration = imageDuration * imageCount
  const timePerSentence = totalDuration / sentences.length

  // Generate SRT content
  let srtContent = ""
  sentences.forEach((sentence, index) => {
    const startTime = formatSrtTime(index * timePerSentence)
    const endTime = formatSrtTime((index + 1) * timePerSentence)

    srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${sentence.trim()}\n\n`
  })

  // Write to file
  fs.writeFileSync(outputFile, srtContent)
}

function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
}

async function uploadToS3(filePath: string, bucket: string, key: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath)

  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: "video/mp4",
    ACL: "public-read",
  }

  await s3Client.send(new PutObjectCommand(params))
}

