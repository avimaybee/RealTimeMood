'use server';

import type { CollectiveMoodState, HistoricalMoodSnapshot } from '@/types';

const SNAPSHOTS_STORAGE_KEY = 'moodSnapshots';
const ARCHIVE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches historical mood snapshots from localStorage.
 * @returns A promise that resolves to an array of historical snapshots.
 */
export async function fetchHistoricalSnapshots(): Promise<HistoricalMoodSnapshot[]> {
  try {
    const stored = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (stored) {
      // Parse and ensure timestamp is a Date object
      const snapshots = JSON.parse(stored).map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      }));
      return snapshots.sort((a: HistoricalMoodSnapshot, b: HistoricalMoodSnapshot) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch historical snapshots:", error);
    return [];
  }
}

/**
 * Checks if a new historical mood snapshot is needed and creates one if so.
 * This function is designed to be called from the client-side.
 */
export async function archiveCollectiveMoodIfNeeded(): Promise<void> {
  try {
    const snapshots = await fetchHistoricalSnapshots();

    // 1. Check when the last snapshot was taken
    if (snapshots.length > 0) {
      const lastSnapshotTime = snapshots[0].timestamp.getTime();
      if (Date.now() - lastSnapshotTime < ARCHIVE_COOLDOWN_MS) {
        console.log('Archiving is still on cooldown. Skipping.');
        return; // It's not time yet
      }
    }

    // 2. If it's time, fetch the current collective mood from localStorage
    console.log('Archiving cooldown has passed. Creating a new snapshot.');
    const collectiveMoodStr = localStorage.getItem('mockCollectiveMood');
    if (!collectiveMoodStr) {
      console.warn('Cannot create snapshot: Collective mood data not found in localStorage.');
      return;
    }
    const moodData = JSON.parse(collectiveMoodStr) as CollectiveMoodState;

    // 3. Create and write the new snapshot document
    const newSnapshot: HistoricalMoodSnapshot = {
      timestamp: new Date(),
      hue: moodData.h,
      saturation: moodData.s,
      lightness: moodData.l,
      moodAdjective: moodData.moodAdjective,
      contributionCount: moodData.totalContributions,
    };

    const updatedSnapshots = [newSnapshot, ...snapshots];
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updatedSnapshots));
    console.log('Successfully created a new historical mood snapshot.');

  } catch (error) {
    console.error("Historical mood archiving failed:", error);
  }
}
