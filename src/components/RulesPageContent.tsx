
"use client";
import Link from 'next/link';
import { ArrowLeft, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';

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
      <motion.div
        className="min-h-screen w-full flex flex-col items-center p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 mb-6">
          <Button asChild variant="outline" className="frosted-glass shadow-soft interactive-glow rounded-full w-10 h-10 p-0 md:w-auto md:px-4 md:flex-shrink-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
              {!isAndroid && <span className="hidden md:inline md:ml-2">Back to Live</span>}
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
             <Gavel className="h-6 w-6 opacity-80" strokeWidth={isIos ? 1.5 : 2} />
             Community Guidelines
          </h1>
          <div className="w-10 md:w-auto md:flex-shrink-0 md:w-[148px]"></div>
        </header>

        <main className="w-full flex-grow flex items-center justify-center">
          <Card className="w-full max-w-3xl frosted-glass shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>Our Shared Space</CardTitle>
              <CardDescription className="text-foreground/70">
                To keep RealTimeMood a reflective and positive space, we ask you to keep these simple guidelines in mind.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-base text-foreground/90">
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
                <p className="text-sm text-center pt-4 text-foreground/60">
                    This is an experiment in collective emotion, not a crisis support service. If you are in distress, please seek help from a qualified professional.
                </p>
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </>
  );
};

export default RulesPageContent;
