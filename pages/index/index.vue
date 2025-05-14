<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <header-bar
      ref="headerBarRef"
      title="校园任务与组队平台"
      :show-ai-recommend="true"
      @search="goToSearch"
      @ai-recommend="navigateToAiRecommend"
    ></header-bar>
    
  
    
    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 轮播图 -->
      <view class="swiper-container">
        <swiper class="swiper animate__animated animate__fadeIn" 
                circular autoplay interval="3000" duration="500"
                indicator-dots indicator-active-color="#247ae4" indicator-color="rgba(0, 0, 0, 0.2)">
          <swiper-item>
            <view class="swiper-item">
              <image src="/static/image/Lianxi/mc/LOG1.png" mode="aspectFill"></image>
              <view class="swiper-overlay">
                <text class="swiper-title">中国大学生计算机设计大赛(第18届)</text>
                <view class="swiper-date">
                  <image :src="icons.baoming" class="date-icon"></image>
                  <text class="date-text">报名截止：5月15日</text>
                </view>
              </view>
            </view>
          </swiper-item>
          <swiper-item>
            <view class="swiper-item">
              <image src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800" mode="aspectFill"></image>
              <view class="swiper-overlay">
                <text class="swiper-title">挑战杯创业计划大赛</text>
                <view class="swiper-date">
                  <image :src="icons.baoming" class="date-icon"></image>
                  <text class="date-text">报名截止：6月10日</text>
                </view>
              </view>
            </view>
          </swiper-item>
          <swiper-item>
            <view class="swiper-item">
              <image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" mode="aspectFill"></image>
              <view class="swiper-overlay">
                <text class="swiper-title">创青春创业大赛</text>
                <view class="swiper-date">
                  <image :src="icons.baoming" class="date-icon"></image>
                  <text class="date-text">报名截止：7月5日</text>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 功能图标入口 -->
      <view class="menu-container">
        <view class="menu-grid">
          <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="navigateTo('task-square')">
            <view class="menu-icon blue">
              <SvgIcon name="weituo" size="40"></SvgIcon>
            </view>
            <text class="menu-text">校园委托</text>
          </view>
          <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.2s" @click="navigateTo('findPartner')">
            <view class="menu-icon green">
              <SvgIcon name="xunzhaoduiyou" size="40"></SvgIcon>
            </view>
            <text class="menu-text">寻找队友</text>
          </view>
          <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.3s" @click="navigateTo('project')">
            <view class="menu-icon purple">
              <SvgIcon name="xiangmuzhanshi" size="30"></SvgIcon>
            </view>
            <text class="menu-text">项目展示</text>
          </view>
          <view class="menu-item animate__animated animate__fadeInUp" style="animation-delay: 0.4s" @click="navigateTo('schedule')">
            <view class="menu-icon orange">
              <SvgIcon name="rchenganpan" size="30"></SvgIcon>
            </view>
            <text class="menu-text">日程安排</text>
          </view>
 
        </view>
      </view>

      <!-- 热门竞赛 -->
      <view class="section">
        <view class="section-header">
          <view class="title-with-icon">
            <text class="section-title animate__animated animate__fadeInLeft">热门竞赛</text>
            <SvgIcon name="remen" class="title-hot-icon"></SvgIcon>
          </view>
          <text class="view-all animate__animated animate__fadeInRight" @click="viewAll('competition')">查看全部</text>
        </view>
        <view class="competition-list">
          
          <view class="competition-item card-hover animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="viewDetail('competition', competition.id)" v-for="competition in competitionsList" :key="competition.id">
            <view class="competition-flex">
              <view class="competition-image-container">
                <image class="competition-image" :src="competition.coverImageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800'" mode="aspectFill"></image>
              </view>
              <view class="competition-content">
                <view class="flex-between">
                  <text class="competition-title">{{ competition.title }}</text>
                  <view class="status-wrapper">
                    <text class="status-tag pulse" :class="getStatusClass(competition.status)">{{ competition.statusText }}</text>
                  </view>
                </view>
                <view class="tag-row">
                  <text class="tag green-tag" v-if="competition.categoryNames && competition.categoryNames.length > 0">{{ competition.categoryNames[0] }}</text>
                  <text class="tag gray-tag">{{ competition.level }}</text>
                </view>
                <view class="competition-info">
                  <view class="info-item">
                    <SvgIcon name="baoming" class="info-icon"></SvgIcon>
                    <text class="info-text">报名截止: {{ competition.registrationDeadlineFormatted }}</text>
                  </view>
                  <view class="info-item">
                    <SvgIcon name="Baominrenshu" class="info-icon"></SvgIcon>
                    <text class="info-text">{{ competition.teamSize }}-{{ competition.teamMax }}人/队</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐队伍 -->
      <view class="section">
        <view class="section-header">
          <view class="title-with-icon">
            <text class="section-title animate__animated animate__fadeInLeft">热门队伍</text>
            <SvgIcon name="remen" class="title-hot-icon"></SvgIcon>
          </view>

          <view class="ai-recommend-btn" @click="showAiRecommendPopup" @longpress="resetAiRecommendForTesting">
            <SvgIcon name="zhinnegtuijzudui" class="ai-icon"></SvgIcon>
            <text class="ai-text">AI智能推荐</text>
          </view>
        </view>
        <view class="team-list">
          <!-- 使用团队卡片组件 -->
          <template v-if="teamList.length > 0">
            <team-card
              v-for="(team, index) in teamList" 
              :key="team.id"
              :team="team"
              :index="index"
              @detail="(id) => viewDetail('team', id)"
              @apply="joinTeam"
            ></team-card>
          </template>
          <view v-else class="empty-state">
            <text class="empty-text">加载中...</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部TabBar - 由自定义组件处理 -->
    <TabBar activeTab="home" />

    <!-- 申请加入弹窗 -->
    <uni-popup ref="applyPopup" type="center" :show="showApplyModal" @change="(e) => { if (!e.show) resetApplyForm(); }">
      <view class="apply-popup">
        <view class="popup-header">
          <text class="popup-title">申请加入团队</text>
          <text class="close-icon" @click="showApplyModal = false">×</text>
        </view>
        
        <view class="popup-content">
          <view class="form-item">
            <text class="form-label">申请角色</text>
            <view class="role-select">
              <view 
                v-for="role in availableRoles" 
                :key="role.id"
                :class="['role-option', selectedRoleId === role.id ? 'role-selected' : '']"
                @click="selectedRoleId = role.id"
              >
                <text class="role-name">{{ role.name }}</text>
                <text class="role-count">{{ role.filled }}/{{ role.count }}人</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">申请留言 <text class="required">*</text></text>
            <textarea 
              class="message-input" 
              v-model="applyMessage"
              placeholder="请输入申请留言"
              maxlength="100"
            />
            <text class="char-count">{{ applyMessage.length }}/100</text>
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @click="showApplyModal = false">取消</button>
          <button class="submit-btn" @click="submitApplication" :disabled="!applyMessage">提交申请</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance, computed, nextTick } from 'vue';
