<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="header-title">编辑获奖经历</text>
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
      <!-- 获奖列表 -->
      <view class="awards-list">
        <view 
          v-for="(award, index) in awardsList" 
          :key="index" 
          class="award-item">
          <view class="award-content">
            <view class="award-header">
              <text class="award-name">{{ award.awardName }}</text>
              <text class="award-level">{{ award.level }}</text>
            </view>
            <view class="award-detail">
              <text class="award-org">{{ award.organization }}</text>
              <text class="award-time">{{ award.awardTime }}</text>
            </view>
          </view>
          <view class="award-actions">
            <view class="action-btn edit-btn" @click="editAward(index)">
              <text class="iconfont icon-edit"></text>
            </view>
            <view class="action-btn delete-btn" @click="deleteAward(index)">
              <text class="iconfont icon-trash"></text>
            </view>
          </view>
        </view>
        
        <!-- 没有获奖记录时显示 -->
        <view v-if="awardsList.length === 0" class="empty-state">
          <text>暂无获奖记录，点击下方添加按钮添加</text>
        </view>
      </view>
      
      <!-- 添加按钮 -->
      <view class="add-btn" @click="showAwardForm(null)">
        <text class="iconfont icon-plus"></text>
        <text class="add-text">添加获奖经历</text>
      </view>
    </scroll-view>
    
    <!-- 获奖经历编辑弹窗 -->
    <uni-popup ref="awardPopup" type="center">
      <view class="award-form">
        <view class="form-header">
          <text class="form-title">{{ isEditing ? '编辑获奖经历' : '添加获奖经历' }}</text>
          <text class="close-icon" @click="closeAwardForm">×</text>
        </view>
        
        <view class="form-body">
          <view class="form-item">
            <text class="form-label">奖项名称<text class="required">*</text></text>
            <input 
              class="form-input" 
              type="text" 
              v-model="editingAward.awardName" 
              placeholder="请输入奖项名称"
              maxlength="50" 
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">获奖级别<text class="required">*</text></text>
            <picker 
              class="form-picker" 
              :range="levelOptions" 
              :value="levelIndex" 
              @change="onLevelChange">
              <view class="picker-text">{{ editingAward.level || '请选择获奖级别' }}</view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">颁发机构<text class="required">*</text></text>
            <input 
              class="form-input" 
              type="text" 
              v-model="editingAward.organization" 
              placeholder="请输入颁发机构"
              maxlength="50" 
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">获奖时间<text class="required">*</text></text>
            <picker 
              class="form-picker" 
              mode="date"
              fields="month"
              :value="editingAward.awardTime"
              @change="onDateChange">
              <view class="picker-text">{{ editingAward.awardTime || '请选择获奖时间' }}</view>
            </picker>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="cancel-btn" @click="closeAwardForm">取消</button>
          <button class="confirm-btn" @click="confirmAwardEdit">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userApi from '@/api/modules/user';

// 用户信息状态
const userInfo = ref({
  awardsHistory: [],
  realName: '',
  schoolId: null,
  major: '',
  bio: '',
  skillTags: []
});

// 获奖记录列表
const awardsList = ref([]);

// 级别选项
const levelOptions = ['国家级', '省级', '市级', '校级', '院级', '其他'];
const levelIndex = ref(0);

// 编辑中的获奖记录
const editingAward = ref({
  awardName: '',
  level: '',
  organization: '',
  awardTime: ''
});

// 是否是编辑模式
const isEditing = ref(false);
const editingIndex = ref(-1);

// 加载状态
const loading = ref(true);

// 弹窗引用
const awardPopup = ref(null);

// 获取用户个人资料
async function getUserProfile() {
  try {
    loading.value = true;
    const res = await userApi.getUserProfile();
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      // 初始化获奖记录列表
      if (userInfo.value.awardsHistory && Array.isArray(userInfo.value.awardsHistory)) {
        awardsList.value = [...userInfo.value.awardsHistory];
      }
      console.log('获取到用户资料:', userInfo.value);
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

// 编辑获奖记录
function editAward(index) {
  if (index >= 0 && index < awardsList.value.length) {
    isEditing.value = true;
    editingIndex.value = index;
    editingAward.value = {...awardsList.value[index]};
    
    // 设置级别索引
    const level = editingAward.value.level;
    const idx = levelOptions.indexOf(level);
    levelIndex.value = idx >= 0 ? idx : 0;
    
    showPopup();
  }
}

// 删除获奖记录
function deleteAward(index) {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这条获奖记录吗？',
    success: function (res) {
      if (res.confirm) {
        awardsList.value.splice(index, 1);
        uni.showToast({
          title: '已删除',
          icon: 'success'
        });
      }
    }
  });
}

// 显示添加/编辑表单
function showAwardForm(index) {
  if (index === null) {
    // 添加模式
    isEditing.value = false;
    editingIndex.value = -1;
    editingAward.value = {
      awardName: '',
      level: levelOptions[0],
      organization: '',
      awardTime: ''
    };
    levelIndex.value = 0;
  }
  showPopup();
}

