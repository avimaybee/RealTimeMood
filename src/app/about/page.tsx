import { MoodProvider } from '@/contexts/MoodContext';
import AboutPageContent from '@/components/AboutPageContent';

export default function AboutPage() {
  return (
    <MoodProvider>
      <AboutPageContent />
    </MoodProvider>
  );
}
