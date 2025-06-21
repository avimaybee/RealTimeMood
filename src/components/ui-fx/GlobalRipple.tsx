
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';

const GlobalRipple: React.FC = () => {
  const { appState } = useMood();
  const { lastContributorMoodColor, lastContributionPosition } = appState;

  if (!lastContributorMoodColor || !lastContributionPosition) {
    return null;
  }
  
  const rippleLayers = [
    { delay: '0ms', primary: true },   // Main solid ring
    { delay: '150ms', primary: false }, // Fainter ring 1
    { delay: '300ms', primary: false }, // Fainter ring 2
  ];

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
              top: `${lastContributionPosition.y}px`,
              left: `${lastContributionPosition.x}px`,
              width: '10px', 
              height: '10px',
              border: layer.primary 
                ? `1px solid rgba(255, 255, 255, 0.5)`
                : `1px solid rgba(255, 255, 255, 0.2)`,
              boxShadow: `0 0 8px 1px ${lastContributorMoodColor}, 0 0 12px 2px ${lastContributorMoodColor} inset`,
              animationDelay: layer.delay,
              opacity: 0, 
            }}
          />
      ))}
    </div>
  );
};

export default GlobalRipple;
