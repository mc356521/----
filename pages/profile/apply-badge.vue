<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <SvgIcon name="back" size="20"></SvgIcon>
      </view>
      <text class="header-title">勋章申请</text>
      <view class="right-placeholder"></view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loadingData">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载数据...</text>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-scroll" v-else>
      <view class="form-container">
        <!-- 申请类型选择 -->
        <view class="form-section">
          <view class="section-title">申请类型</view>
          <view class="type-selector">
            <view 
              class="type-option"
              :class="{ active: formData.applicantType === 'individual' }"
              @click="selectApplicantType('individual')"
            >
              <view class="type-radio">
                <view class="radio-inner" v-if="formData.applicantType === 'individual'"></view>
              </view>
              <text>个人勋章</text>
            </view>
            
            <view 
              class="type-option"
              :class="{ active: formData.applicantType === 'team' }"
              @click="selectApplicantType('team')"
            >
              <view class="type-radio">
                <view class="radio-inner" v-if="formData.applicantType === 'team'"></view>
              </view>
              <text>竞赛勋章</text>
            </view>
          </view>
        </view>
        
        <!-- 团队选择 - 仅团队申请时显示 -->
        <view class="form-section" v-if="formData.applicantType === 'team'">
          <view class="section-title">选择团队</view>
          <view class="form-item">
            <view class="dropdown-selector" @click="showTeamPicker">
              <text class="selector-text">{{ selectedTeamName || '请选择团队' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
        </view>
        
        <!-- 竞赛信息 - 仅团队申请时显示 -->
        <view class="form-section" v-if="formData.applicantType === 'team'">
          <view class="section-title">竞赛信息</view>
          <view class="form-item">
            <view class="dropdown-selector" @click="showCompetitionPicker">
              <text class="selector-text">{{ selectedCompetitionName || '请选择竞赛' }}</text>
              <SvgIcon name="arrow-down" size="16"></SvgIcon>
            </view>
          </view>
        </view>
        
        
        <!-- 勋章选择 -->
        <view class="form-section">
          <view class="section-title">勋章选择</view>
          
          <!-- 勋章类别选择 -->
          <view class="badge-categories" v-if="formData.applicantType !== 'team'">
            <view 
              v-for="category in badgeCategories.filter(c => c.value !== 'team_competition')" 
              :key="category.value"
              class="badge-category-tab"
              :class="{ active: selectedBadgeCategory === category.value }"
              @click="switchBadgeCategory(category.value)"
            >
              {{ category.label }}
            </view>
          </view>
          
          <!-- 竞赛级别选择 - 仅在竞赛勋章类别时显示 -->
          <view v-if="formData.applicantType === 'team' || selectedBadgeCategory === 'team_competition'">
            <view class="section-sub-title">级别选择</view>
            <view class="level-selector">
              <view 
                v-for="level in Object.keys(badgesByLevel)" 
                :key="level"
                class="level-option"
                :class="{ active: selectedLevel === level }"
                @click="filterByLevelTag(level)"
              >
                {{ level }}
              </view>
            </view>
            
            <!-- 获奖级别选择 - 默认显示且当全国级选中时显示金奖选项 -->
            <view class="mt-3">
              <view class="section-sub-title">获奖级别</view>
          <view class="award-selector">
            <view 
                  v-for="award in Object.keys(badgesByAward)" 
                  :key="award"
              class="award-option"
                  :class="{ active: selectedAward === award }"
                  @click="filterByAwardTag(award)"
            >
                  {{ award }}
                </view>
            </view>
          </view>
        </view>
        
          <!-- 勋章列表 -->
          <view class="badge-container">
            <view 
              v-for="badge in availableBadges"
              :key="badge.id"
              class="badge-item"
              :class="{ selected: formData.requestedBadge === badge.id }"
              @click="selectBadge(badge)"
            >
              <image class="badge-image" :src="badge.icon" mode="aspectFit"></image>
              <text class="badge-name">{{ badge.name }}</text>
              <view class="badge-info" v-if="badge.level || badge.rank">
                <text v-if="badge.level">{{ badge.level }}</text>
                <text v-if="badge.level && badge.rank"> · </text>
                <text v-if="badge.rank">{{ badge.rank }}</text>
              </view>
              <view class="badge-check" v-if="formData.requestedBadge === badge.id">
                <SvgIcon name="check" size="16" color="#ffffff"></SvgIcon>
              </view>
            </view>
            
            <!-- 空状态 -->
            <view class="empty-badge-category" v-if="availableBadges.length === 0">
              <text>该分类下暂无可申请的勋章</text>
            </view>
          </view>
        </view>
        
        <!-- 申请说明 -->
        <view class="form-section">
          <view class="section-title">申请说明</view>
          <view class="form-item">
            <textarea
              class="form-textarea"
              v-model="formData.reviewMessage"
              placeholder="请详细描述申请理由，如：竞赛名称、获奖级别、团队贡献等"
              :maxlength="200"
              :disabled="submitting"
            ></textarea>
            <text class="textarea-counter">{{ formData.reviewMessage.length }}/200</text>
          </view>
        </view>
        
        <!-- 证明材料上传 -->
        <view class="form-section">
          <view class="section-title">证明材料</view>
          <view class="upload-area">
            <view 
              class="upload-item"
              v-for="(file, index) in uploadFiles"
              :key="index"
            >
              <image class="upload-preview" :src="file.path" mode="aspectFill"></image>
              <view class="upload-delete" @click="removeFile(index)" v-if="!submitting">
                <SvgIcon name="close" size="16" color="#ffffff"></SvgIcon>
              </view>
            </view>
            
            <view class="upload-button" @click="chooseFile" v-if="uploadFiles.length < 3 && !submitting">
              <SvgIcon name="plus" size="24"></SvgIcon>
              <text>上传图片</text>
            </view>
          </view>
          <text class="upload-tips">请上传获奖证书、比赛公示截图等证明材料，最多3张图片</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitApplication" :disabled="submitting" :class="{'disabled': submitting}">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
    
    <!-- 团队选择弹窗 -->
    <UniPopup ref="teamPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择团队</text>
          <view class="popup-close" @click="closeTeamPicker">
            <SvgIcon name="close" size="18"></SvgIcon>
          </view>
        </view>
        <view class="popup-body">
          <view 
            class="popup-item team-item"
            v-for="team in myTeams"
            :key="team.id"
            @click="selectTeam(team)"
          >
            <view class="team-info">
              <text class="team-name">{{ team.name }}</text>
              <view class="team-details">
                <text class="team-competition">{{ team.competitionName }}</text>
                <view class="team-status" :class="getStatusClass(team.status)">{{ team.statusText }}</view>
              </view>
              <text class="team-role" v-if="team.roleName">{{ team.roleType === 'leader' ? '队长' : '成员' }} · {{ team.roleName }}</text>
            </view>
            <view class="popup-item-check" v-if="formData.teamId === team.id">
              <SvgIcon name="check" size="16" color="#3B82F6"></SvgIcon>
            </view>
          </view>
          
          <!-- 没有团队时显示提示 -->
          <view class="empty-teams" v-if="myTeams.length === 0">
            <text>您没有担任队长的团队</text>
            <text class="empty-tip">只有队长可以为团队申请勋章</text>
            <view class="create-team-btn" @click="goToCreateTeam">创建团队</view>
          </view>
        </view>
      </view>
    </UniPopup>
    
    <!-- 竞赛选择弹窗 -->
    <UniPopup ref="competitionPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择竞赛</text>
          <view class="popup-close" @click="closeCompetitionPicker">
            <SvgIcon name="close" size="18"></SvgIcon>
          </view>
        </view>
        <view class="popup-body">
          <view 
            class="popup-item competition-item"
            v-for="competition in competitions"
            :key="competition.id + '-' + competition.teamId"
            @click="selectCompetition(competition)"
          >
            <view class="competition-info">
              <text class="competition-name">{{ competition.name }}</text>
              <text class="competition-team" v-if="competition.teamName">团队: {{ competition.teamName }}</text>
              <view class="competition-categories" v-if="competition.categories && competition.categories.length">
                <text class="category-tag" v-for="(category, index) in competition.categories" :key="index">
                  {{ category.categoryName }}
                </text>
              </view>
            </view>
            <view class="popup-item-check" v-if="formData.competitionId === competition.id && (!competition.teamId || formData.teamId === competition.teamId)">
              <SvgIcon name="check" size="16" color="#3B82F6"></SvgIcon>
            </view>
          </view>
          
          <!-- 没有竞赛时显示提示 -->
          <view class="empty-competitions" v-if="competitions.length === 0">
            <text>您还没有参与任何竞赛</text>
          </view>
        </view>
      </view>
    </UniPopup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import SvgIcon from '@/components/SvgIcon.vue';
import UniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue';
import config from '@/config/env/dev';
import { getToken } from '@/utils/request';
import teamApi from '@/api/modules/team';

// 定义组件名称
const name = 'apply-badge';

// 基础API地址
const baseApiUrl = config.baseUrl;

// 表单数据
const formData = reactive({
  applicantType: 'individual', // 申请主体类型: "team" 或 "individual"
  teamId: null, // 当applicantType=team时必填
  competitionId: null, // 竞赛徽章申请时必填
  awardLevel: null, // 获奖级别: "金奖"/"银奖"/"铜奖"/"优秀奖" 
  level: null, // 竞赛级别: "全国赛"/"省级"/"市级"/"校级"
  applicantId: null, // 当applicantType=individual时必填，个人申请可不填，自动使用当前用户ID
  requestedBadge: null, // 申请的徽章ID(必填)
  reviewMessage: "" // 申请说明
});

// 上传的文件
const uploadFiles = ref([]);

// 提交状态
const submitting = ref(false);

// 团队选择
const myTeams = ref([]);
const selectedTeamName = ref('');
const teamPopup = ref(null);

// 竞赛选择
const competitions = ref([]);
const selectedCompetitionName = ref('');
const competitionPopup = ref(null);

// 奖项选项
const awardOptions = [
  { label: '金奖', value: '金奖' },
  { label: '银奖', value: '银奖' },
  { label: '铜奖', value: '铜奖' },
  { label: '优秀奖', value: '优秀奖' }
];

// 可选的勋章列表
const availableBadges = ref([]);

// 分类后的勋章列表
const categorizedBadges = ref({
  team_competition: [], // 团队竞赛勋章
  personal_achievement: [], // 个人成就勋章
  universal: [] // 通用勋章
});

// 当前选择的竞赛级别和奖项
const selectedLevel = ref('全国级');
const selectedAward = ref('');

// 按竞赛级别分类的勋章
const badgesByLevel = ref({
  '全国级': [],
  '省级': [],
  '市级': [],
  '校级': []
});

// 按奖项级别分类的勋章
const badgesByAward = ref({
  '金奖': [],
  '银奖': [],
  '铜奖': [],
  '优秀奖': []
});

// 当前选择的勋章类别
const selectedBadgeCategory = ref('team_competition');

// 勋章类别名称
const badgeCategories = [
  { value: 'team_competition', label: '团队竞赛勋章' },
  { value: 'personal_achievement', label: '个人成就勋章' },
  { value: 'universal', label: '通用勋章' }
];

// 加载状态
const loadingData = ref(false);

// 获取我的团队列表
async function getMyTeams() {
  try {
    const res = await teamApi.getMyTeams();
    if (res && res.code === 200 && res.data) {
      // 过滤出我是队长的且未解散的团队(roleType=leader, status!=2)
      myTeams.value = res.data
        .filter(team => team.roleType === 'leader' && team.status !== '2')
        .map(team => ({
          id: team.id,
          name: team.name,
          competitionName: team.competitionName,
          status: team.status,
          statusText: team.statusText || getTeamStatusText(team.status),
          roleType: team.roleType,
          roleName: team.roleName
        }));
      console.log('获取到的我是队长的团队列表:', myTeams.value);
    } else {
      console.warn('获取团队列表失败:', res);
      uni.showToast({
        title: '获取团队数据失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取团队列表出错:', error);
    uni.showToast({
      title: '获取团队数据失败',
      icon: 'none'
    });
  }
}

// 获取团队状态文本
function getTeamStatusText(status) {
  switch(status) {
    case '0': return '招募中';
    case '1': return '已满员';
    case '2': return '已解散';
    case '3': return '已结束';
    case '4': return '比赛中';
    default: return '未知状态';
  }
}

// 获取竞赛列表
async function getCompetitions() {
  try {
    const res = await uni.request({
      url: `${baseApiUrl}/competitions/user/participated`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (res.statusCode === 200 && res.data && res.data.code === 200) {
      // 获取用户参与的竞赛
      competitions.value = (res.data.data || []).map(comp => ({
        id: comp.competitionId,
        name: comp.competitionName,
        teamId: comp.teamId,
        teamName: comp.teamName,
        categories: comp.categories || []
      }));
      console.log('获取到的用户参与的竞赛列表:', competitions.value);
    } else {
      console.warn('获取竞赛列表失败:', res);
      uni.showToast({
        title: '获取竞赛数据失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取竞赛列表出错:', error);
    uni.showToast({
      title: '获取竞赛数据失败',
      icon: 'none'
    });
  }
}

// 获取可申请的勋章列表
async function getBadges() {
  try {
    const res = await uni.request({
      url: `${baseApiUrl}/honor/badges/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (res.statusCode === 200 && res.data && res.data.code === 200) {
      // 获取勋章列表
      const badgesList = res.data.data.records || [];
      
      // 清空分类
      categorizedBadges.value = {
        team_competition: [],
        personal_achievement: [],
        universal: []
      };
      
      // 清空竞赛级别分类
      Object.keys(badgesByLevel.value).forEach(level => {
        badgesByLevel.value[level] = [];
      });
      
      // 清空奖项级别分类
      Object.keys(badgesByAward.value).forEach(award => {
        badgesByAward.value[award] = [];
      });
      
      // 按类型分类勋章
      badgesList.forEach(badge => {
        const badgeData = {
          id: badge.badgeId,
          name: badge.name,
          type: badge.badgeType,
          icon: badge.icon ? (badge.icon.startsWith('http') ? badge.icon : `${baseApiUrl}${badge.icon}`) : '',
          rarity: badge.rarity,
          level: badge.competitionLevel,
          rank: badge.awardRank,
          description: badge.requirementDescription
        };
        
        // 根据类型分类
        if (badge.badgeType && categorizedBadges.value[badge.badgeType]) {
          categorizedBadges.value[badge.badgeType].push(badgeData);
        } else {
          // 处理未知类型
          console.warn('未知的勋章类型:', badge.badgeType);
        }
        
        // 根据竞赛级别分类（仅限竞赛勋章）
        if (badge.badgeType === 'team_competition' && badge.competitionLevel) {
          if (badgesByLevel.value[badge.competitionLevel]) {
            badgesByLevel.value[badge.competitionLevel].push(badgeData);
          }
        }
        
        // 根据奖项级别分类（仅限竞赛勋章）
        if (badge.badgeType === 'team_competition' && badge.awardRank) {
          if (badgesByAward.value[badge.awardRank]) {
            badgesByAward.value[badge.awardRank].push(badgeData);
          }
        }
      });
      
      // 更新可用勋章列表
      updateAvailableBadges();
      
      console.log('获取到的勋章列表:', badgesList);
      console.log('分类后的勋章:', categorizedBadges.value);
      console.log('按级别分类的勋章:', badgesByLevel.value);
      console.log('按奖项分类的勋章:', badgesByAward.value);
      
      // 如果没有获取到勋章，使用默认数据
      if (badgesList.length === 0) {
        useDefaultBadges();
      }
    } else {
      console.warn('获取勋章列表失败:', res);
      useDefaultBadges();
    }
  } catch (error) {
    console.error('获取勋章列表出错:', error);
    useDefaultBadges();
  }
}

// 使用默认勋章数据
function useDefaultBadges() {
  const defaultBadges = [
    { id: 1, name: "全国赛金奖", icon: "/static/image/Lianxi/mc/1-1.png", type: "team_competition", level: "全国级", rank: "金奖" },
    { id: 2, name: "创新先锋", icon: "/static/image/Lianxi/mc/1-2.png", type: "personal_achievement" },
    { id: 3, name: "技术能手", icon: "/static/image/Lianxi/mc/1-3.png", type: "personal_achievement" },
    { id: 4, name: "优秀队员", icon: "/static/image/Lianxi/mc/1-4.png", type: "universal" }
  ];
  
  // 重置分类
  categorizedBadges.value = {
    team_competition: [],
    personal_achievement: [],
    universal: []
  };
  
  // 清空竞赛级别分类
  Object.keys(badgesByLevel.value).forEach(level => {
    badgesByLevel.value[level] = [];
  });
  
  // 清空奖项级别分类
  Object.keys(badgesByAward.value).forEach(award => {
    badgesByAward.value[award] = [];
  });
  
  // 分类默认勋章
  defaultBadges.forEach(badge => {
    if (badge.type && categorizedBadges.value[badge.type]) {
      categorizedBadges.value[badge.type].push(badge);
      
      // 根据竞赛级别分类（仅限竞赛勋章）
      if (badge.type === 'team_competition' && badge.level) {
        if (badgesByLevel.value[badge.level]) {
          badgesByLevel.value[badge.level].push(badge);
        }
      }
      
      // 根据奖项级别分类（仅限竞赛勋章）
      if (badge.type === 'team_competition' && badge.rank) {
        if (badgesByAward.value[badge.rank]) {
          badgesByAward.value[badge.rank].push(badge);
        }
      }
    }
  });
  
  // 更新可用勋章列表
  updateAvailableBadges();
}

// 根据当前选择的级别和奖项更新可用勋章
function updateAvailableBadges() {
  let filteredBadges = [];
  
  // 团队申请只能看到team_competition类型的勋章
  if (formData.applicantType === 'team') {
    filteredBadges = categorizedBadges.value['team_competition'] || [];
    selectedBadgeCategory.value = 'team_competition';
  } else {
    // 个人申请不能看到team_competition类型的勋章
    if (selectedBadgeCategory.value === 'team_competition') {
      selectedBadgeCategory.value = 'personal_achievement';
    }
    
    filteredBadges = categorizedBadges.value[selectedBadgeCategory.value] || [];
  }
  
  // 如果选择了级别，进一步筛选
  if (selectedLevel.value && selectedBadgeCategory.value === 'team_competition') {
    filteredBadges = badgesByLevel.value[selectedLevel.value] || [];
    
    // 如果还选择了奖项，再次筛选
    if (selectedAward.value) {
      filteredBadges = filteredBadges.filter(badge => badge.rank === selectedAward.value);
    }
  }
  
  // 如果没有筛选结果，尝试使用level属性匹配
  if (filteredBadges.length === 0 && selectedLevel.value && selectedBadgeCategory.value === 'team_competition') {
    filteredBadges = categorizedBadges.value['team_competition'].filter(badge => 
      badge.level === selectedLevel.value && (!selectedAward.value || badge.rank === selectedAward.value)
    );
  }
  
  availableBadges.value = filteredBadges;
}

// 根据级别筛选勋章
function filterBadgesByLevel() {
  // 如果尚未选择级别，不进行筛选
  if (!formData.level) return;
  
  updateAvailableBadges();
}

// 根据竞赛级别标签过滤勋章
function filterByLevelTag(level) {
  selectedLevel.value = level;
  
  // 如果是全国级，默认选择金奖
  if (level === '全国级' && !selectedAward.value) {
    selectedAward.value = '金奖';
  } else if (!selectedAward.value) {
    // 其他级别，如果没有选择奖项，默认选择该级别下的第一个可用奖项
    const badgesInLevel = badgesByLevel.value[level] || [];
    const availableAwards = [...new Set(badgesInLevel.map(b => b.rank))].filter(Boolean);
    if (availableAwards.length > 0) {
      selectedAward.value = availableAwards[0];
    }
  }
  
  formData.requestedBadge = null; // 清空已选择的勋章
  updateAvailableBadges();
}

// 根据奖项级别标签过滤勋章
function filterByAwardTag(award) {
  selectedAward.value = award;
  formData.requestedBadge = null; // 清空已选择的勋章
  updateAvailableBadges();
}

// 切换勋章类别
function switchBadgeCategory(category) {
  // 如果是团队申请，只能选择团队竞赛勋章
  if (formData.applicantType === 'team' && category !== 'team_competition') {
    uni.showToast({
      title: '团队申请只能选择团队竞赛勋章',
      icon: 'none'
    });
    return;
  }
  
  // 如果是个人申请，不能选择团队竞赛勋章
  if (formData.applicantType === 'individual' && category === 'team_competition') {
    uni.showToast({
      title: '个人申请不能选择团队竞赛勋章',
      icon: 'none'
    });
    return;
  }
  
  selectedBadgeCategory.value = category;
  updateAvailableBadges();
  
  // 清空已选择的勋章
  formData.requestedBadge = null;
}

// 显示团队选择器
function showTeamPicker() {
  teamPopup.value.open('bottom');
}

// 关闭团队选择器
function closeTeamPicker() {
  teamPopup.value.close();
}

// 选择团队
function selectTeam(team) {
  formData.teamId = team.id;
  selectedTeamName.value = team.name;
  closeTeamPicker();
}

// 跳转到创建团队页面
function goToCreateTeam() {
  closeTeamPicker();
  uni.navigateTo({
    url: '/pages/team/create'
  });
}

// 获取团队状态样式类
function getStatusClass(status) {
  switch(status) {
    case '0': return 'status-recruiting';
    case '1': return 'status-active';
    case '2': return 'status-dismissed';
    case '3': return 'status-ended';
    case '4': return 'status-competing';
    default: return '';
  }
}

// 显示竞赛选择器
function showCompetitionPicker() {
  competitionPopup.value.open('bottom');
}

// 关闭竞赛选择器
function closeCompetitionPicker() {
  competitionPopup.value.close();
}

// 选择竞赛
function selectCompetition(competition) {
  formData.competitionId = competition.id;
  selectedCompetitionName.value = competition.name;
  
  // 如果是团队申请，并且这个竞赛有关联的团队，自动选择该团队
  if (formData.applicantType === 'team' && competition.teamId) {
    formData.teamId = competition.teamId;
    selectedTeamName.value = competition.teamName;
  }
  
  closeCompetitionPicker();
  
  // 根据竞赛级别筛选勋章
  filterBadgesByLevel();
}

// 选择勋章
function selectBadge(badge) {
  // 验证勋章类型与申请类型是否匹配
  if (formData.applicantType === 'team' && badge.type !== 'team_competition') {
    uni.showToast({
      title: '团队申请只能选择团队竞赛勋章',
      icon: 'none'
    });
    return;
  }
  
  if (formData.applicantType === 'individual' && badge.type === 'team_competition') {
    uni.showToast({
      title: '个人申请不能选择团队竞赛勋章',
      icon: 'none'
    });
    return;
  }
  
  formData.requestedBadge = badge.id;
}

// 选择文件
function chooseFile() {
  uni.chooseImage({
    count: 3 - uploadFiles.value.length,
    sizeType: ['compressed'],
    success: (res) => {
      const tempFiles = res.tempFilePaths.map(path => ({
        path,
        size: 0
      }));
      
      uploadFiles.value = [...uploadFiles.value, ...tempFiles].slice(0, 3);
    }
  });
}

// 移除文件
function removeFile(index) {
  uploadFiles.value.splice(index, 1);
}

// 上传附件
async function uploadAttachments(approvalId) {
  const token = uni.getStorageSync('token');
  
  // 如果没有附件或approvalId，直接返回
  if (uploadFiles.value.length === 0 || !approvalId) {
    console.warn('没有附件或申请ID不存在');
    return Promise.resolve();
  }
  
  try {
    // 一次性上传所有附件
    const uploadPromises = uploadFiles.value.map(file => {
      // 为每个文件创建单独的descriptions
      const descriptions = '证明材料';
      
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${baseApiUrl}/badge/approvals/${approvalId}/attachments/batch`,
          filePath: file.path,
          name: 'files', // 文件字段名
          formData: {
            descriptions: descriptions // 描述字段
          },
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            console.log('附件上传成功:', res);
            if (res.statusCode === 200) {
              try {
                // 尝试解析响应
                const parsedRes = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                if (parsedRes.code === 200) {
                  resolve(parsedRes);
                } else {
                  reject(new Error(parsedRes.message || '上传失败'));
                }
              } catch (e) {
                // 解析响应失败时，仍然视为成功
                resolve(res);
              }
            } else {
              reject(new Error(`上传失败，状态码: ${res.statusCode}`));
            }
          },
          fail: (err) => {
            console.error('上传附件失败:', err);
            reject(err);
          }
        });
      });
    });
    
    // 等待所有上传完成
    await Promise.all(uploadPromises);
    console.log('所有附件上传完成');
    return Promise.resolve();
  } catch (error) {
    console.error('上传附件过程中发生错误:', error);
    return Promise.reject(error);
  }
}

// 提交申请
async function submitApplication() {
  // 表单验证
  if (formData.applicantType === 'team') {
    // 团队申请的验证
    if (!formData.teamId) {
    return uni.showToast({
      title: '请选择团队',
      icon: 'none'
    });
  }
  
  if (!formData.competitionId) {
    return uni.showToast({
      title: '请选择竞赛',
      icon: 'none'
    });
  }
  
    // 选择了级别标签
    if (!selectedLevel.value) {
    return uni.showToast({
        title: '请选择竞赛级别',
      icon: 'none'
    });
  }
  
    // 选择了奖项标签
    if (!selectedAward.value) {
      return uni.showToast({
        title: '请选择获奖级别',
        icon: 'none'
      });
    }
  }
    
  // 所有申请类型都需要验证的部分
  if (!formData.requestedBadge) {
    return uni.showToast({
      title: '请选择申请的勋章',
      icon: 'none'
    });
  }
  
  if (!formData.reviewMessage.trim()) {
    return uni.showToast({
      title: '请填写申请说明',
      icon: 'none'
    });
  }
  
  if (uploadFiles.value.length === 0) {
    return uni.showToast({
      title: '请上传证明材料',
      icon: 'none'
    });
  }
  
  submitting.value = true;
  uni.showLoading({
    title: '提交中...'
  });
  
  try {
    // 调用勋章申请提交API
    const token = uni.getStorageSync('token');
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
      return;
    }
    
    // 构建提交的数据
    const submitData = {
      applicantType: formData.applicantType,
      requestedBadge: formData.requestedBadge,
      reviewMessage: formData.reviewMessage
    };
    
    // 只有团队申请才需要添加竞赛相关信息
    if (formData.applicantType === 'team') {
      submitData.teamId = formData.teamId;
      submitData.competitionId = formData.competitionId;
      submitData.awardLevel = selectedAward.value || formData.awardLevel;
      submitData.competitionLevel = selectedLevel.value || formData.level;
    }
    
    // 调用徽章申请API
    const result = await uni.request({
      url: `${baseApiUrl}/badge/approvals/submit`,
      method: 'POST',
      data: submitData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (result.statusCode !== 200 || result.data.code !== 200) {
      throw new Error(result.data?.message || '提交申请失败');
    }
    
    // 获取申请ID用于上传附件
    const approvalId = result.data.data;
    
    if (!approvalId) {
      throw new Error('未获取到申请ID，无法上传附件');
    }
    
    // 上传附件
    await uploadAttachments(approvalId);
    
    uni.hideLoading();
    uni.showToast({
      title: '申请提交成功',
      icon: 'success'
    });
    
    // 延迟后返回
    setTimeout(() => {
      goBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error('提交申请失败:', error);
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 页面加载时获取数据
onMounted(async () => {
  loadingData.value = true;
  
  try {
    // 设置默认勋章类别
    if (formData.applicantType === 'team') {
      // 团队申请只能选择团队竞赛勋章
      selectedBadgeCategory.value = 'team_competition';
    } else {
      // 个人申请默认显示个人成就勋章
      selectedBadgeCategory.value = 'personal_achievement';
    }
    
    // 并行获取数据
    await Promise.all([
      getMyTeams(),
      getCompetitions(),
      getBadges()
    ]);
    
    // 设置默认选择的竞赛级别
    if (selectedBadgeCategory.value === 'team_competition') {
      // 默认选择全国级
      selectedLevel.value = '全国级';
      // 默认选择金奖
      selectedAward.value = '金奖';
      // 更新可用勋章列表
      updateAvailableBadges();
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
  } finally {
    loadingData.value = false;
  }
});

// 申请类型选择
function selectApplicantType(type) {
  // 如果选择团队申请但没有担任队长的团队，显示提示
  if (type === 'team' && myTeams.value.length === 0) {
    uni.showToast({
      title: '您没有担任队长的团队，无法提交团队申请',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  formData.applicantType = type;
  
  // 清空之前选择的团队
  if (type === 'individual') {
    formData.teamId = null;
    selectedTeamName.value = '';
    
    // 切换到个人成就勋章，因为个人申请不能选择团队竞赛勋章
    if (selectedBadgeCategory.value === 'team_competition') {
      switchBadgeCategory('personal_achievement');
    }
  } else if (type === 'team') {
    // 团队申请只能选择团队竞赛勋章
    switchBadgeCategory('team_competition');
  }
  
  // 清空已选择的勋章
  formData.requestedBadge = null;
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
$gold-color: #FFD700;
$silver-color: #C0C0C0;
$bronze-color: #CD7F32;

// 状态颜色
$active-color: #10B981;    // 已满员/活跃
$recruiting-color: #F59E0B; // 招募中
$ended-color: #8B5CF6;     // 已结束
$dismissed-color: #6B7280;  // 已解散
$competing-color: #3B82F6;  // 比赛中

page {
  background-color: $background-color;
  padding-bottom: env(safe-area-inset-bottom);
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid rgba($primary-color, 0.2);
    border-top: 6rpx solid $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 30rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 顶部导航栏
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: $card-color;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .back-btn {
    padding: 10rpx;
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .right-placeholder {
    width: 36rpx;
  }
}

// 表单内容
.form-scroll {
  flex: 1;
  overflow: hidden;
}

.form-container {
  padding: 20rpx;
}

.form-section {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 20rpx;
  }
  
  .form-item {
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 申请类型选择
.type-selector {
  display: flex;
  justify-content: space-around;
  
  .type-option {
    display: flex;
    align-items: center;
    padding: 20rpx 40rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
    }
    
    .type-radio {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      border: 2rpx solid $text-secondary;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
      
      .radio-inner {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        background-color: $primary-color;
      }
    }
    
    text {
      font-size: 30rpx;
      color: $text-color;
    }
  }
}

// 下拉选择器
.dropdown-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  
  .selector-text {
    font-size: 30rpx;
    color: $text-color;
    
    &:empty::before {
      content: '请选择';
      color: $text-muted;
    }
  }
}

// 奖项选择
.award-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .award-option {
    padding: 16rpx 30rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    font-size: 28rpx;
    color: $text-color;
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: 500;
    }
  }
}

// 级别选择
.level-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .level-option {
    padding: 16rpx 30rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    font-size: 28rpx;
    color: $text-color;
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: 500;
    }
  }
}

// 勋章选择
.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .badge-item {
    width: calc(33.33% - 14rpx);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    position: relative;
    
    &.selected {
      background-color: rgba($primary-color, 0.1);
    }
    
    .badge-image {
      width: 120rpx;
      height: 120rpx;
      margin-bottom: 12rpx;
    }
    
    .badge-name {
      font-size: 26rpx;
      color: $text-color;
      text-align: center;
      font-weight: 500;
      margin-bottom: 6rpx;
    }
    
    .badge-info {
      font-size: 22rpx;
      color: $text-secondary;
      text-align: center;
      margin-bottom: 6rpx;
    }
    
    .badge-check {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: $primary-color;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 文本域
.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  font-size: 28rpx;
  color: $text-color;
  line-height: 1.5;
}

.textarea-counter {
  text-align: right;
  font-size: 24rpx;
  color: $text-muted;
  margin-top: 8rpx;
}

// 上传区域
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 16rpx;
  
  .upload-item {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    overflow: hidden;
    position: relative;
    
    .upload-preview {
      width: 100%;
      height: 100%;
    }
    
    .upload-delete {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .upload-button {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 26rpx;
      color: $text-secondary;
      margin-top: 10rpx;
    }
  }
}

.upload-tips {
  font-size: 24rpx;
  color: $text-muted;
}

// 提交按钮
.submit-bar {
  padding: 30rpx 40rpx;
  background-color: $card-color;
  border-top: 2rpx solid $border-color;
  
  .submit-btn {
    width: 100%;
    height: 90rpx;
    background-color: $primary-color;
    color: white;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.disabled, &:disabled {
      background-color: rgba($primary-color, 0.5);
      cursor: not-allowed;
    }
  }
}

// 弹窗样式
.popup-content {
  background-color: $card-color;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid $border-color;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .popup-close {
      padding: 10rpx;
    }
  }
  
  .popup-body {
    max-height: 600rpx;
    overflow-y: auto;
    
    .popup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.team-item {
        align-items: flex-start;
        
        .team-info {
          flex: 1;
          overflow: hidden;
          
          .team-name {
            font-size: 30rpx;
            color: $text-color;
            font-weight: 500;
            margin-bottom: 8rpx;
          }
          
          .team-details {
            display: flex;
            align-items: center;
            margin-bottom: 8rpx;
            
            .team-competition {
              font-size: 26rpx;
              color: $text-secondary;
              margin-right: 10rpx;
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .team-status {
              font-size: 22rpx;
              color: white;
              padding: 4rpx 12rpx;
              border-radius: 20rpx;
              
              &.status-recruiting {
                background-color: $recruiting-color;
              }
              
              &.status-active {
                background-color: $active-color;
              }
              
              &.status-dismissed {
                background-color: $dismissed-color;
              }
              
              &.status-ended {
                background-color: $ended-color;
              }
              
              &.status-competing {
                background-color: $competing-color;
              }
            }
          }
          
          .team-role {
            font-size: 24rpx;
            color: $text-secondary;
          }
        }
      }
      
      .popup-item-text {
        font-size: 30rpx;
        color: $text-color;
      }
    }
    
    .empty-teams {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60rpx 0;
      
      text {
        font-size: 28rpx;
        color: $text-muted;
        margin-bottom: 20rpx;
      }
      
      .empty-tip {
        font-size: 24rpx;
        color: $text-secondary;
        margin-bottom: 20rpx;
      }
      
      .create-team-btn {
        font-size: 28rpx;
        color: $primary-color;
        padding: 16rpx 30rpx;
        border: 1rpx solid $primary-color;
        border-radius: 8rpx;
      }
    }
  }
}

// 勋章类别选择
.badge-categories {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
  
  .badge-category-tab {
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    background-color: rgba($border-color, 0.5);
    font-size: 26rpx;
    color: $text-secondary;
    transition: all 0.2s ease;
    
    &.active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: 500;
    }
  }
}

// 空状态
.empty-badge-category {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  
  text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

.competition-item {
  align-items: flex-start;
  
  .competition-info {
    flex: 1;
    overflow: hidden;
    
    .competition-name {
      font-size: 30rpx;
      color: $text-color;
      font-weight: 500;
      margin-bottom: 8rpx;
    }
    
    .competition-team {
      font-size: 26rpx;
      color: $text-secondary;
      margin-bottom: 8rpx;
    }
    
    .competition-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      margin-top: 8rpx;
      
      .category-tag {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        background-color: rgba($primary-color, 0.1);
        color: $primary-color;
      }
    }
  }
}

.empty-competitions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  
  text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

.section-sub-title {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.mt-3 {
  margin-top: 20rpx;
}

// 级别选择器和奖项选择器样式
.level-selector, .award-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.level-option, .award-option {
  padding: 12rpx 30rpx;
  border-radius: 8rpx;
  background-color: rgba($border-color, 0.5);
  font-size: 28rpx;
  color: $text-color;
  transition: all 0.2s ease;
  
  &.active {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
    font-weight: 500;
  }
}
</style> 