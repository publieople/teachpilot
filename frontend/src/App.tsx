import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import { CoursewarePage } from './pages/CoursewarePage';
import { KnowledgePage } from './pages/KnowledgePage';
import { FilesPage } from './pages/FilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 聊天页面 - 支持会话 ID 路由 */}
        <Route path="/" element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
        
        {/* 其他页面 */}
        <Route path="/courseware" element={<CoursewarePage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* 重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster
        position="top-right"
        duration={3000}
        style={{
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }}
      />
    </BrowserRouter>
  );
}

export default App;
