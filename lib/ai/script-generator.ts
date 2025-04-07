import { generateWithGemini } from "./gemini"

export async function generateScript(celebrityName: string, sport: string, additionalInfo?: string): Promise<string> {
  const systemPrompt = `
    You are a professional sports historian and scriptwriter.
    Your task is to create an engaging, factual script about a sports celebrity's history.
    The script should be 60-90 seconds when read aloud (approximately 150-225 words).
    Focus on key career highlights, achievements, and interesting facts.
    Use a conversational, engaging tone suitable for a video reel.
    Do not include any introductions like "Welcome to" or "Today we're looking at".
    Start directly with the celebrity's name and their significance.
  `

  const userPrompt = `
    Create a script about ${celebrityName}, who is known for ${sport}.
    ${additionalInfo ? `Additional information to include: ${additionalInfo}` : ""}
    The script should be factually accurate and highlight their career achievements.
  `

  return generateWithGemini(userPrompt, systemPrompt)
}

