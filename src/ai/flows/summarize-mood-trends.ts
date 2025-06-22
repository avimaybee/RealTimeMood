
'use server';
/**
 * @fileOverview An AI flow to analyze and summarize historical mood data.
 *
 * - summarizeTrends - A function that takes historical mood data and returns a textual summary and the dominant hue.
 * - SummarizeTrendsInput - The input type for the summarizeTrends function.
 * - SummarizeTrendsOutput - The return type for the summarizeTrends function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendDataPointSchema = z.object({
  date: z.string(),
  hue: z.number().min(0).max(360),
});

const SummarizeTrendsInputSchema = z.object({
  historyData: z.array(TrendDataPointSchema).describe('An array of historical mood data points, each with a date and a color hue (0-360).'),
});
export type SummarizeTrendsInput = z.infer<typeof SummarizeTrendsInputSchema>;

const SummarizeTrendsOutputSchema = z.object({
  summary: z.string().describe('A concise, poetic, and insightful summary of the mood trends. The tone should be human and reflective, focusing on the emotional journey. It should be about 2-3 sentences long.'),
  dominantHue: z.number().min(0).max(360).describe('The single numerical hue value (0-360) that best represents the overall dominant mood of the entire period.'),
});
export type SummarizeTrendsOutput = z.infer<typeof SummarizeTrendsOutputSchema>;

export async function summarizeTrends(input: SummarizeTrendsInput): Promise<SummarizeTrendsOutput> {
  return summarizeTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrendsPrompt',
  input: { schema: SummarizeTrendsInputSchema },
  output: { schema: SummarizeTrendsOutputSchema },
  prompt: `
    You are an empathetic AI who analyzes mood data. Your task is to interpret historical mood data and weave it into a short, insightful narrative (2-3 sentences).

    **Core Instructions:**
    - **Speak in terms of emotions:** Use words like "joy," "calm," "energy," "focus." Avoid technical terms like "hue" or "color values."
    - **Describe the emotional journey:** Describe the flow of feelings. For example: "A wave of creative energy marked the beginning of the period, settling into quiet calm before ending on a hopeful note."
    - **Tone:** Be reflective, insightful, and a little poetic.
    - **Your response must be grammatically correct.**

    **Mood Reference (Hue -> Emotion):**
    - ~0: Passionate
    - ~30: Energetic
    - ~54: Joyful
    - ~130: Peaceful
    - ~180: Hopeful
    - ~210: Calm
    - ~240: Focused
    - ~260: Anxious
    - ~300: Creative

    **Data to Analyze:**
    {{#each historyData}}
    - Date: {{date}}, Hue: {{hue}}
    {{/each}}
    
    Provide your insightful summary and the calculated dominant hue.
  `,
});

const summarizeTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeTrendsFlow',
    inputSchema: SummarizeTrendsInputSchema,
    outputSchema: SummarizeTrendsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a summary from the AI model.');
    }
    return output;
  }
);
