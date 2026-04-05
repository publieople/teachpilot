import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';

export function ThemeToggle() {
  const { theme, setColorScheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'Light':
        return <Sun className="h-4 w-4" />;
      case 'Dark':
        return <Moon className="h-4 w-4" />;
      case 'OS':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'Light':
        return '亮色模式';
      case 'Dark':
        return '暗色模式';
      case 'OS':
        return '跟随系统';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          title="切换主题"
        >
          {getIcon()}
          <span className="sr-only">{getLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={(e) => setColorScheme('Light', e.nativeEvent as MouseEvent)}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>亮色模式</span>
          {theme === 'Light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => setColorScheme('Dark', e.nativeEvent as MouseEvent)}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>暗色模式</span>
          {theme === 'Dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => setColorScheme('OS', e.nativeEvent as MouseEvent)}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>跟随系统</span>
          {theme === 'OS' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
