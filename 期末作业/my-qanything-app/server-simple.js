require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// 增强的日志函数
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };

const log = {
    error: (msg, data) => {
        if (logLevels[LOG_LEVEL] >= 0) {
            console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
        }
    },
    warn: (msg, data) => {
        if (logLevels[LOG_LEVEL] >= 1) {
            console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
        }
    },
    info: (msg, data) => {
        if (logLevels[LOG_LEVEL] >= 2) {
            console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
        }
    },
    debug: (msg, data) => {
        if (logLevels[LOG_LEVEL] >= 3) {
            console.log(`[DEBUG] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
        }
    },
    apiCall: (endpoint, data) => {
        log.debug('API调用开始', { endpoint, requestData: data });
    },
    apiResponse: (endpoint, response) => {
        log.debug('API调用响应', { endpoint, responseData: response });
    },
    apiError: (endpoint, error) => {
        log.error('API调用失败', { endpoint, error: error.message, stack: error.stack });
    }
};

// QAnything API 配置
const QANYTHING_API_KEY = process.env.QANYTHING_API_KEY || 'bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ';
const BOT_UUID = process.env.QANYTHING_BOT_UUID || 'A728E8C44505434E';
const API_BASE_URL = process.env.QANYTHING_API_BASE_URL || 'https://openapi.youdao.com/q_anything/api';

// 生成请求ID
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 配置验证函数
const validateConfig = () => {
    const errors = [];
    
    if (!QANYTHING_API_KEY || QANYTHING_API_KEY === 'your_api_key_here') {
        errors.push('QANYTHING_API_KEY 未设置或使用默认值');
    }
    
    if (!BOT_UUID || BOT_UUID === 'your_bot_uuid_here') {
        errors.push('QANYTHING_BOT_UUID 未设置或使用默认值');
    }
    
    if (!API_BASE_URL) {
        errors.push('QANYTHING_API_BASE_URL 未设置');
    }
    
    if (errors.length > 0) {
        log.warn('配置检查发现问题', { errors });
        if (process.env.NODE_ENV === 'production') {
            log.error('生产环境配置不完整，服务可能无法正常工作');
        }
    } else {
        log.info('配置检查通过', {
            apiUrl: API_BASE_URL,
            botUuid: BOT_UUID,
            hasApiKey: !!QANYTHING_API_KEY
        });
    }
    
    return errors;
};

// 用户对话历史存储
const userConversations = new Map();

// 简单缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

// 创建自定义 HTTPS Agent
const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 10,
    maxFreeSockets: 5,
    timeout: 60000,
    rejectUnauthorized: false
});

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 简单的请求日志中间件
app.use((req, res, next) => {
    const start = Date.now();
    log.info(`${req.method} ${req.url}`, { ip: req.ip });
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        log.info(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// 简单的输入验证函数
const validateChatInput = (req, res, next) => {
    const { question, userId } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: '问题不能为空' });
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        return res.status(400).json({ error: '用户ID不能为空' });
    }
    
    if (question.length > 1000) {
        return res.status(400).json({ error: '问题长度不能超过1000字符' });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
        return res.status(400).json({ error: '用户ID格式无效' });
    }
    
    next();
};

// 简单的频率限制
const rateLimitMap = new Map();
const rateLimit = (req, res, next) => {
    const clientId = req.ip + (req.body.userId || 'anonymous');
    const now = Date.now();
    const windowSize = 60 * 1000; // 1分钟
    const maxRequests = 30;
    
    if (!rateLimitMap.has(clientId)) {
        rateLimitMap.set(clientId, []);
    }
    
    const requests = rateLimitMap.get(clientId);
    const validRequests = requests.filter(time => now - time < windowSize);
    
    if (validRequests.length >= maxRequests) {
        return res.status(429).json({ error: '请求过于频繁，请稍后重试' });
    }
    
    validRequests.push(now);
    rateLimitMap.set(clientId, validRequests);
    
    next();
};

// QAnything API 客户端类
class SimpleQAnythingClient {
    async chat(question, history = []) {
        // 格式化历史对话为标准格式
        const formattedHistory = [];
        history.slice(-5).forEach(item => {
            if (item.question && item.response) {
                formattedHistory.push({
                    role: 'user',
                    content: item.question
                });
                formattedHistory.push({
                    role: 'assistant',
                    content: item.response
                });
            }
        });
        
        const requestData = {
            bot_id: BOT_UUID,
            query: question,
            stream: false,
            temperature: 0.7,
            max_tokens: 2000,
            source_needed: true,
            history: formattedHistory
        };
        
        log.info('调用QAnything API', { 
            question: question.substring(0, 50) + '...',
            historyLength: history.length,
            botUuid: BOT_UUID
        });
        
        log.apiCall('/bot/chat', requestData);
        
        // 首先尝试标准聊天API
        try {
            const response = await this._makeRequest('/v1/chat/completions', requestData);
            log.info('标准API调用成功', { requestId });
            log.apiResponse('/v1/chat/completions', response.data);
            return this._processResponse(response.data);
        } catch (error) {
            log.apiError('/v1/chat/completions', error);
            log.warn('标准API失败，尝试兼容API', { 
                error: error.message,
                code: error.code,
                status: error.response?.status,
                requestId
            });
            
            // 回退到原有API格式
            const fallbackData = {
                uuid: BOT_UUID,
                question: question,
                sourceNeeded: true,
                history: history.slice(-5)
            };
            
            // 重试兼容API
            let retries = 3;
            while (retries > 0) {
                try {
                    log.apiCall('/bot/chat', fallbackData);
                    const response = await this._makeRequest('/bot/chat', fallbackData);
                    log.info('兼容API调用成功', { requestId });
                    log.apiResponse('/bot/chat', response.data);
                    return this._processResponse(response.data);
                } catch (retryError) {
                    retries--;
                    log.apiError('/bot/chat', retryError);
                    log.warn(`兼容API重试失败，剩余次数: ${retries}`, { 
                        error: retryError.message,
                        code: retryError.code,
                        status: retryError.response?.status,
                        requestId
                    });
                    
                    if (retries === 0) {
                        throw retryError;
                    }
                    
                    await this._delay(2000);
                }
            }
        }
    }
    
    async _makeRequest(endpoint, data) {
        const url = `${API_BASE_URL}${endpoint}`;
        const requestId = generateRequestId();
        const config = {
            headers: {
                'Authorization': `Bearer ${QANYTHING_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'QAnything-Client/2.0',
                'X-Request-ID': requestId,
                'X-Client-Version': '2.0.0'
            },
            timeout: 60000,
            maxRedirects: 5,
            httpsAgent: httpsAgent,
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        };
        
        log.debug('发送HTTP请求', {
            url,
            method: 'POST',
            headers: { ...config.headers, Authorization: 'Bearer ***' },
            dataSize: JSON.stringify(data).length
        });
        
        try {
            const startTime = Date.now();
            const response = await axios.post(url, data, config);
            const duration = Date.now() - startTime;
            
            log.debug('HTTP请求成功', {
                url,
                status: response.status,
                duration: `${duration}ms`,
                responseSize: JSON.stringify(response.data).length
            });
            
            return response;
        } catch (error) {
            const errorInfo = {
                url,
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data
            };
            
            log.debug('HTTP请求失败', errorInfo);
            
            // 增强错误信息
            if (error.code === 'ECONNREFUSED') {
                throw new Error(`无法连接到QAnything服务 (${API_BASE_URL}): 连接被拒绝`);
            } else if (error.code === 'ENOTFOUND') {
                throw new Error(`无法解析QAnything服务地址 (${API_BASE_URL}): 域名不存在`);
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error(`连接QAnything服务超时 (${API_BASE_URL}): 请检查网络连接`);
            } else if (error.response?.status === 401) {
                throw new Error('QAnything API认证失败: 请检查API密钥是否正确');
            } else if (error.response?.status === 403) {
                throw new Error('QAnything API访问被拒绝: 权限不足');
            } else if (error.response?.status === 404) {
                throw new Error(`QAnything API端点不存在: ${endpoint}`);
            } else if (error.response?.status >= 500) {
                throw new Error(`QAnything服务器错误 (${error.response.status}): 服务暂时不可用`);
            }
            
            throw error;
        }
    }
    
    _processResponse(data) {
        log.debug('处理API响应', { responseData: data });
        
        // 检查响应数据结构
        if (!data || typeof data !== 'object') {
            throw new Error('API返回数据格式无效: 响应不是有效的JSON对象');
        }
        
        // 检查错误码
        if (data.errorCode !== undefined && data.errorCode !== 0) {
            const errorMsg = data.errorMsg || data.msg || data.message || '未知错误';
            throw new Error(`API返回错误 (错误码: ${data.errorCode}): ${errorMsg}`);
        }
        
        // 检查结果数据
        const result = data.result || data.response || data.data;
        if (!result) {
            log.warn('API响应中缺少结果数据', { responseKeys: Object.keys(data) });
            throw new Error('API响应格式异常: 缺少结果数据');
        }
        
        // 提取答案
        const answer = result.answer || result.response || result.text || result.content;
        if (!answer || typeof answer !== 'string') {
            log.warn('API响应中缺少有效答案', { resultKeys: Object.keys(result) });
            throw new Error('API响应格式异常: 缺少有效答案');
        }
        
        // 提取来源信息
        const source = result.source || result.sources || result.references || [];
        if (!Array.isArray(source)) {
            log.warn('API响应中来源信息格式异常', { sourceType: typeof source });
        }
        
        const processedResult = {
            answer: answer.trim(),
            source: Array.isArray(source) ? source : []
        };
        
        log.debug('响应处理完成', {
            answerLength: processedResult.answer.length,
            sourceCount: processedResult.source.length
        });
        
        return processedResult;
    }
    
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async healthCheck() {
        try {
            await this._makeRequest('/bot/chat', {
                uuid: BOT_UUID,
                question: 'test',
                sourceNeeded: false,
                history: []
            });
            return true;
        } catch (error) {
            throw new Error(`健康检查失败: ${error.message}`);
        }
    }
}

const qanythingClient = new SimpleQAnythingClient();

// 生成缓存键
const generateCacheKey = (userId, question) => {
    return `chat_${userId}_${question.toLowerCase().trim().substring(0, 50)}`;
};

// 获取用户历史
const getUserHistory = (userId) => {
    return userConversations.get(userId) || [];
};

// 更新用户历史
const updateUserHistory = (userId, question, response) => {
    const history = getUserHistory(userId);
    history.push({ question, response });
    
    if (history.length > 10) {
        history.splice(0, history.length - 10);
    }
    
    userConversations.set(userId, history);
};

// 聊天接口
app.post('/api/chat', rateLimit, validateChatInput, async (req, res) => {
    try {
        const { question, userId } = req.body;
        
        // 检查缓存
        const cacheKey = generateCacheKey(userId, question);
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            log.info('返回缓存结果', { userId, cacheKey });
            return res.json(cached.data);
        }
        
        // 获取用户历史
        const userHistory = getUserHistory(userId);
        
        // 调用API
        const result = await qanythingClient.chat(question, userHistory);
        
        // 更新历史
        updateUserHistory(userId, question, result.answer);
        
        // 缓存结果
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        log.info('聊天请求处理成功', {
            userId,
            responseLength: result.answer.length,
            sourceCount: result.source.length
        });
        
        res.json(result);
        
    } catch (error) {
        log.error('聊天请求处理失败', {
            userId: req.body.userId,
            question: req.body.question?.substring(0, 50) + '...',
            error: error.message,
            stack: error.stack,
            code: error.code,
            status: error.response?.status
        });
        
        let errorMessage = '智能助手服务暂时不可用，请稍后重试';
        let statusCode = 500;
        let errorType = 'INTERNAL_ERROR';
        
        // 详细的错误分类和处理
        if (error.message.includes('API返回错误')) {
            errorMessage = '智能助手返回错误，请重新提问';
            statusCode = 502;
            errorType = 'API_ERROR';
        } else if (error.message.includes('无法连接到QAnything服务')) {
            errorMessage = 'QAnything服务连接失败，请稍后重试';
            statusCode = 503;
            errorType = 'CONNECTION_ERROR';
        } else if (error.message.includes('认证失败')) {
            errorMessage = 'API认证失败，请联系管理员';
            statusCode = 502;
            errorType = 'AUTH_ERROR';
        } else if (error.message.includes('超时')) {
            errorMessage = '请求超时，请稍后重试';
            statusCode = 504;
            errorType = 'TIMEOUT_ERROR';
        } else if (error.message.includes('响应格式异常')) {
            errorMessage = 'API响应格式异常，请稍后重试';
            statusCode = 502;
            errorType = 'FORMAT_ERROR';
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            errorMessage = '网络连接异常，请检查网络后重试';
            statusCode = 503;
            errorType = 'NETWORK_ERROR';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = '连接超时，请稍后重试';
            statusCode = 504;
            errorType = 'TIMEOUT_ERROR';
        }
        
        // 在开发环境下提供更详细的错误信息
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        res.status(statusCode).json({
            error: errorMessage,
            errorType,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || Date.now().toString(),
            ...(isDevelopment && {
                debug: {
                    originalError: error.message,
                    code: error.code,
                    stack: error.stack?.split('\n').slice(0, 5)
                }
            })
        });
    }
});

