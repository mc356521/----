<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header-bar">
      <view class="header-left" @click="navigateBack">
         <SvgIcon name="back" />
      </view>
      <view class="header-title">{{ teamInfo.name ? teamInfo.name + '的空间' : '团队空间' }}</view>
      <view class="header-right">
        <text class="iconfont icon-more"></text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 加载中显示 -->
      <view class="loading-container" v-if="loading">
        <view class="loading-circle"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <scroll-view 
        scroll-y
        class="content-scroll" 
        v-else
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="refreshTeamSpace"
      >
        <!-- 团队信息卡片 -->
        <view class="team-info-card">
          <view class="team-header">
            <view class="team-avatar">
              <text>{{ getTeamInitials(teamInfo.name) }}</text>
            </view>
            <view class="team-basic-info">
              <view class="team-name-row">
                <text class="team-name">{{ teamInfo.name }}</text>
                <view class="team-status" :class="getStatusClass(teamInfo.status)">
                  <text>{{ teamInfo.statusText }}</text>
                </view>
              </view>
              <view class="team-members-count">
        
                <text>{{ teamInfo.memberCount || 0 }}人</text>
              </view>
            </view>
          </view>
     
        </view>
        
        <!-- 功能模块 -->
        <view class="feature-modules">
          <view class="module-row">
            <view class="module-item" @click="switchTab('announcement')">
              <view class="module-icon announcement">
                <text class="module-icon-text">公告</text>
              </view>
              <text class="module-title">团队公告</text>
            </view>
            <view class="module-item" @click="switchTab('files')">
              <view class="module-icon files">
                <text class="module-icon-text">文件</text>
              </view>
              <text class="module-title">文件共享</text>
            </view>
            <view class="module-item" @click="switchTab('tasks')">
              <view class="module-icon tasks">
                <text class="module-icon-text">任务</text>
              </view>
              <text class="module-title">任务看板</text>
            </view>
          </view>
          <view class="module-row">
            <view class="module-item" @click="switchTab('chat')">
              <view class="module-icon chat">
                <text class="module-icon-text">聊天</text>
              </view>
              <text class="module-title">团队聊天</text>
            </view>
            <view class="module-item" @click="switchTab('calendar')">
              <view class="module-icon calendar">
                <text class="module-icon-text">日历</text>
              </view>
              <text class="module-title">团队日历</text>
            </view>
            <view class="module-item" @click="switchTab('members')">
              <view class="module-icon members">
                <text class="module-icon-text">成员</text>
              </view>
              <text class="module-title">成员管理</text>
            </view>
          </view>
        </view>
        
        <!-- 标签页内容 -->
        <view class="tab-content">
          <view class="tab-header">
            <text class="tab-title">{{ getTabTitle() }}</text>
          </view>
          
          <!-- 团队公告内容 -->
          <view class="tab-body" v-if="activeTab === 'announcement'">
            <team-announcement :team-id="teamInfo.id" @create="handleCreateAnnouncement"/>
                </view>
                
          <!-- 文件共享内容 -->
          <view class="tab-body" v-if="activeTab === 'files'">
            <team-files :team-id="teamInfo.id" @upload="handleFileUpload"/>
                  </view>
                  
          <!-- 任务看板内容 -->
          <view class="tab-body" v-if="activeTab === 'tasks'">
            <team-tasks 
              :team-id="teamInfo.id" 
              :team-name="teamInfo.name"
              :team-status="teamInfo.status"
              @create="handleCreateTask"
            />
                      </view>
          
          <!-- 团队聊天内容 -->
          <view class="tab-body chat-tab" v-if="activeTab === 'chat'">
            <team-chat 
              ref="teamChatRef"
              :team-id="teamInfo.id" 
              @send="handleSendMessage"
              @loadMore="handleLoadMoreMessages"
              @showEmojiPicker="showEmojiPicker"
              @showMoreActions="showMoreActions"
            />
            </view>
            
          <!-- 团队日历内容 -->
          <view class="tab-body" v-if="activeTab === 'calendar'">
            <team-calendar 
              :team-id="teamInfo.id" 
              @create="handleCreateEvent"
              @view="handleViewEvent"
              @edit="handleEditEvent"
              @delete="handleDeleteEvent"
            />
              </view>
              
          <!-- 成员管理内容 -->
          <view class="tab-body" v-if="activeTab === 'members'">
            <team-members 
              :team-id="teamInfo.id" 
              @invite="handleInviteMember"
              @contact="handleContactMember"
              @viewProfile="handleViewMemberProfile"
            />
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 更多操作弹出层 -->
    <view class="more-actions-popup" v-if="showMoreActionsPopup">
      <view class="popup-mask" @click="hideMoreActions"></view>
      <view class="popup-content">
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
    
    <!-- 表情选择器弹出层 -->
    <view class="emoji-picker" v-if="showEmojiPickerPopup">
      <view class="popup-mask" @click="hideEmojiPicker"></view>
      <view class="emoji-container">
        <view class="emoji-header">
          <text>常用表情</text>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import TeamAnnouncement from '@/components/team/TeamAnnouncement.vue';
