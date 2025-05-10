import { getEnv } from '@/config/env';

/**
 * WebSocket连接状态枚举
 */
export const WebSocketState = {
  CONNECTING: 0, // 连接中
  OPEN: 1,       // 已连接
  CLOSING: 2,    // 关闭中
  CLOSED: 3      // 已关闭
};

/**
 * WebSocket连接管理类
 */
class WebSocketManager {
  constructor() {
    this.env = getEnv();
    this.socketTask = null;     // WebSocket实例
    this.url = this.env.wsUrl;  // WebSocket服务器地址
    this.isConnected = false;   // 连接状态
    this.reconnectCount = 0;    // 重连次数
    this.reconnectTimer = null; // 重连定时器
    this.heartbeatTimer = null; // 心跳定时器
    this.maxReconnectCount = 5; // 最大重连次数
    this.reconnectInterval = 3000; // 重连间隔(ms)
    this.heartbeatInterval = 30000; // 心跳间隔(ms)
    
    // 消息监听器
    this.messageListeners = {};
    
    // 连接状态变化监听器
    this.stateChangeListeners = [];
  }

  /**
   * 创建WebSocket连接
   * @param {String} url - 可选，自定义WebSocket地址
   * @param {Object} header - 可选，请求头
   * @param {Object} protocols - 可选，子协议数组
   * @returns {Promise} 连接结果
   */
  connect(url = '', header = {}, protocols = []) {
    // 如果当前已有连接，先关闭
    if (this.socketTask && this.isConnected) {
      this.close();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = url || this.url;
        if (!wsUrl) {
          throw new Error('WebSocket URL不能为空');
        }
        
        // 使用UniApp提供的connectSocket API
        this.socketTask = uni.connectSocket({
          url: wsUrl,
          header,
          protocols,
          success: () => {
            if (this.env.debug) {
              console.log('WebSocket连接创建成功');
            }
          },
          fail: (error) => {
            if (this.env.debug) {
              console.error('WebSocket连接创建失败', error);
            }
            reject(error);
          }
        });
        
        // 监听WebSocket连接打开
        this.socketTask.onOpen((res) => {
          this.isConnected = true;
          this.reconnectCount = 0;
          this._notifyStateChange(WebSocketState.OPEN);
          
          // 开始心跳检测
          this._startHeartbeat();
          
          if (this.env.debug) {
            console.log('WebSocket连接已打开', res);
          }
          resolve(res);
        });
        
        // 监听WebSocket错误
        this.socketTask.onError((error) => {
          this.isConnected = false;
          this._notifyStateChange(WebSocketState.CLOSED);
          
          if (this.env.debug) {
            console.error('WebSocket连接错误', error);
          }
          
          // 尝试重新连接
          this._reconnect();
          reject(error);
        });
        
        // 监听WebSocket关闭
        this.socketTask.onClose((res) => {
          this.isConnected = false;
          this._notifyStateChange(WebSocketState.CLOSED);
          
          if (this.env.debug) {
            console.log('WebSocket连接已关闭', res);
          }
          
          // 意外关闭时尝试重新连接
          if (res.code !== 1000) { // 1000是正常关闭的状态码
            this._reconnect();
          }
        });
        
        // 监听WebSocket接收到服务器的消息
        this.socketTask.onMessage((res) => {
          if (this.env.debug) {
            console.log('WebSocket收到消息', res);
          }
          
          // 处理收到的消息
          this._handleMessage(res.data);
        });
        
      } catch (error) {
        if (this.env.debug) {
          console.error('WebSocket连接异常', error);
        }
        reject(error);
      }
    });
  }
  
  /**
   * 关闭WebSocket连接
   * @param {Number} code - 关闭码
   * @param {String} reason - 关闭原因
   * @returns {Promise} 关闭结果
   */
  close(code = 1000, reason = '用户主动关闭') {
    return new Promise((resolve, reject) => {
      if (!this.socketTask || !this.isConnected) {
        resolve({ code: 0, reason: '连接已关闭' });
        return;
      }
      
      // 清除定时器
      this._clearTimers();
      
      try {
        this._notifyStateChange(WebSocketState.CLOSING);
        this.socketTask.close({
          code,
          reason,
          success: (res) => {
            this.isConnected = false;
            this.socketTask = null;
            if (this.env.debug) {
              console.log('WebSocket关闭成功', res);
            }
            resolve(res);
          },
          fail: (error) => {
            if (this.env.debug) {
              console.error('WebSocket关闭失败', error);
            }
            reject(error);
          }
        });
      } catch (error) {
        if (this.env.debug) {
          console.error('WebSocket关闭异常', error);
        }
        reject(error);
      }
    });
  }
  
  /**
   * 发送消息到服务器
   * @param {Object|String} data - 要发送的数据
   * @param {String} type - 消息类型(可选)
   * @returns {Promise} 发送结果
   */
  send(data, type = '') {
    return new Promise((resolve, reject) => {
      if (!this.socketTask || !this.isConnected) {
        reject(new Error('WebSocket未连接'));
        return;
      }
      
      let message = data;
      
      // 如果传入的是对象，则转为JSON字符串
      if (typeof data === 'object') {
        // 添加消息类型
        if (type) {
          message = {
            type,
            ...data
          };
        }
        message = JSON.stringify(message);
      }
      
      try {
        this.socketTask.send({
          data: message,
          success: (res) => {
            if (this.env.debug) {
              console.log('WebSocket消息发送成功', message);
            }
            resolve(res);
          },
          fail: (error) => {
            if (this.env.debug) {
              console.error('WebSocket消息发送失败', error);
            }
            reject(error);
          }
        });
      } catch (error) {
        if (this.env.debug) {
          console.error('WebSocket消息发送异常', error);
        }
        reject(error);
      }
    });
  }
  
  /**
   * 添加消息监听器
   * @param {String} type - 消息类型
   * @param {Function} callback - 回调函数
   */
  on(type, callback) {
    if (!this.messageListeners[type]) {
      this.messageListeners[type] = [];
    }
    this.messageListeners[type].push(callback);
  }
  
  /**
   * 移除消息监听器
   * @param {String} type - 消息类型
   * @param {Function} callback - 回调函数，不传则移除该类型的所有监听器
   */
  off(type, callback) {
    if (!this.messageListeners[type]) {
      return;
    }
    
    if (!callback) {
      // 不指定回调则清空该类型的所有监听器
      this.messageListeners[type] = [];
    } else {
      // 移除指定的回调函数
      const index = this.messageListeners[type].indexOf(callback);
      if (index !== -1) {
        this.messageListeners[type].splice(index, 1);
      }
    }
  }
  
  /**
   * 添加状态变化监听器
   * @param {Function} callback - 回调函数
   */
  onStateChange(callback) {
    if (typeof callback === 'function') {
      this.stateChangeListeners.push(callback);
    }
  }
  
  /**
   * 移除状态变化监听器
   * @param {Function} callback - 回调函数，不传则移除所有状态监听器
   */
  offStateChange(callback) {
    if (!callback) {
      this.stateChangeListeners = [];
    } else {
      const index = this.stateChangeListeners.indexOf(callback);
      if (index !== -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    }
  }
  
  /**
   * 获取当前连接状态
   * @returns {Number} 连接状态
   */
  getState() {
    if (!this.socketTask) {
      return WebSocketState.CLOSED;
    }
    return this.socketTask.readyState || (this.isConnected ? WebSocketState.OPEN : WebSocketState.CLOSED);
  }
  
  /**
   * 处理接收到的消息
   * @private
   * @param {String} data - 消息数据
   */
  _handleMessage(data) {
    let message;
    try {
      // 尝试解析JSON
      message = JSON.parse(data);
    } catch (e) {
      // 不是JSON，使用原始数据
      message = data;
    }
    
    // 如果是心跳响应消息，则不触发业务处理
    if (message && message.type === 'heartbeat') {
      if (this.env.debug) {
        console.log('收到心跳响应');
      }
      return;
    }
    
    // 触发默认消息监听器
    this._notifyMessageListeners('message', message);
    
    // 如果是对象且有type字段，则触发对应类型的监听器
    if (message && typeof message === 'object' && message.type) {
      this._notifyMessageListeners(message.type, message);
    }
  }
  
  /**
   * 通知消息监听器
   * @private
   * @param {String} type - 消息类型
   * @param {Object} message - 消息内容
   */
  _notifyMessageListeners(type, message) {
    const listeners = this.messageListeners[type];
    if (listeners && listeners.length > 0) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (e) {
          console.error(`WebSocket消息监听器错误(${type})`, e);
        }
      });
    }
  }
  
  /**
   * 通知状态变化监听器
   * @private
   * @param {Number} state - 连接状态
   */
  _notifyStateChange(state) {
    if (this.stateChangeListeners.length > 0) {
      this.stateChangeListeners.forEach(callback => {
        try {
          callback(state);
        } catch (e) {
          console.error('WebSocket状态监听器错误', e);
        }
      });
    }
  }
  
  /**
   * 尝试重新连接
   * @private
   */
  _reconnect() {
    // 清除之前的定时器
    this._clearTimers();
    
    // 超过最大重连次数则不再重连
    if (this.reconnectCount >= this.maxReconnectCount) {
      if (this.env.debug) {
        console.log(`WebSocket已达到最大重连次数(${this.maxReconnectCount})，停止重连`);
      }
      return;
    }
    
    this.reconnectCount++;
    
    if (this.env.debug) {
      console.log(`WebSocket准备重连(${this.reconnectCount}/${this.maxReconnectCount})...`);
    }
    
    // 设置定时器进行重连
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        if (this.env.debug) {
          console.error('WebSocket重连失败', error);
        }
      });
    }, this.reconnectInterval);
  }
  
  /**
   * 开始心跳检测
   * @private
   */
  _startHeartbeat() {
    // 清除之前的心跳定时器
    this._clearHeartbeat();
    
    // 设置新的心跳定时器
    this.heartbeatTimer = setInterval(() => {
      try {
        if (this.isConnected) {
          // 发送心跳包
          this.send({ type: 'heartbeat', timestamp: Date.now() }).catch(error => {
            if (this.env.debug) {
              console.error('WebSocket心跳发送失败', error);
            }
          });
        } else {
          // 如果连接已断开，清除心跳
          this._clearHeartbeat();
        }
      } catch (e) {
        if (this.env.debug) {
          console.error('WebSocket心跳异常', e);
        }
      }
    }, this.heartbeatInterval);
  }
  
  /**
   * 清除心跳定时器
   * @private
   */
  _clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * 清除所有定时器
   * @private
   */
  _clearTimers() {
    this._clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// 创建单例实例
const websocket = new WebSocketManager();

export default websocket; 