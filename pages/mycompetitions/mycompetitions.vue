<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <HeaderBar 
      ref="headerBarRef"
      title="我的竞赛" 
      :showSearch="false" 
      :showFilter="false"

    >
      <template #actions>
        <view class="action-btn" @click="showFilterModal">
          <SvgIcon name="filter" size="24" />
        </view>
      </template>
    </HeaderBar>
    
    <!-- 导航栏占位 -->
    <view class="header-placeholder" :style="{ height: headerPlaceholderHeight }"></view>
    
    <!-- 状态标签 -->
    <scroll-view scroll-x class="status-tabs">
      <view class="tabs-container">
        <view 
          class="tab-item" 
          :class="{'active': activeStatus === 'all'}"
          @click="setActiveStatus('all')"
        >
          <text>全部</text>
        </view>
        <view 
          class="tab-item" 
          :class="{'active': activeStatus === 'ongoing'}"
          @click="setActiveStatus('ongoing')"
        >
          <text>进行中</text>
          <view class="badge" v-if="myCompetitions && myCompetitions.value && myCompetitions.value.length > 0 && getCompetitionCountByStatus('ongoing') > 0">
            <text>{{ getCompetitionCountByStatus('ongoing') }}</text>
          </view>
        </view>
        <view 
          class="tab-item" 
          :class="{'active': activeStatus === 'upcoming'}"
          @click="setActiveStatus('upcoming')"
        >
          <text>即将开始</text>
        </view>
        <view 
          class="tab-item" 
          :class="{'active': activeStatus === 'completed'}"
          @click="setActiveStatus('completed')"
        >
          <text>已结束</text>
          <view class="badge" v-if="myCompetitions && myCompetitions.value && myCompetitions.value.length > 0 && getCompetitionCountByStatus('finished') > 0">
            <text>{{ getCompetitionCountByStatus('finished') }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 加载中显示 -->
    <view class="loading-container" v-if="loading">
      <view class="loading-circle"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 竞赛列表内容 -->
    <scroll-view 
      scroll-y 
      class="content-scroll" 
      v-else
    >
      <!-- 进行中的竞赛 -->
      <view class="competition-section" v-if="activeStatus === 'all' || activeStatus === 'ongoing'">
        <view class="section-header" v-if="activeStatus === 'all'">
          <text class="section-title">进行中的竞赛</text>
          <text class="section-count">{{ ongoingCompetitions ? ongoingCompetitions.length : 0 }}个</text>
        </view>
        
        <view class="competition-list">
          <view 
            class="competition-card" 
            v-for="(competition, index) in ongoingCompetitions" 
            :key="index"
            @click="navigateToCompetitionDetail(competition.id)"
          >
            <view class="card-header">
              <image class="competition-image" :src="competition.imageUrl" mode="aspectFill"></image>
              <view class="competition-info">
                <text class="competition-name">{{ competition.name }}</text>
                <view class="competition-badges">
                  <view class="level-badge" :class="getLevelClass(competition.level)">
                    <text>{{ competition.level }}</text>
                  </view>
                  <view class="status-badge status-ongoing">
                    <text>进行中</text>
                  </view>
                </view>
                <view class="competition-date">
                  <SvgIcon name="calendar" size="14"></SvgIcon>
                  <text>{{ formatDate(competition.startDate) }} - {{ formatDate(competition.endDate) }}</text>
                </view>
              </view>
            </view>
            
            <view class="card-body">
              <view class="progress-info">
                <view class="progress-header">
                  <text class="current-stage">当前阶段: {{ competition.currentStage }}</text>
                  <text class="days-left">剩余{{ getDaysLeft(competition.stageEndDate) }}天</text>
                </view>
                <view class="progress-bar">
                  <view class="progress-fill" :style="{ width: competition.progress + '%' }"></view>
                </view>
                <view class="stage-info">
                  <text class="stage-text">{{ competition.stageDescription }}</text>
                </view>
              </view>
              
              <view class="team-info" v-if="competition.teamName">
                <view class="team-header">
                  <text class="team-label">参赛团队</text>
                  <text class="team-name">{{ competition.teamName }}</text>
                  <view class="team-members">
                  <view class="member-avatars">
                    <image 
                      class="member-avatar" 
                      v-for="(member, mIndex) in competition.teamMembers.slice(0, 3)" 
                      :key="mIndex"
                      :src="member.avatar"
                    ></image>
                    <view class="more-members" v-if="competition.teamMembers.length > 3">
                      <text>+{{ competition.teamMembers.length - 3 }}</text>
                    </view>
                  </view>
                  <text class="member-count">{{ competition.teamMembers.length }}人团队</text>
                </view>
                </view>
        
              </view>
              
              <view class="action-buttons">
                <view class="action-btn primary" @click.stop="navigateToSubmission(competition.id)">
                  <SvgIcon name="upload" size="16"></SvgIcon>
                  <text>提交作品</text>
                </view>
                <view class="action-btn secondary" @click.stop="navigateToTeam(competition.teamId)">
                  <SvgIcon name="users" size="16"></SvgIcon>
                  <text>查看团队</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-if="ongoingCompetitions && ongoingCompetitions.length === 0">
            <image class="empty-image" src="/static/image/empty-ongoing.png" mode="aspectFit"></image>
            <text class="empty-text">暂无进行中的竞赛</text>
            <view class="action-btn primary" @click="navigateToCompetitionList">
              <text>去浏览竞赛</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 即将开始的竞赛 -->
      <view class="competition-section" v-if="activeStatus === 'all' || activeStatus === 'upcoming'">
        <view class="section-header" v-if="activeStatus === 'all'">
          <text class="section-title">即将开始的竞赛</text>
          <text class="section-count">{{ upcomingCompetitions ? upcomingCompetitions.length : 0 }}个</text>
        </view>
        
        <view class="competition-list">
          <view 
            class="competition-card" 
            v-for="(competition, index) in upcomingCompetitions" 
            :key="index"
            @click="navigateToCompetitionDetail(competition.id)"
          >
            <view class="card-header">
              <image class="competition-image" :src="competition.imageUrl" mode="aspectFill"></image>
              <view class="competition-info">
                <text class="competition-name">{{ competition.name }}</text>
                <view class="competition-badges">
                  <view class="level-badge" :class="getLevelClass(competition.level)">
                    <text>{{ competition.level }}</text>
                  </view>
                  <view class="status-badge status-upcoming">
                    <text>即将开始</text>
                  </view>
                </view>
                <view class="competition-date">
                  <SvgIcon name="calendar" size="14"></SvgIcon>
                  <text>{{ formatDate(competition.startDate) }} - {{ formatDate(competition.endDate) }}</text>
                </view>
              </view>
            </view>
            
            <view class="card-body">
              <view class="countdown-info">
                <text class="countdown-label">距离开始还有</text>
                <view class="countdown-timer">
                  <view class="time-unit">
                    <text class="time-value">{{ getCountdown(competition.startDate).days }}</text>
                    <text class="time-label">天</text>
                  </view>
                  <view class="time-separator">:</view>
                  <view class="time-unit">
                    <text class="time-value">{{ getCountdown(competition.startDate).hours }}</text>
                    <text class="time-label">时</text>
                  </view>
                  <view class="time-separator">:</view>
                  <view class="time-unit">
                    <text class="time-value">{{ getCountdown(competition.startDate).minutes }}</text>
                    <text class="time-label">分</text>
                  </view>
                </view>
              </view>
              
              <view class="team-info" v-if="competition.teamName">
                <view class="team-header">
                  <text class="team-label">参赛团队</text>
                  <text class="team-name">{{ competition.teamName }}</text>
                </view>
                <view class="team-members">
                  <view class="member-avatars">
                    <image 
                      class="member-avatar" 
                      v-for="(member, mIndex) in competition.teamMembers.slice(0, 3)" 
                      :key="mIndex"
                      :src="member.avatar"
                    ></image>
                    <view class="more-members" v-if="competition.teamMembers.length > 3">
                      <text>+{{ competition.teamMembers.length - 3 }}</text>
                    </view>
                  </view>
                  <text class="member-count">{{ competition.teamMembers.length }}人团队</text>
                </view>
              </view>
              
              <view class="action-buttons">
                <view class="action-btn primary" @click.stop="navigateToTeam(competition.teamId)">
                  <SvgIcon name="users" size="16"></SvgIcon>
                  <text>团队管理</text>
                </view>
                <view class="action-btn secondary" @click.stop="cancelRegistration(competition.id)">
                  <SvgIcon name="x" size="16"></SvgIcon>
                  <text>取消报名</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-if="upcomingCompetitions && upcomingCompetitions.length === 0">
            <image class="empty-image" src="/static/image/empty-upcoming.png" mode="aspectFit"></image>
            <text class="empty-text">暂无即将开始的竞赛</text>
            <view class="action-btn primary" @click="navigateToCompetitionList">
              <text>去浏览竞赛</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 已结束的竞赛 -->
      <view class="competition-section" v-if="activeStatus === 'all' || activeStatus === 'completed'">
        <view class="section-header" v-if="activeStatus === 'all'">
          <text class="section-title">已结束的竞赛</text>
          <text class="section-count">{{ completedCompetitions ? completedCompetitions.length : 0 }}个</text>
        </view>
        
        <view class="competition-list">
          <view 
            class="competition-card" 
            v-for="(competition, index) in completedCompetitions" 
            :key="index"
            @click="navigateToCompetitionDetail(competition.id)"
          >
            <view class="card-header">
              <image class="competition-image" :src="competition.imageUrl" mode="aspectFill"></image>
              <view class="competition-info">
                <text class="competition-name">{{ competition.name }}</text>
                <view class="competition-badges">
                  <view class="level-badge" :class="getLevelClass(competition.level)">
                    <text>{{ competition.level }}</text>
                  </view>
                  <view class="status-badge status-completed">
                    <text>已结束</text>
                  </view>
                </view>
                <view class="competition-date">
                  <SvgIcon name="calendar" size="14"></SvgIcon>
                  <text>{{ formatDate(competition.startDate) }} - {{ formatDate(competition.endDate) }}</text>
                </view>
              </view>
            </view>
            
            <view class="card-body">
              <view class="result-info">
                <view class="result-header">
                  <text class="result-label">竞赛成绩</text>
                  <view class="result-badge" :class="getResultClass(competition.result)">
                    <text>{{ competition.result || '未获奖' }}</text>
                  </view>
                </view>
                <view class="certificate-info" v-if="competition.hasCertificate">
                  <SvgIcon name="award" size="16"></SvgIcon>
                  <text>已获得证书</text>
                  <view class="view-certificate" @click.stop="viewCertificate(competition.id)">
                    <text>查看</text>
                    <SvgIcon name="chevron-right" size="14"></SvgIcon>
                  </view>
                </view>
              </view>
              
              <view class="team-info" v-if="competition.teamName">
                <view class="team-header">
                  <text class="team-label">参赛团队</text>
                  <text class="team-name">{{ competition.teamName }}</text>
                </view>
                <view class="team-members">
                  <view class="member-avatars">
                    <image 
                      class="member-avatar" 
                      v-for="(member, mIndex) in competition.teamMembers.slice(0, 3)" 
                      :key="mIndex"
                      :src="member.avatar"
                    ></image>
                    <view class="more-members" v-if="competition.teamMembers.length > 3">
                      <text>+{{ competition.teamMembers.length - 3 }}</text>
                    </view>
                  </view>
                  <text class="member-count">{{ competition.teamMembers.length }}人团队</text>
                </view>
              </view>
              
              <view class="action-buttons">
                <view class="action-btn primary" @click.stop="viewSubmission(competition.id)">
                  <SvgIcon name="eye" size="16"></SvgIcon>
                  <text>查看作品</text>
                </view>
                <view class="action-btn secondary" @click.stop="shareResult(competition)">
                  <SvgIcon name="share" size="16"></SvgIcon>
                  <text>分享成绩</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-if="completedCompetitions && completedCompetitions.length === 0">
            <image class="empty-image" src="/static/image/empty-completed.png" mode="aspectFit"></image>
            <text class="empty-text">暂无已结束的竞赛</text>
            <view class="action-btn primary" @click="navigateToCompetitionList">
              <text>去浏览竞赛</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="showFilter" @click="closeFilterModal">
      <view class="filter-content" @click.stop>
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <view class="close-btn" @click="closeFilterModal">
            <SvgIcon name="x" size="20"></SvgIcon>
          </view>
        </view>
        
        <scroll-view scroll-y class="filter-options-scroll">
          <!-- 竞赛级别 -->
          <view class="filter-section">
            <text class="filter-section-title">竞赛级别</text>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{'selected': selectedLevels.includes('全部')}"
                @click="toggleLevelFilter('全部')"
              >
                <text>全部</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedLevels.includes('国家级')}"
                @click="toggleLevelFilter('国家级')"
              >
                <text>国家级</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedLevels.includes('省级')}"
                @click="toggleLevelFilter('省级')"
              >
                <text>省级</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedLevels.includes('市级')}"
                @click="toggleLevelFilter('市级')"
              >
                <text>市级</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedLevels.includes('校级')}"
                @click="toggleLevelFilter('校级')"
              >
                <text>校级</text>
              </view>
            </view>
          </view>
          
          <!-- 竞赛类型 -->
          <view class="filter-section">
            <text class="filter-section-title">竞赛类型</text>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{'selected': selectedTypes.includes('全部')}"
                @click="toggleTypeFilter('全部')"
              >
                <text>全部</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTypes.includes('编程开发')}"
                @click="toggleTypeFilter('编程开发')"
              >
                <text>编程开发</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTypes.includes('设计创意')}"
                @click="toggleTypeFilter('设计创意')"
              >
                <text>设计创意</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTypes.includes('商业创新')}"
                @click="toggleTypeFilter('商业创新')"
              >
                <text>商业创新</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTypes.includes('科研学术')}"
                @click="toggleTypeFilter('科研学术')"
              >
                <text>科研学术</text>
              </view>
            </view>
          </view>
          
          <!-- 参赛结果 -->
          <view class="filter-section">
            <text class="filter-section-title">参赛结果</text>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('全部')}"
                @click="toggleResultFilter('全部')"
              >
                <text>全部</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('一等奖')}"
                @click="toggleResultFilter('一等奖')"
              >
                <text>一等奖</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('二等奖')}"
                @click="toggleResultFilter('二等奖')"
              >
                <text>二等奖</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('三等奖')}"
                @click="toggleResultFilter('三等奖')"
              >
                <text>三等奖</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('优秀奖')}"
                @click="toggleResultFilter('优秀奖')"
              >
                <text>优秀奖</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedResults.includes('未获奖')}"
                @click="toggleResultFilter('未获奖')"
              >
                <text>未获奖</text>
              </view>
            </view>
          </view>
          
          <!-- 时间范围 -->
          <view class="filter-section">
            <text class="filter-section-title">时间范围</text>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{'selected': selectedTimeRange === 'all'}"
                @click="setTimeRange('all')"
              >
                <text>全部时间</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTimeRange === 'month3'}"
                @click="setTimeRange('month3')"
              >
                <text>近3个月</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTimeRange === 'month6'}"
                @click="setTimeRange('month6')"
              >
                <text>近6个月</text>
              </view>
              <view 
                class="filter-option" 
                :class="{'selected': selectedTimeRange === 'year1'}"
                @click="setTimeRange('year1')"
              >
                <text>近1年</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="filter-actions">
          <view class="reset-filter-btn" @click="resetFilters">
            <text>重置</text>
          </view>
          <view class="apply-filter-btn" @click="applyFilters">
            <text>应用筛选</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 分享弹窗 -->
    <view class="share-modal" v-if="showShareModal" @click="closeShareModal">
      <view class="share-content" @click.stop>
        <view class="share-header">
          <text class="share-title">分享竞赛成绩</text>
          <view class="close-btn" @click="closeShareModal">
            <SvgIcon name="x" size="20"></SvgIcon>
          </view>
        </view>
        
        <view class="share-preview">
          <view class="share-card">
            <view class="share-card-header">
              <image class="share-logo" src="/static/image/logo.png" mode="aspectFit"></image>
              <text class="share-platform">竞赛平台</text>
            </view>
            <view class="share-card-body">
              <text class="share-competition-name">{{ shareCompetition.name }}</text>
              <view class="share-result">
                <text class="share-result-label">获得</text>
                <text class="share-result-value">{{ shareCompetition.result || '参与奖' }}</text>
              </view>
              <view class="share-team">
                <text class="share-team-label">团队:</text>
                <text class="share-team-value">{{ shareCompetition.teamName }}</text>
              </view>
              <view class="share-date">
                <text>{{ formatDate(shareCompetition.endDate) }}</text>
              </view>
            </view>
            <view class="share-card-footer">
              <image class="share-qrcode" src="/static/image/qrcode.png" mode="aspectFit"></image>
              <text class="share-scan-text">扫码查看详情</text>
            </view>
          </view>
        </view>
        
        <view class="share-options">
          <view class="share-option" @click="shareToWechat">
            <view class="share-icon wechat">
              <SvgIcon name="wechat" size="32"></SvgIcon>
            </view>
            <text>微信</text>
          </view>
          
          <view class="share-option" @click="shareToMoments">
            <view class="share-icon moments">
              <SvgIcon name="moments" size="32"></SvgIcon>
            </view>
            <text>朋友圈</text>
          </view>
          
          <view class="share-option" @click="shareToQQ">
            <view class="share-icon qq">
              <SvgIcon name="qq" size="32"></SvgIcon>
            </view>
            <text>QQ</text>
          </view>
          
          <view class="share-option" @click="saveImage">
            <view class="share-icon save">
              <SvgIcon name="download" size="32"></SvgIcon>
            </view>
            <text>保存图片</text>
          </view>
        </view>
        
        <view class="share-cancel" @click="closeShareModal">
          <text>取消</text>
        </view>
      </view>
    </view>
    
    <!-- 取消报名确认弹窗 -->
    <view class="confirm-modal" v-if="showCancelConfirm" @click="closeCancelConfirm">
      <view class="confirm-content" @click.stop>
        <view class="confirm-header">
          <text class="confirm-title">取消报名</text>
        </view>
        <view class="confirm-body">
          <text class="confirm-message">确定要取消参加"{{ cancelCompetition.name }}"吗？取消后将无法恢复。</text>
        </view>
        <view class="confirm-actions">
          <view class="confirm-btn cancel" @click="closeCancelConfirm">
            <text>再想想</text>
          </view>
          <view class="confirm-btn confirm" @click="confirmCancelRegistration">
            <text>确定取消</text>
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
import competitionsApi from '@/api/modules/competitions';
import teamApi from '@/api/modules/team';
import { getToken } from '@/utils/request';

