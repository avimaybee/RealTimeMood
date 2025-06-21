
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

// Static mood for this page for a clean, stable background
const thoughtsPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "ThoughtsView",
  adjective: "Contemplative",
};


// Mock quotes for demonstration
const mockQuotes = [
  { id: 1, text: "There's a spark of creativity in the air today." },
  { id: 2, text: "Feeling a wave of calm wash over the world." },
  { id: 3, text: "A moment of shared peace. It's beautiful." },
  { id: 4, text: "Hope feels a little closer this evening." },
  { id: 5, text: "A collective sigh of relief, perhaps?" },
];


const CollectiveThoughtsPage = () => {
    useDynamicColors(thoughtsPageMood);
    const { toast } = useToast();
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleAddThoughtClick = () => {
        toast({
            title: "Feature Coming Soon",
            description: "The ability to share your thoughts will be added in a future update.",
        });
    };

    const advanceQuote = useCallback((direction: 'next' | 'prev') => {
        setIndex((prevIndex) => {
            if (direction === 'next') {
                return (prevIndex + 1) % mockQuotes.length;
            } else {
                return (prevIndex - 1 + mockQuotes.length) % mockQuotes.length;
            }
        });
    }, []);

    const resetInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            advanceQuote('next');
        }, 10000); // Auto-cycle every 10 seconds
    }, [advanceQuote]);
    
    useEffect(() => {
        resetInterval();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [resetInterval]);

    const handlePrevClick = () => {
        advanceQuote('prev');
        resetInterval();
    };

    const handleNextClick = () => {
        advanceQuote('next');
        resetInterval();
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 bg-background text-foreground">
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 mb-8">
                <Button asChild variant="outline" className="rounded-full px-4 py-2">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Live
                    </Link>
                </Button>
                <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-sm">
                     <MessageSquareQuote className="h-6 w-6 opacity-80" />
                     Collective Thoughts
                </h1>
                <div className="w-[148px]"></div> {/* Spacer to balance header */}
            </header>

            <main className="w-full flex-grow flex items-center justify-center">
                <Card className="w-full max-w-4xl bg-card shadow-lg rounded-2xl relative">
                    <CardContent className="p-8 md:p-12 min-h-[250px] flex items-center justify-center relative">
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevClick}
                            aria-label="Previous thought"
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-muted/50 hover:bg-muted"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        <div className="w-full text-center">
                           <AnimatePresence mode="wait">
                                <motion.p
                                    key={mockQuotes[index].id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="text-2xl md:text-3xl font-normal text-center"
                                >
                                    "{mockQuotes[index].text}"
                                </motion.p>
                           </AnimatePresence>
                        </div>
                        
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextClick}
                            aria-label="Next thought"
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-muted/50 hover:bg-muted"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="w-full flex justify-center py-8">
              <Button
                  variant="outline"
                  onClick={handleAddThoughtClick}
                  aria-label="Share your thought"
                  className="text-base px-6 py-3 rounded-full shadow-sm"
              >
                  <Plus className="mr-2 w-4 h-4" />
                  Share your thought
              </Button>
            </footer>
        </div>
    );
}

export default CollectiveThoughtsPage;
