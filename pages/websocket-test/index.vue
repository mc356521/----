<template>
  <view class="container">
    <!-- 顶部状态栏 -->
    <view class="status-bar" :class="[isConnected ? 'connected' : 'disconnected']">
      <text class="status-text">WebSocket状态: {{ isConnected ? '已连接' : '未连接' }}</text>
      <view class="status-indicator"></view>
    </view>
    
    <!-- 环境信息 -->
    <view class="env-info">
      <text class="env-title">当前环境: {{ env.env }}</text>
      <text class="env-detail">API地址: {{ env.baseUrl }}</text>
      <text class="env-detail">WebSocket地址: {{ env.wsUrl }}</text>
    </view>
    
    <!-- 连接设置区域 -->
    <view class="connection-settings">
      <view class="form-item">
        <text class="label">服务器地址</text>
        <input class="input" v-model="serverUrl" placeholder="ws://服务器地址/ws" />
      </view>
      <view class="form-item">
        <text class="label">Token</text>
        <input class="input" v-model="token" placeholder="可选，身份验证token" />
      </view>
      <view class="form-item checkbox-item">
        <text class="label">调试模式</text>
        <switch :checked="debug" @change="onDebugChange" color="#4CAF50" />
      </view>
      <view class="form-item checkbox-item">
        <text class="label">自动重连</text>
        <switch :checked="autoReconnect" @change="onAutoReconnectChange" color="#4CAF50" />
      </view>
      <view class="form-item checkbox-item">
        <text class="label">心跳检测</text>
        <switch :checked="heartbeat" @change="onHeartbeatChange" color="#4CAF50" />
      </view>
      
      <!-- 连接按钮 -->
      <view class="button-group">
        <button class="btn connect-btn" @click="connectWebSocket" :disabled="isConnected">连接</button>
        <button class="btn disconnect-btn" @click="disconnectWebSocket" :disabled="!isConnected">断开</button>
      </view>
    </view>
    
    <!-- 消息发送区域 -->
    <view class="message-sender" :class="{ 'disabled': !isConnected }">
      <view class="form-item">
        <text class="label">消息类型</text>
        <picker @change="onMessageTypeChange" :value="messageTypeIndex" :range="messageTypes">
          <view class="picker">
            {{ messageTypes[messageTypeIndex] }}
          </view>
        </picker>
      </view>
      <view class="form-item" v-if="messageTypeIndex === 1">
        <text class="label">接收者ID</text>
        <input class="input" v-model="receiverId" placeholder="接收者ID" />
      </view>
      <view class="form-item">
        <text class="label">消息内容</text>
        <textarea class="textarea" v-model="messageContent" placeholder="请输入消息内容" />
      </view>
      <button class="btn send-btn" @click="sendMessage" :disabled="!isConnected || !messageContent">发送消息</button>
    </view>
    
    <!-- 消息记录区域 -->
    <view class="message-log">
      <view class="log-header">
        <text class="log-title">消息记录</text>
        <button class="btn clear-btn" @click="clearMessages">清空</button>
      </view>
      <scroll-view class="log-content" scroll-y :scroll-top="scrollTop">
        <view v-if="messages.length === 0" class="empty-log">
          <text>暂无消息记录</text>
        </view>
        <view v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.type">
          <view class="message-header">
            <text class="message-type">{{ msg.typeText }}</text>
            <text class="message-time">{{ msg.time }}</text>
          </view>
          <view class="message-content">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import websocket from '@/utils/websocket';
import env from '@/config/env';
import { getToken } from '@/utils/request';

