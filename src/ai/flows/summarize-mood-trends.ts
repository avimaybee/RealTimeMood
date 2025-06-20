'use server';
/**
 * @fileOverview Summarizes historical mood trends to provide insights into how the collective mood has evolved over time.
 *
 * - summarizeMoodTrends - A function that generates a summary of historical mood trends.
 * - SummarizeMoodTrendsInput - The input type for the summarizeMoodTrends function.
 * - SummarizeMoodTrendsOutput - The return type for the summarizeMoodTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMoodTrendsInputSchema = z.object({
  moodData: z
    .string()
    .describe(
      'A string containing historical mood data, formatted as a JSON array of objects with timestamp and mood properties.'
    ),
});
export type SummarizeMoodTrendsInput = z.infer<typeof SummarizeMoodTrendsInputSchema>;

const SummarizeMoodTrendsOutputSchema = z.object({
  summary: z.string().describe('A concise, AI-generated summary of the historical mood trends.'),
});
export type SummarizeMoodTrendsOutput = z.infer<typeof SummarizeMoodTrendsOutputSchema>;

export async function summarizeMoodTrends(input: SummarizeMoodTrendsInput): Promise<SummarizeMoodTrendsOutput> {
  return summarizeMoodTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMoodTrendsPrompt',
  input: {schema: SummarizeMoodTrendsInputSchema},
  output: {schema: SummarizeMoodTrendsOutputSchema},
  prompt: `You are an AI assistant that summarizes historical mood trends data.

You will receive mood data as a JSON array of objects, each with a timestamp and mood property.

Your task is to analyze this data and provide a concise, AI-generated summary of the trends over time.

Mood Data: {{{moodData}}}`,
});

const summarizeMoodTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeMoodTrendsFlow',
    inputSchema: SummarizeMoodTrendsInputSchema,
    outputSchema: SummarizeMoodTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
