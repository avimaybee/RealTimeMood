
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
    const maxParticles = 500; // As per spec

    let normalizedUserCount = (appState.userCount - minUserCountForScale) / (maxUserCountForScale - minUserCountForScale);
    normalizedUserCount = Math.max(0, Math.min(1, normalizedUserCount)); 
    
    const numParticles = Math.floor(minParticles + normalizedUserCount * (maxParticles - minParticles));

    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      const size = Math.random() * 3 + 2.5; // Size: 2.5px to 5.5px (slightly larger min)
      const duration = Math.random() * 15 + 10; 
      const delay = Math.random() * 15; 
      const particleAlpha = Math.random() * 0.4 + 0.4; // Alpha: 0.4 to 0.8 (more visible)
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
          // Use fixed white color for particles to ensure contrast, alpha controlled by particleAlpha
          backgroundColor: `hsla(0, 0%, 100%, ${particleAlpha})`, 
          '--particle-drift-x': particleDriftX,
        } as React.CSSProperties,
      };
    });
    setParticles(newParticles);
  }, [appState.userCount]); // Removed appState.currentMood dependency as color is now fixed white

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-2 w-full h-full"> {/* Ensure full viewport coverage */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-float"
          style={p.style} // Removed background-color transition as it's fixed white now
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default LivingParticles;
