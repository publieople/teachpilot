import { request } from './api';

export interface KnowledgeItem {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  collection?: string;
}

export interface SearchResponse {
  results: KnowledgeItem[];
  total: number;
}

export interface AddDocumentRequest {
  content: string;
  metadata?: Record<string, unknown>;
  collection?: string;
}

/**
 * 上传知识库文件
 */
export const uploadKnowledge = async (
  file: File,
  collection?: string
): Promise<{
  status: string;
  document_id: string;
  filename: string;
  collection: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  if (collection) {
    formData.append('collection', collection);
  }

  return request('post', '/rag/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 添加文档到知识库
 */
export const addDocument = async (
  data: AddDocumentRequest
): Promise<{
  status: string;
  document_id: string;
}> => {
  return request('post', '/rag/add', data);
};

/**
 * 检索知识库
 */
export const searchKnowledge = async (
  data: SearchRequest
): Promise<SearchResponse> => {
  return request<SearchResponse>('post', '/rag/search', data);
};

/**
 * 获取知识库集合列表
 */
export const getCollections = async (): Promise<{
  collections: string[];
  total: number;
}> => {
  return request('get', '/rag/collections');
};

/**
 * 获取知识库统计信息
 */
export const getKnowledgeStats = async (
  collection?: string
): Promise<{
  total_documents: number;
  collection_name: string;
}> => {
  return request('get', '/rag/stats', undefined, {
    params: { collection },
  });
};

/**
 * 删除知识库集合
 */
export const deleteCollection = async (
  collectionId: string
): Promise<{
  status: string;
  message: string;
}> => {
  return request('delete', `/rag/collections/${collectionId}`);
};
