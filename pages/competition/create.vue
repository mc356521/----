<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="page-title">发布竞赛</text>
        <view class="draft-btn" @click="saveDraft">草稿箱</view>
      </view>
    </view>

    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-content">
      <!-- 竞赛基本信息 -->
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <!-- 竞赛标题 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛标题</text>
            <text class="required">*</text>
          </view>
          <uni-easyinput
            type="text" 
            v-model="form.title" 
            placeholder="请输入竞赛名称（5-50字" 
            :clearable="false">
          </uni-easyinput>
        </view>
        
        <!-- 竞赛分类 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛分类</text>
            <text class="required">*</text>
          </view>
          <view class="category-grid">
            <view 
              v-for="(item, index) in categoryOptions" 
              :key="index"
              class="category-item"
              :class="{ 'category-active': form.categoryId === item.id }"
              @click="form.categoryId = item.id"
            >
              <text class="category-icon" :class="item.icon"></text>
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 竞赛级别 -->
        <view 	>
          <view class="form-label">
            <text>竞赛级别</text>
            <text class="required">*</text>
          </view>
          <scroll-view class="level-scroll" scroll-x>
            <view class="level-list">
              <view 
                v-for="(level, index) in levelOptions" 
                :key="index"
                class="level-item"
                :class="{ 'level-active': form.level === level }"
                @click="form.level = level"
              >
                <text>{{ level }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
      
      <!-- 竞赛详情 -->
      <view class="form-section">
        <text class="section-title">竞赛详情</text>
        
        <!-- 竞赛简介 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛简介</text>
            <text class="required">*</text>
          </view>
          <textarea 
            v-model="form.shortDescription" 
            placeholder="请填写竞赛简介（10-30个字）" 
            class="form-textarea"
            maxlength="140"
          />
        </view>
        
        <!-- 竞赛介绍 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛介绍</text>
            <text class="required">*</text>
          </view>
          <textarea 
            v-model="form.description" 
            placeholder="请详细描述竞赛背景、目的和意义（50-1000字）" 
            class="form-textarea"
            maxlength="2000"
          />
        </view>
        
        <!-- 参赛要求 -->
        <view class="form-item">
          <view class="form-label">
            <text>参赛要求</text>
            <text class="required">*</text>
          </view>
          <textarea 
            v-model="form.requirements" 
            placeholder="请说明参赛资格、人数限制等要求（20-500字）" 
            class="form-textarea form-textarea-medium"
            maxlength="1000"
          />
        </view>
      </view>
      
      <!-- 竞赛时间和团队信息 -->
      <view class="form-section">
        <text class="section-title">时间与团队</text>
        
        <!-- 竞赛时间 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛时间</text>
            <text class="required">*</text>
          </view>
          <view class="time-grid">
            <view class="time-column">
              <text class="time-label">报名开始时间</text>
              <picker 
                mode="date" 
                :value="form.registrationStart" 
                @change="e => form.registrationStart = e.detail.value"
                class="date-picker"
              >
                <view class="picker-view">
                  <text v-if="form.registrationStart">{{ form.registrationStart }}</text>
                  <text v-else class="placeholder-text">选择日期</text>
                </view>
              </picker>
            </view>
            <view class="time-column">
              <text class="time-label">报名截止时间</text>
              <picker 
                mode="date" 
                :value="form.registrationEnd" 
                @change="e => form.registrationEnd = e.detail.value"
                class="date-picker"
              >
                <view class="picker-view">
                  <text v-if="form.registrationEnd">{{ form.registrationEnd }}</text>
                  <text v-else class="placeholder-text">选择日期</text>
                </view>
              </picker>
            </view>
          </view>
        </view>
        
        <!-- 团队人数 -->
        <view class="form-item">
          <view class="form-label">
            <text>团队人数</text>
            <text class="required">*</text>
          </view>
          <view class="time-grid">
            <view class="time-column">
              <text class="time-label">最少人数</text>
              <uni-easyinput
                type="number" 
                v-model="form.teamMin" 
                placeholder="输入人数" 
                :clearable="false">
              </uni-easyinput> 
            </view>
            <view class="time-column">
              <text class="time-label">最多人数</text>
              <uni-easyinput
                type="number" 
                v-model="form.teamMax" 
                placeholder="输入人数" 
                :clearable="false">
              </uni-easyinput> 
            </view>
          </view>
        </view>
        
        <!-- 是否设为热门 -->
        <view class="hot-toggle">
          <view class="hot-info">
            <text class="hot-title">设为热门竞赛</text>
            <text class="hot-desc">热门竞赛将在首页和竞赛列表优先展示</text>
          </view>
          <switch 
            :checked="form.isHot" 
            @change="e => form.isHot = e.detail.value"
            color="#00aaff"/>
        </view>
      </view>
      
      <!-- 联系方式与附件 -->
      <view class="form-section">
        <text class="section-title">联系方式与附件</text>
        
        <!-- 官方网站 -->
        <view class="form-item">
          <view class="form-label">
            <text>官方网站（可选）</text>
          </view>
          <uni-easyinput 
            type="text" 
            v-model="form.websiteUrl" 
            placeholder="输入网站" 
            :clearable="false">
          </uni-easyinput>
        </view>
        
        <!-- 联系方式 -->
        <view class="form-item">
          <view class="form-label">
            <text>联系方式</text>
            <text class="required">*</text>
          </view>
          <view class="contact-grid">
            <view class="contact-row">
              <view class="contact-input">
                <text class="contact-icon iconfont icon-user"></text>
                <input type="text" v-model="form.name" placeholder="联系人" />
              </view>
              <view class="contact-input">
                <text class="contact-icon iconfont icon-qq"></text>
                <input type="text" v-model="form.contactQQ" placeholder="QQ群" />
              </view>
            </view>
            <view class="contact-input contact-email">
              <text class="contact-icon iconfont icon-email"></text>
              <input type="text" v-model="form.contactEmail" placeholder="联系邮箱" />
            </view>
          </view>
        </view>
        
        <!-- 上传封面 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛封面</text>
            <text class="required">*</text>
          </view>
          <view class="upload-box" @click="uploadCover">
            <view v-if="!form.coverUrl" class="upload-placeholder">
              <text class="upload-icon iconfont icon-image"></text>
              <text class="upload-text">点击上传或拖拽图片至此处</text>
              <text class="upload-tip">建议尺寸：800x400，文件大小不超过2MB</text>
            </view>
            <image v-else :src="form.coverUrl" mode="aspectFill" class="cover-image"></image>
          </view>
        </view>
        
        <!-- 上传附件 -->
        <view class="form-item">
          <view class="form-label">
            <text>竞赛附件（可选）</text>
          </view>
          <view class="upload-box" @click="uploadAttachment">
            <view v-if="form.attachments.length === 0" class="upload-placeholder">
              <text class="upload-icon iconfont icon-file"></text>
              <text class="upload-text">点击上传或拖拽文件至此处</text>
              <text class="upload-tip">支持PDF、Word、PPT等格式，单个文件不超过10MB</text>
            </view>
            <view v-else class="file-list">
              <view v-for="(file, index) in form.attachments" :key="index" class="file-item">
                <text class="file-icon iconfont icon-file"></text>
                <text class="file-name">{{ file.name }}</text>
                <text class="delete-icon iconfont icon-close" @click.stop="removeFile(index)"></text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="action-bar">
      <view class="action-grid">
        <button class="draft-button" @click="saveDraft">保存草稿</button>
        <button class="publish-button" @click="publishCompetition">
          <text class="iconfont icon-send"></text>
          <text>发布竞赛</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import competitionsApi from '@/api/modules/competitions';
import userApi from '@/api/modules/user';

// 表单数据
const form = reactive({
  title: '',
  categoryId: null,
  level: '',
  shortDescription: '',
  description: '',
  requirements: '',
  registrationStart: '',
  registrationEnd: '',
  teamMin: '',
  teamMax: '',
  isHot: false,
  websiteUrl: '',
  name: '',
  contactQQ: '',
  contactEmail: '',
  coverUrl: '',
  coverFile: null,
  attachments: []
});

// 竞赛分类选项
const categoryOptions = ref([]);

// 竞赛级别选项
const levelOptions = ['国家级', '省级', '市级', '校级'];

// 初始化
onMounted(async () => {
  await checkAdminRole();
  await loadCategories();
});

// 加载分类
async function loadCategories() {
  try {
    const res = await competitionsApi.getCompetitionCategories();
    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      categoryOptions.value = res.data.map(item => ({
        label: item.name,
        value: item.id,
        icon: getIconForCategory(item.name),
        id: item.id
      }));
    } else {
      console.error('获取分类失败:', res);
      setDefaultCategories();
    }
  } catch (error) {
    console.error('获取分类出错:', error);
    setDefaultCategories();
  }
}

