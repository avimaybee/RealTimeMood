'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Atomically increments the 'likes' count of a community quote.
 * If the 'likes' field does not exist, it will be created and set to 1.
 * @param quoteId The ID of the quote document in the 'communityQuotes' collection.
 */
export async function incrementLike(quoteId: string): Promise<void> {
  const quoteRef = doc(db, 'communityQuotes', quoteId);
  try {
    await updateDoc(quoteRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing like count: ", error);
    // Re-throw the error to be handled by the calling component (e.g., to show a toast)
    throw new Error("Could not update like count.");
  }
}

/**
 * Atomically decrements the 'likes' count of a community quote.
 * @param quoteId The ID of the quote document in the 'communityQuotes' collection.
 */
export async function decrementLike(quoteId: string): Promise<void> {
  const quoteRef = doc(db, 'communityQuotes', quoteId);
  try {
    await updateDoc(quoteRef, {
      likes: increment(-1)
    });
  } catch (error) {
    console.error("Error decrementing like count: ", error);
    // Re-throw the error to be handled by the calling component (e.g., to show a toast)
    throw new Error("Could not update like count.");
  }
}

/**
 * Sets the user's status as 'typing' in Firestore.
 * @param userId The UID of the user.
 */
export async function setTypingStatus(userId: string): Promise<void> {
  if (!userId) return;
  const typingRef = doc(db, 'typingUsers', userId);
  try {
    // Set a document with a server timestamp to mark the last time the user typed.
    await setDoc(typingRef, {
      lastTyped: serverTimestamp()
    });
  } catch (error) {
    console.error("Error setting typing status:", error);
    // It's a non-critical feature, so we don't re-throw.
  }
}

/**
 * Clears the user's 'typing' status from Firestore.
 * @param userId The UID of the user.
 */
export async function clearTypingStatus(userId: string): Promise<void> {
  if (!userId) return;
  const typingRef = doc(db, 'typingUsers', userId);
  try {
    await deleteDoc(typingRef);
  } catch (error) {
    console.error("Error clearing typing status:", error);
     // It's a non-critical feature, so we don't re-throw.
  }
}
