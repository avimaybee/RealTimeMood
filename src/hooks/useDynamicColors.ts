
"use client";
import { useEffect, useRef } from 'react';
import type { Mood } from '@/types';
import { getDerivedColors } from '@/lib/colorUtils';

const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

const lerpAngle = (start: number, end: number, t: number): number => {
  const diff = (end - start + 360) % 360; // Ensures diff is in [0, 360)
  const shortestAngle = diff > 180 ? diff - 360 : diff; // Maps to shortest path (-180, 180]
  return (start + shortestAngle * t + 360) % 360; // Normalize to [0, 360)
};

export const useDynamicColors = (currentMood: Mood) => {
  const lastSetHSLRef = useRef<{ hue: number; saturation: number; lightness: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentMood) {
      const root = document.documentElement;
      const duration = 2000; // 2 seconds for transition as per spec for significant changes

      const startHue = lastSetHSLRef.current ? lastSetHSLRef.current.hue : currentMood.hue;
      const startSaturation = lastSetHSLRef.current ? lastSetHSLRef.current.saturation : currentMood.saturation;
      const startLightness = lastSetHSLRef.current ? lastSetHSLRef.current.lightness : currentMood.lightness;

      const animate = (timestamp: number) => {
        if (!animationStartTimeRef.current) {
          animationStartTimeRef.current = timestamp;
        }

        const elapsedTime = timestamp - animationStartTimeRef.current;
        const progress = Math.min(elapsedTime / duration, 1);

        const hue = lerpAngle(startHue, currentMood.hue, progress);
        const saturation = lerp(startSaturation, currentMood.saturation, progress);
        const lightness = lerp(startLightness, currentMood.lightness, progress);

        root.style.setProperty('--mood-hue', hue.toFixed(2));
        root.style.setProperty('--mood-saturation', `${saturation.toFixed(2)}%`);
        root.style.setProperty('--mood-lightness', `${lightness.toFixed(2)}%`);
        
        // Store the latest interpolated HSL values
        lastSetHSLRef.current = { hue, saturation, lightness };

        // Update derived colors based on the *interpolated* mood for smoother transitions
        const interpolatedMoodForDerived: Mood = { 
          name: currentMood.name, // name and adjective are not part of color interpolation
          adjective: currentMood.adjective,
          hue, 
          saturation, 
          lightness 
        };
        const {
          foregroundHue, foregroundSaturation, foregroundLightness,
          primaryForegroundHue, primaryForegroundSaturation, primaryForegroundLightness,
          panelBackgroundRgba
        } = getDerivedColors(interpolatedMoodForDerived);

        root.style.setProperty('--foreground-hsl', `${foregroundHue.toFixed(2)} ${foregroundSaturation.toFixed(2)}% ${foregroundLightness.toFixed(2)}%`);
        root.style.setProperty('--primary-foreground-hsl', `${primaryForegroundHue.toFixed(2)} ${primaryForegroundSaturation.toFixed(2)}% ${primaryForegroundLightness.toFixed(2)}%`);
        root.style.setProperty('--panel-background-rgba', panelBackgroundRgba);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationStartTimeRef.current = null; // Reset for next animation
          // lastSetHSLRef is already updated to the final target values by the last frame
        }
      };

      // Cancel previous animation if any
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationStartTimeRef.current = null; // Reset start time for new animation logic

      // Determine if the mood has actually changed enough to warrant an animation
      const moodEffectivelyChanged = 
        !lastSetHSLRef.current ||
        Math.abs(lastSetHSLRef.current.hue - currentMood.hue) > 0.01 ||
        Math.abs(lastSetHSLRef.current.saturation - currentMood.saturation) > 0.01 ||
        Math.abs(lastSetHSLRef.current.lightness - currentMood.lightness) > 0.01;

      if (moodEffectivelyChanged) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // If mood hasn't changed (or on initial load with the same mood),
        // ensure CSS variables are set to the current mood's values.
        root.style.setProperty('--mood-hue', currentMood.hue.toFixed(2));
        root.style.setProperty('--mood-saturation', `${currentMood.saturation.toFixed(2)}%`);
        root.style.setProperty('--mood-lightness', `${currentMood.lightness.toFixed(2)}%`);
        lastSetHSLRef.current = { hue: currentMood.hue, saturation: currentMood.saturation, lightness: currentMood.lightness };
        
        const {
          foregroundHue, foregroundSaturation, foregroundLightness,
          primaryForegroundHue, primaryForegroundSaturation, primaryForegroundLightness,
          panelBackgroundRgba
        } = getDerivedColors(currentMood);

        root.style.setProperty('--foreground-hsl', `${foregroundHue.toFixed(2)} ${foregroundSaturation.toFixed(2)}% ${foregroundLightness.toFixed(2)}%`);
        root.style.setProperty('--primary-foreground-hsl', `${primaryForegroundHue.toFixed(2)} ${primaryForegroundSaturation.toFixed(2)}% ${primaryForegroundLightness.toFixed(2)}%`);
        root.style.setProperty('--panel-background-rgba', panelBackgroundRgba);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [currentMood]); // Rerun effect when currentMood changes
};
