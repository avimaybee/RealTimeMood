"use client";
import React, { useState, useEffect } from 'react';
import { Menu, BarChart2, MessageSquareQuote, X, Camera, Eye, Info, Loader2, Gavel, Github, Instagram, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';
import ShareSnapshotButton from '../features/ShareSnapshotButton';
import { usePlatform } from '@/contexts/PlatformContext';
import { useToast } from '@/hooks/use-toast';

interface AppFooterProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsAmbientMode: (isAmbient: boolean) => void;
}

const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M12 10.3c.1-.1.2-.3.3-.4.2-.3.3-.6.4-.9.2-1.2-.2-2.4-1.2-2.9-.3-.1-.7-.2-1-.2-1.3 0-2.5.8-3 2.1-.1.3-.1.6 0 .9.1.3.2.5.4.7m0 0c-.1.2-.2.3-.4.4-.2.2-.4.3-.7.4-1.2.5-2.6.2-3.3-.9-.2-.3-.3-.6-.4-1 0-.3.1-.6.1-.9.2-1.2 1.2-2.1 2.4-2.1.3 0 .7 0 1 .1m2.5 0c.1.1.2.2.3.3.4.4.8.8 1.1 1.2.2.5.2 1.1 0 1.6-.2.4-.5.8-.9 1-.5.2-1.1.2-1.6 0-.4-.2-.8-.5-1-.9-.2-.3-.3-.7-.3-1.1.1-.5.2-1 .5-1.4m7.5 3.3v-3.5c0-1.3-.6-2.5-1.6-3.4-.9-.8-2.1-1.3-3.4-1.3h-1.5c-1.3 0-2.5.5-3.4 1.3S10.5 8 10.5 9.3v.3c0 .1 0 .2.1.3.1.1.2.1.3.1s.2 0 .3-.1.1-.2.1-.3v-.3c0-.8.3-1.5.9-2.1.5-.5 1.2-.9 2.1-.9H17c.8 0 1.5.3 2.1.9.5.5.9 1.2.9 2.1v3.5c0 .8-.3 1.5-.9 2.1s-1.2.9-2.1.9h-.3c-.1 0-.2.1-.3.1-.1.1-.1.2-.1.3s0 .2.1.3.2.1.3.1h.3c1.3 0 2.5-.5 3.4-1.3.9-.9 1.5-2.1 1.5-3.4zM4.5 13.8v-3.5c0-1.3.6-2.5 1.6-3.4.9-.8 2.1-1.3 3.4-1.3h1.5c.3 0 .6 0 .9.1.5.1.9.3 1.3.6.1.1.2.1.3.1s.2 0 .3-.1c.1-.1.1-.2.1-.3s-.1-.2-.1-.3c-.4-.3-.8-.5-1.3-.6-.3-.1-.6-.1-.9-.1H9.5c-1.3 0-2.5.5-3.4 1.3C5.2 8 4.6 9.2 4.6 10.5v3.5c0 .8.3 1.5.9 2.1s1.2.9 2.1.9h.3c.1 0 .2.1.3.1s.1.2.1.3-.1.2-.1.3-.2.1-.3.1h-.3C7 17.7 5.8 17.2 5 16.3c-.9-.9-1.5-2.1-1.5-3.4z"/>
    </svg>
);


const AppFooter: React.FC<AppFooterProps> = ({ isMenuOpen, setIsMenuOpen, setIsAmbientMode }) => {
  const { contributionCount, isCollectiveShifting } = useMood();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const { isIos } = usePlatform();
  const { toast } = useToast();

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
    // Don't close the menu, let the navigation happen.
    // The component will unmount or the page will change, naturally handling the menu state.
  };
  
  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareText = "Check out RealTimeMood - a living canvas of our collective emotions.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RealTimeMood',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Error sharing:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "The app link has been copied to your clipboard.",
        });
      } catch (err) {
        console.error("Failed to copy link:", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the link.",
          variant: "destructive",
        });
      }
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
                "flex flex-col items-center overflow-hidden w-full frosted-glass rounded-2xl shadow-soft"
            )}
            animate={{ height: isMenuOpen ? 'auto' : '52px' }}
            transition={menuHeightTransition}
        >
            <div className="flex-shrink-0 w-full flex items-center justify-between h-[52px] px-4">
                <div className="text-sm md:text-base opacity-90">
                {contributionCount.toLocaleString()} moods shared
                </div>
                
                <Button 
                variant="ghost" 
                size="icon" 
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className="w-8 h-8 rounded-full interactive-glow"
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
                    {isMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6 opacity-90" strokeWidth={isIos ? 1.5 : 2} /> : <Menu className="w-5 h-5 md:w-6 md:h-6 opacity-90" strokeWidth={isIos ? 1.5 : 2} />}
                    </motion.div>
                </AnimatePresence>
                </Button>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                <motion.div
                    className="flex-grow w-full flex flex-col items-center justify-start pt-0 pb-3 px-2"
                    variants={menuContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <div className="w-full flex flex-col items-start">
                        <Button 
                            asChild 
                            variant="ghost" 
                            className="text-base w-full justify-start"
                            disabled={!!loadingPath}
                        >
                            <Link href="/history" onClick={() => handleLinkClick('/history')}>
                                {loadingPath === '/history' ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <BarChart2 className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                                )}
                                View Mood History
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <MessageSquareQuote className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                                )}
                                Collective Thoughts
                            </Link>
                        </Button>
                        
                        <Separator className="my-1" />

                        <ShareSnapshotButton />
                        <Button 
                            variant="ghost" 
                            className="text-base w-full justify-start"
                            onClick={handleAmbientClick}
                            disabled={!!loadingPath}
                        >
                            <Eye className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                            Ambient Mode
                        </Button>
                        
                        <Separator className="my-1" />

                        <Button 
                            asChild 
                            variant="ghost" 
                            className="text-base w-full justify-start"
                            disabled={!!loadingPath}
                        >
                            <Link href="/about" onClick={() => handleLinkClick('/about')}>
                                {loadingPath === '/about' ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Info className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                                )}
                                About
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
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Gavel className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                                )}
                                Guidelines
                            </Link>
                        </Button>

                        <Separator className="my-1" />

                        <div className="w-full px-2 pt-2 pb-1">
                            <div className="flex items-center justify-center gap-x-2">
                                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow">
                                    <Link href="https://instagram.com/avimaybe" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <Instagram className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow">
                                    <Link href="https://www.snapchat.com/add/avimaybe" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                                        <SnapchatIcon className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow">
                                    <Link href="https://github.com/avimaybee" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                        <Github className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                                    </Link>
                                </Button>
                                <div className="w-px h-6 bg-border/50 mx-1" />
                                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow" onClick={handleShare} aria-label="Share or copy link">
                                    <Share2 className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                                </Button>
                            </div>
                        </div>

                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    </motion.footer>
  );
};

export default AppFooter;
