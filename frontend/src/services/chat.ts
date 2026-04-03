import api from './api'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: Message[]
  temperature?: number
  max_tokens?: number
}

export interface ChatResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 发送聊天消息
 */
export const sendMessage = async (
  messages: Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chat/message', {
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens || 2048,
  })
  return response.data
}

/**
 * 提取教学意图
 */
export const extractIntent = async (
  messages: Message[]
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chat/extract-intent', {
    messages,
  })
  return response.data
}
