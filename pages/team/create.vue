<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="page-title">创建团队</text>
        <view class="help-btn">
          <text class="iconfont icon-help"></text>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-content">
      <!-- 基本信息部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-trophy section-icon"></text>
          <text class="section-title">基本信息</text>
        </view>
        
        <!-- 竞赛选择 -->
        <view class="form-item">
          <text class="form-label">关联竞赛<text class="required">*</text></text>
          <view class="select-box" @click="showCompetitionModal">
            <text v-if="form.competitionId" class="select-text">{{ selectedCompetitionName }}</text>
            <text v-else class="placeholder-text">请选择竞赛</text>
            <text class="iconfont icon-arrow-left select-arrow"></text>
      </view>
    </view>
        
        <!-- 竞赛选择弹窗 -->
        <uni-popup ref="competitionPopup" type="bottom">
          <view class="popup-container">
            <view class="popup-header">
              <text class="popup-title">选择竞赛</text>
              <text class="popup-close" @click="closeCompetitionModal">关闭</text>
            </view>
            
            <!-- 分类选择 -->
            <scroll-view scroll-x="true" class="category-scroll">
              <view class="category-list">
                <view 
                  v-for="category in competitionCategories" 
                  :key="category.id" 
                  class="category-tag"
                  :class="{ 'active-category': selectedCategoryId === category.id }"
                  @click="filterCompetitionsByCategory(category.id)"
                >
                  <text>{{ category.name }}</text>
                </view>
              </view>
            </scroll-view>
            
            <!-- 竞赛列表 -->
            <scroll-view scroll-y="true" class="competitions-list">
              <view 
                v-for="competition in filteredCompetitionList" 
                :key="competition.id"
                class="competition-item"
                :class="{ 'active-competition': form.competitionId === competition.id }"
                @click="selectCompetition(competition)"
              >
                <view class="competition-info">
                  <text class="competition-title">{{ competition.title }}</text>
                  <text class="competition-category" :class="getCategoryClass(competition.categoryId)">{{ competition.categoryName }}</text>
                </view>
                <text v-if="competition.isHot === 1" class="hot-tag">热门</text>
                <text class="iconfont icon-check" v-if="form.competitionId === competition.id"></text>
              </view>
              <view class="empty-tip" v-if="filteredCompetitionList.length === 0">
                <text>该分类下暂无竞赛</text>
              </view>
            </scroll-view>
            
            <view class="popup-footer">
              <button class="confirm-btn" @click="confirmCompetitionSelection">确定</button>
            </view>
          </view>
        </uni-popup>
    
        <!-- 团队名称 -->
        <view class="form-item">
          <text class="form-label">团队名称<text class="required">*</text></text>
          <input 
            type="text" 
            v-model="form.teamName" 
            placeholder="请输入团队名称" 
            class="form-input" 
          />
        </view>
        
        <!-- 研究方向 -->
        <view class="form-item">
          <text class="form-label">研究方向<text class="required">*</text></text>
          <input 
            type="text" 
            v-model="form.researchDirection" 
            placeholder="请输入研究方向" 
            class="form-input" 
          />
        </view>
        
        <!-- 团队描述 -->
        <view class="form-item">
          <text class="form-label">团队描述<text class="required">*</text></text>
          <textarea 
            v-model="form.description" 
            placeholder="请简要描述团队情况和目标" 
            class="form-textarea" 
          />
        </view>
      </view>
      
      <!-- 招募信息部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-calendar section-icon"></text>
          <text class="section-title">招募信息</text>
        </view>
        
        <!-- 招募截止日期 -->
        <view class="form-item">
          <text class="form-label">招募截止日期<text class="required">*</text></text>
          <view class="date-picker-box">
            <uni-datetime-picker 
              type="datetime" 
              v-model="form.recruitDeadline" 
              :clear-icon="false"
              return-type="timestamp"
            >
              <view class="picker-view">
                <text v-if="form.recruitDeadline" class="select-text">{{ formatDate(form.recruitDeadline) }}</text>
                <text v-else class="placeholder-text">请选择截止日期</text>
                <text class="iconfont icon-calendar picker-icon"></text>
              </view>
            </uni-datetime-picker>
          </view>
        </view>
      </view>
      
      <!-- 联系方式部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-phone section-icon"></text>
          <text class="section-title">联系方式</text>
        </view>
        
        <!-- 电子邮箱 -->
        <view class="form-item">
          <text class="form-label">电子邮箱<text class="required">*</text></text>
          <input 
            type="text" 
            v-model="form.email" 
            placeholder="请输入电子邮箱" 
            class="form-input" 
          />
        </view>
        
        <!-- 微信 -->
        <view class="form-item">
          <text class="form-label">微信</text>
          <input 
            type="text" 
            v-model="form.wechat" 
            placeholder="请输入微信号" 
            class="form-input" 
          />
        </view>
        
        <!-- QQ -->
        <view class="form-item">
          <text class="form-label">QQ</text>
          <input 
            type="text" 
            v-model="form.qq" 
            placeholder="请输入QQ号" 
            class="form-input" 
          />
        </view>
      </view>
      
      <!-- 指导老师部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-graduation section-icon"></text>
          <text class="section-title">指导老师</text>
        </view>
        
        <!-- 老师列表 -->
        <view v-if="form.teachers.length > 0">
          <view v-for="(teacher, index) in form.teachers" :key="index" class="teacher-item">
            <view class="item-header">
              <text class="item-title">指导老师 {{ index + 1 }}</text>
              <view class="delete-btn" @click="removeTeacher(index)">
                <text class="iconfont icon-trash"></text>
              </view>
            </view>
            
            <!-- 选择老师 -->
            <view class="form-item">
              <text class="form-label">选择老师<text class="required">*</text></text>
              <view class="select-box" @click="showTeacherModal(index)">
                <text v-if="teacher.name" class="select-text">{{ teacher.name }}</text>
                <text v-else class="placeholder-text">请选择老师</text>
                <text class="iconfont icon-arrow-left select-arrow"></text>
              </view>
            </view>
            
            <!-- 角色 -->
            <!-- <view class="form-item">
              <text class="form-label">角色<text class="required">*</text></text>
              <input 
                type="text" 
                v-model="teacher.role" 
                placeholder="如：主指导老师" 
                class="form-input" 
              />
            </view> -->
          </view>
        </view>
        
        <!-- 添加老师按钮 -->
        <view class="add-item-btn" @click="addTeacher">
          <text class="iconfont icon-plus"></text>
          <text>添加指导老师</text>
        </view>
      </view>
      
      <!-- 教师选择弹窗 -->
      <uni-popup ref="teacherPopup" type="bottom">
        <view class="popup-container">
          <view class="popup-header">
            <text class="popup-title">选择指导老师</text>
            <text class="popup-close" @click="closeTeacherModal">关闭</text>
          </view>
          
          <!-- 搜索框 -->
          <view class="search-box">
            <view class="search-input-wrapper">
              <text class="iconfont icon-search"></text>
              <input 
                type="text"
                v-model="teacherSearchKey"
                placeholder="搜索教师姓名"
                class="search-input"
                @input="searchTeachers"
              />
              <text class="iconfont icon-times-circle clear-btn" v-if="teacherSearchKey" @click="clearTeacherSearch"></text>
            </view>
          </view>
          
          <!-- 专业分类 -->
          <scroll-view scroll-x="true" class="category-scroll">
            <view class="category-list">
              <view 
                v-for="major in teacherMajors" 
                :key="major.id" 
                class="category-tag"
                :class="{ 'active-category': selectedMajorId === major.id }"
                @click="filterTeachersByMajor(major.id)"
              >
                <text>{{ major.name }}</text>
              </view>
            </view>
          </scroll-view>
          
          <!-- 教师列表 -->
          <scroll-view scroll-y="true" class="competitions-list">
            <view 
              v-for="teacher in filteredTeacherList" 
              :key="teacher.id"
              class="teacher-item-select"
              :class="{ 
                'active-teacher': currentTeacherIndex !== null && form.teachers[currentTeacherIndex].id === teacher.id,
                'disabled-teacher': isTeacherAlreadySelected(teacher.id)
              }"
              @click="selectTeacher(teacher)"
            >
              <view class="teacher-info">
                <image class="teacher-avatar" :src="teacher.avatarUrl" mode="aspectFill"></image>
                <view class="teacher-detail">
                  <text class="teacher-name">{{ teacher.name }}</text>
                  <text class="teacher-major">{{ teacher.major }}</text>
                </view>
              </view>
              <view class="teacher-status">
                <text class="selected-tag" v-if="isTeacherAlreadySelected(teacher.id)">已选择</text>
                <text class="iconfont icon-check" v-else-if="currentTeacherIndex !== null && form.teachers[currentTeacherIndex].id === teacher.id"></text>
              </view>
            </view>
            <view class="empty-tip" v-if="filteredTeacherList.length === 0">
              <text>{{teacherSearchKey ? '没有找到相关教师' : '该专业下暂无教师'}}</text>
            </view>
          </scroll-view>
          
          <view class="popup-footer">
            <button class="confirm-btn" @click="confirmTeacherSelection">确定</button>
          </view>
        </view>
      </uni-popup>
      
      <!-- 招募角色部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-team section-icon"></text>
          <text class="section-title">招募角色</text>
        </view>
        
        <!-- 角色列表 -->
        <view v-if="form.roles.length > 0">
          <view v-for="(role, index) in form.roles" :key="index" class="role-item">
            <view class="item-header">
              <text class="item-title">角色 {{ index + 1 }}</text>
              <view class="delete-btn" @click="removeRole(index)">
                <text class="iconfont icon-trash"></text>
              </view>
            </view>
            
            <!-- 角色名称 -->
            <view class="form-item">
              <text class="form-label">角色名称<text class="required">*</text></text>
              <input 
                type="text" 
                v-model="role.name" 
                placeholder="如：算法工程师" 
                class="form-input" 
              />
            </view>
            
            <!-- 招募人数 -->
            <view class="form-item">
              <text class="form-label">招募人数<text class="required">*</text></text>
              <input 
                type="number" 
                v-model="role.count" 
                placeholder="请输入招募人数" 
                class="form-input" 
              />
            </view>
            
            <!-- 角色描述 -->
            <view class="form-item">
              <text class="form-label">角色描述<text class="required">*</text></text>
              <textarea 
                v-model="role.description" 
                placeholder="请描述该角色的职责" 
                class="form-textarea" 
              />
            </view>
            
            <!-- 技能要求 -->
            <view class="form-item">
              <text class="form-label">技能要求</text>
              
              <!-- 已添加的技能标签 -->
              <view class="skill-tags">
      <view 
                  v-for="(skill, skillIndex) in role.skills" 
                  :key="skillIndex" 
                  class="skill-tag"
                >
                  <text>{{ skill }}</text>
                  <text class="iconfont icon-times-circle" @click.stop="removeSkill(index, skillIndex)"></text>
                </view>
              </view>
              
              <!-- 添加技能按钮 -->
              <view class="skill-select-btn" @click="showSkillModal(index)">
                <text class="iconfont icon-tag"></text>
                <text>选择技能标签</text>
                <text class="iconfont icon-arrow-right"></text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 添加角色按钮 -->
        <view class="add-item-btn" @click="addRole">
          <text class="iconfont icon-plus"></text>
          <text>添加招募角色</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitTeam">创建团队</button>
    </view>

    <!-- 技能标签选择弹窗 -->
    <uni-popup ref="skillPopup" type="bottom">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">选择技能标签</text>
          <text class="popup-close" @click="closeSkillModal">关闭</text>
        </view>
        
        <!-- 搜索框 -->
        <view class="search-box">
          <view class="search-input-wrapper">
            <text class="iconfont icon-search"></text>
            <input 
              type="text"
              v-model="skillSearchKey"
              placeholder="搜索技能标签"
              class="search-input"
              @input="searchSkills"
            />
            <text class="iconfont icon-times-circle clear-btn" v-if="skillSearchKey" @click="clearSkillSearch"></text>
          </view>
        </view>
        
        <!-- 技能分类 -->
        <scroll-view scroll-x="true" class="category-scroll">
          <view class="category-list">
            <view 
              v-for="category in skillCategories" 
              :key="category" 
              class="category-tag"
              :class="{ 'active-category': selectedSkillCategory === category }"
              @click="filterSkillsByCategory(category)"
            >
              <text>{{ category }}</text>
            </view>
          </view>
        </scroll-view>
        
        <!-- 技能列表 -->
        <scroll-view scroll-y="true" class="competitions-list">
          <view 
            v-for="skill in filteredSkillTags" 
            :key="skill.id"
            class="skill-item-select"
            :class="{ 
              'active-skill': isSkillSelected(skill.tagName),
              'disabled-skill': isSkillAlreadySelected(skill.tagName)
            }"
            @click="toggleSkillSelection(skill)"
          >
            <view class="skill-info">
              <text class="skill-name">{{ skill.tagName }}</text>
              <text class="skill-desc" v-if="skill.description">{{ skill.description }}</text>
            </view>
            <view class="skill-check">
              <text class="selection-indicator" :class="{'selected': isSkillSelected(skill.tagName)}">
                {{ isSkillSelected(skill.tagName) ? '已选' : '选择' }}
              </text>
            </view>
          </view>
          <view class="empty-tip" v-if="filteredSkillTags.length === 0">
            <text>{{skillSearchKey ? '没有找到相关技能' : '该分类下暂无技能标签'}}</text>
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <view class="selected-count">
            已选: <text class="count-highlight">{{ getSelectedSkillsCount() }}</text> 个技能
          </view>
          <button class="confirm-btn" @click="confirmSkillSelection">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import teamApi from '@/api/modules/team';
