
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MainPromptDisplay: React.FC = () => {
  const { currentMood, userCount, isCollectiveShifting } = useMood();

  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-y-3 md:gap-y-4 p-4"
      animate={{ 
        scale: isCollectiveShifting ? 0.95 : 1,
        y: isCollectiveShifting ? -4 : 0,
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
    >
      <h1 className={cn(
          "text-3xl md:text-4xl font-light text-shadow-pop transition-opacity animate-text-breathe"
        )}>
        How are you feeling right now?
      </h1>
      <p className={cn(
        "text-lg md:text-xl text-shadow-pop transition-opacity animate-text-breathe"
      )}>
        The Collective Mood: <span className="font-semibold">{currentMood.adjective}</span>
      </p>
      <p className="text-sm md:text-base text-shadow-pop opacity-80">
        <motion.span
          key={Math.round(userCount)}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className="inline-block"
        >
          {Math.round(userCount).toLocaleString()}
        </motion.span>
        {' '}minds connected
      </p>
    </motion.div>
  );
};

export default MainPromptDisplay;