import teamApi from '@/api/modules/team';
import competitionsApi from '@/api/modules/competitions';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import api from '@/api';
import store from '@/store';
import { icons } from '@/static/svg/icons.js';
import SvgIcon from '@/components/SvgIcon.vue';
// HeaderBar引用
const headerBarRef = ref(null);

// 计算HeaderBar占位高度
const headerPlaceholderHeight = computed(() => {
  if (headerBarRef.value && headerBarRef.value.headerHeight) {
    // 使用组件暴露的高度
    return headerBarRef.value.headerHeight + 'rpx';
  }
  
  // 首页没有分类，所以只使用基础高度
  return '120rpx';
});

// 热门队伍数据
const teamList = ref([]);
// 热门竞赛数据
const competitionsList = ref([]);
// AI智能推荐数据
const recommendedTeams = ref([]);
const aiSummary = ref('');

// 在script部分添加申请弹窗相关的状态变量
const showApplyModal = ref(false);
const applyTeamId = ref(null);
const applyMessage = ref('希望加入您的团队，请审核');
const selectedRoleId = ref(null);
const availableRoles = ref([]);
const loadingRoles = ref(false);

// AI推荐弹窗状态
const aiAnalyzing = ref(false);
const aiAnalyzingTexts = [
  '正在分析您的个人资料...',
  '正在匹配与您技能相符的队伍...',
  '正在计算兴趣匹配度...',
  '正在生成个性化推荐...'
];
let aiAnalyzingTimer = null;
const currentTextIndex = ref(0);

