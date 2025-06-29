import './globals.css';

export const metadata = {
  title: 'QAnything 智能助手',
  description: '基于QAnything API的智能对话助手',
  keywords: 'QAnything, AI, 智能助手, 对话, API',
  authors: [{ name: 'QAnything Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

import QAnythingFloatingChat from '../components/QAnythingFloatingChat';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <QAnythingFloatingChat />
      </body>
    </html>
  );
}