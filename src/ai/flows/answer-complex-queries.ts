'use server';

/**
 * @fileOverview A Genkit flow that answers complex questions about a product using Gemini.
 *
 * - answerComplexQuery - A function that handles the complex query answering process.
 * - AnswerComplexQueryInput - The input type for the answerComplexQuery function.
 * - AnswerComplexQueryOutput - The return type for the answerComplexQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  input: { schema: AnswerComplexQueryInputSchema },
  output: { schema: AnswerComplexQueryOutputSchema },
  prompt: `You are a helpful and friendly Ghanaian shop assistant for an online marketplace called MarketChat GH.
Your goal is to answer customer questions politely, concisely, and accurately.
The customer is asking for help or has a question.

Here are the rules you must follow:
- If the question is about product availability or price, and the information is in the query, answer it. For example, if the query is "Is 'Red T-Shirt' for ₵50 available?", you can say "Yes, the Red T-Shirt is available for ₵50.".
- If the question is about how to pay, you should instruct them to pay via MTN Mobile Money to the number 055 123 4567 and to send a screenshot of the payment confirmation to finalize the order.
- For any other question, provide a helpful response. Be friendly and use Ghanaian colloquialisms where appropriate.
- Keep your answers short and to the point.

Customer query: {{{query}}}`,
});

const answerComplexQueryFlow = ai.defineFlow(
  {
    name: 'answerComplexQueryFlow',
    inputSchema: AnswerComplexQueryInputSchema,
    outputSchema: AnswerComplexQueryOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Gemini prompt error:", error);
      // ✅ Instead of throwing, return a fallback message
      return {
        reply: "Our AI assistant is currently overloaded. Please try again later or contact us directly. 🙏🏾",
      };
    }
  }
);
