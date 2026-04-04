import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedCard } from '@/components/magic/animated-card'
import { TextReveal } from '@/components/magic/text-reveal'
import { Loader2 } from 'lucide-react'

interface Message {
  role: string
  content: string
}

interface HomePageProps {
  messages: Message[]
  loading: boolean
}

export default function HomePage({ messages, loading }: HomePageProps) {
  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      {messages.length === 0 && (
        <>
          <div className="text-center py-12">
            <TextReveal 
              text="👋 你好！我是你的教学助手"
              className="text-3xl font-bold justify-center mb-4 text-foreground"
            />
            <p className="text-muted-foreground text-lg">
              告诉我你的教学设计想法，我来帮你制作课件
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard delay={0.1}>
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">💬 多轮对话</h3>
                <p className="text-muted-foreground text-sm">
                  通过自然对话描述你的教学需求，我会主动提问帮你理清思路
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">📎 多模态参考</h3>
                <p className="text-muted-foreground text-sm">
                  上传 PDF、Word、PPT、视频等资料，我会参考其中的内容生成课件
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="p-6">
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">📊 自动生成</h3>
                <p className="text-muted-foreground text-sm">
                  一键生成 PPT 课件和 Word 教案，支持迭代优化和导出
                </p>
              </div>
            </AnimatedCard>
          </div>
        </>
      )}

      {/* 对话历史 */}
      {messages.length > 0 && (
        <AnimatedCard>
          <ScrollArea className="h-[calc(100vh-300px)] p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">思考中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </AnimatedCard>
      )}
    </div>
  )
}
