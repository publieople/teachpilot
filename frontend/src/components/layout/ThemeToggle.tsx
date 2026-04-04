import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('Light')}>
          <Sun className="w-4 h-4 mr-2" />
          浅色
          {theme === 'Light' && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('Dark')}>
          <Moon className="w-4 h-4 mr-2" />
          深色
          {theme === 'Dark' && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('OS')}>
          <Monitor className="w-4 h-4 mr-2" />
          跟随系统
          {theme === 'OS' && <Check className="w-4 h-4 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
