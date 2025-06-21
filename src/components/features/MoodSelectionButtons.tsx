
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
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => {
    const angle = (i / MOOD_CHOICES.length) * Math.PI * 2 - (Math.PI / 2); // Start from top
    return {
      x: ARC_RADIUS * Math.cos(angle),
      y: ARC_RADIUS * Math.sin(angle),
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 200,
      },
    };
  },
};


const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ point, onSelect }) => {
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
      exit="hidden"
    >
      {MOOD_CHOICES.map((mood, i) => (
        <motion.div
          key={mood.name}
          custom={i}
          variants={itemVariants}
          className="absolute"
        >
          <Button
            onClick={() => onSelect(mood)}
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
