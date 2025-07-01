"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { moodToHslString } from '@/lib/colorUtils';

const MainPromptDisplay: React.FC = () => {
  const { currentMood, userCount, isCollectiveShifting } = useMood();
  const moodColor = moodToHslString(currentMood);

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
        The Collective Mood:{" "}
        <motion.span 
          key={currentMood.hue} // Re-trigger animation on mood change
          className="font-semibold"
          style={{
            textShadow: `0 0 12px ${moodColor}`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {currentMood.adjective}
        </motion.span>
      </p>
      <p className="text-body opacity-90">
        <motion.span
          key={Math.round(userCount)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="inline-block font-semibold"
        >
          {Math.round(userCount).toLocaleString()}
        </motion.span>
        {' '}minds connected
      </p>
    </motion.div>
  );
};

export default MainPromptDisplay;
