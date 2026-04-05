import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function FileUploader({
  onUpload,
  acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = true,
  disabled = false,
}: FileUploaderProps) {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // 处理拒绝的文件
      const rejected = rejectedFiles.map((file) => ({
        file: file.file,
        status: 'error' as const,
        progress: 0,
        error: file.errors[0]?.message,
      }));

      // 处理接受的文件
      const pending = acceptedFiles.map((file) => ({
        file,
        status: 'pending' as const,
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...rejected, ...pending]);

      // 逐个上传
      for (const upload of pending) {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, status: 'uploading', progress: 0 } : u
          )
        );

        try {
          await onUpload(upload.file);
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file ? { ...u, status: 'success', progress: 100 } : u
            )
          );
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file
                ? { ...u, status: 'error', progress: 0, error: (error as Error).message }
                : u
            )
          );
        }
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple,
    disabled,
  });

  const removeUpload = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  const clearAll = () => {
    setUploads([]);
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 拖拽区域 */}
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:bg-muted/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-primary">释放文件以上传...</p>
        ) : (
          <>
            <p className="text-sm font-medium">点击或拖拽文件到此处上传</p>
            <p className="mt-1 text-xs text-muted-foreground">
              支持 PDF, Word, PPT, 图片，视频，TXT, MD 等格式
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              单个文件最大 {formatFileSize(maxSize)}
            </p>
          </>
        )}
      </div>

      {/* 上传列表 */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">上传列表</h3>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              清空
            </Button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload) => (
              <div
                key={upload.file.name}
                className="flex items-center gap-3 rounded-md border bg-card p-3"
              >
                {getStatusIcon(upload.status)}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{upload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.file.size)}
                  </p>
                  {upload.status === 'uploading' && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="mt-1 text-xs text-red-500">{upload.error}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeUpload(upload.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
