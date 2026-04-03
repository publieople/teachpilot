# TeachPilot 🎓

**多模态 AI 互动式教学智能体** —— 大学生服务外包创新创业大赛 A04 赛题参赛项目

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-green.svg)](https://www.python.org/downloads/)
[![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://react.dev/)

</div>

---

## 📖 项目简介

TeachPilot 是一个面向教师的 AI 辅助教学系统，通过多轮对话理解教学意图，融合多模态参考资料（PDF/Word/PPT/视频），自动生成 PPT 课件和 Word 教案，帮助教师从"事务型"工作者转向"设计型"导师。

**赛题：** 大学生服务外包创新创业大赛 A04 - 多模态 AI 互动式教学智能体  
**企业：** 锐捷网络  
**团队：** TBD

---

## ✨ 核心功能

- 💬 **多轮对话理解** - 语音/文字输入，主动提问澄清教学需求
- 📎 **多模态参考融合** - PDF/Word/PPT/图片/视频解析与信息提取
- 🧠 **RAG 本地知识库** - 向量化检索增强生成
- 📊 **课件生成引擎** - PPT + Word 教案 + 动画/互动小游戏
- 🔄 **迭代优化闭环** - 预览→修改→再生成→导出

---

## 🚀 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- Git

### 1. 克隆项目

```bash
git clone https://github.com/Publieople/teachpilot.git
cd teachpilot
```

### 2. 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 OPENROUTER_API_KEY

# 启动服务
python main.py
```

访问 http://localhost:8000/docs 查看 API 文档

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

---

## 📁 项目结构

```
teachpilot/
├── backend/              # Python 后端
│   ├── main.py          # FastAPI 入口
│   ├── config.py        # 配置管理
│   ├── routes/          # API 路由
│   │   ├── chat.py      # 对话管理
│   │   ├── rag.py       # RAG 检索
│   │   ├── files.py     # 文件上传
│   │   └── generate.py  # 课件生成
│   ├── requirements.txt # Python 依赖
│   └── .env.example     # 环境变量示例
├── frontend/            # React 前端
│   ├── src/
│   │   ├── App.tsx      # 主应用组件
│   │   ├── main.tsx     # 入口文件
│   │   ├── services/    # API 服务
│   │   ├── components/  # 可复用组件
│   │   └── pages/       # 页面组件
│   ├── package.json
│   └── vite.config.ts
├── docs/                # 项目文档
│   └── 技术栈.md
└── README.md
```

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 🧠 **LLM** | Qwen3.6-Plus (OpenRouter) |
| 🔤 **Embedding** | BGE-M3 |
| 📚 **向量库** | ChromaDB |
| 🖥️ **后端** | FastAPI + Python 3.11+ |
| 🌐 **前端** | Vite + React 18 + TypeScript |
| 🎨 **样式** | TailwindCSS 3.x |
| 📎 **PDF** | PyMuPDF |
| 📊 **PPT** | python-pptx |
| 🎤 **语音** | Web Speech API + Edge TTS |

详细技术选型见 [docs/技术栈.md](docs/技术栈.md)

---

## 📋 开发进度

| 模块 | 状态 |
|------|------|
| 基础框架 | ✅ 已完成 |
| 对话管理 | ✅ 基础功能完成 |
| RAG 检索 | 🔧 开发中 |
| 文件上传 | 🔧 开发中 |
| 课件生成 | 🔧 开发中 |
| 语音输入 | ⬜ 待开发 |

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- 锐捷网络提供赛题支持
- 通义千问提供大模型支持
- 开源社区提供的优秀工具库
