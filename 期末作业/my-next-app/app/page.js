import { Inter } from "next/font/google";
import Script from "next/script";
import FloatingChat from "../components/FloatingChat";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">欢迎来到我的网站</h1>
        <p className="text-lg text-gray-600 mb-8">这是一个基于 Next.js 构建的现代化网站</p>
        <div className="space-y-4">
          <a
            href="/practice"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看练习页面
          </a>
          <div className="mt-4 text-sm text-gray-500">
            💬 点击右下角的聊天按钮，体验重构后的 QAnything 智能助手
          </div>
        </div>
        
        {/* QAnything 新闻学智能体 - 直接嵌入 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">新闻学智能助手</h2>
          <p className="text-sm text-gray-500 mb-4">
            直接在下方与新闻学专业智能体进行交互
          </p>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src="https://ai.youdao.com/saas/qanything/#/bots/A728E8C44505434E/share"
              width="100%"
              height="600"
              frameBorder="0"
              title="新闻学智能助手"
              className="w-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            >
              您的浏览器不支持 iframe，请升级浏览器或直接访问新闻学智能助手
            </iframe>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            通过上方的 iframe 直接与新闻学智能助手交互
          </p>
        </div>
      </main>
      <FloatingChat />
    </div>
  );
}