import competitionsApi from '@/api/modules/competitions';
import dev from '../../config/env/dev';
// 弹窗引用
const competitionPopup = ref(null);
const teacherPopup = ref(null);
const skillPopup = ref(null);
const baseUrl = dev.baseUrl;
// 表单数据
const form = reactive({
  competitionId: '',
  teamName: '',
  researchDirection: '',
  description: '',
  recruitDeadline: '',
  email: '',
  wechat: '',
  qq: '',
  teachers: [],
  roles: []
});

// 竞赛列表数据
const competitionList = ref([]);
const filteredCompetitionList = ref([]);
const competitionCategories = ref([]);
const selectedCategoryId = ref(0); // 0表示全部

// 教师列表数据
const teacherList = ref([]);
const filteredTeacherList = ref([]);
const teacherMajors = ref([]);
const selectedMajorId = ref(0); // 0表示全部
const currentTeacherIndex = ref(null);

// 技能标签数据
const skillTags = ref({});  // 按分类存储的技能标签
const skillCategories = ref([]); // 技能分类列表
const selectedSkillCategory = ref('全部'); // 当前选择的技能分类
const currentRoleIndex = ref(null); // 当前编辑的角色索引
const skillSearchKey = ref(''); // 技能搜索关键字
const filteredSkillTags = ref([]); // 过滤后的技能标签

