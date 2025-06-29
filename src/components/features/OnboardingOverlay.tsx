
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5,
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
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 15, stiffness: 200, delay: 0.7 } },
};

const OnboardingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      hasVisited = localStorage.getItem('hasVisitedRealTimeMood') || 'false';
    } catch (error) {
      console.warn('Could not access localStorage for onboarding state.', error);
      hasVisited = 'true';
    }

    if (hasVisited === 'false') {
      setIsFirstVisit(true);
      setIsVisible(true);

      // Auto-dismiss after 10 seconds
      autoDismissTimerRef.current = setTimeout(handleDismiss.current, 10000);
      
      // Dismiss on menu button click
      const menuButton = document.querySelector('[data-menu-button="true"]');
      const dismissHandler = () => handleDismiss.current();
      
      if (menuButton) {
        menuButton.addEventListener('click', dismissHandler, { once: true });
      }

      // Cleanup
      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
        }
        if (menuButton) {
          menuButton.removeEventListener('click', dismissHandler);
        }
      };
    } else {
      setIsFirstVisit(false);
    }
  }, []);

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
          className="fixed inset-x-0 bottom-24 z-30 max-w-lg mx-auto flex flex-col items-end justify-center gap-2 pointer-events-none pr-4"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-white/90 text-sm md:text-base bg-black/20 px-3 py-1.5 rounded-full shadow-soft">
            <p>Tap here to explore mood features!</p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ArrowDown className="w-6 h-6 text-white/90" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingOverlay;
