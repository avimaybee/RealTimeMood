import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { Mood, CollectiveMoodState, SimpleMood } from '@/types';
import { averageHsl, findClosestMood, PREDEFINED_MOODS } from './colorUtils';

const COLLECTIVE_MOOD_DOC_PATH = 'appState/collectiveMood';
const MAX_RECENT_MOODS = 20; // The number of recent moods to average over

/**
 * Submits a user's mood to Firestore and updates the collective mood state
 * within a transaction to ensure atomicity.
 * @param mood - The mood object selected by the user.
 * @param sessionId - An anonymous identifier for the user's session.
 */
export async function submitMood(mood: Mood, sessionId: string): Promise<void> {
  const collectiveMoodRef = doc(db, COLLECTIVE_MOOD_DOC_PATH);

  try {
    await runTransaction(db, async (transaction) => {
      const collectiveMoodDoc = await transaction.get(collectiveMoodRef);

      let currentData: Partial<CollectiveMoodState>;

      if (!collectiveMoodDoc.exists()) {
        // Initialize the document if it doesn't exist
        const initialMood = PREDEFINED_MOODS[0];
        currentData = {
          h: initialMood.hue,
          s: initialMood.saturation,
          l: initialMood.lightness,
          moodAdjective: initialMood.adjective,
          totalContributions: 0,
          lastMoods: [{ h: mood.hue, s: mood.saturation, l: mood.lightness }],
        };
      } else {
        currentData = collectiveMoodDoc.data() as CollectiveMoodState;
      }
      
      // Update last moods array
      const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };
      const recentMoods = [newSimpleMood, ...(currentData.lastMoods || [])].slice(0, MAX_RECENT_MOODS);
      
      // Calculate new average HSL
      const { h, s, l } = averageHsl(recentMoods);
      
      // Find the closest adjective for the new mood
      const newAdjective = findClosestMood(h).adjective;

      // Prepare the data to be written
      const newData = {
        h,
        s,
        l,
        moodAdjective: newAdjective,
        totalContributions: (currentData.totalContributions || 0) + 1,
        lastMoods: recentMoods,
        lastUpdated: serverTimestamp(),
      };

      // Write the updated data back
      if (!collectiveMoodDoc.exists()) {
        transaction.set(collectiveMoodRef, newData);
      } else {
        transaction.update(collectiveMoodRef, newData as any);
      }
    });
  } catch (error) {
    console.error("Mood submission transaction failed: ", error);
    // Rethrow the error so the calling function can handle it, e.g., show a toast
    throw new Error("Failed to submit mood. Please try again.");
  }
}