// 技能输入框的值
const skillInputs = reactive({});

// 搜索关键字
const teacherSearchKey = ref('');

// 计算属性：获取选中竞赛的名称
const selectedCompetitionName = computed(() => {
  const competition = competitionList.value.find(item => item.id === form.competitionId);
  return competition ? competition.title : '';
});

// 获取竞赛基本信息列表
async function getCompetitionsBasicInfo() {
  try {
    uni.showLoading({
      title: '加载中...'
    });
    
    const res = await competitionsApi.getCompetitionsBasicInfo();
    
    if (res && res.code === 200 && res.data) {
      competitionList.value = res.data;
      filteredCompetitionList.value = [...res.data];
      
      // 提取不重复的分类
      const categories = new Map();
      categories.set(0, {id: 0, name: '全部分类'});
      
      res.data.forEach(item => {
        if (!categories.has(item.categoryId)) {
          categories.set(item.categoryId, {
            id: item.categoryId,
            name: item.categoryName
          });
        }
      });
      
      competitionCategories.value = Array.from(categories.values());
    } else {
      showToast('获取竞赛列表失败');
    }
  } catch (error) {
    console.error('获取竞赛列表失败:', error);
    showToast('获取竞赛列表失败');
  } finally {
    uni.hideLoading();
  }
}

