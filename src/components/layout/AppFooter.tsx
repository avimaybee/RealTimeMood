"use client";
import React, { useState, useEffect } from 'react';
import { Menu, BarChart2, MessageSquareQuote, X, Camera, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import ShareSnapshotButton from '../features/ShareSnapshotButton';

interface AppFooterProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsAmbientMode: (isAmbient: boolean) => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ isMenuOpen, setIsMenuOpen, setIsAmbientMode }) => {
  const { contributionCount, isCollectiveShifting } = useMood();
  const [loadingLink, setLoadingLink] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state when the menu is closed
    if (!isMenuOpen) {
      setLoadingLink(null);
    }
  }, [isMenuOpen]);

  const footerBaseClasses = "fixed bottom-0 mb-4 md:mb-6 p-2 z-50 frosted-glass rounded-2xl shadow-soft flex flex-col items-center overflow-hidden";
  const sizeClasses = "min-w-[200px] md:min-w-[280px] px-4";

  const menuContentVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(5px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { delay: 0.1, duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      filter: 'blur(5px)',
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const handleAmbientClick = () => {
    setIsAmbientMode(true);
    setIsMenuOpen(false);
  };

  return (
    <motion.footer 
      className={cn(footerBaseClasses, sizeClasses, "left-1/2")}
      style={{ x: "-50%" }}
      animate={{
        y: isCollectiveShifting ? 8 : 0,
        height: isMenuOpen ? '260px' : '52px',
      }}
      transition={{
        y: { type: "spring", stiffness: 100, damping: 10, delay: 0.1 },
        height: { type: "tween", duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      }}
    >
      <div className="flex-shrink-0 w-full flex items-center justify-between h-[36px]">
        <div className="text-xs md:text-sm opacity-90">
          {contributionCount.toLocaleString()} moods shared
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="w-8 h-8 rounded-full hover:bg-transparent interactive-glow"
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="flex-grow w-full flex flex-col items-center justify-start pt-2 pb-2"
            variants={menuContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="w-full flex flex-col items-center">
                <h3 className="text-lg font-semibold text-foreground">Menu</h3>
                <Separator className="w-1/2 my-2" />
                <Button 
                  asChild 
                  variant="ghost" 
                  className="text-base w-full justify-start"
                  onClick={() => setLoadingLink('/history')}
                >
                  <Link href="/history">
                    {loadingLink === '/history' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart2 className="mr-2 h-4 w-4" />
                    )}
                    View Mood History
                  </Link>
                </Button>
                 <Button 
                  asChild 
                  variant="ghost" 
                  className="text-base w-full justify-start"
                  onClick={() => setLoadingLink('/thoughts')}
                >
                  <Link href="/thoughts">
                    {loadingLink === '/thoughts' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquareQuote className="mr-2 h-4 w-4" />
                    )}
                    Collective Thoughts
                  </Link>
                </Button>
                <ShareSnapshotButton />
                <Button 
                  variant="ghost" 
                  className="text-base w-full justify-start"
                  onClick={handleAmbientClick}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ambient Mode
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
};

export default AppFooter;
