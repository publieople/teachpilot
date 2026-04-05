"""
设置管理模块 - 用户配置管理
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os
import json

from config import settings

router = APIRouter(prefix="/api/settings", tags=["settings"])

SETTINGS_FILE = "user_settings.json"


class UserSettings(BaseModel):
    """用户设置模型"""
    model_id: str = Field(default="qwen/qwen3.6-plus:free", description="模型 ID")
    temperature: float = Field(default=0.7, ge=0, le=2, description="温度参数")
    max_tokens: int = Field(default=2048, ge=100, le=8192, description="最大 Token 数")
    desktop_notifications: bool = Field(default=True, description="桌面通知")
    sound_effects: bool = Field(default=False, description="提示音")
    language: str = Field(default="zh-CN", description="界面语言")


def load_user_settings() -> UserSettings:
    """加载用户设置"""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return UserSettings(**data)
        except Exception as e:
            print(f"加载设置失败：{e}")
    
    return UserSettings()


def save_user_settings(user_settings: UserSettings):
    """保存用户设置"""
    try:
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(user_settings.dict(), f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"保存设置失败：{e}")
        raise HTTPException(status_code=500, detail=f"保存设置失败：{str(e)}")


@router.get("/", response_model=UserSettings)
async def get_settings():
    """获取用户设置"""
    return load_user_settings()


@router.put("/", response_model=UserSettings)
async def update_settings(user_settings: UserSettings):
    """更新用户设置"""
    save_user_settings(user_settings)
    return user_settings


@router.post("/reset", response_model=UserSettings)
async def reset_settings():
    """重置用户设置"""
    default_settings = UserSettings()
    save_user_settings(default_settings)
    
    # 删除设置文件
    if os.path.exists(SETTINGS_FILE):
        os.remove(SETTINGS_FILE)
    
    return default_settings


@router.get("/model-options")
async def get_model_options():
    """获取可用模型列表"""
    return {
        "models": [
            {
                "id": "qwen/qwen3.6-plus:free",
                "name": "Qwen3.6-Plus (免费)",
                "description": "通义千问多模态模型，免费额度",
                "recommended": True
            },
            {
                "id": "qwen/qwen-plus",
                "name": "Qwen-Plus",
                "description": "通义千问增强版，付费",
                "recommended": False
            },
            {
                "id": "qwen/qwen-max",
                "name": "Qwen-Max",
                "description": "通义千问最大模型，付费",
                "recommended": False
            },
            {
                "id": "anthropic/claude-3.5-sonnet",
                "name": "Claude 3.5 Sonnet",
                "description": "Anthropic Claude 模型",
                "recommended": False
            },
            {
                "id": "openai/gpt-4o",
                "name": "GPT-4o",
                "description": "OpenAI GPT-4o 模型",
                "recommended": False
            }
        ]
    }


@router.get("/system")
async def get_system_settings():
    """获取系统设置（只读）"""
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "debug": settings.DEBUG,
        "model_id": settings.MODEL_ID,
        "max_file_size": settings.MAX_FILE_SIZE,
        "upload_dir": settings.UPLOAD_DIR,
        "knowledge_base_dir": settings.KNOWLEDGE_BASE_DIR,
        "chroma_persist_dir": settings.CHROMA_PERSIST_DIR,
    }
