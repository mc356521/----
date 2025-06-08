<template>
	<view class="application-container">
	  <!-- 固定区域 -->
	  <view class="fixed-area">
	  <!-- 安全区域占位 -->
	  <view class="safe-area-top"></view>
	  <!-- 顶部导航栏 -->
	  <view class="nav-bar">
		<view class="back-btn" @click="goBack">
		  <SvgIcon name="back" size="20"></SvgIcon>
		</view>
		<text class="page-title">申请管理</text>
		<view class="placeholder-right"></view>
	  </view>
	    
		<!-- 标签页 -->
		<view class="tabs">
		  <view 
			v-for="(tab, index) in tabs" 
			:key="index" 
			class="tab" 
			:class="{ active: currentTab === index }"
			@click="switchTab(index)"
		  >
			{{ tab.name }}
			<view v-if="tab.badge && tab.badge > 0" class="badge">{{ tab.badge }}</view>
		  </view>
		</view>
        
        <!-- 分类筛选 -->
		<view class="filter-tabs">
		  <view class="filter-options">
			<view 
			  v-for="(type, index) in getApplicationTypes" 
			  :key="index"
			  class="filter-tab" 
			  :class="{ active: selectedType === type.value }"
			  @click="selectType(type.value)"
			>
			  {{ type.label }}
			</view>
		  </view>
		</view>
		
		<!-- 状态筛选标签 -->
        <view class="filter-tabs status-tabs">
		  <view class="filter-options">
            <!-- 待处理标签页使用简化的状态筛选 -->
            <template v-if="currentTab === 1">
			<view 
                v-for="(status, index) in pendingStatusTypes" 
			  :key="index"
                class="filter-tab" 
			  :class="{ active: selectedStatus === status.value }"
			  @click="selectStatus(status.value)"
			>
			  {{ status.label }}
			</view>
            </template>
            <!-- 其他标签页使用完整的状态筛选 -->
            <template v-else>
		<view 
                v-for="(status, index) in statusTypes" 
		  :key="index" 
                class="filter-tab" 
                :class="{ active: selectedStatus === status.value }"
                @click="selectStatus(status.value)"
              >
                {{ status.label }}
              </view>
            </template>
          </view>
		</view>
	  </view>
	
	  <!-- 申请列表内容 -->
	  <scroll-view 
        class="application-list" 
        scroll-y 
        refresher-enabled 
        @refresherrefresh="onRefresh" 
        :refresher-triggered="refreshing"
        @scrolltolower="loadMore"
      >
		<!-- 任务申请卡片 -->
		<view 
		  v-for="(item, index) in filteredApplications" 
		  :key="index"
		  class="application-card"
		  :class="[getApplicationClass(item.type), getStatusClass(item.status)]"
		  :data-id="item.id"
		>
		  <!-- 状态角标 - 右上角 -->
		  <view class="status-corner" :class="getStatusClass(item.status)">
			{{ item.statusText }}
		  </view>
		  
		  <view class="card-content">
			<view class="card-title">
              {{ getCardTitle(item) }}
              <text class="type-tag" :class="getTypeClass(item.type)">{{ item.type === 'task' ? '任务' : item.type === 'team' ? '队伍' : item.type === 'badge' ? '徽章' : '未知' }}</text>
            </view>
			
			<!-- 如果当前角色是创建者，显示申请人信息 -->
			<view class="card-info">
          
              
              <view class="info-item" v-if="currentRole === 'creator' || currentRole === 'leader'">
				<text class="info-label">申请人：</text>
                <text class="info-value clickable" @click="viewUserProfile(item.applicantId)">{{ item.applicantName }} {{ item.applicantMajor ? '· ' + item.applicantMajor : '' }}</text>
			  </view>
			  
              <view class="info-item" v-if="item.type === 'team' && item.roleName">
                <text class="info-label">申请角色：</text>
                <text class="info-value">{{ item.roleName }}</text>
			  </view>
			  
			  <view class="info-item">
				<text class="info-label">申请时间：</text>
				<text class="info-value">{{ formatDateTime(item.appliedAt) }}</text>
			  </view>
			  
			  <view class="info-item" v-if="item.message">
				<text class="info-label">申请理由：</text>
				<text class="info-value">{{ item.message }}</text>
			  </view>
              
              <view class="info-item" v-if="item.reviewNotes && item.status !== 'pending'">
                <text class="info-label">审核备注：</text>
                <text class="info-value">{{ item.reviewNotes }}</text>
			  </view>
			</view>
		  </view>
		  
		  <!-- 操作按钮: 创建者角色可批准/拒绝，申请者角色可取消申请 -->
		  <view class="card-footer" v-if="(currentRole === 'creator' || currentRole === 'leader') && item.status === 'pending'">
            <view class="btn-group">
              <button class="btn btn-approve" @click.stop="handleApplication(item.id, 'approved', item.type)">通过</button>
              <button class="btn btn-reject" @click.stop="handleApplication(item.id, 'rejected', item.type)">拒绝</button>
              <button class="btn btn-detail" @click.stop="viewDetail(item)">查看详情</button>
            </view>
		  </view>
		  
          <view class="card-footer" v-else-if="(currentRole === 'applicant') && item.status === 'pending'">
            <view class="btn-group">
              <button class="btn btn-reject" @click.stop="cancelApplication(item.id, item.type)">取消申请</button>
              <button class="btn btn-detail" @click.stop="viewDetail(item)">查看详情</button>
            </view>
          </view>
		  
		  <view class="card-footer" v-else>
			<text class="process-time" v-if="item.reviewedAt">处理时间：{{ formatDateTime(item.reviewedAt) }}</text>
		  <view class="btn-group">
		    <button class="btn btn-detail" @click.stop="viewDetail(item)">查看详情</button>
		  </view>
		  </view>
		</view>
		
		<!-- 空状态 -->
		<view class="empty-state" v-if="filteredApplications.length === 0 && !loading">
		  <image class="empty-image" src="/static/images/empty.png" mode="aspectFit"></image>
		  <text class="empty-text">暂无申请记录</text>
		</view>
        
        <!-- 加载状态 -->
        <view class="loading-more" v-if="loading && !refreshing">
          <uni-load-more status="loading" :contentText="loadMoreText"></uni-load-more>
	  </view>
        
        <view class="no-more" v-if="hasNoMore && !loading && filteredApplications.length > 0">
          <uni-load-more status="noMore" :contentText="loadMoreText"></uni-load-more>
        </view>
		
		<!-- 底部安全区域 -->
		<view class="safe-area-bottom"></view>
	  </scroll-view>
	  

	</view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, getCurrentInstance } from 'vue';
  import taskApplicationApi from '@/api/modules/taskApplications';
  import teamApi from '@/api/modules/team';
  import config from '@/config/env/dev';
  import SvgIcon from '@/components/SvgIcon.vue';

  // 基础API路径
  const baseApiUrl = config.baseUrl;
  
  // 刷新状态
  const refreshing = ref(false);
  const loading = ref(false);
  const hasNoMore = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const loadMoreText = {
    contentdown: '上拉显示更多',
    contentrefresh: '正在加载...',
    contentnomore: '已经到底啦'
  };
  
  // 角色类型：申请者/创建者
  const currentRole = ref('applicant');
  
  // 安全区域高度
  const safeAreaTop = ref(0);
  
  // 标签页
  const tabs = ref([
	{ name: '我发起的', badge: 0, role: 'applicant' },
	{ name: '待我处理', badge: 0, role: 'creator' }
  ]);
  const currentTab = ref(0);
  
  // 筛选选项
  const applicationTypes = ref([
	{ label: '全部', value: 'all' },
	{ label: '任务申请', value: 'task' },
    { label: '队伍申请', value: 'team' },
	{ label: '徽章申请', value: 'badge' }
  ]);
  
  // 获取当前标签页下可用的申请类型
  const getApplicationTypes = computed(() => {
    // 在"待我处理"标签页中不显示徽章申请选项
    if (currentTab.value === 1) {
      return applicationTypes.value.filter(type => type.value !== 'badge');
    }
    return applicationTypes.value;
  });
  
  // 标准状态筛选选项
  const statusTypes = ref([
	{ label: '全部', value: 'all' },
	{ label: '待处理', value: 'pending' },
	{ label: '已通过', value: 'approved' },
	{ label: '已拒绝', value: 'rejected' },
	{ label: '已取消', value: 'canceled' }
  ]);
  
  // 待处理状态筛选选项（简化版）
  const pendingStatusTypes = ref([
    { label: '全部', value: 'all' },
    { label: '未处理', value: 'pending' },
    { label: '已处理', value: 'processed' } // 特殊值，表示已处理的所有状态
  ]);
  
  // 选中的筛选项
  const selectedType = ref('all');
  const selectedStatus = ref('all');
  
  // 申请列表数据
  const applications = ref([]);
  
  // 过滤后的申请列表
  const filteredApplications = computed(() => {
    const list = applications.value.map(item => {
      // 添加状态文本
      let statusText = '';
      switch(item.status) {
        case 'pending': statusText = '待处理'; break;
        case 'approved': statusText = '已通过'; break;
        case 'rejected': statusText = '已拒绝'; break;
        case 'canceled': statusText = '已取消'; break;
        case 'returned': statusText = '已退回'; break; // 徽章申请特有状态
        default: statusText = '未知状态';
      }
      
      return {
        ...item,
        statusText
      };
    });
    
    // 过滤状态和类型
    let filtered = list;
    
    // 先按状态筛选
    if (selectedStatus.value !== 'all') {
      if (selectedStatus.value === 'processed') {
        // 特殊处理：已处理状态包括已通过、已拒绝和已取消
        filtered = filtered.filter(item => 
          item.status === 'approved' || 
          item.status === 'rejected' || 
          item.status === 'canceled'
        );
      } else {
        filtered = filtered.filter(item => item.status === selectedStatus.value);
      }
    }
    
    // 再按类型筛选
    if (selectedType.value !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType.value);
    }
    
    return filtered;
  });
  
  // 初始化数据
  onMounted(() => {
    // 获取系统信息，计算安全区域
    getSystemInfo();
    
    // 获取页面参数
    let query = {};
    if (uni.getSystemInfoSync().platform === 'h5') {
      query = getQueryParams();
    } else {
      const instance = getCurrentInstance();
      if (instance && instance.proxy && instance.proxy.$mp && instance.proxy.$mp.query) {
        query = instance.proxy.$mp.query;
      }
    }
    
    // 处理URL参数，设置初始标签页和筛选条件
    handleUrlParams(query);
    
    // 获取待处理申请数量（用于角标显示）
    loadBadgeCount();
    
    // 获取申请列表
    loadApplications(true);
  });
  
  // 获取H5环境下的URL参数
  function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
  }
  
  // 处理URL参数
  function handleUrlParams(query) {
    console.log('处理URL参数:', query);
    
    // 设置初始标签页
    if (query.tab !== undefined) {
      const tabIndex = parseInt(query.tab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.value.length) {
        switchTab(tabIndex);
      }
    }
    
    // 设置申请类型筛选
    if (query.type) {
      const type = query.type;
      if (['task', 'team', 'badge', 'all'].includes(type)) {
        selectedType.value = type;
      }
    }
    
    // 如果有ID参数，记录下来用于后续滚动定位
    if (query.id) {
      targetApplicationId.value = query.id;
    }
  }
  
  // 添加一个ref用于存储目标申请ID
  const targetApplicationId = ref(null);
  
  // 在数据加载完成后，滚动到指定的申请项
  function scrollToApplication() {
    if (!targetApplicationId.value) return;
    
    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      const selector = `.application-card[data-id="${targetApplicationId.value}"]`;
      const query = uni.createSelectorQuery();
      query.select(selector).boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        if (res[0]) {
          // 找到目标元素，滚动到该位置
          uni.pageScrollTo({
            scrollTop: res[1].scrollTop + res[0].top - 100, // 减去一些偏移，让元素不要太靠近顶部
            duration: 300
          });
          
          // 高亮显示该申请项
          highlightApplication(targetApplicationId.value);
        }
      });
      
      // 清除目标ID，防止重复滚动
      targetApplicationId.value = null;
    }, 500);
  }
  
  // 高亮显示指定的申请项
  function highlightApplication(id) {
    // 找到对应的DOM元素
    const element = document.querySelector(`.application-card[data-id="${id}"]`);
    if (!element) return;
    
    // 添加高亮类
    element.classList.add('highlight-application');
    
    // 3秒后移除高亮效果
    setTimeout(() => {
      element.classList.remove('highlight-application');
    }, 3000);
  }
  
  // 获取卡片标题
  function getCardTitle(item) {
    if (!item || !item.type) return '申请';
    if (item.type === 'task') {
      return item.taskTitle || '任务申请';
    } else if (item.type === 'team') {
      return item.teamName || '队伍申请';
    } else if (item.type === 'badge') {
      // 使用新的字段构造更丰富的勋章标题
      if (item.badgeName) {
        return item.badgeTitle || item.badgeName;
      }
      return item.badgeTitle || '勋章申请';
    }
    return '申请';
  }
  
  // 获取申请类型样式
  function getTypeClass(type) {
    if (type === 'task') return 'task-type';
    if (type === 'team') return 'team-type';
    if (type === 'badge') return 'badge-type';
    return '';
  }
  
  // 获取申请卡片样式
  function getApplicationClass(type) {
    if (!type) return 'card-task'; // 默认为任务卡片
    if (type === 'task') return 'card-task';
    if (type === 'team') return 'card-team';
    if (type === 'badge') return 'card-badge';
    return 'card-task';
  }
  
  // 获取申请列表
  async function loadApplications(isRefresh = false) {
    if (isRefresh) {
      currentPage.value = 1;
      hasNoMore.value = false;
      // 清空原有数据，避免类型混淆
      applications.value = [];
    }
    
    if (loading.value) return;
    loading.value = true;
    
    try {
      // 根据当前标签页确定请求角色
      if (currentTab.value === 0) {
        currentRole.value = 'applicant';
      } else if (currentTab.value === 1) {
        currentRole.value = 'creator';
      }
      
      // 加载任务申请
      if (selectedType.value === 'all' || selectedType.value === 'task') {
        await loadTaskApplications(isRefresh);
      }
      
      // 加载队伍申请
      if (selectedType.value === 'all' || selectedType.value === 'team') {
        await loadTeamApplications(isRefresh);
      }
      
      // 加载徽章申请 - 仅在"我发起的"标签页时加载
      if ((selectedType.value === 'all' || selectedType.value === 'badge') && currentTab.value === 0) {
        await loadBadgeApplications(isRefresh);
      }

      console.log('加载完成的应用列表数据：', applications.value);
      
      // 如果有目标申请ID，滚动到对应位置
      if (targetApplicationId.value) {
        scrollToApplication();
      }
      
    } catch (error) {
      console.error('获取申请列表失败:', error);
      uni.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      });
    } finally {
      loading.value = false;
      if (refreshing.value) {
        refreshing.value = false;
      }
    }
  }
  
  // 获取任务申请列表
  async function loadTaskApplications(isRefresh) {
    try {
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      };
      
      // 添加状态筛选
      if (selectedStatus.value !== 'all' && selectedStatus.value !== 'processed') {
        params.status = selectedStatus.value;
      }
      
      // 添加角色筛选
      params.role = currentRole.value;
      
      // 直接请求
      const res = await taskApplicationApi.getTaskApplicationList(params);
      
      if (res && res.code === 200 && res.data) {
        const taskList = (res.data.list || []).map(item => ({
          ...item,
          type: 'task'  // 确保每个任务申请都有type字段
        }));
        
        // 处理返回的数据
        if (isRefresh) {
          // 如果只请求任务申请，直接赋值
          if (selectedType.value === 'task') {
            applications.value = taskList;
          }
          // 如果请求所有类型，先赋值任务申请（队伍申请会在另一个函数中添加）
          else if (selectedType.value === 'all') {
            applications.value = taskList;
          }
        } else {
          // 加载更多，合并数据
          applications.value = [...applications.value, ...taskList];
        }
  
        // 判断是否还有更多数据
        if (selectedType.value === 'task') {
          hasNoMore.value = !res.data.hasNext;
        }
        
        // 输出调试信息
        console.log('任务申请列表:', taskList);
      }
    } catch (error) {
      console.error('获取任务申请列表失败:', error);
      uni.showToast({
        title: '获取任务申请失败',
        icon: 'none'
      });
    }
  }
  
  // 获取队伍申请列表
  async function loadTeamApplications(isRefresh) {
    try {
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      };
      
      // 添加状态筛选
      if (selectedStatus.value !== 'all' && selectedStatus.value !== 'processed') {
        params.status = selectedStatus.value;
      }
      
      let res;
      // 根据当前角色请求不同的API
      if (currentRole.value === 'applicant') {
        res = await teamApi.getMyApplications(params);
      } else if (currentRole.value === 'creator' || currentRole.value === 'leader') {
        res = await teamApi.getTeamApplications(params);
      }
      
      if (res && res.code === 200 && res.data) {
        const teamList = (res.data.list || []).map(item => ({
          ...item,
          type: 'team'  // 确保每个队伍申请都有type字段
        }));
        
        // 处理返回的数据
        if (isRefresh) {
          // 如果只请求队伍申请，直接赋值
          if (selectedType.value === 'team') {
            applications.value = teamList;
          } 
          // 如果请求所有类型，追加到已有的任务申请数据后面
          else if (selectedType.value === 'all') {
            applications.value = [...applications.value, ...teamList];
          }
        } else {
          // 加载更多，合并数据
          applications.value = [...applications.value, ...teamList];
        }
        
        // 判断是否还有更多数据
        if (selectedType.value === 'team') {
          hasNoMore.value = !res.data.hasNext;
        }
        
        // 输出调试信息
        console.log('队伍申请列表:', teamList);
      }
    } catch (error) {
      console.error('获取队伍申请列表失败:', error);
      uni.showToast({
        title: '获取队伍申请失败',
        icon: 'none'
      });
    }
  }
  
  // 获取徽章申请列表
  async function loadBadgeApplications(isRefresh) {
    try {
      const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      };
      
      // 添加状态筛选
      if (selectedStatus.value !== 'all' && selectedStatus.value !== 'processed') {
        params.status = selectedStatus.value;
      }
      
      // 调用徽章申请列表接口
      let res;
      try {
        res = await uni.request({
          url: `${baseApiUrl}/badge/approvals/my-applications`,
          method: 'GET',
          data: params,
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        });
      } catch (error) {
        console.error('徽章申请请求失败:', error);
        // 如果请求失败，返回空数据结构以避免后续代码出错
        res = {
          statusCode: 500,
          data: null
        };
      }
      
      // 检查请求是否成功
      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        const badgeList = (res.data.data.records || []).map(item => ({
          ...item,
          id: item.approvalId,
          type: 'badge',
          status: item.currentStatus,
          appliedAt: item.createdAt,
          reviewedAt: item.updatedAt,
          message: item.reviewMessage,
          reviewNotes: item.adminFeedback,
          // 为了适配显示格式，添加一些字段
          badgeTitle: item.competitionName 
            ? `${item.competitionName} - ${item.badgeName || '勋章申请'}`
            : (item.badgeName ? item.badgeName : '勋章申请'),
          applicantName: item.badgeType 
            ? (item.badgeType === 'team_competition' ? '团队竞赛勋章' : '个人勋章') 
            : (item.applicantType === 'team' ? '团队申请' : '个人申请'),
          applicantMajor: item.competitionLevel && item.awardRank 
            ? `${item.competitionLevel} · ${item.awardRank}` 
            : '',
        }));
        
        // 处理返回的数据
        if (isRefresh) {
          // 如果只请求徽章申请，直接赋值
          if (selectedType.value === 'badge') {
            applications.value = badgeList;
          } 
          // 如果请求所有类型，追加到已有数据后面
          else if (selectedType.value === 'all') {
            applications.value = [...applications.value, ...badgeList];
          }
        } else {
          // 加载更多，合并数据
          applications.value = [...applications.value, ...badgeList];
        }
        
        // 判断是否还有更多数据
        if (selectedType.value === 'badge') {
          const totalPages = Math.ceil(res.data.data.total / pageSize.value);
          hasNoMore.value = currentPage.value >= totalPages;
        }
        
        // 输出调试信息
        console.log('徽章申请列表:', badgeList);
      }
    } catch (error) {
      console.error('获取徽章申请列表失败:', error);
      uni.showToast({
        title: '获取徽章申请失败',
        icon: 'none'
      });
    }
  }
  
  // 获取待处理申请数量（用于角标显示）
  async function loadBadgeCount() {
    try {
      // 获取任务待处理数量
      const taskParams = { status: 'pending', role: 'creator', pageSize: 1 };
      const taskRes = await taskApplicationApi.getTaskApplicationList(taskParams);
      
      // 获取队伍待处理数量
      const teamParams = { status: 'pending', pageSize: 1 };
      const teamRes = await teamApi.getTeamApplications(teamParams);
      
      // 更新待处理数量角标
      let totalPending = 0;
      
      if (taskRes && taskRes.code === 200 && taskRes.data && taskRes.data.pendingCount !== undefined) {
        totalPending += taskRes.data.pendingCount;
      }
      
      if (teamRes && teamRes.code === 200 && teamRes.data) {
        // 队伍API可能没有直接返回pendingCount，从total字段获取
        if (teamRes.data.pendingCount !== undefined) {
          totalPending += teamRes.data.pendingCount;
        } else if (teamRes.data.total !== undefined) {
          totalPending += teamRes.data.total;
        } else {
          // 如果没有直接提供数量，尝试从列表计算
          const pendingCount = (teamRes.data.list || []).filter(item => item.status === 'pending').length;
          totalPending += pendingCount;
        }
      }
      
      console.log('更新待处理数量角标:', totalPending);
      
      // 更新标签页角标
      tabs.value[1].badge = totalPending;
      
    } catch (error) {
      console.error('获取待处理数量失败:', error);
    }
  }
  
  // 下拉刷新
  function onRefresh() {
    refreshing.value = true;
    
    // 刷新时重新获取角标数量
    loadBadgeCount();
    
    // 刷新列表数据
    loadApplications(true);
  }
  
  // 加载更多
  function loadMore() {
    if (loading.value || hasNoMore.value) return;
    currentPage.value++;
    loadApplications(false);
  }
  
  // 切换标签页
  function switchTab(index) {
    if (currentTab.value === index) return;
	currentTab.value = index;
    
    // 重置筛选条件
    selectedStatus.value = 'all';
    
    // 如果从别的标签切换到"待我处理"，并且当前选择了徽章申请，则重置为全部
    if (index === 1 && selectedType.value === 'badge') {
      selectedType.value = 'all';
    }
    
    // 根据标签页更新请求角色
    if (index === 0) {
      currentRole.value = 'applicant';
    } else if (index === 1) {
      currentRole.value = 'creator';
    }
    
    // 刷新列表
    loadApplications(true);
  }
  
  // 选择申请类型
  function selectType(type) {
    if (selectedType.value === type) return;
    
    // 在"待我处理"标签页下不允许选择徽章申请
    if (currentTab.value === 1 && type === 'badge') {
      uni.showToast({
        title: '待处理列表中不包含徽章申请',
        icon: 'none'
      });
      return;
    }
    
	selectedType.value = type;
    
    // 重置分页
    currentPage.value = 1;
    hasNoMore.value = false;
    
    // 清空原有数据，避免类型混淆
    applications.value = [];
    
    // 加载新数据
    loadApplications(true);
  }
  
  // 选择状态
  function selectStatus(status) {
    if (selectedStatus.value === status) return;
	selectedStatus.value = status;
    
    loadApplications(true);
  }
  
  // 获取状态样式类
  function getStatusClass(status) {
	switch(status) {
	  case 'pending': return 'status-pending';
	  case 'approved': return 'status-approved';
	  case 'rejected': return 'status-rejected';
      case 'canceled': return 'status-canceled';
	  default: return '';
	}
  }
  
  // 格式化日期时间
  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    
    try {
      const date = new Date(dateTimeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return dateTimeStr;
	}
  }
  
  // 处理申请
  async function handleApplication(id, action, type) {
    if (!id || !type) {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }
    
    // 徽章申请特殊处理
    if (type === 'badge') {
      uni.showToast({
        title: '徽章申请处理功能开发中',
        icon: 'none'
      });
      return;
    }
    
    uni.showModal({
      title: action === 'approved' ? '通过申请' : '拒绝申请',
      content: action === 'approved' ? '确定通过该申请吗？' : '确定拒绝该申请吗？',
      success: async (res) => {
		if (res.confirm) {
          try {
            uni.showLoading({
              title: '处理中...'
            });
            
            let result;
            if (type === 'task') {
              result = await taskApplicationApi.updateTaskApplication(id, {
                status: action,
                reviewNotes: action === 'approved' ? '申请已通过' : '申请已拒绝'
              });
            } else if (type === 'team') {
              result = await teamApi.handleApplication(id, {
                status: action,
                reviewNotes: action === 'approved' ? '申请已通过' : '申请已拒绝'
              });
            } else {
              throw new Error('未知的申请类型');
            }
            
            uni.hideLoading();
            
            if (result && result.code === 200 && result.data && result.data.success) {
			uni.showToast({
                title: action === 'approved' ? '已通过申请' : '已拒绝申请',
			  icon: 'success'
              });
              
              // 刷新列表
              loadApplications(true);
              
              // 更新角标数量
              loadBadgeCount();
            } else {
              uni.showToast({
                title: result?.message || '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            uni.hideLoading();
            console.error('处理申请失败:', error);
            uni.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none'
			});
		  }
		}
	  }
	});
  }
  
  // 取消申请
  async function cancelApplication(id, type) {
    if (!id || !type) {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }
    
    // 徽章申请特殊处理
    if (type === 'badge') {
      uni.showToast({
        title: '徽章申请取消功能开发中',
        icon: 'none'
      });
      return;
    }
    
	uni.showModal({
      title: '取消申请',
      content: '确定要取消该申请吗？',
      success: async (res) => {
		if (res.confirm) {
          try {
            uni.showLoading({
              title: '处理中...'
            });
            
            let result;
            if (type === 'task') {
              result = await taskApplicationApi.cancelTaskApplication(id);
            } else if (type === 'team') {
              result = await teamApi.cancelApplication(id);
            } else {
              throw new Error('未知的申请类型');
            }
            
            uni.hideLoading();
            
            if (result && result.code === 200 && result.data && result.data.success) {
			uni.showToast({
                title: '已取消申请',
			  icon: 'success'
              });
              
              // 刷新列表
              loadApplications(true);
              
              // 更新角标数量
              loadBadgeCount();
            } else {
              uni.showToast({
                title: result?.message || '操作失败',
		  icon: 'none'
		});
            }
          } catch (error) {
            uni.hideLoading();
            console.error('取消申请失败:', error);
            uni.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none'
			});
		  }
		}
	  }
	});
  }
  
  // 创建新申请
  function createApplication() {
    // 根据当前选择的申请类型跳转到不同的页面
    if (selectedType.value === 'team') {
      uni.navigateTo({
        url: '/pages/team/list'
      });
    } else if (selectedType.value === 'badge') {
      uni.navigateTo({
        url: '/pages/badge/apply'  // 假设有一个徽章申请页面
      });
    } else {
      uni.navigateTo({
        url: '/pages/task-square/index'
      });
    }
  }
  
  // 查看申请详情
  function viewDetail(item) {
    if (item.type === 'task') {
      // 跳转到任务详情页
      uni.navigateTo({
        url: `/pages/task-square/detail?id=${item.taskId}`
      });
    } else if (item.type === 'team') {
      // 跳转到队伍详情页
      uni.navigateTo({
        url: `/pages/team/detail?id=${item.teamId}`
	});
    } else if (item.type === 'badge') {
      // 跳转到徽章申请详情页 (如果有的话)
		uni.showToast({
        title: '徽章申请详情功能开发中',
		  icon: 'none'
		});

      // 显示徽章申请详情弹窗
      uni.showModal({
        title: item.badgeName || '勋章申请详情',
        content: `竞赛：${item.competitionName || '未知竞赛'}\n等级：${item.competitionLevel || '未知'}\n奖项：${item.awardRank || '未知'}\n申请时间：${formatDateTime(item.appliedAt)}\n申请说明：${item.message || '无'}\n${item.reviewNotes ? `审核反馈：${item.reviewNotes}` : ''}`,
        showCancel: false,
        confirmText: '关闭'
      });
	  }
  }
  
  // 查看用户个人资料
  function viewUserProfile(userId) {
    if (!userId) {
      uni.showToast({
        title: '无法获取用户ID',
        icon: 'none'
      });
      return;
    }
    
    uni.navigateTo({
      url: `/pages/profile/view-user-info?userId=${userId}`
    });
  }
  
  // 返回上一页
  function goBack() {
	uni.navigateBack();
  }
  
  // 获取系统信息，计算安全区域
  function getSystemInfo() {
    uni.getSystemInfo({
      success: (res) => {
        console.log('系统信息:', res);
        if (res.safeArea) {
          console.log('安全区域信息:', res.safeArea);
          if (res.safeArea.top) {
            // 将px转换为rpx (750rpx = 设计稿宽度)
            const screenWidth = res.screenWidth;
            safeAreaTop.value = Math.round((res.safeArea.top * 750) / screenWidth);
            console.log('屏幕宽度:', screenWidth, 'px');
            console.log('安全区顶部:', res.safeArea.top, 'px');
            console.log('安全区高度(rpx):', safeAreaTop.value);
            
            // 根据安全区域调整导航栏
            if (safeAreaTop.value > 40) {
              // 如果安全区域较大，增加额外的padding
              document.documentElement.style.setProperty('--nav-extra-padding', '100rpx');
              console.log('应用了额外的导航栏内边距');
            }
          }
        }
      }
    });
  }
  </script>
  
  <style lang="scss">
  // 颜色变量
  $primary-color: #4A90E2;  // 活力蓝
  $success-color: #7ED321;  // 校园绿
  $warning-color: #F5A623;  // 竞赛橙修改为更适合"待处理"的黄色
  $danger-color: #FF6B6B;   // 竞赛橙修改为拒绝的红色
  $background-color: #F8F9FA;
  $card-color: #FFFFFF;
  $text-color: #333333;
  $text-secondary: #666666;
  $text-muted: #999999;
  $border-color: #EAEAEA;
  
  // 任务卡片颜色
  $task-color: #4A90E2;     // 蓝色
  $team-color: #9C27B0;     // 紫色
  $badge-color: #F5A623;    // 黄色
  
  page {
	background-color: $background-color;
	font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  /* 定义CSS自定义变量 */
  :root {
    --nav-extra-padding: 60rpx;
  }
  
  .application-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	position: relative;
  }

  // 固定区域
  .fixed-area {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: $card-color;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    /* 添加安全区域适配 */
    padding-top: 0; /* 移除padding-top，我们使用专门的视图来占位 */
  }
  
  // 安全区域占位
  .safe-area-top {
    height: env(safe-area-inset-top, 0);
    background-color: $card-color;
  }
  
  // 导航栏
  .nav-bar {
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	/* 使用CSS变量控制顶部内边距 */
	padding-top: var(--nav-extra-padding);
	background-color: $card-color;
	
	.back-btn {
	  width: 60rpx;
	  height: 60rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  
	  .iconfont {
		font-size: 40rpx;
		color: $text-color;
	  }
	}
	
	.page-title {
	  font-size: 32rpx;
	  font-weight: 500;
	  color: $text-color;
	}
	
	.placeholder-right {
	  width: 60rpx;
	}
  }

  // 筛选区域
  .filter-tabs {
	padding: 10rpx 0;
	background-color: $card-color;
	
	&.status-tabs {
	  border-top: 1rpx solid rgba($border-color, 0.5);
	}
	
	.filter-options {
	  display: flex;
	  flex-wrap: wrap;
	  padding: 0 20rpx;
	}
	
	.filter-tab {
	  padding: 10rpx 20rpx;
	  margin: 5rpx 10rpx;
	  border-radius: 30rpx;
	  font-size: 26rpx;
	  color: $text-secondary;
	  background-color: $background-color;
	  
	  &.active {
		background-color: rgba($primary-color, 0.1);
		color: $primary-color;
		font-weight: 500;
	  }
	}
  }
  
  // 标签页
  .tabs {
	display: flex;
	background-color: $card-color;
	border-top: 1rpx solid rgba($border-color, 0.5);
	position: relative;
	z-index: 5;
	
	.tab {
	  flex: 1;
	  height: 80rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  font-size: 28rpx;
	  color: $text-secondary;
	  position: relative;
	  
	  &.active {
		color: $primary-color;
		font-weight: 500;
		
		&:after {
		  content: '';
		  position: absolute;
		  bottom: 0;
		  left: 50%;
		  transform: translateX(-50%);
		  width: 40%;
		  height: 6rpx;
		  background-color: $primary-color;
		  border-radius: 3rpx;
		}
	  }
	  
	  .badge {
		position: absolute;
		top: 10rpx;
		right: 50rpx;
		min-width: 32rpx;
		height: 32rpx;
		border-radius: 16rpx;
		background-color: $danger-color;
		color: #fff;
		font-size: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 8rpx;
	  }
	}
  }
  
  // 申请列表
  .application-list {
	flex: 1;
	background-color: $background-color;
	padding: 20rpx;
    /* 增加固定区域的基础高度，不需要再加上安全区域高度 */
    margin-top: 400rpx;
	
	.application-card {
	  background-color: $card-color;
	  border-radius: 16rpx;
	  margin-bottom: 20rpx;
	  padding: 20rpx 20rpx 20rpx 24rpx;
	  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	  position: relative;
	  overflow: hidden;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
	  
	  &:before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 6rpx;
		height: 100%;
		background-color: $primary-color;
	  }
	  
	  &.card-task:before {
		background-color: $task-color;
	  }
	  
	  &.card-team:before {
		background-color: $team-color;
	  }
	  
	  &.card-badge:before {
		background-color: $badge-color;
	  }
	  
	  .status-corner {
		position: absolute;
		right: 10rpx;

		padding: 6rpx 20rpx;
		  font-size: 24rpx;
		color: #fff;
		z-index: 10;
		transform: translate(30%, -30%) rotate(45deg);
		transform-origin: center;
		width: 160rpx;
		text-align: center;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
		  
		  &.status-pending {
		  background-color: $warning-color;
		  }
		  
		  &.status-approved {
		  background-color: $success-color;
		  }
		  
		  &.status-rejected {
		  background-color: $danger-color;
		  }
		
		&.status-canceled {
		  background-color: $text-muted;
		}
	  }
	  
	  .card-content {
		.card-title {
		  font-size: 28rpx;
		  font-weight: 500;
		  color: $text-color;
		  margin-bottom: 14rpx;
          margin-right: 60rpx; /* 为右上角的状态标签预留空间 */
		}
		
		.card-info {
		  .info-item {
			display: flex;
			margin-bottom: 8rpx;
			font-size: 24rpx;
			line-height: 1.5;
			
			.info-label {
			  color: $text-secondary;
			  width: 150rpx;
			  flex-shrink: 0;
			}
			
			.info-value {
			  color: $text-color;
			  flex: 1;
              
              &.clickable {
                color: $primary-color;
                text-decoration: underline;
                
                &:active {
                  opacity: 0.7;
                }
              }
			}
		  }
		}
	  }
	  
	  .card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid $border-color;
		
        .btn-group {
          display: flex;
          gap: 16rpx;
          flex: 1;
		justify-content: flex-end;
        }
		
		.btn {
		  min-width: 120rpx;
		  height: 56rpx;
		  border-radius: 28rpx;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  font-size: 24rpx;
          padding: 0 20rpx;
          box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          
          &:active {
            transform: scale(0.95);
            opacity: 0.9;
          }
		}
		
		.btn-reject {
		  background-color: #FFF;
		  color: $danger-color;
		  border: 1rpx solid $danger-color;
		}
		
		.btn-approve {
		  background-color: $primary-color;
		  color: #FFF;
		}
        
        .btn-detail {
          background-color: rgba($primary-color, 0.1);
          color: $primary-color;
          border: 1rpx solid $primary-color;
		}
		
		.process-time {
		  font-size: 22rpx;
		  color: $text-muted;
         
		  margin-right:40rpx;
		}
		}
	  }
	}
	
	.empty-state {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  padding: 100rpx 0;
	  
	  .empty-image {
	  width: 220rpx;
	  height: 220rpx;
		margin-bottom: 30rpx;
	  }
	  
	  .empty-text {
		font-size: 28rpx;
		color: $text-muted;
	}
  }
  
  // 创建按钮
  .create-btn {
	position: fixed;
	bottom: 40rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 300rpx;
	height: 80rpx;
	background-color: $primary-color;
	color: #fff;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.3);
	z-index: 100;
	
	.iconfont {
	  margin-right: 8rpx;
	  font-size: 28rpx;
	}
  }
  
  // 底部安全区域
  .safe-area-bottom {
	height: calc(120rpx + env(safe-area-inset-bottom, 0));
  }
  
  // 加载更多
  .loading-more, .no-more {
    padding: 30rpx 0;
    text-align: center;
    color: $text-muted;
    font-size: 24rpx;
	}
  
  .card-title {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-color;
    margin-bottom: 14rpx;
    margin-right: 60rpx; /* 为右上角的状态标签预留空间 */
    display: flex;
    align-items: center;
  }
  
  .type-tag {
    font-size: 22rpx;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    margin-left: 12rpx;
  }
  
  .task-type {
    background-color: rgba($task-color, 0.1);
    color: $task-color;
  }
  
  .team-type {
    background-color: rgba($team-color, 0.1);
    color: $team-color;
  }
  
  .badge-type {
    background-color: rgba($badge-color, 0.1);
    color: $badge-color;
  }
  
  // 勋章图标样式
  .badge-icon-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16rpx;
    
    .badge-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 10rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }
  }
  
  // 高亮显示的申请卡片
  .highlight-application {
    animation: highlight-pulse 3s ease-in-out;
    box-shadow: 0 0 15rpx rgba($primary-color, 0.8);
    border: 2rpx solid $primary-color;
  }
  
  @keyframes highlight-pulse {
    0% {
      box-shadow: 0 0 15rpx rgba($primary-color, 0.8);
      transform: scale(1);
    }
    20% {
      box-shadow: 0 0 25rpx rgba($primary-color, 0.9);
      transform: scale(1.02);
    }
    100% {
      box-shadow: 0 0 15rpx rgba($primary-color, 0);
      transform: scale(1);
    }
  }
  </style>