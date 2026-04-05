import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSwitch() {
  const { theme, setColorScheme } = useTheme();

  const options = [
    { value: 'Light' as const, icon: Sun, label: '亮色' },
    { value: 'OS' as const, icon: Monitor, label: '自动' },
    { value: 'Dark' as const, icon: Moon, label: '暗色' },
  ] as const;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-background p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={(e) => setColorScheme(option.value, e.nativeEvent as MouseEvent)}
          className={cn(
            'relative flex items-center justify-center rounded-full p-2 transition-all',
            'h-8 w-8',
            theme === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={option.label}
        >
          <option.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
