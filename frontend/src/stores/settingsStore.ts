import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // API 配置
  openRouterApiKey: string;
  modelId: string;
  
  // 通知设置
  desktopNotifications: boolean;
  soundEffects: boolean;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setApiKey: (key: string) => void;
  setModelId: (model: string) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  openRouterApiKey: '',
  modelId: 'qwen/qwen3.6-plus:free',
  desktopNotifications: true,
  soundEffects: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      isLoading: false,
      error: null,
      
      setApiKey: (key) => set({ openRouterApiKey: key, error: null }),
      
      setModelId: (model) => set({ modelId: model, error: null }),
      
      setDesktopNotifications: (enabled) => set({ desktopNotifications: enabled }),
      
      setSoundEffects: (enabled) => set({ soundEffects: enabled }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'teachpilot-settings',
      partialize: (state) => ({
        openRouterApiKey: state.openRouterApiKey,
        modelId: state.modelId,
        desktopNotifications: state.desktopNotifications,
        soundEffects: state.soundEffects,
      }),
    }
  )
);
