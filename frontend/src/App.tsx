import { ChatPage } from './pages/ChatPage';
import { CoursewarePage } from './pages/CoursewarePage';
import { KnowledgePage } from './pages/KnowledgePage';
import { SettingsPage } from './pages/SettingsPage';
import { useUIStore } from './stores/uiStore';
import { Toaster } from 'sonner';

function App() {
  const { activePage } = useUIStore();

  const renderPage = () => {
    switch (activePage) {
      case 'chat':
        return <ChatPage />;
      case 'courseware':
        return <CoursewarePage />;
      case 'knowledge':
        return <KnowledgePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster
        position="top-right"
        duration={3000}
        style={{
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }}
      />
    </>
  );
}

export default App;
