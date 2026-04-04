"""
迭代优化模块 - 修改意见理解和版本管理
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid

from modules.modification_service import modification_service
from modules.version_manager import get_version_manager
from modules.generator_service import generator_service
from config import settings

router = APIRouter(prefix="/api/modify", tags=["modify"])


class ModifyRequest(BaseModel):
    """修改请求"""
    project_id: str
    current_content: Dict[str, Any]  # 当前课件内容
    modification_request: str  # 修改意见


class ModifyResponse(BaseModel):
    """修改响应"""
    status: str
    modification_plan: Dict[str, Any]
    new_file_path: Optional[str] = None
    new_version_id: Optional[str] = None
    message: str


class VersionListResponse(BaseModel):
    """版本列表响应"""
    versions: List[Dict[str, Any]]
    current_version: Optional[str]
    total: int


@router.post("/understand", response_model=Dict[str, Any])
async def understand_modification(
    project_id: str,
    current_content: Dict[str, Any],
    modification_request: str
):
    """
    理解修改意见
    
    分析用户的修改指令，返回修改计划
    """
    try:
        plan = await modification_service.understand_modification(
            original_content=current_content,
            modification_request=modification_request
        )
        
        return {
            "status": "success",
            "plan": plan
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"理解修改意见失败：{str(e)}"
        )


@router.post("/apply", response_model=ModifyResponse)
async def apply_modification(request: ModifyRequest):
    """
    应用修改
    
    根据修改意见生成新版本课件
    """
    try:
        # 1. 理解修改意见
        plan = await modification_service.understand_modification(
            original_content=request.current_content,
            modification_request=request.modification_request
        )
        
        if plan.get("status") == "error":
            return ModifyResponse(
                status="error",
                modification_plan=plan,
                message=plan.get("message", "理解修改意见失败")
            )
        
        # 2. 根据修改计划生成新内容
        new_content = request.current_content.copy()
        
        # 应用修改（简化版：直接重新生成）
        # TODO: 实现增量修改
        if "ppt" in request.current_content:
            ppt_data = request.current_content["ppt"]
            
            # 应用修改到 slides
            modified_slides = _apply_modifications_to_slides(
                ppt_data.get("slides", []),
                plan.get("actions", [])
            )
            
            # 生成新 PPT
            new_file_path = generator_service.generate_ppt(
                title=ppt_data.get("title", "Untitled"),
                slides=modified_slides,
                subtitle=ppt_data.get("subtitle"),
                output_filename=f"ppt_modified_{uuid.uuid4().hex[:8]}.pptx"
            )
            
            # 3. 创建新版本
            version_manager = get_version_manager(request.project_id)
            version_id = version_manager.create_version(
                content_type="ppt",
                file_path=new_file_path,
                content_snapshot={
                    "title": ppt_data.get("title"),
                    "slides": modified_slides
                },
                modification=request.modification_request
            )
            
            return ModifyResponse(
                status="success",
                modification_plan=plan,
                new_file_path=new_file_path,
                new_version_id=version_id,
                message="修改已应用"
            )
        
        else:
            return ModifyResponse(
                status="error",
                modification_plan=plan,
                message="暂不支持此类型内容的修改"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"应用修改失败：{str(e)}"
        )


@router.get("/versions/{project_id}", response_model=VersionListResponse)
async def list_versions(project_id: str):
    """列出项目的所有版本"""
    try:
        version_manager = get_version_manager(project_id)
        versions = version_manager.list_versions()
        current_version = version_manager.current_version
        
        return VersionListResponse(
            versions=versions,
            current_version=current_version,
            total=len(versions)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取版本列表失败：{str(e)}"
        )


@router.get("/versions/{project_id}/{version_id}")
async def get_version(project_id: str, version_id: str):
    """获取指定版本信息"""
    try:
        version_manager = get_version_manager(project_id)
        version = version_manager.get_version(version_id)
        
        if not version:
            raise HTTPException(status_code=404, detail="版本不存在")
        
        return {
            "version": version.to_dict(),
            "content_snapshot": version.content_snapshot
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取版本信息失败：{str(e)}"
        )


@router.post("/revert/{project_id}/{version_id}")
async def revert_to_version(project_id: str, version_id: str):
    """回退到指定版本"""
    try:
        version_manager = get_version_manager(project_id)
        file_path = version_manager.revert_to(version_id)
        
        return {
            "status": "success",
            "version_id": version_id,
            "file_path": file_path
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"回退版本失败：{str(e)}"
        )


@router.get("/diff/{project_id}")
async def diff_versions(
    project_id: str,
    version_1: str,
    version_2: str
):
    """对比两个版本"""
    try:
        version_manager = get_version_manager(project_id)
        diff_result = version_manager.diff_versions(version_1, version_2)
        
        return {
            "status": "success",
            "diff": diff_result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"版本对比失败：{str(e)}"
        )


@router.get("/download/{project_id}/{version_id}")
async def download_version(project_id: str, version_id: str):
    """下载指定版本的文件"""
    try:
        version_manager = get_version_manager(project_id)
        file_path = version_manager.get_version_file(version_id)
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="版本文件不存在")
        
        filename = os.path.basename(file_path)
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"下载失败：{str(e)}"
        )


def _apply_modifications_to_slides(
    slides: List[Dict[str, Any]],
    actions: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    应用修改到幻灯片列表
    
    TODO: 实现完整的增量修改逻辑
    当前简化版：直接返回原 slides
    """
    modified_slides = slides.copy()
    
    for action in actions:
        action_type = action.get("action")
        target = action.get("target")
        
        if action_type == "update" and isinstance(target, int):
            if 0 <= target < len(modified_slides):
                # 更新指定页面内容
                if "content" in action:
                    modified_slides[target]["content"] = action["content"]
        
        elif action_type == "delete" and isinstance(target, int):
            # 删除页面
            if 0 <= target < len(modified_slides):
                modified_slides.pop(target)
        
        elif action_type == "insert" and isinstance(target, int):
            # 插入新页面
            new_slide = {
                "title": action.get("title", "新页面"),
                "content": action.get("content", "")
            }
            modified_slides.insert(target, new_slide)
    
    return modified_slides
