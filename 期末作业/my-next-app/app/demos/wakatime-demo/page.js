'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WakatimeDemo() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模拟数据
  const mockStats = {
    total_seconds: 25200, // 7小时
    languages: [
      { name: 'JavaScript', total_seconds: 10800, percent: 42.86 },
      { name: 'Python', total_seconds: 7200, percent: 28.57 },
      { name: 'HTML', total_seconds: 3600, percent: 14.29 },
      { name: 'CSS', total_seconds: 2400, percent: 9.52 },
      { name: 'Other', total_seconds: 1200, percent: 4.76 }
    ],
    projects: [
      { name: 'my-next-app', total_seconds: 12600, percent: 50 },
      { name: 'my-qanything-app', total_seconds: 7560, percent: 30 },
      { name: 'my-wakatime-worker', total_seconds: 5040, percent: 20 }
    ]
  };

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1500);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'bg-yellow-500',
      Python: 'bg-blue-500',
      HTML: 'bg-orange-500',
      CSS: 'bg-purple-500',
      Other: 'bg-gray-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/practice" className="text-blue-600 hover:text-blue-800">
            ← 返回练习页面
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Wakatime 统计演示
          </h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">加载统计数据中...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 总时间 */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">今日编程时间</h2>
                <div className="text-4xl font-bold text-blue-600">
                  {formatTime(stats.total_seconds)}
                </div>
              </div>
              
              {/* 语言统计 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">编程语言分布</h3>
                <div className="space-y-3">
                  {stats.languages.map((lang, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600">{lang.name}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full ${getLanguageColor(lang.name)} transition-all duration-1000`}
                            style={{ width: `${lang.percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-gray-600 text-right">
                        {formatTime(lang.total_seconds)}
                      </div>
                      <div className="w-16 text-sm text-gray-500 text-right">
                        {lang.percent.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 项目统计 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">项目时间分布</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{project.name}</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatTime(project.total_seconds)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.percent}% 的时间
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Cloudflare Worker 信息 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🚀 Cloudflare Worker 集成
                </h3>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>• 使用 Cloudflare Workers 作为代理服务</p>
                  <p>• 解决 Wakatime API 的 CORS 限制</p>
                  <p>• 无服务器架构，全球边缘计算</p>
                  <p>• 支持缓存和速率限制</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">技术要点:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cloudflare Workers 无服务器部署</li>
              <li>• API 代理和 CORS 处理</li>
              <li>• React Hooks (useState, useEffect)</li>
              <li>• 数据可视化和进度条动画</li>
              <li>• 响应式设计和加载状态</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}