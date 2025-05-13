<template>
	<view class="container">
	  <!-- 顶部导航栏 -->
	  <HeaderBar 
	    title="我的团队" 
	    :showSearch="false" 
	    :showFilter="false"
	  >
	    <template #actions>
	      <view class="action-btn" @click="navigateToCreateTeam">
	        <SvgIcon name="plus" size="24" />
	      </view>
	    </template>
	  </HeaderBar>
	  
	  <!-- 内容区域 -->
	  <view class="content-container">
	    <!-- 加载中显示 -->
	    <view class="loading-container" v-if="loading">
		  <view class="loading-circle"></view>
		  <text class="loading-text">加载中...</text>
	    </view>
	  
	    <!-- 团队列表内容 -->
	    <scroll-view 
		  scroll-y 
		  class="content-scroll" 
		  v-else
		  refresher-enabled
		  :refresher-triggered="refreshing"
		  @refresherrefresh="refreshTeams"
	    >
		<!-- 状态标签 -->
		<scroll-view scroll-x class="status-tabs">
		  <view class="tabs-container">
			<view 
			  class="tab-item" 
			  :class="{'active': activeTab === 'all'}"
			  @click="setActiveTab('all')"
			>
			  <text>全部</text>
			</view>
			<view 
			  class="tab-item" 
			  :class="{'active': activeTab === 'leader'}"
			  @click="setActiveTab('leader')"
			>
			  <text>我创建的</text>
			</view>
			<view 
			  class="tab-item" 
			  :class="{'active': activeTab === 'member'}"
			  @click="setActiveTab('member')"
			>
			  <text>我参与的</text>
			</view>
		  </view>
		</scroll-view>
		
		<!-- 搜索框 -->
		<view class="search-container">
		  <view class="search-box">
			<SvgIcon name="search" size="16" class="search-icon"></SvgIcon>
			<input 
			  type="text" 
			  class="search-input" 
			  placeholder="搜索团队名称" 
			  v-model="searchKeyword"
			  @input="handleSearch"
			/>
			<view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
			  <SvgIcon name="x" size="16"></SvgIcon>
			</view>
		  </view>
		</view>
		
		<!-- 团队列表 -->
		<view class="team-list" v-if="filteredTeams && filteredTeams.length > 0">
		  <view 
			class="team-card" 
			v-for="(team, index) in filteredTeams" 
			:key="index"
			@click="navigateToTeamDetail(team.id)"
		  >
			<view class="team-header">
			  <view class="team-title-row">
                <text class="team-name">{{ team.name }}</text>
                <view class="team-status" :class="getStatusClass(team.status)">
                  <text>{{ team.statusText }}</text>
                </view>
              </view>
              
              <view class="team-info-row">
                <view class="team-role" :class="{'leader': team.roleType === 'leader'}">
                  <text>{{ team.roleType === 'leader' ? '队长' : '队员' }}</text>
                </view>
                <view class="team-members">
                  <SvgIcon name="users" size="14"></SvgIcon>
                  <text>{{ team.memberCount }}人</text>
                </view>
                <view class="team-created">
                  <SvgIcon name="calendar" size="14"></SvgIcon>
                  <text>{{ formatDate(team.publishDate) }}创建</text>
                </view>
              </view>
              
              <view class="my-role" v-if="team.roleName">
                <SvgIcon name="user-check" size="14"></SvgIcon>
                <text>我的角色: {{ team.roleName }}</text>
              </view>
			</view>
			
			<view class="team-body">
			  <view class="team-description" v-if="team.description">
				<text>{{ team.description }}</text>
			  </view>
			  
			  <view class="team-competitions" v-if="team.competitionId">
				<view class="competitions-label">
				  <text>参与竞赛</text>
				  <text class="competitions-count">(1)</text>
				</view>
				<view class="competitions-list">
				  <view class="competition-item">
					<view class="competition-status"></view>
					<text class="competition-name">{{ team.competitionName }}</text>
				  </view>
				</view>
			  </view>
			  
			  <view class="team-members-preview" v-if="team.teamRoles && team.teamRoles.length > 0">
				<view class="members-label">
				  <text>招募岗位</text>
				  <text class="members-count">({{ team.teamRoles.length }})</text>
				</view>
				<view class="members-roles">
				  <view 
					class="role-item" 
					v-for="(role, rIndex) in team.teamRoles" 
					:key="rIndex"
				  >
					<view class="role-header">
					  <text class="role-name">{{ role.name }}</text>
					  <text class="role-progress">{{ role.currentCount }}/{{ role.requiredCount }}</text>
					</view>
					<view class="role-progress-bar">
					  <view class="role-progress-fill" :style="{ width: role.progress + '%' }"></view>
					</view>
				  </view>
				</view>
			  </view>
			  
			  <view class="team-actions">
				<view 
				  class="action-btn primary" 
				  v-if="team.roleType === 'leader'"
				  @click.stop="navigateToManageTeam(team.id)"
				>
				  <SvgIcon name="settings" size="16"></SvgIcon>
				  <text>管理团队</text>
				</view>
				<view 
				  class="action-btn primary" 
				  v-else-if="team.status === '0'"
				  @click.stop="navigateToTeamDetail(team.id)"
				>
				  <SvgIcon name="info" size="16"></SvgIcon>
				  <text>查看详情</text>
				</view>
				<view 
				  class="action-btn primary" 
				  v-else
				  @click.stop="navigateToTeamDetail(team.id)"
				>
				  <SvgIcon name="message-square" size="16"></SvgIcon>
				  <text>团队交流</text>
				</view>
				
				<view 
				  class="action-btn secondary" 
				  v-if="team.roleType === 'leader' && team.status !== '2'"
				  @click.stop="showDismissConfirm(team)"
				>
				  <SvgIcon name="trash-2" size="16"></SvgIcon>
				  <text>解散团队</text>
				</view>
				<view 
				  class="action-btn secondary" 
				  v-else-if="team.roleType !== 'leader' && team.status !== '2'"
				  @click.stop="showLeaveConfirm(team)"
				>
				  <SvgIcon name="log-out" size="16"></SvgIcon>
				  <text>退出团队</text>
				</view>
				<view 
				  class="action-btn secondary" 
				  v-else
				  @click.stop="deleteTeamRecord(team.id)"
				>
				  <SvgIcon name="trash" size="16"></SvgIcon>
				  <text>删除记录</text>
				</view>
			  </view>
			</view>
		  </view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-else>
		  <image class="empty-image" src="/static/image/empty-teams.png" mode="aspectFit"></image>
		  <text class="empty-text">{{ getEmptyStateText() }}</text>
		  <view class="action-btn primary" @click="navigateToCreateTeam">
			<text>创建新团队</text>
		  </view>
		</view>
		
		<!-- 底部提示 -->
		<view class="bottom-tip" v-if="filteredTeams && filteredTeams.length > 0">
		  <text>没有更多团队了</text>
		</view>
	    </scroll-view>
	  </view>
	  
	  <!-- 解散团队确认弹窗 -->
	  <view class="confirm-modal" v-if="showDismissModal" @click="closeDismissModal">
		<view class="confirm-content" @click.stop>
		  <view class="confirm-header">
			<text class="confirm-title">解散团队</text>
		  </view>
		  <view class="confirm-body">
			<text class="confirm-message">确定要解散"{{ dismissTeam.name }}"团队吗？解散后所有队员将被移出，且无法恢复。</text>
		  </view>
		  <view class="confirm-actions">
			<view class="confirm-btn cancel" @click="closeDismissModal">
			  <text>取消</text>
			</view>
			<view class="confirm-btn confirm" @click="confirmDismissTeam">
			  <text>确定解散</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <!-- 退出团队确认弹窗 -->
	  <view class="confirm-modal" v-if="showLeaveModal" @click="closeLeaveModal">
		<view class="confirm-content" @click.stop>
		  <view class="confirm-header">
			<text class="confirm-title">退出团队</text>
		  </view>
		  <view class="confirm-body">
			<text class="confirm-message">确定要退出"{{ leaveTeam.name }}"团队吗？退出后需要重新申请加入。</text>
		  </view>
		  <view class="confirm-actions">
			<view class="confirm-btn cancel" @click="closeLeaveModal">
			  <text>取消</text>
			</view>
			<view class="confirm-btn confirm" @click="confirmLeaveTeam">
			  <text>确定退出</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <!-- 创建团队浮动按钮 -->
	  <view class="float-action-btn" @click="navigateToCreateTeam">
		<SvgIcon name="plus" size="24" color="#ffffff"></SvgIcon>
	  </view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import HeaderBar from '@/components/HeaderBar.vue';

