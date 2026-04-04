"""
RAG 服务模块 - ChromaDB + BGE-M3
"""

import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import hashlib

from config import settings


class RAGService:
    """RAG 服务类"""
    
    def __init__(self):
        """初始化 RAG 服务"""
        # 确保目录存在
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        os.makedirs(settings.KNOWLEDGE_BASE_DIR, exist_ok=True)
        
        # 初始化 ChromaDB 客户端（持久化）
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR
        )
        
        # 懒加载 Embedding 模型
        self._embedding_model = None
        
        # 默认集合
        self.default_collection = "knowledge_base"
    
    @property
    def embedding_model(self):
        """懒加载 Embedding 模型"""
        if self._embedding_model is None:
            print("[RAG] 加载 BGE-M3 模型...")
            self._embedding_model = SentenceTransformer('BAAI/bge-m3')
            print("[RAG] BGE-M3 模型加载完成")
        return self._embedding_model
    
    def get_collection(self, name: Optional[str] = None):
        """获取或创建集合"""
        collection_name = name or self.default_collection
        return self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "TeachPilot 知识库"}
        )
    
    def generate_id(self, content: str) -> str:
        """生成唯一 ID"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def add_document(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        collection_name: Optional[str] = None
    ) -> str:
        """
        添加文档到知识库
        
        Args:
            content: 文档内容
            metadata: 元数据（如来源、标题等）
            collection_name: 集合名称
            
        Returns:
            文档 ID
        """
        collection = self.get_collection(collection_name)
        
        # 生成唯一 ID
        doc_id = self.generate_id(content)
        
        # 生成 embedding
        embedding = self.embedding_model.encode(content, normalize_embeddings=True)
        
        # 添加到集合
        collection.upsert(
            ids=[doc_id],
            embeddings=[embedding.tolist()],
            documents=[content],
            metadatas=[metadata or {}]
        )
        
        return doc_id
    
    def add_documents(
        self,
        documents: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        collection_name: Optional[str] = None
    ) -> List[str]:
        """
        批量添加文档
        
        Args:
            documents: 文档列表
            metadatas: 元数据列表
            collection_name: 集合名称
            
        Returns:
            文档 ID 列表
        """
        collection = self.get_collection(collection_name)
        
        # 生成 IDs
        doc_ids = [self.generate_id(doc) for doc in documents]
        
        # 生成 embeddings
        embeddings = self.embedding_model.encode(
            documents, 
            normalize_embeddings=True,
            show_progress_bar=True
        )
        
        # 默认元数据
        if metadatas is None:
            metadatas = [{} for _ in documents]
        
        # 批量添加
        collection.upsert(
            ids=doc_ids,
            embeddings=embeddings.tolist(),
            documents=documents,
            metadatas=metadatas
        )
        
        return doc_ids
    
    def search(
        self,
        query: str,
        top_k: int = 5,
        collection_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        检索知识库
        
        Args:
            query: 查询文本
            top_k: 返回结果数量
            collection_name: 集合名称
            
        Returns:
            检索结果列表
        """
        collection = self.get_collection(collection_name)
        
        # 生成查询 embedding
        query_embedding = self.embedding_model.encode(
            query, 
            normalize_embeddings=True
        )
        
        # 检索
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        # 格式化结果
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else 0,
                    'score': 1 - results['distances'][0][i] if results['distances'] else 1
                })
        
        return formatted_results
    
    def get_stats(self, collection_name: Optional[str] = None) -> Dict[str, Any]:
        """获取知识库统计信息"""
        collection = self.get_collection(collection_name)
        count = collection.count()
        
        return {
            'total_documents': count,
            'collection_name': collection_name or self.default_collection
        }
    
    def delete_collection(self, name: str):
        """删除集合"""
        self.client.delete_collection(name)
    
    def list_collections(self) -> List[str]:
        """列出所有集合"""
        return [col.name for col in self.client.list_collections()]


# 全局实例
rag_service = RAGService()
