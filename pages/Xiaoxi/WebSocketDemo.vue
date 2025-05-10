<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">WebSocket示例</text>
      <view class="placeholder"></view>
    </view>
    
    <!-- 连接状态 -->
    <view class="status-bar">
      <text class="status-text">连接状态: </text>
      <text :class="['status-indicator', getStatusClass]">{{ getStatusText }}</text>
    </view>
    
    <!-- 控制按钮 -->
    <view class="control-panel">
      <button 
        class="btn" 
        :class="{ 'btn-primary': !isConnected, 'btn-danger': isConnected }"
        @click="toggleConnection"
      >
        {{ isConnected ? '断开连接' : '连接服务器' }}
      </button>
      
      <view class="url-input">
        <text>WebSocket地址:</text>
        <input 
          class="input" 
          v-model="wsUrl" 
          placeholder="wss://your-server.com/ws" 
          :disabled="isConnected"
        />
      </view>
    </view>
    
    <!-- 消息发送区域 -->
    <view class="message-panel" v-if="isConnected">
      <view class="panel-header">
        <text>发送消息</text>
      </view>
      <view class="message-form">
        <view class="form-item">
          <text class="label">消息类型:</text>
          <input class="input" v-model="messageType" placeholder="chat" />
        </view>
        <view class="form-item">
          <text class="label">消息内容:</text>
          <textarea 
            class="textarea" 
            v-model="messageContent" 
            placeholder="请输入要发送的消息内容..."
            auto-height
          />
        </view>
        <button class="btn btn-primary" @click="sendMessage">发送</button>
      </view>
    </view>
    
    <!-- 消息列表 -->
    <view class="message-list">
      <view class="panel-header">
        <text>消息记录</text>
        <text class="clear-btn" @click="clearMessages">清空</text>
      </view>
      <scroll-view 
        class="messages" 
        scroll-y 
        :scroll-top="scrollTop"
        @scrolltoupper="loadMoreMessages"
        refresher-enabled
        @refresherrefresh="refreshMessages"
        :refresher-triggered="refreshing"
      >
        <view class="empty-state" v-if="messages.length === 0">
          <text>暂无消息</text>
        </view>
        <view 
          v-for="(message, index) in messages" 
          :key="index"
          class="message-item"
          :class="{ 'message-send': message.direction === 'send', 'message-receive': message.direction === 'receive' }"
        >
          <view class="message-header">
            <text class="message-type">{{ message.type }}</text>
            <text class="message-time">{{ formatTime(message.timestamp) }}</text>
          </view>
          <view class="message-content">
            <text>{{ message.content }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import websocket, { WebSocketState } from '@/utils/websocket';
import { getEnv } from '@/config/env';

export default {
  data() {
    return {
      env: getEnv(),
      wsUrl: '',
      isConnected: false,
      connectionState: WebSocketState.CLOSED,
      messageType: 'chat',
      messageContent: '',
      messages: [],
      scrollTop: 0,
      refreshing: false
    };
  },
  computed: {
    getStatusText() {
      switch (this.connectionState) {
        case WebSocketState.CONNECTING:
          return '连接中...';
        case WebSocketState.OPEN:
          return '已连接';
        case WebSocketState.CLOSING:
          return '关闭中...';
        case WebSocketState.CLOSED:
          return '未连接';
        default:
          return '未知状态';
      }
    },
    getStatusClass() {
      switch (this.connectionState) {
        case WebSocketState.CONNECTING:
          return 'status-connecting';
        case WebSocketState.OPEN:
          return 'status-connected';
        case WebSocketState.CLOSING:
          return 'status-closing';
        case WebSocketState.CLOSED:
          return 'status-closed';
        default:
          return '';
      }
    }
  },
  created() {
    // 设置默认WebSocket地址
    this.wsUrl = this.env.wsUrl;
    
    // 监听WebSocket状态变化
    websocket.onStateChange(this.handleStateChange);
    
    // 监听WebSocket消息
    websocket.on('message', this.handleMessage);
    
    // 监听特定类型的消息 (示例：处理聊天消息)
    websocket.on('chat', this.handleChatMessage);
  },
  beforeDestroy() {
    // 页面销毁前断开WebSocket连接
    if (this.isConnected) {
      websocket.close();
    }
    
    // 移除监听器
    websocket.offStateChange(this.handleStateChange);
    websocket.off('message');
    websocket.off('chat');
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 处理WebSocket状态变化
    handleStateChange(state) {
      this.connectionState = state;
      this.isConnected = state === WebSocketState.OPEN;
      
      if (state === WebSocketState.OPEN) {
        this.addSystemMessage('system', '连接已建立');
      } else if (state === WebSocketState.CLOSED) {
        this.addSystemMessage('system', '连接已关闭');
      }
    },
    
    // 处理接收到的WebSocket消息
    handleMessage(message) {
      if (typeof message === 'object') {
        // 如果是对象类型，则按类型处理
        this.addMessage('receive', message.type || 'unknown', JSON.stringify(message));
      } else {
        // 否则作为原始数据处理
        this.addMessage('receive', 'raw', message);
      }
    },
    
    // 处理聊天消息
    handleChatMessage(message) {
      // 由于聊天消息已经在handleMessage中处理过，这里只是特定类型的处理示例
      console.log('收到聊天消息:', message);
    },
    
    // 添加系统消息
    addSystemMessage(type, content) {
      this.messages.push({
        direction: 'system',
        type,
        content,
        timestamp: Date.now()
      });
      this.scrollToBottom();
    },
    
    // 添加消息到列表
    addMessage(direction, type, content) {
      this.messages.push({
        direction,
        type,
        content,
        timestamp: Date.now()
      });
      this.scrollToBottom();
    },
    
    // 清空消息列表
    clearMessages() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有消息记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
          }
        }
      });
    },
    
    // 切换WebSocket连接状态
    toggleConnection() {
      if (this.isConnected) {
        // 断开连接
        websocket.close().catch(error => {
          uni.showToast({
            title: '断开连接失败',
            icon: 'none'
          });
        });
      } else {
        // 建立连接
        if (!this.wsUrl) {
          uni.showToast({
            title: 'WebSocket地址不能为空',
            icon: 'none'
          });
          return;
        }
        
        // 连接前显示提示
        this.connectionState = WebSocketState.CONNECTING;
        
        // 尝试连接
        websocket.connect(this.wsUrl).catch(error => {
          console.error('连接失败', error);
          uni.showToast({
            title: '连接失败',
            icon: 'none'
          });
        });
      }
    },
    
    // 发送消息
    sendMessage() {
      if (!this.messageContent.trim()) {
        uni.showToast({
          title: '消息内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      try {
        const type = this.messageType.trim() || 'chat';
        const content = this.messageContent.trim();
        
        // 尝试将内容解析为JSON对象
        let jsonContent;
        try {
          jsonContent = JSON.parse(content);
        } catch (e) {
          // 不是有效的JSON，作为普通文本发送
          jsonContent = content;
        }
        
        // 如果是对象，则使用类型参数，否则直接发送内容
        let sendPromise;
        if (typeof jsonContent === 'object') {
          sendPromise = websocket.send(jsonContent, type);
        } else {
          // 构建消息对象
          const message = {
            type: type,
            content: content,
            timestamp: Date.now()
          };
          sendPromise = websocket.send(message);
        }
        
        // 处理发送结果
        sendPromise.then(() => {
          // 将消息添加到列表
          this.addMessage('send', type, content);
          
          // 清空输入框
          this.messageContent = '';
        }).catch(error => {
          uni.showToast({
            title: '发送失败',
            icon: 'none'
          });
        });
      } catch (error) {
        console.error('发送消息异常', error);
        uni.showToast({
          title: '发送异常',
          icon: 'none'
        });
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 9999999; // 设置一个足够大的值
      });
    },
    
    // 加载更多消息（下拉时触发）
    loadMoreMessages() {
      // 在实际应用中，这里可以加载历史消息
      console.log('加载更多消息');
    },
    
    // 刷新消息列表
    refreshMessages(e) {
      this.refreshing = true;
      
      // 模拟加载
      setTimeout(() => {
        // 结束刷新
        this.refreshing = false;
      }, 1000);
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  }
};
</script>

