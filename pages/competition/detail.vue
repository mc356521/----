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
          <view class="mr-3" @click="goBack">
            <text class="iconfont icon-arrow-left text-gray-600"></text>
          </view>
          <text class="text-xl font-bold text-gray-800">竞赛详情</text>
          <view class="ml-auto flex-row space-x-3">
            <view class="p-2 rounded-full bg-gray-100">
              <text class="iconfont icon-bookmark-outline text-gray-600"></text>
            </view>
            <view class="p-2 rounded-full bg-gray-100">
              <text class="iconfont icon-share text-gray-600"></text>
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
            <text class="iconfont icon-calendar info-icon"></text>
            <text class="text-sm text-gray-700">报名截止: {{ getRegistrationDeadline() }}</text>
          </view>
          <view class="flex-row items-center space-x-2">
            <text class="iconfont icon-users info-icon"></text>
            <text class="text-sm text-gray-700">{{ competition.teamRequirement }}</text>
          </view>
        </view>
        <view class="flex-row justify-between items-center mt-3">
          <view class="flex-row items-center space-x-2" style="width: 60%;">
            <text class="iconfont icon-university info-icon"></text>
            <text class="text-sm text-gray-700">主办方: {{ competition.organizer.name }}</text>
          </view>
          <view class="flex-row items-center space-x-2">
            <text class="iconfont icon-trophy info-icon"></text>
            <text class="text-sm text-gray-700">{{ competition.level }}</text>
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
          <view>无</view>
          <view class="space-y-3">
            <view v-for="(attachment, index) in competition.attachments" :key="index" 
              class="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <text class="iconfont icon-file text-blue-500 mr-2"></text>
              <text class="flex-1 text-sm text-gray-700">{{ attachment.fileName }}</text>
              <view class="px-3 py-1 bg-blue-500 rounded-full">
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
          <view v-for="(stage, index) in competitionStages" :key="index" class="timeline-item">
            <view class="timeline-dot-container">
              <view class="timeline-dot" :class="stage.active ? 'active-dot' : ''">
                <text class="timeline-dot-text">{{ index + 1 }}</text>
              </view>
            </view>
            <view class="timeline-content" :class="stage.active ? 'active-content' : ''">
              <view class="flex-row justify-between items-center mb-2">
                <text class="font-bold" :class="stage.active ? 'text-blue-800' : 'text-gray-700'">{{ stage.title }}</text>
                <text class="status-text" :class="stage.active ? 'active-status' : 'inactive-status'">{{ stage.status }}</text>
              </view>
              <text class="text-sm text-gray-700 mb-2">{{ stage.period }}</text>
              <text class="text-xs text-gray-600">{{ stage.description }}</text>
            </view>
          </view>
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
        <button class="team-btn">
          <text class="iconfont icon-users mr-1"></text>
          <text>创建队伍</text>
        </button>
        <button 
          class="register-btn" 
          :class="{'disabled-btn': competition.statusCode === '0' || competition.statusCode === '3'}"
          :disabled="competition.statusCode === '0' || competition.statusCode === '3'">
          {{ getActionButtonText() }}
        </button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api';

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
const competitionStages = ref([
  {
    title: '报名阶段',
    period: '',
    description: '在此阶段，参赛团队需完成在线报名，提交团队基本信息和项目概述。报名成功后，团队可以开始准备初赛材料。',
    status: '进行中',
    active: true
  },
  {
    title: '初赛阶段',
    period: '',
    description: '各参赛团队需提交商业计划书和项目PPT。评审委员会将对所有参赛项目进行评审，选拔优秀项目进入复赛。',
    status: '未开始',
    active: false
  },
  {
    title: '复赛阶段',
    period: '',
    description: '入围复赛的团队将进行现场路演和答辩。评委将从项目创新性、商业模式、团队能力等多方面进行评估。',
    status: '未开始',
    active: false
  },
  {
    title: '总决赛',
    period: '',
    description: '决赛将在北京举行，入围团队将进行最终路演和展示。评审团将评选出金、银、铜奖项目，并举行颁奖典礼。',
    status: '未开始',
    active: false
  }
]);


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
      
      // 更新赛程阶段
      updateCompetitionStages(data);
      
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

// 更新赛程阶段
function updateCompetitionStages(data) {
  if (data.registrationStart && data.registrationDeadline) {
    // 设置报名阶段时间
    competitionStages.value[0].period = formatDatePeriod(data.registrationStart, data.registrationDeadline);
    
    // 根据当前时间和竞赛状态计算各阶段状态
    const now = new Date();
    const regStartDate = new Date(data.registrationStart);
    const regEndDate = new Date(data.registrationDeadline);
    
    // 更新报名阶段状态
    if (now < regStartDate) {
      competitionStages.value[0].status = '未开始';
      competitionStages.value[0].active = false;
    } else if (now >= regStartDate && now <= regEndDate) {
      competitionStages.value[0].status = '进行中';
      competitionStages.value[0].active = true;
    } else {
      competitionStages.value[0].status = '已结束';
      competitionStages.value[0].active = false;
    }
    
    // 根据竞赛状态码设置后续阶段
    if (data.status === '2') { // 进行中
      competitionStages.value[1].active = true;
      competitionStages.value[1].status = '进行中';
      competitionStages.value[0].status = '已结束';
    } else if (data.status === '3') { // 已截止
      competitionStages.value[0].status = '已结束';
      competitionStages.value[1].status = '已结束';
      competitionStages.value[2].status = '已结束';
      competitionStages.value[3].status = '已结束';
    }
  }
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
  top: 32rpx;
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
  color: #3b82f6;
}

.purple-tag {
  background-color: #f5f3ff;
  color: #8b5cf6;
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
  color: #6b7280;
  font-size: 32rpx;
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
  width: 2rpx;
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
  top: 8rpx;
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
}

.timeline-dot-text {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

.active-dot {
  background-color: #3b82f6;
  box-shadow: 0 0 0 8rpx rgba(59, 130, 246, 0.2);
}

.timeline-content {
  background-color: #f9fafb;
  border-radius: 16rpx;
  padding: 32rpx;
}

.active-content {
  background-color: #eff6ff;
}

.mb-2 {
  margin-bottom: 16rpx;
}

.text-blue-800 {
  color: #1e40af;
}

.status-text {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.active-status {
  background-color: #bfdbfe;
  color: #1d4ed8;
}

.inactive-status {
  background-color: #e5e7eb;
  color: #6b7280;
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
  line-height: 80rpx;
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
  line-height: 80rpx;
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
</style> 