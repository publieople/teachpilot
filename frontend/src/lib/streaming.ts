/**
 * 流式输出工具 - 使用 eventsource-parser 库（参考 open-webui）
 */

import { EventSourceParserStream } from 'eventsource-parser/stream';
import type { ParsedEvent } from 'eventsource-parser';

export interface TextStreamUpdate {
  done: boolean;
  value: string;
  error?: unknown;
  usage?: ResponseUsage;
}

export interface ResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  [other: string]: unknown;
}

/**
 * 创建 OpenAI 格式的文本流 - 使用 eventsource-parser
 */
export async function createOpenAITextStream(
  responseBody: ReadableStream<Uint8Array>,
  splitLargeDeltas = false
): Promise<AsyncGenerator<TextStreamUpdate>> {
  // 使用 EventSourceParserStream 自动处理 SSE 格式
  const eventStream = responseBody
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();
  
  let iterator = openAIStreamToIterator(eventStream);
  if (splitLargeDeltas) {
    iterator = streamLargeDeltasAsRandomChunks(iterator);
  }
  return iterator;
}

async function* openAIStreamToIterator(
  reader: ReadableStreamDefaultReader<ParsedEvent>
): AsyncGenerator<TextStreamUpdate> {
  while (true) {
    const { value, done } = await reader.read();
    
    if (done) {
      yield { done: true, value: '' };
      break;
    }
    
    if (!value) {
      continue;
    }
    
    const data = value.data;
    
    // 处理 [DONE] 标记
    if (data.startsWith('[DONE]')) {
      yield { done: true, value: '' };
      break;
    }

    try {
      const parsedData = JSON.parse(data);

      // 错误处理
      if (parsedData.error) {
        yield { done: true, value: '', error: parsedData.error };
        break;
      }

      // 跳过 usage 数据（可选：如果需要可以保留）
      if (parsedData.usage) {
        yield { done: false, value: '', usage: parsedData.usage };
        continue;
      }

      // 提取 content（注意：content 可能为空字符串）
      const content = parsedData.choices?.[0]?.delta?.content;
      
      // 只有当 content 存在且不为空时才 yield
      if (content !== undefined && content !== null && content !== '') {
        yield { done: false, value: content };
      }
      
    } catch (e) {
      console.error('SSE 解析错误:', e);
      // 继续处理下一个事件
    }
  }
}

/**
 * 将大的数据块分割成小 chunks，模拟更流畅的流式效果
 * 参考 Open WebUI 的 streamLargeDeltasAsRandomChunks 实现
 */
async function* streamLargeDeltasAsRandomChunks(
  iterator: AsyncGenerator<TextStreamUpdate>
): AsyncGenerator<TextStreamUpdate> {
  for await (const textStreamUpdate of iterator) {
    if (textStreamUpdate.done) {
      yield textStreamUpdate;
      return;
    }

    if (textStreamUpdate.error) {
      yield textStreamUpdate;
      continue;
    }

    if (textStreamUpdate.usage) {
      yield textStreamUpdate;
      continue;
    }

    // 修复：确保 value 存在且为字符串
    let content = textStreamUpdate.value ?? '';
    
    // 如果 content 为空，跳过
    if (!content) {
      continue;
    }
    
    if (content.length < 5) {
      yield { done: false, value: content };
      continue;
    }
    while (content !== '') {
      const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, content.length);
      const chunk = content.slice(0, chunkSize);
      yield { done: false, value: chunk };
      // 仅在标签页可见时休眠，隐藏标签页时定时器会被限制到 1s
      if (document?.visibilityState !== 'hidden') {
        await sleep(5);
      }
      content = content.slice(chunkSize);
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
