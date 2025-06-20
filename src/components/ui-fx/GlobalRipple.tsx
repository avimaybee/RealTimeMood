
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

const GlobalRipple: React.FC = () => {
  const { appState } = useMood();
  const [isRippling, setIsRippling] = useState(false);
  const [rippleColor, setRippleColor] = useState<string | null>(null);

  useEffect(() => {
    if (appState.lastContributionTime && appState.lastContributorMoodColor) {
      setIsRippling(true);
      setRippleColor(appState.lastContributorMoodColor); // This is an HSL string
      const timer = setTimeout(() => setIsRippling(false), 1200); // Duration of ripple animation (spec: 1200ms)
      return () => clearTimeout(timer);
    }
  }, [appState.lastContributionTime, appState.lastContributorMoodColor]);

  if (!isRippling || !rippleColor) return null;

  // Spec: "A thin, glowing ring (border: 1px solid rgba(255,255,255,0.5)) expands smoothly...
  // The border subtly tints towards the contributor's original mood color as it grows."
  // For simplicity, we use the contributor's mood color for the glow/tint.
  // The main border can remain a consistent white/alpha for contrast.
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
      aria-hidden="true"
    >
      <div
        className="absolute aspect-square rounded-full animate-global-ripple-effect" // Changed animation name
        style={{
          width: '10px', 
          height: '10px',
          border: `1px solid rgba(255,255,255,0.5)`, // Base border as per spec
          boxShadow: `0 0 10px 2px ${rippleColor}, 0 0 15px 4px ${rippleColor} inset`, // Glow tinted with contributor's mood
          animationDuration: '1200ms', // Match spec
          opacity: 0, 
        }}
      />
    </div>
  );
};

export default GlobalRipple;
