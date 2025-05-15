<template>
  <view class="container">
    <!-- 顶部固定区域 -->
    <view class="header-fixed" :style="{ height: headerHeight }">
      <view class="header-bar">
        <view class="back-btn" @click="goBack">
          <SvgIcon name="back" size="25" />
        </view>
        <view class="header-title">任务广场</view>
        <view class="header-actions">
          <view class="action-btn" @click="onSearch">
            <SvgIcon name="sousuo" size="20" />
          </view>
          <view class="action-btn" @click="onNotification">
            <SvgIcon name="xiaoxi" size="20" />
          </view>
        </view>
      </view>
      
      <!-- 分类和筛选区域 -->
      <view class="filter-container">
        <!-- 分类标签 -->
        <view class="category-section">
          <view class="main-categories">
            <!-- 默认显示的主要分类 -->
            <view 
              v-for="item in getMainCategories()" 
              :key="item.id"
              :class="['category-tag', activeCategoryId === item.id ? 'category-tag-active' : '']"
              @click="selectCategory(item.id)"
            >
              {{ item.name }}
            </view>
            
            <!-- 更多按钮 -->
            <view class="more-btn" @click="toggleCategoryExpand" v-if="hasMoreCategories()">
              {{ isCategoryExpanded ? '收起' : '更多' }}
              <text class="iconfont" :class="isCategoryExpanded ? 'icon-arrow-up' : 'icon-arrow-down'"></text>
            </view>
          </view>
          
          <!-- 展开的更多分类 -->
          <view class="more-categories-container" v-if="isCategoryExpanded">
            <view class="more-categories">
              <view 
                v-for="item in getMoreCategories()" 
                :key="item.id"
                :class="['category-tag', activeCategoryId === item.id ? 'category-tag-active' : '']"
                @click="selectCategory(item.id)"
              >
                {{ item.name }}
              </view>
            </view>
          </view>
        </view>
        
        <!-- 状态筛选标签 -->
        <scroll-view scroll-x class="status-scroll" show-scrollbar="false">
          <view class="status-container">
            <view 
              v-for="(item, index) in statusOptions" 
              :key="index"
              :class="['status-filter-tag', activeStatus === item.value ? 'status-filter-active' : '']"
              @click="selectStatus(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </scroll-view>
        
        <!-- 添加排序筛选按钮 -->
        <view class="sort-filter">
          <view 
            v-for="(item, index) in sortOptions" 
            :key="index"
            :class="['sort-btn', activeSortOption === item.value && activeSortType === item.type ? 'sort-active' : '']"
            @click="selectSort(item.value, item.type)"
          >
            <text>{{ item.label }}</text>
            <SvgIcon v-if="item.icon" :name="item.icon" size="16" />
          </view>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view 
      scroll-y 
      class="tasks-scroll" 
      :style="{ 'padding-top': headerHeight }"
      @scrolltolower="loadMore" 
    >
      <view class="tasks-container">
        <!-- 顶部刷新提示 -->
        <view class="refresh-tip" v-if="loading && page.value === 1">
          <text class="refresh-text">正在加载数据...</text>
        </view>
        
        <!-- 任务卡片 -->
        <view 
          class="task-card" 
          v-for="task in taskList" 
          :key="task.id"
          @click="viewTaskDetail(task.id)"
        >
          <view class="task-header">
            <view>
              <view class="task-title">{{ task.title }}</view>
              <view class="task-tags">
                <text class="task-tag" :class="getCategoryClass(task.categoryName)">{{ task.categoryName }}</text>
                <text class="task-status-tag" :class="getStatusClass(task.status)">{{ task.statusText }}</text>
                <text class="task-deadline">截止: {{ formatDate(task.deadline) }}</text>
              </view>
            </view>
            <view class="task-reward" :class="getRewardClass(task.rewardTypeName)">
              <text v-if="task.rewardTypeName === '现金'">¥{{ task.rewardAmount }}</text>
              <text v-else-if="task.rewardTypeName === '学分'">{{ task.rewardAmount }}学分</text>
              <text v-else>{{ task.rewardTypeName }}</text>
            </view>
          </view>
          <view class="task-desc">{{ task.shortDescription }}</view>
          <view class="task-location" v-if="task.location">
            <SvgIcon name="weizhi" size="20" class="location-icon" />
            <text class="location-text">{{ task.location }}</text>
          </view>
          <view class="task-footer">
            <view class="task-publisher">
              <image class="publisher-avatar" :src="task.creatorAvatarUrl || defaultAvatar" mode="aspectFill"></image>
              <text class="publisher-info">{{ task.creatorName }} · {{ task.creatorMajor }}</text>
            </view>
            <view class="task-stats">
              <text class="stat-item"><SvgIcon name="liulan" size="20" class="stat-icon" /> {{ task.viewCount }}</text>
              <text class="stat-item"><SvgIcon name="Baominrenshu" size="20" class="stat-icon" /> {{ task.currentParticipants }}/{{ task.maxParticipants }}</text>
            </view>
          </view>
        </view>

        <!-- 空数据状态 -->
        <view class="empty-state" v-if="taskList.length === 0 && !loading">
          <image class="empty-image" src="/static/empty-task.png" mode="aspectFit"></image>
          <text class="empty-text">暂无任务数据</text>
        </view>

        <!-- 加载状态 -->
        <view class="loading-more" v-if="loading">
          <uni-load-more status="loading" :contentText="loadingText"></uni-load-more>
        </view>
        <view class="no-more" v-if="noMore && !loading && taskList.length > 0">
          <uni-load-more status="noMore" :contentText="loadingText"></uni-load-more>
        </view>
        
        <!-- 底部安全区域 -->
        <view class="safe-area-bottom"></view>
      </view>
    </scroll-view>

    <!-- 悬浮发布按钮 -->
    <view class="float-btn" @click="createTask">
      <SvgIcon name="chuangjianrenwu" size="30" color="#ffffff" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import request from '@/utils/request';
