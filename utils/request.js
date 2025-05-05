/**
 * 网络请求工具函数
 */
import { getEnv } from '@/config/env';

// 获取当前环境配置
const env = getEnv();

// 调试输出环境配置
if (env.debug) {
  console.log('当前API环境配置:', env);
  console.log('API基础路径:', env.baseUrl);
  if (env.actualBaseUrl) {
    console.log('实际API地址:', env.actualBaseUrl);
  }
}

// 存储token的key
const TOKEN_KEY = 'auth_token';

/**
 * 获取本地存储的token
 * @returns {String} token字符串
 */
const getToken = () => {
  return uni.getStorageSync(TOKEN_KEY) || '';
};

/**
 * 设置token到本地存储
 * @param {String} token - 要存储的token
 */
const setToken = (token) => {
  uni.setStorageSync(TOKEN_KEY, token);
};

/**
 * 请求拦截器
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的请求配置
 */
const requestInterceptor = (config) => {
  // 添加token到请求头
  const token = getToken();
  if (token) {
    // 直接使用token，不进行额外的编码
    config.header['Authorization'] = `Bearer ${token}`;
  }
  
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
  // 请求成功
  if (response.statusCode === 200) {
    // 仅处理登录接口的token
    if (response.config && response.config.url && 
        (response.config.url.includes('/users/login') || response.config.url.includes('/user/login'))) {
      // 登录接口直接返回data
      if (response.data && response.data.data) {
        setToken(response.data.data);
        if (env.debug) {
          console.log('已保存token:', response.data.data);
        }
        return Promise.resolve(response.data);
      }
    }
    
    // 直接返回响应数据，不做解包处理
    return Promise.resolve(response.data);
  } 
  // HTTP 状态码错误
  else {
    const errorMsg = `请求失败: ${response.statusCode}`;
    
    // 显示错误提示
    uni.showToast({
      title: errorMsg,
      icon: 'none'
    });
    
    // 对特定状态码做特殊处理
    if (response.statusCode === 401 || response.statusCode === 403) {
      // 清除本地token
      setToken('');
      
      // 跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
    
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
    timeout: options.timeout || env.timeout || 60000
  };

  // 将GET请求参数处理到URL
  if (config.method === 'GET' && Object.keys(config.params).length > 0) {
    const queryString = Object.keys(config.params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`)
      .join('&');
    
    config.url = `${config.url}${config.url.includes('?') ? '&' : '?'}${queryString}`;
  }

  if (env.debug) {
    console.log(`${config.method} 请求:`, config.url);
    if (config.data && Object.keys(config.data).length > 0) {
      console.log('请求数据:', config.data);
    }
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
        if (env.debug) {
          console.log('响应数据:', res);
        }
        
        // 将原始请求配置附加到响应对象
        res.config = interceptedConfig;
        
        // 响应拦截
        responseInterceptor(res)
          .then(data => resolve(data))
          .catch(error => reject(error));
      },
      fail: (err) => {
        if (env.debug) {
          console.error('请求失败:', err);
        }
        
        uni.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        });
        reject(new Error('网络请求失败'));
      }
    });
  });
};

// 导出请求函数和token相关工具
export default request;
export {
  getToken,
  setToken
}; 