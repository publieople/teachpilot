import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ChatInput } from './ChatInput'

interface MainLayoutProps {
  onSendMessage?: (message: string) => void
  isLoading?: boolean
}

export function MainLayout({ onSendMessage, isLoading }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="ml-60 pb-24 transition-all duration-300">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
      
      <ChatInput onSend={onSendMessage || (() => {})} isLoading={isLoading} />
    </div>
  )
}