import TeamFiles from '@/components/team/TeamFiles.vue';
import TeamTasks from '@/components/team/TeamTasks.vue';
import TeamChat from '@/components/team/TeamChat.vue';
import TeamCalendar from '@/components/team/TeamCalendar.vue';
import TeamMembers from '@/components/team/TeamMembers.vue';
import { getPageParams, handleImagePath } from '@/utils/pathHandler.js';

// 数据定义
const loading = ref(true);
const refreshing = ref(false);
const teamInfo = ref({
  id: '',
  name: '',
  status: '',
  statusText: '',
  memberCount: 0,
  description: ''
});
const activeTab = ref('tasks'); // 默认显示任务标签页
const currentUserId = ref('1001');
const messages = ref([]);
const teamChatRef = ref(null);
const showMoreActionsPopup = ref(false);
const showEmojiPickerPopup = ref(false);
const emojiList = ref(['😊', '😂', '😍', '🤔', '😎', '👍', '❤️', '🎉', '🔥', '👏', '😁', '🙏', '🌟', '💯', '🤝', '🚀']);

// 生命周期钩子
onMounted(() => {
  // 获取页面参数 - 使用新的工具函数
  const query = getPageParams();
  
  // 设置团队ID
  if (query.id) {
    teamInfo.value.id = query.id;
  }
  
  // 设置团队名称
  if (query.name) {
    teamInfo.value.name = decodeURIComponent(query.name);
  }
  
  // 设置团队状态
  if (query.status) {
    teamInfo.value.status = query.status;
  }
  
  // 设置团队状态文本
  if (query.statusText) {
    teamInfo.value.statusText = decodeURIComponent(query.statusText);
  } else {
    // 根据状态生成状态文本
    switch (teamInfo.value.status) {
      case '0': teamInfo.value.statusText = '招募中'; break;
      case '1': teamInfo.value.statusText = '已满员'; break;
      case '2': teamInfo.value.statusText = '已结束'; break;
      case '3': teamInfo.value.statusText = '已解散'; break;
      case '4': teamInfo.value.statusText = '比赛中'; break;
      case 'active': teamInfo.value.statusText = '进行中'; break;
      case 'completed': teamInfo.value.statusText = '已完成'; break;
      case 'pending': teamInfo.value.statusText = '待处理'; break;
      default: teamInfo.value.statusText = '未知状态';
    }
  }
  
  // 设置成员数量
  if (query.memberCount) {
    teamInfo.value.memberCount = parseInt(query.memberCount) || 0;
  }
  
  // 模拟加载数据
    setTimeout(() => {
    // 如果没有团队信息，则设置默认值
    if (!teamInfo.value.name) {
      teamInfo.value.name = '登录模块开发小组';
      teamInfo.value.status = 'active';
      teamInfo.value.statusText = '进行中';
      teamInfo.value.memberCount = 5;
      teamInfo.value.description = '负责系统登录模块设计和实现，包括用户验证、权限管理和安全策略制定。';
    }
    
    loading.value = false;
  }, 1000);
});

// 方法定义
// 团队导航和切换
function navigateBack() {
  // 返回上一页
  uni.navigateBack({

  });
}

function refreshTeamSpace() {
  refreshing.value = true;
  // 模拟刷新数据
  setTimeout(() => {
    refreshing.value = false;
  }, 1000);
}

function getTeamInitials(name) {
  if (!name) return '';
  return name.substring(0, 2);
}

function getStatusClass(status) {
  switch (status) {
    case 'active':
      return 'status-active';
    case 'completed':
      return 'status-completed';
    case 'pending':
      return 'status-pending';
    default:
      return '';
  }
}

function switchTab(tab) {
  activeTab.value = tab;
}

function getTabTitle() {
  switch (activeTab.value) {
    case 'announcement':
      return '团队公告';
    case 'files':
      return '文件共享';
    case 'tasks':
      return '任务看板';
    case 'chat':
      return '团队聊天';
    case 'calendar':
      return '团队日历';
    case 'members':
      return '成员管理';
    default:
      return '';
  }
}