import SvgIcon from '@/components/SvgIcon.vue';

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/100';

// 分类数据
const categories = ref([
  { id: 0, name: '全部' }
]);

// 状态筛选选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '招募中', value: 'recruiting' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'canceled' }
];

// 排序筛选选项
const sortOptions = [
  { label: '默认排序', value: '', type: '', icon: '' },
  { label: '最新发布', value: 'desc', type: 'createTime', icon: 'shijian' },
  { label: '最早发布', value: 'asc', type: 'createTime', icon: 'shijian' },
  { label: '浏览量', value: 'true', type: 'viewCount', icon: 'liulan' }
];

const activeCategoryId = ref(0);
const activeStatus = ref('');
const activeSortOption = ref('');
const activeSortType = ref('');
const taskList = ref([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const noMore = ref(false);
const loadingText = ref({
  contentdown: '上拉显示更多',
  contentrefresh: '正在加载...',
  contentnomore: '已经到底啦'
});
const isCategoryExpanded = ref(false);
const refreshing = ref(false);

// 安全区域高度(rpx)
const safeAreaTop = ref(0);

// 主要显示的分类数量
const mainCategoryCount = 4;

// 计算顶部高度
const headerHeight = computed(() => {
  // 基础头部高度 = 导航栏(140rpx) + 主分类栏(110rpx) + 状态筛选栏(90rpx) + 排序筛选栏(90rpx)
  const baseHeight = 440;
  
  // 加上安全区域高度
  let height = baseHeight + safeAreaTop.value;
  
  // 如果展开了分类，加上展开分类的高度
  if (isCategoryExpanded.value) {
    const moreCount = getMoreCategories().length;
    // 计算行数（每行最多4个分类）
    const rows = Math.ceil(moreCount / 4);
    // 每行高度约80rpx，再加上上下padding共30rpx
    height += (rows * 80) + 30;
  }
  return height + 'rpx';
});

// 初始化数据
onMounted(() => {
  // 设置加载文本
  loadingText.value = {
    contentdown: '上拉显示更多',
    contentrefresh: '正在加载...',
    contentnomore: '已经到底啦'
  };
  
  // 获取安全区域高度
  getSystemInfo();
  
  // 获取任务分类
  getTaskCategories();
  // 获取任务列表
  getTaskList();
});

// 获取系统信息和安全区域高度
function getSystemInfo() {
  uni.getSystemInfo({
    success: (res) => {
      if (res.safeArea && res.safeArea.top) {
        // 将px转换为rpx (750rpx = 设计稿宽度)
        const screenWidth = res.screenWidth;
        safeAreaTop.value = Math.round((res.safeArea.top * 750) / screenWidth);
        console.log('安全区高度(rpx):', safeAreaTop.value);
      }
    }
  });
}

// 获取任务分类
async function getTaskCategories() {
  try {
    const res = await request({
      url: '/taskCategories',
      method: 'GET'
    });
    
    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      // 添加"全部"选项
      const allCategories = [{ id: 0, name: '全部' }, ...res.data];
      categories.value = allCategories;
    } else {
      console.error('获取任务分类失败:', res);
    }
  } catch (error) {
    console.error('获取任务分类异常:', error);
    uni.showToast({
      title: '获取分类失败',
      icon: 'none'
    });
  }
}

// 获取任务列表
async function getTaskList() {
  // 显示loading状态
  loading.value = true;
  
  try {
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value
    };
    
    // 添加分类筛选条件
    if (activeCategoryId.value !== 0) {
      params.categoryId = activeCategoryId.value;
    }
    
    // 添加状态筛选条件
    if (activeStatus.value) {
      params.status = activeStatus.value;
    }
    
    // 添加排序条件
    if (activeSortType.value === 'createTime' && activeSortOption.value) {
      params.orderByCreateTime = activeSortOption.value;
    } else if (activeSortType.value === 'viewCount' && activeSortOption.value === 'true') {
      params.orderByViewCount = true;
    }
    
    // 输出请求参数，便于调试
    console.log('请求参数:', JSON.stringify(params, null, 2));
    
    const res = await request({
      url: '/tasks/list',
      method: 'GET',
      params
    });
    
    if (res.code === 200 && res.data) {
      if (page.value === 1) {
        // 初始加载，替换所有数据
        taskList.value = res.data.records || [];
      } else {
        // 上拉加载更多，追加数据
        taskList.value = [...taskList.value, ...(res.data.records || [])];
        
        // 如果加载到了新数据，显示提示
        if (res.data.records && res.data.records.length > 0) {
          uni.showToast({
            title: `加载了${res.data.records.length}条新数据`,
            icon: 'none',
            duration: 1500
          });
        }
      }
      
      // 判断是否还有更多数据
      if (res.data.current >= res.data.pages || !res.data.records || res.data.records.length === 0) {
        noMore.value = true;
      } else {
        noMore.value = false;
      }
    } else {
      console.error('获取任务列表失败:', res);
      uni.showToast({
        title: '获取任务列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取任务列表异常:', error);
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  } catch (e) {
    return dateStr;
  }
}

// 选择分类
function selectCategory(categoryId) {
  if (activeCategoryId.value === categoryId) {
    // 如果点击已选中的分类，不做任何操作
    return;
  }
  
  activeCategoryId.value = categoryId;
  // 不再自动折叠分类面板
  // isCategoryExpanded.value = false;
  page.value = 1;
  noMore.value = false;
  taskList.value = [];
  getTaskList();
}

// 选择状态
function selectStatus(status) {
  if (activeStatus.value === status) return;
  activeStatus.value = status;
  page.value = 1;
  noMore.value = false;
  taskList.value = [];
  getTaskList();
}

// 选择排序方式
function selectSort(value, type) {
  // 如果点击已选中的排序，取消选择
  if (activeSortOption.value === value && activeSortType.value === type) {
    activeSortOption.value = '';
    activeSortType.value = '';
  } else {
    activeSortOption.value = value;
    activeSortType.value = type;
  }
  
  // 重置页码并重新加载数据
  page.value = 1;
  noMore.value = false;
  taskList.value = [];
  getTaskList();
}

// 加载更多数据
function loadMore() {
  if (loading.value || refreshing.value || noMore.value) return;
  
  // 显示加载提示
  uni.showToast({
    title: '加载更多数据...',
    icon: 'none',
    duration: 800
  });
  
  page.value++;
  getTaskList();
}

// 根据分类获取样式
function getCategoryClass(category) {
  switch (category) {
    case '问卷调查':
      return 'tag-blue';
    case '数据收集':
      return 'tag-green';
    case '实验参与':
      return 'tag-purple';
    case '校园活动':
      return 'tag-orange';
    case '学术研究':
      return 'tag-pink';
    case '志愿服务':
      return 'tag-green';
    case '竞赛协助':
      return 'tag-yellow';
    case '技术支持':
      return 'tag-blue';
    default:
      return 'tag-blue';
  }
}

// 根据状态获取样式
function getStatusClass(status) {
  switch (status) {
    case 'recruiting':
      return 'status-recruiting';
    case 'ongoing':
      return 'status-ongoing';
    case 'completed':
      return 'status-ended';
    case 'canceled':
      return 'status-canceled';
    default:
      return 'status-recruiting';
  }
}

// 根据奖励类型获取样式
function getRewardClass(type) {
  switch (type) {
    case '现金':
      return 'reward-orange';
    case '学分':
      return 'reward-blue';
    case '志愿服务':
      return 'reward-green';
    case '证书':
      return 'reward-yellow';
    case '礼品':
      return 'reward-purple';
    default:
      return 'reward-gray';
  }
}

// 查看任务详情
function viewTaskDetail(id) {
  uni.navigateTo({
    url: `/pages/task-square/detail?id=${id}`
  });
}

// 发布任务
function createTask() {
  uni.navigateTo({
    url: '/pages/task-square/create'
  });
}

// 搜索
function onSearch() {
  uni.navigateTo({
    url: '/pages/task-square/search'
  });
}

// 通知
function onNotification() {
  uni.navigateTo({
    url: '/pages/notification/index'
  });
}

// 返回
function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // 有历史记录，正常返回
    uni.navigateBack();
  } else {
    // 没有历史记录，切换到首页tab
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
}

// 获取选中的分类名称
function getSelectedCategoryName() {
  const selectedCategory = categories.value.find(item => item.id === activeCategoryId.value);
  return selectedCategory ? selectedCategory.name : '全部';
}

// 切换分类展开状态
function toggleCategoryExpand() {
  isCategoryExpanded.value = !isCategoryExpanded.value;
}

// 获取主要显示的分类
function getMainCategories() {
  return categories.value.slice(0, mainCategoryCount);
}

// 获取更多分类
function getMoreCategories() {
  return categories.value.slice(mainCategoryCount);
}

// 判断是否有更多分类
function hasMoreCategories() {
  return categories.value.length > mainCategoryCount;
}
</script>

<style lang="scss">
/* 使用项目色彩系统 */
$primary-color: #4A90E2; // 活力蓝
$secondary-color: #7ED321; // 校园绿
$accent-color: #FF6B6B; // 竞赛橙
$bg-color: #f5f5f5;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;
$border-color: #eeeeee;

/* 全局容器样式 */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

/* 顶部固定区域 */
.header-fixed {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  /* 适配安全区域 */
  padding-top: env(safe-area-inset-top, 0);
}

/* 顶部导航栏 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 30rpx 20rpx 30rpx;
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;

    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20rpx;
    
    .iconfont {
      font-size: 36rpx;
      color: $text-primary;
    }
  }
  
  .header-title {
    flex: 1;
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
    text-align: center;
  }
  
  .header-actions {
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .iconfont {
        font-size: 36rpx;
        color: $text-secondary;
      }
    }
  }
}

/* 筛选容器 */
.filter-container {
  position: relative;
  padding-bottom: 10rpx;
  margin-bottom: 10rpx;
}

/* 分类标签栏 */
.category-section {
  width: 100%;
  padding: 20rpx 30rpx 10rpx;
  background-color: #ffffff;
  position: relative;
  z-index: 100;
}

.main-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 16rpx;
}

