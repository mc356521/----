<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="nav-back" @click="navigateBack">
        <SvgIcon name="back" class="back-icon"></SvgIcon>
      </view>
      <text class="page-title">我的获奖</text>
    </view>
    
    <!-- 页面内容 -->
    <view class="content">
      <!-- 加载中状态 -->
      <view v-if="loading" class="loading-container">
        <view class="spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 数据为空状态 -->
      <view v-else-if="awardsList.length === 0" class="empty-state">
        <uni-icons type="info" size="60" color="#CCCCCC"></uni-icons>
        <text class="empty-text">暂无获奖记录</text>
        <text class="empty-desc">参加更多比赛，努力获取奖项！</text>
        <button class="primary-btn" @click="gotoCompetitions">去看看比赛</button>
      </view>
      
      <!-- 获奖列表 -->
      <scroll-view 
        v-else
        scroll-y 
        class="award-list" 
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="refreshData">
        <view class="award-item" v-for="award in awardsList" :key="award.id">
          <!-- 奖项标记 -->
          <view class="award-badge" :class="getAwardClass(award.awardType)">
            {{ award.awardType }}
          </view>
          
          <!-- 奖项内容 -->
          <view class="award-content">
            <view class="award-header">
              <view class="team-info">
                <image class="team-logo" :src="award.teamLogo || '/static/image/default-avatar.png'" mode="aspectFill"></image>
                <view class="team-detail">
                  <text class="team-name">{{ award.teamName }}</text>
                  <text class="competition-name">{{ award.competitionName }}</text>
                </view>
              </view>
            </view>
            
            <!-- 奖项详情 -->
            <view class="award-details">
              <view class="detail-item">
                <text class="detail-label">获奖时间：</text>
                <text class="detail-value">{{ formatDate(award.announcedAt) }}</text>
              </view>
              
              <view class="detail-item" v-if="award.stageNameOrInfo">
                <text class="detail-label">比赛阶段：</text>
                <text class="detail-value">{{ award.stageNameOrInfo }}</text>
              </view>
              
              <view class="detail-item" v-if="award.awardDetails && award.awardDetails.bonus">
                <text class="detail-label">奖金金额：</text>
                <text class="detail-value highlight">{{ award.awardDetails.bonus }}元</text>
              </view>
              
              <view class="detail-item" v-if="award.awardDetails && award.awardDetails.certificate">
                <text class="detail-label">证书编号：</text>
                <text class="detail-value">{{ award.awardDetails.certificate }}</text>
              </view>
              
              <view class="detail-item" v-if="award.metadata && award.metadata.sponsor">
                <text class="detail-label">赞助方：</text>
                <text class="detail-value">{{ award.metadata.sponsor }}</text>
              </view>
            </view>
            
            <!-- 获奖队员 -->
            <view class="team-members" v-if="award.memberAvatars && award.memberAvatars.length > 0">
              <text class="members-label">获奖队员：</text>
              <view class="members-avatars">
                <image 
                  v-for="(avatar, idx) in award.memberAvatars" 
                  :key="idx" 
                  :src="avatar || '/static/image/default-avatar.png'" 
                  class="member-avatar">
                </image>
                <view v-if="award.teamMembers > award.memberAvatars.length" class="more-members">
                  +{{ award.teamMembers - award.memberAvatars.length }}
                </view>
              </view>
            </view>
            
            <!-- 操作按钮 -->
            <view class="award-footer">
              <view class="footer-actions">
                <button class="action-btn" @click="viewCompetition(award.competitionId)">查看比赛</button>
                <button class="action-btn" @click="viewTeam(award.teamId)">查看队伍</button>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more">
          <view class="spinner-sm"></view>
          <text class="load-more-text">加载更多...</text>
        </view>
        <view v-else-if="awardsList.length > 0" class="no-more">
          <text class="no-more-text">没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';

// 数据状态
const loading = ref(true);
const refreshing = ref(false);
const awardsList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);

