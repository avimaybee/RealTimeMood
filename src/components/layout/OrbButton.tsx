
"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Mood } from '@/types';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { PREDEFINED_MOODS, getDerivedColors } from '@/lib/colorUtils';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MotionShadcnButton = motion(ShadcnButton);

const OrbButton: React.FC = () => {
  const { recordContribution, appState, isCollectiveShifting } = useMood();
  const [isInteracting, setIsInteracting] = useState(false);
  const [radialBloomActive, setRadialBloomActive] = useState(false);
  const [tapPoint, setTapPoint] = useState({ x: 0, y: 0 });
  const [glowHue, setGlowHue] = useState(appState.currentMood.hue);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  // Anticipatory glow hue calculation based on recent mood contributions (simplified assumption)
  useEffect(() => {
    // Assuming appState provides recentContributions as an array of Mood objects
    const recentContributions = appState.recentContributions || [appState.currentMood];
    const averageHue = recentContributions.reduce((sum, mood) => sum + mood.hue, 0) / recentContributions.length;
    const targetHue = averageHue;

    const animateHue = () => {
      setGlowHue(prevHue => {
        const diff = (targetHue - prevHue + 360) % 360;
        const step = diff > 180 ? (diff - 360) * 0.05 : diff * 0.05;
        const newHue = (prevHue + step + 360) % 360;

        if (Math.abs(newHue - targetHue) < 0.5 || Math.abs(newHue - targetHue) > 359.5) {
          return targetHue;
        }
        
        animationFrameRef.current = requestAnimationFrame(animateHue);
        return newHue;
      });
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateHue);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [appState.currentMood.hue, appState.recentContributions]);

  const handleInteractionStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsInteracting(true);
    const point = 'touches' in event ? event.touches[0] : event;
    setTapPoint({ x: point.clientX, y: point.clientY });

    holdTimeoutRef.current = setTimeout(() => {
      setRadialBloomActive(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20); 
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
      const newMood = PREDEFINED_MOODS[Math.floor(Math.random() * PREDEFINED_MOODS.length)];
      
      let position = null;
      if(buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        position = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
      }
      recordContribution(newMood, position);
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

  const orbContainerBaseClasses = "fixed bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 z-40";

  let scaleToAnimate;
  let transitionConfig;

  if (radialBloomActive) {
    scaleToAnimate = 1.1;
    transitionConfig = { type: "spring", stiffness: 400, damping: 20 };
  } else if (isInteracting) {
    scaleToAnimate = 0.9; // Depress effect on hold
    transitionConfig = { type: "spring", stiffness: 400, damping: 20 };
  } else {
    scaleToAnimate = [1, 1.05, 1]; // Simplified breathing pulse
    transitionConfig = {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    };
  }

  const hoverScale = radialBloomActive ? scaleToAnimate : 1.08;
  const tapScale = radialBloomActive ? scaleToAnimate : 0.95;
  
  const derivedColors = getDerivedColors(appState.currentMood);
  const plusIconColor = `hsl(${derivedColors.primaryForegroundHue}, ${derivedColors.primaryForegroundSaturation}%, ${derivedColors.primaryForegroundLightness}%)`;

  return (
    <>
      <motion.div 
        className={cn(orbContainerBaseClasses, "orb-button-container")}
        animate={{ y: isCollectiveShifting ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      >
        <MotionShadcnButton
          ref={buttonRef}
          aria-label="Contribute Mood"
          className={cn(
            "rounded-full w-[60px] h-[60px] md:w-20 md:h-20 p-0 flex items-center justify-center",
            "transition-all duration-300 ease-out backdrop-blur-2xl"
          )}
          style={{
            // @ts-ignore
            background: 'var(--orb-background)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)', // Enhanced shadow for premium look
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
              background: `hsl(${glowHue}, 80%, 60%)`, // More vibrant glow
              filter: 'blur(15px)', // Reduced blur for better visibility
              opacity: 0.6, // Increased opacity for discernibility
            }}
          />
          <Plus 
            className="w-8 h-8 md:w-10 md:h-10" 
            strokeWidth={2} 
            style={{ color: plusIconColor }}
          />
        </MotionShadcnButton>
      </motion.div>

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
          --orb-background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2)); // More pronounced gradient
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --orb-background: linear-gradient(145deg, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
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