// 获取热门竞赛数据
async function getCompetitionsList() {
  try {
    // 请求热门竞赛数据，添加isHot参数
    const res = await competitionsApi.getCompetitionsList({
      isHot: true,
      pageSize: 3 // 只获取3个热门竞赛
    });
    
    if (res.code === 200 && res.data && res.data.list) {
      competitionsList.value = res.data.list;
      console.log('获取到热门竞赛数据:', competitionsList.value);
    }
  } catch (error) {
    console.error('获取竞赛数据失败:', error);
  }
}

// 获取队伍列表数据
async function getTeamList() {
  try {
    const res = await teamApi.getTeamList();
    if (res.code === 200 && res.data && res.data.list) {
      teamList.value = res.data.list.slice(0,10); // 只显示前10个
      console.log('获取到队伍列表数据:', teamList.value);
    }
	
  } catch (error) {
    console.error('获取队伍数据失败:', error);
  }
}

// 获取AI智能推荐的队伍
async function getRecommendedTeams() {
  try {
    // 检查是否已有缓存数据
    if (recommendedTeams.value && recommendedTeams.value.length > 0) {
      console.log('使用缓存的AI推荐队伍数据:', recommendedTeams.value);
      return;
    }
    
    // 检查本地缓存是否存在且未过期
    try {
      const cachedTime = uni.getStorageSync('ai_recommend_cache_time');
      const cachedTeams = uni.getStorageSync('ai_recommended_teams');
      const cachedSummary = uni.getStorageSync('ai_summary');
      
      // 如果有缓存时间，检查是否过期
      if (cachedTime && cachedTeams) {
        const now = Date.now();
        const cacheValidDuration = 3 * 60 * 60 * 1000; // 3小时
        const isExpired = now - Number(cachedTime) > cacheValidDuration;
        
        if (!isExpired) {
          // 缓存未过期，使用缓存数据
          recommendedTeams.value = JSON.parse(cachedTeams);
          aiSummary.value = cachedSummary || '';
          console.log('主页加载未过期的AI推荐缓存数据', recommendedTeams.value.length, '个队伍');
          return; // 直接返回，不再请求新数据
        } else {
          console.log('AI推荐缓存已过期，需要重新请求');
        }
      }
    } catch (e) {
      console.error('检查AI推荐缓存状态失败:', e);
    }
    
    const res = await teamApi.getRecommendedTeams();
    if (res.code === 200 && res.data) {
      // 为每个队伍添加匹配度信息
      const teams = res.data.recommendedTeams || [];
      recommendedTeams.value = teams.map(team => {
        return {
          ...team,
          matchScore: team.matchScore || Math.floor(Math.random() * 30) + 70, // 如果没有匹配度，随机生成70-100之间的分数
          matchReason: team.matchReason || team.recommendReason || '根据您的技能和兴趣推荐',
          recommendedRole: team.recommendedRole || ''
        };
      });
      
      aiSummary.value = res.data.aiSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
      console.log('获取到AI推荐队伍数据:', recommendedTeams.value);
      
      // 将数据存入本地缓存
      try {
        // 保存推荐团队数据
        uni.setStorageSync('ai_recommended_teams', JSON.stringify(recommendedTeams.value));
        // 保存AI摘要
        uni.setStorageSync('ai_summary', aiSummary.value);
        // 保存缓存时间戳
        const currentTime = Date.now();
        uni.setStorageSync('ai_recommend_cache_time', currentTime.toString());
        console.log('主页保存AI推荐数据缓存成功，缓存时间:', new Date(currentTime).toLocaleString());
      } catch (e) {
        console.error('缓存AI推荐数据失败:', e);
      }
    }
  } catch (error) {
    console.error('获取AI推荐队伍失败:', error);
    // 尝试从缓存加载
    try {
      const cachedTeams = uni.getStorageSync('ai_recommended_teams');
      const cachedSummary = uni.getStorageSync('ai_summary');
      if (cachedTeams) {
        recommendedTeams.value = JSON.parse(cachedTeams);
        aiSummary.value = cachedSummary || '';
        console.log('从缓存加载AI推荐队伍数据:', recommendedTeams.value);
      }
    } catch (e) {
      console.error('读取缓存AI推荐数据失败:', e);
    }
  }
}

