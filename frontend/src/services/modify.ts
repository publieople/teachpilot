import { request } from './api';

export interface VersionInfo {
  version_id: string;
  content_type: string;
  parent_version: string | null;
  created_at: string;
  modification: string;
  metadata: Record<string, unknown>;
  file_path: string | null;
  is_current?: boolean;
}

export interface VersionListResponse {
  versions: VersionInfo[];
  current_version: string | null;
  total: number;
}

export interface ModifyRequest {
  project_id: string;
  current_content: Record<string, unknown>;
  modification_request: string;
}

export interface ModifyResponse {
  status: string;
  modification_plan: Record<string, unknown>;
  new_file_path: string | null;
  new_version_id: string | null;
  message: string;
}

/**
 * 理解修改意见
 */
export const understandModification = async (
  projectId: string,
  currentContent: Record<string, unknown>,
  modificationRequest: string
): Promise<{
  status: string;
  plan: Record<string, unknown>;
}> => {
  return request('post', '/modify/understand', undefined, {
    params: { project_id: projectId, modification_request: modificationRequest },
    data: { current_content: currentContent },
  });
};

/**
 * 应用修改
 */
export const applyModification = async (
  data: ModifyRequest
): Promise<ModifyResponse> => {
  return request<ModifyResponse>('post', '/modify/apply', data);
};

/**
 * 获取版本列表
 */
export const getVersions = async (
  projectId: string
): Promise<VersionListResponse> => {
  return request<VersionListResponse>('get', `/modify/versions/${projectId}`);
};

/**
 * 获取指定版本信息
 */
export const getVersion = async (
  projectId: string,
  versionId: string
): Promise<{
  version: VersionInfo;
  content_snapshot: Record<string, unknown>;
}> => {
  return request('get', `/modify/versions/${projectId}/${versionId}`);
};

/**
 * 回退到指定版本
 */
export const revertToVersion = async (
  projectId: string,
  versionId: string
): Promise<{
  status: string;
  version_id: string;
  file_path: string;
}> => {
  return request('post', `/modify/revert/${projectId}/${versionId}`);
};

/**
 * 对比两个版本
 */
export const diffVersions = async (
  projectId: string,
  version1: string,
  version2: string
): Promise<{
  status: string;
  diff: Record<string, unknown>;
}> => {
  return request('get', `/modify/diff/${projectId}`, undefined, {
    params: { version_1: version1, version_2: version2 },
  });
};

/**
 * 下载指定版本文件
 */
export const downloadVersion = (projectId: string, versionId: string): string => {
  return `/api/modify/download/${projectId}/${versionId}`;
};
