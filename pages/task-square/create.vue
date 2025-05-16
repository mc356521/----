<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="navbar">
        <view @click="goBack">
          <SvgIcon name="back" size="25" />
        </view>
        <view class="title">发布任务</view>
        <view class="right-btns">
          <view class="preview-btn" @click="previewTask">预览</view>
        </view>
      </view>
      
      <!-- 步骤指示器 -->
      <view class="steps-indicator">
        <view 
          v-for="(step, index) in steps" 
          :key="index"
          :class="['step-item', currentStep >= index ? 'step-active' : '']"
          @click="goToStep(index)"
        >
          <view class="step-circle">{{ index + 1 }}</view>
          <text class="step-text">{{ step.title }}</text>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-scroll">
      <uni-forms ref="taskForm" :modelValue="formData" :rules="rules" label-position="top" label-width="80px">
        <!-- 步骤1：基本信息 -->
        <view class="form-section" v-show="currentStep === 0">
          <view class="section-title">基本信息</view>
          
          <!-- 任务标题 -->
          <uni-forms-item name="title" label="任务标题">
            <uni-easyinput
              v-model="formData.title"
              placeholder="请输入任务标题（15字以内）"
              maxlength="15"
            />
          </uni-forms-item>
          
          <!-- 任务类别 -->
          <uni-forms-item name="categoryId" label="任务类别">
            <view class="category-tags">
              <view 
                v-for="item in categories" 
                :key="item.id"
                :class="['category-tag', formData.categoryId === item.id ? 'category-tag-active' : '']"
                @click="selectCategory(item.id)"
              >
                {{ item.name }}
              </view>
            </view>
          </uni-forms-item>
          
          <!-- 任务描述 -->
          <uni-forms-item name="description" label="任务描述">
            <uni-easyinput
              v-model="formData.description"
              type="textarea"
              placeholder="请详细描述任务内容、要求等信息"
              maxlength="500"
              :autoHeight="true"
              :inputBorder="true"
            />
            <text class="text-count">{{ formData.description.length }}/500</text>
          </uni-forms-item>
          
          <!-- 任务需求 -->
          <uni-forms-item name="requirements" label="任务需求">
            <uni-easyinput
              v-model="formData.requirements"
              type="textarea"
              placeholder="请详细描述任务需要的能力、条件等"
              maxlength="300"
              :autoHeight="true"
              :inputBorder="true"
            />
            <text class="text-count">{{ formData.requirements.length }}/300</text>
          </uni-forms-item>
        </view>
        
        <!-- 步骤2：任务设置 -->
        <view class="form-section" v-show="currentStep === 1">
          <view class="section-title">任务设置</view>
          
          <!-- 截止日期 -->
          <uni-forms-item name="deadline" label="截止日期">
            <uni-datetime-picker
              v-model="formData.deadline"
              type="datetime"
              :start="minDate"
              :end="maxDate"
              format="yyyy-MM-dd HH:mm"
              @change="onDateChange"
            />
          </uni-forms-item>
          
          <!-- 任务地点 -->
          <uni-forms-item name="location" label="任务地点">
            <uni-easyinput
              v-model="formData.location"
              placeholder="请输入任务地点"
            />
          </uni-forms-item>
          
          <!-- 最大参与人数 -->
          <uni-forms-item name="maxParticipants" label="参与人数" class="nowrap-label">
            <uni-number-box 
              v-model="formData.maxParticipants" 
              :min="1" 
              :max="100"
            />
          </uni-forms-item>
          
          <!-- 任务报酬 -->
          <uni-forms-item name="rewardTypeId" label="报酬类型">
            <view class="reward-types">
              <view 
                v-for="item in rewardTypes" 
                :key="item.id"
                :class="['reward-type-tag', formData.rewardTypeId === item.id ? 'reward-type-active' : '']"
                @click="selectRewardType(item.id)"
              >
                {{ item.name }}
              </view>
            </view>
          </uni-forms-item>
          
          <!-- 报酬金额 -->
          <uni-forms-item name="rewardAmount" label="报酬金额">
            <view class="money-input-container">
              <input 
                type="number" 
                v-model="formData.rewardAmount" 
                placeholder="请输入数量" 
                maxlength="10"
                class="money-field"
              />
              <text class="money-unit">{{ rewardTypes.find(item => item.id === formData.rewardTypeId)?.unit || '元' }}</text>
            </view>
          </uni-forms-item>
        </view>
        
        <!-- 步骤3：联系方式 -->
        <view class="form-section" v-show="currentStep === 2">
          <view class="section-title">联系方式</view>
          
          <uni-forms-item name="contactInfo.qq" label="联系QQ">
            <uni-easyinput
              v-model="formData.contactInfo.qq"
              placeholder="请输入联系QQ(选填)"
            />
          </uni-forms-item>
          
          <uni-forms-item name="contactInfo.wechat" label="联系微信">
            <uni-easyinput
              v-model="formData.contactInfo.wechat"
              placeholder="请输入微信号(选填)"
            />
          </uni-forms-item>
          
          <uni-forms-item name="contactInfo.email" label="联系邮箱">
            <uni-easyinput
              v-model="formData.contactInfo.email"
              placeholder="请输入电子邮箱(选填)"
            />
          </uni-forms-item>
        </view>
        
        <!-- 步骤4：确认提交 -->
        <view class="form-section review-section" v-show="currentStep === 3">
          <view class="section-title">确认信息</view>
          
          <view class="review-item">
            <text class="review-label">任务标题：</text>
            <text class="review-value">{{ formData.title }}</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">任务类别：</text>
            <text class="review-value">{{ getCategoryName(formData.categoryId) }}</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">截止日期：</text>
            <text class="review-value">{{ formatDate(formData.deadline) }}</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">任务地点：</text>
            <text class="review-value">{{ formData.location }}</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">最大参与人数：</text>
            <text class="review-value">{{ formData.maxParticipants }} 人</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">报酬类型：</text>
            <text class="review-value">{{ getRewardTypeName(formData.rewardTypeId) }}</text>
          </view>
          
          <view class="review-item">
            <text class="review-label">报酬金额：</text>
            <text class="review-value">{{ formData.rewardAmount }} {{ getRewardUnit(formData.rewardTypeId) }}</text>
          </view>
          
          <view class="review-info">
            <text>请确认以上信息无误，点击"提交"按钮发布任务</text>
          </view>
        </view>
      </uni-forms>
    </scroll-view>
    
    <!-- 底部导航按钮 -->
    <view class="step-actions">
      <button 
        class="prev-btn" 
        v-if="currentStep > 0" 
        @click="prevStep"
      >上一步</button>
      
      <button 
        class="next-btn" 
        v-if="currentStep < steps.length - 1" 
        @click="nextStep"
      >下一步</button>
      
      <button 
        class="submit-btn" 
        v-if="currentStep === steps.length - 1" 
        @click="submitForm"
      >提交</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { getTaskCategories, getRewardTypes, createTask } from '@/api/modules/tasks';
