
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

const AppHeaderLogo: React.FC = () => (
  // Placeholder logo - to be enhanced with dynamic glow/distortion
  <svg 
    width="32" // Slightly larger for better visibility, scales with header
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-foreground opacity-80 group-hover:opacity-100 transition-opacity" // Use foreground for dynamic color
    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} // Simulates text-shadow-pop for SVG
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.5"/>
  </svg>
);


const AppHeader: React.FC = () => {
  const { isCollectiveShifting } = useMood();

  const headerBaseClasses = "fixed top-0 left-1/2 -translate-x-1/2 mt-4 md:mt-6 p-1 z-30 frosted-glass rounded-full shadow-soft transition-transform duration-500 ease-in-out flex items-center justify-center group";
  // Pill shape: h-11 (44px) on mobile (default buttonClasses h-10 + p-1 = h-12), md:h-16 (64px) on desktop.
  // Use min-w for pill shape instead of fixed width.
  const sizeClasses = "h-11 md:h-16 min-w-[60px] md:min-w-[80px]";
  const shiftClasses = isCollectiveShifting ? "translate-y-1 -translate-x-0.5" : "translate-y-0 translate-x-0";

  return (
    <header className={cn(headerBaseClasses, sizeClasses, shiftClasses)}>
      <AppHeaderLogo />
    </header>
  );
};

export default AppHeader;
