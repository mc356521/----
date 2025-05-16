<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <header-bar
      ref="headerBarRef"
      title="组队广场"
      :categories="categories"
      :default-category="currentCategory"
      :show-filter="true"
      @search="goToSearch"
      @filter="showFilterPanel"
      @category-change="selectCategory"
    >
      <template #filter-button>
        <view class="filter-btn-container">
          <SvgIcon name="filter" size="24" />
          <view class="filter-badge" v-if="getAppliedFilterCount() > 0">
            <text>{{ getAppliedFilterCount() }}</text>
          </view>
        </view>
      </template>
    </header-bar>
    
    <!-- 导航栏占位 -->
    <view class="header-placeholder" :style="{ height: headerPlaceholderHeight }"></view>

    <!-- 组队列表 -->
    <scroll-view 
      scroll-y="true" 
      class="team-list" 
      @scrolltolower="loadMore"
    >
      <!-- 当前筛选状态提示 -->
      <view class="filter-summary" v-if="getAppliedFilterCount() > 0">
        <text class="filter-tip">已筛选 {{ getAppliedFilterCount() }} 个条件</text>
        <text class="clear-filter" @click="resetFilters">清除</text>
      </view>
      
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
    
    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilter" @click.stop="hideFilterPanel">
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <view class="filter-close" @click.stop="hideFilterPanel">
            <SvgIcon name="close" size="24" color="#333333"></SvgIcon>
          </view>
        </view>
        
        <!-- 状态筛选 -->
        <view class="filter-section">
          <text class="filter-section-title">队伍状态</text>
          <view class="filter-options">
            <view 
              v-for="(status, index) in statusOptions" 
              :key="index"
              class="filter-option"
              :class="{ 'selected': selectedStatus === status.value }"
              :data-status="status.value"
              @click="selectStatus(status.value)"
            >
              <text>{{ status.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 竞赛类型筛选 -->
        <view class="filter-section">
          <text class="filter-section-title">竞赛类型</text>
          <view class="filter-options">
            <view 
              v-for="(category, index) in categoryOptions" 
              :key="index"
              class="filter-option"
              :class="{ 'selected': selectedCategoryId === category.id }"
              @click="selectCategoryFilter(category.id)"
            >
              <text>{{ category.name }}</text>
            </view>
          </view>
        </view>
        
        <!-- 排序方式 -->
        <view class="filter-section">
          <text class="filter-section-title">排序方式</text>
          <view class="filter-options">
            <view 
              v-for="(sort, index) in sortOptions" 
              :key="index"
              class="filter-option"
              :class="{ 'selected': selectedSort === sort.value }"
              @click="selectSort(sort.value, sort.type)"
            >
              <text>{{ sort.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="filter-actions">
          <view class="reset-btn" @click.stop="resetFilters">重置</view>
          <view class="apply-btn" @click.stop="applyFilters">确认筛选</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import teamApi from '@/api/modules/team';
import SvgIcon from '@/components/SvgIcon.vue';

// 分类数据
const categories = ref(['全部队伍', '学科竞赛', '创新创业', '体育竞赛', '文艺比赛']);
const currentCategory = ref(0);

// HeaderBar引用
const headerBarRef = ref(null);

// 计算HeaderBar占位高度
const headerPlaceholderHeight = computed(() => {
  // 默认高度，保守估计
  let height = 120;
  
  if (headerBarRef.value && headerBarRef.value.headerHeight) {
    // 如果能获取到组件暴露的高度，使用组件高度
    return headerBarRef.value.headerHeight + 'rpx';
  }
  
  // 根据是否有分类决定高度
  return (categories.value && categories.value.length > 0) ? '200rpx' : '120rpx';
});

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
const showFilter = ref(false);

// 筛选选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '招募中', value: '招募中' },
  { label: '已组队', value: '已组队' },
  { label: '已完成', value: '已完成' },
  { label: '已解散', value: '已解散' }
];

const categoryOptions = [
  { id: '', name: '全部' },
  { id: 1, name: '学科竞赛' },
  { id: 2, name: '创新创业' },
  { id: 3, name: '体育竞赛' },
  { id: 4, name: '文艺比赛' }
];

const sortOptions = [
  { label: '默认排序', value: '', type: '' },
  { label: '最新发布', value: 'desc', type: 'createTime' },
  { label: '最早发布', value: 'asc', type: 'createTime' },
  { label: '热门浏览', value: 'true', type: 'viewCount' }
];

// 筛选选择
const selectedStatus = ref('');
const selectedCategoryId = ref('');
const selectedSort = ref('');
const selectedSortType = ref('');

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryId: '',
  status: '',
  orderByViewCount: false,
  orderByCreateTime: ''
});

// 获取团队列表
async function getTeamList(refresh = false) {
  // 不在这里检查登录状态，移到onMounted中检查
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
    
    console.log('请求参数:', JSON.stringify(params, null, 2));
    const res = await teamApi.getTeamList(params);

    
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
    queryParams.categoryId = ''; // 移除categoryId参数而不是设为null
  } else {
    // 特定分类
    // 这里可能需要根据后端API调整实际的分类ID
    queryParams.categoryId = index;
  }
  
  // 刷新数据
  getTeamList(true);
}

// 显示筛选面板
function showFilterPanel() {
  console.log('打开筛选面板');
  showFilter.value = true;
}

