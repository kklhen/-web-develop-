// QAnything 聊天组件配置常量
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_MESSAGES: 100,
  TYPING_DELAY: 1000,
  RETRY_ATTEMPTS: 3,
  API_TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  API_ERROR: 'API 服务暂时不可用，请稍后再试',
  TIMEOUT_ERROR: '请求超时，请稍后再试',
  PARSE_ERROR: '数据解析失败，请重试',
  GENERAL_ERROR: '抱歉，发生了错误，请稍后再试'
};

export const UI_TEXTS = {
  PLACEHOLDER: '请输入您的问题...',
  SEND: '发送',
  SETTINGS: '设置',
  TYPING: '正在输入...',
  WELCOME_MESSAGE: '您好，我是您的专属机器人，请问有什么可以帮您呢？'
};