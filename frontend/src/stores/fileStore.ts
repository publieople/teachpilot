import { create } from 'zustand';
import type { FileInfo } from '@/services/files';

interface FileState {
  // 上传的文件列表
  files: FileInfo[];
  // 是否正在上传
  isUploading: boolean;
  // 上传进度
  uploadProgress: number;
  // 错误信息
  error: string | null;
  
  // Actions
  setFiles: (files: FileInfo[]) => void;
  addFile: (file: FileInfo) => void;
  removeFile: (fileId: string) => void;
  setIsUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  isUploading: false,
  uploadProgress: 0,
  error: null,

  setFiles: (files) => set({ files }),
  
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  
  removeFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
    })),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setError: (error) => set({ error }),
  
  clearFiles: () =>
    set({
      files: [],
      isUploading: false,
      uploadProgress: 0,
      error: null,
    }),
}));
