
import type { UserProfile } from '@/types';
import { format, subDays } from 'date-fns';

/**
 * Fetches a user's profile from localStorage.
 * @param userId The UID of the user.
 * @returns A promise that resolves to the user's profile or null if not found.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const stored = localStorage.getItem(`userProfile_${userId}`);
    if (stored) {
      return JSON.parse(stored) as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Mock function to update a user's mood streak.
 * @param transaction Mock transaction parameter (not used).
 * @param userId The UID of the user.
 */
export async function updateUserStreak(transaction: any, userId: string): Promise<void> {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  try {
    const existing = localStorage.getItem(`userProfile_${userId}`);
    let userProfile: UserProfile;

    if (!existing) {
      // First contribution ever for this user.
      userProfile = {
        uid: userId,
        currentStreak: 1,
        lastContributionDate: todayStr,
      };
    } else {
      userProfile = JSON.parse(existing);
      const lastDate = userProfile.lastContributionDate;

      if (lastDate === todayStr) {
        // Multiple contributions on the same day, do nothing to the streak.
        return;
      }

      let newStreak = userProfile.currentStreak;

      if (lastDate === yesterdayStr) {
        // Contribution on a consecutive day, increment streak.
        newStreak += 1;
      } else {
        // Missed a day, reset streak to 1.
        newStreak = 1;
      }

      userProfile.currentStreak = newStreak;
      userProfile.lastContributionDate = todayStr;
    }

    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(userProfile));
  } catch (error) {
    console.error('Failed to update user streak:', error);
  }
}
