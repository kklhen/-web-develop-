import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './hooks/useChat';
import './styles/QAnythingBot.css';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { logger } from './utils/logger';
import { CHAT_CONFIG } from './constants';

/**
 * AI智能体聊天组件
 * 支持QAnything和DeepSeek API，提供完整的聊天界面
 */
const QAnythingBot = ({ 
  className = '',
  placeholder = '请输入您的问题...',
  welcomeMessage = '您好，我是您的专属智能助手，请问有什么可以帮您呢？',
  showConnectionStatus = true,
  maxHeight = '600px',
  theme = 'light',
  defaultAiService = 'qanything' // 默认AI服务
}) => {
  const [aiService, setAiService] = useState(defaultAiService);
  
  const {
    messages,
    isLoading,
    error,
    retryCount,
    connectionStatus,
    sendMessage,
    retryLastMessage,
    clearError
  } = useChat(aiService);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 添加欢迎消息
  useEffect(() => {
    if (messages.length === 0 && welcomeMessage) {
      const welcomeMsg = {
        id: Date.now(),
        text: welcomeMessage,
        isBot: true,
        timestamp: new Date()
      };
      // 这里需要通过useChat hook添加消息
      logger.info('添加欢迎消息', welcomeMsg);
    }
  }, [messages.length, welcomeMessage]);

  // 处理发送消息
  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    if (trimmedInput.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      logger.warn('消息长度超出限制', { length: trimmedInput.length, max: CHAT_CONFIG.MAX_MESSAGE_LENGTH });
      return;
    }

    logger.info('用户发送消息', { text: trimmedInput });
    setInputValue('');
    clearError();
    
    try {
      await sendMessage(trimmedInput);
      inputRef.current?.focus();
    } catch (error) {
      logger.error('发送消息失败', error);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理重试
  const handleRetry = () => {
    logger.info('用户手动重试');
    clearError();
    retryLastMessage();
  };

  // 处理AI服务切换
  const handleAiServiceChange = (service) => {
    logger.info('切换AI服务', { from: aiService, to: service });
    setAiService(service);
    clearError();
  };

  return (
    <div 
      className={`qanything-chat-container ${theme} ${className}`}
      style={{ maxHeight, display: 'flex', flexDirection: 'column' }}
    >
      {/* AI服务选择器 */}
      <div className="ai-service-selector">
        <div className="service-tabs">
          <button 
            className={`service-tab ${aiService === 'qanything' ? 'active' : ''}`}
            onClick={() => handleAiServiceChange('qanything')}
          >
            QAnything
          </button>
          <button 
            className={`service-tab ${aiService === 'deepseek' ? 'active' : ''}`}
            onClick={() => handleAiServiceChange('deepseek')}
          >
            DeepSeek
          </button>
        </div>
        <div className="current-service">
          当前服务: {aiService === 'qanything' ? 'QAnything' : 'DeepSeek'}
        </div>
      </div>

      {/* 连接状态显示 */}
      {showConnectionStatus && (
        <ConnectionStatus 
          status={connectionStatus}
          retryCount={retryCount}
        />
      )}

      {/* 消息列表 */}
      <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          theme={theme}
        />
        
        {/* 加载指示器 */}
        {isLoading && <LoadingIndicator />}
        
        {/* 错误显示 */}
        {error && (
          <ErrorDisplay 
            error={error}
            onRetry={handleRetry}
            onDismiss={clearError}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <InputArea
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSend={handleSendMessage}
        placeholder={placeholder}
        disabled={isLoading}
        maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
        theme={theme}
      />
    </div>
  );
};

export default QAnythingBot;
export { QAnythingBot };