.category-tag {
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
  color: $text-secondary;
  transition: all 0.2s;
}

.category-tag-active {
  background-color: $primary-color;
  color: #ffffff;
}

.more-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  background-color: #f0f0f0;
  color: $text-secondary;
  
  .iconfont {
    font-size: 24rpx;
    margin-left: 8rpx;
    transition: transform 0.2s;
  }
  
  &:active {
    opacity: 0.8;
  }
}

/* 分类展开容器 */
.more-categories-container {
  width: 100%;
  background-color: #ffffff;
  z-index: 100;
  overflow: hidden;
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.more-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
}

/* 状态筛选标签 */
.status-scroll {
  padding:0 30rpx 0rpx 30rpx;
  
  .status-container {
    display: flex;
    padding-right: 30rpx;
  }
}

.status-filter-tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  margin-right: 16rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  background-color: #f5f5f5;
  color: $text-secondary;
  transition: all 0.3s;
}

.status-filter-active {
  background-color: $secondary-color;
  color: #ffffff;
}

/* 排序筛选按钮 */
.sort-filter {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  gap: 16rpx;
}

.sort-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 15rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: $text-secondary;
  background-color: #f5f5f5;
  transition: all 0.3s;
  
  text {
    margin-right: 6rpx;
  }
  
  &:active {
    opacity: 0.8;
  }
}

