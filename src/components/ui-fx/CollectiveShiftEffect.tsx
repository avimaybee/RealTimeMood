
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';

const CollectiveShiftEffect: React.FC = () => {
  const { isCollectiveShifting, appState } = useMood();

  if (!isCollectiveShifting) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      <div 
        className="absolute aspect-square rounded-full animate-shockwave"
        style={{
          width: '10px',
          height: '10px',
          background: 'transparent',
          boxShadow: `0 0 30px 10px hsla(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, 0.5), 0 0 50px 20px hsla(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, 0.3) inset`,
          opacity: 0,
        }}
      />
    </div>
  );
};

export default CollectiveShiftEffect;
