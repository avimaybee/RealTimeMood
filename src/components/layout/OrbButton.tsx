
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { PREDEFINED_MOODS, moodToHslString } from '@/lib/colorUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrbButton: React.FC = () => {
  const { recordContribution, appState, isCollectiveShifting } = useMood();
  const [isInteracting, setIsInteracting] = useState(false);
  const [showColorWell, setShowColorWell] = useState(false);
  const [radialBloomActive, setRadialBloomActive] = useState(false);
  const [tapPoint, setTapPoint] = useState({ x: 0, y: 0 });
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const personalMood = PREDEFINED_MOODS[Math.floor(Math.random() * PREDEFINED_MOODS.length)];

  const handleInteractionStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsInteracting(true);
    const point = 'touches' in event ? event.touches[0] : event;
    setTapPoint({ x: point.clientX, y: point.clientY });

    holdTimeoutRef.current = setTimeout(() => {
      setRadialBloomActive(true);
      // Add marker for page-level effects
      const marker = document.createElement('div');
      marker.setAttribute('data-radial-bloom-active-page-marker', '');
      document.body.appendChild(marker);
    }, 300); 
  };

  const handleInteractionEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (radialBloomActive) {
      setRadialBloomActive(false);
      const marker = document.querySelector('[data-radial-bloom-active-page-marker]');
      if (marker) document.body.removeChild(marker);
    } else {
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
      // Ensure marker is removed on unmount if active
      const marker = document.querySelector('[data-radial-bloom-active-page-marker]');
      if (marker) document.body.removeChild(marker);
    };
  }, []);

  const orbContainerBaseClasses = "fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-in-out";
  const shiftClasses = isCollectiveShifting ? "translate-y-1 translate-x-0.5" : "translate-y-0 translate-x-0";

  return (
    <>
      <div className={cn(orbContainerBaseClasses, shiftClasses, "orb-button-container" )}>
        <Button
          aria-label="Contribute Mood"
          className={cn(
            "rounded-full w-16 h-16 md:w-20 md:h-20 p-0 shadow-soft flex items-center justify-center",
            "transition-all duration-300 ease-out transform hover:scale-105 active:scale-95",
            "animate-orb-pulse", // Added hypnotic pulse
            isInteracting ? "scale-90" : "", // Apply interaction scale only when interacting
            radialBloomActive ? "!scale-110" : "" // Ensure radial bloom scale overrides others
          )}
          style={{
            background: `linear-gradient(145deg, hsl(var(--primary-hsl)), hsl(var(--mood-hue), calc(var(--mood-saturation) * 0.8), calc(var(--mood-lightness) * 1.1)))`,
            boxShadow: `0 0 20px hsla(var(--primary-hsl), 0.7), 0 0 30px hsla(var(--mood-hue), calc(var(--mood-saturation) * 0.8), calc(var(--mood-lightness) * 1.1), 0.5)`,
          }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          onMouseLeave={radialBloomActive ? handleInteractionEnd : undefined} 
        >
          <Plus className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" strokeWidth={2} />
        </Button>
      </div>

      {showColorWell && (
        <div 
          className="fixed pointer-events-none z-50"
          style={{ left: tapPoint.x, top: tapPoint.y }}
          aria-hidden="true"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="orb-particle" 
              style={{
                '--particle-bg-color': moodToHslString(personalMood),
                '--particle-size': `${Math.random() * 6 + 3}px`,
                '--particle-anim-duration': `${Math.random() * 0.5 + 0.5}s`,
                '--particle-initial-rotate': `${Math.random() * 360}deg`,
                '--particle-initial-translateX': `${Math.random() * 50 - 25}px`, // Adjusted for more centered burst
                '--particle-final-rotate': `${Math.random() * 360}deg`,
                '--particle-final-translateX': `${(Math.random() - 0.5) * 2 * (Math.random() * 80 + 40)}px`, // More varied X direction
                '--particle-final-translateY': `${(Math.random() - 0.5) * 2 * (Math.random() * 80 + 40)}px`, // Added Y direction for swirl
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {radialBloomActive && (
         <div 
            className="orb-radial-bloom-effect fixed inset-0 pointer-events-none z-20"
            style={{
              '--tap-x': `${tapPoint.x}px`,
              '--tap-y': `${tapPoint.y}px`,
            }}
            aria-hidden="true"
          />
      )}
      
      <style jsx>{`
        .orb-particle {
          position: absolute;
          border-radius: 50%;
          background-color: var(--particle-bg-color);
          width: var(--particle-size);
          height: var(--particle-size);
          opacity: 0; 
          animation-name: color-well-particle;
          animation-duration: var(--particle-anim-duration);
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }

        @keyframes color-well-particle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--particle-initial-rotate)) translateX(var(--particle-initial-translateX)) translateY(0) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--particle-final-rotate)) translateX(var(--particle-final-translateX)) translateY(var(--particle-final-translateY)) scale(1);
          }
        }

        .orb-radial-bloom-effect {
          background: radial-gradient(circle at var(--tap-x) var(--tap-y), transparent 0%, hsla(var(--mood-hue), var(--mood-saturation), var(--mood-lightness), 0.3) 70%, hsla(var(--mood-hue), var(--mood-saturation), var(--mood-lightness), 0.5) 100%);
          animation: radial-bloom-effect-anim 1s ease-out forwards;
        }

        @keyframes radial-bloom-effect-anim { /* Renamed to avoid conflict if global has same name */
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(3); }
        }
      `}</style>

      <style jsx global>{`
        .radial-bloom-active-page > *:not(.orb-button-container):not([data-radix-portal]):not(.orb-radial-bloom-effect):not(.vignette-overlay):not(.noise-overlay):not(.fixed.inset-0.pointer-events-none) {
            opacity: 0.2 !important;
            filter: blur(24px) !important;
            transition: opacity 0.5s ease, filter 0.5s ease !important;
        }
      `}</style>
    </>
  );
};

export default OrbButton;
