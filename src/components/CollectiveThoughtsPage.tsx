
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote, ChevronLeft, ChevronRight, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mood, CommunityQuote } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { usePlatform } from '@/contexts/PlatformContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Static mood for this page for a clean, stable background
const thoughtsPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "ThoughtsView",
  adjective: "Contemplative",
};

// Default quote if none are found in the database
const defaultQuotes = [
    { id: 'default', text: "Be the first to share a thought.", status: 'approved' as const, submittedAt: new Date() },
];

const CollectiveThoughtsPage = () => {
    useDynamicColors(thoughtsPageMood);
    const { isIos, isAndroid } = usePlatform();
    const { toast } = useToast();
    const [quotes, setQuotes] = useState<(CommunityQuote & { id: string })[]>([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [index, setIndex] = useState(0);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSubmissionTimeRef = useRef<number>(0);


    const fetchQuotes = useCallback(async () => {
        setIsLoadingQuotes(true);
        setError(null);
        try {
            const quotesCollection = collection(db, 'communityQuotes');
            const q = query(
                quotesCollection,
                orderBy('submittedAt', 'desc'),
                limit(50) // Fetch a pool of 50 recent quotes
            );
            const querySnapshot = await getDocs(q);
            const fetchedQuotes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as CommunityQuote & { id: string }));

            if (fetchedQuotes.length > 0) {
                // Fisher-Yates shuffle algorithm to randomize the quotes
                for (let i = fetchedQuotes.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [fetchedQuotes[i], fetchedQuotes[j]] = [fetchedQuotes[j], fetchedQuotes[i]];
                }
                setQuotes(fetchedQuotes);
            } else {
                setQuotes(defaultQuotes);
            }
        } catch (err) {
            console.error("Error fetching quotes: ", err);
            setError("Could not load thoughts at this time.");
            setQuotes([{
                id: 'error',
                text: "Could not load thoughts. Please try again later.",
                status: 'approved',
                submittedAt: new Date()
            }]);
        } finally {
            setIsLoadingQuotes(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    useEffect(() => {
        if (isInputVisible) {
            textareaRef.current?.focus();
        }
    }, [isInputVisible]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const now = Date.now();
        const SUBMISSION_COOLDOWN = 60000; // 1 minute

        if (now - lastSubmissionTimeRef.current < SUBMISSION_COOLDOWN) {
            toast({
                title: "Patience, thinker.",
                description: `You can share another thought in a minute.`,
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const thoughtText = (formData.get('thought') as string)?.trim();

        if (!thoughtText || thoughtText.length === 0) {
            toast({
                title: "Empty Thought",
                description: "Please share a thought before submitting.",
                variant: "destructive"
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const quotesCollection = collection(db, 'communityQuotes');
            await addDoc(quotesCollection, {
                text: thoughtText,
                submittedAt: serverTimestamp(),
            });
            
            lastSubmissionTimeRef.current = now; // Update timestamp on success

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100); 
            }
            toast({
                title: "Thought Submitted",
                description: "Your thought has been shared with the collective.",
            });
            setIsInputVisible(false);
            // Re-fetch quotes to include the new one
            fetchQuotes();
        } catch (err) {
            console.error("Error submitting thought: ", err);
            toast({
                title: "Submission Failed",
                description: "Could not share your thought. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const advanceQuote = useCallback((direction: 'next' | 'prev') => {
        if (quotes.length === 0) return;
        setIndex((prevIndex) => {
            if (direction === 'next') {
                return (prevIndex + 1) % quotes.length;
            } else {
                return (prevIndex - 1 + quotes.length) % quotes.length;
            }
        });
    }, [quotes.length]);

    const resetInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            advanceQuote('next');
        }, 10000);
    }, [advanceQuote]);
    
    useEffect(() => {
        if (quotes.length > 1) {
            resetInterval();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [quotes.length, resetInterval]);

    const handlePrevClick = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); 
        }
        advanceQuote('prev');
        resetInterval();
    };

    const handleNextClick = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10); 
        }
        advanceQuote('next');
        resetInterval();
    };
    
    const currentQuote = quotes.length > 0 ? quotes[index] : null;

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
                    <Button asChild variant="outline" className="frosted-glass shadow-soft interactive-glow rounded-full w-10 h-10 p-0 md:w-auto md:px-4 md:flex-shrink-0">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
                            {!isAndroid && <span className="hidden md:inline md:ml-2">Back to Live</span>}
                        </Link>
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                         <MessageSquareQuote className="h-7 w-7 opacity-80" strokeWidth={isIos ? 1.5 : 2} />
                         Collective Thoughts
                    </h1>
                    <div className="w-10 md:w-auto md:flex-shrink-0 md:w-[148px]"></div>
                </header>

                <main className="w-full flex-grow flex items-center justify-center">
                    <Card className="w-full max-w-4xl frosted-glass shadow-soft rounded-2xl relative">
                        <CardContent className="p-8 md:p-12 min-h-[250px] flex items-center justify-center relative">
                            
                            {quotes.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrevClick}
                                    aria-label="Previous thought"
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/20 hover:bg-background/40"
                                >
                                    <ChevronLeft className="w-6 h-6" strokeWidth={isIos ? 1.5 : 2} />
                                </Button>
                            )}

                            <div className="w-full text-center px-8 sm:px-12">
                               {isLoadingQuotes ? (
                                   <div className="space-y-3">
                                       <Skeleton className="h-8 w-full" />
                                       <Skeleton className="h-8 w-3/4 mx-auto" />
                                   </div>
                               ) : (
                                   <AnimatePresence mode="wait">
                                        {currentQuote && (
                                            <motion.p
                                                key={currentQuote.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -15 }}
                                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                                className="text-2xl md:text-3xl font-normal text-center text-shadow-pop"
                                            >
                                                "{currentQuote.text}"
                                            </motion.p>
                                        )}
                                   </AnimatePresence>
                               )}
                            </div>
                            
                            {quotes.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNextClick}
                                    aria-label="Next thought"
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-background/20 hover:bg-background/40"
                                >
                                    <ChevronRight className="w-6 h-6" strokeWidth={isIos ? 1.5 : 2} />
                                </Button>
                            )}
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
                    transition={{ type: 'tween', duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    initial={false}
                    style={{ cursor: isSubmitting ? 'not-allowed' : (isInputVisible ? 'default' : 'pointer') }}
                  >
                    {/* Button Content - visible when collapsed */}
                    <motion.div
                      className="absolute flex items-center justify-center"
                      animate={{ opacity: isInputVisible ? 0 : 1, transition: { duration: 0.2 } }}
                      style={{ pointerEvents: isInputVisible ? 'none' : 'auto' }}
                    >
                      <Plus className="mr-2 w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />
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
                        className="flex-grow bg-transparent border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors resize-none h-10 px-2 leading-10"
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
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="rounded-full flex-shrink-0 w-10 h-10"
                        onClick={() => setIsInputVisible(false)}
                        disabled={isSubmitting}
                      >
                        <X className="w-5 h-5" strokeWidth={isIos ? 1.5 : 2} />
                      </Button>
                    </motion.div>
                  </motion.form>
                </footer>
            </motion.div>
        </>
    );
}

export default CollectiveThoughtsPage;
