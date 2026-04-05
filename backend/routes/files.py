"""
文件上传与多模态解析模块
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import uuid
from datetime import datetime
import shutil

from config import settings
from modules.multimodal_service import multimodal_service
from modules.rag_service import rag_service

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
    "gif": ["image/gif"],
    "webp": ["image/webp"],
    "mp4": ["video/mp4"],
    "avi": ["video/x-msvideo"],
    "mov": ["video/quicktime"],
    "mkv": ["video/x-matroska"],
    "txt": ["text/plain"],
    "md": ["text/markdown", "text/plain"],
}


class FileInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_time: str
    status: str
    metadata: Optional[Dict[str, Any]] = None


class ParseResult(BaseModel):
    file_id: str
    file_type: str
    summary: str
    metadata: Dict[str, Any]
    added_to_rag: bool


@router.post("/upload", response_model=FileInfo)
async def upload_file(
    file: UploadFile = File(...),
    add_to_rag: bool = Form(False),
    collection: Optional[str] = Form(None)
):
    """上传参考资料（PDF/Word/PPT/图片/视频/TXT/MD）"""
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
    
    # 如果需要添加到 RAG
    if add_to_rag:
        try:
            # 解析文件并获取摘要
            summary = multimodal_service.get_file_summary(file_path)
            if summary:
                rag_service.add_document(
                    content=summary,
                    metadata={
                        'filename': file.filename,
                        'file_id': file_id,
                        'source': 'upload',
                        'type': extension
                    },
                    collection_name=collection
                )
        except Exception as e:
            # RAG 添加失败不影响文件上传
            print(f"添加到 RAG 失败：{str(e)}")
    
    # 返回文件信息
    return FileInfo(
        id=file_id,
        filename=file.filename,
        file_type=extension,
        file_size=len(content),
        upload_time=datetime.now().isoformat(),
        status="uploaded",
        metadata={
            'path': file_path,
            'content_type': file.content_type
        }
    )


@router.post("/{file_id}/parse", response_model=ParseResult)
async def parse_file(
    file_id: str,
    add_to_rag: bool = True,
    collection: Optional[str] = None
):
    """解析文件内容"""
    # 查找文件
    file_info = await _get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件未找到")
    
    file_path = file_info['path']
    file_type = file_info['type']
    
    try:
        # 解析文件
        result = multimodal_service.parse_file(file_path, file_type)
        
        # 获取摘要
        summary = multimodal_service.get_file_summary(file_path)
        
        # 添加到 RAG
        added_to_rag = False
        if add_to_rag and summary:
            try:
                rag_service.add_document(
                    content=summary,
                    metadata={
                        'filename': file_info['filename'],
                        'file_id': file_id,
                        'source': 'parse',
                        'type': file_type
                    },
                    collection_name=collection
                )
                added_to_rag = True
            except Exception as e:
                print(f"添加到 RAG 失败：{str(e)}")
        
        return ParseResult(
            file_id=file_id,
            file_type=file_type,
            summary=summary[:500] if len(summary) > 500 else summary,
            metadata=result,
            added_to_rag=added_to_rag
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败：{str(e)}")


@router.get("/list")
async def list_files():
    """列出所有上传的文件"""
    if not os.path.exists(settings.UPLOAD_DIR):
        return {'files': [], 'total': 0}
    
    files = []
    for filename in os.listdir(settings.UPLOAD_DIR):
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            stat = os.stat(file_path)
            files.append({
                'filename': filename,
                'size': stat.st_size,
                'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat()
            })
    
    return {
        'files': files,
        'total': len(files)
    }


@router.get("/{file_id}")
async def get_file_info(file_id: str):
    """获取文件信息"""
    file_info = await _get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件未找到")
    
    return {
        'id': file_id,
        'filename': file_info['filename'],
        'type': file_info['type'],
        'size': file_info['size'],
        'upload_time': file_info['upload_time']
    }


@router.get("/{file_id}/download")
async def download_file(file_id: str):
    """下载文件"""
    file_info = await _get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件未找到")
    
    return FileResponse(
        file_info['path'],
        filename=file_info['filename'],
        media_type='application/octet-stream'
    )


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    """删除文件"""
    file_info = await _get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件未找到")
    
    try:
        os.remove(file_info['path'])
        return {'status': 'success', 'message': f'文件 {file_info["filename"]} 已删除'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败：{str(e)}")


async def _get_file_info(file_id: str) -> Optional[Dict[str, Any]]:
    """根据 file_id 查找文件信息"""
    if not os.path.exists(settings.UPLOAD_DIR):
        return None
    
    for filename in os.listdir(settings.UPLOAD_DIR):
        if filename.startswith(file_id + "_"):
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            stat = os.stat(file_path)
            return {
                'filename': filename.split("_", 1)[1] if "_" in filename else filename,
                'path': file_path,
                'type': filename.split(".")[-1].lower(),
                'size': stat.st_size,
                'upload_time': datetime.fromtimestamp(stat.st_ctime).isoformat()
            }
    
    return None
