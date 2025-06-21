
"use client";
import React, { useState, useRef, useEffect } from 'react';
import type { PointerEvent } from 'react';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo } from 'framer-motion';

const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting } = useMood();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const motionDivRef = useRef<HTMLDivElement>(null);

  const handleOrbTap = () => {
    if (isCharging) return; 

    setInteractionMode('bar');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleBarInteraction = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!motionDivRef.current || isCharging) return;

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
        saturation: 85,
        lightness: 60,
    };

    setChargeData({ mood: newMood });
    setIsCharging(true);
    setInteractionMode('orb');
  };

  useEffect(() => {
    if (isCharging && chargeData) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100); 
      }

      const chargeTimeout = setTimeout(() => {
        let ripplePosition: { x: number; y: number } | null = null;
        if (motionDivRef.current) {
          const orbRect = motionDivRef.current.getBoundingClientRect();
          ripplePosition = {
            x: orbRect.left + orbRect.width / 2,
            y: orbRect.top + orbRect.height / 2,
          };
        }
        
        recordContribution(chargeData.mood, ripplePosition);
        
        setIsCharging(false);
        setChargeData(null);
      }, 500); 

      return () => clearTimeout(chargeTimeout);
    }
  }, [isCharging, chargeData, recordContribution]);
  
  const isBar = interactionMode === 'bar';

  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 z-40 flex items-center justify-center";

  const morphTransition = { type: 'spring', stiffness: 400, damping: 35 };

  const gradientBackground = 'linear-gradient(to right, hsl(0 100% 60%), hsl(30 100% 60%), hsl(60 100% 60%), hsl(90 100% 60%), hsl(120 100% 60%), hsl(150 100% 60%), hsl(180 100% 60%), hsl(210 100% 60%), hsl(240 100% 60%), hsl(270 100% 60%), hsl(300 100% 60%), hsl(330 100% 60%), hsl(360 100% 60%))';
  
  const orbVariants = {
    orb: {
      width: '80px',
      height: '80px',
      borderRadius: '9999px',
      background: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
      transition: morphTransition,
    },
    bar: {
      width: '80vw',
      maxWidth: '500px',
      height: '16px',
      borderRadius: '16px',
      background: gradientBackground,
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(0px)',
      transition: morphTransition,
    },
    charging: {
        width: '80px',
        height: '80px',
        borderRadius: '9999px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: chargeData ? `0 0 25px 8px ${moodToHslString(chargeData.mood)}, inset 0 0 10px 2px rgba(255,255,255,0.5)` : '0 12px 32px rgba(0,0,0,0.3)',
        transition: { ...morphTransition, duration: 0.2 },
    }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    bar: { scale: 0, opacity: 0 },
    charging: { scale: 0, opacity: 0 },
  };

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
        animate={isCharging ? "charging" : (isBar ? "bar" : "orb")}
        onTap={isBar ? handleBarInteraction : handleOrbTap}
        className={cn(
            "relative flex items-center justify-center cursor-pointer",
            isCharging && "cursor-default"
        )}
      >
        <motion.div 
            variants={iconVariants}
            animate={isCharging ? 'charging' : isBar ? 'bar' : 'orb'}
        >
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
