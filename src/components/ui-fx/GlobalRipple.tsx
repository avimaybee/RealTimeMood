
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

const GlobalRipple: React.FC = () => {
  const { appState } = useMood();
  const [isRippling, setIsRippling] = useState(false);
  const [rippleColor, setRippleColor] = useState<string | null>(null);

  useEffect(() => {
    // Trigger ripple only on new contributions
    if (appState.lastContributionTime && appState.lastContributorMoodColor) {
      setIsRippling(true);
      setRippleColor(appState.lastContributorMoodColor); // This is an HSL string
      // The effect's total duration including delays is 1200ms (anim) + 300ms (last delay) = 1500ms
      const timer = setTimeout(() => setIsRippling(false), 1500); 
      return () => clearTimeout(timer);
    }
  }, [appState.lastContributionTime, appState.lastContributorMoodColor]);

  if (!isRippling || !rippleColor) return null;
  
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
            className="absolute top-1/2 left-1/2 aspect-square rounded-full animate-global-ripple-effect"
            style={{
              width: '10px', 
              height: '10px',
              // Spec: "primary solid ring, 2-3 fainter concentric rings"
              border: layer.primary 
                ? `1px solid rgba(255, 255, 255, 0.5)`
                : `1px solid rgba(255, 255, 255, 0.2)`,
              // Spec: "subtly tints towards the contributor's original mood color"
              boxShadow: `0 0 8px 1px ${rippleColor}, 0 0 12px 2px ${rippleColor} inset`,
              animationDelay: layer.delay,
              // animationDuration, easing, and fill-mode are handled by the tailwind class
              opacity: 0, // The animation starts with a non-zero opacity
            }}
          />
      ))}
    </div>
  );
};

export default GlobalRipple;
