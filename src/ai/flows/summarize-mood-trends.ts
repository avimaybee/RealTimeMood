
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
  summary: z.string().describe('A concise, insightful summary of the mood trends observed in the data. The tone should be like a data analyst presenting findings. It should be about 2-3 sentences long.'),
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
    You are a data analyst and psychologist tasked with analyzing collective mood data.
    Based on the following daily dominant mood hues over the last 30 days, provide a concise, 2-3 sentence summary of the trend.
    Identify the overall dominant hue for the period. For example, if many days are around hue 210 (blue), the collective mood was generally calm. If they are around 60 (yellow), it was joyful.
    
    Data:
    {{#each historyData}}
    - Date: {{date}}, Hue: {{hue}}
    {{/each}}
    
    Analyze this data and provide your summary and the calculated dominant hue.
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
