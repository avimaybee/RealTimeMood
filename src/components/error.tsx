
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

  const isAuthDomainError = error?.message?.includes('auth/unauthorized-domain');

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
                {isAuthDomainError ? "Firebase Domain Not Authorized" : "Oops! Something went wrong."}
            </h1>
            
            {isAuthDomainError ? (
                <div className="text-base text-foreground/80 mb-6 text-left space-y-3">
                    <p>
                        Your app's current domain is not authorized for Firebase authentication. This is a configuration issue, not a bug.
                    </p>
                    <p>
                       To fix this, go to your <strong className="text-foreground">Firebase Console → Authentication → Settings → Authorized domains</strong> and add a new domain.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                        <li>
                           Add the <strong className="text-foreground">domain name only</strong> (e.g., <code className="bg-black/20 px-1 py-0.5 rounded">my-app.com</code>).
                        </li>
                        <li>
                            Do <strong className="text-foreground">not</strong> include <code className="bg-black/20 px-1 py-0.5 rounded">https://</code> or other protocols.
                        </li>
                         <li>
                           For local development, add <code className="bg-black/20 px-1 py-0.5 rounded">localhost</code>.
                        </li>
                        <li>
                            Double-check for typos.
                        </li>
                    </ul>
                </div>
            ) : (
                <p className="text-base text-foreground/80 mb-6">
                    We encountered an unexpected issue. Please try again, or the problem may resolve itself shortly.
                </p>
            )}

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
