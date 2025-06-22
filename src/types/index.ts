import type { FieldValue } from 'firebase/firestore';

export interface Mood {
  hue: number;
  saturation: number;
  lightness: number;
  name: string;
  adjective: string; // e.g., "Joyful", "Calm", "Energetic"
}

export interface AppState {
  currentMood: Mood;
  userCount: number; 
  contributionCount: number;
  lastContributionTime: number | null;
  lastContributorMoodColor: string | null; // HSL string for the ripple
  lastContributionPosition: { x: number; y: number } | null;
  recentContributions?: Mood[];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

/**
 * Represents the data model for the collective mood state document in Firestore.
 * This document is located at: db.collection('appState').doc('collectiveMood')
 */
export interface CollectiveMoodState {
  h: number; // HSL hue component (0-360)
  s: number; // HSL saturation component (0-100)
  l: number; // HSL lightness component (0-100)
  moodAdjective: string;
  realUserCount: number;
  echoUserCount: number;
  totalContributions: number;
  lastUpdated: FieldValue; // Firestore serverTimestamp()
  isBigBoomActive: boolean;
}

/**
 * Represents the data model for an individual mood contribution in the 'userMoods' collection.
 * These documents are short-lived and processed by a backend function.
 */
export interface UserMood {
  hue: number;
  timestamp: FieldValue;
  sessionId: string;
  contributorColor: {
    h: number;
    s: number;
    l: number;
  };
}

/**
 * Represents the data model for a historical mood snapshot in the 'moodSnapshots' collection.
 */
export interface HistoricalMoodSnapshot {
  timestamp: FieldValue;
  hue: number;
  saturation: number;
  lightness: number;
  moodAdjective: string;
  contributionCount: number;
}
