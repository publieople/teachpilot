import { useState } from 'react'
import { Send, Paperclip, Mic, Sparkles, Loader2, FileText, Gamepad2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (!message.trim() || isLoading) return
    onSend(message)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 z-50">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        {/* 左侧 - 附件 */}
        <Button variant="ghost" size="icon" className="shrink-0" title="上传文件">
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* 左侧 - 语音 */}
        <Button variant="ghost" size="icon" className="shrink-0" title="语音输入">
          <Mic className="w-5 h-5" />
        </Button>

        {/* 中间 - 输入框 */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="💬 告诉我想设计什么课程... (Enter 发送，Shift+Enter 换行)"
            className="min-h-[60px] max-h-[200px] resize-none pr-12"
            rows={1}
            disabled={isLoading}
          />
          
          {/* 右侧 - 快捷指令 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                title="快捷指令"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                生成教案
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Presentation className="w-4 h-4 mr-2" />
                生成 PPT
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Gamepad2 className="w-4 h-4 mr-2" />
                生成互动游戏
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 右侧 - 发送 */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
