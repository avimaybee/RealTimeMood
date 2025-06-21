
"use client";
import type { ReactNode } from 'react';
import React, { useRef } from 'react';
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
  const lastPulsedHueRef = useRef<number>(initialState.currentMood.hue);

  const triggerCollectiveShift = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 30, 100]); // Short, intense rumble
    }

    setIsCollectiveShifting(true);
    setTimeout(() => setIsCollectiveShifting(false), 1500); // Duration of shockwave animation
  }, []);

  const updateMood = useCallback((newMood: Mood) => {
    const hueDifference = Math.abs(newMood.hue - lastPulsedHueRef.current);
    const wrappedHueDifference = Math.min(hueDifference, 360 - hueDifference);
    
    if (wrappedHueDifference > 15) {
      triggerCollectiveShift();
      lastPulsedHueRef.current = newMood.hue;
    }

    setAppState(prev => ({ ...prev, currentMood: newMood }));
  }, [triggerCollectiveShift]);

  const recordContribution = useCallback((mood: Mood, position: { x: number, y: number } | null) => {
    const contributorMoodColor = moodToHslString(mood);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); 
    }

    setAppState(prev => {
      const newContributions = [mood, ...(prev.recentContributions || [])].slice(0, 5);
      return {
        ...prev,
        contributionCount: prev.contributionCount + 1,
        lastContributionTime: Date.now(),
        lastContributorMoodColor: contributorMoodColor,
        lastContributionPosition: position,
        recentContributions: newContributions,
      };
    });
    setTimeout(() => {
      setAppState(prev => ({
          ...prev,
          lastContributorMoodColor: null,
          lastContributionPosition: null,
        }));
    }, 2000);
  }, []);

  useEffect(() => {
    const moodInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PREDEFINED_MOODS.length);
      const newMood = PREDEFINED_MOODS[randomIndex];
      updateMood(newMood);
      
      if (Math.random() > 0.5) {
          recordContribution(newMood, null);
      }

    }, 5000); // Check for mood changes more frequently

    const countInterval = setInterval(() => {
      setAppState(prev => ({
        ...prev,
        userCount: Math.max(0, prev.userCount + Math.floor(Math.random() * 10) - 4.5),
      }));
    }, 5000);
    
    return () => {
      clearInterval(moodInterval);
      clearInterval(countInterval);
    };
  }, [updateMood, recordContribution]);

  return (
    <MoodContext.Provider value={{ appState, setAppState, updateMood, recordContribution, triggerCollectiveShift, isCollectiveShifting }}>
      {children}
    </MoodContext.Provider>
  );
};
