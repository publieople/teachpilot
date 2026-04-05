import { MainLayout } from '@/components/layout/MainLayout';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSettingsStore } from '@/stores/settingsStore';
import { User, Key, Bell, Palette, Info, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function SettingsPage() {
  const {
    openRouterApiKey,
    modelId,
    desktopNotifications,
    soundEffects,
    setApiKey,
    setModelId,
    setDesktopNotifications,
    setSoundEffects,
    resetSettings,
  } = useSettingsStore();

  const handleSave = () => {
    // 设置已自动保存到 localStorage
    toast.success('设置已保存');
    
    // 验证 API Key 格式
    if (openRouterApiKey && !openRouterApiKey.startsWith('sk-')) {
      toast.warning('API Key 格式可能不正确，通常以 sk- 开头');
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？')) {
      resetSettings();
      toast.success('设置已重置');
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setApiKey(value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModelId(e.target.value);
  };

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
            <span className="text-sm">访客用户</span>
          </div>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            💡 提示：当前为访客模式，所有设置仅保存在本地浏览器中
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
            <div className="flex items-center gap-2">
              <p className="font-medium">OpenRouter API Key</p>
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">
                必需
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              用于连接大语言模型服务
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline"
              >
                获取 API Key →
              </a>
            </p>
            <input
              type="password"
              value={openRouterApiKey}
              onChange={handleApiKeyChange}
              placeholder="sk-..."
              className="mt-2 w-full rounded-md border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {openRouterApiKey && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ API Key 已配置
              </p>
            )}
            {!openRouterApiKey && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                ⚠ 未配置 API Key，对话功能可能无法使用
              </p>
            )}
          </div>
          <div>
            <p className="font-medium">模型选择</p>
            <p className="text-sm text-muted-foreground">
              选择使用的 AI 模型
            </p>
            <select
              value={modelId}
              onChange={handleModelChange}
              className="mt-2 w-full rounded-md border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="qwen/qwen3.6-plus:free">Qwen3.6-Plus (免费)</option>
              <option value="qwen/qwen-plus">Qwen-Plus (付费)</option>
              <option value="qwen/qwen-max">Qwen-Max (付费)</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="openai/gpt-4o">GPT-4o</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              💡 免费模型可能有使用限制，付费模型按 Token 计费
            </p>
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
                接收 AI 回复时显示桌面通知
              </p>
            </div>
            <input
              type="checkbox"
              checked={desktopNotifications}
              onChange={(e) => setDesktopNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">提示音</p>
              <p className="text-sm text-muted-foreground">
                AI 回复完成时播放提示音
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="h-4 w-4"
            />
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
          <div className="mt-4 rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>技术栈：</strong>FastAPI + React 18 + TypeScript + Qwen3.6-Plus + ChromaDB + BGE-M3
            </p>
          </div>
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

        {/* 操作按钮 */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            重置设置
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            保存设置
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
