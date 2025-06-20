
"use client";
import { useEffect, useRef } from 'react';
import type { Mood } from '@/types';
import { getDerivedColors } from '@/lib/colorUtils';

const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

const shortestAngleDiff = (startAngle: number, endAngle: number): number => {
  const diff = (endAngle - startAngle + 360) % 360;
  return diff > 180 ? diff - 360 : diff;
};

const lerpAngle = (startAngle: number, endAngle: number, t: number): number => {
  const angleDiff = shortestAngleDiff(startAngle, endAngle);
  return (startAngle + angleDiff * t + 360) % 360;
};

export const useDynamicColors = (currentMood: Mood) => {
  const lastSetHSLRef = useRef<{ hue: number; saturation: number; lightness: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentMood) {
      const root = document.documentElement;

      const startHue = lastSetHSLRef.current ? lastSetHSLRef.current.hue : currentMood.hue;
      const startSaturation = lastSetHSLRef.current ? lastSetHSLRef.current.saturation : currentMood.saturation;
      const startLightness = lastSetHSLRef.current ? lastSetHSLRef.current.lightness : currentMood.lightness;

      const moodEffectivelyChanged =
        !lastSetHSLRef.current ||
        Math.abs(shortestAngleDiff(lastSetHSLRef.current.hue, currentMood.hue)) > 0.01 ||
        Math.abs(lastSetHSLRef.current.saturation - currentMood.saturation) > 0.01 ||
        Math.abs(lastSetHSLRef.current.lightness - currentMood.lightness) > 0.01;

      if (moodEffectivelyChanged) {
        const deltaHueAbs = Math.abs(shortestAngleDiff(startHue, currentMood.hue));
        const deltaSaturation = Math.abs(startSaturation - currentMood.saturation);
        const deltaLightness = Math.abs(startLightness - currentMood.lightness);

        const normDeltaHue = deltaHueAbs / 180;
        const normDeltaSaturation = deltaSaturation / 100;
        const normDeltaLightness = deltaLightness / 100;

        const changeMagnitude = Math.max(normDeltaHue, normDeltaSaturation, normDeltaLightness);
        const duration = 2000 + changeMagnitude * 1000;

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
          // Set numeric values for calculations in components like OrbButton
          root.style.setProperty('--mood-saturation-value', saturation.toFixed(2));
          root.style.setProperty('--mood-lightness-value', lightness.toFixed(2));
          
          lastSetHSLRef.current = { hue, saturation, lightness };

          const interpolatedMoodForDerived: Mood = {
            name: currentMood.name,
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
            animationStartTimeRef.current = null; 
            lastSetHSLRef.current = { hue: currentMood.hue, saturation: currentMood.saturation, lightness: currentMood.lightness };
             // Ensure final numeric values are also set precisely
            root.style.setProperty('--mood-saturation-value', currentMood.saturation.toFixed(2));
            root.style.setProperty('--mood-lightness-value', currentMood.lightness.toFixed(2));
          }
        };

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationStartTimeRef.current = null; 
        animationFrameRef.current = requestAnimationFrame(animate);

      } else {
        root.style.setProperty('--mood-hue', currentMood.hue.toFixed(2));
        root.style.setProperty('--mood-saturation', `${currentMood.saturation.toFixed(2)}%`);
        root.style.setProperty('--mood-lightness', `${currentMood.lightness.toFixed(2)}%`);
        root.style.setProperty('--mood-saturation-value', currentMood.saturation.toFixed(2));
        root.style.setProperty('--mood-lightness-value', currentMood.lightness.toFixed(2));
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
  }, [currentMood]);
};
