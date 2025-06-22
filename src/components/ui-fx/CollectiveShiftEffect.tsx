
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';

const CollectiveShiftEffect: React.FC = () => {
  const { isCollectiveShifting, currentMood } = useMood();

  if (!isCollectiveShifting) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      <div 
        className="absolute aspect-square rounded-full animate-global-ripple-effect"
        style={{
          width: '10px',
          height: '10px',
          background: 'transparent',
          boxShadow: `0 0 30px 10px hsla(${currentMood.hue}, ${currentMood.saturation}%, ${currentMood.lightness}%, 0.5), 0 0 50px 20px hsla(${currentMood.hue}, ${currentMood.saturation}%, ${currentMood.lightness}%, 0.3) inset`,
          opacity: 0,
        }}
      />
    </div>
  );
};

export default CollectiveShiftEffect;
