'use server';
/**
 * @fileOverview An AI agent for generating context-aware guidance questions for milk procurement staff.
 *
 * - generateGuidance - A function that generates helpful questions based on form context.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuidanceInputSchema = z.object({
  context: z.string().describe('The current content or type of information being entered by the user.'),
  formType: z.enum(['daily-report', 'task', 'breakdown', 'center']).describe('The type of form being filled.'),
});
export type GuidanceInput = z.infer<typeof GuidanceInputSchema>;

const GuidanceOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of 3-4 helpful, concise questions or prompts in Marathi.'),
});
export type GuidanceOutput = z.infer<typeof GuidanceOutputSchema>;

export async function generateGuidance(input: GuidanceInput): Promise<GuidanceOutput> {
  return generateGuidanceFlow(input);
}

const guidancePrompt = ai.definePrompt({
  name: 'guidancePrompt',
  input: {schema: GuidanceInputSchema},
  output: {schema: GuidanceOutputSchema},
  prompt: `You are an expert AI assistant for a Milk Procurement Management app called "संकलन नोंदवही". 
Your goal is to help procurement officers enter more detailed and accurate data by suggesting 3-4 intelligent, concise questions or prompts.

Context: """{{{context}}}"""
Form Type: {{{formType}}}

Instructions:
1. Provide the output in Marathi.
2. The questions should help the user think about quality, logistics, supplier satisfaction, and operational efficiency.
3. Be professional yet supportive.
4. If the user has entered very little text, suggest broad starting questions.
5. If the user has entered detailed text, suggest specific follow-up or auditing questions.

Form Specifics:
- Daily Report: Focus on route timing, milk quality, and farmer feedback.
- Task: Focus on priority, required resources, and deadlines.
- Breakdown: Focus on salvage value, estimated repair time, and root cause.
`,
});

const generateGuidanceFlow = ai.defineFlow(
  {
    name: 'generateGuidanceFlow',
    inputSchema: GuidanceInputSchema,
    outputSchema: GuidanceOutputSchema,
  },
  async input => {
    const {output} = await guidancePrompt(input);
    return output!;
  }
);
