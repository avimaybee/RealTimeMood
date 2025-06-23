"use client";
import React, { useState, useEffect } from 'react';
import { Menu, BarChart2, MessageSquareQuote, X, Camera, Eye, Info, Loader2, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';
import ShareSnapshotButton from '../features/ShareSnapshotButton';
import { usePlatform } from '@/contexts/PlatformContext';

interface AppFooterProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsAmbientMode: (isAmbient: boolean) => void;
}

const AppFooter: React.FC<AppFooterProps> = ({ isMenuOpen, setIsMenuOpen, setIsAmbientMode }) => {
  const { contributionCount, isCollectiveShifting } = useMood();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { isIos } = usePlatform();

  // Effect to reset the loader when the page navigation is complete
  useEffect(() => {
    if (loadingPath) {
      setLoadingPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const handleLinkClick = (path: string) => {
    // Only show loader if we are navigating to a different page
    if (pathname !== path) {
      setLoadingPath(path);
    }
  };

  const menuHeightTransition = isIos
    ? { type: "spring", stiffness: 400, damping: 35 }
    : { type: "tween", duration: 0.4, ease: [0.4, 0, 0.2, 1] };
    
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
      className={cn(
        "fixed bottom-4 inset-x-0 mx-auto z-50",
        "w-[calc(100%-2rem)] max-w-lg",
        "frosted-glass rounded-2xl shadow-soft"
      )}
      animate={{
        y: isCollectiveShifting ? 8 : 0,
      }}
      transition={{
        y: { type: "spring", stiffness: 100, damping: 10, delay: 0.1 },
      }}
    >
        <motion.div
            className={cn(
                "flex flex-col items-center overflow-hidden w-full"
            )}
            animate={{ height: isMenuOpen ? '350px' : '36px' }}
            transition={menuHeightTransition}
        >
            <div className="flex-shrink-0 w-full flex items-center justify-between h-[36px] px-4">
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
                    className="flex-grow w-full flex flex-col items-center justify-start pt-2 pb-2 px-2"
                    variants={menuContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="w-full flex flex-col items-start">
                        <h3 className="text-lg font-semibold text-foreground w-full text-center">Menu</h3>
                        <Separator className="w-1/2 my-2 self-center" />
                        <Button 
                        asChild 
                        variant="ghost" 
                        className="text-base w-full justify-start"
                        disabled={!!loadingPath}
                        >
                        <Link href="/history" onClick={() => handleLinkClick('/history')}>
                            {loadingPath === '/history' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                            ) : (
                            <>
                                <BarChart2 className="mr-2 h-4 w-4" />
                                View Mood History
                            </>
                            )}
                        </Link>
                        </Button>
                        <Button 
                        asChild 
                        variant="ghost" 
                        className="text-base w-full justify-start"
                        disabled={!!loadingPath}
                        >
                        <Link href="/thoughts" onClick={() => handleLinkClick('/thoughts')}>
                            {loadingPath === '/thoughts' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                            ) : (
                            <>
                                <MessageSquareQuote className="mr-2 h-4 w-4" />
                                Collective Thoughts
                            </>
                            )}
                        </Link>
                        </Button>
                        <ShareSnapshotButton />
                        <Button 
                        variant="ghost" 
                        className="text-base w-full justify-start"
                        onClick={handleAmbientClick}
                        disabled={!!loadingPath}
                        >
                        <Eye className="mr-2 h-4 w-4" />
                        Ambient Mode
                        </Button>
                        <Button 
                        asChild 
                        variant="ghost" 
                        className="text-base w-full justify-start"
                        disabled={!!loadingPath}
                        >
                        <Link href="/about" onClick={() => handleLinkClick('/about')}>
                            {loadingPath === '/about' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                            ) : (
                            <>
                                <Info className="mr-2 h-4 w-4" />
                                About
                            </>
                            )}
                        </Link>
                        </Button>
                        <Button 
                        asChild 
                        variant="ghost" 
                        className="text-base w-full justify-start"
                        disabled={!!loadingPath}
                        >
                        <Link href="/rules" onClick={() => handleLinkClick('/rules')}>
                            {loadingPath === '/rules' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                            ) : (
                            <>
                                <Gavel className="mr-2 h-4 w-4" />
                                Guidelines
                            </>
                            )}
                        </Link>
                        </Button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    </motion.footer>
  );
};

export default AppFooter;
