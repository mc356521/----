<template>
  <view class="tasks-container">
    <view class="empty-state" v-if="!hasTasks">
      <image class="empty-image" src="/static/image/empty-tasks.png" mode="aspectFit"></image>
      <text class="empty-text">暂无任务</text>
      <view class="action-btn primary" @click="showTaskForm">
        <text>创建任务</text>
      </view>
    </view>
    
    <view class="tasks-content" v-else>
      <!-- 任务统计 -->
      <view class="task-statistics">
        <view class="stat-item">
          <text class="stat-value">{{ statistics.total }}</text>
          <text class="stat-label">总任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.todo }}</text>
          <text class="stat-label">待处理</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.inProgress }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.completed }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item" @click="switchBoardTab('myTasks')">
          <text class="stat-value">{{ statistics.myTasks }}</text>
          <text class="stat-label">我负责的</text>
        </view>
      </view>
      
      <!-- 任务操作栏 -->
      <view class="task-operation">
        <view class="operation-left">
          <view class="filter-btn" @click="toggleFilterPanel">
            <text class="filter-text">筛选</text>
            <text class="filter-arrow">▼</text>
          </view>
        </view>
        <view class="operation-right">
          <view class="add-task-btn" @click="showTaskForm">
            <text class="add-task-text">创建任务</text>
          </view>
        </view>
      </view>
      
      <!-- 任务列表区域 -->
      <view class="task-board">
        <!-- 任务板导航 -->
        <view class="board-navigation">
          <scroll-view scroll-x class="board-tabs-scroll">
            <view class="board-tabs">
              <view 
                class="board-tab" 
                v-for="(tab, index) in boardTabs" 
                :key="index"
                :class="{ active: currentBoardTab === tab.value }"
                @click="switchBoardTab(tab.value)"
              >
                <text>{{ tab.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 任务展示区域 -->
        <view class="task-columns" v-if="currentBoardTab === 'kanban'">
          <scroll-view scroll-x class="columns-scroll">
            <view class="columns-container">
              <!-- 待处理任务 -->
              <view class="task-column">
                <view class="column-header">
                  <text class="column-title">待处理</text>
                  <text class="task-count">{{ todoTasks.length }}</text>
                </view>
                <scroll-view scroll-y class="column-tasks">
                  <view 
                    class="task-card" 
                    v-for="task in todoTasks" 
                    :key="task.id"
                    @click="openTaskDetail(task)"
                    @longpress="showTaskOptions(task)"
                  >
                    <view class="task-priority" :class="'priority-' + task.priority"></view>
                    <view class="task-title">{{ task.title }}</view>
                    <view class="task-info">
                      <text class="task-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</text>
                      <view class="task-users">
                        <view class="task-user-item">
                          <text class="user-role">创建:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.creatorAvatar" :src="task.creatorAvatar" mode="aspectFill"></image>
                            <text class="user-name">{{ task.creatorName }}</text>
                          </view>
                        </view>
                        <view class="task-user-item">
                          <text class="user-role">负责:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.assigneeAvatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
                            <text class="user-name" v-if="task.assigneeName">{{ task.assigneeName }}</text>
                            <text class="task-unassigned" v-else>未分配</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="add-task-card" @click="quickAddTask('todo')">
                    <text class="add-task-icon">+</text>
                    <text class="add-task-hint">添加任务</text>
                  </view>
                </scroll-view>
              </view>
              
              <!-- 进行中任务 -->
              <view class="task-column">
                <view class="column-header">
                  <text class="column-title">进行中</text>
                  <text class="task-count">{{ inProgressTasks.length }}</text>
                </view>
                <scroll-view scroll-y class="column-tasks">
                  <view 
                    class="task-card" 
                    v-for="task in inProgressTasks" 
                    :key="task.id"
                    @click="openTaskDetail(task)"
                    @longpress="showTaskOptions(task)"
                  >
                    <view class="task-priority" :class="'priority-' + task.priority"></view>
                    <view class="task-title">{{ task.title }}</view>
                    <view class="task-info">
                      <text class="task-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</text>
                      <view class="task-users">
                        <view class="task-user-item">
                          <text class="user-role">创建:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.creatorAvatar" :src="task.creatorAvatar" mode="aspectFill"></image>
                            <text class="user-name">{{ task.creatorName }}</text>
                          </view>
                        </view>
                        <view class="task-user-item">
                          <text class="user-role">负责:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.assigneeAvatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
                            <text class="user-name" v-if="task.assigneeName">{{ task.assigneeName }}</text>
                            <text class="task-unassigned" v-else>未分配</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="add-task-card" @click="quickAddTask('inProgress')">
                    <text class="add-task-icon">+</text>
                    <text class="add-task-hint">添加任务</text>
                  </view>
                </scroll-view>
              </view>
              
              <!-- 已完成任务 -->
              <view class="task-column">
                <view class="column-header">
                  <text class="column-title">已完成</text>
                  <text class="task-count">{{ completedTasks.length }}</text>
                </view>
                <scroll-view scroll-y class="column-tasks">
                  <view 
                    class="task-card" 
                    v-for="task in completedTasks" 
                    :key="task.id"
                    @click="openTaskDetail(task)"
                    @longpress="showTaskOptions(task)"
                  >
                    <view class="task-priority" :class="'priority-' + task.priority"></view>
                    <view class="task-title">{{ task.title }}</view>
                    <view class="task-info">
                      <text class="task-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</text>
                      <text class="task-completed-date" v-if="task.status === 'completed' && task.completedDate">完成: {{ formatCompletedDate(task.completedDate) }}</text>
                      <view class="task-users">
                        <view class="task-user-item">
                          <text class="user-role">创建:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.creatorAvatar" :src="task.creatorAvatar" mode="aspectFill"></image>
                            <text class="user-name">{{ task.creatorName }}</text>
                          </view>
                        </view>
                        <view class="task-user-item">
                          <text class="user-role">负责:</text>
                          <view class="user-avatar-name">
                            <image class="user-avatar" v-if="task.assigneeAvatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
                            <text class="user-name" v-if="task.assigneeName">{{ task.assigneeName }}</text>
                            <text class="task-unassigned" v-else>未分配</text>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
          </scroll-view>
        </view>
        
        <!-- 列表视图 -->
        <view class="task-list" v-if="currentBoardTab === 'list'">
          <view 
            class="task-list-item" 
            v-for="task in allTasks" 
            :key="task.id"
            @click="openTaskDetail(task)"
            @longpress="showTaskOptions(task)"
          >
            <view class="task-list-status" :class="'status-' + task.status"></view>
            <view class="task-list-content">
              <view class="task-list-title">{{ task.title }}</view>
              <view class="task-list-info">
                <text class="task-list-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</text>
                <text class="task-completed-date" v-if="task.status === 'completed' && task.completedDate">完成: {{ formatCompletedDate(task.completedDate) }}</text>
                <view class="task-list-users">
                  <view class="task-list-user-item">
                    <text class="user-role">创建:</text>
                    <view class="user-avatar-name">
                      <image class="user-avatar" v-if="task.creatorAvatar" :src="task.creatorAvatar" mode="aspectFill"></image>
                      <text class="user-name">{{ task.creatorName }}</text>
                    </view>
                  </view>
                  <view class="task-list-user-item">
                    <text class="user-role">负责:</text>
                    <view class="user-avatar-name">
                      <image class="user-avatar" v-if="task.assigneeAvatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
                      <text class="user-name" v-if="task.assigneeName">{{ task.assigneeName }}</text>
                      <text class="task-unassigned" v-else>未分配</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="task-list-actions">
              <text class="task-list-priority" :class="'priority-' + task.priority">{{ getPriorityText(task.priority) }}</text>
            </view>
          </view>
        </view>
        
        <!-- 我负责的任务视图 -->
        <view class="task-list" v-if="currentBoardTab === 'myTasks'">
          <view class="my-tasks-header">
            <text class="my-tasks-title">我负责的任务</text>
            <text class="my-tasks-count">{{ myTasks.length }}</text>
          </view>
          
          <view v-if="myTasks.length === 0" class="empty-my-tasks">
            <text class="empty-my-tasks-text">您暂时没有负责的任务</text>
            <view class="action-btn primary" @click="showTaskForm">
              <text>创建任务</text>
            </view>
          </view>
          
          <view 
            class="task-list-item" 
            v-for="task in myTasks" 
            :key="task.id"
            @click="openTaskDetail(task)"
            @longpress="showTaskOptions(task)"
          >
            <view class="task-list-status" :class="'status-' + task.status"></view>
            <view class="task-list-content">
              <view class="task-list-title">{{ task.title }}</view>
              <view class="task-list-info">
                <text class="task-list-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</text>
                <text class="task-completed-date" v-if="task.status === 'completed' && task.completedDate">完成: {{ formatCompletedDate(task.completedDate) }}</text>
                <view class="task-list-users">
                  <view class="task-list-user-item">
                    <text class="user-role">创建:</text>
                    <view class="user-avatar-name">
                      <image class="user-avatar" v-if="task.creatorAvatar" :src="task.creatorAvatar" mode="aspectFill"></image>
                      <text class="user-name">{{ task.creatorName }}</text>
                    </view>
                  </view>
                  <view class="task-list-user-item">
                    <text class="task-status" :class="task.status">{{ getStatusText(task.status) }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="task-list-actions">
              <text class="task-list-priority" :class="'priority-' + task.priority">{{ getPriorityText(task.priority) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 任务创建表单 -->
    <view class="task-form-modal" v-if="showTaskFormModal" @click.stop="hideTaskForm">
      <view class="task-form-container" @click.stop>
        <view class="task-form-header">
          <text class="form-title">{{ isEditMode ? '编辑任务' : '创建任务' }}</text>
          <view class="close-btn" @click.stop="hideTaskForm">×</view>
        </view>
        <view class="task-form-body">
          <view class="form-group">
            <text class="form-label">任务标题 <text class="required">*</text></text>
            <view class="input-wrapper" @click.stop>
              <uni-easyinput
                class="form-input-custom"
                type="text"
                v-model="taskForm.title"
                placeholder="请输入任务标题"
                maxlength="50"
                clearable
                focus
              />
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">任务描述</text>
            <view class="input-wrapper" @click.stop>
              <uni-easyinput
                class="form-textarea-custom"
                type="textarea" 
                v-model="taskForm.description"
                placeholder="请输入任务描述"
                maxlength="500"
                autoHeight
              />
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">优先级</text>
            <view class="priority-selector">
              <view 
                class="priority-option" 
                :class="{ active: taskForm.priority === 'high' }"
                @click="taskForm.priority = 'high'"
              >
                <view class="priority-color high"></view>
                <text>高</text>
              </view>
              <view 
                class="priority-option" 
                :class="{ active: taskForm.priority === 'medium' }"
                @click="taskForm.priority = 'medium'"
              >
                <view class="priority-color medium"></view>
                <text>中</text>
              </view>
              <view 
                class="priority-option" 
                :class="{ active: taskForm.priority === 'low' }"
                @click="taskForm.priority = 'low'"
              >
                <view class="priority-color low"></view>
                <text>低</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">截止日期</text>
            <view class="picker-wrapper">
              <uni-datetime-picker
                type="date"
                v-model="taskForm.deadline"
                :start="'2023-01-01'"
                :end="'2030-12-31'"
                @change="handleDateChangeNew"
                return-type="timestamp"
                format="yyyy-MM-dd"
                :clear-icon="true"
                class="uni-picker"
              />
              </view>
          </view>
          <view class="form-group">
            <text class="form-label">状态</text>
            <view class="picker-wrapper">
              <uni-data-select
                v-model="taskForm.status"
                :localdata="statusOptionsForSelect"
                @change="handleStatusChangeNew"
                class="uni-picker"
              />
              </view>
          </view>
        </view>
        <view class="task-form-footer">
          <view class="form-btn cancel" @click="hideTaskForm">取消</view>
          <view class="form-btn submit" @click="submitTaskForm">{{ isEditMode ? '保存' : '创建' }}</view>
        </view>
      </view>
    </view>
    
    <!-- 任务操作菜单 -->
    <view class="task-options-modal" v-if="showTaskOptionsModal" @click="hideTaskOptions">
      <view class="task-options-container" @click.stop>
        <view class="task-options-header">
          <text class="options-title">{{ currentTask?.title }}</text>
          <view class="close-btn" @click="hideTaskOptions">×</view>
        </view>
        <view class="task-options-body">
          <view class="option-btn" @click="editTask">
            <text class="option-icon">✏️</text>
            <text class="option-text">编辑任务</text>
          </view>
          <view class="option-btn" v-if="!currentTask?.assigneeId" @click="claimTask">
            <text class="option-icon">👤</text>
            <text class="option-text">认领任务</text>
          </view>
          <view class="option-btn" v-if="currentTask?.status !== 'todo'" @click="changeTaskStatus('todo')">
            <text class="option-icon">📋</text>
            <text class="option-text">移至待处理</text>
          </view>
          <view class="option-btn" v-if="currentTask?.status !== 'inProgress'" @click="changeTaskStatus('inProgress')">
            <text class="option-icon">🔄</text>
            <text class="option-text">移至进行中</text>
          </view>
          <view class="option-btn" v-if="currentTask?.status !== 'completed'" @click="changeTaskStatus('completed')">
            <text class="option-icon">✅</text>
            <text class="option-text">标记为已完成</text>
          </view>
          <view class="option-btn delete" @click="confirmDeleteTask">
            <text class="option-icon">🗑️</text>
            <text class="option-text">删除任务</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
import api from '@/api';
// 引入uni组件
import uniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue';
import uniDatetimePicker from '@/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue';
import uniDataSelect from '@/uni_modules/uni-data-select/components/uni-data-select/uni-data-select.vue';

const props = defineProps({
  teamId: {
    type: String,
    default: ''
  },
  teamName: {
    type: String,
    default: '团队'
  },
  teamStatus: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['create']);

// 数据定义
const tasks = ref([]);
const currentBoardTab = ref('kanban'); // kanban 或 list
const boardTabs = [
  { value: 'kanban', label: '看板视图' },
  { value: 'list', label: '列表视图' },
  { value: 'myTasks', label: '我负责的' }
];
const showFilterPanel = ref(false);

// 任务表单相关
const showTaskFormModal = ref(false);
const isEditMode = ref(false);
const taskForm = ref({
  id: '',
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  deadline: '',
  assigneeId: '', // 当前用户ID
  assigneeName: ''
});

// 任务操作相关
const showTaskOptionsModal = ref(false);
const currentTask = ref(null);

// 加载状态
const loading = ref(false);

// 状态选项
const statusOptions = [
  { value: 'todo', text: '待处理' },
  { value: 'inProgress', text: '进行中' },
  { value: 'completed', text: '已完成' }
];

// uni-data-select使用的状态选项格式
const statusOptionsForSelect = [
  { value: 'todo', text: '待处理' },
  { value: 'inProgress', text: '进行中' },
  { value: 'completed', text: '已完成' }
];

// 优先级映射
const priorityMapping = {
  '高': 'high',
  '中': 'medium',
  '低': 'low',
  'high': '高',
  'medium': '中',
  'low': '低'
};

// 状态映射
const statusMapping = {
  '待处理': 'todo',
  '进行中': 'inProgress',
  '已完成': 'completed',
  'todo': '待处理',
  'inProgress': '进行中',
  'completed': '已完成'
};

// 计算属性
const hasTasks = computed(() => {
  return tasks.value && tasks.value.length > 0;
});

const todoTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'todo');
});

const inProgressTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'inProgress');
});

const completedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'completed');
});

const allTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    // 按优先级排序
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // 按状态排序
    const statusOrder = { todo: 0, inProgress: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
});

const myTasks = computed(() => {
  // 过滤出当前用户负责的任务
  return allTasks.value.filter(task => 
    task.assigneeId && task.assigneeId === userInfo.value.id
  );
});

const statistics = computed(() => {
  return {
    total: tasks.value.length,
    todo: todoTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length,
    myTasks: myTasks.value.length
  };
});

// 获取当前用户信息
const userInfo = ref({});

// 方法
async function getUserInfo() {
  try {
    const res = await api.user.getUserProfile();
    if (res && res.code === 200 && res.data) {
      userInfo.value = res.data;
      console.log('获取到用户信息:', res.data);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}

// 获取团队任务列表
async function loadTasks() {
  if (!props.teamId) {
    console.error('未提供团队ID，无法加载任务');
    return;
  }
  
  loading.value = true;
  
  try {
    const res = await api.teamTask.getTeamTaskList(props.teamId);
    
    if (res && res.code === 200 && res.data) {
      // 处理数据，转换接口返回的数据格式为组件使用的格式
      const taskList = res.data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: statusMapping[task.status] || 'todo',
        priority: priorityMapping[task.priority] || 'medium',
        creatorId: task.creatorId,
        creatorName: task.creatorName || '未知',
        creatorAvatar: '', // 稍后加载
        assigneeId: task.assigneeId,
        assigneeName: task.assigneeName || '',
        assigneeAvatar: task.assigneeAvatar || '',
        createTime: new Date(task.createdAt),
        deadline: task.dueDate ? new Date(task.dueDate) : null,
        completedDate: task.completedDate || null,
        progress: task.progress || 0
      }));
      
      // 加载创建者和负责人信息
      await loadUsersInfo(taskList);
      
      tasks.value = taskList;
      console.log('获取到团队任务列表:', tasks.value);
    } else {
      console.error('获取团队任务列表失败:', res);
      uni.showToast({
        title: res?.message || '获取任务列表失败',
        icon: 'none'
      });
      
      // 如果API调用失败，使用一些默认数据以便测试
      if (!tasks.value.length) {
        useMockData();
      }
    }
  } catch (error) {
    console.error('获取团队任务列表出错:', error);
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
    
    // 如果API调用失败，使用一些默认数据以便测试
    if (!tasks.value.length) {
      useMockData();
    }
  } finally {
    loading.value = false;
  }
}

