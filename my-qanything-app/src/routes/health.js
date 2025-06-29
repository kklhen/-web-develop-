const express = require('express');
const QAnythingClient = require('../services/qanythingClient');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const config = require('../config');

const router = express.Router();
const qanythingClient = new QAnythingClient();

// 应用启动时间
const startTime = Date.now();

// 基础健康检查
router.get('/health', (req, res) => {
    const uptime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: {
            ms: uptime,
            human: formatUptime(uptime)
        },
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        environment: config.server.env,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// 详细健康检查（包含外部依赖）
router.get('/health/detailed', 
    asyncHandler(async (req, res) => {
        const checks = {
            server: { status: 'healthy', message: '服务器运行正常' },
            qanything: { status: 'unknown', message: '检查中...' },
            memory: { status: 'unknown', message: '检查中...' },
            config: { status: 'unknown', message: '检查中...' }
        };

        // 检查QAnything API连接
        try {
            await qanythingClient.healthCheck();
            checks.qanything = { status: 'healthy', message: 'QAnything API连接正常' };
        } catch (error) {
            checks.qanything = { 
                status: 'unhealthy', 
                message: `QAnything API连接失败: ${error.message}`,
                error: error.code || 'UNKNOWN_ERROR'
            };
        }

        // 检查内存使用情况
        const memoryUsage = process.memoryUsage();
        const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        if (heapUsedPercent > 90) {
            checks.memory = { 
                status: 'warning', 
                message: `内存使用率过高: ${heapUsedPercent.toFixed(1)}%` 
            };
        } else if (heapUsedPercent > 95) {
            checks.memory = { 
                status: 'unhealthy', 
                message: `内存使用率危险: ${heapUsedPercent.toFixed(1)}%` 
            };
        } else {
            checks.memory = { 
                status: 'healthy', 
                message: `内存使用正常: ${heapUsedPercent.toFixed(1)}%` 
            };
        }

        // 检查配置
        try {
            const requiredConfigs = [
                config.qanything.apiKey,
                config.qanything.botUuid,
                config.qanything.apiBaseUrl
            ];
            
            if (requiredConfigs.every(conf => conf && conf.trim() !== '')) {
                checks.config = { status: 'healthy', message: '配置完整' };
            } else {
                checks.config = { status: 'unhealthy', message: '缺少必要配置' };
            }
        } catch (error) {
            checks.config = { status: 'unhealthy', message: '配置加载失败' };
        }

        // 计算整体状态
        const statuses = Object.values(checks).map(check => check.status);
        let overallStatus = 'healthy';
        
        if (statuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (statuses.includes('warning')) {
            overallStatus = 'warning';
        }

        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks,
            uptime: {
                ms: Date.now() - startTime,
                human: formatUptime(Date.now() - startTime)
            }
        };

        // 根据状态设置HTTP状态码
        const statusCode = overallStatus === 'healthy' ? 200 : 
                          overallStatus === 'warning' ? 200 : 503;
        
        res.status(statusCode).json(response);
    })
);

// 就绪检查（用于容器编排）
router.get('/ready', 
    asyncHandler(async (req, res) => {
        try {
            // 检查关键依赖是否就绪
            await qanythingClient.healthCheck();
            
            res.json({
                status: 'ready',
                timestamp: new Date().toISOString(),
                message: '服务已就绪'
            });
        } catch (error) {
            logger.warn('就绪检查失败', { error: error.message });
            
            res.status(503).json({
                status: 'not_ready',
                timestamp: new Date().toISOString(),
                message: '服务未就绪',
                reason: error.message
            });
        }
    })
);

// 存活检查（用于容器编排）
router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        message: '服务存活'
    });
});

// 格式化运行时间
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
    } else if (hours > 0) {
        return `${hours}小时 ${minutes % 60}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟 ${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
}

module.exports = router;