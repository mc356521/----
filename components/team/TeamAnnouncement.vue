<template>
  <view class="announcement-container">
    <view class="empty-state" v-if="!hasAnnouncements">
      <image class="empty-image" src="/static/image/empty-announcement.png" mode="aspectFit"></image>
      <text class="empty-text">暂无团队公告</text>
      <view class="action-btn primary" @click="createAnnouncement">
        <text>发布公告</text>
      </view>
    </view>
    
    <view class="announcement-list" v-else>
      <view class="announcement-item" v-for="(item, index) in announcements" :key="index">
        <view class="announcement-header">
          <view class="announcement-title">{{ item.title }}</view>
          <view class="announcement-time">{{ formatTime(item.createTime) }}</view>
        </view>
        <view class="announcement-content">{{ item.content }}</view>
        <view class="announcement-footer">
          <view class="announcement-publisher">
            <image class="publisher-avatar" :src="item.publisherAvatar" mode="aspectFill"></image>
            <text class="publisher-name">{{ item.publisherName }}</text>
          </view>
        </view>
      </view>
      
      <view class="load-more" v-if="hasMore" @click="loadMore">
        <text>加载更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  teamId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['create']);

// 数据定义
const announcements = ref([]);
const hasMore = ref(false);
const loading = ref(false);

// 计算属性
const hasAnnouncements = ref(false);

// 方法
function loadAnnouncements() {
  loading.value = true;
  // 模拟加载数据
  setTimeout(() => {
    announcements.value = [
      {
        id: '1',
        title: '团队工作安排',
        content: '本周我们将进行登录模块的开发工作，请各位按照既定计划推进，有问题及时沟通。',
        createTime: new Date(Date.now() - 24 * 3600 * 1000),
        publisherId: '1002',
        publisherName: '张三',
        publisherAvatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png'
      }
    ];
    hasAnnouncements.value = announcements.value.length > 0;
    hasMore.value = false;
    loading.value = false;
  }, 500);
}

function createAnnouncement() {
  emit('create');
}

function loadMore() {
  // 加载更多公告
  console.log('加载更多公告');
}

function formatTime(date) {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// 初始化
loadAnnouncements();
</script>

<style>
.announcement-container {
  padding: 20rpx 0;
}

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
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.action-btn {
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #3498db;
  color: #ffffff;
}

.announcement-list {
  padding: 0 30rpx;
}

.announcement-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.announcement-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.announcement-time {
  font-size: 24rpx;
  color: #999999;
}

.announcement-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.announcement-footer {
  display: flex;
  justify-content: flex-end;
}

.announcement-publisher {
  display: flex;
  align-items: center;
}

.publisher-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.publisher-name {
  font-size: 24rpx;
  color: #666666;
}

.load-more {
  text-align: center;
  padding: 20rpx 0;
  color: #3498db;
  font-size: 28rpx;
}
</style> 