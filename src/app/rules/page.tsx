
import { MoodProvider } from '@/contexts/MoodContext';
import RulesPageContent from '@/components/RulesPageContent';

export default function RulesPage() {
  return (
    <MoodProvider>
      <RulesPageContent />
    </MoodProvider>
  );
}
