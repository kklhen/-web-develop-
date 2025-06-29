# QAnything 智能问答应用

基于QAnything API的现代化智能问答应用，支持Next.js前端和Express后端双模式运行。

## 🚀 功能特性

- 🤖 **智能对话**：基于QAnything API的智能问答
- 💬 **实时聊天**：支持流式响应的实时对话交互
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🔒 **安全可靠**：支持API密钥认证和请求验证
- ⚡ **高性能**：内置缓存和错误处理机制
- 🎨 **现代UI**：基于React和Next.js的现代化界面
- 🔄 **API代理**：通过代理服务确保稳定的API连接
- 🛠️ **灵活配置**：支持多种参数配置和运行模式

## 📋 项目架构

### API代理实现

项目通过API路由 `src/app/api/chat/route.js` 实现与QAnything后端服务的通信代理：

- ✅ 接收前端请求并验证APIKey
- ✅ 格式化请求参数(maxToken、hybridSearch、networking等)
- ✅ 转发请求到有道API: `https://openapi.youdao.com/q_anything/api/chat_stream`
- ✅ 处理流式响应并返回给前端

### 聊天界面实现

聊天界面位于 `src/app/chat/page.js`，提供以下功能：

- 💬 消息展示区域
- ⌨️ 输入框与发送功能
- ⚙️ 设置面板(APIKey、模型选择、参数配置等)
- 🔄 支持流式响应展示

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: HTML5 + CSS3 + JavaScript
- **API**: QAnything 智能问答 API
- **安全**: Helmet.js + CORS + 输入验证
- **监控**: 健康检查 + 结构化日志
- **缓存**: Node-Cache 内存缓存

## 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并填入你的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# QAnything API 配置
QANYTHING_API_KEY=your_api_key_here
QANYTHING_BOT_UUID=your_bot_uuid_here
QANYTHING_API_BASE_URL=https://openapi.youdao.com/q_anything/api

# 服务器配置
PORT=3000
NODE_ENV=development

# API 配置
API_TIMEOUT=30000
API_MAX_RETRIES=3
API_RETRY_DELAY=1000

# 缓存配置
CACHE_TTL=300

# 日志级别
LOG_LEVEL=info
```

### 4. 启动应用

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## API 文档

### 聊天接口

**POST** `/api/chat`

请求体：
```json
{
  "question": "你的问题",
  "userId": "用户ID"
}
```

响应：
```json
{
  "answer": "AI回答",
  "source": ["相关来源"]
}
```

### 健康检查

- **GET** `/health` - 基础健康检查
- **GET** `/health/detailed` - 详细健康检查
- **GET** `/ready` - 就绪检查
- **GET** `/live` - 存活检查

### 对话历史

- **GET** `/api/history/:userId` - 获取用户对话历史
- **DELETE** `/api/history/:userId` - 清除用户对话历史

### 缓存统计

- **GET** `/api/cache/stats` - 获取缓存统计信息

## 项目结构

```
my-qanything-app/
├── src/
│   ├── config/
│   │   └── index.js          # 配置管理
│   ├── middleware/
│   │   ├── validation.js     # 输入验证和频率限制
│   │   └── errorHandler.js   # 错误处理
│   ├── routes/
│   │   ├── chat.js          # 聊天路由
│   │   └── health.js        # 健康检查路由
│   ├── services/
│   │   └── qanythingClient.js # QAnything API 客户端
│   └── utils/
│       └── logger.js        # 日志工具
├── public/
│   ├── index.html           # 前端页面
│   ├── style.css           # 样式文件
│   └── script.js           # 前端脚本
├── .env.example            # 环境变量示例
├── .env                    # 环境变量配置
├── package.json            # 项目配置
├── server.js              # 主服务器文件
└── README.md              # 项目文档
```

## 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `QANYTHING_API_KEY` | QAnything API 密钥 | 必填 |
| `QANYTHING_BOT_UUID` | Bot UUID | 必填 |
| `QANYTHING_API_BASE_URL` | API 基础地址 | 必填 |
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | development |
| `API_TIMEOUT` | API 超时时间(ms) | 30000 |
| `API_MAX_RETRIES` | 最大重试次数 | 3 |
| `API_RETRY_DELAY` | 重试延迟(ms) | 1000 |
| `CACHE_TTL` | 缓存过期时间(s) | 300 |
| `LOG_LEVEL` | 日志级别 | info |

### 安全配置

- **CORS**: 开发环境允许所有来源，生产环境需要配置
- **Helmet**: 设置安全HTTP头
- **输入验证**: 验证请求参数格式和长度
- **频率限制**: 每分钟最多30次请求
- **错误处理**: 统一错误响应格式

## 部署指南

### Docker 部署

1. 创建 Dockerfile：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

2. 构建和运行：

```bash
docker build -t my-qanything-app .
docker run -p 3000:3000 --env-file .env my-qanything-app
```

### PM2 部署

1. 安装 PM2：

```bash
npm install -g pm2
```

2. 创建 ecosystem.config.js：

```javascript
module.exports = {
  apps: [{
    name: 'qanything-app',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. 启动应用：

```bash
pm2 start ecosystem.config.js
```

## 监控和日志

### 健康检查

应用提供多个健康检查端点，可用于负载均衡器和监控系统：

```bash
# 基础健康检查
curl http://localhost:3000/health

# 详细健康检查
curl http://localhost:3000/health/detailed

# Kubernetes 就绪检查
curl http://localhost:3000/ready

# Kubernetes 存活检查
curl http://localhost:3000/live
```

### 日志格式

应用使用结构化JSON日志：

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "请求处理成功",
  "userId": "user123",
  "duration": "150ms"
}
```

## 故障排除

### 常见问题

1. **API 连接失败**
   - 检查网络连接
   - 验证 API 密钥和配置
   - 查看详细错误日志

2. **请求超时**
   - 增加 `API_TIMEOUT` 配置
   - 检查网络延迟
   - 启用重试机制

3. **内存使用过高**
   - 调整缓存 TTL
   - 限制对话历史长度
   - 监控内存使用情况

### 调试模式

设置环境变量启用调试：

```bash
LOG_LEVEL=debug npm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 支持

如有问题或建议，请创建 [Issue](https://github.com/yourusername/my-qanything-app/issues)。