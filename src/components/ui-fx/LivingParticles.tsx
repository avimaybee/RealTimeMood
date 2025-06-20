
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
// moodToHslString is not used directly for particles anymore, but hsla is.

const LivingParticles: React.FC = () => {
  const { appState } = useMood();
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    // Scale particle count based on userCount (50-500)
    // Assuming userCount typically ranges from 100 to 10000 for this mapping
    const minUserCountForScale = 100;
    const maxUserCountForScale = 10000;
    const minParticles = 50;
    const maxParticles = 500;

    let normalizedUserCount = (appState.userCount - minUserCountForScale) / (maxUserCountForScale - minUserCountForScale);
    normalizedUserCount = Math.max(0, Math.min(1, normalizedUserCount)); // Clamp between 0 and 1
    
    const numParticles = Math.floor(minParticles + normalizedUserCount * (maxParticles - minParticles));

    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      const size = Math.random() * 4 + 1.5; // 1.5px to 5.5px, slightly smaller for "firefly" feel
      const duration = Math.random() * 15 + 10; // 10s to 25s
      const delay = Math.random() * 15; // 0s to 15s
      const particleAlpha = Math.random() * 0.4 + 0.2; // 0.2 to 0.6 for ethereal look
      const particleDriftX = `${(Math.random() - 0.5) * 10}vw`; // Random horizontal drift

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`, // Start below screen and float up
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          backgroundColor: `hsla(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, ${particleAlpha})`,
          '--particle-drift-x': particleDriftX, // CSS custom property for animation
        } as React.CSSProperties, // Added type assertion
      };
    });
    setParticles(newParticles);
  }, [appState.currentMood, appState.userCount]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-2"> {/* z-index updated to 2 */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-float" // Animation defined in tailwind.config.ts
          style={{ ...p.style, transition: 'background-color 0.5s ease-in-out' }} // mood color transition
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LivingParticles;

