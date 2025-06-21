
"use client";
import { useEffect, useRef } from 'react';
import type { Mood } from '@/types';
import { getDerivedColors } from '@/lib/colorUtils';

const ANIMATION_DURATION = 800; // ms

// Cubic ease-in-out: starts slow, speeds up, ends slow.
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

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

export const useDynamicColors = (targetMood: Mood) => {
  const targetMoodRef = useRef(targetMood);
  targetMoodRef.current = targetMood;

  const currentHslRef = useRef<{ hue: number; saturation: number; lightness: number } | null>(null);
  const startHslRef = useRef<{ hue: number; saturation: number; lightness: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Initialize currentHslRef on first run
    if (currentHslRef.current === null) {
      const initialHue = parseFloat(getComputedStyle(root).getPropertyValue('--mood-hue'));
      const initialSaturation = parseFloat(getComputedStyle(root).getPropertyValue('--mood-saturation-value'));
      const initialLightness = parseFloat(getComputedStyle(root).getPropertyValue('--mood-lightness-value'));
      currentHslRef.current = {
        hue: !isNaN(initialHue) ? initialHue : targetMood.hue,
        saturation: !isNaN(initialSaturation) ? initialSaturation : targetMood.saturation,
        lightness: !isNaN(initialLightness) ? initialLightness : targetMood.lightness,
      };
    }

    // When targetMood changes, start a new animation from the current state
    startHslRef.current = { ...currentHslRef.current };
    startTimeRef.current = performance.now();

    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = (now: number) => {
      if (!startTimeRef.current || !startHslRef.current) {
        return;
      }

      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      const start = startHslRef.current;
      const end = targetMoodRef.current;

      // Interpolate all values
      const newHue = lerpAngle(start.hue, end.hue, easedProgress);
      const newSaturation = lerp(start.saturation, end.saturation, easedProgress);
      const newLightness = lerp(start.lightness, end.lightness, easedProgress);

      currentHslRef.current = { hue: newHue, saturation: newSaturation, lightness: newLightness };

      // Update CSS variables
      root.style.setProperty('--mood-hue', newHue.toFixed(2));
      root.style.setProperty('--mood-saturation', `${newSaturation.toFixed(2)}%`);
      root.style.setProperty('--mood-lightness', `${newLightness.toFixed(2)}%`);
      root.style.setProperty('--mood-saturation-value', newSaturation.toFixed(2));
      root.style.setProperty('--mood-lightness-value', newLightness.toFixed(2));

      const interpolatedMoodForDerived: Mood = { name: end.name, adjective: end.adjective, ...currentHslRef.current };
      const {
        foregroundHue, foregroundSaturation, foregroundLightness,
        primaryForegroundHue, primaryForegroundSaturation, primaryForegroundLightness,
        panelBackgroundRgba
      } = getDerivedColors(interpolatedMoodForDerived);

      root.style.setProperty('--foreground-hsl', `${foregroundHue.toFixed(2)} ${foregroundSaturation.toFixed(2)}% ${foregroundLightness.toFixed(2)}%`);
      root.style.setProperty('--primary-foreground-hsl', `${primaryForegroundHue.toFixed(2)} ${primaryForegroundSaturation.toFixed(2)}% ${primaryForegroundLightness.toFixed(2)}%`);
      root.style.setProperty('--panel-background-rgba', panelBackgroundRgba);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [targetMood]);
};
