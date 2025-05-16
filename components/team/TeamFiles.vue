<template>
  <view class="files-container">
    <view class="empty-state" v-if="!hasFiles">
      <image class="empty-image" src="/static/image/empty-files.png" mode="aspectFit"></image>
      <text class="empty-text">暂无团队文件</text>
      <view class="action-btn primary" @click="uploadFile">
        <text>上传文件</text>
      </view>
    </view>
    
    <view class="files-content" v-else>
      <!-- 文件夹导航 -->
      <view class="folder-navigation">
        <scroll-view scroll-x class="folder-path-scroll">
          <view class="folder-path">
            <view 
              class="folder-path-item" 
              v-for="(item, index) in currentPath" 
              :key="index"
              @click="navigateToFolder(index)"
            >
              <text>{{ item.name }}</text>
              <text class="path-separator" v-if="index < currentPath.length - 1">/</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 操作栏 -->
      <view class="operation-bar">
        <view class="operation-left">
          <view class="operation-btn" @click="createFolder">
            <text class="operation-text">新建文件夹</text>
          </view>
          <view class="operation-btn" @click="uploadFile">
            <text class="operation-text">上传文件</text>
          </view>
        </view>
        <view class="operation-right">
          <view class="sort-dropdown">
            <text class="sort-text">{{ currentSort.label }}</text>
            <text class="sort-arrow">▼</text>
          </view>
        </view>
      </view>
      
      <!-- 文件列表 -->
      <view class="file-list">
        <!-- 文件夹 -->
        <view 
          class="file-item folder" 
          v-for="folder in folders" 
          :key="'folder-' + folder.id"
          @click="openFolder(folder)"
        >
          <view class="file-icon folder-icon">
            <text class="icon-text">文件夹</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{ folder.name }}</text>
            <view class="file-meta">
              <text class="file-time">{{ formatTime(folder.updateTime) }}</text>
              <text class="file-owner">{{ folder.ownerName }}</text>
            </view>
          </view>
        </view>
        
        <!-- 文件 -->
        <view 
          class="file-item" 
          v-for="file in files" 
          :key="'file-' + file.id"
          @click="previewFile(file)"
        >
          <view class="file-icon" :class="getFileIconClass(file.type)">
            <text class="icon-text">{{ getFileTypeText(file.type) }}</text>
          </view>
          <view class="file-info">
            <text class="file-name">{{ file.name }}</text>
            <view class="file-meta">
              <text class="file-size">{{ formatFileSize(file.size) }}</text>
              <text class="file-time">{{ formatTime(file.updateTime) }}</text>
              <text class="file-owner">{{ file.ownerName }}</text>
            </view>
          </view>
          <view class="file-actions">
            <view class="file-action-btn" @click.stop="downloadFile(file)">
              <text class="action-icon">↓</text>
            </view>
            <view class="file-action-btn" @click.stop="showFileMenu(file)">
              <text class="action-icon">⋮</text>
            </view>
          </view>
        </view>
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

const emit = defineEmits(['upload']);

// 数据定义
const folders = ref([]);
const files = ref([]);
const currentPath = ref([
  { id: 'root', name: '团队文件' }
]);
const currentSort = ref({ value: 'time', label: '按时间排序' });
const sortOptions = [
  { value: 'time', label: '按时间排序' },
  { value: 'name', label: '按名称排序' },
  { value: 'size', label: '按大小排序' }
];

// 计算属性
const hasFiles = ref(false);

// 方法
function loadFiles() {
  // 模拟加载数据
  setTimeout(() => {
    folders.value = [
      {
        id: 'folder1',
        name: '项目文档',
        createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        updateTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        ownerId: '1002',
        ownerName: '张三'
      },
      {
        id: 'folder2',
        name: '设计资源',
        createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        updateTime: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        ownerId: '1003',
        ownerName: '李四'
      }
    ];
    
    files.value = [
      {
        id: 'file1',
        name: '用户登录模块需求说明.docx',
        type: 'doc',
        size: 2500000,
        createTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        updateTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        ownerId: '1002',
        ownerName: '张三'
      },
      {
        id: 'file2',
        name: '界面设计草图.psd',
        type: 'image',
        size: 5800000,
        createTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        updateTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        ownerId: '1003',
        ownerName: '李四'
      },
      {
        id: 'file3',
        name: 'API接口文档.pdf',
        type: 'pdf',
        size: 1200000,
        createTime: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        updateTime: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        ownerId: '1004',
        ownerName: '王五'
      }
    ];
    
    hasFiles.value = folders.value.length > 0 || files.value.length > 0;
  }, 500);
}

