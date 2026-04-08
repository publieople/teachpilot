import { useState, useRef, useEffect } from 'react';
import { MessageSquare, MoreVertical, Pencil, Trash2, Archive, Check, X } from 'lucide-react';
import { type Session } from '@/services/session';
import { useSessionStore } from '@/stores/sessionStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { toast } from 'sonner';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: (sessionId: string) => void;
}

export function SessionItem({ session, isActive, onClick }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { renameSession, deleteSessionById, archiveSession } = useSessionStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      onClick(session.id);
    }
  };

  const handleRename = async () => {
    if (editTitle.trim() && editTitle.trim() !== session.title) {
      try {
        await renameSession(session.id, editTitle.trim());
        toast.success('会话已重命名');
      } catch (err) {
        toast.error(`重命名失败：${(err as Error).message}`);
        setEditTitle(session.title);
      }
    } else {
      setEditTitle(session.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`确定要删除会话"${session.title}"吗？此操作不可恢复。`)) {
      return;
    }
    try {
      await deleteSessionById(session.id);
      toast.success('会话已删除');
    } catch (err) {
      toast.error(`删除失败：${(err as Error).message}`);
    }
    setShowMenu(false);
  };

  const handleArchive = async () => {
    try {
      await archiveSession(session.id, !session.is_archived);
      toast.success(session.is_archived ? '会话已取消归档' : '会话已归档');
    } catch (err) {
      toast.error(`归档失败：${(err as Error).message}`);
    }
    setShowMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground',
        isEditing && 'bg-accent'
      )}
      onClick={handleClick}
    >
      {/* 图标 */}
      <MessageSquare className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />

      {/* 标题 */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-sm">{session.title}</span>
      )}

      {/* 时间戳（仅在非活动状态显示） */}
      {!isActive && !isEditing && (
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
          {formatTime(session.updated_at)}
        </span>
      )}

      {/* 操作菜单 */}
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'rounded-lg p-1 opacity-0 transition-opacity hover:bg-accent-foreground/10',
              'group-hover:opacity-100',
              isActive && 'opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            重命名
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {session.is_archived ? '取消归档' : '归档'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 编辑操作按钮 */}
      {isEditing && (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleRename}
            className="rounded-lg p-1 hover:bg-accent-foreground/10"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditTitle(session.title);
              setIsEditing(false);
            }}
            className="rounded-lg p-1 hover:bg-accent-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