// 团队公告相关方法
function handleCreateAnnouncement() {
  uni.showToast({
    title: '创建公告功能开发中',
    icon: 'none'
  });
}

// 文件共享相关方法
function handleFileUpload() {
  uni.showToast({
    title: '文件上传功能开发中',
    icon: 'none'
  });
  hideMoreActions();
}

// 任务看板相关方法
function handleCreateTask() {
  uni.showToast({
    title: '创建任务功能开发中',
    icon: 'none'
  });
}

// 团队聊天相关方法
function handleSendMessage(messageData) {
  // 创建新消息
  const newMessage = {
    id: Date.now().toString(),
    userId: currentUserId.value,
    userName: '我',
    avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/675b261911764dd9bdf6ad7942fec558.png',
    type: messageData.type,
    content: messageData.content,
    sendTime: new Date()
  };
  
  // 如果是文件类型，添加文件相关信息
  if (messageData.type === 'file' && messageData.fileName) {
    newMessage.fileName = messageData.fileName;
    newMessage.fileSize = messageData.fileSize;
  }
  
  // 添加消息到组件
  nextTick(async () => {
    teamChatRef.value.addMessage(newMessage);
  });
  
  // 模拟对方正在输入
  setTimeout(() => {
    teamChatRef.value.showTypingIndicator('张');
    
    // 模拟回复
    if (Math.random() > 0.3) {
      const replyDelay = 1500 + Math.random() * 2000;
      
    setTimeout(() => {
        // 随机回复内容
        const replies = [
          '好的，我明白了',
          '这个想法不错',
          '稍等，我确认一下',
          '同意你的观点',
          '这个问题我们需要讨论一下'
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMessage = {
          id: Date.now().toString(),
          userId: '1002',
          userName: '张三',
          avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png',
          type: 'text',
          content: randomReply,
          sendTime: new Date()
        };
        
        nextTick(async () => {
          teamChatRef.value.addMessage(replyMessage);
        });
      }, replyDelay);
    }
  }, 500);
}

function handleLoadMoreMessages(callback) {
  // 模拟加载更多消息
  setTimeout(() => {
    callback && callback();
  }, 1000);
}

function showMoreActions() {
  showMoreActionsPopup.value = true;
}

function hideMoreActions() {
  showMoreActionsPopup.value = false;
}

function showEmojiPicker() {
  showEmojiPickerPopup.value = true;
}

function hideEmojiPicker() {
  showEmojiPickerPopup.value = false;
}

function insertEmoji(emoji) {
  // 向聊天输入框插入表情
  // 实际应用中需要实现跨组件通信
  hideEmojiPicker();
}

function handleImageUpload() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      handleSendMessage({
        type: 'image',
        content: tempFilePath
      });
    }
  });
  hideMoreActions();
}

