"""
文件上传与多模态解析模块
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uuid
from datetime import datetime

from config import settings

router = APIRouter(prefix="/api/files", tags=["files"])

# 支持的文件类型
ALLOWED_EXTENSIONS = {
    "pdf": ["application/pdf"],
    "doc": ["application/msword"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "ppt": ["application/vnd.ms-powerpoint"],
    "pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    "jpg": ["image/jpeg"],
    "jpeg": ["image/jpeg"],
    "png": ["image/png"],
    "mp4": ["video/mp4"],
    "avi": ["video/x-msvideo"],
    "mov": ["video/quicktime"],
}


class FileInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_time: str
    status: str
    metadata: Optional[Dict[str, Any]] = None


@router.post("/upload", response_model=FileInfo)
async def upload_file(file: UploadFile = File(...)):
    """上传参考资料（PDF/Word/PPT/图片/视频）"""
    # 确保上传目录存在
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # 检查文件扩展名
    extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型：{extension}。支持的类型：{list(ALLOWED_EXTENSIONS.keys())}"
        )

    # 生成唯一文件名
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败：{str(e)}")

    # 返回文件信息
    return FileInfo(
        id=file_id,
        filename=file.filename,
        file_type=extension,
        file_size=len(content),
        upload_time=datetime.now().isoformat(),
        status="uploaded",
        metadata={
            "path": file_path,
            "content_type": file.content_type
        }
    )


@router.get("/{file_id}", response_model=FileInfo)
async def get_file_info(file_id: str):
    """获取文件信息（待实现）"""
    # TODO: 从数据库或文件系统查询
    raise HTTPException(status_code=404, detail="文件未找到或功能开发中")


@router.get("/{file_id}/download")
async def download_file(file_id: str):
    """下载文件（待实现）"""
    # TODO: 实现文件下载
    raise HTTPException(status_code=404, detail="文件未找到或功能开发中")


@router.post("/{file_id}/parse")
async def parse_file(file_id: str):
    """解析文件内容（PDF/Word/视频等）"""
    # TODO: 实现多模态解析
    return {
        "file_id": file_id,
        "status": "pending",
        "note": "文件解析功能开发中"
    }
