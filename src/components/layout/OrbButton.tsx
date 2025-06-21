
"use client";
import React, { useState, useRef, useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';
import RadialBloomEffect from '@/components/ui-fx/RadialBloomEffect';
import MoodSelectionButtons from '@/components/features/MoodSelectionButtons';


const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting, setPreviewMood } = useMood();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const motionDivRef = useRef<HTMLDivElement>(null);
  const [bloomPoint, setBloomPoint] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTap = (event: MouseEvent | TouchEvent | ReactPointerEvent, info: PanInfo) => {
    clearLongPressTimeout();
    if (isCharging || bloomPoint) return;

    if (interactionMode === 'orb') {
      setInteractionMode('bar');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      return;
    }

    if (interactionMode === 'bar') {
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
            saturation: 85,
            lightness: 60,
        };
        
        setInteractionMode('orb'); // Start morphing back to orb
        setChargeData({ mood: newMood });
        setIsCharging(true); // Begin the charge sequence
    }
  };

  const handleLongPress = (point: {clientX: number, clientY: number}) => {
    if (interactionMode === 'bar' || isCharging) return;
    setBloomPoint({ x: point.clientX, y: point.clientY });
  };
  
  const handlePointerDown = (event: ReactPointerEvent) => {
    if (interactionMode !== 'orb' || isCharging || bloomPoint) return;
    
    const { clientX, clientY } = event;
    longPressTimeoutRef.current = setTimeout(() => {
      handleLongPress({ clientX, clientY });
    }, 250); // 250ms threshold
  };

  const clearLongPressTimeout = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleMoodSelectionFromBloom = (mood: Mood) => {
    setBloomPoint(null);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100); 
    }
    setInteractionMode('orb');
    setChargeData({ mood: mood });
    setIsCharging(true);
  };
  
  const handleDismissBloom = () => {
    setBloomPoint(null);
  };

  useEffect(() => {
    if (isCharging && chargeData) {
      const chargeTimeout = setTimeout(() => {
        if (motionDivRef.current) {
            const orbRect = motionDivRef.current.getBoundingClientRect();
            const ripplePosition = {
                x: orbRect.left + orbRect.width / 2,
                y: orbRect.top + orbRect.height / 2,
            };
            recordContribution(chargeData.mood, ripplePosition);
        }
        
        setIsCharging(false);
        setChargeData(null);
      }, 500);

      return () => clearTimeout(chargeTimeout);
    }
  }, [isCharging, chargeData, recordContribution]);
  
  const isBar = interactionMode === 'bar';

  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 z-40 flex items-center justify-center";
  const morphTransition = { type: 'tween', duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] };

  const gradientBackground = 'linear-gradient(to right, hsl(0 100% 60%), hsl(30 100% 60%), hsl(60 100% 60%), hsl(90 100% 60%), hsl(120 100% 60%), hsl(150 100% 60%), hsl(180 100% 60%), hsl(210 100% 60%), hsl(240 100% 60%), hsl(270 100% 60%), hsl(300 100% 60%), hsl(330 100% 60%), hsl(360 100% 60%))';
  
  const orbVariants = {
    orb: {
      width: '80px', height: '80px', borderRadius: '9999px',
      background: 'rgba(255, 255, 255, 0.1)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
    },
    bar: {
      width: '80vw', maxWidth: '500px', height: '16px', borderRadius: '16px',
      background: gradientBackground, boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(0px)', scale: 1, opacity: 1,
    },
    charging: {
        width: '80px', height: '80px', borderRadius: '9999px',
        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)',
        boxShadow: chargeData ? `0 0 25px 8px ${moodToHslString(chargeData.mood)}, inset 0 0 10px 2px rgba(255,255,255,0.5)` : '0 12px 32px rgba(0,0,0,0.3)',
        scale: 1, opacity: 1,
    },
    hidden: { scale: 0, opacity: 0 }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    bar: { scale: 0, opacity: 0 },
    charging: { scale: 0, opacity: 0 },
    hidden: { scale: 0, opacity: 0},
  };

  const getAnimationState = () => {
    if (bloomPoint) return 'hidden';
    if (isCharging) return 'charging';
    if (isBar) return 'bar';
    return 'orb';
  }
  const animationState = getAnimationState();

  return (
    <>
      <motion.div
        className={cn(orbContainerBaseClasses, "left-1/2")}
        style={{ x: "-50%" }}
        animate={{ y: isCollectiveShifting ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        <motion.div
          ref={motionDivRef}
          variants={orbVariants}
          initial={false}
          animate={animationState}
          transition={morphTransition}
          onTap={handleTap}
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimeout}
          onPointerLeave={clearLongPressTimeout}
          className={cn(
              "relative flex items-center justify-center cursor-pointer",
              (isCharging || bloomPoint) && "pointer-events-none"
          )}
        >
          <motion.div variants={iconVariants} animate={animationState}>
            <Plus className="w-10 h-10 text-white" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </motion.div>

      {isClient && createPortal(
        <AnimatePresence onExitComplete={() => setPreviewMood(null)}>
          {bloomPoint && (
            <motion.div key="bloom-container">
              <div data-radial-bloom-active-page-marker />

              {/* Backdrop for dismissal */}
              <motion.div
                className="fixed inset-0 z-30"
                onPointerDown={handleDismissBloom}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />

              <RadialBloomEffect point={bloomPoint} />
              
              <MoodSelectionButtons 
                key="mood-buttons"
                point={bloomPoint} 
                onSelect={handleMoodSelectionFromBloom} 
                onPreviewChange={setPreviewMood}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default OrbButton;
