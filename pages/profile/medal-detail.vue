<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">{{ isViewingOther ? '用户勋章' : '我的勋章' }}</text>
      <view class="right-placeholder"></view>
    </view>
    
    <!-- 加载中显示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-circle"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 勋章内容 -->
    <scroll-view scroll-y class="content-scroll" v-else>
      <!-- 统计信息 -->
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-value">{{ badgesList.length }}</text>
          <text class="stats-label">勋章总数</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ getRarityStats().highRarity }}</text>
          <text class="stats-label">高稀有度</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ getTypeStats().competition }}</text>
          <text class="stats-label">竞赛勋章</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ getTypeStats().personal }}</text>
          <text class="stats-label">个人成就</text>
        </view>
      </view>
      
      <!-- 勋章分类标签 -->
      <view class="category-tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          <text>全部</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'competition' }"
          @click="activeTab = 'competition'"
        >
          <text>竞赛勋章</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'personal' }"
          @click="activeTab = 'personal'"
        >
          <text>个人成就</text>
        </view>
      </view>
      
      <!-- 勋章列表 -->
      <view class="badges-list">
        <view 
          class="badge-card" 
          v-for="badge in filteredBadges" 
          :key="badge.badgeId"
          @click="showBadgeDetail(badge)"
        >
          <view class="badge-content">
            <view class="badge-image-container" :class="{ 'with-glow': badge.glowEffect }">
              <image class="badge-image" :src="badge.icon" mode="aspectFit"></image>
              <view v-if="badge.glowEffect" class="glow-effect" :class="badge.glowEffect"></view>
            </view>
            
            <view class="badge-info">
              <view class="badge-header">
                <text class="badge-name">{{ badge.name }}</text>
                <view class="badge-rarity">
                  <text v-for="n in badge.rarity" :key="n" class="rarity-star">★</text>
                </view>
              </view>
              
              <view class="badge-details">
                <view class="badge-detail-item" v-if="badge.teamName">
                  <SvgIcon name="team" size="14"></SvgIcon>
                  <text>{{ badge.teamName }}</text>
                </view>
                <view class="badge-detail-item" v-if="badge.competitionName">
                  <SvgIcon name="trophy" size="14"></SvgIcon>
                  <text>{{ badge.competitionName }}</text>
                </view>
                <view class="badge-detail-item">
                  <SvgIcon name="calendar" size="14"></SvgIcon>
                  <text>{{ formatDate(badge.acquiredTime) }}</text>
                </view>
              </view>
              
              <view class="badge-type-tag" :class="getBadgeTypeClass(badge.badgeType)">
                <text>{{ getBadgeTypeText(badge.badgeType) }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-badges" v-if="filteredBadges.length === 0">
          <image class="empty-badge-icon" src="/static/image/empty-medal.png" mode="aspectFit"></image>
          <text>{{ getEmptyText() }}</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 勋章详情弹窗 -->
    <view class="badge-detail-overlay" v-if="showDetail" @click="closeDetail">
      <view class="badge-detail-content" @click.stop>
        <view class="badge-detail-header">
          <text class="badge-detail-title">勋章详情</text>
          <view class="badge-detail-close" @click="closeDetail">
            <SvgIcon name="close" size="20"></SvgIcon>
          </view>
        </view>
        
        <view class="badge-detail-body">
          <view class="badge-detail-image-container" :class="{ 'with-glow': currentBadge.glowEffect }" @click="showImagePreview">
            <image class="badge-detail-image" :src="currentBadge.icon" mode="aspectFit"></image>
            <view v-if="currentBadge.glowEffect" class="glow-effect" :class="currentBadge.glowEffect"></view>
            <view class="zoom-hint">
              <SvgIcon name="search-plus" size="16" color="#ffffff"></SvgIcon>
              <text>查看大图</text>
            </view>
          </view>
          
          <view class="badge-detail-name">{{ currentBadge.name }}</view>
          
          <view class="badge-detail-rarity">
            <text class="rarity-label">稀有度：</text>
            <text v-for="n in currentBadge.rarity" :key="n" class="rarity-star large">★</text>
            <text v-for="n in 6 - currentBadge.rarity" :key="`empty-${n}`" class="rarity-star empty">★</text>
          </view>
          
          <view class="badge-detail-info-grid">
            <view class="badge-detail-info-item" v-if="currentBadge.badgeType === 'team_competition'">
              <text class="detail-label">竞赛名称</text>
              <text class="detail-value">{{ currentBadge.competitionName }}</text>
            </view>
            
            <view class="badge-detail-info-item" v-if="currentBadge.teamName">
              <text class="detail-label">参赛团队</text>
              <text class="detail-value">{{ currentBadge.teamName }}</text>
            </view>
            
            <view class="badge-detail-info-item" v-if="currentBadge.conditionTemplate && currentBadge.conditionTemplate.level">
              <text class="detail-label">竞赛级别</text>
              <text class="detail-value">{{ currentBadge.conditionTemplate.level }}</text>
            </view>
            
            <view class="badge-detail-info-item" v-if="currentBadge.conditionTemplate && currentBadge.conditionTemplate.rank">
              <text class="detail-label">获得奖项</text>
              <text class="detail-value">{{ currentBadge.conditionTemplate.rank }}</text>
            </view>
            
            <view class="badge-detail-info-item">
              <text class="detail-label">获得时间</text>
              <text class="detail-value">{{ formatDate(currentBadge.acquiredTime) }}</text>
            </view>
            
            <view class="badge-detail-info-item" v-if="currentBadge.expireTime">
              <text class="detail-label">过期时间</text>
              <text class="detail-value">{{ formatDate(currentBadge.expireTime) }}</text>
            </view>
          </view>
          
          <view class="badge-detail-type">
            <text class="detail-type-label">勋章类型：</text>
            <view class="badge-type-tag large" :class="getBadgeTypeClass(currentBadge.badgeType)">
              <text>{{ getBadgeTypeText(currentBadge.badgeType) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 图片预览弹窗 -->
    <view class="image-preview-overlay" v-if="showImageZoom" @click="closeImagePreview">
      <image 
        class="image-preview" 
        :src="currentBadge.icon" 
        mode="aspectFit"
        :style="{ transform: `scale(${previewScale})` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click.stop
      ></image>
      <view class="image-preview-hint">
        <text>双指缩放可调整图片大小</text>
      </view>
      <view class="image-preview-close" @click="closeImagePreview">
        <SvgIcon name="close" size="24" color="#ffffff"></SvgIcon>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
    
    <!-- 悬浮申请按钮 -->
    <view class="apply-badge-btn" @click="goToApplyBadge" v-if="!isViewingOther">
      <text>申请勋章</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import userApi from '@/api/modules/user';

// 加载状态
const loading = ref(true);

// 勋章数据
const badgesList = ref([]);

// 用户ID参数，从路由获取
const userId = ref('');
// 是否查看他人勋章
const isViewingOther = ref(false);

// 分类标签
const activeTab = ref('all');

// 详情弹窗状态
const showDetail = ref(false);
const currentBadge = ref({});

// 图片预览状态
const showImageZoom = ref(false);
const previewScale = ref(1);
const touchStartDistance = ref(0);

// 过滤后的勋章列表
const filteredBadges = computed(() => {
  if (activeTab.value === 'all') {
    return badgesList.value;
  } else if (activeTab.value === 'competition') {
    return badgesList.value.filter(badge => badge.badgeType === 'team_competition');
  } else if (activeTab.value === 'personal') {
    return badgesList.value.filter(badge => badge.badgeType === 'personal_achievement');
  }
  return badgesList.value;
});

// 获取路由参数
function getRouteParams() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.options) {
    userId.value = currentPage.options.userId || '';
    isViewingOther.value = !!userId.value;
    console.log('获取到用户ID:', userId.value, '是否查看他人勋章:', isViewingOther.value);
  }
}

// 获取勋章列表
async function getBadges() {
  try {
    loading.value = true;
    
    let res;
    // 根据是否有userId参数决定调用哪个API
    if (isViewingOther.value) {
      // 调用查看他人勋章的API
      res = await userApi.getUserBadgesDetailById(userId.value);
    } else {
      // 调用查看自己勋章的API
      res = await userApi.getUserBadgesDetail();
    }
    
    if (res.code === 200 && res.data) {
      badgesList.value = res.data.records || [];
      console.log('获取到勋章数据:', res.data);
    } else {
      uni.showToast({
        title: res.message || '获取勋章失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取勋章列表失败:', error);
    uni.showToast({
      title: '获取勋章列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取稀有度统计
function getRarityStats() {
  const highRarity = badgesList.value.filter(badge => badge.rarity >= 4).length;
  return { highRarity };
}

// 获取类型统计
function getTypeStats() {
  const competition = badgesList.value.filter(badge => badge.badgeType === 'team_competition').length;
  const personal = badgesList.value.filter(badge => badge.badgeType === 'personal_achievement').length;
  return { competition, personal };
}

// 获取勋章类型样式
function getBadgeTypeClass(type) {
  if (type === 'team_competition') {
    return 'competition-type';
  } else if (type === 'personal_achievement') {
    return 'personal-type';
  }
  return '';
}

// 获取勋章类型文本
function getBadgeTypeText(type) {
  if (type === 'team_competition') {
    return '竞赛勋章';
  } else if (type === 'personal_achievement') {
    return '个人成就';
  }
  return '未知类型';
}

// 获取空状态文本
function getEmptyText() {
  if (activeTab.value === 'all') {
    return '暂无获得的勋章';
  } else if (activeTab.value === 'competition') {
    return '暂无获得的竞赛勋章';
  } else if (activeTab.value === 'personal') {
    return '暂无获得的个人成就勋章';
  }
  return '暂无数据';
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '无限期';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString;
  }
}

// 显示勋章详情
function showBadgeDetail(badge) {
  currentBadge.value = badge;
  showDetail.value = true;
}

// 关闭详情弹窗
function closeDetail() {
  showDetail.value = false;
}

// 返回上一页
function goBack() {
  uni.navigateBack();
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
    
    // 计算缩放因子（限制在0.5到4之间）
    const scaleFactor = currentDistance / touchStartDistance.value;
    previewScale.value = Math.max(0.5, Math.min(4, previewScale.value * scaleFactor));
    
    // 更新起始距离
    touchStartDistance.value = currentDistance;
  }
}

// 处理触摸结束事件
function handleTouchEnd() {
  touchStartDistance.value = 0;
}

// 显示图片预览
function showImagePreview() {
  if (currentBadge.value && currentBadge.value.icon) {
    previewScale.value = 1; // 重置缩放比例
    showImageZoom.value = true;
  }
}

// 关闭图片预览
function closeImagePreview() {
  showImageZoom.value = false;
}

// 跳转到勋章申请页面
function goToApplyBadge() {
  uni.navigateTo({
    url: '/pages/profile/apply-badge'
  }).catch(err => {
    console.error('跳转勋章申请页面失败:', err);
    uni.showToast({
      title: '页面跳转失败',
      icon: 'none'
    });
  });
}

// 页面加载时获取勋章列表
onMounted(() => {
  getRouteParams();
  getBadges();
});
</script>

<style lang="scss">
// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #F3F4F6;
$gold-color: #FFD700;
$silver-color: #C0C0C0;
$bronze-color: #CD7F32;
$competition-color: #3B82F6;
$personal-color: #10B981;

page {
  background-color: $background-color;
  padding-bottom: 40rpx;
}

.container {
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
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
  padding: 20rpx;
}

// 统计卡片
.stats-card {
  display: flex;
  justify-content: space-between;
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .stats-value {
      font-size: 36rpx;
      font-weight: bold;
      color: $primary-color;
      margin-bottom: 6rpx;
    }
    
    .stats-label {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }
}

// 分类标签
.category-tabs {
  display: flex;
  background-color: $card-color;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  padding: 6rpx;
  
  .tab-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 0;
    border-radius: 12rpx;
    transition: all 0.2s ease;
    
    text {
      font-size: 28rpx;
      color: $text-secondary;
    }
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      
      text {
        color: $primary-color;
        font-weight: 500;
      }
    }
  }
}

// 勋章列表
.badges-list {
  margin-top: 10rpx;
  
  .badge-card {
    background-color: $card-color;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      transform: scale(0.98);
    }
    
    .badge-content {
      display: flex;
      align-items: center;
    }
    
    .badge-image-container {
      position: relative;
      width: 160rpx;
      height: 160rpx;
      flex-shrink: 0;
      margin-right: 20rpx;
      
      .badge-image {
        width: 100%;
        height: 100%;
        border-radius: 16rpx;
      }
      
      .glow-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 16rpx;
        z-index: 1;
        pointer-events: none;
        
        &.gold_glow {
          box-shadow: 0 0 15rpx 2rpx $gold-color;
          animation: gold-pulse 2s infinite;
        }
      }
      
      &.with-glow .badge-image {
        z-index: 2;
        position: relative;
      }
    }
    
    .badge-info {
      flex: 1;
      position: relative;
    }
    
    .badge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .badge-name {
        font-size: 32rpx;
        font-weight: bold;
        color: $text-color;
      }
      
      .badge-rarity {
        display: flex;
        
        .rarity-star {
          font-size: 26rpx;
          color: $gold-color;
          margin-left: 2rpx;
        }
      }
    }
    
    .badge-details {
      .badge-detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        text {
          font-size: 26rpx;
          color: $text-secondary;
          margin-left: 8rpx;
        }
      }
    }
    
    .badge-type-tag {
      position: absolute;
      top: -32rpx;
      right: 0;
      padding: 4rpx 14rpx;
      border-radius: 30rpx;
      
      text {
        font-size: 22rpx;
        font-weight: 500;
      }
      
      &.competition-type {
        background-color: rgba($competition-color, 0.1);
        
        text {
          color: $competition-color;
        }
      }
      
      &.personal-type {
        background-color: rgba($personal-color, 0.1);
        
        text {
          color: $personal-color;
        }
      }
    }
  }
  
  // 空状态
  .empty-badges {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0;
    
    .empty-badge-icon {
      width: 180rpx;
      height: 180rpx;
      opacity: 0.5;
      margin-bottom: 20rpx;
    }
    
    text {
      font-size: 28rpx;
      color: $text-muted;
    }
  }
}

