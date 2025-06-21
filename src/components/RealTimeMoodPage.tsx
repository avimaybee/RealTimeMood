
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

const PageContent: React.FC = () => {
  const { isCollectiveShifting } = useMood();
  const [isRadialBloomActive, setIsRadialBloomActive] = React.useState(false);

  useEffect(() => {
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


  return (
    <div 
      className={cn(
        "min-h-screen w-full flex flex-col items-center",
        isRadialBloomActive ? 'radial-bloom-active-page' : ''
      )}
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
        "flex-grow flex flex-col items-center justify-center w-full px-4 text-center z-10",
        isCollectiveShifting ? 'opacity-90' : 'opacity-100',
        )}>
        <MainPromptDisplay />
      </main>
      
      <OrbButton /> 
      
      <AppFooter />

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
