
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { moodToHslString, PREDEFINED_MOODS } from '@/lib/colorUtils';

const AppHeaderLogo: React.FC<{ animationClass: string; isIos: boolean }> = ({ animationClass, isIos }) => (
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
    <path d="M4 12L8 8L12 12L16 8L20 12" stroke="currentColor" strokeWidth={isIos ? 1.25 : 1.75} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 16L8 12L12 16L16 12L20 16" stroke="currentColor" strokeWidth={isIos ? 1.25 : 1.75} strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const AppHeader: React.FC = () => {
  const { currentMood, isCollectiveShifting, lastUserContribution, isInitialized } = useMood();
  const { isIos } = usePlatform();

  // We only calculate dynamic values when we're initialized on the client.
  // Otherwise, we use safe, static defaults.
  const moodForIndicator = isInitialized ? (lastUserContribution || currentMood || PREDEFINED_MOODS[0]) : PREDEFINED_MOODS[0];
  const animationClass = isInitialized ? (
    moodForIndicator.adjective === 'Anxious' ? 'animate-logo-anxious' :
    (moodForIndicator.adjective === 'Joyful' || moodForIndicator.adjective === 'Energetic' || moodForIndicator.adjective === 'Passionate') ? 'animate-logo-joyful' :
    'animate-logo-calm'
  ) : "";

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
      <a href="/" className="flex items-center group">
          <AppHeaderLogo animationClass={animationClass} isIos={isIos} />
          <span className="ml-2 text-base md:text-lg font-medium text-foreground opacity-90 transition-opacity group-hover:opacity-100">
              RealTimeMood
          </span>
      </a>
      
      <div className="flex items-center gap-2 h-4">
        <AnimatePresence>
            {isInitialized && (
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="text-xs text-foreground/70">
                      {moodForIndicator.adjective}
                    </span>
                    <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ 
                            backgroundColor: moodToHslString(moodForIndicator),
                            boxShadow: `0 0 8px 1px ${moodToHslString(moodForIndicator)}`
                        }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        key={moodForIndicator.hue}
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default AppHeader;
