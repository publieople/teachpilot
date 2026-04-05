import { create } from 'zustand';
import type { VersionInfo } from '@/services/modify';

export interface CoursewareItem {
  filename: string;
  size: number;
  created_at: number;
  type: 'ppt' | 'word' | 'animation' | 'quiz';
}

interface CoursewareState {
  // 课件列表
  coursewares: CoursewareItem[];
  // 当前选中的课件
  selectedCourseware: CoursewareItem | null;
  // 版本历史
  versions: VersionInfo[];
  // 当前版本 ID
  currentVersionId: string | null;
  // 是否正在生成
  isGenerating: boolean;
  // 错误信息
  error: string | null;
  
  // Actions
  setCoursewares: (coursewares: CoursewareItem[]) => void;
  setSelectedCourseware: (courseware: CoursewareItem | null) => void;
  setVersions: (versions: VersionInfo[]) => void;
  setCurrentVersionId: (versionId: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  addCourseware: (courseware: CoursewareItem) => void;
  clearCoursewares: () => void;
}

export const useCoursewareStore = create<CoursewareState>((set) => ({
  coursewares: [],
  selectedCourseware: null,
  versions: [],
  currentVersionId: null,
  isGenerating: false,
  error: null,

  setCoursewares: (coursewares) => set({ coursewares }),
  
  setSelectedCourseware: (courseware) => set({ selectedCourseware: courseware }),
  
  setVersions: (versions) => set({ versions }),
  
  setCurrentVersionId: (versionId) => set({ currentVersionId: versionId }),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  
  setError: (error) => set({ error }),
  
  addCourseware: (courseware) =>
    set((state) => ({
      coursewares: [...state.coursewares, courseware],
    })),
  
  clearCoursewares: () =>
    set({
      coursewares: [],
      selectedCourseware: null,
      versions: [],
      currentVersionId: null,
      isGenerating: false,
      error: null,
    }),
}));
