<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <image :src="icons.back" class="icon-btn"></image>
        </view>
        <text class="page-title">我的任务</text>
        <view class="placeholder"></view>
      </view>
      
      <!-- 标签页选择器 -->
      <view class="tabs">
        <view 
          v-for="(tab, index) in tabs" 
          :key="index" 
          class="tab-item" 
          :class="{ 'active': activeTab === index }"
          @click="switchTab(index)"
        >
          <text>{{ tab }}</text>
        </view>
      </view>
    </view>
    
    <!-- 筛选器 -->
    <view class="status-filter-container">
      <scroll-view scroll-x class="status-scroll" show-scrollbar="false" :scroll-into-view="'status-' + selectedStatus" scroll-with-animation>
        <view class="status-list">
          <view 
            v-for="(status, index) in statusOptions" 
            :key="index"
            :id="'status-' + status.value"
            class="status-item"
            :class="{ 'active': selectedStatus === status.value }"
            @click="filterByStatus(status.value)"
          >
            <text>{{ status.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 列表内容区域 -->
    <scroll-view 
      scroll-y 
      class="task-list-container" 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 我创建的任务 -->
      <block v-if="activeTab === 0">
        <view v-if="createdTasks.length === 0 && !loading" class="empty-container">
          <image src="/static/image/empty-data.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">您还没有创建任何任务</text>
          <button class="create-btn" @click="navigateToCreate">创建任务</button>
        </view>
        
        <view v-else class="task-list">
          <view 
            v-for="task in createdTasks" 
            :key="task.id"
            class="task-card"
            @click="navigateToDetail(task.id)"
          >
            <view class="task-header">
              <view class="task-title-row">
                <text class="task-title">{{ task.title }}</text>
                <view class="task-status" :class="getStatusClass(task.status)">
                  <text>{{ task.statusText }}</text>
                </view>
              </view>
              <view class="task-meta">
                <view class="category-tag">{{ task.categoryName }}</view>
                <text class="task-date">截止时间: {{ formatDate(task.deadline) }}</text>
              </view>
            </view>
            
            <view class="task-content">
              <text class="task-desc">{{ task.shortDescription }}</text>
              
              <view class="task-footer">
                <view class="task-reward">
                  <text class="reward-text">{{ task.rewardTypeName }}</text>
                  <text class="reward-amount">¥{{ task.rewardAmount }}</text>
                </view>
                
                <view class="task-progress">
                  <text class="progress-text">{{ task.currentParticipants }}/{{ task.maxParticipants }}</text>
                  <view class="progress-bar">
                    <view 
                      class="progress-inner" 
                      :style="{ width: (task.currentParticipants / task.maxParticipants * 100) + '%' }"
                    ></view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载更多状态 -->
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-if="!hasMore && createdTasks.length > 0" class="no-more">
            <text>没有更多了</text>
          </view>
        </view>
      </block>
      
      <!-- 我参与的任务 -->
      <block v-if="activeTab === 1">
        <view v-if="participatedTasks.length === 0 && !loading" class="empty-container">
          <image src="/static/image/empty-data.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">您还没有参与任何任务</text>
          <button class="browse-btn" @click="navigateToTaskSquare">浏览任务广场</button>
        </view>
        
        <view v-else class="task-list">
          <view 
            v-for="task in participatedTasks" 
            :key="task.id"
            class="task-card"
            @click="navigateToDetail(task.id)"
          >
            <view class="task-header">
              <view class="task-title-row">
                <text class="task-title">{{ task.title }}</text>
                <view class="task-status" :class="getStatusClass(task.status)">
                  <text>{{ task.statusText }}</text>
                </view>
              </view>
              <view class="task-meta">
                <view class="category-tag">{{ task.categoryName }}</view>
                <text class="task-date">截止时间: {{ formatDate(task.deadline) }}</text>
              </view>
            </view>
            
            <view class="task-content">
              <view class="creator-info">
                <image :src="task.creatorAvatarUrl" class="creator-avatar"></image>
                <view class="creator-detail">
                  <text class="creator-name">{{ task.creatorName }}</text>
                  <text class="creator-major">{{ task.creatorMajor }}</text>
                </view>
              </view>
              
              <text class="task-desc">{{ task.shortDescription }}</text>
              
              <view class="task-footer">
                <view class="task-reward">
                  <text class="reward-text">{{ task.rewardTypeName }}</text>
                  <text class="reward-amount">¥{{ task.rewardAmount }}</text>
                </view>
                
                <view class="task-location">
                  <text class="location-icon iconfont icon-location"></text>
                  <text class="location-text">{{ task.location }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 加载更多状态 -->
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-if="!hasMore && participatedTasks.length > 0" class="no-more">
            <text>没有更多了</text>
          </view>
        </view>
      </block>
    </scroll-view>
    
    <!-- 悬浮按钮 -->
    <view class="float-btn" @click="navigateToCreate" v-if="activeTab === 0">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import tasksApi from '@/api/modules/tasks';
import { icons } from '@/static/svg/icons.js';

// 标签页相关
const tabs = ['我创建的', '我参与的'];
const activeTab = ref(0);

// 筛选选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '招募中', value: 'recruiting' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'canceled' }
];
const selectedStatus = ref('');

// 分页相关
const pageSize = 10;
const createdPage = ref(1);
const participatedPage = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const refreshing = ref(false);

// 任务数据
const createdTasks = ref([]);
const participatedTasks = ref([]);

// 初始化
onMounted(() => {
  loadTasks();
});

// 切换标签页
function switchTab(index) {
  activeTab.value = index;
  resetList();
  loadTasks();
}

// 按状态筛选
function filterByStatus(status) {
  selectedStatus.value = status;
  resetList();
  loadTasks();
}

// 重置列表
function resetList() {
  if (activeTab.value === 0) {
    createdTasks.value = [];
    createdPage.value = 1;
  } else {
    participatedTasks.value = [];
    participatedPage.value = 1;
  }
  hasMore.value = true;
}

// 加载任务列表
async function loadTasks() {
  if (!hasMore.value || loading.value) return;
  
  loading.value = true;
  
  try {
    const params = {
      pageNum: activeTab.value === 0 ? createdPage.value : participatedPage.value,
      pageSize: pageSize
    };
    
    // 添加状态筛选
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    
    // 根据标签页调用不同API
    let res;
    if (activeTab.value === 0) {
      res = await tasksApi.getMyCreatedTasks(params);
    } else {
      res = await tasksApi.getMyParticipatedTasks(params);
    }
    
    if (res.code === 200 && res.data) {
      const { records, total, current, pages } = res.data;
      
      // 更新列表数据
      if (activeTab.value === 0) {
        createdTasks.value = [...createdTasks.value, ...records];
        createdPage.value++;
      } else {
        participatedTasks.value = [...participatedTasks.value, ...records];
        participatedPage.value++;
      }
      
      // 判断是否还有下一页
      hasMore.value = current < pages;
    } else {
      uni.showToast({
        title: '加载任务失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载任务出错:', error);
    uni.showToast({
      title: '加载任务出错',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 下拉刷新
function onRefresh() {
  refreshing.value = true;
  resetList();
  loadTasks().finally(() => {
    refreshing.value = false;
  });
}

// 加载更多
function loadMore() {
  loadTasks();
}

// 获取状态样式类
function getStatusClass(status) {
  const statusMap = {
    'recruiting': 'status-recruiting',
    'ongoing': 'status-ongoing',
    'ended': 'status-ended',
    'completed': 'status-completed',
    'canceled': 'status-canceled'
  };
  
  return statusMap[status] || 'status-default';
}

// 日期格式化
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 页面导航
function goBack() {
  uni.navigateBack();
}

function navigateToDetail(id) {
  uni.navigateTo({
    url: `/pages/task-square/detail?id=${id}`
  });
}

function navigateToCreate() {
  uni.navigateTo({
    url: '/pages/task-square/create'
  });
}

function navigateToTaskSquare() {
  uni.switchTab({
    url: '/pages/task-square/index'
  });
}
</script>

<style>
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部导航 */
.header {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-bar {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: none;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn {
  width: 40rpx;
  height: 40rpx;
}

.page-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 60rpx;
}

/* 标签页 */
.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 32rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4a90e2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #4a90e2;
  border-radius: 3rpx;
}

/* 状态筛选器 */
.status-filter-container {
  background-color: #fff;
  padding: 20rpx 0;
  z-index: 99;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-scroll {
  white-space: nowrap;
  width: 100%;
}

.status-list {
  display: inline-flex;
  padding: 0 20rpx;
}

.status-item {
  padding: 14rpx 34rpx;
  margin-right: 20rpx;
  font-size: 30rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  transition: all 0.3s ease;
}

.status-item:first-child {
  margin-left: 4rpx;
}

.status-item.active {
  color: #fff;
  background-color: #4a90e2;
  font-weight: 500;
}

/* 列表容器 */
.task-list-container {
  flex: 1;
  height: 0;
  background-color: #f8f8f8;
}

/* 空状态 */
.empty-container {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.create-btn, .browse-btn {
  background-color: #4a90e2;
  color: #fff;
  font-size: 30rpx;
  padding: 16rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

/* 任务列表 */
.task-list {
  padding: 20rpx;
}

.task-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.task-header {
  padding: 26rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.task-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.task-status {
  padding: 8rpx 22rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #fff;
}

.status-recruiting {
  background-color: #4a90e2;
}

.status-ongoing {
  background-color: #33cc99;
}

.status-ended {
  background-color: #ff9933;
}

.status-completed {
  background-color: #8e8e93;
}

.status-canceled {
  background-color: #ff3b30;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  background-color: #f0f7ff;
  color: #4a90e2;
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 4rpx;
}

.task-date {
  font-size: 28rpx;
  color: #999;
}

.task-content {
  padding: 26rpx;
}

.creator-info {
  display: flex;
  align-items: center;
  margin-bottom: 22rpx;
}

.creator-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 16rpx;
}

.creator-detail {
  display: flex;
  flex-direction: column;
}

.creator-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.creator-major {
  font-size: 28rpx;
  color: #999;
}

.task-desc {
  font-size: 34rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 26rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-reward {
  display: flex;
  align-items: center;
}

.reward-text {
  font-size: 28rpx;
  color: #ff9933;
  margin-right: 10rpx;
}

.reward-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff9933;
}

.task-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.progress-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.progress-bar {
  width: 130rpx;
  height: 10rpx;
  background-color: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #4a90e2;
}

.task-location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 6rpx;
}

.location-text {
  font-size: 28rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240rpx;
}

/* 加载更多 */
.loading-more, .no-more {
  text-align: center;
  padding: 20rpx 0;
}

.loading-more text, .no-more text {
  font-size: 28rpx;
  color: #999;
}

/* 悬浮按钮 */
.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4a90e2;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.3);
}

.add-icon {
  font-size: 60rpx;
  font-weight: bold;
}
</style> 