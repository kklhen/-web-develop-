'use client';

import PracticeCard from '../../components/PracticeCard';
import QAnythingChat from '../../components/QAnythingChat';

export default function Practice() {
  return (
    <>
      <main className="min-h-screen p-4 sm:p-8 md:p-24">
        <h1 className="text-3xl font-bold text-center mb-8 md:mb-12">Web开发练习</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <PracticeCard type="html" title="HTML" description="学习HTML基础，构建网页结构" />
          <PracticeCard type="css" title="CSS" description="掌握CSS样式，美化页面设计" />
          <PracticeCard type="react" title="React" description="探索React组件，构建交互界面" />
          <PracticeCard type="nextjs" title="Next.js" description="学习Next.js框架，开发现代应用" />
        </div>
        <div className="text-center mt-8 text-sm text-gray-500">
          💬 有学习问题？点击右下角的 QAnything 智能助手获取帮助
        </div>
      </main>
      <QAnythingChat />
    </>
  );
}