"use client";
import React from 'react';
import { motion } from 'framer-motion';
import type { Mood } from '@/types';
import { PREDEFINED_MOODS } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';

interface MoodSelectionButtonsProps {
  onSelect: (mood: Mood) => void;
}

const MOOD_CHOICES = PREDEFINED_MOODS.slice(0, 8);

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 250,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.5 },
};

const MoodSelectionButtons: React.FC<MoodSelectionButtonsProps> = ({ onSelect }) => {
  const handleSelect = (mood: Mood) => {
    onSelect(mood);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  return (
    <motion.div
      className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] sm:bottom-[calc(9rem+env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center pointer-events-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="flex flex-wrap justify-center gap-3 p-3 rounded-full frosted-glass shadow-lifted"
      >
        {MOOD_CHOICES.map((mood) => (
          <motion.div
            key={mood.name}
            variants={itemVariants}
            onTap={() => handleSelect(mood)}
            className="cursor-pointer"
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-3xl transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95',
                'bg-foreground/5'
              )}
            >
              {mood.emoji}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MoodSelectionButtons;