// 加载状态
const loading = ref(true);
// 刷新状态
const refreshing = ref(false);
// 当前选中的标签
const activeTab = ref('all');
// 搜索关键词
const searchKeyword = ref('');
// 团队列表
const myTeams = ref([]);
// 解散团队相关
const showDismissModal = ref(false);
const dismissTeam = ref({});
// 退出团队相关
const showLeaveModal = ref(false);
const leaveTeam = ref({});

// 根据标签和搜索过滤团队
const filteredTeams = computed(() => {
	if (!myTeams.value) return [];
	
	let result = myTeams.value;
	
	// 根据标签筛选
	if (activeTab.value === 'leader') {
	  result = result.filter(team => team.roleType === 'leader');
	} else if (activeTab.value === 'member') {
	  result = result.filter(team => team.roleType !== 'leader');
	}
	
	// 根据搜索关键词筛选
	if (searchKeyword.value) {
	  const keyword = searchKeyword.value.toLowerCase();
	  result = result.filter(team => 
		team.name.toLowerCase().includes(keyword) || 
		team.description?.toLowerCase().includes(keyword)
	  );
	}
	
	return result;
});

// 获取我的团队列表
async function getMyTeams() {
	try {
	  loading.value = true;
	  
	  // 这里应该调用API获取我的团队列表
	  // const res = await teamApi.getMyTeams();
	  
	  // 模拟数据
	  setTimeout(() => {
		myTeams.value = [
		  {
			id: 1,
			name: "代码先锋队",
			leaderAvatarUrl: "/static/image/avatar/user1.jpg",
			description: "专注于算法竞赛和程序设计，追求技术卓越",
			competitionId: 1,
			competitionName: "第16届全国大学生程序设计竞赛",
			leaderId: 1,
			leaderName: "张三",
			roleType: "leader",
			roleName: "队长",
			roleId: 1,
			direction: "编程开发",
			status: "0",
			statusText: "招募中",
			recruitmentDeadline: "2024-08-10T23:59:59",
			publishDate: "2024-01-15T10:00:00",
			memberCount: 3,
			teamRoles: [
			  {
				id: 1,
				name: "算法工程师",
				requiredCount: 3,
				currentCount: 2,
				progress: 66,
				description: "负责核心算法开发"
			  },
			  {
				id: 2,
				name: "前端开发",
				requiredCount: 2,
				currentCount: 1,
				progress: 50,
				description: "负责用户界面实现"
			  }
			]
		  },
		  {
			id: 2,
			name: "创新先锋队",
			leaderAvatarUrl: "/static/image/avatar/user4.jpg",
			description: "致力于创新创业项目，结合商业模式与技术实现",
			competitionId: 2,
			competitionName: "2024年互联网+创新创业大赛",
			leaderId: 4,
			leaderName: "赵六",
			roleType: "member",
			roleName: "后端开发",
			roleId: 5,
			direction: "商业创新",
			status: "1",
			statusText: "已满员",
			recruitmentDeadline: "2024-06-15T23:59:59",
			publishDate: "2024-02-20T14:30:00",
			memberCount: 4,
			teamRoles: [
			  {
				id: 3,
				name: "产品经理",
				requiredCount: 1,
				currentCount: 1,
				progress: 100,
				description: "负责产品规划与设计"
			  },
			  {
				id: 4,
				name: "UI设计师",
				requiredCount: 1,
				currentCount: 1,
				progress: 100,
				description: "负责界面视觉设计"
			  },
			  {
				id: 5,
				name: "后端开发",
				requiredCount: 2,
				currentCount: 2,
				progress: 100,
				description: "负责服务端开发"
			  }
			]
		  },
		  {
			id: 3,
			name: "AI创新团队",
			leaderAvatarUrl: "/static/image/avatar/user1.jpg",
			description: "专注于人工智能技术研究与应用创新",
			competitionId: 3,
			competitionName: "第5届人工智能应用创新大赛",
			leaderId: 1,
			leaderName: "张三",
			roleType: "leader",
			roleName: "队长",
			roleId: 6,
			direction: "人工智能",
			status: "0",
			statusText: "招募中",
			recruitmentDeadline: "2024-07-30T23:59:59",
			publishDate: "2024-03-10T09:15:00",
			memberCount: 3,
			teamRoles: [
			  {
				id: 6,
				name: "算法工程师",
				requiredCount: 2,
				currentCount: 1,
				progress: 50,
				description: "负责AI算法设计与实现"
			  },
			  {
				id: 7,
				name: "数据分析师",
				requiredCount: 2,
				currentCount: 1,
				progress: 50,
				description: "负责数据清洗与分析"
			  },
			  {
				id: 8,
				name: "前端开发",
				requiredCount: 1,
				currentCount: 1,
				progress: 100,
				description: "负责用户界面开发"
			  }
			]
		  }
		];
		
		loading.value = false;
		refreshing.value = false;
	  }, 800);
	} catch (error) {
	  console.error('获取我的团队列表失败:', error);
	  uni.showToast({
		title: '获取团队列表失败',
		icon: 'none'
	  });
	  loading.value = false;
	  refreshing.value = false;
	}
}

