/**
 * 环境配置加载器
 */
import test from './test';
import dev from './dev';
import prod from './prod';

// 环境配置映射
const envConfigs = {
  development: dev,
  test: test,
  production: prod
};

// 默认开发环境
const defaultEnv = 'dev';

/**
 * 获取当前环境配置
 * @returns {Object} 环境配置对象
 */
export function getEnv() {
  // 获取当前环境
  let currentEnv = process.env.NODE_ENV || defaultEnv;
  
  // 如果是uniapp环境，使用process.env.UNI_PLATFORM获取平台
  if (process.env.UNI_PLATFORM) {
    console.log("当前平台:", process.env.UNI_PLATFORM);
  }
  
  // 获取对应环境配置
  const envConfig = envConfigs[currentEnv] || envConfigs[defaultEnv];
  
  // 添加一些运行时信息
  envConfig.runtimePlatform = process.env.UNI_PLATFORM || 'unknown';
  envConfig.actualBaseUrl = envConfig.baseUrl;
  
  // 返回最终配置
  return envConfig;
  }

// 导出默认环境配置
export default getEnv();

// 导出当前环境的配置项
const config = getEnv();
export const { baseUrl, version } = config; 