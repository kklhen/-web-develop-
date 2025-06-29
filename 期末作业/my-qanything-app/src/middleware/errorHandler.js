const logger = require('../utils/logger');
const config = require('../config');

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
    // 记录错误详情
    logger.error('应用错误', {
        error: {
            message: err.message,
            stack: err.stack,
            code: err.code
        },
        request: {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            body: req.body
        }
    });

    // 根据错误类型返回不同的响应
    let statusCode = 500;
    let message = '服务器内部错误';
    let details = null;

    // 处理不同类型的错误
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = '请求参数验证失败';
        details = err.details;
    } else if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND') {
        statusCode = 503;
        message = '外部服务暂时不可用，请稍后重试';
    } else if (err.message && err.message.includes('API错误')) {
        statusCode = 502;
        message = '智能助手服务异常';
        details = err.message;
    } else if (err.name === 'TimeoutError') {
        statusCode = 504;
        message = '请求超时，请稍后重试';
    }

    // 构建错误响应
    const errorResponse = {
        error: message,
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
    };

    // 在开发环境中包含更多错误信息
    if (config.server.env === 'development') {
        errorResponse.details = details || err.message;
        errorResponse.stack = err.stack;
    } else if (details) {
        errorResponse.details = details;
    }

    res.status(statusCode).json(errorResponse);
};

// 404错误处理
const notFoundHandler = (req, res) => {
    logger.warn('404错误', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    res.status(404).json({
        error: '请求的资源不存在',
        timestamp: new Date().toISOString(),
        path: req.url
    });
};

// 异步错误捕获包装器
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 进程级错误处理
const setupProcessErrorHandlers = () => {
    process.on('uncaughtException', (err) => {
        logger.error('未捕获的异常', {
            error: {
                message: err.message,
                stack: err.stack
            }
        });
        
        // 优雅关闭
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('未处理的Promise拒绝', {
            reason: reason,
            promise: promise
        });
        
        // 优雅关闭
        process.exit(1);
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    setupProcessErrorHandlers
};