/**
 * 路径处理工具，用于解决不同平台上的资源路径问题
 */

/**
 * 处理图片路径，确保在不同平台上正确显示
 * @param {String} path 图片路径
 * @return {String} 处理后的路径
 */
export function handleImagePath(path) {
  // 如果路径为空，返回空字符串
  if (!path) return '';
  
  // 检查是否为网络图片（包括OSS路径）或blob URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    // 网络图片或blob URL，直接返回原路径
    return path;
  }
  
  // 判断当前运行环境
  // #ifdef APP-PLUS
  // App环境下需要根据实际情况处理路径
  if (path.startsWith('/static/')) {
    // 去掉开头的斜杠，因为在App环境下static目录的访问方式不同
    return path.substring(1);
  }
  // #endif
  
  // #ifdef H5
  // H5环境，路径保持不变
  // #endif
  
  // 确保路径以"/"或"static/"开头
  if (!path.startsWith('/') && !path.startsWith('static/')) {
    return '/static/' + path;
  }
  
  return path;
}

export default {
  handleImagePath
}; 