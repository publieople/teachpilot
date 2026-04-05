import { request } from './api';

export interface FileInfo {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_time: string;
  status: string;
  metadata?: {
    path?: string;
    content_type?: string;
  };
}

export interface ParseResult {
  file_id: string;
  file_type: string;
  summary: string;
  metadata: Record<string, unknown>;
  added_to_rag: boolean;
}

/**
 * 上传文件
 */
export const uploadFile = async (
  file: File,
  addToRag = false,
  collection?: string
): Promise<FileInfo> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('add_to_rag', String(addToRag));
  if (collection) {
    formData.append('collection', collection);
  }

  const response = await request<FileInfo>('post', '/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

/**
 * 解析文件
 */
export const parseFile = async (
  fileId: string,
  addToRag = true,
  collection?: string
): Promise<ParseResult> => {
  return request<ParseResult>('post', `/files/${fileId}/parse`, undefined, {
    params: { add_to_rag: addToRag, collection },
  });
};

/**
 * 获取文件信息
 */
export const getFileInfo = async (fileId: string): Promise<FileInfo> => {
  return request<FileInfo>('get', `/files/${fileId}`);
};

/**
 * 获取文件列表
 */
export const getFiles = async (): Promise<{
  files: Array<{
    filename: string;
    size: number;
    created_at: string;
  }>;
  total: number;
}> => {
  return request('get', '/files/list');
};

/**
 * 下载文件
 */
export const downloadFile = (fileId: string): string => {
  return `/api/files/${fileId}/download`;
};

/**
 * 删除文件
 */
export const deleteFile = async (fileId: string): Promise<{
  status: string;
  message: string;
}> => {
  return request('delete', `/files/${fileId}`);
};
