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
          <text class="iconfont icon-info section-icon"></text>
          <text class="section-title">基本信息</text>
        </view>
        
        <!-- 竞赛选择 -->
        <view class="form-item">
          <text class="form-label">关联竞赛<text class="required">*</text></text>
          <view class="select-box" @click="showCompetitionPicker">
            <text v-if="form.competitionId" class="select-text">{{ selectedCompetitionName }}</text>
            <text v-else class="placeholder-text">请选择竞赛</text>
            <text class="iconfont icon-arrow-down select-arrow"></text>
          </view>
        </view>
        
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
        
        <!-- 手机号码 -->
        <view class="form-item">
          <text class="form-label">手机号码<text class="required">*</text></text>
          <input 
            type="number" 
            v-model="form.phone" 
            placeholder="请输入手机号码" 
            class="form-input" 
          />
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
          <text class="iconfont icon-teacher section-icon"></text>
          <text class="section-title">指导老师</text>
        </view>
        
        <!-- 老师列表 -->
        <view v-for="(teacher, index) in form.teachers" :key="index" class="teacher-item">
          <view class="item-header">
            <text class="item-title">指导老师 {{ index + 1 }}</text>
            <view class="delete-btn" @click="removeTeacher(index)">
              <text class="iconfont icon-delete"></text>
            </view>
          </view>
          
          <!-- 选择老师 -->
          <view class="form-item">
            <text class="form-label">选择老师<text class="required">*</text></text>
            <view class="select-box" @click="showTeacherPicker(index)">
              <text v-if="teacher.name" class="select-text">{{ teacher.name }}</text>
              <text v-else class="placeholder-text">请选择老师</text>
              <text class="iconfont icon-arrow-down select-arrow"></text>
            </view>
          </view>
          
          <!-- 角色 -->
          <view class="form-item">
            <text class="form-label">角色<text class="required">*</text></text>
            <input 
              type="text" 
              v-model="teacher.role" 
              placeholder="如：主指导老师" 
              class="form-input" 
            />
          </view>
        </view>
        
        <!-- 添加老师按钮 -->
        <view class="add-item-btn" @click="addTeacher">
          <text class="iconfont icon-add"></text>
          <text>添加指导老师</text>
        </view>
      </view>
      
      <!-- 招募角色部分 -->
      <view class="form-section">
        <view class="section-header">
          <text class="iconfont icon-team section-icon"></text>
          <text class="section-title">招募角色</text>
        </view>
        
        <!-- 角色列表 -->
        <view v-for="(role, index) in form.roles" :key="index" class="role-item">
          <view class="item-header">
            <text class="item-title">角色 {{ index + 1 }}</text>
            <view class="delete-btn" @click="removeRole(index)">
              <text class="iconfont icon-delete"></text>
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
                <text class="iconfont icon-close" @click.stop="removeSkill(index, skillIndex)"></text>
              </view>
            </view>
            
            <!-- 添加技能输入框 -->
            <view class="skill-input-box">
              <input 
                type="text" 
                v-model="skillInputs[index]" 
                placeholder="添加技能" 
                class="skill-input" 
              />
              <view class="add-skill-btn" @click="addSkill(index)">
                <text class="iconfont icon-add"></text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 添加角色按钮 -->
        <view class="add-item-btn" @click="addRole">
          <text class="iconfont icon-add"></text>
          <text>添加招募角色</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitTeam">创建团队</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import teamApi from '@/api/modules/team';

// 表单数据
const form = reactive({
  competitionId: '',
  teamName: '',
  researchDirection: '',
  description: '',
  recruitDeadline: '',
  phone: '',
  email: '',
  wechat: '',
  qq: '',
  teachers: [
    { id: '', name: '', role: '' }
  ],
  roles: [
    { name: '', count: 1, description: '', skills: [] }
  ]
});

// 竞赛列表
const competitionList = ref([
  { id: '1', title: '2025年校园创新创业大赛' },
  { id: '2', title: '人工智能应用挑战赛' },
  { id: '3', title: '软件开发马拉松' }
]);

// 老师列表
const teacherList = ref([
  { id: '1', name: '张教授' },
  { id: '2', name: '李教授' },
  { id: '3', name: '王教授' },
  { id: '4', name: '刘教授' },
  { id: '5', name: '陈教授' }
]);

// 技能输入框的值
const skillInputs = reactive({});

// 计算属性：获取选中竞赛的名称
const selectedCompetitionName = computed(() => {
  const competition = competitionList.value.find(item => item.id === form.competitionId);
  return competition ? competition.title : '';
});

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 显示竞赛选择器
function showCompetitionPicker() {
  uni.showActionSheet({
    itemList: competitionList.value.map(item => item.title),
    success: function(res) {
      const selectedCompetition = competitionList.value[res.tapIndex];
      form.competitionId = selectedCompetition.id;
    }
  });
}

