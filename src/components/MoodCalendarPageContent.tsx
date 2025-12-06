
"use client";
import Link from 'next/link';
import { ArrowLeft, Flame, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood, UserDailyMoodSummary, UserProfile } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import { motion } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SignInPrompt from '@/components/features/SignInPrompt';
import MoodCalendar from '@/components/features/MoodCalendar';
import { fetchUserMoodHistory } from '@/lib/user-mood-service';
import { fetchUserProfile } from '@/lib/user-profile-service';
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

// Generate realistic mock calendar data for demo purposes
const generateMockCalendarData = (): UserDailyMoodSummary[] => {
  const data: UserDailyMoodSummary[] = [];
  const now = new Date();
  const moods = [
    { hue: 200, adj: 'Calm' },
    { hue: 54, adj: 'Joyful' },
    { hue: 130, adj: 'Peaceful' },
    { hue: 210, adj: 'Focused' },
    { hue: 30, adj: 'Energetic' },
    { hue: 300, adj: 'Creative' },
    { hue: 180, adj: 'Hopeful' },
  ];

  // Generate data for last 90 days with varying patterns
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip some days randomly (20% chance no entry)
    if (Math.random() > 0.8) continue;

    // Create patterns - more joyful on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let moodIndex: number;
    if (isWeekend) {
      moodIndex = Math.random() > 0.5 ? 1 : 4; // Joyful or Energetic
    } else {
      moodIndex = Math.floor(Math.random() * moods.length);
    }

    const mood = moods[moodIndex];
    const contributionCount = 1 + Math.floor(Math.random() * 4);

    data.push({
      date: date.toISOString().split('T')[0],
      averageHue: mood.hue + (Math.random() - 0.5) * 20,
      dominantAdjective: mood.adj,
      contributionCount,
    });
  }

  return data;
};

const MoodCalendarPageContent = () => {
  useDynamicColors(calendarPageMood);
  const { isIos } = usePlatform();
  const { user, isAnonymous, isLoading: isAuthLoading, signOut } = useAuth();

  const [moodData, setMoodData] = useState<UserDailyMoodSummary[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Generate mock data for demo
  const mockData = useMemo(() => generateMockCalendarData(), []);

  useEffect(() => {
    async function loadData() {
      if (user && !isAnonymous) {
        setIsDataLoading(true);
        const [historyData, profileData] = await Promise.all([
          fetchUserMoodHistory(user.uid),
          fetchUserProfile(user.uid),
        ]);
        setMoodData(historyData.length > 0 ? historyData : mockData);
        setUserProfile(profileData);
        setIsDataLoading(false);
      } else {
        // Use mock data for anonymous users
        setMoodData(mockData);
        setIsDataLoading(false);
      }
    }
    if (!isAuthLoading) {
      loadData();
    }
  }, [user, isAnonymous, isAuthLoading, mockData]);

  const renderStreakCard = () => {
    const streakValue = userProfile?.currentStreak || 7; // Demo value

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className="frosted-glass rounded-2xl mb-6 w-full max-w-sm mx-auto overflow-hidden"
          style={{ boxShadow: '0 0 30px hsla(var(--primary-hsl), 0.2)' }}
        >
          <CardContent className="p-5 flex items-center gap-4 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(135deg, hsla(var(--primary-hsl), 0.3) 0%, transparent 60%)' }}
            />
            <motion.div
              className="p-3 bg-primary/20 rounded-full relative"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-7 h-7 text-primary" />
            </motion.div>
            <div className="relative">
              <p className="text-3xl font-bold font-display">{streakValue}-Day Streak</p>
              <p className="text-muted-foreground text-sm">Keep it going by contributing every day!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (isAuthLoading || isDataLoading) {
      return <Skeleton className="h-[400px] w-full max-w-4xl mx-auto rounded-2xl" />;
    }

    return (
      <>
        {renderStreakCard()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="frosted-glass rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 0 40px hsla(var(--primary-hsl), 0.1)' }}
          >
            <CardHeader className="pb-2 relative">
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: 'linear-gradient(135deg, hsla(var(--primary-hsl), 0.2) 0%, transparent 50%)' }}
              />
              <CardTitle className="flex items-center gap-2 text-xl relative">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Mood Journey
              </CardTitle>
              <p className="text-muted-foreground text-sm relative">
                {isAnonymous ? 'Demo view - sign in to track your actual mood history' : 'Your personal mood contributions over time'}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <MoodCalendar data={moodData} />
            </CardContent>
          </Card>
        </motion.div>

        {isAnonymous && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <SignInPrompt />
          </motion.div>
        )}
      </>
    );
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
              <ArrowLeft className="h-5 w-5" strokeWidth={isIos ? 1.5 : 2} />
              <span className="sr-only">Back to Live</span>
            </Link>
          </Button>
        </div>

        <h1 className="text-base font-medium font-display text-center truncate px-2">
          Your Mood Calendar
        </h1>

        <div className="flex justify-end">
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
        className="min-h-screen w-full flex flex-col items-center p-4 md:p-6 pt-28"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-start">
          {renderContent()}
        </main>
      </motion.div>
    </>
  );
};

export default MoodCalendarPageContent;

