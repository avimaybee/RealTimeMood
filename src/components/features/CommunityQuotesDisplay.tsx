
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
    // Cycle quote every 10 seconds (8s display, plus transition times)
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % mockQuotes.length);
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  const currentQuote = mockQuotes[index];

  const quoteVariants = {
    initial: { opacity: 0.2, filter: 'blur(4px)', y: 5 },
    animate: {
      opacity: 0.8,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
      opacity: 0.2,
      filter: 'blur(2px)',
      y: -5,
      transition: { duration: 0.5, ease: 'easeIn' },
    },
  };
  
  const containerVariants = {
    initial: { y: 0 },
    animate: {
        y: [5, -5], // +/- 5px float
        transition: {
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
        }
    }
  };

  return (
    <motion.div 
        className="fixed bottom-20 md:bottom-24 left-4 md:left-8 z-20 max-w-xs md:max-w-sm pointer-events-none"
        variants={containerVariants}
        initial="initial"
        animate="animate"
    >
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={currentQuote.id}
          variants={quoteVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="text-shadow-pop"
        >
            <p className="text-base md:text-lg italic">"{currentQuote.text}"</p>
            <footer className="mt-1 text-sm opacity-70">- Anonymous</footer>
        </motion.blockquote>
      </AnimatePresence>
    </motion.div>
  );
};

export default CommunityQuotesDisplay;
