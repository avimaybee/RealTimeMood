
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { moodToHslString, PREDEFINED_MOODS } from '@/lib/colorUtils';

const MainPromptDisplay: React.FC = () => {
  const { currentMood, userCount, isCollectiveShifting, isInitialized } = useMood();
  
  // Use a default mood for server-rendering
  const moodToDisplay = currentMood || PREDEFINED_MOODS[0];
  const moodColor = moodToHslString(moodToDisplay);

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
        
      {/* Use a fixed height container to prevent layout shift */}
      <div className="h-12 flex flex-col justify-center">
        <AnimatePresence>
            {isInitialized ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className={cn("text-body transition-opacity opacity-90")}>
                        The Collective Mood:{" "}
                        <motion.span 
                          key={moodToDisplay.hue} // Re-trigger animation on mood change
                          className="font-semibold"
                          style={{
                            textShadow: `0 0 12px ${moodColor}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {moodToDisplay.adjective}
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
            ) : (
                // Render a placeholder on the server and for the initial client render
                <div>
                     <p className="text-body opacity-90">Loading collective mood...</p>
                     <p className="text-body opacity-90 invisible">placeholder to prevent shift</p>
                </div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MainPromptDisplay;
