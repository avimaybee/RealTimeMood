
import { MoodProvider } from '@/contexts/MoodContext';
import MoodCalendarPageContent from '@/components/MoodCalendarPageContent';

export default function CalendarPage() {
  return (
    <MoodProvider>
      <MoodCalendarPageContent />
    </MoodProvider>
  );
}