// 获取教师列表
async function getTeachersList() {
  try {
    uni.showLoading({
      title: '加载中...'
    });
    
    // 假设有一个API模块用于教师相关请求
    const res = await uni.request({
      url: `${baseUrl}/api/teachers/list`,
      method: 'GET'
    });
    
    if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
      teacherList.value = res.data.data;
      filteredTeacherList.value = [...res.data.data];
      
      // 提取不重复的专业
      const majors = new Map();
      majors.set(0, {id: 0, name: '全部专业'});
      
      res.data.data.forEach(item => {
        if (item.major && !majors.has(item.major)) {
          majors.set(item.major, {
            id: item.major,
            name: item.major
          });
        }
      });
      
      teacherMajors.value = Array.from(majors.values());
    } else {
      showToast('获取教师列表失败');
    }
  } catch (error) {
    console.error('获取教师列表失败:', error);
    showToast('获取教师列表失败');
  } finally {
    uni.hideLoading();
  }
}

// 根据分类筛选竞赛
function filterCompetitionsByCategory(categoryId) {
  selectedCategoryId.value = categoryId;
  
  if (categoryId === 0) {
    // 显示全部
    filteredCompetitionList.value = [...competitionList.value];
  } else {
    // 按分类筛选
    filteredCompetitionList.value = competitionList.value.filter(item => item.categoryId === categoryId);
  }
}

