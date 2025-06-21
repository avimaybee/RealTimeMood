
"use client";
import React, { useState } from 'react';
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
const ARC_RADIUS = 120; // in pixels

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
      when: "afterChildren", // Wait for children to finish exiting
      duration: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    x: ARC_RADIUS * Math.cos((i / MOOD_CHOICES.length) * Math.PI * 2 - Math.PI / 2),
    y: ARC_RADIUS * Math.sin((i / MOOD_CHOICES.length) * Math.PI * 2 - Math.PI / 2),
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
  exitOther: { // "Fade out" animation
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};


const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ point, onSelect, onPreviewChange }) => {
  const [exitingWith, setExitingWith] = useState<Mood | null>(null);

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
      animate={exitingWith ? "exit" : "visible"}
      onAnimationComplete={() => {
        if (exitingWith) {
          onSelect(exitingWith);
        }
      }}
    >
      {MOOD_CHOICES.map((mood, i) => (
        <motion.div
          key={mood.name}
          custom={i}
          variants={itemVariants}
          animate={
            exitingWith
              ? exitingWith.name === mood.name
                ? "exitSelected"
                : "exitOther"
              : "visible"
          }
          className="absolute"
          onHoverStart={() => handleHover(mood)}
          onHoverEnd={() => handleHover(null)}
        >
          <Button
            onClick={() => handleSelect(mood)}
            className={cn(
                "rounded-full h-auto px-4 py-2 text-sm shadow-soft frosted-glass text-shadow-pop"
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
