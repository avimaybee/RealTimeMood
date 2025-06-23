
"use client";
import React, { useEffect } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useDynamicColors } from '@/hooks/useDynamicColors';

const DynamicBackground: React.FC = () => {
  const { currentMood, previewMood } = useMood();
  const moodToDisplay = previewMood || currentMood;

  useDynamicColors(moodToDisplay);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      document.documentElement.style.setProperty('--cursor-x', `${clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${clientY}px`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return null;
};

export default DynamicBackground;
