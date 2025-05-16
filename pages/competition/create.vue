<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
           <SvgIcon name="back" />
        </view>
        <text class="page-title">发布竞赛</text>
        <view class="draft-btn" @click="saveDraft">草稿箱</view>
      </view>
      
      <!-- 步骤指示器 -->
      <view class="steps-container">
        <view 
          v-for="(step, index) in steps" 
          :key="index" 
          class="step-item"
          :class="{'active': currentStep >= index, 'current': currentStep === index}"
          @click="goToStep(index)"
        >
          <view class="step-number">{{ index + 1 }}</view>
          <text class="step-text">{{ step }}</text>
        </view>
      </view>
    </view>

    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-content">
      <!-- 第一步：竞赛基本信息 -->
      <view v-if="currentStep === 0">
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
              placeholder="请输入竞赛名称（5-50字）" 
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
              :class="{ 'category-active': form.categoryIds.includes(item.id) }"
              @click="toggleCategory(item.id)"
            >
              <text class="category-icon" :class="item.icon"></text>
              <text>{{ item.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 竞赛级别 -->
          <view class="form-item">
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
      
      <view class="form-section">
        <text class="section-title">时间与团队</text>
        
          <!-- 报名时间 -->
        <view class="form-item">
          <view class="form-label">
              <text>报名时间</text>
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
      </view>
      
      <!-- 第二步：比赛阶段设置 -->
      <view v-if="currentStep === 1">
        <view class="form-section">
          <view class="section-header">
            <text class="section-title">比赛阶段设置</text>
            <view class="add-stage-btn" @click="addStage">
              <text class="add-icon">+</text>
              <text>添加阶段</text>
            </view>
          </view>
          
          <view class="stage-list">
            <view v-if="form.stages.length === 0" class="empty-stage">
              <image src="/static/image/empty-stage.png" mode="aspectFit" class="empty-image"></image>
              <text class="empty-text">暂无比赛阶段，请添加阶段</text>
              <view class="add-stage-btn center-btn" @click="addStage">
                <text class="add-icon">+</text>
                <text>添加阶段</text>
              </view>
            </view>
            
            <view 
              v-for="(stage, index) in form.stages" 
              :key="index"
              class="stage-card"
            >
              <view class="stage-header">
                <view class="stage-title-row">
                  <text class="stage-name">{{ stage.stageName || '未命名阶段' }}</text>
                  <view class="stage-status" :class="getStageStatusClass(calculateStageStatus(stage.startTime, stage.endTime))">
                    <text>{{ getStageStatusText(calculateStageStatus(stage.startTime, stage.endTime)) }}</text>
                  </view>
                </view>
                <view class="stage-actions">
                  <view class="stage-action-btn" @click="editStage(index)">
                    <text class="iconfont icon-edit"></text>
                    <text>编辑</text>
                  </view>
                  <view class="stage-action-btn delete" @click="removeStage(index)">
                    <text class="iconfont icon-delete"></text>
                    <text>删除</text>
                  </view>
                </view>
              </view>
              
              <view class="stage-content">
                <view class="stage-info-item">
                  <text class="stage-info-label">开始时间:</text>
                  <text class="stage-info-value">{{ formatDateTime(stage.startTime) }}</text>
                </view>
                <view class="stage-info-item">
                  <text class="stage-info-label">结束时间:</text>
                  <text class="stage-info-value">{{ formatDateTime(stage.endTime) }}</text>
                </view>
                <view class="stage-info-item">
                  <text class="stage-info-label">阶段描述:</text>
                  <text class="stage-info-value description">{{ stage.description || '暂无描述' }}</text>
                </view>
                <view class="stage-info-item" v-if="stage.metadata">
                  <text class="stage-info-label">地点:</text>
                  <text class="stage-info-value">{{ getStageLocation(stage) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 第三步：联系方式与附件 -->
      <view v-if="currentStep === 2">
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
                <SvgIcon name="lianxiren" />
                <input type="text" v-model="form.name" placeholder="联系人" />
              </view>
              <view class="contact-input">
                <SvgIcon name="qqtubiao" />
                <input type="text" v-model="form.contactQQ" placeholder="QQ群" />
              </view>
            </view>
            <view class="contact-input contact-email">
              <SvgIcon name="youxiang" />
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
            <view v-else class="upload-success">
              <text class="upload-icon iconfont icon-success"></text>
              <text class="upload-text">图片已上传</text>
              <text class="upload-filename">{{ form.coverFile?.name || '图片.jpg' }}</text>
              <text class="upload-tip">点击可重新选择</text>
            </view>
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
      </view>
      
      <!-- 第四步：预览 -->
      <view v-if="currentStep === 3">
        <view class="form-section">
          <text class="section-title">竞赛预览</text>
          
          <view class="preview-card">
            <view v-if="form.coverUrl" class="preview-cover-placeholder">
              <text class="iconfont icon-success"></text>
              <text>竞赛封面已上传</text>
            </view>
            <view class="preview-placeholder" v-else>
              <text class="iconfont icon-image"></text>
              <text>无封面图片</text>
            </view>
            
            <view class="preview-content">
              <text class="preview-title">{{ form.title || '未设置竞赛标题' }}</text>
              
              <view class="preview-badges">
                <view class="preview-badge level">{{ form.level || '未设置级别' }}</view>
                <view v-for="(categoryName, index) in getSelectedCategoryNames()" :key="index" class="preview-badge category">
                  {{ categoryName }}
                </view>
              </view>
              
              <view class="preview-info-item">
                <text class="preview-label">报名时间:</text>
                <text class="preview-value">
                  {{ form.registrationStart || '未设置' }} 至 {{ form.registrationEnd || '未设置' }}
                </text>
              </view>
              
              <view class="preview-info-item">
                <text class="preview-label">团队人数:</text>
                <text class="preview-value">{{ form.teamMin || '?' }} - {{ form.teamMax || '?' }} 人</text>
              </view>
              
              <view class="preview-desc">
                <text class="preview-desc-title">竞赛简介</text>
                <text class="preview-desc-content">{{ form.shortDescription || '未设置竞赛简介' }}</text>
              </view>
              
              <view class="preview-stages">
                <text class="preview-stages-title">比赛阶段</text>
                <view v-if="form.stages.length === 0" class="preview-empty-stages">
                  <text>未设置比赛阶段</text>
                </view>
                <view v-else class="preview-stage-timeline">
                  <view 
                    v-for="(stage, index) in form.stages" 
                    :key="index"
                    class="preview-stage-item"
                  >
                    <view class="timeline-dot" :class="getStageStatusClass(calculateStageStatus(stage.startTime, stage.endTime))"></view>
                    <view class="timeline-content">
                      <text class="timeline-title">{{ stage.stageName }}</text>
                      <view class="timeline-status-row">
                        <text class="timeline-time">{{ formatDateTime(stage.startTime) }} - {{ formatDateTime(stage.endTime) }}</text>
                        <view class="timeline-status" :class="getStageStatusClass(calculateStageStatus(stage.startTime, stage.endTime))">
                          <text>{{ getStageStatusText(calculateStageStatus(stage.startTime, stage.endTime)) }}</text>
                        </view>
                      </view>
                      <text class="timeline-desc">{{ stage.description }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 比赛阶段弹窗 -->
    <uni-popup ref="stagePopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <button class="btn cancel-btn" @click="cancelStage">取消</button>
          <text class="popup-title">{{ isEditingStage ? '编辑阶段' : '添加阶段' }}</text>
          <button class="btn confirm-btn" @click="confirmStage">保存</button>
        </view>
        
        <view class="form-content popup-form">
          <view class="form-item">
            <view class="form-label">
              <text>阶段名称</text>
              <text class="required">*</text>
            </view>
            <uni-easyinput
              type="text" 
              v-model="stageForm.stageName" 
              placeholder="如：初赛、复赛、决赛等" 
              :clearable="false">
            </uni-easyinput>
          </view>
          
          <view class="form-item">
            <view class="form-label">
              <text>开始时间</text>
              <text class="required">*</text>
            </view>
            <view class="time-grid">
              <view class="time-column">
                <text class="time-label">日期</text>
                <picker 
                  mode="date" 
                  :value="stageForm.startDate" 
                  @change="e => stageForm.startDate = e.detail.value"
                  class="date-picker"
                >
                  <view class="picker-view">
                    <text v-if="stageForm.startDate">{{ stageForm.startDate }}</text>
                    <text v-else class="placeholder-text">选择日期</text>
                  </view>
                </picker>
              </view>
              <view class="time-column">
                <text class="time-label">时间</text>
                <picker 
                  mode="time" 
                  :value="stageForm.startTime" 
                  @change="e => stageForm.startTime = e.detail.value"
                  class="date-picker"
                >
                  <view class="picker-view">
                    <text v-if="stageForm.startTime">{{ stageForm.startTime }}</text>
                    <text v-else class="placeholder-text">选择时间</text>
                  </view>
                </picker>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <view class="form-label">
              <text>结束时间</text>
              <text class="required">*</text>
            </view>
            <view class="time-grid">
              <view class="time-column">
                <text class="time-label">日期</text>
                <picker 
                  mode="date" 
                  :value="stageForm.endDate" 
                  @change="e => stageForm.endDate = e.detail.value"
                  class="date-picker"
                >
                  <view class="picker-view">
                    <text v-if="stageForm.endDate">{{ stageForm.endDate }}</text>
                    <text v-else class="placeholder-text">选择日期</text>
                  </view>
                </picker>
              </view>
              <view class="time-column">
                <text class="time-label">时间</text>
                <picker 
                  mode="time" 
                  :value="stageForm.endTime" 
                  @change="e => stageForm.endTime = e.detail.value"
                  class="date-picker"
                >
                  <view class="picker-view">
                    <text v-if="stageForm.endTime">{{ stageForm.endTime }}</text>
                    <text v-else class="placeholder-text">选择时间</text>
                  </view>
                </picker>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <view class="form-label">
              <text>阶段描述</text>
              <text class="required">*</text>
            </view>
            <textarea 
              v-model="stageForm.description" 
              placeholder="请简要描述该阶段的任务、要求等" 
              class="form-textarea"
              maxlength="500"
            />
          </view>
          
          <view class="form-item">
            <view class="form-label">
              <text>比赛地点</text>
            </view>
            <uni-easyinput
              type="text" 
              v-model="stageForm.location" 
              placeholder="如：线上、学校大礼堂等" 
              :clearable="false">
            </uni-easyinput>
          </view>
          
       
        </view>
      </view>
    </uni-popup>
    
    <!-- 底部操作按钮 -->
    <view class="action-bar" v-show="!isPopupOpen">
      <view class="action-grid">
        <button class="prev-button" @click="prevStep" v-if="currentStep > 0">上一步</button>
        <button class="draft-button" @click="saveDraft" v-if="currentStep === 3">保存草稿</button>
        <button class="next-button" @click="nextStep" v-if="currentStep < 3">下一步</button>
        <button class="publish-button" @click="publishCompetition" v-if="currentStep === 3">
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
import config from '@/config/env/dev';
import SvgIcon from '@/components/SvgIcon.vue';
import { handleImagePath } from '@/utils/pathHandler.js';

// 步骤指示器
const steps = ['基本信息', '比赛阶段', '联系附件', '预览发布'];
const currentStep = ref(0);

// 比赛阶段弹窗
const stagePopup = ref(null);
const isEditingStage = ref(false);
const editingStageIndex = ref(-1);
const isPopupOpen = ref(false);

// 表单数据
const form = reactive({
  title: '',
  categoryIds: [],
  level: '',
  shortDescription: '这是竞赛简介相关信息',
  description: '这是竞赛介绍相关信息',
  requirements: '这是参赛要求相关信息',
  registrationStart: '',
  registrationEnd: '',
  teamMin: '',
  teamMax: '',
  isHot: false,
  websiteUrl: 'https://www.jingsai.com',
  name: '某老师',
  contactQQ: '1234567890',
  contactEmail: '1234567890@qq.com',
  coverUrl: '',
  coverFile: null,
  attachments: [],
  stages: [] // 比赛阶段数据
});

// 阶段表单
const stageForm = reactive({
  stageName: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '18:00',
  description: '',
  location: ''
});

// 阶段状态选项
const stageStatusOptions = [
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'active' },
  { label: '已结束', value: 'completed' }
];

// 竞赛分类选项
const categoryOptions = ref([]);

// 竞赛级别选项
const levelOptions = ['国家级', '省级', '市级', '校级'];

// 初始化
onMounted(async () => {
  await checkAdminRole();
  await loadCategories();
  
  // 每分钟刷新阶段状态
  setInterval(() => {
    // 强制视图更新
    if (form.stages.length > 0) {
      form.stages = [...form.stages];
    }
  }, 60000);
});

// 步骤控制方法
function nextStep() {
  if (currentStep.value < steps.length - 1) {
    // 验证当前步骤的表单
    if (validateCurrentStep()) {
      currentStep.value++;
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function goToStep(index) {
  // 只能前往已完成的步骤或下一步
  if (index <= currentStep.value + 1 && index >= 0 && index < steps.length) {
    // 如果要前往下一步，需要验证当前步骤
    if (index > currentStep.value) {
      if (validateCurrentStep()) {
        currentStep.value = index;
      }
    } else {
      currentStep.value = index;
    }
  }
}

// 验证当前步骤表单
function validateCurrentStep() {
  switch (currentStep.value) {
    case 0: // 基本信息
      if (!form.title) {
        showError('请输入竞赛标题');
        return false;
      }
      if (form.categoryIds.length === 0) {
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
        showError('请选择报名时间');
        return false;
      }
      if (!form.teamMin || !form.teamMax) {
        showError('请填写团队人数');
        return false;
      }
      return true;
      
    case 1: // 比赛阶段
      if (form.stages.length === 0) {
        showError('请至少添加一个比赛阶段');
        return false;
      }
      return true;
      
    case 2: // 联系方式与附件
      if (!form.name || !form.contactEmail) {
        showError('请填写联系方式');
        return false;
      }
      if (!form.coverUrl) {
        showError('请上传竞赛封面');
        return false;
      }
      return true;
      
    default:
      return true;
  }
}

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

// 获取分类名称
function getCategoryName() {
  if (!form.categoryIds || form.categoryIds.length === 0) {
    return '未设置分类';
  }
  
  const selectedCategories = categoryOptions.value.filter(item => 
    form.categoryIds.includes(item.id)
  );
  
  if (selectedCategories.length === 0) {
    return '未设置分类';
  }
  
  return selectedCategories.map(cat => cat.label).join('、');
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
  uni.showModal({
    title: '提示',
    content: '离开后当前编辑的内容将不会保存，确定要离开吗？',
    success: (res) => {
      if (res.confirm) {
  uni.navigateBack();
      }
    }
  });
}

// 阶段相关方法
// 添加阶段
function addStage() {
  // 重置表单
  resetStageForm();
  isEditingStage.value = false;
  
  // 打开弹窗
  isPopupOpen.value = true;
  stagePopup.value.open();
}

// 编辑阶段
function editStage(index) {
  const stage = form.stages[index];
  
  // 解析开始时间和结束时间
  const startDateTime = new Date(stage.startTime);
  const endDateTime = new Date(stage.endTime);
  
  // 填充表单
  stageForm.stageName = stage.stageName;
  stageForm.startDate = formatDate(startDateTime);
  stageForm.startTime = formatTimeOnly(startDateTime);
  stageForm.endDate = formatDate(endDateTime);
  stageForm.endTime = formatTimeOnly(endDateTime);
  stageForm.description = stage.description;
  
  // 解析元数据
  if (stage.metadata) {
    try {
      const metadata = typeof stage.metadata === 'string' ? JSON.parse(stage.metadata) : stage.metadata;
      stageForm.location = metadata.location || '';
    } catch (e) {
      stageForm.location = '';
    }
  } else {
    stageForm.location = '';
  }
  
  isEditingStage.value = true;
  editingStageIndex.value = index;
  
  // 打开弹窗
  isPopupOpen.value = true;
  stagePopup.value.open();
}

// 删除阶段
function removeStage(index) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该阶段吗？',
    success: (res) => {
      if (res.confirm) {
        form.stages.splice(index, 1);
      }
    }
  });
}

// 取消添加/编辑阶段
function cancelStage() {
  stagePopup.value.close();
  setTimeout(() => {
    isPopupOpen.value = false;
  }, 300);
}

// 确认添加/编辑阶段
function confirmStage() {
  // 验证表单
  if (!validateStageForm()) {
    return;
  }
  
  // 构建阶段数据
  const startDateTime = combineDateTime(stageForm.startDate, stageForm.startTime);
  const endDateTime = combineDateTime(stageForm.endDate, stageForm.endTime);
  
  const stage = {
    stageName: stageForm.stageName,
    startTime: startDateTime,
    endTime: endDateTime,
    description: stageForm.description,
    // 自动计算最新状态
    status: calculateStageStatus(startDateTime, endDateTime),
    metadata: JSON.stringify({
      location: stageForm.location
    })
  };
  
  if (isEditingStage.value) {
    // 更新阶段
    form.stages[editingStageIndex.value] = stage;
  } else {
    // 添加阶段
    form.stages.push(stage);
  }
  
  // 关闭弹窗
  stagePopup.value.close();
  setTimeout(() => {
    isPopupOpen.value = false;
  }, 300);
  
  // 提示添加成功
  uni.showToast({
    title: isEditingStage.value ? '阶段已更新' : '阶段已添加',
    icon: 'success'
  });
}

// 验证阶段表单
function validateStageForm() {
  if (!stageForm.stageName) {
    showError('请输入阶段名称');
    return false;
  }
  
  if (!stageForm.startDate) {
    showError('请选择开始日期');
    return false;
  }
  
  if (!stageForm.startTime) {
    showError('请选择开始时间');
    return false;
  }
  
  if (!stageForm.endDate) {
    showError('请选择结束日期');
    return false;
  }
  
  if (!stageForm.endTime) {
    showError('请选择结束时间');
    return false;
  }
  
  // 检查结束时间是否晚于开始时间
  const startDateTime = new Date(combineDateTime(stageForm.startDate, stageForm.startTime));
  const endDateTime = new Date(combineDateTime(stageForm.endDate, stageForm.endTime));
  
  if (endDateTime <= startDateTime) {
    showError('结束时间必须晚于开始时间');
    return false;
  }
  
  if (!stageForm.description) {
    showError('请输入阶段描述');
    return false;
  }
  
  return true;
}

// 重置阶段表单
function resetStageForm() {
  stageForm.stageName = '初赛';
  stageForm.startDate = '';
  stageForm.startTime = '09:00';
  stageForm.endDate = '';
  stageForm.endTime = '18:00';
  stageForm.description = '这是初赛阶段描述';
  stageForm.location = '这是初赛阶段地点';
}

// 合并日期和时间
function combineDateTime(date, time) {
  return `${date}T${time}:00`;
}

// 格式化日期显示 (yyyy-MM-dd)
function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 只格式化时间部分 (HH:mm)
function formatTimeOnly(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// 格式化日期时间显示
function formatDateTime(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 获取阶段状态样式类
function getStageStatusClass(status) {
  const classes = {
    'pending': 'status-pending',
    'active': 'status-active',
    'completed': 'status-completed'
  };
  
  return classes[status] || 'status-pending';
}

// 获取阶段状态文本
function getStageStatusText(status) {
  const texts = {
    'pending': '待开始',
    'active': '进行中',
    'completed': '已结束'
  };
  
  return texts[status] || '待开始';
}

// 计算阶段状态
function calculateStageStatus(startTime, endTime) {
  const now = new Date();
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  if (now < startDate) {
    return 'pending'; // 未开始
  } else if (now > endDate) {
    return 'completed'; // 已结束
  } else {
    return 'active'; // 进行中
  }
}

// 获取阶段地点
function getStageLocation(stage) {
  if (!stage.metadata) return '未设置';
  
  try {
    const metadata = typeof stage.metadata === 'string' ? JSON.parse(stage.metadata) : stage.metadata;
    return metadata.location || '未设置';
  } catch (e) {
    return '未设置';
  }
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
  console.log('尝试选择图片');
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      console.log('选择图片成功', res);
      form.coverUrl = res.tempFilePaths[0];
      form.coverFile = res.tempFiles[0];
      
      // 显示成功提示
      uni.showToast({
        title: '图片上传成功',
        icon: 'success',
        duration: 1500
      });
    },
    fail: (err) => {
      console.log('选择图片失败, ', err);
      // 只有当错误不是用户取消时才显示错误提示
      if (err.errMsg !== 'chooseImage:fail cancel' && err.errMsg !== 'chooseImage:fail User cancelled') {
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
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
  
  if (form.categoryIds.length === 0) {
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
  
  if (form.stages.length === 0) {
    showError('请至少添加一个比赛阶段');
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
    categoryIds: form.categoryIds,
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
      name: form.name
    }
    // 注意：阶段会在创建成功后通过单独的接口创建
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
        url: `${config.baseUrl}/competitions/with-files`, 
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
      const competitionId = res.data.id;
      
      // 如果有比赛阶段，则创建比赛阶段
      if (form.stages && form.stages.length > 0) {
        try {
          // 格式化阶段数据，确保符合API要求
          const formattedStages = form.stages.map(stage => {
            // 确保metadata是字符串格式
            let metadata = stage.metadata;
            if (typeof metadata !== 'string') {
              metadata = JSON.stringify(metadata);
            }
            
            return {
              competitionId, // 会在API层再次添加
              stageName: stage.stageName,
              startTime: stage.startTime,
              endTime: stage.endTime,
              description: stage.description,
              // 自动计算最新状态
              status: calculateStageStatus(stage.startTime, stage.endTime),
              metadata
            };
          });
          
          console.log('格式化后的阶段数据:', formattedStages);
          
          // 创建比赛阶段
          await competitionsApi.createCompetitionStages(formattedStages, competitionId);
          
          console.log('比赛阶段创建成功');
        } catch (stageError) {
          console.error('比赛阶段创建失败:', stageError);
          uni.showToast({
            title: '竞赛已创建，但阶段创建失败',
            icon: 'none',
            duration: 3000
          });
          
          // 即使阶段创建失败，也认为整体创建成功
          setTimeout(() => {
            uni.navigateBack();
          }, 3000);
          
          return;
        }
      }
      
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

// 切换分类选择
function toggleCategory(id) {
  if (form.categoryIds.includes(id)) {
    form.categoryIds = form.categoryIds.filter(i => i !== id);
  } else {
    form.categoryIds.push(id);
  }
}

// 获取选中的分类名称列表
function getSelectedCategoryNames() {
  if (!form.categoryIds || form.categoryIds.length === 0) {
    return ['未设置分类'];
  }
  
  const selectedCategories = categoryOptions.value.filter(item => 
    form.categoryIds.includes(item.id)
  );
  
  if (selectedCategories.length === 0) {
    return ['未设置分类'];
  }
  
  return selectedCategories.map(cat => cat.label);
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
  --status-pending: #F59E0B;
  --status-active: #10B981;
  --status-completed: #6B7280;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  width: 80rpx;
  height: 80rpx;
}

.icon-btn {
  width: 60rpx;
  height: 60rpx;
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

/* 步骤指示器 */
.steps-container {
  display: flex;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f3f4f6;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16rpx;
  right: -50%;
  width: 100%;
  height: 4rpx;
  background-color: #e5e7eb;
  z-index: 1;
}

.step-item.active:not(:last-child)::after {
  background-color: var(--primary-blue);
}

.step-number {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  margin-bottom: 8rpx;
  position: relative;
  z-index: 2;
}

.step-item.active .step-number {
  background-color: var(--primary-blue);
  color: #ffffff;
}

.step-item.current .step-number {
  box-shadow: 0 0 0 6rpx rgba(74, 144, 226, 0.2);
}

.step-text {
  font-size: 24rpx;
  color: #6b7280;
}

.step-item.active .step-text {
  color: var(--primary-blue);
  font-weight: 500;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding-bottom: 250rpx;
  height: calc(150vh - 244rpx);
}

.form-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
  display: block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
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

/* 添加阶段按钮 */
.add-stage-btn {
  display: flex;
  align-items: center;
  background-color: var(--light-blue);
  color: var(--primary-blue);
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 500;
}

.center-btn {
  margin: 20rpx auto;
}

.add-icon {
  font-size: 28rpx;
  margin-right: 6rpx;
}

/* 空阶段提示 */
.empty-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
  margin-bottom: 30rpx;
}

/* 阶段卡片 */
.stage-card {
  background-color: #f9fafb;
  border-radius: 16rpx;
  border: 1rpx solid #e5e7eb;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.stage-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #e5e7eb;
  background-color: #f3f4f6;
}

.stage-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.stage-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #1f2937;
}

.stage-status {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: white;
  min-width: 120rpx;
  text-align: center;
}

.status-pending {
  background-color: var(--status-pending);
}

.status-active {
  background-color: var(--status-active);
}

.status-completed {
  background-color: var(--status-completed);
}

.stage-actions {
  display: flex;
  gap: 16rpx;
}

.stage-action-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: #ffffff;
  font-size: 24rpx;
  color: var(--primary-blue);
}

.stage-action-btn.delete {
  color: #ef4444;
}

.stage-action-btn text {
  margin-right: 4rpx;
}

.stage-content {
  padding:0 20rpx;
}

.stage-info-item {
  margin-bottom: 16rpx;
  display: flex;
}

.stage-info-label {
  min-width: 140rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.stage-info-value {
  flex: 1;
  font-size: 26rpx;
  color: #1f2937;
}

.stage-info-value.description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 预览卡片 */
.preview-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.preview-cover {
  width: 100%;
  height: 320rpx;
}

.preview-placeholder {
  width: 100%;
  height: 320rpx;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #9ca3af;
  font-size: 28rpx;
}

.preview-content {
  padding: 30rpx;
}

.preview-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16rpx;
}

.preview-badges {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.preview-badge {
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.preview-badge.level {
  background-color: var(--light-orange);
  color: var(--accent-orange);
}

.preview-badge.category {
  background-color: var(--light-green);
  color: var(--secondary-green);
}

.preview-info-item {
  margin-bottom: 16rpx;
  display: flex;
}

.preview-label {
  min-width: 160rpx;
  font-size: 28rpx;
  color: #6b7280;
}

.preview-value {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
}

.preview-desc {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f3f4f6;
}

.preview-desc-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16rpx;
  display: block;
}

.preview-desc-content {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 1.6;
}

.preview-stages {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f3f4f6;
}

.preview-stages-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 20rpx;
  display: block;
}

.preview-empty-stages {
  background-color: #f9fafb;
  padding: 30rpx;
  text-align: center;
  border-radius: 12rpx;
  color: #9ca3af;
  font-size: 28rpx;
}

.preview-stage-timeline {
  position: relative;
  padding-left: 30rpx;
}

.preview-stage-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background-color: #e5e7eb;
}

.preview-stage-item {
  position: relative;
  padding-bottom: 30rpx;
}

.timeline-dot {
  position: absolute;
  left: -38rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: var(--primary-blue);
  border: 4rpx solid #ffffff;
  z-index: 1;
}

.timeline-content {
  padding-left: 20rpx;
}

.timeline-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8rpx;
  display: block;
}

.timeline-time {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
  display: block;
}

.timeline-desc {
  font-size: 26rpx;
  color: #4b5563;
}

/* 预览阶段时间线 */
.timeline-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.timeline-status {
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: white;
}

.timeline-dot {
  position: absolute;
  left: -38rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: var(--primary-blue);
  border: 4rpx solid #ffffff;
  z-index: 1;
}

.timeline-dot.status-pending {
  background-color: var(--status-pending);
}

.timeline-dot.status-active {
  background-color: var(--status-active);
}

.timeline-dot.status-completed {
  background-color: var(--status-completed);
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

.upload-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.upload-success .upload-icon {
  font-size: 60rpx;
  color: #10B981;
  margin-bottom: 16rpx;
}

.upload-success .upload-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #10B981;
  margin-bottom: 8rpx;
}

.upload-filename {
  font-size: 28rpx;
  color: #4b5563;
  margin-bottom: 8rpx;
}

.preview-cover-placeholder {
  width: 100%;
  height: 320rpx;
  background-color: #EBF7F2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #10B981;
  font-size: 32rpx;
  font-weight: 500;
}

.preview-cover-placeholder .iconfont {
  font-size: 60rpx;
  margin-bottom: 16rpx;
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

/* 弹窗样式 */
.popup-content {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
}

.popup-form {
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

/* 底部按钮 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  padding:0 24rpx;
  z-index: 100;
  padding-bottom: calc(21rpx + env(safe-area-inset-bottom));
}

.action-grid {
  display: flex;
  gap: 24rpx;
}

.prev-button {
  flex: 1;
  background-color: #f3f4f6;
  color: #4b5563;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.next-button {
  flex: 1;
  background-color: var(--primary-blue);
  color: #ffffff;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
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

.btn {
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30rpx;
}

.cancel-btn {
  background-color: transparent;
  color: #6b7280;
  border: none;
  font-size: 28rpx;
}

.confirm-btn {
  background-color: transparent;
  color: var(--primary-blue);
  border: none;
  font-size: 28rpx;
  font-weight: 500;
}
</style> 