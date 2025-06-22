"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      const html2canvas = (await import('html2canvas')).default;
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
        const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L8 8L12 12L16 8L20 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 16L8 12L12 16L16 12L20 16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
          </svg>`;
        
        const img = new Image();
        const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const iconX = canvas.width - padding - textWidth - 8 - 24;
            const iconY = canvas.height - padding - 22;
            
            ctx.globalAlpha = 0.5;
            ctx.drawImage(img, iconX, iconY, 24, 24);
            ctx.globalAlpha = 1.0;

            resolve();
          };
          img.onerror = (err) => reject(err);
          img.src = svgDataUrl;
        });
      }
      // --- END WATERMARKING LOGIC ---

      const fileName = `RealTimeMood-Snapshot-${new Date().toISOString().split('T')[0]}.png`;

      const downloadImage = () => {
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Snapshot Ready!",
          description: "Your snapshot has been downloaded.",
        });
      };

      // Use Web Share API if available, otherwise fall back to download
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast({
              title: "Error",
              description: "Could not create image file. Please try again.",
              variant: "destructive",
            });
            downloadImage(); // Fallback on blob creation failure
            return;
          }

          const file = new File([blob], fileName, { type: 'image/png' });
          const shareData = {
            files: [file],
            title: 'My RealTimeMood Snapshot',
            text: 'Check out the collective mood right now! #RealTimeMood',
          };
          
          if (navigator.canShare && navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              toast({
                title: "Shared!",
                description: "Your mood snapshot has been shared.",
              });
            } catch (err) {
              if ((err as Error).name !== 'AbortError') {
                console.error("Share API error:", err);
                toast({
                  title: "Share Failed",
                  description: "Could not share the snapshot. It has been downloaded instead.",
                });
                downloadImage();
              }
            }
          } else {
            downloadImage();
          }
        }, 'image/png', 1.0);
      } else {
        downloadImage();
      }

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
      className="text-base w-full justify-start"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
      Share Snapshot
    </Button>
  );
};

export default ShareSnapshotButton;
