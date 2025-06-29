const express = require('express');
const NodeCache = require('node-cache');
const QAnythingClient = require('../services/qanythingClient');
const { chatValidationRules, validate, createRateLimiter } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config');

const router = express.Router();
const qanythingClient = new QAnythingClient();
const cache = new NodeCache({ stdTTL: config.cache.ttl });
const rateLimiter = createRateLimiter();

// 用户对话历史存储
const userConversations = new Map();

// 生成缓存键
const generateCacheKey = (userId, question) => {
    const questionHash = require('crypto')
        .createHash('md5')
        .update(question.toLowerCase().trim())
        .digest('hex');
    return `chat_${userId}_${questionHash}`;
};

// 获取用户对话历史
const getUserHistory = (userId) => {
    return userConversations.get(userId) || [];
};

// 更新用户对话历史
const updateUserHistory = (userId, question, response) => {
    const history = getUserHistory(userId);
    history.push({ question, response });
    
    // 只保留最近10轮对话
    if (history.length > 10) {
        history.splice(0, history.length - 10);
    }
    
    userConversations.set(userId, history);
};

// 聊天接口
router.post('/chat', 
    rateLimiter,
    chatValidationRules(),
    validate,
    asyncHandler(async (req, res) => {
        const { question, userId } = req.body;
        
        logger.info('处理聊天请求', {
            userId,
            questionLength: question.length,
            hasHistory: getUserHistory(userId).length > 0
        });

        // 检查缓存
        const cacheKey = generateCacheKey(userId, question);
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse) {
            logger.info('返回缓存结果', { userId, cacheKey });
            return res.json(cachedResponse);
        }

        // 获取用户历史对话
        const userHistory = getUserHistory(userId);
        
        try {
            // 调用QAnything API
            const result = await qanythingClient.chat(question, userHistory);
            
            // 更新用户对话历史
            updateUserHistory(userId, question, result.answer);
            
            // 缓存结果
            cache.set(cacheKey, result);
            
            logger.info('聊天请求处理成功', {
                userId,
                responseLength: result.answer.length,
                sourceCount: result.source.length
            });
            
            res.json(result);
            
        } catch (error) {
            logger.error('聊天请求处理失败', {
                userId,
                error: error.message,
                questionLength: question.length
            });
            
            // 根据错误类型返回不同的错误信息
            let errorMessage = '智能助手服务暂时不可用，请稍后重试';
            let statusCode = 500;
            
            if (error.message.includes('API错误')) {
                errorMessage = '智能助手返回错误，请重新提问';
                statusCode = 502;
            } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
                errorMessage = '网络连接异常，请检查网络后重试';
                statusCode = 503;
            }
            
            res.status(statusCode).json({
                error: errorMessage,
                timestamp: new Date().toISOString()
            });
        }
    })
);

// 获取用户对话历史
router.get('/history/:userId', 
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        
        if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
            return res.status(400).json({
                error: '无效的用户ID格式'
            });
        }
        
        const history = getUserHistory(userId);
        
        logger.info('获取用户历史', {
            userId,
            historyCount: history.length
        });
        
        res.json({
            userId,
            history,
            count: history.length
        });
    })
);

// 清除用户对话历史
router.delete('/history/:userId',
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        
        if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
            return res.status(400).json({
                error: '无效的用户ID格式'
            });
        }
        
        userConversations.delete(userId);
        
        logger.info('清除用户历史', { userId });
        
        res.json({
            message: '用户对话历史已清除',
            userId
        });
    })
);

// 获取缓存统计
router.get('/cache/stats',
    asyncHandler(async (req, res) => {
        const stats = cache.getStats();
        
        res.json({
            cache: stats,
            conversations: {
                totalUsers: userConversations.size,
                totalConversations: Array.from(userConversations.values())
                    .reduce((sum, history) => sum + history.length, 0)
            }
        });
    })
);

module.exports = router;