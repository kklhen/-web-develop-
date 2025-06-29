import { ENV_CONFIG, API_ENDPOINTS } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * QAnything API 服务类
 * 处理与QAnything平台的API通信
 */
export class QAnythingApiService {
  constructor() {
    this.baseUrl = ENV_CONFIG.QANYTHING_API_BASE_URL;
    this.botId = ENV_CONFIG.QANYTHING_BOT_ID;
    this.apiKey = ENV_CONFIG.QANYTHING_API_KEY;
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送流式聊天请求
   * @param {string} question - 用户问题
   * @param {Array} history - 对话历史
   * @param {boolean} sourceNeeded - 是否需要来源信息
   */
  async sendChatStream(question, history = [], sourceNeeded = true) {
    const url = `${this.baseUrl}${API_ENDPOINTS.QANYTHING_CHAT_STREAM}`;
    
    const requestBody = {
      uuid: this.botId,
      question: question,
      sourceNeeded: sourceNeeded,
      history: history.slice(-2) // 最多支持2轮历史对话
    };

    logger.debug('发送QAnything聊天请求', { url, requestBody });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      logger.error('QAnything API请求失败', error);
      throw error;
    }
  }

  /**
   * 获取Bot信息
   */
  async getBotInfo() {
    const url = `${this.baseUrl}${API_ENDPOINTS.QANYTHING_BOT_INFO}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug('获取Bot信息成功', data);
      return data;
    } catch (error) {
      logger.error('获取Bot信息失败', error);
      throw error;
    }
  }

  /**
   * 解析流式响应
   * @param {Response} response - fetch响应对象
   * @param {Function} onChunk - 处理每个数据块的回调函数
   * @param {Function} onComplete - 完成时的回调函数
   * @param {Function} onError - 错误处理回调函数
   */
  async parseStreamResponse(response, onChunk, onComplete, onError) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            // 处理 Server-Sent Events 格式
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr.trim() === '[DONE]') {
                onComplete && onComplete();
                return;
              }
              
              const data = JSON.parse(jsonStr);
              
              if (data.errorCode === 0) {
                onChunk && onChunk(data.result);
              } else {
                onError && onError(new Error(data.msg || '未知错误'));
                return;
              }
            } else {
              // 直接JSON格式
              const data = JSON.parse(line);
              if (data.errorCode === 0) {
                onChunk && onChunk(data.result);
              } else {
                onError && onError(new Error(data.msg || '未知错误'));
                return;
              }
            }
          } catch (parseError) {
            logger.warn('解析响应数据失败', { line, error: parseError });
          }
        }
      }
      
      onComplete && onComplete();
    } catch (error) {
      logger.error('读取流式响应失败', error);
      onError && onError(error);
    } finally {
      reader.releaseLock();
    }
  }
}

// 创建单例实例
export const qanythingApi = new QAnythingApiService();