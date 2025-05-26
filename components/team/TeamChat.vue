<template>
  <view class="chat-container">
    <!-- 聊天消息区域 -->
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
        <view 
          class="message-item" 
          :id="'msg-' + message.id"
          :class="{
            'self-message': message.userId === currentUserId,
            'system-message': message.type === 'system'
          }"
        >
          <!-- 其他人的头像 -->
          <view class="avatar-container" v-if="message.userId !== currentUserId && message.type !== 'system'">
            <image 
              class="avatar" 
              :src="message.avatar" 
              mode="aspectFill"
            ></image>
          </view>
          
          <!-- 消息内容 -->
          <view class="message-content">
            <view class="message-sender" v-if="message.userId !== currentUserId && message.type !== 'system'">
              <text>{{ message.userName }}</text>
            </view>
            <view class="message-bubble" :class="{'system-bubble': message.type === 'system'}">
              <text v-if="message.type === 'text' || message.type === 'system'">{{ message.content }}</text>
              <image 
                v-if="message.type === 'image'" 
                class="message-image" 
                :src="message.content" 
                mode="widthFix"
                @tap="previewImage(message.content)"
              ></image>
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
            <view class="message-time">
              {{ formatMessageTime(message.sendTime) }}
            </view>
          </view>
          
          <!-- 自己的头像 -->
          <view class="avatar-container" v-if="message.userId === currentUserId">
            <image 
              class="avatar" 
              :src="message.avatar" 
              mode="aspectFill"
            ></image>
          </view>
        </view>
      </block>
      
      <!-- 对方正在输入提示 -->
      <view class="typing-indicator" v-if="isTyping">
        <view class="typing-avatar">
          <text class="typing-user">{{ typingUser }}</text>
        </view>
        <view class="typing-bubbles">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 滚动到底部按钮 -->
    <view class="scroll-to-bottom" v-if="showScrollBottom" @click="scrollToBottom">
      <text class="scroll-to-bottom-icon">↓</text>
    </view>
    
    <!-- 聊天输入区域 -->
    <view class="chat-footer">
      <!-- 快捷回复列表 -->
      <view class="quick-replies" v-if="showQuickReplies">
        <scroll-view scroll-x class="quick-replies-scroll">
          <view 
            class="quick-reply-item" 
            v-for="(reply, index) in quickReplies" 
            :key="index"
            @click="selectQuickReply(reply)"
          >
            <text>{{ reply }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 聊天输入框 -->
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
              @focus="onInputFocus"
            ></textarea>
            <view class="input-actions">
              <view class="action-btn text-btn" @click="toggleQuickReplies">
                <text class="action-text">快捷</text>
              </view>
              <view class="action-btn text-btn" @click="chooseImage">
                <text class="action-text">图片</text>
              </view>
              <view class="action-btn text-btn" @click="showEmojiPicker">
                <text class="action-text">表情</text>
              </view>
              <view class="action-btn text-btn" @click="showMoreActions">
                <text class="action-text">更多</text>
              </view>
              <button class="action-btn send-btn" @click.stop="sendMessage" form-type="submit">
                <text class="action-text send-text">发送</text>
              </button>
            </view>
          </view>
        </form>
      </view>
    </view>
    
    <!-- 更多操作弹出层（备用实现，以防uni-popup不可用） -->
    <view class="custom-popup more-actions-popup" v-show="showCustomMoreActionsPopup">
      <view class="popup-mask" @click="hideMoreActions"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">更多操作</text>
          <view class="popup-close" @click="hideMoreActions">
            <text>关闭</text>
          </view>
        </view>
        <view class="actions-grid">
          <view class="action-grid-item" @click="handleFileUpload">
            <view class="action-icon file-action">
              <text class="action-icon-text">文件</text>
            </view>
            <text class="action-label">文件</text>
          </view>
          <view class="action-grid-item" @click="handleImageUpload">
            <view class="action-icon image-action">
              <text class="action-icon-text">图片</text>
            </view>
            <text class="action-label">图片</text>
          </view>
          <view class="action-grid-item" @click="handleVideoCall">
            <view class="action-icon video-action">
              <text class="action-icon-text">视频</text>
            </view>
            <text class="action-label">视频通话</text>
          </view>
          <view class="action-grid-item" @click="handleVoiceCall">
            <view class="action-icon voice-action">
              <text class="action-icon-text">语音</text>
            </view>
            <text class="action-label">语音通话</text>
          </view>
          <view class="action-grid-item" @click="handleLocation">
            <view class="action-icon location-action">
              <text class="action-icon-text">位置</text>
            </view>
            <text class="action-label">位置</text>
          </view>
          <view class="action-grid-item" @click="handleVoiceMessage">
            <view class="action-icon audio-action">
              <text class="action-icon-text">音频</text>
            </view>
            <text class="action-label">语音消息</text>
          </view>
          <view class="action-grid-item" @click="handlePoll">
            <view class="action-icon poll-action">
              <text class="action-icon-text">投票</text>
            </view>
            <text class="action-label">投票</text>
          </view>
          <view class="action-grid-item" @click="handleSchedule">
            <view class="action-icon schedule-action">
              <text class="action-icon-text">日程</text>
            </view>
            <text class="action-label">日程</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 表情选择器弹出层（备用实现，以防uni-popup不可用） -->
    <view class="custom-popup emoji-picker" v-show="showCustomEmojiPickerPopup">
      <view class="popup-mask" @click="hideEmojiPicker"></view>
      <view class="emoji-container">
        <view class="emoji-header">
          <text>常用表情</text>
          <view class="emoji-close" @click="hideEmojiPicker">
            <text>关闭</text>
          </view>
        </view>
        <view class="emoji-grid">
          <view 
            class="emoji-item" 
            v-for="(emoji, index) in emojiList" 
            :key="index"
            @click="insertEmoji(emoji)"
          >
            <text>{{ emoji }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, defineProps, defineEmits, onMounted } from 'vue';

// 导入uni-popup组件
let uniPopupAvailable = false;
try {
  // 尝试导入uniapp的uni-popup组件
  const uniPopup = uni.requireNativePlugin('uni-popup');
  uniPopupAvailable = true;
} catch (e) {
  console.error('导入uni-popup组件失败:', e);
  uniPopupAvailable = false;
}

const props = defineProps({
  teamId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['send', 'loadMore', 'showEmojiPicker', 'showMoreActions']);

// 数据定义
const messages = ref([]);
const messageInput = ref('');
const scrollTop = ref(0);
const loadingMore = ref(false);
const latestMessageId = ref('');
const currentUserId = ref('1001');
const isTyping = ref(false);
const typingUser = ref('');
const showQuickReplies = ref(false);
const showScrollBottom = ref(false);
const moreActionsPopup = ref(null);
const emojiPickerPopup = ref(null);
const emojiList = ref(['😊', '😂', '😍', '🤔', '😎', '👍', '❤️', '🎉', '🔥', '👏', '😁', '🙏', '🌟', '💯', '🤝', '🚀']);
const quickReplies = ref([
  '好的，我明白了',
  '稍等，我确认一下',
  '这个问题我需要研究一下',
  '同意你的观点',
  '很好的想法！',
  '我们可以讨论一下具体细节'
]);

// 备用状态，用于自定义弹出层
const showCustomMoreActionsPopup = ref(false);
const showCustomEmojiPickerPopup = ref(false);

// 计算属性
const sortedMessages = computed(() => {
  // 确保按时间升序排序，最新的消息在最后
  return [...messages.value].sort((a, b) => {
    const timeA = new Date(a.sendTime).getTime();
    const timeB = new Date(b.sendTime).getTime();
    return timeA - timeB;
  });
});

// 生命周期钩子
onMounted(() => {
  console.log('TeamChat组件已加载');
  console.log('uni-popup组件可用状态:', uniPopupAvailable);
  loadMessages();
});

// 方法
function loadMessages() {
  // 模拟加载数据，实际上这里会从父组件传递过来
  setTimeout(() => {
    initializeMessages();
  }, 500);
}

function initializeMessages() {
  const avatarMap = {
    '1001': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/675b261911764dd9bdf6ad7942fec558.png', // 我
    '1002': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png', // 张三
    '1003': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/ad929a51b8f243cfaf0792e0de963d08.png', // 李四
    '1004': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/884086871e4c4c078f7721123f372c4f.png', // 王五
    '1005': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/871731a3efa5453fb4b2310f0bcefb97.png'  // 赵六
  };

  const now = new Date();
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const getTime = (hoursAgo, minutesAgo = 0, secondsAgo = 0) => {
    const time = new Date(currentDay);
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setTime(time.getTime() - (hoursAgo * 3600000 + minutesAgo * 60000 + secondsAgo * 1000));
    return time;
  };

  // 清空现有消息
  messages.value = [];

  // 按时间顺序添加历史消息
  const historyMessages = [
    {
      id: '1',
      userId: '1002',
      userName: '张三',
      avatar: avatarMap['1002'],
      type: 'text',
      content: '各位早上好，昨天我们讨论的用户登录模块需要有新的进展了，产品经理希望下周三之前能完成原型开发。',
      sendTime: getTime(0, 50, 0)
    },
    {
      id: '2',
      userId: '1003',
      userName: '李四',
      avatar: avatarMap['1003'],
      type: 'text',
      content: '我已经完成了一版设计草图，稍后上传到共享文件夹，大家可以先看一下。',
      sendTime: getTime(0, 48, 30)
    },
    {
      id: '3',
      userId: '1005',
      userName: '赵六',
      avatar: avatarMap['1005'],
      type: 'text',
      content: '好的，我这边负责前端实现，需要后端接口文档尽快确定下来。',
      sendTime: getTime(0, 47, 15)
    },
    {
      id: '4',
      userId: '1004',
      userName: '王五',
      avatar: avatarMap['1004'],
      type: 'text',
      content: '接口文档我昨天已经整理了初稿，现在发给大家参考。',
      sendTime: getTime(0, 46, 5)
    },
    {
      id: '5',
      userId: '1004',
      userName: '王五',
      avatar: avatarMap['1004'],
      type: 'file',
      content: 'user-api-docs-v1.pdf',
      fileName: 'user-api-docs-v1.pdf',
      fileSize: '1.8MB',
      sendTime: getTime(0, 45, 30)
    },
    {
      id: '6',
      userId: '1001',
      userName: '我',
      avatar: avatarMap['1001'],
      type: 'text',
      content: '我看了一下接口文档，用户验证部分是否需要考虑添加图形验证码？最近安全团队提出了一些关于防止暴力破解的建议。',
      sendTime: getTime(0, 42, 10)
    },
    {
      id: '7',
      userId: '1002',
      userName: '张三',
      avatar: avatarMap['1002'],
      type: 'text',
      content: '这个建议很好，安全性确实需要考虑。王五，你看能加上这个功能吗？',
      sendTime: getTime(0, 40, 45)
    }
  ];
  
  // 按照时间顺序逐条添加消息
  historyMessages.forEach(msg => {
    messages.value.push({
      ...msg,
      sendTime: new Date(msg.sendTime) // 确保所有时间戳都是Date对象
    });
  });
  
  // 确保按时间排序
  messages.value.sort((a, b) => {
    const timeA = new Date(a.sendTime).getTime();
    const timeB = new Date(b.sendTime).getTime();
    return timeA - timeB;
  });
  
  // 设置最新消息ID
  if (messages.value.length > 0) {
    latestMessageId.value = 'msg-' + messages.value[messages.value.length - 1].id;
  }
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
}

function loadMoreMessages() {
  if (loadingMore.value) return;
  loadingMore.value = true;
  
  emit('loadMore', () => {
    // 这个回调会在父组件加载完更多消息后调用
    loadingMore.value = false;
  });
}

function scrollToBottom() {
  if (messages.value.length === 0) return;
  
  const lastMessageId = 'msg-' + messages.value[messages.value.length - 1].id;
  latestMessageId.value = lastMessageId;
  
  // 确保滚动到底部的多种方法
  try {
    // 直接设置很大的scrollTop值
    scrollTop.value = 99999999;
    
    // 使用定时器再次尝试滚动
    setTimeout(() => {
      const query = uni.createSelectorQuery();
      query.select('.chat-messages').boundingClientRect(data => {
        if (data) {
          console.log('滚动到底部，消息容器高度：', data.height);
          scrollTop.value = data.height * 3; // 设置足够大的值确保滚动到底部
        }
      }).exec();
    }, 50);
    
    // 最后使用scrollIntoView兜底
    if (uni.pageScrollTo) {
      setTimeout(() => {
        uni.pageScrollTo({
          selector: '#' + lastMessageId,
          duration: 0
        });
      }, 100);
    }
  } catch (e) {
    console.error('滚动到底部出错:', e);
    scrollTop.value = 999999;
  }
}

function sendMessage() {
  if (!messageInput.value.trim()) return;
  
  const messageContent = messageInput.value;
  messageInput.value = '';
  
  // 隐藏快捷回复
  showQuickReplies.value = false;
  
  // 发送消息到父组件处理
  emit('send', {
    content: messageContent,
    type: 'text'
  });
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      // 发送图片消息到父组件处理
      emit('send', {
        content: tempFilePath,
        type: 'image'
      });
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

function shouldShowTimeSeparator(message, index) {
  if (index === 0) return true;
  
  const currentTime = new Date(message.sendTime).getTime();
  const prevTime = new Date(sortedMessages.value[index - 1].sendTime).getTime();
  
  // 如果与前一条消息相隔超过30分钟，显示时间分割线
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
    // 判断是否是昨天
    if (date >= yesterday) {
      return `昨天 ${timeStr}`;
    } else {
      // 更早的日期，显示完整日期
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

function showMoreActions() {
  console.log('显示更多操作弹出层');
  if (uniPopupAvailable && moreActionsPopup.value) {
    nextTick(() => {
      moreActionsPopup.value.open();
    });
  } else {
    showCustomMoreActionsPopup.value = true;
  }
}

function hideMoreActions() {
  console.log('隐藏更多操作弹出层');
  if (uniPopupAvailable && moreActionsPopup.value) {
    nextTick(() => {
      moreActionsPopup.value.close();
    });
  } else {
    showCustomMoreActionsPopup.value = false;
  }
}

function showEmojiPicker() {
  console.log('显示表情选择器');
  if (uniPopupAvailable && emojiPickerPopup.value) {
    nextTick(() => {
      emojiPickerPopup.value.open();
    });
  } else {
    showCustomEmojiPickerPopup.value = true;
  }
}

function hideEmojiPicker() {
  console.log('隐藏表情选择器');
  if (uniPopupAvailable && emojiPickerPopup.value) {
    nextTick(() => {
      emojiPickerPopup.value.close();
    });
  } else {
    showCustomEmojiPickerPopup.value = false;
  }
}

function insertEmoji(emoji) {
  // 向聊天输入框插入表情
  messageInput.value += emoji;
  hideEmojiPicker();
}

// 更多操作相关方法
function handleFileUpload() {
  uni.showToast({
    title: '文件上传功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function handleImageUpload() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      emit('send', {
        type: 'image',
        content: tempFilePath
      });
    }
  });
  hideMoreActions();
}

function handleVideoCall() {
  uni.showToast({
    title: '视频通话功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function handleVoiceCall() {
  uni.showToast({
    title: '语音通话功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function handleLocation() {
  uni.chooseLocation({
    success: (res) => {
      emit('send', {
        type: 'text',
        content: `[位置] ${res.name}\n${res.address}`
      });
    }
  });
  hideMoreActions();
}

function handleVoiceMessage() {
  uni.showToast({
    title: '语音消息功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function handlePoll() {
  uni.showToast({
    title: '投票功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function handleSchedule() {
  uni.showToast({
    title: '日程功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

function toggleQuickReplies() {
  showQuickReplies.value = !showQuickReplies.value;
}

function selectQuickReply(reply) {
  messageInput.value = reply;
  showQuickReplies.value = false;
  sendMessage();
}

function onInputFocus() {
  // 关闭所有弹窗
  showQuickReplies.value = false;
}

function onScroll(e) {
  // 检测滚动位置，如果不在底部则显示滚动按钮
  const scrollHeight = e.detail.scrollHeight;
  const scrollTop = e.detail.scrollTop;
  const clientHeight = e.detail.scrollHeight - e.detail.deltaY;
  
  // 如果距离底部超过200px，显示滚动按钮
  showScrollBottom.value = (scrollHeight - scrollTop - clientHeight) > 200;
}

// 暴露方法给父组件调用
defineExpose({
  addMessage(message) {
    console.log('添加新消息:', message);
    // 确保消息有正确的时间戳，设置为当前时间
    if (!message.sendTime) {
      message.sendTime = new Date();
    } else if (typeof message.sendTime === 'string') {
      message.sendTime = new Date(message.sendTime);
    }
    
    // 添加消息到数组，确保有唯一ID
    if (!message.id) {
      message.id = Date.now().toString();
    }
    
    // 添加到消息数组
    messages.value.push(message);
    
    // 排序确保按时间顺序
    messages.value.sort((a, b) => {
      return new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime();
    });
    
    // 设置最新消息ID，确保滚动目标正确
    latestMessageId.value = 'msg-' + message.id;
    
    // 立即尝试滚动到底部
    scrollTop.value = 999999;
    
    // 使用nextTick确保DOM已更新
    nextTick(() => {
      // 重新滚动到底部
      scrollToBottom();
      
      // 再次尝试滚动，确保显示
      setTimeout(() => {
        scrollTop.value = 999999;
        
        // 最后一次尝试，确保滚动生效
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 50);
    });
  },
  showTypingIndicator(user) {
    isTyping.value = true;
    typingUser.value = user;
    
    // 3秒后自动隐藏
    setTimeout(() => {
      isTyping.value = false;
    }, 3000);
  },
  hideTypingIndicator() {
    isTyping.value = false;
  }
});
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 800rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

.chat-messages {
  flex: 1;
  padding: 20rpx 30rpx;
  height: calc(100% - 160rpx);
  box-sizing: border-box;
  overflow-anchor: auto;
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

.message-file {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.file-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #bbdefb;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0288d1;
}

.file-info {
  flex: 1;
  margin: 0 20rpx;
}

.file-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.file-size {
  font-size: 24rpx;
  color: #999999;
}

.file-download {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0288d1;
}

.system-message {
  justify-content: center;
  margin: 15rpx 0;
}

.system-bubble {
  background-color: rgba(0, 0, 0, 0.05) !important;
  padding: 12rpx 24rpx !important;
  border-radius: 30rpx !important;
  color: #666666 !important;
  font-size: 24rpx !important;
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

.typing-indicator {
  display: flex;
  align-items: flex-end;
  margin: 20rpx 0 20rpx 30rpx;
}

.typing-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16rpx;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.typing-user {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}

.typing-bubbles {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
}

.typing-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: #999999;
  margin: 0 6rpx;
  animation: typing-animation 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-animation {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10rpx);
  }
}

.chat-footer {
  min-height: 160rpx;
  border-top: 1rpx solid #f0f0f0;
  background-color: #ffffff;
}

.quick-replies {
  width: 100%;
  padding: 10rpx 0;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.quick-replies-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}

.quick-reply-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #333333;
}

.quick-reply-item:active {
  background-color: #e0e0e0;
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
  width: 100%;
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

.input-form {
  width: 100%;
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

/* 自定义弹出层 */
.custom-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999998;
}

.popup-content {
  position: relative;
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 40rpx 30rpx;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 999999;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0 20rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.popup-title {
  font-size: 30rpx;
  font-weight: 500;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.popup-close:active {
  background-color: #e0e0e0;
}

.actions-grid {
  display: flex;
  flex-wrap: wrap;
}

.action-grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
}

.action-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
}

.action-icon-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

.action-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.file-action {
  background-color: #4caf50;
}

.image-action {
  background-color: #2196f3;
}

.video-action {
  background-color: #f44336;
}

.voice-action {
  background-color: #ff9800;
}

.location-action {
  background-color: #009688;
}

.audio-action {
  background-color: #9c27b0;
}

.poll-action {
  background-color: #795548;
}

.schedule-action {
  background-color: #607d8b;
}

/* 覆盖旧的样式 */
.more-actions-popup,
.emoji-picker {
  display: flex;
}

.emoji-container {
  position: relative;
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 30rpx;
  height: 500rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 999999;
}
</style> 