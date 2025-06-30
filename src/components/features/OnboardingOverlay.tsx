
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, X } from 'lucide-react';

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

  const handleDismiss = useRef(() => {
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
      hasVisited = 'true'; // Default to not showing if localStorage fails
    }

    if (hasVisited === 'false') {
      setIsFirstVisit(true);
      setIsVisible(true);

      const menuButton = document.querySelector('[data-menu-button="true"]');
      const dismissHandler = () => handleDismiss.current();
      
      if (menuButton) {
        menuButton.addEventListener('click', dismissHandler, { once: true });
      }

      return () => {
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
          className="fixed inset-x-0 bottom-24 z-50 max-w-lg mx-auto flex flex-col items-end justify-center gap-2 pointer-events-none pr-4"
        >
          <motion.div 
            variants={itemVariants} 
            className="flex items-center gap-2 text-white/90 text-sm md:text-base bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft pointer-events-auto"
          >
            <p>Tap here to explore mood features!</p>
            <button onClick={handleDismiss.current} className="ml-1 -mr-1 p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
              <span className="sr-only">Dismiss</span>
            </button>
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
