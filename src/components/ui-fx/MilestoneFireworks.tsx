
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneFireworks: React.FC = () => {
  const { currentMood, contributionCount } = useMood();
  const [showFireworks, setShowFireworks] = useState(false);
  const [hasFired, setHasFired] = useState(false);
  const prevContributionCountRef = useRef(contributionCount);

  const TARGET_MILESTONE = 25;

  // Effect to detect the milestone and turn on the fireworks
  useEffect(() => {
    const prevCount = prevContributionCountRef.current;
    const currentCount = contributionCount;

    // Check if the milestone was crossed and it hasn't fired before
    if (currentCount >= TARGET_MILESTONE && prevCount < TARGET_MILESTONE && !hasFired) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // Strong, celebratory vibration pattern
        navigator.vibrate([200, 100, 200]);
      }
      
      setHasFired(true); // Mark as fired to prevent it from running again
      setShowFireworks(true);
    }

    // Update the ref to the current count for the next check
    prevContributionCountRef.current = currentCount;
  }, [contributionCount, hasFired]);

  // This effect handles turning OFF the fireworks after a delay
  useEffect(() => {
    if (showFireworks) {
      const timer = setTimeout(() => {
        setShowFireworks(false);
      }, 10000); // Duration of the celebration

      return () => clearTimeout(timer);
    }
  }, [showFireworks]);

  const particleCount = 40;
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
              filter: `drop-shadow(0 0 20px ${moodToHslString(currentMood)}) drop-shadow(0 0 10px white)`
            }}
          >
            {TARGET_MILESTONE.toLocaleString()} Moods Shared!
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
                backgroundColor: moodToHslString(currentMood),
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
