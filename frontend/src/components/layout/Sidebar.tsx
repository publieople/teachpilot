import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Button } from '@/components/ui/Button';
import { SessionList } from '@/components/session/SessionList';
import {
  MessageSquare,
  FileText,
  BookOpen,
  Settings,
  FolderOpen,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewChat?: () => void;
  onNavigate?: (page: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings') => void;
}

export function Sidebar({ onNewChat, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, activePage, setActivePage } = useUIStore();
  const { currentSessionId, switchSession, createTemporarySession, clearCurrentSession } = useSessionStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigate = (page: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings') => {
    setActivePage(page);
    onNavigate?.(page);
    // 导航到对应页面
    navigate(`/${page === 'chat' ? '' : page}`);
    // 移动端自动关闭侧边栏
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    await switchSession(sessionId, navigate);
    // 移动端选择会话后关闭侧边栏
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleNewSession = () => {
    // 创建临时会话
    const tempId = createTemporarySession();
    clearCurrentSession();
    // 导航到 /chat（不显示临时 ID）
    navigate('/chat', { replace: true });
    onNewChat?.();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out md:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'border-border',
          isCollapsed ? 'md:w-16' : 'md:w-72'
        )}
      >
        {/* 顶部区域 - 标题和折叠按钮 */}
        <div className={cn(
          'flex items-center justify-between border-b p-3 transition-all duration-300',
          isCollapsed && 'md:justify-center md:px-2'
        )}>
          <div className={cn(
            'flex items-center gap-2 overflow-hidden transition-all duration-300',
            isCollapsed ? 'md:w-0 md:opacity-0' : 'md:w-auto md:opacity-100'
          )}>
            <h1 className="text-lg font-semibold whitespace-nowrap">TeachPilot</h1>
          </div>
          <div className="flex items-center gap-1">
            {/* 折叠/展开按钮 (桌面端) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-lg"
              onClick={toggleCollapse}
              title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            {/* 关闭按钮 (移动端) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 会话历史区域 */}
        <div className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          isCollapsed && 'md:hidden'
        )}>
          <SessionList
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>

        {/* 底部导航区域 */}
        <div className={cn(
          'border-t p-3 transition-all duration-300',
          isCollapsed && 'md:px-2'
        )}>
          {/* 导航菜单 */}
          <nav className={cn(
            'space-y-1',
            isCollapsed && 'md:space-y-2'
          )}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                  activePage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && 'md:justify-center md:px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  'whitespace-nowrap transition-all duration-300',
                  isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'md:w-auto md:opacity-100'
                )}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* 底部信息 */}
          <div className={cn(
            'mt-4 flex items-center justify-between text-xs text-muted-foreground transition-all duration-300',
            isCollapsed ? 'md:justify-center' : ''
          )}>
            <span className={cn(
              'whitespace-nowrap transition-all duration-300',
              isCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden md:h-0' : 'md:w-auto md:opacity-100'
            )}>
              TeachPilot v0.1.0
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </aside>
    </>
  );
}
