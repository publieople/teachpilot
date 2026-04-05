import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCoursewareStore } from '@/stores/coursewareStore';
import { getGeneratedFiles, downloadGeneratedFile } from '@/services/generate';
import { FileText, Download, Eye, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { CoursewarePreview } from '@/components/courseware/CoursewarePreview';
import { VersionHistory } from '@/components/courseware/VersionHistory';

export interface CoursewareItem {
  filename: string;
  size: number;
  created_at: number;
  type: 'ppt' | 'word' | 'animation' | 'quiz';
}

export function CoursewarePage() {
  const { coursewares, setCoursewares } = useCoursewareStore();
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CoursewareItem | null>(null);

  // 加载课件列表
  useEffect(() => {
    loadCoursewares();
  }, []);

  const loadCoursewares = async () => {
    try {
      const data = await getGeneratedFiles();
      const items: CoursewareItem[] = data.files.map((file) => ({
        filename: file.filename,
        size: file.size,
        created_at: file.created_at,
        type: getFileType(file.filename),
      }));
      setCoursewares(items);
    } catch (err) {
      toast.error(`加载失败：${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename: string): CoursewareItem['type'] => {
    if (filename.endsWith('.pptx')) return 'ppt';
    if (filename.endsWith('.docx')) return 'word';
    if (filename.endsWith('.html')) return 'animation';
    if (filename.endsWith('.html') && filename.includes('quiz')) return 'quiz';
    return 'ppt';
  };

  const getFileIcon = (type: CoursewareItem['type']) => {
    switch (type) {
      case 'ppt':
        return <FileText className="h-8 w-8 text-orange-500" />;
      case 'word':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'animation':
        return <FileText className="h-8 w-8 text-purple-500" />;
      case 'quiz':
        return <FileText className="h-8 w-8 text-green-500" />;
    }
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = downloadGeneratedFile(filename);
    link.download = filename;
    link.click();
    toast.success('开始下载');
  };

  const handlePreview = (item: CoursewareItem) => {
    setSelectedFile(item);
    setPreviewOpen(true);
  };

  const handleVersionHistory = (item: CoursewareItem) => {
    setSelectedFile(item);
    setVersionHistoryOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">课件管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看和管理您生成的所有课件
          </p>
        </div>

        {/* 课件列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : coursewares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-lg font-semibold">暂无课件</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              在对话中让 AI 助手帮您生成课件
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coursewares.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {getFileIcon(item.type)}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate font-medium">{item.filename}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(new Date(item.created_at))}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(item)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    预览
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleVersionHistory(item)}
                  >
                    <History className="mr-1 h-3 w-3" />
                    历史
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(item.filename)}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    下载
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 课件预览弹窗 */}
        <CoursewarePreview
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedFile(null);
          }}
          fileUrl={selectedFile ? downloadGeneratedFile(selectedFile.filename) : undefined}
          filename={selectedFile?.filename}
          fileType={selectedFile?.type}
        />

        {/* 版本历史弹窗 */}
        <VersionHistory
          isOpen={versionHistoryOpen}
          onClose={() => {
            setVersionHistoryOpen(false);
            setSelectedFile(null);
          }}
          projectId="default"
        />
      </div>
    </MainLayout>
  );
}
