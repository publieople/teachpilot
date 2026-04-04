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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* 左侧 - Logo + 项目选择 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">TeachPilot</span>
          </div>
          
          <Select defaultValue="heartbeat">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heartbeat">教学设计基础</SelectItem>
              <SelectItem value="math">初中数学</SelectItem>
              <SelectItem value="physics">高中物理</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 中间 - 搜索框 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文件、课件、知识库..."
              className="pl-8"
            />
          </div>
        </div>

        {/* 右侧 - 操作按钮 */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          
          <ThemeToggle />
          
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
