
import { NextResponse } from 'next/server';
import type { Mood } from '@/types';

// This is a mock API endpoint. In a real application, this data would be fetched
// from a database like Firebase Firestore, which would be updated by user contributions.
// The current app is a client-side simulation, so we return a static representation.

const MOCK_MOOD: Mood = {
  hue: 210,
  saturation: 100,
  lightness: 70,
  name: "Calm Blue",
  adjective: "Calm",
};

export async function GET() {
  const response = {
    moodAdjective: MOCK_MOOD.adjective,
    collectiveMood: {
      hue: MOCK_MOOD.hue,
      saturation: MOCK_MOOD.saturation,
      lightness: MOCK_MOOD.lightness,
    },
    lastUpdateTimestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

// To prevent Next.js from caching this route, we can export this variable.
// This ensures that every request to this endpoint gets a fresh timestamp.
export const dynamic = 'force-dynamic';
