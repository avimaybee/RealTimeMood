
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString, PREDEFINED_MOODS } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { usePlatform } from '@/contexts/PlatformContext';
import { getMoodSuggestion } from '@/ai/flows/mood-suggestion-flow';

const MoodSelectionButtons = dynamic(() => import('@/components/features/MoodSelectionButtons'), { ssr: false });

interface OrbButtonProps {
  isEmojiSelectorOpen: boolean;
  setIsEmojiSelectorOpen: (isOpen: boolean) => void;
  isCharging: boolean;
  setIsCharging: (isCharging: boolean) => void;
  interactionMode: 'orb' | 'bar';
  setInteractionMode: (mode: 'orb' | 'bar' | ((prev: 'orb' | 'bar') => 'orb' | 'bar')) => void;
}

const OrbButton: React.FC<OrbButtonProps> = ({ 
  isEmojiSelectorOpen, 
  setIsEmojiSelectorOpen,
  isCharging,
  setIsCharging,
  interactionMode,
  setInteractionMode,
}) => {
  const { recordContribution, isCollectiveShifting, setPreviewMood, previewMood } = useMood();
  const { toast } = useToast();
  const { isIos } = usePlatform();
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const lastSubmissionTimeRef = useRef<number>(0);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const justToggledRef = useRef(false);
  const panActionOccurred = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getOrbPosition = useCallback(() => {
    if (orbContainerRef.current) {
        const rect = orbContainerRef.current.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }
    // Fallback to a reasonable default if the ref isn't ready
    return { x: window.innerWidth / 2, y: window.innerHeight - 120 };
  }, []);

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (interactionMode === 'bar' || isEmojiSelectorOpen || isCharging) return;
    e.preventDefault();
    pressTimeoutRef.current = setTimeout(() => {
      // Long press detected
      setIsEmojiSelectorOpen(true);
      pressTimeoutRef.current = null;
    }, 300); // 300ms threshold for long press
  };

  const handlePointerUp = () => {
    if (pressTimeoutRef.current) {
      // It was a short press (tap)
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;

      if (!isEmojiSelectorOpen && interactionMode === 'orb') {
        setInteractionMode(() => 'bar');
        // Flag that we just handled this tap by opening the bar
        justToggledRef.current = true;
      }
    }
  };

  const handleMoodSelection = (mood: Mood) => {
    setIsEmojiSelectorOpen(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
    setChargeData({ mood });
    setIsCharging(true);
  };

  const submitUserMood = useCallback((mood: Mood, position: { x: number, y: number } | null) => {
    const now = Date.now();
    const SUBMISSION_COOLDOWN = 10000; // 10 seconds

    // Allow the first submission (when ref is 0), then enforce cooldown.
    if (lastSubmissionTimeRef.current !== 0 && (now - lastSubmissionTimeRef.current < SUBMISSION_COOLDOWN)) {
      const secondsRemaining = Math.ceil((SUBMISSION_COOLDOWN - (now - lastSubmissionTimeRef.current)) / 1000);
      toast({
        title: "A moment of reflection...",
        description: `Please wait ${secondsRemaining} more second${secondsRemaining > 1 ? 's' : ''} before sharing again.`,
        variant: "destructive",
        duration: 3000,
      });
      return; // Abort submission
    }

    // Proceed with submission
    recordContribution(mood, position);
    lastSubmissionTimeRef.current = now;

    const { id: toastId, update: updateToast } = toast({
      title: "Mood Submitted",
      description: `Your feeling of "${mood.adjective}" has been added to the collective.`,
      duration: 4000,
    });

    getMoodSuggestion({ moodAdjective: mood.adjective })
      .then(suggestion => {
        updateToast({ id: toastId, title: suggestion.title, description: suggestion.suggestion, duration: 10000 });
      })
      .catch(err => {
        if (err.message !== 'Suggestion not needed for positive mood.') {
          console.warn("Could not get mood suggestion:", err);
        }
      });

    if (interactionMode === 'bar') {
        setInteractionMode(() => 'orb');
        setPreviewMood(null);
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
    }
  }, [recordContribution, toast, interactionMode, setInteractionMode, setPreviewMood]);
  
  const handleDismissEmojiSelector = useCallback(() => {
    setIsEmojiSelectorOpen(false);
    setPreviewMood(null);
  }, [setPreviewMood, setIsEmojiSelectorOpen]);
  
  const getMoodFromPosition = (x: number): Mood => {
    if (!barRef.current) return PREDEFINED_MOODS[0];
    const { left, width } = barRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (x - left) / width));
    const hue = progress * 360;
    const mood = findClosestMood(hue);
    return { ...mood, hue };
  };

  const handleTap = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (panActionOccurred.current) return;
    
    // If the bar was just opened, this tap event is the one that triggered it.
    // Reset the flag and ignore the event to prevent an instant submission.
    if (justToggledRef.current) {
      justToggledRef.current = false;
      return;
    }

    // If the tap happens on the gradient bar, submit the mood.
    if (interactionMode === 'bar') {
      const mood = getMoodFromPosition(info.point.x);
      submitUserMood(mood, getOrbPosition());
    }
  };

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const mood = getMoodFromPosition(info.point.x);
    setPreviewMood(mood);
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    panActionOccurred.current = true;
    setTimeout(() => { panActionOccurred.current = false; }, 50);

    const mood = getMoodFromPosition(info.point.x);
    submitUserMood(mood, getOrbPosition());
    setPreviewMood(null); // Clear preview after submission
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEmojiSelectorOpen) handleDismissEmojiSelector();
        if (interactionMode === 'bar') {
          setInteractionMode(() => 'orb');
          setPreviewMood(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEmojiSelectorOpen, handleDismissEmojiSelector, interactionMode, setInteractionMode, setPreviewMood]);

  useEffect(() => {
    if (!isCharging || !chargeData) return;

    const chargeTimeout = setTimeout(() => {
      try {
        submitUserMood(chargeData.mood, getOrbPosition());
      } catch (error) {
        console.error('Error during charging sequence:', error);
        toast({ title: "Feeling Lost", description: "Your mood couldn't be submitted to the collective. Please try again.", variant: "destructive" });
      } finally {
        setIsCharging(false);
        setChargeData(null);
      }
    }, 500);
    return () => clearTimeout(chargeTimeout);
  }, [isCharging, chargeData, submitUserMood, getOrbPosition, toast, setIsCharging]);

  const morphTransition = { type: 'spring', stiffness: 350, damping: 35 };

  const orbVariants = {
    orb: {
      width: '80px', height: '80px', borderRadius: '9999px',
      background: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
      transition: { ...morphTransition }
    },
    bar: {
      width: 'min(90vw, 420px)', height: '64px', borderRadius: '32px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)', scale: 1, opacity: 1,
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
    hidden: { scale: 0, opacity: 0, transition: { ...morphTransition, duration: 0.2 } }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, rotate: 0, transition: { delay: 0.1, ...morphTransition } },
    bar: { scale: 0, opacity: 0, rotate: 45, transition: { ...morphTransition, duration: 0.2 } },
    charging: { scale: 0, opacity: 0, transition: morphTransition },
    hidden: { scale: 0, opacity: 0, transition: morphTransition }
  };

  const getAnimationState = () => {
    if (isEmojiSelectorOpen) return 'hidden';
    if (isCharging) return 'charging';
    return interactionMode;
  };

  const animationState = getAnimationState();

  return (
    <>
      <motion.div
        ref={orbContainerRef}
        data-orb-button-container
        className={cn(
          "fixed inset-x-0 bottom-20 md:bottom-24 z-40",
          "flex flex-col items-center justify-center gap-2"
        )}
        animate={{ y: isCollectiveShifting ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        <AnimatePresence>
          {interactionMode === 'bar' && (
            <motion.div
              className="text-white/80 text-sm font-medium pointer-events-none h-5" // Fixed height to prevent layout shifts
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, y: 5, transition: { duration: 0.1 } }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={previewMood ? previewMood.adjective : 'default'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {previewMood ? previewMood.adjective : 'Tap or slide to share your mood'}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
            <AnimatePresence>
              {isClient && animationState === 'orb' && (
                <motion.div
                  key="aurora-effect"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5, transition: { delay: 0.3, duration: 0.5 } }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="h-28 w-28 animate-aurora-spin bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                    style={{ filter: 'blur(40px)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          <motion.div
            ref={barRef}
            variants={orbVariants}
            initial="orb" 
            animate={animationState}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onTap={handleTap}
            onPan={interactionMode === 'bar' ? handlePan : undefined}
            onPanEnd={interactionMode === 'bar' ? handlePanEnd : undefined}
            className={cn(
              "relative flex items-center justify-center shadow-soft cursor-pointer",
              (isCharging || isEmojiSelectorOpen) && "pointer-events-none",
            )}
          >
            <motion.div variants={iconVariants} animate={animationState}>
              <Plus className="w-10 h-10 text-white" strokeWidth={isIos ? 1.5 : 2} />
            </motion.div>
            
            <AnimatePresence>
              {interactionMode === 'bar' && (
                <motion.div 
                  className="absolute inset-0 p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  <div className="w-full h-full rounded-full" style={{
                    background: 'linear-gradient(to right, hsl(0, 80%, 60%), hsl(60, 80%, 60%), hsl(120, 80%, 60%), hsl(180, 80%, 60%), hsl(240, 80%, 60%), hsl(300, 80%, 60%), hsl(360, 80%, 60%))'
                  }} />
                  
                  {previewMood && (
                    <div className="absolute top-0 left-0 h-full flex items-center" style={{ 
                      transform: `translateX(${((previewMood.hue / 360) * barRef.current!.offsetWidth) - 16}px) translateX(-50%)`,
                      left: '16px'
                    }}>
                        <div className="w-8 h-8 rounded-full bg-white/80 shadow-lg ring-4 ring-white/30" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      {isClient && createPortal(
        <AnimatePresence>
          {isEmojiSelectorOpen && (
            <motion.div key="emoji-selector-container">
              <motion.div
                className="fixed inset-0 z-30"
                onPointerDown={handleDismissEmojiSelector}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.4 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              />
              <MoodSelectionButtons
                key="mood-buttons"
                onSelect={handleMoodSelection}
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