// 加载用户信息（创建者和负责人）
async function loadUsersInfo(taskList) {
  // 收集所有需要获取信息的用户ID（去重）
  const userIds = new Set();
  taskList.forEach(task => {
    if (task.creatorId) userIds.add(task.creatorId);
    if (task.assigneeId) userIds.add(task.assigneeId);
  });
  
  // 用于存储用户信息的缓存
  const userInfoCache = {};
  
  // 并行获取所有用户信息
  const promises = Array.from(userIds).map(async userId => {
    try {
      const res = await api.user.getUserSimpleInfo(userId);
      if (res && res.code === 200 && res.data) {
        userInfoCache[userId] = {
          userId: res.data.userId,
          realName: res.data.realName,
          avatarUrl: res.data.avatarUrl
        };
      }
    } catch (error) {
      console.error(`获取用户 ${userId} 信息失败:`, error);
    }
  });
  
  // 等待所有请求完成
  await Promise.all(promises);
  
  // 更新任务列表中的用户信息
  taskList.forEach(task => {
    // 更新创建者信息
    if (task.creatorId && userInfoCache[task.creatorId]) {
      task.creatorName = userInfoCache[task.creatorId].realName;
      task.creatorAvatar = userInfoCache[task.creatorId].avatarUrl;
    }
    
    // 更新负责人信息
    if (task.assigneeId && userInfoCache[task.assigneeId]) {
      task.assigneeName = userInfoCache[task.assigneeId].realName;
      task.assigneeAvatar = userInfoCache[task.assigneeId].avatarUrl;
    }
  });
}

