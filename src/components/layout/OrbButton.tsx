
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo, AnimatePresence, useMotionValue } from 'framer-motion';
import RadialBloomEffect from '@/components/ui-fx/RadialBloomEffect';
import MoodSelectionButtons from '@/components/features/MoodSelectionButtons';


const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting, setPreviewMood } = useMood();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [bloomPoint, setBloomPoint] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [barGeometry, setBarGeometry] = useState({ width: 0, left: 0 });

  // Simplified state for the thumb and preview
  const thumbX = useMotionValue(0);
  const [previewAdjective, setPreviewAdjective] = useState('');
  const [isInteractingWithBar, setIsInteractingWithBar] = useState(false);
  const THUMB_WIDTH = 40;

  useEffect(() => {
    setIsClient(true);
    
    const calculateGeometry = () => {
      const vw = window.innerWidth;
      const width = Math.min(vw * 0.8, 500);
      const left = (vw - width) / 2;
      setBarGeometry({ width, left });
    };

    calculateGeometry();
    window.addEventListener('resize', calculateGeometry);
    return () => window.removeEventListener('resize', calculateGeometry);
  }, []);

  const updateMoodFromPosition = useCallback((pageX: number) => {
    if (barGeometry.width <= 0) return;

    const relativeX = pageX - barGeometry.left;
    const clampedX = Math.max(0, Math.min(relativeX, barGeometry.width));
    const percentage = clampedX / barGeometry.width;
    const selectedHue = Math.round(percentage * 360);

    const closestMood = findClosestMood(selectedHue);
    setPreviewMood({
      ...closestMood,
      hue: selectedHue,
      saturation: 85,
      lightness: 60,
    });
    setPreviewAdjective(closestMood.adjective);
    thumbX.set(clampedX - THUMB_WIDTH / 2);
  }, [barGeometry, setPreviewMood, thumbX]);

  const handleInteractionStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsInteractingWithBar(true);
    updateMoodFromPosition(info.point.x);
  }, [updateMoodFromPosition]);

  const handleInteractionMove = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    updateMoodFromPosition(info.point.x);
  }, [updateMoodFromPosition]);

  const handleInteractionEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (barGeometry.width <= 0) return;

    const relativeX = info.point.x - barGeometry.left;
    const clampedX = Math.max(0, Math.min(relativeX, barGeometry.width));
    const percentage = clampedX / barGeometry.width;
    const selectedHue = Math.round(percentage * 360);
    
    const closestMood = findClosestMood(selectedHue);
    const newMood: Mood = {
        ...closestMood,
        hue: selectedHue,
        saturation: 85,
        lightness: 60,
    };
    
    setInteractionMode('orb');
    setChargeData({ mood: newMood });
    setIsCharging(true);
    setPreviewMood(null);
    setPreviewAdjective('');
    setIsInteractingWithBar(false);
  }, [barGeometry, setPreviewMood]);

  const handleOrbTap = () => {
    clearLongPressTimeout();
    if (isCharging || bloomPoint) return;

    setInteractionMode('bar');
    setPreviewMood(null);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
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
  
  const handleDismissBloom = useCallback(() => {
    setBloomPoint(null);
    setPreviewMood(null); // Clear preview when dismissed
  }, [setPreviewMood]);

  useEffect(() => {
    if (isCharging && chargeData) {
      const chargeTimeout = setTimeout(() => {
        // Use barRef for final position if available, fallback to center
        const position = barRef.current
          ? barRef.current.getBoundingClientRect()
          : { left: window.innerWidth / 2 - 40, top: window.innerHeight - 160, width: 80, height: 80 };

        const ripplePosition = {
          x: position.left + position.width / 2,
          y: position.top + position.height / 2,
        };
        recordContribution(chargeData.mood, ripplePosition);
        
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
      background: 'rgba(var(--panel-background-rgba), 0.1)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
    },
    bar: {
      width: '80vw', maxWidth: '500px', height: '48px', borderRadius: '24px',
      background: gradientBackground, boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(0px)', scale: 1, opacity: 1,
    },
    charging: {
        width: '80px', height: '80px', borderRadius: '9999px',
        background: 'rgba(var(--panel-background-rgba), 0.1)',
        backdropFilter: 'blur(12px)',
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
          ref={barRef}
          variants={orbVariants}
          initial={false}
          animate={animationState}
          transition={morphTransition}
          onTap={animationState === 'orb' ? handleOrbTap : undefined}
          onPanStart={animationState === 'bar' ? handleInteractionStart : undefined}
          onPan={animationState === 'bar' ? handleInteractionMove : undefined}
          onPanEnd={animationState === 'bar' ? handleInteractionEnd : undefined}
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimeout}
          onPointerLeave={clearLongPressTimeout}
          className={cn(
              "relative flex items-center justify-center",
              (isCharging || bloomPoint) && "pointer-events-none",
              animationState === 'orb' && "cursor-pointer",
              animationState === 'bar' && "cursor-grab"
          )}
        >
          {animationState === 'bar' && (
            <motion.div
              className="absolute h-10 w-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg pointer-events-none z-10"
              style={{ x: thumbX, top: '50%', y: '-50%' }}
            >
              <AnimatePresence>
                {isInteractingWithBar && previewAdjective && (
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-sm text-foreground whitespace-nowrap shadow-md"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {previewAdjective}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div variants={iconVariants} animate={animationState} className="flex items-center justify-center">
            <Plus className="w-10 h-10 text-white" strokeWidth={2} />
          </motion.div>
        </motion.div>
      </motion.div>

      {isClient && createPortal(
        <AnimatePresence>
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
