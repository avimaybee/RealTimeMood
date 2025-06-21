
"use client";
import React, { useEffect, useRef } from 'react';
import { useMood } from '@/contexts/MoodContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
  life: number;
  maxLife: number;
  baseSpeed: number;
  pushX: number;
  pushY: number;
  pushDecay: number;
  nodeRef: React.RefObject<HTMLDivElement>;
}

const NUM_PARTICLES = 250;

const LivingParticles: React.FC = () => {
  const { appState, isCollectiveShifting, lastContributionTime, lastContributionPosition } = useMood();
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastRippleTimeRef = useRef<number | null>(null);
  const lastShiftStateRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // This ref gives the animation loop a "live window" into the latest state from the context.
  const latestStateRef = useRef({ appState, isCollectiveShifting, lastContributionTime, lastContributionPosition });

  // Keep the ref updated with the latest state on every render.
  useEffect(() => {
    latestStateRef.current = { appState, isCollectiveShifting, lastContributionTime, lastContributionPosition };
  }, [appState, isCollectiveShifting, lastContributionTime, lastContributionPosition]);


  const resetParticle = (p: Partial<Particle>, width: number, height: number, emanateFromCenter: boolean): Particle => {
    // Use the latest state for resetting particles
    const { hue, saturation, lightness } = latestStateRef.current.appState.currentMood;
    const maxLife = 200 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = 0.5 + Math.random() * 0.5;

    let x, y;
    if (emanateFromCenter) {
      const radius = Math.random() * 50;
      x = width / 2 + Math.cos(angle) * radius;
      y = height / 2 + Math.sin(angle) * radius;
    } else {
      x = Math.random() * width;
      y = height / 2 + (Math.random() - 0.5) * height * 0.5; // Spawn more centrally
    }

    return {
      ...p,
      id: p.id!,
      x,
      y,
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed,
      size: 1 + Math.random() * 2,
      hue,
      saturation,
      lightness,
      opacity: 0.4 + Math.random() * 0.5,
      life: 0,
      maxLife,
      baseSpeed,
      pushX: 0,
      pushY: 0,
      pushDecay: 0.95,
      nodeRef: p.nodeRef || React.createRef<HTMLDivElement>(),
    };
  };

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    particlesRef.current = Array.from({ length: NUM_PARTICLES }).map((_, i) =>
      resetParticle({ id: i }, width, height, true)
    );

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (!containerRef.current) return;

      // Access the live state inside the animation loop via the ref.
      const {
        appState: latestAppState,
        isCollectiveShifting: latestIsCollectiveShifting,
        lastContributionTime: latestLastContributionTime,
        lastContributionPosition: latestLastContributionPosition,
      } = latestStateRef.current;

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const { currentMood } = latestAppState;

      const rippleJustFired = latestLastContributionTime !== null && latestLastContributionTime !== lastRippleTimeRef.current;
      if (rippleJustFired) {
        const rippleOrigin = latestLastContributionPosition || { x: centerX, y: centerY };
        particlesRef.current.forEach(p => {
          const dx = p.x - rippleOrigin.x;
          const dy = p.y - rippleOrigin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400 && dist > 0) { // Ripple has a 400px radius of effect
            const angle = Math.atan2(dy, dx);
            const force = (1 - dist / 400) * 4; // Force is stronger closer to the origin
            p.pushX += Math.cos(angle) * force;
            p.pushY += Math.sin(angle) * force;
          }
        });
        lastRippleTimeRef.current = latestLastContributionTime;
      }

      const shockwaveJustFired = latestIsCollectiveShifting && !lastShiftStateRef.current;
      if (shockwaveJustFired) {
        particlesRef.current.forEach(p => {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const angle = Math.atan2(dy, dx);
          const force = 8 + Math.random() * 4; // Stronger, more chaotic force
          p.pushX += Math.cos(angle) * force;
          p.pushY += Math.sin(angle) * force;
        });
      }
      lastShiftStateRef.current = latestIsCollectiveShifting;

      particlesRef.current.forEach(p => {
        // Seamlessly transition color
        const hueDiff = (currentMood.hue - p.hue + 360) % 360;
        p.hue += (hueDiff > 180 ? hueDiff - 360 : hueDiff) * 0.05;
        p.saturation += (currentMood.saturation - p.saturation) * 0.05;
        p.lightness += (currentMood.lightness - p.lightness) * 0.05;

        // Apply mood-based behavior
        const speed = p.baseSpeed * (latestIsCollectiveShifting ? 2.5 : 1);
        const angle = Math.atan2(p.vy, p.vx);
        let angleChange = 0;
        
        if (currentMood.adjective === 'Anxious' || (latestIsCollectiveShifting && p.life % 2 === 0)) {
          angleChange = (Math.random() - 0.5) * 0.5; // Erratic
        } else if (currentMood.adjective === 'Joyful') {
          angleChange = Math.sin(p.life / 20) * 0.1; // Arcing
        } else {
          angleChange = (Math.random() - 0.5) * 0.1; // Gentle brownian motion
        }

        const newAngle = angle + angleChange;
        p.vx = Math.cos(newAngle) * speed;
        p.vy = Math.sin(newAngle) * speed;

        // Gentle pull towards center if they get too far
        const dxCenter = p.x - centerX;
        const dyCenter = p.y - centerY;
        const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        if (distFromCenter > Math.min(width, height) * 0.6) {
             p.vx -= (dxCenter / distFromCenter) * 0.02;
             p.vy -= (dyCenter / distFromCenter) * 0.02;
        }

        // Apply and decay push forces
        p.vx += p.pushX;
        p.vy += p.pushY;
        p.pushX *= p.pushDecay;
        p.pushY *= p.pushDecay;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Reset particle if it's dead or off-screen
        if (p.life > p.maxLife || p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
          Object.assign(p, resetParticle(p, width, height, true));
        }

        // Update the particle's style on the DOM
        const node = p.nodeRef.current;
        if (node) {
          const isPushed = Math.abs(p.pushX) > 0.5 || Math.abs(p.pushY) > 0.5;
          node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px) scale(${isPushed ? 1.2 : 1})`;
          node.style.width = `${p.size}px`;
          node.style.height = `${p.size}px`;
          node.style.backgroundColor = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.opacity})`;
          node.style.filter = `brightness(${isPushed ? 1.5 : 1})`;
          node.style.transition = 'transform 0.1s ease-out, filter 0.1s ease-out'; // For scale/brightness flash
        }
      });
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-2">
      {particlesRef.current.map(p => (
        <div
          key={p.id}
          ref={p.nodeRef}
          className="absolute rounded-full"
          style={{
            top: 0,
            left: 0,
          }}
        />
      ))}
    </div>
  );
};

export default LivingParticles;
