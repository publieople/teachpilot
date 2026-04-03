"""
TeachPilot Backend - 多模态 AI 互动式教学智能体
锐捷网络 A04 赛题参赛项目
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TeachPilot API",
    description="多模态 AI 互动式教学智能体后端服务",
    version="0.1.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境，生产环境需限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "TeachPilot",
        "version": "0.1.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# TODO: 后续模块
# - 对话管理模块
# - 多模态解析模块
# - RAG 检索模块
# - 课件生成模块

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