// 根据专业筛选教师
function filterTeachersByMajor(majorId) {
  selectedMajorId.value = majorId;
  teacherSearchKey.value = ''; // 清空搜索关键字
  
  if (majorId === 0) {
    // 显示全部
    filteredTeacherList.value = [...teacherList.value];
  } else {
    // 按专业筛选
    filteredTeacherList.value = teacherList.value.filter(item => item.major === majorId);
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 显示竞赛选择器
function showCompetitionModal() {
  competitionPopup.value.open();
}

// 关闭竞赛选择器
function closeCompetitionModal() {
  competitionPopup.value.close();
}

// 选择竞赛
function selectCompetition(competition) {
  form.competitionId = competition.id;
}

// 确认竞赛选择
function confirmCompetitionSelection() {
  closeCompetitionModal();
}

// 显示老师选择器
function showTeacherModal(index) {
  teacherPopup.value.open();
  currentTeacherIndex.value = index;
}

// 关闭老师选择器
function closeTeacherModal() {
  teacherPopup.value.close();
  // 清空搜索值并重置列表
  teacherSearchKey.value = '';
  // 重置为当前选择的专业下的所有教师
  filterTeachersByMajor(selectedMajorId.value);
}

// 选择老师
function selectTeacher(teacher) {
  // 如果教师已被选择，则不允许再次选择
  if (isTeacherAlreadySelected(teacher.id)) {
    uni.showToast({
      title: '该教师已被选择',
      icon: 'none'
    });
    return;
  }
  
  form.teachers[currentTeacherIndex.value].id = teacher.id;
  form.teachers[currentTeacherIndex.value].name = teacher.name;
  // 可以添加更多字段，如头像URL等
}

// 确认老师选择
function confirmTeacherSelection() {
  closeTeacherModal();
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

// 补零函数
function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

// 添加指导老师
function addTeacher() {
  form.teachers.push({ id: '', name: '', role: '' });
}

// 移除指导老师
function removeTeacher(index) {
  form.teachers.splice(index, 1);
}

// 添加招募角色
function addRole() {
  form.roles.push({ 
    name: '', 
    count: 1, 
    description: '', 
    skills: [] 
  });
}

// 移除招募角色
function removeRole(index) {
  form.roles.splice(index, 1);
}

// 添加技能
function addSkill(roleIndex) {
  const skill = skillInputs[roleIndex];
  if (skill && skill.trim()) {
    if (!form.roles[roleIndex].skills) {
      form.roles[roleIndex].skills = [];
    }
    form.roles[roleIndex].skills.push(skill.trim());
    skillInputs[roleIndex] = '';
  }
}

// 移除技能
function removeSkill(roleIndex, skillIndex) {
  form.roles[roleIndex].skills.splice(skillIndex, 1);
}

// 表单验证
function validateForm() {
  if (!form.competitionId) {
    showToast('请选择关联竞赛');
    return false;
  }
  
  if (!form.teamName) {
    showToast('请输入团队名称');
    return false;
  }
  
  if (!form.researchDirection) {
    showToast('请输入研究方向');
    return false;
  }
  
  if (!form.description) {
    showToast('请输入团队描述');
    return false;
  }
  
  if (!form.recruitDeadline) {
    showToast('请选择招募截止日期');
    return false;
  }
  
  if (!form.email) {
    showToast('请输入电子邮箱');
    return false;
  }
  
  // 验证指导老师
  for (let i = 0; i < form.teachers.length; i++) {
    const teacher = form.teachers[i];
    if (!teacher.id ) {
      showToast(`请完善指导老师${i + 1}的信息`);
      return false;
    }
  }
  

  
  if (form.roles.length === 0) {
    showToast('请至少添加一个招募角色');
    return false;
  }
  
  return true;
}

// 显示提示
function showToast(title) {
  uni.showToast({
    title,
    icon: 'none'
  });
}

// 提交表单
async function submitTeam() {
  if (!validateForm()) return;
  
  uni.showLoading({
    title: '提交中...'
  });
  
  try {
    // 转换数据格式，适配API
    const apiData = {
      competitionId: form.competitionId,
      name: form.teamName,
      description: form.description,
      direction: form.researchDirection,
      recruitmentDeadline: new Date(form.recruitDeadline).toISOString(),
      
      // 联系方式
      contactInfo: {
        phone: form.phone || '',
        email: form.email || '',
        wechat: form.wechat || '',
        qq: form.qq || ''
      },
      
      // 指导老师
      teacherIds: form.teachers.map(teacher => teacher.id),
      teacherRoles: form.teachers.map(teacher => teacher.role),
      
      // 角色要求
      roles: form.roles.map(role => ({
        name: role.name,
        requiredCount: parseInt(role.count) || 1,
        description: role.description,
        skillRequirements: role.skills || []
      }))
    };
    
    console.log('提交数据:', apiData);
    
    // 调用API
    const res = await teamApi.createTeam(apiData);
    console.log(res);
    uni.hideLoading();
    
    if (res.code === 200) {
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    } else {
      showToast(res.message || '创建失败');
    }
  } catch (error) {
    console.error('创建团队失败:', error);
    uni.hideLoading();
    showToast('创建失败，请稍后重试');
  }
}

// 页面加载时获取竞赛列表和教师列表
onMounted(() => {
  getCompetitionsBasicInfo();
  getTeachersList();
  getSkillTags();
});

// 根据竞赛类别添加不同颜色
function getCategoryClass(categoryId) {
  switch (categoryId) {
    case 1:
      return 'category-programming';
    case 2:
      return 'category-math';
    case 3:
      return 'category-electronics';
    case 4:
      return 'category-robotics';
    case 5:
      return 'category-innovation';
    default:
      return '';
  }
}

// 检查教师是否已被选择
function isTeacherAlreadySelected(teacherId) {
  // 排除当前正在编辑的项
  if (currentTeacherIndex.value !== null && form.teachers[currentTeacherIndex.value].id === teacherId) {
    return false;
  }
  return form.teachers.some(teacher => teacher.id === teacherId && teacher.id !== '');
}

// 搜索教师
function searchTeachers() {
  if (!teacherSearchKey.value.trim()) {
    // 如果搜索关键字为空，恢复按专业筛选的结果
    filterTeachersByMajor(selectedMajorId.value);
    return;
  }
  
  const keyword = teacherSearchKey.value.toLowerCase().trim();
  
  // 在当前专业下搜索
  let baseList = selectedMajorId.value === 0 
    ? teacherList.value 
    : teacherList.value.filter(item => item.major === selectedMajorId.value);
  
  // 按名称搜索
  filteredTeacherList.value = baseList.filter(item => 
    item.name.toLowerCase().includes(keyword)
  );
}

// 清除教师搜索
function clearTeacherSearch() {
  teacherSearchKey.value = '';
  filterTeachersByMajor(selectedMajorId.value);
}

// 显示技能标签选择弹窗
function showSkillModal(roleIndex) {
  skillPopup.value.open();
  currentRoleIndex.value = roleIndex;
}

// 关闭技能标签选择弹窗
function closeSkillModal() {
  skillPopup.value.close();
  // 清空搜索值并重置列表
  skillSearchKey.value = '';
  // 重置为当前选择的专业下的所有技能
  filterSkillsByCategory(selectedSkillCategory.value);
}

// 获取技能标签
async function getSkillTags() {
  try {
    uni.showLoading({
      title: '加载中...'
    });
    
    const res = await uni.request({
      url: `${baseUrl}/api/skill-tags/group-by-category`,
      method: 'GET'
    });
    
    if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
      // 保存技能标签数据
      skillTags.value = res.data.data;
      
      // 添加全部分类
      const categories = ['全部', ...Object.keys(res.data.data)];
      skillCategories.value = categories;
      
      // 创建一个扁平化的技能标签列表用于搜索和展示
      const allTags = [];
      Object.entries(res.data.data).forEach(([category, tags]) => {
        tags.forEach(tag => {
          allTags.push({
            ...tag,
            category: category
          });
        });
      });
      
      filteredSkillTags.value = allTags;
      
      console.log('所有技能标签:', allTags);
      console.log('分类:', categories);
    } else {
      showToast('获取技能标签失败');
    }
  } catch (error) {
    console.error('获取技能标签失败:', error);
    showToast('获取技能标签失败');
  } finally {
    uni.hideLoading();
  }
}

// 根据分类筛选技能
function filterSkillsByCategory(category) {
  selectedSkillCategory.value = category;
  skillSearchKey.value = ''; // 清空搜索关键字
  
  console.log('筛选分类:', category);
  console.log('所有技能标签数据:', skillTags.value);
  
  if (category === '全部') {
    // 显示全部，合并所有分类下的标签
    const allTags = [];
    Object.entries(skillTags.value).forEach(([cat, tags]) => {
      tags.forEach(tag => {
        allTags.push({
          ...tag,
          category: cat
        });
      });
    });
    filteredSkillTags.value = allTags;
  } else {
    // 按分类筛选，获取特定分类下的标签
    const categoryTags = skillTags.value[category] || [];
    filteredSkillTags.value = categoryTags.map(tag => ({
      ...tag,
      category: category
    }));
  }
  
  console.log('筛选后的技能标签:', filteredSkillTags.value);
}

// 确认技能选择
function confirmSkillSelection() {
  closeSkillModal();
}

// 检查技能是否已被选择
function isSkillSelected(tagName) {
  const role = form.roles[currentRoleIndex.value];
  return role.skills.includes(tagName);
}

// 检查技能是否已被选择
function isSkillAlreadySelected(tagName) {
  // 如果当前角色已经包含该技能，则返回false，允许选择
  const role = form.roles[currentRoleIndex.value];
  if (role.skills.includes(tagName)) {
    return false;
  }
  
  // 检查其他角色是否已经选择了该技能
  for (let i = 0; i < form.roles.length; i++) {
    if (i !== currentRoleIndex.value && form.roles[i].skills.includes(tagName)) {
      return true;
    }
  }
  
  return false;
}

// 切换技能选择
function toggleSkillSelection(skill) {
  const role = form.roles[currentRoleIndex.value];
  if (isSkillSelected(skill.tagName)) {
    role.skills = role.skills.filter(item => item !== skill.tagName);
  } else {
    role.skills.push(skill.tagName);
  }
}

// 搜索技能
function searchSkills() {
  console.log('搜索技能:', skillSearchKey.value);
  
  if (!skillSearchKey.value.trim()) {
    // 如果搜索关键字为空，恢复按分类筛选的结果
    filterSkillsByCategory(selectedSkillCategory.value);
    return;
  }
  
  const keyword = skillSearchKey.value.toLowerCase().trim();
  
  // 准备搜索基础列表
  let baseList = [];
  
  if (selectedSkillCategory.value === '全部') {
    // 在所有分类中搜索
    Object.entries(skillTags.value).forEach(([category, tags]) => {
      tags.forEach(tag => {
        baseList.push({
          ...tag,
          category: category
        });
      });
    });
  } else {
    // 在特定分类中搜索
    const categoryTags = skillTags.value[selectedSkillCategory.value] || [];
    baseList = categoryTags.map(tag => ({
      ...tag,
      category: selectedSkillCategory.value
    }));
  }
  
  // 按名称搜索（不区分大小写）
  filteredSkillTags.value = baseList.filter(item => 
    item.tagName.toLowerCase().includes(keyword) ||
    (item.description && item.description.toLowerCase().includes(keyword))
  );
  
  console.log('搜索结果:', filteredSkillTags.value);
}

// 清除技能搜索
function clearSkillSearch() {
  skillSearchKey.value = '';
  filterSkillsByCategory(selectedSkillCategory.value);
}

// 获取当前角色已选技能数量
function getSelectedSkillsCount() {
  if (currentRoleIndex.value === null) return 0;
  const role = form.roles[currentRoleIndex.value];
  return role.skills ? role.skills.length : 0;
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';

// SCSS变量定义
$primary-color: #4A90E2;
$secondary-color: #7ED321;
$accent-color: #FF6B6B;
$bg-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #E5E7EB;
$border-radius: 12rpx;
$border-radius-full: 100rpx;
$shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

// 分类颜色
$category-colors: (
  'programming': #5a67d8,
  'math': #38a169,
  'electronics': #dd6b20,
  'robotics': #805ad5,
  'innovation': #e53e3e
);

// 混合器
@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin hidden-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

page {
  background-color: $bg-color;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部导航栏 */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: $primary-color;
  box-shadow: $shadow-sm;

.nav-bar {
    @include flex-between;
  padding: 20rpx 30rpx;
  color: white;

    .back-btn, .help-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}
  }
}

/* 表单内容 */
.form-content {
  flex: 1;
}

.form-section {
  background-color: $card-color;
  border-radius: $border-radius;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

.section-icon {
      color: $primary-color;
  font-size: 40rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
      color: $text-color;
    }
  }
}

.form-item {
  margin-bottom: 20rpx;

.form-label {
    @include flex-center;
  font-size: 28rpx;
    color: $text-secondary;
  margin-bottom: 8rpx;

.required {
      color: $accent-color;
  margin-left: 6rpx;
      font-size: 28rpx;
    }
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #f9fafb;
    border: 1rpx solid $border-color;
    border-radius: $border-radius;
  padding: 0 24rpx;
  font-size: 28rpx;
    color: $text-color;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f9fafb;
    border: 1rpx solid $border-color;
    border-radius: $border-radius;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
    color: $text-color;
  box-sizing: border-box;
  }
}

/* 教师与角色项目卡片样式 */
.teacher-item, .role-item {
  background-color: #f9fafb;
  border-radius: $border-radius;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .item-header {
    @include flex-between;
    margin-bottom: 16rpx;
    
    .item-title {
      font-size: 28rpx;
      font-weight: 500;
      color: $text-color;
    }
    
    .delete-btn {
      width: 50rpx;
      height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: rgba($accent-color, 0.1);
      
      .iconfont {
        font-size: 30rpx;
        color: $accent-color;
      }
      
      &:active {
        background-color: rgba($accent-color, 0.2);
      }
    }
  }
}

.select-box {
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  border: 1rpx solid $border-color;
  border-radius: $border-radius;
        display: flex;
        align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;

.select-text {
  font-size: 28rpx;
    color: $text-color;
}

.placeholder-text {
          font-size: 28rpx;
    color: $text-muted;
}

.select-arrow {
    color: $text-muted;
  font-size: 32rpx;
    transform: rotate(-90deg);
  }
}

/* 添加按钮样式 */
.add-item-btn {
  @include flex-center;
  justify-content: center;
  padding: 20rpx 0;
  border: 1rpx dashed $border-color;
  border-radius: $border-radius;
  margin-bottom: 20rpx;
  color: $primary-color;
  font-size: 28rpx;
  
  .iconfont {
    margin-right: 8rpx;
    font-size: 32rpx;
  }
  
  &:active {
    background-color: rgba($primary-color, 0.05);
  }
}

/* 竞赛选择弹窗样式 */
.popup-container {
  background-color: $card-color;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: 20rpx;
  height: 800rpx;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    @include flex-between;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid $border-color;
    
    .popup-title {
  font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .popup-close {
      font-size: 28rpx;
      color: $text-secondary;
    }
  }
  
  .category-scroll {
    height: 70rpx;
    white-space: nowrap;
    padding: 16rpx;
    border-bottom: 1rpx solid $border-color;
    overflow-x: auto;
    @include hidden-scrollbar;
    
    .category-list {
      display: inline-flex;
      flex-wrap: nowrap;
      gap: 16rpx;
      padding-right: 16rpx;
      
      .category-tag {
        display: inline-block;
        padding: 10rpx 24rpx;
        min-width: 120rpx;
        box-sizing: border-box;
        flex-shrink: 0;
        text-align: center;
        background-color: #f3f4f6;
        border-radius: $border-radius-full;
        font-size: 24rpx;
        color: $text-secondary;
        transition: all 0.3s ease;
        
        &.active-category {
          background-color: $primary-color;
          color: white;
        }
      }
    }
  }
  
  .competitions-list {
    flex: 1;
    padding: 10rpx 20rpx;
    height: 480rpx;
    overflow-y: auto;
    
    .competition-item {
      @include flex-between;
      padding: 16rpx 20rpx;
      border-bottom: 1rpx solid $border-color;
      transition: background-color 0.3s ease;
      
      &:active {
  background-color: #f9fafb;
      }
      
      &.active-competition {
        background-color: rgba($primary-color, 0.1);
      }
      
      .competition-info {
        flex: 1;
        
        .competition-title {
          font-size: 26rpx;
          color: $text-color;
          margin-bottom: 4rpx;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 500rpx;
        }
        
        .competition-category {
          font-size: 22rpx;
          color: $text-secondary;
          display: block;
        }
      }
      
      .hot-tag {
        font-size: 20rpx;
        color: white;
        background-color: $accent-color;
        padding: 2rpx 10rpx;
        border-radius: $border-radius-full;
        margin-right: 10rpx;
      }
      
      .icon-check {
        color: $primary-color;
  font-size: 36rpx;
      }
}

    .empty-tip {
      display: flex;
  justify-content: center;
      align-items: center;
      padding: 60rpx 0;
      color: $text-muted;
  font-size: 28rpx;
    }
  }
  
  .popup-footer {
    padding: 20rpx 30rpx;
    border-top: 1rpx solid $border-color;
    background-color: #ffffff;
    
    .confirm-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      background-color: $primary-color;
      color: white;
      border-radius: 8rpx;
      text-align: center;
      font-size: 30rpx;
      font-weight: 500;
    }
  }
}

