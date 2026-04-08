"""
数据库模块 - SQLite 会话历史管理
"""

import sqlite3
import json
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from config import settings


class Database:
    """数据库管理类"""
    
    _instance: Optional['Database'] = None
    _initialized: bool = False
    
    def __new__(cls) -> 'Database':
        """单例模式"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not Database._initialized:
            self.db_path = os.path.join(os.path.dirname(__file__), '..', 'teachpilot.db')
            self._init_db()
            Database._initialized = True
    
    def _get_connection(self) -> sqlite3.Connection:
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 返回字典格式
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def _init_db(self):
        """初始化数据库表"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # 会话表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '新对话',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_archived BOOLEAN DEFAULT FALSE,
                metadata TEXT,
                user_id TEXT DEFAULT 'default'
            )
        """)
        
        # 消息表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                parent_id TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE SET NULL
            )
        """)
        
        # 会话 - 课件关联表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS session_coursewares (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                courseware_type TEXT NOT NULL,
                courseware_path TEXT NOT NULL,
                version_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
            )
        """)
        
        # 创建索引
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_session_coursewares_session_id ON session_coursewares(session_id)")
        
        # 创建触发器：更新会话的 updated_at
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_session_timestamp 
            AFTER UPDATE ON sessions
            BEGIN
                UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        conn.commit()
        conn.close()
    
    # ==================== Session 操作 ====================
    
    def create_session(
        self,
        title: str = "新对话",
        user_id: str = "default",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """创建新会话"""
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO sessions (id, title, user_id, metadata)
            VALUES (?, ?, ?, ?)
        """, (session_id, title, user_id, json.dumps(metadata) if metadata else None))
        
        conn.commit()
        conn.close()
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """获取会话详情"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.*, 
                   (SELECT COUNT(*) FROM messages WHERE session_id = s.id) as message_count,
                   (SELECT content FROM messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message_preview
            FROM sessions s
            WHERE s.id = ?
        """, (session_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    def get_sessions(
        self,
        user_id: str = "default",
        page: int = 1,
        page_size: int = 20,
        archived: bool = False
    ) -> Dict[str, Any]:
        """获取会话列表（分页）"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        offset = (page - 1) * page_size
        
        # 查询会话列表
        cursor.execute("""
            SELECT s.*, 
                   (SELECT COUNT(*) FROM messages WHERE session_id = s.id) as message_count,
                   (SELECT content FROM messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message_preview
            FROM sessions s
            WHERE s.user_id = ? AND s.is_archived = ?
            ORDER BY s.updated_at DESC
            LIMIT ? OFFSET ?
        """, (user_id, archived, page_size, offset))
        
        sessions = [dict(row) for row in cursor.fetchall()]
        
        # 获取总数
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM sessions
            WHERE user_id = ? AND is_archived = ?
        """, (user_id, archived))
        
        total = cursor.fetchone()['total']
        conn.close()
        
        return {
            "sessions": sessions,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
    
    def update_session(
        self,
        session_id: str,
        title: Optional[str] = None,
        is_archived: Optional[bool] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """更新会话"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if title is not None:
            updates.append("title = ?")
            values.append(title)
        if is_archived is not None:
            updates.append("is_archived = ?")
            values.append(is_archived)
        if metadata is not None:
            updates.append("metadata = ?")
            values.append(json.dumps(metadata))
        
        if updates:
            values.append(session_id)
            cursor.execute(f"""
                UPDATE sessions
                SET {', '.join(updates)}
                WHERE id = ?
            """, values)
            conn.commit()
        
        conn.close()
        return cursor.rowcount > 0
    
    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        conn.close()
        
        return cursor.rowcount > 0
    
    # ==================== Message 操作 ====================
    
    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        parent_id: Optional[str] = None
    ) -> str:
        """添加消息"""
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO messages (id, session_id, role, content, metadata, parent_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (message_id, session_id, role, content, json.dumps(metadata) if metadata else None, parent_id))
        
        # 更新会话的 updated_at
        cursor.execute("""
            UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
        """, (session_id,))
        
        conn.commit()
        conn.close()
        
        return message_id
    
    def get_messages(
        self,
        session_id: str,
        before: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """获取会话消息列表"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        if before:
            cursor.execute("""
                SELECT * FROM messages
                WHERE session_id = ? AND created_at < (
                    SELECT created_at FROM messages WHERE id = ?
                )
                ORDER BY created_at ASC
                LIMIT ?
            """, (session_id, before, limit))
        else:
            cursor.execute("""
                SELECT * FROM messages
                WHERE session_id = ?
                ORDER BY created_at ASC
                LIMIT ?
            """, (session_id, limit))
        
        messages = []
        for row in cursor.fetchall():
            msg = dict(row)
            # 解析 metadata JSON
            if msg.get('metadata'):
                try:
                    msg['metadata'] = json.loads(msg['metadata'])
                except:
                    pass
            messages.append(msg)
        
        conn.close()
        return messages
    
    def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        """获取单条消息"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            msg = dict(row)
            if msg.get('metadata'):
                try:
                    msg['metadata'] = json.loads(msg['metadata'])
                except:
                    pass
            return msg
        return None
    
    def update_message(self, message_id: str, content: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """更新消息"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        updates = []
        values = []
        
        if content is not None:
            updates.append("content = ?")
            values.append(content)
        if metadata is not None:
            updates.append("metadata = ?")
            values.append(json.dumps(metadata))
        
        if updates:
            values.append(message_id)
            cursor.execute(f"""
                UPDATE messages
                SET {', '.join(updates)}
                WHERE id = ?
            """, values)
            conn.commit()
        
        conn.close()
        return cursor.rowcount > 0
    
    def delete_message(self, message_id: str) -> bool:
        """删除消息"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
        conn.commit()
        conn.close()
        
        return cursor.rowcount > 0
    
    # ==================== Session Courseware 操作 ====================
    
    def add_courseware_to_session(
        self,
        session_id: str,
        courseware_type: str,
        courseware_path: str,
        version_id: Optional[str] = None
    ) -> str:
        """添加课件到会话"""
        record_id = f"sc_{uuid.uuid4().hex[:12]}"
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO session_coursewares (id, session_id, courseware_type, courseware_path, version_id)
            VALUES (?, ?, ?, ?, ?)
        """, (record_id, session_id, courseware_type, courseware_path, version_id))
        
        conn.commit()
        conn.close()
        
        return record_id
    
    def get_session_coursewares(self, session_id: str) -> List[Dict[str, Any]]:
        """获取会话关联的课件"""
        conn = self._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM session_coursewares
            WHERE session_id = ?
            ORDER BY created_at DESC
        """, (session_id,))
        
        coursewares = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return coursewares


# 全局数据库实例
db = Database()
