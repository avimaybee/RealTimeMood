"use client";
import React from 'react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { moodToHslString } from '@/lib/colorUtils';

const AppHeaderLogo: React.FC<{ animationClass: string }> = ({ animationClass }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "text-foreground opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300",
      animationClass
    )}
  >
    <path d="M4 12L8 8L12 12L16 8L20 12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16L8 12L12 16L16 12L20 16" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
  </svg>
);

// Helper function to determine logo animation based on mood hue
const getLogoAnimationClass = (hue: number): string => {
  // Joyful: yellow/orange range (30-90)
  if (hue >= 30 && hue < 90) return 'animate-logo-joyful';
  // Anxious: red/magenta range (0-30 or 300-360)
  if (hue < 30 || hue >= 300) return 'animate-logo-anxious';
  // Default: calm for blue/green/purple (90-300)
  return 'animate-logo-calm';
};

const AppHeader: React.FC = () => {
  const { isCollectiveShifting, lastUserContribution, currentMood, isInitialized } = useMood();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Derive animation class from current mood hue (only on client to prevent hydration mismatch)
  const animationClass = isClient && isInitialized
    ? getLogoAnimationClass(currentMood.hue)
    : 'animate-logo-calm';

  const moodColor = moodToHslString(currentMood);

  return (
    <motion.header
      className={cn(
        "fixed top-4 inset-x-0 mx-auto z-30",
        "w-[calc(100%-2rem)] max-w-lg",
        "flex items-center justify-between",
        "h-12 px-3",
        "frosted-glass rounded-2xl shadow-soft"
      )}
      animate={{ y: isCollectiveShifting ? -8 : 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
    >
      {/* Logo on the left with hover glow */}
      <a href="/" className="flex items-center group relative">
        <motion.div
          className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${moodColor}30, transparent 70%)` }}
        />
        <AppHeaderLogo animationClass={animationClass} />
        <span className="ml-2 text-base md:text-lg font-medium font-display text-foreground opacity-90 transition-opacity group-hover:opacity-100">
          RealTimeMood
        </span>
      </a>

      {/* User's last submitted mood */}
      <div className="flex items-center gap-2">
        {isClient && (
          <AnimatePresence>
            {lastUserContribution && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <motion.div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: moodToHslString(lastUserContribution),
                    boxShadow: `0 0 10px ${moodToHslString(lastUserContribution)}`,
                  }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-sm font-medium text-foreground/90">
                  {lastUserContribution.adjective}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.header>
  );
};

export default AppHeader;
