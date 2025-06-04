
/**
 * @fileOverview A Genkit tool to retrieve product information.
 *
 * - getProductInformation - The tool function.
 * - ProductLookupInputSchema - Input schema for the tool.
 * - ProductInformationOutputSchema - Output schema for the tool.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types'; // Ensure Product type is available if needed for strong typing, though direct usage is minimal here

export const ProductLookupInputSchema = z.object({
  productName: z.string().describe('The name of the product to look up.'),
});
export type ProductLookupInput = z.infer<typeof ProductLookupInputSchema>;

// Define a schema for the product information subset we want to return
export const ProductInformationSubsetSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
});

export const ProductInformationOutputSchema = ProductInformationSubsetSchema.nullable().describe(
  'Information about the found product (name, description, price, category), or null if not found.'
);
export type ProductInformationOutput = z.infer<typeof ProductInformationOutputSchema>;

export const getProductInformation = ai.defineTool(
  {
    name: 'getProductInformation',
    description: 'Retrieves information about a specific product available in the CommerceZen store, such as its description, price, and category, based on the product name provided by the user.',
    inputSchema: ProductLookupInputSchema,
    outputSchema: ProductInformationOutputSchema,
  },
  async (input: ProductLookupInput): Promise<ProductInformationOutput> => {
    const { productName } = input;
    const foundProduct = mockProducts.find(
      (p) => p.name.toLowerCase().includes(productName.toLowerCase())
    );

    if (foundProduct) {
      return {
        name: foundProduct.name,
        description: foundProduct.description,
        price: foundProduct.price,
        category: foundProduct.category,
      };
    }
    return null;
  }
);