export default {
  data() {
    return {
      // 环境配置
      env: env,
      
      // 连接设置
      serverUrl: env.wsUrl || 'ws://localhost:8080/ws',
      token: getToken() || '',
      debug: env.debug || true,
      autoReconnect: true,
      heartbeat: true,
      
      // 连接状态
      isConnected: false,
      
      // 消息发送
      messageTypes: ['普通消息', '聊天消息', '认证消息'],
      messageTypeIndex: 0,
      receiverId: '',
      messageContent: '',
      
      // 消息记录
      messages: [],
      scrollTop: 0
    };
  },
  
  // 页面加载时初始化
  onLoad() {
    // 设置WebSocket回调
    this.setupWebSocketCallbacks();
    
    // 添加初始化消息
    this.addMessage('系统', `环境: ${this.env.env || '未知'}`);
    this.addMessage('系统', `API地址: ${this.env.baseUrl || '未设置'}`);
    this.addMessage('系统', `WebSocket地址: ${this.env.wsUrl || '未设置'}`);
    this.addMessage('系统', `Token: ${this.token ? '已设置' : '未设置'}`);
  },
  
  // 页面卸载时断开连接
  onUnload() {
    this.disconnectWebSocket();
  },
  
  methods: {
    // 设置WebSocket回调函数
    setupWebSocketCallbacks() {
      // 连接打开回调
      websocket.onOpen((res) => {
        this.isConnected = true;
        this.addMessage('系统', `WebSocket连接已打开`);
      });
      
      // 连接关闭回调
      websocket.onClose((res) => {
        this.isConnected = false;
        this.addMessage('系统', `WebSocket连接已关闭: ${res.code || ''} ${res.reason || ''}`);
      });
      
      // 错误回调
      websocket.onError((err) => {
        this.addMessage('错误', `WebSocket连接错误: ${err.errMsg || JSON.stringify(err)}`);
      });
      
      // 消息接收回调
      websocket.onMessage((data) => {
        let message = data;
        try {
          // 尝试解析JSON
          if (typeof data === 'string') {
            message = JSON.parse(data);
            message = JSON.stringify(message, null, 2);
          }
        } catch (e) {
          // 解析失败，使用原始数据
        }
        
        this.addMessage('接收', message);
      });
    },
    
    // 连接WebSocket
    connectWebSocket() {
      if (this.isConnected) {
        uni.showToast({
          title: 'WebSocket已连接',
          icon: 'none'
        });
        return;
      }
      
      // 初始化WebSocket配置
      websocket.initConfig({
        url: this.serverUrl,
        token: this.token,
        debug: this.debug,
        autoReconnect: this.autoReconnect,
        heartbeat: this.heartbeat
      });
      
      // 连接WebSocket
      websocket.connect();
      
      this.addMessage('系统', '正在连接WebSocket...');
    },
    
    // 断开WebSocket连接
    disconnectWebSocket() {
      if (!this.isConnected) {
        uni.showToast({
          title: 'WebSocket未连接',
          icon: 'none'
        });
        return;
      }
      
      websocket.close();
      this.addMessage('系统', '正在断开WebSocket连接...');
    },
    
    // 发送消息
    sendMessage() {
      if (!this.isConnected) {
        uni.showToast({
          title: 'WebSocket未连接',
          icon: 'none'
        });
        return;
      }
      
      if (!this.messageContent) {
        uni.showToast({
          title: '消息内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      let message;
      
      // 根据消息类型构建消息
      switch (this.messageTypeIndex) {
        case 0: // 普通消息
          message = this.messageContent;
          break;
        case 1: // 聊天消息
          message = {
            type: 'chat',
            to: this.receiverId,
            content: this.messageContent,
            timestamp: Date.now()
          };
          break;
        case 2: // 认证消息
          message = {
            type: 'auth',
            token: this.token || this.messageContent
          };
          break;
      }
      
      // 发送消息
      const success = websocket.send(message);
      
      if (success) {
        // 添加到消息记录
        this.addMessage('发送', typeof message === 'object' ? JSON.stringify(message, null, 2) : message);
        
        // 清空消息内容
        this.messageContent = '';
      } else {
        uni.showToast({
          title: '消息发送失败',
          icon: 'none'
        });
      }
    },
    
    // 添加消息到记录
    addMessage(type, content) {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      let typeText = '';
      switch (type) {
        case '系统':
          typeText = '系统消息';
          break;
        case '发送':
          typeText = '发送消息';
          break;
        case '接收':
          typeText = '接收消息';
          break;
        case '错误':
          typeText = '错误消息';
          break;
        default:
          typeText = type;
      }
      
      this.messages.push({
        type,
        typeText,
        content,
        time
      });
      
      // 限制消息记录数量
      if (this.messages.length > 100) {
        this.messages.shift();
      }
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollTop = 9999999;
      });
    },
    
    // 清空消息记录
    clearMessages() {
      this.messages = [];
    },
    
    // 调试模式切换
    onDebugChange(e) {
      this.debug = e.detail.value;
    },
    
    // 自动重连切换
    onAutoReconnectChange(e) {
      this.autoReconnect = e.detail.value;
    },
    
    // 心跳检测切换
    onHeartbeatChange(e) {
      this.heartbeat = e.detail.value;
    },
    
    // 消息类型切换
    onMessageTypeChange(e) {
      this.messageTypeIndex = e.detail.value;
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.connected {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
}

.disconnected {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid #F44336;
}

.status-text {
  font-size: 28rpx;
  font-weight: bold;
}

.status-indicator {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}

.connected .status-indicator {
  background-color: #4CAF50;
}

.disconnected .status-indicator {
  background-color: #F44336;
}

/* 连接设置区域样式 */
.connection-settings {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.checkbox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.input, .textarea, .picker {
  width: 100%;
  padding: 30rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.textarea {
  height: 150rpx;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 16rpx 30rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #fff;
  border: none;
}

.connect-btn {
  background-color: #4CAF50;
  flex: 1;
  margin-right: 10rpx;
}

.disconnect-btn {
  background-color: #F44336;
  flex: 1;
  margin-left: 10rpx;
}

.btn:disabled {
  opacity: 0.5;
}

/* 消息发送区域样式 */
.message-sender {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.message-sender.disabled {
  opacity: 0.7;
}

.send-btn {
  background-color: #2196F3;
  width: 100%;
}

/* 消息记录区域样式 */
.message-log {
  flex: 1;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.log-title {
  font-size: 32rpx;
  font-weight: bold;
}

.clear-btn {
  background-color: #FF9800;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.log-content {
  flex: 1;
  overflow-y: auto;
}

.empty-log {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  color: #999;
}

.message-item {
  margin-bottom: 20rpx;
  padding: 16rpx;
  border-radius: 8rpx;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.message-type {
  font-size: 24rpx;
  font-weight: bold;
}

.message-time {
  font-size: 24rpx;
  color: #999;
}

.message-content {
  font-size: 28rpx;
  word-break: break-all;
  white-space: pre-wrap;
}

/* 消息类型样式 */
.系统 {
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 4rpx solid #2196F3;
}

.发送 {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4rpx solid #4CAF50;
}

.接收 {
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 4rpx solid #FF9800;
}

.错误 {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4rpx solid #F44336;
}

/* 环境信息样式 */
.env-info {
  background-color: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196F3;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.env-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.env-detail {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}
</style> 