"""
课件生成模块 - PPT 和 Word 教案生成
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

from config import settings
from modules.generator_service import generator_service

router = APIRouter(prefix="/api/generate", tags=["generate"])


class Slide(BaseModel):
    title: str
    content: Any  # 可以是字符串或列表
    notes: Optional[str] = None


class GeneratePPTRequest(BaseModel):
    title: str
    slides: List[Slide]
    subtitle: Optional[str] = None


class GenerateWordRequest(BaseModel):
    title: str
    teaching_objectives: str
    teaching_content: str
    teaching_methods: str
    teaching_process: List[Dict[str, str]]  # [{stage: "...", content: "..."}]
    classroom_activities: str
    homework: str


class GenerateQuizRequest(BaseModel):
    title: str
    questions: List[Dict[str, Any]]  # [{question, options, answer}]


class GenerationResult(BaseModel):
    status: str
    file_path: str
    filename: str
    download_url: str
    message: str


@router.post("/ppt", response_model=GenerationResult)
async def generate_ppt(request: GeneratePPTRequest):
    """生成 PPT 课件"""
    try:
        # 转换 slides 格式
        slides_data = [
            {
                'title': slide.title,
                'content': slide.content,
                'notes': slide.notes
            }
            for slide in request.slides
        ]
        
        # 生成 PPT
        file_path = generator_service.generate_ppt(
            title=request.title,
            slides=slides_data,
            subtitle=request.subtitle
        )
        
        filename = os.path.basename(file_path)
        
        return GenerationResult(
            status="success",
            file_path=file_path,
            filename=filename,
            download_url=f"/api/generate/download/{filename}",
            message="PPT 生成成功"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PPT 生成失败：{str(e)}"
        )


@router.post("/word", response_model=GenerationResult)
async def generate_word(request: GenerateWordRequest):
    """生成 Word 教案"""
    try:
        file_path = generator_service.generate_word_lesson_plan(
            title=request.title,
            teaching_objectives=request.teaching_objectives,
            teaching_content=request.teaching_content,
            teaching_methods=request.teaching_methods,
            teaching_process=request.teaching_process,
            classroom_activities=request.classroom_activities,
            homework=request.homework
        )
        
        filename = os.path.basename(file_path)
        
        return GenerationResult(
            status="success",
            file_path=file_path,
            filename=filename,
            download_url=f"/api/generate/download/{filename}",
            message="Word 教案生成成功"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Word 教案生成失败：{str(e)}"
        )


@router.post("/animation")
async def generate_animation(
    title: str,
    content: str,
    animation_type: str = "fade"
):
    """生成知识点动画"""
    try:
        file_path = generator_service.generate_html_animation(
            title=title,
            content=content,
            animation_type=animation_type
        )
        
        filename = os.path.basename(file_path)
        
        return {
            "status": "success",
            "file_path": file_path,
            "filename": filename,
            "download_url": f"/api/generate/download/{filename}",
            "type": "animation"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"动画生成失败：{str(e)}"
        )


@router.post("/quiz", response_model=GenerationResult)
async def generate_quiz(request: GenerateQuizRequest):
    """生成互动问答游戏"""
    try:
        file_path = generator_service.generate_quiz_game(
            title=request.title,
            questions=request.questions
        )
        
        filename = os.path.basename(file_path)
        
        return GenerationResult(
            status="success",
            file_path=file_path,
            filename=filename,
            download_url=f"/api/generate/download/{filename}",
            message="互动问答游戏生成成功"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"游戏生成失败：{str(e)}"
        )


@router.get("/download/{filename}")
async def download_file(filename: str):
    """下载生成的文件"""
    file_path = os.path.join(settings.OUTPUT_DIR if hasattr(settings, 'OUTPUT_DIR') else "outputs", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        file_path,
        filename=filename,
        media_type='application/octet-stream'
    )


@router.get("/list")
async def list_generated_files():
    """列出所有生成的文件"""
    output_dir = settings.OUTPUT_DIR if hasattr(settings, 'OUTPUT_DIR') else "outputs"
    
    if not os.path.exists(output_dir):
        return {'files': [], 'total': 0}
    
    files = []
    for filename in os.listdir(output_dir):
        file_path = os.path.join(output_dir, filename)
        if os.path.isfile(file_path):
            stat = os.stat(file_path)
            files.append({
                'filename': filename,
                'size': stat.st_size,
                'created_at': stat.st_ctime
            })
    
    return {
        'files': files,
        'total': len(files)
    }
