
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


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const hue = payload[0].value;
    const moodColor = `hsl(${hue}, 80%, 60%)`;
    return (
      <div className="p-2 rounded-lg shadow-soft frosted-glass">
        <p className="label">{`Time: ${label}`}</p>
        <p className="intro" style={{ color: moodColor }}>
          {`Dominant Mood Hue: ${hue}°`}
        </p>
      </div>
    );
  }
  return null;
};

const HistoryPageContent = () => {
  useDynamicColors(historyPageMood);
  const [timeRange, setTimeRange] = useState<number>(30); // 30 days, 7 days, 1 day (for 24h)

  const mockHistoryData = useMemo(() => generateMockData(timeRange), [timeRange]);

  const timeRanges = [
    { label: '30 Days', value: 30 },
    { label: '7 Days', value: 7 },
    { label: '24 Hours', value: 1 },
  ];

  const getTitle = () => {
    const selectedRange = timeRanges.find(r => r.value === timeRange);
    return `Dominant Mood Over Last ${selectedRange?.label || '30 Days'}`;
  }

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
            <Button asChild variant="outline" className="frosted-glass shadow-soft interactive-glow">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Live
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-shadow-pop">
              Collective Mood History
            </h1>
            <div className="w-24"></div> {/* Spacer */}
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
                This chart shows the trend of the collective dominant mood's hue over time.
              </CardDescription>
              <TrendSummaryDisplay historyData={mockHistoryData} />
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={mockHistoryData}
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
                      interval={Math.floor(mockHistoryData.length / 10)} // Adjust tick density
                    />
                    <YAxis 
                      domain={[0, 360]} 
                      stroke="hsl(var(--foreground) / 0.8)"
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--foreground) / 0.5)' }}
                      label={{ value: 'Hue', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }} />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        {mockHistoryData.map((entry, index) => (
                          <stop
                            key={index}
                            offset={`${(index / (mockHistoryData.length > 1 ? mockHistoryData.length - 1 : 1)) * 100}%`}
                            stopColor={`hsl(${entry.hue}, 80%, 60%)`}
                          />
                        ))}
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="hue"
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
