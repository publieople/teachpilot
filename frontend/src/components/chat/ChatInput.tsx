import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, Paperclip, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isRecording?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onFileUpload,
  onVoiceStart,
  onVoiceStop,
  isRecording = false,
  disabled = false,
  placeholder = '输入消息...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled && !isComposing) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter 发送
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  };

  return (
    <div className="w-full border-t bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-lg border bg-card p-2 shadow-sm">
          {/* 文件上传按钮 */}
          <div className="flex-shrink-0">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.mkv"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={disabled}
              className="h-10 w-10"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* 文本输入框 */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none border-none bg-transparent px-2 py-2 text-sm outline-none focus:ring-0 disabled:opacity-50',
              'max-h-[200px] min-h-[40px]'
            )}
          />

          {/* 语音输入按钮 */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceClick}
              disabled={disabled}
              className={cn(
                'h-10 w-10',
                isRecording && 'text-red-500 hover:text-red-600'
              )}
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* 发送按钮 */}
          <div className="flex-shrink-0">
            <Button
              onClick={handleSubmit}
              disabled={disabled || !message.trim() || isComposing}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          按 Ctrl/Cmd + Enter 发送消息
        </p>
      </div>
    </div>
  );
}
