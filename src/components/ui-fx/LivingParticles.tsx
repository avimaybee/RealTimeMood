
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';

const LivingParticles: React.FC = () => {
  const { appState } = useMood();
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const minUserCountForScale = 100;
    const maxUserCountForScale = 10000;
    const minParticles = 50;
    const maxParticles = 500;

    let normalizedUserCount = (appState.userCount - minUserCountForScale) / (maxUserCountForScale - minUserCountForScale);
    normalizedUserCount = Math.max(0, Math.min(1, normalizedUserCount)); 
    
    const numParticles = Math.floor(minParticles + normalizedUserCount * (maxParticles - minParticles));

    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      const size = Math.random() * 4 + 2.5; // Size: 2.5px to 6.5px
      const duration = Math.random() * 15 + 10; 
      const delay = Math.random() * 15; 
      const particleAlpha = Math.random() * 0.5 + 0.3; // Alpha: 0.3 to 0.8
      const particleDriftX = `${(Math.random() - 0.5) * 10}vw`; 

      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`, 
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          backgroundColor: `hsla(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, ${particleAlpha})`,
          '--particle-drift-x': particleDriftX,
          // Opacity is now primarily controlled by the animation keyframes for fade in/out
        } as React.CSSProperties,
      };
    });
    setParticles(newParticles);
  }, [appState.currentMood, appState.userCount]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-2"> {/* z-index: above overlays, below UI */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-float"
          style={{ ...p.style, transition: 'background-color 0.5s ease-in-out' }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LivingParticles;
