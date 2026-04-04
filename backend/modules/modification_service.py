"""
修改意见理解服务
解析用户修改指令，生成修改计划
"""

import json
import httpx
from typing import Dict, Any, List, Optional
from config import settings


class ModificationService:
    """修改意见理解服务"""
    
    def __init__(self):
        """初始化服务"""
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.model = settings.MODEL_ID
    
    async def understand_modification(
        self,
        original_content: Dict[str, Any],
        modification_request: str
    ) -> Dict[str, Any]:
        """
        理解修改意见并生成修改计划
        
        Args:
            original_content: 原始课件内容
            modification_request: 用户修改意见
            
        Returns:
            修改计划字典
        """
        prompt = self._build_prompt(original_content, modification_request)
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/Publieople/teachpilot",
                    "X-Title": "TeachPilot"
                }
                
                payload = {
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一个专业的课件修改助手。你的任务是理解用户的修改意见，并生成详细的修改计划。返回 JSON 格式，不要有其他内容。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1024
                }
                
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # 解析 JSON
                modification_plan = self._parse_json(content)
                
                # 验证修改计划
                self._validate_plan(modification_plan)
                
                return modification_plan
                
        except Exception as e:
            # 如果解析失败，返回错误信息
            return {
                "status": "error",
                "message": f"理解修改意见失败：{str(e)}",
                "action": "manual"
            }
    
    def _build_prompt(
        self,
        original_content: Dict[str, Any],
        modification_request: str
    ) -> str:
        """构建提示词"""
        
        # 简化内容表示
        content_summary = self._summarize_content(original_content)
        
        prompt = f"""原始课件内容：
{content_summary}

用户修改意见：
{modification_request}

请分析用户的修改意图，并生成修改计划。

返回 JSON 格式，包含以下字段：
{{
    "status": "success",
    "modification_type": "content_adjust|order_adjust|style_change|add_slide|delete_slide|multi",
    "description": "修改描述",
    "actions": [
        {{
            "action": "update|insert|delete|move",
            "target": "slide_index or content path",
            "content": "new content (if update/insert)",
            "position": "target position (if move/insert)",
            "reason": "why this change"
        }}
    ],
    "affected_slides": [1, 2, 3],
    "requires_regeneration": false
}}

modification_type 说明：
- content_adjust: 内容调整（修改文字、增减要点）
- order_adjust: 顺序调整（调换页面顺序）
- style_change: 样式修改（字体、颜色、主题）
- add_slide: 添加新页面
- delete_slide: 删除页面
- multi: 多种修改组合

注意：
1. slide_index 从 0 开始（封面页是 0，目录页是 1）
2. 如果要修改的内容不明确，请在 description 中说明需要用户澄清
3. 只返回 JSON，不要有其他内容"""

        return prompt
    
    def _summarize_content(self, content: Dict[str, Any]) -> str:
        """简化内容表示"""
        if 'ppt' in content:
            ppt = content['ppt']
            summary = f"标题：{ppt.get('title', '无标题')}\n"
            summary += f"副标题：{ppt.get('subtitle', '无')}\n"
            summary += f"幻灯片数量：{len(ppt.get('slides', []))}\n\n"
            summary += "幻灯片列表：\n"
            
            for i, slide in enumerate(ppt.get('slides', [])):
                summary += f"  [{i}] {slide.get('title', '无标题')}\n"
                content_preview = str(slide.get('content', ''))[:50]
                summary += f"      内容：{content_preview}...\n"
            
            return summary
        
        elif 'word' in content:
            word = content['word']
            summary = f"标题：{word.get('title', '无标题')}\n"
            summary += f"教学目标：{word.get('teaching_objectives', '无')[:50]}...\n"
            summary += f"教学环节数：{len(word.get('teaching_process', []))}\n"
            return summary
        
        else:
            return str(content)[:500]
    
    def _parse_json(self, content: str) -> Dict[str, Any]:
        """解析 JSON 内容"""
        # 清理可能的 markdown 标记
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # 尝试提取 JSON 部分
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                json_str = content[start:end]
                return json.loads(json_str)
            raise e
    
    def _validate_plan(self, plan: Dict[str, Any]):
        """验证修改计划"""
        required_fields = ["status", "modification_type", "description", "actions"]
        
        for field in required_fields:
            if field not in plan:
                raise ValueError(f"缺少必需字段：{field}")
        
        if plan["status"] not in ["success", "error"]:
            raise ValueError(f"无效的 status: {plan['status']}")
        
        valid_types = ["content_adjust", "order_adjust", "style_change", "add_slide", "delete_slide", "multi"]
        if plan["modification_type"] not in valid_types:
            raise ValueError(f"无效的 modification_type: {plan['modification_type']}")
        
        if not isinstance(plan["actions"], list):
            raise ValueError("actions 必须是列表")


# 全局实例
modification_service = ModificationService()
