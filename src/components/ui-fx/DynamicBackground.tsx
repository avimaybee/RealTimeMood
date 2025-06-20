
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useDynamicColors } from '@/hooks/useDynamicColors';

const DynamicBackground: React.FC = () => {
  const { appState } = useMood();
  useDynamicColors(appState.currentMood);

  // The actual background color is applied to `body` via CSS variables updated by useDynamicColors.
  // This component can also host the Global Pulse animation if it's a global overlay.
  // For simplicity, the global pulse is applied via Tailwind's `animate-global-pulse` on the main container.
  // This component ensures dynamic colors are set.
  
  return null; // This component doesn't render anything itself, it just manages effects.
};

export default DynamicBackground;
