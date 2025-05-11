/**
 * WebSocket工具类
 * 使用uni-app自带的WebSocket API
 */
import env from '@/config/env';

// WebSocket配置
const wsConfig = {
  url: env.wsUrl || 'ws://localhost:8080/ws', // 使用环境配置中的WebSocket地址
  token: '', // 身份验证token
  debug: env.debug || false, // 是否开启调试模式
  autoReconnect: true, // 是否自动重连
  reconnectInterval: 5000, // 重连间隔时间（毫秒）
  maxReconnectTimes: 5, // 最大重连次数
  heartbeat: true, // 是否发送心跳包
  heartbeatInterval: 30000, // 心跳间隔时间（毫秒）
  heartbeatContent: 'ping', // 心跳包内容
};

// 内部变量
let socketTask = null; // WebSocket任务对象
let isConnected = false; // 连接状态
let reconnectCount = 0; // 重连次数
let reconnectTimer = null; // 重连定时器
let heartbeatTimer = null; // 心跳定时器
let messageCallback = null; // 消息回调函数
let openCallback = null; // 连接打开回调函数
let closeCallback = null; // 连接关闭回调函数
let errorCallback = null; // 错误回调函数

/**
 * 初始化WebSocket配置
 * @param {Object} options 配置项
 */
function initConfig(options = {}) {
  Object.assign(wsConfig, options);
  log('WebSocket配置已初始化');
}

/**
 * 连接WebSocket服务器
 * @param {String} token 可选的身份验证token
 * @returns {SocketTask|null} WebSocket任务对象
 */
function connect(token) {
  if (isConnected && socketTask) {
    log('WebSocket已连接，无需重复连接');
    return socketTask;
  }
  
  // 如果传入token，则更新config中的token
  if (token) {
    wsConfig.token = token;
  }
  
  // 构建WebSocket URL
  const url = `${wsConfig.url}${wsConfig.token ? `?token=${wsConfig.token}` : ''}`;
  
  log(`正在连接WebSocket: ${url}`);
  
  try {
    // 创建WebSocket连接
    socketTask = uni.connectSocket({
      url: url,
      success: () => {
        log('WebSocket连接创建成功');
      },
      fail: (err) => {
        log('WebSocket连接创建失败', err);
        handleError(err);
      },
      complete: () => {}
    });
    
    // 监听WebSocket连接打开事件
    socketTask.onOpen((res) => {
      isConnected = true;
      reconnectCount = 0;
      log('WebSocket连接已打开', res);
      
      // 开启心跳检测
      if (wsConfig.heartbeat) {
        startHeartbeat();
      }
      
      // 调用连接打开回调
      if (openCallback) {
        openCallback(res);
      }
    });
    
    // 监听WebSocket接收到服务器的消息事件
    socketTask.onMessage((res) => {
      log('收到WebSocket消息', res.data);
      
      // 如果是心跳响应，不触发消息回调
      if (res.data === 'pong' && wsConfig.heartbeat) {
        return;
      }
      
      // 调用消息回调
      if (messageCallback) {
        messageCallback(res.data);
      }
    });
    
    // 监听WebSocket连接关闭事件
    socketTask.onClose((res) => {
      isConnected = false;
      socketTask = null;
      log('WebSocket连接已关闭', res);
      
      // 清除心跳定时器
      clearTimeout(heartbeatTimer);
      
      // 调用连接关闭回调
      if (closeCallback) {
        closeCallback(res);
      }
      
      // 自动重连
      if (wsConfig.autoReconnect) {
        reconnect();
      }
    });
    
    // 监听WebSocket错误事件
    socketTask.onError((err) => {
      log('WebSocket连接错误', err);
      
      // 调用错误回调
      if (errorCallback) {
        errorCallback(err);
      }
    });
    
    return socketTask;
  } catch (e) {
    console.error('创建WebSocket连接异常', e);
    return null;
  }
}

/**
 * 发送WebSocket消息
 * @param {String|Object|ArrayBuffer} data 消息内容
 * @returns {Boolean} 是否发送成功
 */