<style lang="scss">
// 颜色变量
$primary-color: #4A90E2;
$danger-color: #FF6B6B;
$success-color: #7ED321;
$warning-color: #F5A623;
$background-color: #F8F9FA;
$card-color: #FFFFFF;
$text-color: #333333;
$text-secondary: #666666;
$text-muted: #999999;
$border-color: #EAEAEA;
$box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

page {
  background-color: $background-color;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

// 顶部导航
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90rpx;
  padding: 0 30rpx;
  background-color: $card-color;
  box-shadow: $box-shadow;
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 40rpx;
      color: $text-color;
    }
  }
  
  .title {
    font-size: 32rpx;
    font-weight: 500;
    color: $text-color;
  }
  
  .placeholder {
    width: 60rpx;
  }
}

// 状态栏
.status-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: $card-color;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  box-shadow: $box-shadow;
  
  .status-text {
    font-size: 28rpx;
    color: $text-secondary;
  }
  
  .status-indicator {
    font-size: 28rpx;
    font-weight: 500;
    
    &.status-connecting {
      color: $warning-color;
    }
    
    &.status-connected {
      color: $success-color;
    }
    
    &.status-closing {
      color: $warning-color;
    }
    
    &.status-closed {
      color: $danger-color;
    }
  }
}

// 控制面板
.control-panel {
  padding: 20rpx 30rpx;
  background-color: $card-color;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  box-shadow: $box-shadow;
  
  .btn {
    margin-bottom: 20rpx;
    
    &.btn-primary {
      background-color: $primary-color;
      color: white;
    }
    
    &.btn-danger {
      background-color: $danger-color;
      color: white;
    }
  }
  
  .url-input {
    display: flex;
    flex-direction: column;
    
    text {
      font-size: 26rpx;
      color: $text-secondary;
      margin-bottom: 10rpx;
    }
    
    .input {
      height: 80rpx;
      background-color: $background-color;
      padding: 0 20rpx;
      font-size: 26rpx;
      border-radius: 8rpx;
      border: 1px solid $border-color;
    }
  }
}

