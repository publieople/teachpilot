import { request } from './api';

export interface Slide {
  title: string;
  content: string | string[];
  notes?: string;
}

export interface GeneratePPTRequest {
  title: string;
  slides: Slide[];
  subtitle?: string;
}

export interface TeachingProcessStep {
  stage: string;
  content: string;
}

export interface GenerateWordRequest {
  title: string;
  teaching_objectives: string;
  teaching_content: string;
  teaching_methods: string;
  teaching_process: TeachingProcessStep[];
  classroom_activities: string;
  homework: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface GenerateQuizRequest {
  title: string;
  questions: QuizQuestion[];
}

export interface GenerationResult {
  status: string;
  file_path: string;
  filename: string;
  download_url: string;
  message: string;
}

/**
 * 生成 PPT 课件
 */
export const generatePPT = async (
  data: GeneratePPTRequest
): Promise<GenerationResult> => {
  return request<GenerationResult>('post', '/generate/ppt', data);
};

/**
 * 生成 Word 教案
 */
export const generateWord = async (
  data: GenerateWordRequest
): Promise<GenerationResult> => {
  return request<GenerationResult>('post', '/generate/word', data);
};

/**
 * 生成动画
 */
export const generateAnimation = async (
  title: string,
  content: string,
  animationType = 'fade'
): Promise<{
  status: string;
  file_path: string;
  filename: string;
  download_url: string;
  type: string;
}> => {
  return request('post', '/generate/animation', undefined, {
    params: { title, content, animation_type: animationType },
  });
};

/**
 * 生成互动问答游戏
 */
export const generateQuiz = async (
  data: GenerateQuizRequest
): Promise<GenerationResult> => {
  return request<GenerationResult>('post', '/generate/quiz', data);
};

/**
 * 获取生成的文件列表
 */
export const getGeneratedFiles = async (): Promise<{
  files: Array<{
    filename: string;
    size: number;
    created_at: number;
  }>;
  total: number;
}> => {
  return request('get', '/generate/list');
};

/**
 * 下载生成的文件
 */
export const downloadGeneratedFile = (filename: string): string => {
  return `/api/generate/download/${filename}`;
};
