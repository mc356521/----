/**
 * 生产环境配置
 */
export default {
  // API基础路径
  baseUrl: 'http://103.38.83.91:8080',
  // 超时时间
  timeout: 30000,
  // 上传接口
  uploadUrl: '/api/upload',
  // WebSocket地址
  wsUrl: 'wss://api.example.com/ws',
  // 调试模式
  debug: false,
  // 版本号
  version: '1.0.0',
  // 环境名称
  env: 'production'
}; 