// 模拟数据
const mockAwardsData = [
  {
    id: 1,
    competitionId: 101,
    competitionName: '2023年全国大学生创新创业大赛',
    teamId: 201,
    teamName: '创梦先锋队',
    teamLogo: '/static/image/default-avatar.png',
    awardType: '金奖',
    announcedAt: '2023-11-20T10:00:00Z',
    stageNameOrInfo: '全国总决赛',
    awardDetails: { bonus: '10000', certificate: 'GJ20231120-001' },
    metadata: { sponsor: '科技部、教育部' },
    memberAvatars: [
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png'
    ],
    teamMembers: 5
  },
  {
    id: 2,
    competitionId: 102,
    competitionName: '第十届互联网+大学生创新创业大赛',
    teamId: 202,
    teamName: '智联未来',
    teamLogo: '/static/image/default-avatar.png',
    awardType: '银奖',
    announcedAt: '2023-10-15T14:30:00Z',
    stageNameOrInfo: '省赛',
    awardDetails: { bonus: '5000', certificate: 'YJ20231015-042' },
    metadata: { sponsor: '腾讯公司' },
    memberAvatars: [
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png'
    ],
    teamMembers: 4
  },
  {
    id: 3,
    competitionId: 103,
    competitionName: '全国大学生软件创新大赛',
    teamId: 203,
    teamName: '代码先锋',
    teamLogo: '/static/image/default-avatar.png',
    awardType: '优秀奖',
    announcedAt: '2023-09-05T09:15:00Z',
    stageNameOrInfo: '初赛',
    awardDetails: { certificate: 'YX20230905-118' },
    metadata: { sponsor: 'IBM' },
    memberAvatars: [
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png'
    ],
    teamMembers: 4
  },
  {
    id: 4,
    competitionId: 104,
    competitionName: '华为软件精英挑战赛',
    teamId: 204,
    teamName: '算法达人',
    teamLogo: '/static/image/default-avatar.png',
    awardType: '三等奖',
    announcedAt: '2023-08-12T16:45:00Z',
    stageNameOrInfo: '复赛',
    awardDetails: { bonus: '2000', certificate: 'SD20230812-076' },
    metadata: { sponsor: '华为公司' },
    memberAvatars: [
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png'
    ],
    teamMembers: 3
  },
  {
    id: 5,
    competitionId: 105,
    competitionName: '全国高校人工智能创新大赛',
    teamId: 205,
    teamName: 'AI未来',
    teamLogo: '/static/image/default-avatar.png',
    awardType: '特等奖',
    announcedAt: '2023-07-28T11:20:00Z',
    stageNameOrInfo: '总决赛',
    awardDetails: { bonus: '20000', certificate: 'TD20230728-003' },
    metadata: { sponsor: '百度公司' },
    memberAvatars: [
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png',
      '/static/image/default-avatar.png'
    ],
    teamMembers: 3
  }
];

// 获取获奖记录列表 (模拟)
function getAwardsList(isRefresh = false) {
  // 模拟加载时间
  setTimeout(() => {
    if (isRefresh) {
      currentPage.value = 1;
      awardsList.value = [];
    }
    
    console.log('获取获奖记录，页码:', currentPage.value);
    
    // 模拟分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = currentPage.value * pageSize.value;
    const pageData = mockAwardsData.slice(start, end);
    
    // 还有更多数据吗
    hasMore.value = end < mockAwardsData.length;
    
    if (pageData.length > 0) {
      awardsList.value = [...awardsList.value, ...pageData];
      
      if (hasMore.value) {
        currentPage.value++;
      }
    }
    
    if (isRefresh) {
      refreshing.value = false;
      uni.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }
    
    loading.value = false;
  }, 1000); // 模拟网络延迟
}

// 刷新数据
function refreshData() {
  refreshing.value = true;
  getAwardsList(true);
}

// 加载更多
function loadMore() {
  if (hasMore.value && !loading.value) {
    getAwardsList();
  }
}

