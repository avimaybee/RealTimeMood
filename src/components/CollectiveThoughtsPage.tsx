
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { useToast } from '@/hooks/use-toast';
import { useMood } from '@/contexts/MoodContext';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock quotes for demonstration
const mockQuotes = [
  { id: 1, text: "There's a spark of creativity in the air today." },
  { id: 2, text: "Feeling a wave of calm wash over the world." },
  { id: 3, text: "A moment of shared peace. It's beautiful." },
  { id: 4, text: "Hope feels a little closer this evening." },
  { id: 5, text: "A collective sigh of relief, perhaps?" },
];


const CollectiveThoughtsPage = () => {
    useMood(); // Initialize context to ensure background hooks work
    const { toast } = useToast();
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleAddThoughtClick = () => {
        toast({
            title: "Feature Coming Soon",
            description: "The ability to share your thoughts will be added in a future update.",
        });
    };

    // Using useCallback to prevent re-creation on every render
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
    
    // Start and manage the interval
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
        <>
            <div className="fixed inset-0 brightness-80 blur-sm -z-10">
                <DynamicBackground />
                <div className="vignette-overlay" />
                <div className="noise-overlay" />
                <LivingParticles />
            </div>

            <div className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-6 z-0">
                <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 mb-6">
                    <Button asChild variant="outline" className="frosted-glass shadow-soft interactive-glow" style={{width: '150px'}}>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Live
                        </Link>
                    </Button>
                    <div className="p-1 frosted-glass rounded-full shadow-soft flex items-center justify-center group h-11 md:h-12 px-4 md:px-6">
                         <MessageSquareQuote className="h-6 w-6 text-foreground opacity-80 group-hover:opacity-100 transition-opacity" />
                         <span className="ml-3 text-lg md:text-xl font-medium text-foreground opacity-90 text-shadow-pop transition-opacity group-hover:opacity-100">
                            Collective Thoughts
                         </span>
                    </div>
                    <div style={{width: '150px'}}></div> {/* Spacer */}
                </header>

                <main className="w-full flex-grow flex items-center justify-center text-center text-foreground px-4">
                    <div className="relative w-full max-w-2xl flex items-center justify-center">
                        {/* Manual Navigation: Left */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevClick}
                            aria-label="Previous thought"
                            className="absolute left-0 -translate-x-full md:-translate-x-1/2 rounded-full w-12 h-12 frosted-glass shadow-soft interactive-glow"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        {/* Quote Display */}
                        <div className="frosted-glass shadow-soft rounded-2xl w-full min-h-[250px] flex items-center justify-center p-8 overflow-hidden">
                           <AnimatePresence mode="wait">
                                <motion.p
                                    key={mockQuotes[index].id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="text-3xl md:text-4xl font-light text-shadow-pop text-center font-headline"
                                >
                                    "{mockQuotes[index].text}"
                                </motion.p>
                           </AnimatePresence>
                        </div>
                        
                        {/* Manual Navigation: Right */}
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextClick}
                            aria-label="Next thought"
                            className="absolute right-0 translate-x-full md:translate-x-1/2 rounded-full w-12 h-12 frosted-glass shadow-soft interactive-glow"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </main>

                <div className="fixed bottom-10 z-40">
                     <Button
                        variant="default"
                        size="icon"
                        onClick={handleAddThoughtClick}
                        aria-label="Share your thought"
                        className="rounded-full w-20 h-20 shadow-soft interactive-glow"
                     >
                         <Plus className="w-10 h-10" />
                     </Button>
                </div>
            </div>
        </>
    );
}

export default CollectiveThoughtsPage;
