import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  FileText,
  BookOpen,
  Settings,
  FolderOpen,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewChat?: () => void;
  onNavigate?: (page: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings') => void;
}

export function Sidebar({ onNewChat, onNavigate }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, activePage, setActivePage } = useUIStore();

  const handleNavigate = (page: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings') => {
    setActivePage(page);
    onNavigate?.(page);
    // 移动端自动关闭侧边栏
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { id: 'chat' as const, icon: MessageSquare, label: '对话' },
    { id: 'courseware' as const, icon: FileText, label: '课件' },
    { id: 'knowledge' as const, icon: BookOpen, label: '知识库' },
    { id: 'files' as const, icon: FolderOpen, label: '文件' },
    { id: 'settings' as const, icon: Settings, label: '设置' },
  ] as const;

  return (
    <>
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0 md:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'border-border'
        )}
      >
        <div className="flex h-full flex-col">
          {/* 顶部区域 */}
          <div className="flex items-center justify-between border-b p-4">
            <h1 className="text-lg font-semibold">TeachPilot</h1>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 新建对话按钮 */}
          <div className="p-4">
            <Button
              className="w-full justify-start gap-2"
              onClick={() => {
                onNewChat?.();
                handleNavigate('chat');
              }}
            >
              <Plus className="h-4 w-4" />
              新建对话
            </Button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  activePage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* 底部信息 */}
          <div className="border-t p-4 text-xs text-muted-foreground">
            <p>TeachPilot v0.1.0</p>
            <p className="mt-1">多模态 AI 互动式教学智能体</p>
          </div>
        </div>
      </aside>
    </>
  );
}
