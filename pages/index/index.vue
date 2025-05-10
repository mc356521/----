<template>
  <view class="container">
    <!-- 顶部导航栏 - 已经自动适配安全区域 -->
    <view class="custom-nav-bar">
      <view class="title-section">
        <text class="page-title">校园任务与组队平台</text>
      </view>
      <view class="search-section" @click="goToSearch">
        <view class="search-box">
          <text class="iconfont icon-search"></text>
          <text class="search-placeholder">搜索竞赛/队伍</text>
        </view>
      </view>
    </view>
    
    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
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
          
          <view class="competition-item card-hover animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="viewDetail('competition', 2)" v-for="competition in competitionsList" :key="competition.id">
            <view class="competition-flex">
              <view class="competition-image-container">
                <image class="competition-image" src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800" mode="aspectFill"></image>
              </view>
              <view class="competition-content">
                <view class="flex-between">
                  <text class="competition-title">{{ competition.title }}</text>
                  <text class="status-tag pulse">{{ competition.status }}</text>
                </view>
                <view class="tag-row">
                  <text class="tag green-tag">{{ competition.category }}</text>
                  <text class="tag gray-tag">{{ competition.level }}</text>
                </view>
                <view class="competition-info">
                  <view class="info-item">
                    <text class="iconfont icon-clock"></text>
                    <text class="info-text">报名截止: {{ competition.registrationDeadlineFormatted }}</text>
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
          <text class="section-title animate__animated animate__fadeInLeft">热门队伍</text>
          <text class="view-all animate__animated animate__fadeInRight" @click="viewAll('team')">查看全部</text>
        </view>
        <view class="team-list">
          <!-- 使用团队卡片组件 -->
          <template v-if="teamList.length > 0">
            <team-card
              v-for="(team, index) in teamList" 
              :key="team.id"
              :team="team"
              :index="index"
              @detail="(id) => viewDetail('team', id)"
              @apply="joinTeam"
            ></team-card>
          </template>
          <view v-else class="empty-state">
            <text class="empty-text">加载中...</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部TabBar - 由自定义组件处理 -->
    <TabBar activeTab="home" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import teamApi from '@/api/modules/team';
import competitionsApi from '@/api/modules/competitions';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';

// 热门队伍数据
const teamList = ref([]);
// 热门竞赛数据
const competitionsList = ref([]);

// 获取热门竞赛数据
async function getCompetitionsList() {
  try {
    const res = await competitionsApi.getCompetitionsList();
    if (res.code === 200 && res.data && res.data.list) {
      competitionsList.value = res.data.list.slice(0, 3);
      console.log('获取到热门竞赛数据:', competitionsList.value);
    }
  } catch (error) {
    console.error('获取竞赛数据失败:', error);
  }
}

// 获取队伍列表数据
async function getTeamList() {
  try {
    const res = await teamApi.getTeamList();
    if (res.code === 200 && res.data && res.data.list) {
      teamList.value = res.data.list.slice(0,10); // 只显示前3个
      console.log('获取到队伍列表数据:', teamList.value);
    }
  } catch (error) {
    console.error('获取队伍数据失败:', error);
  }
}

// 页面跳转方法
function navigateTo(page) {
  if (page === 'competition') {
    uni.navigateTo({
      url: '/pages/competition/index'
    });
  } else {
    uni.showToast({
      title: `导航到${page}页面`,
      icon: 'none'
    });
  }
}

// 查看全部
function viewAll(type) {
  if (type === 'competition') {
    uni.navigateTo({
      url: '/pages/competition/index'
    });
  } else {
    uni.showToast({
      title: `查看所有${type}`,
      icon: 'none'
    });
  }
}

// 查看详情
function viewDetail(type, id) {
  if (type === 'competition') {
    uni.navigateTo({
      url: `/pages/competition/detail?id=${id}`
    });
  } else {
    uni.navigateTo({
      url: `/pages/team/detail?id=${id}`
    });
  }
}

// 申请加入队伍
function joinTeam(id) {
  uni.showModal({
    title: '申请确认',
    content: '确定要申请加入该团队吗？',
    success: function (res) {
      if (res.confirm) {
        uni.showToast({
          title: '申请已发送',
          icon: 'success'
        });
      }
    }
  });
}

// 跳转到搜索页
function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
  });
}

onMounted(() => {
  // 获取状态栏高度
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
  console.log('状态栏高度:', statusBarHeight);
  getTeamList();
  getCompetitionsList();
});
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '../../static/animate.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$success-color: #10B981;
$warning-color: #F59E0B;