/* 技能标签样式 */
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;

.skill-tag {
    @include flex-center;
  padding: 8rpx 16rpx;
    background-color: rgba($primary-color, 0.1);
    border-radius: $border-radius-full;
    font-size: 24rpx;
    color: $primary-color;

    .iconfont {
  margin-left: 8rpx;
  font-size: 24rpx;
      color: $accent-color;
    }
  }
}

.skill-input-box {
  @include flex-between;
  height: 70rpx;
  border: 1rpx solid $border-color;
  border-radius: $border-radius;
  padding: 0 16rpx;
  background-color: #fff;

.skill-input {
  flex: 1;
    height: 100%;
  font-size: 28rpx;
    color: $text-color;
}

.add-skill-btn {
    width: 50rpx;
    height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
    background-color: rgba($primary-color, 0.1);
    border-radius: 50%;
    
    .iconfont {
      font-size: 26rpx;
      color: $primary-color;
    }
  }
}

/* 底部提交按钮 */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: $card-color;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 9;

.submit-btn {
  width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background-color: $primary-color;
  color: white;
    border-radius: $border-radius;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
    letter-spacing: 2rpx;
  }
}

/* 日期选择器样式 */
.date-picker-box {
  width: 100%;
  
  .picker-view {
    width: 100%;
    height: 80rpx;
    background-color: #fff;
    border: 1rpx solid $border-color;
    border-radius: $border-radius;
    padding: 0 24rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .select-text {
      font-size: 28rpx;
      color: $text-color;
    }
    
    .placeholder-text {
      font-size: 28rpx;
      color: $text-muted;
    }
    
    .picker-icon {
      font-size: 32rpx;
      color: $text-muted;
    }
  }
}

