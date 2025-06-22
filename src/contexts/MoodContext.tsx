
"use client";
import type { ReactNode } from 'react';
import React, { useRef, useMemo } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Mood, CollectiveMoodState } from '@/types';
import { PREDEFINED_MOODS, moodToHslString, findClosestMood } from '@/lib/colorUtils';
import { submitMood, updateUserActivity } from '@/lib/mood-service';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

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
  recordContribution: (mood: Mood, position: { x: number; y: number } | null) => void;
  triggerCollectiveShift: () => void;
  isCollectiveShifting: boolean;
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
  const [currentMood, setCurrentMood] = useState<Mood>(initialState.currentMood);
  const [userCount, setUserCount] = useState<number>(initialState.userCount);
  const [contributionCount, setContributionCount] = useState<number>(initialState.contributionCount);
  const [lastContributionTime, setLastContributionTime] = useState<number | null>(initialState.lastContributionTime);
  const [lastContributorMoodColor, setLastContributorMoodColor] = useState<string | null>(initialState.lastContributorMoodColor);
  const [lastContributionPosition, setLastContributionPosition] = useState<{ x: number; y: number } | null>(initialState.lastContributionPosition);
  const [recentContributions, setRecentContributions] = useState<Mood[]>(initialState.recentContributions || []);
  
  const [isCollectiveShifting, setIsCollectiveShifting] = useState(false);
  const [previewMood, setPreviewMood] = useState<Mood | null>(null);
  const lastPulsedHueRef = useRef<number>(initialState.currentMood.hue);
  const sessionIdRef = useRef<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in anonymously.
            sessionIdRef.current = user.uid;
        } else {
            // User is signed out.
            signInAnonymously(auth).catch(error => {
                console.error("Anonymous sign-in failed:", error);
            });
        }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Heartbeat effect for user activity tracking
  useEffect(() => {
    if (!isLivePage || !sessionIdRef.current) return;

    const sessionId = sessionIdRef.current;
    let intervalId: NodeJS.Timeout | null = null;

    const heartbeat = () => {
      updateUserActivity(sessionId);
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

  // Simulate user count fluctuation for a dynamic feel
  useEffect(() => {
    if (!isLivePage) return;

    const intervalId = setInterval(() => {
      const change = (Math.random() - 0.5) * 4; // Fluctuate by -2 to +2
      setUserCount(prev => Math.max(1, Math.round(prev + change)));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId);
  }, [isLivePage]);


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
  
  // Real-time listener for collective mood state
  useEffect(() => {
    if (!isLivePage) return;

    const collectiveMoodRef = doc(db, 'appState/collectiveMood');

    const unsubscribe = onSnapshot(collectiveMoodRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CollectiveMoodState;
        
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
        // Note: userCount is intentionally simulated locally and not set from here.
      } else {
        console.warn("Collective mood document does not exist in Firestore. The app will use its initial state.");
      }
    }, (error) => {
      console.error("Error listening to collective mood changes:", error);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [isLivePage, updateMood]);


  const recordContribution = useCallback((mood: Mood, position: { x: number, y: number } | null) => {
    // Optimistic UI updates for responsiveness
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); 
    }
    setContributionCount(prev => prev + 1);
    setLastContributionTime(Date.now());
    setLastContributorMoodColor(moodToHslString(mood));
    setLastContributionPosition(position);

    // Call the backend submission logic
    if (sessionIdRef.current) {
      submitMood(mood, sessionIdRef.current).catch(error => {
        console.error("Submission failed:", error);
        // Simple rollback for the optimistic update
        setContributionCount(prev => prev - 1);
        // TODO: Show a toast notification to the user about the failure
      });
    }

    // Clear the ripple effect after its animation
    setTimeout(() => {
      setLastContributorMoodColor(null);
      setLastContributionPosition(null);
    }, 2000);
  }, []);

  const contextValue = useMemo(() => ({
    currentMood,
    userCount,
    contributionCount,
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
  }), [
    currentMood,
    userCount,
    contributionCount,
    lastContributionTime,
    lastContributorMoodColor,
    lastContributionPosition,
    recentContributions,
    previewMood,
    updateMood,
    recordContribution,
    triggerCollectiveShift,
    isCollectiveShifting,
  ]);

  return (
    <MoodContext.Provider value={contextValue}>
      {children}
    </MoodContext.Provider>
  );
};
