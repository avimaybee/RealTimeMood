
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
// import AppFooter from '@/components/layout/AppFooter'; // Optional
import MoodTrendsDisplay from '@/components/features/MoodTrendsDisplay';
import CommunityQuotesDisplay from '@/components/features/CommunityQuotesDisplay';
import ShareSnapshotButton from '@/components/features/ShareSnapshotButton'; // Could be placed in header/footer or as a floating button
import { cn } from '@/lib/utils';

const PageContent: React.FC = () => {
  const { appState, isCollectiveShifting } = useMood();
  const [isRadialBloomActive, setIsRadialBloomActive] = React.useState(false);

  useEffect(() => {
    // Check for marker from OrbButton to activate radial bloom page effect
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
        "min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ease-in-out",
        isCollectiveShifting ? 'animate-global-pulse opacity-95 scale-[1.005]' : 'opacity-100 scale-100', // Apply global pulse less aggressively during shift
        isRadialBloomActive ? 'radial-bloom-active-page' : ''
      )}
    >
      <DynamicBackground />
      <LivingParticles />
      <GlobalRipple />
      <CollectiveShiftEffect />
      <MilestoneFireworks />
      
      <AppHeader />

      <main className={cn(
        "flex-grow flex flex-col items-center justify-center w-full px-4 pt-24 pb-32 md:pt-28 md:pb-40 transition-opacity duration-300",
        isCollectiveShifting ? 'opacity-90' : 'opacity-100',
        )}>
        <MoodTrendsDisplay />
        <CommunityQuotesDisplay />
      </main>
      
      <div className="orb-button-container"> {/* This class is used in OrbButton style to exclude from blur */}
         <OrbButton />
      </div>
      {/* <AppFooter /> */}

      <div className="fixed top-20 right-4 md:top-24 md:right-6 z-40">
         <ShareSnapshotButton />
      </div>

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
