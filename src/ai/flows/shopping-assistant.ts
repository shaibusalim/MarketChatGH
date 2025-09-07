'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts } from '@/lib/product-actions';

const ShoppingAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message to the shopping assistant.'),
});
export type ShoppingAssistantInput = z.infer<typeof ShoppingAssistantInputSchema>;

const ShoppingAssistantOutputSchema = z.object({
  reply: z.string().describe('The shopping assistant\'s response.'),
});
export type ShoppingAssistantOutput = z.infer<typeof ShoppingAssistantOutputSchema>;

const prompt = ai.definePrompt({
  name: 'shoppingAssistantPrompt',
  input: { schema: ShoppingAssistantInputSchema },
  output: { schema: ShoppingAssistantOutputSchema },
  prompt: `You are a friendly and helpful shopping assistant for MarketChat GH, an online marketplace in Ghana.
Your goal is to help users find products and guide them through the shopping process.
You have access to a list of products.

Here are the rules you must follow:
- If the user asks for a specific product, search for it and provide a link.
- If the user asks for a recommendation, ask clarifying questions to understand their needs.
- If the user asks about payment, instruct them to pay via MTN Mobile Money to the sellers contact and send a screenshot of the payment confirmation.
- Be friendly, polite, and use Ghanaian colloquialisms where appropriate.

User message: {{{message}}}`,
});

export const shoppingAssistantFlow = ai.defineFlow(
  {
    name: 'shoppingAssistantFlow',
    inputSchema: ShoppingAssistantInputSchema,
    outputSchema: ShoppingAssistantOutputSchema,
  },
  async (input) => {
    // In a real implementation, you would use the user's message to search for products
    // and provide more intelligent recommendations.
    // For now, we'll just use the prompt to generate a response.
    const { output } = await prompt(input);
    if (!output?.reply) {
      throw new Error("Empty response from AI");
    }
    return output;
  }
);
