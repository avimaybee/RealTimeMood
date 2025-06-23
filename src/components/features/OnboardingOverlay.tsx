"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, Hand } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5,
      staggerChildren: 0.4,
      delayChildren: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 200 } },
};

const OnboardingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { isIos } = usePlatform();

  const handleDismiss = useRef(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    setIsVisible(false);
    try {
      localStorage.setItem('hasVisitedRealTimeMood', 'true');
    } catch (error) {
      console.warn('Could not access localStorage for onboarding state.', error);
    }
  });

  useEffect(() => {
    let hasVisited = 'true';
    try {
      // Check if localStorage exists and if the key is set. Default to 'false' if not set.
      hasVisited = localStorage.getItem('hasVisitedRealTimeMood') || 'false';
    } catch (error) {
      console.warn('Could not access localStorage for onboarding state.', error);
      // Assume they've visited if localStorage is inaccessible to avoid bothering users without it.
      hasVisited = 'true';
    }

    if (hasVisited === 'false') {
      setIsFirstVisit(true);
      setIsVisible(true);

      // Auto-dismiss after 10 seconds
      autoDismissTimerRef.current = setTimeout(handleDismiss.current, 10000);
      
      // Dismiss on any orb interaction
      const orbContainer = document.querySelector('[data-orb-button-container]');
      const dismissHandler = () => handleDismiss.current();
      
      if (orbContainer) {
        orbContainer.addEventListener('pointerdown', dismissHandler, { once: true });
      }

      // Cleanup
      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
        if (orbContainer) {
          orbContainer.removeEventListener('pointerdown', dismissHandler);
        }
      };
    } else {
      setIsFirstVisit(false);
    }
  }, []); // Run only once on mount

  if (!isFirstVisit) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-x-0 bottom-[12rem] md:bottom-[14rem] z-30 flex flex-col items-center justify-center gap-4 pointer-events-none"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-white/90 text-shadow-pop text-sm md:text-base bg-black/20 px-3 py-1.5 rounded-full shadow-soft">
            <MousePointerClick className="w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />
            <p>Tap the Orb to select a color mood.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-white/90 text-shadow-pop text-sm md:text-base bg-black/20 px-3 py-1.5 rounded-full shadow-soft">
            <Hand className="w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />
            <p>Hold the Orb for more mood words.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