/* 隐藏uni-datetime-picker自带的清除按钮 */
::v-deep .uni-date-x {
  display: none;
}

// 分类颜色样式
@each $name, $color in $category-colors {
  .category-#{$name} {
    color: $color !important;
  }
}

/* 教师选择器样式 */
.teacher-item-select {
  @include flex-between;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid $border-color;
  transition: background-color 0.3s ease;
  
  &:active {
    background-color: #f9fafb;
  }
  
  &.active-teacher {
    background-color: rgba($primary-color, 0.1);
  }
  
  &.disabled-teacher {
    opacity: 0.6;
    background-color: #f3f4f6;
    
    &:active {
      background-color: #f3f4f6;
    }
  }
  
  .teacher-info {
    @include flex-center;
    flex: 1;
    
    .teacher-avatar {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      background-color: #f3f4f6;
    }
    
    .teacher-detail {
      flex: 1;
      
      .teacher-name {
        font-size: 26rpx;
        color: $text-color;
        margin-bottom: 4rpx;
        display: block;
      }
      
      .teacher-major {
        font-size: 22rpx;
        color: $text-secondary;
        display: block;
      }
    }
  }
  
  .teacher-status {
    .selected-tag {
      font-size: 20rpx;
      color: white;
      background-color: $text-secondary;
      padding: 2rpx 10rpx;
      border-radius: $border-radius-full;
    }
    
    .icon-check {
      color: $primary-color;
      font-size: 36rpx;
    }
  }
}

