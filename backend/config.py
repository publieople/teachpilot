"""
TeachPilot 配置模块
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 项目信息
    PROJECT_NAME: str = "TeachPilot"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # OpenRouter API 配置
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    MODEL_ID: str = "qwen/qwen3.6-plus:free"

    # ChromaDB 配置
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # 知识库配置
    KNOWLEDGE_BASE_DIR: str = "./knowledge-base"

    # 上传文件配置
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
