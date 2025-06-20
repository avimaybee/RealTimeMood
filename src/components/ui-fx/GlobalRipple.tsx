
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
      setRippleColor(appState.lastContributorMoodColor);
      const timer = setTimeout(() => setIsRippling(false), 1500); // Duration of ripple animation
      return () => clearTimeout(timer);
    }
  }, [appState.lastContributionTime, appState.lastContributorMoodColor]);

  if (!isRippling || !rippleColor) return null;

  // Multi-layered ripple
  return (
    <>
      {[0, 200, 400].map(delay => ( // Delays for layered effect
        <div
          key={delay}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
          aria-hidden="true"
        >
          <div
            className="absolute aspect-square rounded-full animate-ripple-effect"
            style={{
              width: '10px', // Initial small size
              height: '10px',
              border: `2px solid ${rippleColor}`,
              boxShadow: `0 0 15px ${rippleColor}, 0 0 20px ${rippleColor} inset`,
              animationDelay: `${delay}ms`,
              opacity: 0, // Animation starts from opacity 0
            }}
          />
        </div>
      ))}
    </>
  );
};

export default GlobalRipple;
