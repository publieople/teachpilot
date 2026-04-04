import { useState } from 'react'
import { Send, Paperclip, Mic, Sparkles, Loader2, FileText, Gamepad2, Presentation } from 'lucide-react'
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
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 glass p-6 z-50">
      <div className="max-w-5xl mx-auto">
        {/* 快捷指令提示 */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>快捷指令：</span>
          <span className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">生成教案</span>
          <span className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">制作 PPT</span>
          <span className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">互动游戏</span>
        </div>
        
        <div className="flex items-end gap-3">
          {/* 左侧 - 附件 */}
          <Button variant="ghost" size="icon" className="shrink-0 glass hover:bg-primary/10 transition-all" title="上传文件">
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* 左侧 - 语音 */}
          <Button variant="ghost" size="icon" className="shrink-0 glass hover:bg-primary/10 transition-all" title="语音输入">
            <Mic className="w-5 h-5" />
          </Button>

          {/* 中间 - 输入框 */}
          <div className="flex-1 relative group">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="告诉我你想设计什么课程..."
              className="min-h-[60px] max-h-[200px] resize-none pr-12 glass group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
              rows={1}
              disabled={isLoading}
            />
            
            {/* 右侧 - 快捷指令 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 hover:bg-primary/10 transition-all"
                  title="快捷指令"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  生成教案
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Presentation className="w-4 h-4 mr-2 text-purple-500" />
                  生成 PPT
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Gamepad2 className="w-4 h-4 mr-2 text-orange-500" />
                  生成互动游戏
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 右侧 - 发送 */}
          <Button
            size="lg"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
