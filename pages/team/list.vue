<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="header-title">
        <text class="section-title">组队广场</text>
        <view class="header-actions">
          <text class="iconfont icon-search"></text>
          <text class="iconfont icon-filter"></text>
        </view>
      </view>
      
      <!-- 分类标签 -->
      <scroll-view scroll-x="true" class="category-scroll">
        <view class="category-list">
          <view 
            v-for="(category, index) in categories" 
            :key="index" 
            class="category-item"
            :class="currentCategory === index ? 'active-category' : ''"
            @click="selectCategory(index)">
            <text>{{ category }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 组队列表 -->
    <scroll-view scroll-y="true" class="team-list" @scrolltolower="loadMore">
      <!-- 使用团队卡片组件 -->
      <template v-if="teamData.list && teamData.list.length > 0">
        <team-card
          v-for="(team, index) in teamData.list"
          :key="team.id"
          :team="team"
          :index="index"
          @detail="goToTeamDetail"
          @apply="applyToJoin"
        ></team-card>
      </template>
      
      <!-- 加载中状态 -->
      <view v-else-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态提示 -->
      <view v-else class="empty-state">
        <text class="empty-text">暂无团队数据</text>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="teamData.list && teamData.list.length > 0" class="load-more">
        <text v-if="loadingMore">正在加载更多...</text>
        <text v-else-if="teamData.hasNext" @click="loadMore">点击加载更多</text>
        <text v-else>— 没有更多数据了 —</text>
      </view>
    </scroll-view>
    
    <!-- 底部导航栏 -->
    <tab-bar 
      active-tab="team" 
      @tab-change="handleTabChange" 
      @publish="showPublishOptions"
    ></tab-bar>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';
import teamApi from '@/api/modules/team';

// 分类数据
const categories = ref(['全部', '学科竞赛', '创新创业', '体育竞赛', '文艺比赛']);
const currentCategory = ref(0);

// 团队列表数据
const teamData = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0,
  list: [],
  hasPrevious: false,
  hasNext: false
});

// 状态变量
const loading = ref(false);
const refreshing = ref(false);
const loadingMore = ref(false);
const noMoreData = ref(false);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  orderByViewCount: false
});