function navigateToFolder(index) {
  if (index >= currentPath.value.length - 1) return;
  currentPath.value = currentPath.value.slice(0, index + 1);
  // 加载对应路径的文件
  loadFiles();
}

function openFolder(folder) {
  currentPath.value.push({ id: folder.id, name: folder.name });
  // 加载对应文件夹的文件
  loadFiles();
}

function createFolder() {
  uni.showToast({
    title: '新建文件夹功能开发中',
    icon: 'none'
  });
}

function uploadFile() {
  emit('upload');
}

function previewFile(file) {
  if (file.type === 'pdf' || file.type === 'doc' || file.type === 'excel') {
    uni.showToast({
      title: '文件预览功能开发中',
      icon: 'none'
    });
  } else if (file.type === 'image') {
    uni.showToast({
      title: '图片预览功能开发中',
      icon: 'none'
    });
  }
}

function downloadFile(file) {
  uni.showToast({
    title: '文件下载中...',
    icon: 'none'
  });
}

function showFileMenu(file) {
  uni.showActionSheet({
    itemList: ['下载', '重命名', '分享', '删除'],
    success: function(res) {
      const index = res.tapIndex;
      if (index === 0) {
        downloadFile(file);
      } else if (index === 1) {
        renameFile(file);
      } else if (index === 2) {
        shareFile(file);
      } else if (index === 3) {
        deleteFile(file);
      }
    }
  });
}

function renameFile(file) {
  uni.showToast({
    title: '重命名功能开发中',
    icon: 'none'
  });
}

function shareFile(file) {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  });
}

function deleteFile(file) {
  uni.showModal({
    title: '删除文件',
    content: `确定要删除"${file.name}"吗？`,
    success: function(res) {
      if (res.confirm) {
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
      }
    }
  });
}

function getFileIconClass(type) {
  switch (type) {
    case 'doc':
      return 'doc-icon';
    case 'excel':
      return 'excel-icon';
    case 'pdf':
      return 'pdf-icon';
    case 'image':
      return 'image-icon';
    default:
      return 'file-icon';
  }
}

function getFileTypeText(type) {
  switch (type) {
    case 'doc':
      return '文档';
    case 'excel':
      return '表格';
    case 'pdf':
      return 'PDF';
    case 'image':
      return '图片';
    default:
      return '文件';
  }
}

function formatFileSize(size) {
  if (size < 1024) {
    return size + 'B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB';
  } else {
    return (size / (1024 * 1024)).toFixed(1) + 'MB';
  }
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
loadFiles();
</script>

<style>
.files-container {
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

.files-content {
  padding: 0 20rpx;
}

.folder-navigation {
  margin-bottom: 20rpx;
}

.folder-path-scroll {
  white-space: nowrap;
  width: 100%;
}

.folder-path {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 0;
}

.folder-path-item {
  display: inline-flex;
  align-items: center;
  font-size: 28rpx;
  color: #3498db;
}

.path-separator {
  margin: 0 10rpx;
  color: #999999;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.operation-left {
  display: flex;
}

.operation-btn {
  background-color: #f5f5f5;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.operation-text {
  font-size: 24rpx;
  color: #333333;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.sort-text {
  font-size: 24rpx;
  color: #333333;
  margin-right: 10rpx;
}

.sort-arrow {
  font-size: 20rpx;
  color: #999999;
}

.file-list {
  padding: 20rpx 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.file-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.folder-icon {
  background-color: #ffb74d;
}

.doc-icon {
  background-color: #42a5f5;
}

.excel-icon {
  background-color: #66bb6a;
}

.pdf-icon {
  background-color: #ef5350;
}

.image-icon {
  background-color: #ab47bc;
}

.icon-text {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: bold;
}

.file-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
}

.file-size, .file-time, .file-owner {
  font-size: 24rpx;
  color: #999999;
  margin-right: 20rpx;
}

.file-actions {
  display: flex;
  align-items: center;
}

.file-action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-icon {
  font-size: 28rpx;
  color: #666666;
}
</style> 