// 显示弹窗
function showPopup() {
  if (awardPopup.value) {
    awardPopup.value.open();
  }
}

// 关闭表单
function closeAwardForm() {
  if (awardPopup.value) {
    awardPopup.value.close();
  }
}

// 处理级别选择变化
function onLevelChange(e) {
  const index = e.detail.value;
  levelIndex.value = index;
  editingAward.value.level = levelOptions[index];
}

// 处理日期选择变化
function onDateChange(e) {
  editingAward.value.awardTime = e.detail.value;
}

// 确认提交编辑
function confirmAwardEdit() {
  // 验证表单
  if (!editingAward.value.awardName || editingAward.value.awardName.trim() === '') {
    uni.showToast({
      title: '请输入奖项名称',
      icon: 'none'
    });
    return;
  }
  
  if (!editingAward.value.level) {
    uni.showToast({
      title: '请选择获奖级别',
      icon: 'none'
    });
    return;
  }
  
  if (!editingAward.value.organization || editingAward.value.organization.trim() === '') {
    uni.showToast({
      title: '请输入颁发机构',
      icon: 'none'
    });
    return;
  }
  
  if (!editingAward.value.awardTime) {
    uni.showToast({
      title: '请选择获奖时间',
      icon: 'none'
    });
    return;
  }
  
  if (isEditing.value && editingIndex.value >= 0) {
    // 编辑现有记录
    awardsList.value[editingIndex.value] = {...editingAward.value};
  } else {
    // 添加新记录
    awardsList.value.push({...editingAward.value});
  }
  
  closeAwardForm();
  
  uni.showToast({
    title: isEditing.value ? '修改成功' : '添加成功',
    icon: 'success'
  });
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
      skillTags: userInfo.value.skillTags || [],
      awardsHistory: awardsList.value
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
$danger-color: #EF4444;
$input-bg: #F9FAFB;

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
  padding: 30rpx;
}

// 获奖列表
.awards-list {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  
  .award-item {
    display: flex;
    padding: 20rpx;
    border-bottom: 2rpx solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    .award-content {
      flex: 1;
      
      .award-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
        
        .award-name {
          font-size: 28rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .award-level {
          font-size: 24rpx;
          color: $primary-color;
          background-color: rgba($primary-color, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
      
      .award-detail {
        display: flex;
        justify-content: space-between;
        
        .award-org, .award-time {
          font-size: 24rpx;
          color: $text-secondary;
        }
      }
    }
    
    .award-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 20rpx;
      
      .action-btn {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10rpx;
        
        .iconfont {
          font-size: 32rpx;
        }
        
        &.edit-btn {
          background-color: rgba($primary-color, 0.1);
          
          .iconfont {
            color: $primary-color;
          }
        }
        
        &.delete-btn {
          background-color: rgba($danger-color, 0.1);
          
          .iconfont {
            color: $danger-color;
          }
        }
      }
    }
  }
  
  .empty-state {
    padding: 60rpx 0;
    text-align: center;
    
    text {
      font-size: 26rpx;
      color: $text-muted;
    }
  }
}

// 添加按钮
.add-btn {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .iconfont {
    font-size: 32rpx;
    color: $primary-color;
    margin-right: 12rpx;
  }
  
  .add-text {
    font-size: 28rpx;
    color: $primary-color;
  }
}

// 弹窗表单
.award-form {
  width: 650rpx;
  background-color: $card-color;
  border-radius: 16rpx;
  overflow: hidden;
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 2rpx solid $border-color;
    
    .form-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .close-icon {
      font-size: 40rpx;
      color: $text-muted;
      line-height: 1;
    }
  }
  
  .form-body {
    padding: 30rpx;
    
    .form-item {
      margin-bottom: 20rpx;
      
      .form-label {
        font-size: 26rpx;
        color: $text-secondary;
        margin-bottom: 10rpx;
        display: block;
        
        .required {
          color: $danger-color;
          margin-left: 4rpx;
        }
      }
      
      .form-input {
        width: 100%;
        height: 80rpx;
        background-color: $input-bg;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: $text-color;
      }
      
      .form-picker {
        width: 100%;
        height: 80rpx;
        background-color: $input-bg;
        border-radius: 12rpx;
        padding: 0 24rpx;
        display: flex;
        align-items: center;
        
        .picker-text {
          font-size: 28rpx;
          color: $text-color;
        }
      }
    }
  }
  
  .form-footer {
    display: flex;
    border-top: 2rpx solid $border-color;
    
    button {
      flex: 1;
      height: 90rpx;
      line-height: 90rpx;
      font-size: 28rpx;
      border-radius: 0;
      margin: 0;
      
      &.cancel-btn {
        background-color: $card-color;
        color: $text-secondary;
      }
      
      &.confirm-btn {
        background-color: $primary-color;
        color: white;
      }
    }
  }
}
</style> 