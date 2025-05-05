<template>
  <view class="container">
    <!-- 顶部个人信息 -->
    <view class="top-info animate__animated animate__fadeIn">
      <view class="flex-between">
        <view class="animate__animated animate__fadeInLeft">
          <text class="user-name gradient-text">张同学</text>
          <text class="user-desc">北京大学 · 计算机科学与技术</text>
        </view>
        <view class="avatar-container animate__animated animate__fadeInRight">
          <image class="avatar" src="https://randomuser.me/api/portraits/men/32.jpg"></image>
          <view class="notification-dot"></view>
          <view class="badge">2</view>
        </view>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-container animate__animated animate__fadeInDown">
      <view class="search-box-wrapper">
        <input class="search-box" type="text" placeholder="搜索竞赛、项目或队伍" confirm-type="search" />
        <text class="iconfont icon-search search-icon"></text>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="swiper-container">
      <swiper class="swiper animate__animated animate__fadeIn" 
              circular autoplay interval="3000" duration="500"
              indicator-dots indicator-active-color="#3B82F6" indicator-color="rgba(0, 0, 0, 0.2)">
        <swiper-item>
          <view class="swiper-item">
            <image src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800" mode="aspectFill"></image>
            <view class="swiper-overlay">
              <text class="swiper-title">互联网+创新创业大赛</text>
              <view class="swiper-date">
                <text class="iconfont icon-calendar date-icon"></text>
                <text class="date-text">报名截止：5月15日</text>
              </view>
            </view>
          </view>
        </swiper-item>
        <swiper-item>
          <view class="swiper-item">
            <image src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800" mode="aspectFill"></image>
            <view class="swiper-overlay">
              <text class="swiper-title">挑战杯创业计划大赛</text>
              <view class="swiper-date">
                <text class="iconfont icon-calendar date-icon"></text>
                <text class="date-text">报名截止：6月10日</text>
              </view>
            </view>
          </view>
        </swiper-item>
        <swiper-item>
          <view class="swiper-item">
            <image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" mode="aspectFill"></image>
            <view class="swiper-overlay">
              <text class="swiper-title">创青春创业大赛</text>
              <view class="swiper-date">
                <text class="iconfont icon-calendar date-icon"></text>
                <text class="date-text">报名截止：7月5日</text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 功能图标入口 -->
    <view class="menu-container">
      <view class="menu-grid">
        <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="navigateTo('competition')">
          <view class="menu-icon blue">
            <text class="iconfont icon-trophy"></text>
          </view>
          <text class="menu-text">竞赛活动</text>
        </view>
        <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.2s" @click="navigateTo('findPartner')">
          <view class="menu-icon green">
            <text class="iconfont icon-users"></text>
          </view>
          <text class="menu-text">寻找队友</text>
        </view>
        <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.3s" @click="navigateTo('project')">
          <view class="menu-icon purple">
            <text class="iconfont icon-project"></text>
          </view>
          <text class="menu-text">项目展示</text>
        </view>
        <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.4s" @click="navigateTo('schedule')">
          <view class="menu-icon orange">
            <text class="iconfont icon-calendar"></text>
          </view>
          <text class="menu-text">日程安排</text>
        </view>
      </view>
    </view>

    <!-- 热门竞赛 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title animate__animated animate__fadeInLeft">热门竞赛</text>
        <text class="view-all animate__animated animate__fadeInRight" @click="viewAll('competition')">查看全部</text>
      </view>
      <view class="competition-list">
        <view class="competition-item card-hover animate__animated animate__fadeInUp" @click="viewDetail('competition', 1)">
          <view class="competition-flex">
            <view class="competition-image-container">
              <image class="competition-image" src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800" mode="aspectFill"></image>
            </view>
            <view class="competition-content">
              <view class="flex-between">
                <text class="competition-title">互联网+创新创业大赛</text>
                <text class="status-tag pulse">报名中</text>
              </view>
              <view class="tag-row">
                <text class="tag blue-tag">创新创业</text>
                <text class="tag gray-tag">国家级</text>
              </view>
              <view class="competition-info">
                <view class="info-item">
                  <text class="iconfont icon-clock"></text>
                  <text class="info-text">报名截止: 5月15日</text>
                </view>
                <view class="info-item">
                  <text class="iconfont icon-team"></text>
                  <text class="info-text">3-5人/队</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="competition-item card-hover animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="viewDetail('competition', 2)">
          <view class="competition-flex">
            <view class="competition-image-container">
              <image class="competition-image" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800" mode="aspectFill"></image>
            </view>
            <view class="competition-content">
              <view class="flex-between">
                <text class="competition-title">挑战杯创业计划大赛</text>
                <text class="status-tag pulse">报名中</text>
              </view>
              <view class="tag-row">
                <text class="tag green-tag">创业实践</text>
                <text class="tag gray-tag">省级</text>
              </view>
              <view class="competition-info">
                <view class="info-item">
                  <text class="iconfont icon-clock"></text>
                  <text class="info-text">报名截止: 6月10日</text>
                </view>
                <view class="info-item">
                  <text class="iconfont icon-team"></text>
                  <text class="info-text">3-6人/队</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐队伍 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title animate__animated animate__fadeInLeft">推荐队伍</text>
        <text class="view-all animate__animated animate__fadeInRight" @click="viewAll('team')">查看全部</text>
      </view>
      <view class="team-list">
        <view class="team-item card-hover animate__animated animate__fadeInUp" @click="viewDetail('team', 1)">
          <view class="flex-between">
            <view>
              <view class="team-title-row">
                <text class="team-title">未来创客</text>
                <view class="online-dot pulse"></view>
              </view>
              <view class="tag-row">
                <text class="tag green-tag">挑战杯</text>
                <view class="recruiting">
                  <text class="iconfont icon-fire"></text>
                  <text>招募中</text>
                  <text class="member-count">2/4</text>
                </view>
              </view>
            </view>
            <view class="team-avatars">
              <image class="team-avatar" src="https://randomuser.me/api/portraits/women/33.jpg"></image>
              <image class="team-avatar" src="https://randomuser.me/api/portraits/men/54.jpg"></image>
              <view class="team-avatar-more green">+2</view>
            </view>
          </view>
          <view class="team-content-row">
            <text class="team-desc">
              <text class="iconfont icon-search search-icon-green"></text>
              寻找市场营销和产品经理，一起参加挑战杯创业计划大赛
            </text>
            <button class="join-btn green-join" @click.stop="joinTeam(1)">申请加入</button>
          </view>
        </view>
        
        <view class="team-item card-hover animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="viewDetail('team', 2)">
          <view class="flex-between">
            <view>
              <view class="team-title-row">
                <text class="team-title">创新先锋队</text>
                <view class="online-dot pulse"></view>
              </view>
              <view class="tag-row">
                <text class="tag blue-tag">互联网+</text>
                <view class="recruiting">
                  <text class="iconfont icon-fire"></text>
                  <text>招募中</text>
                  <text class="member-count">3/5</text>
                </view>
              </view>
            </view>
            <view class="team-avatars">
              <image class="team-avatar" src="https://randomuser.me/api/portraits/men/32.jpg"></image>
              <image class="team-avatar" src="https://randomuser.me/api/portraits/women/44.jpg"></image>
              <image class="team-avatar" src="https://randomuser.me/api/portraits/men/46.jpg"></image>
              <view class="team-avatar-more">+2</view>
            </view>
          </view>
          <view class="team-content-row">
            <text class="team-desc">
              <text class="iconfont icon-search search-icon-blue"></text>
              寻找UI设计和前端开发人员，共同参加互联网+创新创业大赛
            </text>
            <button class="join-btn blue-join" @click.stop="joinTeam(2)">申请加入</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <view class="tab-item active" @click="switchTab('home')">
        <text class="iconfont icon-home"></text>
        <text class="tab-text">首页</text>
        <view class="active-indicator"></view>
      </view>
      <view class="tab-item" @click="switchTab('competition')">
        <text class="iconfont icon-trophy"></text>
        <text class="tab-text">竞赛</text>
      </view>
      <view class="publish-btn-container">
        <view class="publish-btn pulse" @click="showPublishOptions">
          <text class="iconfont icon-plus"></text>
        </view>
        <text class="publish-text">发布</text>
      </view>
      <view class="tab-item" @click="switchTab('team')">
        <text class="iconfont icon-users"></text>
        <text class="tab-text">队伍</text>
      </view>
      <view class="tab-item" @click="switchTab('profile')">
        <text class="iconfont icon-user"></text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 页面跳转方法
