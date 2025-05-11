<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="header-title">编辑基本信息</text>
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
    <scroll-view scroll-y class="content-scroll" v-else>
      <view class="form-section">
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input 
            class="form-input" 
            type="text" 
            v-model="userInfo.realName" 
            placeholder="请输入真实姓名" 
            maxlength="20" 
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">学校</text>
          <picker 
            class="form-picker" 
            :range="schoolOptions" 
            range-key="name" 
            :value="selectedSchoolIndex" 
            @change="onSchoolChange">
            <view class="picker-text">{{ selectedSchoolName || '请选择学校' }}</view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">专业</text>
          <input 
            class="form-input" 
            type="text" 
            v-model="userInfo.major" 
            placeholder="请输入专业" 
            maxlength="30" 
          />
        </view>
        
        <view class="form-item form-item-last">
          <text class="form-label">手机号</text>
          <view class="form-text">{{ userInfo.phoneNumber || '未设置' }}</view>
        </view>
      </view>
      
      <text class="form-tip">注意：学号和角色信息不可修改</text>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import userApi from '@/api/modules/user';

// 用户信息状态
const userInfo = ref({
  realName: '',
  phoneNumber: '',
  schoolId: null,
  schoolName: '',
  major: '',
  studentTeacherId: ''
});

// 加载状态
const loading = ref(true);

// 学校选择器数据
const schoolOptions = ref([]);
const selectedSchoolIndex = computed(() => {
  if (!userInfo.value.schoolId || schoolOptions.value.length === 0) return 0;
  const index = schoolOptions.value.findIndex(school => school.id === userInfo.value.schoolId);
  return index >= 0 ? index : 0;
});

const selectedSchoolName = computed(() => {
  return userInfo.value.schoolName || '请选择学校';
});

// 获取用户个人资料
async function getUserProfile() {
  try {
    loading.value = true;
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      console.log('获取到用户资料:', userInfo.value);
      await getSchools(); // 获取到用户信息后再获取学校列表
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

// 获取学校列表
async function getSchools() {
  try {
    const res = await userApi.getSchools();
    if (res.code === 200 && res.data) {
      schoolOptions.value = res.data;
    } else {
      console.error('获取学校列表失败:', res.message);
    }
  } catch (error) {
    console.error('获取学校列表失败:', error);
  }
}

// 处理学校选择变化
function onSchoolChange(e) {
  const index = e.detail.value;
  if (index >= 0 && index < schoolOptions.value.length) {
    const selectedSchool = schoolOptions.value[index];
    userInfo.value.schoolId = selectedSchool.id;
    userInfo.value.schoolName = selectedSchool.name;
  }
}

// 保存修改
async function saveChanges() {
  if (!userInfo.value.realName || userInfo.value.realName.trim() === '') {
    uni.showToast({
      title: '姓名不能为空',
      icon: 'none'
    });
    return;
  }
  
  if (!userInfo.value.schoolId) {
    uni.showToast({
      title: '请选择学校',
      icon: 'none'
    });
    return;
  }
  
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
}

// 表单区域
.form-section {
  background-color: $card-color;
  border-radius: 16rpx;
  margin: 30rpx;
  padding: 20rpx;
  
  .form-item {
    padding: 24rpx 20rpx;
    border-bottom: 2rpx solid $border-color;
    
    &.form-item-last {
      border-bottom: none;
    }
    
    .form-label {
      font-size: 28rpx;
      color: $text-secondary;
      margin-bottom: 16rpx;
      display: block;
    }
    
    .form-input {
      width: 100%;
      height: 80rpx;
      background-color: $input-bg;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: $text-color;
    }
    
    .form-picker {
      width: 100%;
      height: 80rpx;
      background-color: $input-bg;
      border-radius: 12rpx;
      padding: 0 24rpx;
      display: flex;
      align-items: center;
      
      .picker-text {
        font-size: 28rpx;
        color: $text-color;
      }
    }
    
    .form-text {
      font-size: 28rpx;
      color: $text-color;
      line-height: 80rpx;
      padding: 0 24rpx;
    }
  }
}

.form-tip {
  font-size: 24rpx;
  color: $text-muted;
  padding: 0 30rpx;
  margin-bottom: 30rpx;
  display: block;
}
</style> 