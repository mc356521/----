<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="navigateBack">
        <SvgIcon name="back" />
      </view>
      <view class="header-title">{{ chatInfo.realName }}</view>
      <view class="header-right">
        <text class="iconfont icon-more"></text>
      </view>
    </view>
    
    <!-- 聊天内容区域 -->
    <view class="content-container">
      <scroll-view 
        scroll-y 
        class="chat-messages" 
        :scroll-top="scrollTop" 
        @scrolltoupper="loadMoreMessages"
        :scroll-into-view="latestMessageId" 
        :scroll-with-animation="true" 
        enhanced 
        show-scrollbar="false"
        @scroll="onScroll"
      >
        <view class="loading-more" v-if="loadingMore">
          <text>加载更多消息...</text>
        </view>

        <!-- 消息列表 -->
        <block v-for="(message, msgIndex) in sortedMessages" :key="'msg-group-' + msgIndex">
          <!-- 时间分割线 -->
          <view class="time-separator" v-if="shouldShowTimeSeparator(message, msgIndex)">
            <text>{{ formatTime(message.sendTime) }}</text>
          </view>

          <!-- 消息项 -->
          <view class="message-item" :id="'msg-' + message.id" :class="{
            'self-message': message.flow === 'out',
            'system-message': message.type === 'system'
          }">
            <!-- 其他人的头像 -->
            <view class="avatar-container" v-if="message.flow !== 'out' && message.type !== 'system'">
              <image class="avatar" :src="chatInfo.avatarUrl" mode="aspectFill"></image>
            </view>

            <!-- 自己的头像 -->
            <view class="avatar-container" v-if="message.flow === 'out' && message.type !== 'system'">
              <image class="avatar" :src="userInfo.avatarUrl||''" mode="aspectFill"></image>
            </view>

            <!-- 消息内容 -->
            <view class="message-content">
              <view class="message-sender" v-if="message.flow !== 'out' && message.type !== 'system'">
                <text>{{ message.userName }}</text>
              </view>
              <view class="message-bubble" :class="{'system-bubble': message.type === 'system'}">
                <text v-if="message.type === 'text' || message.type === 'system'">{{ message.content }}</text>
                <image v-if="message.type === 'image'" class="message-image" :src="message.content" mode="widthFix" @tap="previewImage(message.content)"></image>
                <view v-if="message.type === 'file'" class="message-file">
                  <view class="file-icon">
                    <text class="iconfont icon-file"></text>
                  </view>
                  <view class="file-info">
                    <text class="file-name">{{ message.fileName }}</text>
                    <text class="file-size">{{ message.fileSize }}</text>
                  </view>
                  <view class="file-download">
                    <text class="iconfont icon-download"></text>
                  </view>
                </view>
              </view>
              <view class="message-time" v-if="message.type !== 'system'">
                {{ formatMessageTime(message.sendTime) }}
              </view>
            </view>
          </view>
        </block>
      </scroll-view>

      <!-- 滚动到底部按钮 -->
      <view class="scroll-to-bottom" v-if="showScrollBottom" @click="scrollToBottom">
        <text class="scroll-to-bottom-icon">↓</text>
      </view>

      <!-- 聊天输入区域 -->
      <view class="chat-footer">
        <view class="chat-input-area">
          <form @submit.prevent="sendMessage" class="input-form">
            <view class="input-container">
              <textarea 
                class="chat-input" 
                v-model="messageInput" 
                placeholder="输入消息..." 
                confirm-type="send"
                :cursor-spacing="20" 
                :disable-default-padding="true" 
                :show-confirm-bar="false"
                :auto-height="true" 
                @confirm="sendMessage"
              ></textarea>
              <view class="input-actions">
                <view class="action-btn text-btn" @click="chooseImage">
                  <text class="action-text">图片</text>
                </view>
                <view class="action-btn text-btn" @click="showEmojiPicker">
                  <text class="action-text">表情</text>
                </view>
                <view class="action-btn text-btn" @click="showMoreActions">
                  <text class="action-text">更多</text>
                </view>
                <button class="action-btn send-btn" @click.stop="sendMessage" >
                  <text class="action-text send-text">发送</text>
                </button>
              </view>
            </view>
          </form>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import SvgIcon from '@/components/SvgIcon.vue';
import TencentCloudChat from '@tencentcloud/chat';
import { loginChat,logoutChat } from '../../utils/chatUtils.js'
import api from '@/api';
import chatMessageApi from '../../api/modules/chatMessage.js';
// 数据定义
const chatInfo = ref({
  id: '',
  realName: '',
  avatarUrl: ''
});
let ids = []
let conversationID = ''
const messages = ref([]);
const messageInput = ref('');
const scrollTop = ref(0);
const loadingMore = ref(false);
const latestMessageId = ref('');
const showScrollBottom = ref(false);
const userInfo = ref(null);
// 计算属性
const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    const timeA = new Date(a.sendTime).getTime();
    const timeB = new Date(b.sendTime).getTime();
    return timeA - timeB;
  });
});
onUnmounted(async ()=>{
	let promise = uni.$chat.logout();
	promise.then(function(imResponse) {
		console.log(imResponse.data); // 登出成功
	}).catch(function(imError) {
		console.warn('logout error:', imError);
	});
	
	uni.$chat.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
})

