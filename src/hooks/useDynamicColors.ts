
"use client";
import { useEffect, useRef } from 'react';
import type { Mood } from '@/types';

const ANIMATION_DURATION = 800; // ms

// Cubic ease-in-out: starts slow, speeds up, ends slow.
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

  const currentHueRef = useRef<number | null>(null);
  const startHueRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Initialize currentHueRef on first run
    if (currentHueRef.current === null) {
      const initialHue = parseFloat(getComputedStyle(root).getPropertyValue('--mood-hue'));
      currentHueRef.current = !isNaN(initialHue) ? initialHue : targetMood.hue;
    }

    // When targetMood changes, start a new animation from the current state
    startHueRef.current = currentHueRef.current;
    startTimeRef.current = performance.now();

    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = (now: number) => {
      if (startTimeRef.current === null || startHueRef.current === null) {
        return;
      }

      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      const start = startHueRef.current;
      const end = targetMoodRef.current.hue;

      const newHue = lerpAngle(start, end, easedProgress);
      currentHueRef.current = newHue;

      // Update the single CSS variable for hue
      root.style.setProperty('--mood-hue', newHue.toFixed(2));

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
