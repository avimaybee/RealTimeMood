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
