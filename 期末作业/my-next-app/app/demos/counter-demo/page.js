'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CounterDemo() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/practice" className="text-blue-600 hover:text-blue-800">
            ← 返回练习页面
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            React 计数器演示
          </h1>
          
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-blue-600">
              {count}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-4">
                <label className="text-gray-700">步长:</label>
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                  className="border rounded px-3 py-1 w-20 text-center"
                  min="1"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setCount(count - step)}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  - {step}
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  重置
                </button>
                <button
                  onClick={() => setCount(count + step)}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  + {step}
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">技术要点:</h3>
              <ul className="text-left text-sm text-gray-600 space-y-1">
                <li>• 使用 useState Hook 管理状态</li>
                <li>• 事件处理和状态更新</li>
                <li>• 受控组件（输入框）</li>
                <li>• 条件渲染和动态样式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}