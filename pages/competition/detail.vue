<template>
  <view class="container bg-gray-50">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="flex-row px-4 py-3">
        <view class="mr-3" @click="goBack">
          <text class="iconfont icon-arrow-left text-gray-600"></text>
        </view>
        <text class="text-xl font-bold text-gray-800">竞赛详情</text>
        <view class="ml-auto flex-row space-x-3">
          <view class="p-2 rounded-full bg-gray-100">
            <text class="iconfont icon-star-outline text-gray-600"></text>
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
        <view class="status-badge" :class="getStatusBadgeClass(competition.status)">
          {{ competition.status }}
        </view>
        <text class="text-white text-2xl font-bold">{{ competition.title }}</text>
        <view class="flex-row items-center mt-1 space-x-2">
          <text class="category-tag" :class="getTagClass(competition.category)">{{ competition.category }}</text>
          <text class="text-white-80 text-xs">{{ competition.level }}</text>
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
        <view class="flex-row items-center space-x-2">
          <text class="iconfont icon-trophy info-icon"></text>
          <text class="text-sm text-gray-700">奖金: 最高{{ getMaxAward() }}</text>
        </view>
        <view class="flex-row items-center space-x-2">
          <text class="iconfont icon-university info-icon"></text>
          <text class="text-sm text-gray-700">主办方: {{ competition.organizer.name }}</text>
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
      
      <view class="font-bold text-lg text-gray-800 mt-6 mb-3">参赛要求</view>
      <view class="text-gray-700 text-sm space-y-2 list-disc pl-5">
        <view class="list-item">参赛项目须为本校在校生，允许跨校组队</view>
        <view class="list-item">参赛团队成员{{ competition.teamRequirement }}</view>
        <view class="list-item">参赛项目需具有创新性、可行性和商业价值</view>
        <view class="list-item">参赛项目需提交商业计划书和路演PPT</view>
        <view class="list-item">参赛项目需在报名截止前完成在线提交</view>
      </view>
      
      <view class="font-bold text-lg text-gray-800 mt-6 mb-3">奖项设置</view>
      <view class="space-y-3">
        <view v-for="(award, index) in competition.awards" :key="index" class="flex-row items-start">
          <view class="w-20 text-sm font-medium text-gray-700">{{ award.level }}</view>
          <view class="flex-1 text-sm text-gray-700">{{ award.description }}</view>
        </view>
      </view>
      
      <view class="font-bold text-lg text-gray-800 mt-6 mb-3">联系方式</view>
      <view class="space-y-2 text-sm text-gray-700">
        <text>联系人：王老师</text>
        <text>电话：010-12345678</text>
        <text>邮箱：internet_plus@example.edu.cn</text>
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
      <view class="flex-row items-center mb-4">
        <view class="relative flex-1">
          <input type="text" placeholder="搜索队伍" class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm" />
          <text class="iconfont icon-search search-icon"></text>
        </view>
        <view class="ml-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
          <text class="iconfont icon-filter mr-1"></text>
          <text>筛选</text>
        </view>
      </view>
      
      <!-- 队伍列表 -->
      <view class="space-y-4">
        <view v-for="(team, index) in teams" :key="index" class="team-card">
          <view class="flex-row justify-between items-start">
            <view>
              <text class="font-bold text-gray-800">{{ team.name }}</text>
              <view class="flex-row items-center mt-1">
                <text class="faculty-tag" :style="{ backgroundColor: team.facultyColor + '20', color: team.facultyColor }">{{ team.faculty }}</text>
                <text class="text-xs text-gray-500">{{ team.memberCount }}人团队</text>
              </view>
            </view>
            <view class="team-status" :style="{ backgroundColor: team.statusColor + '20', color: team.statusColor }">{{ team.status }}</view>
          </view>
          <text class="text-sm text-gray-600 mt-3">项目简介：{{ team.description }}</text>
          <view class="flex-row items-center justify-between mt-3">
            <view class="flex-row member-avatars">
              <image v-for="(avatar, idx) in team.avatars" :key="idx" :src="avatar" class="member-avatar"></image>
              <view v-if="team.remainingCount > 0" class="member-avatar-more">+{{ team.remainingCount }}</view>
            </view>
            <text class="text-blue-500 text-sm">{{ team.actionText }}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="text-center mt-6">
        <button class="load-more-btn">加载更多</button>
      </view>
    </view>
    
    <!-- 相关竞赛 -->
    <view class="p-4 mt-2">
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
    
    <!-- 底部固定按钮 -->
    <view class="fixed-bottom">
      <button class="team-btn">
        <text class="iconfont icon-users mr-1"></text>
        <text>寻找队友</text>
      </button>
      <button class="register-btn" :disabled="competition.status === '已结束'">
        {{ getActionButtonText() }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// 竞赛ID
const competitionId = ref(null);
// 当前激活的标签页
const currentTab = ref('details');

// 模拟竞赛详情数据
const competition = ref({
  id: 1,
  title: '互联网+创新创业大赛',
  category: '创新创业',
  level: '国家级',
  status: '报名中',
  image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  registrationPeriod: '2023年4月10日 - 2023年5月15日',
  competitionPeriod: '2023年6月1日 - 2023年9月30日',
  location: '线上初赛 + 北京决赛',
  teamRequirement: '3-5人/队，本科生为主',
  description: '互联网+创新创业大赛是由教育部与相关部门联合举办的全国性创新创业赛事，旨在深化高等教育综合改革，激发大学生创新创业热情，提升创新创业能力。大赛分为初赛、复赛和决赛三个阶段。参赛项目主要包括"互联网+"现代农业、制造业、服务业等方向。',
  awards: [
    { level: '金奖', name: '全国金奖', description: '奖金10万元，证书，优先孵化资格' },
    { level: '银奖', name: '全国银奖', description: '奖金5万元，证书，优先孵化资格' },
    { level: '铜奖', name: '全国铜奖', description: '奖金2万元，证书' },
    { level: '优胜奖', name: '优胜奖', description: '奖金5千元，证书' }
  ],
  importantDates: [
    { date: '2023年4月10日', event: '报名开始', completed: true },
    { date: '2023年5月15日', event: '报名截止', active: true },
    { date: '2023年6月1日', event: '初赛开始', completed: false },
    { date: '2023年7月15日', event: '复赛', completed: false },
    { date: '2023年9月30日', event: '全国总决赛', completed: false }
  ],
  organizer: {
    name: '中华人民共和国教育部',
    description: '教育部是国务院组成部门之一，主管全国教育工作，负责教育改革与发展的宏观指导。',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSToH9P1O2wkHQXnImNz9dEk4-qDkY4Liv0yA&usqp=CAU'
  }
});

// 赛程阶段数据
const competitionStages = ref([
  {
    title: '报名阶段',
    period: '2023年4月1日 - 2023年5月15日',
    description: '在此阶段，参赛团队需完成在线报名，提交团队基本信息和项目概述。报名成功后，团队可以开始准备初赛材料。',
    status: '进行中',
    active: true
  },
  {
    title: '初赛阶段',
    period: '2023年5月20日 - 2023年6月15日',
    description: '各参赛团队需提交商业计划书和项目PPT。评审委员会将对所有参赛项目进行评审，选拔优秀项目进入复赛。',
    status: '未开始',
    active: false
  },
  {
    title: '复赛阶段',
    period: '2023年7月1日 - 2023年7月15日',
    description: '入围复赛的团队将进行现场路演和答辩。评委将从项目创新性、商业模式、团队能力等多方面进行评估。',
    status: '未开始',
    active: false
  },
  {
    title: '总决赛',
    period: '2023年8月10日 - 2023年8月12日',
    description: '决赛将在北京举行，入围团队将进行最终路演和展示。评审团将评选出金、银、铜奖项目，并举行颁奖典礼。',
    status: '未开始',
    active: false
  }
]);

// 模拟参赛队伍数据
const teams = ref([
  {
    name: '创新先锋队',
    faculty: '计算机学院',
    facultyColor: '#3b82f6',
    memberCount: 5,
    status: '已组建完成',
    statusColor: '#10b981',
    description: '基于人工智能的校园智能垃圾分类系统，通过计算机视觉技术实现垃圾自动识别和分类。',
    avatars: [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/46.jpg',
      'https://randomuser.me/api/portraits/women/65.jpg',
      'https://randomuser.me/api/portraits/men/63.jpg'
    ],
    remainingCount: 0,
    actionText: '查看详情'
  },
  {
    name: '未来创客',
    faculty: '经管学院',
    facultyColor: '#8b5cf6',
    memberCount: 4,
    status: '已组建完成',
    statusColor: '#10b981',
    description: '校园二手交易平台，整合线上交易与线下自提柜，解决校园二手物品流通难题。',
    avatars: [
      'https://randomuser.me/api/portraits/women/33.jpg',
      'https://randomuser.me/api/portraits/men/54.jpg',
      'https://randomuser.me/api/portraits/women/67.jpg',
      'https://randomuser.me/api/portraits/men/42.jpg'
    ],
    remainingCount: 0,
    actionText: '查看详情'
  },
  {
    name: '绿色能源队',
    faculty: '环境学院',
    facultyColor: '#10b981',
    memberCount: 3,
    status: '招募中 1/4',
    statusColor: '#eab308',
    description: '校园太阳能微电网系统，利用楼顶闲置空间建设分布式光伏发电系统，实现绿色能源校园。',
    avatars: [
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/women/28.jpg',
      'https://randomuser.me/api/portraits/men/36.jpg'
    ],
    remainingCount: 1,
    actionText: '申请加入'
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

// 获取页面参数
onMounted(() => {
  const eventChannel = getOpenerEventChannel();
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  if (page.$page && page.$page.options) {
    competitionId.value = page.$page.options.id;
    // 这里应该根据ID请求服务器获取详情数据
    console.log('竞赛ID:', competitionId.value);
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
    case '报名中':
      return 'bg-orange-500';
    case '即将开始':
      return 'bg-gray-500';
    case '进行中':
      return 'bg-green-500';
    case '已结束':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

// 根据竞赛状态返回按钮文本
function getActionButtonText() {
  switch(competition.value.status) {
    case '报名中':
      return '立即报名';
    case '即将开始':
      return '预约提醒';
    case '进行中':
      return '查看进度';
    case '已结束':
      return '查看结果';
    default:
      return '了解详情';
  }
}

// 获取报名截止日期
function getRegistrationDeadline() {
  const periodParts = competition.value.registrationPeriod.split(' - ');
  return periodParts.length > 1 ? periodParts[1] : competition.value.registrationPeriod;
}

// 获取最高奖金
function getMaxAward() {
  // 简单示例，实际可能需要解析奖金数额
  return '10万元';
}

// 切换标签页
function switchTab(tab) {
  currentTab.value = tab;
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}
</script>

<style>
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
}

.bg-orange-500 {
  background-color: #f97316;
}

.bg-gray-500 {
  background-color: #6b7280;
}

.bg-green-500 {
  background-color: #10b981;
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

.py-3 {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
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
.search-icon {
  position: absolute;
  left: 24rpx;
  top: 18rpx;
  color: #9ca3af;
  font-size: 32rpx;
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

.mt-3 {
  margin-top: 24rpx;
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

.mt-6 {
  margin-top: 48rpx;
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
  background-color: #f3f4f6;
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
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
}

.register-btn[disabled] {
  background-color: #e5e7eb;
  color: #9ca3af;
}
</style> 