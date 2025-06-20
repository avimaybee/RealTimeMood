
"use client";
import { useEffect } from 'react';
import type { Mood } from '@/types';
import { getDerivedColors } from '@/lib/colorUtils';

export const useDynamicColors = (mood: Mood) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && mood) {
      const root = document.documentElement;
      
      root.style.setProperty('--mood-hue', mood.hue.toString());
      root.style.setProperty('--mood-saturation', `${mood.saturation}%`);
      root.style.setProperty('--mood-lightness', `${mood.lightness}%`);

      const { 
        foregroundHue, foregroundSaturation, foregroundLightness,
        primaryForegroundHue, primaryForegroundSaturation, primaryForegroundLightness,
        panelBackgroundRgba 
      } = getDerivedColors(mood);

      root.style.setProperty('--foreground-hsl', `${foregroundHue} ${foregroundSaturation}% ${foregroundLightness}%`);
      root.style.setProperty('--primary-foreground-hsl', `${primaryForegroundHue} ${primaryForegroundSaturation}% ${primaryForegroundLightness}%`);
      root.style.setProperty('--panel-background-rgba', panelBackgroundRgba);

    }
  }, [mood]);
};