onLoad(async (options) => {
  if (options.userId) {
	chatInfo.value.id = options.userId
  }
  if (options.userName) {
	chatInfo.value.realName = options.userName;
  }
  console.log('接收到的页面参数:', chatInfo);
});
// 生命周期钩子
onMounted(async () => {
  // 监听消息
  uni.$chat.on(TencentCloudChat.EVENT.SDK_READY,chat_ready)
  uni.$chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
  // 初始化聊天
  await initChatData();
});
onUnmounted(async ()=>{
	logoutChat()
})

// 方法定义
async function initChatData() {
  if (!chatInfo.value) return;
  uni.showLoading({
  	mask:true,
	title:'加载中'
  }) 
  Promise.all([await loginChat(),await api.user.getUserProfile(),await api.user.getUserProfileById(chatInfo.value.id)])
	  .then(([loginData,_userInfo,_chatInfo])=>{
		  console.log('loginData',loginData);
		  console.log('_userInfo',_userInfo);
		  console.log('_chatInfo',_chatInfo);
		  userInfo.value = _userInfo.data
		  chatInfo.value = _chatInfo.data
		  ids.push(userInfo.value.id)
		  ids.push(chatInfo.value.id)
		  ids.sort()
		  conversationID = `C2C${chatInfo.value.id}`//`C2C${ids[0]+'_'+ids[1]}`
		  chatMessageApi.clearUnread(chatInfo.value.id).then(r=>{
			  console.log(r);
			  console.log('已读消息');
		  })
		  loadMessages();
	  }).catch(e=>{
		  uni.showToast({
		    title: '服务器繁忙，请稍后再试',
		    icon: 'none'
		  });
		  uni.hideLoading()
	  })
  
}
async function chat_ready(){
	console.log('chat_ready!!!');
}
async function getUserInfo() {
  try {
    const res = await api.user.getUserProfile();
    if (res && res.code === 200 && res.data) {
      return res.data;
    }
    return null;
  } catch (error) {
    console.error('获取用户信息出错:', error);
    return null;
  }
}

function navigateBack() {
  uni.navigateBack();
}

async function loadMessages() {
  // 获取历史消息
  const promise = uni.$chat.getMessageList({
    conversationID: conversationID
  });
  promise.then(function(imResponse) {
    const messageList = imResponse.data.messageList;
	console.log('ChatMessageDatas:',imResponse);
    messages.value = messageList.map(msg => ({
      id: msg.ID,
      from: msg.from,
      flow: msg.flow,
      userName: msg.nick || '未知用户',
      avatar: msg.avatar,
      sendTime: new Date(msg.time * 1000),
      type: msg.type === 'TIMTextElem' ? 'text' : 'system',
      content: msg.type === 'TIMTextElem' ? msg.payload.text : ''
    }));
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
	uni.hideLoading()
  })
  .catch(e=>{
	  uni.hideLoading()
	  uni.showToast({
	    title: '网络异常',
	    icon: 'none'
	  });
  });
}

async function onMessageReceived(event) {
  event.data.forEach(msg => {
    const messageObj = {
      id: msg.ID,
      from: msg.from,
      flow: msg.flow,
      userName: msg.nick || '未知用户',
      avatar: msg.avatar,
      sendTime: new Date(msg.time * 1000),
      type: msg.type === 'TIMTextElem' ? 'text' : 'system',
      content: msg.type === 'TIMTextElem' ? msg.payload.text : ''
    };
    
    chatMessageApi.clearUnread(chatInfo.value.id).then(r=>{
    			  console.log(r);
    			  console.log('已读消息');
    })
    messages.value.push(messageObj);
    latestMessageId.value = 'msg-' + messageObj.id;
    
    nextTick(() => {
      scrollToBottom();
    });
  });
}

async function sendMessage() {
  if (!messageInput.value.trim()) return;
  
  // 创建消息对象
  const messageObj = {
    id: Date.now().toString(),
    from: userInfo.value.id+'',
    flow: 'out',
    userName: userInfo.value.realName || userInfo.value.userName || '我',
    avatar: userInfo.value.avatarUrl || '',
    sendTime: new Date(),
    type: 'text',
    content: messageInput.value
  };
  
  // 添加到消息列表
  messages.value.push(messageObj);
  console.log(messageObj);
  console.log(chatInfo);
  
  // 发送消息到腾讯云
  const message = uni.$chat.createTextMessage({
    to: chatInfo.value.id+'',
    conversationType: TencentCloudChat.TYPES.CONV_C2C,
    payload: {
      text: messageInput.value
    }
  });
  
  //将消息发送到后端
  chatMessageApi.addUserUnread({toId:chatInfo.value.id,content:messageInput.value}).then(r=>{
	  console.log('ChatPushOk',r);
  })
  
  
  uni.$chat.sendMessage(message).then(function(imResponse) {
    console.log('消息发送成功:', imResponse);
    messageInput.value = '';
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });
  }).catch(function(imError) {
    console.warn('sendMessage error:', imError);
    // 发送失败时从消息列表中移除
    messages.value = messages.value.filter(msg => msg.id !== messageObj.id);
    uni.showToast({
      title: '消息发送失败',
      icon: 'none'
    });
  });
}