// 显示老师选择器
function showTeacherPicker(index) {
  uni.showActionSheet({
    itemList: teacherList.value.map(item => item.name),
    success: function(res) {
      const selectedTeacher = teacherList.value[res.tapIndex];
      form.teachers[index].id = selectedTeacher.id;
      form.teachers[index].name = selectedTeacher.name;
    }
  });
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
  if (form.teachers.length === 0) {
    addTeacher();
  }
}

// 添加招募角色
function addRole() {
  form.roles.push({ name: '', count: 1, description: '', skills: [] });
}

// 移除招募角色
function removeRole(index) {
  form.roles.splice(index, 1);
  if (form.roles.length === 0) {
    addRole();
  }
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
  
  if (!form.phone) {
    showToast('请输入手机号码');
    return false;
  }
  
  if (!form.email) {
    showToast('请输入电子邮箱');
    return false;
  }
  
  // 验证指导老师
  for (let i = 0; i < form.teachers.length; i++) {
    const teacher = form.teachers[i];
    if (!teacher.id || !teacher.role) {
      showToast(`请完善指导老师${i + 1}的信息`);
      return false;
    }
  }
  
  // 验证招募角色
  for (let i = 0; i < form.roles.length; i++) {
    const role = form.roles[i];
    if (!role.name || !role.count || !role.description) {
      showToast(`请完善角色${i + 1}的信息`);
      return false;
    }
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
function submitTeam() {
  if (!validateForm()) return;
  
  uni.showLoading({
    title: '提交中...'
  });
  
  // 模拟提交
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 2000);
  
  // 实际提交代码
  // teamApi.createTeam(form).then(res => {
  //   uni.hideLoading();
  //   if (res.code === 200) {
  //     uni.showToast({
  //       title: '创建成功',
  //       icon: 'success'
  //     });
  //     
  //     setTimeout(() => {
  //       uni.navigateBack();
  //     }, 1500);
  //   } else {
  //     showToast(res.message || '创建失败');
  //   }
  // }).catch(err => {
  //   uni.hideLoading();
  //   showToast('网络异常，请稍后重试');
  //   console.error(err);
  // });
}
</script>

<style>
@import '../../static/iconfont.css';

page {
  background-color: #f8fafc;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  --primary-color: #4A90E2;
  --secondary-color: #7ED321;
  --accent-color: #FF6B6B;
  --bg-color: #f8fafc;
  --card-color: #ffffff;
  --text-color: #333333;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --border-color: #E5E7EB;
  --border-radius: 12rpx;
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
  background-color: var(--primary-color);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  color: white;
}

.back-btn {
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

.help-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding: 30rpx;
}

.form-section {
  background-color: var(--card-color);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-icon {
  color: var(--primary-color);
  font-size: 40rpx;
  margin-right: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-color);
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.required {
  color: var(--accent-color);
  margin-left: 6rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #f9fafb;
  border: 1rpx solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0 24rpx;
  font-size: 28rpx;
  color: var(--text-color);
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f9fafb;
  border: 1rpx solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: var(--text-color);
  box-sizing: border-box;
}

.select-box {
  width: 100%;
  height: 80rpx;
  background-color: #f9fafb;
  border: 1rpx solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-text {
  font-size: 28rpx;
  color: var(--text-color);
}

.placeholder-text {
  font-size: 28rpx;
  color: var(--text-muted);
}

.select-arrow {
  color: var(--text-muted);
  font-size: 32rpx;
}

.date-picker-box {
  width: 100%;
}

.picker-view {
  width: 100%;
  height: 80rpx;
  background-color: #f9fafb;
  border: 1rpx solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-icon {
  color: var(--text-muted);
  font-size: 32rpx;
}

/* 指导老师和角色项目 */
.teacher-item, .role-item {
  background-color: #f9fafb;
  border-radius: var(--border-radius);
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-color);
}

.delete-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn .iconfont {
  color: var(--accent-color);
  font-size: 36rpx;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border: 1rpx dashed var(--border-color);
  border-radius: var(--border-radius);
  color: var(--primary-color);
  font-size: 28rpx;
}

.add-item-btn .iconfont {
  margin-right: 12rpx;
}

/* 技能标签 */
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.skill-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #EBF3FC;
  color: var(--primary-color);
  border-radius: 100rpx;
  font-size: 24rpx;
}

.skill-tag .iconfont {
  margin-left: 8rpx;
  font-size: 24rpx;
}

.skill-input-box {
  display: flex;
  align-items: center;
}

.skill-input {
  flex: 1;
  height: 80rpx;
  background-color: #f9fafb;
  border: 1rpx solid var(--border-color);
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
  padding: 0 24rpx;
  font-size: 28rpx;
}

.add-skill-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: var(--primary-color);
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-skill-btn .iconfont {
  color: white;
  font-size: 36rpx;
}

/* 底部提交按钮 */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--card-color);
  border-top: 1rpx solid var(--border-color);
  padding: 24rpx;
  z-index: 10;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: var(--primary-color);
  color: white;
  border-radius: 44rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}
</style> 