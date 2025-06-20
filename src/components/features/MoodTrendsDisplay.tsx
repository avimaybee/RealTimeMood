
"use client";
import React, { useEffect, useState } from 'react';
import { summarizeMoodTrends, type SummarizeMoodTrendsInput } from '@/ai/flows/summarize-mood-trends';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useMood } from '@/contexts/MoodContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MoodTrendsDisplay: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { appState } = useMood();
  const displayedSummary = useTypewriter(summary, 30, true); // Play sound true (simulated)
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        // Mock historical mood data for the AI. In a real app, this would come from a database.
        const mockMoodData: SummarizeMoodTrendsInput = {
          moodData: JSON.stringify([
            { timestamp: "2024-07-01T10:00:00Z", mood: "happy" },
            { timestamp: "2024-07-01T12:00:00Z", mood: "calm" },
            { timestamp: "2024-07-01T14:00:00Z", mood: "energetic" },
            { timestamp: "2024-07-02T10:00:00Z", mood: "happy" },
            { timestamp: "2024-07-02T12:00:00Z", mood: "focused" },
          ]),
        };
        const result = await summarizeMoodTrends(mockMoodData);
        setSummary(result.summary);
      } catch (error) {
        console.error("Failed to fetch mood summary:", error);
        setSummary("Could not load mood trends at this time.");
        toast({
          title: "Error",
          description: "Failed to load AI mood summary.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [toast]);

  const glowStyle = {
    textShadow: `0 0 8px hsl(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, 0.7), 0 0 12px hsl(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%, 0.5)`,
    color: `hsl(var(--foreground-hsl))`, // Use the calculated foreground color
    transition: 'text-shadow 0.5s ease-in-out',
  };

  return (
    <Card className="frosted-glass my-4 md:my-6 rounded-2xl shadow-soft max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-lg md:text-xl text-shadow-pop">
          <Brain className="mr-2 h-5 w-5 md:h-6 md:w-6" style={{color: `hsl(${appState.currentMood.hue}, ${appState.currentMood.saturation}%, ${appState.currentMood.lightness}%)`}} />
          Mood Nebula Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm md:text-base opacity-80">Generating insights...</p>
        ) : (
          <p className="text-sm md:text-base min-h-[6em]" style={glowStyle}>
            {displayedSummary}
            <span className="inline-block w-1 h-4 bg-foreground animate-pulse ml-1" /> {/* Blinking cursor */}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodTrendsDisplay;