// 使用模拟数据（仅在API调用失败时使用）
function useMockData() {
  console.log('使用模拟数据');
    const avatarMap = {
      '1001': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/e7720ac1fae24d068ae2ebce7038472f.png',
    '1002': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png'
    };
    
    tasks.value = [
	  {
	    id: '1',
	    title: '完成登录页面设计',
	    description: '设计用户登录界面，包括表单布局和交互效果',
	    status: 'completed',
	    priority: 'high',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1001',
        assigneeName: '我',
        assigneeAvatar: avatarMap['1001'],
        createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      completedDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: '2',
        title: '实现用户注册表单验证',
        description: '编写前端表单验证逻辑，包括用户名、密码格式检查等',
        status: 'inProgress',
        priority: 'high',
        creatorId: '1002',
        creatorName: '张三',
      assigneeId: null,
      assigneeName: null,
	    createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
	    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000)
	  },
      {
        id: '3',
        title: '编写单元测试',
        description: '为登录模块编写单元测试用例，确保功能正确性',
        status: 'todo',
        priority: 'medium',
        creatorId: '1002',
        creatorName: '张三',
      assigneeId: null,
      assigneeName: null,
        createTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000)
    }
  ];
}

function switchBoardTab(tab) {
  currentBoardTab.value = tab;
}

