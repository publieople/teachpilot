"""
TTS 模块 - Edge TTS 文字转语音
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

from config import settings
from modules.tts_service import tts_service, CHINESE_VOICES

router = APIRouter(prefix="/api/tts", tags=["tts"])


class TTSRequest(BaseModel):
    text: str
    voice: str = "zh-CN-XiaoxiaoNeural"
    rate: str = "+0%"
    volume: str = "+0%"
    pitch: str = "+0Hz"


class VoiceInfo(BaseModel):
    Name: str
    ShortName: str
    Gender: str
    Locale: str
    FriendlyName: str


@router.post("/generate")
async def generate_speech(request: TTSRequest):
    """
    生成语音
    
    将文本转换为语音，返回 MP3 音频文件
    """
    try:
        # 验证文本
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="文本内容为空")
        
        # 生成语音
        file_path = await tts_service.generate_speech(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch,
        )
        
        filename = os.path.basename(file_path)
        
        return FileResponse(
            file_path,
            filename=filename,
            media_type="audio/mpeg"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音生成失败：{str(e)}")


@router.get("/voices", response_model=List[VoiceInfo])
async def list_voices(locale: Optional[str] = None):
    """
    获取可用语音列表
    
    Args:
        locale: 语言区域过滤，如 "zh-CN"
    """
    try:
        voices = await tts_service.get_voices(locale)
        return voices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取语音列表失败：{str(e)}")


@router.get("/voices/chinese", response_model=Dict[str, str])
async def list_chinese_voices():
    """获取中文语音预设列表"""
    return CHINESE_VOICES


@router.get("/voice/{voice_name}")
async def get_voice_info(voice_name: str):
    """
    获取语音详细信息
    
    Args:
        voice_name: 语音名称或简称
    """
    # 尝试从预设中获取
    voice_id = CHINESE_VOICES.get(voice_name.lower())
    
    if voice_id:
        info = tts_service.get_voice_info(voice_id)
        if info:
            return {
                "voice_id": voice_id,
                "info": info
            }
    
    # 直接从缓存中查找
    info = tts_service.get_voice_info(voice_name)
    if info:
        return {
            "voice_id": voice_name,
            "info": info
        }
    
    raise HTTPException(status_code=404, detail=f"未找到语音：{voice_name}")
