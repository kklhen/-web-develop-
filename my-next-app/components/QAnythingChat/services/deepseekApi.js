import { ENV_CONFIG, API_ENDPOINTS } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * DeepSeek API 服务类
 * 处理与DeepSeek平台的API通信
 */
export class DeepSeekApiService {
  constructor() {
    this.baseUrl = ENV_CONFIG.DEEPSEEK_API_BASE_URL;
    this.apiKey = ENV_CONFIG.DEEPSEEK_API_KEY;
    this.model = ENV_CONFIG.DEEPSEEK_MODEL;
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送流式聊天请求
   * @param {string} question - 用户问题
   * @param {Array} history - 对话历史
   * @param {boolean} stream - 是否使用流式响应
   */
  async sendChatStream(question, history = [], stream = true) {
    const url = `${this.baseUrl}${API_ENDPOINTS.DEEPSEEK_CHAT}`;
    
    // 构建消息数组
    const messages = [
      {
        role: 'system',
        content: '你是一个有用的AI助手，请用中文回答用户的问题。'
      }
    ];

    // 添加历史对话
    history.forEach(item => {
      if (item.question && item.response) {
        messages.push(
          { role: 'user', content: item.question },
          { role: 'assistant', content: item.response }
        );
      }
    });

    // 添加当前问题
    messages.push({ role: 'user', content: question });

    const requestBody = {
      model: this.model,
      messages: messages,
      stream: stream,
      temperature: 0.7,
      max_tokens: 2000
    };

    logger.debug('发送DeepSeek聊天请求', { url, requestBody });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response;
    } catch (error) {
      logger.error('DeepSeek API请求失败', error);
      throw error;
    }
  }

  /**
   * 获取模型信息
   */
  async getModelInfo() {
    const url = `${this.baseUrl}/models`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.debug('获取DeepSeek模型信息成功', data);
      return data;
    } catch (error) {
      logger.error('获取DeepSeek模型信息失败', error);
      throw error;
    }
  }

  /**
   * 解析DeepSeek流式响应
   * @param {ReadableStreamDefaultReader} reader - 流读取器
   * @param {Function} onChunk - 处理每个数据块的回调函数
   * @param {Function} onComplete - 完成时的回调函数
   * @param {Function} onError - 错误处理回调函数
   */
  async parseStreamResponse(reader, onChunk, onComplete, onError) {
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
              const jsonStr = line.substring(6).trim();
              
              if (jsonStr === '[DONE]') {
                onComplete && onComplete();
                return;
              }
              
              const data = JSON.parse(jsonStr);
              
              // DeepSeek API 响应格式
              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const delta = data.choices[0].delta;
                if (delta.content) {
                  onChunk && onChunk(delta.content);
                }
                
                // 检查是否完成
                if (data.choices[0].finish_reason) {
                  onComplete && onComplete();
                  return;
                }
              }
            }
          } catch (parseError) {
            logger.warn('解析DeepSeek响应数据失败', { line, error: parseError });
          }
        }
      }
      
      onComplete && onComplete();
    } catch (error) {
      logger.error('读取DeepSeek流式响应失败', error);
      onError && onError(error);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 发送非流式聊天请求
   * @param {string} question - 用户问题
   * @param {Array} history - 对话历史
   */
  async sendChat(question, history = []) {
    const response = await this.sendChatStream(question, history, false);
    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    throw new Error('Invalid response format from DeepSeek API');
  }
}

// 创建单例实例
export const deepseekApi = new DeepSeekApiService();