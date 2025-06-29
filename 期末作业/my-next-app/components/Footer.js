'use client';

import { useState, useEffect } from 'react';

const Footer = () => {
  const [wakatimeData, setWakatimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWakatimeData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://wakatime-api-proxy.weixinshi74.workers.dev/api');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setWakatimeData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Wakatime data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWakatimeData();
  }, []);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '0 hrs 0 mins';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours} hrs ${minutes} mins`;
  };

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">编程统计</h3>
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm text-gray-300">加载中...</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-sm">
                <span>⚠️ 无法加载统计数据: {error}</span>
              </div>
            )}
            
            {wakatimeData && !loading && !error && (
              <div className="space-y-1">
                <div className="text-sm text-gray-300">
                  总编程时间: <span className="text-blue-400 font-mono">
                    {formatTime(wakatimeData.data?.total_seconds)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  数据来源: Wakatime
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center md:text-right">
            <div className="text-sm text-gray-300 mb-1">
              © 2024 我的开发项目
            </div>
            <div className="text-xs text-gray-400">
              使用 Next.js 构建 | Powered by Cloudflare Workers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;