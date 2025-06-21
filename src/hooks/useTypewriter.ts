"use client";
import { useState, useEffect } from 'react';

// Note: The `playSound` feature is a placeholder. To enable it, you would need
// to provide an audio file and uncomment the audio logic.
export const useTypewriter = (text: string, speed: number = 50, playSound: boolean = false) => {
  const [displayedText, setDisplayedText] = useState('');
  // const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // useEffect(() => {
  //   if (playSound && typeof window !== 'undefined') {
  //     // const typewriterAudio = new Audio('/sounds/typewriter-key.wav');
  //     // setAudio(typewriterAudio);
  //   }
  // }, [playSound]);

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          // audio?.play().catch(e => console.warn("Audio play failed", e));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }
  }, [text, speed]); // Removed audio from dependencies

  return displayedText;
};
