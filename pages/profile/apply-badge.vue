<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">勋章申请</text>
      <view class="right-placeholder"></view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-scroll">
      <view class="form-container">
        <!-- 申请类型选择 -->
        <view class="form-section">
          <view class="section-title">申请类型</view>
          <view class="type-selector">
            <view 
              class="type-option"
              :class="{ active: formData.applicantType === 'individual' }"
              @click="formData.applicantType = 'individual'"
            >
              <view class="type-radio">
                <view class="radio-inner" v-if="formData.applicantType === 'individual'"></view>
              </view>
              <text>个人申请</text>
            </view>
            
            <view 
              class="type-option"
              :class="{ active: formData.applicantType === 'team' }"
              @click="formData.applicantType = 'team'"
            >
              <view class="type-radio">
                <view class="radio-inner" v-if="formData.applicantType === 'team'"></view>
              </view>
              <text>团队申请</text>
            </view>
          </view>
        </view>
        
        <!-- 团队选择 - 仅团队申请时显示 -->
        <view class="form-section" v-if="formData.applicantType === 'team'">
          <view class="section-title">选择团队</view>
          <view class="form-item">
            <view class="dropdown-selector" @click="showTeamPicker">
              <text class="selector-text">{{ selectedTeamName || '请选择团队' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
        </view>
        
        <!-- 竞赛选择 -->
        <view class="form-section">
          <view class="section-title">竞赛信息</view>
          <view class="form-item">
            <view class="dropdown-selector" @click="showCompetitionPicker">
              <text class="selector-text">{{ selectedCompetitionName || '请选择竞赛' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
        </view>
        
        <!-- 奖项选择 -->
        <view class="form-section">
          <view class="section-title">获得奖项</view>
          <view class="award-selector">
            <view 
              v-for="award in awardOptions" 
              :key="award.value"
              class="award-option"
              :class="{ active: formData.awardLevel === award.value }"
              @click="formData.awardLevel = award.value"
            >
              {{ award.label }}
            </view>
          </view>
        </view>
        
        <!-- 勋章选择 -->
        <view class="form-section">
          <view class="section-title">勋章选择</view>
          <view class="badge-container">
            <view 
              v-for="badge in availableBadges"
              :key="badge.id"
              class="badge-item"
              :class="{ selected: formData.requestedBadge === badge.id }"
              @click="selectBadge(badge)"
            >
              <image class="badge-image" :src="badge.icon" mode="aspectFit"></image>
              <text class="badge-name">{{ badge.name }}</text>
              <view class="badge-check" v-if="formData.requestedBadge === badge.id">
                <SvgIcon name="check" size="16" color="#ffffff"></SvgIcon>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 申请说明 -->
        <view class="form-section">
          <view class="section-title">申请说明</view>
          <view class="form-item">
            <textarea
              class="form-textarea"
              v-model="formData.reviewMessage"
              placeholder="请详细描述申请理由，如：竞赛名称、获奖级别、团队贡献等"
              :maxlength="200"
            ></textarea>
            <text class="textarea-counter">{{ formData.reviewMessage.length }}/200</text>
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
          <text class="upload-tips">请上传获奖证书、比赛公示截图等证明材料，最多3张图片</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitApplication" :disabled="submitting">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
    
    <!-- 团队选择弹窗 -->
    <UniPopup ref="teamPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择团队</text>
          <view class="popup-close" @click="closeTeamPicker">
            <SvgIcon name="close" size="18"></SvgIcon>
          </view>
        </view>
        <view class="popup-body">
          <view 
            class="popup-item"
            v-for="team in myTeams"
            :key="team.id"
            @click="selectTeam(team)"
          >
            <text class="popup-item-text">{{ team.name }}</text>
            <view class="popup-item-check" v-if="formData.teamId === team.id">
              <SvgIcon name="check" size="16" color="#3B82F6"></SvgIcon>
            </view>
          </view>
        </view>
      </view>
    </UniPopup>
    
    <!-- 竞赛选择弹窗 -->
    <UniPopup ref="competitionPopup" type="bottom">
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
    </UniPopup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue';

// 表单数据
const formData = reactive({
  applicantType: 'individual', // 申请主体类型: "team" 或 "individual"
  teamId: null, // 当applicantType=team时必填
  competitionId: null, // 竞赛徽章申请时必填
  awardLevel: null, // 竞赛徽章申请时必填: "金奖"/"银奖"/"铜奖"/"优秀奖" 
  applicantId: null, // 当applicantType=individual时必填，个人申请可不填，自动使用当前用户ID
  requestedBadge: null, // 申请的徽章ID(必填)
  reviewMessage: "" // 申请说明
});

// 上传的文件
const uploadFiles = ref([]);

// 提交状态
const submitting = ref(false);

// 团队选择
const myTeams = ref([
  { id: 1, name: "创新先锋队" },
  { id: 2, name: "未来科技团队" },
  { id: 3, name: "算法精英组" }
]);
const selectedTeamName = ref('');
const teamPopup = ref(null);

// 竞赛选择
const competitions = ref([
  { id: 1, name: "全国大学生数学建模竞赛" },
  { id: 2, name: "挑战杯全国大学生创业大赛" },
  { id: 3, name: "全国大学生电子设计竞赛" },
  { id: 4, name: "互联网+" }
]);
const selectedCompetitionName = ref('');
const competitionPopup = ref(null);

// 奖项选项
const awardOptions = [
  { label: '金奖', value: '金奖' },
  { label: '银奖', value: '银奖' },
  { label: '铜奖', value: '铜奖' },
  { label: '优秀奖', value: '优秀奖' }
];

// 可选的勋章列表
const availableBadges = ref([
  { id: 1, name: "全国赛金奖", icon: "/static/image/Lianxi/mc/1-1.png" },
  { id: 2, name: "创新先锋", icon: "/static/image/Lianxi/mc/1-2.png" },
  { id: 3, name: "技术能手", icon: "/static/image/Lianxi/mc/1-3.png" },
  { id: 4, name: "优秀队员", icon: "/static/image/Lianxi/mc/1-4.png" }
]);

// 显示团队选择器
function showTeamPicker() {
  teamPopup.value.open('bottom');
}

// 关闭团队选择器
function closeTeamPicker() {
  teamPopup.value.close();
}

// 选择团队
function selectTeam(team) {
  formData.teamId = team.id;
  selectedTeamName.value = team.name;
  closeTeamPicker();
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

// 选择勋章
function selectBadge(badge) {
  formData.requestedBadge = badge.id;
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
  if (formData.applicantType === 'team' && !formData.teamId) {
    return uni.showToast({
      title: '请选择团队',
      icon: 'none'
    });
  }
  
  if (!formData.competitionId) {
    return uni.showToast({
      title: '请选择竞赛',
      icon: 'none'
    });
  }
  
  if (!formData.awardLevel) {
    return uni.showToast({
      title: '请选择获得奖项',
      icon: 'none'
    });
  }
  
  if (!formData.requestedBadge) {
    return uni.showToast({
      title: '请选择申请的勋章',
      icon: 'none'
    });
  }
  
  if (!formData.reviewMessage.trim()) {
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
  // 在实际项目中，这里应该获取用户团队列表、竞赛列表和可申请的勋章
  console.log('勋章申请页面加载');
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
$gold-color: #FFD700;
$silver-color: #C0C0C0;
$bronze-color: #CD7F32;

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
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 申请类型选择
.type-selector {
  display: flex;
  justify-content: space-around;
  
  .type-option {
    display: flex;
    align-items: center;
    padding: 20rpx 40rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
    }
    
    .type-radio {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      border: 2rpx solid $text-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
      
      .radio-inner {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        background-color: $primary-color;
      }
    }
    
    text {
      font-size: 30rpx;
      color: $text-color;
    }
  }
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
    font-size: 30rpx;
    color: $text-color;
    
    &:empty::before {
      content: '请选择';
      color: $text-muted;
    }
  }
}

// 奖项选择
.award-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .award-option {
    padding: 16rpx 30rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    font-size: 28rpx;
    color: $text-color;
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: 500;
    }
  }
}

// 勋章选择
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .badge-item {
    width: calc(33.33% - 14rpx);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    position: relative;
    
    &.selected {
      background-color: rgba($primary-color, 0.1);
    }
    
    .badge-image {
      width: 120rpx;
      height: 120rpx;
      margin-bottom: 12rpx;
    }
    
    .badge-name {
      font-size: 26rpx;
      color: $text-color;
      text-align: center;
    }
    
    .badge-check {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: $primary-color;
      display: flex;
      align-items: center;
      justify-content: center;
    }
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
}

.textarea-counter {
  text-align: right;
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
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