import { useState, useEffect } from 'react';
import { X, Clock, RotateCcw, Eye, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Version {
  version_id: string;
  content_type: string;
  parent_version?: string;
  created_at: string;
  modification: string;
  metadata?: Record<string, unknown>;
  file_path?: string;
  is_current?: boolean;
}

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onRevert?: (versionId: string) => void;
  onPreview?: (version: Version) => void;
}

export function VersionHistory({
  isOpen,
  onClose,
  projectId,
  onRevert,
  onPreview,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadVersions();
    }
  }, [isOpen, projectId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      // TODO: 调用后端 API 获取版本列表
      // const response = await fetch(`/api/modify/versions/${projectId}`);
      // const data = await response.json();
      // setVersions(data.versions || []);
      
      // 模拟数据用于演示
      setVersions([
        {
          version_id: 'v1_20260405_100000',
          content_type: 'ppt',
          created_at: new Date().toISOString(),
          modification: '初始生成',
          is_current: false,
        },
        {
          version_id: 'v2_20260405_103000',
          content_type: 'ppt',
          parent_version: 'v1_20260405_100000',
          created_at: new Date().toISOString(),
          modification: '添加更多教学内容',
          is_current: false,
        },
        {
          version_id: 'v3_20260405_110000',
          content_type: 'ppt',
          parent_version: 'v2_20260405_103000',
          created_at: new Date().toISOString(),
          modification: '调整幻灯片顺序',
          is_current: true,
        },
      ]);
    } catch (err) {
      toast.error(`加载版本列表失败：${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (versionId: string) => {
    if (!confirm('确定要回退到此版本吗？当前版本将被覆盖。')) {
      return;
    }

    try {
      // TODO: 调用后端 API 回退版本
      // await fetch(`/api/modify/revert/${projectId}/${versionId}`, { method: 'POST' });
      
      toast.success('版本回退成功');
      onRevert?.(versionId);
      loadVersions();
    } catch (err) {
      toast.error(`回退失败：${(err as Error).message}`);
    }
  };

  const handlePreview = (version: Version) => {
    setSelectedVersion(version);
    onPreview?.(version);
  };

  const handleClose = () => {
    setSelectedVersion(null);
    onClose();
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'ppt':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'word':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'animation':
      case 'quiz':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-background shadow-xl">
        {/* 顶部 */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">版本历史</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 版本列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Clock className="mb-2 h-12 w-12" />
              <p>暂无版本历史</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div
                  key={version.version_id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4 transition-colors',
                    version.is_current && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">v{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(version.content_type)}
                        <span className="font-medium">{version.modification}</span>
                        {version.is_current && (
                          <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            当前版本
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(version)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      预览
                    </Button>
                    {!version.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevert(version.version_id)}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        回退
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          <p>版本历史功能可以帮助您追踪课件的修改记录，随时回退到之前的版本</p>
        </div>
      </div>
    </div>
  );
}
