
"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneFireworks: React.FC = () => {
  const { appState, appState: { contributionCount } } = useMood();
  const [showFireworks, setShowFireworks] = useState(false);
  const [milestoneNumber, setMilestoneNumber] = useState(0);
  const prevContributionCountRef = useRef(contributionCount);

  // Define the milestone thresholds
  const milestones = useMemo(() => [
    10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000,
  ], []);

  useEffect(() => {
    const prevCount = prevContributionCountRef.current;
    const currentCount = contributionCount;

    // Find if any milestone has been crossed between the previous and current count
    const crossedMilestone = milestones.find(m => prevCount < m && currentCount >= m);

    if (crossedMilestone) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // Strong, celebratory vibration pattern
        navigator.vibrate([200, 100, 200]); 
      }
      // TODO: Play triumphant, escalating chime sequence + soft "pop" sound
      // TODO: Play deep, resonant "gong" or "bell" sound as message appears

      let timer: NodeJS.Timeout;
      setMilestoneNumber(crossedMilestone);
      setShowFireworks(true);
      timer = setTimeout(() => setShowFireworks(false), 4000); // Show for 4 seconds
      
      // Cleanup the timer
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // Update the ref to the current count for the next check
    prevContributionCountRef.current = currentCount;
  }, [contributionCount, milestones]);

  const particleCount = 40; // Reduced for performance
  const burstCount = 4;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center" aria-hidden="true">
      <AnimatePresence>
        {showFireworks && (
          <motion.h1
            key="celebration-message"
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: 'easeOut' } }}
            exit={{ opacity: 0, scale: 0.7, y: -40, transition: { duration: 0.5, ease: 'easeIn' } }}
            className="text-4xl md:text-6xl font-bold text-white text-shadow-pop"
            style={{
              filter: `drop-shadow(0 0 20px ${moodToHslString(appState.currentMood)}) drop-shadow(0 0 10px white)`
            }}
          >
            {milestoneNumber.toLocaleString()} Moods Shared!
          </motion.h1>
        )}
      </AnimatePresence>

      {showFireworks && Array.from({ length: burstCount }).map((_, burstIndex) => (
        Array.from({ length: particleCount }).map((_, particleIndex) => {
          const angle = (particleIndex / particleCount) * 360;
          const distance = 80 + Math.random() * 70; // 80 to 150px
          const duration = 1 + Math.random() * 0.8; // 1s to 1.8s
          const delay = burstIndex * 0.2 + Math.random() * 0.2;
          const size = 1.5 + Math.random() * 2; // 1.5px to 3.5px

          return (
            <div
              key={`burst-${burstIndex}-particle-${particleIndex}`}
              className="absolute top-1/2 left-1/2 rounded-full animate-fireworks-burst"
              style={{
                backgroundColor: moodToHslString(appState.currentMood),
                width: `${size}px`,
                height: `${size}px`,
                willChange: 'transform, opacity',
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                '--particle-angle': `${angle}deg`,
                '--particle-distance': `${distance}px`,
              } as React.CSSProperties}
            />
          );
        })
      ))}
    </div>
  );
};

export default MilestoneFireworks;
