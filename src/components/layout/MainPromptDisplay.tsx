
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

const MainPromptDisplay: React.FC = () => {
  const { appState } = useMood();
  const [animatedUserCount, setAnimatedUserCount] = useState(appState.userCount);

  useEffect(() => {
    // Simple animation for count changes (can be enhanced with spring physics later)
    const userDiff = appState.userCount - animatedUserCount;
    if (Math.abs(userDiff) > 0) {
      const increment = Math.sign(userDiff) * Math.max(1, Math.floor(Math.abs(userDiff) / 10));
      const timer = setTimeout(() => setAnimatedUserCount(prev => prev + increment ), 50);
      return () => clearTimeout(timer);
    } else if (appState.userCount !== animatedUserCount) {
       setAnimatedUserCount(appState.userCount);
    }
  }, [appState.userCount, animatedUserCount]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 md:gap-y-4 p-4">
      <h1 className="text-3xl md:text-4xl font-light text-shadow-pop">
        How are you feeling right now?
      </h1>
      <p className="text-lg md:text-xl text-shadow-pop">
        The Collective Mood: <span className="font-semibold">{appState.currentMood.adjective}</span>
      </p>
      <p className="text-sm md:text-base text-shadow-pop opacity-80">
        {animatedUserCount.toLocaleString()} minds currently connected
        {/* Placeholder for Live/Echoing distinction:
        <span className="ml-2 opacity-70">([Y] Live, [Z] Echoing)</span> 
        */}
      </p>
    </div>
  );
};

export default MainPromptDisplay;
