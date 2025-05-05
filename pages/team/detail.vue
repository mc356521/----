<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="top-bar">
      <view class="flex-between px-4 py-3">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-arrow-left"></text>
        </view>
        <text class="page-title">{{teamInfo.name || '队伍详情'}}</text>
        <view class="header-actions">
          <text class="iconfont icon-star mr-3"></text>
          <text class="iconfont icon-share"></text>
        </view>
      </view>
    </view>

    <!-- 队伍基本信息 -->
    <view class="info-card">
      <view class="flex-between mb-3">
        <view class="competition-link" @click="goToCompetition(teamInfo.competitionId)">
          <text class="iconfont icon-trophy mr-1 blue-text"></text>
          <view class="blue-text">关联竞赛：{{teamInfo.competitionName}}</view>
        </view>

      </view>

      <view class="leader-info">
        <image class="leader-avatar" :src="teamInfo.leaderAvatarUrl || defaultAvatar"></image>
       
		<view class="leader-detail">
	
          <text class="leader-name">队长：{{teamInfo.leaderName}}</text>
          <text class="leader-major">{{teamInfo.leaderMajor || '未设置专业'}}</text>
        </view>
		<view class="status-tag" :class="getStatusClass(teamInfo.status)" >
		<!-- 		  <text class="iconfont" :class="getStatusIcon(teamInfo.status)"></text> -->
				  <text>{{teamInfo.statusText}}</text>
				</view>
      </view>

      <view class="team-desc-section">
        <text class="section-title">队伍描述</text>
        <text class="desc-text">{{teamInfo.description}}</text>
      </view>

      <view class="team-meta">
        <text class="meta-item">组队截止：{{teamInfo.recruitmentDeadlineFormatted}}</text>
        <view class="view-count">
          <text class="iconfont icon-eye"></text>
          <text>浏览次数：{{teamInfo.viewCount}}</text>
        </view>
      </view>
    </view>

    <!-- 招募角色 -->
    <view class="section-card">
      <text class="section-header">招募角色</text>
      <view class="role-list">
        <view 
          class="role-card" 
          v-for="role in teamInfo.roles" 
          :key="role.id"
          :class="{'role-filled': role.currentCount >= role.requiredCount}"
        >
          <view class="flex-between mb-2">
            <view>
              <text class="role-title">{{role.name}}</text>
              <text class="role-count">需求：{{role.requiredCount}}人 / 已招募：{{role.currentCount}}人</text>
            </view>
            <view 
              class="role-status-tag" 
              :class="role.currentCount >= role.requiredCount ? 'filled-tag' : 'recruiting-tag'"
            >
              {{role.currentCount >= role.requiredCount ? '已满员' : '招募中'}}
            </view>
          </view>
          
          <text class="role-desc">{{role.description}}</text>
          
          <view class="skill-section">
            <text class="skill-header">技能要求:</text>
            <view class="skill-tags">
              <text 
                class="skill-tag" 
                v-for="(skill, index) in role.skillRequirements" 
                :key="index"
              >{{skill}}</text>
            </view>
          </view>
          
          <button 
            class="apply-btn" 
            :class="role.currentCount >= role.requiredCount ? 'disabled-btn' : 'active-btn'"
            :disabled="role.currentCount >= role.requiredCount"
            @click="applyRole(role.id)"
          >
            <text class="iconfont icon-paper-plane" v-if="role.currentCount < role.requiredCount"></text>
            申请加入
          </button>
        </view>
      </view>
    </view>

    <!-- 队伍成员 -->
    <view class="info-card" v-if="teamMembers.length > 0">
      <text class="section-header">队伍成员 ({{teamMembers.length}})</text>
      <view class="member-grid">
        <view class="member-item" v-for="(member, index) in teamMembers" :key="index">
          <image class="member-avatar" :src="member.userAvatarUrl || defaultAvatar" :class="{'leader-border2': member.isLeader}"></image>
          <text class="member-name">
            {{member.userName}}
            <view v-if="member.roleName" class="member-role">({{member.roleName}})</view>
            <view class="leader-label" v-if="member.isLeader">(队长)</view>
          </text>
        </view>
      </view>
    </view>

    <!-- 指导老师 -->
    <view class="info-card" v-if="teamInfo.teachers && teamInfo.teachers.length > 0">
      <text class="section-header">指导老师</text>
      <view class="member-grid">
        <view class="member-item" v-for="(teacher, index) in teamInfo.teachers" :key="index">
          <image class="member-avatar" :src="teacher.avatarUrl || defaultAvatar"></image>
          <text class="member-name">{{teacher.name}}</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="info-card" v-if="teamInfo.contactInfo">
      <text class="section-header">联系方式</text>
      <view class="contact-list">
        <view class="contact-item" v-if="teamInfo.contactInfo.wechat">
          <text class="iconfont icon-weixin contact-icon wechat-color"></text>
          <text class="contact-text">微信：{{teamInfo.contactInfo.wechat}}</text>
          <text class="copy-btn" @click="copyText(teamInfo.contactInfo.wechat)">复制</text>
        </view>
        <view class="contact-item" v-if="teamInfo.contactInfo.phone">
          <text class="iconfont icon-phone contact-icon phone-color"></text>
          <text class="contact-text">电话：{{showPhone ? teamInfo.contactInfo.phone : hidePhone(teamInfo.contactInfo.phone)}}</text>
          <text class="copy-btn" @click="togglePhone">{{showPhone ? '隐藏' : '查看'}}</text>
        </view>
        <view class="contact-item" v-if="teamInfo.contactInfo.qq">
          <text class="iconfont icon-qq contact-icon qq-color"></text>
          <text class="contact-text">QQ群：{{teamInfo.contactInfo.qq}}</text>
          <text class="copy-btn" @click="copyText(teamInfo.contactInfo.qq)">复制</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer-bar">
      <!-- 情况1: 访客视角 & 队伍招募中 & 有可申请角色 -->
      <button 
        class="full-btn primary-btn" 
        v-if="!isTeamMember && teamInfo.status === '0' && hasAvailableRoles"
        @click="showApplyOptions"
      >
        <text class="iconfont icon-user-plus"></text> 申请加入队伍
      </button>

      <!-- 情况2: 访客视角 & 队伍已满员/已解散 -->
      <button 
        class="full-btn disabled-btn" 
        v-if="!isTeamMember && (teamInfo.status === '1' || teamInfo.status === '2')" 
        disabled
      >
        {{teamInfo.status === '1' ? '队伍已满员' : '队伍已解散'}}
      </button>

      <!-- 情况3: 队长视角 -->
      <view class="btn-group" v-if="isTeamLeader">
        <button class="half-btn primary-btn" @click="editTeam">
          <text class="iconfont icon-edit"></text> 编辑队伍
        </button>
        <button class="half-btn danger-btn" @click="disbandTeam">
          <text class="iconfont icon-trash"></text> 解散队伍
        </button>
      </view>

      <!-- 情况4: 普通成员视角 -->
      <button 
        class="full-btn danger-btn" 
        v-if="isTeamMember && !isTeamLeader"
        @click="leaveTeam"
      >
        <text class="iconfont icon-signout"></text> 退出队伍
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import teamApi from '@/api/modules/team';

const defaultAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';

// 页面参数
const teamId = ref(null);
const teamInfo = ref({});
const teamMembers = ref([]);
const showPhone = ref(false);
const isLoading = ref(true);

// 计算属性
const isTeamMember = computed(() => {
  // 检查当前用户是否是团队成员
  // 需要根据实际存储的用户数据来实现
  return false;
});

const isTeamLeader = computed(() => {
  // 检查当前用户是否是团队队长
  // 需要根据实际存储的用户数据来实现
  return false;
});

const hasAvailableRoles = computed(() => {
  if (!teamInfo.value.roles) return false;
  return teamInfo.value.roles.some(role => role.currentCount < role.requiredCount);
});

// 方法
function getStatusClass(status) {
  switch (status) {
    case '0': return 'status-recruiting';
    case '1': return 'status-filled';
    case '2': return 'status-disbanded';
    default: return 'status-recruiting';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case '0': return 'icon-check-circle';
    case '1': return 'icon-hourglass';
    case '2': return 'icon-times-circle';
    default: return 'icon-check-circle';
  }
}

function hidePhone(phone) {
  if (!phone) return '';
  // 隐藏中间四位数字
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function togglePhone() {
  showPhone.value = !showPhone.value;
}

function copyText(text) {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      });
    }
  });
}

