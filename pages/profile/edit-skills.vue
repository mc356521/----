<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">编辑技能标签</text>
      <view class="save-btn" @click="saveChanges">
        <text>保存</text>
      </view>
    </view>
    
    <!-- 加载中显示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-circle"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 编辑内容 -->
    <scroll-view scroll-y class="content-scroll" v-else>
      <!-- 已选标签区域 -->
      <view class="selected-section">
        <view class="section-title">已选择的标签</view>
        <view class="selected-tags">
          <view 
            v-for="(tag, index) in selectedTags" 
            :key="index" 
            class="tag selected-tag">
            <text>{{ tag }}</text>
            <text class="remove-icon" @click="removeTag(index)">×</text>
          </view>
          <view v-if="selectedTags.length === 0" class="empty-tips">
            <text>尚未选择任何标签，请从下方分类中选择</text>
          </view>
        </view>
      </view>
      
      <!-- 标签分类区域 -->
      <view class="categories-section">
        <view class="section-title">选择技能标签</view>
        <view class="categories-tab">
          <view 
            v-for="(category, cIndex) in Object.keys(skillCategories)" 
            :key="cIndex"
            class="category-tab"
            :class="{ active: currentCategory === category }"
            @click="changeCategory(category)">
            <text>{{ category }}</text>
          </view>
        </view>
        
        <!-- 当前分类的标签列表 -->
        <view class="tag-list">
          <view 
            v-for="(tag, tIndex) in skillCategories[currentCategory]" 
            :key="tIndex"
            class="tag"
            :class="{ active: isTagSelected(tag.tagName) }"
            @click="toggleTag(tag.tagName)">
            <text>{{ tag.tagName }}</text>
          </view>
        </view>
      </view>
      
      <!-- 提示信息 -->
      <view class="tips-section">
        <text class="tip-text">提示：精确的技能标签有助于AI更准确地为您推荐合适的团队</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import userApi from '@/api/modules/user';
import SvgIcon from '@/components/SvgIcon.vue';
// 用户信息状态
const userInfo = ref({
  skillTags: [],
  realName: '',
  schoolId: null,
  major: '',
  bio: '',
  awardsHistory: []
});

// 选中的标签
const selectedTags = ref([]);

// 标签分类数据
const skillCategories = ref({});
const currentCategory = ref('');

// 加载状态
const loading = ref(true);

