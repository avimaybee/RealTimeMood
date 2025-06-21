"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  recordContribution: (mood: Mood, position: { x: number; y: number }) => void;
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
  
  const recordContribution = useCallback((mood: Mood, position: { x: number, y: number }) => {
    const contributorMoodColor = moodToHslString(mood);
    setAppState(prev => {
      const newContributions = [mood, ...(prev.recentContributions || [])].slice(0, 5); // Keep last 5 contributions
      return {
        ...prev,
        contributionCount: prev.contributionCount + 1,
        lastContributionTime: Date.now(),
        lastContributorMoodColor: contributorMoodColor,
        lastContributionPosition: position,
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
    const moodInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_MOODS.length);
      updateMood(PREDEFINED_MOODS[randomIndex]);
    }, 15000);

    const countInterval = setInterval(() => {
      setAppState(prev => ({
        ...prev,
        userCount: Math.max(0, prev.userCount + Math.floor(Math.random() * 10) - 4.5), // Fluctuating total user count
        contributionCount: prev.contributionCount + Math.floor(Math.random() * 5),
      }));
    }, 5000);

    const shiftInterval = setInterval(() => {
      triggerCollectiveShift();
    }, 60000); 


    return () => {
      clearInterval(moodInterval);
      clearInterval(countInterval);
      clearInterval(shiftInterval);
    };
  }, [updateMood, triggerCollectiveShift]);

  return (
    <MoodContext.Provider value={{ appState, setAppState, updateMood, recordContribution, triggerCollectiveShift, isCollectiveShifting }}>
      {children}
    </MoodContext.Provider>
  );
};