async function loadMoreMessages() {
  if (loadingMore.value) return;
  loadingMore.value = true;
  
  // 加载更多历史消息
  setTimeout(() => {
    loadingMore.value = false;
  }, 1000);
}

function scrollToBottom() {
  if (messages.value.length === 0) return;
  
  const lastMessageId = 'msg-' + messages.value[messages.value.length - 1].id;
  latestMessageId.value = lastMessageId;
  scrollTop.value = 999999;
}

function onScroll(e) {
  const scrollHeight = e.detail.scrollHeight;
  const scrollTop = e.detail.scrollTop;
  const clientHeight = e.detail.scrollHeight - e.detail.deltaY;
  
  showScrollBottom.value = (scrollHeight - scrollTop - clientHeight) > 200;
}

function shouldShowTimeSeparator(message, index) {
  if (index === 0) return true;
  
  const currentTime = new Date(message.sendTime).getTime();
  const prevTime = new Date(sortedMessages.value[index - 1].sendTime).getTime();
  
  return (currentTime - prevTime) > 30 * 60 * 1000;
}

function formatTime(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  if (date < today) {
    if (date >= yesterday) {
      return `昨天 ${timeStr}`;
    } else {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day} ${timeStr}`;
    }
  }
  
  return timeStr;
}

function formatMessageTime(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 处理图片发送
    }
  });
}

function previewImage(url) {
  const imageUrls = messages.value
    .filter(msg => msg.type === 'image')
    .map(msg => msg.content);
    
  uni.previewImage({
    current: url,
    urls: imageUrls
  });
}

function showEmojiPicker() {
  // 实现表情选择器
}

function showMoreActions() {
  // 实现更多操作
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.header-bar {
  display: flex;
  align-items: center;
  height: 90rpx;
  padding: 0 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eaeaea;
  position: relative;
  z-index: 10;
}

.header-left {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 500;
}

.header-right {
  width: 60rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 内容区域 */
.content-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 20rpx 30rpx;
  height: calc(100% - 160rpx);
  box-sizing: border-box;
}

.loading-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #999999;
}

.message-item {
  display: flex;
  margin-bottom: 20rpx;
  width: 100%;
}

.self-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.avatar-container {
  width: 80rpx;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.message-content {
  max-width: 70%;
  margin: 0 20rpx;
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.message-bubble {
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  word-break: break-all;
  line-height: 1.4;
  max-width: 100%;
  display: inline-block;
}

.self-message .message-bubble {
  background-color: #e1f5fe;
  color: #0288d1;
  border-top-right-radius: 4rpx;
  align-self: flex-end;
}

.message-item:not(.self-message) .message-bubble {
  background-color: #f5f5f5;
  color: #333333;
  border-top-left-radius: 4rpx;
  align-self: flex-start;
}

.message-time {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
}

.self-message .message-time {
  text-align: right;
}

.message-item:not(.self-message) .message-time {
  text-align: left;
}

.message-image {
  width: 100%;
  max-width: 400rpx;
  border-radius: 12rpx;
}

.time-separator {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.time-separator text {
  font-size: 24rpx;
  color: #999;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.chat-footer {
  min-height: 200rpx;
  border-top: 1rpx solid #f0f0f0;
  background-color: #ffffff;
}

.chat-input-area {
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
}

.input-container {
  display: flex;
  flex-direction: column;
}

.chat-input {
  width: auto;
  min-height: 80rpx;
  max-height: 120rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e0e0e0;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.action-btn {
  min-width: 80rpx;
  height: 70rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666666;
  border-radius: 35rpx;
  margin: 0 5rpx;
}

.text-btn {
  background-color: #f0f0f0;
  transition: all 0.2s ease;
  padding: 0 20rpx;
}

.action-text {
  font-size: 28rpx;
  font-weight: 500;
}

.send-btn {
  background-color: #3498db;
  color: #ffffff;
  padding: 0 30rpx;
  min-width: 120rpx;
  border: none;
  outline: none;
  font-size: inherit;
  line-height: inherit;
  border-radius: 35rpx;
  height: 70rpx;
  box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.3);
  transition: all 0.2s ease;
}

.send-btn:active {
  transform: scale(0.95);
  background-color: #2980b9;
}

.send-btn .send-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
}

.scroll-to-bottom {
  position: absolute;
  right: 30rpx;
  bottom: 180rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(52, 152, 219, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.scroll-to-bottom-icon {
  font-size: 40rpx;
  font-weight: bold;
}
</style>
