"use client";
import React, { useEffect, useState } from 'react';
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

const OnboardingOverlay = dynamic(() => import('@/components/features/OnboardingOverlay'), {
  ssr: false,
});
const AddToHomeScreenPrompt = dynamic(() => import('@/components/features/AddToHomeScreenPrompt'), {
  ssr: false,
});

const PageContent: React.FC = () => {
  const { isCollectiveShifting } = useMood();
  const [isEmojiSelectorOpen, setIsEmojiSelectorOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAmbientMode, setIsAmbientMode] = React.useState(false);
  const { isIos } = usePlatform();
  
  // State lifted from OrbButton to avoid client-side only errors
  const [interactionMode, setInteractionMode] = useState<'orb' | 'bar'>('orb');
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    // Register Service Worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('PWA Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  // This effect handles adding/removing global classes to the body
  // to prevent scrolling when the emoji selector is open. It's safe
  // because useEffect only runs on the client.
  useEffect(() => {
    const className = 'no-scroll-select';
    if (isEmojiSelectorOpen) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [isEmojiSelectorOpen]);

  const handlePageClick = () => {
    if (isAmbientMode) {
      setIsAmbientMode(false);
    }
  };

  const isBarModeActive = interactionMode === 'bar' && !isCharging;

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
    >
      <DynamicBackground />
      <div className="vignette-overlay" />
      <div className="noise-overlay" />
      <LivingParticles />

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
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        isCharging={isCharging}
        setIsCharging={setIsCharging}
      /> 
      
      <AppFooter 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen}
        setIsAmbientMode={setIsAmbientMode} 
      />
      
      <OnboardingOverlay />
      <AddToHomeScreenPrompt />

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
