import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUploader } from '@/components/files/FileUploader';
import { uploadKnowledge, searchKnowledge, getCollections, type KnowledgeItem } from '@/services/rag';
import { BookOpen, Search, Database, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载知识库统计
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data.collections);
    } catch (err) {
      console.error('加载集合失败:', err);
    }
  };

  // 处理文件上传到知识库
  const handleUpload = async (file: File) => {
    try {
      await uploadKnowledge(file);
      toast.success(`文件已添加到知识库：${file.name}`);
      loadCollections();
    } catch (err) {
      toast.error(`上传失败：${(err as Error).message}`);
      throw err;
    }
  };

  // 处理搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('请输入搜索内容');
      return;
    }

    setLoading(true);
    try {
      const data = await searchKnowledge({ query: searchQuery, top_k: 10 });
      setSearchResults(data.results);
      toast.success(`找到 ${data.total} 条相关结果`);
    } catch (err) {
      toast.error(`搜索失败：${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm(`确定要删除知识库集合 "${collectionId}" 吗？`)) {
      return;
    }
    // TODO: 实现删除功能
    toast.info('删除功能开发中');
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">知识库</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传和管理您的教学资料，用于 AI 检索增强生成
          </p>
        </div>

        {/* 上传区域 */}
        <div className="mb-8">
          <FileUploader onUpload={handleUpload} />
        </div>

        {/* 搜索区域 */}
        <div className="mb-8 rounded-lg border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5" />
            检索知识库
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入搜索关键词..."
              className="flex-1 rounded-md border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? '搜索中...' : '搜索'}
            </Button>
          </div>
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">搜索结果</h2>
            <div className="space-y-3">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">
                      相关度：{(item.score * 100).toFixed(1)}%
                    </span>
                    {(() => {
                      const filename = item.metadata.filename;
                      if (filename) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            来源：{String(filename)}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <p className="mt-2 text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 知识库集合列表 */}
        {collections.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5" />
              知识库集合
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div
                  key={collection}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{collection}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCollection(collection)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
