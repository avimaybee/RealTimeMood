
"use client";
import React, { useState, useRef } from 'react';
import type { PointerEvent } from 'react';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo } from 'framer-motion';

const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting } = useMood();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const motionDivRef = useRef<HTMLDivElement>(null);

  const handleOrbTap = () => {
    setInteractionMode('bar');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Sharp haptic for morph start
    }
  };

  const handleBarInteraction = (event: PointerEvent<HTMLDivElement> | MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!motionDivRef.current) return;

    const bar = motionDivRef.current;
    const rect = bar.getBoundingClientRect();
    const tapX = info.point.x - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, tapX / width));
    const selectedHue = Math.round(percentage * 360);

    const closestMood = findClosestMood(selectedHue);
    const newMood: Mood = {
        ...closestMood,
        hue: selectedHue,
        saturation: 85, // Use a vibrant, consistent saturation for selections
        lightness: 60, // Use a vibrant, consistent lightness for selections
    };

    recordContribution(newMood, { x: info.point.x, y: info.point.y });
    
    setInteractionMode('orb'); // Morph back
  };

  const isBar = interactionMode === 'bar';

  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 z-40 flex items-center justify-center";

  const orbVariants = {
    orb: {
      width: '80px',
      height: '80px',
      borderRadius: '9999px',
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    bar: {
      width: '80vw',
      height: '16px',
      borderRadius: '16px',
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    bar: { scale: 0, opacity: 0 }
  };
  
  const gradientBackground = 'linear-gradient(to right, hsl(0 100% 60%), hsl(30 100% 60%), hsl(60 100% 60%), hsl(90 100% 60%), hsl(120 100% 60%), hsl(150 100% 60%), hsl(180 100% 60%), hsl(210 100% 60%), hsl(240 100% 60%), hsl(270 100% 60%), hsl(300 100% 60%), hsl(330 100% 60%), hsl(360 100% 60%))';

  return (
    <motion.div
      className={cn(orbContainerBaseClasses, "left-1/2")}
      style={{ x: "-50%" }}
      animate={{ y: isCollectiveShifting ? 8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
    >
      <motion.div
        ref={motionDivRef}
        layout
        variants={orbVariants}
        initial="orb"
        animate={isBar ? "bar" : "orb"}
        onTapStart={!isBar ? handleOrbTap : undefined}
        onTap={isBar ? handleBarInteraction : undefined}
        className="relative flex cursor-pointer items-center justify-center shadow-lg"
        style={{
          background: isBar ? gradientBackground : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: isBar ? 'none' : 'blur(12px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        }}
      >
        <motion.div variants={iconVariants}>
          <Plus 
            className="w-10 h-10 text-white" 
            strokeWidth={2}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default OrbButton;
