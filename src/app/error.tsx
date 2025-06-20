
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
        <p className="text-lg mb-2">
          We encountered an unexpected issue. Please try again.
        </p>
        {error?.message && (
           <p className="text-sm text-muted-foreground mb-6">Error: {error.message}</p>
        )}
        <Button
          onClick={() => reset()}
          size="lg"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
