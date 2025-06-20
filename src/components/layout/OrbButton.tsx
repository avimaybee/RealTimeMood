
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { PREDEFINED_MOODS, moodToHslString } from '@/lib/colorUtils';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MotionShadcnButton = motion(ShadcnButton);

const OrbButton: React.FC = () => {
  const { recordContribution, appState, isCollectiveShifting } = useMood();
  const [isInteracting, setIsInteracting] = useState(false);
  const [showColorWell, setShowColorWell] = useState(false);
  const [radialBloomActive, setRadialBloomActive] = useState(false);
  const [tapPoint, setTapPoint] = useState({ x: 0, y: 0 });
  const [isTapped, setIsTapped] = useState(false);
  const [glowHue, setGlowHue] = useState(0);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const personalMood = PREDEFINED_MOODS[Math.floor(Math.random() * PREDEFINED_MOODS.length)];

  // Simulate hue shift based on mood (should be replaced with actual mood history logic)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowHue((prev) => (prev + 1) % 360);
    }, 100); // Slow shift, adjust as needed
    return () => clearInterval(interval);
  }, []);

  const handleInteractionStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsInteracting(true);
    const point = 'touches' in event ? event.touches[0] : event;
    setTapPoint({ x: point.clientX, y: point.clientY });

    holdTimeoutRef.current = setTimeout(() => {
      setRadialBloomActive(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); // Sustained soft haptic
      }
      const marker = document.createElement('div');
      marker.setAttribute('data-radial-bloom-active-page-marker', '');
      document.body.appendChild(marker);
    }, 250);
  };

  const handleInteractionEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (radialBloomActive) {
      setRadialBloomActive(false);
      const marker = document.querySelector('[data-radial-bloom-active-page-marker]');
      if (marker && marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // Tap haptic feedback
      }
      setIsTapped(true);
      setTimeout(() => setIsTapped(false), 500);
      setShowColorWell(true);
      recordContribution(moodToHslString(personalMood));
      setTimeout(() => setShowColorWell(false), 1000);
    }

    setIsInteracting(false);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 300);
  };

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      const marker = document.querySelector('[data-radial-bloom-active-page-marker]');
      if (marker && marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    };
  }, []);

  // Positioning: Bottom third on mobile, centered horizontally
  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-in-out";
  const shiftClasses = isCollectiveShifting ? "translate-y-1" : "translate-y-0";

  let scaleToAnimate;
  let transitionConfig;

  if (isTapped) {
    scaleToAnimate = 0;
    transitionConfig = { duration: 0.3, ease: "easeIn" };
  } else if (radialBloomActive) {
    scaleToAnimate = 1.1;
    transitionConfig = { type: "spring", stiffness: 400, damping: 20 };
  } else if (isInteracting) {
    scaleToAnimate = 0.9; // Depress effect on hold
    transitionConfig = { type: "spring", stiffness: 400, damping: 20 };
  } else {
    scaleToAnimate = [1, 1.05, 1]; // Breathing pulse
    transitionConfig = {
      duration: 3,
      ease: [0.42, 0, 0.58, 1], // Organic easing
      repeat: Infinity,
    };
  }

  const hoverScale = radialBloomActive ? scaleToAnimate : 1.08;
  const tapScale = radialBloomActive ? scaleToAnimate : 0.95;

  return (
    <>
      <div className={cn(orbContainerBaseClasses, shiftClasses, "orb-button-container")}>
        <MotionShadcnButton
          aria-label="Contribute Mood"
          className={cn(
            "rounded-full w-[60px] h-[60px] md:w-20 md:h-20 p-0 flex items-center justify-center",
            "transition-all duration-300 ease-out"
          )}
          style={{
            // @ts-ignore
            background: 'var(--orb-background)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            position: 'relative',
          }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          onMouseLeave={radialBloomActive ? handleInteractionEnd : undefined}
          animate={{ scale: scaleToAnimate }}
          transition={transitionConfig}
          whileHover={{ scale: hoverScale }}
          whileTap={{ scale: tapScale }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `hsl(${glowHue}, 50%, 50%)`,
              filter: 'blur(20px)',
              opacity: 0.3,
            }}
          />
          <Plus className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" strokeWidth={2} />
        </MotionShadcnButton>
      </div>

      {showColorWell && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: tapPoint.x, top: tapPoint.y, transform: 'translate(-50%, -50%)' }}
          aria-hidden="true"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 5,
                height: 5,
                background: moodToHslString(personalMood),
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                x: Math.cos((i / 20) * 360 * (Math.PI / 180)) * (50 + Math.random() * 50),
                y: Math.sin((i / 20) * 360 * (Math.PI / 180)) * (50 + Math.random() * 50),
                scale: 0,
                opacity: 0,
                rotate: 360,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      {radialBloomActive && (
        <div
          className="orb-radial-bloom-effect fixed inset-0 pointer-events-none z-20"
          style={{
            // @ts-ignore
            '--tap-x': `${tapPoint.x}px`,
            // @ts-ignore
            '--tap-y': `${tapPoint.y}px`,
          }}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        :root {
          --orb-background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1));
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --orb-background: linear-gradient(145deg, rgba(0,0,0,0.05), rgba(0,0,0,0.1));
          }
        }
        .orb-radial-bloom-effect {
          background: radial-gradient(circle at var(--tap-x) var(--tap-y), transparent 0%, hsla(var(--mood-hue), var(--mood-saturation-value)%, var(--mood-lightness-value)%, 0.3) 70%, hsla(var(--mood-hue), var(--mood-saturation-value)%, var(--mood-lightness-value)%, 0.5) 100%);
          animation: radial-bloom-effect-anim 1s ease-out forwards;
        }
        @keyframes radial-bloom-effect-anim {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(3); }
        }
      `}</style>

      <style jsx global>{`
        .radial-bloom-active-page > *:not(.orb-button-container):not([data-radix-portal]):not(.orb-radial-bloom-effect):not(.vignette-overlay):not(.noise-overlay):not(.fixed.inset-0.pointer-events-none.z-2) {
          opacity: 0.2 !important;
          filter: blur(24px) !important;
          transition: opacity 0.5s ease, filter 0.5s ease !important;
        }
      `}</style>
    </>
  );
};

export default OrbButton;

    