/**
 * TTS API 服务
 */

import api from './api';

export interface TTSVoice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
  FriendlyName: string;
}

export interface GenerateTTSRequest {
  text: string;
  voice?: string;
  rate?: string;
  volume?: string;
  pitch?: string;
}

/**
 * 生成语音并返回 Blob URL
 */
export async function generateSpeech(request: GenerateTTSRequest): Promise<string> {
  const response = await api.post('/tts/generate', request, {
    responseType: 'blob',
  });
  
  // 创建 Blob URL
  const blob = new Blob([response.data], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
}

/**
 * 获取可用语音列表
 */
export async function getVoices(locale?: string): Promise<TTSVoice[]> {
  const params = locale ? { locale } : {};
  const response = await api.get('/tts/voices', { params });
  return response.data;
}

/**
 * 获取中文语音预设
 */
export async function getChineseVoices(): Promise<Record<string, string>> {
  const response = await api.get('/tts/voices/chinese');
  return response.data;
}

/**
 * 获取语音详细信息
 */
export async function getVoiceInfo(voiceName: string): Promise<{ voice_id: string; info: TTSVoice }> {
  const response = await api.get(`/tts/voice/${voiceName}`);
  return response.data;
}
