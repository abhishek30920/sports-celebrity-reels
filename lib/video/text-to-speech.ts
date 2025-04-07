import { PollyClient, StartSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly"

// Initialize Polly client
const polly = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function generateSpeech(script: string, outputBucket: string, outputKey: string): Promise<string> {
  try {
    const params = {
      OutputFormat: "mp3",
      OutputS3BucketName: outputBucket,
      OutputS3KeyPrefix: outputKey,
      Text: script,
      TextType: "text",
      VoiceId: "Matthew",
      Engine: "neural",
      SampleRate: "24000",
    }

    const command = new StartSpeechSynthesisTaskCommand(params)
    const response = await polly.send(command)

    if (response.SynthesisTask?.OutputUri) {
      const pathStyleUrl = response.SynthesisTask.OutputUri

      // Convert to virtual-hosted–style URL
      const virtualHostedUrl = pathStyleUrl.replace(
        /^https:\/\/s3\.([^.]+)\.amazonaws\.com\/([^/]+)\/(.+)$/,
        "https://$2.s3.$1.amazonaws.com/$3"
      )

      return virtualHostedUrl
    } else {
      throw new Error("Failed to get output URI from Polly")
    }
  } catch (error) {
    console.error("Error generating speech with Amazon Polly:", error)
    throw error
  }
}


