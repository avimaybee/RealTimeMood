
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
      timer = setTimeout(() => setShowFireworks(false), 5000); // Show for 5 seconds
      
      // Cleanup the timer
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // Update the ref to the current count for the next check
    prevContributionCountRef.current = currentCount;
  }, [contributionCount, milestones]);

  const particleCount = 50; // Number of particles per firework burst

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

      {showFireworks && Array.from({ length: 5 }).map((_, burstIndex) => (
        Array.from({ length: particleCount }).map((_, particleIndex) => {
          const angle = (particleIndex / particleCount) * 360 + (burstIndex * 72);
          const distance = Math.random() * 120 + 80;
          const duration = Math.random() * 1.5 + 1.2;
          const delay = burstIndex * 0.25 + Math.random() * 0.3;
          const size = Math.random() * 3 + 1.5;

          const initialRotate = angle;
          const midTranslateX = distance * (Math.random() * 0.3 + 0.4);
          const midRotate = angle + (Math.random() - 0.5) * 30;
          const finalTranslateX = distance * (Math.random() * 0.2 + 0.8);
          const finalRotate = angle + (Math.random() - 0.5) * 60;

          return (
            <div
              key={`burst-${burstIndex}-particle-${particleIndex}`}
              className="absolute top-1/2 left-1/2 rounded-full animate-firework-particle-anim opacity-0"
              style={{
                backgroundColor: moodToHslString(appState.currentMood),
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                '--particle-initial-rotate': `${initialRotate}deg`,
                '--particle-mid-rotate': `${midRotate}deg`,
                '--particle-mid-translate-x': `${midTranslateX}px`,
                '--particle-final-rotate': `${finalRotate}deg`,
                '--particle-final-translate-x': `${finalTranslateX}px`,
              } as React.CSSProperties}
            />
          );
        })
      ))}
    </div>
  );
};

export default MilestoneFireworks;
