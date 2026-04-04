"""
RAG 模块 - 本地知识库检索增强生成
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

from config import settings
from modules.rag_service import rag_service

router = APIRouter(prefix="/api/rag", tags=["rag"])


class KnowledgeItem(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    score: float


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    collection: Optional[str] = None


class SearchResponse(BaseModel):
    results: List[KnowledgeItem]
    total: int


class AddDocumentRequest(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None
    collection: Optional[str] = None


@router.post("/upload")
async def upload_knowledge(
    file: UploadFile = File(...),
    collection: Optional[str] = Form(None)
):
    """上传知识库文件（支持 TXT/MD）"""
    try:
        # 读取文件内容
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # 添加到知识库
        doc_id = rag_service.add_document(
            content=text_content,
            metadata={
                'filename': file.filename,
                'content_type': file.content_type,
                'source': 'upload'
            },
            collection_name=collection
        )
        
        return {
            'status': 'success',
            'document_id': doc_id,
            'filename': file.filename,
            'collection': collection or rag_service.default_collection
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"上传失败：{str(e)}"
        )


@router.post("/add")
async def add_document(request: AddDocumentRequest):
    """添加文档到知识库"""
    try:
        doc_id = rag_service.add_document(
            content=request.content,
            metadata=request.metadata or {},
            collection_name=request.collection
        )
        
        return {
            'status': 'success',
            'document_id': doc_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"添加失败：{str(e)}"
        )


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(request: SearchRequest):
    """检索知识库"""
    try:
        results = rag_service.search(
            query=request.query,
            top_k=request.top_k,
            collection_name=request.collection
        )
        
        return SearchResponse(
            results=[
                KnowledgeItem(
                    id=rag_service.generate_id(item['content']),
                    content=item['content'],
                    metadata=item['metadata'],
                    score=item['score']
                )
                for item in results
            ],
            total=len(results)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"检索失败：{str(e)}"
        )


@router.get("/collections")
async def list_collections():
    """列出所有知识库集合"""
    try:
        collections = rag_service.list_collections()
        return {
            'collections': collections,
            'total': len(collections)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取集合列表失败：{str(e)}"
        )


@router.get("/stats")
async def get_stats(collection: Optional[str] = None):
    """获取知识库统计信息"""
    try:
        stats = rag_service.get_stats(collection)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取统计信息失败：{str(e)}"
        )


@router.delete("/collections/{collection_id}")
async def delete_collection(collection_id: str):
    """删除知识库集合"""
    try:
        rag_service.delete_collection(collection_id)
        return {
            'status': 'success',
            'message': f'集合 {collection_id} 已删除'
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"删除失败：{str(e)}"
        )
