
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';

const GlobalRipple: React.FC = () => {
  const { lastContributorMoodColor, lastContributionPosition } = useMood();

  if (!lastContributorMoodColor) {
    return null;
  }
  
  const rippleLayers = [
    { delay: '0ms', primary: true },   // Main solid ring
    { delay: '150ms', primary: false }, // Fainter ring 1
    { delay: '300ms', primary: false }, // Fainter ring 2
  ];

  // Default to center of screen if no position is provided (for global events)
  const positionStyle = lastContributionPosition
    ? { top: `${lastContributionPosition.y}px`, left: `${lastContributionPosition.x}px` }
    : { top: '50%', left: '50%' };


  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    >
      {rippleLayers.map((layer, index) => (
          <div
            key={index}
            className="absolute aspect-square rounded-full animate-global-ripple-effect"
            style={{
              ...positionStyle,
              width: '10px', 
              height: '10px',
              border: layer.primary 
                ? `1px solid rgba(255, 255, 255, 0.7)` // Brighter primary
                : `1px solid rgba(255, 255, 255, 0.3)`,
              boxShadow: `0 0 12px 2px ${lastContributorMoodColor}, 0 0 18px 3px ${lastContributorMoodColor} inset`,
              animationDelay: layer.delay,
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          />
      ))}
    </div>
  );
};

export default GlobalRipple;