function goBack() {
  uni.navigateBack();
}

function goToCompetition(competitionId) {
  uni.navigateTo({
    url: `/pages/competition/detail?id=1`
  });
}

function applyRole(roleId) {
  uni.showModal({
    title: '申请加入',
    content: '确定要申请该角色吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用申请接口
        uni.showToast({
          title: '申请已提交',
          icon: 'success'
        });
      }
    }
  });
}

function showApplyOptions() {
  // 如果有多个可申请角色，显示选择框
  if (teamInfo.value.roles && teamInfo.value.roles.length > 0) {
    const availableRoles = teamInfo.value.roles.filter(role => role.currentCount < role.requiredCount);
    
    if (availableRoles.length > 1) {
      const itemList = availableRoles.map(role => `${role.name}（${role.currentCount}/${role.requiredCount}）`);
      
      uni.showActionSheet({
        itemList,
        success: (res) => {
          applyRole(availableRoles[res.tapIndex].id);
        }
      });
    } else if (availableRoles.length === 1) {
      applyRole(availableRoles[0].id);
    }
  }
}

function editTeam() {
  uni.navigateTo({
    url: `/pages/team/edit?id=${teamId.value}`
  });
}

function disbandTeam() {
  uni.showModal({
    title: '解散队伍',
    content: '确定要解散该队伍吗？此操作不可撤销',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (res.confirm) {
        // 调用解散队伍接口
        uni.showToast({
          title: '队伍已解散',
          icon: 'success'
        });
      }
    }
  });
}

function leaveTeam() {
  uni.showModal({
    title: '退出队伍',
    content: '确定要退出该队伍吗？',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (res.confirm) {
        // 调用退出队伍接口
        teamApi.leaveTeam(teamId.value).then(() => {
          uni.showToast({
            title: '已退出队伍',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            }
          });
        }).catch(err => {
          uni.showToast({
            title: '退出失败',
            icon: 'none'
          });
        });
      }
    }
  });
}

// 获取队伍成员数据
async function getTeamMembers() {
  try {
    const res = await teamApi.getTeamMembers(teamId.value);
    if (res && res.code === 200 && res.data) {
      teamMembers.value = res.data;
      console.log('获取到队伍成员:', teamMembers.value);
    } else {
      console.log('获取队伍成员失败:', res?.message);
    }
  } catch (error) {
    console.error('获取队伍成员出错', error);
  }
}

