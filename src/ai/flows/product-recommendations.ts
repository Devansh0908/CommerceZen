// src/ai/flows/product-recommendations.ts
'use server';

/**
 * @fileOverview An AI agent that recommends products based on items in the user's cart.
 *
 * - recommendProducts - A function that recommends products based on items in the cart.
 * - RecommendProductsInput - The input type for the recommendProducts function.
 * - RecommendProductsOutput - The return type for the recommendProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendProductsInputSchema = z.object({
  cartItems: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        category: z.string(),
      })
    )
    .describe('An array of items currently in the user cart.'),
});
export type RecommendProductsInput = z.infer<typeof RecommendProductsInputSchema>;

const RecommendProductsOutputSchema = z.object({
  recommendedProducts: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        category: z.string(),
      })
    )
    .describe('An array of recommended products based on the items in the cart.'),
});
export type RecommendProductsOutput = z.infer<typeof RecommendProductsOutputSchema>;

export async function recommendProducts(input: RecommendProductsInput): Promise<RecommendProductsOutput> {
  return recommendProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProductsPrompt',
  input: {schema: RecommendProductsInputSchema},
  output: {schema: RecommendProductsOutputSchema},
  prompt: `You are an e-commerce product recommendation expert. Based on the items in the user's cart, recommend additional products that the user might be interested in.

Cart items:
{{#each cartItems}}
- Name: {{this.name}}, Description: {{this.description}}, Price: {{this.price}}, Category: {{this.category}}
{{/each}}

Return the recommended products in the following JSON format:
{
  "recommendedProducts": [
    {
      "name": "product name",
      "description": "product description",
      "price": product price,
      "category": "product category"
    }
  ]
}`,
});

const recommendProductsFlow = ai.defineFlow(
  {
    name: 'recommendProductsFlow',
    inputSchema: RecommendProductsInputSchema,
    outputSchema: RecommendProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
