import { NextRequest, NextResponse } from 'next/server';

// API代理实现 - 与QAnything后端服务通信
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { question, userId, apiKey, maxTokens = 2000, hybridSearch = true, networking = false } = body;
    
    // 验证必要参数
    if (!question || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数: question 和 userId' },
        { status: 400 }
      );
    }
    
    // 验证API Key
    const qanythingApiKey = apiKey || process.env.QANYTHING_API_KEY;
    if (!qanythingApiKey) {
      return NextResponse.json(
        { error: '缺少API Key' },
        { status: 401 }
      );
    }
    
    // 格式化请求参数
    const formattedData = {
      bot_id: process.env.QANYTHING_BOT_UUID || 'A728E8C44505434E',
      query: question,
      stream: true, // 启用流式响应
      temperature: 0.7,
      max_tokens: maxTokens,
      source_needed: true,
      hybrid_search: hybridSearch,
      networking: networking,
      user_id: userId
    };
    
    console.log('代理请求到有道API:', {
      url: 'https://openapi.youdao.com/g_anything/api/chat_stream',
      userId,
      questionLength: question.length
    });
    
    // 代理请求到有道API
    const response = await fetch('https://openapi.youdao.com/g_anything/api/chat_stream', {
      method: 'POST',
      headers: {
        'Authorization': qanythingApiKey,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'User-Agent': 'QAnything-Proxy/1.0'
      },
      body: JSON.stringify(formattedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('QAnything API错误:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: `QAnything API调用失败: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }
    
    // 处理流式响应
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      return NextResponse.json(
        { error: '无法读取响应流' },
        { status: 500 }
      );
    }
    
    // 创建可读流来转发响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            // 解码数据块
            const chunk = decoder.decode(value, { stream: true });
            
            // 转发数据块到前端
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error('流式响应处理错误:', error);
          controller.error(error);
        }
      }
    });
    
    // 返回流式响应
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error('API代理错误:', error);
    
    return NextResponse.json(
      { 
        error: '服务器内部错误',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求 (CORS预检)
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}