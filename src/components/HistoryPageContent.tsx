
"use client";
import Link from 'next/link';
import { ArrowLeft, History, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood, HistoricalMoodSnapshot } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import TrendSummaryDisplay from '@/components/features/TrendSummaryDisplay';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { findClosestMood } from '@/lib/colorUtils';
import { usePlatform } from '@/contexts/PlatformContext';
// Firebase dependencies removed - using mock implementations
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


// Define a static, near-white mood for the history page's background
const historyPageMood: Mood = {
  hue: 220,       // A cool, neutral blueish hue
  saturation: 15, // Very low saturation for a near-white feel
  lightness: 96,  // Very light
  name: "HistoryView",
  adjective: "Reflective",
};

const mapHueToEmotionalScale = (hue: number): number => {
  const moodScalePoints: [number, number][] = [
    [0, 15],      // Passionate Red -> Low but not saddest
    [30, 85],     // Energetic Orange
    [54, 100],    // Joyful Yellow -> Happiest
    [130, 75],    // Peaceful Green
    [180, 80],    // Hopeful Cyan
    [210, 60],    // Calm Blue
    [240, 30],    // Focused Indigo -> Can be stressful
    [260, 10],    // Anxious Indigo -> Saddest
    [300, 40],    // Creative Purple
    [360, 15],    // Wrap around to Red
  ].sort((a, b) => a[0] - b[0]);

  // Find the two points the hue is between
  let startPoint: [number, number] | undefined;
  let endPoint: [number, number] | undefined;

  for (let i = 0; i < moodScalePoints.length - 1; i++) {
    if (hue >= moodScalePoints[i][0] && hue <= moodScalePoints[i + 1][0]) {
      startPoint = moodScalePoints[i];
      endPoint = moodScalePoints[i + 1];
      break;
    }
  }

  // Handle edge case where hue is exactly 360 or something went wrong
  if (!startPoint || !endPoint) {
    return moodScalePoints[0][1];
  }

  // Linear interpolation
  const [hue1, score1] = startPoint;
  const [hue2, score2] = endPoint;

  if (hue1 === hue2) return score1; // Avoid division by zero

  const t = (hue - hue1) / (hue2 - hue1);
  return score1 + t * (score2 - score1);
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { hue } = payload[0].payload;
    const mood = findClosestMood(hue);
    const moodColor = `hsl(${hue}, 80%, 60%)`;
    return (
      <div
        className="p-3 rounded-xl shadow-lg frosted-glass border border-white/20"
        style={{ boxShadow: `0 0 20px ${moodColor}40` }}
      >
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-lg font-semibold" style={{ color: moodColor }}>
          {mood.adjective}
        </p>
        <p className="text-xs opacity-60">Hue: {Math.round(hue)}°</p>
      </div>
    );
  }
  return null;
};

