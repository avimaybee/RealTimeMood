
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
  baseOpacity: number;
  life: number;
  maxLife: number;
  baseSpeed: number;
  pushX: number;
  pushY: number;
  pushDecay: number;
  nodeRef: React.RefObject<HTMLDivElement>;
  isNew?: boolean;
}

const NUM_PARTICLES = 50; // Increased particle count for more atmosphere

const LivingParticles: React.FC = () => {
  const { currentMood, isCollectiveShifting, lastContributionTime, lastContributionPosition, previewMood } = useMood();
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastRippleTimeRef = useRef<number | null>(null);
  const lastShiftStateRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const latestStateRef = useRef({ currentMood, isCollectiveShifting, lastContributionTime, lastContributionPosition, previewMood });

  useEffect(() => {
    latestStateRef.current = { currentMood, isCollectiveShifting, lastContributionTime, lastContributionPosition, previewMood };
  }, [currentMood, isCollectiveShifting, lastContributionTime, lastContributionPosition, previewMood]);

  // Calculate mood-based particle behavior
  const getMoodModifiers = (mood: typeof currentMood) => {
    // Anxious = fast, erratic; Joyful = bouncy; Calm = slow, floaty
    const hue = mood.hue;

    // Speed multiplier based on mood
    let speedMult = 1;
    let sizeBoost = 0;
    let opacityBoost = 0;

    if (hue < 30 || hue >= 300) { // Anxious/red range
      speedMult = 1.5;
      sizeBoost = 0.5;
      opacityBoost = 0.1;
    } else if (hue >= 30 && hue < 90) { // Joyful/yellow range
      speedMult = 1.3;
      sizeBoost = 1;
      opacityBoost = 0.15;
    } else if (hue >= 90 && hue < 180) { // Calm/green-cyan range
      speedMult = 0.7;
      sizeBoost = 0;
      opacityBoost = 0;
    } else { // Blue/purple range - contemplative
      speedMult = 0.9;
      sizeBoost = 0.2;
      opacityBoost = 0.05;
    }

    return { speedMult, sizeBoost, opacityBoost };
  };

  const resetParticle = (p: Partial<Particle>, width: number, height: number, emanateFromCenter: boolean): Particle => {
    const maxLife = 300 + Math.random() * 300; // Longer life for smoother fades
    const angle = Math.random() * Math.PI * 2;
    const baseSpeed = 0.3 + Math.random() * 0.4;

    let x, y;
    if (emanateFromCenter) {
      const radius = Math.random() * Math.min(width, height) * 0.3;
      x = width / 2 + Math.cos(angle) * radius;
      y = height / 2 + Math.sin(angle) * radius;
    } else {
      x = Math.random() * width;
      y = height / 2 + (Math.random() - 0.5) * height * 0.9;
    }

    return {
      ...p,
      id: p.id!,
      x,
      y,
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed,
      size: 1.5 + Math.random() * 2.5,
      baseOpacity: 0.25 + Math.random() * 0.4,
      life: 0,
      maxLife,
      baseSpeed,
      pushX: 0,
      pushY: 0,
      pushDecay: 0.95,
      nodeRef: p.nodeRef || React.createRef<HTMLDivElement>(),
      isNew: true,
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

      const {
        currentMood: latestCurrentMood,
        isCollectiveShifting: latestIsCollectiveShifting,
        lastContributionTime: latestLastContributionTime,
        lastContributionPosition: latestLastContributionPosition,
        previewMood: latestPreviewMood,
      } = latestStateRef.current;

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      const moodForBehavior = latestPreviewMood || latestCurrentMood;
      const { speedMult, sizeBoost, opacityBoost } = getMoodModifiers(moodForBehavior);

      // Ripple effect on contribution
      const rippleJustFired = latestLastContributionTime !== null && latestLastContributionTime !== lastRippleTimeRef.current;
      if (rippleJustFired) {
        const rippleOrigin = latestLastContributionPosition || { x: centerX, y: centerY };
        particlesRef.current.forEach(p => {
          const dx = p.x - rippleOrigin.x;
          const dy = p.y - rippleOrigin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 500 && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - dist / 500) * 18;
            p.pushX += Math.cos(angle) * force;
            p.pushY += Math.sin(angle) * force;
          }
        });
        lastRippleTimeRef.current = latestLastContributionTime;
      }

      // Shockwave on collective shift
      const shockwaveJustFired = latestIsCollectiveShifting && !lastShiftStateRef.current;
      if (shockwaveJustFired) {
        particlesRef.current.forEach(p => {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const angle = Math.atan2(dy, dx);
          const force = 10 + Math.random() * 6;
          p.pushX += Math.cos(angle) * force;
          p.pushY += Math.sin(angle) * force;
        });
      }
      lastShiftStateRef.current = latestIsCollectiveShifting;

      particlesRef.current.forEach(p => {
        // Mood-based speed
        const speed = p.baseSpeed * speedMult * (latestIsCollectiveShifting ? 2.5 : 1);
        const angle = Math.atan2(p.vy, p.vx);
        let angleChange = 0;

        // Mood-based movement pattern
        if (moodForBehavior.adjective === 'Anxious' || latestIsCollectiveShifting) {
          angleChange = (Math.random() - 0.5) * 0.6; // Erratic
        } else if (moodForBehavior.adjective === 'Joyful') {
          angleChange = Math.sin(p.life / 15) * 0.12; // Bouncy arcing
        } else {
          angleChange = (Math.random() - 0.5) * 0.08; // Gentle drift
        }

        const newAngle = angle + angleChange;
        p.vx = Math.cos(newAngle) * speed;
        p.vy = Math.sin(newAngle) * speed;

        // Gentle pull towards center if too far
        const dxCenter = p.x - centerX;
        const dyCenter = p.y - centerY;
        const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        if (distFromCenter > Math.min(width, height) * 0.55) {
          const pullForce = 0.008;
          p.vx -= (dxCenter / distFromCenter) * pullForce;
          p.vy -= (dyCenter / distFromCenter) * pullForce;
        }

        // Apply push forces
        p.vx += p.pushX;
        p.vy += p.pushY;
        p.pushX *= p.pushDecay;
        p.pushY *= p.pushDecay;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Calculate fade-in and fade-out opacity
        const fadeInDuration = 60; // frames to fade in
        const fadeOutStart = p.maxLife - 80; // when to start fading out
        let fadeMultiplier = 1;

        if (p.life < fadeInDuration) {
          fadeMultiplier = p.life / fadeInDuration; // Fade in
        } else if (p.life > fadeOutStart) {
          fadeMultiplier = (p.maxLife - p.life) / (p.maxLife - fadeOutStart); // Fade out
        }

        const currentOpacity = (p.baseOpacity + opacityBoost) * fadeMultiplier;

        // Reset particle if dead or off-screen
        if (p.life > p.maxLife || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) {
          Object.assign(p, resetParticle(p, width, height, false));
        }

        // Update DOM
        const node = p.nodeRef.current;
        if (node) {
          const moodForColor = latestPreviewMood || latestCurrentMood;
          const particleSize = p.size + sizeBoost;
          const particleColor = `hsla(${moodForColor.hue}, 85%, 70%, ${currentOpacity})`;

          if (p.isNew || p.life % 30 === 0) { // Update color periodically
            node.style.width = `${particleSize}px`;
            node.style.height = `${particleSize}px`;
            node.style.backgroundColor = particleColor;
            node.style.boxShadow = currentOpacity > 0.2 ? `0 0 ${4 + sizeBoost * 2}px ${particleColor}` : 'none';
            p.isNew = false;
          }

          node.style.opacity = String(currentOpacity);
          const isPushed = Math.abs(p.pushX) > 0.5 || Math.abs(p.pushY) > 0.5;
          node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0px) scale(${isPushed ? 1.3 : 1})`;
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
          className="absolute rounded-full transition-opacity duration-200"
          style={{
            top: 0,
            left: 0,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

export default LivingParticles;