function navigateTo(page) {
  uni.showToast({
    title: `导航到${page}页面`,
    icon: 'none'
  });
}

// 查看全部
function viewAll(type) {
  uni.showToast({
    title: `查看所有${type}`,
    icon: 'none'
  });
}

// 查看详情
function viewDetail(type, id) {
  uni.showToast({
    title: `查看${type}详情，ID: ${id}`,
    icon: 'none'
  });
}

// 申请加入队伍
function joinTeam(id) {
  uni.showToast({
    title: `申请加入队伍，ID: ${id}`,
    icon: 'none'
  });
}

// 切换底部标签
function switchTab(tab) {
  if (tab !== 'home') {
    uni.showToast({
      title: `切换到${tab}标签`,
      icon: 'none'
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

// 随机活动状态
function randomActivity() {
  // 在实际应用中，这里可以从服务器获取在线状态
  setTimeout(randomActivity, 3000);
}

onMounted(() => {
  randomActivity();
});
</script>

<style>
@import '../../static/iconfont.css';
@import '../../static/animate.css';

page {
  background-color: #f8fafc;
  padding-bottom: 150rpx;
}

.container {
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 顶部个人信息 */
.top-info {
  background-color: #fff;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.user-desc {
  font-size: 24rpx;
  color: #888;
  margin-top: 8rpx;
  display: block;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid #e6effd;
}

.notification-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background-color: #3B82F6;
  border: 3rpx solid white;
  animation: glow 1.5s infinite alternate;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background-color: #EF4444;
  color: white;
  font-size: 20rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(239, 68, 68, 0.5);
  animation: pop 0.3s ease-out;
}

/* 搜索框 */
.search-container {
  padding: 20rpx 30rpx;
}

.search-box-wrapper {
  position: relative;
}

.search-box {
  width: 100%;
  height: 80rpx;
  background: #fff;
  border-radius: 40rpx;
  padding: 0 80rpx;
  font-size: 26rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.search-icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 28rpx;
}

/* 轮播图 */
.swiper-container {
  padding: 0 30rpx 30rpx;
}

.swiper {
  height: 360rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 32rpx;
  overflow: hidden;
}

.swiper-item image {
  width: 100%;
  height: 100%;
}

.swiper-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.swiper-title {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.swiper-date {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.date-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
  margin-right: 6rpx;
}

.date-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

/* 功能图标入口 */
.menu-container {
  margin: 0 30rpx;
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.menu-grid {
  display: flex;
  justify-content: space-around;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.menu-icon.blue {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.menu-icon.green {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.menu-icon.purple {
  background: linear-gradient(135deg, #a18cd1, #fbc2eb);
}

.menu-icon.orange {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.menu-icon .iconfont {
  color: white;
  font-size: 40rpx;
}

.menu-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 区块标题 */
.section {
  margin-top: 40rpx;
}

.section-header {
  padding: 0 30rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.view-all {
  font-size: 26rpx;
  color: #3B82F6;
}

/* 热门竞赛样式 */
.competition-list {
  padding: 0 30rpx;
}

.competition-item {
  background: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.competition-flex {
  display: flex;
}

.competition-image-container {
  width: 180rpx;
  height: 180rpx;
  overflow: hidden;
}

.competition-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
}

.competition-content {
  flex: 1;
  padding: 20rpx;
}

.competition-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.status-tag {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 30rpx;
  background-color: #FFF7ED;
  color: #F59E0B;
}

.tag-row {
  display: flex;
  margin-top: 12rpx;
}

.tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 30rpx;
  margin-right: 10rpx;
}

.blue-tag {
  background-color: #EFF6FF;
  color: #3B82F6;
}

.green-tag {
  background-color: #ECFDF5;
  color: #10B981;
}

.gray-tag {
  background-color: #F3F4F6;
  color: #6B7280;
}

.competition-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .iconfont {
  color: #9CA3AF;
  font-size: 22rpx;
  margin-right: 6rpx;
}

.info-text {
  color: #9CA3AF;
  font-size: 22rpx;
}

/* 推荐队伍样式 */
.team-list {
  padding: 0 30rpx;
}

.team-item {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.team-title-row {
  display: flex;
  align-items: center;
}

.team-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.online-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #10B981;
  margin-left: 10rpx;
}

.recruiting {
  display: flex;
  align-items: center;
  font-size: 20rpx;
  color: #9CA3AF;
}

.icon-fire {
  color: #F59E0B;
  margin-right: 6rpx;
}

.member-count {
  margin-left: 6rpx;
  font-weight: bold;
}

.team-avatars {
  display: flex;
  margin-right: -16rpx;
}

.team-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid white;
  margin-right: -16rpx;
  transition: transform 0.3s;
}

.team-avatar-more {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid white;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  color: white;
  font-size: 20rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-avatar-more.green {
  background: linear-gradient(to right, #10B981, #34D399);
}

.team-content-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.team-desc {
  font-size: 24rpx;
  color: #6B7280;
  line-height: 1.5;
  flex: 1;
  margin-right: 20rpx;
}

.join-btn {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  white-space: nowrap;
  height: 50rpx;
  line-height: 50rpx;
  min-width: 120rpx;
  text-align: center;
}

.search-icon-green {
  color: #10B981;
  margin-right: 6rpx;
}

/* 底部导航栏 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
}

.tab-item .iconfont {
  font-size: 44rpx;
  color: #9CA3AF;
}

.tab-text {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
}

.tab-item.active .iconfont,
.tab-item.active .tab-text {
  color: #3B82F6;
  font-weight: 500;
}

.active-indicator {
  position: absolute;
  bottom: 10rpx;
  width: 40rpx;
  height: 6rpx;
  background-color: #3B82F6;
  border-radius: 3rpx;
}

.publish-btn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
}

.publish-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.3);
  position: relative;
  top: -30rpx;
}

.publish-btn .iconfont {
  color: white;
  font-size: 40rpx;
}

.publish-text {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: -16rpx;
}

/* 动画效果 */
.gradient-text {
  background-image: linear-gradient(90deg, #3B82F6, #8B5CF6);
  -webkit-background-clip: text;
  color: transparent;
}

.card-hover {
  transition: all 0.3s;
}

.card-hover:active {
  transform: translateY(-10rpx);
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes pop {
  0% { transform: scale(0.5); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 rgba(59, 130, 246, 0.7); }
  100% { box-shadow: 0 0 10rpx rgba(59, 130, 246, 0.7); }
}

.search-icon-blue {
  color: #3B82F6;
  margin-right: 6rpx;
}

.search-icon-green {
  color: #10B981;
  margin-right: 6rpx;
}

.team-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.blue-join {
  background-color: #EFF6FF;
  color: #3B82F6;
}

.green-join {
  background-color: #ECFDF5;
  color: #10B981;
}
</style>

