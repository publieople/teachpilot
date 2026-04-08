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

    # OpenAI 兼容 API 配置
    # 支持任意 OpenAI 协议兼容的 API 服务
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"  # 默认使用 OpenAI
    MODEL_ID: str = "gpt-3.5-turbo"

    # ChromaDB 配置
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # 知识库配置
    KNOWLEDGE_BASE_DIR: str = "./knowledge-base"

    # 上传文件配置
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # 输出文件配置
    OUTPUT_DIR: str = "./outputs"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
