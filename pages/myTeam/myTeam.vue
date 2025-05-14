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
				  @click.stop="showManageTeamModal(team)"
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
		<SvgIcon name="chuangjiantubiao" size="24" color="#ffffff"></SvgIcon>
	  </view>
	  
	  <!-- 团队管理模态框 -->
	  <view class="manage-modal" v-if="showManageModal" @click="closeManageModal">
		<view class="manage-content" @click.stop>
		  <view class="manage-header">
			<text class="manage-title">团队管理</text>
		  </view>
		  <view class="manage-body">
			<view class="manage-tab-container">
			  <view 
				class="manage-tab-item" 
				:class="{'active': manageActiveTab === 'members'}"
				@click="setManageTab('members')"
			  >
				<text>成员管理</text>
			  </view>
			  <view 
				class="manage-tab-item" 
				:class="{'active': manageActiveTab === 'roles'}"
				@click="setManageTab('roles')"
			  >
				<text>角色管理</text>
			  </view>
			  <view 
				class="manage-tab-item" 
				:class="{'active': manageActiveTab === 'info'}"
				@click="setManageTab('info')"
			  >
				<text>团队信息</text>
			  </view>
			</view>
			
			<div class="manage-content-container">
			  <div class="manage-content-item" v-if="manageActiveTab === 'members'">
				<!-- 加载中显示 -->
				<view class="loading-container" v-if="loadingMembers">
				  <view class="loading-circle"></view>
				  <text class="loading-text">加载成员中...</text>
				</view>
				
				<!-- 成员列表 -->
				<view class="members-list" v-else-if="teamMembers && teamMembers.length > 0">
				  <view class="member-item" v-for="(member, index) in teamMembers" :key="index">
					<view class="member-avatar-container">
					  <image class="member-avatar" :src="member.avatar"></image>
					  <view :class="['member-status', `status-${member.status}`]"></view>
					</view>
					<view class="member-info">
					  <view class="member-name-row">
						<text class="member-name">{{ member.userName }}</text>
						<view class="member-role-badge">{{ member.role }}</view>
					  </view>
					  <view class="member-date">
						<text class="info-label">专业:</text>
						<text class="info-text">{{ member.userMajor || '未设置' }}</text>
					  </view>
					  <view class="member-date">
						<text class="info-label">加入时间:</text>
						<text class="info-text">{{ member.joinDate }}</text>
					  </view>
					</view>
					<view class="member-actions">
					  <view class="member-action-btn" v-if="!member.isLeader" @click.stop="showRemoveMemberConfirm(member)">
						<SvgIcon name="yichu" size="16"></SvgIcon>
						<text>移除</text>
					  </view>
					  <view class="member-action-btn" v-if="!member.isLeader">
						<SvgIcon name="bianji" size="16"></SvgIcon>
						<text>编辑角色</text>
					  </view>
					</view>
				  </view>
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-else>
				  <text class="empty-text">该团队暂无成员</text>
				</view>
				
				<view class="members-actions">
				  <view class="action-btn primary">
					<SvgIcon name="user-plus" size="16"></SvgIcon>
					<text>邀请成员</text>
				  </view>
				  <view class="action-btn secondary">
					<SvgIcon name="mail" size="16"></SvgIcon>
					<text>查看申请</text>
				  </view>
				</view>
			  </div>
			  <div class="manage-content-item" v-if="manageActiveTab === 'roles'">
				<!-- 加载中显示 -->
				<view class="loading-container" v-if="loadingRoles">
				  <view class="loading-circle"></view>
				  <text class="loading-text">加载角色中...</text>
				</view>
				
				<!-- 角色列表 -->
				<view class="roles-list" v-else-if="teamRoles && teamRoles.length > 0">
				  <view class="role-item" v-for="role in teamRoles" :key="role.id">
					<view class="role-header">
					  <view class="role-title-container">
						<text class="role-title">{{ role.name }}</text>
						<text class="role-count">{{ role.currentCount }}/{{ role.requiredCount }}</text>
					  </view>
					  <view class="role-actions">
						<view class="role-action-btn" @click="openEditRoleForm(role)">
						  <SvgIcon name="bianji" size="16"></SvgIcon>
						</view>
						<view class="role-action-btn" @click="showDeleteRoleConfirm(role)">
						  <SvgIcon name="yichu" size="16"></SvgIcon>
						</view>
					  </view>
					</view>
					<view class="role-progress-container">
					  <view class="role-progress-bar">
						<view class="role-progress-fill" :style="{ width: role.progress + '%' }"></view>
					  </view>
					</view>
					<view class="role-description">
					  <text>{{ role.description }}</text>
					</view>
					<view class="role-skills" v-if="role.skillRequirements && role.skillRequirements.length > 0">
					  <text class="skills-label">技能要求:</text>
					  <view class="skills-tags">
						<text class="skill-tag" v-for="(skill, sIndex) in role.skillRequirements" :key="sIndex">
						  {{ skill }}
						</text>
				  </view>
				</view>
				  </view>
				</view>
				
				<!-- 空状态 -->
				<view class="empty-state" v-else>
				  <text class="empty-text">该团队暂无角色定义</text>
				</view>
				
				<view class="roles-actions">
				  <view class="action-btn primary" @click="openAddRoleForm">
					<SvgIcon name="plus" size="16"></SvgIcon>
					<text>添加角色</text>
				  </view>
				</view>
			  </div>
			  <div class="manage-content-item" v-if="manageActiveTab === 'info'">
				<!-- 加载中显示 -->
				<view class="loading-container" v-if="loadingTeamInfo">
				  <view class="loading-circle"></view>
				  <text class="loading-text">加载团队信息中...</text>
				</view>
				
				<!-- 团队信息表单 -->
				<view class="team-info-form" v-else>
				  <view class="form-group">
					<text class="form-label">团队名称 <text class="required">*</text></text>
					<input type="text" class="form-input" v-model="teamInfoForm.name" placeholder="请输入团队名称" />
				  </view>
				  <view class="form-group">
					<text class="form-label">团队简介</text>
					<textarea class="form-textarea" v-model="teamInfoForm.description" placeholder="请输入团队简介"></textarea>
				  </view>
				  <view class="form-group">
					<text class="form-label">研究方向</text>
					<input type="text" class="form-input" v-model="teamInfoForm.direction" placeholder="请输入研究方向" />
				  </view>
				  <view class="form-group">
					<text class="form-label">招募截止日期</text>
					<picker 
					  mode="date" 
					  :value="teamInfoForm.recruitmentDeadline ? teamInfoForm.recruitmentDeadline.split('T')[0] : ''"
					  start="2024-01-01" 
					  end="2030-12-31" 
					  @change="handleDateChange"
					>
					  <view class="uni-input form-input">{{ teamInfoForm.recruitmentDeadline ? teamInfoForm.recruitmentDeadline.split('T')[0] : '请选择招募截止日期' }}</view>
					</picker>
				  </view>
				  <view class="form-group">
					<text class="form-label">联系信息</text>
					<view class="contact-container">
					  <view class="contact-item">
						<text class="contact-label">电话</text>
						<input 
						  type="text" 
						  class="form-input" 
						  v-model="teamInfoForm.contactInfo.phone" 
						  placeholder="请输入联系电话"
						/>
					  </view>
					  <view class="contact-item">
						<text class="contact-label">QQ</text>
						<input 
						  type="text" 
						  class="form-input" 
						  v-model="teamInfoForm.contactInfo.qq" 
						  placeholder="请输入QQ号码"
						/>
					  </view>
					  <view class="contact-item">
						<text class="contact-label">微信</text>
						<input 
						  type="text" 
						  class="form-input" 
						  v-model="teamInfoForm.contactInfo.wechat" 
						  placeholder="请输入微信号"
						/>
					  </view>
					</view>
				  </view>
				</view>
				<view class="team-info-actions">
				  <view class="action-btn primary" @click="submitTeamInfo">
					<SvgIcon name="save" size="16"></SvgIcon>
					<text>保存更改</text>
				  </view>
				</view>
			  </div>
			</div>
		  </view>
		</view>
	  </view>
	  
	  <!-- 移除成员确认弹窗 -->
	  <view class="confirm-modal" v-if="showRemoveMemberModal" @click="closeRemoveMemberModal">
		<view class="confirm-content" @click.stop>
		  <view class="confirm-header">
			<text class="confirm-title">移除成员</text>
		  </view>
		  <view class="confirm-body">
			<text class="confirm-message">确定要将"{{ removeMember.userName }}"从团队中移除吗？移除后需要重新申请加入。</text>
		  </view>
		  <view class="confirm-actions">
			<view class="confirm-btn cancel" @click="closeRemoveMemberModal">
			  <text>取消</text>
			</view>
			<view class="confirm-btn confirm" @click="confirmRemoveMember">
			  <text>确定移除</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <!-- 角色表单模态框 -->
	  <view class="confirm-modal" v-if="showRoleFormModal" @click="closeRoleForm">
		<view class="role-form-content" @click.stop>
		  <view class="role-form-header">
			<text class="role-form-title">{{ roleFormMode === 'add' ? '添加角色' : '编辑角色' }}</text>
		  </view>
		  <view class="role-form-body">
			<view class="form-group">
			  <text class="form-label">角色名称 <text class="required">*</text></text>
			  <input type="text" class="form-input" v-model="roleForm.name" placeholder="如：前端开发" />
			</view>
			
			<view class="form-group">
			  <text class="form-label">需求人数 <text class="required">*</text></text>
			  <input type="number" class="form-input" v-model="roleForm.requiredCount" placeholder="请输入需求人数" />
			</view>
			
			<view class="form-group">
			  <text class="form-label">角色描述</text>
			  <textarea class="form-textarea" v-model="roleForm.description" placeholder="请输入角色职责描述" />
			</view>
			
			<view class="form-group">
			  <text class="form-label">技能要求</text>
			  <view class="skill-input-wrapper">
				<input 
				  type="text" 
				  class="skill-input" 
				  v-model="skillInputValue" 
				  placeholder="输入技能后点击添加" 
				  @confirm="addSkillTag"
				/>
				<view class="skill-add-btn" @click="addSkillTag">
				  <text>添加</text>
				</view>
			  </view>
			  
			  <view class="skill-tags" v-if="roleForm.skillRequirements.length > 0">
				<view 
				  class="skill-tag-item" 
				  v-for="(skill, index) in roleForm.skillRequirements" 
				  :key="index"
				>
				  <text>{{ skill }}</text>
				  <view class="tag-remove" @click="removeSkillTag(index)">×</view>
				</view>
			  </view>
			</view>
		  </view>
		  <view class="role-form-actions">
			<view class="form-btn cancel" @click="closeRoleForm">
			  <text>取消</text>
			</view>
			<view class="form-btn confirm" @click="submitRoleForm">
			  <text>{{ roleFormMode === 'add' ? '添加' : '保存' }}</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <!-- 删除角色确认弹窗 -->
	  <view class="confirm-modal" v-if="showDeleteRoleModal" @click="closeDeleteRoleModal">
		<view class="confirm-content" @click.stop>
		  <view class="confirm-header">
			<text class="confirm-title">删除角色</text>
		  </view>
		  <view class="confirm-body">
			<text class="confirm-message">确定要删除"{{ currentEditRole?.name }}"角色吗？如果该角色下已有成员，将无法删除。</text>
		  </view>
		  <view class="confirm-actions">
			<view class="confirm-btn cancel" @click="closeDeleteRoleModal">
			  <text>取消</text>
			</view>
			<view class="confirm-btn confirm" @click="confirmDeleteRole">
			  <text>确定删除</text>
			</view>
		  </view>
		</view>
	  </view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import { getToken } from '@/utils/request';
