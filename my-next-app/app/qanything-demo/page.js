'use client';

import React, { useEffect, useState } from 'react';

/**
 * QAnything智能体演示页面
 * 展示如何在Next.js应用中集成QAnything智能体
 */
export default function QAnythingDemo() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
  
  // API配置
  const apiKey = 'bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ';
  const botId = 'A728E8C44505434E';
  const apiBase = 'https://openapi.youdao.com/q_anything/api';
  
  // 发送消息到QAnything Agent API (带重试机制)
  const sendMessage = async (retryCount = 0) => {
    if (!message.trim()) return;
    
    setLoading(true);
    if (retryCount === 0) {
      setResponse('');
    } else {
      setResponse(`🔄 重试中... (${retryCount}/3)`);
    }
    
    try {
      const res = await fetch(`${apiBase}/bot/chat_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          uuid: botId,
          question: message,
          stream: true
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // 处理流式响应
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.result && parsed.result.response) {
                fullResponse += parsed.result.response;
                setResponse(fullResponse);
              }
            } catch (e) {
              // 忽略解析错误的数据块
              console.warn('解析数据块失败:', data);
            }
          }
        }
      }
      
      if (!fullResponse) {
        setResponse('收到回复，但内容为空');
      }
      
      // Update API status on successful response
      setApiStatus('online');
    } catch (error) {
      console.error('QAnything API Error:', error);
      
      // Retry logic for certain errors
      const shouldRetry = error.message.includes('500') || error.message.includes('502') || error.message.includes('503');
      
      if (shouldRetry && retryCount < 3) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          sendMessage(retryCount + 1);
        }, delay);
        return;
      }
      
      // Update API status on error
      setApiStatus('offline');
      
      // Enhanced error handling with specific messages
      if (error.message.includes('500')) {
        setResponse('🔧 QAnything服务器暂时不可用，这可能是由于：\n\n• 服务器维护中\n• 临时过载\n• API配置问题\n\n已自动重试3次，请稍后手动重试或联系技术支持。');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setResponse('🔑 API密钥验证失败，请检查：\n\n• API密钥是否正确\n• 是否有访问权限\n• 密钥是否已过期');
      } else if (error.message.includes('429')) {
        setResponse('⏰ 请求过于频繁，请等待几秒后重试');
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setResponse('🌐 网络连接问题，请检查：\n\n• 网络连接是否正常\n• 防火墙设置\n• 代理配置');
      } else {
        setResponse(`❌ 请求失败: ${error.message}\n\n如果问题持续存在，请尝试刷新页面或联系技术支持。`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 使用useEffect动态加载QAnything iframe脚本
  useEffect(() => {
    // 检查脚本是否已存在
    if (document.getElementById('qanything-iframe')) {
      return;
    }
    
    // 创建script元素
    const script = document.createElement('script');
    script.src = 'https://ai.youdao.com/saas/qanything/js/agent-iframe-min.js';
    script.id = 'qanything-iframe';
    script.setAttribute('data-agent-src', 'https://ai.youdao.com/saas/qanything/#/bots/A728E8C44505434E/share');
    script.setAttribute('data-default-open', 'false');
    script.setAttribute('data-drag', 'true');
    script.setAttribute('data-open-icon', 'https://download.ydstatic.com/ead/icon-qanything-iframe-btn.png');
    script.setAttribute('data-close-icon', 'https://download.ydstatic.com/ead/icon-qanything-close.png');
    script.defer = true;
    
    // 添加到页面头部
    document.head.appendChild(script);
    
    // 组件卸载时移除脚本
    return () => {
      const existingScript = document.getElementById('qanything-iframe');
      if (existingScript) {
        existingScript.remove();
      }
      // 清理QAnything创建的元素
      const chatButton = document.getElementById('qanything-chatbot-button');
      const chatWindow = document.getElementById('qanything-chatbot-window');
      if (chatButton) chatButton.remove();
      if (chatWindow) chatWindow.remove();
    };
  }, []);
  
  return (
    <>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* 页面标题 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '10px'
            }}>
              QAnything智能体演示
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666',
              margin: 0
            }}>
              多种集成方式：iframe嵌入 + 浮动窗口 + API调用
            </p>
          </div>

          {/* 智能体介绍 */}
          <div style={{ 
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <div style={{
              fontSize: '1.2rem',
              color: '#333',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              <p>👋 欢迎使用QAnything智能助手！</p>
              <p>点击右下角的聊天按钮开始对话</p>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              marginTop: '30px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minWidth: '200px'
              }}>
                <h4 style={{ color: '#007bff', marginBottom: '10px' }}>💬 智能对话</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>支持自然语言交流，理解上下文</p>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minWidth: '200px'
              }}>
                <h4 style={{ color: '#28a745', marginBottom: '10px' }}>📚 知识问答</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>基于知识库提供准确回答</p>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minWidth: '200px'
              }}>
                <h4 style={{ color: '#ffc107', marginBottom: '10px' }}>🚀 快速响应</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>实时流式输出，体验流畅</p>
              </div>
            </div>
          </div>

          {/* iframe智能体区域 */}
          <div style={{ 
            textAlign: 'center',
            padding: '30px 20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '20px' }}>🤖 iframe嵌入式智能体</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>直接在页面中嵌入QAnything智能体聊天界面</p>
            
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <iframe
                src="https://ai.youdao.com/saas/qanything/#/bots/A728E8C44505434E/share"
                style={{
                  width: '100%',
                  height: '500px',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="QAnything智能体"
                allow="microphone; camera"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              ></iframe>
              
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666'
              }}>
                💡 提示：您可以直接在上方iframe中与智能体对话
              </div>
            </div>
          </div>

          {/* API测试区域 */}
          <div style={{ 
            textAlign: 'center',
            padding: '30px 20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#28a745', marginBottom: '20px' }}>🧪 API测试工具</h3>
            
            {/* API状态指示器 */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: apiStatus === 'online' ? '#d4edda' : apiStatus === 'offline' ? '#f8d7da' : '#fff3cd',
              border: `1px solid ${apiStatus === 'online' ? '#c3e6cb' : apiStatus === 'offline' ? '#f5c6cb' : '#ffeaa7'}`,
              marginBottom: '15px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: apiStatus === 'online' ? '#28a745' : apiStatus === 'offline' ? '#dc3545' : '#ffc107'
              }}></div>
              <span style={{
                fontSize: '14px',
                color: apiStatus === 'online' ? '#155724' : apiStatus === 'offline' ? '#721c24' : '#856404',
                fontWeight: '500'
              }}>
                {apiStatus === 'online' ? 'API服务正常' : apiStatus === 'offline' ? 'API服务异常' : 'API状态未知'}
              </span>
            </div>
            
            <p style={{ color: '#666', marginBottom: '20px' }}>直接测试您的QAnything API</p>
            
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入您的问题..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                style={{
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '20px'
                }}
              >
                {loading ? '发送中...' : '发送消息'}
              </button>
              
              {response && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  border: '1px solid #ddd',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <strong style={{ color: '#28a745' }}>API响应：</strong><br/>
                  {response}
                </div>
              )}
            </div>
          </div>

          {/* 底部信息 */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              🤖 QAnything智能助手已就绪
            </p>
            <p style={{ margin: 0 }}>
              Powered by <strong>QAnything</strong> | 
              浮动窗口式集成 | 支持拖拽移动
            </p>
          </div>
        </div>

        {/* 使用说明 */}
        <div style={{
          maxWidth: '800px',
          margin: '30px auto 0',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ color: '#666', lineHeight: '1.6' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>🔧 配置信息</h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <h4 style={{ color: '#007bff', marginBottom: '15px' }}>🤖 您的QAnything智能体配置</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>Bot ID:</strong> A728E8C44505434E</li>
                <li><strong>API密钥:</strong> bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ</li>
                <li><strong>API根地址:</strong> https://openapi.youdao.com/q_anything/api</li>
                <li><strong>脚本地址:</strong> https://ai.youdao.com/saas/qanything/js/agent-iframe-min.js</li>
                <li><strong>智能体地址:</strong> https://ai.youdao.com/saas/qanything/#/bots/A728E8C44505434E/share</li>
                <li><strong>集成方式:</strong> 浮动窗口 + iframe / API调用</li>
                <li><strong>拖拽功能:</strong> 已启用</li>
              </ul>
            </div>
            
            <h3 style={{ color: '#333', marginBottom: '20px' }}>📝 集成代码</h3>
            
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#007bff', marginBottom: '15px' }}>方式一：iframe嵌入（推荐）</h4>
              <p>在您的HTML页面中添加以下脚本标签：</p>
              <pre style={{
                backgroundColor: '#2d3748',
                color: '#e2e8f0',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '13px',
                overflow: 'auto',
                lineHeight: '1.5'
              }}>
{`<script 
  src="https://ai.youdao.com/saas/qanything/js/agent-iframe-min.js" 
  id="qanything-iframe" 
  data-agent-src="https://ai.youdao.com/saas/qanything/#/bots/A728E8C44505434E/share" 
  data-default-open="false" 
  data-drag="true" 
  data-open-icon="https://download.ydstatic.com/ead/icon-qanything-iframe-btn.png" 
  data-close-icon="https://download.ydstatic.com/ead/icon-qanything-iframe-btn.png" 
  defer 
></script>`}
              </pre>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#28a745', marginBottom: '15px' }}>方式二：API直接调用</h4>
              <p>使用您的API密钥直接调用QAnything API：</p>
              <pre style={{
                backgroundColor: '#2d3748',
                color: '#e2e8f0',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '13px',
                overflow: 'auto',
                lineHeight: '1.5'
              }}>
{`// JavaScript示例
const apiKey = 'bot-w0uitU63Z1kDG3GiNgFsJUXhyLjaGSZZ';
const botId = 'A728E8C44505434E';
const apiBase = 'https://openapi.youdao.com/q_anything/api';

// 发送消息到智能体（流式）
async function sendMessage(message) {
  const response = await fetch(\`\${apiBase}/bot/chat_stream\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({
      uuid: botId,
      question: message,
      sourceNeeded: true,
      history: []
    })
  });
  
  const data = await response.json();
  return data;
}`}
              </pre>
              
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '15px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  <strong>📚 API文档参考：</strong><br/>
                  • <a href="https://ai.youdao.com/qanything/docs/intro/api-intro" target="_blank" style={{ color: '#007bff' }}>API介绍</a><br/>
                  • <a href="https://ai.youdao.com/qanything/docs/api/chat" target="_blank" style={{ color: '#007bff' }}>聊天API</a><br/>
                  • <a href="https://ai.youdao.com/qanything/docs/api/agent" target="_blank" style={{ color: '#007bff' }}>智能体API</a><br/>
                  • <a href="https://ai.youdao.com/qanything/docs/api/errorCode" target="_blank" style={{ color: '#007bff' }}>错误码说明</a>
                </p>
              </div>
            </div>
            
            <h3 style={{ color: '#333', marginBottom: '20px' }}>✨ 功能特性</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #007bff'
              }}>
                <strong style={{ color: '#007bff' }}>🎯 浮动窗口集成</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>自动在页面右下角创建聊天按钮和窗口</p>
              </div>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
              }}>
                <strong style={{ color: '#28a745' }}>🚀 零代码集成</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>只需添加一个脚本标签即可完成集成</p>
              </div>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #ffc107'
              }}>
                <strong style={{ color: '#e67e22' }}>🎨 可自定义外观</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>支持自定义按钮图标、默认状态等</p>
              </div>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #dc3545'
              }}>
                <strong style={{ color: '#dc3545' }}>🖱️ 拖拽支持</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>用户可以拖拽移动聊天窗口位置</p>
              </div>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #6f42c1'
              }}>
                <strong style={{ color: '#6f42c1' }}>⚡ 轻量级加载</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>使用defer属性确保不阻塞页面加载</p>
              </div>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                borderLeft: '4px solid #17a2b8'
              }}>
                <strong style={{ color: '#17a2b8' }}>📱 响应式设计</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>自适应不同屏幕尺寸，移动端友好</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}