
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

  const headerBaseClasses = "fixed top-0 mt-4 md:mt-6 p-1 z-30 frosted-glass rounded-full shadow-soft flex items-center justify-center group";
  const sizeClasses = "h-11 md:h-16 px-4 md:px-6 min-w-[220px] md:min-w-[280px]";

  return (
    <motion.header 
      className={cn(headerBaseClasses, sizeClasses, "left-1/2")}
      style={{ x: "-50%" }}
      animate={{ y: isCollectiveShifting ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
    >
      <AppHeaderLogo animationClass={animationClass} isIos={isIos} />
      <span className="ml-3 text-xl md:text-2xl font-medium text-foreground opacity-90 text-shadow-pop transition-opacity group-hover:opacity-100">
        RealTimeMood
      </span>
    </motion.header>
  );
};

export default AppHeader;
