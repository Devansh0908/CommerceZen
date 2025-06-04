
'use server';
/**
 * @fileOverview A customer support chatbot AI agent for CommerceZen.
 *
 * - chatWithSupport - A function that handles the chat interaction.
 * - ChatWithSupportInput - The input type for the chatWithSupport function.
 * - ChatWithSupportOutput - The return type for the chatWithSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getProductInformation } from '../tools/product-lookup-tool'; // Import the new tool

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatWithSupportInputSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  conversationHistory: z
    .array(MessageSchema)
    .describe('The history of the conversation so far.'),
});
export type ChatWithSupportInput = z.infer<typeof ChatWithSupportInputSchema>;

const ChatWithSupportOutputSchema = z.object({
  aiResponse: z.string().describe('The AI-generated response to the user.'),
});
export type ChatWithSupportOutput = z.infer<typeof ChatWithSupportOutputSchema>;

export async function chatWithSupport(input: ChatWithSupportInput): Promise<ChatWithSupportOutput> {
  return customerSupportChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSupportChatPrompt',
  input: {schema: ChatWithSupportInputSchema},
  output: {schema: ChatWithSupportOutputSchema},
  tools: [getProductInformation], // Add the tool to the prompt
  prompt: `You are a friendly and helpful customer support agent for CommerceZen, an e-commerce store.
Your goal is to assist users with their questions about products, orders, shipping, returns, or any other general inquiries related to CommerceZen.
Keep your responses concise, polite, and informative.

If the user asks a question about a specific product (e.g., its price, description, features), you MUST use the 'getProductInformation' tool to find details about it.
- When using the 'getProductInformation' tool, provide the product name as accurately as possible based on the user's query.
- If the product is found using the tool, present the information (like name, description, price, category) clearly to the user. For price, make sure to state it's in INR.
- If the product is not found using the tool (tool returns null), inform the user that you couldn't find details for that specific product and suggest they browse the store or try a different product name.

For questions not related to specific product details (e.g., general store policies, order status if tools for that were available), answer them based on your general knowledge or if other relevant tools were provided.
If you don't know the answer and no tool can help, politely say so and suggest they contact human support if necessary (though for now, you are the primary support).

Conversation History:
{{#each conversationHistory}}
{{this.role}}: {{this.content}}
{{/each}}

User: {{{userInput}}}
AI Response:`,
});

const customerSupportChatFlow = ai.defineFlow(
  {
    name: 'customerSupportChatFlow',
    inputSchema: ChatWithSupportInputSchema,
    outputSchema: ChatWithSupportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        // Fallback response or error handling
        return { aiResponse: "I'm sorry, I couldn't process your request at the moment. Please try again." };
    }
    // Ensure aiResponse is a string. The schema expects a string.
    return { aiResponse: output.aiResponse };
  }
);
