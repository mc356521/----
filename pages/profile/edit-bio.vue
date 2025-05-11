<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="header-title">编辑个人简介</text>
      <view class="save-btn" @click="saveChanges">
        <text>保存</text>
      </view>
    </view>
    
    <!-- 加载中显示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-circle"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 编辑表单 -->
    <view class="content-scroll" v-else>
      <view class="form-section">
        <textarea 
          class="bio-textarea" 
          v-model="userInfo.bio" 
          placeholder="请输入您的个人简介，介绍自己的专业背景、技术特长、研究方向等（1000字以内）" 
          maxlength="1000"
          auto-height
        ></textarea>
        <view class="text-count">{{ userInfo.bio ? userInfo.bio.length : 0 }}/1000</view>
      </view>
      
      <view class="tip-section">
        <text class="tip-title">写一个好的个人简介</text>
        <view class="tip-list">
          <view class="tip-item">
            <text class="dot">•</text>
            <text class="tip-text">介绍您的学习背景和专业领域</text>
          </view>
          <view class="tip-item">
            <text class="dot">•</text>
            <text class="tip-text">突出您的核心技能和特长</text>
          </view>
          <view class="tip-item">
            <text class="dot">•</text>
            <text class="tip-text">分享您的研究兴趣或项目经验</text>
          </view>
          <view class="tip-item">
            <text class="dot">•</text>
            <text class="tip-text">提及您期望的团队合作方式</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userApi from '@/api/modules/user';

// 用户信息状态
const userInfo = ref({
  bio: '',
  realName: '',
  schoolId: null,
  major: '',
  skillTags: [],
  awardsHistory: []
});

// 加载状态
const loading = ref(true);

// 获取用户个人资料
async function getUserProfile() {
  try {
    loading.value = true;
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      console.log('获取到用户资料:', userInfo.value);
    } else {
      uni.showToast({
        title: res.message || '获取资料失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
    uni.showToast({
      title: '获取个人资料失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 保存修改
async function saveChanges() {
  try {
    uni.showLoading({
      title: '保存中...'
    });
    
    // 准备要提交的数据
    const updateData = {
      realName: userInfo.value.realName,
      schoolId: userInfo.value.schoolId,
      major: userInfo.value.major,
      bio: userInfo.value.bio,
      skillTags: userInfo.value.skillTags || [],
      awardsHistory: userInfo.value.awardsHistory || []
    };
    
    const res = await userApi.updateUserProfile(updateData);
    
    if (res.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        goBack();
      }, 1500);
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('保存用户资料失败:', error);
    uni.showToast({
      title: '保存失败，请稍后再试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 返回
function goBack() {
  uni.navigateBack();
}

// 页面加载时获取用户资料
onMounted(() => {
  getUserProfile();
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
$input-bg: #F9FAFB;

page {
  background-color: $background-color;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 顶部导航栏
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: $card-color;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .back-btn {
    padding: 10rpx;
    
    .iconfont {
      font-size: 36rpx;
      color: $text-color;
    }
  }
  
  .header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .save-btn {
    padding: 10rpx 24rpx;
    background-color: $primary-color;
    border-radius: 30rpx;
    
    text {
      font-size: 26rpx;
      color: white;
    }
  }
}

// 加载中
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-circle {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 6rpx solid rgba($primary-color, 0.1);
    border-top-color: $primary-color;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 内容区域
.content-scroll {
  flex: 1;
  padding: 30rpx;
}

// 表单区域
.form-section {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  position: relative;
  margin-bottom: 30rpx;
  
  .bio-textarea {
    width: 100%;
    min-height: 300rpx;
    background-color: $input-bg;
    border-radius: 12rpx;
    padding: 24rpx;
    font-size: 28rpx;
    color: $text-color;
    line-height: 1.5;
  }
  
  .text-count {
    text-align: right;
    font-size: 24rpx;
    color: $text-muted;
    margin-top: 16rpx;
  }
}

// 提示区域
.tip-section {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .tip-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .tip-list {
    .tip-item {
      display: flex;
      margin-bottom: 16rpx;
      
      .dot {
        color: $primary-color;
        font-size: 28rpx;
        margin-right: 12rpx;
      }
      
      .tip-text {
        font-size: 26rpx;
        color: $text-secondary;
        flex: 1;
      }
    }
  }
}
</style> 