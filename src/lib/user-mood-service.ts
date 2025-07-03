'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  collection,
  runTransaction,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';
import type { Mood, SimpleMood, UserDailyMoodSummary } from '@/types';
import { averageHsl, findClosestMood } from './colorUtils';
import { updateUserStreak } from './user-profile-service';

/**
 * Records a user's mood contribution to their personal daily summary AND updates their streak.
 * This function is transactional to ensure data consistency.
 * @param userId The UID of the user.
 * @param mood The mood object to record.
 */
export async function recordUserMood(userId: string, mood: Mood): Promise<void> {
  if (!userId) {
    console.warn('Cannot record user mood without a userId.');
    return;
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const dailySummaryRef = doc(db, `userMoodHistory/${userId}/dailySummaries`, todayStr);

  const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };

  try {
    await runTransaction(db, async (transaction) => {
      // --- Part 1: Update Daily Mood Summary ---
      const dailyDoc = await transaction.get(dailySummaryRef);

      if (!dailyDoc.exists()) {
        // This is the first mood of the day for this user.
        const newSummary: UserDailyMoodSummary = {
          date: todayStr,
          averageHue: mood.hue,
          averageSaturation: mood.saturation,
          averageLightness: mood.lightness,
          dominantAdjective: mood.adjective,
          contributionCount: 1,
          moods: [newSimpleMood],
        };
        transaction.set(dailySummaryRef, newSummary);
      } else {
        // This user has already contributed today, update the summary.
        const oldSummary = dailyDoc.data() as UserDailyMoodSummary;
        const newMoods = [...oldSummary.moods, newSimpleMood];
        const newAvgHsl = averageHsl(newMoods);

        const newSummary: Partial<UserDailyMoodSummary> = {
          averageHue: newAvgHsl.h,
          averageSaturation: newAvgHsl.s,
          averageLightness: newAvgHsl.l,
          dominantAdjective: findClosestMood(newAvgHsl.h).adjective,
          contributionCount: oldSummary.contributionCount + 1,
          moods: newMoods,
        };
        transaction.update(dailySummaryRef, newSummary);
      }
      
      // --- Part 2: Update User Streak ---
      await updateUserStreak(transaction, userId);
    });
  } catch (error) {
    console.error(`Failed to record user mood for user ${userId}:`, error);
    // Don't rethrow, as this is a background task. The main mood submission
    // for the collective can still succeed.
  }
}

/**
 * Fetches all daily mood summaries for a given user.
 * @param userId The UID of the user.
 * @returns A promise that resolves to an array of daily summary objects.
 */
export async function fetchUserMoodHistory(userId: string): Promise<UserDailyMoodSummary[]> {
  if (!userId) return [];

  try {
    const summariesCollectionRef = collection(db, `userMoodHistory/${userId}/dailySummaries`);
    const querySnapshot = await getDocs(summariesCollectionRef);
    
    return querySnapshot.docs.map(doc => doc.data() as UserDailyMoodSummary);
  } catch (error) {
    console.error(`Failed to fetch mood history for user ${userId}:`, error);
    return [];
  }
}
