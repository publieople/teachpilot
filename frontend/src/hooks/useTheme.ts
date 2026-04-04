import { useEffect, useState } from 'react'

type Theme = 'OS' | 'Dark' | 'Light'

interface UseThemeReturn {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: (event?: MouseEvent, newTheme?: Theme) => void
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme
    return saved || 'OS'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = (event?: MouseEvent, newTheme?: Theme) => {
    const x = event?.clientX ?? window.innerWidth
    const y = event?.clientY ?? 0
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const targetTheme = newTheme || (theme === 'Dark' ? 'Light' : 'Dark')
    const isCurrentDark = document.documentElement.classList.contains('dark')
    const willBeDark = targetTheme === 'Dark' || (targetTheme === 'OS' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    // 检查是否支持 View Transitions API
    if (!document.startViewTransition || isReducedMotion()) {
      setThemeState(targetTheme)
      return
    }

    const transition = document.startViewTransition(() => {
      setThemeState(targetTheme)
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]
      
      document.documentElement.animate(
        { 
          clipPath: isCurrentDark === willBeDark ? clipPath : clipPath.reverse() 
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isCurrentDark === willBeDark 
            ? '::view-transition-old(root)' 
            : '::view-transition-new(root)'
        }
      )
    })
  }

  // 检测用户是否开启了动画减弱
  const isReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = () => {
      if (theme === 'OS') {
        root.classList.toggle('dark', mediaQuery.matches)
      } else {
        root.classList.toggle('dark', theme === 'Dark')
      }
    }

    applyTheme()

    // 监听系统主题变化
    const handleChange = () => {
      if (theme === 'OS') {
        applyTheme()
      }
    }

    // 兼容旧版浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // @ts-ignore
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // @ts-ignore
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme, toggleTheme }
}
