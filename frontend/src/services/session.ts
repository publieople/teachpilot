import { request } from './api';

// ==================== 类型定义 ====================

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count?: number;
  last_message_preview?: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SessionListResponse {
  sessions: Session[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface SessionCreateRequest {
  title?: string;
  initial_message?: {
    role: string;
    content: string;
  };
  metadata?: Record<string, any>;
}

export interface SessionUpdateRequest {
  title?: string;
  is_archived?: boolean;
  metadata?: Record<string, any>;
}

export interface MessageCreateRequest {
  content: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// ==================== API 函数 ====================

/**
 * 获取会话列表
 */
export const getSessions = async (
  page = 1,
  page_size = 20,
  archived = false
): Promise<SessionListResponse> => {
  return request<SessionListResponse>('get', '/chat/sessions', undefined, {
    params: { page, page_size, archived },
  });
};

/**
 * 创建新会话
 */
export const createSession = async (
  data: SessionCreateRequest
): Promise<Session> => {
  return request<Session>('post', '/chat/sessions', data);
};

/**
 * 获取会话详情
 */
export const getSession = async (sessionId: string): Promise<Session> => {
  return request<Session>('get', `/chat/sessions/${sessionId}`);
};

/**
 * 更新会话
 */
export const updateSession = async (
  sessionId: string,
  data: SessionUpdateRequest
): Promise<Session> => {
  return request<Session>('put', `/chat/sessions/${sessionId}`, data);
};

/**
 * 删除会话
 */
export const deleteSession = async (sessionId: string): Promise<{ status: string; message: string }> => {
  return request<{ status: string; message: string }>('delete', `/chat/sessions/${sessionId}`);
};

/**
 * 获取会话消息列表
 */
export const getSessionMessages = async (
  sessionId: string,
  before?: string,
  limit = 50
): Promise<Message[]> => {
  return request<Message[]>('get', `/chat/sessions/${sessionId}/messages`, undefined, {
    params: { before, limit },
  });
};

/**
 * 在会话中发送消息
 */
export const sendSessionMessage = async (
  sessionId: string,
  data: MessageCreateRequest
): Promise<any> => {
  return request('post', `/chat/sessions/${sessionId}/messages`, data);
};

/**
 * 流式发送消息
 */
export const streamSessionMessage = async (
  sessionId: string,
  content: string,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void,
  temperature = 0.7,
  max_tokens = 2048
): Promise<void> => {
try {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      temperature,
      max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]?.delta?.content) {
              const delta = parsed.choices[0].delta.content;
              assistantContent += delta;
              onChunk(delta);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    onComplete?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error('请求失败');
    onError?.(error);
    throw error;
  }
};
