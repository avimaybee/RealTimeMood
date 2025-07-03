"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { moodToHslString } from '@/lib/colorUtils';

const AppHeaderLogo: React.FC<{ animationClass: string }> = ({ animationClass }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
        "text-foreground opacity-80 group-hover:opacity-100 transition-opacity",
        animationClass
    )}
  >
    <path d="M4 12L8 8L12 12L16 8L20 12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 16L8 12L12 16L16 12L20 16" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const AppHeader: React.FC = () => {
  const { isCollectiveShifting, lastUserContribution } = useMood();

  // Using a single, default animation class to prevent hydration errors.
  const animationClass = 'animate-logo-calm';

  return (
    <motion.header 
      className={cn(
        "fixed top-4 inset-x-0 mx-auto z-30",
        "w-[calc(100%-2rem)] max-w-lg",
        "flex items-center justify-between",
        "h-12 px-3",
        "frosted-glass rounded-2xl shadow-soft"
      )}
      animate={{ y: isCollectiveShifting ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
    >
      {/* Logo on the left */}
      <a href="/" className="flex items-center group">
          <AppHeaderLogo animationClass={animationClass} />
          <span className="ml-2 text-base md:text-lg font-medium text-foreground opacity-90 transition-opacity group-hover:opacity-100">
              RealTimeMood
          </span>
      </a>

      {/* Mood indicator on the right */}
      <AnimatePresence>
        {lastUserContribution && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: moodToHslString(lastUserContribution),
                boxShadow: `0 0 8px ${moodToHslString(lastUserContribution)}`,
              }}
            />
            <span className="text-sm font-medium text-foreground/80">
              {lastUserContribution.adjective}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default AppHeader;
