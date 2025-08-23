// Mock Firebase configuration for frontend-only mode
export const db = null; // Not used in frontend-only mode
export const auth = {
  currentUser: { uid: 'mock-user-id', isAnonymous: true }
};

// Mock functions that return promises for compatibility
export const signInAnonymously = async () => ({ user: { uid: 'mock-user-id', isAnonymous: true } });
export const onAuthStateChanged = (callback: (user: any) => void) => {
  callback({ uid: 'mock-user-id', isAnonymous: true });
  return () => {}; // unsubscribe function
};

// Export empty functions for any remaining imports
export const doc = () => ({});
export const onSnapshot = () => () => {};
export const collection = () => ({});
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const getDocs = async () => ({ docs: [], empty: true });
export const addDoc = async () => ({});
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const runTransaction = async () => {};
export const serverTimestamp = () => new Date();
export const Timestamp = { now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }) };

// Mock analytics function
export function initializeAnalytics() {
  // No-op for frontend-only mode
}

// Mock other Firebase exports
export const app = {};
export const GoogleAuthProvider = {};
export const signInWithPopup = async () => ({});
export const linkWithCredential = async () => ({});
export const signOut = async () => {};
export type User = { uid: string; isAnonymous: boolean };