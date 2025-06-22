
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote, ChevronLeft, ChevronRight, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mood } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import LivingParticles from '@/components/ui-fx/LivingParticles';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isInputVisible) {
            textareaRef.current?.focus();
        }
    }, [isInputVisible]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const thought = formData.get('thought');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (thought && typeof thought === 'string' && thought.trim().length > 0) {
            // --- Haptic and Audio Feedback on Success ---
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100); // Confirming haptic buzz
            }
            // TODO: Play a distinct, soft "ding" sound for success

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
        setIsSubmitting(false);
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
            // --- Audio Feedback for Auto-Cycle ---
            // TODO: Play a very subtle "whisper" or "chime" sound
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
        // --- Haptic and Audio Feedback for Manual Navigation ---
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Light haptic tap
        }
        // TODO: Play a soft click sound
        advanceQuote('prev');
        resetInterval();
    };

    const handleNextClick = () => {
        // --- Haptic and Audio Feedback for Manual Navigation ---
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); // Light haptic tap
        }
        // TODO: Play a soft click sound
        advanceQuote('next');
        resetInterval();
    };

    return (
        <>
            <div className="vignette-overlay" />
            <div className="noise-overlay" />
            <LivingParticles />
            <motion.div
                className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 bg-transparent text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
                <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 mb-8">
                    <Button asChild variant="outline" className="frosted-glass shadow-soft interactive-glow rounded-full w-10 h-10 p-0 md:w-auto md:px-4">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden md:inline md:ml-2">Back to Live</span>
                        </Link>
                    </Button>
                    <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-3 frosted-glass shadow-soft px-6 py-3 rounded-full">
                         <MessageSquareQuote className="h-6 w-6 opacity-80" />
                         Collective Thoughts
                    </h1>
                    <div className="w-10 md:w-auto md:min-w-[148px]"></div> {/* Spacer to balance header */}
                </header>

                <main className="w-full flex-grow flex items-center justify-center">
                    <Card className="w-full max-w-4xl frosted-glass shadow-soft rounded-2xl relative">
                        <CardContent className="p-8 md:p-12 min-h-[250px] flex items-center justify-center relative">
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevClick}
                                aria-label="Previous thought"
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/20 hover:bg-background/40 interactive-glow"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>

                            <div className="w-full text-center px-8 sm:px-12">
                               <AnimatePresence mode="wait">
                                    <motion.p
                                        key={mockQuotes[index].id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="text-2xl md:text-3xl font-normal text-center text-shadow-pop"
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
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/20 hover:bg-background/40 interactive-glow"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                
                <footer className="w-full max-w-2xl mx-auto flex justify-center items-center py-4 mt-8">
                  <motion.form
                    onSubmit={handleFormSubmit}
                    onClick={() => {
                        if (!isInputVisible && !isSubmitting) setIsInputVisible(true);
                    }}
                    className="relative flex items-center justify-center frosted-glass shadow-soft overflow-hidden"
                    animate={{
                      width: isInputVisible ? '100%' : '220px',
                      height: '56px',
                      borderRadius: isInputVisible ? '1rem' : '9999px',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                    initial={false}
                    style={{ cursor: isSubmitting ? 'not-allowed' : (isInputVisible ? 'default' : 'pointer') }}
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
                        disabled={isSubmitting}
                      />
                      <Button type="submit" size="icon" className="rounded-full flex-shrink-0 w-10 h-10 ml-2" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="rounded-full flex-shrink-0 w-10 h-10"
                        onClick={() => setIsInputVisible(false)}
                        disabled={isSubmitting}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </motion.form>
                </footer>
            </motion.div>
        </>
    );
}

export default CollectiveThoughtsPage;
