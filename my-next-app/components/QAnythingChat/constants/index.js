// 聊天配置常量
export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  MAX_MESSAGE_LENGTH: 1000,
  API_TIMEOUT: 30000, // 30秒
  DEBOUNCE_DELAY: 300, // 300ms
  SCROLL_BEHAVIOR: 'smooth',
  TYPING_DELAY: 50 // 打字机效果延迟
};

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查您的网络连接',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  PARSE_ERROR: '数据解析失败，请稍后重试',
  GENERAL_ERROR: '发生未知错误，请稍后重试',
  MESSAGE_TOO_LONG: '消息长度超出限制',
  EMPTY_MESSAGE: '请输入消息内容'
};

// UI 常量
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#6366f1',
    SECONDARY: '#8b5cf6',
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    BACKGROUND: '#f8fafc',
    SURFACE: '#ffffff',
    TEXT_PRIMARY: '#1f2937',
    TEXT_SECONDARY: '#6b7280'
  },
  GRADIENTS: {
    PURPLE_BLUE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    CHAT_HEADER: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  },
  ANIMATIONS: {
    FADE_IN: 'fadeIn 0.3s ease-in-out',
    SLIDE_UP: 'slideUp 0.3s ease-out',
    BOUNCE: 'bounce 0.6s ease-in-out'
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};

// API 端点
export const API_ENDPOINTS = {
  CHAT: '/api/qanything-chat',
  HEALTH: '/api/health'
};

// 消息类型
export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
  ERROR: 'error'
};

// 聊天状态
export const CHAT_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  TYPING: 'typing'
};