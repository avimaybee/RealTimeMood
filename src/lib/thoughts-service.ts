// Mock thoughts service - no Firebase dependencies

/**
 * Mock function to increment the 'likes' count of a community quote.
 * @param quoteId The ID of the quote.
 */
export async function incrementLike(quoteId: string): Promise<void> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    // Mock success - no actual operation needed
  } catch (error) {
    console.error("Error incrementing like count: ", error);
    throw new Error("Could not update like count.");
  }
}

/**
 * Mock function to decrement the 'likes' count of a community quote.
 * @param quoteId The ID of the quote.
 */
export async function decrementLike(quoteId: string): Promise<void> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    // Mock success - no actual operation needed
  } catch (error) {
    console.error("Error decrementing like count: ", error);
    throw new Error("Could not update like count.");
  }
}

/**
 * Mock function to set the user's typing status.
 * @param userId The UID of the user.
 */
export async function setTypingStatus(userId: string): Promise<void> {
  if (!userId) return;
  try {
    // Mock typing status - no actual operation needed
    // Could store in localStorage if needed for persistence
  } catch (error) {
    console.error("Error setting typing status:", error);
    // It's a non-critical feature, so we don't re-throw.
  }
}

/**
 * Mock function to clear the user's typing status.
 * @param userId The UID of the user.
 */
export async function clearTypingStatus(userId: string): Promise<void> {
  if (!userId) return;
  try {
    // Mock clear typing status - no actual operation needed
  } catch (error) {
    console.error("Error clearing typing status:", error);
    // It's a non-critical feature, so we don't re-throw.
  }
}