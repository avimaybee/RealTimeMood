
"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useDynamicColors } from '@/hooks/useDynamicColors';

const DynamicBackground: React.FC = () => {
  const { currentMood, previewMood } = useMood();
  const moodToDisplay = previewMood || currentMood;

  useDynamicColors(moodToDisplay);
  
  return null;
};

export default DynamicBackground;
