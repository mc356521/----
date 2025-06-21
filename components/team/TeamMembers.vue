<template>
  <view class="members-container">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <uni-load-more status="loading" iconType="snow" iconSize="20" :contentText="{contentdown: '加载中...'}"></uni-load-more>
    </view>
    
    <view class="empty-state" v-else-if="!hasMembers">
      <image class="empty-image" src="/static/image/empty-members.png" mode="aspectFit"></image>
      <text class="empty-text">暂无团队成员</text>
      <view class="action-btn primary" @click="inviteMember" v-if="isCurrentUserLeader">
        <text>邀请成员</text>
      </view>
    </view>
    
    <view class="members-content" v-else>
      <!-- 成员统计信息 -->
      <view class="members-stats">
        <view class="stat-item">
          <text class="stat-value">{{ teamMembers.length }}</text>
          <text class="stat-label">总成员</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ onlineCount }}</text>
          <text class="stat-label">在线</text>
        </view>
      </view>
      
      <!-- 成员管理操作栏 -->
      <view class="members-operation">
        <view class="operation-left">
          <view class="search-box">
            <input 
              type="text" 
              class="search-input" 
              placeholder="搜索成员" 
              v-model="searchKey"
              @input="filterMembers"
            />
          </view>
        </view>
        <view class="operation-right">
          <view class="invite-btn" @click="inviteMember" v-if="isCurrentUserLeader">
            <text class="invite-text">邀请成员</text>
          </view>
        </view>
      </view>
      
      <!-- 队长列表 -->
      <view class="member-section" v-if="leaderMembers.length > 0">
        <view class="section-header">
          <text>队长</text>
        </view>
        <view class="member-list">
          <view 
            class="member-item" 
            v-for="member in leaderMembers" 
            :key="member.userId"
            @click="viewMemberProfile(member)"
          >
            <view class="member-avatar">
              <image 
                class="avatar-image" 
                :src="member.avatar" 
                mode="aspectFill"
              ></image>
              <view class="online-status" :class="{ 'is-online': member.isOnline }"></view>
            </view>
            <view class="member-info">
              <view class="member-name-row">
                <text class="member-name">{{ member.userName }}</text>
                <text class="member-role">队长</text>
              </view>
              <view class="member-detail">
                <text class="member-major">{{ member.userMajor }}</text>
              </view>
            </view>
            <view class="member-actions"  v-if="member.userId!==currentUserId">
              <view class="action-btn" @click.stop="contactMember(member)">
                <text class="action-icon">✉</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 普通成员列表 -->
      <view class="member-section" v-if="normalMembers.length > 0">
        <view class="section-header">
          <text>团队成员</text>
        </view>
        <view class="member-list">
          <view 
            class="member-item" 
            v-for="member in normalMembers" 
            :key="member.userId"
            @click="viewMemberProfile(member)"
          >
            <view class="member-avatar">
              <image 
                class="avatar-image" 
                :src="member.avatar" 
                mode="aspectFill"
              ></image>
              <view class="online-status" :class="{ 'is-online': member.isOnline }"></view>
            </view>
            <view class="member-info">
              <view class="member-name-row">
                <text class="member-name">{{ member.userName }}</text>
                <text class="member-role">{{ member.roleName }}</text>
              </view>
              <view class="member-detail">
                <text class="member-major">{{ member.userMajor }}</text>
              </view>
            </view>
            <view class="member-actions" v-if="member.userId!==currentUserId">
              <view class="action-btn" @click.stop="contactMember(member)">
                <text class="action-icon">✉</text>
              </view>
              <view class="action-btn" @click.stop="showMemberOptions(member)" v-if="isCurrentUserLeader">
                <text class="action-icon">⋮</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
import api from '@/api';
import { navigateToUserProfile } from '@/utils/navigation';

