import { Bell, Settings, User, Search, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* 左侧 - Logo + 项目选择 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo - 带光晕效果 */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TeachPilot
              </span>
              <p className="text-xs text-muted-foreground -mt-1">AI 教学助手</p>
            </div>
          </div>
          
          <Select defaultValue="heartbeat">
            <SelectTrigger className="w-[200px] glass">
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heartbeat">教学设计基础</SelectItem>
              <SelectItem value="math">初中数学</SelectItem>
              <SelectItem value="physics">高中物理</SelectItem>
              <SelectItem value="english">英语教学</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 中间 - 搜索框 */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="搜索文件、课件、知识库..."
              className="pl-10 glass group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* 右侧 - 操作按钮 */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </Button>
          
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Settings className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
