
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneFireworks: React.FC = () => {
  const { currentMood, celebratedMilestones } = useMood();
  const [activeCelebration, setActiveCelebration] = useState<number | null>(null);
  const prevCelebratedRef = useRef<number[]>(celebratedMilestones || []);

  // This effect detects when a new milestone has been added to the global list
  useEffect(() => {
    // Find milestones that are in the new list but were not in the old one
    const newlyCelebrated = celebratedMilestones.filter(
      (milestone) => !prevCelebratedRef.current.includes(milestone)
    );

    // If we found a newly celebrated milestone, trigger the animation
    if (newlyCelebrated.length > 0) {
      const milestoneToCelebrate = newlyCelebrated[0]; // Celebrate the first new one we find

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      setActiveCelebration(milestoneToCelebrate);

      // Set a timer to turn off the fireworks display after 10 seconds
      const timer = setTimeout(() => {
        setActiveCelebration(null);
      }, 10000);

      // Cleanup timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [celebratedMilestones]);

  // This effect keeps the "previous" ref updated for the next check
  useEffect(() => {
    prevCelebratedRef.current = celebratedMilestones;
  }, [celebratedMilestones]);


  const showFireworks = activeCelebration !== null;
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
            {activeCelebration?.toLocaleString()} Moods Shared!
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
