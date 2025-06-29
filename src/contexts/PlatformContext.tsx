
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeAnalytics } from '@/lib/firebase';

interface PlatformContextType {
  isIos: boolean;
  isAndroid: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [platform, setPlatform] = useState<PlatformContextType>({
    isIos: false,
    isAndroid: false,
  });

  useEffect(() => {
    // Defer analytics initialization to run client-side after initial render.
    initializeAnalytics();

    // The rest of this effect only needs to run once on the client.
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for iOS devices
    const isIos = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    // Check for Android devices
    const isAndroid = /android/i.test(userAgent);

    setPlatform({ isIos, isAndroid });

    // Apply class to body for global styling hooks
    if (isIos) {
      document.body.classList.add('ios');
    } else if (isAndroid) {
      document.body.classList.add('android');
    }
  }, []);

  return (
    <PlatformContext.Provider value={platform}>
      {children}
    </PlatformContext.Provider>
  );
};
