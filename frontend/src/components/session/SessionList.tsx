import { useEffect, useState } from 'react';
import { SessionItem } from './SessionItem';
import { useSessionStore } from '@/stores/sessionStore';
import { type Session } from '@/services/session';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SessionListProps {
  onSessionSelect?: (sessionId: string) => void;
  onNewSession?: () => void;
  className?: string;
}

export function SessionList({ onSessionSelect, onNewSession, className }: SessionListProps) {
  const { sessions, currentSessionId, fetchSessions, isCreating } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  // 过滤会话
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect?.(sessionId);
  };

  const handleNewSession = () => {
    onNewSession?.();
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* 新建会话按钮 */}
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 rounded-lg"
          onClick={handleNewSession}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          {isCreating ? '创建中...' : '新建对话'}
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索会话..."
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
            <p>{searchQuery ? '未找到匹配的会话' : '暂无会话历史'}</p>
            {!searchQuery && (
              <p className="mt-2 text-xs">开始新的对话来创建会话</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onClick={handleSessionClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
