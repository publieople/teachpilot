import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  FolderOpen,
  Presentation,
  Database,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  {
    group: '核心功能',
    items: [
      { icon: MessageSquare, label: '对话', href: '/' },
      { icon: FolderOpen, label: '文件管理', href: '/files' },
      { icon: Presentation, label: '课件生成', href: '/generate' },
    ]
  },
  {
    group: '知识管理',
    items: [
      { icon: Database, label: '知识库', href: '/knowledge' },
      { icon: GitBranch, label: '版本历史', href: '/versions' },
    ]
  },
  {
    group: '设置',
    items: [
      { icon: Settings, label: '偏好设置', href: '/settings' },
    ]
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-40 border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full border bg-background flex items-center justify-center hover:bg-accent"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <div className="flex flex-col h-full py-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group} className="mb-6">
            {/* 分组标题 */}
            <div className={cn(
              "px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
              collapsed && "text-center px-0"
            )}>
              {collapsed ? <group.icon className="w-4 h-4 mx-auto" /> : group.group}
            </div>
            
            {/* 导航项 */}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}
