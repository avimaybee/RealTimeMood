
"use client";
import React from 'react';
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
const RADIUS = 110; // The radius of the circle in pixels
const ANGLE_OFFSET = -Math.PI / 2; // Start the first button at the top

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { x: 0, y: 0, scale: 0, opacity: 0 },
  visible: (i: number) => {
    const angle = (i / MOOD_CHOICES.length) * (Math.PI * 2) + ANGLE_OFFSET;
    return {
      x: RADIUS * Math.cos(angle),
      y: RADIUS * Math.sin(angle),
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', damping: 15, stiffness: 200 },
    };
  },
  exit: {
    x: 0,
    y: 0,
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ point, onSelect, onPreviewChange }) => {

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
    <motion.div
      className="fixed z-40 pointer-events-auto"
      style={{ top: point.y, left: point.x }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* This container acts as the center from which items animate */}
      <div className="relative">
        {MOOD_CHOICES.map((mood, i) => (
          <motion.div
            key={mood.name}
            custom={i}
            variants={itemVariants}
            className="absolute"
            style={{ transform: 'translate(-50%, -50%)' }} // Center the button on its point
            onHoverStart={() => handleHover(mood)}
            onHoverEnd={() => handleHover(null)}
            onTap={() => handleSelect(mood)}
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
      </div>
    </motion.div>
  );
};

export default MoodSelectionButtons;