// 根据奖项类型获取样式类
function getAwardClass(awardType) {
  switch(awardType) {
    case '金奖':
      return 'gold-award';
    case '银奖':
      return 'silver-award';
    case '铜奖':
      return 'bronze-award';
    case '特等奖':
      return 'special-award';
    case '一等奖':
      return 'first-award';
    case '二等奖':
      return 'second-award';
    case '三等奖':
      return 'third-award';
    case '优秀奖':
      return 'excellent-award';
    default:
      return '';
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知时间';
  
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch (e) {
    console.error('日期格式化失败:', e);
    return '日期格式有误';
  }
}

// 查看比赛详情
function viewCompetition(competitionId) {
  uni.navigateTo({
    url: `/pages/competition/detail?id=${competitionId}`
  });
}

// 查看队伍详情
function viewTeam(teamId) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${teamId}`
  });
}

// 导航到比赛列表
function gotoCompetitions() {
  uni.switchTab({
    url: '/pages/competition/index'
  });
}

// 返回上一页
function navigateBack() {
  uni.navigateBack();
}

// 页面加载时获取数据
onMounted(() => {
  getAwardsList();
});
</script>

<style lang="scss">
page {
  background-color: #f5f7fa;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部导航栏 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-back {
  padding: 20rpx;
  margin-left: -20rpx;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

/* 内容区域 */
.content {
  flex: 1;
  margin-top: 90rpx;
  padding: 20rpx;
}

/* 加载中状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300rpx;
}

.spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2679cc;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.primary-btn {
  background-color: #2679cc;
  color: #ffffff;
  font-size: 28rpx;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
}

/* 获奖列表 */
.award-list {
  height: calc(100vh - 130rpx);
}

.award-item {
  position: relative;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 奖项标记 */
.award-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
  z-index: 1;
}

.gold-award {
  background-color: #F59E0B;
  color: #ffffff;
}

.silver-award {
  background-color: #9CA3AF;
  color: #ffffff;
}

.bronze-award {
  background-color: #B45309;
  color: #ffffff;
}

.special-award {
  background-color: #8B5CF6;
  color: #ffffff;
}

.first-award {
  background-color: #10B981;
  color: #ffffff;
}

.second-award {
  background-color: #3B82F6;
  color: #ffffff;
}

.third-award {
  background-color: #F97316;
  color: #ffffff;
}

.excellent-award {
  background-color: #84CC16;
  color: #ffffff;
}

/* 奖项内容 */
.award-content {
  padding: 24rpx;
}

.award-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.team-info {
  display: flex;
  align-items: center;
}

.team-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin-right: 16rpx;
}

.team-detail {
  display: flex;
  flex-direction: column;
}

.team-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4rpx;
}

.competition-name {
  font-size: 26rpx;
  color: #666666;
}

/* 奖项详情 */
.award-details {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 10rpx;
}

.detail-label {
  width: 180rpx;
  font-size: 26rpx;
  color: #666666;
}

.detail-value {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
}

.highlight {
  color: #f59e0b;
  font-weight: bold;
}

/* 获奖队员 */
.team-members {
  margin-top: 16rpx;
  margin-bottom: 20rpx;
}

.members-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.members-avatars {
  display: flex;
  flex-wrap: wrap;
}

.member-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  border: 2rpx solid #ffffff;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.more-members {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #666666;
  font-size: 22rpx;
}

/* 奖项底部 */
.award-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.footer-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #2679cc;
  background: none;
  border: 1rpx solid #2679cc;
  border-radius: 30rpx;
  padding: 6rpx 24rpx;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.spinner-sm {
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2679cc;
  animation: spin 0.8s linear infinite;
  margin-right: 10rpx;
}

.load-more-text {
  font-size: 26rpx;
  color: #999999;
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
}

.no-more-text {
  font-size: 26rpx;
  color: #999999;
}
</style> 