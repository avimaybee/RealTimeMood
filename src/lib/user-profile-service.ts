
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, type Transaction } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import { format, subDays } from 'date-fns';

const USER_PROFILES_COLLECTION = 'userProfiles';

/**
 * Fetches a user's profile from Firestore.
 * @param userId The UID of the user.
 * @returns A promise that resolves to the user's profile or null if not found.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Updates a user's mood streak within a Firestore transaction.
 * This function should be called by another service that already initiated a transaction.
 * @param transaction The active Firestore transaction.
 * @param userId The UID of the user.
 */
export async function updateUserStreak(transaction: Transaction, userId: string): Promise<void> {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  const profileRef = doc(db, USER_PROFILES_COLLECTION, userId);
  const profileDoc = await transaction.get(profileRef);

  if (!profileDoc.exists()) {
    // First contribution ever for this user.
    const newUserProfile: UserProfile = {
      uid: userId,
      currentStreak: 1,
      lastContributionDate: todayStr,
    };
    transaction.set(profileRef, newUserProfile);
  } else {
    const userProfile = profileDoc.data() as UserProfile;
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

    const updatedProfile: Partial<UserProfile> = {
      currentStreak: newStreak,
      lastContributionDate: todayStr,
    };
    transaction.update(profileRef, updatedProfile);
  }
}