import SvgIcon from '@/components/SvgIcon.vue';
// 表单数据
const formData = reactive({
  title: '',
  description: '',
  categoryId: '',
  requirements: '',
  rewardTypeId: 1,
  rewardAmount: '',
  deadline: '',
  maxParticipants: 1,
  location: '',
  contactInfo: {
    qq: '',
    wechat: '',
    email: ''
  }
});

// 任务类别选项
const categories = ref([]);

// 任务报酬类型
const rewardTypes = ref([]);

// 分步骤设置
const steps = [
  { title: '基本信息', validate: ['title', 'categoryId', 'description', 'requirements'] },
  { title: '任务设置', validate: ['deadline', 'location', 'maxParticipants', 'rewardTypeId', 'rewardAmount'] },
  { title: '联系方式', validate: [] },
  { title: '确认提交', validate: [] }
];

// 当前步骤
const currentStep = ref(0);

// 获取任务分类和奖励类型
onMounted(async () => {
  try {
    // 获取任务分类
    const categoriesRes = await getTaskCategories();
    if (categoriesRes.code === 200) {
      categories.value = categoriesRes.data;
    } else {
      // 如果API请求失败，使用默认数据
      categories.value = [
        { id: 1, name: '问卷调查', iconUrl: '/icons/survey.png' },
        { id: 2, name: '数据收集', iconUrl: '/icons/data.png' },
        { id: 3, name: '实验参与', iconUrl: '/icons/experiment.png' },
        { id: 4, name: '校园活动', iconUrl: '/icons/activity.png' },
        { id: 5, name: '学术研究', iconUrl: '/icons/research.png' },
        { id: 6, name: '志愿服务', iconUrl: '/icons/volunteer.png' },
        { id: 7, name: '实习兼职', iconUrl: '/icons/internship.png' },
        { id: 8, name: '竞赛协助', iconUrl: '/icons/competition.png' },
        { id: 9, name: '技术支持', iconUrl: '/icons/tech.png' },
        { id: 10, name: '其他', iconUrl: '/icons/other.png' }
      ];
    }
    
    // 获取奖励类型
    const rewardTypesRes = await getRewardTypes();
    if (rewardTypesRes.code === 200) {
      rewardTypes.value = rewardTypesRes.data;
    } else {
      // 如果API请求失败，使用默认数据
      rewardTypes.value = [
        { id: 1, name: '现金', unit: '元' },
        { id: 2, name: '学分', unit: '分' },
        { id: 3, name: '志愿服务', unit: '小时' },
        { id: 4, name: '实习机会', unit: '天' },
        { id: 5, name: '礼品', unit: '件' },
        { id: 6, name: '证书', unit: '张' }
      ];
    }
  } catch (error) {
    console.error('获取数据失败', error);
    // 设置默认数据
    categories.value = [
      { id: 1, name: '问卷调查', iconUrl: '/icons/survey.png' },
      { id: 2, name: '数据收集', iconUrl: '/icons/data.png' },
      { id: 3, name: '实验参与', iconUrl: '/icons/experiment.png' },
      { id: 4, name: '校园活动', iconUrl: '/icons/activity.png' },
      { id: 5, name: '学术研究', iconUrl: '/icons/research.png' },
      { id: 6, name: '志愿服务', iconUrl: '/icons/volunteer.png' },
      { id: 7, name: '实习兼职', iconUrl: '/icons/internship.png' },
      { id: 8, name: '竞赛协助', iconUrl: '/icons/competition.png' },
      { id: 9, name: '技术支持', iconUrl: '/icons/tech.png' },
      { id: 10, name: '其他', iconUrl: '/icons/other.png' }
    ];
    rewardTypes.value = [
      { id: 1, name: '现金', unit: '元' },
      { id: 2, name: '学分', unit: '分' },
      { id: 3, name: '志愿服务', unit: '小时' },
      { id: 4, name: '实习机会', unit: '天' },
      { id: 5, name: '礼品', unit: '件' },
      { id: 6, name: '证书', unit: '张' }
    ];
    uni.showToast({
      title: '获取数据失败，使用默认配置',
      icon: 'none'
    });
  }
});

