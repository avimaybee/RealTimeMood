
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';

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
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 0.7,
      y: 0,
      transition: { duration: 1, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 1, ease: 'easeIn' },
    },
  };
  
  return (
    // Container ensures layout space is reserved, preventing jumps.
    <div className="relative w-full max-w-3xl h-28 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={currentQuote.id}
          variants={quoteVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="text-center"
        >
            <p className="text-xl md:text-2xl text-shadow-pop">"{currentQuote.text}"</p>
            <footer className="mt-2 text-base opacity-80 text-shadow-pop">- Anonymous</footer>
        </motion.blockquote>
      </AnimatePresence>
    </div>
  );
};

export default CommunityQuotesDisplay;