.sort-active {
  background-color: $primary-color;
  color: #ffffff;
}

/* 任务列表 */
.tasks-scroll {
  flex: 1;
  padding-bottom: 80rpx; /* 底部安全区域 */
  transition: padding-top 0.3s ease;
}

.tasks-container {
  padding:50rpx 20rpx;
}

/* 任务卡片 */
.task-card {
  margin-bottom: 24rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .task-title {
      font-size: 34rpx;
      font-weight: bold;
      color: $text-primary;
      line-height: 1.4;
      margin-bottom: 16rpx;
    }
    
    .task-tags {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-top: 12rpx;
      
      .task-tag, .task-status-tag {
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
      }
      
      .task-deadline {
        font-size: 24rpx;
        color: $text-light;
      }
    }
    
    .task-reward {
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .reward-orange {
      color: $accent-color;
    }
    
    .reward-gray {
      color: $text-secondary;
    }
  }
  
  .task-desc {
    margin: 20rpx 0;
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
  }
  
  .task-location {
    display: flex;
    align-items: center;
    margin: 16rpx 0;
    
    .location-icon {
      margin-right: 8rpx;
      color: $text-light;
    }
    
    .location-text {
      font-size: 26rpx;
      color: $text-light;
    }
  }
  
  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    
    .task-publisher {
      display: flex;
      align-items: center;
      
      .publisher-avatar {
        width: 50rpx;
        height: 50rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      
      .publisher-info {
        font-size: 26rpx;
        color: $text-light;
      }
    }
    
    .task-stats {
      display: flex;
      gap: 20rpx;
      
      .stat-item {
        font-size: 26rpx;
        color: $text-light;
        display: flex;
        align-items: center;
        
        .stat-icon {
          margin-right: 8rpx;
        }
      }
    }
  }
}

