/**
 * Web Speech API - 语音识别 Hook
 * 使用浏览器原生的 SpeechRecognition API 实现语音转文字
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const {
    lang = 'zh-CN',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onEnd,
    onStart,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  // 初始化 SpeechRecognition
  useEffect(() => {
    // 检查浏览器支持
    const SpeechRecognition = (window as any).SpeechRecognition 
      || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const errorMsg = '您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscriptRef.current = '';
      setTranscript('');
      onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        setTranscript(finalTranscriptRef.current);
        onResult?.(finalTranscriptRef.current, true);
      } else if (interimTranscript) {
        setTranscript(finalTranscriptRef.current + interimTranscript);
        onResult?.(finalTranscriptRef.current + interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('语音识别错误:', event.error, event.message);
      setIsListening(false);
      
      let errorMsg = '';
      switch (event.error) {
        case 'no-speech':
          errorMsg = '未检测到语音，请重新尝试';
          break;
        case 'audio-capture':
          errorMsg = '无法访问麦克风，请检查权限设置';
          break;
        case 'not-allowed':
          errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许';
          break;
        case 'network':
          errorMsg = '网络错误，请检查网络连接';
          break;
        case 'aborted':
          errorMsg = '语音识别已取消';
          break;
        default:
          errorMsg = `语音识别错误：${event.error}`;
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };

    recognitionRef.current = recognition;

    // 清理
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [lang, continuous, interimResults, onResult, onError, onEnd, onStart]);

  // 开始录音
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('启动语音识别失败:', err);
        setError('启动语音识别失败');
      }
    }
  }, [isListening]);

  // 停止录音
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('停止语音识别失败:', err);
      }
    }
  }, [isListening]);

  // 取消录音（不返回结果）
  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.error('取消语音识别失败:', err);
      }
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported: true,
    startListening,
    stopListening,
    cancelListening,
    reset,
  };
}

/**
 * 检查浏览器是否支持语音识别
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
}
