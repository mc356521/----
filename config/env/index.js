/**
 * 环境配置文件
 * 根据不同环境导出不同配置
 */
import devConfig from './dev';
import testConfig from './test';
import prodConfig from './prod';

// 当前环境
// 可以通过 process.env.NODE_ENV 区分不同环境
// 也可以通过编译时注入的环境变量区分
const ENV = process.env.NODE_ENV || 'development';

/**
 * 获取当前环境配置
 * @returns {Object} 环境配置对象
 */
export const getEnv = () => {
  switch (ENV) {
    case 'development':
      return devConfig;
    case 'test':
      return testConfig;
    case 'production':
      return prodConfig;
    default:
      return devConfig;
  }
};

export default {
  getEnv
}; 