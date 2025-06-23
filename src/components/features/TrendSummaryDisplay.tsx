
"use client";
import React, { useState, useEffect } from 'react';
import { summarizeTrends } from '@/ai/flows/summarize-mood-trends';
import type { SummarizeTrendsInput, SummarizeTrendsOutput } from '@/ai/flows/summarize-mood-trends';
import { useTypewriter } from '@/hooks/useTypewriter';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface TrendSummaryDisplayProps {
  historyData: SummarizeTrendsInput['historyData'];
}

const TrendSummaryDisplay: React.FC<TrendSummaryDisplayProps> = ({ historyData }) => {
  const [result, setResult] = useState<SummarizeTrendsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayedSummary = useTypewriter(result?.summary ?? '', 25);

  useEffect(() => {
    const getSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setResult(null); // Clear previous result
        const aiResult = await summarizeTrends({ historyData });
        setResult(aiResult);
      } catch (e) {
        console.error("Failed to get trend summary:", e);
        setError("Could not generate mood analysis at this time.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (historyData && historyData.length > 0) {
      getSummary();
    } else {
      setIsLoading(false);
    }
  }, [historyData]);

  if (isLoading) {
    return (
      <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
        </div>
     );
  }

  if (!result) return null;

  return (
    <p className="text-base text-foreground/90 transition-all duration-500">
      {displayedSummary}
    </p>
  );
};

export default TrendSummaryDisplay;
