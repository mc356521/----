/**
 * 路径处理工具，用于解决不同平台上的资源路径问题
 */

/**
 * 判断是否是OSS或CDN的URL
 * @param {string} url 图片URL
 * @returns {boolean} 是否为OSS或CDN链接
 */
export function isOssOrCdnUrl(url) {
  if (!url) return false;
  // 判断是否包含OSS或CDN的域名
  return url.includes('oss-') || url.includes('cdn') || url.includes('aliyuncs.com');
}

/**
 * 处理图片路径，确保在不同平台上正确显示
 * @param {String} path 图片路径
 * @return {String} 处理后的路径
 */
export function handleImagePath(path) {
  // 如果路径为空，返回默认图片
  if (!path) {
    return '/static/image/default.png';
  }

  // 如果是完整的网络URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://') || isOssOrCdnUrl(path)) {
    return path;
  }

  // 检测当前平台
  // #ifdef APP-PLUS
  // APP环境下去掉路径开头的斜杠
  if (path.startsWith('/')) {
    return path.substring(1);
  }
  // #endif

  // 其他环境直接返回
  return path;
}

/**
 * 获取页面参数(兼容多平台)
 * @returns {Object} 页面参数对象
 */
export function getPageParams() {
  // 获取当前系统信息
  const sysInfo = uni.getSystemInfoSync();
  const platform = sysInfo.platform;
  
  let query = {};
  
  try {
    // H5环境
    if (platform === 'web' || platform === 'h5') {
      // 从URL中获取参数
      const queryString = window.location.search.substring(1);
      const pairs = queryString.split('&');
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        if (pair.length === 2) {
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
      }
    } else {
      // 非H5环境通过getCurrentPages获取
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      
      // 方式1: 直接从options获取
      if (currentPage && currentPage.options) {
        query = {...currentPage.options};
      } 
      // 方式2: 从$page.fullPath中解析
      else if (currentPage && currentPage.$page && currentPage.$page.fullPath) {
        const fullPath = currentPage.$page.fullPath;
        const queryIndex = fullPath.indexOf('?');
        
        if (queryIndex > -1) {
          const queryPart = fullPath.substring(queryIndex + 1);
          const queryParams = queryPart.split('&');
          
          for (let param of queryParams) {
            const [key, value] = param.split('=');
            if (key && value) {
              query[key] = decodeURIComponent(value);
            }
          }
        }
      }
      // 方式3: 从route中获取
      else if (currentPage && currentPage.route && currentPage.__displayReporter) {
        query = currentPage.__displayReporter.query || {};
      }
      // 方式4: 从$mp中获取(小程序环境)
      else if (currentPage && currentPage.$mp && currentPage.$mp.query) {
        query = {...currentPage.$mp.query};
      }
    }
  } catch (error) {
    console.error('获取页面参数出错:', error);
  }
  
  return query;
}

export default {
  handleImagePath,
  getPageParams
}; 