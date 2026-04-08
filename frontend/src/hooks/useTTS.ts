/**
 * Edge TTS - 文字转语音 Hook
 * 调用后端 Edge TTS API 实现文字转语音播放
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTTSOptions {
  rate?: string; // 语速，如 "+0%" 或 "-20%"
  volume?: string; // 音量，如 "+0%" 或 "-20%"
  pitch?: string; // 音调，如 "+0Hz" 或 "-10Hz"
  voice?: string; // 语音名称，如 "zh-CN-XiaoxiaoNeural"
  autoPlay?: boolean; // 是否在生成后自动播放
}

export function useTTS(options: UseTTSOptions = {}) {
  const {
    rate = '+0%',
    volume = '+0%',
    pitch = '+0Hz',
    voice = 'zh-CN-XiaoxiaoNeural',
    autoPlay = false,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // 生成语音
  const generateSpeech = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError('文本内容为空');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          rate,
          volume,
          pitch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '语音生成失败');
      }

      // 获取音频 blob
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // 清理之前的 URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      
      blobUrlRef.current = audioUrl;
      setAudioUrl(audioUrl);

      // 自动播放
      if (autoPlay) {
        await play(audioUrl);
      }

      return audioUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '语音生成失败';
      setError(errorMsg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [voice, rate, volume, pitch, autoPlay]);

  // 播放音频
  const play = useCallback(async (url?: string) => {
    const audioUrlToPlay = url || audioUrl;
    
    if (!audioUrlToPlay) {
      setError('没有可播放的音频');
      return;
    }

    try {
      // 清理之前的音频
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrlToPlay);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setError('音频播放失败');
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '音频播放失败';
      setError(errorMsg);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // 暂停播放
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 恢复播放
  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // 停止播放
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // 取消生成
  const cancel = useCallback(() => {
    setIsGenerating(false);
  }, []);

  return {
    isPlaying,
    isGenerating,
    error,
    audioUrl,
    generateSpeech,
    play,
    pause,
    resume,
    stop,
    cancel,
  };
}

/**
 * 获取可用的 Edge TTS 语音列表
 */
export async function getAvailableVoices(): Promise<Array<{
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
}>> {
  try {
    const response = await fetch('/api/tts/voices');
    if (!response.ok) {
      throw new Error('获取语音列表失败');
    }
    return await response.json();
  } catch (err) {
    console.error('获取 TTS 语音列表失败:', err);
    return [];
  }
}