const HistoryPageContent = () => {
  useDynamicColors(historyPageMood);
  const { isIos } = usePlatform();
  const [timeRange, setTimeRange] = useState<number>(30); // 30 days, 7 days, 1 day (for 24h)
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockHistoricalData = useCallback((range: number) => {
    const data = [];
    const now = new Date();
    const days = range === 1 ? 24 : range; // 24 hours or N days

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (range === 1) {
        date.setHours(now.getHours() - i);
      } else {
        date.setDate(now.getDate() - i);
      }

      // Generate realistic mood data with some variation
      const baseHue = 200 + Math.sin(i * 0.3) * 50; // Base blue with wave
      const hue = Math.max(0, Math.min(360, baseHue + (Math.random() - 0.5) * 60));
      const emotionalValue = 40 + Math.sin(i * 0.2) * 30 + Math.random() * 20;

      const formattedDate = range === 1
        ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: formattedDate,
        hue: hue,
        emotionalValue: emotionalValue
      });
    }

    return data;
  }, []);

  const fetchHistoricalData = useCallback(async (range: number) => {
    setIsLoading(true);
    setError(null);
    setChartData([]); // Clear previous data

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Generate mock historical data
      const mockData = generateMockHistoricalData(range);
      setChartData(mockData);
    } catch (err) {
      console.error("Error generating mock historical data: ", err);
      setError("Unable to generate historical data at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [generateMockHistoricalData]);

  useEffect(() => {
    fetchHistoricalData(timeRange);
  }, [timeRange, fetchHistoricalData]);


  const historyDataForAI = useMemo(() => {
    return chartData.map(({ date, hue }) => ({ date, hue }));
  }, [chartData]);


  const timeRanges = [
    { label: '30 Days', value: 30 },
    { label: '7 Days', value: 7 },
    { label: '24 Hours', value: 1 },
  ];

  const getTitle = () => {
    const selectedRange = timeRanges.find(r => r.value === timeRange);
    return `Emotional Tone Over Last ${selectedRange?.label || '30 Days'}`;
  }

  const yAxisTicks = [10, 40, 60, 85, 100];
  const yAxisTickFormatter = (value: number) => {
    switch (value) {
      case 10: return 'Anxious';
      case 40: return 'Creative';
      case 60: return 'Calm';
      case 85: return 'Energetic';
      case 100: return 'Joyful';
      default: return '';
    }
  };

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div className="h-[300px] sm:h-[400px] w-full flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-[300px] sm:h-[400px] w-full flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4" strokeWidth={isIos ? 1.5 : 2} />
          <p className="font-semibold">History Unavailable</p>
          <p className="text-small">{error}</p>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="h-[300px] sm:h-[400px] w-full flex flex-col items-center justify-center text-foreground/70">
          <History className="h-10 w-10 mb-4" strokeWidth={isIos ? 1.5 : 2} />
          <p className="font-semibold">Not Enough Data</p>
          <p className="text-small">No historical mood data is available for this time range yet.</p>
        </div>
      );
    }

    return (
      <ChartContainer config={{}} className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                {chartData.map((entry, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (chartData.length > 1 ? chartData.length - 1 : 1)) * 100}%`}
                    stopColor={`hsl(${entry.hue}, 80%, 60%)`}
                  />
                ))}
              </linearGradient>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary-hsl))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary-hsl))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground) / 0.6)"
              tick={{ fill: 'hsl(var(--foreground) / 0.8)', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--foreground) / 0.3)' }}
              interval={Math.floor(chartData.length / 8)}
              axisLine={{ stroke: 'hsl(var(--foreground) / 0.2)' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(var(--foreground) / 0.6)"
              ticks={yAxisTicks}
              tickFormatter={yAxisTickFormatter}
              tick={{ fill: 'hsl(var(--foreground) / 0.8)', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--foreground) / 0.3)' }}
              axisLine={{ stroke: 'hsl(var(--foreground) / 0.2)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <Area
              type="monotone"
              dataKey="emotionalValue"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={false}
              activeDot={{
                r: 6,
                style: {
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary)))',
                },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }


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
          Collective Mood History
        </h1>
        <div className="w-8 h-8" /> {/* Spacer */}
      </motion.header>

      <motion.div
        className="min-h-screen w-full flex flex-col items-center p-4 md:p-6 pt-28"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <main className="w-full flex-grow flex flex-col items-center justify-center gap-6">
          <Card className="w-full max-w-5xl frosted-glass rounded-2xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <CardTitle>{getTitle()}</CardTitle>
                <div className="flex items-center gap-2">
                  {timeRanges.map(range => (
                    <Button
                      key={range.value}
                      variant={timeRange === range.value ? 'default' : 'outline'}
                      onClick={() => setTimeRange(range.value)}
                      className={cn(
                        "rounded-full px-4 text-xs transition-all duration-300",
                        timeRange === range.value && "shadow-lg ring-2 ring-primary/30"
                      )}
                      size="sm"
                      style={timeRange === range.value ? {
                        boxShadow: '0 0 15px hsla(var(--primary-hsl), 0.4)'
                      } : {}}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
              <CardDescription className="text-small text-foreground/70">
                This chart shows the trend of the collective emotional tone over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChartContent()}
            </CardContent>
          </Card>

          <Card
            className="w-full max-w-5xl frosted-glass rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 0 30px hsla(var(--primary-hsl), 0.15)' }}
          >
            <CardHeader className="relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: 'linear-gradient(135deg, hsla(var(--primary-hsl), 0.2) 0%, transparent 50%)' }}
              />
              <CardTitle className="text-xl flex items-center gap-2 relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-5 h-5 text-primary" strokeWidth={isIos ? 1.5 : 2} />
                </motion.div>
                AI Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendSummaryDisplay historyData={historyDataForAI} />
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </>
  );
};

export default HistoryPageContent;