import teamApi from '@/api/modules/team';
import teamRoleApi from '@/api/modules/teamRole';

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
// 团队管理相关
const showManageModal = ref(false);
const managingTeam = ref({});
const manageActiveTab = ref('members'); // 'members', 'roles', 'info'
const teamMembers = ref([]); // 团队成员列表
const loadingMembers = ref(false); // 成员列表加载状态
// 移除成员相关
const showRemoveMemberModal = ref(false);
const removeMember = ref({});
// 团队角色相关
const teamRoles = ref([]); // 团队角色列表
const loadingRoles = ref(false); // 角色加载状态
const currentEditRole = ref(null); // 当前编辑的角色
const showRoleFormModal = ref(false); // 显示角色表单模态框
const showDeleteRoleModal = ref(false); // 显示删除角色确认模态框
const roleFormMode = ref('add'); // 'add' 或 'edit'
const roleForm = ref({
  teamId: '',
  name: '',
  requiredCount: 1,
  description: '',
  skillRequirements: []
});
const skillInputValue = ref(''); // 技能输入值

// 团队信息相关
const loadingTeamInfo = ref(false);
const teamInfoForm = ref({
  id: '',
  name: '',
  description: '',
  direction: '',
  recruitmentDeadline: '',
  contactInfo: {
    phone: '',
    qq: '',
    wechat: ''
  }
});

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
	  
    // 获取token
    const token = getToken();
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
	  setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      loading.value = false;
      return;
    }
    
    // 调用团队列表API
    const res = await teamApi.getMyTeams();
    
    if (res && res.code === 200 && res.data) {
      // 处理返回的团队数据
      myTeams.value = res.data.map(team => {
        // 处理团队状态文本
             // 处理团队状态文本
		let statusText = '';
        switch (team.status) {
          case '0': statusText = '招募中'; break;
          case '1': statusText = '已满员'; break;
          case '2': statusText = '已结束'; break;
          case '3': statusText = '已解散'; break;
          case '4': statusText = '比赛中'; break;
          default: statusText = '未知状态';
        }
        
        // 构建团队角色数据，包含进度计算
        const teamRoles = team.teamRoles ? team.teamRoles.map(role => {
          // 计算招募进度百分比
          const progress = role.requiredCount > 0 
            ? Math.min(100, Math.round((role.currentCount / role.requiredCount) * 100)) 
            : 0;
          
          return {
            ...role,
            progress
          };
        }) : [];
        
        return {
          ...team,
          statusText,
          teamRoles
        };
      });
      console.log('获取到的团队列表:', myTeams.value);
    } else {
      console.warn('未获取到团队数据或数据格式不正确:', res);
      uni.showToast({
        title: res?.message || '获取团队失败',
        icon: 'none'
      });
      myTeams.value = [];
    }
	} catch (error) {
	  console.error('获取我的团队列表失败:', error);
	  uni.showToast({
		title: '获取团队列表失败',
		icon: 'none'
	  });
    myTeams.value = [];
  } finally {
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
	  'ended': 'status-ended',
	  'dismissed': 'status-dismissed',
	  // 添加新的数字状态映射
	  '0': 'status-recruiting',  // 招募中
	  '1': 'status-active',      // 已满员/活跃
	  '2': 'status-dismissed',   // 已解散
	  '3': 'status-ended',       // 已结束
	  '4': 'status-competing'    // 比赛中
	};
	
	return classMap[status] || '';
}

