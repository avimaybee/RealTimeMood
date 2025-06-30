
"use client";
import Link from 'next/link';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood, UserDailyMoodSummary } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import SignInPrompt from '@/components/features/SignInPrompt';
import MoodCalendar from '@/components/features/MoodCalendar';
import { fetchUserMoodHistory } from '@/lib/user-mood-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const calendarPageMood: Mood = {
  hue: 220,
  saturation: 15,
  lightness: 96,
  name: "CalendarView",
  adjective: "Reflective",
};

const MoodCalendarPageContent = () => {
  useDynamicColors(calendarPageMood);
  const { isIos } = usePlatform();
  const { user, isAnonymous, isLoading: isAuthLoading, signOut } = useAuth();
  
  const [moodData, setMoodData] = useState<UserDailyMoodSummary[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user && !isAnonymous) {
        setIsDataLoading(true);
        const data = await fetchUserMoodHistory(user.uid);
        setMoodData(data);
        setIsDataLoading(false);
      }
    }
    if (!isAuthLoading) {
        loadData();
    }
  }, [user, isAnonymous, isAuthLoading]);

  const renderContent = () => {
    if (isAuthLoading) {
      return <Skeleton className="h-[400px] w-full max-w-4xl mx-auto rounded-2xl" />;
    }

    if (isAnonymous) {
      return <SignInPrompt />;
    }
    
    if (user && !isAnonymous) {
        if (isDataLoading) {
            return <Skeleton className="h-[400px] w-full max-w-4xl mx-auto rounded-2xl" />;
        }
        return <MoodCalendar data={moodData} />;
    }
    
    // Fallback for non-anonymous user but no data (e.g., error state or just logged in)
    return <SignInPrompt />;
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
        <Button asChild variant="ghost" size="icon" className="interactive-glow -ml-2 rounded-full">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
             <span className="sr-only">Back to Live</span>
          </Link>
        </Button>
        <h1 className="text-base font-medium text-center truncate px-2">
          Your Mood Calendar
        </h1>
        <div className="w-8 h-8">
            {!isAuthLoading && user && !isAnonymous && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="interactive-glow rounded-full">
                           <User className="h-5 w-5" />
                           <span className="sr-only">User Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName || 'Signed In'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </motion.header>

      <motion.div
        className="min-h-screen w-full flex flex-col items-center p-4 md:p-6 pt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center">
            {renderContent()}
        </main>
      </motion.div>
    </>
  );
};

export default MoodCalendarPageContent;