// 页面跳转方法
function navigateTo(page) {
  if (page === 'findPartner') {
    uni.switchTab({
      url: '/pages/team/list'
    });
  } else if (page === 'task-square') {
    uni.navigateTo({
      url: '/pages/task-square/index'
    });
  } else if (page === 'project') {
    uni.navigateTo({
      url: '/pages/project/project-showcase'
    });
  } else if (page === 'schedule') {
    uni.navigateTo({
      url: '/pages/schedule/index'
    });
  } else {
    uni.showToast({
      title: `导航到${page}页面`,
      icon: 'none'
    });
  }
}

// AI推荐页面跳转
function navigateToAiRecommend() {
  uni.navigateTo({
    url: '/pages/team/recommended'
  });
}

// 查看全部
function viewAll(type) {
  if (type === 'competition') {
    uni.navigateTo({
      url: '/pages/competition/index'
    });
  } else if (type === 'recommend') {
    uni.navigateTo({
      url: '/pages/team/recommended' // 假设有个推荐队伍页面
    });
  }else if (type === 'schedule') {
    uni.navigateTo({
      url: '/pages/schedule/index' // 假设有个推荐队伍页面
    });
  }
  else {
    uni.navigateTo({
      url: '/pages/team/list'
    });
  }
}

// 查看详情
function viewDetail(type, id) {
  if (type === 'competition') {
    uni.navigateTo({
      url: `/pages/competition/detail?id=${id}`
    });
  } else {
    uni.navigateTo({
      url: `/pages/team/detail?id=${id}`
    });
  }
}

// 申请加入队伍
async function joinTeam(id) {
  try {
    loadingRoles.value = true;
    applyTeamId.value = id;
    
    // 先检查是否已经申请过该队伍
    const checkRes = await teamApi.checkTeamStatus(id);
    if (checkRes.code === 200 && checkRes.data) {
      if (checkRes.data.isApplied) {
        uni.showToast({
          title: '您已经申请过该队伍',
          icon: 'none'
        });
        return;
      }
      if (checkRes.data.isMember) {
        uni.showToast({
          title: '您已经是该队伍成员',
          icon: 'none'
        });
        return;
      }
    }
    
    // 获取队伍可选角色
    const teamDetail = await teamApi.getTeamDetail(id);
    if (teamDetail.code !== 200 || !teamDetail.data) {
      uni.showToast({
        title: '获取队伍信息失败',
        icon: 'none'
      });
      return;
    }
    
    // 获取可选角色列表
    availableRoles.value = teamDetail.data.roles || [];
    if (availableRoles.value.length === 0) {
      uni.showToast({
        title: '该队伍暂无可申请的角色',
        icon: 'none'
      });
      return;
    }
    
    // 默认选中第一个角色
    if (availableRoles.value[0]) {
      selectedRoleId.value = availableRoles.value[0].id;
    }
    
    // 显示申请弹窗
    showApplyModal.value = true;
    
  } catch (error) {
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
    console.error('获取队伍角色失败:', error);
  } finally {
    loadingRoles.value = false;
  }
}

