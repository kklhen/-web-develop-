'use client';

import { useState, useRef, useEffect } from 'react';
import './chat.css';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: '',
    maxTokens: 2000,
    hybridSearch: true,
    networking: false,
    userId: `user_${Date.now()}`
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // 调用API代理
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage.content,
          userId: settings.userId,
          apiKey: settings.apiKey,
          maxTokens: settings.maxTokens,
          hybridSearch: settings.hybridSearch,
          networking: settings.networking
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('无法读取响应流');
      }
      
      // 创建助手消息
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                
                // 更新消息内容
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      // 标记流式响应结束
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      
    } catch (error) {
      console.error('发送消息失败:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        type: 'error',
        content: `发送失败: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 清空对话
  const clearMessages = () => {
    setMessages([]);
  };
  
  // 更新设置
  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="chat-container">
      {/* 头部 */}
      <div className="chat-header">
        <h1>QAnything 智能助手</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ 设置
          </button>
          <button 
            className="btn btn-secondary"
            onClick={clearMessages}
          >
            🗑️ 清空
          </button>
        </div>
      </div>
      
      {/* 设置面板 */}
      {showSettings && (
        <div className="settings-panel">
          <h3>设置</h3>
          <div className="setting-group">
            <label>API Key:</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => updateSettings('apiKey', e.target.value)}
              placeholder="输入你的QAnything API Key"
            />
          </div>
          
          <div className="setting-group">
            <label>用户ID:</label>
            <input
              type="text"
              value={settings.userId}
              onChange={(e) => updateSettings('userId', e.target.value)}
              placeholder="用户标识"
            />
          </div>
          
          <div className="setting-group">
            <label>最大Token数:</label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={(e) => updateSettings('maxTokens', parseInt(e.target.value))}
              min="100"
              max="4000"
            />
          </div>
          
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.hybridSearch}
                onChange={(e) => updateSettings('hybridSearch', e.target.checked)}
              />
              启用混合搜索
            </label>
          </div>
          
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.networking}
                onChange={(e) => updateSettings('networking', e.target.checked)}
              />
              启用网络搜索
            </label>
          </div>
        </div>
      )}
      
      {/* 消息展示区域 */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>👋 欢迎使用QAnything智能助手</h2>
            <p>请在下方输入您的问题，我会尽力为您提供帮助。</p>
            <div className="example-questions">
              <h4>示例问题：</h4>
              <button 
                className="example-btn"
                onClick={() => setInputValue('什么是人工智能？')}
              >
                什么是人工智能？
              </button>
              <button 
                className="example-btn"
                onClick={() => setInputValue('请介绍一下机器学习的基本概念')}
              >
                请介绍一下机器学习的基本概念
              </button>
              <button 
                className="example-btn"
                onClick={() => setInputValue('如何学习编程？')}
              >
                如何学习编程？
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-header">
                <span className="message-role">
                  {message.type === 'user' ? '👤 用户' : 
                   message.type === 'assistant' ? '🤖 助手' : '❌ 错误'}
                </span>
                <span className="message-time">{message.timestamp}</span>
              </div>
              <div className="message-content">
                {message.content}
                {message.isStreaming && (
                  <span className="streaming-indicator">▋</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区域 */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            disabled={isLoading}
            rows={1}
          />
          <button 
            className={`send-btn ${isLoading ? 'loading' : ''}`}
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="input-hint">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
}