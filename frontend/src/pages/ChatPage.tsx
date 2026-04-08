import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { useSessionStore } from '@/stores/sessionStore';
import { useFileStore } from '@/stores/fileStore';
import { uploadFile } from '@/services/files';
import { toast } from 'sonner';
import { MessageSquareOff } from 'lucide-react';

export function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const {
    currentSessionId,
    messages,
    isSending,
    sendMessage,
    createTemporarySession,
    clearCurrentSession,
    syncSessionFromUrl,
    updateUrlWithSession,
    error,
    setError,
  } = useSessionStore();
  
  const { setIsUploading, setUploadProgress } = useFileStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 URL 同步会话
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      syncSessionFromUrl(sessionId).then(() => {
        setIsInitialized(true);
      });
    } else if (!sessionId) {
      // 没有会话 ID，创建临时会话
      const tempId = createTemporarySession();
      updateUrlWithSession(tempId, navigate);
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, [sessionId]);

  // 确保有当前会话（临时或持久化）
  const ensureSession = useCallback(() => {
    if (!currentSessionId) {
      const tempId = createTemporarySession();
      updateUrlWithSession(tempId, navigate);
      return tempId;
    }
    return currentSessionId;
  }, [currentSessionId, createTemporarySession, navigate, updateUrlWithSession]);

  // 发送消息
  const handleSend = useCallback(async (content: string) => {
    // 确保有会话
    ensureSession();
    // 发送消息
    await sendMessage(content, true);
  }, [ensureSession, sendMessage]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    // 确保有会话
    ensureSession();
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = await uploadFile(file);
      toast.success(`文件上传成功：${fileInfo.filename}`);
      
      // 自动发送一条包含文件信息的消息
      setTimeout(() => {
        handleSend(`我上传了一个文件：${fileInfo.filename}，请帮我分析`);
      }, 100);
    } catch (err) {
      toast.error(`文件上传失败：${(err as Error).message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  }, [ensureSession, handleSend, setIsUploading, setUploadProgress]);

  // 处理语音录制
  const handleVoiceStart = useCallback(() => {
    setIsRecording(true);
    toast.info('语音录制中，请说话...');
  }, []);

  const handleVoiceStop = useCallback(() => {
    setIsRecording(false);
    toast.info('语音录制结束');
  }, []);

  // 处理新建会话
  const handleNewChat = useCallback(() => {
    clearCurrentSession();
    // 创建新的临时会话
    const tempId = createTemporarySession();
    // 更新 URL（不添加临时 ID，保持 /chat）
    navigate('/chat', { replace: true });
    toast.info('已清空当前对话，开始新对话吧');
  }, [clearCurrentSession, createTemporarySession, navigate]);

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  if (!isInitialized) {
    return (
      <MainLayout onNewChat={handleNewChat}>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout onNewChat={handleNewChat}>
      <div className="flex h-full flex-col">
        {/* 会话状态提示 */}
        {!currentSessionId && (
          <div className="flex items-center justify-center border-b bg-muted/50 p-2 text-sm text-muted-foreground">
            <MessageSquareOff className="mr-2 h-4 w-4" />
            开始新对话吧
          </div>
        )}

        {/* 消息列表 */}
        <MessageList
          messages={messages}
          isGenerating={isSending}
          onCopy={() => toast.success('已复制到剪贴板')}
        />

        {/* 输入区域 */}
        <ChatInput
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onVoiceStart={handleVoiceStart}
          onVoiceStop={handleVoiceStop}
          isRecording={isRecording}
          disabled={isSending}
          placeholder="描述您的教学设计想法，例如：我想设计一节关于 Python 基础语法的课程..."
        />
      </div>
    </MainLayout>
  );
}
