
"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, Send, X, Loader2 } from 'lucide-react';
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
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Static mood for this page for a clean, stable background
const thoughtsPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "ThoughtsView",
  adjective: "Contemplative",
};

// Default quote if none are found in the database
const defaultQuote = { id: 'default', text: "Be the first to share a thought.", status: 'approved' as const, submittedAt: new Date() };

const CollectiveThoughtsPage = () => {
    useDynamicColors(thoughtsPageMood);
    const { isIos } = usePlatform();
    const { toast } = useToast();
    const [quotes, setQuotes] = useState<(CommunityQuote & { id: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSubmissionTimeRef = useRef<number>(0);

    // Real-time listener for thoughts
    useEffect(() => {
        setIsLoading(true);
        const quotesCollection = collection(db, 'communityQuotes');
        const q = query(
            quotesCollection,
            orderBy('submittedAt', 'desc'),
            limit(50) // Listen to the 50 most recent thoughts
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQuotes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as CommunityQuote & { id: string }));
            
            setQuotes(fetchedQuotes);
            if (isLoading) setIsLoading(false);
            if (error) setError(null);

        }, (err) => {
            console.error("Error fetching quotes: ", err);
            setError("Could not load thoughts at this time.");
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            await addDoc(collection(db, 'communityQuotes'), {
                text: thoughtText,
                submittedAt: serverTimestamp(),
            });
            
            lastSubmissionTimeRef.current = now;

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100); 
            }
            toast({
                title: "Thought Submitted",
                description: "Your thought has been shared with the collective.",
            });
            setIsInputVisible(false);
            // No need to manually refetch; the onSnapshot listener will handle it.
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
    
    const thoughtBubbleVariants = {
        initial: { opacity: 0, y: -20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
    };

    return (
        <>
            <div className="vignette-overlay" />
            <div className="noise-overlay" />
            <LivingParticles />

            <motion.header
              className={cn(
                "fixed top-4 inset-x-0 mx-auto z-30",
                "w-[calc(100%-2rem)] max-w-lg",
                "flex items-center justify-between",
                "h-12 px-3",
                "frosted-glass rounded-2xl shadow-soft"
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Button asChild variant="ghost" size="icon" className="interactive-glow -ml-2">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
                  <span className="sr-only">Back to Live</span>
                </Link>
              </Button>
              <h1 className="text-base font-medium text-center truncate px-2">
                Collective Thoughts
              </h1>
              <div className="w-8 h-8" />
            </motion.header>

            <div className="h-full w-full flex flex-col pt-20 pb-24">
                <AnimatePresence>
                    <motion.main
                        className="w-full max-w-2xl mx-auto flex-grow flex flex-col overflow-hidden px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : quotes.length > 0 ? (
                            <ScrollArea className="h-full pr-4 -mr-4">
                                <motion.ul className="space-y-4" layout>
                                    <AnimatePresence>
                                        {quotes.map((quote) => (
                                            <motion.li
                                                key={quote.id}
                                                variants={thoughtBubbleVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                layout
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            >
                                                <Card className="frosted-glass shadow-soft rounded-2xl">
                                                    <CardContent className="p-4 md:p-6">
                                                        <p className="text-base md:text-lg text-foreground/90">
                                                            {quote.text}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </motion.ul>
                            </ScrollArea>
                        ) : (
                             <div className="flex-grow flex items-center justify-center">
                                <p className="text-foreground/70">Be the first to share a thought.</p>
                            </div>
                        )}
                    </motion.main>
                </AnimatePresence>
            </div>
                
            <footer className="fixed bottom-4 inset-x-0 mx-auto z-20 w-[calc(100%-2rem)] max-w-lg">
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
                <motion.div
                    className="absolute flex items-center justify-center"
                    animate={{ opacity: isInputVisible ? 0 : 1, transition: { duration: 0.2 } }}
                    style={{ pointerEvents: isInputVisible ? 'none' : 'auto' }}
                >
                    <Plus className="mr-2 w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />
                    <span className="text-base font-medium">Share your thought</span>
                </motion.div>

                <motion.div
                    className="flex items-center w-full px-2"
                    animate={{ opacity: isInputVisible ? 1 : 0, transition: { delay: isInputVisible ? 0.15 : 0, duration: 0.2 } }}
                    style={{ pointerEvents: isInputVisible ? 'auto' : 'none' }}
                    onClick={(e) => e.stopPropagation()}
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
        </>
    );
}

export default CollectiveThoughtsPage;
