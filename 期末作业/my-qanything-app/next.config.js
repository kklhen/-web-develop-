/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    // 启用应用目录
    appDir: true,
  },
  
  // 环境变量配置
  env: {
    QANYTHING_API_KEY: process.env.QANYTHING_API_KEY,
    QANYTHING_BOT_UUID: process.env.QANYTHING_BOT_UUID,
    QANYTHING_API_BASE_URL: process.env.QANYTHING_API_BASE_URL,
  },
  
  // API路由配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // 图片配置
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // 输出配置
  output: 'standalone',
  
  // 压缩配置
  compress: true,
  
  // 开发服务器配置
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // 性能配置
  poweredByHeader: false,
  
  // 严格模式
  reactStrictMode: true,
  
  // SWC配置
  swcMinify: true,
};

module.exports = nextConfig;