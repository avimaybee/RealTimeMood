
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

const aboutPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "AboutView",
  adjective: "Informative",
};

const AboutPageContent = () => {
  useDynamicColors(aboutPageMood);
  const { isIos } = usePlatform();

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
          About RealTimeMood
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
            <div className="space-y-6 text-foreground/90">
                <h2 className="text-h2 font-bold text-center">An Experiment in Collective Emotion</h2>
                <p className="text-body text-center text-foreground/70">
                    RealTimeMood is a living canvas, painted by the feelings of people from around the world.
                </p>
                <div className="pt-6 space-y-4 text-body border-t border-foreground/10">
                    <p>
                    At its core, this is an interactive art project exploring a simple question: What does our collective mood look like?
                    </p>
                    <p>
                    Every color you see is a reflection of user contributions. When you select a mood, you shift the global color just a little. Your feeling joins a sea of others, creating a dynamic, ever-changing representation of our shared emotional state. The background is a real-time visualization of the average mood of all connected minds.
                    </p>
                    <p>
                    Beyond the live view, you can explore the <Link href="/history" className="text-primary underline hover:no-underline">Mood History</Link> to see how our collective feelings have ebbed and flowed over time, or read anonymous submissions on the <Link href="/thoughts" className="text-primary underline hover:no-underline">Collective Thoughts</Link> page.
                    </p>
                    <p>
                    This app is built for moments of quiet reflection. We encourage you to use Ambient Mode to hide the UI and simply be with the color of now.
                    </p>
                </div>
            </div>
        </main>
      </motion.div>
    </>
  );
};

export default AboutPageContent;
