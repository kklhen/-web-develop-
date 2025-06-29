'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // 将错误信息发送到日志服务
    console.error('错误详情:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">出错了！</h2>
        <p className="text-gray-600 mb-6">
          {error.message || '加载数据时发生错误，请稍后再试。'}
        </p>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          重试
        </button>
      </div>
    </main>
  );
}