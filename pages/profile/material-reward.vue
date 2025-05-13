<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">实物奖励申请</text>
      <view class="right-placeholder"></view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-scroll">
      <view class="form-container">
        <!-- 基本信息卡片 -->
        <view class="form-section">
          <view class="section-title">基本信息</view>
          <view class="form-item">
            <text class="item-label">申请类型</text>
            <view class="type-selector">
              <view 
                class="type-option"
                :class="{ active: formData.rewardType === 'competition' }"
                @click="formData.rewardType = 'competition'"
              >
                <view class="type-radio">
                  <view class="radio-inner" v-if="formData.rewardType === 'competition'"></view>
                </view>
                <text>竞赛奖品</text>
              </view>
              
              <view 
                class="type-option"
                :class="{ active: formData.rewardType === 'activity' }"
                @click="formData.rewardType = 'activity'"
              >
                <view class="type-radio">
                  <view class="radio-inner" v-if="formData.rewardType === 'activity'"></view>
                </view>
                <text>活动奖励</text>
              </view>
              
              <view 
                class="type-option"
                :class="{ active: formData.rewardType === 'other' }"
                @click="formData.rewardType = 'other'"
              >
                <view class="type-radio">
                  <view class="radio-inner" v-if="formData.rewardType === 'other'"></view>
                </view>
                <text>其他奖励</text>
              </view>
            </view>
          </view>
          
          <!-- 申请人信息 -->
          <view class="form-item">
            <text class="item-label">申请人</text>
            <input type="text" class="form-input" v-model="formData.applicantName" placeholder="请输入申请人姓名" />
          </view>
          
          <view class="form-item">
            <text class="item-label">手机号码</text>
            <input type="number" class="form-input" v-model="formData.phoneNumber" placeholder="请输入联系电话" maxlength="11" />
          </view>
          
          <view class="form-item">
            <text class="item-label">收货地址</text>
            <textarea 
              class="form-textarea address-textarea" 
              v-model="formData.address" 
              placeholder="请输入详细收货地址"
              :maxlength="100"
            ></textarea>
          </view>
        </view>
        
        <!-- 奖品信息卡片 -->
        <view class="form-section">
          <view class="section-title">奖品信息</view>
          
          <!-- 竞赛选择 - 仅竞赛奖品时显示 -->
          <view class="form-item" v-if="formData.rewardType === 'competition'">
            <text class="item-label">相关竞赛</text>
            <view class="dropdown-selector" @click="showCompetitionPicker">
              <text class="selector-text">{{ selectedCompetitionName || '请选择相关竞赛' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
          
          <!-- 活动选择 - 仅活动奖励时显示 -->
          <view class="form-item" v-if="formData.rewardType === 'activity'">
            <text class="item-label">相关活动</text>
            <view class="dropdown-selector" @click="showActivityPicker">
              <text class="selector-text">{{ selectedActivityName || '请选择相关活动' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
          
          <view class="form-item">
            <text class="item-label">奖品名称</text>
            <input type="text" class="form-input" v-model="formData.rewardName" placeholder="请输入奖品名称" />
          </view>
          
          <view class="form-item">
            <text class="item-label">奖品数量</text>
            <view class="quantity-selector">
              <view class="quantity-btn" @click="decreaseQuantity">-</view>
              <input type="number" class="quantity-input" v-model="formData.quantity" />
              <view class="quantity-btn" @click="increaseQuantity">+</view>
            </view>
          </view>
        </view>
        
        <!-- 申请说明 -->
        <view class="form-section">
          <view class="section-title">申请说明</view>
          <view class="form-item">
            <textarea
              class="form-textarea"
              v-model="formData.description"
              placeholder="请详细描述申请理由，如：获奖情况、活动参与情况等"
              :maxlength="200"
            ></textarea>
            <text class="textarea-counter">{{ formData.description.length }}/200</text>
          </view>
        </view>
        
        <!-- 证明材料上传 -->
        <view class="form-section">
          <view class="section-title">证明材料</view>
          <view class="upload-area">
            <view 
              class="upload-item"
              v-for="(file, index) in uploadFiles"
              :key="index"
            >
              <image class="upload-preview" :src="file.path" mode="aspectFill"></image>
              <view class="upload-delete" @click="removeFile(index)">
                <SvgIcon name="close" size="16" color="#ffffff"></SvgIcon>
              </view>
            </view>
            
            <view class="upload-button" @click="chooseFile" v-if="uploadFiles.length < 3">
              <SvgIcon name="plus" size="24"></SvgIcon>
              <text>上传图片</text>
            </view>
          </view>
          <text class="upload-tips">请上传获奖证书、活动参与证明等相关材料，最多3张图片</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitApplication" :disabled="submitting">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
    
    <!-- 竞赛选择弹窗 -->
    <uni-popup ref="competitionPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择竞赛</text>
          <view class="popup-close" @click="closeCompetitionPicker">
            <SvgIcon name="close" size="18"></SvgIcon>
          </view>
        </view>
        <view class="popup-body">
          <view 
            class="popup-item"
            v-for="competition in competitions"
            :key="competition.id"
            @click="selectCompetition(competition)"
          >
            <text class="popup-item-text">{{ competition.name }}</text>
            <view class="popup-item-check" v-if="formData.competitionId === competition.id">
              <SvgIcon name="check" size="16" color="#3B82F6"></SvgIcon>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 活动选择弹窗 -->
    <uni-popup ref="activityPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择活动</text>
          <view class="popup-close" @click="closeActivityPicker">
            <SvgIcon name="close" size="18"></SvgIcon>
          </view>
        </view>
        <view class="popup-body">
          <view 
            class="popup-item"
            v-for="activity in activities"
            :key="activity.id"
            @click="selectActivity(activity)"
          >
            <text class="popup-item-text">{{ activity.name }}</text>
            <view class="popup-item-check" v-if="formData.activityId === activity.id">
              <SvgIcon name="check" size="16" color="#3B82F6"></SvgIcon>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue';

// 表单数据
const formData = reactive({
  rewardType: 'competition', // 申请类型: "competition"竞赛, "activity"活动, "other"其他
  applicantName: '',  // 申请人姓名
  phoneNumber: '',    // 联系电话
  address: '',        // 收货地址
  competitionId: null, // 竞赛ID
  activityId: null,    // 活动ID
  rewardName: '',      // 奖品名称
  quantity: 1,         // 数量
  description: ''      // 申请说明
});

// 上传的文件
const uploadFiles = ref([]);

// 提交状态
const submitting = ref(false);

// 竞赛列表
const competitions = ref([
  { id: 1, name: "全国大学生数学建模竞赛" },
  { id: 2, name: "挑战杯全国大学生创业大赛" },
  { id: 3, name: "全国大学生电子设计竞赛" },
  { id: 4, name: "互联网+" }
]);
const selectedCompetitionName = ref('');
const competitionPopup = ref(null);

// 活动列表
const activities = ref([
  { id: 1, name: "校园科技文化节" },
  { id: 2, name: "创新创业大赛" },
  { id: 3, name: "编程马拉松" },
  { id: 4, name: "学生会年度颁奖典礼" }
]);
const selectedActivityName = ref('');
const activityPopup = ref(null);

// 数量增减函数
function increaseQuantity() {
  if (formData.quantity < 99) {
    formData.quantity++;
  }
}

function decreaseQuantity() {
  if (formData.quantity > 1) {
    formData.quantity--;
  }
}

// 显示竞赛选择器
function showCompetitionPicker() {
  competitionPopup.value.open('bottom');
}

// 关闭竞赛选择器
function closeCompetitionPicker() {
  competitionPopup.value.close();
}

// 选择竞赛
function selectCompetition(competition) {
  formData.competitionId = competition.id;
  selectedCompetitionName.value = competition.name;
  closeCompetitionPicker();
}

// 显示活动选择器
function showActivityPicker() {
  activityPopup.value.open('bottom');
}

// 关闭活动选择器
function closeActivityPicker() {
  activityPopup.value.close();
}

// 选择活动
function selectActivity(activity) {
  formData.activityId = activity.id;
  selectedActivityName.value = activity.name;
  closeActivityPicker();
}

// 选择文件
function chooseFile() {
  uni.chooseImage({
    count: 3 - uploadFiles.value.length,
    sizeType: ['compressed'],
    success: (res) => {
      const tempFiles = res.tempFilePaths.map(path => ({
        path,
        size: 0
      }));
      
      uploadFiles.value = [...uploadFiles.value, ...tempFiles].slice(0, 3);
    }
  });
}

// 移除文件
function removeFile(index) {
  uploadFiles.value.splice(index, 1);
}

// 提交申请
async function submitApplication() {
  // 表单验证
  if (!formData.applicantName.trim()) {
    return uni.showToast({
      title: '请输入申请人姓名',
      icon: 'none'
    });
  }
  
  if (!formData.phoneNumber || !/^1\d{10}$/.test(formData.phoneNumber)) {
    return uni.showToast({
      title: '请输入有效的手机号码',
      icon: 'none'
    });
  }
  
  if (!formData.address.trim()) {
    return uni.showToast({
      title: '请输入收货地址',
      icon: 'none'
    });
  }
  
  if (formData.rewardType === 'competition' && !formData.competitionId) {
    return uni.showToast({
      title: '请选择相关竞赛',
      icon: 'none'
    });
  }
  
  if (formData.rewardType === 'activity' && !formData.activityId) {
    return uni.showToast({
      title: '请选择相关活动',
      icon: 'none'
    });
  }
  
  if (!formData.rewardName.trim()) {
    return uni.showToast({
      title: '请输入奖品名称',
      icon: 'none'
    });
  }
  
  if (!formData.description.trim()) {
    return uni.showToast({
      title: '请填写申请说明',
      icon: 'none'
    });
  }
  
  if (uploadFiles.value.length === 0) {
    return uni.showToast({
      title: '请上传证明材料',
      icon: 'none'
    });
  }
  
  submitting.value = true;
  
  try {
    // 这里应该调用实际的API上传文件和提交申请
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    uni.showToast({
      title: '申请提交成功',
      icon: 'success'
    });
    
    // 延迟后返回
    setTimeout(() => {
      goBack();
    }, 1500);
  } catch (error) {
    console.error('提交申请失败:', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 页面加载时获取数据
onMounted(() => {
  // 在实际项目中，这里应该获取用户信息、竞赛列表和活动列表
  console.log('实物奖励申请页面加载');
});
</script>

<style lang="scss">
// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #F3F4F6;

page {
  background-color: $background-color;
  padding-bottom: env(safe-area-inset-bottom);
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .right-placeholder {
    width: 36rpx;
  }
}

// 表单内容
.form-scroll {
  flex: 1;
  overflow: hidden;
}

.form-container {
  padding: 20rpx;
}

.form-section {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
  }
  
  .form-item {
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .item-label {
      display: block;
      font-size: 28rpx;
      color: $text-secondary;
      margin-bottom: 10rpx;
    }
  }
}

// 申请类型选择
.type-selector {
  display: flex;
  justify-content: space-between;
  
  .type-option {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
    }
    
    .type-radio {
      width: 32rpx;
      height: 32rpx;
      border-radius: 50%;
      border: 2rpx solid $text-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12rpx;
      
      .radio-inner {
        width: 18rpx;
        height: 18rpx;
        border-radius: 50%;
        background-color: $primary-color;
      }
    }
    
    text {
      font-size: 28rpx;
      color: $text-color;
    }
  }
}

// 输入框样式
.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  font-size: 28rpx;
  color: $text-color;
}

// 数量选择器
.quantity-selector {
  display: flex;
  align-items: center;
  width: 240rpx;
  
  .quantity-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    font-weight: bold;
    background-color: rgba($border-color, 0.7);
    border-radius: 8rpx;
    color: $text-secondary;
    
    &:active {
      background-color: rgba($primary-color, 0.1);
    }
  }
  
  .quantity-input {
    flex: 1;
    height: 64rpx;
    text-align: center;
    margin: 0 16rpx;
    background-color: rgba($border-color, 0.5);
    border-radius: 8rpx;
    font-size: 28rpx;
    color: $text-color;
  }
}

// 文本域
.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  font-size: 28rpx;
  color: $text-color;
  line-height: 1.5;
  
  &.address-textarea {
    height: 140rpx;
  }
}

.textarea-counter {
  text-align: right;
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
}

// 下拉选择器
.dropdown-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  
  .selector-text {
    font-size: 28rpx;
    color: $text-color;
    
    &:empty::before {
      content: '请选择';
      color: $text-muted;
    }
  }
}

// 上传区域
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 16rpx;
  
  .upload-item {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    overflow: hidden;
    position: relative;
    
    .upload-preview {
      width: 100%;
      height: 100%;
    }
    
    .upload-delete {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .upload-button {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 26rpx;
      color: $text-secondary;
      margin-top: 10rpx;
    }
  }
}

.upload-tips {
  font-size: 24rpx;
  color: $text-muted;
}

// 提交按钮
.submit-bar {
  padding: 30rpx 40rpx;
  background-color: $card-color;
  border-top: 2rpx solid $border-color;
  
  .submit-btn {
    width: 100%;
    height: 90rpx;
    background-color: $primary-color;
    color: white;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:disabled {
      background-color: rgba($primary-color, 0.5);
    }
  }
}

// 弹窗样式
.popup-content {
  background-color: $card-color;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid $border-color;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .popup-close {
      padding: 10rpx;
    }
  }
  
  .popup-body {
    max-height: 600rpx;
    overflow-y: auto;
    
    .popup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      .popup-item-text {
        font-size: 30rpx;
        color: $text-color;
      }
    }
  }
}
</style> 