"use client";

import { useState } from 'react';

export default function PracticeCard({ type, title, description }) {
  // 声明收藏状态变量和更新函数
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // 创建事件处理函数，用于切换收藏状态
  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  };

  // 处理卡片点击事件
  const handleCardClick = () => {
    setShowDemo(true);
  };

  // 关闭演示
  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  // 根据类型获取对应的作业文件
  const getDemoContent = () => {
    const demoFiles = {
      html: [
        { name: '新闻页面 v0.5', url: '/demos/03-news-0.5.html', description: '基础HTML新闻页面结构' },
        { name: '新闻页面 v0.6', url: '/demos/04-news-0.6.html', description: '改进的新闻页面布局' },
        { name: '新闻页面 v0.8', url: '/demos/06-news-0.8.html', description: '完善的新闻页面设计' },
        { name: '新闻页面 v0.9', url: '/demos/07-news-0.9.html', description: '最终版新闻页面' }
      ],
      css: [
        { name: 'CSS样式练习', url: '/demos/05-css-0.7.html', description: 'CSS样式和布局练习' },
        { name: '万花筒效果', url: '/demos/kaleidoscope.html', description: '纯CSS实现的万花筒动画' },
        { name: '高级万花筒', url: '/demos/advanced-kaleidoscope.html', description: '复杂的万花筒动画效果' },
        { name: '宇宙海报', url: '/demos/cosmic-poster.html', description: 'CSS艺术设计作品' }
      ],
      react: [
        { name: 'React计数器', url: '/demos/counter-demo', description: 'React状态管理示例' },
        { name: '聊天应用', url: '/demos/chat-demo', description: 'React聊天界面组件' },
        { name: 'QAnything集成', url: '/qanything-demo', description: 'QAnything智能助手集成' }
      ],
      nextjs: [
        { name: 'Next.js应用', url: '/', description: '当前的Next.js主页' },
        { name: 'GitHub统计', url: '/github-stats', description: 'GitHub数据展示页面' },
        { name: 'Wakatime Worker', url: '/demos/wakatime-demo', description: 'Cloudflare Worker应用' }
      ]
    };
    return demoFiles[type] || [];
  };

  return (
    <>
      <div 
        className="w-full h-64 bg-black border-4 border-purple-500 rounded-lg p-4 shadow-lg transition-transform hover:scale-105 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteClick();
            }}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="text-white">
          <p className="text-gray-300 text-base mb-4">{description}</p>
          <div className="flex justify-between items-center">
            <span className="inline-block bg-purple-600 text-white text-sm px-3 py-1 rounded">{type}</span>
            {isFavorited && (
              <span className="text-yellow-400 text-sm">已收藏</span>
            )}
          </div>
          <div className="mt-2 text-center">
            <span className="text-purple-300 text-sm">点击查看作业展示 →</span>
          </div>
        </div>
      </div>

      {/* 作业展示弹窗 */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">{title} 作业展示</h3>
              <button
                onClick={handleCloseDemo}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getDemoContent().map((demo, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-800 mb-2">{demo.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{demo.description}</p>
                    <div className="space-y-2">
                      <a
                        href={demo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        查看演示
                      </a>
                      {demo.url.includes('.html') && (
                        <div className="mt-2">
                          <iframe
                            src={demo.url}
                            className="w-full h-32 border rounded"
                            title={demo.name}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}