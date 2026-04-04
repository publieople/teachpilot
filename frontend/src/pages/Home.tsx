import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedCard } from '@/components/magic/animated-card'
import { TextReveal } from '@/components/magic/text-reveal'
import { Loader2, Sparkles, Upload, Presentation, MessageSquare } from 'lucide-react'

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
    <div className="relative min-h-screen">
      {/* 创意背景 */}
      <div className="fixed inset-0 bg-gradient-mesh bg-noise -z-10" />
      
      {/* 欢迎区域 */}
      {messages.length === 0 && (
        <div className="space-y-12 py-12">
          {/* 标题区域 */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI 驱动的教学设计助手
            </div>
            
            <TextReveal 
              text="让教学设计变得简单而优雅"
              className="text-5xl font-bold justify-center bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent"
            />
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              告诉我你的教学想法，我来帮你制作精美的课件
              <br />
              <span className="text-sm">支持 PPT、Word 教案、动画和互动内容一键生成</span>
            </p>
          </div>

          {/* 功能卡片 - 打破常规的布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
            <FeatureCard
              icon={MessageSquare}
              title="智能对话"
              description="自然语言交流，主动提问帮你理清教学思路"
              delay={0.1}
              gradient="from-blue-500/20 to-cyan-500/20"
              accent="text-blue-500"
            />
            
            <FeatureCard
              icon={Upload}
              title="多模态参考"
              description="上传 PDF、Word、视频等资料，智能提取关键信息"
              delay={0.2}
              gradient="from-purple-500/20 to-pink-500/20"
              accent="text-purple-500"
            />
            
            <FeatureCard
              icon={Presentation}
              title="一键生成"
              description="PPT、教案、动画、互动游戏，应有尽有"
              delay={0.3}
              gradient="from-orange-500/20 to-red-500/20"
              accent="text-orange-500"
            />
          </div>

          {/* 装饰性元素 */}
          <div className="fixed bottom-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="fixed top-40 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      )}

      {/* 对话界面 */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <ScrollArea className="h-[calc(100vh-300px)] p-6">
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-fade-in-up">
                    <div className="bg-card border border-border rounded-2xl px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </AnimatedCard>
        </div>
      )}
    </div>
  )
}

// 功能卡片组件
interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  delay: number
  gradient: string
  accent: string
}

function FeatureCard({ icon: Icon, title, description, delay, gradient, accent }: FeatureCardProps) {
  return (
    <div
      className="group relative p-8 rounded-3xl bg-card border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* 渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* 内容 */}
      <div className="relative z-10 space-y-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-7 h-7 ${accent}`} />
        </div>
        
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {/* 装饰箭头 */}
        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
          <span className="text-sm font-medium">了解更多</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
      
      {/* 光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