/* 任务标签颜色 */
.tag-blue {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
}

.tag-green {
  background-color: rgba($secondary-color, 0.1);
  color: $secondary-color;
}

.tag-orange {
  background-color: rgba($accent-color, 0.1);
  color: $accent-color;
}

.tag-purple {
  background-color: rgba(#9C27B0, 0.1);
  color: #9C27B0;
}

.tag-pink {
  background-color: rgba(#E91E63, 0.1);
  color: #E91E63;
}

.tag-yellow {
  background-color: rgba(#FFC107, 0.1);
  color: #FFC107;
}

/* 任务状态标签 */
.status-recruiting {
  background-color: rgba(#4CAF50, 0.1);
  color: #4CAF50;
}

.status-ongoing {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
}

.status-ended {
  background-color: rgba($text-light, 0.1);
  color: $text-light;
}

.status-canceled {
  background-color: rgba(#F44336, 0.1);
  color: #F44336;
}

/* 奖励类型颜色 */
.reward-orange {
  color: $accent-color;
}

.reward-blue {
  color: $primary-color;
}

.reward-green {
  color: $secondary-color;
}

.reward-yellow {
  color: #FFC107;
}

.reward-purple {
  color: #9C27B0;
}

.reward-gray {
  color: $text-secondary;
}

/* 悬浮按钮 */
.float-btn {
  position: fixed;
  right: 30rpx;
  bottom: calc(100rpx + env(safe-area-inset-bottom, 0));
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: $primary-color;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.3);
  z-index: 900;
  
  .iconfont {
    font-size: 50rpx;
  }
}

/* 加载更多 */
.loading-more, .no-more {
  padding: 32rpx 0;
  text-align: center;
  color: $text-light;
}

/* 空数据状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    opacity: 0.5;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
}

/* 顶部刷新提示 */
.refresh-tip {
  padding: 32rpx 0;
  text-align: center;
}

.refresh-text {
  font-size: 28rpx;
  color: $text-secondary;
}

/* 底部安全区域 */
.safe-area-bottom {
  height: 60rpx; /* 适配底部安全区域 */
}

/* 在iOS设备上增大底部安全区域 */
/* #ifdef APP-PLUS || MP || H5 */
@supports (padding-bottom: constant(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(60rpx + constant(safe-area-inset-bottom));
    height: calc(60rpx + env(safe-area-inset-bottom));
  }
}
/* #endif */

/* 分隔线 */
.divider {
  height: 2rpx;
  background-color: $border-color;
  margin: 10rpx 30rpx;
}
</style> 