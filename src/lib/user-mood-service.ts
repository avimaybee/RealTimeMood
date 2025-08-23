
import { format } from 'date-fns';
import type { Mood, SimpleMood, UserDailyMoodSummary } from '@/types';
import { averageHsl, findClosestMood } from './colorUtils';

/**
 * Records a user's mood contribution to their personal daily summary in localStorage.
 * @param userId The UID of the user.
 * @param mood The mood object to record.
 */
export async function recordUserMood(userId: string, mood: Mood): Promise<void> {
  if (!userId) {
    console.warn('Cannot record user mood without a userId.');
    return;
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `userMoodHistory_${userId}_${todayStr}`;

  const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };

  try {
    const existing = localStorage.getItem(storageKey);
    let summary: UserDailyMoodSummary;

    if (existing) {
      summary = JSON.parse(existing);
      const newMoods = [...summary.moods, newSimpleMood];
      const newAvgHsl = averageHsl(newMoods);

      summary = {
        ...summary,
        averageHue: newAvgHsl.h,
        averageSaturation: newAvgHsl.s,
        averageLightness: newAvgHsl.l,
        dominantAdjective: findClosestMood(newAvgHsl.h).adjective,
        contributionCount: summary.contributionCount + 1,
        moods: newMoods
      };
    } else {
      summary = {
        date: todayStr,
        averageHue: mood.hue,
        averageSaturation: mood.saturation,
        averageLightness: mood.lightness,
        dominantAdjective: mood.adjective,
        contributionCount: 1,
        moods: [newSimpleMood]
      };
    }

    localStorage.setItem(storageKey, JSON.stringify(summary));
  } catch (error) {
    console.error(`Failed to record user mood for user ${userId}:`, error);
    // Don't rethrow, as this is a background task. The main mood submission
    // for the collective can still succeed.
  }
}

/**
 * Fetches all daily mood summaries for a given user from localStorage.
 * @param userId The UID of the user.
 * @returns A promise that resolves to an array of daily summary objects.
 */
export async function fetchUserMoodHistory(userId: string): Promise<UserDailyMoodSummary[]> {
  if (!userId) return [];

  try {
    const history: UserDailyMoodSummary[] = [];
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith(`userMoodHistory_${userId}_`)) {
        try {
          const summary = JSON.parse(localStorage.getItem(key)!);
          history.push(summary);
        } catch (e) {
          console.warn('Failed to parse stored mood history:', e);
        }
      }
    });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error(`Failed to fetch mood history for user ${userId}:`, error);
    return [];
  }
}
