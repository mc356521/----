<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <SvgIcon name="back" size="38" color="#666"></SvgIcon>
      </view>
      <view class="header-title">发布项目</view>
      <view class="header-right">
     
      </view>
    </view>

    <!-- 主内容区域 -->
    <scroll-view scroll-y class="main-content">
      <form class="project-form">
        <!-- 项目封面 -->
        <view class="form-card">
          <view class="form-title">项目封面</view>
          <view class="cover-upload" @click="uploadCover">
            <template v-if="!form.coverImage">
              <SvgIcon name="upload" size="60" color="#ccc"></SvgIcon>
              <view class="upload-tips">
                <text class="upload-main-tip">点击或拖拽上传项目封面</text>
                <text class="upload-sub-tip">建议尺寸: 1200 x 600px, 最大2MB</text>
              </view>
            </template>
            <image v-else :src="form.coverImage" mode="aspectFill" class="preview-image"></image>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="form-card">
          <view class="form-title">基本信息</view>
          
          <view class="form-item">
            <text class="form-label">项目名称</text>
            <uni-easyinput
              v-model="form.title"
              placeholder="请输入项目名称（20字以内）"
              maxlength="20"
            ></uni-easyinput>
          </view>
          
          <view class="form-item">
            <text class="form-label">项目简介</text>
            <uni-easyinput
              v-model="form.description"
              type="textarea"
              placeholder="请简要描述您的项目（200字以内）"
              maxlength="200"
              :autoHeight="true"
            ></uni-easyinput>
          </view>
          
          <view class="form-item">
            <text class="form-label">项目类型</text>
            <view class="type-options">
              <view 
                v-for="(type, index) in projectTypes" 
                :key="index"
                class="type-option"
                :class="{ 'type-active': form.categoryId === type.id }"
                @click="selectType(type.id)"
              >
                {{ type.name }}
              </view>
            </view>
          </view>
        </view>

        <!-- 项目标签 -->
        <view class="form-card">
          <view class="form-header">
            <view class="form-title">项目标签</view>
            <view class="add-tag-btn" @click="showAddTagModal">
              <SvgIcon name="plus" size="28" color="#2d8cf0"></SvgIcon>
              <text class="add-tag-text">添加标签</text>
            </view>
          </view>
          
          <view class="tags-container">
            <view 
              v-for="(tag, index) in form.tags" 
              :key="index"
              :class="['tag-pill', `tag-${tag.type}`]"
            >
              <text>{{ tag.text }}</text>
              <view class="tag-delete" @click="removeTag(index)">
                <SvgIcon name="close" size="24" color="currentColor"></SvgIcon>
              </view>
            </view>
          </view>
        </view>

        <!-- 项目时间 -->
        <view class="form-card">
          <view class="form-title">项目时间</view>
          
          <view class="date-grid">
            <view class="date-item">
              <text class="form-label">开始日期</text>
              <view class="date-input-container" @click="openDatePicker('start')">
                <SvgIcon name="calendar" size="28" color="#999" class="date-icon"></SvgIcon>
                <text class="date-text">{{ form.startDate || 'YYYY-MM-DD' }}</text>
              </view>
            </view>
            
            <view class="date-item">
              <text class="form-label">结束日期</text>
              <view class="date-input-container" @click="openDatePicker('end')">
                <SvgIcon name="calendar" size="28" color="#999" class="date-icon"></SvgIcon>
                <text class="date-text">{{ form.endDate || 'YYYY-MM-DD' }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">项目状态</text>
            <view class="status-options">
              <view 
                v-for="(status, index) in statusOptions" 
                :key="index"
                class="status-option"
              >
                <radio 
                  :value="status.value" 
                  :checked="form.status === status.value"
                  @click="form.status = status.value"
                  color="#2d8cf0"
                />
                <text class="status-text">{{ status.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 团队成员 -->
        <view class="form-card">
          <view class="form-header">
            <view class="form-title">团队成员</view>
            <view class="add-member-btn" @click="showAddMemberModal">
              <SvgIcon name="plus" size="28" color="#2d8cf0"></SvgIcon>
              <text class="add-member-text">添加成员</text>
            </view>
          </view>
          
          <view class="members-list">
            <view 
              v-for="(member, index) in form.teamMembers" 
              :key="index"
              class="member-card"
            >
              <view class="member-info">
                <image :src="member.avatar" class="member-avatar"></image>
                <view class="member-details">
                  <text class="member-name">{{ member.name }}</text>
                  <text class="member-role">{{ member.role }}</text>
                </view>
              </view>
              <view class="remove-member" @click="removeMember(index)">
                <SvgIcon name="close" size="32" color="#999"></SvgIcon>
              </view>
            </view>
          </view>
        </view>

        <!-- 项目详情 -->
        <view class="form-card">
          <view class="form-title">项目详情</view>
          
          <view class="form-item">
            <text class="form-label">项目背景</text>
            <uni-easyinput
              v-model="form.background"
              type="textarea"
              placeholder="请描述项目的背景和意义"
              :autoHeight="true"
            ></uni-easyinput>
          </view>
          
          <view class="form-item">
            <text class="form-label">项目特色</text>
            <uni-easyinput
              v-model="form.features"
              type="textarea"
              placeholder="请描述项目的创新点和特色"
              :autoHeight="true"
            ></uni-easyinput>
          </view>
          
          <view class="form-item">
            <text class="form-label">项目成果</text>
            <uni-easyinput
              v-model="form.achievements"
              type="textarea"
              placeholder="请描述项目已取得或预期的成果"
              :autoHeight="true"
            ></uni-easyinput>
          </view>
        </view>

        <!-- 项目图片 -->
        <view class="form-card">
          <view class="form-header">
            <view class="form-title">项目图片</view>
            <text class="image-limit">最多上传9张</text>
          </view>
          
          <view class="images-grid">
            <view 
              v-for="(img, index) in form.images" 
              :key="index"
              class="image-item"
            >
              <image :src="img" mode="aspectFill" class="project-image"></image>
              <view class="remove-image" @click="removeImage(index)">
                <SvgIcon name="close" size="24" color="#fff"></SvgIcon>
              </view>
            </view>
            
            <view 
              v-if="form.images.length < 9"
              class="add-image" 
              @click="uploadImage"
            >
              <SvgIcon name="plus" size="40" color="#ccc"></SvgIcon>
              <text class="add-image-text">添加图片</text>
            </view>
          </view>
        </view>
      </form>
    </scroll-view>

    <!-- 底部提交按钮 (移动端) -->
    <view class="mobile-submit">
      <button class="submit-btn" @click="submitProject">发布项目</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';

// 表单数据
const form = ref({
  title: '',
  description: '',
  categoryId: 1, // 默认选中第一个类型
  tags: [
    { text: '技术创新', type: 'blue' },
    { text: '移动应用', type: 'purple' },
    { text: '用户体验', type: 'green' }
  ],
  startDate: '',
  endDate: '',
  status: 'ongoing', // 默认为进行中
  coverImage: '',
  teamMembers: [
    { name: '张明', role: '项目负责人', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/3900eb55be7c4cb3b17c0b02d07a18bc.png' },
    { name: '李华', role: '技术开发', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/9ca105ebe429473faebca9c81b8e6f78.png' },
    { name: '王芳', role: 'UI设计', avatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/task_attachment/e71bf50a98ec42079b9746bbd982e405.png' }
  ],
  background: '',
  features: '',
  achievements: '',
  images: []
});

// 项目类型选项
const projectTypes = [
  { id: 1, name: '创新创业' },
  { id: 2, name: '科技竞赛' },
  { id: 3, name: '研究项目' },
  { id: 4, name: '设计作品' },
  { id: 5, name: '其他' }
];

// 状态选项
const statusOptions = [
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'planning', label: '规划中' }
];

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 选择项目类型
function selectType(id) {
  form.value.categoryId = id;
}

// 添加标签
function showAddTagModal() {
  uni.showModal({
    title: '添加标签',
    editable: true,
    placeholderText: '请输入标签名称',
    success: (res) => {
      if (res.confirm && res.content) {
        // 随机分配标签颜色类型
        const types = ['blue', 'purple', 'green', 'yellow', 'red'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        form.value.tags.push({
          text: res.content,
          type: randomType
        });
      }
    }
  });
}

// 移除标签
function removeTag(index) {
  form.value.tags.splice(index, 1);
}

// 打开日期选择器
function openDatePicker(type) {
  uni.showDatePicker({
    success: (res) => {
      if (type === 'start') {
        form.value.startDate = res.value;
      } else {
        form.value.endDate = res.value;
      }
    }
  });
}

// 添加团队成员
function showAddMemberModal() {
  uni.showModal({
    title: '添加团队成员',
    content: '请在弹出的表单中填写成员信息',
    success: (res) => {
      if (res.confirm) {
        // 在实际应用中，这里应该打开一个更完整的表单
        // 这里简化为直接添加一个示例成员
        const randomNames = ['赵云', '孙悦', '李明', '王强', '张艺', '刘洋'];
        const randomRoles = ['前端开发', '后端工程师', '产品经理', '设计师', '测试工程师', '运营'];
        const randomAvatars = [
          'https://beijing.aliyuncs.com/task_attachment/6d94aa83cfc8475d8bb0aa3d8dba9928.png', 
          'https://beijing.aliyuncs.com/task_attachment/9ca105ebe429473faebca9c81b8e6f78.png', 
          'https://beijing.aliyuncs.com/task_attachment/e71bf50a98ec42079b9746bbd982e405.png',
          'https://beijing.aliyuncs.com/task_attachment/fa539323f8304e5885a7a454ef468849.jpeg'
        ];
        
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        const randomRole = randomRoles[Math.floor(Math.random() * randomRoles.length)];
        const randomAvatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
        
        form.value.teamMembers.push({
          name: randomName,
          role: randomRole,
          avatar: randomAvatar
        });
      }
    }
  });
}

// 移除团队成员
function removeMember(index) {
  form.value.teamMembers.splice(index, 1);
}

// 上传项目封面
function uploadCover() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.coverImage = res.tempFilePaths[0];
    }
  });
}

// 上传项目图片
function uploadImage() {
  if (form.value.images.length >= 9) {
    uni.showToast({
      title: '最多上传9张图片',
      icon: 'none'
    });
    return;
  }
  
  uni.chooseImage({
    count: 9 - form.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images = form.value.images.concat(res.tempFilePaths);
    }
  });
}

// 移除项目图片
function removeImage(index) {
  form.value.images.splice(index, 1);
}

// 提交项目
function submitProject() {
  // 表单验证
  if (!form.value.title) {
    showToast('请输入项目名称');
    return;
  }
  
  if (!form.value.description) {
    showToast('请输入项目简介');
    return;
  }
  
  if (!form.value.coverImage) {
    showToast('请上传项目封面');
    return;
  }
  
  // 显示提交中
  uni.showLoading({
    title: '提交中...'
  });
  
  // 模拟提交
  setTimeout(() => {
    uni.hideLoading();
    
    uni.showModal({
      title: '发布成功',
      content: '项目已成功发布，等待审核',
      showCancel: false,
      success: () => {
        uni.navigateBack();
      }
    });
  }, 1500);
}

// 显示提示
function showToast(title) {
  uni.showToast({
    title,
    icon: 'none'
  });
}
</script>

<style lang="scss">
@import '@/config/theme.scss';

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* 顶部导航栏 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  z-index: 100;
  border-bottom: 1rpx solid #f0f0f0;
  /* 适配安全区域 */
  padding-top: env(safe-area-inset-top, 0);
  height: calc(90rpx + env(safe-area-inset-top, 0));
}

