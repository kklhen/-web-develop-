require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    qanything: {
        apiKey: process.env.QANYTHING_API_KEY,
        botUuid: process.env.QANYTHING_BOT_UUID,
        apiRoot: process.env.QANYTHING_API_ROOT,
        timeout: parseInt(process.env.API_TIMEOUT) || 60000,
        maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
        retryDelay: parseInt(process.env.RETRY_DELAY) || 2000
    },
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 300
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};

// 验证必需的配置
function validateConfig() {
    const required = [
        'qanything.apiKey',
        'qanything.botUuid',
        'qanything.apiRoot'
    ];
    
    for (const key of required) {
        const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
        if (!value) {
            throw new Error(`Missing required configuration: ${key}`);
        }
    }
}

validateConfig();

module.exports = config;