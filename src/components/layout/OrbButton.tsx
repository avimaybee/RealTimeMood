
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
  // chargeData now only needs to hold the mood.
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const motionDivRef = useRef<HTMLDivElement>(null);

  const handleOrbTap = () => {
    if (isCharging) return; // Prevent interaction while charging

    setInteractionMode('bar');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Sharp haptic for morph start
    }
  };

  const handleBarInteraction = (event: PointerEvent<HTMLDivElement> | MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        saturation: 85, // Use a vibrant, consistent saturation for selections
        lightness: 60, // Use a vibrant, consistent lightness for selections
    };

    // Store charge data (mood only) and start the charging sequence
    setChargeData({ mood: newMood });
    setIsCharging(true);
    setInteractionMode('orb'); // Morph back to orb to begin charging
  };

  useEffect(() => {
    // This effect handles the "charge and release" sequence.
    if (isCharging && chargeData) {
      // Intense haptic for starting the charge
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100); 
      }

      // After a delay, release the energy from the orb's center.
      const chargeTimeout = setTimeout(() => {
        let ripplePosition: { x: number; y: number } | null = null;
        // Ensure the ripple originates from the Orb's current position.
        if (motionDivRef.current) {
          const orbRect = motionDivRef.current.getBoundingClientRect();
          ripplePosition = {
            x: orbRect.left + orbRect.width / 2,
            y: orbRect.top + orbRect.height / 2,
          };
        }
        
        // Trigger the ripple from the orb's center.
        recordContribution(chargeData.mood, ripplePosition);
        
        // Reset state after the ripple is triggered
        setIsCharging(false);
        setChargeData(null);
      }, 500); // 500ms moment of tension

      return () => clearTimeout(chargeTimeout);
    }
  }, [isCharging, chargeData, recordContribution]);

  const isBar = interactionMode === 'bar';

  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 z-40 flex items-center justify-center";

  // Smoother, more elastic spring animation for the morph.
  const orbVariants = {
    orb: {
      width: '80px',
      height: '80px',
      borderRadius: '9999px',
      transition: { type: 'spring', stiffness: 400, damping: 35 }
    },
    bar: {
      width: '80vw',
      maxWidth: '500px',
      height: '16px',
      borderRadius: '16px',
      transition: { type: 'spring', stiffness: 400, damping: 35 }
    }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    bar: { scale: 0, opacity: 0 },
    charging: { scale: 0, opacity: 0 },
  };
  
  const gradientBackground = 'linear-gradient(to right, hsl(0 100% 60%), hsl(30 100% 60%), hsl(60 100% 60%), hsl(90 100% 60%), hsl(120 100% 60%), hsl(150 100% 60%), hsl(180 100% 60%), hsl(210 100% 60%), hsl(240 100% 60%), hsl(270 100% 60%), hsl(300 100% 60%), hsl(330 100% 60%), hsl(360 100% 60%))';

  // Simplified style logic for clarity and correctness.
  const getMotionStyle = (): React.CSSProperties => {
    if (isBar) {
      return {
        background: gradientBackground,
        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      };
    }
    if (isCharging && chargeData) {
      const chargeColor = moodToHslString(chargeData.mood);
      return {
        // The base orb is a semi-transparent white, preserving its look.
        background: 'rgba(255, 255, 255, 0.1)',
        // The glow is purely in the box-shadow, preserving the orb shape.
        boxShadow: `0 0 25px 8px ${chargeColor}, inset 0 0 10px 2px rgba(255,255,255,0.5)`,
        backdropFilter: 'blur(12px)',
      };
    }
    // Default Orb style.
    return {
      background: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
    };
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
        animate={isBar ? "bar" : "orb"}
        onTap={!isBar ? handleOrbTap : handleBarInteraction}
        className={cn(
            "relative flex items-center justify-center cursor-pointer",
            isCharging && "cursor-default" // Disable pointer when charging
        )}
        style={{
          ...getMotionStyle(),
          transition: 'box-shadow 0.2s ease-in-out, background 0.2s ease-in-out',
        }}
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