// 刷新团队列表
function refreshTeams() {
	refreshing.value = true;
	getMyTeams();
}

// 设置当前标签
function setActiveTab(tab) {
	activeTab.value = tab;
}

// 处理搜索
function handleSearch() {
	// 搜索逻辑已在计算属性中实现
}

// 清除搜索
function clearSearch() {
	searchKeyword.value = '';
}

// 获取团队首字母
function getTeamInitials(name) {
	if (!name) return '';
	return name.substring(0, 2);
}

// 格式化日期
function formatDate(dateString) {
	if (!dateString) return '';
	
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
}

// 获取状态样式类
function getStatusClass(status) {
	const classMap = {
	  'active': 'status-active',
	  'recruiting': 'status-recruiting',
	  'competing': 'status-competing',
	  'dismissed': 'status-dismissed',
	  // 添加新的数字状态映射
	  '0': 'status-recruiting',  // 招募中
	  '1': 'status-active',      // 已满员/活跃
	  '2': 'status-dismissed',   // 已解散
	  '3': 'status-competing'    // 比赛中
	};
	
	return classMap[status] || '';
}

// 获取状态文本
function getStatusText(status) {
	const textMap = {
	  'active': '活跃',
	  'recruiting': '招募中',
	  'competing': '比赛中',
	  'dismissed': '已解散'
	};
	
	return textMap[status] || '';
}

