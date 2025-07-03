'use server';
/**
 * @fileOverview An AI flow to generate a personalized mood improvement suggestion.
 *
 * - getMoodSuggestion - A function that takes a user's mood and returns a gentle, actionable suggestion.
 * - MoodSuggestionInput - The input type for the getMoodSuggestion function.
 * - MoodSuggestionOutput - The return type for the getMoodSuggestion function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MoodSuggestionInputSchema = z.object({
  moodAdjective: z.string().describe("The primary adjective describing the user's current mood (e.g., 'Sad', 'Anxious', 'Happy')."),
});
export type MoodSuggestionInput = z.infer<typeof MoodSuggestionInputSchema>;

const MoodSuggestionOutputSchema = z.object({
  title: z.string().describe("A short, encouraging title for the suggestion, like 'A Moment of Calm' or 'A Quick Reset'."),
  suggestion: z.string().describe("A single, simple, safe, and actionable micro-suggestion (1-2 sentences). This should NOT be professional medical or psychological advice."),
});
export type MoodSuggestionOutput = z.infer<typeof MoodSuggestionOutputSchema>;

export async function getMoodSuggestion(input: MoodSuggestionInput): Promise<MoodSuggestionOutput> {
  // Do not generate suggestions for positive moods to avoid being intrusive.
  const positiveMoods = ['Happy', 'Enthusiastic', 'Passionate', 'Compassionate', 'Peaceful', 'Imaginative'];
  if (positiveMoods.includes(input.moodAdjective)) {
    // Rejecting the promise is a clean way to signal that no suggestion should be shown.
    return Promise.reject(new Error('Suggestion not needed for positive mood.'));
  }
  return moodSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodSuggestionPrompt',
  input: { schema: MoodSuggestionInputSchema },
  output: { schema: MoodSuggestionOutputSchema },
  prompt: `
    You are an empathetic and caring friend. A user has shared that they are feeling "{{moodAdjective}}".
    Your task is to provide a single, simple, positive, and actionable micro-suggestion that could help them in this moment.

    **CRITICAL INSTRUCTIONS:**
    1.  **DO NOT PROVIDE MEDICAL ADVICE.** Do not use words like "treatment," "therapy," "disorder," or "diagnose."
    2.  **BE SAFE AND GENERAL.** Suggestions should be universally safe, like breathing exercises, a short walk, listening to music, or simple grounding techniques. Avoid anything physically strenuous or that assumes a specific environment.
    3.  **KEEP IT SHORT AND SIMPLE.** The suggestion should be something that can be done in 1-5 minutes. The entire response should be 1-2 sentences.
    4.  **TONE:** Your tone must be gentle, supportive, and encouraging, not clinical or demanding.

    **Examples:**
    - If mood is "Sad":
      Title: "A Gentle Pause"
      Suggestion: "Allow yourself a moment. Maybe listen to a comforting song or wrap yourself in a warm blanket."
    - If mood is "Anxious":
      Title: "A Quick Grounding"
      Suggestion: "Try the 5-4-3-2-1 technique: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
    - If mood is "Reflective" or "Gray":
      Title: "A Moment to Center"
      Suggestion: "Take a few deep, slow breaths. Notice the feeling of your feet on the floor and just be present for a moment."

    Now, generate a title and suggestion for the mood: "{{moodAdjective}}".
  `,
});

const moodSuggestionFlow = ai.defineFlow(
  {
    name: 'moodSuggestionFlow',
    inputSchema: MoodSuggestionInputSchema,
    outputSchema: MoodSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a suggestion from the AI model.');
    }
    return output;
  }
);
