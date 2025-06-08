<template>
  <view class="container">
    <!-- 顶部导航栏 - 使用HeaderBar组件 -->
    <header-bar
      title="任务详情"
      :show-search="false"
      :show-filter="true"
  
    ></header-bar>
    
    <!-- 任务详情内容 -->
    <scroll-view scroll-y class="content-scroll" >
      <!-- 顶部基本信息卡片 -->
      <view class="top-info-card">
        <!-- 任务标题和状态 -->
        <view class="title-status-row">
          <text class="task-title">{{ taskDetail.title }}</text>
          <text class="task-status-tag" :class="getStatusClass(taskDetail.status)">{{ taskDetail.statusText }}</text>
        </view>
        
        <!-- 发布者信息 -->
        <view class="publisher-info-row" @click="viewUserProfile(taskDetail.creatorId)">
          <image class="publisher-avatar" :src="taskDetail.creatorAvatarUrl || defaultAvatar" mode="aspectFill"></image>
          <view class="publisher-text">
            <text class="publisher-name">{{ taskDetail.creatorName }}</text>
            <text class="publisher-extra">{{ taskDetail.creatorMajor }} · {{ formatTimeAgo(taskDetail.createdAt) }}发布</text>
          </view>
        </view>
      </view>
      
      <!-- 任务详情卡片 -->
      <view class="detail-card">
        <view class="card-title">任务详情</view>
        <view class="card-content description-content">
          <text class="description-text">{{ taskDetail.description }}</text>
        </view>
      </view>
      
      <!-- 任务需求卡片 -->
      <view class="detail-card" v-if="taskDetail.requirements">
        <view class="card-title">任务要求</view>
        <view class="card-content description-content">
          <text class="description-text">{{ taskDetail.requirements }}</text>
        </view>
      </view>
      
      <!-- 任务信息网格 -->
      <view class="info-grid">
        <!-- 时间信息 -->
        <view class="info-grid-item">
          <text class="grid-item-label">时间</text>
          <view class="grid-item-content">
            <SvgIcon name="shijian" color="#4A90E2" />
            <text class="grid-item-value">{{ formatDeadline(taskDetail.deadline) }}</text>
          </view>
        </view>
        
        <!-- 地点信息 -->
        <view class="info-grid-item" v-if="taskDetail.location">
          <text class="grid-item-label">地点</text>
          <view class="grid-item-content">
            <SvgIcon name="weizhi"  color="#4A90E2" />
            <text class="grid-item-value">{{ taskDetail.location }}</text>
          </view>
        </view>
        
        <!-- 奖励信息 -->
        <view class="info-grid-item">
          <text class="grid-item-label">{{ getRewardTypeText(taskDetail.rewardTypeName) }}</text>
          <view class="grid-item-content">
            <SvgIcon :name="getRewardIcon(taskDetail.rewardTypeName)" :color="getRewardIconColor(taskDetail.rewardTypeName)" size="28"/>
            <text class="grid-item-value reward-text" :class="getRewardClass(taskDetail.rewardTypeName)">
              <text v-if="taskDetail.rewardTypeName === '现金'">¥{{ taskDetail.rewardAmount }}</text>
              <text v-else-if="taskDetail.rewardTypeName === '学分'">{{ taskDetail.rewardAmount }} 学分</text>
              <text v-else>{{ taskDetail.rewardTypeName }}</text>
            </text>
          </view>
        </view>
        
        <!-- 参与人数 -->
        <view class="info-grid-item">
          <text class="grid-item-label">参与人数</text>
          <view class="grid-item-content">
            <SvgIcon name="renshu"  color="#4A90E2" />
            <text class="grid-item-value">{{ taskDetail.currentParticipants }}/{{ taskDetail.maxParticipants }} 人</text>
            <view class="view-participants" v-if="taskDetail.currentParticipants > 0" @click="openParticipantsPopup">
              <text>查看</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 联系方式卡片 -->
      <view class="detail-card" v-if="validContacts.length > 0">
        <view class="card-title">联系方式</view>
        <view class="contact-list">
          <view class="contact-item" v-for="contact in validContacts" :key="contact.key" @click="copyContactInfo(contact.value)">
            <view class="contact-type-container">
              <SvgIcon :name="getContactIcon(contact.key)" color="#4A90E2" />
              <text class="contact-type">{{ getContactTypeText(contact.key) }}</text>
            </view>
            <view class="contact-value-container">
              <text class="contact-value">{{ contact.value }}</text>
              <text class="copy-hint">点击复制</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn favorite" @click="toggleFavorite">
        <SvgIcon :name="isFavorite ? 'souchang' : 'weishouchang'" size="36" :color="isFavorite ? '#FFC107' : '#666666'" />
        <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
      
      <!-- 如果是发布者，显示编辑按钮；否则显示申请按钮 -->
      <button 
        v-if="isCreator" 
        class="edit-btn" 
        @click="editTask"
      >
        分享任务
      </button>
      <button 
        v-else
        class="apply-btn" 
        :class="{ 'disabled-btn': isApplyDisabled }" 
        :disabled="isApplyDisabled"
        @click="applyTask"
      >
        {{ getApplyButtonText() }}
      </button>
    </view>
    
    <!-- 任务参与者弹窗 -->
    <task-participants-popup ref="participantsPopup" :task-id="taskId"></task-participants-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import request from '@/utils/request';
