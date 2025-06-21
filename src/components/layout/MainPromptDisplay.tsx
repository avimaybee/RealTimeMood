"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MainPromptDisplay: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 md:gap-y-4 p-4">
      <h1 className={cn(
          "text-3xl md:text-4xl font-light text-shadow-pop transition-opacity",
          isCollectiveShifting && "animate-text-breathe"
        )}>
        How are you feeling right now?
      </h1>
      <p className={cn(
        "text-lg md:text-xl text-shadow-pop transition-opacity",
        isCollectiveShifting && "animate-text-breathe"
      )}>
        The Collective Mood: <span className="font-semibold">{appState.currentMood.adjective}</span>
      </p>
      <p className="text-sm md:text-base text-shadow-pop opacity-80">
        <motion.span
          key={Math.round(appState.userCount)}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className="inline-block"
        >
          {Math.round(appState.userCount).toLocaleString()}
        </motion.span>
        {' '}minds connected
      </p>
    </div>
  );
};

export default MainPromptDisplay;
