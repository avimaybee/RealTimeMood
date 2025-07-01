"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, BarChart2, MessageSquareQuote, X, Camera, Eye, Info, Loader2, Gavel, Github, Instagram, Share2, Ghost, Lightbulb, CalendarDays, Flame, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMood } from '@/contexts/MoodContext';
import { cn, urlBase64ToUint8Array } from '@/lib/utils';
import { motion, AnimatePresence, animate } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';
import ShareSnapshotButton from '../features/ShareSnapshotButton';
import { usePlatform } from '@/contexts/PlatformContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserProfile } from '@/lib/user-profile-service';
import type { UserProfile } from '@/types';

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
  const { toast } = useToast();
  const countRef = useRef<HTMLSpanElement>(null);
  const prevCountRef = useRef(0); // Ref to store the previous count

  // State and logic for fetching and displaying user streak
  const { user, isAnonymous, isLoading: isAuthLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user && !isAnonymous) {
        const profileData = await fetchUserProfile(user.uid);
        setUserProfile(profileData);
      } else {
        setUserProfile(null); // Clear profile if user logs out or is anonymous
      }
    }
    if (!isAuthLoading) {
      loadProfile();
    }
  }, [user, isAnonymous, isAuthLoading]);

  // Effect to reset the loader when the page navigation is complete
  useEffect(() => {
    if (loadingPath) {
      setLoadingPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const node = countRef.current;
    if (!node) return;

    const from = prevCountRef.current;
    const to = contributionCount;

    // Don't animate if the value hasn't changed
    if (from === to) {
        node.textContent = to.toLocaleString();
        return;
    };

    const controls = animate(from, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString();
      }
    });

    // Store the new value for the next animation
    prevCountRef.current = to;

    return () => controls.stop();
  }, [contributionCount]);


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

  const handleEnableNotifications = async () => {
    // IMPORTANT: These keys are for demonstration only.
    // You should generate your own VAPID keys and store them securely in environment variables.
    const VAPID_PUBLIC_KEY = "BCjoLGA09RL6f3s69FjIe00JkPqu3oYgExoGau5UnSQ5gN6x46BqAYBHCiHQinCsxteL9ZdSp24zOaNvf2n_Fqo";

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast({
            title: "Not Supported",
            description: "Push notifications are not supported by your browser.",
            variant: "destructive",
        });
        return;
    }

    if (Notification.permission === 'denied') {
        toast({
            title: "Permission Denied",
            description: "Please enable notifications for this site in your browser settings.",
            variant: "destructive",
        });
        return;
    }

    setLoadingPath('notifications'); // Use loading state to disable buttons

    try {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast({
                    title: "Permission Not Granted",
                    description: "You won't receive mood check-in reminders.",
                });
                setLoadingPath(null);
                return;
            }
        }
        
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
           toast({
                title: "Already Subscribed",
                description: "You are already set up to receive reminders.",
            });
        } else {
             subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // In a real app, you would send this subscription object to your backend.
            // For example: await fetch('/api/save-subscription', { method: 'POST', ... });
            console.log("Push Subscription Object: ", JSON.stringify(subscription));

            toast({
                title: "Reminders Enabled!",
                description: "We'll remind you to check in. (Subscription details logged to console).",
            });
        }
    } catch (error) {
        console.error("Failed to subscribe to push notifications:", error);
        toast({
            title: "Subscription Failed",
            description: "Could not enable notifications. Please try again.",
            variant: "destructive",
        });
    } finally {
        setLoadingPath(null);
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
                <span ref={countRef}>0</span> moods shared
                </div>
                
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {userProfile && userProfile.currentStreak > 0 && (
                      <motion.div
                        className="flex items-center gap-1 text-sm text-primary font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <Flame className="w-4 h-4" />
                        <span>{userProfile.currentStreak}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <Button 
                    data-menu-button="true"
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
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                <motion.div
                    className="w-full flex flex-col items-center justify-start pt-0 pb-3 px-2"
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
                            <Link href="/calendar" onClick={() => handleLinkClick('/calendar')}>
                                {loadingPath === '/calendar' ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CalendarDays className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                                )}
                                Mood Calendar
                            </Link>
                        </Button>
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
                                Collective History
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

                        <Button
                            variant="ghost"
                            className="text-base w-full justify-start"
                            onClick={handleEnableNotifications}
                            disabled={!!loadingPath}
                        >
                            {loadingPath === 'notifications' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Bell className="mr-2 h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                            )}
                            Enable Reminders
                        </Button>
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
                            <div className="flex items-center justify-center gap-x-2 bg-black/5 p-1 rounded-xl">
                                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow">
                                    <Link href="https://instagram.com/avimaybe" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <Instagram className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 interactive-glow">
                                    <Link href="https://www.snapchat.com/add/avimaybe" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                                        <Ghost className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
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
