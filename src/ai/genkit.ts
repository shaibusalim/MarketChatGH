import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Utility function for AI calls with retry logic
export async function callAIWithRetry<T>(
  aiFunction: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error = new Error('AI call failed');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aiFunction();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a rate limit error (429)
      const errorMessage = lastError.message || '';
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests') || errorMessage.includes('exceeded your current quota');

      if (isRateLimit) {
        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`AI rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // For other errors, don't retry
      break;
    }
  }

  throw lastError;
}

export const ai = genkit({
  plugins: [googleAI({
    // Add API key from environment if needed
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  })],
  model: 'googleai/gemini-2.0-flash', // Use latest flash model
});
