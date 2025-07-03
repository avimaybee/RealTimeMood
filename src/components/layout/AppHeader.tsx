
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const { isCollectiveShifting } = useMood();

  // Using a single, default animation class to prevent hydration errors.
  const animationClass = 'animate-logo-calm';

  return (
    <motion.header 
      className={cn(
        "fixed top-4 inset-x-0 mx-auto z-30",
        "w-[calc(100%-2rem)] max-w-lg",
        "flex items-center justify-center",
        "h-12 px-3",
        "frosted-glass rounded-2xl shadow-soft"
      )}
      animate={{ y: isCollectiveShifting ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
    >
      <a href="/" className="flex items-center group">
          <AppHeaderLogo animationClass={animationClass} />
          <span className="ml-2 text-base md:text-lg font-medium text-foreground opacity-90 transition-opacity group-hover:opacity-100">
              RealTimeMood
          </span>
      </a>
    </motion.header>
  );
};

export default AppHeader;