// 根据分类名称获取图标类名
function getIconForCategory(name) {
  const iconMap = {
    '计算机类': 'iconfont icon-computer',
    '设计类': 'iconfont icon-palette',
    '创新创业': 'iconfont icon-lightbulb',
    '学科竞赛': 'iconfont icon-book',
    '科技竞赛': 'iconfont icon-chip',
    '文化艺术': 'iconfont icon-palette',
    '体育竞赛': 'iconfont icon-running'
  };
  
  return iconMap[name] || 'iconfont icon-more';
}

// 设置默认分类
function setDefaultCategories() {
  categoryOptions.value = [
    { label: '创新创业', value: 2, icon: 'iconfont icon-lightbulb', id: 2 },
    { label: '学科竞赛', value: 1, icon: 'iconfont icon-book', id: 1 },
    { label: '科技竞赛', value: 3, icon: 'iconfont icon-chip', id: 3 },
    { label: '文化艺术', value: 4, icon: 'iconfont icon-palette', id: 4 },
    { label: '体育竞赛', value: 5, icon: 'iconfont icon-running', id: 5 },
    { label: '其他', value: 6, icon: 'iconfont icon-more', id: 6 }
  ];
}

// 检查是否有管理员权限
async function checkAdminRole() {
  try {
    const token = uni.getStorageSync('token');
    if (!token) {
      redirectNoPermission();
      return;
    }
    
    const res = await userApi.getUserRole(token);
    if (res.code !== 200 || res.data !== 'admin') {
      redirectNoPermission();
    }
  } catch (error) {
    console.error('获取角色失败:', error);
    redirectNoPermission();
  }
}

