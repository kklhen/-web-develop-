const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 聊天请求验证规则
const chatValidationRules = () => {
    return [
        body('question')
            .isLength({ min: 1, max: 1000 })
            .withMessage('问题长度必须在1-1000字符之间')
            .trim()
            .escape(),
        body('userId')
            .isLength({ min: 1, max: 50 })
            .withMessage('用户ID长度必须在1-50字符之间')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('用户ID只能包含字母、数字、下划线和连字符')
    ];
};

// 验证结果处理中间件
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));
        
        logger.warn('请求验证失败', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errors: errorMessages
        });
        
        return res.status(400).json({
            error: '请求参数验证失败',
            details: errorMessages
        });
    }
    next();
};

// 请求频率限制中间件
const createRateLimiter = () => {
    const requests = new Map();
    const WINDOW_SIZE = 60 * 1000; // 1分钟
    const MAX_REQUESTS = 30; // 每分钟最多30次请求
    
    return (req, res, next) => {
        const clientId = req.ip + (req.body.userId || 'anonymous');
        const now = Date.now();
        
        if (!requests.has(clientId)) {
            requests.set(clientId, []);
        }
        
        const clientRequests = requests.get(clientId);
        
        // 清理过期的请求记录
        const validRequests = clientRequests.filter(time => now - time < WINDOW_SIZE);
        
        if (validRequests.length >= MAX_REQUESTS) {
            logger.warn('请求频率超限', {
                clientId,
                requestCount: validRequests.length,
                maxRequests: MAX_REQUESTS
            });
            
            return res.status(429).json({
                error: '请求过于频繁，请稍后重试',
                retryAfter: Math.ceil(WINDOW_SIZE / 1000)
            });
        }
        
        validRequests.push(now);
        requests.set(clientId, validRequests);
        
        next();
    };
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    logger.info('收到请求', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.body.userId
    });
    
    // 记录响应时间
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('请求完成', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.body.userId
        });
    });
    
    next();
};

module.exports = {
    chatValidationRules,
    validate,
    createRateLimiter,
    requestLogger
};