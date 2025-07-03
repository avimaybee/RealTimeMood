'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  collection,
  getDoc,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { CollectiveMoodState, HistoricalMoodSnapshot } from '@/types';

const COLLECTIVE_MOOD_DOC_PATH = 'appState/collectiveMood';
const SNAPSHOTS_COLLECTION_PATH = 'moodSnapshots';
const ARCHIVE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

/**
 * Checks if a new historical mood snapshot is needed and creates one if so.
 * This function is designed to be called from the client-side, e.g., when a
 * user visits the history page.
 */
export async function archiveCollectiveMoodIfNeeded(): Promise<void> {
  try {
    const snapshotsCollection = collection(db, SNAPSHOTS_COLLECTION_PATH);

    // 1. Check when the last snapshot was taken
    const latestSnapshotQuery = query(snapshotsCollection, orderBy('timestamp', 'desc'), limit(1));
    const latestSnapshotDocs = await getDocs(latestSnapshotQuery);

    if (!latestSnapshotDocs.empty) {
      const lastSnapshot = latestSnapshotDocs.docs[0].data() as HistoricalMoodSnapshot;
      if (lastSnapshot.timestamp) {
         // Firestore timestamps need to be converted to JS Dates for comparison
        const lastSnapshotTime = (lastSnapshot.timestamp as Timestamp).toMillis();
        if (Date.now() - lastSnapshotTime < ARCHIVE_COOLDOWN_MS) {
          console.log('Archiving is still on cooldown. Skipping.');
          return; // It's not time yet
        }
      }
    }

    // 2. If it's time, fetch the current collective mood
    console.log('Archiving cooldown has passed. Creating a new snapshot.');
    const collectiveMoodRef = doc(db, COLLECTIVE_MOOD_DOC_PATH);
    const collectiveMoodDoc = await getDoc(collectiveMoodRef);

    if (!collectiveMoodDoc.exists()) {
      console.warn('Cannot create snapshot: Collective mood document does not exist.');
      return;
    }

    const moodData = collectiveMoodDoc.data() as CollectiveMoodState;

    // 3. Create and write the new snapshot document
    const newSnapshot: Omit<HistoricalMoodSnapshot, 'timestamp'> & { timestamp: any } = {
      timestamp: serverTimestamp(),
      hue: moodData.h,
      saturation: moodData.s,
      lightness: moodData.l,
      moodAdjective: moodData.moodAdjective,
      contributionCount: moodData.totalContributions,
    };
    
    await addDoc(snapshotsCollection, newSnapshot);
    console.log('Successfully created a new historical mood snapshot.');

  } catch (error) {
    console.error("Historical mood archiving failed:", error);
    // We don't rethrow here because this is a background task that shouldn't
    // interrupt the user's experience on the history page.
  }
}
