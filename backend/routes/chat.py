"""
对话管理模块 - 多轮对话与意图理解
支持会话历史管理
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, AsyncGenerator, Dict, Any
import httpx
import json

from config import settings
from modules.database import db

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ==================== 数据模型 ====================

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


class SessionCreate(BaseModel):
    title: Optional[str] = "新对话"
    initial_message: Optional[Message] = None
    metadata: Optional[Dict[str, Any]] = None


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    is_archived: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    is_archived: bool
    message_count: Optional[int] = None
    last_message_preview: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MessageCreate(BaseModel):
    content: str
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = False


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: str
    metadata: Optional[Dict[str, Any]] = None


# ==================== 会话管理接口 ====================

@router.get("/sessions", response_model=Dict[str, Any])
async def list_sessions(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    archived: bool = Query(False, description="是否仅查询归档会话")
):
    """获取会话列表（支持分页）"""
    result = db.get_sessions(
        user_id="default",  # 预留多用户支持
        page=page,
        page_size=page_size,
        archived=archived
    )
    return result


@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: SessionCreate):
    """创建新会话"""
    session_id = db.create_session(
        title=request.title or "新对话",
        user_id="default",
        metadata=request.metadata
    )
    
    # 如果有初始消息，添加到会话
    if request.initial_message:
        db.add_message(
            session_id=session_id,
            role=request.initial_message.role,
            content=request.initial_message.content
        )
    
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=500, detail="创建会话失败")
    
    return SessionResponse(
        id=session['id'],
        title=session['title'],
        created_at=session['created_at'],
        updated_at=session['updated_at'],
        is_archived=session['is_archived'],
        message_count=session.get('message_count'),
        last_message_preview=session.get('last_message_preview'),
        metadata=json.loads(session['metadata']) if session.get('metadata') else None
    )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """获取会话详情"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    return SessionResponse(
        id=session['id'],
        title=session['title'],
        created_at=session['created_at'],
        updated_at=session['updated_at'],
        is_archived=session['is_archived'],
        message_count=session.get('message_count'),
        last_message_preview=session.get('last_message_preview'),
        metadata=json.loads(session['metadata']) if session.get('metadata') else None
    )


