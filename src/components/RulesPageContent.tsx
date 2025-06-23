
"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { cn } from '@/lib/utils';

const rulesPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "RulesView",
  adjective: "Structured",
};

const RulesPageContent = () => {
  useDynamicColors(rulesPageMood);
  const { isIos, isAndroid } = usePlatform();

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
          Community Guidelines
        </h1>
        <div className="w-8 h-8" /> {/* Spacer to balance the back button */}
      </motion.header>

      <motion.div
        className="min-h-screen w-full flex flex-col items-center p-4 md:p-6 pt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <main className="w-full max-w-2xl mx-auto flex-grow flex flex-col justify-center">
          <div className="space-y-8 text-foreground/90">
              <h2 className="text-3xl font-bold text-center">Our Shared Space</h2>
              <p className="text-lg text-center text-foreground/70 -mt-4">
                  To keep RealTimeMood a reflective and positive space, please keep these simple guidelines in mind.
              </p>
              
              <div className="space-y-6 text-base pt-6 border-t border-foreground/10">
                  <div className="flex items-start gap-4">
                      <div className="text-2xl font-bold text-primary">1.</div>
                      <div>
                          <h3 className="font-semibold text-lg">Be Honest</h3>
                          <p className="text-foreground/80">This is a space for genuine feelings. Your honest contributions make the collective mood a true reflection of the moment.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="text-2xl font-bold text-primary">2.</div>
                      <div>
                          <h3 className="font-semibold text-lg">Be Kind</h3>
                          <p className="text-foreground/80">The thoughts you share are anonymous, but they are read by others. Please ensure your words are constructive and considerate, not harmful.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="text-2xl font-bold text-primary">3.</div>
                      <div>
                          <h3 className="font-semibold text-lg">Be Mindful</h3>
                          <p className="text-foreground/80">This is a public, unmoderated space. Do not share any private, personal, or sensitive information. Protect your privacy and the privacy of others.</p>
                      </div>
                  </div>
              </div>
              
              <p className="text-sm text-center pt-6 border-t border-foreground/10 text-foreground/60">
                  This is an experiment in collective emotion, not a crisis support service. If you are in distress, please seek help from a qualified professional.
              </p>
          </div>
        </main>
      </motion.div>
    </>
  );
};

export default RulesPageContent;