// 其他操作方法
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
      handleSendMessage({
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
  switchTab('calendar');
  hideMoreActions();
}

// 团队日历相关方法
function handleCreateEvent(date) {
  uni.showToast({
    title: '创建日程功能开发中',
    icon: 'none'
  });
}

function handleViewEvent(event) {
  uni.showToast({
    title: `查看日程: ${event.title}`,
    icon: 'none'
  });
}

function handleEditEvent(event) {
  uni.showToast({
    title: `编辑日程: ${event.title}`,
    icon: 'none'
  });
}

function handleDeleteEvent(event) {
  // 事件删除已在日历组件内处理
}

// 成员管理相关方法
function handleInviteMember() {
  uni.showToast({
    title: '邀请成员功能开发中',
    icon: 'none'
  });
}

function handleContactMember(member) {
  uni.showToast({
    title: `联系${member.userName}`,
    icon: 'none'
  });
}

function handleViewMemberProfile(member) {
  uni.showToast({
    title: `查看${member.userName}的资料`,
    icon: 'none'
  });
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

.back-icon {
  font-family: "iconfont";
  font-size: 36rpx;
  color: #333333;
  transform: rotate(180deg);
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
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-circle {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999999;
}

.content-scroll {
  height: 100%;
}

/* 团队信息卡片 */
.team-info-card {
  margin: 30rpx;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.team-header {
  display: flex;
  align-items: center;
}

.team-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  background-color: #3498db;
  display: flex;
  justify-content: center;
  align-items: center;
}

.team-avatar text {
  color: #ffffff;
  font-size: 40rpx;
  font-weight: bold;
}

.team-basic-info {
  margin-left: 20rpx;
  flex: 1;
}

.team-name-row {
  display: flex;
  align-items: center;
}

.team-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
}

.team-status {
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  font-size: 22rpx;
}

.status-active {
  background-color: #e1f5fe;
  color: #0288d1;
}

.status-completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-pending {
  background-color: #fff8e1;
  color: #ffa000;
}

.team-members-count {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666666;
}

.team-members-count text:first-child {
  margin-right: 8rpx;
}

.team-description {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

/* 功能模块 */
.feature-modules {
  margin: 0 30rpx 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 10rpx 0;
}

.module-row {
  display: flex;
  justify-content: space-around;
  padding: 15rpx 0;
}

.module-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  position: relative;
  transition: all 0.3s ease;
}

.module-item:active {
  background-color: #f9f9f9;
}

.module-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 6rpx;
  background-color: #3498db;
  border-radius: 3rpx;
}

.module-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.module-icon:active {
  transform: scale(0.95);
}

.module-icon-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

.module-title {
  font-size: 26rpx;
  color: #333333;
}

.announcement {
  background-color: #ff7043; /* 橙红色 */
}

.files {
  background-color: #66bb6a; /* 绿色 */
}

.tasks {
  background-color: #42a5f5; /* 蓝色 */
}

.chat {
  background-color: #ab47bc; /* 紫色 */
}

.calendar {
  background-color: #ffb74d; /* 橙色 */
}

.members {
  background-color: #29b6f6; /* 亮蓝色 */
}

/* 标签页内容 */
.tab-content {
  margin: 0 30rpx 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.tab-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.tab-body {
  min-height: 400rpx;
}

/* 聊天相关样式 */
.chat-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9f9;
}

.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 800rpx; /* 固定高度 */
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.chat-messages {
  flex: 1;
  padding: 20rpx 30rpx;
  height: calc(100% - 160rpx); /* 减去输入框高度 */
  box-sizing: border-box;
}

.chat-footer {
  position: relative;
  min-height: 160rpx; /* 输入区域最小高度 */
  border-top: 1rpx solid #f0f0f0;
  background-color: #ffffff;
}

.loading-more {
  text-align: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #999999;
}

.message-item {
  display: flex;
  margin-bottom: 20rpx; /* 增加消息间的间距 */
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

.message-time {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
  text-align: right;
}

.self-message .message-time {
  text-align: right;
}

.message-item:not(.self-message) .message-time {
  text-align: left;
}

/* 快捷回复样式 */
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

/* 输入框样式 */
.chat-input-area {
  padding: 20rpx 30rpx;
  background-color: #ffffff;
}

.input-container {
  display: flex;
  flex-direction: column;
}

.chat-input {
  width: 100%;
  min-height: 80rpx;
  max-height: 120rpx; /* 限制最大高度 */
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666666;
  border-radius: 30rpx;
}

.text-btn {
  background-color: #f0f0f0;
  transition: all 0.2s ease;
}

.text-btn:active {
  background-color: #e0e0e0;
}

.action-text {
  font-size: 24rpx;
}

.send-btn {
  background-color: #3498db;
  color: #ffffff;
  padding: 0 30rpx;
}

.send-btn .action-text {
  color: #ffffff;
}

/* 输入提示动画 */
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-state.small {
  padding: 30rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.action-btn {
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #3498db;
  color: #ffffff;
}

/* 浮动操作按钮 */
.float-action-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  z-index: 100;
}

/* 更多操作弹出层 */
.more-actions-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1000;
}

.popup-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 40rpx 30rpx;
  transform: translateY(0);
  transition: transform 0.3s;
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
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.action-icon-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

.action-label {
  font-size: 26rpx;
  color: #333333;
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

/* 表情选择器 */
.emoji-picker {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1000;
}

.emoji-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding: 20rpx 30rpx;
  height: 400rpx;
}

.emoji-header {
  padding: 10rpx 0 20rpx;
  font-size: 28rpx;
  color: #666;
  border-bottom: 1rpx solid #f0f0f0;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 0;
}

.emoji-item {
  width: 12.5%;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  transition: all 0.2s ease;
}

.emoji-item:active {
  transform: scale(1.2);
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

/* 系统消息样式 */
.system-message {
  justify-content: center;
  margin: 15rpx 0; /* 减小系统消息上下间距 */
}

.system-message .message-content {
  max-width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.system-bubble {
  background-color: rgba(0, 0, 0, 0.05) !important;
  padding: 12rpx 24rpx !important;
  border-radius: 30rpx !important;
  color: #666666 !important;
  font-size: 24rpx !important;
}

.system-message .message-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 6rpx;
  text-align: center !important;
}

/* 时间分割线 */
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
</style>