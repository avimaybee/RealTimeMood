
"use client";

import React, { useState, useEffect } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Share, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const AddToHomeScreenPrompt: React.FC = () => {
  const { contributionCount } = useMood();
  const { toast } = useToast();
  const [promptToInstall, setPromptToInstall] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const isUserOnIos = () => {
        if (typeof navigator === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    setIsIos(isUserOnIos());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptToInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('a2hs_dismissed') === 'true';
    const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

    if (!hasBeenDismissed && !isStandalone && contributionCount >= 3) {
      if (promptToInstall || isIos) {
        // Delay showing the prompt slightly to not be too jarring
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [contributionCount, promptToInstall, isIos]);

  const handleInstallClick = async () => {
    if (!promptToInstall) return;
    
    promptToInstall.prompt();
    const { outcome } = await promptToInstall.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "App Installed!",
        description: "RealTimeMood is now on your home screen.",
      });
    }
    
    // We hide the prompt and save the state regardless of the choice.
    setIsVisible(false);
    localStorage.setItem('a2hs_dismissed', 'true');
    setPromptToInstall(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('a2hs_dismissed', 'true');
  };
  
  const getIosInstructions = () => (
    <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Share className="h-5 w-5 flex-shrink-0 text-primary"/>
          <p>To install, tap the 'Share' icon in your browser toolbar.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="bg-white/90 p-1 rounded-md shadow-sm">
                 <Plus className="h-3 w-3 text-black"/>
                </div>
            </div>
          <p>Then, scroll down and select 'Add to Home Screen'.</p>
        </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 md:top-28 left-1/2 -translate-x-1/2 w-[90vw] max-w-md z-50 p-4 rounded-2xl shadow-soft frosted-glass"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        >
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 w-7 h-7 rounded-full" onClick={handleDismiss}>
            <X className="w-4 h-4"/>
            <span className="sr-only">Dismiss</span>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="text-sm font-medium text-foreground pr-6">
              <h3 className="font-bold mb-2 text-base">Get the Full Experience</h3>
              {isIos ? (
                getIosInstructions()
              ) : (
                <p>Install RealTimeMood for faster access and offline capabilities.</p>
              )}
            </div>
          </div>

          {!isIos && promptToInstall && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleInstallClick} className="interactive-glow">
                <ArrowDownToLine className="mr-2 h-4 w-4"/>
                Install App
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToHomeScreenPrompt;