// 表单验证规则
const rules = {
  title: {
    rules: [
      { required: true, errorMessage: '请输入任务标题' }
    ]
  },
  categoryId: {
    rules: [
      { required: true, errorMessage: '请选择任务类别' }
    ]
  },
  description: {
    rules: [
      { required: true, errorMessage: '请输入任务描述' },
      { minLength: 20, errorMessage: '任务描述至少20个字符' }
    ]
  },
  requirements: {
    rules: [
      { required: true, errorMessage: '请输入任务需求' }
    ]
  },
  deadline: {
    rules: [
      { required: true, errorMessage: '请选择截止日期' }
    ]
  },
  location: {
    rules: [
      { required: true, errorMessage: '请输入任务地点' }
    ]
  },
  rewardAmount: {
    rules: [
      { required: true, errorMessage: '请输入报酬金额' }
    ]
  },
  maxParticipants: {
    rules: [
      { required: true, errorMessage: '请输入最大参与人数' }
    ]
  }
};

// 任务表单实例
const taskForm = ref(null);

// 日期限制
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const maxDate = computed(() => {
  const today = new Date();
  const maxDate = new Date(today.setFullYear(today.getFullYear() + 1));
  return maxDate.toISOString().split('T')[0];
});

// 选择任务类别
function selectCategory(categoryId) {
  formData.categoryId = categoryId;
}

// 选择报酬类型
function selectRewardType(typeId) {
  formData.rewardTypeId = typeId;
}

// 日期变更
function onDateChange(e) {
  formData.deadline = e;
}

// 获取分类名称
function getCategoryName(categoryId) {
  const category = categories.value.find(item => item.id === categoryId);
  return category ? category.name : '';
}

