'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerComplexQueryInputSchema = z.object({
  query: z.string().min(1, "Query cannot be empty").describe('The complex query about the product.'),
});
export type AnswerComplexQueryInput = z.infer<typeof AnswerComplexQueryInputSchema>;

const AnswerComplexQueryOutputSchema = z.object({
  reply: z.string().describe('The AI-powered response to the query.'),
});
export type AnswerComplexQueryOutput = z.infer<typeof AnswerComplexQueryOutputSchema>;

export async function answerComplexQuery(input: AnswerComplexQueryInput): Promise<AnswerComplexQueryOutput> {
  try {
    // Validate input
    const validatedInput = AnswerComplexQueryInputSchema.parse(input);
    return await answerComplexQueryFlow(validatedInput);
  } catch (error) {
    console.error("Input validation or flow error:", error);
    return {
      reply: "⚠️ Invalid or empty query. Please provide a valid question or contact support.",
    };
  }
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
- If the query is empty or invalid, respond with a generic helpful message.

Customer query: {{{query}}}`,
});

const answerComplexQueryFlow = ai.defineFlow(
  {
    name: 'answerComplexQueryFlow',
    inputSchema: AnswerComplexQueryInputSchema,
    outputSchema: AnswerComplexQueryOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output?.reply) {
        throw new Error("Empty response from AI");
      }
      return output;
    } catch (error) {
      console.error("Gemini prompt error:", error);
      return {
        reply: "Our AI assistant is currently overloaded. Please try again later or contact us directly. 🙏🏾",
      };
    }
  }
);