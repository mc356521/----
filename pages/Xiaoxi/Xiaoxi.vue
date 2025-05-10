<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="navbar">
        <view class="title">通知</view>
        <view class="mark-read" @click="markAllAsRead">
          <text class="iconfont icon-check"></text>
          <text class="mark-text">全部标记为已读</text>
        </view>
      </view>
    </view>
    
    <!-- 标签页 -->
    <view class="tabs">
      <view 
        :class="['tab-item', activeTab === 'unread' ? 'tab-active' : '']" 
        @click="activeTab = 'unread'"
      >
        <text>未读</text>
        <text class="badge" v-if="unreadCount > 0">{{ unreadCount }}</text>
      </view>
      <view 
        :class="['tab-item', activeTab === 'all' ? 'tab-active' : '']" 
        @click="activeTab = 'all'"
      >
        <text>全部</text>
      </view>
    </view>
    
    <!-- 通知列表 -->
    <scroll-view scroll-y class="notification-list">
      <view v-if="activeTab === 'unread'">
        <view class="notification-item" v-for="(item, index) in unreadNotifications" :key="index">
          <view class="notification-avatar">
            <image :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
          </view>
          <view class="notification-content">
            <view class="notification-type">{{ item.type }}</view>
            <view class="notification-message">{{ item.message }}</view>
            <view class="notification-time">{{ item.time }}</view>
            
            <!-- 操作按钮 -->
            <view class="notification-actions" v-if="item.actions">
              <button 
                v-for="(action, idx) in item.actions" 
                :key="idx"
                :class="['action-btn', action.primary ? 'btn-primary' : 'btn-default']"
                @click="handleAction(action.type, item.id)"
              >
                {{ action.name }}
              </button>
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="activeTab === 'all'">
        <view class="notification-item" v-for="(item, index) in allNotifications" :key="index">
          <view class="notification-avatar">
            <image :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
          </view>
          <view class="notification-content">
            <view class="notification-type">{{ item.type }}</view>
            <view class="notification-message">{{ item.message }}</view>
            <view class="notification-time">{{ item.time }}</view>
            
            <!-- 操作按钮 -->
            <view class="notification-actions" v-if="item.actions">
              <button 
                v-for="(action, idx) in item.actions" 
                :key="idx"
                :class="['action-btn', action.primary ? 'btn-primary' : 'btn-default']"
                @click="handleAction(action.type, item.id)"
              >
                {{ action.name }}
              </button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 无通知状态 -->
      <view class="empty-state" v-if="(activeTab === 'unread' && unreadNotifications.length === 0) || 
                                    (activeTab === 'all' && allNotifications.length === 0)">
        <image class="empty-image" src="/static/empty-notification.png" mode="aspectFit"></image>
        <text class="empty-text">暂无{{ activeTab === 'unread' ? '未读' : '' }}通知</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 标签页状态
const activeTab = ref('unread');
const unreadCount = ref(2);

// 通知数据
const unreadNotifications = ref([
  {
    id: 1,
    type: '团队邀请',
    message: '张明邀请你加入"创新先锋队"参加创新创业大赛',
    time: '10分钟前',
    avatar: '/static/avatars/zhang.png',
    actions: [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ]
  },
  {
    id: 2,
    type: '新消息',
    message: '李华在"代码助手"团队中@你：能否帮忙解决一下这个问题？',
    time: '30分钟前',
    avatar: '/static/avatars/li.png',
    actions: [
      { name: '查看', type: 'view', primary: true }
    ]
  }
]);

