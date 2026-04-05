import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// API 基础 URL
const API_BASE_URL = '/api';

/**
 * 创建 Axios 实例
 * 参考 Open WebUI 的 API 请求封装模式
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token（如果有）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，清除 token 并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 500) {
      // 服务器错误
      console.error('服务器错误:', error.response.data);
    }
    return Promise.reject(error);
  }
);

/**
 * 通用请求方法
 */
export const request = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.request<T>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
};

export default apiClient;
