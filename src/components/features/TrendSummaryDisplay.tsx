"use client";
import React, { useState, useEffect } from 'react';
import { summarizeTrends, type SummarizeTrendsInput } from '@/ai/flows/summarize-mood-trends';
import { useTypewriter } from '@/hooks/useTypewriter';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendSummaryDisplayProps {
  historyData: SummarizeTrendsInput['historyData'];
}

const TrendSummaryDisplay: React.FC<TrendSummaryDisplayProps> = ({ historyData }) => {
  const [summary, setSummary] = useState('');
  const [dominantHue, setDominantHue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayedSummary = useTypewriter(summary, 30);

  useEffect(() => {
    const getSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await summarizeTrends({ historyData });
        setSummary(result.summary);
        setDominantHue(result.dominantHue);
      } catch (e) {
        console.error("Failed to get trend summary:", e);
        setError("Could not generate mood analysis at this time.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (historyData.length > 0) {
      getSummary();
    }
  }, [historyData]);

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <p className="text-center animate-pulse">Analyzing trends...</p>
      </div>
    );
  }
  
  if (error) {
    return <p className="mt-4 text-sm text-destructive">{error}</p>;
  }

  const glowStyle = dominantHue !== null ? {
    textShadow: `
      0 0 8px hsla(${dominantHue}, 80%, 60%, 0.8), 
      0 0 16px hsla(${dominantHue}, 80%, 60%, 0.5)
    `,
    color: 'hsl(var(--foreground))'
  } : {};

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <p style={glowStyle} className="text-sm text-foreground/90">{displayedSummary}</p>
    </div>
  );
};

export default TrendSummaryDisplay;
