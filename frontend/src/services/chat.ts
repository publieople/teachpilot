import { request } from './api';
import { createOpenAITextStream } from '@/lib/streaming';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TeachingIntent {
  teaching_objectives: string | null;
  knowledge_points: string[] | null;
  key_difficulties: string | null;
  target_audience: string | null;
  duration: string | null;
  teaching_style: string | null;
  special_requirements: string | null;
}

/**
 * 发送消息并获取回复
 */
export const sendMessage = async (
  messages: Message[],
  temperature = 0.7,
  max_tokens = 2048
): Promise<ChatResponse> => {
  return request<ChatResponse>('post', '/chat/message', {
    messages,
    temperature,
    max_tokens,
  });
};

/**
 * 流式发送消息 - 参考 Open WebUI 实现
 * @param messages 消息列表
 * @param onChunk 每个数据块的回调
 * @param onComplete 完成回调
 * @param onError 错误回调
 * @param splitLargeDeltas 是否分割大数据块
 */
export const streamMessage = async (
  messages: Message[],
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void,
  splitLargeDeltas = true,
  temperature = 0.7,
  max_tokens = 2048
): Promise<void> => {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
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

    // 使用 Open WebUI 的流式处理方式
    const iterator = await createOpenAITextStream(response.body, splitLargeDeltas);

    for await (const update of iterator) {
      if (update.done) {
        onComplete?.();
        return;
      }

      if (update.error) {
        const errorMessage = update.error instanceof Error ? update.error : new Error(String(update.error));
        throw errorMessage;
      }

      if (update.value !== undefined && update.value !== null) {
        onChunk(update.value);
      }
    }

    onComplete?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error('请求失败');
    onError?.(error);
    throw error;
  }
};

/**
 * 从对话中提取教学意图
 */
export const extractTeachingIntent = async (
  messages: Message[]
): Promise<{ content: string }> => {
  return request<{ content: string }>('post', '/chat/extract-intent', {
    messages,
  });
};

/**
 * 获取对话历史
 */
export const getChatHistory = async (
  sessionId?: string
): Promise<{
  session_id: string;
  messages: Message[];
  note: string;
}> => {
  return request('get', '/chat/history', undefined, {
    params: { session_id: sessionId },
  });
};
