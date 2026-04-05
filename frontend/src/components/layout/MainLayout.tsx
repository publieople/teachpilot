import { Sidebar } from './Sidebar';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';
import { useUIStore } from '@/stores/uiStore';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MainLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
  onNavigate?: (page: 'chat' | 'courseware' | 'knowledge' | 'settings') => void;
}

export function MainLayout({ children, onNewChat, onNavigate }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 侧边栏 */}
      <Sidebar onNewChat={onNewChat} onNavigate={onNavigate} />

      {/* 主内容区域 */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部导航栏 - 仅在移动端显示 */}
        <header className="flex items-center justify-between border-b bg-background p-4 md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold">TeachPilot</span>
          </div>
          <ThemeSwitch />
        </header>

        {/* 桌面端顶部主题切换 - 绝对定位到右上角 */}
        <div className="absolute right-4 top-4 z-50 hidden md:block">
          <ThemeSwitch />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
