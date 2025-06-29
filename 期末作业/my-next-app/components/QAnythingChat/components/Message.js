import React, { memo } from 'react';
import { UI_CONSTANTS, MESSAGE_TYPES } from '../constants/index';

// 消息时间格式化
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 消息组件
const Message = memo(({ message, isLast }) => {
  const { id, text, isBot, timestamp, type = MESSAGE_TYPES.USER } = message;
  
  const messageStyle = {
    display: 'flex',
    marginBottom: isLast ? '0' : '16px',
    justifyContent: isBot ? 'flex-start' : 'flex-end',
    animation: UI_CONSTANTS.ANIMATIONS.FADE_IN
  };

  const bubbleStyle = {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
    backgroundColor: isBot ? UI_CONSTANTS.COLORS.SURFACE : UI_CONSTANTS.COLORS.PRIMARY,
    color: isBot ? UI_CONSTANTS.COLORS.TEXT_PRIMARY : 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    wordWrap: 'break-word',
    fontSize: '14px',
    lineHeight: '1.5',
    position: 'relative',
    border: isBot ? `1px solid ${UI_CONSTANTS.COLORS.BACKGROUND}` : 'none'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isBot ? UI_CONSTANTS.COLORS.SECONDARY : UI_CONSTANTS.COLORS.PRIMARY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    marginRight: isBot ? '8px' : '0',
    marginLeft: isBot ? '0' : '8px',
    flexShrink: 0
  };

  const timestampStyle = {
    fontSize: '11px',
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: '4px',
    textAlign: isBot ? 'left' : 'right'
  };

  // 错误消息样式
  if (type === MESSAGE_TYPES.ERROR) {
    bubbleStyle.backgroundColor = UI_CONSTANTS.COLORS.ERROR;
    bubbleStyle.color = 'white';
  }

  return (
    <div style={messageStyle}>
      {isBot && (
        <div style={avatarStyle}>
          🤖
        </div>
      )}
      
      <div style={{ maxWidth: '70%' }}>
        <div style={bubbleStyle}>
          {text || '...'}
        </div>
        
        {timestamp && (
          <div style={timestampStyle}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
      
      {!isBot && (
        <div style={avatarStyle}>
          👤
        </div>
      )}
    </div>
  );
});

Message.displayName = 'Message';

export default Message;