"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { findClosestMood, moodToHslString } from '@/lib/colorUtils';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils';
import { motion, type PanInfo, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { usePlatform } from '@/contexts/PlatformContext';

const MoodSelectionButtons = dynamic(() => import('@/components/features/MoodSelectionButtons'), { ssr: false });

interface OrbButtonProps {
  isEmojiSelectorOpen: boolean;
  setIsEmojiSelectorOpen: (isOpen: boolean) => void;
}

const OrbButton: React.FC<OrbButtonProps> = ({ 
  isEmojiSelectorOpen, 
  setIsEmojiSelectorOpen,
}) => {
  const { recordContribution, isCollectiveShifting, setPreviewMood, previewMood } = useMood();
  const { toast } = useToast();
  const { isIos } = usePlatform();
  const [isCharging, setIsCharging] = useState(false);
  const [chargeData, setChargeData] = useState<{ mood: Mood } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const lastSubmissionTimeRef = useRef<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOrbTap = () => {
    if (isCharging || isEmojiSelectorOpen) return;
    setIsEmojiSelectorOpen(true);
  };

  const handleMoodSelection = (mood: Mood) => {
    setIsEmojiSelectorOpen(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
    setChargeData({ mood });
    setIsCharging(true);
  };

  const handleDismissEmojiSelector = useCallback(() => {
    setIsEmojiSelectorOpen(false);
    setPreviewMood(null);
  }, [setPreviewMood, setIsEmojiSelectorOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEmojiSelectorOpen) {
          handleDismissEmojiSelector();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEmojiSelectorOpen, handleDismissEmojiSelector]);

  useEffect(() => {
    if (!isCharging || !chargeData) return;
    const now = Date.now();
    const SUBMISSION_COOLDOWN = 5000;
    if (now - lastSubmissionTimeRef.current < SUBMISSION_COOLDOWN) {
      toast({
        title: "A moment of reflection...",
        description: "Please wait a few seconds before sharing again.",
        variant: "destructive",
        duration: 4000,
      });
      setIsCharging(false);
      setChargeData(null);
      return;
    }
    const chargeTimeout = setTimeout(() => {
      try {
        recordContribution(chargeData.mood, null);
        lastSubmissionTimeRef.current = Date.now();
        toast({
          title: "Mood Submitted",
          description: `Your feeling of "${chargeData.mood.adjective}" has been added to the collective.`,
          duration: 4000,
        });
      } catch (error) {
        console.error('Error during charging sequence:', error);
        toast({ title: "Feeling Lost", description: "Your mood couldn't be submitted to the collective. Please try again.", variant: "destructive" });
      } finally {
        setIsCharging(false);
        setChargeData(null);
      }
    }, 500);
    return () => clearTimeout(chargeTimeout);
  }, [isCharging, chargeData, recordContribution, toast, setIsCharging]);

  const morphTransition = { type: 'tween', duration: 0.5, ease: [0.76, 0, 0.24, 1] };

  const orbVariants = {
    orb: {
      width: '80px', height: '80px', borderRadius: '9999px',
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
    hidden: { scale: 0, opacity: 0, transition: { ...morphTransition } }
  };

  const iconVariants = {
    orb: { scale: 1, opacity: 1, rotate: 0, transition: { delay: 0.1, ...morphTransition } },
    charging: { scale: 0, opacity: 0, transition: morphTransition },
    hidden: { scale: 0, opacity: 0, transition: morphTransition }
  };

  const getAnimationState = () => {
    if (isEmojiSelectorOpen) return 'hidden';
    if (isCharging) return 'charging';
    return 'orb';
  };

  const animationState = getAnimationState();

  return (
    <>
      <motion.div
        data-orb-button-container
        className={cn("fixed bottom-20 md:bottom-24 z-40 flex items-center justify-center left-1/2 -translate-x-1/2")}
        animate={{ y: isCollectiveShifting ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
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
            variants={orbVariants}
            initial="orb" 
            animate={animationState}
            onTap={handleOrbTap}
            className={cn(
              "relative flex items-center justify-center shadow-soft cursor-pointer",
              (isCharging || isEmojiSelectorOpen) && "pointer-events-none",
            )}
          >
            <motion.div
              variants={iconVariants}
              animate={animationState}
              className="relative flex items-center justify-center"
            >
              <Plus
                className="w-10 h-10 text-white"
                strokeWidth={isIos ? 1.5 : 2}
              />
            </motion.div>
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
