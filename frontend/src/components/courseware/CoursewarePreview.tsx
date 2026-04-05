import { useState } from 'react';
import { X, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CoursewarePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string;
  filename?: string;
  fileType?: 'ppt' | 'word' | 'pdf' | 'html' | 'animation' | 'quiz';
}

export function CoursewarePreview({
  isOpen,
  onClose,
  fileUrl,
  filename,
  fileType = 'ppt',
}: CoursewarePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const getPreviewUrl = () => {
    if (!fileUrl) return '';

    // 使用 Office Web Viewer 预览 PPT 和 Word
    if (fileType === 'ppt' || fileType === 'word' || fileType === 'pdf') {
      // 注意：Office Web Viewer 需要公开可访问的 URL
      // 对于本地文件，需要使用后端提供的下载链接
      const encodedUrl = encodeURIComponent(fileUrl);
      if (fileType === 'ppt' || fileType === 'pptx') {
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      } else if (fileType === 'word' || fileType === 'docx') {
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      } else if (fileType === 'pdf') {
        return `${encodedUrl}#toolbar=0`;
      }
    }

    // HTML 文件直接通过 iframe 预览
    if (fileType === 'html' || fileType === 'animation' || fileType === 'quiz') {
      return fileUrl;
    }

    return fileUrl;
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename || 'download';
      link.click();
    }
  };

  const handleFullscreen = () => {
    const container = document.getElementById('preview-container');
    if (container) {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        id="preview-container"
        className={cn(
          'relative flex h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-background shadow-xl',
          isFullscreen && 'h-screen w-screen max-w-none'
        )}
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {filename || '课件预览'}
            </h2>
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {fileType?.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="下载"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="关闭"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="flex-1 overflow-hidden bg-muted">
          {fileType === 'html' || fileType === 'animation' || fileType === 'quiz' ? (
            <iframe
              src={previewUrl}
              className="h-full w-full border-0"
              title="课件预览"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <iframe
              src={previewUrl}
              className="h-full w-full border-0"
              title="课件预览"
            />
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t bg-muted/50 p-2 text-center text-xs text-muted-foreground">
          {fileType === 'ppt' || fileType === 'word' || fileType === 'pdf' ? (
            <p>使用 Office Web Viewer 预览，需要网络连接。如果预览失败，请下载后本地打开。</p>
          ) : (
            <p>按 Esc 键退出全屏模式</p>
          )}
        </div>
      </div>
    </div>
  );
}