import api from '@/api';
import HeaderBar from '@/components/HeaderBar.vue'; // 引入顶部导航栏组件
import SvgIcon from '@/components/SvgIcon.vue'; // 引入SVG图标组件
import TaskParticipantsPopup from '@/components/team/TaskParticipantsPopup.vue'; // 引入任务参与者弹窗组件

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/100';

// 页面参数
const taskId = ref(null);
const isFavorite = ref(false);
const viewCounted = ref(false);
const favoriteCount = ref(0);
const isAlreadyApplied = ref(false); // 是否已申请
const participantsPopup = ref(null); // 参与者列表弹窗引用

// 任务详情数据
const taskDetail = ref({
  id: 0,
  title: '',
  description: '',
  requirements: '',
  contactInfo: '',
  categoryId: 0,
  categoryName: '',
  creatorId: 0,
  creatorName: '',
  creatorAvatarUrl: '',
  creatorMajor: '',
  rewardTypeId: 0,
  rewardTypeName: '',
  rewardAmount: 0,
  createdAt: '',
  deadline: '',
  status: 'recruiting',
  maxParticipants: 0,
  currentParticipants: 0,
  viewCount: 0,
  location: ''
});

// 判断当前用户是否为发布者
const isCreator = ref(false);

// 判断当前用户是否已申请或不能申请
const isApplyDisabled = computed(() => {
  // 如果是发布者自己，禁用申请按钮
  if (isCreator.value) {
    return true;
  }
  
  // 如果已申请，则禁用申请按钮
  if (isAlreadyApplied.value) {
    return true;
  }
  
  // 如果任务状态不是招募中，则禁用申请按钮
  if (taskDetail.value.status !== 'recruiting') {
    return true;
  }
  
  // 如果已达到最大参与人数，禁用申请按钮
  if (taskDetail.value.currentParticipants >= taskDetail.value.maxParticipants) {
    return true;
  }
  
  return false;
});

// 处理联系方式
const contactInfo = computed(() => {
  if (!taskDetail.value.contactInfo) return null;
  
  try {
    let contactData;
    if (typeof taskDetail.value.contactInfo === 'string') {
      contactData = JSON.parse(taskDetail.value.contactInfo);
    } else {
      contactData = taskDetail.value.contactInfo;
    }
    return contactData;
  } catch (e) {
    console.error('解析联系方式失败:', e);
    return null;
  }
});

// 过滤有效的联系方式
const validContacts = computed(() => {
  if (!contactInfo.value) return [];
  
  return Object.entries(contactInfo.value)
    .filter(([key, value]) => value && value.toString().trim() !== '')
    .map(([key, value]) => ({ key, value }));
});

// 获取奖励类型对应的图标
function getRewardIcon(type) {
  switch (type) {
    case '现金':
      return 'xianjin';
    case '学分':
      return 'xuefen';
    case '志愿服务':
      return 'zhiyaunshichang';
    case '证书':
      return 'zhengshu';
    case '实习机会':
      return 'shixijihui';
    case '礼品':
      return 'liping';
    default:
      return 'xianjin';
  }
}

