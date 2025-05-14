<template>
  <view class="container">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <view class="spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <template v-else>
      <!-- 顶部导航栏 -->
      <view class="sticky-header">
        <view class="flex-row px-4 py-3">
          <view class="back-btn" @click="goBack">
            <SvgIcon name="back" class="icon-btn"></SvgIcon>
          </view>
          <text class="text-xl font-bold text-gray-800">竞赛详情</text>
          <view class="ml-auto flex-row space-x-3">
            <view class="icon-circle" @click="toggleFavorite">
              <SvgIcon :name="isFavorite ? 'souchang' : 'weishouchang'" class="icon-btn"></SvgIcon>
            </view>
            <view class="icon-circle" @click="shareCompetition">
              <SvgIcon name="fenxiang"  class="icon-btn"></SvgIcon>
            </view>
          </view>
        </view>
      </view>

      <!-- 竞赛封面 -->
      <view class="relative">
        <image class="cover-image" :src="competition.image" mode="aspectFill"></image>
        <view class="cover-overlay">
          <view :class="getStatusBadgeClass(competition.status)">
            {{ competition.status }}
          </view>
          <text class="text-white text-2xl font-bold">{{ competition.title }}</text>
          <view class="flex-row items-center mt-1 space-x-2">
            <text class="category-tag" :class="getTagClass(competition.category)">{{ competition.category }}</text>
          </view>
        </view>
      </view>

      <!-- 关键信息 -->
      <view class="bg-white p-4 shadow-sm">
        <view class="flex-row justify-between items-center">
          <view class="flex-row items-center space-x-2">
           <SvgIcon name="baoming" class="info-icon"></SvgIcon>
            <text class="text-sm text-gray-700">报名截止: {{ getRegistrationDeadline() }}</text>
          </view>
          <view class="flex-row items-center space-x-2">
            <SvgIcon name="Baominrenshu" class="info-icon"></SvgIcon>
            <text class="text-sm text-gray-700">{{ competition.teamRequirement }}</text>
          </view>
        </view>
        <view class="flex-row justify-between mt-3">
          <view class="flex-row items-start space-x-2" style="flex: 1;">
            <SvgIcon name="Zhubanfang" class="info-icon" style="margin-top: 4rpx;"></SvgIcon>
            <text class="text-sm text-gray-700 wrap-text" style="margin-top: 10rpx;">主办方: {{ competition.organizer.name }}</text>
          </view>
          <view class="flex-row items-start level-tag" style="margin-right: 45rpx;">
            <SvgIcon name="dengji" class="info-icon" style="margin-top: 4rpx;"></SvgIcon>
            <text class="text-sm text-gray-700" style="margin-top: 10rpx;">{{ competition.level }}</text>
          </view>
        </view>
      </view>

      <!-- 标签页导航 -->
      <view class="bg-white mt-2 shadow-sm">
        <view class="flex-row border-b">
          <view 
            class="flex-1 py-3 text-center text-sm font-medium" 
            :class="currentTab === 'details' ? 'tab-active' : 'text-gray-500'"
            @click="switchTab('details')">竞赛详情</view>
          <view 
            class="flex-1 py-3 text-center text-sm font-medium" 
            :class="currentTab === 'schedule' ? 'tab-active' : 'text-gray-500'"
            @click="switchTab('schedule')">赛程安排</view>
          <view 
            class="flex-1 py-3 text-center text-sm font-medium" 
            :class="currentTab === 'results' ? 'tab-active' : 'text-gray-500'"
            @click="switchTab('results')">比赛结果</view>
          <view 
            class="flex-1 py-3 text-center text-sm font-medium" 
            :class="currentTab === 'teams' ? 'tab-active' : 'text-gray-500'"
            @click="switchTab('teams')">参赛队伍</view>
        </view>
      </view>

      <!-- 竞赛详情内容 -->
      <view v-if="currentTab === 'details'" class="bg-white p-4 mt-2 shadow-sm">
        <view class="font-bold text-lg text-gray-800 mb-3">竞赛简介</view>
        <text class="text-gray-700 text-sm leading-relaxed">{{ competition.description }}</text>
        
        <view v-if="competition.requirements" class="font-bold text-lg text-gray-800 mt-6 mb-3">参赛要求</view>
        <text v-if="competition.requirements" class="text-gray-700 text-sm leading-relaxed">{{ competition.requirements }}</text>
        
        <view v-else class="text-gray-700 text-sm space-y-2 list-disc pl-5 mt-6">
          <view class="list-item">参赛项目须为本校在校生，允许跨校组队</view>
          <view class="list-item">参赛团队成员{{ competition.teamRequirement }}</view>
          <view class="list-item">参赛项目需具有创新性、可行性和商业价值</view>
          <view class="list-item">参赛项目需提交商业计划书和路演PPT</view>
          <view class="list-item">参赛项目需在报名截止前完成在线提交</view>
        </view>
        
        <view class="font-bold text-lg text-gray-800 mt-6 mb-3">联系方式</view>
        <view class="space-y-2 text-sm text-gray-700">
          <text v-if="competition.contactInfo.phone">联系电话：{{ competition.contactInfo.phone }}</text>
          <text v-else>联系人：竞赛组委会</text>
          <view v-if="competition.contactInfo.email">邮箱：{{ competition.contactInfo.email }}</view>
          <view v-if="competition.websiteUrl">官网：{{ competition.websiteUrl }}</view>
        </view>
        
        <!-- 附件列表 -->
        <view v-if="competition.attachments && competition.attachments.length > 0" class="mt-6">
          <view class="font-bold text-lg text-gray-800 mb-3">相关资料</view>
          <view v-if="competition.attachments.length === 0">无</view>
          <view class="space-y-3" v-else>
            <view v-for="(attachment, index) in competition.attachments" :key="index" 
              class="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <text class="flex-1 text-sm text-gray-700">{{ attachment.fileName }}</text>
              <view class="download-btn">
                <SvgIcon name="xiazai" class="download-icon"></SvgIcon>
                <text class="text-xs text-white">下载</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 相关竞赛 - 移动到详情标签页内 -->
        <view class="mt-6">
          <view class="font-bold text-lg text-gray-800 mb-3">相关竞赛</view>
          <view class="related-grid">
            <view v-for="(relatedComp, index) in relatedCompetitions" :key="index" class="related-card">
              <view class="related-image-container">
                <image :src="relatedComp.image" class="related-image"></image>
              </view>
              <view class="p-3">
                <text class="font-bold text-sm text-gray-800">{{ relatedComp.title }}</text>
                <view class="flex-row items-center mt-1">
                  <text class="text-xs text-gray-500">报名截止: {{ relatedComp.deadline }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 赛程安排内容 -->
      <view v-if="currentTab === 'schedule'" class="bg-white p-4 mt-2 shadow-sm">
        <view class="relative">
          <!-- 时间轴 -->
          <view class="timeline-line"></view>
          
          <!-- 阶段列表 -->
          <view v-if="competitionStages.length === 0" class="empty-state">
            <text class="text-gray-500">暂无赛程安排</text>
          </view>
          
          <view v-else>
            <view v-for="(stage, index) in competitionStages" :key="stage.id" class="timeline-item">
            <view class="timeline-dot-container">
              <view class="timeline-dot" :class="stage.active ? 'active-dot' : ''">
                <text class="timeline-dot-text">{{ index + 1 }}</text>
              </view>
            </view>
            <view class="timeline-content" :class="stage.active ? 'active-content' : ''">
              <view class="flex-row justify-between items-center mb-2">
                  <text class="stage-title" :class="stage.active ? 'text-blue-800' : 'text-gray-700'">{{ stage.title }}</text>
                <text class="status-text" :class="stage.active ? 'active-status' : 'inactive-status'">{{ stage.status }}</text>
              </view>
                <view class="stage-period-container">
                  <SvgIcon name="shijian" class="stage-icon"></SvgIcon>
                  <text class="stage-period">{{ stage.period }}</text>
            </view>
                <view class="stage-desc-container">
                  <text class="stage-desc">{{ stage.description }}</text>
                </view>
                <view v-if="stage.location" class="stage-location-container">
                  <SvgIcon name="didian" class="stage-icon"></SvgIcon>
                  <text class="stage-location">{{ stage.location }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 比赛结果内容 -->
      <view v-if="currentTab === 'results'" class="bg-white p-4 mt-2 shadow-sm">
        <!-- 阶段选择筛选器 -->
        <view class="mb-4">
          <view class="text-gray-600 text-sm mb-2">比赛阶段</view>
          <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
            <view class="stage-filter-container">
              <view 
                class="stage-filter-item" 
                :class="{ 'active': selectedStageId === 'all' }"
                @click="filterResultsByStage('all')">
                全部
              </view>
              <view 
                v-for="stage in competitionStages" 
                :key="stage.id"
                class="stage-filter-item" 
                :class="{ 'active': selectedStageId === stage.id }"
                @click="filterResultsByStage(stage.id)">
                {{ stage.title }}
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 结果列表 -->
        <view v-if="competitionResults.length > 0" class="results-list">
          <view v-for="result in filteredResults" :key="result.id" class="result-card">
            <view class="result-header">
              <view class="flex-row items-center">
                <image :src="result.teamLogo || '/static/image/default-logo.png'" class="team-logo"></image>
                <view class="ml-3">
                  <text class="font-bold text-gray-800">{{ result.teamName }}</text>
                  <view class="flex-row items-center mt-1">
                    <text class="text-xs text-gray-600">{{ result.teamMembers || 0 }}人团队</text>
                  </view>
                </view>
              </view>
              <view :class="['award-badge', getAwardClass(result.awardType)]">
                {{ result.awardType }}
              </view>
            </view>
            
            <!-- 添加队员头像行 -->
            <view v-if="result.memberAvatars && result.memberAvatars.length > 0" class="member-avatars-row">
              <image 
                v-for="(avatar, index) in result.memberAvatars" 
                :key="index" 
                :src="avatar || '/static/images/default-avatar.png'" 
                class="member-avatar">
              </image>
              <view v-if="result.memberCount > result.memberAvatars.length" class="more-members">
                +{{ result.memberCount - result.memberAvatars.length }}
              </view>
            </view>
            
            <view class="result-content">
              <view class="result-detail-item">
                <text class="result-label">比赛阶段:</text>
                <text class="result-value">{{ getStageNameById(result.stageId) }}</text>
              </view>
              
              <view class="result-detail-item" v-if="result.announcedAt">
                <text class="result-label">公布时间:</text>
                <text class="result-value">{{ result.formattedDate }}</text>
              </view>
              
              <view class="result-detail-item" v-if="result.awardDetails && result.awardDetails.bonus">
                <text class="result-label">奖金:</text>
                <text class="result-value">{{ result.awardDetails.bonus }}元</text>
              </view>
              
              <view class="result-detail-item" v-if="result.awardDetails && result.awardDetails.certificate">
                <text class="result-label">证书编号:</text>
                <text class="result-value">{{ result.awardDetails.certificate }}</text>
              </view>
              
              <view class="result-detail-item" v-if="result.metadata && result.metadata.sponsor">
                <text class="result-label">赞助方:</text>
                <text class="result-value">{{ result.metadata.sponsor }}</text>
              </view>
            </view>
            
            <view class="result-footer">
              <text class="status-text" :class="{'text-green-600': result.resultStatus === 'announced'}">
                {{ result.resultStatus === 'announced' ? '已公布' : '待公布' }}
              </text>
              <button class="view-team-btn" @click.stop="viewTeamDetail(result.teamId)">查看队伍</button>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else class="empty-state">
          <text class="text-gray-500">暂无比赛结果</text>
        </view>
      </view>
      
      <!-- 参赛队伍内容 -->
      <view v-if="currentTab === 'teams'" class="bg-white p-4 mt-2 shadow-sm">
        <!-- 搜索和筛选 -->
        <view class="search-filter-container">
          <view class="search-box">
            <text class="iconfont icon-search search-icon"></text>
            <input type="text" placeholder="搜索队伍" class="search-input" v-model="searchText" />
            <text v-if="searchText" class="iconfont icon-close-circle clear-icon" @click="clearSearch"></text>
          </view>
          <view class="filter-btn" @click="toggleFilter">
            <text class="iconfont icon-filter filter-icon"></text>
            <text class="filter-text">筛选</text>
          </view>
        </view>
        
        <!-- 队伍列表 -->
        <view v-if="teams.length > 0" class="space-y-4">
          <view 
            v-for="team in teams" 
            :key="team.id" 
            class="team-card"
            @click="viewTeamDetail(team.id)">
            <view class="flex-row justify-between items-start">
              <view>
                <text class="font-bold text-gray-800">{{ team.name }}</text>
                <view class="flex-row items-center mt-1">
                  <text class="faculty-tag" :style="{ backgroundColor: team.facultyColor + '20', color: team.facultyColor }">{{ team.faculty }}</text>
                  <text class="text-xs text-gray-500">{{ team.memberCount }}人团队</text>
                </view>
              </view>
              <view class="team-status" :style="{ backgroundColor: team.statusColor + '20', color: team.statusColor }">{{ team.statusText }}</view>
            </view>
            <text class="text-sm text-gray-600 mt-3">项目简介：{{ team.description }}</text>
            
            <!-- 角色标签 -->
            <view v-if="team.roles && team.roles.length > 0" class="role-tags mt-3">
              <view 
                v-for="(role, roleIndex) in team.roles" 
                :key="roleIndex" 
                :class="['role-tag', role.isFilled ? 'role-filled' : 'role-recruiting']">
                <text class="role-name">{{ role.name }}</text>
                <text class="role-count">{{ role.currentCount || 0 }}/{{ role.requiredCount || 1 }}</text>
              </view>
            </view>
            
            <view class="flex-row items-center justify-between mt-3">
              <view class="flex-row member-avatars">
                <image 
                  v-for="(avatar, idx) in team.avatars" 
                  :key="idx" 
                  :src="avatar || '/static/images/default-avatar.png'" 
                  class="member-avatar">
                </image>
                <view v-if="team.remainingCount > 0" class="member-avatar-more">+{{ team.remainingCount }}</view>
              </view>
              <text class="text-blue-500 text-sm">{{ team.actionText }}</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="!teamsLoading" class="empty-state">
          <text class="text-gray-500">暂无参赛队伍</text>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="teamsLoading" class="loading-state">
          <view class="spinner-sm"></view>
          <text class="text-sm text-gray-500 ml-2">加载中...</text>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="teams.length > 0 && teamsHasMore" class="text-center mt-6">
          <button class="load-more-btn" @click="loadMoreTeams">加载更多</button>
        </view>
      </view>
      
      <!-- 底部固定按钮 -->
      <view class="fixed-bottom">
        <button class="team-btn" @click="createTeam">
          <SvgIcon name="chuangjianduiwu" class="btn-icon"></SvgIcon>
          <text>创建队伍</text>
        </button>
        <button 
          class="register-btn" 
          :class="{'disabled-btn': competition.statusCode === '0' || competition.statusCode === '3'}"
          :disabled="competition.statusCode === '0' || competition.statusCode === '3'"
          @click="handleActionButton">
          <SvgIcon v-if="competition.statusCode === '0'" name="tixingwo" class="btn-icon"></SvgIcon>
          <text>{{ getActionButtonText() }}</text>
        </button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api';
import { icons } from '@/static/svg/icons.js';
import SvgIcon from '@/components/SvgIcon.vue';

// 竞赛ID和加载状态
const competitionId = ref(null);
const loading = ref(false);
// 当前激活的标签页
const currentTab = ref('details');

// 竞赛详情数据
const competition = ref({
  id: null,
  title: '',
  category: '',
  level: '国家级',
  status: '',  // 可能的值: '未开始', '报名中', '进行中', '已截止'
  statusCode: '',   // 状态码: "0"=未开始, "1"=报名中, "2"=进行中, "3"=已截止
  image: '',
  registrationPeriod: '',
  registrationStart: '',
  registrationDeadline: '',
  competitionPeriod: '',
  location: '线上初赛 + 线下决赛',
  teamRequirement: '',
  description: '',
  shortDescription: '',
  requirements: '',
  organizer: {
    name: '',
    description: '',
    logo: ''
  },
  contactInfo: {
    phone: '',
    email: ''
  },
  teamSize: 0,
  teamMax: 0,
  websiteUrl: '',
  viewCount: 0,
  attachments: [],
  categoryNames: [],
  coverImageUrl: ''
});

// 赛程阶段数据
const competitionStages = ref([]);

// 相关竞赛
const relatedCompetitions = ref([
  {
    title: '挑战杯创业计划大赛',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500',
    deadline: '6月10日'
  },
  {
    title: '创青春创业大赛',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    deadline: '7月5日'
  }
]);

// 参赛队伍数据
const teams = ref([]);
const teamsLoading = ref(false);
const teamsCurrentPage = ref(1);
const teamsPageSize = ref(10);
const teamsHasMore = ref(true);
const searchText = ref('');

// 收藏状态
const isFavorite = ref(false);

// 比赛结果相关
const selectedStageId = ref('all');
const competitionResults = ref([]);
const filteredResults = computed(() => {
  if (selectedStageId.value === 'all') {
    return competitionResults.value;
  }
  return competitionResults.value.filter(result => result.stageId == selectedStageId.value);
});

// 获取竞赛详情数据
async function getCompetitionDetail(id) {
  loading.value = true;
  try {
    const res = await api.competitions.getCompetitionDetail(id);
    if (res && res.code === 200 && res.data) {
      const data = res.data;
      
      // 更新竞赛基本信息
      competition.value = {
        ...competition.value,
        id: data.id,
        title: data.title,
        category: data.categoryNames && data.categoryNames.length > 0 ? data.categoryNames[0] : '',
        level: data.level || '国家级',
        status: getStatusText(data.status),
        statusCode: data.status,
        image: data.coverImageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
        registrationStart: data.registrationStart,
        registrationDeadline: data.registrationDeadline,
        registrationPeriod: formatDatePeriod(data.registrationStart, data.registrationDeadline),
        description: data.description || data.shortDescription || '',
        shortDescription: data.shortDescription || '',
        requirements: data.requirements || '',
        teamRequirement: `${data.teamSize}~${data.teamMax}人/队`,
        teamSize: data.teamSize,
        teamMax: data.teamMax,
        organizer: {
          name: data.organizer || '未知主办方',
          description: '',
          logo: ''
        },
        contactInfo: data.contactInfo || {
          phone: '暂无联系方式',
          email: ''
        },
        websiteUrl: data.websiteUrl || '',
        viewCount: data.viewCount || 0,
        attachments: data.attachments || [],
        categoryNames: data.categoryNames || [],
        coverImageUrl: data.coverImageUrl || ''
      };
      
      // 获取竞赛阶段
      getCompetitionStages(data.id);
      
      // 获取比赛结果
      getCompetitionResults(data.id);
      
      console.log('竞赛详情数据:', competition.value);
    } else {
      uni.showToast({
        title: '获取竞赛详情失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取竞赛详情错误:', error);
    uni.showToast({
      title: '获取竞赛详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 获取竞赛阶段
async function getCompetitionStages(competitionId) {
  try {
    const res = await api.competitions.getCompetitionStages(competitionId);
    if (res && res.code === 200 && res.data) {
      // 处理阶段数据
      const stagesData = res.data.map(stage => {
        // 解析元数据获取地点信息
        let location = '';
        if (stage.metadata) {
          try {
            const metadata = JSON.parse(stage.metadata);
            location = metadata.location || '';
          } catch (e) {
            console.error('解析元数据失败:', e);
          }
        }
        
        // 获取阶段状态
        let active = false;
        let statusText = '';
        
        switch(stage.status) {
          case 'pending':
            statusText = '未开始';
            active = false;
            break;
          case 'ongoing':
          case 'active':
            statusText = '进行中';
            active = true;
            break;
          case 'completed':
            statusText = '已结束';
            active = false;
            break;
          default:
            statusText = '未知状态';
            active = false;
        }
        
        return {
          id: stage.id,
          title: stage.stageName,
          period: formatDatePeriod(stage.startTime, stage.endTime),
          description: stage.description,
          status: statusText,
          active,
          location,
          rawData: stage
        };
      });
      
      // 按开始时间排序
      stagesData.sort((a, b) => {
        const aTime = new Date(a.rawData.startTime).getTime();
        const bTime = new Date(b.rawData.startTime).getTime();
        return aTime - bTime;
      });
      
      competitionStages.value = stagesData;
      console.log('竞赛阶段数据:', competitionStages.value);
    } else {
      console.warn('获取竞赛阶段失败或无数据:', res);
    }
  } catch (error) {
    console.error('获取竞赛阶段错误:', error);
  }
}

// 根据状态码获取状态文本
function getStatusText(status) {
  switch(status) {
    case '0': return '未开始';
    case '1': return '报名中';
    case '2': return '进行中';
    case '3': return '已截止';
    default: return '未知状态';
  }
}

// 格式化日期区间
function formatDatePeriod(startDate, endDate) {
  if (!startDate || !endDate) return '';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// 获取竞赛相关队伍列表
async function getCompetitionTeams(refresh = true) {
  if (refresh) {
    teamsCurrentPage.value = 1;
    teams.value = [];
  }
  
  if (!teamsHasMore.value && !refresh) return;
  
  teamsLoading.value = true;
  try {
    // 调用队伍列表API，传入竞赛ID作为筛选条件
    const res = await api.team.getTeamList({
      pageNum: teamsCurrentPage.value,
      pageSize: teamsPageSize.value,
      competitionId: competitionId.value
    });
    
    if (res.code === 200 && res.data) {
      const teamList = res.data.list || [];
      
      // 处理队伍数据，添加UI需要的状态颜色和展示数据
      const processedTeams = teamList.map(team => {
        // 处理头像数据
        let avatars = [];
        if (team.teamMemberAvatars) {
          if (typeof team.teamMemberAvatars === 'string') {
            avatars = team.teamMemberAvatars.split(',').filter(avatar => avatar);
          } else if (Array.isArray(team.teamMemberAvatars)) {
            avatars = team.teamMemberAvatars.filter(avatar => avatar);
          }
        } else if (team.teamMembers && Array.isArray(team.teamMembers)) {
          avatars = team.teamMembers.slice(0, 3); // 最多显示3个头像
        }
        
        // 设置状态颜色
        let statusColor = '#6B7280'; // 默认灰色
        if (team.status === '0' || team.statusText === '招募中') {
          statusColor = '#2563EB'; // 蓝色 - 招募中
        } else if (team.status === '1' || team.statusText === '进行中') {
          statusColor = '#10B981'; // 绿色 - 进行中
        } else if (team.status === '2' || team.statusText === '已完成') {
          statusColor = '#059669'; // 深绿色 - 已完成
        }
        
        // 计算成员人数和剩余席位
        const memberCount = team.memberCount || team.currentMemberCount || 0;
        const maxMemberCount = team.maxMemberCount || 0;
        const remainingCount = Math.max(0, maxMemberCount - memberCount);
        
        // 处理队伍所属院系/专业颜色
        const facultyColor = getRandomColor(team.faculty || team.direction || '');
        
        // 处理角色信息
        let roles = [];
        if (team.roles && team.roles.length > 0) {
          // 标准化角色数据格式，确保有统一的字段名
          roles = team.roles.map(role => ({
            id: role.id || 0,
            name: role.name || '未知角色',
            description: role.description || '',
            currentCount: role.currentCount || 0,
            requiredCount: role.requiredCount || 1,
            isFilled: (role.currentCount || 0) >= (role.requiredCount || 1)
          }));
        }
        
        return {
          ...team,
          avatars: avatars.slice(0, 3), // 最多显示3个头像
          statusColor,
          memberCount,
          remainingCount,
          actionText: team.status === '0' ? '申请加入' : '查看详情',
          facultyColor,
          faculty: team.direction || '未知方向',  // 使用研究方向作为院系显示
          roles
        };
      });
      
      // 更新队伍列表数据
      if (refresh) {
        teams.value = processedTeams;
      } else {
        teams.value = [...teams.value, ...processedTeams];
      }
      
      // 更新分页信息
      teamsHasMore.value = res.data.hasNext || false;
      
      if (teams.value.length === 0 && !refresh) {
        uni.showToast({
          title: '没有更多团队了',
          icon: 'none'
        });
      }
    } else {
      if (refresh) {
        uni.showToast({
          title: '暂无参赛队伍',
          icon: 'none'
        });
      }
    }
  } catch (error) {
    console.error('获取竞赛队伍列表失败:', error);
    uni.showToast({
      title: '获取队伍列表失败',
      icon: 'none'
    });
  } finally {
    teamsLoading.value = false;
  }
}

// 生成一致的随机颜色（基于字符串）
function getRandomColor(str) {
  // 使用固定的颜色集
  const colors = [
    '#2563EB', // 蓝色
    '#10B981', // 绿色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#F59E0B', // 橙色
    '#EF4444'  // 红色
  ];
  
  // 简单的哈希算法，将字符串映射到颜色数组的索引
  let hash = 0;
  if (str.length === 0) return colors[0];
  
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  
  hash = Math.abs(hash) % colors.length;
  return colors[hash];
}

// 加载更多队伍
function loadMoreTeams() {
  if (teamsLoading.value || !teamsHasMore.value) return;
  
  teamsCurrentPage.value++;
  getCompetitionTeams(false);
}

// 切换标签页
function switchTab(tab) {
  currentTab.value = tab;
  
  // 当切换到队伍标签页时，自动加载队伍数据
  if (tab === 'teams' && teams.value.length === 0) {
    getCompetitionTeams();
  }
  
  // 当切换到结果标签页时，自动加载结果数据
  if (tab === 'results' && competitionResults.value.length === 0) {
    getCompetitionResults(competitionId.value);
  }
}

// 前往队伍详情页
function viewTeamDetail(teamId) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${teamId}`
  });
}

// 获取页面参数并请求数据
onMounted(() => {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  
  if (page.$page && page.$page.options) {
    competitionId.value = page.$page.options.id;
    
    if (competitionId.value) {
      // 请求竞赛详情数据
      getCompetitionDetail(competitionId.value).finally(() => {
        uni.hideLoading();
      });
    } else {
      uni.hideLoading();
      uni.showToast({
        title: '竞赛ID不存在',
        icon: 'none'
      });
    }
  } else {
    uni.hideLoading();
  }
});

// 根据分类返回对应的样式类
function getTagClass(category) {
  switch(category) {
    case '创新创业':
      return 'orange-tag';
    case '学科竞赛':
      return 'green-tag';
    case '科技竞赛':
      return 'blue-tag';
    case '文体竞赛':
      return 'purple-tag';
    case '程序设计':
      return 'cxsj-tag';
    default:
      return 'gray-tag';
  }
}

// 获取状态标签的样式类
function getStatusBadgeClass(status) {
  switch(status) {
    case '未开始':
      return 'status-badge bg-gray-500';
    case '报名中':
      return 'status-badge bg-green-500';
    case '进行中':
      return 'status-badge bg-blue-500';
    case '已截止':
      return 'status-badge bg-gray-500';
    default:
      return 'status-badge bg-gray-500';
  }
}

// 根据竞赛状态返回按钮文本
function getActionButtonText() {
  switch(competition.value.status) {
    case '未开始':
      return '提醒我';
    case '报名中':
      return '寻找队伍';
    case '进行中':
      return '查看队伍';
    case '已截止':
      return '查看结果';
    default:
      return '了解详情';
  }
}

// 获取报名截止日期
function getRegistrationDeadline() {
  if (competition.value.registrationDeadline) {
    const date = new Date(competition.value.registrationDeadline);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  
  if (competition.value.registrationPeriod) {
    const periodParts = competition.value.registrationPeriod.split(' - ');
    return periodParts.length > 1 ? periodParts[1] : competition.value.registrationPeriod;
  }
  
  return '暂无截止日期';
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

function clearSearch() {
  searchText.value = '';
  // 这里可以添加搜索逻辑
}

function toggleFilter() {
  // 这里可以添加筛选逻辑
  console.log('打开筛选选项');
}

// 跳转到创建团队页面
function createTeam() {
  uni.navigateTo({
    url: `/pages/team/create?competitionId=${competition.value.id}&competitionName=${encodeURIComponent(competition.value.title)}`
  });
}

// 处理行动按钮点击
function handleActionButton() {
  const buttonText = getActionButtonText();
  
  switch(buttonText) {
    case '寻找队伍':
    case '查看队伍':
      // 切换到参赛队伍标签页
      currentTab.value = 'teams';
      // 如果队伍列表为空，则加载队伍数据
      if (teams.value.length === 0) {
        getCompetitionTeams();
      }
      // 滚动到队伍列表位置
      uni.pageScrollTo({
        selector: '.tab-active',
        duration: 300
      });
      break;
    case '提醒我':
      uni.showToast({
        title: '已设置提醒',
        icon: 'success'
      });
      break;
    case '查看结果':
      uni.showToast({
        title: '比赛结果即将公布',
        icon: 'none'
      });
      break;
    default:
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
  }
}

// 收藏/取消收藏
function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  if (isFavorite.value) {
    uni.showToast({
      title: '收藏成功',
      icon: 'success',
      duration: 2000
    });
  } else {
    uni.showToast({
      title: '已取消收藏',
      icon: 'none',
      duration: 2000
    });
  }
}

// 分享竞赛
function shareCompetition() {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none',
    duration: 2000
  });
}

// 获取比赛结果
async function getCompetitionResults(competitionId) {
  try {
    console.log('开始获取比赛结果数据，竞赛ID:', competitionId);
    const res = await api.competitionResults.getCompetitionResults(competitionId);
    console.log('获取到比赛结果响应:', res);
    
    if (res && res.code === 200 && res.data) {
      // 如果返回的是单个结果，转换为数组
      const resultsData = Array.isArray(res.data) ? res.data : [res.data];
      console.log('处理比赛结果数据:', resultsData);
      
      // 处理结果数据
      const processedResults = await Promise.all(resultsData.map(async (result) => {
        // 解析奖项详情和元数据
        let awardDetails = {};
        let metadata = {};
        
        try {
          if (result.awardDetails) {
            awardDetails = typeof result.awardDetails === 'string' 
              ? JSON.parse(result.awardDetails) 
              : result.awardDetails;
          }
          
          if (result.metadata) {
            metadata = typeof result.metadata === 'string' 
              ? JSON.parse(result.metadata) 
              : result.metadata;
          }
        } catch (e) {
          console.error('解析JSON数据失败:', e);
        }
        
        // 获取队伍信息
        let teamName = '未知队伍';
        let teamLogo = '';
        let teamMembers = 0;
        let memberAvatars = [];
        
        try {
          // 调用API获取队伍详情
          console.log('开始获取队伍信息，队伍ID:', result.teamId);
          const teamRes = await api.competitionResults.getTeamDetail(result.teamId);
          console.log('获取到队伍响应:', teamRes);
          
          if (teamRes && teamRes.code === 200 && teamRes.data) {
            teamName = teamRes.data.name || '未知队伍';
            teamLogo = teamRes.data.logo || '';
            
            // 优先从roles计算团队成员数量，并确保队长计入团队人数
            if (teamRes.data.roles && Array.isArray(teamRes.data.roles)) {
              // 计算所有角色的currentCount总和
              teamMembers = teamRes.data.roles.reduce((total, role) => {
                return total + (role.currentCount || 0);
              }, 0);
              
              // 确保队长计入团队人数（队长可能不在roles中单独计算）
              // 如果有leaderId，假设队长可能未被计入角色数量中，加1
              teamMembers += 1;
              
              console.log('从roles计算的团队成员数量(包含队长):', teamMembers);
            } else if (teamRes.data.memberCount !== undefined && teamRes.data.memberCount !== null) {
              teamMembers = teamRes.data.memberCount;
              // 确保加上队长
              if (teamRes.data.leaderId && !teamRes.data.isLeaderCountedInMemberCount) {
                teamMembers += 1;
              }
            } else if (teamRes.data.currentMemberCount !== undefined && teamRes.data.currentMemberCount !== null) {
              teamMembers = teamRes.data.currentMemberCount;
              // 确保加上队长
              if (teamRes.data.leaderId && !teamRes.data.isLeaderCountedInCurrentMemberCount) {
                teamMembers += 1;
              }
            } else if (teamRes.data.teamMembers && Array.isArray(teamRes.data.teamMembers)) {
              teamMembers = teamRes.data.teamMembers.length;
            } else if (teamRes.data.members && Array.isArray(teamRes.data.members)) {
              teamMembers = teamRes.data.members.length;
            } else {
              // 如果没有其他数据，至少有一个队长
              teamMembers = 1;
            }
            
            // 调用专门的接口获取团队成员信息
            try {
              const membersRes = await api.competitionResults.getTeamMembers(result.teamId);
              console.log('获取团队成员响应:', membersRes);
              
              if (membersRes && membersRes.code === 200 && membersRes.data) {
                const members = membersRes.data;
                
                // 从成员数据中获取头像
                if (Array.isArray(members)) {
                  // 更新团队成员数量
                  teamMembers = members.length;
                  
                  // 提取成员头像
                  members.forEach(member => {
                    if (member.userAvatarUrl) {
                      memberAvatars.push(member.userAvatarUrl);
                    } else if (member.avatarUrl) {
                      memberAvatars.push(member.avatarUrl);
                    }
                  });
                  
                  // 排序头像，确保队长在前
                  const leaderMember = members.find(m => m.isLeader === true);
                  if (leaderMember && leaderMember.userAvatarUrl) {
                    // 移除队长头像（避免重复）
                    memberAvatars = memberAvatars.filter(avatar => avatar !== leaderMember.userAvatarUrl);
                    // 将队长头像放在第一位
                    memberAvatars.unshift(leaderMember.userAvatarUrl);
                  }
                  
                  console.log('从团队成员接口获取的头像:', memberAvatars);
                }
              }
            } catch (memberError) {
              console.error('获取团队成员失败:', memberError);
            }
            
            // 如果没有通过成员接口获取到头像，尝试其他方式
            if (memberAvatars.length === 0) {
              console.log('检查队伍详情数据结构:', teamRes.data);
              
              // 首先从data数组中获取队员头像
              if (teamRes.data.data && Array.isArray(teamRes.data.data)) {
                const memberData = teamRes.data.data;
                console.log('发现队员data数组:', memberData);
                
                // 从队员数据中提取头像URL
                memberData.forEach(member => {
                  if (member.avatar) {
                    memberAvatars.push(member.avatar);
                  } else if (member.avatarUrl) {
                    memberAvatars.push(member.avatarUrl);
                  } else if (member.userAvatar) {
                    memberAvatars.push(member.userAvatar);
                  }
                });
                
                console.log('从data数组提取的队员头像:', memberAvatars);
              }
              
              if (teamRes.data.memberAvatars) {
                // 如果是字符串，可能是逗号分隔的URL列表
                if (typeof teamRes.data.memberAvatars === 'string') {
                  const avatarsFromString = teamRes.data.memberAvatars.split(',').filter(url => url && url.trim());
                  memberAvatars = [...memberAvatars, ...avatarsFromString];
                } else if (Array.isArray(teamRes.data.memberAvatars)) {
                  memberAvatars = [...memberAvatars, ...teamRes.data.memberAvatars.filter(url => url)];
                }
              } else if (teamRes.data.teamMemberAvatars) {
                // 备选字段
                if (typeof teamRes.data.teamMemberAvatars === 'string') {
                  const avatarsFromString = teamRes.data.teamMemberAvatars.split(',').filter(url => url && url.trim());
                  memberAvatars = [...memberAvatars, ...avatarsFromString];
                } else if (Array.isArray(teamRes.data.teamMemberAvatars)) {
                  memberAvatars = [...memberAvatars, ...teamRes.data.teamMemberAvatars.filter(url => url)];
                }
              } else if (teamRes.data.members && Array.isArray(teamRes.data.members)) {
                // 从members数组中提取头像
                const avatarsFromMembers = teamRes.data.members
                  .filter(member => member && member.avatarUrl)
                  .map(member => member.avatarUrl);
                memberAvatars = [...memberAvatars, ...avatarsFromMembers];
              }
              
              // 确保队长头像在列表中且排在第一位
              if (teamRes.data.leaderAvatarUrl) {
                // 检查队长头像是否已经在列表中，如果在，则移除
                memberAvatars = memberAvatars.filter(avatar => avatar !== teamRes.data.leaderAvatarUrl);
                // 将队长头像添加到列表最前面
                memberAvatars.unshift(teamRes.data.leaderAvatarUrl);
              }
            }
            
            // 移除重复的头像
            memberAvatars = [...new Set(memberAvatars)].filter(Boolean);
            
            console.log('最终处理后的成员头像列表:', memberAvatars);
          }
        } catch (e) {
          console.error('获取队伍信息失败:', e);
        }
        
        return {
          ...result,
          awardDetails,
          metadata,
          teamName,
          teamLogo,
          teamMembers,
          memberAvatars,
          memberCount: teamMembers, // 添加memberCount字段用于显示
          formattedDate: formatDate(result.announcedAt)
        };
      }));
      
      competitionResults.value = processedResults;
      console.log('最终处理的比赛结果数据:', competitionResults.value);
      
      // 如果没有数据，显示提示
      if (competitionResults.value.length === 0) {
        uni.showToast({
          title: '暂无比赛结果数据',
          icon: 'none'
        });
      }
    } else {
      console.warn('获取比赛结果失败或无数据:', res);
      uni.showToast({
        title: '暂无比赛结果',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取比赛结果错误:', error);
    uni.showToast({
      title: '获取比赛结果失败',
      icon: 'none'
    });
  }
}

// 添加日期格式化函数
function formatDate(dateString) {
  if (!dateString) return '未知时间';
  
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  } catch (e) {
    console.error('日期格式化失败:', e);
    return '日期格式有误';
  }
}

// 根据阶段ID获取阶段名称
function getStageNameById(stageId) {
  const stage = competitionStages.value.find(s => s.id == stageId);
  return stage ? stage.title : '未知阶段';
}

// 根据奖项类型获取样式类
function getAwardClass(awardType) {
  switch(awardType) {
    case '金奖': return 'gold-award';
    case '银奖': return 'silver-award';
    case '铜奖': return 'bronze-award';
    case '特等奖': return 'special-award';
    case '一等奖': return 'first-award';
    case '二等奖': return 'second-award';
    case '三等奖': return 'third-award';
    case '优秀奖': return 'excellent-award';
    default: return '';
  }
}

// 筛选比赛结果
function filterResultsByStage(stageId) {
  selectedStageId.value = stageId;
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';

page {
  background-color: #f8fafc;
  font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: 120rpx;
}

.container {
  width: 100%;
}

/* 顶部导航栏 */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

// 通用样式
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.wrap-text {
  word-break: break-word;
  white-space: normal;
}

.level-tag {
  min-width: 160rpx;
  justify-content: flex-end;
}

.px-4 {
  padding-left: 32rpx;
  padding-right: 32rpx;
}

.py-3 {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}

.mr-3 {
  margin-right: 24rpx;
}

.ml-auto {
  margin-left: auto;
}

.space-x-3 > view:not(:first-child) {
  margin-left: 24rpx;
}

.text-xl {
  font-size: 36rpx;
}

.font-bold {
  font-weight: bold;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-800 {
  color: #1f2937;
}

.p-2 {
  padding: 16rpx;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

/* 竞赛封面 */
.relative {
  position: relative;
}

.cover-image {
  width: 100%;
  height: 384rpx;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.status-badge {
  position: absolute;
  right: 32rpx;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  color: white;
  z-index: 5;
}

.bg-green-500 {
  background-color: #10b981 !important;
}

.bg-gray-500 {
  background-color: #6b7280 !important;
}

.bg-blue-500 {
  background-color: #2679cc !important;
}

.text-white {
  color: #ffffff;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.8);
}

.text-2xl {
  font-size: 48rpx;
}

.mt-1 {
  margin-top: 8rpx;
}

.space-x-2 > view:not(:first-child) {
  margin-left: 16rpx;
}

.category-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.orange-tag {
  background-color: #fff7ed;
  color: #ea580c;
}

.green-tag {
  background-color: #ecfdf5;
  color: #10b981;
}

.blue-tag {
  background-color: #eff6ff;
  color: #3fbcfa;
}

.purple-tag {
  background-color: #f5f3ff;
  color: #8b5cf6;
}
.cxsj-tag {
  background-color: #f5f3ff;
  color: #1270db;
}

.text-xs {
  font-size: 24rpx;
}

/* 关键信息 */
.shadow-sm {
  box-shadow: 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.05);
}

.p-4 {
  padding: 32rpx;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.space-x-2 > view:not(:first-child) {
  margin-left: 16rpx;
}

.info-icon {
  width: 45rpx;
  height: 45rpx;
  margin-right: 8rpx;
}

.text-sm {
  font-size: 28rpx;
}

.text-gray-700 {
  color: #374151;
}

.mt-3 {
  margin-top: 24rpx;
}

/* 标签页导航 */
.mt-2 {
  margin-top: 16rpx;
}

.border-b {
  border-bottom: 1rpx solid #e5e7eb;
}

.flex-1 {
  flex: 1;
}

.text-center {
  text-align: center;
}

.font-medium {
  font-weight: 500;
}

.text-gray-500 {
  color: #6b7280;
}

.tab-active {
  color: #3b82f6;
  border-bottom: 4rpx solid #3b82f6;
}

/* 竞赛详情内容 */
.mb-3 {
  margin-bottom: 24rpx;
}

.text-lg {
  font-size: 32rpx;
}

.leading-relaxed {
  line-height: 1.625;
}

.mt-6 {
  margin-top: 48rpx;
}

.space-y-2 > view:not(:first-child) {
  margin-top: 16rpx;
}

.list-disc {
  list-style-type: disc;
}

.pl-5 {
  padding-left: 40rpx;
}

.list-item {
  display: list-item;
  margin-left: 20rpx;
}

.space-y-3 > view:not(:first-child) {
  margin-top: 24rpx;
}

.w-20 {
  width: 160rpx;
}

.items-start {
  align-items: flex-start;
}

/* 赛程安排 */
.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 48rpx;
  width: 4rpx;
  background-color: #e5e7eb;
  z-index: 1;
}

.timeline-item {
  position: relative;
  padding-left: 96rpx;
  padding-bottom: 64rpx;
}

.timeline-dot-container {
  position: absolute;
  left: 0;
  top: 16rpx;
  width: 96rpx;
  display: flex;
  justify-content: center;
}

.timeline-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.timeline-dot-text {
  color: white;
  font-size: 26rpx;
  font-weight: bold;
}

.active-dot {
  background-color: #2679cc;
  box-shadow: 0 0 0 8rpx rgba(38, 121, 204, 0.2);
}

.timeline-content {
  background-color: #f9fafb;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #f0f0f0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.active-content {
  background-color: #f0f7ff;
  border-color: #c7e0ff;
}

.stage-title {
  font-size: 32rpx;
  font-weight: bold;
}

.text-blue-800 {
  color: #2679cc;
}

.status-text {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 40rpx;
  font-weight: 500;
}

.active-status {
  background-color: #dcf5ee;
  color: #10b981;
}

.inactive-status {
  background-color: #e5e7eb;
  color: #6b7280;
}

.stage-period-container, 
.stage-location-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 16rpx;
}

.stage-desc-container {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #e5e7eb;
}

.stage-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  color: #2679cc;
}

.stage-period {
  font-size: 28rpx;
  color: #4b5563;
  font-weight: 500;
}

.stage-desc {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 1.6;
}

.stage-location {
  font-size: 28rpx;
  color: #4b5563;
}

/* 参赛队伍 */
.search-filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  background-color: #F9FAFB;
  padding: 16rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 12rpx 20rpx;
  border: 1rpx solid #E5E7EB;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  color: #9CA3AF;
  font-size: 32rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  font-size: 28rpx;
  color: #1F2937;
  border: none;
  background: transparent;
}

.clear-icon {
  color: #9CA3AF;
  font-size: 32rpx;
  padding: 10rpx;
}

.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
  padding: 12rpx 20rpx;
  background-color: #2679CC;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.filter-icon {
  color: #ffffff;
  font-size: 28rpx;
  margin-right: 8rpx;
}

.filter-text {
  color: #ffffff;
  font-size: 28rpx;
}

.mr-1 {
  margin-right: 8rpx;
}

.space-y-4 > view:not(:first-child) {
  margin-top: 32rpx;
}

.team-card {
  background-color: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 32rpx;
}

.faculty-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.team-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.text-gray-600 {
  color: #4b5563;
}

.member-avatars {
  margin-right: -16rpx;
}

.member-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid #ffffff;
  margin-right: -16rpx;
  background-color: #f3f4f6;
}

.member-avatar-more {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid #ffffff;
  background-color: #e5e7eb;
  color: #6b7280;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-blue-500 {
  color: #3b82f6;
}

.load-more-btn {
  padding: 16rpx 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #6b7280;
  background-color: #ffffff;
}

/* 相关竞赛 */
.related-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.related-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.05);
}

.related-image-container {
  height: 192rpx;
  overflow: hidden;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p-3 {
  padding: 24rpx;
}

/* 底部固定按钮 */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  padding: 24rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 10;
}

.team-btn {
  flex: 1;
  margin-right: 24rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8bff7ee6;
  color: #4b5563;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
}

.register-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2679cc;
  color: #ffffff;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
}

.disabled-btn {
  background-color: #e5e7eb !important;
  color: #9ca3af !important;
}

/* 添加加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2679cc;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #6b7280;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
}

.spinner-sm {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2679cc;
  animation: spin 0.8s linear infinite;
}

.ml-2 {
  margin-left: 16rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
  flex-direction: column;
}

/* 角色标签样式 */
.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.role-tag {
  display: flex;
  align-items: center;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.role-recruiting {
  background-color: #FFEDD5;
}

.role-recruiting .role-name,
.role-recruiting .role-count {
  color: #EA580C;
}

.role-filled {
  background-color: #E5E7EB;
}

.role-filled .role-name,
.role-filled .role-count {
  color: #6B7280;
}

.role-name {
  font-size: 22rpx;
  margin-right: 8rpx;
}

.role-count {
  font-size: 22rpx;
  opacity: 0.8;
}

/* 图标按钮样式 */
.icon-btn {
  width: 50rpx;
  height: 50rpx;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f3f4f6;
}

.download-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #2679cc;
  border-radius: 30rpx;
}

.download-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.load-more-btn {
  padding: 16rpx 32rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #6b7280;
  background-color: #ffffff;
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 16rpx;
}

/* 添加地点图标样式 */
.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  color: #6b7280;
}

/* 比赛结果相关样式 */
.stage-filter-container {
  display: flex;
  padding: 10rpx 0;
}

.stage-filter-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  white-space: nowrap;
}

.stage-filter-item.active {
  color: #fff;
  background-color: #4a90e2;
  font-weight: 500;
}

.filter-scroll {
  white-space: nowrap;
  width: 100%;
}

.results-list {
  margin-top: 20rpx;
}

.result-card {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.team-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
}

.award-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: bold;
  text-align: center;
}

.gold-award {
  background-color: rgba(255, 215, 0, 0.15);
  color: #FF9800;
}

.silver-award {
  background-color: rgba(192, 192, 192, 0.15);
  color: #757575;
}

.bronze-award {
  background-color: rgba(205, 127, 50, 0.15);
  color: #8D6E63;
}

.special-award {
  background-color: rgba(156, 39, 176, 0.15);
  color: #9C27B0;
}

.first-award {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.second-award {
  background-color: rgba(33, 150, 243, 0.15);
  color: #2196F3;
}

.third-award {
  background-color: rgba(255, 152, 0, 0.15);
  color: #FF9800;
}

.excellent-award {
  background-color: rgba(139, 195, 74, 0.15);
  color: #8BC34A;
}

.result-content {
  padding: 10rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-detail-item {
  display: flex;
  margin: 16rpx 0;
}

.result-label {
  width: 180rpx;
  font-size: 26rpx;
  color: #999;
}

.result-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.view-team-btn {
  font-size: 24rpx;
  color: #4a90e2;
  background: none;
  border: 1rpx solid #4a90e2;
  border-radius: 30rpx;
  padding: 6rpx 24rpx;
}

/* 成员头像样式 */
.member-avatars-row {
  display: flex;
  flex-wrap: nowrap;
  margin: 10rpx 0 20rpx 0;
  overflow-x: auto;
  padding: 8rpx 0;
}

.member-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  border: 2rpx solid #ffffff;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.more-members {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #666;
  font-size: 22rpx;
}
</style> 