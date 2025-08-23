
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, MoreVertical, SquarePlus } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { cn } from '@/lib/utils';

interface AddToHomeScreenPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddToHomeScreenPrompt: React.FC<AddToHomeScreenPromptProps> = ({ open, onOpenChange }) => {
  const { isIos, isAndroid } = usePlatform();

  const handleClose = () => onOpenChange(false);

  // This prompt is only for mobile browsers
  if (!isIos && !isAndroid) {
    return null;
  }

  const IosInstructions = () => (
    <DialogDescription className="text-sm text-foreground/80 space-y-2 pt-2">
      <p>
        To get the best experience, add RealTimeMood to your Home Screen for easy access.
      </p>
      <ol className="list-decimal list-inside space-y-1.5 pl-1">
        <li>Tap the <span className="font-semibold text-primary">Share</span> icon <Share className="inline-block align-text-bottom h-4 w-4" /> in Safari's toolbar.</li>
        <li>Scroll down and tap <span className="font-semibold text-primary">"Add to Home Screen"</span>.</li>
      </ol>
    </DialogDescription>
  );

  const AndroidInstructions = () => (
    <DialogDescription className="text-sm text-foreground/80 space-y-2 pt-2">
      <p>
        For an app-like experience, install RealTimeMood on your device for easy access.
      </p>
      <ol className="list-decimal list-inside space-y-1.5 pl-1">
        <li>Tap the <span className="font-semibold text-primary">menu</span> icon <MoreVertical className="inline-block align-text-bottom h-4 w-4" /> in Chrome.</li>
        <li>Tap <span className="font-semibold text-primary">"Install app"</span> or <span className="font-semibold text-primary">"Add to Home Screen"</span>.</li>
      </ol>
    </DialogDescription>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        data-prevent-snapshot
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <SquarePlus className="h-5 w-5 text-primary"/>
             Add to Home Screen?
          </DialogTitle>
           {isIos ? <IosInstructions /> : <AndroidInstructions />}
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full interactive-glow">Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToHomeScreenPrompt;
