
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';
import { Separator } from '../ui/separator';

// More anonymous, mood-related quotes
const mockQuotes: Quote[] = [
  { id: '1', text: "Feeling a wave of calm wash over the world today.", author: "User1" },
  { id: '2', text: "There's a spark of creativity in the air.", author: "User2" },
  { id: '3', text: "A moment of shared peace. It's beautiful.", author: "User3" },
  { id: '4', text: "The energy is electric right now!", author: "User4" },
];

const CommunityQuotesDisplay: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Cycle quote every 8 seconds
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % mockQuotes.length);
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  const currentQuote = mockQuotes[index];

  const quoteVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.8, ease: 'easeIn' },
    },
  };
  
  return (
    <div className="w-full flex flex-col items-center gap-2 text-center">
        <Separator className="w-1/2" />
        <h4 className="text-sm font-semibold text-foreground/80 text-shadow-pop">Community Reflection</h4>
        
        {/* Container to give animating quote a fixed height and prevent layout shifts */}
        <div className="relative w-full h-24 flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.blockquote
                key={currentQuote.id}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute"
                >
                    <p className="text-base font-medium text-shadow-pop">"{currentQuote.text}"</p>
                    <footer className="mt-1 text-xs opacity-70">- Anonymous</footer>
                </motion.blockquote>
            </AnimatePresence>
        </div>
    </div>
  );
};

export default CommunityQuotesDisplay;
