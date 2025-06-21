
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

    // Hide UI elements that shouldn't be in the snapshot
    const elementsToHide: HTMLElement[] = Array.from(
      document.querySelectorAll('[data-orb-button-container], footer, [data-prevent-snapshot]')
    );
    elementsToHide.forEach(el => el.style.visibility = 'hidden');

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });

      // --- WATERMARKING LOGIC ---
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const padding = 20;
        
        // --- Draw Text ---
        const text = 'realtime.mood';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(text, canvas.width - padding, canvas.height - padding);
        
        // --- Draw Icon ---
        // SVG content matches the app's logo icon
        const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L8 8L12 12L16 8L20 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 16L8 12L12 16L16 12L20 16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
          </svg>`;
        
        const img = new Image();
        // Use a data URI to avoid object URL management and potential CORS issues.
        const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            // Position icon to the left of the text
            const iconX = canvas.width - padding - textWidth - 8 - 24; // icon width: 24, spacing: 8
            const iconY = canvas.height - padding - 22; // Align vertically with text
            
            ctx.globalAlpha = 0.5; // Apply shared opacity to the icon
            ctx.drawImage(img, iconX, iconY, 24, 24);
            ctx.globalAlpha = 1.0; // Reset global alpha for other canvas operations

            resolve();
          };
          img.onerror = (err) => reject(err); // Handle image loading errors
          img.src = svgDataUrl;
        });
      }
      // --- END WATERMARKING LOGIC ---

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
      // Restore visibility of hidden elements
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
