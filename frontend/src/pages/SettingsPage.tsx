import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MainLayout } from '@/components/layout/MainLayout';
import { User, Key, Bell, Palette, Info } from 'lucide-react';

export function SettingsPage() {
  const settingsSections = [
    {
      title: '外观设置',
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">主题模式</p>
              <p className="text-sm text-muted-foreground">
                选择亮色、暗色或跟随系统
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      ),
    },
    {
      title: '账号设置',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">用户名</p>
              <p className="text-sm text-muted-foreground">
                当前登录用户
              </p>
            </div>
            <span className="text-sm">Guest</span>
          </div>
        </div>
      ),
    },
    {
      title: 'API 设置',
      icon: Key,
      content: (
        <div className="space-y-4">
          <div>
            <p className="font-medium">OpenRouter API Key</p>
            <p className="text-sm text-muted-foreground">
              用于连接大语言模型服务
            </p>
            <input
              type="password"
              placeholder="sk-..."
              className="mt-2 w-full rounded-md border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <p className="font-medium">模型选择</p>
            <p className="text-sm text-muted-foreground">
              选择使用的 AI 模型
            </p>
            <select className="mt-2 w-full rounded-md border bg-background px-4 py-2 text-sm outline-none focus:border-primary">
              <option value="qwen/qwen3.6-plus:free">Qwen3.6-Plus (免费)</option>
              <option value="qwen/qwen-plus">Qwen-Plus</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: '通知设置',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">桌面通知</p>
              <p className="text-sm text-muted-foreground">
                接收 AI 回复时显示通知
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">提示音</p>
              <p className="text-sm text-muted-foreground">
                播放提示音
              </p>
            </div>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      ),
    },
    {
      title: '关于',
      icon: Info,
      content: (
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">应用名称：</span>
            TeachPilot
          </p>
          <p>
            <span className="font-medium">版本：</span>
            0.1.0
          </p>
          <p>
            <span className="font-medium">描述：</span>
            多模态 AI 互动式教学智能体
          </p>
          <p>
            <span className="font-medium">参赛赛道：</span>
            第十七届服创大赛 A 类赛题 A04
          </p>
          <p>
            <span className="font-medium">命题企业：</span>
            锐捷网络
          </p>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理您的应用设置和偏好
          </p>
        </div>

        {/* 设置列表 */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="rounded-lg border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              {section.content}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