// 获取竞赛状态样式类
function getCompetitionStatusClass(status) {
	const classMap = {
	  'upcoming': 'status-upcoming',
	  'ongoing': 'status-ongoing',
	  'completed': 'status-completed'
	};
	
	return classMap[status] || '';
}

// 获取空状态文本
function getEmptyStateText() {
	if (searchKeyword.value) {
	  return '没有找到匹配的团队';
	}
	
	if (activeTab.value === 'leader') {
	  return '你还没有创建过团队';
	} else if (activeTab.value === 'member') {
	  return '你还没有加入任何团队';
	}
	
	return '你还没有参与任何团队';
}

// 跳转到团队详情
function navigateToTeamDetail(id) {
	uni.navigateTo({
	  url: `/pages/team/detail?id=${id}`
	});
}

// 跳转到团队管理
function navigateToManageTeam(id) {
	uni.navigateTo({
	  url: `/pages/team/manage?id=${id}`
	});
}

// 跳转到创建团队
function navigateToCreateTeam() {
	uni.navigateTo({
	  url: '/pages/team/create'
	});
}

// 显示解散团队确认弹窗
function showDismissConfirm(team) {
	dismissTeam.value = team;
	showDismissModal.value = true;
}

// 关闭解散团队确认弹窗
function closeDismissModal() {
	showDismissModal.value = false;
}

