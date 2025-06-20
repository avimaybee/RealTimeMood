
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';

const MilestoneFireworks: React.FC = () => {
  const { appState, appState: { contributionCount } } = useMood();
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (contributionCount > 0 && contributionCount % 100 === 0) { 
      setShowFireworks(true);
      timer = setTimeout(() => setShowFireworks(false), 5000); // Show for 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [contributionCount]);

  if (!showFireworks) return null;

  const particleCount = 50; // Number of particles per firework burst

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, burstIndex) => ( // 5 bursts
        Array.from({ length: particleCount }).map((_, particleIndex) => {
          const angle = (particleIndex / particleCount) * 360 + (burstIndex * 72); // Base angle for particle, offset for each burst
          const distance = Math.random() * 120 + 60; // Max travel distance (radius of burst)
          const duration = Math.random() * 1.5 + 1.2; // Animation duration 1.2s to 2.7s
          const delay = burstIndex * 0.25 + Math.random() * 0.3; // Stagger bursts and particles within bursts
          const size = Math.random() * 3 + 1.5; // Particle size 1.5px to 4.5px

          // CSS custom properties for unique animation per particle
          const initialRotate = angle;
          const midTranslateX = distance * (Math.random() * 0.3 + 0.4); // Mid-point translation (40-70% of distance)
          const midRotate = angle + (Math.random() - 0.5) * 30; // Slight rotation variance at mid-point
          const finalTranslateX = distance * (Math.random() * 0.2 + 0.8); // Final translation (80-100% of distance)
          const finalRotate = angle + (Math.random() - 0.5) * 60; // More rotation variance at the end

          return (
            <div
              key={`burst-${burstIndex}-particle-${particleIndex}`}
              className="absolute rounded-full"
              style={{
                backgroundColor: moodToHslString(appState.currentMood),
                width: `${size}px`,
                height: `${size}px`,
                left: '50%', // Center for transform origin
                top: '50%',  // Center for transform origin
                opacity: 0,  // Animation will control opacity
                
                // Use longhand animation properties to avoid conflicts
                animationName: 'firework-particle-anim',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)', // Simulates ease-out
                animationDelay: `${delay}s`,
                animationFillMode: 'forwards',
                
                // Pass dynamic values to keyframes via CSS custom properties
                '--particle-initial-rotate': `${initialRotate}deg`,
                '--particle-mid-rotate': `${midRotate}deg`,
                '--particle-mid-translate-x': `${midTranslateX}px`,
                '--particle-final-rotate': `${finalRotate}deg`,
                '--particle-final-translate-x': `${finalTranslateX}px`,
              } as React.CSSProperties} // Type assertion for CSS custom properties
            />
          );
        })
      ))}
       <style jsx>{`
        @keyframes firework-particle-anim {
          0% {
            opacity: 0.8; /* Start visible */
            transform: translate(-50%, -50%) rotate(var(--particle-initial-rotate)) translateX(0px) scale(0.2);
          }
          50% {
            opacity: 1; /* Full opacity mid-flight */
            transform: translate(-50%, -50%) rotate(var(--particle-mid-rotate)) translateX(var(--particle-mid-translate-x)) scale(1);
          }
          100% {
            opacity: 0; /* Fade out at the end */
            transform: translate(-50%, -50%) rotate(var(--particle-final-rotate)) translateX(var(--particle-final-translate-x)) scale(0.3) translateY(40px); /* Drift downwards */
          }
        }
      `}</style>
    </div>
  );
};

export default MilestoneFireworks;
