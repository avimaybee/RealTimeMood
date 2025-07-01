
"use client";
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Heart, ArrowDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CommunityQuote } from '@/types';
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
import { incrementLike, decrementLike } from '@/lib/thoughts-service';
import { useMood } from '@/contexts/MoodContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PREDEFINED_MOODS } from '@/lib/colorUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth';


const MAX_THOUGHT_LENGTH = 300;

const filterableMoods = PREDEFINED_MOODS;

const AuthorAvatar = ({ hue, adjective }: { hue?: number; adjective?: string }) => {
  if (hue === undefined || hue === null) {
    // Return a generic placeholder for older thoughts without a hue
    return (
      <div className="w-6 h-6 rounded-full bg-muted/30 flex-shrink-0" />
    );
  }
  const color = `hsl(${hue}, 80%, 65%)`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 6px hsla(${hue}, 80%, 65%, 0.7)` 
            }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Author's mood: <span style={{color: `hsl(${hue}, 80%, 65%)`}}>{adjective || 'Unknown'}</span></p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


const CollectiveThoughtsPage = () => {
    const { isIos } = usePlatform();
    const { toast } = useToast();
    const { currentMood } = useMood();
    const { user, isAnonymous } = useAuth();
    const [quotes, setQuotes] = useState<(CommunityQuote & { id: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thoughtValue, setThoughtValue] = useState("");
    const [isInputActive, setIsInputActive] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSubmissionTimeRef = useRef<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [newestQuoteId, setNewestQuoteId] = useState<string | null>(null);
    const animatedQuotesRef = useRef(new Set<string>());

    const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);

    // State for "Read More" and "Back to Top" features
    const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());
    const [clampedQuotes, setClampedQuotes] = useState<Set<string>>(new Set());
    const [showGoToBottom, setShowGoToBottom] = useState(false);
    const textRefs = useRef(new Map<string, HTMLParagraphElement | null>());
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const getCounterColorStyle = (currentLength: number, maxLength: number): React.CSSProperties => {
        const overLimit = currentLength > maxLength;
        
        if (overLimit) {
            return { color: 'hsl(var(--destructive))' };
        }
    
        // The point at which the color starts changing from default
        const transitionStart = 0.8; 
        const progress = Math.min(currentLength / maxLength, 1);
    
        if (progress < transitionStart) {
            return { color: 'hsl(var(--muted-foreground))' };
        }
    
        // The progress within the transition range (from 80% to 100%)
        // This value goes from 0 to 1
        const transitionProgress = (progress - transitionStart) / (1 - transitionStart);
    
        // Interpolate hue from yellow (60) to red (0)
        const hue = 60 * (1 - transitionProgress);
    
        return { 
            color: `hsl(${hue}, 90%, 55%)`,
            transition: 'color 0.2s ease-in-out',
        };
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        try {
            const liked = localStorage.getItem('likedThoughts');
            if (liked) {
                setLikedQuotes(new Set(JSON.parse(liked)));
            }
        } catch (error) {
            console.warn("Could not parse liked thoughts from localStorage", error);
        }
    }, [isClient]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const scrollContainer = messagesEndRef.current?.parentElement?.parentElement?.parentElement;
        if (scrollContainer) {
            const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 150;
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
            setError("The collective consciousness is quiet right now. Please try again later.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect to detect which quotes are clamped after they have rendered
    useEffect(() => {
        if (isLoading || quotes.length === 0) return;

        // A small delay to let the DOM settle after render, especially after font loading.
        const timer = setTimeout(() => {
            const newClamped = new Set<string>();
            textRefs.current.forEach((el, id) => {
                if (el && el.scrollHeight > el.clientHeight) {
                    newClamped.add(id);
                }
            });

            // Only update state if the set of clamped quotes has actually changed.
            setClampedQuotes(currentClamped => {
                if (currentClamped.size === newClamped.size && [...currentClamped].every(id => newClamped.has(id))) {
                    return currentClamped; // No change, avoid re-render
                }
                return newClamped;
            });
        }, 150); 

        return () => clearTimeout(timer);
    }, [quotes, isLoading]);

    // Effect to add scroll listener for the "Go to Bottom" button
    useEffect(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (!viewport) return;

        const handleScroll = () => {
            const threshold = 400; // Show button if scrolled up more than 400px from the bottom
            const isScrolledFromBottom = viewport.scrollHeight - viewport.scrollTop > viewport.clientHeight + threshold;
            if (isScrolledFromBottom) {
                setShowGoToBottom(true);
            } else {
                setShowGoToBottom(false);
            }
        };

        viewport.addEventListener('scroll', handleScroll, { passive: true });
        return () => viewport.removeEventListener('scroll', handleScroll);
    }, [isLoading]); // Re-attach listener when content is ready

    const handleToggleExpand = (quoteId: string) => {
        setExpandedQuotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(quoteId)) {
                newSet.delete(quoteId);
            } else {
                newSet.add(quoteId);
            }
            return newSet;
        });
    };
    
    const handleGoToBottom = () => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        viewport?.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    };

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

    const handleLikeToggle = async (quoteId: string) => {
        const isLiked = likedQuotes.has(quoteId);
        const originalLikedQuotes = new Set(likedQuotes);
        const originalQuotes = [...quotes];

        // Optimistic UI update
        const newLikedQuotes = new Set(likedQuotes);
        if (isLiked) {
            newLikedQuotes.delete(quoteId);
        } else {
            newLikedQuotes.add(quoteId);
        }
        setLikedQuotes(newLikedQuotes);
        localStorage.setItem('likedThoughts', JSON.stringify(Array.from(newLikedQuotes)));

        setQuotes(currentQuotes =>
            currentQuotes.map(q =>
                q.id === quoteId ? { ...q, likes: (q.likes || 0) + (isLiked ? -1 : 1) } : q
            )
        );

        try {
            if (isLiked) {
                await decrementLike(quoteId);
            } else {
                await incrementLike(quoteId);
            }
        } catch (error) {
            toast({
                title: "Connection Error",
                description: "Your gesture couldn't be saved. Please try again.",
                variant: "destructive"
            });
            // Rollback UI on failure
            setLikedQuotes(originalLikedQuotes);
            localStorage.setItem('likedThoughts', JSON.stringify(Array.from(originalLikedQuotes)));
            setQuotes(originalQuotes);
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
                title: "An empty thought?",
                description: "You can't share silence. Please write something first.",
                variant: "destructive"
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, 'communityQuotes'), {
                text: thoughtText,
                submittedAt: serverTimestamp(),
                likes: 0,
                authorHue: currentMood.hue,
                authorAdjective: currentMood.adjective,
                authorId: user && !isAnonymous ? user.uid : null,
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
                title: "A fleeting thought...",
                description: "Your thought couldn't be shared right now. Please try again.",
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
                type: "spring", stiffness: 350, damping: 35 
            }
        },
        exit: { opacity: 0, y: -20 },
    };

    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-20 pb-32 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        );
      }
  
      if (error) {
        return (
          <div className="h-full flex items-center justify-center text-destructive">
            <p>{error}</p>
          </div>
        );
      }

      const filteredQuotes = quotes.filter(q => !activeFilter || q.authorAdjective === activeFilter);
  
      if (quotes.length === 0) {
        return (
          <div className="h-full flex items-center justify-center w-full max-w-2xl mx-auto px-4 pt-20 pb-28">
            <p className="text-foreground/70">Be the first to share a thought.</p>
          </div>
        );
      }
  
      return (
        <div className="h-full flex flex-col pt-20">
            {filteredQuotes.length > 0 ? (
                <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                    <motion.ul 
                        className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-2 pb-32 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <AnimatePresence initial={false}>
                            {filteredQuotes.map((quote) => {
                                const isAuthor = user && !isAnonymous && quote.authorId === user.uid;
                                const isExpanded = expandedQuotes.has(quote.id);
                                const isClamped = clampedQuotes.has(quote.id);
                                return (
                                <motion.li
                                    key={quote.id}
                                    variants={thoughtBubbleVariants}
                                    custom={quote.id === newestQuoteId}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    layout="position"
                                    transition={{ type: "spring", stiffness: 500, damping: 50 }}
                                >
                                    <Card className={cn(
                                        "rounded-2xl frosted-glass flex flex-col",
                                        isAuthor && "ring-2 ring-primary/40"
                                    )}>
                                        <CardContent className="p-3 flex flex-col flex-grow">
                                            <div className="flex-grow">
                                                <p
                                                    ref={el => {
                                                        if (el) textRefs.current.set(quote.id, el);
                                                        else textRefs.current.delete(quote.id);
                                                    }}
                                                    className={cn(
                                                        "text-body text-foreground/90 text-left w-full break-words whitespace-pre-wrap",
                                                        !isExpanded && "line-clamp-4"
                                                    )}
                                                >
                                                    {quote.text}
                                                </p>
                                                {isClamped && (
                                                    <button
                                                        onClick={() => handleToggleExpand(quote.id)}
                                                        className="text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
                                                    >
                                                        {isExpanded ? "Show less" : "…read more"}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-foreground/10">
                                                <div className="flex items-center gap-3">
                                                    <AuthorAvatar hue={quote.authorHue} adjective={quote.authorAdjective} />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="group flex items-center gap-1.5 text-foreground/70 hover:text-primary px-2 hover:bg-primary/10 -ml-2"
                                                        onClick={() => handleLikeToggle(quote.id)}
                                                        aria-label="Like thought"
                                                    >
                                                        <Heart className={cn(
                                                            "w-4 h-4 transition-all duration-150",
                                                            likedQuotes.has(quote.id) ? "fill-primary text-primary" : "text-foreground/70",
                                                            "group-hover:text-primary group-hover:scale-110",
                                                            "group-active:scale-125"
                                                        )} />
                                                        <div className="relative h-4 w-4">
                                                            <AnimatePresence initial={false}>
                                                                <motion.span
                                                                    key={quote.likes}
                                                                    className={cn(
                                                                        "font-medium tabular-nums absolute inset-0",
                                                                        likedQuotes.has(quote.id) ? "text-primary" : "text-foreground/70",
                                                                        "group-hover:text-primary"
                                                                    )}
                                                                    initial={{ y: 10, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    exit={{ y: -10, opacity: 0 }}
                                                                    transition={{ type: 'spring', stiffness: 500, damping: 50, duration: 0.2 }}
                                                                >
                                                                    {quote.likes || 0}
                                                                </motion.span>
                                                            </AnimatePresence>
                                                        </div>
                                                    </Button>
                                                </div>

                                                {quote.submittedAt && (
                                                    <p className="text-small text-foreground/60">
                                                        {formatTimestamp(quote.submittedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.li>
                            )})}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </motion.ul>
                </ScrollArea>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-foreground/70">No thoughts found for "{activeFilter}".</p>
                </div>
            )}
        </div>
      );
    };

    const charsLeft = MAX_THOUGHT_LENGTH - thoughtValue.length;

    return (
        <>
            <div className="vignette-overlay" />
            <div className="noise-overlay" />
            <DynamicBackground />
            <LivingParticles />

            <motion.header
              className={cn(
                "fixed top-4 inset-x-0 mx-auto z-30",
                "w-[calc(100%-2rem)] max-w-lg",
                "grid grid-cols-[1fr_auto_1fr] items-center",
                "h-12 px-3",
                "frosted-glass rounded-2xl shadow-soft"
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="flex justify-start">
                <Button asChild variant="ghost" size="icon" className="interactive-glow -ml-2 rounded-full">
                  <Link href="/">
                    <ArrowLeft className="h-5 w-5" strokeWidth={isClient && isIos ? 1.5 : 2} />
                    <span className="sr-only">Back to Live</span>
                  </Link>
                </Button>
              </div>

              <h1 className="text-base font-medium text-center truncate px-2">
                Collective Thoughts
              </h1>

              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "interactive-glow rounded-full",
                        activeFilter && "bg-primary/20 text-primary"
                      )}
                    >
                      <Filter className="h-5 w-5" />
                       <span className="sr-only">Filter thoughts</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by mood</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup 
                        value={activeFilter || 'All Thoughts'} 
                        onValueChange={(value) => setActiveFilter(value === 'All Thoughts' ? null : value)}>
                      <DropdownMenuRadioItem value="All Thoughts">All Thoughts</DropdownMenuRadioItem>
                      {filterableMoods.map((mood) => (
                        <DropdownMenuRadioItem key={mood.adjective} value={mood.adjective}>
                           <div className="flex items-center gap-2">
                             <span>{mood.emoji}</span>
                             <span>{mood.adjective}</span>
                           </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.header>
            
            <main className="h-full w-full flex flex-col relative z-10">
                <AnimatePresence>
                    <motion.div
                        className="flex-grow flex flex-col overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    >
                      {isClient ? renderContent() : null}
                    </motion.div>
                </AnimatePresence>
            </main>
            
            <AnimatePresence>
                {showGoToBottom && (
                    <motion.div
                        className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] sm:bottom-[calc(9rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-30"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Button
                            onClick={handleGoToBottom}
                            size="icon"
                            className="rounded-full shadow-lg interactive-glow h-8 w-8"
                            aria-label="Go to bottom"
                        >
                            <ArrowDown className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
                
            <motion.footer 
              className="fixed bottom-0 inset-x-0 z-20" 
              data-prevent-snapshot
            >
              <div className="p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <div className={cn(
                    "max-w-4xl mx-auto rounded-2xl frosted-glass relative overflow-hidden shadow-soft transition-all duration-200",
                    isInputActive && "border-primary/50 bg-foreground/10"
                  )}>
                    <form
                        onSubmit={handleFormSubmit}
                        className="relative z-10 flex items-end w-full p-1 sm:p-2"
                    >
                          <Textarea
                              ref={textareaRef}
                              name="thought"
                              placeholder="Share a thought..."
                              value={thoughtValue}
                              onFocus={() => setIsInputActive(true)}
                              onBlur={() => setIsInputActive(false)}
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
                              className="platform-textarea flex-grow bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none max-h-32 py-2 px-2 text-base"
                              rows={1}
                              disabled={isSubmitting}
                              maxLength={MAX_THOUGHT_LENGTH}
                          />
                          <Button 
                              type="submit" 
                              size="icon" 
                              className="rounded-full flex-shrink-0 w-10 h-10 ml-2 interactive-glow" 
                              disabled={isSubmitting || !thoughtValue.trim() || thoughtValue.length > MAX_THOUGHT_LENGTH}
                          >
                              {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                  <motion.div
                                    animate={{ scale: thoughtValue.trim() && (thoughtValue.length <= MAX_THOUGHT_LENGTH) ? 1.1 : 1.0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  >
                                    <Send className="w-4 h-4" strokeWidth={isClient && isIos ? 1.5 : 2} />
                                  </motion.div>
                              )}
                          </Button>
                      </form>
                      <AnimatePresence>
                          {(isInputActive || thoughtValue.length > 0) && (
                              <motion.div
                                  className="absolute bottom-2 right-[52px] sm:right-[60px] pointer-events-none"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  transition={{ duration: 0.2 }}
                              >
                                  <p
                                      className={cn(
                                          "text-xs tabular-nums",
                                          thoughtValue.length > MAX_THOUGHT_LENGTH && "font-semibold"
                                      )}
                                      style={getCounterColorStyle(thoughtValue.length, MAX_THOUGHT_LENGTH)}
                                  >
                                      {thoughtValue.length}/{MAX_THOUGHT_LENGTH}
                                  </p>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
            </motion.footer>
        </>
    );
}

export default CollectiveThoughtsPage;
