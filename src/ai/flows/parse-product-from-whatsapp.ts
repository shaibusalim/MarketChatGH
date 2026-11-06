'use server';

import { ai, callAIWithRetry } from '@/ai/genkit';
import { z } from 'genkit';

const ParseProductInputSchema = z.object({
  caption: z.string().describe('The raw WhatsApp caption sent by the seller with the product image.'),
});
export type ParseProductInput = z.infer<typeof ParseProductInputSchema>;

const ParseProductOutputSchema = z.object({
  title: z.string().describe('Concise product title/name, e.g. "Nike Air Force 1 Low", "Gucci Handbag", "Floral Summer Dress". Maximum 60 characters.'),
  category: z.string().describe('Standard category such as "Fashion & Clothing", "Shoes & Footwear", "Bags & Accessories", "Electronics & Gadgets", "Beauty & Cosmetics", "Groceries & Food", "Home & Living", "Jewelry & Watches", or "General".'),
  price: z.string().describe('Clean numeric price value only (e.g. "150" or "250"). Remove currency symbols like GH₵, Ghc, cedis.'),
  compareAtPrice: z.string().nullable().optional().describe('Original / strikethrough price if a sale or discount is mentioned (e.g. "200"). Null if none.'),
  description: z.string().describe('Cleaned, descriptive summary of the product (size, colors, features, brand).'),
});
export type ParseProductOutput = z.infer<typeof ParseProductOutputSchema>;

const prompt = ai.definePrompt({
  name: 'parseProductFromWhatsAppPrompt',
  input: { schema: ParseProductInputSchema },
  output: { schema: ParseProductOutputSchema },
  prompt: `You are an expert e-commerce catalog assistant for MarketChatGH, an online marketplace in Ghana.
A Ghanaian merchant just sent a product photo with the following WhatsApp message caption:

"""
{{{caption}}}
"""

Your task is to analyze this caption and accurately extract structured product data:
1. "title": A concise, clean, catchy product title (e.g. "Nike Air Jordan 4 Retro", "Wireless Bluetooth Earbuds", "Floral Maxi Dress").
2. "category": Pick the most appropriate category:
   - "Fashion & Clothing" (for dresses, shirts, jeans, suits, fabrics)
   - "Shoes & Footwear" (for sneakers, heels, sandals, boots)
   - "Bags & Accessories" (for handbags, backpacks, wallets, belts, caps, sunglasses)
   - "Electronics & Gadgets" (for phones, laptops, smartwatches, chargers, TVs)
   - "Beauty & Cosmetics" (for perfumes, makeup, hair extensions, skincare)
   - "Groceries & Food" (for snacks, drinks, foodstuff, spices)
   - "Home & Living" (for appliances, bedsheets, decor)
   - "Jewelry & Watches" (for gold, silver, rings, luxury watches)
   - "General" (if none of the above fits)
3. "price": Extract the current selling price as plain digits only (e.g., if caption says "Price: Ghc 150" or "₵ 150 only", output "150").
4. "compareAtPrice": If the seller indicates a discount, promo, or previous price (e.g. "was 200 now 150" or "discounted from 300"), extract the previous higher price digits. If no discount is mentioned, return null.
5. "description": Clean, readable description preserving key info like sizes, colors, condition (new/used), delivery options, or brand.

Be smart with Ghanaian market phrasing (e.g. "cedis", "ghc", "cool price", "dm for size", "serious buyers only").`,
});

export const parseProductFlow = ai.defineFlow(
  {
    name: 'parseProductFlow',
    inputSchema: ParseProductInputSchema,
    outputSchema: ParseProductOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to parse product with AI');
    }
    return output;
  }
);

/**
 * Fallback parser using regex and string heuristics if AI is offline/unreachable
 */
function fallbackParse(caption: string): ParseProductOutput {
  const lines = caption.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Try to find price
  let price = 'Price on request';
  let compareAtPrice: string | null = null;

  const priceMatch = caption.match(/(?:(?:ghc|gh₵|₵|price|cedis)\s*[:=]?\s*|[:=]\s*)(\d+(?:\.\d{1,2})?)/i);
  if (priceMatch) {
    price = priceMatch[1];
  } else {
    // Look for standalone numbers that look like prices
    const standaloneNum = caption.match(/\b(\d{2,6})\b/);
    if (standaloneNum) {
      price = standaloneNum[1];
    }
  }

  // Check for discount mention: e.g. "was 200 now 150"
  const discountMatch = caption.match(/was\s*(?:ghc|gh₵|₵)?\s*(\d+)/i);
  if (discountMatch) {
    compareAtPrice = discountMatch[1];
  }

  // 2. Guess Title (first line or first few words)
  let title = lines[0] || 'Product';
  // Strip out any explicit "Price:" from title
  title = title.replace(/(?:ghc|gh₵|₵|price|cedis)\s*[:=]?\s*\d+/gi, '').trim();
  if (!title || title.length < 3) {
    title = 'New Product';
  }
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }

  // 3. Guess Category
  const lower = caption.toLowerCase();
  let category = 'General';
  if (/shoe|sneaker|heel|boot|sandal|slippers|crocs|air force|jordan/i.test(lower)) {
    category = 'Shoes & Footwear';
  } else if (/shirt|dress|top|trouser|pant|jean|hoodie|jacket|skirt|suit|jersey/i.test(lower)) {
    category = 'Fashion & Clothing';
  } else if (/bag|backpack|wallet|purse|belt|cap|hat|shades|sunglasses/i.test(lower)) {
    category = 'Bags & Accessories';
  } else if (/phone|iphone|samsung|laptop|charger|airpod|earbud|headphone|watch|gadget/i.test(lower)) {
    category = 'Electronics & Gadgets';
  } else if (/perfume|cologne|makeup|lipstick|lotion|cream|hair|wig/i.test(lower)) {
    category = 'Beauty & Cosmetics';
  } else if (/watch|chain|ring|bracelet|necklace|gold|silver/i.test(lower)) {
    category = 'Jewelry & Watches';
  } else if (/food|snack|drink|rice|oil|spice/i.test(lower)) {
    category = 'Groceries & Food';
  }

  return {
    title,
    category,
    price,
    compareAtPrice,
    description: caption,
  };
}

/**
 * Main exported helper to parse WhatsApp product captions
 */
export async function parseProductCaption(caption: string): Promise<ParseProductOutput> {
  if (!caption || !caption.trim()) {
    return fallbackParse(caption);
  }

  try {
    const result = await callAIWithRetry(
      () => parseProductFlow({ caption: caption.trim() }),
      2,
      800
    );
    if (result && result.title && result.price) {
      return result;
    }
    return fallbackParse(caption);
  } catch (err) {
    console.warn('[AI WhatsApp Product Parser] Falling back to heuristics:', err);
    return fallbackParse(caption);
  }
}