// 获取队伍详情数据
async function getTeamDetail() {
  isLoading.value = true;
  try {
    const res = await teamApi.getTeamDetail(teamId.value);
    if (res && res.code === 200 && res.data) {
      teamInfo.value = res.data;
      console.log('获取到队伍详情:', teamInfo.value);
      // 获取队伍成员
      getTeamMembers();
    } else {
      uni.showToast({
        title: res?.message || '获取队伍详情失败',
        icon: 'none'
      });
      console.log('获取队伍详情失败:', res);
    }
  } catch (error) {
    console.error('获取队伍详情出错', error);
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
}

// 生命周期
onMounted(() => {
  const options = uni.getLaunchOptionsSync() || {};
  // 获取路由参数
  const pages = getCurrentPages();
  console.log("在什么");
    console.log(pages);
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id || options.id 
  
  if (id) {
    teamId.value = id;
    getTeamDetail();
  } else {
    uni.showToast({
      title: '队伍ID不能为空',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});
</script>

<style>
.container {
  background-color: #f8fafc;
  min-height: 100vh;
  padding-bottom: 150rpx;
}

/* 顶部导航 */
.top-bar {
  background-color: #ffffff;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  z-index: 10;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.px-4 {
  padding-left: 30rpx;
  padding-right: 30rpx;
}

.py-3 {
  padding-top: 20rpx;
  padding-bottom: 20rpx;
}

.back-btn {
  padding: 10rpx;
}

.page-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  max-width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
}

.mr-3 {
  margin-right: 20rpx;
}

/* 卡片样式 */
.info-card, .section-card {
  background-color: #ffffff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.mb-2 {
  margin-bottom: 16rpx;
}

.mb-3 {
  margin-bottom: 24rpx;
}

/* 队伍信息样式 */
.competition-link {
  display: flex;
  align-items: center;
  font-size: 26rpx;
}

.blue-text {
  color: #3B82F6;
}

.status-tag {
  display: flex;
  align-items: center;
  padding: 6rpx 40rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-left: 100px;
}

.status-recruiting {
  background-color: #ECFDF5;
  color: #10B981;
}

.status-filled {
  background-color: #FEF3C7;
  color: #F59E0B;
}

.status-disbanded {
  background-color: #FEE2E2;
  color: #EF4444;
}

.leader-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.leader-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  border: 1px solid #eaeaea;
}

.leader-detail {
  display: flex;
  flex-direction: column;
}

.leader-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.leader-major {
  font-size: 24rpx;
  color: #9CA3AF;
}

.team-desc-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.desc-text {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.5;
}

.team-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #9CA3AF;
}

.meta-item {
  font-size: 24rpx;
}

.view-count {
  display: flex;
  align-items: center;
}

/* 招募角色样式 */
.section-header {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.role-card {
  background-color: #ffffff;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.role-card:active {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.role-filled {
  opacity: 0.8;
}

.role-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.role-count {
  font-size: 24rpx;
  color: #9CA3AF;
  display: block;
}

.role-status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.recruiting-tag {
  background-color: #EFF6FF;
  color: #3B82F6;
}

.filled-tag {
  background-color: #F3F4F6;
  color: #9CA3AF;
}

.role-desc {
  font-size: 26rpx;
  color: #6B7280;
  margin-bottom: 20rpx;
  display: block;
}

.skill-section {
  margin-bottom: 20rpx;
}

.skill-header {
  font-size: 24rpx;
  font-weight: bold;
  color: #6B7280;
  margin-bottom: 10rpx;
  display: block;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.skill-tag {
  background-color: #F3F4F6;
  color: #6B7280;
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  border-radius: 30rpx;
}

.apply-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.active-btn {
  background-color: #3B82F6;
  color: #ffffff;
}

.disabled-btn {
  background-color: #E5E7EB;
  color: #9CA3AF;
}

/* 成员和老师样式 */
.member-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
}

.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 1px solid #E5E7EB;
}

.leader-border {
  border: 3px solid #3B82F6;
  padding: 2rpx;
}

.member-name {
  font-size: 24rpx;
  color: #6B7280;
  margin-top: 10rpx;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leader-label {
  color: #3B82F6;
}

.member-role {
  color: #9CA3AF;
  font-size: 24rpx;
}

/* 联系方式样式 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #6B7280;
}

.contact-icon {
  margin-right: 16rpx;
  font-size: 32rpx;
}

.wechat-color {
  color: #07C160;
}

.phone-color {
  color: #3B82F6;
}

.qq-color {
  color: #12B7F5;
}

.contact-text {
  flex: 1;
}

.copy-btn {
  color: #3B82F6;
  font-size: 24rpx;
}

/* 底部操作栏 */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background-color: #ffffff;
  border-top: 1px solid #E5E7EB;
  z-index: 20;
}

.full-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-group {
  display: flex;
  gap: 20rpx;
}

.half-btn {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background-color: #3B82F6;
  color: #ffffff;
}

.danger-btn {
  background-color: #EF4444;
  color: #ffffff;
}

.disabled-btn {
  background-color: #E5E7EB;
  color: #9CA3AF;
}
</style> 