@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(session_id: str, request: SessionUpdate):
    """更新会话（标题、归档状态等）"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    db.update_session(
        session_id=session_id,
        title=request.title,
        is_archived=request.is_archived,
        metadata=request.metadata
    )
    
    # 重新获取更新后的会话
    session = db.get_session(session_id)
    
    return SessionResponse(
        id=session['id'],
        title=session['title'],
        created_at=session['created_at'],
        updated_at=session['updated_at'],
        is_archived=session['is_archived'],
        message_count=session.get('message_count'),
        last_message_preview=session.get('last_message_preview'),
        metadata=json.loads(session['metadata']) if session.get('metadata') else None
    )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """删除会话"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    db.delete_session(session_id)
    
    return {
        "status": "success",
        "message": "会话已删除"
    }


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(
    session_id: str,
    before: Optional[str] = Query(None, description="游标分页，此 ID 之前的消息"),
    limit: int = Query(50, ge=1, le=100, description="每次获取数量")
):
    """获取会话消息列表"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    messages = db.get_messages(session_id, before=before, limit=limit)
    
    return [
        MessageResponse(
            id=msg['id'],
            session_id=msg['session_id'],
            role=msg['role'],
            content=msg['content'],
            created_at=msg['created_at'],
            metadata=msg.get('metadata')
        )
        for msg in messages
    ]


@router.post("/sessions/{session_id}/messages")
async def send_session_message(
    session_id: str,
    request: MessageCreate
):
    """在指定会话中发送消息"""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 保存用户消息
    user_message_id = db.add_message(
        session_id=session_id,
        role="user",
        content=request.content
    )
    
    if request.stream:
        # 流式响应
        return StreamingResponse(
            stream_session_generator(session_id, request.content, request.temperature, request.max_tokens),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    else:
        # 非流式响应
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API Key 未配置，请在 .env 文件中设置 OPENAI_API_KEY"
            )
        
        # 获取会话历史消息
        history_messages = db.get_messages(session_id, limit=20)
        messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in history_messages
        ]
        messages.append({"role": "user", "content": request.content})
        
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": settings.MODEL_ID,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.OPENAI_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                assistant_content = data["choices"][0]["message"]["content"]
                
                # 保存 AI 回复
                assistant_message_id = db.add_message(
                    session_id=session_id,
                    role="assistant",
                    content=assistant_content
                )
                
                return {
                    "id": assistant_message_id,
                    "content": assistant_content,
                    "model": data.get("model", settings.MODEL_ID),
                    "usage": data.get("usage")
                }
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500,
                detail=f"调用 LLM API 失败：{str(e)}"
            )


# ==================== 原有接口（保持兼容） ====================

async def stream_generator(messages: list, temperature: float, max_tokens: int) -> AsyncGenerator[str, None]:
    """
    流式生成器 - 无会话模式
    """
    if not settings.OPENAI_API_KEY:
        yield 'data: {"error": "OpenAI API Key 未配置"}\n\n'
        return

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True
    }

    buffer = ""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{settings.OPENAI_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                
                async for chunk in response.aiter_bytes():
                    buffer += chunk.decode('utf-8')
                    
                    # 按 SSE 事件边界（双换行）分割
                    while '\n\n' in buffer:
                        event, buffer = buffer.split('\n\n', 1)
                        if event.strip():
                            yield event + '\n\n'
                                    
                # 处理剩余数据
                if buffer.strip():
                    yield buffer + '\n\n'
                        
    except httpx.HTTPError as e:
        yield f'data: {{"error": "{str(e)}"}}\n\n'


async def stream_session_generator(
    session_id: str,
    user_content: str,
    temperature: float,
    max_tokens: int
) -> AsyncGenerator[str, None]:
    """
    流式生成器 - 带会话模式
    """
    if not settings.OPENAI_API_KEY:
        yield 'data: {"error": "OpenAI API Key 未配置"}\n\n'
        return

    # 获取会话历史消息
    history_messages = db.get_messages(session_id, limit=20)
    messages = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in history_messages
    ]
    messages.append({"role": "user", "content": user_content})

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True
    }

    assistant_content = ""
    buffer = ""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{settings.OPENAI_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                
                async for chunk in response.aiter_bytes():
                    buffer += chunk.decode('utf-8')
                    
                    # 按 SSE 事件边界（双换行）分割
                    while '\n\n' in buffer:
                        event, buffer = buffer.split('\n\n', 1)
                        if event.strip():
                            yield event + '\n\n'
                            # 提取 content 用于保存
                            try:
                                for line in event.split('\n'):
                                    if line.startswith('data: '):
                                        data = line[6:]
                                        if data != '[DONE]':
                                            parsed = json.loads(data)
                                            content = parsed.get('choices', [{}])[0].get('delta', {}).get('content', '')
                                            if content:
                                                assistant_content += content
                            except:
                                pass
                                    
                # 处理剩余数据
                if buffer.strip():
                    yield buffer + '\n\n'
                    try:
                        for line in buffer.split('\n'):
                            if line.startswith('data: '):
                                data = line[6:]
                                if data != '[DONE]':
                                    parsed = json.loads(data)
                                    content = parsed.get('choices', [{}])[0].get('delta', {}).get('content', '')
                                    if content:
                                        assistant_content += content
                    except:
                        pass
                        
        # 保存完整的 AI 回复到数据库
        db.add_message(
            session_id=session_id,
            role="assistant",
            content=assistant_content
        )
                    
    except httpx.HTTPError as e:
        yield f'data: {{"error": "{str(e)}"}}\n\n'


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """发送消息并获取回复（无会话模式，保持兼容）"""
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Key 未配置，请在 .env 文件中设置 OPENAI_API_KEY"
        )

    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

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
                f"{settings.OPENAI_BASE_URL}/chat/completions",
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
    流式发送消息（无会话模式，保持兼容）
    """
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
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/extract-intent")
async def extract_teaching_intent(messages: List[Message]):
    """从对话中提取教学意图"""
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

    system_message = Message(
        role="system",
        content=INTENT_EXTRACTION_PROMPT
    )

    all_messages = [system_message] + messages

    chat_request = ChatRequest(
        messages=all_messages,
        temperature=0.3,
        max_tokens=1024
    )

    return await send_message(chat_request)


@router.get("/history")
async def get_chat_history(session_id: Optional[str] = None):
    """获取对话历史（已废弃，请使用 /sessions/{session_id}/messages）"""
    if session_id:
        messages = db.get_messages(session_id, limit=50)
        return {
            "session_id": session_id,
            "messages": messages,
            "note": "使用新的会话管理 API"
        }
    
    return {
        "session_id": None,
        "messages": [],
        "note": "请使用 /api/chat/sessions 获取会话列表"
    }
