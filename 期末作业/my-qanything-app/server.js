require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// 导入配置和工具
const config = require('./src/config');
const logger = require('./src/utils/logger');

// 导入中间件
const { requestLogger } = require('./src/middleware/validation');
const { errorHandler, notFoundHandler, setupProcessErrorHandlers } = require('./src/middleware/errorHandler');

// 导入路由
const chatRoutes = require('./src/routes/chat');
const healthRoutes = require('./src/routes/health');

const app = express();

// 设置进程错误处理
setupProcessErrorHandlers();

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS配置
app.use(cors({
    origin: config.server.env === 'production' ? false : true,
    credentials: true
}));

// 压缩响应
app.use(compression());

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 请求日志
app.use(requestLogger);


// API路由
app.use('/api', chatRoutes);
app.use('/', healthRoutes);

// 默认路由，发送前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const server = app.listen(config.server.port, () => {
    logger.info('服务器启动成功', {
        port: config.server.port,
        env: config.server.env,
        url: `http://localhost:${config.server.port}`,
        pid: process.pid
    });
});

// 优雅关闭
process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，开始优雅关闭...');
    server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，开始优雅关闭...');
    server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
    });
});