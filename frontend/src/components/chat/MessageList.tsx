import { MessageItem } from './MessageItem';
import type { Message } from '@/services/chat';

interface MessageListProps {
  messages: Message[];
  isGenerating?: boolean;
  onCopy?: (content: string) => void;
}

export function MessageList({ messages, isGenerating = false, onCopy }: MessageListProps) {
  const messagesEndRef = document.createElement('div');

  // 自动滚动到底部
  if (messagesEndRef && messagesEndRef.scrollIntoView) {
    messagesEndRef.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl">
        {messages.length === 0 ? (
          // 空状态
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <h2 className="text-2xl font-semibold">开始新的对话</h2>
            <p className="mt-2 text-muted-foreground">
              输入您的问题或想法，AI 助手将帮助您设计教学课件
            </p>
          </div>
        ) : (
          // 消息列表
          <div className="divide-y">
            {messages.map((message, index) => (
              <MessageItem
                key={index}
                message={message}
                onCopy={onCopy}
              />
            ))}

            {/* 生成中标识 */}
            {isGenerating && (
              <div className="flex w-full gap-4 p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground" />
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">AI 正在思考...</span>
                </div>
              </div>
            )}

            <div ref={(el) => {
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
