<template>
  <view class="tab-bar">
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'home' }" 
      @click="switchTab('home')"
    >
      <text class="iconfont icon-home"></text>
      <text class="tab-text">首页</text>
      <view v-if="activeTab === 'home'" class="active-indicator"></view>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'competition' }" 
      @click="switchTab('competition')"
    >
      <text class="iconfont icon-trophy"></text>
      <text class="tab-text">竞赛</text>
      <view v-if="activeTab === 'competition'" class="active-indicator"></view>
    </view>
    <view class="publish-btn-container">
      <view class="publish-btn pulse" @click="showPublishOptions">
        <text class="iconfont icon-plus"></text>
      </view>
      <text class="publish-text">发布</text>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'team' }" 
      @click="switchTab('team')"
    >
      <text class="iconfont icon-users"></text>
      <text class="tab-text">队伍</text>
      <view v-if="activeTab === 'team'" class="active-indicator"></view>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'profile' }" 
      @click="switchTab('profile')"
    >
      <text class="iconfont icon-user"></text>
      <text class="tab-text">我的</text>
      <view v-if="activeTab === 'profile'" class="active-indicator"></view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home',
    validator: (value) => ['home', 'competition', 'team', 'profile'].includes(value)
  }
});

const emit = defineEmits(['tab-change', 'publish']);

// 切换底部标签
function switchTab(tab) {
  if (tab !== props.activeTab) {
    emit('tab-change', tab);
    // 直接在组件内处理跳转
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
    } else if (tab === 'profile') {
      uni.switchTab({
        url: '/pages/profile/index'
      });
    }
  }
}

// 显示发布选项
function showPublishOptions() {
  emit('publish');
}
</script>

<style lang="scss">
// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-muted: #36364e;

// 动画
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// 底部导航栏
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: $card-color;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 100%;
    
    .iconfont {
      font-size: 44rpx;
      color: $text-muted;
    }
    
    .tab-text {
      font-size: 22rpx;
      color: $text-muted;
      margin-top: 6rpx;
    }
    
    &.active {
      .iconfont,
      .tab-text {
        color: $primary-color;
        font-weight: 500;
      }
    }
    
    .active-indicator {
      position: absolute;
      bottom: 10rpx;
      width: 40rpx;
      height: 6rpx;
  
      border-radius: 3rpx;
    }
  }
  
  .publish-btn-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120rpx;
    
    .publish-btn {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: linear-gradient(to right, $primary-color, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.3);
      position: relative;
      top: -30rpx;
      
      &.pulse {
        animation: pulse 2s infinite;
      }
      
      .iconfont {
        color: white;
        font-size: 40rpx;
      }
    }
    
    .publish-text {
      font-size: 22rpx;
      color: $text-muted;
      margin-top: -16rpx;
    }
  }
}
</style> 