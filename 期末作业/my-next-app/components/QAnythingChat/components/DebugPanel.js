import React, { useState, useEffect } from 'react';
import { ENV_CONFIG, API_ENDPOINTS } from '../config/environment';
import { logger } from '../utils/logger';

const DebugPanel = ({ connectionStatus, messages, error, retryCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [logs, setLogs] = useState([]);

  // 检查API健康状态
  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      setApiHealth(data);
      logger.info('API健康检查完成', data);
    } catch (error) {
      setApiHealth({ status: 'error', error: error.message });
      logger.error('API健康检查失败', error);
    }
  };

  // 测试QAnything API连接
  const testQAnythingApi = async () => {
    try {
      const testMessage = {
        question: '测试连接',
        history: []
      };

      const response = await fetch('/api/qanything-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });

      if (response.ok) {
        logger.info('QAnything API连接测试成功');
        alert('QAnything API连接正常');
      } else {
        const errorText = await response.text();
        logger.error('QAnything API连接测试失败', { status: response.status, error: errorText });
        alert(`QAnything API连接失败: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      logger.error('QAnything API连接测试异常', error);
      alert(`QAnything API连接异常: ${error.message}`);
    }
  };

  // 获取最近的日志
  useEffect(() => {
    if (isOpen) {
      const recentLogs = logger.getLogs ? logger.getLogs(20) : [];
      setLogs(recentLogs);
    }
  }, [isOpen]);

  // 自动检查API健康状态
  useEffect(() => {
    if (isOpen && !apiHealth) {
      checkApiHealth();
    }
  }, [isOpen]);

  const debugPanelStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  };

  const toggleButtonStyle = {
    padding: '8px 12px',
    backgroundColor: ENV_CONFIG.DEBUG_MODE ? '#ff6b6b' : '#4ecdc4',
    color: 'white',
    border: 'none',
    borderRadius: isOpen ? '8px 8px 0 0' : '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const panelContentStyle = {
    padding: '16px',
    width: '400px',
    maxHeight: '500px',
    overflow: 'auto',
    fontSize: '12px',
    lineHeight: '1.4'
  };

  const sectionStyle = {
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  };

  const buttonStyle = {
    padding: '4px 8px',
    margin: '2px',
    fontSize: '11px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white'
  };

  const statusColor = (status) => {
    switch (status) {
      case 'connected': return '#4caf50';
      case 'connecting': return '#ff9800';
      case 'disconnected': return '#f44336';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  if (!ENV_CONFIG.DEBUG_MODE) {
    return null;
  }

  return (
    <div style={debugPanelStyle}>
      <button 
        style={toggleButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔧 调试面板 {isOpen ? '▼' : '▲'}
      </button>
      
      {isOpen && (
        <div style={panelContentStyle}>
          {/* 连接状态 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>连接状态</h4>
            <div style={{ color: statusColor(connectionStatus?.status) }}>
              ● {connectionStatus?.description || '未知状态'}
            </div>
            <div>网络: {navigator.onLine ? '在线' : '离线'}</div>
            <div>重试次数: {retryCount || 0}</div>
          </div>

          {/* API配置 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>API配置</h4>
            <div>环境: {process.env.NODE_ENV}</div>
            <div>超时: {ENV_CONFIG.API_TIMEOUT}ms</div>
            <div>重试次数: {ENV_CONFIG.MAX_RETRIES}</div>
            <div>健康检查间隔: {ENV_CONFIG.HEALTH_CHECK_INTERVAL}ms</div>
          </div>

          {/* API健康状态 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>API健康状态</h4>
            <button style={buttonStyle} onClick={checkApiHealth}>
              刷新健康状态
            </button>
            <button style={buttonStyle} onClick={testQAnythingApi}>
              测试QAnything API
            </button>
            {apiHealth && (
              <div style={{ marginTop: '8px' }}>
                <div>状态: {apiHealth.status}</div>
                {apiHealth.timestamp && (
                  <div>时间: {new Date(apiHealth.timestamp).toLocaleTimeString()}</div>
                )}
                {apiHealth.error && (
                  <div style={{ color: '#f44336' }}>错误: {apiHealth.error}</div>
                )}
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div style={sectionStyle}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f44336' }}>当前错误</h4>
              <div style={{ color: '#f44336', fontSize: '11px' }}>
                {error.message || error}
              </div>
              {error.type && <div>类型: {error.type}</div>}
              {error.canRetry !== undefined && (
                <div>可重试: {error.canRetry ? '是' : '否'}</div>
              )}
            </div>
          )}

          {/* 消息统计 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>消息统计</h4>
            <div>总消息数: {messages?.length || 0}</div>
            <div>用户消息: {messages?.filter(m => m.type === 'user').length || 0}</div>
            <div>机器人消息: {messages?.filter(m => m.type === 'bot').length || 0}</div>
          </div>

          {/* 最近日志 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>最近日志</h4>
            <button style={buttonStyle} onClick={() => {
              const recentLogs = logger.getLogs ? logger.getLogs(20) : [];
              setLogs(recentLogs);
            }}>
              刷新日志
            </button>
            <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '8px' }}>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} style={{ 
                    fontSize: '10px', 
                    marginBottom: '2px',
                    color: log.level === 'error' ? '#f44336' : 
                           log.level === 'warn' ? '#ff9800' : '#666'
                  }}>
                    [{log.timestamp}] {log.level.toUpperCase()}: {log.message}
                  </div>
                ))
              ) : (
                <div style={{ color: '#999', fontSize: '10px' }}>暂无日志</div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={sectionStyle}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>操作</h4>
            <button style={buttonStyle} onClick={() => {
              localStorage.clear();
              alert('本地存储已清除');
            }}>
              清除本地存储
            </button>
            <button style={buttonStyle} onClick={() => {
              console.log('调试信息:', {
                connectionStatus,
                messages,
                error,
                retryCount,
                apiHealth,
                config: ENV_CONFIG
              });
              alert('调试信息已输出到控制台');
            }}>
              输出调试信息
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;