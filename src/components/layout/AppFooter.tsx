
"use client";
import React from 'react';
import { Menu, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { Separator } from '../ui/separator';

const AppFooter: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();

  const footerBaseClasses = "fixed bottom-0 mb-4 md:mb-6 p-1 z-30 frosted-glass rounded-full shadow-soft flex items-center justify-between";
  const sizeClasses = "h-11 min-w-[200px] md:min-w-[280px] px-4";

  return (
    <motion.footer 
      className={cn(footerBaseClasses, sizeClasses, "left-1/2")}
      style={{ x: "-50%" }}
      animate={{ y: isCollectiveShifting ? 8 : 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      <div className="text-xs md:text-sm text-shadow-pop opacity-90">
        {appState.contributionCount.toLocaleString()} moods shared
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Open menu"
            className="w-8 h-8 rounded-full hover:bg-transparent text-shadow-pop interactive-glow"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6 opacity-90" /> 
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="frosted-glass border-t-0 rounded-t-2xl h-auto">
          <SheetHeader className="text-center mb-4">
            <SheetTitle className="text-shadow-pop">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col items-center gap-4">
            <Button asChild variant="ghost" className="text-lg w-full">
              <Link href="/history">
                <BarChart2 className="mr-2 h-5 w-5" />
                View Mood History
              </Link>
            </Button>
            <Separator className="w-1/2" />
             <p className="text-xs text-muted-foreground">More features coming soon.</p>
          </nav>
        </SheetContent>
      </Sheet>
    </motion.footer>
  );
};

export default AppFooter;
