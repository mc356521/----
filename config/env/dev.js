/**
 * 开发环境配置
 */
export default {
    // API基础路径
    baseUrl: 'http://103.38.83.91:8080',
    // baseUrl: 'http://localhost:8080',
    // 超时时间
    timeout: 100000,
    // 上传接口
    uploadUrl: '/api/upload',
    // WebSocket地址
    wsUrl: 'ws://localhost:8080/ws',
	// wsUrl: 'ws://103.38.83.91:8080/ws',
    // 调试模式
    debug: true,
    // 版本号
    version: '1.0.0',
    // 环境名称
    env: 'development'
};