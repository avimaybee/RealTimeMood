
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

const LivingParticles: React.FC = () => {
  const { appState } = useMood();
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const { userCount, currentMood } = appState;
  
    // --- Particle Count Scaling ---
    const minUserCountForScale = 100;
    const maxUserCountForScale = 10000;
    const minParticles = 50;
    const maxParticles = 500;
    let normalizedUserCount = (userCount - minUserCountForScale) / (maxUserCountForScale - minUserCountForScale);
    normalizedUserCount = Math.max(0, Math.min(1, normalizedUserCount)); 
    const numParticles = Math.floor(minParticles + normalizedUserCount * (maxParticles - minParticles));

    // --- Dynamic Behavior based on Mood ---
    const { hue, saturation, lightness } = currentMood;

    // Normalize mood properties (0 to 1) for calculations
    const normSaturation = saturation / 100;
    const normLightness = lightness / 100;

    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      // Size based on saturation (more saturated = bigger particles)
      const size = (2.5 + normSaturation * 3) * (Math.random() * 0.5 + 0.75); // base size * random variance

      // Duration (speed) based on lightness (brighter/calmer = slower/longer duration)
      // Base duration from 10s (fast) to 25s (slow)
      const duration = (25 - normLightness * 15) * (Math.random() * 0.5 + 0.75); // base duration * random variance

      const delay = Math.random() * duration; 
      
      // Intensity (alpha) based on saturation (more saturated = more intense)
      const particleAlpha = (0.4 + normSaturation * 0.4) * (Math.random() * 0.4 + 0.8); // base alpha * random variance

      // A subtle horizontal drift for more organic movement
      const particleDriftX = `${(Math.random() - 0.5) * 10}vw`; 

      // Color now based on mood hue, with high lightness to appear as a glow
      const particleLightness = 80 + Math.random() * 20; // 80% to 100% lightness for a bright particle

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`, // Start below the screen
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          backgroundColor: `hsla(${hue}, ${saturation}%, ${particleLightness}%, ${particleAlpha})`,
          '--particle-drift-x': particleDriftX,
          transition: 'background-color 0.5s ease-in-out', // Add transition for color change
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
          className="absolute rounded-full animate-particle-float"
          style={p.style}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LivingParticles;
