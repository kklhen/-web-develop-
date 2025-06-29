const config = require('../config');

class Logger {
    constructor() {
        this.level = config.logging.level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    _shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    _formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    error(message, meta = {}) {
        if (this._shouldLog('error')) {
            console.error(this._formatMessage('error', message, meta));
        }
    }

    warn(message, meta = {}) {
        if (this._shouldLog('warn')) {
            console.warn(this._formatMessage('warn', message, meta));
        }
    }

    info(message, meta = {}) {
        if (this._shouldLog('info')) {
            console.log(this._formatMessage('info', message, meta));
        }
    }

    debug(message, meta = {}) {
        if (this._shouldLog('debug')) {
            console.log(this._formatMessage('debug', message, meta));
        }
    }

    // API调用专用日志方法
    apiCall(method, url, data = {}) {
        this.info(`API调用: ${method} ${url}`, { requestData: data });
    }

    apiResponse(status, data = {}) {
        this.info(`API响应: ${status}`, { responseData: data });
    }

    apiError(error, context = {}) {
        this.error(`API错误: ${error.message}`, {
            error: {
                code: error.code,
                message: error.message,
                stack: error.stack
            },
            context
        });
    }
}

module.exports = new Logger();