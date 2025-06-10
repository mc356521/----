<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">用户资料</text>
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
        <!-- 用户信息卡片 -->
        <view class="user-info-card">
          <view class="user-info-header">
            <view class="user-avatar-container">
              <image 
                class="user-avatar" 
                :src="userInfo.avatarUrl || 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200'" 
                mode="aspectFill"
              ></image>
            </view>
            <view class="user-basic-info">
              <text class="user-name">{{ userInfo.realName || '未设置姓名' }}</text>
              <view class="role-tag">
                <text>{{ userInfo.role === 'student' ? '学生' : userInfo.role === 'teacher' ? '教师' : '管理员' }}</text>
              </view>
            </view>
            
            <!-- 联系按钮 -->
            <view class="contact-btn" @click="contactUser">
              <SvgIcon name="message" size="16"></SvgIcon>
              <text>联系Ta</text>
            </view>
          </view>
          
          <view class="user-info-details">
            <view class="detail-item">
              <text class="detail-label">学校</text>
              <text class="detail-value">{{ userInfo.schoolName || '未设置' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">专业</text>
              <text class="detail-value">{{ userInfo.major || '未设置' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">信用分</text>
              <text class="detail-value credit-score">{{ userInfo.creditScore || 0 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 勋章展示区域 -->
        <view class="medals-container">
          <view class="medals-header">
            <view class="medals-title-wrapper">
              <text class="medals-title" style="margin-left: 25rpx;">荣誉勋章</text>
              <text class="medals-count">{{ medals.length || 0 }}个</text>
            </view>
            <view class="view-all-btn" @click="goToMedalDetail">
              <text>查看详情</text>
              <SvgIcon name="arrow-right" size="14"></SvgIcon>
            </view>
          </view>
          
          <!-- 勋章展示框 - 竖向滚动 -->
          <view class="medals-box">
            <scroll-view 
              class="medals-scroll" 
              scroll-y="true" 
              :show-scrollbar="true" 
              @scrolltolower="onScrollToBottom"
              :scroll-anchoring="true"
              :enhanced="true"
              :bounces="false"
            >
              <!-- 勋章网格 -->
              <view class="medals-grid">
                <view 
                  class="medal-item" 
                  v-for="(medal, index) in medals" 
                  :key="index"
                  @click="showMedalImage(medal)" >
                  <image 
                    class="medal-image" 
                    :src="medal.imageUrl" 
                    mode="aspectFit" 
                  ></image>
                  <text class="medal-name">{{ medal.name }}</text>
                </view>
                
                <!-- 暂无勋章时显示 -->
                <view class="empty-medals" v-if="!medals || medals.length === 0">
                  <image class="empty-medal-icon" src="/static/image/empty-medal.png" mode="aspectFit"></image>
                  <text>暂无勋章</text>
                </view>
                
                <!-- 滚动到底部的提示 -->
                <view v-if="medals && medals.length > 8 && showBottomTip" class="bottom-tip">
                  <text>已显示全部勋章</text>
                </view>

                <!-- 添加底部空白区域，防止内容被提示遮挡 -->
                <view class="bottom-space" v-if="medals && medals.length > 8"></view>
              </view>
            </scroll-view>
            
            <!-- 滚动提示 -->
            <view class="scroll-hint" v-if="medals && medals.length > 8 && !reachedBottom">
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
              <text>向下滑动查看更多</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 个人简介卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">个人简介</text>
        </view>
        
        <view class="bio-content">
          <text>{{ userInfo.bio || '该用户暂无个人简介' }}</text>
        </view>
      </view>
      
      <!-- 技能标签卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">技能标签</text>
        </view>
        
        <view class="skills-container">
          <view class="skill-tag" v-for="(skill, index) in userInfo.skillTags" :key="index">
            <text>{{ skill }}</text>
          </view>
          <view class="empty-skills" v-if="!userInfo.skillTags || userInfo.skillTags.length === 0">
            <text>该用户暂无技能标签</text>
          </view>
        </view>
      </view>
      
      <!-- 获奖经历卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">获奖经历</text>
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
            <text>该用户暂无获奖经历</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 勋章大图预览弹窗 -->
    <view class="medal-preview-overlay" v-if="showPreview" @click="closePreview">
      <view class="medal-preview-content" @click.stop>
        <view class="medal-preview-header">
          <text class="medal-preview-title">{{ currentMedal.name }}</text>
          <view class="medal-preview-close" @click="closePreview">
            <SvgIcon name="close" size="20"></SvgIcon>
          </view>
        </view>
        <image 
          class="medal-preview-image" 
          :src="currentMedal.imageUrl" 
          mode="aspectFit"
          :style="{ transform: `scale(${previewScale})` }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        ></image>
        <view class="medal-preview-info">
          <text class="medal-preview-desc">{{ currentMedal.description }}</text>
          <view class="medal-preview-hint">
            <text>双指缩放可调整图片大小</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, defineProps, onUnmounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import userApi from '@/api/modules/user';

// 定义props接收路由参数
const props = defineProps({
  userId: {
    type: [String, Number],
    default: ''
  }
});

// 用户ID参数
const userId = ref('');

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

// 用户勋章数据
const medals = ref([]);

// 底部提示状态
const reachedBottom = ref(false);
const showBottomTip = ref(false);

// 滚动到底部时触发
function onScrollToBottom() {
  reachedBottom.value = true;
  showBottomTip.value = true;
  
  // 3秒后隐藏底部提示，但不改变已滚动到底部的状态
  setTimeout(() => {
    showBottomTip.value = false;
  }, 3000);
}

// 获取用户ID参数
function getRouteParams() {
  // 从onLoad传入的参数或props中获取userId
  if (props.userId) {
    userId.value = props.userId;
    console.log('从props获取到用户ID:', userId.value);
    return;
  }
  
  // 尝试从页面参数中获取
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.options) {
    userId.value = currentPage.options.userId || '';
    console.log('从getCurrentPages获取到用户ID:', userId.value);
    return;
  }
  
  // 如果还获取不到，尝试从uni-app的全局对象获取
  const query = uni.getStorageSync('viewUserParams');
  if (query && query.userId) {
    userId.value = query.userId;
    console.log('从本地存储获取到用户ID:', userId.value);
    // 使用后清除存储
    uni.removeStorageSync('viewUserParams');
  }
}

// onLoad生命周期函数，在页面加载时获取参数
function onLoad(options) {
  console.log('页面onLoad, 接收参数:', options);
  if (options && options.userId) {
    userId.value = options.userId;
    console.log('从onLoad获取到用户ID:', userId.value);
  } else {
    // 没有直接获取到参数，尝试其他方法
    getRouteParams();
  }
}

// 获取对方用户勋章
async function getUserIdBadges() {
  try {
    const res = await userApi.getUserIdBadges(userId.value);
    if (res.code === 200 && res.data) {
      medals.value = res.data;
      console.log('获取到用户勋章:', medals.value);
    } else {
      console.error('获取勋章失败:', res.message);
    }
  } catch (error) {
    console.error('获取用户勋章失败:', error);
  }
}

// 获取他人用户资料
async function getUserProfile() {
  try {
    loading.value = true;
    
    // 调用API获取他人资料
    const res = await userApi.getUserProfileById(userId.value);
    
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
      title: '获取用户资料失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 联系用户
function contactUser() {
  uni.showModal({
    title: '联系用户',
    content: `是否要联系 ${userInfo.value.realName || '该用户'}？`,
    confirmColor: '#3B82F6',
    success: function(res) {
      if (res.confirm) {
        // 这里可以跳转到聊天页面或者其他联系方式
        uni.showToast({
          title: '即将跳转到聊天页面',
          icon: 'none'
        });
        
        // 模拟跳转到聊天页面
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/chat/index?userId=${userInfo.value.id}&userName=${userInfo.value.realName}`
          });
        }, 1000);
      }
    }
  });
}

// 返回
function goBack() {
  uni.navigateBack();
}

// 勋章大图预览相关
const showPreview = ref(false);
const currentMedal = ref({});
const previewScale = ref(1);
const touchStartDistance = ref(0);

// 显示勋章大图
function showMedalImage(medal) {
  currentMedal.value = medal;
  showPreview.value = true;
  previewScale.value = 1; // 重置缩放比例
}

// 关闭预览
function closePreview() {
  showPreview.value = false;
}

// 处理触摸开始事件（用于缩放）
function handleTouchStart(event) {
  if (event.touches.length === 2) {
    // 计算两个触摸点之间的距离
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    touchStartDistance.value = Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) + 
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  }
}

// 处理触摸移动事件（用于缩放）
function handleTouchMove(event) {
  if (event.touches.length === 2 && touchStartDistance.value > 0) {
    // 计算当前两个触摸点之间的距离
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) + 
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
    
    // 计算缩放因子（限制在0.5到3之间）
    const scaleFactor = currentDistance / touchStartDistance.value;
    previewScale.value = Math.max(0.5, Math.min(3, previewScale.value * scaleFactor));
    
    // 更新起始距离
    touchStartDistance.value = currentDistance;
  }
}

// 处理触摸结束事件
function handleTouchEnd() {
  touchStartDistance.value = 0;
}

// 根据稀有度获取发光效果
function getMedalEffectByRarity(rarity) {
  if (!rarity) return 'common_shine';
  
  switch (Number(rarity)) {
    case 6: return 'gold_glow';
    case 5: return 'purple_pulse';
    case 4: return 'blue_shimmer';
    case 3: return 'green_sparkle';
    default: return 'common_shine';
  }
}

// 跳转到勋章详情页
function goToMedalDetail() {
  uni.navigateTo({
    url: `/pages/profile/medal-detail?userId=${userId.value}`
  });
}

// 注册页面生命周期钩子
uni.$on('hook:onLoad', onLoad);

// 页面加载时获取用户资料和勋章
onMounted(() => {
  // 已经在onLoad中获取了userId，这里只需要加载数据
  if (!userId.value) {
    getRouteParams();
  }
  
  if (userId.value) {
    getUserProfile();
    getUserIdBadges();
  } else {
    console.error('无法获取用户ID，请检查传参');
    uni.showToast({
      title: '无法获取用户信息，请返回重试',
      icon: 'none'
    });
  }
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  uni.$off('hook:onLoad');
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
    font-size: 36rpx;
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
    font-size: 32rpx;
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
  padding: 20rpx;
  background-color: transparent;
  box-shadow: none;
}

// 用户信息卡片
.user-info-card {
  width: 100%;
  background-color: $card-color;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
}

.user-info-header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  position: relative;
}

.user-avatar-container {
  margin-right: 20rpx;
  position: relative;
  
  .user-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 2rpx solid rgba($primary-color, 0.2);
  }
}

.user-basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 8rpx;
}

.role-tag {
  align-self: flex-start;
  background-color: rgba($primary-color, 0.1);
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  
  text {
    font-size: 24rpx;
    color: $primary-color;
  }
}

.user-info-details {
  display: flex;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  
  .detail-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 0;
    
    &:not(:last-child) {
      border-right: 1rpx solid rgba(0, 0, 0, 0.05);
    }
    
    .detail-label {
      font-size: 24rpx;
      color: $text-secondary;
      margin-bottom: 6rpx;
    }
    
    .detail-value {
      font-size: 28rpx;
      font-weight: 500;
      color: $text-color;
      
      &.credit-score {
        color: $green-color;
      }
    }
  }
}

// 勋章展示区域
.medals-container {
  margin-top: 30rpx;
  width: 100%;
  
  .medals-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .medals-title-wrapper {
      display: flex;
      align-items: center;
      
      .medals-title {
        font-size: 32rpx;
        font-weight: bold;
        color: $text-color;
        margin-right: 10rpx;
      }
      
      .medals-count {
        font-size: 28rpx;
        color: $text-secondary;
      }
    }
  }
  
  .medals-box {
    width: 100%;
    border: 2rpx solid rgba($primary-color, 0.5);
    border-radius: 16rpx;
    overflow: hidden;
    height: 420rpx; // 固定高度，支持滚动
    position: relative; // 为滚动提示定位
  }
  
  .medals-scroll {
    width: 100%;
    height: 100%;
    
    &::-webkit-scrollbar {
      display: block;
      width: 8rpx;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba($primary-color, 0.5);
      border-radius: 6rpx;
    }
    
    &::-webkit-scrollbar-track {
      background-color: rgba($primary-color, 0.1);
      border-radius: 6rpx;
    }
  }
  
  .scroll-hint {
    position: absolute;
    bottom: 10rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.9));
    padding: 20rpx 0 10rpx;
    animation: bounce 1.5s infinite;
    
    text {
      font-size: 28rpx;
      color: $text-secondary;
      margin-top: 4rpx;
    }
  }
  
  .bottom-tip {
    width: 100%;
    text-align: center;
    padding: 16rpx 0;
    
    text {
      font-size: 28rpx;
      color: $text-muted;
    }
  }
  
  .bottom-space {
    width: 100%;
    height: 60rpx; // 底部留白，防止内容被提示遮挡
  }
  
  .medals-grid {
    display: flex;
    flex-wrap: wrap;
    .medal-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 25%;
      margin-bottom: 24rpx;
      
      .medal-image {
        width: 160rpx;
        height: 160rpx;
        margin-bottom: 8rpx;
        transition: transform 0.2s ease;
        border-radius: 50%;
        
        &.gold_glow {
          animation: gold_glow 2s infinite;
        }
        
        &.purple_pulse {
          animation: purple_pulse 2s infinite;
        }
        
        &.blue_shimmer {
          animation: blue_shimmer 2s infinite;
        }
        
        &.green_sparkle {
          animation: green_sparkle 2s infinite;
        }
        
        &.common_shine {
          animation: common_shine 2s infinite;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
      
      .medal-name {
        font-size: 28rpx;
        color: $text-color;
        text-align: center;
        width: 90%;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }
    
    .empty-medals {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300rpx;
      
      .empty-medal-icon {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 20rpx;
        opacity: 0.5;
      }
      
      text {
        font-size: 28rpx;
        color: $text-muted;
      }
    }
  }
}

// 信息卡片
.info-card {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
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
      font-size: 30rpx;
      color: $text-secondary;
    }
    
    .item-value {
      font-size: 30rpx;
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
      font-size: 30rpx;
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
      padding: 10rpx 22rpx;
      background-color: rgba($primary-color, 0.1);
      border-radius: 30rpx;
      
      text {
        font-size: 28rpx;
        color: $primary-color;
      }
    }
    
    .empty-skills {
      width: 100%;
      text-align: center;
      padding: 20rpx 0;
      
      text {
        font-size: 28rpx;
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
          font-size: 30rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .award-level {
          font-size: 28rpx;
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
          font-size: 28rpx;
          color: $text-secondary;
        }
      }
    }
    
    .empty-awards {
      width: 100%;
      text-align: center;
      padding: 20rpx 0;
      
      text {
        font-size: 28rpx;
        color: $text-muted;
      }
    }
  }
}

// 悬浮刷新按钮
.refresh-btn {
  position: fixed;
  right: 30rpx;
  bottom: 240rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f83fc, #3B82F6);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.4);
  z-index: 100;
  
  .iconfont {
    font-size: 48rpx;
    color: #ffffff;
  }
  
  .refreshing {
    animation: spin 1s linear infinite;
  }
}

// 勋章大图预览相关样式
.medal-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.medal-preview-content {
  width: 90%;
  max-width: 600rpx;
  background-color: $card-color;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
}

.medal-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid $border-color;
}

.medal-preview-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
}

.medal-preview-close {
  padding: 10rpx;
}

.medal-preview-image {
  width: 100%;
  height: 550rpx;
  padding: 20rpx;
  transition: transform 0.2s ease;
}

.medal-preview-info {
  padding: 20rpx 30rpx 30rpx;
}

.medal-preview-desc {
  font-size: 32rpx;
  color: $text-color;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.medal-preview-hint {
  text-align: center;
  
  text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(100%) rotate(25deg); }
}

/* 勋章发光效果 */
@keyframes gold_glow {
  0%, 100% { box-shadow: 0 0 8rpx 2rpx rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 20rpx 5rpx rgba(255, 215, 0, 0.8); }
}

@keyframes purple_pulse {
  0%, 100% { box-shadow: 0 0 8rpx 2rpx rgba(128, 0, 128, 0.6); }
  50% { box-shadow: 0 0 15rpx 5rpx rgba(128, 0, 128, 0.8); }
}

@keyframes blue_shimmer {
  0%, 100% { box-shadow: 0 0 8rpx 2rpx rgba(70, 130, 180, 0.6); }
  50% { box-shadow: 0 0 12rpx 4rpx rgba(70, 130, 180, 0.8); }
}

@keyframes green_sparkle {
  0%, 100% { box-shadow: 0 0 5rpx 2rpx rgba(0, 128, 0, 0.5); }
  50% { box-shadow: 0 0 10rpx 3rpx rgba(0, 128, 0, 0.7); }
}

@keyframes common_shine {
  0%, 100% { box-shadow: 0 0 4rpx 1rpx rgba(169, 169, 169, 0.5); }
  50% { box-shadow: 0 0 8rpx 2rpx rgba(169, 169, 169, 0.7); }
}

// 添加联系按钮的样式
.contact-btn {
  display: flex;
  align-items: center;
  background-color: rgba($primary-color, 0.1);
  padding: 10rpx 18rpx;
  border-radius: 30rpx;
  margin-left: auto;
  
  text {
    font-size: 28rpx;
    color: $primary-color;
    margin-left: 6rpx;
  }
  
  &:active {
    transform: scale(0.95);
  }
}
</style> 