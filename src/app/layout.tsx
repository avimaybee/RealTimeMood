
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F1F1F" />
      </head>
      <body className="antialiased font-sans">
        <PlatformProvider>
          {children}
          <Toaster />
        </PlatformProvider>
      </body>
    </html>
  );
}
