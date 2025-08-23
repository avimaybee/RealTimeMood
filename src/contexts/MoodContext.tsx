
"use client";
import type { ReactNode } from 'react';
import React, { useRef, useMemo } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Mood, CollectiveMoodState } from '@/types';
import { PREDEFINED_MOODS, moodToHslString, findClosestMood } from '@/lib/colorUtils';
import { submitMood, updateUserActivity } from '@/lib/mood-service';
import { recordUserMood } from '@/lib/user-mood-service';
// Firebase dependencies removed - using mock implementations

const initialTotalUserCount = 8;
const initialState: AppState = {
  currentMood: PREDEFINED_MOODS[0],
  userCount: initialTotalUserCount,
  contributionCount: 13,
  lastContributionTime: null,
  lastContributorMoodColor: null,
  lastContributionPosition: null,
  recentContributions: [PREDEFINED_MOODS[0]],
};

type MoodContextType = {
  currentMood: Mood;
  userCount: number;
  contributionCount: number;
  lastContributionTime: number | null;
  lastContributorMoodColor: string | null;
  lastContributionPosition: { x: number; y: number } | null;
  recentContributions: Mood[];
  previewMood: Mood | null;
  setPreviewMood: (mood: Mood | null) => void;
  updateMood: (newMood: Mood) => void;
  recordContribution: (mood: Mood, position: { x: number; y: number } | null, options?: { isSimulated?: boolean }) => void;
  triggerCollectiveShift: () => void;
  isCollectiveShifting: boolean;
  lastUserContribution: Mood | null;
  celebratedMilestones: number[];
  isInitialized: boolean;
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

export const MoodProvider = ({ children, isLivePage = false }: { children: ReactNode; isLivePage?: boolean; }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>(initialState.currentMood);
  const [userCount, setUserCount] = useState<number>(initialState.userCount);
  const [contributionCount, setContributionCount] = useState<number>(initialState.contributionCount);
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>([]);
  const [lastContributionTime, setLastContributionTime] = useState<number | null>(initialState.lastContributionTime);
  const [lastContributorMoodColor, setLastContributorMoodColor] = useState<string | null>(initialState.lastContributorMoodColor);
  const [lastContributionPosition, setLastContributionPosition] = useState<{ x: number; y: number } | null>(initialState.lastContributionPosition);
  const [recentContributions, setRecentContributions] = useState<Mood[]>(initialState.recentContributions || []);
  
  const [isCollectiveShifting, setIsCollectiveShifting] = useState(false);
  const [previewMood, setPreviewMood] = useState<Mood | null>(null);
  const [lastUserContribution, setLastUserContribution] = useState<Mood | null>(null);
  const lastPulsedHueRef = useRef<number>(initialState.currentMood.hue);
  const sessionIdRef = useRef<string | null>(null);
  const lastHeartbeatTimeRef = useRef<number>(0);

  // Ref to hold the latest mood for use in the simulation loop without causing re-runs
  const currentMoodRef = useRef(currentMood);
  useEffect(() => {
    currentMoodRef.current = currentMood;
  }, [currentMood]);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Generate mock session ID for frontend-only mode
    const newSessionId = crypto.randomUUID();
    sessionIdRef.current = newSessionId;
  }, []);

  // Heartbeat effect for user activity tracking
  useEffect(() => {
    if (!isLivePage || !sessionIdRef.current) return;

    const sessionId = sessionIdRef.current;
    let intervalId: NodeJS.Timeout | null = null;
    const HEARTBEAT_COOLDOWN = 15000; // 15 seconds to prevent spamming on focus/unfocus

    const heartbeat = () => {
      const now = Date.now();
      if (now - lastHeartbeatTimeRef.current < HEARTBEAT_COOLDOWN) {
        return; // Still in cooldown, prevent spamming
      }
      updateUserActivity(sessionId);
      lastHeartbeatTimeRef.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        heartbeat(); // Immediately send a heartbeat on focus
        if (!intervalId) {
          intervalId = setInterval(heartbeat, 30000); // Resume 30-second interval
        }
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Initial heartbeat
    heartbeat();
    intervalId = setInterval(heartbeat, 30000); // 30 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLivePage]);

  const recordContribution = useCallback((mood: Mood, position: { x: number, y: number } | null, options?: { isSimulated?: boolean }) => {
    // Optimistic UI updates for responsiveness
    if (!options?.isSimulated) {
      setLastUserContribution(mood);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); 
      }
      
      // Track local user contributions for PWA prompt
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const currentCount = parseInt(localStorage.getItem('userContributionCount') || '0', 10);
          const newCount = currentCount + 1;
          localStorage.setItem('userContributionCount', newCount.toString());
          
          // Dispatch event for other components to listen to
          window.dispatchEvent(new CustomEvent('userContribution', { detail: { count: newCount } }));
        } catch (e) {
          console.warn("Could not update user contribution count in localStorage.", e);
        }
      }
    }
    
    setContributionCount(prev => prev + 1);
    setLastContributionTime(Date.now());
    setLastContributorMoodColor(moodToHslString(mood));
    setLastContributionPosition(position);

    const currentUser = { uid: sessionIdRef.current, isAnonymous: true }; // Mock user
    if (currentUser) {
      // Submit to collective mood service (for all users)
      submitMood(mood, currentUser.uid).catch(error => {
        console.error("Collective submission failed:", error);
        // Simple rollback for the optimistic update
        setContributionCount(prev => prev - 1);
      });

      // Record to personal history - always record for mock users
      if (!options?.isSimulated) {
          recordUserMood(currentUser.uid, mood);
      }
    }


    // Clear the ripple effect after its animation
    setTimeout(() => {
      setLastContributorMoodColor(null);
      setLastContributionPosition(null);
    }, 2000);
  }, []);

  // Enhanced user count and activity simulation
  useEffect(() => {
    if (!isLivePage) return;

    let simulationTimeout: NodeJS.Timeout;

    const runSimulation = () => {
      // Schedule the next simulation event at a much longer random interval
      // to reduce database writes and visual noise from ripples.
      const nextEventIn = 8000 + Math.random() * 7000; // 8s to 15s
      simulationTimeout = setTimeout(runSimulation, nextEventIn);

      setUserCount(prev => {
        let newCount;
        const chance = Math.random();

        // If we are at the upper bound, always decrease.
        if (prev >= 15) { // Increased upper bound from 11
          newCount = prev - 1;
        } 
        // Otherwise, 50/50 chance to increase or decrease.
        else {
          newCount = chance < 0.5 ? prev + 1 : prev - 1;
        }

        // Clamp the value to a more reasonable minimum.
        if (newCount < 5) { // Increased lower bound from 1
            newCount = 5;
        }
        
        // A simulated user "joined" and submitted a mood.
        if (newCount > prev) {
          if (sessionIdRef.current) {
            const randomX = window.innerWidth * (0.2 + Math.random() * 0.6);
            const randomY = window.innerHeight * (0.2 + Math.random() * 0.6);
            const randomMood = PREDEFINED_MOODS[Math.floor(Math.random() * PREDEFINED_MOODS.length)];
            
            recordContribution(randomMood, { x: randomX, y: randomY }, { isSimulated: true });
          }
        }
        
        return newCount;
      });
    };

    // Start the simulation loop with a small delay
    simulationTimeout = setTimeout(runSimulation, 1000);

    return () => clearTimeout(simulationTimeout);
  }, [isLivePage, recordContribution]);


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
    setCurrentMood(newMood);
  }, [triggerCollectiveShift]);
  
  // Mock real-time simulation for collective mood state
  useEffect(() => {
    if (!isLivePage) return;

    const simulateRealTimeUpdates = () => {
      // Get current collective mood from localStorage
      const stored = localStorage.getItem('mockCollectiveMood');
      if (stored) {
        try {
          const data = JSON.parse(stored) as CollectiveMoodState;

          const newMood: Mood = {
            hue: data.h,
            saturation: data.s,
            lightness: data.l,
            name: findClosestMood(data.h).name,
            adjective: data.moodAdjective,
          };

          // Use the memoized updateMood to handle state changes and shockwave triggers
          updateMood(newMood);
          setContributionCount(data.totalContributions);
          setCelebratedMilestones(data.celebratedMilestones || []);
        } catch (e) {
          console.warn("Failed to parse stored collective mood:", e);
        }
      }
    };

    // Initial simulation
    simulateRealTimeUpdates();

    // Set up periodic updates to simulate real-time changes
    const intervalId = setInterval(simulateRealTimeUpdates, 2000);

    return () => clearInterval(intervalId);
  }, [isLivePage, updateMood]);

  const contextValue = useMemo(() => ({
    currentMood,
    userCount,
    contributionCount,
    celebratedMilestones,
    lastContributionTime,
    lastContributorMoodColor,
    lastContributionPosition,
    recentContributions,
    previewMood,
    setPreviewMood,
    updateMood,
    recordContribution,
    triggerCollectiveShift,
    isCollectiveShifting,
    lastUserContribution,
    isInitialized,
  }), [
    currentMood,
    userCount,
    contributionCount,
    celebratedMilestones,
    lastContributionTime,
    lastContributorMoodColor,
    lastContributionPosition,
    recentContributions,
    previewMood,
    updateMood,
    recordContribution,
    triggerCollectiveShift,
    isCollectiveShifting,
    lastUserContribution,
    isInitialized,
  ]);

  return (
    <MoodContext.Provider value={contextValue}>
      {children}
    </MoodContext.Provider>
  );
};
