import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

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
