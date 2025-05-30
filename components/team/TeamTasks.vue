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
                      <view class="task-assignee" v-if="task.assigneeAvatar">
                        <image class="assignee-avatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
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
                      <view class="task-assignee" v-if="task.assigneeAvatar">
                        <image class="assignee-avatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
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
                      <view class="task-assignee" v-if="task.assigneeAvatar">
                        <image class="assignee-avatar" :src="task.assigneeAvatar" mode="aspectFill"></image>
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
                <text class="task-list-assignee">{{ task.assigneeName || '未分配' }}</text>
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
    <view class="task-form-modal" v-if="showTaskFormModal" @click="hideTaskForm">
      <view class="task-form-container" @click.stop>
        <view class="task-form-header">
          <text class="form-title">{{ isEditMode ? '编辑任务' : '创建任务' }}</text>
          <view class="close-btn" @click="hideTaskForm">×</view>
        </view>
        <view class="task-form-body">
          <view class="form-group">
            <text class="form-label">任务标题 <text class="required">*</text></text>
            <input class="form-input" type="text" v-model="taskForm.title" placeholder="请输入任务标题" confirm-type="done" />
          </view>
          <view class="form-group">
            <text class="form-label">任务描述</text>
            <textarea class="form-textarea" v-model="taskForm.description" placeholder="请输入任务描述" />
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
            <picker 
              mode="date" 
              :value="taskForm.deadline ? taskForm.deadline.split('T')[0] : ''" 
              start="2023-01-01" 
              end="2025-12-31"
              @change="handleDateChange"
            >
              <view class="form-input date-picker">
                <text>{{ taskForm.deadline ? formatDate(new Date(taskForm.deadline)) : '请选择截止日期' }}</text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">状态</text>
            <picker 
              :range="statusOptions" 
              range-key="text"
              :value="getStatusIndex(taskForm.status)"
              @change="handleStatusChange"
            >
              <view class="form-input status-picker">
                <text>{{ getStatusText(taskForm.status) }}</text>
              </view>
            </picker>
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
import { ref, computed, defineProps, defineEmits } from 'vue';

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
  { value: 'list', label: '列表视图' }
];
const showFilterPanel = ref(false);

// 新增：任务表单相关
const showTaskFormModal = ref(false);
const isEditMode = ref(false);
const taskForm = ref({
  id: '',
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  deadline: '',
  assigneeId: '1001', // 当前用户ID
  assigneeName: '我'
});

// 新增：任务操作相关
const showTaskOptionsModal = ref(false);
const currentTask = ref(null);

// 新增：状态选项
const statusOptions = [
  { value: 'todo', text: '待处理' },
  { value: 'inProgress', text: '进行中' },
  { value: 'completed', text: '已完成' }
];

// 计算属性
const hasTasks = ref(false);

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

const statistics = computed(() => {
  return {
    total: tasks.value.length,
    todo: todoTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length
  };
});

