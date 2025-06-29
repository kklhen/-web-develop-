'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ChatDemo() {
  const [messages, setMessages] = useState([
    { id: 1, text: '欢迎使用聊天演示！', sender: 'bot', time: '10:00' },
    { id: 2, text: '这是一个React聊天界面示例', sender: 'bot', time: '10:00' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setIsTyping(true);

    // 模拟机器人回复
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        text: `我收到了您的消息："${newMessage.text}"`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/practice" className="text-blue-600 hover:text-blue-800">
            ← 返回练习页面
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">React 聊天演示</h1>
            <p className="text-blue-100 text-sm">展示React状态管理和用户交互</p>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                发送
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 border-t">
            <h3 className="font-semibold mb-2">技术要点:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 数组状态管理（消息列表）</li>
              <li>• 表单处理和键盘事件</li>
              <li>• 条件渲染和动态样式</li>
              <li>• CSS动画（打字效果）</li>
              <li>• 时间格式化和模拟异步操作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}