import { useState } from 'react';
import { User, Bot, Copy, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { cn } from '@/lib/utils';
import type { Message } from '@/services/chat';
import { useTTS } from '@/hooks/useTTS';
import { toast } from 'sonner';

interface MessageItemProps {
  message: Message;
  onCopy?: (content: string) => void;
}

export function MessageItem({ message, onCopy }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isUser = message.role === 'user';
  
  // TTS Hook
  const {
    isGenerating,
    generateSpeech,
    play,
    stop,
  } = useTTS({ autoPlay: false });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTTS = async () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }
    
    try {
      const audioUrl = await generateSpeech(message.content);
      if (audioUrl) {
        await play(audioUrl);
        setIsPlaying(true);
      }
    } catch (err) {
      toast.error('语音播放失败');
      console.error('TTS 错误:', err);
    }
  };

  // 清理播放状态
  const handleTTSStop = () => {
    stop();
    setIsPlaying(false);
  };

  return (
    <div
      className={cn(
        'group flex w-full gap-4 p-4',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* 消息内容 */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {isUser ? '您' : 'AI 助手'}
          </span>
        </div>

        <div className="markdown-content">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* 操作按钮 */}
        {!isUser && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {/* 朗读按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7',
                isPlaying && 'text-green-500 hover:text-green-600'
              )}
              onClick={isPlaying ? handleTTSStop : handleTTS}
              disabled={isGenerating}
              title="朗读此消息"
            >
              <Volume2 className={cn('h-3.5 w-3.5', isPlaying && 'animate-pulse')} />
            </Button>
            
            {/* 复制按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
