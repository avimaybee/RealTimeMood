
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PlatformProvider } from '@/contexts/PlatformContext';
import { cn } from '@/lib/utils';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'RealTimeMood',
  description: 'Experience the collective global mood, dynamically visualized.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F1F1F" />
      </head>
      <body className={cn("antialiased font-sans", manrope.variable)}>
        <PlatformProvider>
          {children}
        </PlatformProvider>
        <Toaster />
      </body>
    </html>
  );
}
