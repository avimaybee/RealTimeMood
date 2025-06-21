
"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDynamicColors } from '@/hooks/useDynamicColors';
import { useMood } from '@/contexts/MoodContext';
import DynamicBackground from '@/components/ui-fx/DynamicBackground';

// Generate more realistic mock data
const generateMockData = () => {
  const data = [];
  let lastHue = 180; // Start with a calm-ish hue
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Create a slow, wave-like drift in hue
    const drift = (Math.sin(i / 5) * 40);
    // Add some random noise
    const noise = (Math.random() - 0.5) * 20;
    
    lastHue = (lastHue + drift + noise + 360) % 360;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hue: Math.round(lastHue),
    });
  }
  return data;
};

const mockHistoryData = generateMockData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const hue = payload[0].value;
    const moodColor = `hsl(${hue}, 80%, 60%)`;
    return (
      <div className="p-2 rounded-lg shadow-soft frosted-glass">
        <p className="label">{`Date: ${label}`}</p>
        <p className="intro" style={{ color: moodColor, textShadow: `0 0 5px ${moodColor}` }}>
          {`Dominant Mood Hue: ${hue}°`}
        </p>
      </div>
    );
  }
  return null;
};

const HistoryPageContent = () => {
  const { appState } = useMood();
  useDynamicColors(appState.currentMood); // Keep background consistent with app state

  return (
    <>
      <DynamicBackground />
      <div className="vignette-overlay" />
      <div className="noise-overlay" />
      <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-6">
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
              <CardTitle>Dominant Mood Over Last 30 Days</CardTitle>
              <CardDescription>
                This chart shows the trend of the collective dominant mood's hue over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px] w-full">
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
                            offset={`${(index / (mockHistoryData.length - 1)) * 100}%`}
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
      </div>
    </>
  );
};

export default HistoryPageContent;
