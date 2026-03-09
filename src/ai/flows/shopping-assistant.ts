'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts } from '@/lib/product-actions';

const ShoppingAssistantInputSchema = z.object({
  message: z.string().describe("The user's message to the shopping assistant."),
  products: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        price: z.string(),
        sellerId: z.string(),
        sellerSlug: z.string().optional(),
      })
    )
    .optional()
    .describe('A list of available products.'),
});
export type ShoppingAssistantInput = z.infer<typeof ShoppingAssistantInputSchema>;

const ShoppingAssistantOutputSchema = z.object({
  reply: z.string().describe("The shopping assistant's response."),
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
- Always stay on topic and focus on shopping-related queries. Do not discuss unrelated topics.
- If the user asks for a specific product, search for it in the provided product data.
  - If found, provide a direct link to the product page in the format: \`/[sellerSlug or sellerId]/product/[productId]\`.
  - Also provide a link to the seller’s store in the format: \`/[sellerSlug or sellerId]\`.
  - Example: If a product has sellerSlug "akua-boutique" and id "product456", the product link should be \`/akua-boutique/product/product456\` and the seller store link should be \`/akua-boutique\`.
  - ALWAYS prefer using the sellerSlug if available.
- If the user asks for a recommendation, ask clarifying questions to understand their needs (e.g., "What kind of products are you interested in?", "What's your budget?").
- Be friendly, polite, and use Ghanaian colloquialisms where appropriate.
- If you cannot find a relevant product, apologize and suggest broadening the search or contacting a human agent. Do not make up products or links.
- Do not provide any payment instructions.

Available Products:
{{#each products}}
- ID: {{id}}, Description: {{description}}, Price: {{price}}, Seller ID: {{sellerId}}, Seller Slug: {{sellerSlug}}
{{/each}}

User message: {{{message}}}`
});

export const shoppingAssistantFlow = ai.defineFlow(
  {
    name: 'shoppingAssistantFlow',
    inputSchema: ShoppingAssistantInputSchema,
    outputSchema: ShoppingAssistantOutputSchema,
  },
  async (input) => {
    // Fetch recent products (limit 50 for efficiency)
    const { products, sellers } = await getProducts('', 'all', 'createdAt-desc', 50);

    // Basic keyword filtering (split user message into words and match against description)
    const userQuery = input.message.toLowerCase();
    let filteredProducts = products.filter((p) =>
      userQuery
        .split(/\s+/)
        .some((word) => p.description.toLowerCase().includes(word))
    );

    // If no matches, fallback to all products
    if (filteredProducts.length === 0) {
      filteredProducts = products;
    }

    const productData = filteredProducts.map((p) => ({
      id: p.id,
      description: p.description,
      price: p.price,
      sellerId: p.sellerId,
      sellerSlug: sellers.get(p.sellerId)?.slug,
    }));

    const promptInput = {
      ...input,
      products: productData,
    };

    const { output } = await prompt(promptInput);
    if (!output?.reply) {
      throw new Error('Empty response from AI');
    }
    return output;
  }
);
