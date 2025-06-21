"use client";
import React, { useState } from 'react';
import { Menu, BarChart2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Separator } from '../ui/separator';

const AppFooter: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Base classes for the footer container
  const footerBaseClasses = "fixed bottom-0 mb-4 md:mb-6 p-2 z-30 frosted-glass rounded-2xl shadow-soft flex flex-col items-center overflow-hidden";
  const sizeClasses = "min-w-[200px] md:min-w-[280px] px-4";

  // Variants for menu content animation
  const menuContentVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(5px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { delay: 0.1, duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      filter: 'blur(5px)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.footer 
      className={cn(footerBaseClasses, sizeClasses, "left-1/2")}
      style={{ x: "-50%" }}
      animate={{
        y: isCollectiveShifting ? 8 : 0,
        height: isMenuOpen ? '180px' : '52px',
      }}
      transition={{
        y: { type: "spring", stiffness: 100, damping: 10 },
        height: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
      }}
    >
      {/* Container for top part (collapsed view) */}
      <div className="flex-shrink-0 w-full flex items-center justify-between h-[36px]">
        <div className="text-xs md:text-sm text-shadow-pop opacity-90">
          {appState.contributionCount.toLocaleString()} moods shared
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="w-8 h-8 rounded-full hover:bg-transparent text-shadow-pop interactive-glow"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isMenuOpen ? 'x' : 'menu'}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {isMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6 opacity-90" /> : <Menu className="w-5 h-5 md:w-6 md:h-6 opacity-90" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>

      {/* Expanded menu content */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            className="flex-grow w-full flex flex-col items-center justify-center gap-2"
            variants={menuContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-lg font-semibold text-foreground text-shadow-pop">Menu</h3>
            <Separator className="w-1/2 my-1" />
            <Button asChild variant="ghost" className="text-lg w-full">
              <Link href="/history">
                <BarChart2 className="mr-2 h-5 w-5" />
                View Mood History
              </Link>
            </Button>
             <p className="text-xs text-muted-foreground">More features coming soon.</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.footer>
  );
};

export default AppFooter;
