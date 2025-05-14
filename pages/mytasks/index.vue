<template>
  <view class="container">
    <!-- 顶部导航栏替换为HeaderBar组件 -->
    <HeaderBar title="我的任务" :showSearch="false" :showFilter="false" />
    
    <!-- 页面内容容器，考虑顶部HeaderBar的高度 -->
    <view class="content-container">
      <!-- 标签页选择器 -->
      <view class="tabs">
        <view 
          v-for="(tab, index) in tabs" 
          :key="index" 
          class="tab-item" 
          :class="{ 'active': activeTab === index }"
          @click="switchTab(index)"
        >
          <text>{{ tab }}</text>
      </view>
    </view>
    
    <!-- 筛选器 -->
    <view class="status-filter-container">
      <scroll-view scroll-x class="status-scroll" show-scrollbar="false" :scroll-into-view="'status-' + selectedStatus" scroll-with-animation>
        <view class="status-list">
          <view 
            v-for="(status, index) in statusOptions" 
            :key="index"
            :id="'status-' + status.value"
            class="status-item"
            :class="{ 'active': selectedStatus === status.value }"
            @click="filterByStatus(status.value)"
          >
            <text>{{ status.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 列表内容区域 -->
    <scroll-view 
      scroll-y 
      class="task-list-container" 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 我创建的任务 -->
      <block v-if="activeTab === 0">
        <view v-if="createdTasks.length === 0 && !loading" class="empty-container">
          <image src="/static/image/empty-data.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">您还没有创建任何任务</text>
          <button class="create-btn" @click="navigateToCreate">创建任务</button>
        </view>
        
        <view v-else class="task-list">
          <view 
              v-for="(task, index) in createdTasks" 
            :key="task.id"
            class="task-card"
              @click="navigateToDetail(task, index)"
          >
            <view class="task-header">
              <view class="task-title-row">
                <text class="task-title">{{ task.title }}</text>
                <view class="task-status" :class="getStatusClass(task.status)">
                  <text>{{ task.statusText }}</text>
                </view>
              </view>
              <view class="task-meta">
                <view class="category-tag">{{ task.categoryName }}</view>
                <text class="task-date">截止时间: {{ formatDate(task.deadline) }}</text>
              </view>
            </view>
            
            <view class="task-content">
              <text class="task-desc">{{ task.shortDescription }}</text>
              
              <view class="task-footer">
                <view class="task-reward">
                    <text class="reward-text">{{ getRewardText(task) }}</text>
                </view>
                
                <view class="task-progress">
                  <text class="progress-text">{{ task.currentParticipants }}/{{ task.maxParticipants }}</text>
                  <view class="progress-bar">
                    <view 
                      class="progress-inner" 
                      :style="{ width: (task.currentParticipants / task.maxParticipants * 100) + '%' }"
                    ></view>
                  </view>
                </view>
              </view>
              
                <!-- 按钮区域 -->
                <view class="task-actions">
              <!-- 参与者查看按钮 -->
                  <button 
                    class="participants-btn" 
                    v-if="task.currentParticipants > 0" 
                    @click.stop.prevent="viewParticipants(task.id)"
                    :data-id="task.id"
                  >
                <text class="participants-btn-text">查看参与者</text>
                  </button>
                  
                  <!-- 更新任务状态按钮 -->
                  <button 
                    class="task-status-btn" 
                    @click.stop.prevent="openTaskStatusPopup(task, index)"
                  >
                    <text class="task-status-btn-text">更新状态</text>
                  </button>
              </view>
            </view>
          </view>
          
          <!-- 加载更多状态 -->
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-if="!hasMore && createdTasks.length > 0" class="no-more">
            <text>没有更多了</text>
          </view>
        </view>
      </block>
      
      <!-- 我参与的任务 -->
      <block v-if="activeTab === 1">
        <view v-if="participatedTasks.length === 0 && !loading" class="empty-container">
          <image src="/static/image/empty-data.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">您还没有参与任何任务</text>
          <button class="browse-btn" @click="navigateToTaskSquare">浏览任务广场</button>
        </view>
        
        <view v-else class="task-list">
          <view 
              v-for="(task, index) in participatedTasks" 
            :key="task.id"
            class="task-card"
          >
              <view class="task-header" @click="navigateToDetail(task, index)">
              <view class="task-title-row">
                <text class="task-title">{{ task.title }}</text>
                <view class="task-status" :class="getStatusClass(task.status)">
                  <text>{{ task.statusText }}</text>
                </view>
              </view>
              <view class="task-meta">
                <view class="category-tag">{{ task.categoryName }}</view>
                <text class="task-date">截止时间: {{ formatDate(task.deadline) }}</text>
              </view>
            </view>
            
              <view class="task-content" @click="navigateToDetail(task, index)">
              <view class="creator-info">
                <image :src="task.creatorAvatarUrl" class="creator-avatar"></image>
                <view class="creator-detail">
                  <text class="creator-name">{{ task.creatorName }}</text>
                  <text class="creator-major">{{ task.creatorMajor }}</text>
                </view>
              </view>
                
                <!-- 添加我的参与状态 -->
                <view class="participation-status">
                  <text class="status-label">我的状态:</text>
                  <view class="status-tag" :class="getParticipationStatusClass(task.participationStatus)">
                    {{ getParticipationStatusText(task.participationStatus) }}
                  </view>
                </view>
              
              <text class="task-desc">{{ task.shortDescription }}</text>
              
              <view class="task-footer">
                <view class="task-reward">
                    <text class="reward-text">{{ getRewardText(task) }}</text>
                </view>
                
                <view class="task-location">
                  <text class="location-icon iconfont icon-location"></text>
                  <text class="location-text">{{ task.location }}</text>
                </view>
              </view>
              
                <!-- 新增参与人数显示 -->
                <view class="participants-count" v-if="task.currentParticipants > 0">
                  <text class="participants-count-text">当前参与人数: {{ task.currentParticipants }}人</text>
              </view>
            </view>
              
              <!-- 新增操作按钮区域 -->
              <view class="action-buttons">
                <button class="action-btn view-btn" @click="navigateToDetail(task, index)">
                  查看详情
                </button>
                <button 
                  class="action-btn update-btn" 
                  :class="{'disabled-btn': task.participationStatus === 'completed' || task.participationStatus === 'left'}"
                  @click="task.participationStatus !== 'completed' && task.participationStatus !== 'left' ? openStatusUpdatePopup(task, index) : null"
                >
                  更新状态{{ task.participationStatus === 'completed' || task.participationStatus === 'left' ? '(已锁定)' : '' }}
                </button>
              </view>
          </view>
          
          <!-- 加载更多状态 -->
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-if="!hasMore && participatedTasks.length > 0" class="no-more">
            <text>没有更多了</text>
          </view>
        </view>
      </block>
    </scroll-view>
    
    <!-- 悬浮按钮 -->
    <view class="float-btn" @click="navigateToCreate" v-if="activeTab === 0">
      <text class="add-icon">+</text>
    </view>
    
    <!-- 参与者弹窗组件 -->
      <task-participants-popup ref="participantsPopupRef" :task-id="currentTaskId"></task-participants-popup>
      
      <!-- 新增参与者状态弹窗 -->
      <uni-popup ref="statusPopupRef" type="center">
        <view class="status-popup-content">
          <view class="status-popup-header">
            <text class="status-popup-title">更新参与状态</text>
            <view class="close-icon" @click="closeStatusPopup">
              <text class="iconfont icon-guanbi" style="font-size: 36rpx; color: #666;"></text>
            </view>
          </view>
          
          <view class="status-options">
            <!-- 当前是已加入状态，显示"进行中"选项 -->
            <view 
              v-if="selectedParticipationStatus === 'joined'"
              class="status-option" 
              style="background-color: #4a90e2; color: #FFFFFF; font-weight: bold;"
              @click="selectParticipationStatus('in_progress')"
            >
              进行中
            </view>
            
            <!-- 当前是进行中状态，只显示"已完成"选项 -->
            <view 
              v-if="selectedParticipationStatus === 'in_progress'"
              class="status-option" 
              @click="selectParticipationStatus('completed')"
            >
              已完成
            </view>
            
            <!-- 当前是进行中状态，也显示"已离开"选项 -->
            <view 
              v-if="selectedParticipationStatus === 'in_progress' || selectedParticipationStatus === 'joined'"
              class="status-option" 
              @click="selectParticipationStatus('left')"
            >
              已离开
            </view>
          </view>
          
          <view class="reason-input-container" v-if="selectedParticipationStatus === 'completed' || selectedParticipationStatus === 'left'">
            <text class="reason-label">原因说明(选填):</text>
            <textarea class="reason-input" v-model="statusReason" placeholder="请输入状态更新原因" maxlength="200"></textarea>
            <text class="reason-count">{{ statusReason.length }}/200</text>
          </view>
          
          <view class="status-popup-footer">
            <button class="cancel-btn" @click="closeStatusPopup">取消</button>
            <button class="confirm-btn" @click="confirmUpdateStatus">确认</button>
          </view>
        </view>
      </uni-popup>
      
      <!-- 添加任务状态更新弹窗 -->
      <uni-popup ref="taskStatusPopupRef" type="center">
        <view class="status-popup-content">
          <view class="status-popup-header">
            <text class="status-popup-title">更新任务状态</text>
            <view class="close-icon" @click="closeTaskStatusPopup">
              <text class="iconfont icon-guanbi" style="font-size: 36rpx; color: #666;"></text>
            </view>
          </view>
          
          <view class="status-options">
            <!-- 添加招募中选项，如果任务还没有进入招募状态 -->
            <view 
              v-if="currentTaskStatus === 'pending' || currentTaskStatus === ''"
              class="status-option"
              :class="{'active': selectedTaskStatus === 'recruiting'}"
              @click="selectTaskStatus('recruiting')"
            >
              招募中
            </view>
            
            <!-- 显示进入进行中选项 -->
            <view 
              v-if="currentTaskStatus === 'recruiting'"
              class="status-option"
              :class="{'active': selectedTaskStatus === 'ongoing'}"
              @click="selectTaskStatus('ongoing')"
            >
              进行中
            </view>
            
            <view 
              v-if="currentTaskStatus === 'ongoing'"
              class="status-option"
              :class="{'active': selectedTaskStatus === 'ended'}"
              @click="selectTaskStatus('ended')"
            >
              已结束
            </view>
            
            <view 
              v-if="currentTaskStatus === 'ended'"
              class="status-option"
              :class="{'active': selectedTaskStatus === 'completed'}"
              @click="selectTaskStatus('completed')"
            >
              已完成
            </view>
            
            <!-- 取消选项始终可见（除非已完成或已取消） -->
            <view 
              v-if="currentTaskStatus !== 'canceled' && currentTaskStatus !== 'completed'"
              class="status-option"
              :class="{'active': selectedTaskStatus === 'canceled'}"
              @click="selectTaskStatus('canceled')"
            >
              已取消
            </view>
          </view>
          
          <!-- 当选择已取消状态时，需要输入取消原因 -->
          <view class="reason-input-container" v-if="selectedTaskStatus === 'canceled'">
            <text class="reason-label">取消原因(必填):</text>
            <textarea class="reason-input" v-model="cancelReason" placeholder="请输入取消任务的原因" maxlength="200"></textarea>
            <text class="reason-count">{{ cancelReason.length }}/200</text>
          </view>
          
          <view class="status-popup-footer">
            <button class="cancel-btn" @click="closeTaskStatusPopup">取消</button>
            <button class="confirm-btn" @click="confirmUpdateTaskStatus">确认</button>
          </view>
        </view>
      </uni-popup>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from 'vue';
import tasksApi from '@/api/modules/tasks';
import TaskParticipantsPopup from '@/components/team/TaskParticipantsPopup.vue';
import HeaderBar from '@/components/HeaderBar.vue';

// 标签页相关
const tabs = ['我创建的', '我参与的'];
const activeTab = ref(0);

// 筛选选项
const statusOptions = computed(() => {
  if (activeTab.value === 0) {
    // 我创建的任务状态
    return [
      { label: '全部', value: 'all' },
  { label: '招募中', value: 'recruiting' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'canceled' }
];
  } else {
    // 我参与的任务状态
    return [
      { label: '全部', value: 'all' },
      { label: '招募中', value: 'recruiting' },
      { label: '进行中', value: 'ongoing' },
      { label: '已结束', value: 'ended' },
      { label: '已完成', value: 'completed' },
      { label: '已退出', value: 'left' },
      { label: '被踢出', value: 'kicked_out' }
    ];
  }
});
const selectedStatus = ref('all');

// 分页相关
const pageSize = 10;
const createdPage = ref(1);
const participatedPage = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const refreshing = ref(false);

// 任务数据
const createdTasks = ref([]);
const participatedTasks = ref([]);
const participantsPopupVisible = ref(false);
const currentTaskId = ref(null);

// 组件引用
const participantsPopupRef = ref(null);

// 状态更新相关
const statusPopupRef = ref(null);
const selectedParticipationStatus = ref('');
const statusReason = ref('');
const currentParticipationId = ref(null);
const currentTaskIndex = ref(-1);

// 参与状态选项 - 根据当前状态动态提供合适的选项
const participationStatusOptions = computed(() => {
  console.log('计算可选状态选项，当前状态:', selectedParticipationStatus.value);
  
  // 简化逻辑，无论当前状态如何，都提供进行中、已完成和已离开三个选项
  return [
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'completed' },
    { label: '已离开', value: 'left' }
  ];
});

// 任务状态更新相关
const taskStatusPopupRef = ref(null);
const currentTaskStatus = ref('');
const selectedTaskStatus = ref('');
const cancelReason = ref('');

// 初始化
onMounted(() => {
  loadTasks();
  
  // 监听刷新任务列表事件
  uni.$on('refreshTaskList', refreshTaskList);
});

// 组件卸载时清除事件监听
onUnmounted(() => {
  uni.$off('refreshTaskList', refreshTaskList);
});

// 刷新任务列表
function refreshTaskList() {
  console.log('收到刷新任务列表事件');
  resetList();
  loadTasks();
}

// 切换标签页
function switchTab(index) {
  activeTab.value = index;
  // 重置状态筛选
  selectedStatus.value = 'all';
  resetList();
  loadTasks();
}

// 按状态筛选
function filterByStatus(status) {
  selectedStatus.value = status;
  resetList();
  loadTasks();
}

// 重置列表
function resetList() {
  if (activeTab.value === 0) {
    createdTasks.value = [];
    createdPage.value = 1;
  } else {
    participatedTasks.value = [];
    participatedPage.value = 1;
  }
  hasMore.value = true;
}

// 加载任务列表
async function loadTasks() {
  if (!hasMore.value || loading.value) return;
  
  loading.value = true;
  
  try {
    const params = {
      pageNum: activeTab.value === 0 ? createdPage.value : participatedPage.value,
      pageSize: pageSize
    };
    
    // 添加状态筛选
    if (selectedStatus.value && selectedStatus.value !== 'all') {
      params.status = selectedStatus.value;
    }
    
    // 添加日志，查看请求参数
    console.log(`请求${activeTab.value === 0 ? '我创建的' : '我参与的'}任务列表，参数:`, params);
    
    // 根据标签页调用不同API
    let res;
    if (activeTab.value === 0) {
      res = await tasksApi.getMyCreatedTasks(params);
    } else {
      res = await tasksApi.getMyParticipatedTasks(params);
    }
    
    // 添加日志，查看响应结果
    console.log(`${activeTab.value === 0 ? '我创建的' : '我参与的'}任务列表响应:`, res);
    
    if (res.code === 200 && res.data) {
      const { records, total, current, pages } = res.data;
      
      // 输出返回的记录数量
      console.log(`获取到${records.length}条记录，总计${total}条`);
      
      // 更新列表数据
      if (activeTab.value === 0) {
        createdTasks.value = [...createdTasks.value, ...records];
        createdPage.value++;
      } else {
        participatedTasks.value = [...participatedTasks.value, ...records];
        participatedPage.value++;
      }
      
      // 判断是否还有下一页
      hasMore.value = current < pages;
    } else {
      console.error('加载任务失败:', res);
      uni.showToast({
        title: res.message || '加载任务失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载任务出错:', error);
    uni.showToast({
      title: '加载任务出错',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 下拉刷新
function onRefresh() {
  refreshing.value = true;
  resetList();
  loadTasks().finally(() => {
    refreshing.value = false;
  });
}

// 加载更多
function loadMore() {
  loadTasks();
}

// 获取状态样式类
function getStatusClass(status) {
  const statusMap = {
    'recruiting': 'status-recruiting',
    'ongoing': 'status-ongoing',
    'ended': 'status-ended',
    'completed': 'status-completed',
    'canceled': 'status-canceled'
  };
  
  return statusMap[status] || 'status-default';
}

// 日期格式化
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 页面导航
function navigateToDetail(task, index) {
  if (activeTab.value === 0) {
  uni.navigateTo({
      url: `/pages/task-square/detail?id=${task.id}`
    });
  } else {
    // 直接跳转到详情页，不再弹出操作菜单
    uni.navigateTo({
      url: `/pages/task-square/detail?id=${task.id}`
    });
  }
}

function navigateToCreate() {
  uni.navigateTo({
    url: '/pages/task-square/create'
  });
}

function navigateToTaskSquare() {
  uni.switchTab({
    url: '/pages/task-square/index'
  });
}

// 查看任务参与者
function viewParticipants(taskId) {
  // 阻止事件冒泡，防止触发任务卡片点击事件
  const e = event || window.event;
  if (e) {
    e.stopPropagation();
  }
  
  // 详细调试日志
  console.log('查看参与者按钮被点击，任务ID:', taskId);
  
  // 确保先更新参数再触发事件
  currentTaskId.value = taskId;
  console.log('currentTaskId已更新为:', currentTaskId.value);
  
  // 先尝试直接调用组件方法
  if (participantsPopupRef.value) {
    console.log('找到参与者弹窗组件引用，直接调用方法');
    // 确保数据已更新
    nextTick(() => {
      participantsPopupRef.value.open();
    });
  } else {
    console.log('未找到组件引用，使用事件总线');
    // 作为备选方案使用事件总线
  uni.$emit('openParticipantsPopup');
  }
}

// 获取奖励单位
function getRewardUnit(typeId) {
  const unitMap = {
    1: '元',   // 现金
    2: '分',   // 学分
    3: '小时', // 志愿服务
    4: '天',   // 实习机会
    5: '件',   // 礼品
    6: '张'    // 证书
  };
  return unitMap[typeId] || '';
}

// 获取奖励显示文本
function getRewardText(task) {
  if (!task.rewardTypeId || !task.rewardAmount) return '无奖励';
  return `${task.rewardTypeName}: ${task.rewardAmount}${getRewardUnit(task.rewardTypeId)}`;
}

// 获取参与状态类
function getParticipationStatusClass(status) {
  const statusMap = {
    'joined': 'status-joined',
    'in_progress': 'status-progress',
    'completed': 'status-completed',
    'left': 'status-left',
    'kicked_out': 'status-kicked'
  };
  
  return statusMap[status] || 'status-default';
}

// 获取参与状态文本
function getParticipationStatusText(status) {
  const statusMap = {
    'joined': '已加入',
    'in_progress': '进行中',
    'completed': '已完成',
    'left': '已退出',
    'kicked_out': '被踢出'
  };
  
  return statusMap[status] || '未知状态';
}

// 打开状态更新弹窗
function openStatusUpdatePopup(task, index) {
  // 检查任务状态，如果已完成或已离开则不允许更新
  if (task.participationStatus === 'completed' || task.participationStatus === 'left') {
    uni.showToast({
      title: '已' + getParticipationStatusText(task.participationStatus) + '的任务不能再更新状态',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  // 继续正常流程
  currentParticipationId.value = task.participationId;
  statusReason.value = '';
  currentTaskIndex.value = index;
  currentTaskId.value = task.id; // 存储当前任务ID
  
  // 立即设置当前状态，确保弹窗显示正确的选项
  console.log('设置初始状态为:', task.participationStatus);
  selectedParticipationStatus.value = task.participationStatus;
  
  // 打开弹窗
  console.log('准备打开状态更新弹窗');
  if (statusPopupRef.value) {
    statusPopupRef.value.open('center');
    console.log('弹窗已打开');
  } else {
    uni.showToast({
      title: '打开弹窗失败',
      icon: 'none'
    });
  }
}

// 关闭状态更新弹窗
function closeStatusPopup() {
  if (statusPopupRef.value) {
    statusPopupRef.value.close();
  }
}

// 确认更新状态
async function confirmUpdateStatus() {
  if (!currentParticipationId.value) {
    uni.showToast({
      title: '参与记录ID不存在',
      icon: 'none'
    });
    return;
  }
  
  if (!currentTaskId.value) {
    uni.showToast({
      title: '任务ID不存在',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({ title: '更新中...' });
    
    const data = {
      status: selectedParticipationStatus.value
    };
    
    if (statusReason.value.trim()) {
      data.reason = statusReason.value.trim();
    }
    
    console.log('发送状态更新请求:', {
      participationId: currentParticipationId.value,
      taskId: currentTaskId.value,
      data
    });
    
    const res = await tasksApi.updateParticipationStatus(
      currentParticipationId.value, 
      data, 
      currentTaskId.value
    );
    
    if (res.code === 200) {
      // 更新本地数据
      if (currentTaskIndex.value >= 0 && participatedTasks.value[currentTaskIndex.value]) {
        // 更新状态值
        participatedTasks.value[currentTaskIndex.value].participationStatus = selectedParticipationStatus.value;
        console.log('更新后的状态:', participatedTasks.value[currentTaskIndex.value].participationStatus);
        
        // 强制视图刷新
        participatedTasks.value = [...participatedTasks.value];
      }
      
      uni.showToast({
        title: '状态更新成功',
        icon: 'success'
      });
      
      closeStatusPopup();
      
      // 等状态显示后延迟刷新列表，以确保服务器状态同步
      setTimeout(() => {
        resetList();
        loadTasks();
      }, 500);
    } else {
      uni.showToast({
        title: res.message || '状态更新失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新参与状态失败:', error);
    uni.showToast({
      title: '状态更新失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 选择参与状态
function selectParticipationStatus(status) {
  console.log('======= 选择状态操作 =======');
  console.log('选择了状态:', status);
  console.log('之前的状态:', selectedParticipationStatus.value);
  
  // 只有在状态不同时才更新
  if (selectedParticipationStatus.value !== status) {
    selectedParticipationStatus.value = status;
    console.log('状态已更新为:', status);
    
    // 强制UI刷新
    uni.showToast({
      title: '已选择: ' + getParticipationStatusText(status),
      icon: 'none',
      duration: 1000
    });
  } else {
    console.log('状态未变化，保持:', status);
  }
}

// 打开任务状态弹窗
function openTaskStatusPopup(task, index) {
  currentTaskId.value = task.id;
  currentTaskIndex.value = index;
  currentTaskStatus.value = task.status;
  selectedTaskStatus.value = '';
  cancelReason.value = '';
  
  console.log('打开任务状态弹窗，任务ID:', task.id, '当前状态:', task.status);
  
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    if (taskStatusPopupRef.value) {
      taskStatusPopupRef.value.open('center');
    } else {
      uni.showToast({
        title: '打开弹窗失败',
        icon: 'none'
      });
    }
  });
}

// 关闭任务状态弹窗
function closeTaskStatusPopup() {
  if (taskStatusPopupRef.value) {
    taskStatusPopupRef.value.close();
  }
}

// 选择任务状态
function selectTaskStatus(status) {
  console.log('选择任务状态:', status, '之前的状态:', selectedTaskStatus.value);
  
  // 设置选中状态
  selectedTaskStatus.value = status;
  
  // 提供视觉反馈
  uni.showToast({
    title: '已选择: ' + getTaskStatusText(status),
    icon: 'none',
    duration: 1000
  });
  
  // 添加任务状态文本获取函数
  function getTaskStatusText(status) {
    const statusMap = {
      'recruiting': '招募中',
      'ongoing': '进行中',
      'ended': '已结束',
      'completed': '已完成',
      'canceled': '已取消'
    };
    return statusMap[status] || status;
  }
}

// 确认更新任务状态
async function confirmUpdateTaskStatus() {
  if (!selectedTaskStatus.value) {
    uni.showToast({
      title: '请选择要更新的状态',
      icon: 'none'
    });
    return;
  }
  
  // 如果选择取消状态但没有填写取消原因
  if (selectedTaskStatus.value === 'canceled' && !cancelReason.value.trim()) {
    uni.showToast({
      title: '请填写取消原因',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({ title: '更新中...' });
    
    const data = {
      status: selectedTaskStatus.value
    };
    
    // 如果是取消状态，添加取消原因
    if (selectedTaskStatus.value === 'canceled') {
      data.cancelReason = cancelReason.value.trim();
    }
    
    console.log('发送任务状态更新请求:', {
      taskId: currentTaskId.value,
      data
    });
    
    const res = await tasksApi.updateTaskStatus(currentTaskId.value, data);
    
    if (res.code === 200) {
      // 更新本地数据
      if (currentTaskIndex.value >= 0 && createdTasks.value[currentTaskIndex.value]) {
        createdTasks.value[currentTaskIndex.value].status = selectedTaskStatus.value;
        
        // 更新状态文本
        const statusTextMap = {
          'recruiting': '招募中',
          'ongoing': '进行中',
          'ended': '已结束',
          'completed': '已完成',
          'canceled': '已取消'
        };
        
        createdTasks.value[currentTaskIndex.value].statusText = statusTextMap[selectedTaskStatus.value] || '未知状态';
        
        // 强制视图刷新
        createdTasks.value = [...createdTasks.value];
      }
      
      uni.showToast({
        title: '状态更新成功',
        icon: 'success'
      });
      
      closeTaskStatusPopup();
      
      // 延迟刷新列表，确保服务器状态同步
      setTimeout(() => {
        if (activeTab.value === 0) {
          resetList();
          loadTasks();
        }
      }, 500);
    } else {
      uni.showToast({
        title: res.message || '状态更新失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
    uni.showToast({
      title: '状态更新失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}
</script>

<style>
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 150rpx; /* 留出HeaderBar的空间 */
}

/* 标签页 */
.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 32rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4a90e2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 6rpx;
  background-color: #4a90e2;
  border-radius: 3rpx;
}

/* 状态筛选器 */
.status-filter-container {
  background-color: #fff;
  padding: 20rpx 0;
  z-index: 99;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-scroll {
  white-space: nowrap;
  width: 100%;
}

.status-list {
  display: inline-flex;
  padding: 0 20rpx;
}

.status-item {
  padding: 14rpx 34rpx;
  margin-right: 20rpx;
  font-size: 30rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  transition: all 0.3s ease;
}

.status-item:first-child {
  margin-left: 4rpx;
}

.status-item.active {
  color: #fff;
  background-color: #4a90e2;
  font-weight: 500;
}

/* 列表容器 */
.task-list-container {
  flex: 1;
  height: 0;
  background-color: #f8f8f8;
}

/* 空状态 */
.empty-container {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.create-btn, .browse-btn {
  background-color: #4a90e2;
  color: #fff;
  font-size: 30rpx;
  padding: 16rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

/* 任务列表 */
.task-list {
  padding: 20rpx;
}

.task-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.task-header {
  padding: 26rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.task-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.task-status {
  padding: 8rpx 22rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #fff;
}

.status-recruiting {
  background-color: #4a90e2;
}

.status-ongoing {
  background-color: #33cc99;
}

.status-ended {
  background-color: #ff9933;
}

.status-completed {
  background-color: #8e8e93;
}

.status-canceled {
  background-color: #ff3b30;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  background-color: #f0f7ff;
  color: #4a90e2;
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 4rpx;
}

.task-date {
  font-size: 28rpx;
  color: #999;
}

.task-content {
  padding: 26rpx;
}

.creator-info {
  display: flex;
  align-items: center;
  margin-bottom: 22rpx;
}

.creator-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 16rpx;
}

.creator-detail {
  display: flex;
  flex-direction: column;
}

.creator-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.creator-major {
  font-size: 28rpx;
  color: #999;
}

.task-desc {
  font-size: 34rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 26rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-reward {
  display: flex;
  align-items: center;
}

.reward-text {
  font-size: 28rpx;
  color: #ff9933;
  font-weight: bold;
}

.task-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.progress-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.progress-bar {
  width: 130rpx;
  height: 10rpx;
  background-color: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #4a90e2;
}

.task-location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 6rpx;
}

.location-text {
  font-size: 28rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240rpx;
}

/* 加载更多 */
.loading-more, .no-more {
  text-align: center;
  padding: 20rpx 0;
}

.loading-more text, .no-more text {
  font-size: 28rpx;
  color: #999;
}

/* 悬浮按钮 */
.float-btn {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4a90e2;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.3);
}

.add-icon {
  font-size: 60rpx;
  font-weight: bold;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.participants-btn, .task-status-btn {
  background: none;
  padding: 10rpx 20rpx;
  text-align: center;
  border: none;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-left: 15rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 180rpx;
}

.participants-btn {
  background-color: #f0f7ff;
  color: #4a90e2;
}

.task-status-btn {
  background-color: #4a90e2;
  color: #fff;
}

.participants-btn-text, .task-status-btn-text {
  font-size: 24rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 新增参与人数显示 */
.participants-count {
  margin-top: 10rpx;
  padding: 8rpx 16rpx;
  background-color: #f0f7ff;
  border-radius: 4rpx;
}

.participants-count-text {
  font-size: 28rpx;
  color: #4a90e2;
}

/* 新增参与状态显示 */
.participation-status {
  display: flex;
  align-items: center;
  margin: 16rpx 0;
}

.status-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.status-tag {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  display: inline-block;
}

.status-joined {
  color: #247ae4;
  background-color: rgba(36, 122, 228, 0.1);
}

.status-progress {
  color: #FF9800;
  background-color: rgba(255, 152, 0, 0.1);
}

.status-completed {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.status-left {
  color: #F44336;
  background-color: rgba(244, 67, 54, 0.1);
}

.status-kicked {
  color: #FF3B30;
  background-color: rgba(255, 59, 48, 0.1);
}

.status-default {
  color: #8e8e93;
  background-color: rgba(142, 142, 147, 0.1);
}

/* 新增操作按钮区域样式 */
.action-buttons {
  display: flex;
  padding: 0 26rpx 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  margin: 10rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  border-radius: 35rpx;
  font-size: 28rpx;
  border: none;
  padding: 0;
}

.action-btn::after {
  display: none;
}

.view-btn {
  background-color: #f5f5f5;
  color: #666;
}

.update-btn {
  background-color: #4a90e2;
  color: #fff;
}

.update-btn.disabled-btn {
  background-color: #cccccc;
  color: #999999;
}

.status-popup-content {
  width: 650rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.status-popup-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #EEEEEE;
}

.status-popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.status-options {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.status-option {
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: #666666;
  background-color: #F5F5F5;
  text-align: center;
  transition: all 0.3s;
  margin-bottom: 10rpx;
}

.status-option.active {
  color: #FFFFFF !important;
  background-color: #4a90e2 !important;
  font-weight: bold;
  transform: scale(1.02);
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.reason-input-container {
  padding: 0 30rpx 30rpx;
  position: relative;
}

.reason-input {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border: 1rpx solid #EEEEEE;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.reason-count {
  position: absolute;
  bottom: 40rpx;
  right: 40rpx;
  font-size: 24rpx;
  color: #999999;
}

.status-popup-footer {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid #EEEEEE;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  margin: 0 10rpx;
  padding: 16rpx 0;
  border-radius: 8rpx;
  font-size: 30rpx;
  text-align: center;
}

.cancel-btn {
  color: #666;
  background-color: #F5F5F5;
  border: none;
}

.confirm-btn {
  color: #FFF;
  background-color: #4a90e2;
  border: none;
}

.cancel-btn::after, .confirm-btn::after {
  display: none;
}

.reason-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

/* 新增任务状态弹窗样式 */
.task-status-btn {
  background-color: #4a90e2;
  color: #fff;
  padding: 12rpx 20rpx;
  border-radius: 40rpx;
  border: none;
  margin-top: 20rpx;
  margin-left: 10rpx;
  font-size: 28rpx;
}

.task-status-btn-text {
  font-size: 28rpx;
  color: #fff;
}
</style> 