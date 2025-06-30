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
import { Sparkles } from 'lucide-react';

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
            className="sm:max-w-md" 
            data-prevent-snapshot
            onEscapeKeyDown={handleDismiss}
            // Prevent closing by clicking outside, so the user has to click the button
            onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary" />
                Welcome to RealTimeMood
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-foreground/80">
              This is a living canvas painted by the feelings of people around the world. Your contributions shape the collective mood in real-time.
              <br /><br />
              Tap the menu to see our collective history, read anonymous thoughts, or just be with the color of now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={handleDismiss} className="interactive-glow w-full sm:w-auto">
              Explore
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default OnboardingOverlay;
