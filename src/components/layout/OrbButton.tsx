
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
  const [chargeData, setChargeData] = useState<{ mood: Mood; position: { x: number; y: number } } | null>(null);
  const motionDivRef = useRef<HTMLDivElement>(null);

  const handleOrbTap = () => {
    if (isCharging) return; // Prevent interaction while charging

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

    // Store charge data and start the charging sequence
    setChargeData({ mood: newMood, position: { x: info.point.x, y: info.point.y } });
    setIsCharging(true);
    setInteractionMode('orb'); // Morph back
  };

  useEffect(() => {
    if (isCharging && chargeData) {
      // Intense haptic for starting the charge
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100); 
      }

      const chargeTimeout = setTimeout(() => {
        // Release the energy!
        recordContribution(chargeData.mood, chargeData.position);
        
        // Reset state after the ripple is triggered
        setIsCharging(false);
        setChargeData(null);
      }, 500); // 500ms moment of tension

      return () => clearTimeout(chargeTimeout);
    }
  }, [isCharging, chargeData, recordContribution]);

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
      maxWidth: '500px',
      height: '16px',
      borderRadius: '16px',
      transition: { type: 'spring', stiffness: 400, damping: 30 }
    }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    bar: { scale: 0, opacity: 0 },
    charging: { scale: 0, opacity: 0 },
  };
  
  const gradientBackground = 'linear-gradient(to right, hsl(0 100% 60%), hsl(30 100% 60%), hsl(60 100% 60%), hsl(90 100% 60%), hsl(120 100% 60%), hsl(150 100% 60%), hsl(180 100% 60%), hsl(210 100% 60%), hsl(240 100% 60%), hsl(270 100% 60%), hsl(300 100% 60%), hsl(330 100% 60%), hsl(360 100% 60%))';

  const motionStyle: React.CSSProperties = {
      backdropFilter: isBar ? 'none' : 'blur(12px)',
      transition: 'box-shadow 0.2s ease-in-out, background 0.2s ease-in-out',
  };

  if (isBar) {
      motionStyle.background = gradientBackground;
      motionStyle.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
  } else if (isCharging && chargeData) {
      const chargeColor = moodToHslString(chargeData.mood);
      motionStyle.background = chargeColor;
      motionStyle.boxShadow = `0 0 35px 15px ${chargeColor}, inset 0 0 15px 5px rgba(255,255,255,0.7)`;
  } else {
      motionStyle.background = 'rgba(255, 255, 255, 0.1)';
      motionStyle.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
  }

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
        className={cn(
            "relative flex items-center justify-center",
            isCharging ? "cursor-default" : "cursor-pointer"
        )}
        style={motionStyle}
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
