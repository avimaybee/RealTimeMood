
import { MoodProvider } from '@/contexts/MoodContext';
import HistoryPageContent from '@/components/HistoryPageContent';

export default function HistoryPage() {
  return (
    <MoodProvider>
      <HistoryPageContent />
    </MoodProvider>
  );
}
