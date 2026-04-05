import { create } from 'zustand';
import type { Message } from '@/services/chat';

interface ChatState {
  // 当前对话 ID
  currentChatId: string | null;
  // 对话列表
  chats: Array<{
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }>;
  // 当前对话的消息列表
  messages: Message[];
  // 是否正在生成回复
  isGenerating: boolean;
  // 错误信息
  error: string | null;
  
  // Actions
  setCurrentChatId: (id: string | null) => void;
  setChats: (chats: Array<{ id: string; title: string; created_at: string; updated_at: string }>) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentChatId: null,
  chats: [],
  messages: [],
  isGenerating: false,
  error: null,

  setCurrentChatId: (id) => set({ currentChatId: id }),
  
  setChats: (chats) => set({ chats }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  
  setError: (error) => set({ error }),
  
  clearCurrentChat: () =>
    set({
      currentChatId: null,
      messages: [],
      error: null,
    }),
}));
