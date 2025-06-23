
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      // Use a static, safe background color that doesn't rely on potentially broken CSS variables
      style={{ backgroundColor: 'hsl(220, 15%, 20%)' }}
    >
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto text-center frosted-glass shadow-soft rounded-2xl p-8"
        >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 mb-6">
                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
                Oops! Something went wrong.
            </h1>

            <p className="text-base text-foreground/80 mb-6">
                We encountered an unexpected issue. Please try again, or the problem may resolve itself shortly.
            </p>
            
            <Button
                onClick={() => reset()}
                size="lg"
                className="interactive-glow"
            >
                Try Again
            </Button>
            
            {error?.message && (
                <details className="mt-6 text-left">
                    <summary className="text-xs text-foreground/50 cursor-pointer hover:text-foreground/70">
                        Error Details
                    </summary>
                    <p className="mt-2 text-xs text-foreground/50 bg-black/20 p-2 rounded-md font-mono whitespace-pre-wrap">
                        {error.digest ? `Digest: ${error.digest}\n` : ''}
                        {error.message}
                    </p>
                </details>
            )}
      </motion.div>
    </div>
  );
}
