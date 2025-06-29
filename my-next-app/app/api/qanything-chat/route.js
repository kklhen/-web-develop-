import { NextResponse } from 'next/server';

// QAnything API 配置
const QANYTHING_API_BASE_URL = process.env.QANYTHING_API_BASE_URL || 'http://localhost:8777';
const BOT_ID = process.env.QANYTHING_BOT_ID || 'bot_id_placeholder';
const API_KEY = process.env.QANYTHING_API_KEY || 'your_api_key_here';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 30000;

// 日志函数
function logRequest(method, url, data) {
  console.log(`[${new Date().toISOString()}] [API] ${method} ${url}`, data ? JSON.stringify(data) : '');
}

function logResponse(status, data) {
  console.log(`[${new Date().toISOString()}] [API] Response ${status}`, data ? JSON.stringify(data) : '');
}

function logError(error, context) {
  console.error(`[${new Date().toISOString()}] [API] Error in ${context}:`, error);
}

export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    // 解析请求数据
    requestData = await request.json();
    const { question, history = [] } = requestData;
    
    logRequest('POST', '/api/qanything-chat', { question: question?.substring(0, 100), historyLength: history.length });
    
    // 参数验证
    if (!question || typeof question !== 'string') {
      const error = { error: '问题不能为空且必须是字符串', code: 'INVALID_QUESTION' };
      logResponse(400, error);
      return NextResponse.json(error, { status: 400 });
    }

    if (question.length > 2000) {
      const error = { error: '问题长度不能超过2000字符', code: 'QUESTION_TOO_LONG' };
      logResponse(400, error);
      return NextResponse.json(error, { status: 400 });
    }

    if (!Array.isArray(history)) {
      const error = { error: '历史记录必须是数组格式', code: 'INVALID_HISTORY' };
      logResponse(400, error);
      return NextResponse.json(error, { status: 400 });
    }

    // 检查环境变量配置
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      const error = { error: 'API密钥未配置', code: 'MISSING_API_KEY' };
      logError(new Error('API_KEY not configured'), 'configuration');
      logResponse(500, error);
      return NextResponse.json(error, { status: 500 });
    }

    if (!BOT_ID || BOT_ID === 'bot_id_placeholder') {
      const error = { error: '机器人ID未配置', code: 'MISSING_BOT_ID' };
      logError(new Error('BOT_ID not configured'), 'configuration');
      logResponse(500, error);
      return NextResponse.json(error, { status: 500 });
    }

    // 构建API请求
    const apiUrl = `${QANYTHING_API_BASE_URL}/bot/chat_stream`;
    const requestBody = {
      uuid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: question.trim(),
      sourceNeeded: true,
      history: history.slice(-10) // 只保留最近10轮对话
    };

    logRequest('POST', apiUrl, { ...requestBody, question: requestBody.question.substring(0, 100) });

    // 调用 QAnything API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'QAnything-Chat-Client/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    logResponse(response.status, { responseTime: `${responseTime}ms`, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      const error = {
        error: `QAnything API请求失败: ${response.status} ${response.statusText}`,
        code: 'API_REQUEST_FAILED',
        status: response.status,
        details: errorText
      };
      logError(new Error(errorText), `API request (${response.status})`);
      return NextResponse.json(error, { status: response.status >= 500 ? 502 : response.status });
    }

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Response-Time': `${responseTime}ms`
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logError(error, 'POST handler');
    
    // 确定错误类型和状态码
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = '服务器内部错误，请稍后再试';

    if (error.name === 'AbortError') {
      statusCode = 408;
      errorCode = 'REQUEST_TIMEOUT';
      errorMessage = `请求超时（${API_TIMEOUT}ms），请稍后再试`;
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      statusCode = 502;
      errorCode = 'NETWORK_ERROR';
      errorMessage = '无法连接到QAnything服务，请检查网络连接';
    } else if (error instanceof SyntaxError) {
      statusCode = 400;
      errorCode = 'INVALID_JSON';
      errorMessage = '请求数据格式错误';
    }

    const errorResponse = {
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    };

    // 在开发环境中包含更多错误详情
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        message: error.message,
        stack: error.stack,
        requestData: requestData
      };
    }

    logResponse(statusCode, errorResponse);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}