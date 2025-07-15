'use server';

/**
 * @fileOverview A Genkit flow that answers complex questions about a product using GPT-4.
 *
 * - answerComplexQuery - A function that handles the complex query answering process.
 * - AnswerComplexQueryInput - The input type for the answerComplexQuery function.
 * - AnswerComplexQueryOutput - The return type for the answerComplexQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerComplexQueryInputSchema = z.object({
  query: z.string().describe('The complex query about the product.'),
});
export type AnswerComplexQueryInput = z.infer<typeof AnswerComplexQueryInputSchema>;

const AnswerComplexQueryOutputSchema = z.object({
  reply: z.string().describe('The AI-powered response to the query.'),
});
export type AnswerComplexQueryOutput = z.infer<typeof AnswerComplexQueryOutputSchema>;

export async function answerComplexQuery(input: AnswerComplexQueryInput): Promise<AnswerComplexQueryOutput> {
  return answerComplexQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerComplexQueryPrompt',
  input: {schema: AnswerComplexQueryInputSchema},
  output: {schema: AnswerComplexQueryOutputSchema},
  prompt: `You are a Ghanaian shop assistant. Be polite and concise. Answer the following question: {{{query}}}`,
  model: 'gpt-4',
});

const answerComplexQueryFlow = ai.defineFlow(
  {
    name: 'answerComplexQueryFlow',
    inputSchema: AnswerComplexQueryInputSchema,
    outputSchema: AnswerComplexQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
