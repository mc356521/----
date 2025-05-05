/**
 * 网络请求工具函数
 */
import { getEnv } from '@/config/env';

// 获取当前环境配置
const env = getEnv();

/**
 * 请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的请求配置
 */
const requestInterceptor = (config) => {
  // 这里可以添加通用请求头，如token等
  // 示例: config.header.Authorization = 'Bearer xxx';
  
  // 默认添加内容类型
  if (!config.header['Content-Type']) {
    config.header['Content-Type'] = 'application/json';
  }
  
  return config;
};

/**
 * 响应拦截器
 * @param {Object} response - 响应数据
 * @returns {Promise} 处理后的响应Promise
 */
const responseInterceptor = (response) => {
  // 请求成功，但业务状态可能失败
  if (response.statusCode === 200) {
    // API 返回格式统一为 { code, data, message }
    const { code, data, message } = response.data;
    
    // 成功
    if (code === 0 || code === 200) {
      return Promise.resolve(data);
    } 
    // token 失效，需要重新登录
    else if (code === 401) {
      // 显示错误提示
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      
      // 可以在这里处理登录失效逻辑
      // 例如跳转到登录页
      uni.navigateTo({
        url: '/pages/login/login'
      });
      
      return Promise.reject(new Error(message || '登录已过期，请重新登录'));
    } 
    // 其他业务错误
    else {
      // 显示错误提示
      uni.showToast({
        title: message || '请求失败',
        icon: 'none'
      });
      
      return Promise.reject(new Error(message || '请求失败'));
    }
  } 
  // HTTP 状态码错误
  else {
    // 显示错误提示
    uni.showToast({
      title: `请求失败: ${response.statusCode}`,
      icon: 'none'
    });
    
    return Promise.reject(new Error(`HTTP错误: ${response.statusCode}`));
  }
};

/**
 * 统一请求函数
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求Promise
 */
const request = (options) => {
  // 合并基础配置和请求参数
  const config = {
    url: options.url.startsWith('http') ? options.url : env.baseUrl + options.url,
    method: options.method || 'GET',
    data: options.data || {},
    params: options.params || {},
    header: options.header || {},
    timeout: options.timeout || 60000
  };

  // 将GET请求参数处理到URL
  if (config.method === 'GET' && Object.keys(config.params).length > 0) {
    const queryString = Object.keys(config.params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`)
      .join('&');
    
    config.url = `${config.url}${config.url.includes('?') ? '&' : '?'}${queryString}`;
  }

  // 请求拦截
  const interceptedConfig = requestInterceptor(config);

  // 返回Promise
  return new Promise((resolve, reject) => {
    uni.request({
      url: interceptedConfig.url,
      method: interceptedConfig.method,
      data: interceptedConfig.data,
      header: interceptedConfig.header,
      timeout: interceptedConfig.timeout,
      success: (res) => {
        // 响应拦截
        responseInterceptor(res)
          .then(data => resolve(data))
          .catch(error => reject(error));
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        });
        reject(new Error('网络请求失败'));
      }
    });
  });
};

export default request; 