
"use client";
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const AppFooter: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();
  const { toast } = useToast();

  const handleMenuClick = () => {
    toast({
      title: "Menu Clicked",
      description: "Main menu modal will open here.",
    });
  };

  const footerBaseClasses = "fixed bottom-0 left-1/2 -translate-x-1/2 mb-4 md:mb-6 p-1 z-30 frosted-glass rounded-full shadow-soft transition-transform duration-500 ease-in-out flex items-center justify-between";
  const sizeClasses = "h-11 min-w-[200px] md:min-w-[280px] px-4";
  const shiftClasses = isCollectiveShifting ? "-translate-y-1" : "translate-y-0";

  return (
    <footer className={cn(footerBaseClasses, sizeClasses, shiftClasses)}>
      <div className="text-xs md:text-sm text-shadow-pop opacity-90">
        {appState.contributionCount.toLocaleString()} moods shared
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleMenuClick} 
        aria-label="Open menu"
        className="w-8 h-8 rounded-full hover:bg-transparent text-shadow-pop interactive-glow"
      >
        <Menu className="w-5 h-5 md:w-6 md:h-6 opacity-90" /> 
      </Button>
    </footer>
  );
};

export default AppFooter;
