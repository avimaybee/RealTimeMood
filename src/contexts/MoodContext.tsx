
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Mood } from '@/types';
import { PREDEFINED_MOODS } from '@/lib/colorUtils';

const initialState: AppState = {
  currentMood: PREDEFINED_MOODS[0],
  userCount: 1873, // Initial mock count
  contributionCount: 12587, // Initial mock count
  lastContributionTime: null,
  lastContributorMoodColor: null,
};

const MoodContext = createContext<{
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  updateMood: (newMood: Mood) => void;
  recordContribution: (contributorMoodColor: string) => void;
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
  
  const recordContribution = useCallback((contributorMoodColor: string) => {
    setAppState(prev => ({
      ...prev,
      contributionCount: prev.contributionCount + 1,
      lastContributionTime: Date.now(),
      lastContributorMoodColor: contributorMoodColor,
    }));
    // Reset lastContributorMoodColor after a delay to allow ripple animation to finish
    setTimeout(() => {
      setAppState(prev => ({...prev, lastContributorMoodColor: null}));
    }, 2000); // matches ripple animation duration
  }, []);

  const triggerCollectiveShift = useCallback(() => {
    setIsCollectiveShifting(true);
    // Simulate shift effects then reset
    // UI elements (Header, Orb, Footer) should also react to this
    setTimeout(() => setIsCollectiveShifting(false), 2000); // Duration of the shift wave
  }, []);

  // Simulate dynamic changes for demonstration
  useEffect(() => {
    const moodInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_MOODS.length);
      updateMood(PREDEFINED_MOODS[randomIndex]);
    }, 15000); // Change mood every 15 seconds

    const countInterval = setInterval(() => {
      setAppState(prev => ({
        ...prev,
        userCount: prev.userCount + Math.floor(Math.random() * 10) - 4, // Fluctuating user count
        contributionCount: prev.contributionCount + Math.floor(Math.random() * 5),
      }));
    }, 5000); // Update counts every 5 seconds

    // Occasional collective shift
    const shiftInterval = setInterval(() => {
      triggerCollectiveShift();
    }, 60000); // Collective shift every minute


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
