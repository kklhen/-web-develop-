import React from 'react';
import { CONNECTION_STATUS } from '../config/environment';
import { UI_CONSTANTS } from '../constants/index';

// 连接状态指示器组件
const ConnectionStatus = ({ connectionStatus, onRetry }) => {
  const { apiStatus, isOnline, getStatusDescription, getStatusColor, lastChecked } = connectionStatus;

  // 状态图标
  const getStatusIcon = () => {
    if (!isOnline) return '🔴';
    
    switch (apiStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return '🟢';
      case CONNECTION_STATUS.CHECKING:
        return '🟡';
      case CONNECTION_STATUS.ERROR:
      case CONNECTION_STATUS.DISCONNECTED:
        return '🔴';
      default:
        return '⚪';
    }
  };

  // 容器样式
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: UI_CONSTANTS.COLORS.SURFACE,
    borderBottom: `1px solid ${UI_CONSTANTS.COLORS.BACKGROUND}`,
    fontSize: '12px',
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY
  };

  // 状态文本样式
  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: getStatusColor()
  };

  // 重试按钮样式
  const retryButtonStyle = {
    padding: '4px 8px',
    fontSize: '11px',
    backgroundColor: 'transparent',
    border: `1px solid ${UI_CONSTANTS.COLORS.PRIMARY}`,
    borderRadius: '4px',
    color: UI_CONSTANTS.COLORS.PRIMARY,
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  // 时间格式化
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 是否显示重试按钮
  const showRetryButton = !isOnline || 
    apiStatus === CONNECTION_STATUS.ERROR || 
    apiStatus === CONNECTION_STATUS.DISCONNECTED;

  return (
    <div style={containerStyle}>
      <div style={statusStyle}>
        <span>{getStatusIcon()}</span>
        <span>{getStatusDescription()}</span>
        {lastChecked && (
          <span style={{ marginLeft: '8px', opacity: 0.7 }}>
            ({formatTime(lastChecked)})
          </span>
        )}
      </div>
      
      {showRetryButton && onRetry && (
        <button
          style={retryButtonStyle}
          onClick={onRetry}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = UI_CONSTANTS.COLORS.PRIMARY;
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = UI_CONSTANTS.COLORS.PRIMARY;
          }}
        >
          重试连接
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;