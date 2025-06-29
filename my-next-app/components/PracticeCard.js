"use client";

import { useState } from 'react';

export default function PracticeCard({ type, title, description }) {
  // 声明收藏状态变量和更新函数
  const [isFavorited, setIsFavorited] = useState(false);

  // 创建事件处理函数，用于切换收藏状态
  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="w-full h-64 bg-black border-4 border-purple-500 rounded-lg p-4 shadow-lg transition-transform hover:scale-105">
      <div className="flex justify-between items-start">
        <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
        <button
          onClick={handleFavoriteClick}
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
      </div>
    </div>
  );
}