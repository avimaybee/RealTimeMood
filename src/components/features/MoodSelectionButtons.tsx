"use client";
import React from 'react';
import { motion } from 'framer-motion';
import type { Mood } from '@/types';
import { PREDEFINED_MOODS } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodSelectionButtonsProps {
  point: { x: number; y: number }; // Keep prop for API compatibility, but unused for positioning
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
      duration: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200 },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};


const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ onSelect, onPreviewChange }) => {

  const handleSelect = (mood: Mood) => {
    onPreviewChange(null); // Clear preview
    onSelect(mood); // Tell parent a mood was selected
  };

  const handleHover = (mood: Mood | null) => {
    onPreviewChange(mood);
    if (mood && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // A short, sharp vibration for a "click" feel
    }
  };

  return (
    // This outer container is positioned safely away from the footer. It no longer depends on the touch `point`.
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center pb-52 px-4 pointer-events-none"
    >
      {/* This inner container uses flexbox to create a responsive, wrapping layout for the buttons */}
      <motion.div
        className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-sm pointer-events-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {MOOD_CHOICES.map((mood) => (
          <motion.div
            key={mood.name}
            variants={itemVariants}
            className="flex-shrink-0"
            onHoverStart={() => handleHover(mood)}
            onHoverEnd={() => handleHover(null)}
            onTap={() => handleSelect(mood)} // Use onTap for a more responsive feel
          >
            <Button
              className={cn(
                "rounded-full h-auto px-4 py-2 text-sm shadow-soft frosted-glass interactive-glow"
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
    </motion.div>
  );
};

export default MoodSelectionButtons;
