'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            🤖 QAnything 智能助手
          </h1>
          <p className="hero-subtitle">
            基于先进AI技术的智能对话助手，为您提供准确、及时的信息服务
          </p>
          
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>智能对话</h3>
              <p>支持自然语言交互，理解上下文，提供准确回答</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>混合搜索</h3>
              <p>结合知识库和实时搜索，获取最新最准确的信息</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>实时响应</h3>
              <p>流式响应技术，实时显示回答内容，提升交互体验</p>
            </div>
          </div>
          
          <div className="cta-section">
            <div className="floating-chat-intro">
              <h3>💬 随时随地开始对话</h3>
              <p>点击右下角的悬浮按钮，即可开始与QAnything智能助手对话</p>
              <div className="intro-features">
                <div className="intro-item">
                  <span className="intro-icon">🎯</span>
                  <span>点击悬浮按钮打开聊天窗口</span>
                </div>
                <div className="intro-item">
                  <span className="intro-icon">⚙️</span>
                  <span>在设置中配置API Key和参数</span>
                </div>
                <div className="intro-item">
                  <span className="intro-icon">💡</span>
                  <span>输入问题，获得智能回答</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="info-section">
        <div className="info-content">
          <h2>技术特性</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>🔐 安全可靠</h4>
              <p>支持API Key认证，保护您的数据安全</p>
            </div>
            <div className="tech-item">
              <h4>⚙️ 灵活配置</h4>
              <p>可自定义参数，满足不同使用场景需求</p>
            </div>
            <div className="tech-item">
              <h4>📱 响应式设计</h4>
              <p>完美适配桌面和移动设备</p>
            </div>
            <div className="tech-item">
              <h4>🌐 API代理</h4>
              <p>通过代理服务确保稳定的API连接</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hero-section {
          padding: 4rem 2rem;
          text-align: center;
          color: white;
        }
        
        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #fff, #f0f8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.3rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .feature-card p {
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .cta-section {
          margin-top: 3rem;
        }
        
        .cta-button {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          background: #f8f9ff;
        }
        
        .quick-actions h4 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .action-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .floating-chat-intro {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .floating-chat-intro h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .floating-chat-intro p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .intro-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .intro-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .intro-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(5px);
        }
        
        .intro-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }
        
        .intro-item span:last-child {
          font-size: 1rem;
          font-weight: 500;
        }
        
        .info-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 3rem 2rem;
          color: white;
        }
        
        .info-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        
        .info-content h2 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .tech-item {
          text-align: left;
        }
        
        .tech-item h4 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .tech-item p {
          opacity: 0.9;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .hero-section {
            padding: 2rem 1rem;
          }
          
          .info-section {
            padding: 2rem 1rem;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .action-btn {
            width: 200px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}