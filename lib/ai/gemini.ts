import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function generateWithGemini(prompt, systemPrompt) {
  try {
    const result = await generateText({
      model: google('gemini-1.5-pro', { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
      prompt,
      system: systemPrompt,
    });
    return result.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
}
