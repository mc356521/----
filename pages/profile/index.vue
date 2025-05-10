<template>
  <view class="container">
    <!-- 顶部用户信息区 -->
    <view class="user-info-section">
      <view class="user-header">
        <image class="user-avatar" src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200" mode="aspectFill"></image>
        <view class="user-details">
          <text class="user-name">李明</text>
          <text class="user-id">学号: 2023114514</text>
        </view>
        <view class="edit-btn" @click="goToNotification">
          <text class="iconfont icon-edit"></text>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-value">4</text>
          <text class="stat-label">参与竞赛</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">2</text>
          <text class="stat-label">我的团队</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">1</text>
          <text class="stat-label">获得奖项</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('myCompetitions')">
          <text class="iconfont icon-trophy menu-icon"></text>
          <text class="menu-text">我的竞赛</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('myTeams')">
          <text class="iconfont icon-users menu-icon"></text>
          <text class="menu-text">我的团队</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('myAwards')">
          <text class="iconfont icon-star menu-icon"></text>
          <text class="menu-text">我的获奖</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('applications')">
          <text class="iconfont icon-paper-plane menu-icon"></text>
          <text class="menu-text">申请管理</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('settings')">
          <text class="iconfont icon-settings menu-icon"></text>
          <text class="menu-text">账号设置</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('feedback')">
          <text class="iconfont icon-feedback menu-icon"></text>
          <text class="menu-text">意见反馈</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('about')">
          <text class="iconfont icon-info-circle menu-icon"></text>
          <text class="menu-text">关于我们</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
      </view>
    </view>
    
    <!-- 注销按钮 -->
    <view class="logout-btn" @click="logout">
      <text>退出登录</text>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar 
      active-tab="profile" 
      @tab-change="handleTabChange" 
      @publish="showPublishOptions">
    </tab-bar>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import TabBar from '@/components/TabBar.vue';

// 导航到对应页面
function navigateTo(page) {
  if (page === 'applications') {
    uni.navigateTo({
      url: '/pages/application/application'
    });
    return;
  }
  
  uni.showToast({
    title: `跳转到${page}`,
    icon: 'none'
  });
}

// 退出登录
function logout() {
  uni.showModal({
    title: '退出确认',
    content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login/login'
              });
            }, 1500);
          }
        });
      }
    }
  });
}
 
// 跳转到消息
function goToNotification() {
  uni.navigateTo({
    url: '/pages/Xiaoxi/Xiaoxi'
  });
}

// 处理标签切换
function handleTabChange(tab) {
  if (tab === 'home') {
    uni.switchTab({
      url: '/pages/index/index'
    });
  } else if (tab === 'competition') {
    uni.switchTab({
      url: '/pages/competition/index'
    });
  } else if (tab === 'team') {
    uni.switchTab({
      url: '/pages/team/list'
    });
  }
}

// 显示发布选项
function showPublishOptions() {
  uni.showActionSheet({
    itemList: ['发布竞赛信息', '招募队友', '发布项目展示'],
    success: function (res) {
      uni.showToast({
        title: `选择了: ${res.tapIndex}`,
        icon: 'none'
      });
    }
  });
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #F3F4F6;

page {
  background-color: $background-color;
  padding-bottom: 140rpx;
}

.container {
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 用户信息区域
.user-info-section {
  background-color: $card-color;
  padding: 40rpx 30rpx 30rpx;
  margin-bottom: 20rpx;
  
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .user-avatar {
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      margin-right: 30rpx;
      border: 4rpx solid rgba(59, 130, 246, 0.2);
    }
    
    .user-details {
      flex: 1;
      
      .user-name {
        font-size: 36rpx;
        font-weight: bold;
        color: $text-color;
        margin-bottom: 8rpx;
      }
      
      .user-id {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
    
    .edit-btn {
      width: 60rpx;
      height: 60rpx;
      background-color: $border-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 32rpx;
        color: $text-secondary;
      }
    }
  }
  
  .user-stats {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0 10rpx;
    border-top: 2rpx solid $border-color;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-value {
        font-size: 36rpx;
        font-weight: bold;
        color: $primary-color;
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }
}

// 菜单区域
.menu-section {
  margin-bottom: 40rpx;
  
  .menu-group {
    background-color: $card-color;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      border-bottom: 2rpx solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        font-size: 40rpx;
        color: $primary-color;
        margin-right: 20rpx;
      }
      
      .menu-text {
        flex: 1;
        font-size: 28rpx;
        color: $text-color;
      }
      
      .menu-arrow {
        font-size: 28rpx;
        color: $text-muted;
        transform: rotate(180deg);
      }
    }
  }
}

// 注销按钮
.logout-btn {
  margin: 0 40rpx;
  height: 90rpx;
  background-color: $card-color;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
  font-size: 30rpx;
  font-weight: 500;
}
</style>