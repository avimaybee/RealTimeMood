
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MainPromptDisplay: React.FC = () => {
  const { currentMood, userCount, isCollectiveShifting } = useMood();

  return (
    <motion.div 
      className="flex flex-col items-start justify-center gap-y-1 md:gap-y-2"
      animate={{ 
        scale: isCollectiveShifting ? 0.95 : 1,
        y: isCollectiveShifting ? -4 : 0,
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
    >
      <h1 className={cn(
          "text-h1 font-normal transition-opacity"
        )}>
        How are you feeling right now?
      </h1>
      <p className={cn(
        "text-body transition-opacity opacity-90"
      )}>
        The Collective Mood: <span className="font-semibold">{currentMood.adjective}</span>
      </p>
      <p className="text-small opacity-80">
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
