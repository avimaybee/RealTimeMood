
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Mood } from '@/types';
import { PREDEFINED_MOODS } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodSelectionButtonsProps {
  point: { x: number; y: number };
  onSelect: (mood: Mood) => void;
  onPreviewChange: (mood: Mood | null) => void;
}

const MOOD_CHOICES = PREDEFINED_MOODS.slice(0, 8);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren",
      duration: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (custom: { i: number; arcRadius: number }) => ({
    x: custom.arcRadius * Math.cos((custom.i / MOOD_CHOICES.length) * Math.PI * 2 - Math.PI / 2),
    y: custom.arcRadius * Math.sin((custom.i / MOOD_CHOICES.length) * Math.PI * 2 - Math.PI / 2),
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200 },
  }),
  exitSelected: { // "Absorb" animation
    x: 0,
    y: 0,
    scale: 0.1,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] }, // liquid drop
  },
  exitOther: { // "Fade out" animation for non-selected items on selection
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: { // Generic exit for dismissal
    x: 0,
    y: 0,
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  }
};


const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ point, onSelect, onPreviewChange }) => {
  const [exitingWith, setExitingWith] = useState<Mood | null>(null);
  const [arcRadius, setArcRadius] = useState(120);

  useEffect(() => {
    const updateRadius = () => {
      setArcRadius(window.innerWidth < 480 ? 90 : 120);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const handleSelect = (mood: Mood) => {
    if (exitingWith) return; // Prevent multiple clicks while exiting
    onPreviewChange(null); // Clear live preview immediately on selection
    setExitingWith(mood); // Trigger exit animations
  };

  const handleHover = (mood: Mood | null) => {
    if (exitingWith) return; // Don't allow preview changes while exiting
    onPreviewChange(mood);
    if (mood && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // A short, sharp vibration for a "click" feel
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        left: point.x,
        top: point.y,
        width: 1,
        height: 1,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={() => {
        if (exitingWith) {
          onSelect(exitingWith);
        }
      }}
    >
      {MOOD_CHOICES.map((mood, i) => (
        <motion.div
          key={mood.name}
          custom={{ i, arcRadius }}
          variants={itemVariants}
          animate={
            exitingWith
              ? exitingWith.name === mood.name
                ? "exitSelected"
                : "exitOther"
              : "visible"
          }
          exit="exit" // Use the generic exit for AnimatePresence dismissal
          className="absolute"
          onHoverStart={() => handleHover(mood)}
          onHoverEnd={() => handleHover(null)}
        >
          <Button
            onClick={() => handleSelect(mood)}
            className={cn(
                "rounded-full h-auto px-4 py-2 text-sm shadow-soft frosted-glass"
            )}
            style={{ 
                borderColor: `hsla(${mood.hue}, ${mood.saturation}%, ${mood.lightness}%, 0.5)`
             }}
          >
            {mood.adjective}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MoodSelectionButtons;
