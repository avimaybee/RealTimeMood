
import HistoryPageContent from '@/components/HistoryPageContent';
import { MoodProvider } from '@/contexts/MoodContext';

export default function HistoryPage() {
  return (
    <MoodProvider>
       <HistoryPageContent />
    </MoodProvider>
  );
}
