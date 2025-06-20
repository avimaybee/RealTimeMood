
"use client";
import React, { useEffect, useState } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';

const MilestoneFireworks: React.FC = () => {
  const { appState, appState: { contributionCount } } = useMood();
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    // Trigger fireworks at certain contribution milestones
    if (contributionCount > 0 && contributionCount % 100 === 0) { // Every 100 contributions
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 5000); // Show for 5 seconds
    }
  }, [contributionCount]);

  if (!showFireworks) return null;

  const particleCount = 50; // Number of particles per firework burst

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, burstIndex) => ( // 5 bursts
        Array.from({ length: particleCount }).map((_, particleIndex) => {
          const angle = (particleIndex / particleCount) * 360;
          const distance = Math.random() * 100 + 50; // 50 to 150 units
          const duration = Math.random() * 1.5 + 1; // 1s to 2.5s
          const delay = burstIndex * 0.3 + Math.random() * 0.5;
          const size = Math.random() * 4 + 2;

          return (
            <div
              key={`burst-${burstIndex}-particle-${particleIndex}`}
              className="absolute rounded-full"
              style={{
                backgroundColor: moodToHslString(appState.currentMood),
                width: `${size}px`,
                height: `${size}px`,
                left: '50%',
                top: '50%',
                opacity: 0,
                animation: `firework-particle ${duration}s cubic-bezier(0.1, 0.8, 0.2, 1) ${delay}s forwards`,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${distance}px) scale(0)`,
                // Keyframes for 'firework-particle' would be needed in globals.css or here
                // For brevity, I'm omitting explicit keyframes here, but they would be like:
                // @keyframes firework-particle { 0% { opacity: 1, transform: ... scale(0) } 50% { opacity: 1, transform: ... scale(1) } 100% { opacity: 0, transform: ... scale(0.5) translateY(20px) } }
                // Using a simplified fade-in/out for now
                animationName: 'fade-in', // This is a very basic substitute
              }}
            />
          );
        })
      ))}
       <style jsx>{`
        @keyframes firework-particle {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(${Math.random()*360}deg) translateX(0px) scale(0.1); }
          50% { opacity: 1; transform: translate(-50%, -50%) rotate(${Math.random()*360}deg) translateX(${Math.random()*150 + 50}px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(${Math.random()*360}deg) translateX(${Math.random()*150 + 100}px) scale(0.5) translateY(30px); }
        }
      `}</style>
    </div>
  );
};

export default MilestoneFireworks;