// 无权限时重定向
function redirectNoPermission() {
  uni.showToast({
    title: '只有管理员才能发布竞赛',
    icon: 'none'
  });
  
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 保存为草稿
function saveDraft() {
  // 验证必填项
  if (!form.title) {
    return uni.showToast({
      title: '请输入竞赛标题',
      icon: 'none'
    });
  }
  
  // 保存草稿逻辑
  saveCompetition(0);
}

// 上传封面
function uploadCover() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 保存临时文件路径用于预览和后续上传
      form.coverUrl = res.tempFilePaths[0];
      form.coverFile = res.tempFiles[0]; // 保存文件对象用于后续上传
    }
  });
}

// 上传附件
function uploadAttachment() {
  // 在H5环境下使用uni.chooseFile，在APP环境下需要使用plus.io等原生API
  // 这里以APP为例
  // #ifdef APP-PLUS
  uni.chooseFile({
    count: 5,
    type: 'all',
    extension: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip'],
    success: (res) => {
      const files = res.tempFiles.map(file => ({
        name: file.name || '未命名文件',
        path: file.path,
        size: file.size,
        file: file // 保存文件对象
      }));
      
      form.attachments = [...form.attachments, ...files];
    }
  });
  // #endif
  
  // #ifdef H5
  // H5环境使用input type=file处理
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip';
  
  fileInput.onchange = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      name: file.name,
      size: file.size,
      file: file
    }));
    
    form.attachments = [...form.attachments, ...files];
  };
  
  fileInput.click();
  // #endif
}

// 删除文件
function removeFile(index) {
  form.attachments.splice(index, 1);
}

// 发布竞赛
function publishCompetition() {
  // 表单验证
  if (!validateForm()) return;
  
  // 发布竞赛
  saveCompetition(1);
}

// 验证表单
function validateForm() {
  if (!form.title) {
    showError('请输入竞赛标题');
    return false;
  }
  
  if (!form.categoryId) {
    showError('请选择竞赛分类');
    return false;
  }
  
  if (!form.level) {
    showError('请选择竞赛级别');
    return false;
  }
  
  if (!form.shortDescription) {
    showError('请填写竞赛简介');
    return false;
  }
  
  if (!form.description) {
    showError('请填写竞赛介绍');
    return false;
  }
  
  if (!form.requirements) {
    showError('请填写参赛要求');
    return false;
  }
  
  if (!form.registrationStart || !form.registrationEnd) {
    showError('请选择竞赛时间');
    return false;
  }
  
  if (!form.teamMin || !form.teamMax) {
    showError('请填写团队人数');
    return false;
  }
  
  if (!form.name || !form.contactEmail) {
    showError('请填写联系方式');
    return false;
  }
  
  if (!form.coverUrl) {
    showError('请上传竞赛封面');
    return false;
  }
  
  return true;
}

// 显示错误提示
function showError(message) {
  uni.showToast({
    title: message,
    icon: 'none'
  });
}

