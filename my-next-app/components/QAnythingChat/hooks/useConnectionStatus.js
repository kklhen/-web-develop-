import { useState, useEffect, useCallback } from 'react';
import { ENV_CONFIG, API_ENDPOINTS, CONNECTION_STATUS } from '../config/environment';
import { logger } from '../utils/logger';

// 连接状态监控Hook
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [apiStatus, setApiStatus] = useState(CONNECTION_STATUS.UNKNOWN);
  const [lastChecked, setLastChecked] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // 检查API状态
  const checkApiStatus = useCallback(async () => {
    if (!isOnline) {
      setApiStatus(CONNECTION_STATUS.DISCONNECTED);
      return;
    }

    setApiStatus(CONNECTION_STATUS.CHECKING);
    const startTime = Date.now();

    try {
      logger.debug('开始检查API状态');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ENV_CONFIG.CONNECTION_CHECK_TIMEOUT);

      const response = await fetch(API_ENDPOINTS.HEALTH, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setApiStatus(CONNECTION_STATUS.CONNECTED);
        setErrorDetails(null);
        logger.connectionStatus(CONNECTION_STATUS.CONNECTED, { duration });
      } else {
        setApiStatus(CONNECTION_STATUS.ERROR);
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          duration
        };
        setErrorDetails(errorInfo);
        logger.connectionStatus(CONNECTION_STATUS.ERROR, errorInfo);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setApiStatus(CONNECTION_STATUS.ERROR);
      
      const errorInfo = {
        message: error.message,
        name: error.name,
        duration
      };
      setErrorDetails(errorInfo);
      logger.connectionStatus(CONNECTION_STATUS.ERROR, errorInfo);
    }

    setLastChecked(new Date());
  }, [isOnline]);

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      logger.info('网络连接恢复');
      setIsOnline(true);
    };

    const handleOffline = () => {
      logger.warn('网络连接断开');
      setIsOnline(false);
      setApiStatus(CONNECTION_STATUS.DISCONNECTED);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 定期检查API状态
  useEffect(() => {
    // 初始检查
    checkApiStatus();

    // 定期检查
    const interval = setInterval(checkApiStatus, ENV_CONFIG.HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkApiStatus]);

  // 手动重新检查
  const recheckConnection = useCallback(() => {
    logger.info('手动重新检查连接状态');
    checkApiStatus();
  }, [checkApiStatus]);

  // 获取连接状态描述
  const getStatusDescription = useCallback(() => {
    if (!isOnline) {
      return '网络连接断开';
    }

    switch (apiStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return '连接正常';
      case CONNECTION_STATUS.DISCONNECTED:
        return '服务器连接断开';
      case CONNECTION_STATUS.ERROR:
        return errorDetails?.message || '连接异常';
      case CONNECTION_STATUS.CHECKING:
        return '检查连接中...';
      default:
        return '连接状态未知';
    }
  }, [isOnline, apiStatus, errorDetails]);

  // 获取状态颜色
  const getStatusColor = useCallback(() => {
    if (!isOnline) return '#ef4444'; // 红色

    switch (apiStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return '#10b981'; // 绿色
      case CONNECTION_STATUS.CHECKING:
        return '#f59e0b'; // 黄色
      case CONNECTION_STATUS.ERROR:
      case CONNECTION_STATUS.DISCONNECTED:
        return '#ef4444'; // 红色
      default:
        return '#6b7280'; // 灰色
    }
  }, [isOnline, apiStatus]);

  // 判断是否可以发送消息
  const canSendMessage = useCallback(() => {
    return isOnline && apiStatus === CONNECTION_STATUS.CONNECTED;
  }, [isOnline, apiStatus]);

  return {
    isOnline,
    apiStatus,
    lastChecked,
    errorDetails,
    recheckConnection,
    getStatusDescription,
    getStatusColor,
    canSendMessage,
    isConnected: canSendMessage()
  };
};