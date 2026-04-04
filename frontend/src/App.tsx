import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import HomePage from '@/pages/Home'
import FilesPage from '@/pages/Files'
import GeneratePage from '@/pages/Generate'
import KnowledgePage from '@/pages/Knowledge'
import VersionsPage from '@/pages/Versions'
import SettingsPage from '@/pages/Settings'

function App() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async (message: string) => {
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
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
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout onSendMessage={sendMessage} isLoading={loading} />}>
          <Route index element={<HomePage messages={messages} loading={loading} />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="generate" element={<GeneratePage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="versions" element={<VersionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
