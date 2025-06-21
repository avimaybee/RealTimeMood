
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mood } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDynamicColors } from '@/hooks/useDynamicColors';

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
    const [isInputVisible, setIsInputVisible] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isInputVisible) {
            textareaRef.current?.focus();
        }
    }, [isInputVisible]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const thought = formData.get('thought');

        if (thought && typeof thought === 'string' && thought.trim().length > 0) {
            toast({
                title: "Thought Submitted",
                description: `"${thought}" has been sent for review.`,
            });
            setIsInputVisible(false);
        } else {
             toast({
                title: "Empty Thought",
                description: "Please share a thought before submitting.",
                variant: "destructive"
            });
        }
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
        }, 10000);
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
            
            <footer className="w-full max-w-2xl mx-auto flex justify-center items-center py-8 h-24">
              <motion.form
                onSubmit={handleFormSubmit}
                onClick={() => {
                    if (!isInputVisible) setIsInputVisible(true);
                }}
                className="relative flex items-center justify-center bg-card shadow-md overflow-hidden cursor-pointer"
                animate={{
                  width: isInputVisible ? '100%' : '220px',
                  height: '56px',
                  borderRadius: '9999px',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                initial={false}
              >
                {/* Button Content - visible when collapsed */}
                <motion.div
                  className="absolute flex items-center justify-center"
                  animate={{ opacity: isInputVisible ? 0 : 1, transition: { duration: 0.2 } }}
                  style={{ pointerEvents: isInputVisible ? 'none' : 'auto' }}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  <span className="text-base font-medium">Share your thought</span>
                </motion.div>

                {/* Input Content - visible when expanded */}
                <motion.div
                  className="flex items-center w-full px-2"
                  animate={{ opacity: isInputVisible ? 1 : 0, transition: { delay: isInputVisible ? 0.15 : 0, duration: 0.2 } }}
                  style={{ pointerEvents: isInputVisible ? 'auto' : 'none' }}
                  onClick={(e) => e.stopPropagation()} // Prevent form click from closing when clicking inside input area
                >
                  <Textarea
                    ref={textareaRef}
                    name="thought"
                    placeholder="Share a thought..."
                    className="flex-grow bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none h-10 px-2 leading-10"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            (e.currentTarget.form as HTMLFormElement).requestSubmit();
                        }
                    }}
                  />
                  <Button type="submit" size="icon" className="rounded-full flex-shrink-0 w-10 h-10 ml-2">
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full flex-shrink-0 w-10 h-10"
                    onClick={() => setIsInputVisible(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.form>
            </footer>
        </div>
    );
}

export default CollectiveThoughtsPage;
