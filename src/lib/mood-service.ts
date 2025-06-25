
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Mood, CollectiveMoodState, SimpleMood } from '@/types';
import { averageHsl, findClosestMood, PREDEFINED_MOODS } from './colorUtils';

const COLLECTIVE_MOOD_DOC_PATH = 'appState/collectiveMood';
const MAX_RECENT_MOODS = 20; // The number of recent moods to average over
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
          isBigBoomActive: false,
          celebratedMilestones: [],
        };
      } else {
        currentData = collectiveMoodDoc.data() as CollectiveMoodState;
      }
      
      const newTotalContributions = (currentData.totalContributions || 0) + 1;
      
      // Update last moods array, ensuring data is clean
      const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };
      
      // Sanitize the mood data from Firestore before using it
      const sanitizedLastMoods = (currentData.lastMoods || []).filter(
        (m): m is SimpleMood => m && typeof m.h === 'number' && typeof m.s === 'number' && typeof m.l === 'number'
      );

      const recentMoods = [newSimpleMood, ...sanitizedLastMoods].slice(0, MAX_RECENT_MOODS);
      
      // Calculate new average HSL
      const { h, s, l } = averageHsl(recentMoods);
      
      // Find the closest adjective for the new mood
      const newAdjective = findClosestMood(h).adjective;

      // Milestone celebration logic
      const celebratedMilestones = currentData.celebratedMilestones || [];
      const newCelebratedMilestones = [...celebratedMilestones];
      const milestoneCrossed = MILESTONES.find(m => newTotalContributions === m);

      if (milestoneCrossed && !celebratedMilestones.includes(milestoneCrossed)) {
        newCelebratedMilestones.push(milestoneCrossed);
      }

      // Prepare the data to be written
      const newData = {
        h,
        s,
        l,
        moodAdjective: newAdjective,
        totalContributions: newTotalContributions,
        lastMoods: recentMoods,
        lastUpdated: serverTimestamp(),
        isBigBoomActive: false, // Ensure this field is always present to match security rules
        celebratedMilestones: newCelebratedMilestones,
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

/**
 * Updates a user's activity heartbeat in Firestore.
 * This is used to track "active" users.
 * @param sessionId - The anonymous identifier for the user's session.
 */
export async function updateUserActivity(sessionId: string): Promise<void> {
  const userActivityRef = doc(db, 'userActivity', sessionId);
  try {
    // Using set with merge is efficient for create/update operations
    await setDoc(userActivityRef, {
      sessionId: sessionId,
      lastActive: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("User activity heartbeat failed: ", error);
    // This is a background task, so we don't rethrow. We don't want to interrupt the user.
  }
}
