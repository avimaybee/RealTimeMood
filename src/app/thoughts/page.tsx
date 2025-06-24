import CollectiveThoughtsPage from '@/components/CollectiveThoughtsPage';
import { MoodProvider } from '@/contexts/MoodContext';

export default function ThoughtsPage() {
  return (
    <MoodProvider isLivePage={true}>
      <CollectiveThoughtsPage />
    </MoodProvider>
  );
}
