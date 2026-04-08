import { create } from 'zustand';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  getSessions,
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getSessionMessages,
  sendSessionMessage,
  streamSessionMessage,
  type Session,
  type Message,
} from '@/services/session';

// 临时会话接口（未持久化）
interface TemporarySession {
  id: string;
  title: string;
  created_at: string;
  isTemporary: boolean;
}

interface SessionState {
  // 当前会话
  currentSessionId: string | null;
  
  // 临时会话（未持久化）
  temporarySession: TemporarySession | null;
  
  // 会话列表
  sessions: Session[];
  
  // 当前会话的消息
  messages: Message[];
  
  // 加载状态
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isSending: boolean;
  
  // 分页
  hasMoreMessages: boolean;
  messageCursor: string | null;
  
  // 错误信息
  error: string | null;
  
  // Actions
  fetchSessions: () => Promise<void>;
  createTemporarySession: () => string;
  commitTemporarySession: (title?: string) => Promise<string>;
  switchSession: (id: string, navigate?: ReturnType<typeof useNavigate>) => Promise<void>;
  deleteSessionById: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  archiveSession: (id: string, archived: boolean) => Promise<void>;
  fetchMessages: (sessionId: string, cursor?: string) => Promise<void>;
  sendMessage: (content: string, stream?: boolean) => Promise<void>;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  clearCurrentSession: () => void;
  setError: (error: string | null) => void;
  // URL 同步相关
  syncSessionFromUrl: (sessionId: string) => Promise<void>;
  updateUrlWithSession: (sessionId: string, navigate?: ReturnType<typeof useNavigate>) => void;
}

