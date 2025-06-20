
"use client";
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMood } from '@/contexts/MoodContext';

const AppFooter: React.FC = () => {
  const { toast } = useToast();
  const { isCollectiveShifting } = useMood();

  const handleShare = () => {
    // In a real app, html2canvas or similar would be used here.
    toast({
      title: "Snapshot Generated (Simulated)",
      description: "Your current mood screen has been captured!",
    });
  };

  const footerBaseClasses = "fixed bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center items-center z-30 frosted-glass rounded-t-2xl shadow-soft-top transition-transform duration-500 ease-in-out";
  const shiftClasses = isCollectiveShifting ? "-translate-y-1 -translate-x-0.5" : "translate-y-0 translate-x-0";
  
  return (
    // This footer is hidden for now to give OrbButton more prominence, can be enabled if needed
    // <footer className={cn(footerBaseClasses, shiftClasses, "hidden")}>
    //   <Button variant="ghost" onClick={handleShare} className="text-shadow-pop">
    //     <Share2 className="mr-2 h-5 w-5" />
    //     Share Mood
    //   </Button>
    // </footer>
    null // Keep footer minimal or remove if Orb is the sole bottom element
  );
};

export default AppFooter;
