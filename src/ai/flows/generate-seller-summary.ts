'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSellerSummaryInputSchema = z.object({
  sellerName: z.string().describe('The name of the seller.'),
  products: z.array(z.object({
    description: z.string().describe('The description of the product.'),
  })).describe('A list of products sold by the seller.'),
});
export type GenerateSellerSummaryInput = z.infer<typeof GenerateSellerSummaryInputSchema>;

const GenerateSellerSummaryOutputSchema = z.object({
  summary: z.string().describe('A short, engaging summary of the seller.'),
});
export type GenerateSellerSummaryOutput = z.infer<typeof GenerateSellerSummaryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSellerSummaryPrompt',
  input: { schema: GenerateSellerSummaryInputSchema },
  output: { schema: GenerateSellerSummaryOutputSchema },
  prompt: `You are a helpful assistant for an online marketplace in Ghana called MarketChat GH.
Your task is to generate a short, engaging summary for a seller based on their name and a list of their products.
The summary should be one sentence long and highlight the seller's specialty.
Use a friendly and professional tone.

Seller Name: {{{sellerName}}}
Products:
{{#each products}}- {{{this.description}}}
{{/each}}`,
});

export const generateSellerSummaryFlow = ai.defineFlow(
  {
    name: 'generateSellerSummaryFlow',
    inputSchema: GenerateSellerSummaryInputSchema,
    outputSchema: GenerateSellerSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.summary) {
      throw new Error("Empty response from AI");
    }
    return output;
  }
);
