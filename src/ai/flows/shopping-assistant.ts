'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts, Product } from '@/lib/product-actions';

const ShoppingAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message to the shopping assistant.'),
  products: z.array(z.object({
    id: z.string(),
    description: z.string(),
    price: z.string(),
    sellerId: z.string(),
  })).optional().describe('A list of available products.'),
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
- If the user asks for a specific product, search for it using the provided product data and provide a link to the product page (e.g., /sellerId/product/productId).
- If the user asks for a recommendation, ask clarifying questions to understand their needs (e.g., "What kind of products are you interested in?", "What's your budget?").
- If the user asks about payment, instruct them to pay via MTN Mobile Money to the number 055 123 4567 and to send a screenshot of the payment confirmation to finalize the order.
- Be friendly, polite, and use Ghanaian colloquialisms where appropriate.
- If you cannot find a relevant product, apologize and suggest broadening the search or contacting a human agent.

Available Products:
{{#each products}}
- ID: {{this.id}}, Description: {{this.description}}, Price: {{this.price}}, Seller ID: {{this.sellerId}}
{{/each}}

User message: {{{message}}}`,
});

export const shoppingAssistantFlow = ai.defineFlow(
  {
    name: 'shoppingAssistantFlow',
    inputSchema: ShoppingAssistantInputSchema,
    outputSchema: ShoppingAssistantOutputSchema,
  },
  async (input) => {
    const { products } = await getProducts('', 'all', 'createdAt-desc', 20); // Fetch some products
    const productData = products.map(p => ({
      id: p.id,
      description: p.description,
      price: p.price,
      sellerId: p.sellerId,
    }));

    const { output } = await prompt({ ...input, products: productData });
    if (!output?.reply) {
      throw new Error("Empty response from AI");
    }
    return output;
  }
);
