'use client';

import React, { useRef, useEffect } from 'react';
import ErrorBoundary from './QAnythingChat/components/ErrorBoundary';
import Message from './QAnythingChat/components/Message';
import ChatInput from './QAnythingChat/components/ChatInput';
import LoadingIndicator from './QAnythingChat/components/LoadingIndicator';
import ConnectionStatus from './QAnythingChat/components/ConnectionStatus';
import DebugPanel from './QAnythingChat/components/DebugPanel';
import { useChat } from './QAnythingChat/hooks/useChat';
import { UI_CONSTANTS, CHAT_CONFIG } from './QAnythingChat/constants/index';

const QAnythingChat = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    retryCount,
    connectionStatus,
    sendMessage,
    retryLastMessage,
    clearError
  } = useChat();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: CHAT_CONFIG.SCROLL_BEHAVIOR 
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 错误处理
  const handleError = (error, errorInfo) => {
    console.error('QAnything聊天组件错误:', error, errorInfo);
  };

  // 重试处理
  const handleRetry = () => {
    clearError();
  };

  const containerStyle = {
    width: '100%',
    height: '600px',
    backgroundColor: UI_CONSTANTS.COLORS.SURFACE,
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `1px solid ${UI_CONSTANTS.COLORS.BACKGROUND}`
  };

  const headerStyle = {
    background: UI_CONSTANTS.GRADIENTS.CHAT_HEADER,
    color: 'white',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  };

  const titleStyle = {
    flex: 1
  };

  const messagesStyle = {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
    display: 'flex',
    flexDirection: 'column',
    gap: '0'
  };

  return (
    <ErrorBoundary onError={handleError} onRetry={handleRetry}>
      <div style={containerStyle}>
        {/* 聊天头部 */}
        <div style={headerStyle}>
          <div style={avatarStyle}>
            🤖
          </div>
          <div style={titleStyle}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              QAnything 智能助手
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {isLoading ? '正在思考中...' : '在线'}
            </div>
          </div>
          {error && (
            <div style={{
              fontSize: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              ⚠️ 连接异常
            </div>
          )}
        </div>

        {/* 连接状态指示器 */}
        <ConnectionStatus 
          connectionStatus={connectionStatus}
          onRetry={connectionStatus.recheckConnection}
        />

        {/* 消息区域 */}
        <div ref={messagesContainerRef} style={messagesStyle}>
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          
          {isLoading && (
            <LoadingIndicator message="AI正在思考中..." />
          )}
          
          {/* 错误重试提示 */}
          {error && error.canRetry && !isLoading && (
            <div style={{
              padding: '12px',
              textAlign: 'center',
              backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
              borderRadius: '8px',
              margin: '8px 16px'
            }}>
              <button
                onClick={retryLastMessage}
                style={{
                  padding: '8px 16px',
                  backgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                重试发送消息
              </button>
              <button
                onClick={clearError}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
                  border: `1px solid ${UI_CONSTANTS.COLORS.TEXT_SECONDARY}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginLeft: '8px'
                }}
              >
                忽略错误
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading || !connectionStatus.canSendMessage()}
          error={error?.message}
        />
      </div>
        
      {/* 调试面板 */}
      <DebugPanel 
        connectionStatus={connectionStatus}
        messages={messages}
        error={error}
        retryCount={retryCount}
      />
    </ErrorBoundary>
  );
};

export default QAnythingChat;