// 获取奖励图标颜色
function getRewardIconColor(type) {
  switch (type) {
    case '现金':
      return '#FF6B6B';
    case '学分':
      return '#4A90E2';
    case '志愿服务':
      return '#7ED321';
    case '证书':
      return '#FFC107';
    default:
      return '#4A90E2';
  }
}

// 获取联系方式对应的图标
function getContactIcon(type) {
  switch (type) {
    case 'phone':
      return 'dianhua'; // 这里我们使用icons.js中现有的电话图标名称
    case 'wechat':
      return 'weixintubiao';
    case 'qq':
      return 'qqtubiao';
    case 'email':
      return 'youxiang';
    default:
      return 'youxiang';
  }
}

// 页面加载
onMounted(() => {
  // 获取任务ID
  getTaskIdAndLoadDetail();
});

// 获取任务ID并加载详情
function getTaskIdAndLoadDetail() {
  try {
    // 尝试多种方式获取任务ID
    let id = null;
    
    // 方式1: 从页面参数中获取
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      
      // 尝试从options中获取
      if (currentPage.options && currentPage.options.id) {
        id = currentPage.options.id;
      }
      // 尝试从$page中获取
      else if (currentPage.$page && currentPage.$page.fullPath) {
        const fullPath = currentPage.$page.fullPath;
        const queryIndex = fullPath.indexOf('?');
        
        if (queryIndex > -1) {
          const queryPart = fullPath.substring(queryIndex + 1);
          const queryParams = queryPart.split('&');
          
          for (let param of queryParams) {
            const [key, value] = param.split('=');
            if (key === 'id' && value) {
              id = value;
              break;
            }
          }
        }
      }
      // 尝试从__displayReporter中获取
      else if (currentPage.__displayReporter && currentPage.__displayReporter.query) {
        id = currentPage.__displayReporter.query.id;
      }
    }
    
    // 检查是否获取到ID
    if (id) {
      taskId.value = id;
      getTaskDetail(id);
    } else {
      // 如果没有获取到ID，显示错误提示
      uni.showToast({
        title: '无法获取任务信息',
        icon: 'none'
      });
      // 1.5秒后返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error('获取任务ID出错:', error);
    uni.showToast({
      title: '加载任务详情失败',
      icon: 'none'
    });
  }
}

// 添加onLoad钩子函数，兼容方案，在组件外使用
defineExpose({
  onLoad(options) {
    if (options && options.id) {
      taskId.value = options.id;
      getTaskDetail(options.id);
    }
  }
});

// 获取任务详情
async function getTaskDetail(id) {
  if (!id) {
    uni.showToast({
      title: '任务ID无效',
      icon: 'none'
    });
    return;
  }
  
  try {
    uni.showLoading({
      title: '加载中...'
    });
    
    const res = await request({
      url: `/tasks/${id}`,
      method: 'GET'
    });
    
    if (res.code === 200 && res.data) {
      taskDetail.value = res.data;
      // 如果API返回了attachments字段，但我们当前不处理它

      // 检查用户是否已申请
      checkIfAlreadyApplied(id);
      
      // 检查当前用户是否为发布者
      checkIfCreator();
      
      // 更新页面标题
      if (taskDetail.value.title) {
        uni.setNavigationBarTitle({
          title: '任务详情'
        });
      }
    } else {
      console.error('获取任务详情失败:', res);
      uni.showToast({
        title: '获取任务详情失败',
        icon: 'none'
      });
      

    }
  } catch (error) {
    console.error('获取任务详情异常:', error);

  } finally {
    uni.hideLoading();
  }
}

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
// 格式化日期
function formatDeadline(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 时间格式
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    // 日期格式
    if (date.getFullYear() === now.getFullYear()) {
      // 同一年
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = days[date.getDay()];
      return `${month}月${day}日 周${weekday} ${timeStr}`;
    } else {
      // 不同年
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
    }
  } catch (e) {
    return dateStr;
  }
}

// 格式化发布时间为"xx前"
function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 不同时间单位的毫秒数
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
      return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
      return Math.floor(diff / week) + '周前';
    } else {
      return Math.floor(diff / month) + '个月前';
    }
  } catch (e) {
    return dateStr;
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'recruiting':
      return '招募中';
    case 'ongoing':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'ended':
      return '已结束';
    case 'canceled':
      return '已取消';
    default:
      return '未知状态';
  }
}

