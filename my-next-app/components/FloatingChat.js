'use client';

import React, { useState } from 'react';
import QAnythingChat from './QAnythingChat';
import { UI_CONSTANTS } from './QAnythingChat/constants/index';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    background: UI_CONSTANTS.GRADIENTS.PURPLE_BLUE,
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '400px',
    height: '600px',
    zIndex: 999,
    animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in'
  };

  return (
    <>
      {/* 浮动聊天按钮 */}
      <button
        onClick={toggleChat}
        style={buttonStyle}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
        title={isOpen ? '关闭聊天' : '打开聊天'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div style={chatWindowStyle}>
          <QAnythingChat />
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingChat;