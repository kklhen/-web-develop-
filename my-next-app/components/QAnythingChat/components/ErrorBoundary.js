import React from 'react';
import { UI_CONSTANTS, ERROR_MESSAGES } from '../constants/index';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('聊天组件错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 可以在这里添加错误报告服务
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // 自定义的错误 UI
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: UI_CONSTANTS.COLORS.SURFACE,
          border: `1px solid ${UI_CONSTANTS.COLORS.ERROR}`,
          borderRadius: '8px',
          margin: '10px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>😵</div>
          
          <h3 style={{
            color: UI_CONSTANTS.COLORS.ERROR,
            marginBottom: '12px',
            fontSize: '18px'
          }}>
            聊天组件出现错误
          </h3>
          
          <p style={{
            color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {ERROR_MESSAGES.GENERAL_ERROR}
          </p>
          
          <button
            onClick={this.handleRetry}
            style={{
              backgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = UI_CONSTANTS.COLORS.SECONDARY;
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = UI_CONSTANTS.COLORS.PRIMARY;
            }}
          >
            重试
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '20px',
              textAlign: 'left',
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                错误详情 (开发模式)
              </summary>
              <pre style={{
                marginTop: '10px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;