// 提交申请
async function submitApplication() {
  if (!selectedRoleId.value) {
    uni.showToast({
      title: '请选择申请角色',
      icon: 'none'
    });
    return;
  }
  
  if (!applyMessage.value.trim()) {
    uni.showToast({
      title: '请输入申请留言',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: '提交中...'
    });
    
    const selectedRole = availableRoles.value.find(role => role.id === selectedRoleId.value);
    
    // 检查所选角色是否已满员
    if (selectedRole && selectedRole.count <= selectedRole.filled) {
      uni.hideLoading();
      uni.showToast({
        title: '该角色已满员',
        icon: 'none'
      });
      return;
    }
    
    // 准备请求数据，确保符合接口要求
    const applyData = {
      teamId: Number(applyTeamId.value), // 确保是数字类型
      roleId: Number(selectedRoleId.value), // 确保是数字类型
      message: applyMessage.value.trim()
    };
    
    console.log('申请加入队伍:', applyData);
    
    // 调用申请加入接口
    const applyRes = await teamApi.applyTeam(applyData);
    
    uni.hideLoading();
    
    if (applyRes.code === 200) {
        uni.showToast({
          title: '申请已发送',
          icon: 'success'
        });
      // 重置表单并关闭弹窗
      resetApplyForm();
      showApplyModal.value = false;
    } else {
      uni.showToast({
        title: applyRes.message || '申请失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('申请加入队伍失败:', error);
    uni.showToast({
      title: error.message || '申请提交失败，请稍后重试',
      icon: 'none'
    });
  }
}

// 重置申请表单
function resetApplyForm() {
  showApplyModal.value = false;
  applyTeamId.value = null;
  selectedRoleId.value = null;
  applyMessage.value = '希望加入您的团队，请审核';
  availableRoles.value = [];
}

// 跳转到搜索页
function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
  });
}

// 根据竞赛状态获取样式类
function getStatusClass(status) {
  switch(status) {
    case '0':
      return 'status-not-started';
    case '1':
      return 'status-recruiting';
    case '2':
      return 'status-ongoing';
    case '3':
      return 'status-ended';
    default:
      return '';
  }
}

// 监听弹窗状态
watch(showApplyModal, (newVal) => {
  const popup = uni.createSelectorQuery().in(getCurrentInstance()).select('.uni-popup');
  if (popup) {
    setTimeout(() => {
      popup.node((res) => {
        if (res && res.node) {
          if (newVal) {
            // 显示弹窗
            res.node.open && res.node.open();
          } else {
            // 隐藏弹窗
            res.node.close && res.node.close();
          }
        }
      }).exec();
    }, 0);
  }
});