// 确认解散团队
function confirmDismissTeam() {
	// 这里应该调用API解散团队
	uni.showLoading({
	  title: '处理中...'
	});
	
	setTimeout(() => {
	  // 更新团队状态
	  const index = myTeams.value.findIndex(team => team.id === dismissTeam.value.id);
	  if (index !== -1) {
		myTeams.value[index].status = '2';
		myTeams.value[index].statusText = '已解散';
	  }
	  
	  uni.hideLoading();
	  uni.showToast({
		title: '团队已解散',
		icon: 'success'
	  });
	  
	  closeDismissModal();
	}, 1500);
}

// 显示退出团队确认弹窗
function showLeaveConfirm(team) {
	leaveTeam.value = team;
	showLeaveModal.value = true;
}

// 关闭退出团队确认弹窗
function closeLeaveModal() {
	showLeaveModal.value = false;
}

// 确认退出团队
function confirmLeaveTeam() {
	// 这里应该调用API退出团队
	uni.showLoading({
	  title: '处理中...'
	});
	
	setTimeout(() => {
	  // 从列表中移除该团队
	  myTeams.value = myTeams.value.filter(team => team.id !== leaveTeam.value.id);
	  
	  uni.hideLoading();
	  uni.showToast({
		title: '已退出团队',
		icon: 'success'
	  });
	  
	  closeLeaveModal();
	}, 1500);
}

// 删除团队记录
function deleteTeamRecord(id) {
	// 这里应该调用API删除团队记录
	uni.showModal({
	  title: '删除记录',
	  content: '确定要删除该团队记录吗？',
	  success: (res) => {
		if (res.confirm) {
		  uni.showLoading({
			title: '删除中...'
		  });
		  
		  setTimeout(() => {
			// 从列表中移除该团队
			myTeams.value = myTeams.value.filter(team => team.id !== id);
			
			uni.hideLoading();
			uni.showToast({
			  title: '记录已删除',
			  icon: 'success'
			});
		  }, 1500);
		}
	  }
	});
}