// 勋章详情弹窗
.badge-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.badge-detail-content {
  width: 90%;
  max-width: 600rpx;
  background-color: $card-color;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.badge-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 2rpx solid $border-color;
  
  .badge-detail-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .badge-detail-close {
    padding: 10rpx;
  }
}

.badge-detail-body {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-detail-image-container {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 30rpx;
  
  .badge-detail-image {
    width: 100%;
    height: 100%;
    border-radius: 24rpx;
  }
  
  .glow-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24rpx;
    z-index: 1;
    pointer-events: none;
    
    &.gold_glow {
      box-shadow: 0 0 25rpx 5rpx $gold-color;
      animation: gold-pulse 2s infinite;
    }
  }
  
  &.with-glow .badge-detail-image {
    z-index: 2;
    position: relative;
  }
  
  .zoom-hint {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 20rpx 0 24rpx 0;
    padding: 6rpx 10rpx;
    display: flex;
    align-items: center;
    opacity: 0.8;
    z-index: 3;
    
    text {
      font-size: 22rpx;
      color: #ffffff;
      margin-left: 4rpx;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.badge-detail-name {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 16rpx;
  text-align: center;
}

.badge-detail-rarity {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  .rarity-label {
    font-size: 28rpx;
    color: $text-secondary;
    margin-right: 10rpx;
  }
  
  .rarity-star {
    font-size: 30rpx;
    color: $gold-color;
    margin: 0 2rpx;
    
    &.large {
      font-size: 36rpx;
    }
    
    &.empty {
      color: rgba($gold-color, 0.3);
    }
  }
}

.badge-detail-info-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .badge-detail-info-item {
    display: flex;
    flex-direction: column;
    
    .detail-label {
      font-size: 24rpx;
      color: $text-secondary;
      margin-bottom: 4rpx;
    }
    
    .detail-value {
      font-size: 28rpx;
      color: $text-color;
      font-weight: 500;
    }
  }
}

.badge-detail-type {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  
  .detail-type-label {
    font-size: 28rpx;
    color: $text-secondary;
    margin-right: 10rpx;
  }
  
  .badge-type-tag.large {
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    
    text {
      font-size: 26rpx;
      font-weight: 500;
    }
    
    &.competition-type {
      background-color: rgba($competition-color, 0.1);
      
      text {
        color: $competition-color;
      }
    }
    
    &.personal-type {
      background-color: rgba($personal-color, 0.1);
      
      text {
        color: $personal-color;
      }
    }
  }
}

// 动画
@keyframes gold-pulse {
  0% { box-shadow: 0 0 15rpx 2rpx rgba($gold-color, 0.7); }
  50% { box-shadow: 0 0 25rpx 8rpx rgba($gold-color, 0.9); }
  100% { box-shadow: 0 0 15rpx 2rpx rgba($gold-color, 0.7); }
}

// 图片预览弹窗
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  width: 80%;
  max-width: 800rpx;
  height: 80%;
  max-height: 800rpx;
  border-radius: 24rpx;
  object-fit: contain;
}

.image-preview-hint {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  right: 0;
  text-align: center;
  color: #ffffff;
  font-size: 28rpx;
}

.image-preview-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 10rpx;
}

// 申请勋章按钮
.apply-badge-btn {
  position: fixed;
  right: 30rpx;
  bottom: 100rpx;
  height: 90rpx;
  padding: 0 30rpx;
  border-radius: 45rpx;
  background: linear-gradient(135deg, #4f83fc, #3B82F6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.4);
  z-index: 100;
  
  text {
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 500;
    margin-left: 10rpx;
  }
}
</style> 