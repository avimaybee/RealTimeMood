
"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import type { Mood } from '@/types';
import LivingParticles from '@/components/ui-fx/LivingParticles';
import TrendSummaryDisplay from '@/components/features/TrendSummaryDisplay';
import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { findClosestMood } from '@/lib/colorUtils';


// Define a static, near-white mood for the history page's background
const historyPageMood: Mood = {
  hue: 220,       // A cool, neutral blueish hue
  saturation: 15, // Very low saturation for a near-white feel
  lightness: 96,  // Very light
  name: "HistoryView",
  adjective: "Reflective",
};


// Generate more realistic mock data based on a time range
const generateMockData = (days: number) => {
  const data = [];
  let lastHue = 180; // Start with a calm-ish hue
  const now = new Date();

  if (days === 1) { // 24-hour view
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(now.getHours() - i);
      
      const drift = (Math.sin(i / 3) * 50);
      const noise = (Math.random() - 0.5) * 30;
      lastHue = (lastHue + drift + noise + 360) % 360;

      data.push({
        date: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
        hue: Math.round(lastHue),
      });
    }
  } else { // Day-based view
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const drift = (Math.sin(i / 5) * 40);
      const noise = (Math.random() - 0.5) * 20;
      lastHue = (lastHue + drift + noise + 360) % 360;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hue: Math.round(lastHue),
      });
    }
  }
  return data;
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
      <div className="p-2 rounded-lg shadow-soft frosted-glass">
        <p className="label">{`Time: ${label}`}</p>
        <p className="intro" style={{ color: moodColor }}>
          {`Mood: ${mood.adjective} (Hue: ${hue}°)`}
        </p>
      </div>
    );
  }
  return null;
};

const HistoryPageContent = () => {
  useDynamicColors(historyPageMood);
  const [timeRange, setTimeRange] = useState<number>(30); // 30 days, 7 days, 1 day (for 24h)

  // By using useMemo, chartData is generated instantly and only re-calculated when timeRange changes.
  const chartData = useMemo(() => {
     const rawData = generateMockData(timeRange);
     return rawData.map(d => ({
       ...d,
       emotionalValue: mapHueToEmotionalScale(d.hue),
     }));
  }, [timeRange]);

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
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline md:ml-2">Back to Live</span>
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">
              Collective Mood History
            </h1>
            <div className="w-10 md:w-auto md:flex-shrink-0 md:w-[148px]"></div> {/* Spacer */}
        </header>

        <main className="w-full flex-grow flex items-center justify-center">
          <Card className="w-full max-w-5xl frosted-glass shadow-soft rounded-2xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <CardTitle>{getTitle()}</CardTitle>
                <div className="flex gap-2 bg-muted/50 p-1 rounded-full">
                  {timeRanges.map(range => (
                    <Button
                      key={range.value}
                      variant={timeRange === range.value ? 'default' : 'ghost'}
                      onClick={() => setTimeRange(range.value)}
                      className={cn(
                        "rounded-full transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4",
                         timeRange !== range.value && "hover:bg-transparent"
                      )}
                      size="sm"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
              <CardDescription>
                This chart shows the trend of the collective emotional tone over time.
              </CardDescription>
              <TrendSummaryDisplay historyData={historyDataForAI} />
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground) / 0.8)" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--foreground) / 0.5)' }}
                      interval={Math.floor(chartData.length / 10)} // Adjust tick density
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="hsl(var(--foreground) / 0.8)"
                      ticks={yAxisTicks}
                      tickFormatter={yAxisTickFormatter}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--foreground) / 0.5)' }}
                      label={{ value: 'Emotional Tone', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12, dy: -10 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }} />
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
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="emotionalValue"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 8,
                        style: {
                          fill: 'hsl(var(--primary))',
                          stroke: 'hsl(var(--background))',
                          strokeWidth: 2,
                          filter: 'drop-shadow(0 0 4px hsl(var(--primary)))',
                        },
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </>
  );
};

export default HistoryPageContent;
