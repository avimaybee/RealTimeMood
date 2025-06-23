"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';

const AppHeaderLogo: React.FC<{ animationClass: string; isIos: boolean }> = ({ animationClass, isIos }) => (
  <svg
    width="32"
    height="32"
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
  const { currentMood, isCollectiveShifting } = useMood();
  const { isIos } = usePlatform();
  const { adjective } = currentMood;

  const animationClass = 
    adjective === 'Anxious' ? 'animate-logo-anxious' :
    (adjective === 'Joyful' || adjective === 'Energetic' || adjective === 'Passionate') ? 'animate-logo-joyful' :
    'animate-logo-calm';

  return (
    <motion.header 
      className={cn(
        "fixed top-0 inset-x-0 h-20 px-4 md:px-6 z-30",
        "flex items-center justify-start",
        "frosted-glass border-b border-border/10"
      )}
      animate={{ y: isCollectiveShifting ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
    >
      <div className="w-full max-w-screen-xl mx-auto">
        <a href="/" className="flex items-center group">
            <AppHeaderLogo animationClass={animationClass} isIos={isIos} />
            <span className="ml-3 text-xl md:text-2xl font-medium text-foreground opacity-90 text-shadow-pop transition-opacity group-hover:opacity-100">
                RealTimeMood
            </span>
        </a>
      </div>
    </motion.header>
  );
};

export default AppHeader;
