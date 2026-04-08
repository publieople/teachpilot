"""
Edge TTS 服务模块
使用微软 Edge TTS 实现文字转语音
"""

import os
import asyncio
import edge_tts
from edge_tts import VoicesManager
from typing import List, Dict, Any, Optional
from pathlib import Path


class TTSService:
    """Edge TTS 服务类"""
    
    def __init__(self):
        """初始化 TTS 服务"""
        self.output_dir = "outputs/tts"
        os.makedirs(self.output_dir, exist_ok=True)
        self._voices_cache: Optional[List[Dict[str, Any]]] = None
    
    async def get_voices(self, locale: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取可用的语音列表
        
        Args:
            locale: 语言区域过滤，如 "zh-CN"
            
        Returns:
            语音列表
        """
        if self._voices_cache is None:
            voices = await VoicesManager.create()
            self._voices_cache = [
                {
                    'Name': voice['Name'],
                    'ShortName': voice['ShortName'],
                    'Gender': voice['Gender'],
                    'Locale': voice['Locale'],
                    'FriendlyName': voice['FriendlyName'],
                }
                for voice in voices.voices
            ]
        
        if locale:
            return [v for v in self._voices_cache if v['Locale'] == locale]
        return self._voices_cache
    
    async def generate_speech(
        self,
        text: str,
        voice: str = "zh-CN-XiaoxiaoNeural",
        rate: str = "+0%",
        volume: str = "+0%",
        pitch: str = "+0Hz",
        output_file: Optional[str] = None
    ) -> str:
        """
        生成语音
        
        Args:
            text: 要转换的文本
            voice: 语音名称，如 "zh-CN-XiaoxiaoNeural"
            rate: 语速，如 "+0%" 或 "-20%"
            volume: 音量，如 "+0%" 或 "-20%"
            pitch: 音调，如 "+0Hz" 或 "-10Hz"
            output_file: 输出文件名（可选）
            
        Returns:
            生成的音频文件路径
        """
        if not text.strip():
            raise ValueError("文本内容为空")
        
        # 生成输出文件名
        if not output_file:
            import hashlib
            import datetime
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"tts_{voice}_{text_hash}_{timestamp}.mp3"
        
        output_path = os.path.join(self.output_dir, output_file)
        
        # 使用 edge_tts 生成语音
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate,
            volume=volume,
            pitch=pitch,
        )
        
        await communicate.save(output_path)
        
        # 验证文件是否生成成功
        if not os.path.exists(output_path):
            raise RuntimeError("语音文件生成失败")
        
        return output_path
    
    async def generate_speech_to_bytes(
        self,
        text: str,
        voice: str = "zh-CN-XiaoxiaoNeural",
        rate: str = "+0%",
        volume: str = "+0%",
        pitch: str = "+0Hz"
    ) -> bytes:
        """
        生成语音并返回字节数据
        
        Args:
            text: 要转换的文本
            voice: 语音名称
            rate: 语速
            volume: 音量
            pitch: 音调
            
        Returns:
            音频字节数据
        """
        import io
        import tempfile
        
        # 创建临时文件
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            # 生成语音到临时文件
            await self.generate_speech(text, voice, rate, volume, pitch, os.path.basename(tmp_path))
            
            # 读取字节数据
            with open(tmp_path, 'rb') as f:
                audio_bytes = f.read()
            
            return audio_bytes
        finally:
            # 清理临时文件
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    def get_voice_info(self, voice_name: str) -> Optional[Dict[str, Any]]:
        """
        获取语音信息
        
        Args:
            voice_name: 语音名称
            
        Returns:
            语音信息字典
        """
        if self._voices_cache is None:
            return None
        
        for voice in self._voices_cache:
            if voice['ShortName'] == voice_name or voice['Name'] == voice_name:
                return voice
        return None


# 全局实例
tts_service = TTSService()


# 常用中文语音预设
CHINESE_VOICES = {
    # 女声
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",      # 晓晓（温暖女声）
    "xiaoyi": "zh-CN-XiaoyiNeural",          # 晓伊（温柔女声）
    "xiaomo": "zh-CN-XiaomoNeural",          # 晓墨（知性女声）
    "xiaoqiu": "zh-CN-XiaoqiuNeural",        # 晓秋（成熟女声）
    
    # 男声
    "yunxi": "zh-CN-YunxiNeural",            # 云希（阳光男声）
    "yunyang": "zh-CN-YunyangNeural",        # 云扬（沉稳男声）
    "yunhao": "zh-CN-YunhaoNeural",          # 云皓（清亮男声）
    
    # 方言
    "xiaoni": "zh-HK-HiuGaaiNeural",         # 晓妮（粤语）
    "wanlung": "zh-HK-WanLungNeural",        # 云龙（粤语）
}


def get_chinese_voice(name: str) -> str:
    """
    获取中文语音 ID
    
    Args:
        name: 语音简称，如 "xiaoxiao"
        
    Returns:
        完整的语音 ID
    """
    return CHINESE_VOICES.get(name.lower(), CHINESE_VOICES["xiaoxiao"])
