<template>
  <view class="container bg-gray-50">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="flex-row px-4 py-3">
        <view class="mr-3" @click="goBack">
          <text class="iconfont icon-arrow-left text-gray-600"></text>
        </view>
        <text class="text-xl font-bold text-gray-800">创建团队</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 选择竞赛 -->
      <view class="form-section">
        <text class="section-title">选择竞赛</text>
        <view class="competition-selector">
          <view class="selected-competition" @click="showCompetitionPicker">
            <text v-if="selectedCompetition" class="selected-text">{{ selectedCompetition.title }}</text>
            <text v-else class="placeholder-text">请选择竞赛</text>
            <text class="iconfont icon-arrow-right text-gray-400"></text>
          </view>
        </view>
      </view>

      <!-- 团队信息 -->
      <view class="form-section">
        <text class="section-title">团队信息</text>
        
        <view class="form-item">
          <text class="form-label">团队名称</text>
          <input
            class="form-input"
            type="text"
            v-model="teamName"
            placeholder="请输入团队名称"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">团队介绍</text>
          <textarea
            class="form-textarea"
            v-model="teamDescription"
            placeholder="请简要介绍团队情况和招募需求"
          />
        </view>
      </view>

      <!-- 职位设置 -->
      <view class="form-section">
        <view class="flex-row justify-between items-center">
          <text class="section-title">职位设置</text>
          <view class="add-btn" @click="addPosition">
            <text class="iconfont icon-plus text-blue-500"></text>
            <text class="text-blue-500 text-sm">添加职位</text>
          </view>
        </view>
        
        <view v-if="positions.length === 0" class="empty-tip">
          <text class="text-gray-500 text-sm">请添加招募职位</text>
        </view>
        
        <view v-for="(position, index) in positions" :key="index" class="position-item">
          <view class="position-header">
            <text class="text-gray-800 font-medium">职位 {{ index + 1 }}</text>
            <text class="iconfont icon-delete text-gray-500" @click="removePosition(index)"></text>
          </view>
          
          <view class="form-item">
            <text class="form-label">职位名称</text>
            <input
              class="form-input"
              type="text"
              v-model="position.name"
              placeholder="如:产品经理"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">招募人数</text>
            <input
              class="form-input"
              type="number"
              v-model="position.count"
              placeholder="1"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">要求描述</text>
            <textarea
              class="form-textarea"
              v-model="position.requirement"
              placeholder="描述该职位的技能要求、经验要求等"
            />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitTeam">创建团队</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 选中的竞赛
const selectedCompetition = ref(null);

// 团队基本信息
const teamName = ref('');
const teamDescription = ref('');

// 职位列表
const positions = ref([]);

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 显示竞赛选择器
function showCompetitionPicker() {
  // 这里应该弹出竞赛选择界面或组件
  uni.showToast({
    title: '竞赛选择功能开发中',
    icon: 'none'
  });
  
  // 模拟选择了一个竞赛
  selectedCompetition.value = {
    id: 1,
    title: '互联网+创新创业大赛'
  };
}

// 添加职位
function addPosition() {
  positions.value.push({
    name: '',
    count: 1,
    requirement: ''
  });
}

// 删除职位
function removePosition(index) {
  positions.value.splice(index, 1);
}

// 提交创建团队
function submitTeam() {
  // 表单验证
  if (!selectedCompetition.value) {
    return uni.showToast({
      title: '请选择竞赛',
      icon: 'none'
    });
  }
  
  if (!teamName.value) {
    return uni.showToast({
      title: '请输入团队名称',
      icon: 'none'
    });
  }
  
  if (positions.value.length === 0) {
    return uni.showToast({
      title: '请至少添加一个职位',
      icon: 'none'
    });
  }
  
  // 验证每个职位是否完整
  for (let i = 0; i < positions.value.length; i++) {
    const position = positions.value[i];
    if (!position.name) {
      return uni.showToast({
        title: `请填写职位${i+1}的名称`,
        icon: 'none'
      });
    }
  }
  
  // 提交数据
  uni.showLoading({
    title: '创建中...'
  });
  
  // 模拟创建成功
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
    
    // 返回到团队列表页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 2000);
}
</script>

<style>
@import '../../static/iconfont.css';

page {
  background-color: #f8fafc;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.px-4 {
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.py-3 {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}

.mr-3 {
  margin-right: 24rpx;
}

.text-xl {
  font-size: 36rpx;
}

.font-bold {
  font-weight: bold;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-800 {
  color: #1f2937;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-sm {
  font-size: 28rpx;
}

.font-medium {
  font-weight: 500;
}

/* 表单样式 */
.form-container {
  padding: 32rpx;
}

.form-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
  display: block;
}

.competition-selector {
  margin-bottom: 16rpx;
}

.selected-competition {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f9fafb;
  border-radius: 12rpx;
}

.selected-text {
  color: #1f2937;
  font-size: 28rpx;
}

.placeholder-text {
  color: #9ca3af;
  font-size: 28rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #4b5563;
  margin-bottom: 8rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #f9fafb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f9fafb;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #1f2937;
}

.add-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.empty-tip {
  padding: 48rpx 0;
  text-align: center;
}

.position-item {
  margin-top: 32rpx;
  padding: 24rpx;
  background-color: #f9fafb;
  border-radius: 12rpx;
}

.position-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

/* 底部提交按钮 */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  padding: 24rpx;
  z-index: 10;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 40rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
}
</style> 