// HeaderBar引用
const headerBarRef = ref(null);

// 计算HeaderBar占位高度
const headerPlaceholderHeight = computed(() => {
  if (headerBarRef.value && headerBarRef.value.headerHeight) {
    return headerBarRef.value.headerHeight + 'rpx';
  }
  return '120rpx';
});

// 加载状态
const loading = ref(true);
// 当前选中的状态标签
const activeStatus = ref('all');
// 竞赛列表
const myCompetitions = ref([]);
// 竞赛详细数据（包含团队成员和阶段信息）
const competitionsData = ref([]);
// 筛选相关
const showFilter = ref(false);
const selectedLevels = ref(['全部']);
const selectedTypes = ref(['全部']);
const selectedResults = ref(['全部']);
const selectedTimeRange = ref('all');
// 分享相关
const showShareModal = ref(false);
const shareCompetition = ref({});
// 取消报名相关
const showCancelConfirm = ref(false);
const cancelCompetition = ref({});

// 计算属性
const ongoingCompetitions = computed(() => {
  if (!competitionsData.value || competitionsData.value.length === 0) return [];
  return competitionsData.value.filter(comp => 
    comp.status === 'ongoing' || comp.status === 'registering'
  );
});

const upcomingCompetitions = computed(() => {
  if (!competitionsData.value || competitionsData.value.length === 0) return [];
  return competitionsData.value.filter(comp => comp.status === 'upcoming');
});

