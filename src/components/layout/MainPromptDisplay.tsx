
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
      className="flex flex-col items-start justify-center gap-y-4 md:gap-y-6"
      animate={{
        scale: isCollectiveShifting ? 0.95 : 1,
        y: isCollectiveShifting ? -4 : 0,
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
    >
      {/* THE main prompt - large, bold, unforgettable */}
      <h1 className={cn(
        "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
        "font-display font-bold tracking-tight",
        "leading-[1.1]",
        "text-glow",
        "max-w-4xl"
      )}>
        How are you feeling<br className="sm:hidden" /> right now?
      </h1>

      {/* Collective mood info - secondary */}
      <div className="h-16 flex flex-col justify-center">
        <AnimatePresence>
          {isInitialized ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-1"
            >
              <p className="text-lg md:text-xl opacity-80">
                The Collective Mood:{" "}
                <motion.span
                  key={moodToDisplay.hue}
                  className="font-semibold"
                  style={{
                    color: moodColor,
                    textShadow: `0 0 20px ${moodColor}`
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {moodToDisplay.adjective}
                </motion.span>
              </p>
              <p className="text-base md:text-lg opacity-70">
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
            <div className="text-lg opacity-70">
              <p>Loading collective mood...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MainPromptDisplay;

