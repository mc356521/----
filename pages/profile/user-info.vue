<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">个人资料</text>
      <view class="right-placeholder"></view>
    </view>
    
    <!-- 加载中显示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-circle"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 个人资料内容 -->
    <scroll-view scroll-y class="content-scroll" v-else>
      <!-- 头像区域 -->
      <view class="avatar-section">
        <image 
          class="avatar" 
          :src="userInfo.avatarUrl || 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200'" 
          mode="aspectFill"
        ></image>
        <view class="change-avatar-btn" @click="changeAvatar">
          <text>更换头像</text>
        </view>
      </view>
      
      <!-- 基本信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="edit-btn" @click="editBasicInfo">
            <SvgIcon name="bianji" size="20"></SvgIcon>
            <text class="edit-text">编辑</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="item-label">姓名</text>
          <text class="item-value">{{ userInfo.realName }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">手机号</text>
          <text class="item-value">{{ userInfo.phoneNumber }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">学号</text>
          <text class="item-value">{{ userInfo.studentTeacherId }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">学校</text>
          <text class="item-value">{{ userInfo.schoolName }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">专业</text>
          <text class="item-value">{{ userInfo.major }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">角色</text>
          <text class="item-value">{{ userInfo.role === 'student' ? '学生' : userInfo.role === 'teacher' ? '教师' : '管理员' }}</text>
        </view>
        
        <view class="info-item">
          <text class="item-label">信用分</text>
          <text class="item-value credit-score">{{ userInfo.creditScore }}</text>
        </view>
      </view>
      
      <!-- 个人简介卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">个人简介</text>
          <view class="edit-btn" @click="editBio">
            <SvgIcon name="bianji" size="20"></SvgIcon>
            <text class="edit-text">编辑</text>
          </view>
        </view>
        
        <view class="bio-content">
          <text>{{ userInfo.bio || '暂无个人简介，点击右上角编辑添加' }}</text>
        </view>
      </view>
      
      <!-- 技能标签卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">技能标签</text>
          <view class="edit-btn" @click="editSkills">
            <SvgIcon name="bianji" size="20"></SvgIcon>
            <text class="edit-text">编辑</text>
          </view>
        </view>
        
        <view class="skills-container">
          <view class="skill-tag" v-for="(skill, index) in userInfo.skillTags" :key="index">
            <text>{{ skill }}</text>
          </view>
          <view class="empty-skills" v-if="!userInfo.skillTags || userInfo.skillTags.length === 0">
            <text>暂无技能标签，点击右上角编辑添加</text>
          </view>
        </view>
      </view>
      
      <!-- 获奖经历卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">获奖经历</text>
          <view class="edit-btn" @click="editAwards">
            <SvgIcon name="bianji" size="20"></SvgIcon>
            <text class="edit-text">编辑</text>
          </view>
        </view>
        
        <view class="awards-container">
          <view class="award-item" v-for="(award, index) in userInfo.awardsHistory" :key="index">
            <view class="award-header">
              <text class="award-name">{{ award.awardName }}</text>
              <text class="award-level">{{ award.level }}</text>
            </view>
            <view class="award-detail">
              <text class="award-org">{{ award.organization }}</text>
              <text class="award-time">{{ award.awardTime }}</text>
            </view>
          </view>
          <view class="empty-awards" v-if="!userInfo.awardsHistory || userInfo.awardsHistory.length === 0">
            <text>暂无获奖经历，点击右上角编辑添加</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 悬浮刷新按钮 -->
    <view class="refresh-btn" @click="refreshUserInfo">
      <SvgIcon name="shuaxin" size="40"></SvgIcon>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userApi from '@/api/modules/user';
import SvgIcon from '@/components/SvgIcon.vue';
// 用户信息状态
const userInfo = ref({
  realName: '',
  phoneNumber: '',
  schoolId: null,
  schoolName: '',
  role: '',
  isVerified: false,
  creditScore: 0,
  major: '',
  studentTeacherId: '',
  avatarUrl: null,
  bio: '',
  skillTags: [],
  awardsHistory: []
});

// 加载状态
const loading = ref(true);
// 刷新状态
const isRefreshing = ref(false);

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

// 刷新用户信息
async function refreshUserInfo() {
  if (isRefreshing.value) return;
  
  isRefreshing.value = true;
  uni.showToast({
    title: '正在刷新...',
    icon: 'none',
    duration: 1000
  });
  
  try {
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
    } else {
      uni.showToast({
        title: res.message || '刷新失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('刷新用户资料失败:', error);
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    });
  } finally {
    isRefreshing.value = false;
  }
}

// 更换头像
function changeAvatar() {
  try {
    // 图片选择配置
    const imageOptions = {
      count: 1, // 最多可以选择的图片张数
      sizeType: ['compressed'], // 压缩图
      sourceType: ['album', 'camera'], // 从相册选择或拍照
      success: function(res) {
        try {
          console.log('选择图片成功:', res);
          const tempFilePath = res.tempFilePaths[0];
          
          // 检查图片格式 - 改进格式识别逻辑
          let fileExt = '';
          try {
            // 尝试从路径中提取扩展名
            const extMatch = tempFilePath.match(/\.([a-zA-Z0-9]+)$/);
            if (extMatch && extMatch[1]) {
              fileExt = extMatch[1].toLowerCase();
            }
          } catch (e) {
            console.error('提取文件扩展名失败:', e);
          }
          
          console.log('文件路径:', tempFilePath);
          console.log('识别到的扩展名:', fileExt);
          
          const allowedExts = ['jpg', 'jpeg', 'png'];
          
          // 如果无法从文件名识别扩展名，或者扩展名是png/jpg/jpeg，则允许上传
          // 真正的格式验证会在服务器端进行
          if (fileExt && !allowedExts.includes(fileExt)) {
            uni.showToast({
              title: '仅支持JPG、JPEG和PNG格式',
              icon: 'none'
            });
            return;
          }
          
          // 直接上传，不使用预览
          uni.showModal({
            title: '确认上传',
            content: '是否将选择的图片设为头像？',
            confirmColor: '#3B82F6',
            success: function(modalRes) {
              if (modalRes.confirm) {
                try {
                  uploadAvatar(tempFilePath);
                } catch (uploadErr) {
                  console.error('启动上传过程出错:', uploadErr);
                  uni.showToast({
                    title: '上传初始化失败',
                    icon: 'none'
                  });
                }
              }
            }
          });
        } catch (innerErr) {
          console.error('处理选中的图片时出错:', innerErr);
          uni.showToast({
            title: '处理图片错误',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('选择图片失败:', err);
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      },
      complete: function() {
        console.log('选择图片操作完成');
      }
    };
    
    // 选择图片
    uni.chooseImage(imageOptions);
  } catch (err) {
    console.error('调用选择图片API出错:', err);
    uni.showToast({
      title: '选择图片功能异常',
      icon: 'none'
    });
  }
}

// 上传头像到服务器
function uploadAvatar(filePath) {
  // 显示上传中提示
  const loadingText = '上传中';
  let dots = '';
  let loadingTimer = null;
  
  // 创建动态加载效果
  uni.showLoading({
    title: loadingText,
    mask: true
  });
  
  loadingTimer = setInterval(() => {
    dots = dots.length >= 3 ? '' : dots + '.';
    uni.showLoading({
      title: loadingText + dots,
      mask: true
    });
  }, 500);
  
  // 调用上传头像API
  userApi.uploadAvatar(filePath, (progress) => {
    console.log('上传进度:', progress);
    
    // 更新loading文字
    if (progress > 0) {
      uni.showLoading({
        title: `上传中 ${progress}%`,
        mask: true
      });
    }
  }).then(res => {
    // 清除loading计时器
    if (loadingTimer) {
      clearInterval(loadingTimer);
    }
    uni.hideLoading();
    
    if (res.code === 200 && res.data) {
      // 更新头像显示
      userInfo.value.avatarUrl = res.data.avatarUrl;
      
      // 标记头像已更新，以便在返回时通知父页面刷新
      uni.setStorageSync('avatar_updated', true);
      
      // 立即刷新本页面的头像显示
      // 重新获取用户资料
      getUserProfile();
      
      uni.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: res.message || '头像上传失败',
        icon: 'none'
      });
    }
  }).catch(error => {
    // 清除loading计时器
    if (loadingTimer) {
      clearInterval(loadingTimer);
    }
    uni.hideLoading();
    
    console.error('头像上传失败:', error);
    uni.showToast({
      title: '头像上传失败',
      icon: 'none'
    });
  });
}

// 编辑基本信息
function editBasicInfo() {
  uni.navigateTo({
    url: '/pages/profile/edit-basic-info'
  });
}

// 编辑个人简介
function editBio() {
  uni.navigateTo({
    url: '/pages/profile/edit-bio'
  });
}

// 编辑技能标签
function editSkills() {
  uni.navigateTo({
    url: '/pages/profile/edit-skills'
  });
}

// 编辑获奖经历
function editAwards() {
  uni.navigateTo({
    url: '/pages/profile/edit-awards'
  });
}

// 返回
function goBack() {
  // 判断是否上传了新头像
  const avatarUpdated = uni.getStorageSync('avatar_updated');
  
  if (avatarUpdated) {
    // 清除标记
    uni.removeStorageSync('avatar_updated');
    
    // 设置页面返回数据，通知上一页刷新头像
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.$vm) {
        // 尝试调用上一页的刷新方法
        if (typeof prevPage.$vm.refreshUserInfo === 'function') {
          // 直接调用上一页的刷新方法
          prevPage.$vm.refreshUserInfo();
        } else {
          // 不要直接设置属性，而是使用事件通信
          uni.$emit('profileUpdated');
        }
      }
    }
  }
  
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
$green-color: #10B981;

page {
  background-color: $background-color;
  padding-bottom: 40rpx;
}

.container {
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative; /* 为悬浮按钮定位 */
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
  
  .right-placeholder {
    width: 36rpx;
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

// 头像区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  
  .avatar {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    border: 4rpx solid rgba($primary-color, 0.2);
    margin-bottom: 20rpx;
  }
  
  .change-avatar-btn {
    background-color: rgba($primary-color, 0.1);
    padding: 10rpx 30rpx;
    border-radius: 30rpx;
    
    text {
      font-size: 24rpx;
      color: $primary-color;
    }
  }
}

// 信息卡片
.info-card {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .card-title {
      font-size: 28rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .edit-btn {
      display: flex;
      align-items: center;
      
      .iconfont {
        font-size: 26rpx;
        color: $primary-color;
        margin-right: 4rpx;
      }
      
      .edit-text {
        font-size: 24rpx;
        color: $primary-color;
      }
    }
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-label {
      font-size: 26rpx;
      color: $text-secondary;
    }
    
    .item-value {
      font-size: 26rpx;
      color: $text-color;
      font-weight: 500;
      
      &.credit-score {
        color: $green-color;
      }
    }
  }
  
  .bio-content {
    padding: 16rpx 0;
    
    text {
      font-size: 26rpx;
      color: $text-color;
      line-height: 1.6;
    }
  }
  
  // 技能标签样式
  .skills-container {
    display: flex;
    flex-wrap: wrap;
    padding: 16rpx 0;
    gap: 16rpx;
    
    .skill-tag {
      padding: 8rpx 20rpx;
      background-color: rgba($primary-color, 0.1);
      border-radius: 30rpx;
      
      text {
        font-size: 24rpx;
        color: $primary-color;
      }
    }
    
    .empty-skills {
      width: 100%;
      text-align: center;
      padding: 20rpx 0;
      
      text {
        font-size: 24rpx;
        color: $text-muted;
      }
    }
  }
  
  // 获奖经历样式
  .awards-container {
    padding: 16rpx 0;
    
    .award-item {
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid $border-color;
      
      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      
      .award-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
        
        .award-name {
          font-size: 26rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .award-level {
          font-size: 24rpx;
          color: $primary-color;
          background-color: rgba($primary-color, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
      
      .award-detail {
        display: flex;
        justify-content: space-between;
        
        .award-org, .award-time {
          font-size: 24rpx;
          color: $text-secondary;
        }
      }
    }
    
    .empty-awards {
      width: 100%;
      text-align: center;
      padding: 20rpx 0;
      
      text {
        font-size: 24rpx;
        color: $text-muted;
      }
    }
  }
}

// 悬浮刷新按钮
.refresh-btn {
  position: fixed;
  right: 30rpx;
  bottom: 60rpx;
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
  z-index: 100;
  
  .iconfont {
    font-size: 40rpx;
    color: #ffffff;
  }
  
  .refreshing {
    animation: spin 1s linear infinite;
  }
}
</style> 