// 所有通知，包括已读和未读
const allNotifications = ref([
  // 未读通知
  ...unreadNotifications.value,
  // 已读通知
  {
    id: 3,
    type: '系统通知',
    message: '您的团队"创业先锋"已审核通过，请及时查看',
    time: '2天前',
    avatar: '/static/avatars/system.png',
    read: true,
    actions: [
      { name: '查看', type: 'view', primary: true }
    ]
  },
  {
    id: 4,
    type: '好友申请',
    message: '王芳申请添加您为好友',
    time: '3天前',
    avatar: '/static/avatars/wang.png',
    read: true,
    actions: [
      { name: '同意', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ]
  }
]);

// 标记所有为已读
function markAllAsRead() {
  unreadNotifications.value.forEach(item => {
    const index = allNotifications.value.findIndex(n => n.id === item.id);
    if (index !== -1) {
      allNotifications.value[index].read = true;
    }
  });
  unreadNotifications.value = [];
  unreadCount.value = 0;
  
  uni.showToast({
    title: '已全部标记为已读',
    icon: 'success'
  });
}

// 处理按钮操作
function handleAction(type, id) {
  if (type === 'accept' && id === 1) {
    uni.showModal({
      title: '团队邀请',
      content: '确定接受加入"创新先锋队"？',
      success: function(res) {
        if (res.confirm) {
          // 从未读列表中移除
          removeNotification(id);
          uni.showToast({
            title: '已加入团队',
            icon: 'success'
          });
        }
      }
    });
  } else if (type === 'reject' && id === 1) {
    uni.showModal({
      title: '团队邀请',
      content: '确定拒绝加入"创新先锋队"？',
      success: function(res) {
        if (res.confirm) {
          // 从未读列表中移除
          removeNotification(id);
          uni.showToast({
            title: '已拒绝邀请',
            icon: 'none'
          });
        }
      }
    });
  } else if (type === 'view') {
    if (id === 2) {
      // 导航到团队聊天页面
      uni.navigateTo({
        url: '/pages/team/chat?id=代码助手'
      });
      // 从未读列表中移除
      removeNotification(id);
    } else {
      // 导航到相应页面
      uni.navigateTo({
        url: '/pages/notification/detail?id=' + id
      });
    }
  }
}

// 从未读列表中移除通知
function removeNotification(id) {
  const index = unreadNotifications.value.findIndex(item => item.id === id);
  if (index !== -1) {
    unreadNotifications.value.splice(index, 1);
    unreadCount.value--;
    
    // 更新全部通知列表中的状态
    const allIndex = allNotifications.value.findIndex(item => item.id === id);
    if (allIndex !== -1) {
      allNotifications.value[allIndex].read = true;
    }
  }
}

onMounted(() => {
  // 可以在这里加载通知数据
  // 如果有接口的话，可以请求API获取数据
  console.log('通知页面加载完成');
});
</script>

<style lang="scss">
/* 使用项目色彩系统 */
$primary-color: #4A90E2; // 活力蓝
$secondary-color: #7ED321; // 校园绿
$accent-color: #FF6B6B; // 竞赛橙
$bg-color: #f5f5f5;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;
$border-color: #eeeeee;

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

.header {
  background-color: #fff;
  position: relative;
  z-index: 10;
  
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100rpx;
    padding: 0 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
    }
    
    .mark-read {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: $primary-color;
      
      .iconfont {
        margin-right: 8rpx;
        font-size: 32rpx;
      }
    }
  }
}

.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 2rpx solid $border-color;
  position: relative;
  z-index: 9;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    position: relative;
    color: $text-secondary;
    font-size: 30rpx;
    
    .badge {
      display: inline-block;
      background-color: $accent-color;
      color: #fff;
      border-radius: 20rpx;
      font-size: 22rpx;
      padding: 2rpx 12rpx;
      margin-left: 8rpx;
      min-width: 16rpx;
      text-align: center;
    }
  }
  
  .tab-active {
    color: $primary-color;
    font-weight: bold;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: $primary-color;
      border-radius: 2rpx;
    }
  }
}

.notification-list {
  flex: 1;
  background-color: $bg-color;
}

.notification-item {
  display: flex;
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 2rpx;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 30rpx;
    right: 30rpx;
    height: 2rpx;
    background-color: $border-color;
  }
  
  &:last-child:after {
    display: none;
  }
  
  .notification-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    overflow: hidden;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .notification-content {
    flex: 1;
    
    .notification-type {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .notification-message {
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.4;
      margin-bottom: 12rpx;
    }
    
    .notification-time {
      font-size: 24rpx;
      color: $text-light;
      margin-bottom: 16rpx;
    }
    
    .notification-actions {
      display: flex;
      gap: 20rpx;
      
      .action-btn {
        padding: 10rpx 24rpx;
        font-size: 26rpx;
        border-radius: 8rpx;
        background-color: #f0f0f0;
        color: $text-secondary;
        line-height: 1.5;
        min-width: 120rpx;
        text-align: center;
      }
      
      .btn-primary {
        background-color: $primary-color;
        color: #fff;
      }
      
      .btn-default {
        background-color: #f0f0f0;
        color: $text-secondary;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
}
</style>