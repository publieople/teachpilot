import { useEffect, useState, useCallback } from 'react';

type ColorScheme = 'OS' | 'Dark' | 'Light';

/**
 * 检测系统是否开启了动画减弱
 * @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-reduced-motion
 */
function isReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 切换主题 class
 */
function toggleDark(): void {
  document.documentElement.classList.toggle('dark');
}

/**
 * 判断当前是否是暗色模式
 */
function isDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * 判断系统是否是暗色模式
 */
function systemIsDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 主题切换 Hook
 * 参考 Open WebUI 的主题管理逻辑，支持三种模式：跟随系统、暗色、亮色
 * 使用 View Transitions API 实现扩散动画效果
 */
export function useTheme() {
  const [theme, setTheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    if (saved === 'OS' || saved === 'Dark' || saved === 'Light') {
      return saved;
    }
    return 'OS';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => isDark());

  /**
   * 切换主题，带扩散动画
   * 从点击位置开始圆形扩散
   */
  const toggleTheme = useCallback((event?: MouseEvent): void => {
    const willDark = !isDark();
    setIsDarkMode(willDark);

    // 不支持 View Transitions API 或用户开启动画减弱
    if (!document.startViewTransition || isReducedMotion()) {
      toggleDark();
      return;
    }

    // 开始 View Transition 动画
    const transition = document.startViewTransition(() => {
      toggleDark();
    });

    // 获取点击位置，从点击处扩散
    const x = event?.clientX ?? window.innerWidth;
    const y = event?.clientY ?? 0;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: willDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: willDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    });
  }, []);

  /**
   * 设置主题模式
   * @param scheme 要设置的主题
   * @param event 用户点击切换主题按钮的点击事件
   */
  const setColorScheme = useCallback((scheme: ColorScheme, event?: MouseEvent): void => {
    if (theme === scheme) return;

    const currentDark = isDark();

    switch (scheme) {
      case 'OS':
        // 跟随系统
        const systemDark = systemIsDark();
        if (currentDark !== systemDark) {
          toggleTheme(event);
        }
        setTheme('OS');
        break;
      case 'Dark':
        // 暗色模式
        if (!currentDark) {
          toggleTheme(event);
        }
        setTheme('Dark');
        break;
      case 'Light':
        // 亮色模式
        if (currentDark) {
          toggleTheme(event);
        }
        setTheme('Light');
        break;
    }

    localStorage.setItem('colorScheme', scheme);
  }, [theme, toggleTheme]);

  // 监听系统主题变化 (仅在跟随系统模式下)
  useEffect(() => {
    if (theme !== 'OS') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const systemDark = e.matches;
      const currentDark = isDark();
      if (systemDark !== currentDark) {
        toggleDark();
        setIsDarkMode(systemDark);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 初始化主题
  useEffect(() => {
    // 同步主题状态
    const syncTheme = () => {
      const currentDark = isDark();
      setIsDarkMode(currentDark);
    };

    if (theme === 'OS') {
      if (systemIsDark() !== isDark()) {
        toggleDark();
      }
    } else if (theme === 'Dark' && !isDark()) {
      toggleDark();
    } else if (theme === 'Light' && isDark()) {
      toggleDark();
    }
    
    syncTheme();
  }, []);

  return {
    theme,
    isDark: isDarkMode,
    toggleTheme,
    setColorScheme,
  };
}
