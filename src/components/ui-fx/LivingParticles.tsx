
"use client";
import React, { useEffect, useState } from 'react';
import type { Mood } from '@/types';
import { useMood } from '@/contexts/MoodContext';

const LivingParticles: React.FC = () => {
  const { appState } = useMood();
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties; className: string }>>([]);

  useEffect(() => {
    const { userCount, currentMood } = appState;
  
    // --- Particle Count Scaling ---
    const minUserCountForScale = 100;
    const maxUserCountForScale = 10000;
    const minParticles = 100;
    const maxParticles = 1000;
    let normalizedUserCount = (userCount - minUserCountForScale) / (maxUserCountForScale - minUserCountForScale);
    normalizedUserCount = Math.max(0, Math.min(1, normalizedUserCount)); 
    const numParticles = Math.floor(minParticles + normalizedUserCount * (maxParticles - minParticles));

    // --- Dynamic Behavior based on Mood ---
    const { hue, saturation, lightness, adjective } = currentMood;

    let behavior: {
        animationClass: string;
        baseSize: number;
        baseDuration: number;
    };

    const joyfulAdjectives = ["Joyful", "Energetic", "Passionate"];

    if (joyfulAdjectives.includes(adjective)) {
        behavior = {
            animationClass: 'animate-particle-joyful',
            baseSize: 1.5, // smaller
            baseDuration: 10, // faster
        };
    } else if (adjective === "Anxious") {
        behavior = {
            animationClass: 'animate-particle-anxious',
            baseSize: 1, // very small
            baseDuration: 7, // very fast
        };
    } else { // Default to Calm
        behavior = {
            animationClass: 'animate-particle-calm',
            baseSize: 3, // larger
            baseDuration: 25, // slower
        };
    }

    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      // Size influenced by saturation
      const size = (behavior.baseSize + Math.random()) * (0.5 + (saturation / 200));
      // Duration influenced by lightness (brighter = slower)
      const duration = (behavior.baseDuration + Math.random() * 5) * (1.5 - (lightness / 200));
      const delay = Math.random() * duration; 
      const particleAlpha = (0.4 + (saturation / 100) * 0.4) * (Math.random() * 0.4 + 0.8);
      const particleDriftX = `${(Math.random() - 0.5) * 20}vw`; 

      // Analogous color: shift hue slightly (+/- 15 degrees)
      const analogousHue = (hue + (Math.random() - 0.5) * 30 + 360) % 360;
      const particleLightness = 80 + Math.random() * 15;

      return {
        id: i,
        className: `absolute rounded-full ${behavior.animationClass}`,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`, // Start below the screen
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          backgroundColor: `hsla(${analogousHue}, ${saturation}%, ${particleLightness}%, ${particleAlpha})`,
          '--particle-drift-x': particleDriftX,
          transition: 'background-color 0.5s ease-in-out',
        } as React.CSSProperties,
      };
    });
    setParticles(newParticles);
  }, [appState.userCount, appState.currentMood]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-2 w-full h-full"> {/* Ensure full viewport coverage */}
      {particles.map(p => (
        <div
          key={p.id}
          className={p.className}
          style={p.style}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LivingParticles;
