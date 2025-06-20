
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

const AppHeaderLogo: React.FC = () => (
  <svg
    width="24" // Adjusted size to be slightly smaller to accommodate text
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-foreground opacity-80 group-hover:opacity-100 transition-opacity"
    style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} // Slightly reduced shadow
  >
    <path d="M4 12L8 8L12 12L16 8L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 16L8 12L12 16L16 12L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);


const AppHeader: React.FC = () => {
  const { isCollectiveShifting } = useMood();

  const headerBaseClasses = "fixed top-0 left-1/2 -translate-x-1/2 mt-4 md:mt-6 p-1 z-30 frosted-glass rounded-full shadow-soft transition-transform duration-500 ease-in-out flex items-center justify-center group";
  // Pill shape: h-11 (44px) on mobile, md:h-16 (64px) on desktop. Adjusted min-width and padding for text.
  const sizeClasses = "h-11 md:h-16 px-4 md:px-6 min-w-[180px] md:min-w-[240px]"; // Increased min-width
  const shiftClasses = isCollectiveShifting ? "translate-y-1 -translate-x-0.5" : "translate-y-0 translate-x-0";

  return (
    <header className={cn(headerBaseClasses, sizeClasses, shiftClasses)}>
      <AppHeaderLogo />
      <span className="ml-2 text-sm md:text-base font-medium text-foreground opacity-90 text-shadow-pop transition-opacity group-hover:opacity-100">
        RealTimeMood
      </span>
    </header>
  );
};

export default AppHeader;
