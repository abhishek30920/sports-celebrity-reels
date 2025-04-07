import axios from 'axios';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// SERP API for Google Image Search
const SERP_API_KEY = process.env.SERP_API_KEY;

export async function sourceImages(celebrityName: string, sport: string, script: string): Promise<string[]> {
  try {
    // Step 1: Extract key moments from the script
    const keyMoments = await extractKeyMoments(script, celebrityName, sport);

    // Step 2: Search for images using SERP API
    const imageUrls: string[] = [];

    for (const moment of keyMoments) {
      try {
        const imageUrl = await searchGoogleImages(moment, celebrityName, sport);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        } else {
          // Use a fallback image if search fails
          imageUrls.push(generatePlaceholderUrl(moment, celebrityName, sport));
        }
      } catch (error) {
        console.error(`Error searching image for moment: ${moment}`, error);
        // Use a fallback image if search fails
        imageUrls.push(generatePlaceholderUrl(moment, celebrityName, sport));
      }
    }

    // Ensure we have at least 5 images
    while (imageUrls.length < 5) {
      imageUrls.push(generatePlaceholderUrl(`${celebrityName} ${sport}`, celebrityName, sport));
    }

    return imageUrls;
  } catch (error) {
    console.error("Error sourcing images:", error);
    // Return placeholder images as fallback
    return Array(5).fill(null).map((_, i) => 
      generatePlaceholderUrl(`${celebrityName} ${sport} ${i+1}`, celebrityName, sport)
    );
  }
}

// Helper function to generate placeholder URLs
function generatePlaceholderUrl(text: string, celebrityName: string, sport: string): string {
  return `/placeholder.svg?height=720&width=1280&text=${encodeURIComponent(text)}`;
}

async function searchGoogleImages(searchQuery: string, celebrityName: string, sport: string): Promise<string | null> {
  if (!SERP_API_KEY) {
    console.error("SERP_API_KEY is not defined");
    return null;
  }

  try {
    // Create a search query focused on sports celebrity images
    const fullQuery = `${celebrityName} ${sport} ${searchQuery} high quality`;
    
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_images',
        q: fullQuery,
        api_key: SERP_API_KEY,
        safe: 'active', 
        ijn: '0', 
        tbm: 'isch', 
        tbs: 'isz:l', 
      }
    });

    if (response.data.images_results && response.data.images_results.length > 0) {
     
      const filteredImages = response.data.images_results.filter(img => 
        img.width >= 800 && img.height >= 600 && 
        img.width/img.height <= 2 // Reasonable aspect ratio
      );
      
      if (filteredImages.length > 0) {
        // Get a random image from first 5 results for variety
        const randomIndex = Math.floor(Math.random() * Math.min(5, filteredImages.length));
        return filteredImages[randomIndex].original;
      }
      
      // If no filtered images, use the first result
      return response.data.images_results[0].original;
    }
    
    return null;
  } catch (error) {
    console.error("Error searching Google Images via SERP API:", error);
    return null;
  }
}

// Keep the existing extractKeyMoments function
async function extractKeyMoments(script: string, celebrityName: string, sport: string): Promise<string[]> {
  const prompt = `
Extract 5 key moments or achievements from this script about ${celebrityName} in ${sport}.
Format each moment as a short, searchable phrase that could be used to find an image.
Return only the list of 5 phrases, one per line.

Script:
${script}
  `;

  try {
    // Use the documented approach to call generateText
    const { text } = await generateText({
      model: google('gemini-1.5-pro-latest', { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
      prompt,
    });

    // Process the returned text into moments
    const moments = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);

    return moments;
  } catch (error) {
    console.error("Error extracting key moments:", error);
    // Fallback default moments
    return [
      `${celebrityName} ${sport} career`,
      `${celebrityName} action shot`,
      `${celebrityName} championship`,
      `${celebrityName} award`,
      `${celebrityName} iconic moment`,
    ];
  }
}