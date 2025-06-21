"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo, AnimatePresence, useMotionValue, useMotionValueEvent } from 'framer-motion';
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

  // Motion value and state for thumb handling
  const thumbX = useMotionValue(0);
  const [previewAdjective, setPreviewAdjective] = useState('');
  const [isInteractingWithBar, setIsInteractingWithBar] = useState(false);
  const THUMB_WIDTH = 40; // w-10

  // New states to track bar dimensions
  const [barRect, setBarRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    setIsClient(true);
    
    const updateBarRect = () => {
      if (barRef.current) {
        setBarRect(barRef.current.getBoundingClientRect());
      }
    };
    
    updateBarRect();
    window.addEventListener('resize', updateBarRect);
    
    return () => window.removeEventListener('resize', updateBarRect);
  }, []);

  // Update bar rect whenever interaction mode changes to bar
  useEffect(() => {
    if (interactionMode === 'bar' && barRef.current) {
      const newBarRect = barRef.current.getBoundingClientRect();
      setBarRect(newBarRect);
    }
  }, [interactionMode]);

  // Handle mouse/touch interactions for the bar
  const handleInteractionStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsInteractingWithBar(true);
    updateMoodFromPosition(info.point.x);
  };

  const handleInteractionMove = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    updateMoodFromPosition(info.point.x);
  };

  const handleInteractionEnd = () => {
    if (!barRect) return;
    
    // Calculate final mood based on thumb position
    const x = thumbX.get() + THUMB_WIDTH / 2; // Get center of thumb
    const percentage = Math.min(1, Math.max(0, x / barRect.width));
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
  };

  const updateMoodFromPosition = (clientX: number) => {
    if (!barRect) return;
    
    // Calculate relative position within the bar
    let relativeX = clientX - barRect.left;
    relativeX = Math.max(0, Math.min(relativeX, barRect.width));
    
    // Set thumb position (centered on cursor)
    const thumbPosition = relativeX - THUMB_WIDTH / 2;
    thumbX.set(Math.max(0, Math.min(thumbPosition, barRect.width - THUMB_WIDTH)));
    
    // Calculate mood based on position
    const percentage = relativeX / barRect.width;
    const selectedHue = Math.round(percentage * 360);

    const closestMood = findClosestMood(selectedHue);
    setPreviewMood({
      ...closestMood,
      hue: selectedHue,
      saturation: 85,
      lightness: 60,
    });
    setPreviewAdjective(closestMood.adjective);
  };

  const handleOrbTap = () => {
    clearLongPressTimeout();
    if (isCharging || bloomPoint) return;
    
    setInteractionMode('bar');
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
      longPressTimeoutRef.current = null;
    }
  };

  const handleMoodSelectionFromBloom = (mood: Mood) => {
    setBloomPoint(null);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100); 
    }
    setChargeData({ mood: mood });
    setIsCharging(true);
  };
  
  const handleDismissBloom = useCallback(() => {
    setBloomPoint(null);
    setPreviewMood(null);
  }, [setPreviewMood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && interactionMode === 'bar') {
        setInteractionMode('orb');
        setPreviewMood(null);
        setPreviewAdjective('');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [interactionMode, setPreviewMood]);

  useEffect(() => {
    if (isCharging && chargeData) {
      const chargeTimeout = setTimeout(() => {
        try {
          if (barRef.current) {
            const orbRect = barRef.current.getBoundingClientRect();
            const ripplePosition = {
              x: orbRect.left + orbRect.width / 2,
              y: orbRect.top + orbRect.height / 2,
            };
            recordContribution(chargeData.mood, ripplePosition);
          }
          setIsCharging(false);
          setChargeData(null);

          // Always return to orb mode after charging
          setInteractionMode('orb');
        } catch (error) {
          console.error('Error during charging sequence:', error);
          setIsCharging(false);
          setChargeData(null);
        }
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
      background: 'rgba(255, 255, 255, 0.1)', 
      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
      transition: { ...morphTransition }
    },
    bar: {
      width: '80vw', maxWidth: '500px', height: '48px', borderRadius: '24px',
      background: gradientBackground, boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(0px)', scale: 1, opacity: 1,
      transition: { ...morphTransition }
    },
    charging: {
        width: '80px', height: '80px', borderRadius: '9999px',
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(12px)',
        boxShadow: chargeData ? `0 0 25px 8px ${moodToHslString(chargeData.mood)}, inset 0 0 10px 2px rgba(255,255,255,0.5)` : '0 12px 32px rgba(0,0,0,0.3)',
        scale: 1, opacity: 1,
        transition: { ...morphTransition }
    },
    hidden: { 
      scale: 0, opacity: 0,
      transition: { ...morphTransition }
    }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, transition: { delay: 0.1, ...morphTransition } },
    bar: { scale: 0, opacity: 0, transition: morphTransition },
    charging: { scale: 0, opacity: 0, transition: morphTransition },
    hidden: { scale: 0, opacity: 0, transition: morphTransition },
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
          onAnimationComplete={() => {
            // Set thumb to center when bar appears
            if (interactionMode === 'bar' && barRef.current) {
              const barRect = barRef.current.getBoundingClientRect();
              thumbX.set(barRect.width / 2 - THUMB_WIDTH / 2);
              const centerHue = 180; // Start at cyan in the middle
              const closestMood = findClosestMood(centerHue);
              setPreviewMood({
                ...closestMood,
                hue: centerHue,
                saturation: 85,
                lightness: 60,
              });
              setPreviewAdjective(closestMood.adjective);
            }
          }}
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
              className="absolute h-10 w-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg z-10 focus:outline-none"
              style={{ 
                x: thumbX, 
                top: '50%', 
                y: '-50%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              <AnimatePresence>
                {previewAdjective && (
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

          {/* Plus icon */}
          <motion.div 
            variants={iconVariants} 
            animate={animationState} 
            className="flex items-center justify-center"
          >
            <Plus 
              className={cn(
                "w-10 h-10 stroke-2",
                animationState === 'orb' ? "text-white" : "text-transparent"
              )} 
            />
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
                className="fixed inset-0 z-30 bg-black/10"
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