// 消息面板
.message-panel {
  padding: 20rpx 30rpx;
  background-color: $card-color;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  box-shadow: $box-shadow;
  
  .panel-header {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-color;
    margin-bottom: 20rpx;
    border-bottom: 1px solid $border-color;
    padding-bottom: 10rpx;
  }
  
  .message-form {
    .form-item {
      margin-bottom: 20rpx;
      
      .label {
        font-size: 26rpx;
        color: $text-secondary;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .input, .textarea {
        background-color: $background-color;
        padding: 20rpx;
        font-size: 26rpx;
        border-radius: 8rpx;
        border: 1px solid $border-color;
        width: 100%;
        box-sizing: border-box;
      }
      
      .textarea {
        min-height: 120rpx;
      }
    }
  }
}

// 消息列表
.message-list {
  flex: 1;
  background-color: $card-color;
  border-radius: 8rpx;
  margin-top: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: $box-shadow;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    font-weight: 500;
    color: $text-color;
    padding: 20rpx 30rpx;
    border-bottom: 1px solid $border-color;
    
    .clear-btn {
      font-size: 24rpx;
      color: $danger-color;
    }
  }
  
  .messages {
    flex: 1;
    padding: 20rpx 30rpx;
    height: 800rpx; // 设置适当的高度
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300rpx;
    
    text {
      font-size: 28rpx;
      color: $text-muted;
    }
  }
  
  .message-item {
    margin-bottom: 20rpx;
    padding: 20rpx;
    border-radius: 8rpx;
    
    &.message-send {
      background-color: rgba($primary-color, 0.1);
      margin-left: 60rpx;
    }
    
    &.message-receive {
      background-color: rgba($success-color, 0.1);
      margin-right: 60rpx;
    }
    
    &.message-system {
      background-color: rgba($text-muted, 0.1);
      margin: 0 30rpx;
      
      .message-header {
        justify-content: center;
      }
      
      .message-content {
        text-align: center;
      }
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10rpx;
      
      .message-type {
        font-size: 24rpx;
        color: $primary-color;
        font-weight: 500;
      }
      
      .message-time {
        font-size: 22rpx;
        color: $text-muted;
      }
    }
    
    .message-content {
      font-size: 26rpx;
      color: $text-color;
      word-break: break-all;
    }
  }
}
</style> 