const props = defineProps({
  teamId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['invite', 'contact', 'viewProfile']);

// 数据定义
const teamMembers = ref([]);
const searchKey = ref('');
const filteredMembers = ref([]);
const isCurrentUserLeader = ref(false);
const loading = ref(false);
const currentUserId = ref(''); // 当前用户ID

// 计算属性
const hasMembers = computed(() => {
  return teamMembers.value && teamMembers.value.length > 0;
});

const leaderMembers = computed(() => {
  return teamMembers.value.filter(member => member.isLeader);
});

const normalMembers = computed(() => {
  return teamMembers.value.filter(member => !member.isLeader);
});

const onlineCount = computed(() => {
  return teamMembers.value.filter(member => member.isOnline).length;
});

// 获取当前用户信息
async function getCurrentUserInfo() {
  try {
    const res = await api.user.getUserProfile();
    if (res && res.code === 200 && res.data) {
      currentUserId.value = res.data.id;
      console.log('获取到当前用户ID:', currentUserId.value);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}

// 获取用户在线状态
async function getUserOnlineStatus(userId) {
  try {
    const res = await api.user.getUserOnlineStatus(userId);
    if (res && res.code === 200) {
      return res.data; // 返回布尔值表示在线状态
    }
    return false; // 默认离线
  } catch (error) {
    console.error(`获取用户${userId}在线状态失败:`, error);
    return false; // 出错时默认为离线
  }
}

// 批量获取成员在线状态
async function getMembersOnlineStatus(members) {
  const onlineStatusPromises = members.map(member => 
    getUserOnlineStatus(member.userId).then(isOnline => {
      // 直接修改成员对象的isOnline属性
      member.isOnline = isOnline;
      return member;
    })
  );
  
  // 等待所有请求完成
  return Promise.all(onlineStatusPromises);
}

// 方法
async function loadMembers() {
  if (!props.teamId) {
    console.error('未提供团队ID，无法加载成员');
    return;
  }
  
  loading.value = true;
  
  try {
    const res = await api.team.getTeamMembers(props.teamId);
    
    if (res && res.code === 200 && res.data) {
      // 处理数据，转换接口返回的数据格式为组件使用的格式
      const formattedMembers = res.data.map(member => ({
        userId: member.userId,
        userName: member.userName,
        avatar: member.userAvatarUrl || '/static/image/default-avatar.png',
        isLeader: member.isLeader || false,
        roleName: member.roleName || '成员',
        userMajor: member.userMajor || '未设置专业',
        joinTime: new Date(),  // 假设API没有返回joinTime
        isOnline: false // 初始化为离线，后续更新
      }));
      
      // 先设置成员列表，显示基本信息
      teamMembers.value = formattedMembers;
      
      // 判断当前用户是否为队长
      isCurrentUserLeader.value = teamMembers.value.some(
        member => String(member.userId) === String(currentUserId.value) && member.isLeader
      );
      
      // 获取所有成员的在线状态
      await getMembersOnlineStatus(teamMembers.value);
      
      console.log('获取到团队成员列表(含在线状态):', teamMembers.value);
    } else {
      console.error('获取团队成员列表失败:', res);
      uni.showToast({
        title: res?.message || '获取成员列表失败',
        icon: 'none'
      });
      
      // 如果API调用失败，使用一些默认数据以便测试
      if (!teamMembers.value.length) {
        useMockData();
      }
    }
  } catch (error) {
    console.error('获取团队成员列表出错:', error);
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
    
    // 如果API调用失败，使用一些默认数据以便测试
    if (!teamMembers.value.length) {
      useMockData();
    }
  } finally {
    loading.value = false;
  }
}

// 使用模拟数据（仅在API调用失败时使用）
function useMockData() {
  console.log('使用模拟数据');
  const avatarMap = {
    '1001': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/675b261911764dd9bdf6ad7942fec558.png', // 我
    '1002': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png', // 张三
    '1003': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/ad929a51b8f243cfaf0792e0de963d08.png', // 李四
    '1004': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/797e26b7290049b3bf7d86594f275a12.png', // 王五
    '1005': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/871731a3efa5453fb4b2310f0bcefb97.png'  // 赵六
  };
  
  const now = new Date();
  
  teamMembers.value = [
    {
      userId: '1001',
      userName: '我',
      avatar: avatarMap['1001'],
      isLeader: false,
      roleName: '测试工程师',
      userMajor: '计算机科学',
      joinTime: new Date(now.getTime() - 3600000 * 24 * 30 * 3),
      isOnline: true
    },
    {
      userId: '1002',
      userName: '张三',
      avatar: avatarMap['1002'],
      isLeader: true,
      roleName: '项目经理',
      userMajor: '软件工程',
      joinTime: new Date(now.getTime() - 3600000 * 24 * 30 * 6),
      isOnline: true
    },
    {
      userId: '1003',
      userName: '李四',
      avatar: avatarMap['1003'],
      isLeader: false,
      roleName: 'UI设计师',
      userMajor: '视觉设计',
      joinTime: new Date(now.getTime() - 3600000 * 24 * 30 * 5),
      isOnline: false
    },
    {
      userId: '1004',
      userName: '王五',
      avatar: avatarMap['1004'],
      isLeader: false,
      roleName: '后端开发',
      userMajor: '软件工程',
      joinTime: new Date(now.getTime() - 3600000 * 24 * 30 * 4),
      isOnline: true
    },
    {
      userId: '1005',
      userName: '赵六',
      avatar: avatarMap['1005'],
      isLeader: false,
      roleName: '前端开发',
      userMajor: '计算机科学',
      joinTime: new Date(now.getTime() - 3600000 * 24 * 30 * 2),
      isOnline: false
    }
  ];
  
  // 判断当前用户是否为队长
  isCurrentUserLeader.value = teamMembers.value.some(
    member => String(member.userId) === String(currentUserId.value) && member.isLeader
  );
}

function filterMembers() {
  if (!searchKey.value.trim()) {
    filteredMembers.value = teamMembers.value;
    return;
  }
  
  const keyword = searchKey.value.toLowerCase();
  filteredMembers.value = teamMembers.value.filter(member => {
    return member.userName.toLowerCase().includes(keyword) || 
           member.roleName.toLowerCase().includes(keyword) ||
           member.userMajor.toLowerCase().includes(keyword);
  });
}

function inviteMember() {
  emit('invite');
}

function contactMember(member) {

  emit('contact', member);
}

function viewMemberProfile(member) {
  // 使用统一的导航工具函数
  navigateToUserProfile(member.userId, { 
    userName: member.userName,
    fromTeam: props.teamId
  });
}

function showMemberOptions(member) {
  uni.showActionSheet({
    itemList: ['修改角色', '移出团队'],
    success: function(res) {
      const index = res.tapIndex;
      if (index === 0) {
        changeRole(member);
      } else if (index === 1) {
        removeMember(member);
      }
    }
  });
}

function changeRole(member) {
  uni.showActionSheet({
    itemList: ['项目经理', 'UI设计师', '前端开发', '后端开发', '测试工程师'],
    success: function(res) {
      const roles = ['项目经理', 'UI设计师', '前端开发', '后端开发', '测试工程师'];
      const selectedRole = roles[res.tapIndex];
      
      uni.showToast({
        title: `已将${member.userName}角色修改为${selectedRole}`,
        icon: 'none'
      });
    }
  });
}

async function removeMember(member) {
  uni.showModal({
    title: '移出成员',
    content: `确定要将${member.userName}移出团队吗？`,
    success: async function(res) {
      if (res.confirm) {
        try {
          // 调用API移除成员
          const result = await api.team.removeTeamMember(props.teamId, member.userId);
          
          if (result && result.code === 200) {
            uni.showToast({
              title: `已将${member.userName}移出团队`,
              icon: 'success'
            });
            
            // 重新加载成员列表
            await loadMembers();
          } else {
            uni.showToast({
              title: result?.message || '移除成员失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('移除成员失败:', error);
          uni.showToast({
            title: '移除成员失败，请稍后重试',
            icon: 'none'
          });
        }
      }
    }
  });
}

function formatDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 初始化
onMounted(async () => {
  await getCurrentUserInfo();
  await loadMembers();
});
</script>

<style>
.members-container {
  padding: 20rpx 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.action-btn {
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #3498db;
  color: #ffffff;
}

.members-content {
  padding: 0 20rpx;
}

.members-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 20rpx 0;
  margin: 0 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.members-operation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.operation-left {
  flex: 1;
  margin-right: 20rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 20rpx;
}

.search-input {
  width: 100%;
  height: 70rpx;
  font-size: 28rpx;
}

.invite-btn {
  padding: 16rpx 30rpx;
  background-color: #3498db;
  border-radius: 40rpx;
}

.invite-text {
  font-size: 28rpx;
  color: #ffffff;
}

.member-section {
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-header text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.member-list {
  padding: 0 30rpx;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #cccccc;
  border: 2rpx solid #ffffff;
}

.online-status.is-online {
  background-color: #4caf50;
}

.member-info {
  flex: 1;
  overflow: hidden;
}

.member-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.member-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  margin-right: 16rpx;
}

.member-role {
  font-size: 24rpx;
  color: #666666;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.member-detail {
  display: flex;
  flex-direction: column;
}

.member-major, .member-join-time {
  font-size: 24rpx;
  color: #999999;
}

.member-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-icon {
  font-size: 36rpx;
  color: #666666;
}
</style> 