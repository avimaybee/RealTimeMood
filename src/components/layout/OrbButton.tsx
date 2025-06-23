
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
import { usePlatform } from '@/contexts/PlatformContext';

const OrbButton: React.FC = () => {
  const { recordContribution, isCollectiveShifting, setPreviewMood, previewMood } = useMood();
  const { toast } = useToast();
  const { isIos } = usePlatform();
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [bloomPoint, setBloomPoint] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmissionTimeRef = useRef<number>(0);
  const [isPanning, setIsPanning] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add/remove class to body for UI dimming when bar is active
  useEffect(() => {
    const className = 'bar-mode-active-page';
    if (interactionMode === 'bar' && !isCharging) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [interactionMode, isCharging]);

  // Suppress browser default behaviors (scrolling, text selection) when bloom is active
  useEffect(() => {
    const className = 'no-scroll-select';
    if (bloomPoint) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [bloomPoint]);


  const handleOrbTap = () => {
    clearLongPressTimeout();
    if (isCharging || bloomPoint) return;
    
    setInteractionMode('bar');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const calculateMoodFromPoint = (point: { x: number; y: number }): Mood | null => {
    if (!barRef.current) return null;
    const rect = barRef.current.getBoundingClientRect();
    let relativeX = point.x - rect.left;
    relativeX = Math.max(0, Math.min(relativeX, rect.width));
    const percentage = relativeX / rect.width;
    const selectedHue = Math.round(percentage * 360);
    const closestMood = findClosestMood(selectedHue);
    return {
      ...closestMood,
      hue: selectedHue,
      saturation: 85,
      lightness: 60,
    };
  };

  const handleBarTap = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isCharging) return;
    const mood = calculateMoodFromPoint(info.point);
    if (mood) {
      setIsCharging(true);
      setChargeData({ mood });
      setPreviewMood(null);
    }
  };

  const handlePanStart = () => {
    if (isCharging) return;
    setIsPanning(true);
  };
  
  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isCharging) return;
    const newMood = calculateMoodFromPoint(info.point);
    if (newMood) {
      setPreviewMood(newMood);
    }
  };
  
  const handlePanEnd = () => {
    setIsPanning(false);
    if (isCharging || !previewMood) return;
  
    // The final mood is the one we were just previewing
    setChargeData({ mood: previewMood });
    setIsCharging(true);
    setPreviewMood(null); // Clear preview after submission starts
  };
  
  
  const handleDismissBar = useCallback(() => {
    if (isCharging) return;
    setInteractionMode('orb');
    setPreviewMood(null);
    setChargeData(null); // Explicitly clear chargeData on dismiss
  }, [isCharging, setPreviewMood]);


  const handleLongPress = () => {
    if (interactionMode === 'bar' || isCharging || !barRef.current) return;
    
    const rect = barRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    setBloomPoint({ x, y });
  };
  
  const handlePointerDown = (event: ReactPointerEvent) => {
    if (interactionMode !== 'orb' || isCharging || bloomPoint) return;
    
    longPressTimeoutRef.current = setTimeout(() => {
      handleLongPress();
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
      const now = Date.now();
      const SUBMISSION_COOLDOWN = 5000; // 5 seconds

      if (now - lastSubmissionTimeRef.current < SUBMISSION_COOLDOWN) {
        toast({
          title: "A moment of reflection...",
          description: `Please wait a few seconds before sharing again.`,
          variant: "destructive",
          duration: 4000,
        });
        setIsCharging(false);
        setChargeData(null);
        setInteractionMode('orb');
        return;
      }
      
      const chargeTimeout = setTimeout(() => {
        try {
          let ripplePosition: { x: number; y: number } | null = null;
          
          if (barRef.current) {
            const rect = barRef.current.getBoundingClientRect();
            ripplePosition = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
          }
          
          recordContribution(chargeData.mood, ripplePosition);
          lastSubmissionTimeRef.current = Date.now();
          toast({
            title: "Mood Submitted",
            description: `Your feeling of "${chargeData.mood.adjective}" has been added to the collective.`,
            duration: 4000,
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
  }, [isCharging, chargeData, recordContribution, toast]);
  
  const isBar = interactionMode === 'bar';
  const orbContainerBaseClasses = "fixed bottom-20 md:bottom-24 z-40 flex items-center justify-center";
  const morphTransition = { type: 'tween', duration: 0.5, ease: [0.76, 0, 0.24, 1] };
  const gradientBackground = 'linear-gradient(to right, hsl(0, 100%, 60%), hsl(60, 100%, 60%), hsl(120, 100%, 60%), hsl(180, 100%, 60%), hsl(240, 100%, 60%), hsl(300, 100%, 60%), hsl(0, 100%, 60%))';
  
  const orbVariants = {
    orb: {
      width: '80px', height: '80px', borderRadius: '9999px',
      background: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
      transition: { ...morphTransition }
    },
    bar: {
      width: '80vw', maxWidth: '500px', height: '48px', borderRadius: '24px',
      background: gradientBackground,
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
        <div className="relative flex items-center justify-center">
          <motion.div
            ref={barRef}
            variants={orbVariants}
            initial={false}
            animate={animationState}
            onTap={animationState === 'bar' ? handleBarTap : handleOrbTap}
            onPanStart={animationState === 'bar' ? handlePanStart : undefined}
            onPan={animationState === 'bar' ? handlePan : undefined}
            onPanEnd={animationState === 'bar' ? handlePanEnd : undefined}
            onPointerDown={handlePointerDown}
            onPointerUp={clearLongPressTimeout}
            onPointerLeave={() => {
              clearLongPressTimeout();
              if (isPanning) {
                setPreviewMood(null);
                setIsPanning(false);
              }
            }}
            className={cn(
              "relative flex items-center justify-center shadow-soft",
              (isCharging || bloomPoint) && "pointer-events-none",
              animationState === 'orb' && "cursor-pointer",
              animationState === 'bar' && "cursor-pointer touch-none" // Add touch-none to prevent scrolling on mobile
            )}
          >
            <motion.div 
              variants={iconVariants} 
              animate={animationState} 
              className="flex items-center justify-center"
            >
              <Plus 
                className={cn(
                  "w-10 h-10",
                  animationState === 'orb' ? "text-white" : "text-transparent"
                )}
                strokeWidth={isIos ? 1.5 : 2}
              />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isBar && !isCharging && !isPanning && (
              <motion.p
                className="absolute -top-8 w-full text-center text-xs sm:text-sm text-white/90 text-shadow-pop pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4 } }}
                exit={{ opacity: 0, y: 5, transition: { duration: 0.2 } }}
              >
                Tap or drag along the gradient to submit your mood
              </motion.p>
            )}
          </AnimatePresence>
        </div>
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
