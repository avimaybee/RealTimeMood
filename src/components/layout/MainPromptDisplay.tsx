
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

const MainPromptDisplay: React.FC = () => {
  const { appState } = useMood();
  
  const [animatedLiveUserCount, setAnimatedLiveUserCount] = useState(appState.liveUserCount);
  const [animatedEchoUserCount, setAnimatedEchoUserCount] = useState(appState.echoUserCount);
  
  const [isLiveBouncing, setIsLiveBouncing] = useState(false);
  const [isEchoBouncing, setIsEchoBouncing] = useState(false);
  
  const prevCountsRef = useRef({ live: appState.liveUserCount, echo: appState.echoUserCount });

  useEffect(() => {
    const liveDiff = appState.liveUserCount - animatedLiveUserCount;
    if (Math.abs(liveDiff) > 0) {
      const increment = Math.sign(liveDiff) * Math.max(1, Math.floor(Math.abs(liveDiff) / 10));
      const timer = setTimeout(() => setAnimatedLiveUserCount(prev => prev + increment ), 50);
      return () => clearTimeout(timer);
    } else if (appState.liveUserCount !== animatedLiveUserCount) {
       setAnimatedLiveUserCount(appState.liveUserCount);
    }
  }, [appState.liveUserCount, animatedLiveUserCount]);

  useEffect(() => {
    const echoDiff = appState.echoUserCount - animatedEchoUserCount;
    if (Math.abs(echoDiff) > 0) {
      const increment = Math.sign(echoDiff) * Math.max(1, Math.floor(Math.abs(echoDiff) / 10));
      const timer = setTimeout(() => setAnimatedEchoUserCount(prev => prev + increment ), 50);
      return () => clearTimeout(timer);
    } else if (appState.echoUserCount !== animatedEchoUserCount) {
       setAnimatedEchoUserCount(appState.echoUserCount);
    }
  }, [appState.echoUserCount, animatedEchoUserCount]);

  useEffect(() => {
    if (prevCountsRef.current.live !== appState.liveUserCount) {
      setIsLiveBouncing(true);
      const timer = setTimeout(() => setIsLiveBouncing(false), 600); 
      prevCountsRef.current.live = appState.liveUserCount; 
      return () => clearTimeout(timer);
    }
  }, [appState.liveUserCount]);

  useEffect(() => {
    if (prevCountsRef.current.echo !== appState.echoUserCount) {
      setIsEchoBouncing(true);
      const timer = setTimeout(() => setIsEchoBouncing(false), 600); 
      prevCountsRef.current.echo = appState.echoUserCount; 
      return () => clearTimeout(timer);
    }
  }, [appState.echoUserCount]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 md:gap-y-4 p-4">
      <h1 className="text-3xl md:text-4xl font-light text-shadow-pop">
        How are you feeling right now?
      </h1>
      <p className="text-lg md:text-xl text-shadow-pop">
        The Collective Mood: <span className="font-semibold">{appState.currentMood.adjective}</span>
      </p>
      <p 
        className={cn(
          "text-sm md:text-base text-shadow-pop opacity-80"
        )}
      >
        <span className={cn(isLiveBouncing ? "animate-count-bounce inline-block" : "inline-block")}>
          {animatedLiveUserCount.toLocaleString()}
        </span>
        {' '}Live,{' '}
        <span className={cn(isEchoBouncing ? "animate-count-bounce inline-block opacity-75" : "inline-block opacity-75")}>
          {animatedEchoUserCount.toLocaleString()}
        </span>
        {' '}Echoing minds connected
      </p>
    </div>
  );
};

export default MainPromptDisplay;
