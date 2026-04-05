import { create } from 'zustand';

interface UIState {
  // 侧边栏状态
  sidebarOpen: boolean;
  // 设置弹窗状态
  settingsOpen: boolean;
  // 文件上传弹窗状态
  fileUploadOpen: boolean;
  // 课件预览弹窗状态
  coursewarePreviewOpen: boolean;
  // 版本历史弹窗状态
  versionHistoryOpen: boolean;
  // 当前活动页面
  activePage: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings';
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  setFileUploadOpen: (open: boolean) => void;
  setCoursewarePreviewOpen: (open: boolean) => void;
  setVersionHistoryOpen: (open: boolean) => void;
  setActivePage: (page: 'chat' | 'courseware' | 'knowledge' | 'files' | 'settings') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  settingsOpen: false,
  fileUploadOpen: false,
  coursewarePreviewOpen: false,
  versionHistoryOpen: false,
  activePage: 'chat',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  
  setFileUploadOpen: (open) => set({ fileUploadOpen: open }),
  
  setCoursewarePreviewOpen: (open) => set({ coursewarePreviewOpen: open }),
  
  setVersionHistoryOpen: (open) => set({ versionHistoryOpen: open }),
  
  setActivePage: (page) => set({ activePage: page }),
}));
