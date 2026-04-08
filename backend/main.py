"""
TeachPilot Backend - 多模态 AI 互动式教学智能体
锐捷网络 A04 赛题参赛项目

API 文档：http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from config import settings

# 导入路由模块
from routes import chat, rag, files, generate, modify, tts
from routes import settings as settings_router

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="多模态 AI 互动式教学智能体后端服务",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 配置（开发环境允许所有来源）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 确保必要的目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.KNOWLEDGE_BASE_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

# 注册路由
app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(files.router)
app.include_router(generate.router)
app.include_router(modify.router)
app.include_router(tts.router)
app.include_router(settings_router.router)


@app.get("/")
async def root():
    """根路径 - API 状态"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "version": settings.VERSION
    }


@app.get("/api/status")
async def api_status():
    """API 状态概览"""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "modules": {
            "chat": "✅ 对话管理",
            "rag": "✅ 知识库检索",
            "files": "✅ 文件上传",
            "generate": "✅ 课件生成",
            "modify": "✅ 修改意见理解",
            "settings": "✅ 用户设置"
        },
        "config": {
            "model": settings.MODEL_ID,
            "debug": settings.DEBUG
        }
    }


if __name__ == "__main__":
    import uvicorn
    print("[TeachPilot] 启动中...")
    print(f"[TeachPilot] API 文档：http://localhost:{settings.PORT}/docs")
    print(f"[TeachPilot] 健康检查：http://localhost:{settings.PORT}/health")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
