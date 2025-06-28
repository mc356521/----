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
const TOKEN_KEY = 'token';

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

const checkNetwork = () => {
    return new Promise((resolve, reject) => {
        uni.getNetworkType({
            success: (res) => {
                if (res.networkType === 'none') {
                    uni.showToast({ title: '网络不可用', icon: 'none' });
                    reject(new Error('NETWORK_UNAVAILABLE'));
                } else {
                    resolve();
                }
            },
            fail: () => reject(new Error('NETWORK_CHECK_FAILED'))
        });
    });
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
        // 不要对token进行编码，直接使用Bearer格式
        config.header['Authorization'] = `Bearer ${token}`;
        if (env.debug) {
            console.log('发送请求头Authorization:', `Bearer ${token}`);
        }
    }

    // 默认添加内容类型
    if (!config.header['Content-Type']) {
        config.header['Content-Type'] = 'application/json';
    }

    // 输出完整请求信息用于调试
    if (env.debug) {
        console.log('完整请求配置:', {
            url: config.url,
            method: config.method,
            headers: config.header,
            data: config.data,
            params: config.params
        });

        // 针对特定接口添加额外日志
        if (config.url.includes('/users/register')) {
            console.log('注册请求完整数据:', JSON.stringify(config.data));
            console.log('注册请求Content-Type:', config.header['Content-Type']);
        }
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
            if (response.data && response.data.data && typeof response.data.data === 'string') {
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

        // 打印更多错误信息
        if (env.debug) {
            console.error('请求失败状态码:', response.statusCode);
            console.error('请求地址:', response.config.url);
            console.error('请求方法:', response.config.method);
            console.error('请求头:', response.config.header);
            console.error('请求数据:', response.config.data);
            console.error('响应数据:', response.data);
        }

        // 针对400错误，记录更详细的信息
        if (response.statusCode === 400) {
            console.error('400错误详情:', response.data);
            console.error('请求的原始数据:', response.config.data);
        }

        // 显示错误提示
        uni.showToast({
            title: errorMsg,
            icon: 'none'
        });

        // 对特定状态码做特殊处理
        if (response.statusCode === 401 || response.statusCode === 403) {
            // 清除本地token
            setToken('');

            // 更新全局登录状态
            const app = getApp();
            if (app && app.globalData) {
                app.globalData.isLoggedIn = false;
                console.log('收到401/403错误，已清除登录状态');
            }

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

const normalizeUrl = (url) => {
    if (/^https?:\/\//i.test(url)) return url;

    const base = env.baseUrl.endsWith('/') ?
        env.baseUrl.slice(0, -1) :
        env.baseUrl;

    const path = url.startsWith('/') ? url : `/${url}`;

    return `${base}${path}`;
};

/**
 * 统一请求函数
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求Promise
 */
const request = async(options) => {
    try {
        await checkNetwork(); // 先检查网络
    } catch (error) {
        return Promise.reject(error);
    }

    // 合并基础配置和请求参数
    const config = {
        url: options.url || '',
        method: options.method || 'GET',
        data: options.data || {},
        params: options.params || {},
        header: options.header || {},
        timeout: options.timeout || env.timeout || 15000,
        sslVerify: env.sslVerify !== false, // 环境控制SSL验证
        enableCache: false // 明确禁用缓存
    };

    // 针对Android的特殊处理
    // #ifdef APP-PLUS
    if (plus.os.name === 'Android') {
        config.sslVerify = false; // Android可能需要关闭SSL验证
    }
    // #endif

    // 处理URL地址
    config.url = normalizeUrl(options.url);

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
            sslVerify: interceptedConfig.sslVerify,
            enableCache: interceptedConfig.enableCache,
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
                const errorMap = {
                    'request:fail abort statusCode:-1': '网络连接已中断',
                    'request:fail timeout': '请求超时',
                    'request:fail ssl handshake error': 'SSL证书验证失败'
                };

                const userMsg = errorMap[err.errMsg] || '网络请求失败';

                uni.showToast({
                    title: userMsg,
                    icon: 'none',
                    duration: 3000
                });

                if (env.debug) {
                    console.error('完整错误对象:', {
                        errMsg: err.errMsg,
                        config: interceptedConfig,
                        systemInfo: uni.getSystemInfoSync()
                    });
                }

                reject(new Error(err.errMsg));
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