"""
版本管理服务
管理课件的版本历史、对比、回退
"""

import os
import json
import shutil
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path


class VersionInfo:
    """版本信息类"""
    
    def __init__(
        self,
        version_id: str,
        content_type: str,
        parent_version: Optional[str] = None,
        modification: str = "初始生成",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.version_id = version_id
        self.content_type = content_type  # "ppt" | "word" | "animation" | "quiz"
        self.parent_version = parent_version
        self.created_at = datetime.now().isoformat()
        self.modification = modification
        self.metadata = metadata or {}
        self.file_path: Optional[str] = None
        self.content_snapshot: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "version_id": self.version_id,
            "content_type": self.content_type,
            "parent_version": self.parent_version,
            "created_at": self.created_at,
            "modification": self.modification,
            "metadata": self.metadata,
            "file_path": self.file_path
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VersionInfo":
        """从字典创建"""
        version = cls(
            version_id=data["version_id"],
            content_type=data["content_type"],
            parent_version=data.get("parent_version"),
            modification=data.get("modification", "未知"),
            metadata=data.get("metadata")
        )
        version.file_path = data.get("file_path")
        return version


class VersionManager:
    """版本管理器"""
    
    def __init__(self, project_id: str):
        """
        初始化版本管理器
        
        Args:
            project_id: 项目 ID（用于隔离不同项目的版本）
        """
        self.project_id = project_id
        self.versions: Dict[str, VersionInfo] = {}
        self.current_version: Optional[str] = None
        self.version_dir = self._get_version_dir()
        
        # 加载已有版本
        self._load_versions()
    
    def _get_version_dir(self) -> str:
        """获取版本存储目录"""
        return os.path.join("version_history", self.project_id)
    
    def _load_versions(self):
        """从磁盘加载版本信息"""
        version_file = os.path.join(self.version_dir, "versions.json")
        
        if os.path.exists(version_file):
            try:
                with open(version_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.versions = {
                        k: VersionInfo.from_dict(v) 
                        for k, v in data.get("versions", {}).items()
                    }
                    self.current_version = data.get("current_version")
            except Exception as e:
                print(f"加载版本信息失败：{e}")
    
    def _save_versions(self):
        """保存版本信息到磁盘"""
        os.makedirs(self.version_dir, exist_ok=True)
        
        data = {
            "versions": {k: v.to_dict() for k, v in self.versions.items()},
            "current_version": self.current_version
        }
        
        version_file = os.path.join(self.version_dir, "versions.json")
        with open(version_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def create_version(
        self,
        content_type: str,
        file_path: str,
        content_snapshot: Optional[Dict[str, Any]] = None,
        modification: str = "初始生成",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        创建新版本
        
        Args:
            content_type: 内容类型
            file_path: 文件路径
            content_snapshot: 内容快照（用于快速对比）
            modification: 修改描述
            metadata: 元数据
            
        Returns:
            版本号
        """
        # 生成版本号
        version_num = len(self.versions) + 1
        version_id = f"v{version_num}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # 创建版本信息
        version = VersionInfo(
            version_id=version_id,
            content_type=content_type,
            parent_version=self.current_version,
            modification=modification,
            metadata=metadata
        )
        version.file_path = file_path
        version.content_snapshot = content_snapshot
        
        # 复制文件到版本目录
        version_file_path = self._copy_file_to_version_dir(file_path, version_id)
        version.file_path = version_file_path
        
        # 保存版本
        self.versions[version_id] = version
        self.current_version = version_id
        self._save_versions()
        
        return version_id
    
    def _copy_file_to_version_dir(self, file_path: str, version_id: str) -> str:
        """复制文件到版本目录"""
        os.makedirs(self.version_dir, exist_ok=True)
        
        filename = os.path.basename(file_path)
        ext = Path(filename).suffix
        new_filename = f"{version_id}{ext}"
        new_path = os.path.join(self.version_dir, new_filename)
        
        shutil.copy2(file_path, new_path)
        return new_path
    
    def get_version(self, version_id: str) -> Optional[VersionInfo]:
        """获取指定版本信息"""
        return self.versions.get(version_id)
    
    def get_current_version(self) -> Optional[VersionInfo]:
        """获取当前版本"""
        if not self.current_version:
            return None
        return self.versions.get(self.current_version)
    
    def list_versions(self) -> List[Dict[str, Any]]:
        """列出所有版本"""
        versions_list = []
        
        # 按创建时间排序
        sorted_versions = sorted(
            self.versions.values(),
            key=lambda v: v.created_at
        )
        
        for version in sorted_versions:
            version_dict = version.to_dict()
            version_dict["is_current"] = (version.version_id == self.current_version)
            versions_list.append(version_dict)
        
        return versions_list
    
    def revert_to(self, version_id: str) -> str:
        """
        回退到指定版本
        
        Args:
            version_id: 版本号
            
        Returns:
            文件路径
        """
        if version_id not in self.versions:
            raise ValueError(f"版本不存在：{version_id}")
        
        version = self.versions[version_id]
        
        if not version.file_path:
            raise ValueError("版本文件不存在")
        
        # 更新当前版本
        self.current_version = version_id
        self._save_versions()
        
        return version.file_path
    
    def diff_versions(
        self,
        version_id_1: str,
        version_id_2: str
    ) -> Dict[str, Any]:
        """
        对比两个版本
        
        Args:
            version_id_1: 版本 1
            version_id_2: 版本 2
            
        Returns:
            对比结果
        """
        v1 = self.get_version(version_id_1)
        v2 = self.get_version(version_id_2)
        
        if not v1 or not v2:
            raise ValueError("版本不存在")
        
        diff_result = {
            "version_1": version_id_1,
            "version_2": version_id_2,
            "changes": []
        }
        
        # 对比内容快照
        if v1.content_snapshot and v2.content_snapshot:
            # PPT 对比
            if v1.content_type == "ppt" and v2.content_type == "ppt":
                diff_result["changes"] = self._diff_ppt(
                    v1.content_snapshot,
                    v2.content_snapshot
                )
        
        return diff_result
    
    def _diff_ppt(
        self,
        ppt1: Dict[str, Any],
        ppt2: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """对比两个 PPT"""
        changes = []
        
        slides1 = ppt1.get("slides", [])
        slides2 = ppt2.get("slides", [])
        
        # 页数变化
        if len(slides1) != len(slides2):
            changes.append({
                "type": "slide_count_change",
                "old_value": len(slides1),
                "new_value": len(slides2),
                "description": f"幻灯片数量从 {len(slides1)} 页变为 {len(slides2)} 页"
            })
        
        # 逐页对比
        for i in range(min(len(slides1), len(slides2))):
            s1 = slides1[i]
            s2 = slides2[i]
            
            # 标题变化
            if s1.get("title") != s2.get("title"):
                changes.append({
                    "type": "title_change",
                    "slide_index": i,
                    "old_value": s1.get("title"),
                    "new_value": s2.get("title"),
                    "description": f"第 {i+1} 页标题变更"
                })
            
            # 内容变化
            if str(s1.get("content")) != str(s2.get("content")):
                changes.append({
                    "type": "content_change",
                    "slide_index": i,
                    "description": f"第 {i+1} 页内容变更"
                })
        
        # 新增页面
        if len(slides2) > len(slides1):
            for i in range(len(slides1), len(slides2)):
                changes.append({
                    "type": "slide_added",
                    "slide_index": i,
                    "title": slides2[i].get("title"),
                    "description": f"新增第 {i+1} 页"
                })
        
        return changes
    
    def delete_version(self, version_id: str):
        """删除指定版本"""
        if version_id not in self.versions:
            raise ValueError(f"版本不存在：{version_id}")
        
        version = self.versions[version_id]
        
        # 删除文件
        if version.file_path and os.path.exists(version.file_path):
            os.remove(version.file_path)
        
        # 删除版本信息
        del self.versions[version_id]
        
        # 如果删除的是当前版本，回退到父版本
        if self.current_version == version_id:
            self.current_version = version.parent_version
        
        self._save_versions()
    
    def get_version_file(self, version_id: str) -> Optional[str]:
        """获取版本文件路径"""
        version = self.get_version(version_id)
        if not version:
            return None
        return version.file_path


# 版本管理器缓存
_version_managers: Dict[str, VersionManager] = {}


def get_version_manager(project_id: str) -> VersionManager:
    """获取或创建版本管理器"""
    if project_id not in _version_managers:
        _version_managers[project_id] = VersionManager(project_id)
    return _version_managers[project_id]