function toggleFilterPanel() {
  showFilterPanel.value = !showFilterPanel.value;
}

function createTask() {
  emit('create');
}

function quickAddTask(status) {
  // 快速创建任务
  isEditMode.value = false;
  // 设置表单初始状态
  taskForm.value = {
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: status,
    deadline: '',
    assigneeId: '', // 默认不分配负责人
    assigneeName: '',
    assigneeAvatar: '',
    createTime: new Date()
  };
  showTaskFormModal.value = true;
}

function openTaskDetail(task) {
  // 显示任务操作菜单
  showTaskOptions(task);
}

function formatDate(date) {
  if (!date) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(date);
  const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  
  if (taskDay.getTime() === today.getTime()) {
    return '今天';
  } else if (taskDay.getTime() === tomorrow.getTime()) {
    return '明天';
  }
  
  const diffTime = taskDay.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays}天后`;
  } else if (diffDays < 0 && diffDays > -7) {
    return `${Math.abs(diffDays)}天前`;
  }
  
  const month = (taskDate.getMonth() + 1).toString().padStart(2, '0');
  const day = taskDate.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

function getPriorityText(priority) {
  return priorityMapping[priority] || '中';
}

// 显示任务创建表单
function showTaskForm() {
  isEditMode.value = false;
  // 重置表单
  taskForm.value = {
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    deadline: '',
    assigneeId: '', // 默认不分配负责人
    assigneeName: '',
    assigneeAvatar: '',
    createTime: new Date()
  };
  showTaskFormModal.value = true;
}

// 隐藏任务创建表单
function hideTaskForm(e) {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation();
  }
  showTaskFormModal.value = false;
}

// 旧的日期变更处理函数 - 保留以防需要
function handleDateChange(e) {
  const dateStr = e.detail.value;
  taskForm.value.deadline = `${dateStr}T23:59:59`;
  
  // 添加日期验证和格式化
  try {
    // 验证日期格式
    const dateObj = new Date(taskForm.value.deadline);
    if (isNaN(dateObj.getTime())) {
      uni.showToast({
        title: '日期格式无效',
        icon: 'none'
      });
      taskForm.value.deadline = '';
    }
  } catch (error) {
    console.error('日期解析错误:', error);
    taskForm.value.deadline = '';
    uni.showToast({
      title: '日期格式无效',
      icon: 'none'
    });
  }
}

// 处理日期变更 - 新的uni-datetime-picker
function handleDateChangeNew(timestamp) {
  if (!timestamp) {
    taskForm.value.deadline = '';
    return;
  }
  
  try {
    // 转换时间戳为日期字符串
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    taskForm.value.deadline = `${year}-${month}-${day}T23:59:59`;
    console.log('设置日期:', taskForm.value.deadline);
  } catch (error) {
    console.error('日期处理错误:', error);
    taskForm.value.deadline = '';
  }
}

// 旧的状态变更处理函数 - 保留以防需要
function handleStatusChange(e) {
  const index = e.detail.value;
  taskForm.value.status = statusOptions[index].value;
}

// 处理状态变更 - 新的uni-data-select
function handleStatusChangeNew(value) {
  console.log('状态变更:', value);
  taskForm.value.status = value;
}

// 获取状态索引
function getStatusIndex(status) {
  return statusOptions.findIndex(option => option.value === status);
}

// 获取状态文本
function getStatusText(status) {
  const option = statusOptions.find(option => option.value === status);
  return option ? option.text : '待处理';
}

// 提交任务表单
async function submitTaskForm() {
  if (!taskForm.value.title) {
    uni.showToast({
      title: '请输入任务标题',
      icon: 'none'
    });
    return;
  }
  
  try {
    loading.value = true;
    
    // 准备提交的数据
    const submitData = {
      teamId: Number(props.teamId),
      title: taskForm.value.title,
      description: taskForm.value.description,
      priority: priorityMapping[taskForm.value.priority] || taskForm.value.priority,
      dueDate: taskForm.value.deadline
    };
    
    // 如果有负责人ID，则添加到提交数据中
    if (taskForm.value.assigneeId) {
      submitData.assigneeId = taskForm.value.assigneeId;
    }
    
    // 如果是编辑模式，需要添加任务ID和状态
  if (isEditMode.value) {
      submitData.id = taskForm.value.id;
      submitData.status = statusMapping[taskForm.value.status] || taskForm.value.status;
      submitData.progress = taskForm.value.progress || 0;
      
      // 更新任务
      const res = await api.teamTask.updateTeamTask(submitData);
      
      if (res && res.code === 200) {
      uni.showToast({
        title: '任务已更新',
        icon: 'success'
      });
        
        // 重新加载任务列表
        await loadTasks();
      } else {
        uni.showToast({
          title: res?.message || '更新任务失败',
          icon: 'none'
        });
    }
  } else {
    // 创建新任务
      const res = await api.teamTask.createTeamTask(submitData);
      
      if (res && res.code === 200) {
    uni.showToast({
      title: '任务已创建',
      icon: 'success'
    });
    
        // 重新加载任务列表
        await loadTasks();
      } else {
        uni.showToast({
          title: res?.message || '创建任务失败',
          icon: 'none'
        });
      }
    }
  } catch (error) {
    console.error(isEditMode.value ? '更新任务失败:' : '创建任务失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  // 隐藏表单
  hideTaskForm();
  }
}

// 显示任务操作菜单
function showTaskOptions(task) {
  currentTask.value = task;
  showTaskOptionsModal.value = true;
}

// 隐藏任务操作菜单
function hideTaskOptions() {
  showTaskOptionsModal.value = false;
  currentTask.value = null;
}

// 编辑任务
function editTask() {
  if (!currentTask.value) return;
  
  isEditMode.value = true;
  
  // 复制当前任务到表单
  taskForm.value = { ...currentTask.value };
  
  // 确保日期格式正确
  if (taskForm.value.deadline && taskForm.value.deadline instanceof Date) {
    const date = taskForm.value.deadline;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    taskForm.value.deadline = `${year}-${month}-${day}T23:59:59`;
  }
  
  // 隐藏选项菜单，显示编辑表单
  hideTaskOptions();
  showTaskFormModal.value = true;
}

// 修改任务状态
async function changeTaskStatus(status) {
  if (!currentTask.value) return;
  
  try {
    loading.value = true;
    
    // 准备提交的数据
    const submitData = {
      id: currentTask.value.id,
      title: currentTask.value.title,
      description: currentTask.value.description,
      priority: priorityMapping[currentTask.value.priority] || currentTask.value.priority,
      status: statusMapping[status] || status,
      dueDate: currentTask.value.deadline instanceof Date ? 
        currentTask.value.deadline.toISOString().split('T')[0] + 'T23:59:59' : 
        currentTask.value.deadline,
      progress: status === 'completed' ? 100 : (currentTask.value.progress || 0)
    };
    
    // 如果任务状态变为已完成，添加完成时间
    if (status === 'completed') {
      submitData.completedDate = new Date().toISOString();
    } else {
      // 如果从已完成变为其他状态，清除完成时间
      submitData.completedDate = null;
    }
    
    // 更新任务
    const res = await api.teamTask.updateTeamTask(submitData);
    
    if (res && res.code === 200) {
    uni.showToast({
      title: `已${status === 'completed' ? '完成' : '移动'}任务`,
      icon: 'success'
    });
      
      // 重新加载任务列表
      await loadTasks();
    } else {
      uni.showToast({
        title: res?.message || '更新任务状态失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新任务状态失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  // 隐藏选项菜单
  hideTaskOptions();
  }
}

// 确认删除任务
function confirmDeleteTask() {
  if (!currentTask.value) return;
  
  uni.showModal({
    title: '删除任务',
    content: '确定要删除这个任务吗？此操作不可撤销。',
    success: function(res) {
      if (res.confirm) {
        deleteTask();
      }
    }
  });
}

// 删除任务
async function deleteTask() {
  if (!currentTask.value) return;
  
  try {
    loading.value = true;
    
    // 调用删除任务API
    const res = await api.teamTask.deleteTeamTask(currentTask.value.id);
    
    if (res && res.code === 200) {
  uni.showToast({
    title: '任务已删除',
    icon: 'success'
  });
  
      // 重新加载任务列表
      await loadTasks();
    } else {
      uni.showToast({
        title: res?.message || '删除任务失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  // 隐藏选项菜单
  hideTaskOptions();
  }
}

// 认领任务
async function claimTask() {
  if (!currentTask.value) return;
  
  // 检查任务是否已经有负责人
  if (currentTask.value.assigneeId) {
    uni.showToast({
      title: '该任务已被认领',
      icon: 'none'
    });
    hideTaskOptions();
    return;
  }
  
  // 如果没有用户信息，提示登录
  if (!userInfo.value || !userInfo.value.id) {
    uni.showToast({
      title: '请先登录后再认领任务',
      icon: 'none'
    });
    hideTaskOptions();
    return;
  }
  
  try {
    loading.value = true;
    
    // 调用认领任务API
    const res = await api.teamTask.claimTask(currentTask.value.id);
    
    if (res && res.code === 200) {
      uni.showToast({
        title: '已成功认领任务',
        icon: 'success'
      });
      
      // 重新加载任务列表
      await loadTasks();
    } else {
      uni.showToast({
        title: res?.message || '认领任务失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('认领任务失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    // 隐藏选项菜单
    hideTaskOptions();
  }
}

// 格式化完成时间
function formatCompletedDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const completedDate = new Date(dateStr);
    if (isNaN(completedDate.getTime())) return '';
    
    const year = completedDate.getFullYear();
    const month = String(completedDate.getMonth() + 1).padStart(2, '0');
    const day = String(completedDate.getDate()).padStart(2, '0');
    const hours = String(completedDate.getHours()).padStart(2, '0');
    const minutes = String(completedDate.getMinutes()).padStart(2, '0');
    
    return `${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
}

