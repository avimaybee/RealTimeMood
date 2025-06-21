
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

export const useDynamicColors = (targetMood: Mood) => {
  const targetMoodRef = useRef(targetMood);
  targetMoodRef.current = targetMood;

  const currentHslRef = useRef<{ hue: number; saturation: number; lightness: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (currentHslRef.current === null) {
      const initialHue = parseFloat(getComputedStyle(root).getPropertyValue('--mood-hue'));
      const initialSaturation = parseFloat(getComputedStyle(root).getPropertyValue('--mood-saturation-value'));
      const initialLightness = parseFloat(getComputedStyle(root).getPropertyValue('--mood-lightness-value'));
      currentHslRef.current = {
        hue: isNaN(initialHue) ? targetMoodRef.current.hue : initialHue,
        saturation: isNaN(initialSaturation) ? targetMoodRef.current.saturation : initialSaturation,
        lightness: isNaN(initialLightness) ? targetMoodRef.current.lightness : initialLightness,
      };
    }

    const animate = () => {
      if (!currentHslRef.current) return;

      const currentTarget = targetMoodRef.current;
      const currentHsl = currentHslRef.current;

      const t = 0.08; // Interpolation factor, controls animation speed
      const newHue = lerpAngle(currentHsl.hue, currentTarget.hue, t);
      const newSaturation = lerp(currentHsl.saturation, currentTarget.saturation, t);
      const newLightness = lerp(currentHsl.lightness, currentTarget.lightness, t);

      currentHslRef.current = { hue: newHue, saturation: newSaturation, lightness: newLightness };
      
      root.style.setProperty('--mood-hue', newHue.toFixed(2));
      root.style.setProperty('--mood-saturation', `${newSaturation.toFixed(2)}%`);
      root.style.setProperty('--mood-lightness', `${newLightness.toFixed(2)}%`);
      root.style.setProperty('--mood-saturation-value', newSaturation.toFixed(2));
      root.style.setProperty('--mood-lightness-value', newLightness.toFixed(2));
      
      const interpolatedMoodForDerived: Mood = {
        name: currentTarget.name, 
        adjective: currentTarget.adjective,
        hue: newHue, saturation: newSaturation, lightness: newLightness
      };
      const {
        foregroundHue, foregroundSaturation, foregroundLightness,
        primaryForegroundHue, primaryForegroundSaturation, primaryForegroundLightness,
        panelBackgroundRgba
      } = getDerivedColors(interpolatedMoodForDerived);

      root.style.setProperty('--foreground-hsl', `${foregroundHue.toFixed(2)} ${foregroundSaturation.toFixed(2)}% ${foregroundLightness.toFixed(2)}%`);
      root.style.setProperty('--primary-foreground-hsl', `${primaryForegroundHue.toFixed(2)} ${primaryForegroundSaturation.toFixed(2)}% ${primaryForegroundLightness.toFixed(2)}%`);
      root.style.setProperty('--panel-background-rgba', panelBackgroundRgba);

      const distance =
        Math.abs(shortestAngleDiff(newHue, currentTarget.hue)) +
        Math.abs(newSaturation - currentTarget.saturation) +
        Math.abs(newLightness - currentTarget.lightness);

      if (distance > 0.1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        root.style.setProperty('--mood-hue', currentTarget.hue.toFixed(2));
        root.style.setProperty('--mood-saturation', `${currentTarget.saturation.toFixed(2)}%`);
        root.style.setProperty('--mood-lightness', `${currentTarget.lightness.toFixed(2)}%`);
        currentHslRef.current = { hue: currentTarget.hue, saturation: currentTarget.saturation, lightness: currentTarget.lightness };
        
        const finalDerived = getDerivedColors(currentTarget);
        root.style.setProperty('--foreground-hsl', `${finalDerived.foregroundHue.toFixed(2)} ${finalDerived.foregroundSaturation.toFixed(2)}% ${finalDerived.foregroundLightness.toFixed(2)}%`);
        root.style.setProperty('--primary-foreground-hsl', `${finalDerived.primaryForegroundHue.toFixed(2)} ${finalDerived.primaryForegroundSaturation.toFixed(2)}% ${finalDerived.primaryForegroundLightness.toFixed(2)}%`);
        root.style.setProperty('--panel-background-rgba', finalDerived.panelBackgroundRgba);

        animationFrameRef.current = null;
      }
    };

    if (!animationFrameRef.current) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [targetMood]);
};