// 获取用户个人资料
async function getUserProfile() {
  try {
    loading.value = true;
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      // 初始化已选标签
      if (userInfo.value.skillTags && Array.isArray(userInfo.value.skillTags)) {
        selectedTags.value = [...userInfo.value.skillTags];
      }
      console.log('获取到用户资料:', userInfo.value);
      await getSkillTags(); // 获取到用户信息后再获取技能标签列表
    } else {
      uni.showToast({
        title: res.message || '获取资料失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
    uni.showToast({
      title: '获取个人资料失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取技能标签列表
async function getSkillTags() {
  try {
    const res = await userApi.getSkillTags();
    if (res.code === 200 && res.data) {
      skillCategories.value = res.data;
      // 设置默认显示的分类
      const categories = Object.keys(res.data);
      if (categories.length > 0) {
        currentCategory.value = categories[0];
      }
      console.log('获取技能标签成功:', skillCategories.value);
    } else {
      console.error('获取技能标签失败:', res.message);
    }
  } catch (error) {
    console.error('获取技能标签失败:', error);
  }
}

// 切换分类
function changeCategory(category) {
  currentCategory.value = category;
}

// 检查标签是否已选择
function isTagSelected(tagName) {
  return selectedTags.value.includes(tagName);
}

// 切换选择/取消选择标签
function toggleTag(tagName) {
  const index = selectedTags.value.indexOf(tagName);
  if (index === -1) {
    // 检查最大选择数量
    if (selectedTags.value.length >= 10) {
      uni.showToast({
        title: '最多只能选择10个标签',
        icon: 'none'
      });
      return;
    }
    selectedTags.value.push(tagName);
  } else {
    removeTag(index);
  }
}

// 移除已选标签
function removeTag(index) {
  selectedTags.value.splice(index, 1);
}

// 保存修改
async function saveChanges() {
  try {
    uni.showLoading({
      title: '保存中...'
    });
    
    // 准备要提交的数据
    const updateData = {
      realName: userInfo.value.realName,
      schoolId: userInfo.value.schoolId,
      major: userInfo.value.major,
      bio: userInfo.value.bio,
      skillTags: selectedTags.value,
      awardsHistory: userInfo.value.awardsHistory || []
    };
    
    const res = await userApi.updateUserProfile(updateData);
    
    if (res.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        goBack();
      }, 1500);
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('保存用户资料失败:', error);
    uni.showToast({
      title: '保存失败，请稍后再试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 返回
function goBack() {
  uni.navigateBack();
}

// 页面加载时获取用户资料
onMounted(() => {
  getUserProfile();
});
</script>

<style lang="scss">
@import '../../static/iconfont.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #F3F4F6;
$tag-bg: #EFF6FF;
$tag-color: #3B82F6;
$tag-active-bg: #2563EB;
$tag-active-color: #ffffff;

page {
  background-color: $background-color;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 顶部导航栏
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: $card-color;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .back-btn {
    padding: 10rpx;
    
    .iconfont {
      font-size: 36rpx;
      color: $text-color;
    }
  }
  
  .header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .save-btn {
    padding: 10rpx 24rpx;
    background-color: $primary-color;
    border-radius: 30rpx;
    
    text {
      font-size: 26rpx;
      color: white;
    }
  }
}

// 加载中
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-circle {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 6rpx solid rgba($primary-color, 0.1);
    border-top-color: $primary-color;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 内容区域
.content-scroll {
  flex: 1;
}

// 公共标题样式
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 20rpx;
}

// 已选标签区域
.selected-section {
  background-color: $card-color;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  
  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    padding: 6rpx 0;
    
    .selected-tag {
      background-color: $tag-active-bg;
      color: $tag-active-color;
      display: flex;
      align-items: center;
      margin-right: 12rpx;
      margin-bottom: 12rpx;
      padding: 16rpx 10rpx;
      border-radius: 30rpx;
      font-size: 26rpx;
      box-shadow: 0 4rpx 6rpx rgba(37, 99, 235, 0.2);
      
      .remove-icon {
        margin-left: 12rpx;
        font-size: 28rpx;
        line-height: 1;
        width: 30rpx;
        height: 30rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
    
    .empty-tips {
      width: 100%;
      padding: 30rpx 0;
      text-align: center;
      
      text {
        font-size: 26rpx;
        color: $text-muted;
      }
    }
  }
}

// 标签分类区域
.categories-section {
  background-color: $card-color;
  margin: 0 30rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  
  .categories-tab {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    border-bottom: 2rpx solid $border-color;
    margin-bottom: 20rpx;
    
    .category-tab {
      padding: 16rpx 20rpx;
      font-size: 28rpx;
      color: $text-secondary;
      position: relative;
      
      &.active {
        color: $primary-color;
        font-weight: 600;
        
        &:after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 10rpx;
          right: 10rpx;
          height: 4rpx;
          background-color: $primary-color;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    padding: 10rpx 0;
    
    .tag {
      padding: 16rpx 30rpx;
      background-color: $tag-bg;
      color: $tag-color;
      font-size: 26rpx;
      border-radius: 30rpx;
      margin-right: 12rpx;
      margin-bottom: 12rpx;
      position: relative;
      transition: all 0.2s ease;
      
      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }
      
      &.active {
        background-color: $tag-active-bg;
        color: $tag-active-color;
        font-weight: 500;
        box-shadow: 0 4rpx 6rpx rgba(37, 99, 235, 0.2);
        
        &::before {
          content: "✓ ";
          font-weight: bold;
          margin-right: 2rpx;
        }
      }
    }
  }
}

// 提示区域
.tips-section {
  margin: 0 30rpx 40rpx;
  
  .tip-text {
    font-size: 24rpx;
    color: $text-muted;
    line-height: 1.5;
  }
}
</style> 