// 获取状态样式类
function getStatusClass(status) {
  switch (status) {
    case 'recruiting':
      return 'status-recruiting';
    case 'ongoing':
      return 'status-ongoing';
    case 'completed':
      return 'status-completed';
    case 'ended':
      return 'status-ended';
    case 'canceled':
      return 'status-canceled';
    default:
      return '';
  }
}

// 获取奖励类型文本
function getRewardTypeText(type) {
  switch (type) {
    case '现金':
      return '报酬';
    case '学分':
      return '学分奖励';
    case '志愿服务':
      return '志愿时长';
    case '证书':
      return '证书奖励';
    default:
      return '奖励';
  }
}

// 获取奖励样式类
function getRewardClass(type) {
  switch (type) {
    case '现金':
      return 'reward-orange';
    case '学分':
      return 'reward-blue';
    case '志愿服务':
      return 'reward-green';
    case '证书':
      return 'reward-yellow';
    default:
      return '';
  }
}

// 获取联系方式类型文本
function getContactTypeText(type) {
  switch (type) {
    case 'phone':
      return '电话';
    case 'wechat':
      return '微信';
    case 'qq':
      return 'QQ';
    case 'email':
      return '邮箱';
    default:
      return type;
  }
}

// 复制联系方式
function copyContactInfo(value) {
  uni.setClipboardData({
    data: value,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      });
    }
  });
}

// 获取申请按钮文本
function getApplyButtonText() {
  // 如果是发布者自己，显示"我的任务"
  if (isCreator.value) {
    return '我的任务';
  }

  if (isAlreadyApplied.value) {
    return '已申请';
  }
  
  if (taskDetail.value.status === 'recruiting') {
    if (taskDetail.value.currentParticipants >= taskDetail.value.maxParticipants) {
      return '名额已满';
    }
    return '立即申请';
  } else if (taskDetail.value.status === 'ongoing') {
    return '进行中';
  } else if (taskDetail.value.status === 'completed') {
    return '已完成';
  } else if (taskDetail.value.status === 'ended') {
    return '已结束';
  } else if (taskDetail.value.status === 'canceled') {
    return '已取消';
  }
  return '立即申请';
}

// 收藏/取消收藏
async function toggleFavorite() {
  if (!taskId.value) return;
  
  try {
    
  } catch (error) {
    console.error('收藏操作失败:', error);
    
    // 开发测试使用
    isFavorite.value = !isFavorite.value;
    favoriteCount.value += isFavorite.value ? 1 : -1;
    
    uni.showToast({
      title: isFavorite.value ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  }
}

// 检查用户是否已申请
async function checkIfAlreadyApplied(taskId) {
  try {
    const response = await api.taskApplications.checkTaskApplication(taskId);
    
    if (response.code === 200 && response.data) {
      isAlreadyApplied.value = response.data.participated || false;
    }
  } catch (error) {
    console.error('检查申请状态失败:', error);
    // 默认设为未申请，让用户能够尝试申请
    isAlreadyApplied.value = false;
  }
}

// 申请任务
async function applyTask() {
  if (isApplyDisabled.value) return;
  
  // 打开申请窗口，让用户输入申请理由
  uni.showModal({
    title: '申请任务',
    content: '确定要申请该任务吗？',
    editable: true,
    placeholderText: '可选择填写申请理由（如有特长、经验等）',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '提交申请中...'
          });
          
          const response = await api.taskApplications.createTaskApplication({
            taskId: taskId.value,
            message: res.content || '我对这个任务很感兴趣，希望能参与。',
            status: 'pending' // 添加状态字段，表示申请待处理
          });
          
          uni.hideLoading();
          
          if (response.code === 200) {
            uni.showToast({
              title: '申请成功，等待审核',
              icon: 'success'
            });
            
            // 更新已申请状态
            isAlreadyApplied.value = true;
            
            // 跳转到申请列表页面
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/application/application'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: response.message || '申请失败',
              icon: 'none'
            });
          }
        } catch (error) {
          uni.hideLoading();
          console.error('申请任务失败:', error);
          
          uni.showToast({
            title: '申请失败，请稍后重试',
            icon: 'none'
          });
        }
      }
    }
  });
}

