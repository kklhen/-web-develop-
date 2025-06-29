'use client';

export default function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>关于 QAnything 智能助手</h1>
        <p>这是一个基于 QAnything API 的智能对话助手应用。</p>
        
        <div className="about-section">
          <h2>🎯 项目特色</h2>
          <ul>
            <li>悬浮聊天窗口，随时随地开始对话</li>
            <li>流式响应，实时显示AI回答</li>
            <li>支持混合搜索和网络搜索</li>
            <li>响应式设计，完美适配各种设备</li>
            <li>安全的API代理服务</li>
          </ul>
        </div>
        
        <div className="about-section">
          <h2>🛠️ 技术栈</h2>
          <ul>
            <li>Next.js 14 - React 全栈框架</li>
            <li>Express.js - 后端API服务</li>
            <li>QAnything API - 智能对话服务</li>
            <li>CSS3 - 现代样式设计</li>
          </ul>
        </div>
        
        <div className="about-section">
          <h2>💡 使用说明</h2>
          <p>点击右下角的悬浮按钮即可打开聊天窗口，开始与AI助手对话。</p>
          <p>在设置中配置您的API Key和其他参数，享受个性化的对话体验。</p>
        </div>
        
        <div className="navigation">
          <a href="/" className="nav-link">← 返回首页</a>
        </div>
      </div>
      
      <style jsx>{`
        .about-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          color: white;
        }
        
        .about-content {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 3rem;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
          background: linear-gradient(45deg, #fff, #f0f8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .about-content > p {
          font-size: 1.2rem;
          text-align: center;
          margin-bottom: 3rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .about-section {
          margin-bottom: 2.5rem;
        }
        
        .about-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .about-section ul {
          list-style: none;
          padding: 0;
        }
        
        .about-section li {
          padding: 0.75rem 0;
          padding-left: 1.5rem;
          position: relative;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .about-section li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4ade80;
          font-weight: bold;
        }
        
        .about-section p {
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .navigation {
          text-align: center;
          margin-top: 3rem;
        }
        
        .nav-link {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 1rem 2rem;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .about-container {
            padding: 1rem;
          }
          
          .about-content {
            padding: 2rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .about-content > p {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}