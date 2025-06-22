
"use client";
import React, { useEffect } from 'react';
import { MoodProvider, useMood } from '@/contexts/MoodContext';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import GlobalRipple from '@/components/ui-fx/GlobalRipple';
import CollectiveShiftEffect from '@/components/ui-fx/CollectiveShiftEffect';
import MilestoneFireworks from '@/components/ui-fx/MilestoneFireworks';
import AppHeader from '@/components/layout/AppHeader';
import OrbButton from '@/components/layout/OrbButton';
import AppFooter from '@/components/layout/AppFooter';
import MainPromptDisplay from '@/components/layout/MainPromptDisplay';
import { cn } from '@/lib/utils';
import OnboardingOverlay from '@/components/features/OnboardingOverlay';

const PageContent: React.FC = () => {
  const { isCollectiveShifting } = useMood();
  const [isRadialBloomActive, setIsRadialBloomActive] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAmbientMode, setIsAmbientMode] = React.useState(false);

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

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const markerExists = document.querySelector('[data-radial-bloom-active-page-marker]');
          setIsRadialBloomActive(!!markerExists);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handlePageClick = () => {
    if (isAmbientMode) {
      setIsAmbientMode(false);
    }
  };


  return (
    <div 
      className={cn(
        "h-screen min-h-screen w-full flex flex-col items-center overflow-hidden",
        isRadialBloomActive ? 'radial-bloom-active-page' : '',
        isMenuOpen ? 'menu-open-recede-children' : '',
        isAmbientMode ? 'ambient-mode-active-page' : ''
      )}
      onClick={handlePageClick}
    >
      <DynamicBackground />
      <div className="vignette-overlay" />
      <div className="noise-overlay" />
      <LivingParticles />

      {/* Suppress global effects during focused mood selection */}
      {!isRadialBloomActive && (
        <>
          <GlobalRipple />
          <CollectiveShiftEffect />
          <MilestoneFireworks />
        </>
      )}
      
      <AppHeader />

      <main className={cn(
        "flex-grow flex flex-col items-center justify-center w-full px-4 text-center z-10 gap-12 md:gap-16",
        isCollectiveShifting ? 'opacity-90' : 'opacity-100',
        )}>
        <MainPromptDisplay />
      </main>
      
      <OrbButton /> 
      
      <AppFooter 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen}
        setIsAmbientMode={setIsAmbientMode} 
      />
      
      <OnboardingOverlay />

    </div>
  );
};

const RealTimeMoodPage: React.FC = () => {
  return (
    <MoodProvider>
      <PageContent />
    </MoodProvider>
  );
};

export default RealTimeMoodPage;