// 生成临时会话 ID
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  temporarySession: null,
  sessions: [],
  messages: [],
  isLoading: false,
  isCreating: false,
  isDeleting: false,
  isSending: false,
  hasMoreMessages: false,
  messageCursor: null,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSessions(1, 50);
      set({ sessions: data.sessions, isLoading: false });
    } catch (err) {
      set({
        error: `获取会话列表失败：${(err as Error).message}`,
        isLoading: false,
      });
    }
  },

  createTemporarySession: () => {
    const tempSession: TemporarySession = {
      id: generateTempId(),
      title: '新对话',
      created_at: new Date().toISOString(),
      isTemporary: true,
    };
    
    set({
      temporarySession: tempSession,
      currentSessionId: tempSession.id,
      messages: [],
    });
    
    return tempSession.id;
  },

  commitTemporarySession: async (title) => {
    const state = get();
    if (!state.temporarySession) {
      throw new Error('没有临时会话可持久化');
    }

    set({ isCreating: true, error: null });
    
    try {
      const session = await createSession({
        title: title || state.temporarySession.title,
      });
      
      set({
        temporarySession: null,
        currentSessionId: session.id,
        isCreating: false,
      });
      
      await get().fetchSessions();
      
      return session.id;
    } catch (err) {
      set({
        error: `创建会话失败：${(err as Error).message}`,
        isCreating: false,
      });
      throw err;
    }
  },

  switchSession: async (id, navigate) => {
    set({ isLoading: true, error: null });
    
    // 检查是否是临时会话
    if (id.startsWith('temp_')) {
      const tempSession = get().temporarySession;
      if (tempSession && tempSession.id === id) {
        set({
          currentSessionId: id,
          messages: [],
          isLoading: false,
        });
        // 更新 URL（临时会话不改变 URL）
        return;
      }
      // 临时会话不存在，清空
      set({
        currentSessionId: null,
        temporarySession: null,
        messages: [],
        isLoading: false,
      });
      return;
    }
    
    // 持久化会话
    try {
      const session = await getSession(id);
      const messages = await getSessionMessages(id);
      
      set({
        currentSessionId: id,
        messages,
        hasMoreMessages: messages.length >= 50,
        messageCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
        temporarySession: null,
        isLoading: false,
      });
      
      // 更新 URL
      if (navigate) {
        navigate(`/chat/${id}`, { replace: true });
      }
    } catch (err) {
      // 会话不存在时，刷新会话列表并清空当前会话
      console.warn('切换会话失败，会话可能已被删除:', err);
      
      // 刷新会话列表
      await get().fetchSessions();
      
      set({
        currentSessionId: null,
        temporarySession: null,
        messages: [],
        isLoading: false,
        error: null,
      });
      
      // 导航到首页
      if (navigate) {
        navigate('/chat', { replace: true });
      }
    }
  },

  deleteSessionById: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      if (id.startsWith('temp_')) {
        set({
          temporarySession: null,
          currentSessionId: null,
          messages: [],
          isDeleting: false,
        });
        return;
      }
      
      await deleteSession(id);
      
      const data = await getSessions(1, 50);
      const newCurrentId = get().currentSessionId === id ? null : get().currentSessionId;
      
      set({
        sessions: data.sessions,
        currentSessionId: newCurrentId,
        messages: newCurrentId ? [] : [],
        isDeleting: false,
      });
    } catch (err) {
      set({
        error: `删除会话失败：${(err as Error).message}`,
        isDeleting: false,
      });
    }
  },

  renameSession: async (id, title) => {
    if (id.startsWith('temp_')) {
      set({
        temporarySession: get().temporarySession ? {
          ...get().temporarySession,
          title,
        } : null,
      });
      return;
    }
    
    try {
      await updateSession(id, { title });
      
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, title } : s
        ),
      }));
    } catch (err) {
      set({
        error: `重命名会话失败：${(err as Error).message}`,
      });
      throw err;
    }
  },

  archiveSession: async (id, archived) => {
    if (id.startsWith('temp_')) {
      return;
    }
    
    try {
      await updateSession(id, { is_archived: archived });
      const data = await getSessions(1, 50);
      set({ sessions: data.sessions });
    } catch (err) {
      set({
        error: `归档会话失败：${(err as Error).message}`,
      });
      throw err;
    }
  },

  fetchMessages: async (sessionId, cursor) => {
    if (sessionId.startsWith('temp_')) {
      set({ messages: [] });
      return;
    }
    
    try {
      const messages = await getSessionMessages(sessionId, cursor, 50);
      
      set({
        messages,
        hasMoreMessages: messages.length >= 50,
        messageCursor: messages.length > 0 ? messages[0].id : null,
      });
    } catch (err) {
      set({
        error: `获取消息失败：${(err as Error).message}`,
      });
    }
  },

  sendMessage: async (content, stream = true) => {
    const state = get();
    let sessionId = state.currentSessionId;
    
    if (!sessionId) {
      set({ error: '当前没有活动的会话' });
      return;
    }

    const isTemporary = sessionId.startsWith('temp_') && state.temporarySession;
    
    if (isTemporary) {
      try {
        sessionId = await get().commitTemporarySession('新对话');
        set({ currentSessionId: sessionId });
      } catch (err) {
        set({
          error: `创建会话失败：${(err as Error).message}`,
          isSending: false,
        });
        return;
      }
    }

    set({ isSending: true, error: null });

    const userMessage: Message = {
      id: `temp_user_${Date.now()}`,
      session_id: sessionId!,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    const assistantMessageId = `assistant_${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      session_id: sessionId!,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      isSending: true,
    }));

    try {
      if (stream) {
        let accumulatedContent = '';
        
        await streamSessionMessage(
          sessionId!,
          content,
          (chunk) => {
            accumulatedContent += chunk;
            set((state) => {
              const newMessages = state.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
              );
              return { messages: newMessages };
            });
          },
          () => {
            set({ isSending: false });
          },
          (error) => {
            set({
              error: `发送消息失败：${error.message}`,
              isSending: false,
            });
          }
        );
      } else {
        const response = await sendSessionMessage(sessionId!, {
          content,
          stream: false,
        });

        const assistantMessage: Message = {
          id: response.id,
          session_id: sessionId!,
          role: 'assistant',
          content: response.content,
          created_at: new Date().toISOString(),
          metadata: response.metadata,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isSending: false,
        }));
      }
    } catch (err) {
      set({
        error: `发送消息失败：${(err as Error).message}`,
        isSending: false,
      });
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateLastMessage: (content) => {
    set((state) => {
      const newMessages = [...state.messages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        newMessages[newMessages.length - 1] = {
          ...lastMessage,
          content,
        };
      }
      return { messages: newMessages };
    });
  },

  clearCurrentSession: () => {
    set({
      currentSessionId: null,
      temporarySession: null,
      messages: [],
      error: null,
    });
  },

  setError: (error) => {
    set({ error });
  },

  // URL 同步相关方法
  syncSessionFromUrl: async (sessionId) => {
    if (!sessionId) {
      set({
        currentSessionId: null,
        temporarySession: null,
        messages: [],
      });
      return;
    }
    
    // 使用 switchSession 加载会话
    await get().switchSession(sessionId);
  },

  updateUrlWithSession: (sessionId, navigate) => {
    if (navigate && sessionId && !sessionId.startsWith('temp_')) {
      navigate(`/chat/${sessionId}`, { replace: true });
    }
  },
}));