const completedCompetitions = computed(() => {
  if (!competitionsData.value || competitionsData.value.length === 0) return [];
  return competitionsData.value.filter(comp => comp.status === 'finished' || comp.status === 'completed');
});

// 获取竞赛列表
async function getMyCompetitions() {
  loading.value = true;
  
  try {
    // 检查登录状态
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
    
    // 获取用户参与的竞赛列表
    const participatedRes = await competitionsApi.getUserParticipatedCompetitions();
    
    if (participatedRes.code === 200 && participatedRes.data) {
      myCompetitions.value = participatedRes.data || [];
      console.log('获取到的参与竞赛列表:', myCompetitions.value);
      
      // 根据竞赛列表获取详细信息
      await fetchCompetitionsDetails();
    } else {
      console.error('获取参与竞赛列表失败', participatedRes);
      uni.showToast({
        title: participatedRes.message || '获取竞赛列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取我的竞赛列表失败:', error);
    uni.showToast({
      title: '获取竞赛列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取竞赛详细信息（团队成员和阶段信息）
async function fetchCompetitionsDetails() {
  try {
    // 为每个竞赛获取详细信息
    const detailsPromises = await Promise.all(
      myCompetitions.value.map(async (competition) => {
        // 为每个竞赛构造一个基本对象
        const competitionData = {
          id: competition.competitionId,
          name: competition.competitionName,
          categories: competition.categories || [],
          teamId: competition.teamId,
          teamName: competition.teamName,
          teamMembers: [],
          status: 'unknown', // 默认状态，后续根据阶段确定
          imageUrl: competition.imageUrl || '/static/image/competition/comp1.jpg', // 默认图片
          level: competition.level || '未知',
          startDate: '',
          endDate: '',
          currentStage: '',
          stageEndDate: '',
          stageDescription: '',
          progress: 0
        };
        
        try {
          // 获取团队成员信息
          const teamRes = await teamApi.getTeamMembers(competition.teamId);
          if (teamRes.code === 200 && teamRes.data) {
            competitionData.teamMembers = teamRes.data.map(member => ({
              id: member.userId,
              name: member.userName,
              avatar: member.userAvatarUrl || '/static/image/avatar/default.jpg',
              isLeader: member.isLeader,
              role: member.roleName || (member.isLeader ? '队长' : '队员')
            }));
          }
          
          // 获取竞赛阶段信息
          const stagesRes = await competitionsApi.getCompetitionStages(competition.competitionId);
          if (stagesRes.code === 200 && stagesRes.data && stagesRes.data.length > 0) {
            const stages = stagesRes.data;
            
            // 排序阶段（按开始时间）
            stages.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            
            // 获取竞赛起止时间
            competitionData.startDate = stages[0].startTime;
            competitionData.endDate = stages[stages.length - 1].endTime;
            
            // 确定当前阶段和竞赛状态
            const now = new Date();
            const firstStageStart = new Date(stages[0].startTime);
            const lastStageEnd = new Date(stages[stages.length - 1].endTime);
            
            let currentStage = null;
            let activeStageIndex = -1;
            
            // 查找当前阶段
            for (let i = 0; i < stages.length; i++) {
              const stageStart = new Date(stages[i].startTime);
              const stageEnd = new Date(stages[i].endTime);
              
              if (now >= stageStart && now <= stageEnd) {
                currentStage = stages[i];
                activeStageIndex = i;
                break;
              } else if (now < stageStart && activeStageIndex === -1) {
                // 如果还没有找到活跃阶段，且当前时间小于这个阶段的开始时间
                // 说明这个阶段是未来的第一个阶段
                currentStage = stages[i];
                activeStageIndex = i;
                break;
              }
            }
            
            // 如果没有找到当前阶段，可能竞赛已经结束
            if (activeStageIndex === -1 && now > lastStageEnd) {
              currentStage = stages[stages.length - 1];
              activeStageIndex = stages.length - 1;
              competitionData.status = 'completed';
            } else if (now < firstStageStart) {
              // 竞赛还未开始
              competitionData.status = 'upcoming';
            } else if (now > lastStageEnd) {
              // 竞赛已结束
              competitionData.status = 'completed';
            } else {
              // 竞赛进行中
              competitionData.status = 'ongoing';
            }
            
            // 设置当前阶段信息
            if (currentStage) {
              competitionData.currentStage = currentStage.stageName;
              competitionData.stageEndDate = currentStage.endTime;
              competitionData.stageDescription = currentStage.description;
              
              // 计算进度
              if (competitionData.status === 'ongoing') {
                const totalStages = stages.length;
                const completedStages = stages.filter(s => new Date(s.endTime) < now).length;
                const currentStageProgress = currentStage ? 
                  (now - new Date(currentStage.startTime)) / (new Date(currentStage.endTime) - new Date(currentStage.startTime)) : 0;
                
                competitionData.progress = Math.min(100, Math.round(((completedStages + (currentStageProgress || 0)) / totalStages) * 100));
              } else if (competitionData.status === 'completed') {
                competitionData.progress = 100;
              } else {
                competitionData.progress = 0;
              }
            }
          }
          
          // 如果是已完成的竞赛，获取结果
          if (competitionData.status === 'completed') {
            try {
              const resultRes = await competitionsApi.getCompetitionResults(competition.competitionId);
              if (resultRes.code === 200 && resultRes.data) {
                const teamResult = resultRes.data.find(result => result.teamId === competition.teamId);
                if (teamResult) {
                  competitionData.result = teamResult.awardLevel || '未获奖';
                  competitionData.hasCertificate = !!teamResult.certificateUrl;
                }
              }
            } catch (error) {
              console.error('获取竞赛结果失败:', error);
            }
          }
        } catch (error) {
          console.error(`获取竞赛 ${competition.competitionId} 详情失败:`, error);
        }
        
        return competitionData;
      })
    );
    
    competitionsData.value = detailsPromises;
    console.log('处理后的竞赛详细数据:', competitionsData.value);
  } catch (error) {
    console.error('获取竞赛详情失败:', error);
    uni.showToast({
      title: '获取竞赛详情失败',
      icon: 'none'
    });
  }
}

// 设置当前状态标签
function setActiveStatus(status) {
  activeStatus.value = status;
}

// 根据状态获取竞赛数量
const getCompetitionCountByStatus = (status) => {
  if (!competitionsData.value || !competitionsData.value.length === 0) return 0;
  
  return competitionsData.value.filter(comp => {
    if (status === 'ongoing') {
      return comp.status === 'registering' || comp.status === 'ongoing';
    } else if (status === 'finished') {
      return comp.status === 'finished';
    }
    return false;
  }).length;
};

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 获取级别样式类
function getLevelClass(level) {
  const classMap = {
    '国家级': 'level-national',
    '省级': 'level-province',
    '市级': 'level-city',
    '校级': 'level-school'
  };
  
  return classMap[level] || '';
}

// 获取结果样式类
function getResultClass(result) {
  if (!result) return 'result-none';
  
  const classMap = {
    '一等奖': 'result-first',
    '金奖': 'result-first',
    '二等奖': 'result-second',
    '银奖': 'result-second',
    '三等奖': 'result-third',
    '铜奖': 'result-third',
    '优秀奖': 'result-honorable',
    '优胜奖': 'result-honorable'
  };
  
  return classMap[result] || 'result-other';
}

// 计算剩余天数
function getDaysLeft(dateString) {
  if (!dateString) return 0;
  
  const targetDate = new Date(dateString);
  const today = new Date();
  
  // 设置时间为当天的23:59:59
  targetDate.setHours(23, 59, 59, 999);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

// 获取倒计时
function getCountdown(dateString) {
  if (!dateString) return { days: 0, hours: 0, minutes: 0 };
  
  const targetDate = new Date(dateString);
  const now = new Date();
  
  let diffTime = targetDate - now;
  if (diffTime <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  diffTime -= days * (1000 * 60 * 60 * 24);
  
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  diffTime -= hours * (1000 * 60 * 60);
  
  const minutes = Math.floor(diffTime / (1000 * 60));
  
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0')
  };
}

// 显示筛选弹窗
function showFilterModal() {
  showFilter.value = true;
}

// 关闭筛选弹窗
function closeFilterModal() {
  showFilter.value = false;
}

// 切换级别筛选
function toggleLevelFilter(level) {
  if (level === '全部') {
    selectedLevels.value = ['全部'];
    return;
  }
  
  // 移除"全部"选项
  if (selectedLevels.value.includes('全部')) {
    selectedLevels.value = selectedLevels.value.filter(l => l !== '全部');
  }
  
  if (selectedLevels.value.includes(level)) {
    selectedLevels.value = selectedLevels.value.filter(l => l !== level);
    // 如果没有选中任何选项，添加"全部"
    if (selectedLevels.value.length === 0) {
      selectedLevels.value = ['全部'];
    }
  } else {
    selectedLevels.value.push(level);
  }
}

// 切换类型筛选
function toggleTypeFilter(type) {
  if (type === '全部') {
    selectedTypes.value = ['全部'];
    return;
  }
  
  // 移除"全部"选项
  if (selectedTypes.value.includes('全部')) {
    selectedTypes.value = selectedTypes.value.filter(t => t !== '全部');
  }
  
  if (selectedTypes.value.includes(type)) {
    selectedTypes.value = selectedTypes.value.filter(t => t !== type);
    // 如果没有选中任何选项，添加"全部"
    if (selectedTypes.value.length === 0) {
      selectedTypes.value = ['全部'];
    }
  } else {
    selectedTypes.value.push(type);
  }
}

// 切换结果筛选
function toggleResultFilter(result) {
  if (result === '全部') {
    selectedResults.value = ['全部'];
    return;
  }
  
  // 移除"全部"选项
  if (selectedResults.value.includes('全部')) {
    selectedResults.value = selectedResults.value.filter(r => r !== '全部');
  }
  
  if (selectedResults.value.includes(result)) {
    selectedResults.value = selectedResults.value.filter(r => r !== result);
    // 如果没有选中任何选项，添加"全部"
    if (selectedResults.value.length === 0) {
      selectedResults.value = ['全部'];
    }
  } else {
    selectedResults.value.push(result);
  }
}

// 设置时间范围
function setTimeRange(range) {
  selectedTimeRange.value = range;
}

// 应用筛选条件
function applyFilters() {
  // 这里添加更多的筛选逻辑，可以根据需要在计算属性中使用
  closeFilterModal();
}

// 重置所有筛选条件
function resetFilters() {
  selectedLevels.value = ['全部'];
  selectedTypes.value = ['全部'];
  selectedResults.value = ['全部'];
  selectedTimeRange.value = 'all';
}

// 跳转到竞赛详情
function navigateToCompetitionDetail(id) {
  uni.navigateTo({
    url: `/pages/competition/detail?id=${id}`
  });
}

// 跳转到作品提交页面
function navigateToSubmission(id) {
  uni.navigateTo({
    url: `/pages/competition/submission?id=${id}`
  });
}

// 跳转到团队管理页面
function navigateToTeam(teamId) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${teamId}`
  });
}

// 跳转到竞赛列表页面
function navigateToCompetitionList() {
  uni.navigateTo({
    url: '/pages/competition/list'
  });
}

// 查看证书
function viewCertificate(id) {
  uni.navigateTo({
    url: `/pages/certificate/detail?id=${id}`
  });
}

// 查看作品
function viewSubmission(id) {
  uni.navigateTo({
    url: `/pages/competition/work?id=${id}`
  });
}

// 分享成绩
function shareResult(competition) {
  shareCompetition.value = competition;
  showShareModal.value = true;
}

// 关闭分享弹窗
function closeShareModal() {
  showShareModal.value = false;
}

// 分享到微信
function shareToWechat() {
  // 实现分享到微信的逻辑
  uni.showToast({
    title: '分享到微信',
    icon: 'none'
  });
  closeShareModal();
}

// 分享到朋友圈
function shareToMoments() {
  // 实现分享到朋友圈的逻辑
  uni.showToast({
    title: '分享到朋友圈',
    icon: 'none'
  });
  closeShareModal();
}

// 分享到QQ
function shareToQQ() {
  // 实现分享到QQ的逻辑
  uni.showToast({
    title: '分享到QQ',
    icon: 'none'
  });
  closeShareModal();
}

// 保存图片
function saveImage() {
  // 实现保存图片的逻辑
  uni.showToast({
    title: '图片保存中...',
    icon: 'none'
  });
  
  setTimeout(() => {
    uni.showToast({
      title: '图片已保存到相册',
      icon: 'success'
    });
  }, 1500);
  
  closeShareModal();
}

// 取消报名
function cancelRegistration(id) {
  // 查找竞赛信息
  const competition = competitionsData.value.find(comp => comp.id === id);
  if (competition) {
    cancelCompetition.value = competition;
    showCancelConfirm.value = true;
  }
}

// 关闭取消报名确认弹窗
function closeCancelConfirm() {
  showCancelConfirm.value = false;
}

// 确认取消报名
function confirmCancelRegistration() {
  // 这里应该调用API取消报名
  uni.showLoading({
    title: '处理中...'
  });
  
  setTimeout(() => {
    // 从列表中移除该竞赛
    competitionsData.value = competitionsData.value.filter(comp => comp.id !== cancelCompetition.value.id);
    
    uni.hideLoading();
    uni.showToast({
      title: '已取消报名',
      icon: 'success'
    });
    
    closeCancelConfirm();
  }, 1500);
}


// 页面加载时获取竞赛列表
onMounted(() => {
  getMyCompetitions();
});
</script>

<style lang="scss">
// CSS变量
:root {
  --status-height: 80rpx; /* 状态标签栏的高度 */
}

// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$border-color: #F3F4F6;
$divider-color: #E5E7EB;

// 级别颜色
$national-color: #EF4444;
$province-color: #F59E0B;
$city-color: #10B981;
$school-color: #8B5CF6;

// 状态颜色
$ongoing-color: #10B981;
$upcoming-color: #F59E0B;
$completed-color: #6B7280;

// 结果颜色
$result-first-color: #F59E0B;
$result-second-color: #94A3B8;
$result-third-color: #B45309;
$result-honorable-color: #8B5CF6;

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

// 顶部导航栏样式
.action-btn {
  padding: 6rpx;
  display: flex;
  justify-content: center;
  align-items: center;
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
  height: calc(100vh - 180rpx - var(--status-height));
  box-sizing: border-box;
}

// 状态标签
.status-tabs {
  background-color: $card-color;
  padding: 15rpx 0;
  white-space: nowrap;
  margin-bottom: 15rpx;
  position: sticky;
  top: 0;
  z-index: 5;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
  height: var(--status-height);
  box-sizing: border-box;
  
  .tabs-container {
    display: inline-flex;
    padding: 0 30rpx;
    
    .tab-item {
      display: inline-flex;
      align-items: center;
      padding: 10rpx 25rpx;
      margin-right: 20rpx;
      border-radius: 30rpx;
      background-color: $background-color;
      transition: all 0.3s;
      
      text {
        font-size: 28rpx;
        color: $text-secondary;
      }
      
      .badge {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 32rpx;
        height: 32rpx;
        border-radius: 16rpx;
        background-color: $primary-color;
        margin-left: 8rpx;
        padding: 0 8rpx;
        
        text {
          font-size: 20rpx;
          color: white;
        }
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

// 竞赛区域
.competition-section {
  margin: 20rpx 0;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding:  30rpx;
    margin-bottom: 16rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .section-count {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }
  
  .competition-list {
    padding: 0 20rpx;
    
    .competition-card {
      background-color: $card-color;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      
      .card-header {
        display: flex;
        padding: 20rpx;
        border-bottom: 1rpx solid $border-color;
        
        .competition-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 12rpx;
          margin-right: 20rpx;
        }
        
        .competition-info {
          flex: 1;
          
          .competition-name {
            font-size: 30rpx;
            font-weight: bold;
            color: $text-color;
            margin-bottom: 10rpx;
          }
          
          .competition-badges {
            display: flex;
            gap: 10rpx;
            margin-bottom: 10rpx;
            
            .level-badge, .status-badge {
              display: inline-block;
              padding: 4rpx 16rpx;
              border-radius: 20rpx;
              
              text {
                font-size: 22rpx;
                color: white;
              }
            }
            
            .level-badge {
              &.level-national {
                background-color: $national-color;
              }
              
              &.level-province {
                background-color: $province-color;
              }
              
              &.level-city {
                background-color: $city-color;
              }
              
              &.level-school {
                background-color: $school-color;
              }
            }
            
            .status-badge {
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
          }
          
          .competition-date {
            display: flex;
            align-items: center;
            
            .iconfont {
              font-size: 24rpx;
              color: $text-secondary;
              margin-right: 6rpx;
            }
            
            text {
              font-size: 24rpx;
              color: $text-secondary;
            }
          }
        }
      }
      
      .card-body {
        padding: 20rpx;
        
        // 进度信息
        .progress-info {
          margin-bottom: 20rpx;
          
          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10rpx;
            
            .current-stage {
              font-size: 26rpx;
              font-weight: 500;
              color: $text-color;
            }
            
            .days-left {
              font-size: 24rpx;
              color: $ongoing-color;
              font-weight: 500;
            }
          }
          
          .progress-bar {
            height: 10rpx;
            background-color: $background-color;
            border-radius: 5rpx;
            margin-bottom: 10rpx;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background-color: $ongoing-color;
              border-radius: 5rpx;
            }
          }
          
          .stage-info {
            .stage-text {
              font-size: 24rpx;
              color: $text-secondary;
            }
          }
        }
        
        // 倒计时信息
        .countdown-info {
          margin-bottom: 20rpx;
          
          .countdown-label {
            font-size: 26rpx;
            color: $text-color;
            margin-bottom: 10rpx;
            display: block;
          }
          
          .countdown-timer {
            display: flex;
            align-items: center;
            justify-content: center;
            
            .time-unit {
              display: flex;
              flex-direction: column;
              align-items: center;
              
              .time-value {
                font-size: 36rpx;
                font-weight: bold;
                color: $upcoming-color;
                min-width: 60rpx;
                text-align: center;
              }
              
              .time-label {
                font-size: 22rpx;
                color: $text-secondary;
              }
            }
            
            .time-separator {
              font-size: 36rpx;
              font-weight: bold;
              color: $upcoming-color;
              margin: 0 10rpx;
            }
          }
        }
        
        // 结果信息
        .result-info {
          margin-bottom: 20rpx;
          
          .result-header {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;
            
            .result-label {
              font-size: 26rpx;
              color: $text-color;
              margin-right: 16rpx;
            }
            
            .result-badge {
              padding: 4rpx 16rpx;
              border-radius: 20rpx;
              
              text {
                font-size: 24rpx;
                color: white;
                font-weight: 500;
              }
              
              &.result-first {
                background-color: $result-first-color;
              }
              
              &.result-second {
                background-color: $result-second-color;
              }
              
              &.result-third {
                background-color: $result-third-color;
              }
              
              &.result-honorable {
                background-color: $result-honorable-color;
              }
              
              &.result-none, &.result-other {
                background-color: $text-muted;
              }
            }
          }
          
          .certificate-info {
            display: flex;
            align-items: center;
            
            .iconfont {
              font-size: 28rpx;
              color: $result-first-color;
              margin-right: 6rpx;
            }
            
            text {
              font-size: 24rpx;
              color: $text-secondary;
              flex: 1;
            }
            
            .view-certificate {
              display: flex;
              align-items: center;
              
              text {
                font-size: 24rpx;
                color: $primary-color;
                margin-right: 4rpx;
              }
              
              .iconfont {
                font-size: 24rpx;
                color: $primary-color;
                margin-right: 0;
              }
            }
          }
        }
        
        // 团队信息
        .team-info {
          margin-bottom: 20rpx;
          padding: 16rpx;
          background-color: $background-color;
          border-radius: 12rpx;
          
          .team-header {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;
            
            .team-label {
              font-size: 24rpx;
              color: $text-secondary;
              margin-right: 10rpx;
            }
            
            .team-name {
              font-size: 26rpx;
              font-weight: 500;
              color: $text-color;
            }
          }
          
          .team-members {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .member-avatars {
              display: flex;
              margin-left:105rpx;
              .member-avatar {
                width: 50rpx;
                height: 50rpx;
                border-radius: 25rpx;
                border: 2rpx solid white;
                margin-right: -15rpx;
              }
              
              .more-members {
                width: 50rpx;
                height: 50rpx;
                border-radius: 25rpx;
                background-color: $text-secondary;
                display: flex;
                justify-content: center;
                align-items: center;
                
                text {
                  font-size: 20rpx;
                  color: white;
                }
              }
            }
            
            .member-count {
              font-size: 24rpx;
              color: $text-secondary;
            }
          }
        }
        
        // 操作按钮
        .action-buttons {
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
  }
}
</style>