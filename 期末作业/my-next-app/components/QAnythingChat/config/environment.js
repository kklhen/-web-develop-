// 环境配置管理
export const ENV_CONFIG = {
  // QAnything API配置
  QANYTHING_API_BASE_URL: 'https://openapi.youdao.com/q_anything/api',
  QANYTHING_BOT_ID: 'A728E8C44505434E',
  QANYTHING_API_KEY: 'bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ',
  
  // DeepSeek API配置
  DEEPSEEK_API_BASE_URL: 'https://api.deepseek.com',
  DEEPSEEK_API_KEY: 'sk-4dd35e207b3e4fd3bdc2dd292d928007',
  DEEPSEEK_MODEL: 'deepseek-chat',
  
  // 本地API配置
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  
  // 调试配置
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  ENABLE_CONSOLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true' || process.env.NODE_ENV === 'development',
  
  // 重试配置
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY) || 1000,
  
  // 健康检查配置
  HEALTH_CHECK_INTERVAL: 30000, // 30秒
  CONNECTION_CHECK_TIMEOUT: 5000, // 5秒
  
  // 缓存配置
  ENABLE_MESSAGE_CACHE: true,
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24小时
};

// API端点配置
export const API_ENDPOINTS = {
  // QAnything API端点
  QANYTHING_CHAT_STREAM: '/bot/chat_stream',
  QANYTHING_BOT_INFO: '/bot/info',
  
  // DeepSeek API端点
  DEEPSEEK_CHAT: '/chat/completions',
  
  // 本地API端点
  CHAT: '/api/qanything-chat',
  HEALTH: '/api/health',
  STATUS: '/api/status'
};

// 连接状态枚举
export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  CHECKING: 'checking',
  UNKNOWN: 'unknown'
};

// 消息类型枚举
export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  ERROR: 'error'
};

// 日志级别
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};