// 获取报酬类型名称
function getRewardTypeName(rewardTypeId) {
  const rewardType = rewardTypes.value.find(item => item.id === rewardTypeId);
  return rewardType ? rewardType.name : '';
}

// 获取报酬单位
function getRewardUnit(rewardTypeId) {
  const rewardType = rewardTypes.value.find(item => item.id === rewardTypeId);
  return rewardType ? rewardType.unit : '';
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return dateStr;
  }
}

// 下一步
async function nextStep() {
  const currentValidateFields = steps[currentStep.value].validate;
  
  if (currentValidateFields.length > 0) {
    try {
      // 验证当前步骤的字段
      await taskForm.value.validateField(currentValidateFields);
      
      // 验证通过，前进到下一步
      currentStep.value++;
    } catch (error) {
      // 验证失败，显示错误提示
      uni.showToast({
        title: '请完成必填项',
        icon: 'none'
      });
    }
  } else {
    // 当前步骤没有必填字段，直接前进
    currentStep.value++;
  }
}

// 上一步
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

// 跳转到指定步骤
function goToStep(step) {
  // 只允许跳转到已完成的步骤
  if (step < currentStep.value) {
    currentStep.value = step;
  }
}

// 预览任务
function previewTask() {
  taskForm.value.validate().then(res => {
    uni.showToast({
      title: '预览功能开发中',
      icon: 'none'
    });
  }).catch(err => {
    console.log('表单错误：', err);
  });
}

// 提交表单
async function submitForm() {
  try {
    await taskForm.value.validate();
    // 表单验证通过
    console.log('表单数据：', formData);
    
    // 发布任务逻辑
    uni.showLoading({
      title: '提交中...'
    });
    
    // 准备提交的数据
    const submitData = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      requirements: formData.requirements,
      rewardTypeId: formData.rewardTypeId,
      rewardAmount: Number(formData.rewardAmount),
      deadline: formatDateTime(formData.deadline),
      maxParticipants: Number(formData.maxParticipants),
      location: formData.location,
      contactInfo: formData.contactInfo,
    };
    
    console.log('提交数据：', JSON.stringify(submitData, null, 2));
    
    // 调用创建任务API
    const response = await createTask(submitData);
    
    uni.hideLoading();
    
    if (response.code === 200) {
      // 发布成功，显示确认弹窗
      uni.showModal({
        title: '发布成功',
        content: '任务已成功发布',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack();
          }
        }
      });
    } else {
      // 处理不同错误码
      let errorMessage = response.message || '发布失败';
      
      // 特殊处理日期错误
      if (response.message && response.message.includes('LocalDateTime')) {
        errorMessage = '日期格式错误，请重新选择截止日期';
      }
      
      uni.showModal({
        title: '提交失败',
        content: errorMessage,
        showCancel: false
      });
    }
  } catch (err) {
    uni.hideLoading();
    console.log('表单错误：', err);
    
    uni.showToast({
      title: '表单验证失败，请检查输入',
      icon: 'none'
    });
  }
}

// 格式化日期时间为LocalDateTime格式
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  
  // 如果只有日期部分，添加时间部分
  if (dateTimeStr.length <= 10) {
    return `${dateTimeStr}T23:59:59`;
  }
  
  // 如果是日期时间格式，转换为ISO标准格式
  const date = new Date(dateTimeStr);
  return date.toISOString().replace('.000Z', '');
}

// 返回上一页
function goBack() {
  uni.showModal({
    title: '提示',
    content: '是否放弃编辑？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
}
</script>

<style lang="scss">
/* 使用项目色彩系统 */
$primary-color: #4A90E2; // 活力蓝
$secondary-color: #7ED321; // 校园绿
$accent-color: #FF6B6B; // 竞赛橙
$bg-color: #f5f5f5;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;
$border-color: #eeeeee;

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

/* 顶部导航栏 */
.header {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 32rpx;
    
    .back-btn {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 48rpx;
        color: $text-primary;
      }
    }
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
    }
    
    .right-btns {
      .preview-btn {
        font-size: 28rpx;
        color: $primary-color;
      }
    }
  }
}

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  justify-content: space-between;
  padding: 32rpx;
  background-color: #fff;
  border-bottom: 2rpx solid $border-color;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    
    &:not(:first-child)::before {
      content: '';
      position: absolute;
      top: 28rpx;
      left: -50%;
      width: 100%;
      height: 4rpx;
      background-color: $border-color;
      z-index: 1;
    }
    
    &.step-active {
      .step-circle {
        background-color: $primary-color;
        color: #fff;
      }
      
      .step-text {
        color: $primary-color;
        font-weight: bold;
      }
      
      &:not(:first-child)::before {
        background-color: $primary-color;
      }
    }
    
    .step-circle {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background-color: $border-color;
      color: $text-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      z-index: 2;
    }
    
    .step-text {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }
}