function send(data) {
  if (!isConnected || !socketTask) {
    log('WebSocket未连接，无法发送消息');
    return false;
  }
  
  // 如果data是对象，则转换为JSON字符串
  let sendData = data;
  if (typeof data === 'object' && !(data instanceof ArrayBuffer) && data !== null) {
    sendData = JSON.stringify(data);
  }
  
  log('发送WebSocket消息', sendData);
  
  socketTask.send({
    data: sendData,
    success: () => {
      log('WebSocket消息发送成功');
    },
    fail: (err) => {
      log('WebSocket消息发送失败', err);
    }
  });
  
  return true;
}

/**
 * 关闭WebSocket连接
 * @param {Number} code 关闭码
 * @param {String} reason 关闭原因
 * @returns {Boolean} 是否关闭成功
 */
function close(code = 1000, reason = '主动关闭连接') {
  if (!socketTask || !isConnected) {
    log('WebSocket未连接，无法关闭');
    return false;
  }
  
  // 清除定时器
  clearTimeout(reconnectTimer);
  clearTimeout(heartbeatTimer);
  
  log(`正在关闭WebSocket连接: code=${code}, reason=${reason}`);
  
  socketTask.close({
    code: code,
    reason: reason,
    success: () => {
      log('WebSocket连接已关闭');
      isConnected = false;
      socketTask = null;
    },
    fail: (err) => {
      log('WebSocket关闭失败', err);
    }
  });
  
  return true;
}

/**
 * 设置消息接收回调
 * @param {Function} callback 回调函数
 */
function onMessage(callback) {
  if (typeof callback === 'function') {
    messageCallback = callback;
  }
}

/**
 * 设置连接打开回调
 * @param {Function} callback 回调函数
 */
function onOpen(callback) {
  if (typeof callback === 'function') {
    openCallback = callback;
  }
}

/**
 * 设置连接关闭回调
 * @param {Function} callback 回调函数
 */
function onClose(callback) {
  if (typeof callback === 'function') {
    closeCallback = callback;
  }
}

/**
 * 设置错误回调
 * @param {Function} callback 回调函数
 */
function onError(callback) {
  if (typeof callback === 'function') {
    errorCallback = callback;
  }
}

/**
 * 重连WebSocket
 */
function reconnect() {
  if (reconnectCount >= wsConfig.maxReconnectTimes) {
    log(`WebSocket重连次数已达上限(${wsConfig.maxReconnectTimes}次)，停止重连`);
    return;
  }
  
  reconnectCount++;
  
  log(`WebSocket ${reconnectCount}秒后尝试第${reconnectCount}次重连...`);
  
  // 清除之前的重连定时器
  clearTimeout(reconnectTimer);
  
  // 设置重连定时器
  reconnectTimer = setTimeout(() => {
    log(`正在进行第${reconnectCount}次重连...`);
    connect();
  }, wsConfig.reconnectInterval);
}

/**
 * 开始心跳检测
 */
function startHeartbeat() {
  clearTimeout(heartbeatTimer);
  
  heartbeatTimer = setTimeout(() => {
    if (isConnected) {
      log('发送心跳包', wsConfig.heartbeatContent);
      send(wsConfig.heartbeatContent);
    }
    
    // 继续下一次心跳
    startHeartbeat();
  }, wsConfig.heartbeatInterval);
}

/**
 * 处理错误
 * @param {Object} err 错误对象
 */
function handleError(err) {
  console.error('WebSocket错误:', err);
}

/**
 * 日志输出
 * @param {String} message 日志消息
 * @param {Object} data 日志数据
 */
function log(message, data) {
  if (wsConfig.debug) {
    if (data) {
      console.log(`[WebSocket] ${message}`, data);
    } else {
      console.log(`[WebSocket] ${message}`);
    }
  }
}

/**
 * 获取WebSocket连接状态
 * @returns {Boolean} 是否已连接
 */
function isSocketConnected() {
  return isConnected;
}

/**
 * 获取当前WebSocket任务对象
 * @returns {SocketTask|null} WebSocket任务对象
 */
function getSocketTask() {
  return socketTask;
}

export default {
  initConfig,
  connect,
  send,
  close,
  onMessage,
  onOpen,
  onClose,
  onError,
  isConnected: isSocketConnected,
  getSocketTask
}; 