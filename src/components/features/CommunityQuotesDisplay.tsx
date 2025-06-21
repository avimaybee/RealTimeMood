
"use client";
import React, { useEffect, useState } from 'react';
import type { Quote } from '@/types';

const mockQuotes: Quote[] = [
  { id: '1', text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { id: '2', text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { id: '3', text: "Kindness is a language which the deaf can hear and the blind can see.", author: "Mark Twain" },
  { id: '4', text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
];

const CommunityQuotesDisplay: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNewQuote = () => {
      setIsVisible(false); // Fade out old quote
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * mockQuotes.length);
        setCurrentQuote(mockQuotes[randomIndex]);
        setIsVisible(true); // Fade in new quote
      }, 1000); // Delay for fade out/in transition
    };

    showNewQuote(); // Initial quote
    const interval = setInterval(showNewQuote, 15000); // Change quote every 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!currentQuote) return null;

  const quoteStyle: React.CSSProperties = {
    color: `hsl(var(--foreground-hsl))`,
    transition: 'opacity 1s ease-in-out',
    opacity: isVisible ? 1 : 0,
  };

  return (
    <div className="my-4 md:my-8 p-4 text-center max-w-xl mx-auto">
      <blockquote style={quoteStyle}>
        <p className="text-lg md:text-xl italic text-shadow-pop">"{currentQuote.text}"</p>
        <footer className="mt-2 text-sm md:text-base opacity-70 text-shadow-pop">- {currentQuote.author}</footer>
      </blockquote>
    </div>
  );
};

export default CommunityQuotesDisplay;