/* 表单滚动区域 */
.form-scroll {
  flex: 1;
  padding-bottom: 140rpx; /* 为底部按钮留出空间 */
}

/* 表单分段 */
.form-section {
  background-color: #fff;
  margin-bottom: 24rpx;
  padding: 32rpx;
  margin-top: 24rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: 32rpx;
    position: relative;
    padding-left: 24rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8rpx;
      height: 32rpx;
      background-color: $primary-color;
      border-radius: 4rpx;
    }
  }
}

/* 类别标签 */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  
  .category-tag {
    padding: 16rpx 32rpx;
    border-radius: 60rpx;
    font-size: 28rpx;
    background-color: white;
    color: $text-secondary;
    transition: all 0.3s;
    border: 2rpx solid #eaeaea;
  }
  
  .category-tag-active {
    background-color: $primary-color;
    color: #ffffff;
    border: 2rpx solid $primary-color;
  }
}

/* 文本计数 */
.text-count {
  text-align: right;
  font-size: 24rpx;
  color: $text-light;
  margin-top: 8rpx;
}

/* 报酬类型 */
.reward-types {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 20rpx;
  margin-bottom: 24rpx;
  padding-bottom: 10rpx;
  
  .reward-type-tag {
    padding: 16rpx 32rpx;
    border-radius: 60rpx;
    font-size: 28rpx;
    background-color: white;
    color: $text-secondary;
    transition: all 0.3s;
    flex-shrink: 0;
    min-width: 120rpx;
    text-align: center;
    border: 2rpx solid #eaeaea;
  }
  
  .reward-type-active {
    background-color: $primary-color;
    color: #ffffff;
    border: 2rpx solid $primary-color;
  }
}

/* 使滚动条隐藏 */
.reward-types::-webkit-scrollbar {
  display: none;
}

/* 金额输入容器 */
.money-input-container {
  display: flex;
  align-items: center;
  border: 2rpx solid #eaeaea;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #fff;
  width: 100%;
  max-width: 720rpx;
}

.money-field {
  flex: 1;
  height: 80rpx;
  font-size: 32rpx;
  padding: 0 20rpx;
  border: none;
  box-sizing: border-box;
  min-width: 0;
}

.money-unit {
  padding: 0 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 32rpx;
  color: #666;
  background-color: #f9f9f9;
  border-left: 2rpx solid #eaeaea;
}

/* 移除旧的样式 */
.money-input {
  display: none;
}

/* 确认信息样式 */
.review-section {
  .review-item {
    padding: 28rpx 0;
    border-bottom: 2rpx solid $border-color;
    display: flex;
    
    .review-label {
      color: $text-secondary;
      width: 280rpx;
      flex-shrink: 0;
    }
    
    .review-value {
      color: $text-primary;
      font-weight: 500;
      flex: 1;
    }
  }
  
  .review-info {
    margin-top: 40rpx;
    padding: 24rpx;
    background-color: rgba($primary-color, 0.1);
    border-radius: 16rpx;
    
    text {
      font-size: 28rpx;
      color: $primary-color;
    }
  }
}

/* 底部导航按钮 */
.step-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 24rpx 32rpx;
  background-color: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .prev-btn {
    flex: 1;
    height: 88rpx;
    background-color: #f5f5f5;
    color: $text-secondary;
    font-size: 32rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
  }
  
  .next-btn {
    flex: 1;
    height: 88rpx;
    background-color: $primary-color;
    color: #fff;
    font-size: 32rpx;
    border-radius: 16rpx;
  }
  
  .submit-btn {
    flex: 1;
    height: 88rpx;
    background-color: $accent-color;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 16rpx;
  }
}

/* 修改表单标签样式，防止换行 */
.nowrap-label :deep(.uni-forms-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 