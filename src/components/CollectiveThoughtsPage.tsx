
"use client";
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mood, CommunityQuote } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { usePlatform } from '@/contexts/PlatformContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp, limitToLast } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';

const CollectiveThoughtsPage = () => {
    const { isIos } = usePlatform();
    const { toast } = useToast();
    const [quotes, setQuotes] = useState<(CommunityQuote & { id: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thoughtValue, setThoughtValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSubmissionTimeRef = useRef<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [newestQuoteId, setNewestQuoteId] = useState<string | null>(null);
    const animatedQuotesRef = useRef(new Set<string>());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
        if (scrollContainer) {
            const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 100;
            if (isScrolledToBottom) {
                scrollToBottom();
            }
        } else {
             scrollToBottom();
        }
    }, [quotes]);

    // Real-time listener for thoughts
    useEffect(() => {
        setIsLoading(true);
        const quotesCollection = collection(db, 'communityQuotes');
        const q = query(
            quotesCollection,
            orderBy('submittedAt', 'asc'),
            limitToLast(50)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const newId = change.doc.id;
                    if (!animatedQuotesRef.current.has(newId)) {
                        setNewestQuoteId(newId);
                        animatedQuotesRef.current.add(newId);
                    }
                }
            });

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

        return () => unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return '';
        }
        try {
            const date = (timestamp as Timestamp).toDate();
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            console.warn("Could not format timestamp:", timestamp, e);
            return '';
        }
    };

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
        const thoughtText = thoughtValue.trim();

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

            setThoughtValue('');
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
            }
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
        initial: (isNew: boolean) => ({
            opacity: 0,
            y: isNew ? 100 : 20,
            scale: isNew ? 0.95 : 1,
        }),
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { 
                duration: 0.5,
                ease: "easeInOut"
            }
        },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <>
            <DynamicBackground />
            <div className="fixed inset-0 w-full h-full backdrop-brightness-80 backdrop-blur-[5px] z-0" />
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

            <div className="h-full w-full flex flex-col pt-20 pb-28 relative z-10">
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
                                    <AnimatePresence initial={false}>
                                        {quotes.map((quote) => (
                                            <motion.li
                                                key={quote.id}
                                                variants={thoughtBubbleVariants}
                                                custom={quote.id === newestQuoteId}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                layout
                                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                            >
                                                <Card className="bg-white/10 backdrop-blur-xl shadow-soft rounded-2xl border-0">
                                                    <CardContent className="p-4 md:p-6 flex flex-col">
                                                        <p className="text-base md:text-lg text-foreground/90 text-left w-full break-words">
                                                            {quote.text}
                                                        </p>
                                                        {quote.submittedAt && (
                                                            <p className="text-xs text-foreground/60 self-end mt-2">
                                                                {formatTimestamp(quote.submittedAt)}
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
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
                
            <motion.footer 
              className="fixed bottom-0 inset-x-0 z-20" 
              data-prevent-snapshot
              animate={{ scale: isFocused ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <div className="max-w-2xl mx-auto p-1 sm:p-2 frosted-glass shadow-soft rounded-2xl">
                      <form
                          onSubmit={handleFormSubmit}
                          className="relative flex items-end w-full"
                      >
                          <Textarea
                              ref={textareaRef}
                              name="thought"
                              placeholder="Share a thought..."
                              value={thoughtValue}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              onChange={(e) => {
                                  setThoughtValue(e.target.value);
                                  const textarea = e.currentTarget;
                                  // Auto-resize logic with a max-height
                                  textarea.style.height = 'auto';
                                  textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // Cap height at 128px (max-h-32)
                              }}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if (!isSubmitting && thoughtValue.trim()) {
                                          (e.currentTarget.form as HTMLFormElement).requestSubmit();
                                      }
                                  }
                              }}
                              className="flex-grow bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none max-h-32 py-2 px-2 text-base"
                              rows={1}
                              disabled={isSubmitting}
                          />
                          <Button 
                              type="submit" 
                              size="icon" 
                              className="rounded-full flex-shrink-0 w-10 h-10 ml-2" 
                              disabled={isSubmitting || !thoughtValue.trim()}
                          >
                              {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                  <motion.div
                                    animate={{ scale: thoughtValue.trim() ? 1.1 : 1.0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  >
                                    <Send className="w-4 h-4" strokeWidth={isIos ? 1.5 : 2} />
                                  </motion.div>
                              )}
                          </Button>
                      </form>
                  </div>
              </div>
            </motion.footer>
        </>
    );
}

export default CollectiveThoughtsPage;