// 获取团队列表
async function getTeamList(refresh = false) {
  // 检查是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后查看团队列表',
      confirmText: '去登录',
      success: function(res) {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }

  if (refresh) {
    queryParams.pageNum = 1;
    refreshing.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    // 处理查询参数，移除null和undefined值
    const params = {};
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== null && queryParams[key] !== undefined && queryParams[key] !== '') {
        params[key] = queryParams[key];
      }
    });
    
    console.log('请求参数:', params);
    const res = await teamApi.getTeamList(params);
    console.log('响应结果:', res);
    
    if (res.code === 200 && res.data) {
      if (refresh) {
        teamData.list = res.data.list || [];
      } else {
        teamData.list = [...teamData.list, ...(res.data.list || [])];
      }
      
      teamData.pageNum = res.data.pageNum;
      teamData.pageSize = res.data.pageSize;
      teamData.total = res.data.total;
      teamData.pages = res.data.pages;
      teamData.hasPrevious = res.data.hasPrevious;
      teamData.hasNext = res.data.hasNext;
      
      // 判断是否还有更多数据
      noMoreData.value = !res.data.hasNext;
    } else {
      uni.showToast({
        title: res?.message || '获取团队列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取团队列表出错', error);
    
    // 如果是401或403错误，可能是未登录或token失效
    if (error.statusCode === 401 || error.statusCode === 403) {
      uni.showModal({
        title: '登录已过期',
        content: '请重新登录后查看',
        confirmText: '去登录',
        success: function(res) {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
    } else {
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
    loadingMore.value = false;
  }
}

// 下拉刷新
function onPullDownRefresh() {
  getTeamList(true).then(() => {
    uni.stopPullDownRefresh();
  });
}

// 加载更多
function loadMore() {
  if (loadingMore.value || noMoreData.value) return;
  
  // 如果正在加载或没有更多数据，直接返回
  if (!teamData.hasNext) {
    noMoreData.value = true;
    return;
  }
  
  loadingMore.value = true;
  queryParams.pageNum += 1;
  getTeamList();
}

// 选择分类
function selectCategory(index) {
  if (currentCategory.value === index) return;
  
  currentCategory.value = index;
  
  // 根据分类筛选数据
  if (index === 0) {
    // 全部分类
    delete queryParams.categoryId; // 移除categoryId参数而不是设为null
  } else {
    // 特定分类
    // 这里可能需要根据后端API调整实际的分类ID
    queryParams.categoryId = index;
  }
  
  // 刷新数据
  getTeamList(true);
}

// 页面加载
onMounted(() => {
  console.log('组队列表页面加载');
  getTeamList();
});

// 跳转到团队详情
function goToTeamDetail(teamId) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${teamId}`
  });
}

// 申请加入团队
function applyToJoin(teamId) {
  // 判断当前用户是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再申请加入团队',
      confirmText: '去登录',
      success: function(res) {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  
  // 先检查用户是否已申请或已加入该队伍
  teamApi.checkTeamStatus(teamId).then(res => {
    if (res.code === 200) {
      if (res.data === true) {
        uni.showToast({
          title: '您已申请或已加入该团队',
          icon: 'none'
        });
      } else {
        // 如果未申请，跳转到详情页申请特定角色
        uni.navigateTo({
          url: `/pages/team/detail?id=${teamId}`
        });
      }
    }
  }).catch(err => {
    console.error('检查团队状态失败', err);
    // 如果检查失败，依然允许用户跳转到详情页
    uni.navigateTo({
      url: `/pages/team/detail?id=${teamId}`
    });
  });
}

// 创建团队
function createTeam() {
  uni.navigateTo({
    url: '/pages/team/create'
  });
}

// 处理标签切换
function handleTabChange(tab) {
  if (tab === 'home') {
    uni.switchTab({
      url: '/pages/index/index'
    });
  } else if (tab === 'competition') {
    uni.switchTab({
      url: '/pages/competition/index'
    });
  } else if (tab === 'profile') {
    uni.switchTab({
      url: '/pages/profile/index'
    });
  }
}

// 显示发布选项
function showPublishOptions() {
  uni.showActionSheet({
    itemList: ['创建新团队', '招募队友', '发布项目展示'],
    success: function (res) {
      if (res.tapIndex === 0) {
        // 创建新团队
        createTeam();
      } else {
        uni.showToast({
          title: `选择了: ${res.tapIndex}`,
          icon: 'none'
        });
      }
    }
  });
}

</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '../../static/animate.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #000000;
$card-color: #222222;
$text-color: #ffffff;
$text-secondary: #b3b3b3;
$text-muted: #9CA3AF;

// 动画
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// 基础样式
page {
  background-color: $background-color;
  color: $text-color;
  height: 100%;
  padding-bottom: 150rpx;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 顶部导航栏
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: $background-color;
  
  .header-title {
    @include flex-between;
    padding: 30rpx 30rpx 20rpx 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .header-actions {
      display: flex;
      gap: 30rpx;
      
      .iconfont {
        font-size: 40rpx;
        color: $text-color;
      }
    }
  }
  
  // 分类标签
  .category-scroll {
    width: 100%;
    white-space: nowrap;
    padding: 10rpx 10rpx  10rpx  20rpx;
    
    .category-list {
      display: inline-flex;
      gap: 20rpx;
      padding-right: 40rpx;
      
      .category-item {
        display: inline-block;
        padding: 12rpx 19rpx;
        border-radius: 30rpx;
        background-color: #222222;
        font-size: 24rpx;
        color: #999999;
        
        &.active-category {
          background-color: $primary-color;
          color: $text-color;
        }
      }
    }
  }
}

// 组队列表
.team-list {
  flex: 1;
  padding: 30rpx 30rpx 120rpx 30rpx;
  box-sizing: border-box;
  width: 100%;
}

// 空状态
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

// 创建团队按钮
.publish-btn-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  z-index: 100;
  
  .publish-btn {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: linear-gradient(to right, #3B82F6, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.3);
  }
  
  .publish-text {
    font-size: 22rpx;
    color: $text-muted;
    margin-top: 10rpx;
  }
}

// 加载中状态
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  
  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid $text-secondary;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: $text-muted;
    margin-left: 20rpx;
  }
}

// 加载更多提示
.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0;
  
  .loading-text {
    font-size: 28rpx;
    color: $text-muted;
    margin-left: 20rpx;
  }
}
</style> 