
"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

const ShareSnapshotButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const takeSnapshot = async () => {
    setIsLoading(true);
    toast({
      title: "Generating Snapshot...",
      description: "Please wait a moment.",
    });

    const elementsToHide: HTMLElement[] = Array.from(
      document.querySelectorAll('[data-orb-button-container], footer')
    );
    elementsToHide.forEach(el => el.style.visibility = 'hidden');

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `RealTimeMood-Snapshot-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Snapshot Ready!",
        description: "Your snapshot has been downloaded.",
      });

    } catch (error) {
      console.error("Error taking snapshot:", error);
      toast({
        title: "Error",
        description: "Could not create snapshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      elementsToHide.forEach(el => el.style.visibility = 'visible');
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={takeSnapshot}
      disabled={isLoading}
      className="text-base w-full"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
      Share Snapshot
    </Button>
  );
};

export default ShareSnapshotButton;