// 获取状态文本
function getStatusText(status) {
	const textMap = {
	  'active': '活跃',
	  'recruiting': '招募中',
	  'ended': '已结束',
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
	uni.showLoading({
	  title: '处理中...'
	});
	
  console.log(`开始解散团队，团队ID: ${dismissTeam.value.id}`);
  
  // 调用解散团队API
  teamApi.disbandTeam(dismissTeam.value.id)
    .then(res => {
      console.log('解散团队响应:', res);
      
      if (res.code === 200) {
	  // 更新团队状态
	  const index = myTeams.value.findIndex(team => team.id === dismissTeam.value.id);
	  if (index !== -1) {
		myTeams.value[index].status = '2';
		myTeams.value[index].statusText = '已解散';
	  }
	  
	  uni.showToast({
		title: '团队已解散',
		icon: 'success'
	  });
      } else {
        console.warn('解散团队失败，服务器响应:', res);
        uni.showToast({
          title: res.message || '解散失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('解散团队失败:', err);
      uni.showToast({
        title: err?.message || '网络错误，请重试',
        icon: 'none'
      });
    })
    .finally(() => {
      uni.hideLoading();
	  closeDismissModal();
    });
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
	uni.showLoading({
	  title: '处理中...'
	});
	
  // 调用退出团队API
  teamApi.leaveTeam(leaveTeam.value.id)
    .then(res => {
      if (res.code === 200) {
	  // 从列表中移除该团队
	  myTeams.value = myTeams.value.filter(team => team.id !== leaveTeam.value.id);
	  
	  uni.showToast({
		title: '已退出团队',
		icon: 'success'
	  });
      } else {
        uni.showToast({
          title: res.message || '退出失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('退出团队失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    })
    .finally(() => {
      uni.hideLoading();
	  closeLeaveModal();
    });
}

// 删除团队记录
function deleteTeamRecord(id) {
	uni.showModal({
	  title: '删除记录',
	  content: '确定要删除该团队记录吗？',
	  success: (res) => {
		if (res.confirm) {
		  uni.showLoading({
			title: '删除中...'
		  });
		  
        // 调用删除团队记录API
        teamApi.deleteTeamRecord(id)
          .then(res => {
            if (res.code === 200) {
			// 从列表中移除该团队
			myTeams.value = myTeams.value.filter(team => team.id !== id);
			
			uni.showToast({
			  title: '记录已删除',
			  icon: 'success'
			});
            } else {
              uni.showToast({
                title: res.message || '删除失败',
                icon: 'none'
              });
            }
          })
          .catch(err => {
            console.error('删除团队记录失败:', err);
            uni.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
          })
          .finally(() => {
            uni.hideLoading();
          });
		}
	  }
	});
}

// 显示团队管理弹窗
function showManageTeamModal(team) {
  // 设置当前管理的团队
  managingTeam.value = team;
  showManageModal.value = true;
  
  // 根据当前选中的标签加载对应数据
  if (manageActiveTab.value === 'members') {
    getTeamMembers(team.id);
  } else if (manageActiveTab.value === 'roles') {
    // 如果是角色标签页，加载角色数据
    getTeamRoles(team.id);
  } else if (manageActiveTab.value === 'info') {
    // 如果是信息标签页，初始化团队信息表单
    initTeamInfoForm(team);
  }
}

// 关闭团队管理弹窗
function closeManageModal() {
  showManageModal.value = false;
}

// 设置团队管理标签
function setManageTab(tab) {
  manageActiveTab.value = tab;
  
  // 根据不同的标签加载相应数据
  if (tab === 'members' && (!teamMembers.value || teamMembers.value.length === 0)) {
    getTeamMembers(managingTeam.value.id);
  } else if (tab === 'roles' && (!teamRoles.value || teamRoles.value.length === 0)) {
    getTeamRoles(managingTeam.value.id);
  } else if (tab === 'info') {
    // 初始化团队信息表单
    initTeamInfoForm(managingTeam.value);
  }
}

// 获取团队成员列表
async function getTeamMembers(teamId) {
  if (!teamId) return;
  
  loadingMembers.value = true;
  
  try {
    const res = await teamApi.getTeamMembers(teamId);
    
    if (res && res.code === 200 && res.data) {
      teamMembers.value = res.data.map(member => {
        // 处理成员状态（这里使用模拟状态，实际可以根据需求调整）
        const status = member.isLeader ? 'active' : 'offline';
        const statusText = member.isLeader ? '在线' : '离线';
        
        return {
          ...member,
          status,
          statusText,
          avatar: member.userAvatarUrl || '/static/image/avatar/default.jpg',
          role: member.isLeader ? '队长' : (member.roleName || '队员'),
          joinDate: formatDate(member.joinTime)
        };
      });
      
      console.log('获取到的团队成员:', teamMembers.value);
    } else {
      console.warn('未获取到团队成员或数据格式不正确:', res);
      uni.showToast({
        title: res?.message || '获取成员失败',
        icon: 'none'
      });
      teamMembers.value = [];
    }
  } catch (error) {
    console.error('获取团队成员失败:', error);
    uni.showToast({
      title: '获取团队成员失败',
      icon: 'none'
    });
    teamMembers.value = [];
  } finally {
    loadingMembers.value = false;
  }
}

// 获取团队角色列表
async function getTeamRoles(teamId) {
  if (!teamId) return;
  refreshTeamRoles(teamId);
}

// 创建一个专门用于刷新团队角色的函数
async function refreshTeamRoles(teamId) {
  if (!teamId) return;
  
  try {
    // 清空现有角色列表，显示加载状态
    teamRoles.value = [];
    loadingRoles.value = true;
    
    // 重新获取角色列表
    const res = await teamRoleApi.getTeamRoles(teamId);
    
    if (res.code === 200 && res.data) {
      // 处理返回的角色数据
      teamRoles.value = res.data.map(role => {
        // 确保有进度值
        if (typeof role.progress === 'undefined') {
          // 计算招募进度百分比
          role.progress = role.requiredCount > 0 
            ? Math.min(100, Math.round((role.currentCount / role.requiredCount) * 100)) 
            : 0;
        }
        
        // 确保skillRequirements是数组
        if (!Array.isArray(role.skillRequirements)) {
          role.skillRequirements = [];
        }
        
        return role;
      });
      
      console.log('刷新获取到的团队角色列表:', teamRoles.value);
    } else {
      console.warn('刷新未获取到团队角色或数据格式不正确:', res);
      uni.showToast({
        title: res?.message || '刷新角色失败',
        icon: 'none'
      });
      teamRoles.value = [];
    }
  } catch (error) {
    console.error('刷新团队角色失败:', error);
    uni.showToast({
      title: '刷新团队角色失败',
      icon: 'none'
    });
    teamRoles.value = [];
  } finally {
    loadingRoles.value = false;
  }
}

// 打开新增角色表单
function openAddRoleForm() {
  roleFormMode.value = 'add';
  // 重置表单
  roleForm.value = {
    teamId: managingTeam.value.id,
    name: '',
    requiredCount: 1,
    description: '',
    skillRequirements: []
  };
  skillInputValue.value = '';
  showRoleFormModal.value = true;
}

// 打开编辑角色表单
function openEditRoleForm(role) {
  roleFormMode.value = 'edit';
  // 复制角色数据到表单
  roleForm.value = {
    id: role.id,
    teamId: role.teamId,
    name: role.name,
    requiredCount: role.requiredCount,
    description: role.description,
    skillRequirements: [...role.skillRequirements]
  };
  skillInputValue.value = '';
  showRoleFormModal.value = true;
}

// 关闭角色表单
function closeRoleForm() {
  showRoleFormModal.value = false;
}

// 添加技能标签
function addSkillTag() {
  if (!skillInputValue.value.trim()) return;
  
  // 检查是否已存在相同技能
  if (!roleForm.value.skillRequirements.includes(skillInputValue.value.trim())) {
    roleForm.value.skillRequirements.push(skillInputValue.value.trim());
  }
  
  skillInputValue.value = '';
}

// 移除技能标签
function removeSkillTag(index) {
  roleForm.value.skillRequirements.splice(index, 1);
}

// 提交角色表单
async function submitRoleForm() {
  if (!roleForm.value.name) {
    uni.showToast({
      title: '请输入角色名称',
      icon: 'none'
    });
    return;
  }
  
  if (roleForm.value.requiredCount < 1) {
    uni.showToast({
      title: '需求人数必须大于0',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: roleFormMode.value === 'add' ? '添加中...' : '更新中...'
  });
  
  try {
    let res;
    
    if (roleFormMode.value === 'add') {
      // 创建新角色
      res = await teamRoleApi.createTeamRole(roleForm.value);
    } else {
      // 更新角色
      res = await teamRoleApi.updateTeamRole(roleForm.value);
    }
    
    if (res.code === 200) {
      uni.showToast({
        title: roleFormMode.value === 'add' ? '添加成功' : '更新成功',
        icon: 'success'
      });
      
      // 关闭表单
      closeRoleForm();
      
      // 重新加载角色列表
      await refreshTeamRoles(managingTeam.value.id);
      
      // 如果在团队列表中找到当前团队，同时刷新团队列表数据
      const index = myTeams.value.findIndex(team => team.id === managingTeam.value.id);
      if (index !== -1) {
        // 重新获取团队信息
        setTimeout(() => {
          refreshTeams();
        }, 300);
      }
    } else {
      uni.showToast({
        title: res.message || (roleFormMode.value === 'add' ? '添加失败' : '更新失败'),
        icon: 'none'
      });
    }
  } catch (error) {
    console.error(roleFormMode.value === 'add' ? '添加角色失败:' : '更新角色失败:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 显示删除角色确认
function showDeleteRoleConfirm(role) {
  currentEditRole.value = role;
  showDeleteRoleModal.value = true;
}

// 关闭删除角色确认
function closeDeleteRoleModal() {
  showDeleteRoleModal.value = false;
}

// 确认删除角色
async function confirmDeleteRole() {
  if (!currentEditRole.value || !currentEditRole.value.id) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '删除中...'
  });
  
  try {
    const res = await teamRoleApi.deleteTeamRole(currentEditRole.value.id);
    
    if (res.code === 200) {
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 关闭模态框
      closeDeleteRoleModal();
      
      // 重新加载角色列表
      await refreshTeamRoles(managingTeam.value.id);
      
      // 如果在团队列表中找到当前团队，同时刷新团队列表数据
      const index = myTeams.value.findIndex(team => team.id === managingTeam.value.id);
      if (index !== -1) {
        // 重新获取团队信息
        setTimeout(() => {
          refreshTeams();
        }, 300);
      }
    } else {
      uni.showToast({
        title: res.message || '删除失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('删除角色失败:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 显示移除成员确认弹窗
function showRemoveMemberConfirm(member) {
  removeMember.value = member;
  showRemoveMemberModal.value = true;
}

// 关闭移除成员确认弹窗
function closeRemoveMemberModal() {
  showRemoveMemberModal.value = false;
}

// 确认移除成员
function confirmRemoveMember() {
  if (!managingTeam.value.id || !removeMember.value.userId) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '处理中...'
  });
  
  // 调用移除成员API
  teamApi.removeTeamMember(managingTeam.value.id, removeMember.value.userId)
    .then(res => {
      if (res.code === 200) {
        // 移除成功后重新获取成员列表，确保数据最新
        getTeamMembers(managingTeam.value.id);
        
        uni.showToast({
          title: '已移除成员',
          icon: 'success'
        });
      } else {
        uni.showToast({
          title: res.message || '移除失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('移除成员失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    })
    .finally(() => {
      uni.hideLoading();
      closeRemoveMemberModal();
    });
}

// 页面加载时获取团队列表
onMounted(() => {
	getMyTeams();
});

// 初始化团队信息表单
function initTeamInfoForm(team) {
  if (!team) return;
  
  loadingTeamInfo.value = true;
  
  // 从API获取最新的团队详情
  teamApi.getTeamDetail(team.id)
    .then(res => {
      if (res.code === 200 && res.data) {
        const teamData = res.data;
        
        // 初始化表单数据
        teamInfoForm.value = {
          id: teamData.id,
          name: teamData.name || '',
          description: teamData.description || '',
          direction: teamData.direction || '',
          recruitmentDeadline: teamData.recruitmentDeadline || '',
          contactInfo: {
            phone: teamData.contactInfo?.phone || '',
            qq: teamData.contactInfo?.qq || '',
            wechat: teamData.contactInfo?.wechat || ''
          }
        };
        
        console.log('初始化团队信息表单:', teamInfoForm.value);
      } else {
        // 如果获取详情失败，使用现有数据初始化
        teamInfoForm.value = {
          id: team.id,
          name: team.name || '',
          description: team.description || '',
          direction: team.direction || '',
          recruitmentDeadline: team.recruitmentDeadline || '',
          contactInfo: team.contactInfo || {
            phone: '',
            qq: '',
            wechat: ''
          }
        };
        
        uni.showToast({
          title: '获取团队详情失败',
          icon: 'none'
        });
      }
    })
    .catch(error => {
      console.error('获取团队详情失败:', error);
      // 使用现有数据初始化
      teamInfoForm.value = {
        id: team.id,
        name: team.name || '',
        description: team.description || '',
        direction: team.direction || '',
        recruitmentDeadline: team.recruitmentDeadline || '',
        contactInfo: team.contactInfo || {
          phone: '',
          qq: '',
          wechat: ''
        }
      };
      
      uni.showToast({
        title: '获取团队详情失败',
        icon: 'none'
      });
    })
    .finally(() => {
      loadingTeamInfo.value = false;
    });
}

// 处理日期变更
function handleDateChange(e) {
  // 日期字符串格式化为ISO格式 (YYYY-MM-DDT23:59:59)
  const dateStr = e.detail.value;
  teamInfoForm.value.recruitmentDeadline = `${dateStr}T23:59:59`;
}

// 提交团队信息表单
async function submitTeamInfo() {
  // 表单验证
  if (!teamInfoForm.value.name) {
    uni.showToast({
      title: '请输入团队名称',
      icon: 'none'
    });
    return;
  }
  
  // 显示加载提示
  uni.showLoading({
    title: '保存中...'
  });
  
  try {
    const res = await teamApi.updateTeamInfo(teamInfoForm.value);
    
    if (res.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 刷新团队列表
      refreshTeams();
      
      // 更新当前管理的团队信息
      const index = myTeams.value.findIndex(team => team.id === managingTeam.value.id);
      if (index !== -1) {
        // 更新基本信息
        myTeams.value[index].name = teamInfoForm.value.name;
        myTeams.value[index].description = teamInfoForm.value.description;
        myTeams.value[index].direction = teamInfoForm.value.direction;
        myTeams.value[index].recruitmentDeadline = teamInfoForm.value.recruitmentDeadline;
        myTeams.value[index].contactInfo = teamInfoForm.value.contactInfo;
        
        // 同时更新managingTeam
        managingTeam.value = {...myTeams.value[index]};
      }
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新团队信息失败:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}
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
$active-color: #00A36C;
$recruiting-color: #DD7D00;
$ended-color: #7839EE;
$dismissed-color: #4B5563;
$competing-color: #0F5CD7;

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
            padding: 6rpx 18rpx;
            border-radius: 20rpx;
            background-color: $text-secondary;
            margin-right: 16rpx;
            
            text {
              font-size: 24rpx;
              color: white;
              font-weight: 600;
            }
            
            &.leader {
              background-color: #0552D9;
            }
          }
          
          .team-members, .team-created {
            display: flex;
            align-items: center;
            margin-right: 20rpx;
            
            text {
              font-size: 28rpx;
              color: #4B5563;
              margin-left: 6rpx;
              font-weight: 500;
            }
          }
        }
        
        .my-role {
          display: flex;
          align-items: center;
          padding: 8rpx 18rpx;
          background-color: rgba($primary-color, 0.15);
          border-radius: 20rpx;
          width: fit-content;
          
          text {
            font-size: 28rpx;
            color: #0552D9;
            margin-left: 8rpx;
            font-weight: 600;
          }
        }
		
		.team-status {
		  padding: 4rpx 16rpx;
		  border-radius: 20rpx;
		  height: fit-content;
		  
		  text {
			font-size: 24rpx;
			color: white;
			font-weight: 600;
		  }
		  
		  &.status-active {
			background-color: $active-color;
		  }
		  
		  &.status-recruiting {
			background-color: $recruiting-color;
		  }
		  
		  &.status-ended {
			background-color: $ended-color;
		  }
		  
		  &.status-dismissed {
			background-color: $dismissed-color;
		  }
		  
		  &.status-competing {
			background-color: $competing-color;
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
			  font-size: 28rpx;
			  font-weight: 600;
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
				width: 14rpx;
				height: 14rpx;
				border-radius: 7rpx;
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
				font-size: 28rpx;
				color: #333333;
				font-weight: 500;
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
			  font-size: 28rpx;
			  font-weight: 600;
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
				  font-size: 28rpx;
				  font-weight: 600;
				  color: #2A3441;
				}
				
				.role-progress {
				  font-size: 26rpx;
				  color: #4B5563;
				  font-weight: 500;
				}
			  }
			  
			  .role-progress-bar {
				height: 8rpx;
				background-color: $background-color;
				border-radius: 4rpx;
				overflow: hidden;
				
				.role-progress-fill {
				  height: 100%;
				  background-color: $primary-color;
				  border-radius: 4rpx;
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

// 团队管理模态框
.manage-modal {
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
	
	.manage-content {
	  width: 90%;
	  max-height: 80%;
	  background-color: $card-color;
	  border-radius: 16rpx;
	  overflow: hidden;
	  display: flex;
	  flex-direction: column;
	  
	  .manage-header {
		padding: 30rpx;
		text-align: center;
		border-bottom: 1rpx solid $border-color;
		
		.manage-title {
		  font-size: 32rpx;
		  font-weight: bold;
		  color: $text-color;
		}
	  }
	  
	  .manage-body {
		padding: 20rpx;
		flex: 1;
		overflow-y: auto;
		max-height: calc(80vh - 80rpx);
		
		.manage-tab-container {
		  display: flex;
		  justify-content: center;
		  margin-bottom: 20rpx;
		  
		  .manage-tab-item {
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
		
		.manage-content-container {
		  .manage-content-item {
			.members-list, .roles-list {
			  .member-item, .role-item {
				background-color: $background-color;
				border-radius: 12rpx;
				padding: 20rpx;
				margin-bottom: 16rpx;
			  }
			}
			
			// 成员管理样式
			.members-list {
			  .member-item {
				display: flex;
				align-items: flex-start;
				background-color: $background-color;
				border-radius: 12rpx;
				padding: 20rpx;
				margin-bottom: 16rpx;
				
				.member-avatar-container {
				  position: relative;
				  margin-right: 20rpx;
				  flex-shrink: 0;
				  
				  .member-avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 40rpx;
				  }
				  
				  .member-status {
					position: absolute;
					right: 0;
					bottom: 0;
					width: 16rpx;
					height: 16rpx;
					border-radius: 8rpx;
					border: 2rpx solid #fff;
					
					&.status-active {
					  background-color: $active-color;
					}
					
					&.status-offline {
					  background-color: $text-muted;
					}
					
					&.status-away {
					  background-color: $recruiting-color;
					}
				  }
				}
				
				.member-info {
				  flex: 1;
				  min-width: 0; // 解决flex子元素不收缩的问题
				  overflow: hidden;
				  margin-right: 10rpx;
				  
				  .member-name-row {
					display: flex;
					align-items: center;
					margin-bottom: 12rpx;
					
					.member-name {
					  font-size: 28rpx;
					  font-weight: 500;
					  color: $text-color;
					  margin-right: 10rpx;
					  white-space: nowrap;
					  overflow: hidden;
					  text-overflow: ellipsis;
					  max-width: 200rpx;
					}
					
					.member-role-badge {
					  font-size: 22rpx;
					  color: white;
					  background-color: $primary-color;
					  padding: 4rpx 12rpx;
					  border-radius: 20rpx;
					  flex-shrink: 0;
					}
				  }
				  
				  .member-date {
					margin-top: 8rpx;
					display: flex;
					align-items: center;
					flex-wrap: nowrap;
					
					.info-label {
					  font-size: 24rpx;
					  color: $text-muted;
					  margin-right: 6rpx;
					  flex-shrink: 0;
					}
					
					.info-text {
					  font-size: 24rpx;
					  color: $text-secondary;
					  white-space: nowrap;
					  overflow: hidden;
					  text-overflow: ellipsis;
					  flex: 1;
					  min-width: 0;
					}
				  }
				}
				
				.member-actions {
				  display: flex;
				  flex-direction: column;
				  gap: 10rpx;
				  flex-shrink: 0;
				  
				  .member-action-btn {
					display: flex;
					align-items: center;
					padding: 8rpx 16rpx;
					background-color: #fff;
					border: 1rpx solid $border-color;
					border-radius: 20rpx;
					
					text {
					  font-size: 22rpx;
					  color: $text-secondary;
					  margin-left: 4rpx;
					}
				  }
				}
			  }
			}
			
			.members-actions, .roles-actions, .team-info-actions {
			  display: flex;
			  justify-content: center;
			  margin-top: 20rpx;
			  gap: 20rpx;
			  
			  .action-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 12rpx 30rpx;
				border-radius: 30rpx;
				
				text {
				  margin-left: 8rpx;
				  font-size: 26rpx;
				}
				
				&.primary {
				  background-color: $primary-color;
				  
				  text {
					color: white;
				  }
				}
				
				&.secondary {
				  background-color: $background-color;
				  border: 1rpx solid $border-color;
				  
				  text {
					color: $text-secondary;
				  }
				}
			  }
			}
			
			// 角色管理样式
			.roles-list {
			  .role-item {
				.role-header {
				  display: flex;
				  justify-content: space-between;
				  align-items: center;
				  margin-bottom: 16rpx;
				  
				  .role-title-container {
					.role-title {
					  font-size: 28rpx;
					  font-weight: 500;
					  color: $text-color;
					  margin-right: 10rpx;
					}
					
					.role-count {
					  font-size: 24rpx;
					  color: $text-secondary;
					}
				  }
				  
				  .role-actions {
					display: flex;
					
					.role-action-btn {
					  width: 60rpx;
					  height: 60rpx;
					  display: flex;
					  align-items: center;
					  justify-content: center;
					  background-color: #fff;
					  border-radius: 30rpx;
					  margin-left: 10rpx;
					  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
					}
				  }
				}
				
				.role-progress-container {
				  margin-bottom: 16rpx;
				  
				  .role-progress-bar {
					height: 10rpx;
					background-color: #e5e7eb;
					border-radius: 5rpx;
					overflow: hidden;
					
					.role-progress-fill {
					  height: 100%;
					  background-color: $primary-color;
					  border-radius: 5rpx;
					}
				  }
				}
				
				.role-description {
				  text {
					font-size: 26rpx;
					color: $text-secondary;
				  }
				}
			  }
			}
			
			// 团队信息表单样式
			.team-info-form {
			  .form-group {
				margin-bottom: 20rpx;
				
				.form-label {
				  display: block;
				  font-size: 26rpx;
				  color: $text-secondary;
				  margin-bottom: 8rpx;
				}
				
				.form-input, .form-textarea {
				  width: 100%;
				  padding: 16rpx;
				  border: 1rpx solid $border-color;
				  border-radius: 8rpx;
				  font-size: 28rpx;
				  color: $text-color;
				  background-color: #fff;
				}
				
				.form-textarea {
				  height: 200rpx;
				  line-height: 1.5;
				}
			  }
			}
		  }
		}
	  }
	}
}

// 角色表单模态框样式
.role-form-content {
  width: 90%;
  max-height: 80%;
  background-color: $card-color;
  border-radius: 16rpx;
  overflow: hidden;
  
  .role-form-header {
    padding: 30rpx;
    text-align: center;
    border-bottom: 1rpx solid $border-color;
    
    .role-form-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
  }
  
  .role-form-body {
    padding: 30rpx;
    max-height: calc(80vh - 180rpx);
    overflow-y: auto;
    
    .form-group {
      margin-bottom: 20rpx;
      
      .form-label {
        display: block;
        font-size: 26rpx;
        color: $text-secondary;
        margin-bottom: 10rpx;
        
        .required {
          color: #E53E3E;
        }
      }
      
      .form-input, .form-textarea {
        width: 100%;
        padding: 16rpx;
        border: 1rpx solid $border-color;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: $text-color;
        background-color: #fff;
      }
      
      .form-textarea {
        height: 160rpx;
        line-height: 1.5;
      }
      
      .skill-input-wrapper {
        display: flex;
        
        .skill-input {
          flex: 1;
          padding: 16rpx;
          border: 1rpx solid $border-color;
          border-right: none;
          border-top-left-radius: 8rpx;
          border-bottom-left-radius: 8rpx;
          font-size: 28rpx;
          color: $text-color;
        }
        
        .skill-add-btn {
          width: 150rpx;
          background-color: $primary-color;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top-right-radius: 8rpx;
          border-bottom-right-radius: 8rpx;
          
          text {
            color: white;
            font-size: 28rpx;
          }
        }
      }
      
      .skill-tags {
        display: flex;
        flex-wrap: wrap;
        margin-top: 16rpx;
        
        .skill-tag-item {
          display: flex;
          align-items: center;
          background-color: rgba($primary-color, 0.1);
          border-radius: 20rpx;
          padding: 6rpx 16rpx;
          margin-right: 16rpx;
          margin-bottom: 16rpx;
          
          text {
            font-size: 24rpx;
            color: $primary-color;
          }
          
          .tag-remove {
            margin-left: 8rpx;
            font-size: 24rpx;
            color: $primary-color;
            font-weight: bold;
          }
        }
      }
    }
  }
  
  .role-form-actions {
    display: flex;
    border-top: 1rpx solid $border-color;
    
    .form-btn {
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

// 团队信息表单样式
.team-info-form {
  .form-group {
    margin-bottom: 20rpx;
    
    .form-label {
      display: block;
      font-size: 26rpx;
      color: $text-secondary;
      margin-bottom: 10rpx;
      
      .required {
        color: #E53E3E;
      }
    }
    
    .form-input, .form-textarea {
      width: 100%;
      padding: 16rpx;
      border: 1rpx solid $border-color;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: $text-color;
      background-color: #fff;
    }
    
    .form-textarea {
      height: 160rpx;
      line-height: 1.5;
    }
    
    .contact-container {
      .contact-item {
        margin-bottom: 16rpx;
        
        .contact-label {
          display: block;
          font-size: 24rpx;
          color: $text-secondary;
          margin-bottom: 8rpx;
		  }
		}
	  }
	}
}
</style>