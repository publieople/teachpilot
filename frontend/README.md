# TeachPilot Frontend

多模态 AI 互动式教学智能体 - 前端应用

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5.x
- **样式**: TailwindCSS 3.x
- **状态管理**: Zustand
- **路由**: React Router DOM 6.x
- **HTTP 客户端**: Axios
- **UI 组件**: shadcn/ui
- **图标**: Lucide React
- **通知**: Sonner

## 功能特性

- ✅ 黑白灰极简主题
- ✅ 亮色/暗色/跟随系统三种模式
- ✅ View Transitions API 扩散动画
- ✅ 响应式设计（支持移动端）
- ✅ 对话聊天界面
- ✅ 文件上传组件
- ✅ 课件管理页面
- ✅ 知识库检索页面

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/         # 组件
│   ├── chat/          # 聊天组件
│   ├── files/         # 文件组件
│   ├── layout/        # 布局组件
│   └── ui/            # UI 基础组件
├── hooks/             # 自定义 Hooks
├── lib/               # 工具函数
├── pages/             # 页面组件
├── services/          # API 服务层
├── stores/            # Zustand 状态管理
├── App.tsx            # 应用入口
├── main.tsx           # React 入口
└── index.css          # 全局样式
```

## 环境变量

确保后端服务运行在 http://localhost:8000

API 代理已配置在 `vite.config.ts` 中

## 主题定制

主题配置在 `tailwind.config.js` 中，使用 CSS 变量实现亮暗色切换

扩散动画使用 View Transitions API，在 `index.css` 中定义

## 浏览器支持

- Chrome 111+ (View Transitions API)
- Edge 111+
- Safari 16.4+
- Firefox (降级无动画)

## 许可证

GPL-3.0
