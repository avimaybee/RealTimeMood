
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PlatformProvider } from '@/contexts/PlatformContext';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F1F1F" />
      </head>
      <body className="antialiased">
        <PlatformProvider>
          {children}
          <Toaster />
        </PlatformProvider>
      </body>
    </html>
  );
}