// 不再需要单独的输入处理函数，uni-easyinput组件已经处理了v-model绑定

// 初始化
onMounted(async () => {
  await getUserInfo();
  await loadTasks();
});
</script>

<style>
.tasks-container {
  padding: 20rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.action-btn {
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #3498db;
  color: #ffffff;
}

.tasks-content {
  padding: 0 20rpx;
}

.task-statistics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 20rpx 0;
  margin: 0 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.task-operation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.operation-left, .operation-right {
  display: flex;
  align-items: center;
}

.filter-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.filter-text {
  font-size: 24rpx;
  color: #333333;
  margin-right: 10rpx;
}

.filter-arrow {
  font-size: 20rpx;
  color: #999999;
}

.add-task-btn {
  padding: 10rpx 20rpx;
  background-color: #3498db;
  border-radius: 8rpx;
}

.add-task-text {
  font-size: 24rpx;
  color: #ffffff;
}

.task-board {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.board-navigation {
  border-bottom: 1rpx solid #f0f0f0;
}

.board-tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.board-tabs {
  display: inline-flex;
  padding: 10rpx 0;
}

.board-tab {
  display: inline-block;
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  color: #666666;
  position: relative;
}

.board-tab.active {
  color: #3498db;
}

.board-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 4rpx;
  background-color: #3498db;
  border-radius: 2rpx;
}

.task-columns {
  height: 800rpx;
}

.columns-scroll {
  width: 100%;
  height: 100%;
  white-space: nowrap;
}

.columns-container {
  display: inline-flex;
  height: 100%;
  padding: 0 10rpx;
}

.task-column {
  width: 450rpx;
  height: 100%;
  display: inline-flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  margin: 0 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.column-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.task-count {
  font-size: 24rpx;
  color: #666666;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
}

.column-tasks {
  flex: 1;
  height: 0;
}

.task-card {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.task-priority {
  position: absolute;
  top: 0;
  left: 0;
  width: 10rpx;
  height: 100%;
  border-top-left-radius: 12rpx;
  border-bottom-left-radius: 12rpx;
}

.priority-high {
  background-color: #f44336;
}

.priority-medium {
  background-color: #ff9800;
}

.priority-low {
  background-color: #4caf50;
}

.task-title {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
  padding-left: 10rpx;
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10rpx;
}

.task-deadline {
  font-size: 22rpx;
  color: #666666;
}

.task-completed-date {
  font-size: 22rpx;
  color: #4caf50;
  margin-left: 10rpx;
}

.task-users {
  display: flex;
  flex-direction: column;
  margin-top: 8rpx;
  border-top: 1px dashed #eee;
  padding-top: 8rpx;
}

.task-user-item {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
}

.user-role {
  font-size: 22rpx;
  color: #666666;
  margin-right: 8rpx;
  min-width: 60rpx;
}

.user-name {
  font-size: 22rpx;
  color: #333333;
  font-weight: 500;
}

.task-unassigned {
  font-size: 22rpx;
  color: #999;
}

.add-task-card {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.add-task-icon {
  font-size: 32rpx;
  color: #999999;
  margin-right: 10rpx;
}

.add-task-hint {
  font-size: 26rpx;
  color: #999999;
}

.task-list {
  padding: 20rpx;
}

.task-list-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.task-list-status {
  width: 10rpx;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-top-left-radius: 12rpx;
  border-bottom-left-radius: 12rpx;
}

.status-todo {
  background-color: #2196f3;
}

.status-inProgress {
  background-color: #ff9800;
}

.status-completed {
  background-color: #4caf50;
}

.task-list-content {
  flex: 1;
  padding-left: 20rpx;
}

.task-list-title {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.task-list-info {
  display: flex;
  align-items: center;
}

.task-list-deadline, .task-list-assignee {
  font-size: 24rpx;
  color: #666666;
  margin-right: 20rpx;
}

.task-list-actions {
  padding-left: 20rpx;
}

.task-list-priority {
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  color: #ffffff;
}

/* 任务表单样式 */
.task-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-form-container {
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: visible; /* 修改为visible以允许弹出层显示 */
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  position: relative;
  z-index: 9990;
}

.task-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  font-size: 40rpx;
  color: #999999;
  line-height: 1;
}

.task-form-body {
  padding: 30rpx;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: visible; /* 允许横向弹出层 */
  position: relative;
  z-index: 9995;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 12rpx;
}

.required {
  color: #f44336;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
  background-color: #ffffff;
  z-index: 10;
  position: relative;
}

.form-textarea {
  height: 160rpx;
  z-index: 10;
}

.input-wrapper {
  position: relative;
  z-index: 20;
  width: 100%;
}

.date-picker, .status-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  position: relative;
}

.picker-wrapper {
  position: relative;
  z-index: 99999;
  width: 100%;
}

.picker-element {
  width: 100%;
  z-index: 99999;
  position: relative;
}

.picker-arrow {
  font-size: 20rpx;
  color: #666;
  margin-right: 10rpx;
}

.priority-selector {
  display: flex;
  justify-content: space-between;
}

.priority-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin: 0 8rpx;
}

.priority-option:first-child {
  margin-left: 0;
}

.priority-option:last-child {
  margin-right: 0;
}

.priority-option.active {
  background-color: #f5f5f5;
  border-color: #3498db;
}

.priority-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
}

.priority-color.high {
  background-color: #f44336;
}

.priority-color.medium {
  background-color: #ff9800;
}

.priority-color.low {
  background-color: #4caf50;
}

.task-form-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.form-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.form-btn.cancel {
  color: #666666;
  background-color: #f5f5f5;
}

.form-btn.submit {
  color: #ffffff;
  background-color: #3498db;
}

/* 任务操作菜单样式 */
.task-options-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-options-container {
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.task-options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.options-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.task-options-body {
  padding: 16rpx 0;
}

.option-btn {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  transition: background-color 0.2s;
}

.option-btn:active {
  background-color: #f5f5f5;
}

.option-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.option-text {
  font-size: 28rpx;
  color: #333333;
}

.option-btn.delete .option-text {
  color: #f44336;
}

.uni-picker {
  width: 100%;
  z-index: 99999 !important;
}

/* 确保弹出层显示在最上层 */
::v-deep .uni-picker-container,
::v-deep .uni-picker-popup,
::v-deep .uni-date-picker,
::v-deep .uni-select {
  z-index: 99999 !important;
}

/* 确保日期选择器的弹出窗口显示在最上层 */
::v-deep .uni-datetime-picker-popup,
::v-deep .uni-datetime-picker-time-container {
  z-index: 100000 !important;
}

/* 确保状态选择器的弹出窗口显示在最上层 */
::v-deep .uni-data-select__selector {
  z-index: 100000 !important;
}

.task-list-users {
  display: flex;
  flex-direction: column;
  margin-top: 8rpx;
  border-top: 1px dashed #eee;
  padding-top: 8rpx;
}

.task-list-user-item {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
}

.list-creator-name {
  font-size: 22rpx;
  color: #333333;
}

.task-list-assignee-container {
  display: flex;
  align-items: center;
}

.task-list-assignee-avatar {
  display: flex;
}

.user-avatar-name {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-right: 6rpx;
  background-color: #f0f0f0;
}

.my-tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}

.my-tasks-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.my-tasks-count {
  font-size: 24rpx;
  color: #fff;
  background-color: #3498db;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.empty-my-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-my-tasks-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.task-status {
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
  color: #fff;
  background-color: #2196f3;
}

.task-status.inProgress {
  background-color: #ff9800;
}

.task-status.completed {
  background-color: #4caf50;
}
</style> 