// 页面加载时获取团队列表
onMounted(() => {
	getMyTeams();
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
$divider-color: #E5E7EB;

// 状态颜色
$active-color: #10B981;
$recruiting-color: #F59E0B;
$competing-color: #8B5CF6;
$dismissed-color: #6B7280;

// 竞赛状态颜色
$ongoing-color: #10B981;
$upcoming-color: #F59E0B;
$completed-color: #6B7280;

page {
	background-color: $background-color;
}

.container {
	display: flex;
	flex-direction: column;
	font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
	position: relative;
	height: 100vh;
}

.content-container {
	padding-top: 140rpx; /* 预留HeaderBar高度 */
	flex: 1;
	display: flex;
	flex-direction: column;
}

// 加载中
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	
	.loading-circle {
	  width: 80rpx;
	  height: 80rpx;
	  border-radius: 50%;
	  border: 6rpx solid rgba($primary-color, 0.1);
	  border-top-color: $primary-color;
	  animation: spin 1s linear infinite;
	  margin-bottom: 20rpx;
	}
	
	.loading-text {
	  font-size: 28rpx;
	  color: $text-secondary;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

// 内容区域
.content-scroll {
	flex: 1;
	padding-bottom: 30rpx;
}

// 状态标签
.status-tabs {
	background-color: $card-color;
	padding: 20rpx 0;
	white-space: nowrap;
	
	.tabs-container {
	  display: inline-flex;
	  padding: 0 30rpx;
	  
	  .tab-item {
		display: inline-flex;
		align-items: center;
		padding: 12rpx 30rpx;
		margin-right: 20rpx;
		border-radius: 30rpx;
		background-color: $background-color;
		transition: all 0.3s;
		
		text {
		  font-size: 26rpx;
		  color: $text-secondary;
		}
		
		&.active {
		  background-color: rgba($primary-color, 0.1);
		  
		  text {
			color: $primary-color;
			font-weight: 500;
		  }
		}
	  }
	}
}

// 搜索框
.search-container {
	padding: 20rpx 30rpx;
	background-color: $card-color;
	
	.search-box {
	  display: flex;
	  align-items: center;
	  height: 70rpx;
	  background-color: $background-color;
	  border-radius: 35rpx;
	  padding: 0 20rpx;
	  
	  .search-icon {
		color: $text-secondary;
		margin-right: 10rpx;
	  }
	  
	  .search-input {
		flex: 1;
		height: 100%;
		font-size: 26rpx;
		color: $text-color;
	  }
	  
	  .clear-btn {
		padding: 10rpx;
		
		.iconfont {
		  font-size: 24rpx;
		  color: $text-secondary;
		}
	  }
	}
}

// 团队列表
.team-list {
	padding: 20rpx;
	
	.team-card {
	  background-color: $card-color;
	  border-radius: 16rpx;
	  margin-bottom: 20rpx;
	  overflow: hidden;
	  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	  
	  .team-header {
		padding: 20rpx;
		border-bottom: 1rpx solid $border-color;
        
        .team-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16rpx;
          
          .team-name {
            font-size: 34rpx;
            font-weight: bold;
            color: $text-color;
          }
        }
        
        .team-info-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 12rpx;
          
          .team-role {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            background-color: $text-secondary;
            margin-right: 16rpx;
            
            text {
              font-size: 22rpx;
              color: white;
            }
            
            &.leader {
              background-color: $primary-color;
            }
          }
          
          .team-members, .team-created {
            display: flex;
            align-items: center;
            margin-right: 20rpx;
            
            text {
              font-size: 26rpx;
              color: $text-secondary;
              margin-left: 6rpx;
            }
          }
        }
        
        .my-role {
          display: flex;
          align-items: center;
          padding: 6rpx 16rpx;
          background-color: rgba($primary-color, 0.1);
          border-radius: 20rpx;
          width: fit-content;
          
          text {
            font-size: 26rpx;
            color: $primary-color;
            margin-left: 8rpx;
            font-weight: 500;
          }
        }
		
		.team-status {
		  padding: 4rpx 16rpx;
		  border-radius: 20rpx;
		  height: fit-content;
		  
		  text {
			font-size: 22rpx;
			color: white;
		  }
		  
		  &.status-active {
			background-color: $active-color;
		  }
		  
		  &.status-recruiting {
			background-color: $recruiting-color;
		  }
		  
		  &.status-competing {
			background-color: $competing-color;
		  }
		  
		  &.status-dismissed {
			background-color: $dismissed-color;
		  }
		}
	  }
	  
	  .team-body {
		padding: 20rpx;
		
		.team-description {
		  margin-bottom: 20rpx;
		  
		  text {
			font-size: 26rpx;
			color: $text-secondary;
			line-height: 1.5;
		  }
		}
		
		.team-competitions {
		  margin-bottom: 20rpx;
		  
		  .competitions-label {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;
			
			text {
			  font-size: 26rpx;
			  font-weight: 500;
			  color: $text-color;
			}
			
			.competitions-count {
			  font-size: 24rpx;
			  color: $text-secondary;
			  font-weight: normal;
			  margin-left: 6rpx;
			}
		  }
		  
		  .competitions-list {
			.competition-item {
			  display: flex;
			  align-items: center;
			  margin-bottom: 10rpx;
			  
			  .competition-status {
				width: 12rpx;
				height: 12rpx;
				border-radius: 6rpx;
				margin-right: 10rpx;
				
				&.status-ongoing {
				  background-color: $ongoing-color;
				}
				
				&.status-upcoming {
				  background-color: $upcoming-color;
				}
				
				&.status-completed {
				  background-color: $completed-color;
				}
			  }
			  
			  .competition-name {
				font-size: 26rpx;
				color: $text-color;
			  }
			}
			
			.more-competitions {
			  margin-top: 6rpx;
			  
			  text {
				font-size: 24rpx;
				color: $text-secondary;
			  }
			}
		  }
		}
		
		.team-members-preview {
		  margin-bottom: 20rpx;
		  
		  .members-label {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;
			
			text {
			  font-size: 26rpx;
			  font-weight: 500;
			  color: $text-color;
			}
			
			.members-count {
			  font-size: 24rpx;
			  color: $text-secondary;
			  font-weight: normal;
			  margin-left: 6rpx;
			}
		  }
		  
		  .members-roles {
			display: flex;
			flex-wrap: wrap;
			
			.role-item {
			  position: relative;
			  margin-right: 16rpx;
			  margin-bottom: 10rpx;
			  width: 100%;
			  
			  .role-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 6rpx;
				
				.role-name {
				  font-size: 26rpx;
				  font-weight: 500;
				  color: $text-color;
				}
				
				.role-progress {
				  font-size: 24rpx;
				  color: $text-secondary;
				  font-weight: normal;
				}
			  }
			  
			  .role-progress-bar {
				height: 6rpx;
				background-color: $background-color;
				border-radius: 3rpx;
				overflow: hidden;
				
				.role-progress-fill {
				  height: 100%;
				  background-color: $primary-color;
				  border-radius: 3rpx;
				}
			  }
			}
		  }
		}
		
		.team-actions {
		  display: flex;
		  gap: 16rpx;
		  
		  .action-btn {
			flex: 1;
			height: 70rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 35rpx;
			
			.iconfont {
			  font-size: 28rpx;
			  margin-right: 8rpx;
			}
			
			text {
			  font-size: 26rpx;
			}
			
			&.primary {
			  background-color: $primary-color;
			  
			  .iconfont, text {
				color: white;
			  }
			}
			
			&.secondary {
			  background-color: $background-color;
			  border: 1rpx solid $border-color;
			  
			  .iconfont, text {
				color: $text-secondary;
			  }
			}
		  }
		}
	  }
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 0;
	
	.empty-image {
	  width: 200rpx;
	  height: 200rpx;
	  margin-bottom: 20rpx;
	  opacity: 0.6;
	}
	
	.empty-text {
	  font-size: 28rpx;
	  color: $text-muted;
	  margin-bottom: 30rpx;
	}
	
	.action-btn {
	  padding: 16rpx 40rpx;
	  border-radius: 40rpx;
	  background-color: $primary-color;
	  
	  text {
		font-size: 26rpx;
		color: white;
	  }
	}
}

// 底部提示
.bottom-tip {
	text-align: center;
	padding: 30rpx 0;
	
	text {
	  font-size: 24rpx;
	  color: $text-muted;
	}
}

// 确认弹窗
.confirm-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: center;
	
	.confirm-content {
	  width: 80%;
	  background-color: $card-color;
	  border-radius: 16rpx;
	  overflow: hidden;
	  
	  .confirm-header {
		padding: 30rpx;
		text-align: center;
		border-bottom: 1rpx solid $border-color;
		
		.confirm-title {
		  font-size: 32rpx;
		  font-weight: bold;
		  color: $text-color;
		}
	  }
	  
	  .confirm-body {
		padding: 40rpx 30rpx;
		
		.confirm-message {
		  font-size: 28rpx;
		  color: $text-color;
		  line-height: 1.5;
		  text-align: center;
		}
	  }
	  
	  .confirm-actions {
		display: flex;
		border-top: 1rpx solid $border-color;
		
		.confirm-btn {
		  flex: 1;
		  height: 100rpx;
		  display: flex;
		  justify-content: center;
		  align-items: center;
		  
		  text {
			font-size: 28rpx;
		  }
		  
		  &.cancel {
			border-right: 1rpx solid $border-color;
			
			text {
			  color: $text-secondary;
			}
		  }
		  
		  &.confirm {
			text {
			  color: $primary-color;
			  font-weight: 500;
			}
		  }
		}
	  }
	}
}

// 浮动按钮
.float-action-btn {
	position: fixed;
	right: 30rpx;
	bottom: 50rpx;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: $primary-color;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.4);
	z-index: 90;
}
</style>