// 隐藏筛选面板
function hideFilterPanel() {
  console.log('关闭筛选面板');
  showFilter.value = false;
}

// 选择状态
function selectStatus(status) {
  selectedStatus.value = status;
}

// 选择分类筛选
function selectCategoryFilter(categoryId) {
  selectedCategoryId.value = categoryId;
}

// 选择排序方式
function selectSort(value, type) {
  selectedSort.value = value;
  selectedSortType.value = type;
}

// 重置筛选条件
function resetFilters() {
  selectedStatus.value = '';
  selectedCategoryId.value = '';
  selectedSort.value = '';
  selectedSortType.value = '';
  
  // 如果已经应用了筛选，则重置后立即刷新数据
  if (queryParams.status || queryParams.categoryId || 
      queryParams.orderByViewCount || queryParams.orderByCreateTime) {
    // 重置查询参数
    queryParams.status = '';
    queryParams.categoryId = '';
    queryParams.orderByViewCount = false;
    queryParams.orderByCreateTime = '';
    
    // 刷新数据
    getTeamList(true);
  }
}

// 应用筛选条件
function applyFilters() {
  console.log('应用筛选条件:', {
    status: selectedStatus.value,
    categoryId: selectedCategoryId.value,
    sortValue: selectedSort.value,
    sortType: selectedSortType.value
  });
  
  // 更新查询参数
  queryParams.status = selectedStatus.value;
  queryParams.categoryId = selectedCategoryId.value;
  
  // 处理排序方式
  if (selectedSortType.value === 'viewCount') {
    queryParams.orderByViewCount = selectedSort.value === 'true';
    queryParams.orderByCreateTime = '';
  } else if (selectedSortType.value === 'createTime') {
    queryParams.orderByCreateTime = selectedSort.value;
    queryParams.orderByViewCount = false;
  } else {
    queryParams.orderByViewCount = false;
    queryParams.orderByCreateTime = '';
  }
  
  // 隐藏筛选面板
  hideFilterPanel();
  
  // 显示加载提示
  uni.showLoading({
    title: '筛选中...'
  });
  
  // 重置页码并获取数据
  queryParams.pageNum = 1;
  getTeamList(true);
  
  // 关闭加载提示并显示成功提示
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '筛选成功',
      icon: 'success',
      duration: 1500
    });
  }, 1000);
}

// 获取应用的筛选条件数量
function getAppliedFilterCount() {
  let count = 0;
  if (queryParams.status) count++;
  if (queryParams.categoryId) count++;
  if (queryParams.orderByViewCount) count++;
  if (queryParams.orderByCreateTime) count++;
  return count;
}

// 页面加载
onMounted(() => {
  console.log('组队列表页面加载');
  
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
  
  // 已登录，获取团队列表
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

// 跳转到搜索页
function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
  });
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '../../static/animate.css';
@import '../../config/theme.scss';

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
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// HeaderBar占位区域
.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 组队列表
.team-list {
  flex: 1;
  padding:0rpx 30rpx 150rpx 30rpx;
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
  text-align: center;
    color: $text-muted;
  font-size: 26rpx;
  }

// 筛选面板
.filter-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.filter-content {
  width: 70%;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  box-shadow: -5rpx 0 15rpx rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* 允许内容滚动 */
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.filter-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.filter-close {
  padding: 10rpx;
}

.filter-section {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.filter-section-title {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 20rpx;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.filter-option {
  padding: 12rpx 24rpx;
  background-color: #f3f4f6;
  border-radius: 8rpx;
  transition: all 0.2s ease;
  
  text {
    font-size: 26rpx;
    color: $text-secondary;
  }
  
  &.selected {
    background-color: rgba($primary-color, 0.1);
    
    text {
      color: $primary-color;
      font-weight: 500;
    }
  }
  
  // 状态特定样式
  &[data-status="招募中"]:not(.selected) text {
    color: #00C07F;
  }
  
  &[data-status="已组队"]:not(.selected) text {
    color: #1888E8;
  }
  
  &[data-status="已完成"]:not(.selected) text {
    color: #5368BD;
  }
  
  &[data-status="已解散"]:not(.selected) text {
    color: #525B7A;
  }
}

.filter-actions {
  padding: 30rpx;
  display: flex;
  gap: 20rpx;
  margin-top: auto;
  border-top: 1rpx solid #e5e7eb;
  background-color: #fff;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.reset-btn, .apply-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.reset-btn {
  background-color: #f3f4f6;
  color: $text-secondary;
  border: 1px solid #e5e7eb;
  
  &:active {
    transform: scale(0.98);
    background-color: #e5e7eb;
  }
}

.apply-btn {
  background-color: $primary-color;
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(36, 122, 228, 0.3);
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

// 筛选按钮容器
.filter-btn-container {
  position: relative;
  padding: 10rpx;
}

// 筛选徽章
.filter-badge {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  background-color: #EF4444;
  color: white;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 6rpx;
  
  text {
    color: white;
  }
}

// 当前筛选状态提示
.filter-summary {
  padding: 15rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  
  .filter-tip {
    font-size: 24rpx;
    color: $text-secondary;
  }
  
  .clear-filter {
    font-size: 24rpx;
    color: $primary-color;
    padding: 6rpx 16rpx;
    background-color: rgba($primary-color, 0.1);
    border-radius: 20rpx;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 