"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingOverlay: React.FC = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // We check this on the client-side only
    if (localStorage.getItem('hasVisitedRealTimeMood') !== 'true') {
      setIsFirstVisit(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasVisitedRealTimeMood', 'true');
    setIsFirstVisit(false);
  };

  if (!isFirstVisit) {
    return null;
  }

  return (
    <Dialog open={isFirstVisit} onOpenChange={handleDismiss}>
      <DialogContent
        className="sm:max-w-md overflow-hidden"
        data-prevent-snapshot
        onEscapeKeyDown={handleDismiss}
        // Prevent closing by clicking outside, so the user has to click the button
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsla(var(--primary-hsl), 0.3) 0%, transparent 50%, hsla(var(--primary-hsl), 0.2) 100%)',
          }}
          animate={{
            background: [
              'linear-gradient(135deg, hsla(var(--primary-hsl), 0.3) 0%, transparent 50%, hsla(var(--primary-hsl), 0.2) 100%)',
              'linear-gradient(225deg, hsla(var(--primary-hsl), 0.2) 0%, transparent 50%, hsla(var(--primary-hsl), 0.3) 100%)',
              'linear-gradient(135deg, hsla(var(--primary-hsl), 0.3) 0%, transparent 50%, hsla(var(--primary-hsl), 0.2) 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <DialogHeader className="relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DialogTitle className="flex items-center gap-2 text-xl font-display">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
              Welcome to RealTimeMood
            </DialogTitle>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <DialogDescription className="pt-3 text-base text-foreground/80 leading-relaxed">
              This is a living canvas painted by the feelings of people around the world.

              <motion.span
                className="block mt-3 flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Heart className="w-4 h-4 text-primary inline" />
                <span>Your contributions shape the collective mood in real-time.</span>
              </motion.span>
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <DialogFooter className="sm:justify-start relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full sm:w-auto"
          >
            <Button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ boxShadow: '0 0 20px hsla(var(--primary-hsl), 0.3)' }}
            >
              Explore the Collective
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingOverlay;