/* 搜索框样式 */
.search-box {
  padding: 12rpx 16rpx;
  border-bottom: 1rpx solid $border-color;
  background-color: #fff;
  
  .search-input-wrapper {
    @include flex-center;
    height: 60rpx;
    background-color: #f5f5f5;
    border-radius: 30rpx;
    padding: 0 20rpx;
    
    .iconfont {
      font-size: 28rpx;
      color: $text-muted;
      margin-right: 10rpx;
    }
    
    .search-input {
      flex: 1;
      height: 100%;
      font-size: 26rpx;
      color: $text-color;
      background-color: transparent;
    }
    
    .clear-btn {
      font-size: 28rpx;
      color: $text-muted;
      padding: 0 10rpx;
    }
  }
}

/* 技能标签选择器样式 */
.skill-item-select {
  @include flex-between;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid $border-color;
  transition: background-color 0.3s ease;
  
  &:active {
    background-color: #f9fafb;
  }
  
  &.active-skill {
    background-color: rgba($primary-color, 0.1);
  }
  
  &.disabled-skill {
    opacity: 0.6;
    background-color: #f3f4f6;
    
    &:active {
      background-color: #f3f4f6;
    }
  }
  
  .skill-info {
    flex: 1;
    
    .skill-name {
      font-size: 26rpx;
      color: $text-color;
      display: block;
    }
    
    .skill-desc {
      font-size: 22rpx;
      color: $text-secondary;
      display: block;
      margin-top: 4rpx;
    }
  }
  
  .skill-check {
    .selection-indicator {
      display: inline-block;
      padding: 4rpx 16rpx;
      border-radius: 30rpx;
      font-size: 22rpx;
      background-color: #f0f0f0;
      color: $text-secondary;
      
      &.selected {
        background-color: rgba($primary-color, 0.2);
        color: $primary-color;
        font-weight: 500;
      }
    }
  }
}

.popup-footer {
  @include flex-between;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid $border-color;
  background-color: #ffffff;
  
  .selected-count {
    font-size: 26rpx;
    color: $text-secondary;
    
    .count-highlight {
      color: $primary-color;
      font-weight: bold;
      font-size: 28rpx;
    }
  }
  
  .confirm-btn {
    width: 200rpx;
    height: 70rpx;
    line-height: 70rpx;
    background-color: $primary-color;
    color: white;
    border-radius: 8rpx;
    text-align: center;
    font-size: 28rpx;
    font-weight: 500;
  }
}

// 技能选择按钮
.skill-select-btn {
  @include flex-center;
  justify-content: space-between;
  height: 80rpx;
  background-color: #f9fafb;
  border: 1rpx solid $border-color;
  border-radius: $border-radius;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
  
  .iconfont {
    color: $text-secondary;
    &.icon-tag {
      margin-right: 12rpx;
      font-size: 28rpx;
    }
    &.icon-arrow-right {
      font-size: 24rpx;
    }
  }
  
  text {
    color: $text-secondary;
    font-size: 28rpx;
    &:nth-child(2) {
      flex: 1;
    }
  }
  
  &:active {
    background-color: #f0f2f5;
  }
}
</style> 