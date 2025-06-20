
"use client";
import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 50, playSound: boolean = false) => {
  const [displayedText, setDisplayedText] = useState('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (playSound && typeof window !== 'undefined') {
      // A very subtle sound. You might need a short .wav or .mp3 file for a better effect.
      // This is a programmatic placeholder for a real sound.
      // For simplicity, we're not actually playing a sound here to avoid needing an asset.
      // If you have a sound file, you'd load it here:
      // const typewriterAudio = new Audio('/sounds/typewriter-key.wav');
      // setAudio(typewriterAudio);
    }
  }, [playSound]);

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          // audio?.play().catch(e => console.warn("Audio play failed", e)); // Play sound if available
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }
  }, [text, speed, audio]);

  return displayedText;
};