// 方法
function loadTasks() {
  // 模拟加载数据
  setTimeout(() => {
    const avatarMap = {
      '1001': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/e7720ac1fae24d068ae2ebce7038472f.png',
      '1002': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/dbfafe03bc0e4f30b288e70cfeee434e.png',
      '1003': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/ad929a51b8f243cfaf0792e0de963d08.png',
      '1004': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/675b261911764dd9bdf6ad7942fec558.png',
      '1005': 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/871731a3efa5453fb4b2310f0bcefb97.png'
    };
    
    tasks.value = [
      {
        id: '1',                 // 任务唯一标识符
        title: '完成登录页面设计',  // 任务标题
        description: '设计用户登录界面，包括表单布局和交互效果',  // 任务详细描述
        status: 'completed',     // 任务状态：待处理(todo)、进行中(inProgress)、已完成(completed)
        priority: 'high',        // 任务优先级：高(high)、中(medium)、低(low)
        creatorId: '1002',       // 创建者ID
        creatorName: '张三',      // 创建者姓名
        assigneeId: '1003',      // 负责人ID
        assigneeName: '李四',     // 负责人姓名
        assigneeAvatar: avatarMap['1003'],  // 负责人头像
        createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),  // 创建时间
        deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000)     // 截止时间
      },
      {
        id: '2',
        title: '实现用户注册表单验证',
        description: '编写前端表单验证逻辑，包括用户名、密码格式检查等',
        status: 'inProgress',
        priority: 'high',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1005',
        assigneeName: '赵六',
        assigneeAvatar: avatarMap['1005'],
        createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000)
      },
	  {
	    id: '1',
	    title: '完成登录页面设计',
	    description: '设计用户登录界面，包括表单布局和交互效果',
	    status: 'completed',
	    priority: 'high',
	    creatorId: '1002',
	    creatorName: '张三',
	    assigneeId: '1003',
	    assigneeName: '李四',
	    assigneeAvatar: avatarMap['1003'],
	    createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
	    deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	  },
	  {
	    id: '2',
	    title: '实现用户注册表单验证',
	    description: '编写前端表单验证逻辑，包括用户名、密码格式检查等',
	    status: 'inProgress',
	    priority: 'high',
	    creatorId: '1002',
	    creatorName: '张三',
	    assigneeId: '1005',
	    assigneeName: '赵六',
	    assigneeAvatar: avatarMap['1005'],
	    createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
	    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000)
	  },
      {
        id: '3',
        title: '开发后端API接口',
        description: '实现用户登录、注册等相关API接口',
        status: 'inProgress',
        priority: 'medium',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1004',
        assigneeName: '王五',
        assigneeAvatar: avatarMap['1004'],
        createTime: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000)
      },
      {
        id: '4',
        title: '编写单元测试',
        description: '为登录模块编写单元测试用例，确保功能正确性',
        status: 'todo',
        priority: 'medium',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1001',
        assigneeName: '我',
        assigneeAvatar: avatarMap['1001'],
        createTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000)
      },
      {
        id: '5',
        title: '系统集成测试',
        description: '进行登录模块与其他系统的集成测试',
        status: 'todo',
        priority: 'low',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1001',
        assigneeName: '我',
        assigneeAvatar: avatarMap['1001'],
        createTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      },
      {
        id: '1',
        title: '完成登录页面设计',
        description: '设计用户登录界面，包括表单布局和交互效果',
        status: 'completed',
        priority: 'high',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1003',
        assigneeName: '李四',
        assigneeAvatar: avatarMap['1003'],
        createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        id: '2',
        title: '实现用户注册表单验证',
        description: '编写前端表单验证逻辑，包括用户名、密码格式检查等',
        status: 'inProgress',
        priority: 'high',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1005',
        assigneeName: '赵六',
        assigneeAvatar: avatarMap['1005'],
        createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000)
      },
	  {
	    id: '1',
	    title: '完成登录页面设计',
	    description: '设计用户登录界面，包括表单布局和交互效果',
	    status: 'completed',
	    priority: 'high',
	    creatorId: '1002',
	    creatorName: '张三',
	    assigneeId: '1003',
	    assigneeName: '李四',
	    assigneeAvatar: avatarMap['1003'],
	    createTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
	    deadline: new Date(Date.now() - 2 * 24 * 3600 * 1000)
	  },
	  {
	    id: '2',
	    title: '实现用户注册表单验证',
	    description: '编写前端表单验证逻辑，包括用户名、密码格式检查等',
	    status: 'inProgress',
	    priority: 'high',
	    creatorId: '1002',
	    creatorName: '张三',
	    assigneeId: '1005',
	    assigneeName: '赵六',
	    assigneeAvatar: avatarMap['1005'],
	    createTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
	    deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000)
	  },
      {
        id: '3',
        title: '开发后端API接口',
        description: '实现用户登录、注册等相关API接口',
        status: 'inProgress',
        priority: 'medium',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1004',
        assigneeName: '王五',
        assigneeAvatar: avatarMap['1004'],
        createTime: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000)
      },
      {
        id: '4',
        title: '编写单元测试',
        description: '为登录模块编写单元测试用例，确保功能正确性',
        status: 'todo',
        priority: 'medium',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1001',
        assigneeName: '我',
        assigneeAvatar: avatarMap['1001'],
        createTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000)
      },
      {
        id: '5',
        title: '系统集成测试',
        description: '进行登录模块与其他系统的集成测试',
        status: 'todo',
        priority: 'low',
        creatorId: '1002',
        creatorName: '张三',
        assigneeId: '1001',
        assigneeName: '我',
        assigneeAvatar: avatarMap['1001'],
        createTime: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      }
    ];
    
    hasTasks.value = tasks.value.length > 0;
  }, 500);
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
    id: Date.now().toString(),
    title: '',
    description: '',
    priority: 'medium',
    status: status,
    deadline: '',
    assigneeId: '1001',
    assigneeName: '我',
    assigneeAvatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/e7720ac1fae24d068ae2ebce7038472f.png',
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
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '';
  }
}

