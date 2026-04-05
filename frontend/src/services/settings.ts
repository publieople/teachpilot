import { request } from './api';

export interface UserSettings {
  model_id: string;
  temperature: number;
  max_tokens: number;
  desktop_notifications: boolean;
  sound_effects: boolean;
  language: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}

export interface SystemSettings {
  project_name: string;
  version: string;
  debug: boolean;
  model_id: string;
  max_file_size: number;
  upload_dir: string;
  knowledge_base_dir: string;
  chroma_persist_dir: string;
}

/**
 * 获取用户设置
 */
export const getSettings = async (): Promise<UserSettings> => {
  return request<UserSettings>('get', '/settings/');
};

/**
 * 更新用户设置
 */
export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  return request<UserSettings>('put', '/settings/', settings);
};

/**
 * 重置用户设置
 */
export const resetSettings = async (): Promise<UserSettings> => {
  return request<UserSettings>('post', '/settings/reset');
};

/**
 * 获取可用模型列表
 */
export const getModelOptions = async (): Promise<{ models: ModelOption[] }> => {
  return request<{ models: ModelOption[] }>('get', '/settings/model-options');
};

/**
 * 获取系统设置
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  return request<SystemSettings>('get', '/settings/system');
};
