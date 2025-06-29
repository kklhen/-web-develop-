import { ENV_CONFIG, LOG_LEVELS } from '../config/environment';

// 日志工具类
class Logger {
  constructor() {
    this.config = ENV_CONFIG;
    this.logs = [];
    this.maxLogs = 100; // 最多保存100条日志
    this.isEnabled = ENV_CONFIG.ENABLE_CONSOLE_LOGS;
    this.isDevelopment = ENV_CONFIG.DEBUG_MODE;
  }

  // 格式化日志消息
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [QAnything]`;
    
    // 存储日志到内存
    this.addToLogs(level, message, data, timestamp);
    
    if (data) {
      return { prefix, message, data };
    }
    return { prefix, message };
  }

  addToLogs(level, message, data, timestamp) {
    const logEntry = {
      level,
      message: data ? `${message}: ${JSON.stringify(data)}` : message,
      timestamp: new Date(timestamp).toLocaleTimeString(),
      data
    };
    
    this.logs.unshift(logEntry);
    
    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(count = 20) {
    return this.logs.slice(0, count);
  }

  clearLogs() {
    this.logs = [];
  }

  // 错误日志
  error(message, error = null) {
    if (!this.isEnabled) return;
    
    const formatted = this.formatMessage(LOG_LEVELS.ERROR, message, error);
    console.error(formatted.prefix, formatted.message);
    
    if (error) {
      console.error('错误详情:', error);
      if (error.stack && this.isDevelopment) {
        console.error('错误堆栈:', error.stack);
      }
    }
  }

  // 警告日志
  warn(message, data = null) {
    if (!this.isEnabled) return;
    
    const formatted = this.formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(formatted.prefix, formatted.message);
    
    if (data && this.isDevelopment) {
      console.warn('警告数据:', data);
    }
  }

  // 信息日志
  info(message, data = null) {
    if (!this.isEnabled) return;
    
    const formatted = this.formatMessage(LOG_LEVELS.INFO, message, data);
    console.info(formatted.prefix, formatted.message);
    
    if (data && this.isDevelopment) {
      console.info('信息数据:', data);
    }
  }

  // 调试日志
  debug(message, data = null) {
    if (!this.isEnabled || !this.isDevelopment) return;
    
    const formatted = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
    console.debug(formatted.prefix, formatted.message);
    
    if (data) {
      console.debug('调试数据:', data);
    }
  }

  // API请求日志
  apiRequest(url, method, body = null) {
    this.debug(`API请求: ${method} ${url}`, { body });
  }

  // API响应日志
  apiResponse(url, status, data = null) {
    if (status >= 200 && status < 300) {
      this.debug(`API响应成功: ${status} ${url}`, { data });
    } else {
      this.error(`API响应失败: ${status} ${url}`, { data });
    }
  }

  // 连接状态日志
  connectionStatus(status, details = null) {
    const message = `连接状态变更: ${status}`;
    
    switch (status) {
      case 'connected':
        this.info(message, details);
        break;
      case 'disconnected':
      case 'error':
        this.error(message, details);
        break;
      default:
        this.debug(message, details);
    }
  }

  // 性能日志
  performance(operation, duration, details = null) {
    const message = `性能监控: ${operation} 耗时 ${duration}ms`;
    
    if (duration > 5000) {
      this.warn(message, details);
    } else {
      this.debug(message, details);
    }
  }
}

// 导出单例实例
export const logger = new Logger();

// 导出便捷方法
export const logError = (message, error) => logger.error(message, error);
export const logWarn = (message, data) => logger.warn(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logDebug = (message, data) => logger.debug(message, data);