// 动画
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

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin card-shadow {
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

@mixin card-active {
  transform: translateY(-10rpx);
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
}

page {
  background-color: $background-color;
  padding-bottom: 150rpx;
}

.container {
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.flex-between {
  @include flex-between;
}

/* 导航栏样式 */
.custom-nav-bar {
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  width: 100%;
  z-index: 100;
  padding: 0 30rpx;
}

.title-section {
  margin-bottom: 16rpx;
}

.page-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.search-section {
  padding-bottom: 16rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  height: 72rpx;
  padding: 0 30rpx;
}

.search-placeholder {
  color: #999999;
  font-size: 28rpx;
  margin-left: 10rpx;
}

/* 内容区域 */
.content-scroll {
  flex: 1;
}

.content-section {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.section-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

// 轮播图
.swiper-container {
  padding: 0 30rpx 30rpx;
  
  .swiper {
    height: 360rpx;
    border-radius: 32rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
    
    .swiper-item {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 32rpx;
      overflow: hidden;
      
      image {
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
        
        .swiper-title {
          color: white;
          font-size: 32rpx;
          font-weight: bold;
        }
        
        .swiper-date {
          display: flex;
          align-items: center;
          margin-top: 8rpx;
          
          .date-icon {
            color: rgba(255, 255, 255, 0.8);
            font-size: 22rpx;
            margin-right: 6rpx;
          }
          
          .date-text {
            color: rgba(255, 255, 255, 0.8);
            font-size: 24rpx;
          }
        }
      }
    }
  }
}

// 功能图标入口
.menu-container {
  margin: 0 30rpx;
  background: $card-color;
  border-radius: 20rpx;
  padding: 30rpx;
  @include card-shadow;
  
  .menu-grid {
    display: flex;
    justify-content: space-around;
    
    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
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
        
        &.blue {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }
        
        &.green {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }
        
        &.purple {
          background: linear-gradient(135deg, #a18cd1, #fbc2eb);
        }
        
        &.orange {
          background: linear-gradient(135deg, #fa709a, #fee140);
        }
        
        .iconfont {
          color: white;
          font-size: 40rpx;
        }
      }
      
      .menu-text {
        font-size: 24rpx;
        color: $text-color;
        font-weight: 500;
      }
    }
  }
}

// 节标题
.section-header {
  padding: 0 30rpx 16rpx;
  @include flex-between;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .view-all {
    font-size: 26rpx;
    color: $primary-color;
  }
}

// 热门竞赛样式
.competition-list {
  padding: 0 30rpx;
  
  .competition-item {
    background: $card-color;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    @include card-shadow;
    transition: all 0.3s;
    
    &.card-hover:active {
      @include card-active;
    }
    
    .competition-flex {
      display: flex;
      
      .competition-image-container {
        width: 180rpx;
        height: 180rpx;
        overflow: hidden;
        
        .competition-image {
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
        }
      }
      
      .competition-content {
        flex: 1;
        padding: 20rpx;
        
        .competition-title {
          font-size: 28rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .status-tag {
          font-size: 20rpx;
          padding: 6rpx 30rpx;
          margin-left: 50rpx;
          border-radius: 20rpx;
          background-color: #dbeafe;
          color: #2563eb;
          
          &.pulse {
            animation: pulse 2s infinite;
          }
        }
        
        .tag-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 12rpx;
          
          .tag {
            font-size: 20rpx;
            padding: 4rpx 12rpx;
            border-radius: 30rpx;
            margin-right: 10rpx;
            
            &.blue-tag {
              background-color: #EFF6FF;
              color: $primary-color;
            }
            
            &.green-tag {
              background-color: #ECFDF5;
              color: $success-color;
            }
            
            &.gray-tag {
              background-color: #F3F4F6;
              color: #6B7280;
            }
          }
        }
        
        .competition-info {
          display: flex;
          justify-content: space-between;
          margin-top: 12rpx;
          
          .info-item {
            display: flex;
            align-items: center;
            
            .iconfont {
              color: $text-muted;
              font-size: 22rpx;
              margin-right: 6rpx;
            }
            
            .info-text {
              color: $text-muted;
              font-size: 22rpx;
            }
          }
        }
      }
    }
  }
}

// 推荐队伍样式
.team-list {
  padding: 0 30rpx;
}

// 空状态样式
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

// 通用动画效果
.card-hover {
  transition: all 0.3s;
  
  &:active {
    @include card-active;
  }
}
</style>

