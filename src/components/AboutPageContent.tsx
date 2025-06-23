"use client";
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';

const aboutPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "AboutView",
  adjective: "Informative",
};

const AboutPageContent = () => {
  useDynamicColors(aboutPageMood);
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
          <Button asChild variant="outline" className="interactive-glow rounded-full w-10 h-10 p-0 md:w-auto md:px-4 md:flex-shrink-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={isIos ? 1.5 : 2} />
              {!isAndroid && <span className="hidden md:inline md:ml-2">Back to Live</span>}
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
             <Info className="h-6 w-6 opacity-80" strokeWidth={isIos ? 1.5 : 2} />
             About RealTimeMood
          </h1>
          <div className="w-10 md:w-auto md:flex-shrink-0 md:w-[148px]"></div>
        </header>

        <main className="w-full flex-grow flex items-center justify-center">
          <Card className="w-full max-w-3xl frosted-glass shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>An Experiment in Collective Emotion</CardTitle>
              <CardDescription className="text-foreground/70">
                RealTimeMood is a living canvas, painted by the feelings of people from around the world.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-base text-foreground/90">
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
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </>
  );
};

export default AboutPageContent;