// 新增：显示任务创建表单
function showTaskForm() {
  isEditMode.value = false;
  // 重置表单
  taskForm.value = {
    id: Date.now().toString(),
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    deadline: '',
    assigneeId: '1001',
    assigneeName: '我',
    assigneeAvatar: 'https://saichuang.oss-cn-beijing.aliyuncs.com/avatar/e7720ac1fae24d068ae2ebce7038472f.png',
    createTime: new Date()
  };
  showTaskFormModal.value = true;
}

// 新增：隐藏任务创建表单
function hideTaskForm() {
  showTaskFormModal.value = false;
}

// 新增：处理日期变更
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

// 新增：处理状态变更
function handleStatusChange(e) {
  const index = e.detail.value;
  taskForm.value.status = statusOptions[index].value;
}

// 新增：获取状态索引
function getStatusIndex(status) {
  return statusOptions.findIndex(option => option.value === status);
}

// 新增：获取状态文本
function getStatusText(status) {
  const option = statusOptions.find(option => option.value === status);
  return option ? option.text : '待处理';
}

// 新增：提交任务表单
function submitTaskForm() {
  if (!taskForm.value.title) {
    uni.showToast({
      title: '请输入任务标题',
      icon: 'none'
    });
    return;
  }
  
  if (isEditMode.value) {
    // 编辑现有任务
    const index = tasks.value.findIndex(task => task.id === taskForm.value.id);
    if (index !== -1) {
      // 保留原始任务的一些属性
      const originalTask = tasks.value[index];
      taskForm.value.creatorId = originalTask.creatorId;
      taskForm.value.creatorName = originalTask.creatorName;
      
      // 更新任务
      tasks.value[index] = { ...taskForm.value };
      
      uni.showToast({
        title: '任务已更新',
        icon: 'success'
      });
    }
  } else {
    // 创建新任务
    const newTask = { ...taskForm.value };
    
    // 添加创建者信息
    newTask.creatorId = '1001';
    newTask.creatorName = '我';
    
    // 添加到任务列表
    tasks.value.push(newTask);
    
    uni.showToast({
      title: '任务已创建',
      icon: 'success'
    });
    
    // 如果原来没有任务，设置hasTasks为true
    if (!hasTasks.value) {
      hasTasks.value = true;
    }
  }
  
  // 隐藏表单
  hideTaskForm();
}

// 新增：显示任务操作菜单
function showTaskOptions(task) {
  currentTask.value = task;
  showTaskOptionsModal.value = true;
}

// 新增：隐藏任务操作菜单
function hideTaskOptions() {
  showTaskOptionsModal.value = false;
  currentTask.value = null;
}

// 新增：编辑任务
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

// 新增：修改任务状态
function changeTaskStatus(status) {
  if (!currentTask.value) return;
  
  const index = tasks.value.findIndex(task => task.id === currentTask.value.id);
  if (index !== -1) {
    // 更新状态
    tasks.value[index].status = status;
    
    uni.showToast({
      title: `已${status === 'completed' ? '完成' : '移动'}任务`,
      icon: 'success'
    });
  }
  
  // 隐藏选项菜单
  hideTaskOptions();
}

// 新增：确认删除任务
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

// 新增：删除任务
function deleteTask() {
  if (!currentTask.value) return;
  
  // 从任务列表中移除
  tasks.value = tasks.value.filter(task => task.id !== currentTask.value.id);
  
  // 如果任务列表为空，设置hasTasks为false
  if (tasks.value.length === 0) {
    hasTasks.value = false;
  }
  
  uni.showToast({
    title: '任务已删除',
    icon: 'success'
  });
  
  // 隐藏选项菜单
  hideTaskOptions();
}

// 初始化
loadTasks();
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

.task-assignee {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  overflow: hidden;
}

.assignee-avatar {
  width: 100%;
  height: 100%;
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
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-form-container {
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  max-height: 90vh;
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
}

.form-textarea {
  height: 160rpx;
}

.date-picker, .status-picker {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  position: relative;
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
</style> 