// 显示AI推荐弹窗
function showAiRecommendPopup() {
  // 检查用户是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('用户未登录，无法使用AI推荐功能');
    uni.showModal({
      title: '需要登录',
      content: '使用AI推荐功能需要先登录账号',
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

  // 获取用户是否已点击过AI推荐的状态
  const hasClickedAiRecommend = store.getState('hasClickedAiRecommend');
  
  // 如果已经点击过，直接跳转到推荐页面
  if (hasClickedAiRecommend) {
    console.log('用户已点击过AI推荐，直接跳转到推荐页面');
    navigateToAiRecommend();
    return;
  }
  
  console.log('用户首次点击AI推荐，显示分析动画');
  
  // 显示分析动画
  aiAnalyzing.value = true;
  currentTextIndex.value = 0;
  
  // 使用uni.showLoading来显示加载状态
  uni.showLoading({
    title: aiAnalyzingTexts[currentTextIndex.value],
    mask: true
  });
  
  // 清除现有定时器
  if (aiAnalyzingTimer) {
    clearInterval(aiAnalyzingTimer);
    aiAnalyzingTimer = null;
  }
  
  // 设置定时器切换文本并更新loading提示
  aiAnalyzingTimer = setInterval(() => {
    currentTextIndex.value = (currentTextIndex.value + 1) % aiAnalyzingTexts.length;
    
    // 使用uni.showLoading更新提示文本
    uni.showLoading({
      title: aiAnalyzingTexts[currentTextIndex.value],
      mask: true
    });
    
    // 最后一个文本时停止动画，显示结果
    if (currentTextIndex.value === aiAnalyzingTexts.length - 1) {
      setTimeout(() => {
        clearInterval(aiAnalyzingTimer);
        aiAnalyzingTimer = null;
        
        // 隐藏loading
        uni.hideLoading();
        
        // 标记用户已经点击过AI推荐
        store.updateState('hasClickedAiRecommend', true);
        
        // 显示分析完成提示
        uni.showToast({
          title: '分析完成',
          icon: 'success',
          duration: 1000
        });
        
        // 延迟后导航到推荐页面
        setTimeout(() => {
          navigateToAiRecommend();
        }, 1000);
      }, 1500);
    }
  }, 1500);
}

// 关闭AI推荐弹窗
function closeAiRecommendPopup() {
  console.log('关闭AI推荐分析');
  
  // 清除定时器
  if (aiAnalyzingTimer) {
    clearInterval(aiAnalyzingTimer);
    aiAnalyzingTimer = null;
  }
  
  // 隐藏loading
  uni.hideLoading();
  
  // 重置分析状态
  aiAnalyzing.value = false;
  currentTextIndex.value = 0;
}

// 查看推荐队伍详情
function viewRecommendedTeam(id) {
  // 不再需要关闭弹窗
  viewDetail('team', id);
}

// 重置AI推荐状态（开发测试用）
function resetAiRecommendForTesting() {
  console.log('重置AI推荐状态（开发测试用）');
  // 调用store中的重置方法
  store.resetAiRecommendState();
  
  // 重置本地状态
  aiAnalyzing.value = false;
  currentTextIndex.value = 0;
  
  // 清除定时器
  if (aiAnalyzingTimer) {
    clearInterval(aiAnalyzingTimer);
    aiAnalyzingTimer = null;
  }
  
  // 显示提示
  uni.showToast({
    title: '已重置AI推荐状态',
    icon: 'success',
    duration: 1500
  });
}

onMounted(() => {
  // 获取状态栏高度
  const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
  console.log('状态栏高度:', statusBarHeight);
  
  // 检查全局状态中是否有AI推荐点击记录
  const hasClickedAiRecommend = store.getState('hasClickedAiRecommend');
  console.log('用户是否已点击过AI推荐:', hasClickedAiRecommend ? '是' : '否');
  
  // 如果用户没有点击过AI推荐，确保重置状态
  if (!hasClickedAiRecommend) {
    aiAnalyzing.value = false;
    currentTextIndex.value = 0;
    if (aiAnalyzingTimer) {
      clearInterval(aiAnalyzingTimer);
      aiAnalyzingTimer = null;
    }
  }
  
  // 并行请求数据，提升页面加载速度
  Promise.all([
    getTeamList(),
    getCompetitionsList(),
    getRecommendedTeams() // 提前预加载AI推荐数据
  ]).then(() => {
    console.log('所有数据加载完成');
  }).catch(err => {
    console.error('数据加载出错:', err);
  });
});
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '../../static/animate.css';
@import '@/config/theme.scss';

// 动画
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes sparkle {
  0% { opacity: 1; filter: drop-shadow(0 0 2rpx #e74d15); }
  25% { opacity: 0.9; filter: drop-shadow(0 0 5rpx #e74d15); transform: scale(1.05); }
  50% { opacity: 0.8; filter: drop-shadow(0 0 10rpx #e74d15); transform: scale(1.1); }
  75% { opacity: 0.9; filter: drop-shadow(0 0 5rpx #e74d15); transform: scale(1.05); }
  100% { opacity: 1; filter: drop-shadow(0 0 2rpx #e74d15); }
}

@keyframes pop {
  0% { transform: scale(0.5); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 rgba(59, 130, 246, 0.7); }
  100% { box-shadow: 0 0 10rpx rgba(59, 130, 246, 0.7); }
}

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin card-shadow {
  box-shadow: $shadow-sm;
}

@mixin card-active {
  transform: translateY(-10rpx);
  box-shadow: $shadow-lg;
}

page {
  background-color: $background-color;
  padding-bottom: 150rpx;
}

.container {
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.flex-between {
  @include flex-between;
}

/* 内容区域 */
.content-scroll {
  flex: 1;
  /* 添加顶部外边距，为固定的顶部导航栏腾出空间 */
  margin-top: 120rpx; /* 根据实际HeaderBar高度调整 */
}

.content-section {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.section-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

// 轮播图
.swiper-container {
  padding: 0 30rpx 30rpx;
  
  .swiper {
    height: 360rpx;
    border-radius: 32rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
    
    .swiper-item {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 32rpx;
      overflow: hidden;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .swiper-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 30rpx;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        
        .swiper-title {
          color: white;
          font-size: 32rpx;
          font-weight: bold;
        }
        
        .swiper-date {
          display: flex;
          align-items: center;
          margin-top: 8rpx;
          
          .date-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
          
          .date-text {
            color: rgba(255, 255, 255, 0.8);
            font-size: 24rpx;
          }
        }
      }
    }
  }
}

// 功能图标入口
.menu-container {
  margin: 0 30rpx;
  background: $card-color;
  border-radius: 20rpx;
  padding: 30rpx;
  @include card-shadow;
  
  .menu-grid {
    display: flex;
    justify-content: space-around;
    
    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .menu-icon {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;
        box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
        
        &.blue {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }
        
        &.green {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }
        
        &.purple {
          background: linear-gradient(135deg, #a18cd1, #fbc2eb);
        }
        
        &.orange {
          background: linear-gradient(135deg, #fa709a, #fee140);
        }
        
        &.ai-icon {
          background: linear-gradient(135deg, #4facfe, #64f38c);
        }
        
        .iconfont {
          color: white;
          font-size: 40rpx;
        }
      }
      
      .menu-text {
        font-size: 24rpx;
        color: $text-color;
        font-weight: 500;
      }
    }
  }
}

// 节标题
.section-header {
  padding: 0 30rpx 16rpx;
  @include flex-between;
  position: relative;
  
  .title-with-icon {
    display: flex;
    align-items: center;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .title-hot-icon {
      width: 36rpx;
      height: 36rpx;
      margin-left: 8rpx;
      margin-bottom: 15rpx;
      filter: drop-shadow(0 0 4rpx #e74d15);
    }
  }
  
  .view-all {
    font-size: 26rpx;
    color: $primary-color;
  }
  
  .ai-recommend-btn {
    position: absolute;
    right: 40rpx;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #4facfe, #64f38c);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 8rpx rgba(79, 172, 254, 0.2);
    
    .hot-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 8rpx;
      animation: sparkle 1.2s infinite;
      filter: drop-shadow(0 0 4rpx #e74d15);
    }
    .ai-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 8rpx;

      filter: drop-shadow(0 0 4rpx #e74d15);
    }
    .ai-text {
      color: white;
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

// 热门竞赛样式
.competition-list {
  padding: 0 30rpx;
  
  .competition-item {
    background: $card-color;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    @include card-shadow;
    transition: all 0.3s;
    
    &.card-hover:active {
      @include card-active;
    }
    
    .competition-flex {
      display: flex;
      
      .competition-image-container {
        width: 180rpx;
        height: 180rpx;
        overflow: hidden;
        
        .competition-image {
          width: 100%;
          height: 100%;
          transition: transform 0.5s;
        }
      }
      
      .competition-content {
        flex: 1;
        padding: 20rpx ;
        
        .competition-title {
         width: 300rpx;
          font-size: 30rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .status-wrapper {
          margin-left: 50rpx;
        }
        
        .status-tag {
          font-size: 20rpx;
          padding: 6rpx 30rpx;
          border-radius: 20rpx;
          background-color: #dbeafe;
          color: #247ae4;
          
          &.pulse {
            animation: pulse 2s infinite;
          }
          
          &.status-not-started {
            background-color: #E5E7EB;
            color: #6B7280;
          }
          
          &.status-recruiting {
            background-color: #DBEAFE;
            color: #2563EB;
            animation: pulse 2s infinite;
          }
          
          &.status-ongoing {
            background-color: #DEF7EC;
            color: #10B981;
          }
          
          &.status-ended {
            background-color: #FEE2E2;
            color: #EF4444;
          }
        }
        
        .tag-row {
          display: flex;
          justify-content: flex-start;
          margin-top: 12rpx;
          
          .tag {
            font-size: 24rpx;
            padding: 4rpx 12rpx;
            border-radius: 30rpx;
            margin-right: 10rpx;
            
            &.blue-tag {
              background-color: #EFF6FF;
              color: $primary-color;
            }
            
            &.green-tag {
              background-color: #ECFDF5;
              color: $success-color;
            }
            
            &.gray-tag {
              background-color: #F3F4F6;
              color: #6B7280;
            }
          }
        }
        
        .competition-info {
          display: flex;
          justify-content: space-between;
          margin-top: 12rpx;
          
          .info-item {
            display: flex;
            align-items: center;
            
            .info-icon {
              width: 32rpx;
              height: 32rpx;
              margin-right: 8rpx;
            }
            
            .info-text {
              color: $text-muted;
              font-size: 23rpx;
            }
          }
        }
      }
    }
  }
}

// 推荐队伍样式
.team-list {
  padding: 0 30rpx 120rpx 30rpx;
}

// 空状态样式
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

/* 申请弹窗样式 */
.apply-popup {
  width: 650rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.popup-content {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.role-select {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180rpx;
  height: 100rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 10rpx;
  border: 2rpx solid transparent;
}

.role-selected {
  border-color: $primary-color;
  background-color: rgba($primary-color, 0.1);
}

.role-name {
  font-size: 28rpx;
  color: $text-color;
  margin-bottom: 8rpx;
}

.role-count {
  font-size: 24rpx;
  color: $text-secondary;
}

.message-input {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.char-count {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: right;
  margin-top: 10rpx;
  display: block;
}

.popup-footer {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid #eee;
}

.cancel-btn, .submit-btn {
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: $text-secondary;
}

.submit-btn {
  background-color: $primary-color;
  color: #fff;
}

.required {
  color: #ff4757;
}

.submit-btn[disabled] {
  background-color: #cccccc;
  color: #ffffff;
}

// HeaderBar占位区域
.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

// 通用动画效果
.card-hover {
  transition: all 0.3s;
  
  &:active {
    @include card-active;
  }
}

/* AI推荐弹窗样式 */
.ai-popup {
  width: 80vw;
  max-width: 750rpx;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.popup-content {
  flex: 1;
  padding: 30rpx;
  overflow: hidden;
}

/* 分析中动画 */
.ai-analyzing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  
  .ai-icon-container {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #4facfe, #64f38c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
    
    .ai-icon {
      color: white;
      font-size: 60rpx;
      animation: pulse 1.5s infinite;
    }
  }
  
  .analyzing-text {
    font-size: 30rpx;
    color: $text-color;
    margin-bottom: 20rpx;
    min-height: 42rpx;
  }
  
  .loading-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: $primary-color;
      margin: 0 8rpx;
      opacity: 0.6;
      
      &:nth-child(1) {
        animation: dot-fade 1.5s 0s infinite;
      }
      
      &:nth-child(2) {
        animation: dot-fade 1.5s 0.5s infinite;
      }
      
      &:nth-child(3) {
        animation: dot-fade 1.5s 1s infinite;
      }
    }
  }
}

@keyframes dot-fade {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 推荐结果样式 */
.ai-summary {
  padding: 20rpx;
  background-color: rgba($primary-color, 0.05);
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  
  .summary-header {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .summary-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-color;
  }
  
  .summary-content {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.recommend-teams-scroll {
  max-height: 600rpx;
}

.recommend-teams {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-recommend {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  
  text {
    font-size: 28rpx;
    color: $text-muted;
    text-align: center;
  }
}

.popup-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  justify-content: center;
  
  .primary-btn {
    background-color: $primary-color;
    color: white;
    font-size: 28rpx;
    padding: 12rpx 40rpx;
    border-radius: 40rpx;
    border: none;
  }
}
</style>

