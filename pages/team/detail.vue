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

      <view class="research-direction" v-if="teamInfo.direction">
        <text class="section-title">队伍方向</text>
        <text class="desc-text">{{teamInfo.direction}}</text>
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
          
          <text v-if="member.userMajor" class="member-major">{{member.userMajor}}</text>
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
          <text v-if="teacher.major" class="teacher-major">{{teacher.major}}</text>
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


  </view>
</template>

<script>
import teamApi from '@/api/modules/team';

export default {
  data() {
    return {
      defaultAvatar: '/static/images/default-avatar.png',
      teamId: null,
      teamInfo: {},
      teamMembers: [],
      showPhone: false,
      isLoading: true,
      userInfo: null,
      hasApplied: false, // 是否已申请加入
      isTeamMember: false, // 是否是团队成员
      isTeamLeader: false, // 是否是团队队长
      applyLoading: false // 申请按钮加载状态
    };
  },
  
  computed: {
    hasAvailableRoles() {
      if (!this.teamInfo.roles) return false;
      return this.teamInfo.roles.some(role => role.currentCount < role.requiredCount);
    }
  },
  
  // 页面生命周期函数
  onLoad(option) {
    console.log('队伍详情页面参数:', option);
    if (option && option.id) {
      this.teamId = option.id;
      this.getUserInfo();
      this.getTeamDetail();
    } else {
      uni.showToast({
        title: '队伍ID不能为空',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  
  onShow() {
    // 每次页面显示时检查用户信息和团队状态
    this.getUserInfo();
    if (this.teamId) {
      this.checkTeamStatus();
    }
  },
  
  methods: {
    // 获取当前用户信息
    getUserInfo() {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.userInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
      }
    },
    
    // 检查用户与团队的关系状态
    async checkTeamStatus() {
      if (!this.userInfo || !this.userInfo.userId) return;
      
      try {
        const res = await teamApi.checkTeamStatus(this.teamId);
        if (res.code === 200) {
          this.hasApplied = res.data === true;
        }
      } catch (error) {
        console.error('检查团队状态失败', error);
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case '0': return 'status-recruiting';
        case '1': return 'status-filled';
        case '2': return 'status-disbanded';
        default: return 'status-recruiting';
      }
    },
    
    getStatusIcon(status) {
      switch (status) {
        case '0': return 'icon-check-circle';
        case '1': return 'icon-hourglass';
        case '2': return 'icon-times-circle';
        default: return 'icon-check-circle';
      }
    },
    
    hidePhone(phone) {
      if (!phone) return '';
      // 隐藏中间四位数字
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    
    togglePhone() {
      this.showPhone = !this.showPhone;
    },
    
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },
    
    goBack() {
      uni.navigateBack();
    },
    
    goToCompetition(competitionId) {
      if (!competitionId) return;
      uni.navigateTo({
        url: `/pages/competition/detail?id=${competitionId}`
      });
    },
    
    async applyRole(roleId) {
      // 已申请过，提示用户
      if (this.hasApplied) {
        uni.showToast({
          title: '您已申请或已加入该团队',
          icon: 'none'
        });
        return;
      }
      
      // 弹窗让用户输入申请留言
      uni.showModal({
        title: '申请加入理由',
        content: '',
        editable: true,
        placeholderText: '我希望加入团队参与...',
        success: async (res) => {
          if (res.confirm) {
            const message = res.content || '希望能加入团队，与大家一起学习成长。';
            this.applyLoading = true;
            
            try {
              const applyData = {
                teamId: this.teamId,
                roleId: roleId,
                message: message
              };
              
              const result = await teamApi.applyTeam(applyData);
              if (result.code === 200) {
                uni.showToast({
                  title: '申请已提交',
                  icon: 'success'
                });
                this.hasApplied = true;
              } else {
                uni.showToast({
                  title: result.message || '申请提交失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('申请失败', error);
              uni.showToast({
                title: '网络异常，请稍后重试',
                icon: 'none'
              });
            } finally {
              this.applyLoading = false;
            }
          }
        }
      });
    },
    
    showApplyOptions() {
      // 检查登录状态
      if (!this.userInfo || !this.userInfo.userId) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再申请加入团队',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
        return;
      }
      
      // 已申请过，提示用户
      if (this.hasApplied) {
        uni.showToast({
          title: '您已申请或已加入该团队',
          icon: 'none'
        });
        return;
      }
      
      // 如果有多个可申请角色，显示选择框
      if (this.teamInfo.roles && this.teamInfo.roles.length > 0) {
        const availableRoles = this.teamInfo.roles.filter(role => role.currentCount < role.requiredCount);
        
        if (availableRoles.length > 1) {
          const itemList = availableRoles.map(role => `${role.name}（${role.currentCount}/${role.requiredCount}）`);
          
          uni.showActionSheet({
            itemList,
            success: (res) => {
              this.applyRole(availableRoles[res.tapIndex].id);
            }
          });
        } else if (availableRoles.length === 1) {
          this.applyRole(availableRoles[0].id);
        } else {
          uni.showToast({
            title: '当前没有可申请的角色',
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '当前没有可申请的角色',
          icon: 'none'
        });
      }
    },
    
    editTeam() {
      uni.navigateTo({
        url: `/pages/team/edit?id=${this.teamId}`
      });
    },
    
    async disbandTeam() {
      uni.showModal({
        title: '解散队伍',
        content: '确定要解散该队伍吗？此操作不可撤销',
        confirmColor: '#f56c6c',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await teamApi.disbandTeam(this.teamId);
              if (result.code === 200) {
                uni.showToast({
                  title: '队伍已解散',
                  icon: 'success'
                });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } else {
                uni.showToast({
                  title: result.message || '解散队伍失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('解散队伍失败', error);
              uni.showToast({
                title: '网络异常，请稍后重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    async leaveTeam() {
      uni.showModal({
        title: '退出队伍',
        content: '确定要退出该队伍吗？',
        confirmColor: '#f56c6c',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await teamApi.leaveTeam(this.teamId);
              if (result.code === 200) {
                uni.showToast({
                  title: '已退出队伍',
                  icon: 'success'
                });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } else {
                uni.showToast({
                  title: result.message || '退出失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('退出队伍失败', error);
              uni.showToast({
                title: '网络异常，请稍后重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 获取队伍成员数据
    async getTeamMembers() {
      try {
        const res = await teamApi.getTeamMembers(this.teamId);
        if (res && res.code === 200 && res.data) {
          this.teamMembers = res.data;
          
          // 判断当前用户是否是团队成员
          if (this.userInfo && this.userInfo.userId) {
            const currentUserId = this.userInfo.userId;
            const isMember = this.teamMembers.some(member => member.userId === currentUserId);
            const isLeader = isMember && this.teamMembers.some(member => member.userId === currentUserId && member.isLeader);
            
            this.isTeamMember = isMember;
            this.isTeamLeader = isLeader;
          }
          
          console.log('获取到队伍成员:', this.teamMembers);
        } else {
          console.log('获取队伍成员失败:', res?.message);
        }
      } catch (error) {
        console.error('获取队伍成员出错', error);
      }
    },
    
    // 获取队伍详情数据
    async getTeamDetail() {
      this.isLoading = true;
      try {
        const res = await teamApi.getTeamDetail(this.teamId);
        if (res && res.code === 200 && res.data) {
          this.teamInfo = res.data;
          console.log('获取到队伍详情:', this.teamInfo);
          
          // 检查当前用户是否是队长
          if (this.userInfo && this.userInfo.userId && this.teamInfo.leaderId === this.userInfo.userId) {
            this.isTeamLeader = true;
            this.isTeamMember = true;
          }
          
          // 获取队伍成员
          this.getTeamMembers();
          
          // 检查用户与团队的关系
          this.checkTeamStatus();
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
        this.isLoading = false;
      }
    }
  }
}
</script>

<style>
.research-direction{
  margin-bottom: 5rpx;
}
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
  font-size: 30rpx;
  font-weight: bold;
  color: #1E293B;
  text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);
  letter-spacing: 1rpx;
}

.leader-major {
  font-size: 22rpx;
  color: #2563EB;
  text-align: center;
  padding: 4rpx 10rpx;
  margin-top: 6rpx;
  background-color: #DBEAFE;
  border-radius: 10rpx;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
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
  font-size: 26rpx;
  font-weight: 600;
  color: #334155;
  margin-top: 10rpx;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 1rpx;
}

.leader-label {
  color: #3B82F6;
}

.member-role, .teacher-role {
  font-size: 22rpx;
  color: #EA580C;
  text-align: center;
  padding: 4rpx 0rpx;
  margin-top: 6rpx;
  background-color: #FFEDD5;
  border-radius: 10rpx;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
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

/* 添加专业显示样式 */
.member-major {
  font-size: 22rpx;
  color: #2563EB;
  text-align: center;
  padding: 4rpx 10rpx;
  margin-top: 6rpx;
  background-color: #DBEAFE;
  border-radius: 10rpx;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
}

.teacher-major {
  font-size: 22rpx;
  color: #2563EB;
  text-align: center;
  padding: 4rpx 10rpx;
  margin-top: 6rpx;
  background-color: #DBEAFE;
  border-radius: 10rpx;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
}

.teacher-role {
  font-size: 22rpx;
  color: #EA580C;
  text-align: center;
  padding: 4rpx 0rpx;
  margin-top: 6rpx;
  background-color: #FFEDD5;
  border-radius: 10rpx;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
}
</style> 