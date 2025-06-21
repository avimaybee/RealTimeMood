
"use client";
import type { ReactNode } from 'react';
import React, from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Mood } from '@/types';
import { PREDEFINED_MOODS, moodToHslString } from '@/lib/colorUtils';

const initialTotalUserCount = 1873;
const initialState: AppState = {
  currentMood: PREDEFINED_MOODS[0],
  userCount: initialTotalUserCount,
  contributionCount: 12587,
  lastContributionTime: null,
  lastContributorMoodColor: null,
  lastContributionPosition: null,
  recentContributions: [PREDEFINED_MOODS[0]],
};

const MoodContext = createContext<{
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  updateMood: (newMood: Mood) => void;
  recordContribution: (mood: Mood, position: { x: number; y: number } | null) => void;
  triggerCollectiveShift: () => void;
  isCollectiveShifting: boolean;
}>({
  appState: initialState,
  setAppState: () => {},
  updateMood: () => {},
  recordContribution: () => {},
  triggerCollectiveShift: () => {},
  isCollectiveShifting: false,
});

export const useMood = () => useContext(MoodContext);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isCollectiveShifting, setIsCollectiveShifting] = useState(false);

  const updateMood = useCallback((newMood: Mood) => {
    setAppState(prev => ({ ...prev, currentMood: newMood }));
  }, []);

  const recordContribution = useCallback((mood: Mood, position: { x: number, y: number } | null) => {
    const contributorMoodColor = moodToHslString(mood);
    
    // Trigger haptics for the unified ripple
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Vibration.impact(medium) equivalent
    }

    setAppState(prev => {
      const newContributions = [mood, ...(prev.recentContributions || [])].slice(0, 5); // Keep last 5 contributions
      return {
        ...prev,
        contributionCount: prev.contributionCount + 1,
        lastContributionTime: Date.now(),
        lastContributorMoodColor: contributorMoodColor,
        lastContributionPosition: position, // Can be null for global events
        recentContributions: newContributions,
      };
    });
    // Reset after a delay to allow ripple animation to finish
    setTimeout(() => {
      setAppState(prev => ({
          ...prev,
          lastContributorMoodColor: null,
          lastContributionPosition: null,
        }));
    }, 2000);
  }, []);

  const triggerCollectiveShift = useCallback(() => {
    setIsCollectiveShifting(true);
    setTimeout(() => setIsCollectiveShifting(false), 2000);
  }, []);

  useEffect(() => {
    // This interval now simulates both mood changes and global contributions
    const moodInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_MOODS.length);
      const newMood = PREDEFINED_MOODS[randomIndex];
      updateMood(newMood);
      
      // Simulate a global contribution from another user
      if (Math.random() > 0.5) { // 50% chance each interval
          recordContribution(newMood, null); // null position for centered global ripple
      }

    }, 15000);

    const countInterval = setInterval(() => {
      setAppState(prev => ({
        ...prev,
        userCount: Math.max(0, prev.userCount + Math.floor(Math.random() * 10) - 4.5), // Fluctuating total user count
      }));
    }, 5000);
    
    // This can remain as the "Big Boom" trigger
    const shiftInterval = setInterval(() => {
      triggerCollectiveShift();
    }, 60000);


    return () => {
      clearInterval(moodInterval);
      clearInterval(countInterval);
      clearInterval(shiftInterval);
    };
  }, [updateMood, recordContribution, triggerCollectiveShift]);

  return (
    <MoodContext.Provider value={{ appState, setAppState, updateMood, recordContribution, triggerCollectiveShift, isCollectiveShifting }}>
      {children}
    </MoodContext.Provider>
  );
};
