import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Send, Sparkles, Upload, Settings } from 'lucide-react'
import { GradientButton } from '@/components/magic/gradient-button'
import { AnimatedCard } from '@/components/magic/animated-card'
import { TextReveal } from '@/components/magic/text-reveal'

function App() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          temperature: 0.7,
          max_tokens: 2048
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || '请求失败')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `错误：${error instanceof Error ? error.message : '未知错误'}` 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TeachPilot
                </h1>
                <p className="text-sm text-gray-500">多模态 AI 互动式教学智能体</p>
              </div>
            </div>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <button>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>设置</DialogTitle>
                  <DialogDescription>
                    配置你的教学助手偏好
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-500">设置功能开发中...</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 欢迎区域 */}
        {messages.length === 0 && (
          <div className="text-center mb-8">
            <TextReveal 
              text="👋 你好！我是你的教学助手"
              className="text-3xl font-bold justify-center mb-4 text-gray-800"
            />
            <p className="text-gray-600 text-lg">
              告诉我你的教学设计想法，我来帮你制作课件
            </p>
          </div>
        )}

        {/* 功能卡片 */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard delay={0.1}>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>💬 多轮对话</CardTitle>
                  <CardDescription>
                    通过自然对话描述你的教学需求，我会主动提问帮你理清思路
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>📎 多模态参考</CardTitle>
                  <CardDescription>
                    上传 PDF、Word、PPT、视频等资料，我会参考其中的内容生成课件
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle>📊 自动生成</CardTitle>
                  <CardDescription>
                    一键生成 PPT 课件和 Word 教案，支持迭代优化和导出
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedCard>
          </div>
        )}

        {/* 对话区域 */}
        <AnimatedCard>
          <Card className="border-0 shadow-none">
            {/* 消息列表 */}
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            {/* 输入区域 */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-4">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="输入你的教学想法..."
                  className="flex-1"
                  disabled={loading}
                />
                <GradientButton onClick={sendMessage} disabled={loading || !message.trim()}>
                  <Send className="w-4 h-4" />
                  发送
                </GradientButton>
              </div>
            </div>
          </Card>
        </AnimatedCard>
      </main>
    </div>
  )
}

export default App
