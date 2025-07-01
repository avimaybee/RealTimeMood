
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { urlBase64ToUint8Array } from '@/lib/utils';

interface NotificationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClose = () => onOpenChange(false);

  const handleEnableNotifications = async () => {
    // IMPORTANT: These keys are for demonstration only.
    // You should generate your own VAPID keys and store them securely in environment variables.
    const VAPID_PUBLIC_KEY = "BCjoLGA09RL6f3s69FjIe00JkPqu3oYgExoGau5UnSQ5gN6x46BqAYBHCiHQinCsxteL9ZdSp24zOaNvf2n_Fqo";

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast({
            title: "Not Supported",
            description: "Push notifications are not supported by your browser.",
            variant: "destructive",
        });
        return;
    }
    
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
          toast({
              title: "Permission Not Granted",
              description: "You won't receive mood check-in reminders. You can enable them later in your browser settings.",
          });
          handleClose();
          return;
      }
        
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
        
      if (!subscription) {
          subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
           // In a real app, you would send this subscription object to your backend here.
           // For example: await fetch('/api/save-subscription', { method: 'POST', body: JSON.stringify(subscription) });
          console.log("Push Subscription Object: ", JSON.stringify(subscription));
      }
      
      toast({
          title: "Reminders Enabled!",
          description: "Great! We'll send you a reminder to check in each day.",
      });

    } catch (error) {
        console.error("Failed to subscribe to push notifications:", error);
        toast({
            title: "Subscription Failed",
            description: "Could not enable notifications. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
        handleClose();
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        data-prevent-snapshot
        onEscapeKeyDown={handleClose}
        onInteractOutside={(e) => {
            e.preventDefault();
            handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Bell className="h-5 w-5 text-primary"/>
             Get Daily Reminders?
          </DialogTitle>
           <DialogDescription className="text-sm text-foreground/80 space-y-2 pt-2">
            Would you like a daily notification to remind you to check in and contribute your mood? You can change this in your browser settings at any time.
           </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            Maybe Later
          </Button>
          <Button onClick={handleEnableNotifications} className="interactive-glow" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Enable Notifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPrompt;