// 更新任务状态
async function updateTaskStatus(status, cancelReason = '') {
  if (!taskId.value) return;
  
  // 如果是取消状态但没有提供取消原因，则要求用户填写
  if (status === 'canceled' && !cancelReason) {
    uni.showModal({
      title: '取消任务',
      content: '确定要取消该任务吗？',
      editable: true,
      placeholderText: '请填写取消原因',
      success: async (res) => {
        if (res.confirm && res.content) {
          doUpdateTaskStatus(status, res.content);
        } else if (res.confirm) {
          uni.showToast({
            title: '取消原因不能为空',
            icon: 'none'
          });
        }
      }
    });
    return;
  }
  
  // 其他状态的确认
  const statusTextMap = {
    recruiting: '招募中',
    ongoing: '进行中',
    completed: '已完成',
    ended: '已结束',
    canceled: '已取消'
  };
  
  uni.showModal({
    title: `更改状态为"${statusTextMap[status] || status}"`,
    content: `确定要将任务状态更改为"${statusTextMap[status] || status}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        doUpdateTaskStatus(status, cancelReason);
      }
    }
  });
}

// 执行更新状态的API请求
async function doUpdateTaskStatus(status, cancelReason = '') {
  try {
    uni.showLoading({
      title: '更新中...'
    });
    
    const data = { status };
    if (status === 'canceled') {
      data.cancelReason = cancelReason;
    }
    
    const response = await api.tasks.updateTaskStatus(taskId.value, data);
    
    uni.hideLoading();
    
    if (response.code === 200) {
      uni.showToast({
        title: '状态更新成功',
        icon: 'success'
      });
      
      // 刷新任务详情
      getTaskDetail(taskId.value);
    } else {
      uni.showToast({
        title: response.message || '更新失败',
        icon: 'none'
      });
    }
  } catch (error) {
    uni.hideLoading();
    console.error('更新任务状态失败:', error);
    
    uni.showToast({
      title: '网络异常，请稍后重试',
      icon: 'none'
    });
  }
}

// 打开参与者列表弹窗
function openParticipantsPopup() {
  if (taskId.value) {
    // 直接触发事件，不做权限检查
    uni.$emit('openParticipantsPopup');
    
    // 确保任务ID已经传递到弹窗组件
    nextTick(() => {
      if (participantsPopup.value) {
        participantsPopup.value.open();
      }
    });
  }
}

// 检查用户是否为发布者
async function checkIfCreator() {
  try {
    // 使用API获取当前用户信息
    const res = await request({
      url: '/users/info',
      method: 'GET'
    });
    
    if (res.code === 200 && res.data && res.data.userId && taskDetail.value && taskDetail.value.creatorId) {
      // 比较当前用户ID和任务发布者ID
      isCreator.value = res.data.userId === taskDetail.value.creatorId;
      console.log('当前用户ID:', res.data.userId, '发布者ID:', taskDetail.value.creatorId, '是否为发布者:', isCreator.value);
    } else {
      // 如果无法获取用户信息或任务发布者信息，则默认为非发布者
      isCreator.value = false;
      console.log('无法获取用户信息或任务发布者信息');
    }
  } catch (error) {
    console.error('检查发布者状态失败:', error);
    isCreator.value = false;
  }
}

// 编辑任务
function editTask() {
  if (!taskId.value) return;
  
  uni.navigateTo({
    url: `/pages/task-square/edit?id=${taskId.value}`
  });
}
</script>

<style lang="scss">
/* 使用项目色彩系统 */
$primary-color: #4A90E2; // 活力蓝
$secondary-color: #7ED321; // 校园绿
$accent-color: #FF6B6B; // 竞赛橙
$bg-color: #f5f5f5;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;
$border-color: #eeeeee;

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

/* 内容区 */
.content-scroll {
  flex: 1;
  padding: 32rpx 0rpx;
  padding-bottom: 160rpx; /* 为底部操作栏留出空间 */
  margin-top: 120rpx; /* 为HeaderBar留出空间 */
}

/* 顶部信息卡片 */
.top-info-card {
  background-color: #fff;
  border-radius: 0;
  padding: 36rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  
  .title-status-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32rpx;
    
    .task-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
      flex: 1;
      margin-right: 32rpx;
      line-height: 1.4;
    }
    
    .task-status-tag {
      padding: 8rpx 20rpx;
      border-radius: 100rpx;
      font-size: 24rpx;
      white-space: nowrap;
    }
  }
  
  .publisher-info-row {
    display: flex;
    align-items: center;
    
    .publisher-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }
    
    .publisher-text {
      display: flex;
      flex-direction: column;
      
      .publisher-name {
        font-size: 28rpx;
        color: $text-primary;
        font-weight: 500;
      }
      
      .publisher-extra {
        font-size: 24rpx;
        color: $text-light;
        margin-top: 4rpx;
      }
    }
  }
}

/* 详情卡片 */
.detail-card {
  background-color: #fff;
  border-radius: 0;
  padding: 36rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: 24rpx;
  }
  
  .card-content {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
  }
  
  .description-content {
    background-color: rgba($primary-color, 0.05);
    padding: 28rpx 36rpx;
    border-radius: 16rpx;
    
    .description-text {
      color: $text-secondary;
      word-break: break-all;
      white-space: pre-wrap;
      padding-right: 12rpx;
      line-height: 1.6;
    }
  }
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  margin-bottom: 20rpx;
  background-color: #fff;
  
  .info-grid-item {
    background-color: #fff;
    border-radius: 0;
    padding: 32rpx;
    box-shadow: none;
    border-bottom: 2rpx solid $border-color;
    border-right: 2rpx solid $border-color;
    
    &:nth-child(2n) {
      border-right: none;
    }
    
    &:nth-last-child(1),
    &:nth-last-child(2) {
      border-bottom: none;
    }
    
    .grid-item-label {
      font-size: 24rpx;
      color: $text-light;
      margin-bottom: 18rpx;
      display: block;
    }
    
    .grid-item-content {
      display: flex;
      align-items: center;
      
      .iconfont {
        font-size: 32rpx;
        color: $primary-color;
        margin-right: 16rpx;
      }
      
      .grid-item-value {
        font-size: 28rpx;
        font-weight: 500;
        color: $text-primary;
        margin-left: 16rpx;
      }
      
      .view-participants {
        margin-left: 16rpx;
        padding: 4rpx 16rpx;
        background-color: rgba($primary-color, 0.1);
        border-radius: 8rpx;
        
        text {
          font-size: 24rpx;
          color: $primary-color;
        }
      }
      
      .reward-text {
        &.reward-orange {
          color: $accent-color;
        }
        
        &.reward-blue {
          color: $primary-color;
        }
        
        &.reward-green {
          color: $secondary-color;
        }
        
        &.reward-yellow {
          color: #FFC107;
        }
      }
    }
  }
}

/* 联系方式列表 */
.contact-list {
  .contact-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 16rpx;
    border-bottom: 2rpx solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    .contact-type-container {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .contact-type {
        font-size: 28rpx;
        color: $text-secondary;
        font-weight: 500;
        margin-left: 8rpx;
      }
    }
    
    .contact-value-container {
      display: flex;
      align-items: center;
      
      .contact-value {
        font-size: 28rpx;
        color: $primary-color;
        margin-right: 20rpx;
        max-width: 300rpx;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .copy-hint {
        font-size: 24rpx;
        color: $text-light;
        background-color: rgba($text-light, 0.1);
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
      }
    }
  }
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx 32rpx;
  background-color: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 0 32rpx;
    height: 88rpx;
    border-radius: 16rpx;
    font-size: 28rpx;
    
    &.favorite {
      color: $text-secondary;
      margin-right: 24rpx;
    }
  }
  
  .apply-btn {
    flex: 1;
    height: 88rpx;
    background-color: $primary-color;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.disabled-btn {
      background-color: rgba($text-light, 0.5);
    }
  }
  
  .edit-btn {
    flex: 1;
    height: 88rpx;
    background-color: $secondary-color;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 任务状态标签样式 */
.status-recruiting {
  background-color: rgba(#4CAF50, 0.1);
  color: #4CAF50;
}

.status-ongoing {
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
}

.status-completed {
  background-color: rgba(#9C27B0, 0.1);
  color: #9C27B0;
}

.status-ended {
  background-color: rgba($text-light, 0.1);
  color: $text-light;
}

.status-canceled {
  background-color: rgba(#F44336, 0.1);
  color: #F44336;
}
</style> 