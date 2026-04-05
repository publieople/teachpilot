import { useCallback, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/stores/chatStore';
import { useFileStore } from '@/stores/fileStore';
import { streamMessage, type Message } from '@/services/chat';
import { uploadFile } from '@/services/files';
import { toast } from 'sonner';

export function ChatPage() {
  const { messages, addMessage, setIsGenerating, isGenerating, setError } = useChatStore();
  const { addFile, setIsUploading, setUploadProgress } = useFileStore();
  const [isRecording, setIsRecording] = useState(false);

  // 发送消息（流式）
  const handleSend = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = { role: 'user', content };
    
    // 使用函数式更新，确保状态一致性
    useChatStore.setState((state) => ({
      messages: [...state.messages, userMessage],
      isGenerating: true,
      error: null,
    }));

    // 创建一个空的 AI 消息用于流式更新
    useChatStore.setState((state) => ({
      messages: [...state.messages, { role: 'assistant', content: '' }],
    }));

    try {
      // 获取最新的消息列表用于发送
      const currentMessages = useChatStore.getState().messages;
      
      // 流式请求 - 参考 Open WebUI 实现
      await streamMessage(
        currentMessages,
        (chunk) => {
          // 更新最后一条消息（AI 消息）的内容
          useChatStore.setState((state) => {
            const newMessages = [...state.messages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
            }
            return { messages: newMessages };
          });
        },
        () => {
          // 完成回调
          useChatStore.setState({ isGenerating: false });
        },
        (error) => {
          // 错误回调
          useChatStore.setState({
            error: error.message,
            isGenerating: false,
          });
          toast.error(`流式请求失败：${error.message}`);
        },
        true, // splitLargeDeltas - 分割大数据块，模拟更流畅的效果
        0.7,  // temperature
        2048  // max_tokens
      );
    } catch (err) {
      const errorMessage = (err as Error).message;
      useChatStore.setState({
        error: errorMessage,
        isGenerating: false,
      });
      toast.error(`发送失败：${errorMessage}`);
    }
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = await uploadFile(file);
      addFile(fileInfo);
      toast.success(`文件上传成功：${fileInfo.filename}`);
      
      // 自动发送一条包含文件信息的消息
      handleSend(`我上传了一个文件：${fileInfo.filename}，请帮我分析`);
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(`文件上传失败：${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [addFile, setIsUploading, setUploadProgress, handleSend]);

  // 处理语音录制
  const handleVoiceStart = useCallback(() => {
    setIsRecording(true);
    toast.info('语音录制中，请说话...');
    // TODO: 实现 Web Speech API 语音识别
  }, []);

  const handleVoiceStop = useCallback(() => {
    setIsRecording(false);
    toast.info('语音录制结束');
    // TODO: 处理语音识别结果
  }, []);

  // 处理复制消息
  const handleCopy = useCallback(() => {
    toast.success('已复制到剪贴板');
  }, []);

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        {/* 消息列表 */}
        <MessageList
          messages={messages}
          isGenerating={isGenerating}
          onCopy={handleCopy}
        />

        {/* 输入区域 */}
        <ChatInput
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onVoiceStart={handleVoiceStart}
          onVoiceStop={handleVoiceStop}
          isRecording={isRecording}
          disabled={isGenerating}
          placeholder="描述您的教学设计想法，例如：我想设计一节关于 Python 基础语法的课程..."
        />
      </div>
    </MainLayout>
  );
}
