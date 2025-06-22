
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';

const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting, setPreviewMood } = useMood();
  const { toast } = useToast();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [bloomPoint, setBloomPoint] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add/remove class to body for UI dimming when bar is active
  useEffect(() => {
    const className = 'bar-mode-active-page';
    if (interactionMode === 'bar') {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [interactionMode]);


  const handleOrbTap = () => {
    clearLongPressTimeout();
    if (isCharging || bloomPoint) return;
    
    setInteractionMode('bar');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleBarTap = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!barRef.current || isCharging) return;
    const rect = barRef.current.getBoundingClientRect();

    let relativeX = info.point.x - rect.left;
    relativeX = Math.max(0, Math.min(relativeX, rect.width));

    const percentage = relativeX / rect.width;
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
    setPreviewMood(null);
  };
  
  const handleDismissBar = useCallback(() => {
    if (isCharging) return;
    setInteractionMode('orb');
    setPreviewMood(null);
  }, [isCharging, setPreviewMood]);


  const handleLongPress = (point: {clientX: number, clientY: number}) => {
    if (interactionMode === 'bar' || isCharging) return;
    setBloomPoint({ x: point.clientX, y: point.clientY });
  };
  
  const handlePointerDown = (event: ReactPointerEvent) => {
    if (interactionMode !== 'orb' || isCharging || bloomPoint) return;
    
    const { clientX, clientY } = event;
    longPressTimeoutRef.current = setTimeout(() => {
      handleLongPress({ clientX, clientY });
    }, 250);
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
        handleDismissBar();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [interactionMode, handleDismissBar]);

  useEffect(() => {
    if (isCharging && chargeData) {
      const chargeTimeout = setTimeout(() => {
        try {
          let ripplePosition: { x: number; y: number } | null = null;
          if (barRef.current && interactionMode === 'bar') {
            const rect = barRef.current.getBoundingClientRect();
            ripplePosition = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          } else if (bloomPoint) {
            ripplePosition = bloomPoint;
          }
          
          recordContribution(chargeData.mood, ripplePosition);
          toast({
            title: "Mood Submitted",
            description: `Your feeling of "${chargeData.mood.adjective}" has been added to the collective.`,
          });
        } catch (error) {
          console.error('Error during charging sequence:', error);
          toast({
            title: "Error",
            description: "Could not submit mood.",
            variant: "destructive",
          });
        } finally {
          setIsCharging(false);
          setChargeData(null);
          setInteractionMode('orb');
        }
      }, 500);

      return () => clearTimeout(chargeTimeout);
    }
  }, [isCharging, chargeData, recordContribution, toast, bloomPoint, interactionMode]);
  
  const isBar = interactionMode === 'bar';
  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 z-40 flex items-center justify-center";
  const morphTransition = { type: 'tween', duration: 0.5, ease: [0.76, 0, 0.24, 1] };
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
        data-orb-button-container
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
          onTap={animationState === 'orb' ? handleOrbTap : handleBarTap}
          onPointerDown={handlePointerDown}
          onPointerUp={clearLongPressTimeout}
          onPointerLeave={clearLongPressTimeout}
          className={cn(
            "relative flex items-center justify-center",
            (isCharging || bloomPoint) && "pointer-events-none",
            animationState === 'orb' && "cursor-pointer",
            animationState === 'bar' && "cursor-pointer"
          )}
        >
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
          {interactionMode === 'bar' && !isCharging && (
            <motion.div
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
              onClick={handleDismissBar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
          {bloomPoint && (
            <motion.div key="bloom-container">
              <div data-radial-bloom-active-page-marker />

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
