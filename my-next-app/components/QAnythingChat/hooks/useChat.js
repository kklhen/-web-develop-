import { useState, useCallback, useRef } from 'react';
import { CHAT_CONFIG, ERROR_MESSAGES } from '../constants/index';
import { ENV_CONFIG, API_ENDPOINTS } from '../config/environment';
import { logger } from '../utils/logger';
import { useConnectionStatus } from './useConnectionStatus';
import { qanythingApi } from '../services/qanythingApi';
import { deepseekApi } from '../services/deepseekApi';

// 防抖Hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// 聊天功能Hook
export const useChat = (aiService = 'qanything') => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '您好，我是您的专属机器人，请问有什么可以帮您呢？',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // 连接状态监控
  const connectionStatus = useConnectionStatus();
  
  logger.debug('useChat Hook 初始化', { 
    messagesCount: messages.length, 
    isLoading, 
    connectionStatus: connectionStatus.apiStatus 
  });

  // 添加消息并限制数量
  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      const updated = [...prev, newMessage];
      return updated.length > CHAT_CONFIG.MAX_MESSAGES 
        ? updated.slice(-CHAT_CONFIG.MAX_MESSAGES) 
        : updated;
    });
  }, []);

  // 更新消息
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  // 错误处理
  const handleError = useCallback((error, context = {}) => {
    logger.error('聊天错误', error);
    logger.debug('错误上下文', { context, retryCount });
    
    let errorMessage = ERROR_MESSAGES.GENERAL_ERROR;
    let shouldRetry = false;
    
    // 根据错误类型确定错误消息和是否可重试
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      shouldRetry = true;
    } else if (error.name === 'AbortError') {
      errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
      shouldRetry = true;
    } else if (error.message.includes('JSON')) {
      errorMessage = ERROR_MESSAGES.PARSE_ERROR;
      shouldRetry = true;
    } else if (error.message.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        if (status >= 500) {
          errorMessage = '服务器暂时不可用，请稍后重试';
          shouldRetry = true;
        } else if (status === 429) {
          errorMessage = '请求过于频繁，请稍后重试';
          shouldRetry = true;
        } else {
          errorMessage = `请求失败 (${status})`;
        }
      }
    }
    
    // 检查连接状态
    if (!connectionStatus.isConnected) {
      errorMessage = connectionStatus.getStatusDescription();
      shouldRetry = false;
    }
    
    setError({ message: errorMessage, canRetry: shouldRetry, originalError: error });
    
    // 添加错误消息到聊天记录
    const errorText = shouldRetry && retryCount < ENV_CONFIG.MAX_RETRIES 
      ? `❌ ${errorMessage} (将自动重试 ${retryCount + 1}/${ENV_CONFIG.MAX_RETRIES})`
      : `❌ ${errorMessage}`;
      
    addMessage({
      id: Date.now(),
      text: errorText,
      isBot: true,
      timestamp: new Date(),
      isError: true
    });
  }, [addMessage, retryCount, connectionStatus]);

  // 带重试机制的发送消息函数
  const sendMessageWithRetry = useCallback(async (inputText, currentRetry = 0) => {
    const startTime = Date.now();
    logger.apiRequest('QAnything API', 'POST', { question: inputText, retry: currentRetry, aiService });
    
    try {
      // 根据选择的AI服务构建历史对话记录
      let history, response;
      
      if (aiService === 'deepseek') {
        // 构建DeepSeek格式的历史对话记录
        history = messages
          .filter(msg => !msg.isBot || msg.text !== '您好，我是您的专属机器人，请问有什么可以帮您呢？')
          .slice(-4) // 限制历史记录数量
          .reduce((acc, msg, index, arr) => {
            if (!msg.isBot && index < arr.length - 1 && arr[index + 1].isBot) {
              acc.push({
                question: msg.text,
                response: arr[index + 1].text
              });
            }
            return acc;
          }, []);
        
        logger.debug('构建的DeepSeek历史对话记录', history);
        response = await deepseekApi.sendChatStream(inputText, history);
      } else {
        // 构建QAnything格式的历史对话记录
        history = messages
          .filter(msg => !msg.isBot || msg.text !== '您好，我是您的专属机器人，请问有什么可以帮您呢？')
          .slice(-4) // 限制历史记录数量
          .reduce((acc, msg, index, arr) => {
            if (!msg.isBot && index < arr.length - 1 && arr[index + 1].isBot) {
              acc.push({
                question: msg.text,
                response: arr[index + 1].text
              });
            }
            return acc;
          }, []);
        
        logger.debug('构建的QAnything历史对话记录', history);
        response = await qanythingApi.sendChatStream(inputText, history, true);
      }

      const duration = Date.now() - startTime;
      logger.performance('QAnything API请求', duration, { retry: currentRetry });

      logger.apiResponse('QAnything API', response.status);
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.apiResponse('QAnything API', 0, { error: error.message, duration });
      
      // 检查是否应该重试
      if (currentRetry < ENV_CONFIG.MAX_RETRIES && 
          (error.name === 'TypeError' || error.name === 'AbortError' || 
           (error.message.includes('HTTP') && error.message.includes('5')))) {
        
        logger.info(`准备重试发送消息，第 ${currentRetry + 1} 次重试`, { error: error.message });
        setRetryCount(currentRetry + 1);
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, ENV_CONFIG.RETRY_DELAY * (currentRetry + 1)));
        return sendMessageWithRetry(inputText, currentRetry + 1);
      }
      
      throw error;
    }
  }, [messages]);

  // 发送消息
  const sendMessage = useCallback(async (inputText) => {
    if (!inputText.trim() || isLoading) {
      logger.warn('发送消息被阻止', { inputText: inputText.trim(), isLoading });
      return;
    }
    
    // 检查连接状态
    if (!connectionStatus.canSendMessage()) {
      handleError(new Error('网络连接不可用'), { connectionStatus: connectionStatus.apiStatus });
      return;
    }
    
    // 检查消息长度
    if (inputText.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      handleError(new Error(`消息长度不能超过 ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} 个字符`));
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    logger.info('发送用户消息', { text: inputText, messageId: userMessage.id });
    addMessage(userMessage);
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      // 使用带重试机制的发送函数
      const response = await sendMessageWithRetry(inputText);

      const botMessageId = Date.now() + 1;
      const botMessage = {
        id: botMessageId,
        text: '',
        isBot: true,
        timestamp: new Date()
      };
      addMessage(botMessage);

      // 根据AI服务选择相应的流式响应解析
      if (aiService === 'deepseek') {
        await deepseekApi.parseStreamResponse(
          response,
          (chunk) => {
            updateMessage(botMessage.id, (prev) => ({
              ...prev,
              text: prev.text + chunk
            }));
          },
          () => {
            setIsLoading(false);
            setRetryCount(0);
            logger.apiResponse('DeepSeek API', 200, { duration: Date.now() - startTime });
          },
          (error) => {
            setIsLoading(false);
            logger.error('DeepSeek流式响应处理失败', error);
            throw error;
          }
        );
      } else {
        await qanythingApi.parseStreamResponse(
          response,
          (chunk) => {
            updateMessage(botMessage.id, (prev) => ({
              ...prev,
              text: prev.text + chunk
            }));
          },
          () => {
            setIsLoading(false);
            setRetryCount(0);
            logger.apiResponse('QAnything API', 200, { duration: Date.now() - startTime });
          },
          (error) => {
            setIsLoading(false);
            logger.error('QAnything流式响应处理失败', error);
            throw error;
          }
        );
      }
    } catch (error) {
      handleError(error, { inputText, retryCount });
    } finally {
      setIsLoading(false);
      setRetryCount(0);
    }
  }, [messages, isLoading, addMessage, updateMessage, handleError, sendMessageWithRetry, connectionStatus]);

  // 手动重试最后一条消息
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => !msg.isBot && !msg.isError);
      
    if (lastUserMessage && !isLoading) {
      logger.info('手动重试最后一条消息', { messageId: lastUserMessage.id, text: lastUserMessage.text });
      sendMessage(lastUserMessage.text);
    }
  }, [messages, isLoading, sendMessage]);

  // 清除错误状态
  const clearError = useCallback(() => {
    logger.debug('清除错误状态');
    setError(null);
    setRetryCount(0);
  }, []);

  // 防抖发送消息
  const debouncedSendMessage = useDebounce(sendMessage, CHAT_CONFIG.DEBOUNCE_DELAY);

  return {
    messages,
    isLoading,
    error,
    retryCount,
    connectionStatus,
    sendMessage: debouncedSendMessage,
    retryLastMessage,
    clearError,
    addMessage,
    updateMessage
  };
};