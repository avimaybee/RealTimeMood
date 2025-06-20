
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';

const LivingParticles: React.FC = () => {
  const { appState } = useMood();
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    const numParticles = 15; // Subtle amount
    const newParticles = Array.from({ length: numParticles }).map((_, i) => {
      const size = Math.random() * 5 + 2; // 2px to 7px
      const duration = Math.random() * 10 + 10; // 10s to 20s
      const delay = Math.random() * 10; // 0s to 10s
      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100 + 100}%`, // Start below screen and float up
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          backgroundColor: moodToHslString(appState.currentMood), // Particles match mood color
          opacity: Math.random() * 0.3 + 0.2, // 0.2 to 0.5
        },
      };
    });
    setParticles(newParticles);
  }, [appState.currentMood]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
