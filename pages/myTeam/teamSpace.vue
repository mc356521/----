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
			<view class="module-item" @click="gotoTUIRoom">
			  <view class="module-icon members">
			    <text class="module-icon-text">成员</text>
			  </view>
			  <text class="module-title">会议中心</text>
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
			  :team-name="teamInfo.name"
              @send="handleSendMessage"
              @loadMore="handleLoadMoreMessages"
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
import api from '@/api';
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
const messages = ref([]);
const teamChatRef = ref(null);
let userInfo={};

// 获取用户信息的函数，使用项目中已有的API模块
async function getUserInfo() {
	try {
		// 使用API模块中的parseUserRole方法获取用户信息
		const res = await api.user.getUserProfile();
		
		// 检查返回结果
		if (res && res.code === 200 && res.data) {
			console.log('获取用户信息成功:', res.data);
			return res.data;
		} else {
			console.error('获取用户信息失败:', res);
			return null;
		}
	} catch (error) {
		console.error('获取用户信息出错:', error);
		return null;
	}
}
// 生命周期钩子
onMounted(async () => {
  userInfo = await getUserInfo();
  console.log('用户信息21221121:', userInfo);
  
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
function gotoTUIRoom(){
  // 检查是否在app环境且plus对象是否可用
  // #ifdef APP-PLUS
  if (typeof plus !== 'undefined') {
    // plus相关操作
  }
  // #endif
  
  uni.navigateTo({
    url:'/pages/TUIRoom/TUIRoom?teamId=' + teamInfo.value.id + '&teamName=' + teamInfo.value.name
  })
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
    userId: teamInfo.value.id,
    flow: 'out',
    userName: '我',
    avatar: userInfo.avatarUrl,
    type: messageData.type,
    content: messageData.content,
    sendTime: new Date()
  };
 console.log('新消息:', userInfo.avatarUrl);
  // 如果是文件类型，添加文件相关信息
  if (messageData.type === 'file' && messageData.fileName) {
    newMessage.fileName = messageData.fileName;
    newMessage.fileSize = messageData.fileSize;
  }
  
  // 添加消息到组件
  nextTick(async () => {
    teamChatRef.value.addMessage(newMessage);
  });
}

function handleLoadMoreMessages(callback) {
  // 模拟加载更多消息
  setTimeout(() => {
    callback && callback();
  }, 1000);
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
</style>