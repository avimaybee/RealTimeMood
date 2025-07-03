'use server';

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

      // 1. Define a complete, default initial state to guard against malformed data.
      const initialMood = PREDEFINED_MOODS[0];
      const defaultState: CollectiveMoodState = {
        h: initialMood.hue,
        s: initialMood.saturation,
        l: initialMood.lightness,
        moodAdjective: initialMood.adjective,
        totalContributions: 0,
        lastMoods: [],
        isBigBoomActive: false,
        celebratedMilestones: [],
        lastUpdated: null,
      };

      // 2. Create a safe 'oldState' by merging the fetched data over the defaults.
      // This ensures all properties exist, preventing runtime errors.
      const fetchedData = collectiveMoodDoc.exists() ? collectiveMoodDoc.data() : {};
      const oldState: CollectiveMoodState = {
        ...defaultState,
        ...fetchedData,
        // Ensure arrays are properly initialized
        lastMoods: Array.isArray(fetchedData?.lastMoods) ? fetchedData.lastMoods : [],
        celebratedMilestones: Array.isArray(fetchedData?.celebratedMilestones) ? fetchedData.celebratedMilestones : [],
      };

      // 3. Perform calculations on the safe oldState.
      const newTotalContributions = oldState.totalContributions + 1;
      const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };
      
      // Add the new mood to recent moods
      const recentMoods = [newSimpleMood, ...oldState.lastMoods].slice(0, MAX_RECENT_MOODS);
      const { h, s, l } = averageHsl(recentMoods);
      const newAdjective = findClosestMood(h).adjective;

      // Handle milestones
      const newCelebratedMilestones = [...oldState.celebratedMilestones];
      const milestoneCrossed = MILESTONES.find(m => newTotalContributions === m);

      if (milestoneCrossed && !newCelebratedMilestones.includes(milestoneCrossed)) {
        newCelebratedMilestones.push(milestoneCrossed);
      }
      
      // 4. Construct the complete new state object to be written.
      const newState: CollectiveMoodState = {
        h,
        s,
        l,
        moodAdjective: newAdjective,
        totalContributions: newTotalContributions,
        lastMoods: recentMoods,
        lastUpdated: serverTimestamp(),
        celebratedMilestones: newCelebratedMilestones,
        isBigBoomActive: oldState.isBigBoomActive, // Preserve existing value
      };

      // 5. Write the new state. This works for both creating and overwriting.
      transaction.set(collectiveMoodRef, newState);
    });
  } catch (error) {
    console.error("Mood submission transaction failed: ", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'No code',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
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
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : 'No code'
    });
  }
}