// 保存竞赛（草稿或发布）
async function saveCompetition(status) {
  // 准备竞赛数据
  const competitionData = {
    title: form.title,
    categoryId: form.categoryId,
    level: form.level,
    shortDescription: form.shortDescription,
    description: form.description,
    requirements: form.requirements,
    registrationStart: form.registrationStart + "T00:00:00",
    registrationDeadline: form.registrationEnd + "T23:59:59",
    teamSize: parseInt(form.teamMin) || 1,
    teamMax: parseInt(form.teamMax) || 5,
    status: status.toString(), // 0: 草稿, 1: 已发布
    organizer: "主办方名称", // 这里可以添加主办方输入字段
    websiteUrl: form.websiteUrl,
    contactInfo: {
      email: form.contactEmail,
      qq: form.contactQQ,
	  name:form.name
    }
  };
  
  uni.showLoading({
    title: status === 0 ? '保存中...' : '发布中...'
  });
  
  try {
    // 使用FormData上传文件和数据
    const formData = new FormData();
    
    // 添加竞赛数据
    formData.append('competitionData', JSON.stringify(competitionData));
    
    // 添加封面图片
    if (form.coverFile) {
      formData.append('coverImage', form.coverFile);
    }
    
    // 添加附件
    form.attachments.forEach((attachment, index) => {
      if (attachment.file) {
        formData.append('attachmentFiles', attachment.file);
      }
    });
    
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 发送请求
    const res = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: 'http://localhost:8080/competitions/with-files', 
        files: form.attachments.map(item => ({ 
          name: 'attachmentFiles',
          file: item.file 
        })),
        filePath: form.coverUrl,
        name: 'coverImage',
        formData: {
          'competitionData': JSON.stringify(competitionData)
        },
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (uploadRes) => {
          // uploadFile返回的是字符串，需要解析成JSON
          let result;
          try {
            result = JSON.parse(uploadRes.data);
          } catch (e) {
            result = { code: -1, message: '返回数据解析失败' };
          }
          resolve(result);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });

    // 处理响应
    if (res.code === 200) {
      uni.showToast({
        title: status === 0 ? '保存成功' : '发布成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('操作失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}
</script>

<style>
page {
  background-color: #f8fafc;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  --primary-blue: #4A90E2;
  --secondary-green: #7ED321;
  --accent-orange: #FF6B6B;
  --light-blue: #EBF3FC;
  --light-green: #F1FBEB;
  --light-orange: #FFF0F0;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部导航栏 */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
}

.back-btn {
  padding: 10rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
}

.draft-btn {
  color: var(--primary-blue);
  font-weight: 500;
  font-size: 28rpx;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding-bottom: 100rpx;
}

.form-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding:0rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
  display: block;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: flex;
  margin-bottom: 16rpx;
}

.form-label text {
  font-size: 28rpx;
  color: #4b5563;
  font-weight: 500;
}

.required {
  color: var(--accent-orange);
  margin-left: 6rpx;
}

.form-input {
  background-color: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-textarea {
  background-color: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  width: 100%;
  height: 240rpx;
  box-sizing: border-box;
}

.form-textarea-medium {
  height: 180rpx;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.category-item {
  background-color: #f3f4f6;
  padding: 24rpx 0;
  text-align: center;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
}

.category-active {
  background-color: var(--light-blue);
  color: var(--primary-blue);
  border: 1rpx solid var(--primary-blue);
}

.category-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

/* 级别选择 */
.level-scroll {
  white-space: nowrap;
}

.level-list {
  display: inline-flex;
  padding: 10rpx 0;
}

.level-item {
  background-color: #f3f4f6;
  padding: 16rpx 40rpx;
  margin-right: 16rpx;
  border-radius: 100rpx;
  font-size: 26rpx;
  color: #4b5563;
  display: inline-block;
}

.level-active {
  background-color: var(--light-blue);
  color: var(--primary-blue);
  border: 1rpx solid var(--primary-blue);
}

/* 时间和人数 */
.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.time-column {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.date-picker {
  width: 100%;
}

.picker-view {
  background-color: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
}

.placeholder-text {
  color: #9ca3af;
}

/* 热门切换 */
.hot-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0rpx;
  border-radius: 12rpx;
}

.hot-info {
  display: flex;
  flex-direction: column;
}

.hot-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 28rpx;
  margin-bottom: 6rpx;
}

.hot-desc {
  color: #6b7280;
  font-size: 24rpx;
}

/* 联系方式 */
.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.contact-input {
  display: flex;
  align-items: center;
  background-color: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.contact-icon {
  color: var(--primary-blue);
  margin-right: 16rpx;
  font-size: 36rpx;
}

.contact-input input {
  flex: 1;
  font-size: 28rpx;
}

.contact-email {
  width: 100%;
}

/* 上传框 */
.upload-box {
  border: 2rpx dashed #d1d5db;
  border-radius: 12rpx;
  padding: 40rpx;
  text-align: center;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #9ca3af;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #9ca3af;
}

.cover-image {
  width: 100%;
  height: 320rpx;
  border-radius: 8rpx;
}

/* 文件列表 */
.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.file-icon {
  font-size: 40rpx;
  color: #6b7280;
  margin-right: 16rpx;
}

.file-name {
  flex: 1;
  font-size: 28rpx;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-icon {
  font-size: 32rpx;
  color: #9ca3af;
  padding: 10rpx;
}

/* 底部按钮 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  padding: 24rpx;
  z-index: 100;
}

.action-grid {
  display: flex;
  gap: 24rpx;
}

.draft-button {
  flex: 1;
  background-color: #f3f4f6;
  color: #4b5563;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.publish-button {
  flex: 1;
  background-color: var(--primary-blue);
  color: #ffffff;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.publish-button text {
  margin: 0 6rpx;
}
</style> 