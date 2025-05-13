<template>
  <view class="container">
    <!-- 顶部用户信息区 -->
    <view class="user-info-section">
      <!-- 加载中显示 -->
      <view class="loading-container" v-if="loading">
        <view class="loading-circle"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else>
        <view class="user-header">
          <view class="user-info-clickable" @click="goToUserInfo">
            <image class="user-avatar" :src="userInfo.avatarUrl || 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200'" mode="aspectFill"></image>
            <view class="user-details">
              <text class="user-name">{{ userInfo.realName }}</text>
              <text class="user-id">学号: {{ userInfo.studentTeacherId }}</text>
              <view class="user-school">
                <text class="school-name">{{ userInfo.schoolName }}</text>
                <text class="major-name">{{ userInfo.major }}</text>
              </view>
            </view>
          </view>
          <view class="edit-btn" @click="goToUserInfo">
            <SvgIcon name="bianji">22</SvgIcon>
          </view>
        </view>
        <view class="user-stats">
          <view class="stat-item" @click="navigateTo('myCompetitions')">
            <text class="stat-value">4</text>
            <text class="stat-label">参与竞赛</text>
          </view>
          <view class="stat-item" @click="navigateTo('myTeams')">
            <text class="stat-value">2</text>
            <text class="stat-label">我的团队</text>
          </view>
          <view class="stat-item" @click="navigateTo('myTask')">
            <text class="stat-value">{{ userInfo.awardsHistory ? userInfo.awardsHistory.length : 0 }}</text>
            <text class="stat-label">我的任务</text>
          </view>
          <view class="stat-item" @click="navigateTo('settings')">
            <text class="stat-value ">{{ userInfo.awardsCount || 0 }}</text>
            <text class="stat-label">我的获奖</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
  
        <view class="menu-item" @click="navigateTo('material-reward')">
          <text class="iconfont icon-users menu-icon"></text>
          <text class="menu-text">实物奖励</text>
          <text class="iconfont icon-arrow-left menu-arrow"></text>
        </view>
        <view class="menu-item" @click="navigateTo('myAwards')">
          <text class="iconfont icon-star menu-icon"></text>
          <text class="menu-text" @click="navigateTo('apply-badge')">勋章申请</text>
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
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import TabBar from '@/components/TabBar.vue';
import userApi from '@/api/modules/user';
import store from '@/store';
import SvgIcon from '@/components/SvgIcon.vue';
// 用户信息状态
const userInfo = ref({
  realName: '加载中...',
  phoneNumber: '',
  schoolId: null,
  schoolName: '',
  role: '',
  isVerified: false,
  creditScore: 0,
  major: '',
  studentTeacherId: '加载中...',
  avatarUrl: null,
  bio: '',
  skillTags: [],
  awardsHistory: []
});

// 加载状态
const loading = ref(true);
// 是否需要刷新用户信息
const needRefreshUserInfo = ref(false);

// 获取用户个人资料
async function getUserProfile() {
  try {
    loading.value = true;
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      console.log('个人中心页获取到用户资料:', userInfo.value);
    } else {
      console.error('获取用户资料失败:', res.message);
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
  } finally {
    loading.value = false;
  }
}

// 刷新用户信息（可以被其他页面调用）
function refreshUserInfo() {
  console.log('刷新用户信息');
  getUserProfile();
}

// 导航到对应页面
function navigateTo(page) {
  if (page === 'applications') {
    uni.navigateTo({
      url: '/pages/application/application'
    });
    return;
  }else if (page === 'apply-badge') {
    uni.navigateTo({
      url: '/pages/profile/apply-badge'
    });
    return;
  }else if (page === 'material-reward') {
    uni.navigateTo({
      url: '/pages/profile/material-reward'
    });
    return;
  }else if (page === 'myCompetitions') {
    uni.navigateTo({
      url: '/pages/mycompetitions/mycompetitions'
    });
    return;
  }
  else if (page === 'myTeams') {
    uni.navigateTo({
      url: '/pages/myTeam/myTeam'
    });
    return;
  }
  else if	(page=='myTask'){
  	uni.navigateTo({
  		url:'/pages/mytasks/index'
  	})
   return;
  }
  
}
// 退出登录
function logout() {
  uni.showModal({
    title: '退出确认',
    content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
       
        // 清除全局状态
        store.clearState();
      

          uni.removeStorageSync('userInteractionState');
          uni.removeStorageSync('_DC_STAT_UUID');
          uni.removeStorageSync('ai_recommend_cache_time');
          uni.removeStorageSync('ai_recommended_teams');
          uni.removeStorageSync('ai_summary');
          uni.removeStorageSync('token');

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

// 跳转到个人资料页面
function goToUserInfo() {
  uni.navigateTo({
    url: '/pages/profile/user-info'
  });
}

// 处理标签切换
function handleTabChange(tab) {
  if (tab === 'home') {
    uni.switchTab({
      url: '/pages/index/index'
    });
  } else if (tab === 'myCompetitions') {
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

// 页面加载时获取用户资料
onMounted(() => {
  getUserProfile();
  
  // 监听头像更新事件
  uni.$on('profileUpdated', () => {
    console.log('收到profileUpdated事件，刷新用户信息');
    refreshUserInfo();
  });
});

// 页面显示时检查是否需要刷新
onShow(() => {
  // 检查是否有头像更新标记
  const avatarUpdated = uni.getStorageSync('avatar_updated');
  if (avatarUpdated) {
    uni.removeStorageSync('avatar_updated');
    refreshUserInfo();
  }
});
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
  
  // 加载中样式
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    
    .loading-circle {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      border: 4rpx solid rgba($primary-color, 0.1);
      border-top-color: $primary-color;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }
    
    .loading-text {
      font-size: 26rpx;
      color: $text-secondary;
    }
  }
  
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .user-info-clickable {
      display: flex;
      align-items: center;
      flex: 1;
      position: relative;
      margin-right: 20rpx;
      
      &:active {
        opacity: 0.8;
      }
      
      &::after {
        content: '';
        position: absolute;
        right: -14rpx;
        top: 50%;
        width: 14rpx;
        height: 14rpx;
        border-top: 3rpx solid $text-muted;
        border-right: 3rpx solid $text-muted;
        transform: translateY(-50%) rotate(45deg);
        opacity: 0.5;
      }
      
      .user-avatar {
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
        margin-right: 30rpx;
        border: 4rpx solid rgba(59, 130, 246, 0.2);
        flex-shrink: 0;
      }
      
      .user-details {
        flex: 1;
        min-width: 0;
        
        .user-name {
          font-size: 36rpx;
          font-weight: bold;
          color: $text-color;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .user-id {
          font-size: 24rpx;
          color: $text-secondary;
          margin-bottom: 6rpx;
        }
        
        .user-school {
          font-size: 24rpx;
          color: $text-secondary;
          
          .school-name {
            margin-right: 16rpx;
          }
          
          .major-name {
            color: $text-muted;
          }
        }
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
      flex-shrink: 0;
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.95);
        background-color: rgba(59, 130, 246, 0.1);
      }
      
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
      position: relative;
      transition: transform 0.2s;
      
      &:active {
        transform: scale(0.95);
      }
      
      .stat-value {
        font-size: 36rpx;
        font-weight: bold;
        color: $primary-color;
        margin-bottom: 8rpx;
        
        &.credit-score {
          color: #10B981;
        }
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>