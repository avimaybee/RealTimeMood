import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import type { Mood, CollectiveMoodState, SimpleMood } from '@/types';
import { averageHsl, findClosestMood, PREDEFINED_MOODS } from './colorUtils';

const COLLECTIVE_MOOD_DOC_PATH = 'appState/collectiveMood';
const MAX_RECENT_MOODS = 20;
const MILESTONES = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

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

      // 1. Determine the starting state (either existing data or a fresh initial state)
      let oldState: CollectiveMoodState;

      if (collectiveMoodDoc.exists()) {
        oldState = collectiveMoodDoc.data() as CollectiveMoodState;
      } else {
        // If the document doesn't exist, create a default initial state.
        const initialMood = PREDEFINED_MOODS[0];
        oldState = {
          h: initialMood.hue,
          s: initialMood.saturation,
          l: initialMood.lightness,
          moodAdjective: initialMood.adjective,
          totalContributions: 0,
          lastMoods: [], // Start with an empty array
          isBigBoomActive: false,
          celebratedMilestones: [],
          lastUpdated: null, // No previous update
        };
      }
      
      // 2. Perform all calculations based on the old state and the new mood
      const newTotalContributions = oldState.totalContributions + 1;
      
      const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };
      // Prepend the new mood to the old list of moods, ensuring it's an array
      const recentMoods = [newSimpleMood, ...(oldState.lastMoods || [])].slice(0, MAX_RECENT_MOODS);
      
      const { h, s, l } = averageHsl(recentMoods);
      const newAdjective = findClosestMood(h).adjective;

      // Ensure celebratedMilestones is an array before spreading
      const newCelebratedMilestones = [...(oldState.celebratedMilestones || [])];
      const milestoneCrossed = MILESTONES.find(m => newTotalContributions === m);

      // Add the new milestone if it was crossed and not already celebrated
      if (milestoneCrossed && !newCelebratedMilestones.includes(milestoneCrossed)) {
        newCelebratedMilestones.push(milestoneCrossed);
      }

      // 3. Construct the complete new state object to be written
      const newState: CollectiveMoodState = {
        h,
        s,
        l,
        moodAdjective: newAdjective,
        totalContributions: newTotalContributions,
        lastMoods: recentMoods,
        lastUpdated: serverTimestamp(),
        isBigBoomActive: false, // Reset or implement logic as needed
        celebratedMilestones: newCelebratedMilestones,
      };

      // 4. Write the entire new state back using .set(). This works for both creating and overwriting.
      transaction.set(collectiveMoodRef, newState);
    });
  } catch (error) {
    console.error("Mood submission transaction failed: ", error);
    // Rethrow the error so the calling function can handle it, e.g., show a toast
    throw new Error("Failed to submit mood. Please try again.");
  }
}

/**
 * Updates a user's activity heartbeat in Firestore.
 * This is used to track "active" users.
 * @param sessionId - The anonymous identifier for the user's session.
 */
export async function updateUserActivity(sessionId: string): Promise<void> {
  const userActivityRef = doc(db, 'userActivity', sessionId);
  try {
    await setDoc(userActivityRef, {
      sessionId: sessionId,
      lastActive: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("User activity heartbeat failed: ", error);
  }
}
