import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploader } from '@/components/files/FileUploader';
import { uploadFile, listFiles, parseFile, type FileInfo } from '@/services/files';
import { FileText, Upload, Trash2, Eye, FileCode, FileVideo, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatDateTime, formatFileSize } from '@/lib/utils';

export function FilesPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsingFile, setParsingFile] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<Record<string, unknown> | null>(null);

  // 加载文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await listFiles();
      setFiles(data.files || []);
    } catch (err) {
      toast.error(`加载文件列表失败：${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleUpload = async (file: File) => {
    try {
      const fileInfo = await uploadFile(file);
      setFiles((prev) => [...prev, fileInfo]);
      toast.success(`文件上传成功：${file.name}`);
    } catch (err) {
      toast.error(`上传失败：${(err as Error).message}`);
      throw err;
    }
  };

  // 处理文件解析
  const handleParse = async (fileId: string) => {
    setParsingFile(fileId);
    try {
      const result = await parseFile(fileId);
      setParseResult(result.metadata || {});
      toast.success(`文件解析成功：${result.file_type}`);
    } catch (err) {
      toast.error(`解析失败：${(err as Error).message}`);
    } finally {
      setParsingFile(null);
    }
  };

  // 处理文件删除
  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`确定要删除文件 "${filename}" 吗？`)) {
      return;
    }
    try {
      // TODO: 实现删除 API
      toast.info('删除功能开发中');
    } catch (err) {
      toast.error(`删除失败：${(err as Error).message}`);
    }
  };

  // 获取文件类型图标
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-8 w-8 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'txt':
      case 'md':
        return <FileCode className="h-8 w-8 text-gray-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">文件管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传和管理您的教学资料，支持 PDF、Word、PPT、图片、视频等格式
          </p>
        </div>

        {/* 上传区域 */}
        <div className="mb-8">
          <FileUploader onUpload={handleUpload} />
        </div>

        {/* 文件列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Upload className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-lg font-semibold">暂无文件</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              点击上方区域或拖拽文件以上传
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {getFileIcon(file.file_type)}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate font-medium">{file.filename}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{formatDateTime(new Date(file.upload_time))}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleParse(file.id)}
                    disabled={parsingFile === file.id}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    {parsingFile === file.id ? '解析中...' : '解析'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(file.id, file.filename)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 解析结果展示 */}
        {parseResult && (
          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">文件解析结果</h2>
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(parseResult, null, 2)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setParseResult(null)}
            >
              关闭
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
