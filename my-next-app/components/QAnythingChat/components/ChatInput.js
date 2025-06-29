import React, { useState, useRef, useCallback, memo } from 'react';
import { UI_CONSTANTS, CHAT_CONFIG, ERROR_MESSAGES } from '../constants/index';

const ChatInput = memo(({ onSendMessage, isLoading, disabled = false }) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // 验证输入
  const validateInput = useCallback((text) => {
    if (!text.trim()) {
      setError(ERROR_MESSAGES.EMPTY_MESSAGE);
      return false;
    }
    if (text.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      setError(ERROR_MESSAGES.MESSAGE_TOO_LONG);
      return false;
    }
    setError('');
    return true;
  }, []);

  // 处理发送消息
  const handleSend = useCallback(() => {
    if (isLoading || disabled) return;
    
    if (validateInput(inputText)) {
      onSendMessage(inputText);
      setInputText('');
      setError('');
      
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [inputText, isLoading, disabled, validateInput, onSendMessage]);

  // 处理键盘事件
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 处理输入变化
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputText(value);
    
    // 清除错误信息
    if (error) {
      setError('');
    }
    
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, [error]);

  const containerStyle = {
    padding: '16px',
    backgroundColor: UI_CONSTANTS.COLORS.SURFACE,
    borderTop: `1px solid ${UI_CONSTANTS.COLORS.BACKGROUND}`,
    position: 'relative'
  };

  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    position: 'relative'
  };

  const textareaStyle = {
    flex: 1,
    minHeight: '40px',
    maxHeight: '120px',
    padding: '10px 12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: error ? UI_CONSTANTS.COLORS.ERROR : UI_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: '20px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'none',
    outline: 'none',
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit'
  };

  const sendButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: isLoading || disabled || !inputText.trim() 
      ? UI_CONSTANTS.COLORS.TEXT_SECONDARY 
      : UI_CONSTANTS.GRADIENTS.PURPLE_BLUE,
    color: 'white',
    cursor: isLoading || disabled || !inputText.trim() ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.2s',
    flexShrink: 0
  };

  const errorStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    right: '0',
    backgroundColor: UI_CONSTANTS.COLORS.ERROR,
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px 8px 0 0',
    fontSize: '12px',
    animation: UI_CONSTANTS.ANIMATIONS.SLIDE_UP
  };

  const characterCountStyle = {
    position: 'absolute',
    bottom: '4px',
    right: '52px',
    fontSize: '11px',
    color: inputText.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH * 0.9 
      ? UI_CONSTANTS.COLORS.WARNING 
      : UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    pointerEvents: 'none'
  };

  return (
    <div style={containerStyle}>
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}
      
      <div style={inputContainerStyle}>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isLoading ? "AI正在思考中..." : "输入您的问题..."}
          disabled={isLoading || disabled}
          style={{
            ...textareaStyle,
            ...(textareaRef.current && textareaRef.current === document.activeElement ? {
              borderColor: UI_CONSTANTS.COLORS.PRIMARY,
              boxShadow: `0 0 0 2px ${UI_CONSTANTS.COLORS.PRIMARY}20`
            } : {})
          }}
          maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
        />
        
        {inputText && (
          <div style={characterCountStyle}>
            {inputText.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
          </div>
        )}
        
        <button
          onClick={handleSend}
          disabled={isLoading || disabled || !inputText.trim()}
          style={sendButtonStyle}
          title={isLoading ? "发送中..." : "发送消息"}
        >
          {isLoading ? (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            '📤'
          )}
        </button>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;