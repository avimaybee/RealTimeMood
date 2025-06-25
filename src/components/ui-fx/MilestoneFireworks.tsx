
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { moodToHslString } from '@/lib/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

// Define the milestones we want to celebrate
const MILESTONES = [25, 50, 100, 250, 500, 1000];
const LOCAL_STORAGE_KEY = 'celebratedMilestones';

const MilestoneFireworks: React.FC = () => {
  const { currentMood, contributionCount } = useMood();
  const [activeCelebration, setActiveCelebration] = useState<number | null>(null);
  const [celebrated, setCelebrated] = useState<number[]>([]);
  const prevContributionCountRef = useRef(contributionCount);

  // Load celebrated milestones from localStorage on initial mount
  useEffect(() => {
    try {
      const storedMilestones = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedMilestones) {
        setCelebrated(JSON.parse(storedMilestones));
      }
    } catch (error) {
      console.error("Could not parse celebrated milestones from localStorage", error);
    }
  }, []);


  // This effect checks if a new, un-celebrated milestone has been crossed
  useEffect(() => {
    const prevCount = prevContributionCountRef.current;
    const currentCount = contributionCount;

    // Find the milestone that was just passed
    const milestoneCrossed = MILESTONES.find(
      (milestone) => prevCount < milestone && currentCount >= milestone
    );

    // Check if this milestone is new and has not been celebrated before
    if (milestoneCrossed && !celebrated.includes(milestoneCrossed)) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Start the celebration
      setActiveCelebration(milestoneCrossed);

      // Mark this milestone as celebrated and save to localStorage
      const newCelebrated = [...celebrated, milestoneCrossed];
      setCelebrated(newCelebrated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCelebrated));
      } catch (error) {
        console.error("Could not save celebrated milestones to localStorage", error);
      }
    }

    // Always update the ref to the current count for the next check
    prevContributionCountRef.current = currentCount;
  }, [contributionCount, celebrated]);

  // This effect handles turning OFF the fireworks after a delay
  useEffect(() => {
    if (activeCelebration !== null) {
      const timer = setTimeout(() => {
        setActiveCelebration(null);
      }, 10000); // Duration of the celebration

      return () => clearTimeout(timer);
    }
  }, [activeCelebration]);

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
