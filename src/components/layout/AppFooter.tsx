
"use client";
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const AppFooter: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();
  const { toast } = useToast();

  const handleMenuClick = () => {
    toast({
      title: "Menu Clicked",
      description: "Main menu modal will open here.",
    });
  };

  const footerBaseClasses = "fixed bottom-0 left-1/2 -translate-x-1/2 mb-4 md:mb-6 p-1 z-30 frosted-glass rounded-full shadow-soft flex items-center justify-between";
  const sizeClasses = "h-11 min-w-[200px] md:min-w-[280px] px-4";

  return (
    <motion.footer 
      className={cn(footerBaseClasses, sizeClasses)}
      animate={{ y: isCollectiveShifting ? 8 : 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
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
    </motion.footer>
  );
};

export default AppFooter;
