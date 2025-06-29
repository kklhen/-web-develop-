# Web开发期末作业 🚀

一个综合性的Web开发项目集合，展示了从前端到后端、从传统网页到现代化应用的完整技术栈实现。

## 📋 项目概述

本项目包含三个核心应用，展示了现代Web开发的不同技术方案和最佳实践：

### 🎯 核心项目

#### 1. **my-next-app** - Next.js 现代化前端应用
- **技术栈**: Next.js 15.3.2 + React 19 + Tailwind CSS 4
- **功能特点**:
  - 响应式设计的练习展示平台
  - 交互式技术卡片系统
  - QAnything智能助手集成
  - GitHub统计数据展示
  - 多种演示页面（计数器、聊天、数据可视化）
- **亮点**: 现代化UI设计，完整的用户交互体验

#### 2. **my-qanything-app** - AI智能问答应用
- **技术栈**: Next.js + Express.js + QAnything API
- **功能特点**:
  - 双模式运行（Next.js前端 + Express后端）
  - QAnything AI智能问答集成
  - API代理服务
  - 健康检查和监控
- **亮点**: 前后端分离架构，AI技术集成

#### 3. **my-wakatime-worker** - Cloudflare Workers应用
- **技术栈**: Cloudflare Workers + Vitest
- **功能特点**:
  - 无服务器边缘计算
  - Wakatime API代理服务
  - 全球CDN分发
  - 单元测试覆盖
- **亮点**: 现代化无服务器架构，全球部署

## 🛠️ 技术栈总览

### 前端技术
- **框架**: Next.js 15.3.2, React 19
- **样式**: Tailwind CSS 4
- **构建工具**: Next.js内置构建系统
- **代码质量**: ESLint, Prettier

### 后端技术
- **运行时**: Node.js
- **框架**: Express.js
- **云服务**: Cloudflare Workers
- **测试**: Vitest

### AI & 集成
- **AI服务**: QAnything智能问答
- **数据源**: GitHub API, Wakatime API
- **部署**: Vercel, Cloudflare

## 🌟 功能亮点

### 📱 交互式学习平台
- **技术卡片系统**: 点击查看HTML、CSS、React、Next.js相关作业
- **实时预览**: iframe嵌入式作业展示
- **响应式设计**: 完美适配桌面和移动设备

### 🤖 AI智能助手
- **QAnything集成**: 专业的新闻学智能助手
- **多种集成方式**: 浮动窗口、iframe嵌入、脚本集成
- **实时对话**: 支持连续对话和上下文理解

### 📊 数据可视化
- **GitHub统计**: 个人GitHub数据展示
- **Wakatime统计**: 编程时间和语言分布
- **实时更新**: 通过API获取最新数据

### 🎨 创意展示
- **万花筒动画**: 纯CSS实现的复杂动画效果
- **宇宙海报**: CSS艺术设计作品
- **新闻页面**: 从v0.5到v0.9的迭代展示

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Git

### 安装和运行

#### 1. Next.js 应用
```bash
cd my-next-app
npm install
npm run dev
# 访问 http://localhost:3000
```

#### 2. QAnything 应用
```bash
cd my-qanything-app
npm install
# 前端模式
npm run dev
# 或后端模式
npm run server
```

#### 3. Wakatime Worker
```bash
cd my-wakatime-worker
npm install
npm run dev
# 部署到Cloudflare
npm run deploy
```

## 📁 项目结构

```
期末作业/
├── my-next-app/              # Next.js主应用
│   ├── app/                  # App Router页面
│   ├── components/           # React组件
│   ├── public/              # 静态资源
│   └── services/            # API服务
├── my-qanything-app/        # QAnything应用
│   ├── src/                 # 源代码
│   ├── public/              # 静态文件
│   └── server.js            # Express服务器
├── my-wakatime-worker/      # Cloudflare Worker
│   ├── src/                 # Worker代码
│   └── test/                # 测试文件
└── README.md                # 项目文档
```

## 🎯 学习目标达成

### ✅ 前端开发
- [x] HTML5语义化标签和结构设计
- [x] CSS3高级特性和动画效果
- [x] JavaScript ES6+现代语法
- [x] React Hooks和状态管理
- [x] Next.js全栈开发

### ✅ 后端开发
- [x] Node.js服务器开发
- [x] Express.js API设计
- [x] 无服务器架构实践
- [x] API代理和CORS处理

### ✅ 现代化工具
- [x] Git版本控制
- [x] npm包管理
- [x] ESLint代码规范
- [x] Tailwind CSS工具类
- [x] Cloudflare部署

### ✅ AI技术集成
- [x] QAnything API集成
- [x] 智能对话实现
- [x] 多种集成方案对比

## 🔗 在线演示

- **主应用**: [Next.js应用演示](http://localhost:3001)
- **练习页面**: [技术卡片展示](http://localhost:3001/practice)
- **GitHub统计**: [数据可视化](http://localhost:3001/github-stats)

## 📝 开发日志

### 版本历史
- **v1.0.0**: 基础项目结构搭建
- **v1.1.0**: QAnything智能助手集成
- **v1.2.0**: 交互式卡片系统实现
- **v1.3.0**: Cloudflare Workers部署
- **v1.4.0**: 完整的演示页面和文档

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**Web开发学习者** - kklhen

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！