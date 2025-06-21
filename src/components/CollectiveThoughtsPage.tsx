"use client";
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { useToast } from '@/hooks/use-toast';
import { useMood } from '@/contexts/MoodContext';

const CollectiveThoughtsPage = () => {
    useMood(); // Initialize context to ensure background hooks work
    const { toast } = useToast();

    const handleAddThoughtClick = () => {
        toast({
            title: "Feature Coming Soon",
            description: "The ability to share your thoughts will be added in a future update.",
        });
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

                <main className="w-full flex-grow flex flex-col items-center justify-center text-center text-foreground gap-8">
                    <p className="text-2xl font-light">"There's a spark of creativity in the air."</p>
                    <p className="text-2xl font-light opacity-80">"Feeling a wave of calm wash over the world today."</p>
                    <p className="text-2xl font-light opacity-60">"A moment of shared peace. It's beautiful."</p>
                    {/* Real quote display will go here in a future task */}
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
