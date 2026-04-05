"""
对话管理模块 - 多轮对话与意图理解
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import httpx
import json

from config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])


class Message(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = False


class ChatResponse(BaseModel):
    content: str
    model: str
    usage: Optional[dict] = None


# 教学意图提取 Prompt
INTENT_EXTRACTION_PROMPT = """你是一个专业的教学助手。请分析教师的教学设计意图，并提取以下结构化信息：

1. 教学目标：本节课希望学生掌握什么
2. 核心知识点：主要讲授的知识点列表
3. 重点难点：需要重点讲解和学生容易困惑的内容
4. 授课对象：学生的年级/水平
5. 预计时长：课程时长
6. 教学风格：偏好的讲授风格（如互动式、讲授式、案例式等）
7. 特殊要求：其他个性化需求

请以 JSON 格式返回，如果某些信息不明确，请标记为 null 并在回复中说明需要进一步确认。
"""


async def stream_generator(messages: list, temperature: float, max_tokens: int) -> AsyncGenerator[str, None]:
    """
    流式生成器 - 参考 Open WebUI 实现
    使用 SSE (Server-Sent Events) 格式返回数据
    """
    if not settings.OPENROUTER_API_KEY:
        yield 'data: {"error": "OpenRouter API Key 未配置"}\n\n'
        return

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Publieople/teachpilot",
        "X-Title": "TeachPilot"
    }

    payload = {
        "model": settings.MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True  # 启用流式输出
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # 使用 stream 方法获取流式响应
            async with client.stream(
                "POST",
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                
                # 直接读取原始字节流，保持 SSE 格式完整
                async for chunk in response.aiter_bytes():
                    yield chunk.decode('utf-8')
                        
    except httpx.HTTPError as e:
        yield f'data: {{"error": "{str(e)}"}}\n\n'


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """发送消息并获取回复"""
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API Key 未配置，请在 .env 文件中设置 OPENROUTER_API_KEY"
        )

    # 构建 OpenRouter API 请求
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Publieople/teachpilot",
        "X-Title": "TeachPilot"
    }

    # 转换消息格式
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    payload = {
        "model": settings.MODEL_ID,
        "messages": messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()

            return ChatResponse(
                content=data["choices"][0]["message"]["content"],
                model=data.get("model", settings.MODEL_ID),
                usage=data.get("usage")
            )
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"调用 LLM API 失败：{str(e)}"
        )


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """
    流式发送消息
    返回 SSE (Server-Sent Events) 格式的流式数据
    """
    # 转换消息格式
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    return StreamingResponse(
        stream_generator(messages, request.temperature, request.max_tokens),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
        }
    )


@router.post("/extract-intent")
async def extract_teaching_intent(messages: List[Message]):
    """从对话中提取教学意图"""
    # 构建系统消息
    system_message = Message(
        role="system",
        content=INTENT_EXTRACTION_PROMPT
    )

    # 合并所有消息
    all_messages = [system_message] + messages

    chat_request = ChatRequest(
        messages=all_messages,
        temperature=0.3,  # 降低温度使输出更稳定
        max_tokens=1024
    )

    return await send_message(chat_request)


@router.get("/history")
async def get_chat_history(session_id: Optional[str] = None):
    """获取对话历史（待实现）"""
    return {
        "session_id": session_id,
        "messages": [],
        "note": "对话历史功能开发中"
    }
