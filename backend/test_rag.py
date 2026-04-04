"""测试 RAG 模块"""
import httpx
import json

# 测试检索
data = {
    'query': '什么是教学设计',
    'top_k': 3
}

r = httpx.post('http://localhost:8000/api/rag/search', json=data, timeout=30.0)
print('Status:', r.status_code)
result = r.json()
print('Total results:', result.get('total'))
for item in result.get('results', []):
    print(f"Score: {item['score']:.3f} - {item['content'][:50]}...")
