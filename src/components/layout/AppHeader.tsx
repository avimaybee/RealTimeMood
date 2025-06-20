
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppHeader: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();
  const [animatedUserCount, setAnimatedUserCount] = useState(appState.userCount);
  const [animatedContribCount, setAnimatedContribCount] = useState(appState.contributionCount);

  useEffect(() => {
    // Simple animation for count changes
    const userDiff = appState.userCount - animatedUserCount;
    const contribDiff = appState.contributionCount - animatedContribCount;

    if (Math.abs(userDiff) > 0) {
      setTimeout(() => setAnimatedUserCount(prev => prev + Math.sign(userDiff)), 50);
    } else {
       setAnimatedUserCount(appState.userCount);
    }
    if (Math.abs(contribDiff) > 0) {
      setTimeout(() => setAnimatedContribCount(prev => prev + Math.sign(contribDiff)), 50);
    } else {
      setAnimatedContribCount(appState.contributionCount);
    }

  }, [appState.userCount, appState.contributionCount, animatedUserCount, animatedContribCount]);

  const headerBaseClasses = "fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30 frosted-glass rounded-b-2xl shadow-soft transition-transform duration-500 ease-in-out";
  const shiftClasses = isCollectiveShifting ? "translate-y-1 -translate-x-0.5" : "translate-y-0 translate-x-0";


  return (
    <header className={cn(headerBaseClasses, shiftClasses)}>
      <div className="text-left">
        <h1 className="text-xl md:text-2xl font-semibold text-shadow-pop">
          {appState.currentMood.adjective}
        </h1>
        <p className="text-xs md:text-sm opacity-80 text-shadow-pop">Collective Mood</p>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6 text-shadow-pop">
        <div className="flex items-center space-x-1.5">
          <Users className="h-4 w-4 md:h-5 md:w-5 opacity-90" />
          <span className="text-sm md:text-base font-medium">{animatedUserCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 opacity-90" />
          <span className="text-sm md:text-base font-medium">{animatedContribCount.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