// 获取用户历史
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
        return res.status(400).json({ error: '无效的用户ID格式' });
    }
    
    const history = getUserHistory(userId);
    
    res.json({
        userId,
        history,
        count: history.length
    });
});

// 清除用户历史
app.delete('/api/history/:userId', (req, res) => {
    const { userId } = req.params;
    
    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
        return res.status(400).json({ error: '无效的用户ID格式' });
    }
    
    userConversations.delete(userId);
    
    res.json({
        message: '用户对话历史已清除',
        userId
    });
});

// 健康检查
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)}分${Math.floor(uptime % 60)}秒`,
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// 详细健康检查
app.get('/health/detailed', async (req, res) => {
    const checks = {
        server: { status: 'healthy', message: '服务器运行正常' },
        qanything: { status: 'unknown', message: '检查中...' },
        memory: { status: 'unknown', message: '检查中...' }
    };
    
    // 检查QAnything API
    try {
        await qanythingClient.healthCheck();
        checks.qanything = { status: 'healthy', message: 'QAnything API连接正常' };
    } catch (error) {
        checks.qanything = {
            status: 'unhealthy',
            message: `QAnything API连接失败: ${error.message}`
        };
    }
    
    // 检查内存
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (heapUsedPercent > 90) {
        checks.memory = {
            status: 'warning',
            message: `内存使用率过高: ${heapUsedPercent.toFixed(1)}%`
        };
    } else {
        checks.memory = {
            status: 'healthy',
            message: `内存使用正常: ${heapUsedPercent.toFixed(1)}%`
        };
    }
    
    // 计算整体状态
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus = 'healthy';
    
    if (statuses.includes('unhealthy')) {
        overallStatus = 'unhealthy';
    } else if (statuses.includes('warning')) {
        overallStatus = 'warning';
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'warning' ? 200 : 503;
    
    res.status(statusCode).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks,
        uptime: process.uptime()
    });
});

// 缓存统计
app.get('/api/cache/stats', (req, res) => {
    res.json({
        cache: {
            size: cache.size,
            keys: Array.from(cache.keys())
        },
        conversations: {
            totalUsers: userConversations.size,
            totalConversations: Array.from(userConversations.values())
                .reduce((sum, history) => sum + history.length, 0)
        }
    });
});

// 就绪检查 (用于容器编排)
app.get('/ready', async (req, res) => {
    try {
        // 检查关键依赖是否就绪
        await qanythingClient.healthCheck();
        
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            message: '服务已就绪'
        });
    } catch (error) {
        log.warn('就绪检查失败', { error: error.message });
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            message: '服务未就绪',
            error: error.message
        });
    }
});

// 存活检查 (用于容器编排)
app.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: '服务存活'
    });
});

// 默认路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: '请求的资源不存在',
        timestamp: new Date().toISOString(),
        path: req.url
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    log.error('应用错误', {
        error: err.message,
        stack: err.stack,
        url: req.url
    });
    
    res.status(500).json({
        error: '服务器内部错误',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
const server = app.listen(PORT, () => {
    // 执行配置验证
    const configErrors = validateConfig();
    
    log.info('服务器启动成功', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        url: `http://localhost:${PORT}`,
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        logLevel: LOG_LEVEL,
        configErrors: configErrors.length
    });
    
    // 输出可用的API端点
    log.info('可用的API端点', {
        chat: 'POST /api/chat',
        history: 'GET /api/history/:userId',
        clearHistory: 'DELETE /api/history/:userId',
        health: 'GET /health',
        detailedHealth: 'GET /health/detailed',
        cacheStats: 'GET /api/cache/stats',
        ready: 'GET /ready',
        live: 'GET /live'
    });
    
    // 如果有配置错误，输出解决建议
    if (configErrors.length > 0) {
        log.warn('配置建议', {
            message: '请检查环境变量配置',
            envFile: '.env 文件示例',
            variables: {
                QANYTHING_API_KEY: '你的QAnything API密钥',
                QANYTHING_BOT_UUID: '你的机器人UUID',
                QANYTHING_API_BASE_URL: 'QAnything API基础URL',
                LOG_LEVEL: 'debug|info|warn|error',
                NODE_ENV: 'development|production'
            }
        });
    }
});

// 优雅关闭
process.on('SIGTERM', () => {
    log.info('收到SIGTERM信号，开始优雅关闭...');
    server.close(() => {
        log.info('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log.info('收到SIGINT信号，开始优雅关闭...');
    server.close(() => {
        log.info('服务器已关闭');
        process.exit(0);
    });
});

// 未捕获异常处理
process.on('uncaughtException', (err) => {
    log.error('未捕获的异常', { error: err.message, stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('未处理的Promise拒绝', { reason, promise });
    process.exit(1);
});