.header-left {
  padding: 10rpx;
}

.header-title {
  font-size: 34rpx;
  font-weight: 500;
}

.publish-btn {
  background-color: $primary-color;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 100rpx;
  border: none;
}

/* 主内容区域 */
.main-content {
  flex: 1;

  margin-top: calc(90rpx + env(safe-area-inset-top, 0));
  margin-bottom: 150rpx; /* 为底部按钮留出空间 */
}

.project-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: $box-shadow;
}

.form-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 24rpx;
  color: $text-color;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

/* 项目封面上传 */
.cover-upload {
  height: 300rpx;
  border: 2rpx dashed #dcdee2;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.upload-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20rpx;
}

.upload-main-tip {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.upload-sub-tip {
  font-size: 24rpx;
  color: $text-muted;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 项目类型 */
.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-option {
  padding: 12rpx 24rpx;
  border-radius: 100rpx;
  border: 1rpx solid #dcdee2;
  font-size: 28rpx;
  color: $text-secondary;
  background-color: #fff;
}

.type-active {
  background-color: $primary-color;
  color: #fff;
  border-color: $primary-color;
}

/* 项目标签 */
.add-tag-btn, .add-member-btn {
  display: flex;
  align-items: center;
  color: $primary-color;
}

.add-tag-text, .add-member-text {
  font-size: 28rpx;
  margin-left: 8rpx;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-pill {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  border-radius: 100rpx;
  font-size: 26rpx;
  
  &.tag-blue {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &.tag-purple {
    background-color: rgba(#9C27B0, 0.1);
    color: #9C27B0;
  }
  
  &.tag-green {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
  
  &.tag-yellow {
    background-color: rgba(#FFC107, 0.1);
    color: #FFC107;
  }
  
  &.tag-red {
    background-color: rgba($danger-color, 0.1);
    color: $danger-color;
  }
}

.tag-delete {
  margin-left: 10rpx;
}

/* 项目时间 */
.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.date-input-container {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #dcdee2;
  border-radius: 12rpx;
}

.date-icon {
  margin-right: 16rpx;
}

.date-text {
  font-size: 28rpx;
  color: $text-secondary;
}

.status-options {
  display: flex;
  gap: 30rpx;
}

.status-option {
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 28rpx;
  margin-left: 8rpx;
  color: $text-secondary;
}

/* 团队成员 */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 16rpx;
}

.member-info {
  display: flex;
  align-items: center;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.member-details {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 30rpx;
  font-weight: 500;
  color: $text-color;
}

.member-role {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 4rpx;
}

/* 项目图片 */
.image-limit {
  font-size: 24rpx;
  color: $text-muted;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
}

.remove-image {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image {
  aspect-ratio: 1;
  border: 2rpx dashed #dcdee2;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.add-image-text {
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
}

/* 底部提交按钮 */
.mobile-submit {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  /* 适配底部安全区域 */
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom, 0));
}

.submit-btn {
  background-color: $primary-color;
  color: #fff;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 12rpx;
  width: 100%;
  text-align: center;
  border: none;
}
</style> 