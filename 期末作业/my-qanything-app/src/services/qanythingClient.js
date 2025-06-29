const axios = require('axios');
const https = require('https');
const config = require('../config');
const logger = require('../utils/logger');

class QAnythingClient {
    constructor() {
        this.config = config.qanything;
        this.axios = axios.create({
            baseURL: this.config.apiRoot,
            timeout: this.config.timeout,
            headers: {
                'Authorization': this.config.apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'QAnything-Client/1.0',
                'Accept': 'application/json'
            },
            httpsAgent: new https.Agent({
                keepAlive: true,
                timeout: this.config.timeout,
                maxSockets: 10,
                maxFreeSockets: 5,
                rejectUnauthorized: false
            })
        });
    }

    async chat(question, history = []) {
        const requestBody = {
            uuid: this.config.botUuid,
            question: question,
            sourceNeeded: true,
            history: history.slice(-2) // 只保留最近2轮对话
        };

        // 尝试非流式API
        try {
            const nonStreamUrl = '/bot/chat';
            logger.apiCall('POST', `${this.config.apiRoot}${nonStreamUrl}`, requestBody);
            
            const response = await this.axios.post(nonStreamUrl, requestBody);
            logger.apiResponse(response.status, { hasData: !!response.data });
            
            return this._processResponse(response.data);
        } catch (nonStreamError) {
            logger.warn('非流式API失败，尝试流式API', { error: nonStreamError.message });
            
            // 尝试流式API
            return await this._chatWithRetry('/bot/chat_stream', requestBody);
        }
    }

    async _chatWithRetry(endpoint, requestBody) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                logger.apiCall('POST', `${this.config.apiRoot}${endpoint}`, requestBody);
                
                const response = await this.axios.post(endpoint, requestBody);
                logger.apiResponse(response.status, { hasData: !!response.data });
                
                return this._processResponse(response.data);
            } catch (error) {
                lastError = error;
                logger.warn(`API调用失败 (尝试 ${attempt}/${this.config.maxRetries})`, {
                    error: error.message,
                    code: error.code
                });
                
                if (attempt < this.config.maxRetries) {
                    await this._delay(this.config.retryDelay);
                }
            }
        }
        
        logger.apiError(lastError, { endpoint, requestBody });
        throw lastError;
    }

    _processResponse(data) {
        logger.debug('处理API响应', {
            hasErrorCode: 'errorCode' in data,
            errorCode: data.errorCode,
            hasResult: 'result' in data
        });

        // 检查API响应格式
        if (typeof data.errorCode === 'undefined') {
            logger.error('API响应格式异常：缺少errorCode字段', { responseData: data });
            throw new Error('API响应格式异常：缺少errorCode字段');
        }

        // 检查错误码
        if (data.errorCode !== 0) {
            const errorMsg = data.msg || data.message || 'API返回未知错误';
            logger.error(`API返回错误 [${data.errorCode}]: ${errorMsg}`, { responseData: data });
            throw new Error(`API错误 [${data.errorCode}]: ${errorMsg}`);
        }

        // 检查结果数据
        if (!data.result) {
            logger.error('API响应格式异常：缺少result字段', { responseData: data });
            throw new Error('API响应格式异常：缺少result字段');
        }

        const result = data.result;
        if (!result.response) {
            logger.error('API响应格式异常：result中缺少response字段', { responseData: data });
            throw new Error('API响应格式异常：result中缺少response字段');
        }

        logger.info('API调用成功', {
            hasResponse: !!result.response,
            hasSource: !!result.source,
            responseLength: result.response ? result.response.length : 0
        });

        return {
            answer: result.response,
            source: result.source || []
        };
    }

    async healthCheck() {
        try {
            // 发送一个简单的测试请求
            const testResponse = await this.chat('测试连接', []);
            return {
                status: 'connected',
                timestamp: new Date().toISOString(),
                testResponse: !!testResponse.answer
            };
        } catch (error) {
            logger.apiError(error, { context: 'healthCheck' });
            throw error;
        }
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = QAnythingClient;