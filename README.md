# TeachPilot 🎓

多模态 AI 互动式教学智能体 —— 锐捷网络 A04 赛题参赛项目

## 项目定位

帮助教师从"事务型"工作者转向"设计型"导师，通过多轮对话理解教学意图，融合多模态参考资料，自动生成 PPT 课件、Word 教案及互动内容。

## 核心功能

- 💬 **多轮对话理解** - 语音/文字输入，主动提问澄清教学需求
- 📎 **多模态参考融合** - PDF/Word/PPT/图片/视频解析与信息提取
- 🧠 **RAG 本地知识库** - 向量化检索增强生成
- 📊 **课件生成引擎** - PPT + Word 教案 + 动画/互动小游戏
- 🔄 **迭代优化闭环** - 预览→修改→再生成→导出

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **后端**: Python FastAPI
- **大模型**: 通义千问/Qwen (百炼 API)
- **RAG**: ChromaDB + Sentence Transformers
- **多模态**: PyMuPDF (PDF), OpenCV (视频), python-pptx (PPT 生成)

## 项目结构

```
teachpilot/
├── frontend/          # React 前端
├── backend/           # Python 后端服务
├── knowledge-base/    # 本地知识库资料
├── docs/              # 项目文档
└── scripts/           # 工具脚本
```

## 快速开始

```bash
# 后端
cd backend
pip install -r requirements.txt
python main.py

# 前端
cd frontend
npm install
npm run dev
```

## 参赛信息

- **赛题**: 大学生服务外包创新创业大赛 A04 - 多模态 AI 互动式教学智能体
- **企业**: 锐捷网络
- **团队**: TBD

## License

MIT
