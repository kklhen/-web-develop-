import React, { memo } from 'react';
import { UI_CONSTANTS } from '../constants/index';

const LoadingIndicator = memo(({ message = "AI正在思考中..." }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '16px',
    animation: UI_CONSTANTS.ANIMATIONS.FADE_IN
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: UI_CONSTANTS.COLORS.SECONDARY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    marginRight: '8px',
    flexShrink: 0
  };

  const bubbleStyle = {
    backgroundColor: UI_CONSTANTS.COLORS.SURFACE,
    border: `1px solid ${UI_CONSTANTS.COLORS.BACKGROUND}`,
    borderRadius: '18px 18px 18px 4px',
    padding: '12px 16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const dotsStyle = {
    display: 'flex',
    gap: '4px'
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
    animation: 'pulse 1.4s ease-in-out infinite both'
  };

  const textStyle = {
    fontSize: '14px',
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginLeft: '8px'
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        🤖
      </div>
      
      <div style={bubbleStyle}>
        <div style={dotsStyle}>
          <div 
            style={{
              ...dotStyle,
              animationDelay: '-0.32s'
            }} 
          />
          <div 
            style={{
              ...dotStyle,
              animationDelay: '-0.16s'
            }} 
          />
          <div style={dotStyle} />
        </div>
        
        <span style={textStyle}>
          {message}
        </span>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;