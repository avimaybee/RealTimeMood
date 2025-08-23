
import type { Mood, CollectiveMoodState, SimpleMood } from '@/types';
import { averageHsl, findClosestMood, PREDEFINED_MOODS } from './colorUtils';

const MAX_RECENT_MOODS = 20;
const MILESTONES = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Mock collective mood state stored in localStorage
const getStoredCollectiveMood = (): CollectiveMoodState => {
  const stored = localStorage.getItem('mockCollectiveMood');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    h: PREDEFINED_MOODS[0].hue,
    s: PREDEFINED_MOODS[0].saturation,
    l: PREDEFINED_MOODS[0].lightness,
    moodAdjective: PREDEFINED_MOODS[0].adjective,
    totalContributions: 0,
    lastMoods: [],
    celebratedMilestones: [],
    isBigBoomActive: false,
    lastUpdated: new Date()
  };
};

const saveCollectiveMood = (state: CollectiveMoodState) => {
  localStorage.setItem('mockCollectiveMood', JSON.stringify(state));
};

/**
 * Submits a user's mood to localStorage and updates the collective mood state.
 * @param mood - The mood object selected by the user.
 * @param sessionId - An anonymous identifier for the user's session.
 */
export async function submitMood(mood: Mood, sessionId: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const currentState = getStoredCollectiveMood();
  const newTotalContributions = currentState.totalContributions + 1;

  const newSimpleMood: SimpleMood = { h: mood.hue, s: mood.saturation, l: mood.lightness };

  // Ensure lastMoods is an array before spreading
  const safeLastMoods = Array.isArray(currentState.lastMoods) ? currentState.lastMoods : [];
  const recentMoods = [newSimpleMood, ...safeLastMoods].slice(0, MAX_RECENT_MOODS);

  const { h, s, l } = averageHsl(recentMoods);
  const newAdjective = findClosestMood(h).adjective;

  // Ensure celebratedMilestones is an array before spreading
  const newCelebratedMilestones = [...(Array.isArray(currentState.celebratedMilestones) ? currentState.celebratedMilestones : [])];
  const milestoneCrossed = MILESTONES.find(m => newTotalContributions === m);

  // Add the new milestone if it was crossed and not already celebrated
  if (milestoneCrossed && !newCelebratedMilestones.includes(milestoneCrossed)) {
    newCelebratedMilestones.push(milestoneCrossed);
  }

  // Construct the complete new state object
  const newState: CollectiveMoodState = {
    h,
    s,
    l,
    moodAdjective: newAdjective,
    totalContributions: newTotalContributions,
    lastMoods: recentMoods,
    lastUpdated: new Date(),
    isBigBoomActive: false,
    celebratedMilestones: newCelebratedMilestones,
  };

  saveCollectiveMood(newState);
}

/**
 * Updates a user's activity heartbeat in localStorage.
 * This is used to track "active" users.
 * @param sessionId - The anonymous identifier for the user's session.
 */
export async function updateUserActivity(sessionId: string): Promise<void> {
  // Mock user activity - just store timestamp
  localStorage.setItem('lastUserActivity', Date.now().toString());
}
