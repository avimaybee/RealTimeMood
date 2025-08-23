
"use client";
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MoodProvider, useMood } from '@/contexts/MoodContext';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import GlobalRipple from '@/components/ui-fx/GlobalRipple';
import CollectiveShiftEffect from '@/components/ui-fx/CollectiveShiftEffect';
import AppHeader from '@/components/layout/AppHeader';
import OrbButton from '@/components/layout/OrbButton';
import AppFooter from '@/components/layout/AppFooter';
import MainPromptDisplay from '@/components/layout/MainPromptDisplay';
import { cn } from '@/lib/utils';
import { usePlatform } from '@/contexts/PlatformContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Loader2 } from 'lucide-react';

const OnboardingOverlay = dynamic(() => import('@/components/features/OnboardingOverlay'), {
  ssr: false,
});

const AddToHomeScreenPrompt = dynamic(() => import('@/components/features/AddToHomeScreenPrompt'), {
  ssr: false,
});

const NotificationPrompt = dynamic(() => import('@/components/features/NotificationPrompt'), {
  ssr: false,
});


const PageContent: React.FC = () => {
  const { isCollectiveShifting, setPreviewMood } = useMood();
  const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAmbientMode, setIsAmbientMode] = React.useState(false);
  const { isIos } = usePlatform();
  
  // State lifted from OrbButton to control page-level effects
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // --- Pull-to-refresh state and logic ---
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'refreshing'>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 100; // pixels to pull down to trigger refresh
  const isRefreshing = pullState === 'refreshing';

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start tracking if not already refreshing and user is at the top of the page.
    if (isRefreshing || window.scrollY !== 0) return;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || touchStartY.current === 0) return;

    const touchY = e.targetTouches[0].clientY;
    const distance = touchY - touchStartY.current;

    if (distance > 0) {
      // User is pulling down from the top.
      e.preventDefault(); // This is important to prevent the browser's default refresh actions.
      setPullState('pulling');
      // Use a damping function to make the pull feel more "stretchy" and prevent it from going too far.
      setPullDistance(Math.pow(distance, 0.85));
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing || touchStartY.current === 0) return;
    touchStartY.current = 0; // Reset start position on release

    if (pullState === 'pulling') {
      if (pullDistance > PULL_THRESHOLD) {
        setPullState('refreshing');
        // Add a small delay so user can see the spinner, then reload.
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        // Not pulled far enough, animate back to idle.
        setPullState('idle');
        setPullDistance(0);
      }
    }
  };
  // --- End pull-to-refresh logic ---

  useEffect(() => {
    const handleContribution = (event: Event) => {
        const customEvent = event as CustomEvent<{ count: number }>;
        if (!customEvent.detail) return;
        
        const count = customEvent.detail.count;
        
        // --- PWA Prompt Logic ---
        const PWA_PROMPT_THRESHOLD = 5;
        const hasBeenPromptedForPWA = localStorage.getItem('hasBeenPromptedForPWA') === 'true';
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (count >= PWA_PROMPT_THRESHOLD && !hasBeenPromptedForPWA && !isStandalone) {
            setShowPwaPrompt(true);
            localStorage.setItem('hasBeenPromptedForPWA', 'true');
        }

        // --- Notification Prompt Logic ---
        const NOTIFICATION_PROMPT_THRESHOLD = 3;
        const hasBeenPromptedForNotifications = localStorage.getItem('hasBeenPromptedForNotifications') === 'true';
        const notificationsSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
        const notificationPermission = notificationsSupported ? Notification.permission : 'denied';

        if (
            count >= NOTIFICATION_PROMPT_THRESHOLD && 
            !hasBeenPromptedForNotifications && 
            notificationsSupported &&
            notificationPermission === 'default'
        ) {
            setShowNotificationPrompt(true);
            localStorage.setItem('hasBeenPromptedForNotifications', 'true');
        }
    };
    
    window.addEventListener('userContribution', handleContribution);

    return () => {
        window.removeEventListener('userContribution', handleContribution);
    };
  }, []);

  // This effect handles adding/removing global classes to the body
  // to prevent scrolling when the emoji selector is open. It's safe
  // because useEffect only runs on the client.
  useEffect(() => {
    const className = 'no-scroll-select';
    if (isEmojiSelectorOpen || interactionMode === 'bar') {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [isEmojiSelectorOpen, interactionMode]);

  const handlePageClick = () => {
    if (isAmbientMode) {
      setIsAmbientMode(false);
    }
  };

  const isBarModeActive = interactionMode === 'bar' && !isCharging;
  
  const handleDismissBarMode = () => {
    if (isBarModeActive) {
      setInteractionMode('orb');
      setPreviewMood(null);
    }
  };

  return (
    <div 
      className={cn(
        "h-screen min-h-screen w-full flex flex-col items-center overflow-hidden",
        isEmojiSelectorOpen ? 'emoji-selector-active-page' : '',
        isMenuOpen ? (isIos ? 'ios-menu-open-recede-children' : 'menu-open-recede-children') : '',
        isAmbientMode ? 'ambient-mode-active-page' : '',
        isBarModeActive ? 'bar-mode-active-page' : ''
      )}
      onClick={handlePageClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
        <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center frosted-glass shadow-soft"
            initial={false}
            animate={{ 
                y: pullState === 'idle' ? -60 : (pullState === 'refreshing' ? 40 : pullDistance),
                opacity: pullState === 'idle' ? 0 : 1,
            }}
            transition={{ y: { type: 'spring', stiffness: 500, damping: 50 }, opacity: { duration: 0.2 } }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isRefreshing ? (
                    <motion.div
                        key="loader"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="arrow"
                        initial={false}
                        animate={{ rotate: pullDistance > PULL_THRESHOLD ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArrowDown className="w-5 h-5 text-foreground/70" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </div>
      
      <div className="vignette-overlay" />
      <div className="noise-overlay" />
      <DynamicBackground />
      <LivingParticles />

      <AnimatePresence>
        {isBarModeActive && (
          <motion.div
            className="fixed inset-0 z-30" // z-index lower than orb (40) but above other UI
            onClick={handleDismissBarMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Suppress global effects during focused mood selection */}
      {!isEmojiSelectorOpen && !isBarModeActive && (
        <>
          <GlobalRipple />
          <CollectiveShiftEffect />
        </>
      )}
      
      <AppHeader />

      <main className={cn(
        "flex-grow flex flex-col items-start justify-center w-full max-w-screen-md mx-auto px-4 md:px-6 z-10",
        isCollectiveShifting ? 'opacity-90' : 'opacity-100',
        )}>
        <MainPromptDisplay />
      </main>
      
      <OrbButton 
        isEmojiSelectorOpen={isEmojiSelectorOpen}
        setIsEmojiSelectorOpen={setIsEmojiSelectorOpen}
        isCharging={isCharging}
        setIsCharging={setIsCharging}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
      /> 
      
      <AppFooter 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen}
        setIsAmbientMode={setIsAmbientMode} 
      />
      
      <OnboardingOverlay />
      <AddToHomeScreenPrompt open={showPwaPrompt} onOpenChange={setShowPwaPrompt} />
      <NotificationPrompt open={showNotificationPrompt} onOpenChange={setShowNotificationPrompt} />

    </div>
  );
};

const RealTimeMoodPage: React.FC = () => {
  return (
    <MoodProvider isLivePage={true}>
      <PageContent />
    </MoodProvider>
  );
};

export default RealTimeMoodPage;
