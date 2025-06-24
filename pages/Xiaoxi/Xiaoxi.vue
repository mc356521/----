<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="navbar">
        <SvgIcon name="back" size="20" @click="goBack"></SvgIcon>
        <view class="title">消息</view>
        <view class="actions" >
          <view v-if="!isEditMode" class="mark-read" @click="markAllAsRead">
          <text class="mark-text">全部标记为已读</text>
          <SvgIcon name="yidubiaoji" size="20"></SvgIcon>
        </view>
          <view v-if="!isEditMode" class="edit-btn" @click="toggleEditMode">
            <text class="edit-text">编辑</text>
            <SvgIcon name="bianji" size="20"></SvgIcon>
          </view>
          <view v-else class="edit-actions">
            <view class="cancel-btn" @click="toggleEditMode">
              <text>取消</text>
            </view>
            <view class="delete-btn" @click="confirmBatchDelete">
              <text class="iconfont icon-delete"></text>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- WebSocket连接状态指示器 -->
      <!-- <view class="ws-status" :class="{ 'connected': wsConnected }">
        <text class="ws-status-text">{{ wsConnected ? '实时消息已连接' : '实时消息未连接' }}</text>
        <view class="ws-indicator"></view>
      </view> -->
    </view>
    
    <!-- 标签页 -->
    <view class="tabs">
      <view
        :class="['tab-item', activeTab === 'message' ? 'tab-active' : '']"
        @click="switchTab('message')"
      >
        <text>聊天</text>
        <text class="badge" v-if="unreadChatCount > 0">{{ unreadChatCount }}</text>
      </view>
      <view
        :class="['tab-item', activeTab === 'notification' ? 'tab-active' : '']"
        @click="switchTab('notification')"
      >
        <text>通知</text>
        <text class="badge" v-if="unreadCount > 0">{{ unreadCount }}</text>
      </view>
    </view>
    
    <!-- 通知列表 -->
    <scroll-view 
      scroll-y 
      class="notification-list" 
      refresher-enabled 
      :refresher-triggered="refreshing" 
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 消息列表 -->
      <view v-if="activeTab === 'message'">
        <view class="chat-list">
          <view class="chat-item" v-for="item in messageList" :key="item.id" @click="goToChat(item)">
            <image class="avatar" :src="item.avatarUrl || '/static/image/default-avatar.png'" mode="aspectFill"></image>
            <view class="chat-info">
              <view class="chat-title">
                <text class="nickname">{{ item.realName || getPeerUserId(item) }}</text>
                <text class="time">{{ formatTime(item.updateTime) }}</text>
              </view>
              <view class="chat-last-msg">
                <text>有新的 {{ item.realName || getPeerUserId(item) }} 私聊消息</text>
              </view>
            </view>
            <view class="unread-badge" v-if="item.unreadCount > 0">
              {{ item.unreadCount > 99 ? '99+' : item.unreadCount }}
            </view>
          </view>
        </view>
        <view class="empty-state" v-if="!loading && messageList.length === 0">
          <image class="empty-image" src="/static/empty-notification.png" mode="aspectFit"></image>
          <text class="empty-text">暂无消息</text>
        </view>
      </view>

      <!-- 通知列表 -->
      <view v-if="activeTab === 'notification'">
        <view 
          class="notification-item" 
          v-for="(item, index) in notifications" 
          :key="item.id"
          :class="{
            'item-selected': isEditMode && selectedItems.includes(item.id),
            'reading': item.isReading,
            'processed': isProcessedApplication(item),
            'unread': !item.read,
            'read': item.read
          }"
          @mouseenter="!isEditMode && handleNotificationView(item, index)"
          @mouseleave="!isEditMode && handleNotificationLeave(item)"
          @touchstart="!isEditMode && handleNotificationView(item, index)"
          @touchend="!isEditMode && handleNotificationLeave(item)"
        >
          <view class="select-box" v-if="isEditMode" @click.stop="toggleSelectItem(item.id)">
            <view class="checkbox" :class="{'checked': selectedItems.includes(item.id)}">
              <text class="iconfont icon-check" v-if="selectedItems.includes(item.id)"></text>
            </view>
          </view>
          <view class="notification-avatar">
            <image :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
          </view>
          <view class="notification-content" @click="isEditMode ? toggleSelectItem(item.id) : navigateToDetail(item)">
            <view class="notification-type">{{ item.type }}</view>
            <view class="notification-message">{{ item.message }}</view>
            <view class="notification-time">{{ item.time }}</view>
            
            <!-- 操作按钮 -->
            <view class="notification-actions" v-if="!isEditMode && item.actions && !isProcessedApplication(item)">
              <button 
                v-for="(action, idx) in item.actions" 
                :key="idx"
                :class="['action-btn', action.primary ? 'btn-primary' : 'btn-default']"
                @click.stop="handleAction(action.type, item.id)"
              >
                {{ action.name }}
              </button>
            </view>
          </view>
        </view>
        <view class="empty-state" v-if="!loading && notifications.length === 0">
          <image class="empty-image" src="/static/empty-notification.png" mode="aspectFit"></image>
          <text class="empty-text">暂无通知</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="loading-more" v-if="loading && !refreshing && activeTab === 'notification'">
        <text>加载中...</text>
      </view>
      
      <!-- 无更多数据 -->
      <view class="no-more" v-if="!loading && !hasMore && notifications.length > 0 && activeTab === 'notification'">
        <text>没有更多了</text>
      </view>
      
      <!-- 无通知状态 -->
      <view class="empty-state" v-if="false">
        <image class="empty-image" src="/static/empty-notification.png" mode="aspectFit"></image>
        <text class="empty-text">暂无{{ activeTab === 'unread' ? '未读' : '已读' }}通知</text>
      </view>
    </scroll-view>
    
    <!-- 底部批量操作栏 -->
    <view class="bottom-action-bar" v-if="isEditMode">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{'checked': isAllSelected}">
          <text class="iconfont icon-check" v-if="isAllSelected"></text>
        </view>
        <text>全选</text>
      </view>
      <view class="batch-delete" @click="confirmBatchDelete" :class="{'disabled': selectedItems.length === 0}">
        <text>删除({{ selectedItems.length }})</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import notificationService from '@/utils/notification-service';
import websocket from '@/utils/websocket';
import notificationsApi from '@/api/modules/notifications';
import teamApi from '@/api/modules/team';
import taskApplicationsApi from '@/api/modules/taskApplications';
import tasksApi from '@/api/modules/tasks';
import chatMessageApi from '../../api/modules/chatMessage';
import SvgIcon from '@/components/SvgIcon.vue';
// 获取App实例
const app = getApp();

// WebSocket连接状态
const wsConnected = ref(false);

// 标签页状态
const activeTab = ref('message');
const unreadCount = ref(0);
const unreadChatCount = ref(0)

// 通知数据
const notifications = ref([]);
const messageList = ref([])
// 分页参数
const pagination = ref({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
});

// 加载状态
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);

// 编辑模式状态
const isEditMode = ref(false);
const selectedItems = ref([]);

//获取Chat未读消息
async function getChatMessage(){
    const mockMessageList = [
        { id: 1, fromId: 'user1', toId: 'myUserId', realName: '小明', updateTime: new Date(Date.now() - 60000 * 5).toISOString(), unreadCount: 2, avatarUrl: '/static/image/Lianxi/a4.png' },
        { id: 2, fromId: 'user2', toId: 'myUserId', realName: '团队助手', updateTime: new Date(Date.now() - 60000 * 60 * 3).toISOString(), unreadCount: 5, avatarUrl: '/static/image/Lianxi/a5.png' },
        { id: 3, fromId: 'myUserId', toId: 'user3', realName: '张三', updateTime: new Date(Date.now() - 60000 * 60 * 24 * 2).toISOString(), unreadCount: 0, avatarUrl: '/static/image/Lianxi/a6.png' }
    ];
    messageList.value = mockMessageList;
    let count = 0;
    mockMessageList.forEach(item => {
        count += item.unreadCount;
    });
    unreadChatCount.value = count;
}
function getPeerUserId(item) {
  const myUserId = uni.getStorageSync('userId');
  if (item.fromId == myUserId) {
    return item.toId;
  } else {
    return item.fromId;
  }
}
//根据消息私聊用户
function goToChat(item) {
  // 假设当前登录用户 id 是 myUserId
  const myUserId = uni.getStorageSync('userId');
  // 判断对方 id
  const peerId = item.fromId === myUserId ? item.toId : item.fromId;
  uni.navigateTo({
    url: `/pages/chat-me/chat-me?userId=${peerId}`
  });
}

// 是否全选
const isAllSelected = computed(() => {
  const currentList = activeTab.value === 'notification' ? notifications.value : [];
  return currentList.length > 0 && selectedItems.value.length === currentList.length;
});

// 切换编辑模式
function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
  // 退出编辑模式时清空选择
  if (!isEditMode.value) {
    selectedItems.value = [];
  }
}

// 切换选择单个项目
function toggleSelectItem(id) {
  const index = selectedItems.value.indexOf(id);
  if (index === -1) {
    selectedItems.value.push(id);
  } else {
    selectedItems.value.splice(index, 1);
  }
}

// 切换全选/取消全选
function toggleSelectAll() {
  const currentList = activeTab.value === 'notification' ? notifications.value : [];
  
  if (isAllSelected.value) {
    // 如果已全选，则取消全选
    selectedItems.value = [];
  } else {
    // 如果未全选，则全选
    selectedItems.value = currentList.map(item => item.id);
  }
}

// 确认批量删除
function confirmBatchDelete() {
  if (selectedItems.value.length === 0) {
    uni.showToast({
      title: '请先选择要删除的通知',
      icon: 'none'
    });
    return;
  }
  
  uni.showModal({
    title: '删除通知',
    content: `确定要删除选中的${selectedItems.value.length}条通知吗？`,
    success: (res) => {
      if (res.confirm) {
        batchDeleteNotifications(selectedItems.value);
        // 删除后退出编辑模式
        toggleEditMode();
      }
    }
  });
}

// 处理新的通知消息
function handleNewNotification(notification) {
  console.log('收到新通知', notification);
  
  // 创建UI显示用的通知对象
  const newNotification = {
    id: notification.id,
    type: notification.typeName,
    message: notification.content || notification.title,
    time: notification.time,
    avatar: getAvatarByType(notification.typeId),
    read: notification.isRead,
    actions: notification.actions,
    // 保存原始数据，用于后续处理
    originalData: notification
  };
  
  // 添加到未读列表
  if (!notification.isRead) {
    notifications.value.unshift(newNotification);
    unreadCount.value++;
  }
  
  // 添加到已读列表
  notifications.value.unshift(newNotification);
  
  // 显示通知提示
  uni.showToast({
    title: '收到新通知',
    icon: 'none'
  });
}

// 根据通知类型获取头像
function getAvatarByType(typeId) {
  const avatarMap = {
    'system_announcement': '/static/avatars/system.png',
    'team_application_received': '/static/avatars/team.png',
    'team_invite': '/static/avatars/team.png',
    'task_application': '/static/avatars/task.png',
    'task_update': '/static/avatars/task.png',
    'badge_application': '/static/avatars/badge.png',
    'friend_request': '/static/avatars/user.png'
  };
  
  return avatarMap[typeId] || '/static/avatars/system.png';
}

// 标记所有为已读
async function markAllAsRead() {
  try {
    loading.value = true;
    
    // 调用API标记所有为已读
    const res = await notificationsApi.markAllAsRead();
    
    if (res.code === 200) {
      // 更新本地状态
  notifications.value.forEach(item => {
    const index = notifications.value.findIndex(n => n.id === item.id);
    if (index !== -1) {
      notifications.value[index].read = true;
    }
  });
  notifications.value = [];
  unreadCount.value = 0;
      
      // 重置App全局未读通知计数
      if (app && app.resetUnreadNotificationCount) {
        app.resetUnreadNotificationCount();
      }
  
  uni.showToast({
    title: '已全部标记为已读',
    icon: 'success'
  });
    } else {
      uni.showToast({
        title: res.message || '操作失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('标记全部已读失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 处理按钮操作
function handleAction(type, id) {
  // 找到对应的通知
  const notification = (activeTab.value === 'notification' ? 
                        notifications.value : 
                        []).find(item => item.id === id);
  if (!notification) return;
  
  // 获取通知的类型ID和相关ID
  const typeId = notification.originalData?.typeId;
  const relatedId = notification.originalData?.relatedId;
  
  // 处理任务状态变更操作
  if (type.startsWith('task_')) {
    const statusMap = {
      'task_ongoing': 'ongoing',
      'task_completed': 'completed',
      'task_ended': 'ended',
      'task_recruiting': 'recruiting',
      'task_cancel': 'canceled'
    };
    
    const status = statusMap[type];
    if (!status || !relatedId) {
      uni.showToast({
        title: '操作失败：缺少必要参数',
        icon: 'none'
      });
      return;
    }
    
    // 如果是取消任务，需要获取取消原因
    if (status === 'canceled') {
      uni.showModal({
        title: '取消任务',
        content: '确定要取消该任务吗？',
        editable: true,
        placeholderText: '请填写取消原因',
        success: async (res) => {
          if (res.confirm && res.content) {
            const apiRes = await updateTaskStatus(relatedId, status, res.content);
            handleTaskStatusUpdateResult(apiRes, id);
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
    
    // 其他状态变更，显示确认对话框
    const statusTextMap = {
      'recruiting': '招募中',
      'ongoing': '进行中',
      'completed': '已完成',
      'ended': '已结束',
      'canceled': '已取消'
    };
    
    uni.showModal({
      title: `更改状态为"${statusTextMap[status] || status}"`,
      content: `确定要将任务状态更改为"${statusTextMap[status] || status}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          const apiRes = await updateTaskStatus(relatedId, status);
          handleTaskStatusUpdateResult(apiRes, id);
        }
      }
    });
    return;
  }
  
  // 处理接受操作
  if (type === 'accept') {
    let title = '接受申请';
    let content = `确定接受此${notification.type}？`;
    
    // 根据通知类型设置不同的提示内容
    if (typeId && typeId.includes('team_application')) {
      title = '接受入队申请';
      content = '确定接受该成员加入队伍吗？';
    } else if (typeId && typeId.includes('task')) {
      title = '接受任务申请';
      content = '确定接受该用户的任务申请吗？';
    }
    
    uni.showModal({
      title: title,
      content: content,
      success: async function(res) {
        if (res.confirm) {
          try {
            loading.value = true;
            
            let apiRes = null;
            
            // 根据通知类型调用不同的API
            if (typeId && typeId.includes('team_application') && relatedId) {
              // 调用队伍申请API
              apiRes = await teamApi.handleApplication(relatedId, {
                status: 'approved',
                reviewNotes: '欢迎加入我们的队伍！'
              });
            } else if (typeId && typeId.includes('task_application') && relatedId) {
              // 调用任务申请API
              apiRes = await taskApplicationsApi.updateTaskApplication(relatedId, {
                status: 'approved',
                reviewNotes: '申请已通过，欢迎参与任务！'
              });
            } else {
              // 通用通知处理
              apiRes = await notificationsApi.handleNotificationAction(id, 'accept', {
                relatedId: notification.originalData?.relatedId,
                relatedType: notification.originalData?.relatedType
              });
            }
            
            if (apiRes && (apiRes.code === 200 || apiRes.status === 200)) {
              // 从未读列表中移除
              removeNotification(id);
              
              uni.showToast({
                title: '已接受',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: (apiRes && apiRes.message) || '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('接受操作失败:', error);
            uni.showToast({
              title: '操作失败，请稍后重试',
              icon: 'none'
            });
          } finally {
            loading.value = false;
          }
        }
      }
    });
  } else if (type === 'reject') {
    let title = '拒绝申请';
    let content = `确定拒绝此${notification.type}？`;
    
    // 根据通知类型设置不同的提示内容
    if (typeId && typeId.includes('team_application')) {
      title = '拒绝入队申请';
      content = '确定拒绝该成员加入队伍吗？';
    } else if (typeId && typeId.includes('task')) {
      title = '拒绝任务申请';
      content = '确定拒绝该用户的任务申请吗？';
    }
    
    uni.showModal({
      title: title,
      content: content,
      success: async function(res) {
        if (res.confirm) {
          try {
            loading.value = true;
            
            let apiRes = null;
            
            // 根据通知类型调用不同的API
            if (typeId && typeId.includes('team_application') && relatedId) {
              // 调用队伍申请API
              apiRes = await teamApi.handleApplication(relatedId, {
                status: 'rejected',
                reviewNotes: '抱歉，当前不符合队伍需求'
              });
            } else if (typeId && typeId.includes('task_application') && relatedId) {
              // 调用任务申请API
              apiRes = await taskApplicationsApi.updateTaskApplication(relatedId, {
                status: 'rejected',
                reviewNotes: '抱歉，当前不符合任务要求'
              });
            } else {
              // 通用通知处理
              apiRes = await notificationsApi.handleNotificationAction(id, 'reject', {
                relatedId: notification.originalData?.relatedId,
                relatedType: notification.originalData?.relatedType
              });
            }
            
            if (apiRes && (apiRes.code === 200 || apiRes.status === 200)) {
              // 从未读列表中移除
              removeNotification(id);
              
              uni.showToast({
                title: '已拒绝',
                icon: 'none'
              });
            } else {
              uni.showToast({
                title: (apiRes && apiRes.message) || '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('拒绝操作失败:', error);
            uni.showToast({
              title: '操作失败，请稍后重试',
              icon: 'none'
            });
          } finally {
            loading.value = false;
          }
        }
      }
    });
  } else if (type === 'view') {
    // 导航到相应页面
    navigateToDetail(notification);
    
    // 从未读列表中移除
    removeNotification(id);
  }
}

// 处理任务状态更新结果
function handleTaskStatusUpdateResult(apiRes, notificationId) {
  if (apiRes && (apiRes.code === 200 || apiRes.status === 200)) {
    // 标记通知为已读
    removeNotification(notificationId);
    
    uni.showToast({
      title: '任务状态已更新',
      icon: 'success'
    });
  } else {
    uni.showToast({
      title: (apiRes && apiRes.message) || '操作失败',
      icon: 'none'
    });
  }
}

// 重要通知类型列表
const importantNotificationTypes = [
  'system_announcement',  // 系统公告
  'team_invite',          // 团队邀请
  'task_application'      // 任务申请
];

// 朗读通知内容
function readNotificationAloud(notification) {
  // 检查是否为重要通知
  if (!notification || !notification.originalData || 
      !importantNotificationTypes.includes(notification.originalData.typeId)) {
    return;
  }
  
  // 获取朗读内容
  const content = `${notification.type}：${notification.message}`;
  
  // 检查朗读API是否可用
  if (window.speechSynthesis) {
    // 创建语音合成实例
    const speech = new SpeechSynthesisUtterance();
    speech.text = content;
    speech.lang = 'zh-CN'; // 中文
    speech.volume = 0.7;    // 音量 0-1
    speech.rate = 1.0;      // 语速 0.1-10
    speech.pitch = 1.0;     // 音调 0-2
    
    // 朗读
    window.speechSynthesis.speak(speech);
  }
}
function goBack() {
  uni.navigateBack();
}
// 根据通知类型导航到相应页面
function navigateToDetail(notification) {
  if (!notification || !notification.originalData) return;
  
  // 标记为已读
  markNotificationAsRead(notification.id);
  
  // 对于重要通知，朗读一次内容
  readNotificationAloud(notification);
  
  const typeId = notification.originalData.typeId;
  const relatedId = notification.originalData.relatedId;
  
  console.log('准备导航，通知类型:', typeId, '关联ID:', relatedId);
  
  // 根据通知类型跳转到不同页面
  if (typeId === 'team_invite' || typeId.includes('team_application')) {
    // 如果是团队申请相关通知，跳转到申请管理页面
    if (typeId === 'team_application_received') {
      // 收到队伍申请，跳转到申请管理页面的待我处理标签页
      console.log('收到队伍申请，正在跳转到待我处理标签页');
      const url = `/pages/application/application?tab=1&type=team&id=${relatedId}`;
      console.log('跳转URL:', url);
      uni.navigateTo({
        url: url,
        success: function() {
          console.log('跳转成功');
        },
        fail: function(err) {
          console.error('跳转失败:', err);
        }
      });
    } else if (typeId === 'team_application_result') {
      // 队伍申请结果，跳转到申请管理页面的我发起的标签页
      uni.navigateTo({
        url: `/pages/application/application?tab=0&type=team&id=${relatedId}`
      });
    } else {
      // 其他团队相关通知，默认跳转到我发起的标签页
      uni.navigateTo({
        url: `/pages/application/application?tab=0&type=team&id=${relatedId}`
      });
    }
  } else if (typeId.includes('task_application') || typeId.includes('task_update')) {
    // 如果是任务申请相关通知，跳转到申请管理页面
    uni.navigateTo({
      url: `/pages/application/application?type=task&id=${relatedId}`
    });
  } else if (typeId === 'system_announcement') {
    // 导航到公告详情页
    uni.navigateTo({
      url: `/pages/notification/detail?id=${notification.id}`
    });
  } else if (typeId === 'badge_application') {
    // 徽章申请，跳转到申请管理页面
    uni.navigateTo({
      url: `/pages/application/application?type=badge&id=${relatedId}`
    });
  } else {
    // 默认导航到申请管理页面
    uni.navigateTo({
      url: `/pages/application/application`
    });
  }
}

// 处理通知查看行为，智能标记已读
function handleNotificationView(notification, index) {
  // 如果通知已读，不做处理
  if (notification.read) return;
  
  // 标记为正在阅读状态
  notification.isReading = true;
  
  // 记录查看开始时间
  notification.viewStartTime = Date.now();
  
  // 创建一个计时器，当用户在通知上停留超过2秒时自动标记为已读
  notification.viewTimer = setTimeout(() => {
    markNotificationAsRead(notification.id);
  }, 2000);
}

// 处理通知离开行为
function handleNotificationLeave(notification) {
  // 取消正在阅读状态
  notification.isReading = false;
  
  // 清除计时器
  if (notification.viewTimer) {
    clearTimeout(notification.viewTimer);
    notification.viewTimer = null;
  }
  
  // 如果通知已读，不做处理
  if (notification.read) return;
  
  // 如果用户查看时间超过1秒，标记为已读
  if (notification.viewStartTime && (Date.now() - notification.viewStartTime > 1000)) {
    markNotificationAsRead(notification.id);
  }
}

// 计算通知是否在可视区域内
function isNotificationVisible(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  
  // 通知完全在可视区域内
  return (
    rect.top >= 0 &&
    rect.bottom <= windowHeight &&
    rect.height > 0
  );
}

// 监听滚动事件，检查可视区域内的通知
function handleScroll() {
  // 如果正在编辑模式，不处理
  if (isEditMode.value) return;
  
  // 获取当前标签页下的通知列表
  const currentNotifications = activeTab.value === 'notification' ? notifications.value : [];
  
  // 获取所有通知元素
  const notificationElements = document.querySelectorAll('.notification-item');
  
  // 检查每个通知是否在可视区域内
  notificationElements.forEach((element, index) => {
    if (index < currentNotifications.length && isNotificationVisible(element)) {
      const notification = currentNotifications[index];
      
      // 如果通知未读且在可视区域内停留时间超过3秒，标记为已读
      if (!notification.read && !notification.scrollTimer) {
        notification.scrollTimer = setTimeout(() => {
          markNotificationAsRead(notification.id);
          notification.scrollTimer = null;
        }, 3000);
      }
    }
  });
}

// 优化标记单个通知为已读的方法
async function markNotificationAsRead(id) {
  // 找到对应的通知
  const notificationIndex = notifications.value.findIndex(item => item.id === id);
  
  // 如果通知不存在或已读，不做处理
  if (notificationIndex === -1 || notifications.value[notificationIndex].read) {
    return;
  }
  
  try {
    // 先在UI上标记为已读，提升响应速度
    notifications.value[notificationIndex].read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    
    // 更新全局未读通知计数
    if (app && app.globalData) {
      app.globalData.unreadNotificationCount = Math.max(0, app.globalData.unreadNotificationCount - 1);
      
      // 更新TabBar角标
      if (app.updateMessageBadge) {
        app.updateMessageBadge();
      }
    }
    
    // 然后异步调用API标记为已读
    await notificationsApi.markAsRead(id);
    
  } catch (error) {
    console.error('标记已读失败:', error);
    // API调用失败时可以考虑回滚UI状态，但为保持体验流畅，此处不回滚
  }
}

// 监听WebSocket连接状态
function monitorWebSocketStatus() {
  // 定时检查WebSocket连接状态
  const statusTimer = setInterval(() => {
    wsConnected.value = websocket.isConnected();
  }, 5000);
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(statusTimer);
  });
}

// 加载通知列表
async function loadNotifications(refresh = false) {
  if (loading.value) return;
  
  try {
    loading.value = true;
    
    if (refresh) {
      pagination.value.current = 1;
      refreshing.value = true;
    }
    
    // 调用API获取通知列表
    const res = await notificationsApi.getNotificationList({
      pageNum: pagination.value.current,
      pageSize: pagination.value.size,
    });
    
    if (res.code === 200 && res.data) {
      // 解析通知数据
      const newNotifications = (res.data.records || []).map(item => {
        return {
          id: item.id,
          type: item.typeName,
          message: item.content || item.title,
          time: formatTime(item.createdAt),
          avatar: getAvatarByType(item.typeId),
          read: item.isRead, // 确保正确映射已读状态
          actions: getActionsForNotification(item),
          originalData: item,
          // 添加UI状态属性
          isReading: false,
          viewStartTime: null,
          viewTimer: null,
          scrollTimer: null
        };
      });
      
      // 更新分页信息
      pagination.value = {
        current: res.data.current,
        size: res.data.size,
        total: res.data.total,
        pages: res.data.pages
      };
      
      // 判断是否还有更多数据
      hasMore.value = pagination.value.current < pagination.value.pages;
      
      if (refresh) {
        // 刷新列表
        notifications.value = newNotifications;
      } else {
        // 加载更多
        notifications.value = [...notifications.value, ...newNotifications];
      }
      
      // 更新未读计数
      if (refresh) {
        // 全量刷新时，可以从另一个接口获取总未读数，或者前端累加（如果分页加载不影响总数）
        // 这里暂时用返回的 total，假设它是未读总数，如果不是，需要后端API支持或前端另行请求
        // 更好的方式是有一个专门的接口获取未读数
        unreadCount.value = notifications.value.filter(n => !n.read).length;
        
        // 同步全局未读通知计数
        if (app && app.globalData) {
          app.globalData.unreadNotificationCount = unreadCount.value;
          
          // 更新TabBar角标
          updateTabBarBadge(unreadCount.value + unreadChatCount.value);
        }
      }
    } else {
      uni.showToast({
        title: res.message || '获取通知失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取通知列表失败:', error);
    uni.showToast({
      title: '获取通知失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

// 安全地更新TabBar徽标，处理非TabBar页面的错误
function updateTabBarBadge(count) {
  if (!app || !app.updateMessageBadge) return;
  
  try {
    // 尝试使用应用内的更新方法
    app.updateMessageBadge();
  } catch (error) {
    // 如果应用内方法失败，使用更安全的替代方法
    try {
      if (count > 0) {
        uni.setTabBarBadge({
          index: 4, // 消息页面的TabBar索引，根据实际情况调整
          text: count.toString()
        }).catch(err => {
          console.log('设置TabBar徽标失败，可能不在TabBar页面', err);
          // 不抛出错误，静默失败
        });
      } else {
        uni.removeTabBarBadge({
          index: 4
        }).catch(err => {
          console.log('移除TabBar徽标失败，可能不在TabBar页面', err);
          // 不抛出错误，静默失败
        });
      }
    } catch (e) {
      console.log('TabBar操作失败，可能不在TabBar页面');
      // 不抛出错误，静默失败
    }
  }
}

// 检查通知是否是已处理的申请
function isProcessedApplication(notification) {
  if (!notification) return false;
  
  // 检查通知类型ID
  if (notification.typeId) {
    if (notification.typeId.includes('approved') || 
        notification.typeId.includes('rejected') ||
        notification.typeId.includes('result') ||
        notification.typeId.includes('processed')) {
      return true;
    }
  }
  
  // 检查原始数据中的处理状态
  if (notification.originalData) {
    if (notification.originalData.isProcessed || 
        notification.originalData.status === 'approved' ||
        notification.originalData.status === 'rejected' ||
        notification.originalData.status === 'canceled') {
      return true;
    }
  }
  
  // 检查消息内容
  if (notification.message) {
    const processedKeywords = ['已批准', '已接受', '已拒绝', '已处理', '已取消', 
                              '已同意', '已完成', '已结束', '批准了', '拒绝了'];
    
    for (const keyword of processedKeywords) {
      if (notification.message.includes(keyword)) {
        return true;
      }
    }
  }
  
  return false;
}

// 检查当前用户是否为通知相关实体的创建者/管理者
function isCreatorOrManager(notification) {
  if (!notification || !notification.originalData) return false;
  
  return notification.originalData.isCreator || 
         notification.originalData.isManager || 
         notification.originalData.role === 'leader' ||
         notification.originalData.role === 'creator' ||
         notification.originalData.role === 'admin';
}

// 根据通知信息获取操作按钮
function getActionsForNotification(notification) {
  // 如果通知表示已处理的申请，只显示查看按钮
  if (isProcessedApplication(notification)) {
    return [{ name: '查看', type: 'view', primary: true }];
  }
  
  // 团队申请相关
  if (notification.typeId && notification.typeId.includes('team_application') && !notification.isRead) {
    // 作为申请者，已发出的申请只显示查看按钮
    if (notification.typeId.includes('sent') || 
        (notification.originalData && notification.originalData.role === 'applicant') ||
        !isCreatorOrManager(notification)) {
      return [{ name: '查看', type: 'view', primary: true }];
    }
    
    // 作为队长，收到的申请显示接受和拒绝按钮
    return [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ];
  } 
  // 队伍邀请相关
  else if (notification.typeId === 'team_invite' && !notification.isRead) {
    // 如果是队长发出的邀请，只显示查看按钮
    if (notification.originalData && notification.originalData.role === 'leader') {
      return [{ name: '查看', type: 'view', primary: true }];
    }
    
    // 收到的邀请显示接受和拒绝按钮
    return [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ];
  } 
  // 任务申请相关
  else if (notification.typeId && notification.typeId.includes('task_application') && !notification.isRead) {
    // 除非作为任务发布者收到的申请，其他情况只显示查看按钮
    if (!notification.typeId.includes('received') || 
        !isCreatorOrManager(notification) ||
        (notification.originalData && notification.originalData.role === 'applicant')) {
      return [{ name: '查看', type: 'view', primary: true }];
    }
    
    // 作为任务发布者，收到的申请显示接受和拒绝按钮
    return [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ];
  }
  // 任务状态更新通知（对于任务创建者给出更多操作选项）
  else if (notification.typeId && notification.typeId.includes('task_update') && 
           isCreatorOrManager(notification) && !notification.isRead) {
    const currentStatus = notification.originalData?.taskStatus;
    
    // 根据当前任务状态提供不同的操作选项
    if (currentStatus === 'recruiting') {
      return [
        { name: '开始进行', type: 'task_ongoing', primary: true },
        { name: '取消任务', type: 'task_cancel', primary: false },
        { name: '查看详情', type: 'view', primary: false }
      ];
    } else if (currentStatus === 'ongoing') {
      return [
        { name: '标记完成', type: 'task_completed', primary: true },
        { name: '结束任务', type: 'task_ended', primary: false },
        { name: '查看详情', type: 'view', primary: false }
      ];
    } else {
      return [{ name: '查看详情', type: 'view', primary: true }];
    }
  }
  // 默认情况下只提供查看选项
  else {
    return [{ name: '查看', type: 'view', primary: true }];
  }
}

// 格式化时间
function formatTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60 * 1000) {
      return '刚刚';
    }
    // 小于1小时
    else if (diff < 60 * 60 * 1000) {
      return Math.floor(diff / (60 * 1000)) + '分钟前';
    }
    // 小于24小时
    else if (diff < 24 * 60 * 60 * 1000) {
      return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
    }
    // 小于30天
    else if (diff < 30 * 24 * 60 * 60 * 1000) {
      return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
    }
    else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error('格式化时间错误', e);
    return dateStr;
  }
}

// 切换标签页
function switchTab(tab) {
  if (activeTab.value === tab) return;
  
  activeTab.value = tab;
  
  // 清空选择
  selectedItems.value = [];
  isEditMode.value = false;
  
  if (tab === 'notification') {
    loadNotifications(true);
  } else if (tab === 'message') {
    getChatMessage();
  }
}

// 下拉刷新
function onRefresh() {
  if (activeTab.value === 'notification') {
    loadNotifications(true);
  } else {
    getChatMessage();
  }
}

// 加载更多
function loadMore() {
  if (loading.value || !hasMore.value || activeTab.value !== 'notification') return;
  
  pagination.value.current++;
  loadNotifications(false);
}

// 添加批量删除通知功能
async function batchDeleteNotifications(ids) {
  if (!ids || ids.length === 0) return;
  
  try {
    loading.value = true;
    
    // 调用API批量删除通知
    const res = await notificationsApi.batchDeleteNotifications(ids);
    
    if (res.code === 200) {
      // 从列表中移除已删除的通知
      const newNotifications = notifications.value.filter(item => !ids.includes(item.id));
      const deletedUnreadCount = notifications.value
        .filter(item => ids.includes(item.id) && !item.read)
        .length;
      notifications.value = newNotifications;
      unreadCount.value -= deletedUnreadCount;
      selectedItems.value = [];

      // 更新全局未读通知计数
      if (app && app.globalData) {
        app.globalData.unreadNotificationCount = unreadCount.value;
        
        // 更新TabBar角标
        if (app.updateMessageBadge) {
          app.updateMessageBadge();
        }
      }
      
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: res.message || '删除失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('批量删除通知失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 组件挂载时
onMounted(() => {
  // 加载通知列表
  if (activeTab.value === 'notification') {
    loadNotifications(true);
  }
  getChatMessage();
  
  // 监听WebSocket连接状态
  monitorWebSocketStatus();
  
  // 添加滚动事件监听
  const scrollView = document.querySelector('.notification-list');
  if (scrollView) {
    scrollView.addEventListener('scroll', handleScroll);
  }
  
  // 监听全局新通知
  listenForNewNotifications();
  
  console.log('通知页面加载完成');
});

// 监听全局新通知
function listenForNewNotifications() {
  // 注册全局通知监听器
  uni.$on('newNotification', (notification) => {
    console.log('消息页面接收到新通知:', notification);
    
    // 将新通知添加到界面
    addNewNotificationToUI(notification);
  });
}

// 将新通知添加到UI
function addNewNotificationToUI(notification) {
  if (!notification) return;
  
  // 检查是否已存在相同ID的通知，避免重复
  const existingIndex = notifications.value.findIndex(item => item.id === notification.id);
  if (existingIndex !== -1) {
    return; // 已存在，不处理
  }

  // 创建UI显示用的通知对象
  const newNotification = {
    id: notification.id,
    type: notification.typeName,
    message: notification.content || notification.title,
    time: notification.time || formatTime(notification.createdAt || new Date()),
    avatar: getAvatarByType(notification.typeId),
    read: notification.isRead || false,
    actions: notification.actions || getActionsForNotification(notification),
    // 保存原始数据，用于后续处理
    originalData: notification,
    // UI状态属性
    isReading: false,
    viewStartTime: null,
    viewTimer: null,
    scrollTimer: null
  };
  
  // 添加到列表顶部
  notifications.value.unshift(newNotification);
  
  if (!newNotification.read) {
    unreadCount.value++;
  }
  
  // 播放通知提示音
  playNotificationSound();
}

// 播放通知提示音
function playNotificationSound() {
  try {
    const audio = uni.createInnerAudioContext();
    audio.src = '/static/sounds/notification.wav'; // 确保有这个音频文件
    audio.play();
  } catch (error) {
    console.log('播放通知提示音失败', error);
  }
}

// 组件卸载时
onUnmounted(() => {
  // 不需要在这里关闭通知服务，因为它在App全局维护
  
  // 移除滚动事件监听
  const scrollView = document.querySelector('.notification-list');
  if (scrollView) {
    scrollView.removeEventListener('scroll', handleScroll);
  }
  
  // 清除所有计时器
  notifications.value.forEach(notification => {
    if (notification.viewTimer) clearTimeout(notification.viewTimer);
    if (notification.scrollTimer) clearTimeout(notification.scrollTimer);
  });
  
  // 移除全局通知事件监听
  uni.$off('newNotification');
});

// 从通知列表中移除通知
function removeNotification(id) {
  if (!id) return;
  
  // 标记为已读
  const notificationIndex = notifications.value.findIndex(item => item.id === id);
  if (notificationIndex !== -1 && !notifications.value[notificationIndex].read) {
    notifications.value[notificationIndex].read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    
    // 更新全局未读通知计数
    if (app && app.globalData) {
      app.globalData.unreadNotificationCount = Math.max(0, app.globalData.unreadNotificationCount - 1);
      
      // 更新TabBar角标
      if (app.updateMessageBadge) {
        app.updateMessageBadge();
      }
    }
  }
}

// 更新任务状态
async function updateTaskStatus(taskId, status, cancelReason = '') {
  if (!taskId) return null;
  
  try {
    const data = {
      status: status
    };
    
    // 如果是取消状态，添加取消原因
    if (status === 'canceled' && cancelReason) {
      data.cancelReason = cancelReason;
    }
    
    // 调用API更新任务状态
    const response = await tasksApi.updateTaskStatus(taskId, data);
    return response;
  } catch (error) {
    console.error('更新任务状态失败:', error);
    return null;
  }
}

function getPeerAvatar(item) {
  // 这里假设你有 userInfoMap 或接口返回了头像
  // 没有就返回默认头像
  return item.peerAvatar || '/static/image/default-avatar.png';
}

function getPeerNickname(item) {
  return item.peerNickname || getPeerUserId(item);
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

.header {
  background-color: #fff;
  position: relative;
  z-index: 10;
  
  .navbar {
    display: flex;
    align-items: center;

    height: 100rpx;
    padding: 0 30rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
    }
    
    .actions {
      display: flex;
      align-items: center;
      gap: 60rpx;
      margin-left: 180rpx;
      .mark-read, .edit-btn {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: $primary-color;
      
      .iconfont {
        margin-right: 8rpx;
        font-size: 32rpx;
        }
      }
      
      .edit-actions {
        display: flex;
        align-items: center;
        gap: 20rpx;
        
        .cancel-btn, .delete-btn {
          display: flex;
          align-items: center;
          font-size: 28rpx;
          color: $primary-color;
          
          .iconfont {
            margin-right: 8rpx;
            font-size: 32rpx;
          }
        }
      }
    }
  }
}

.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 2rpx solid $border-color;
  position: relative;
  z-index: 9;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    position: relative;
    color: $text-secondary;
    font-size: 30rpx;
    
    .badge {
      display: inline-block;
      background-color: $accent-color;
      color: #fff;
      border-radius: 20rpx;
      font-size: 22rpx;
      padding: 2rpx 12rpx;
      margin-left: 8rpx;
      min-width: 16rpx;
      text-align: center;
    }
  }
  
  .tab-active {
    color: $primary-color;
    font-weight: bold;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: $primary-color;
      border-radius: 2rpx;
    }
  }
}

.notification-list {
  flex: 1;
  background-color: $bg-color;
}

.notification-item {
  display: flex;
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 2rpx;
  position: relative;
  transition: background-color 0.3s ease;
  
  &.item-selected {
    background-color: rgba($primary-color, 0.05);
  }
  
  // 未读通知样式
  &.unread {
    border-left: 6rpx solid $primary-color;
    background-color: rgba($primary-color, 0.03);
    
    .notification-type {
      font-weight: bold;
    }
    
    .notification-message {
      font-weight: 500;
    }
  }
  
  // 已读通知样式
  &.read {
    border-left: 6rpx solid transparent;
    opacity: 0.8;
    
    .notification-type {
      font-weight: normal;
    }
    
    .notification-message {
      font-weight: normal;
    }
  }
  
  // 正在阅读的通知样式（鼠标悬停或触摸）
  &.reading {
    background-color: rgba($primary-color, 0.05);
  }
  
  // 已处理的申请通知样式
  &.processed {
    .notification-type:after {
      content: '(已处理)';
      font-size: 24rpx;
      color: $secondary-color;
      margin-left: 8rpx;
      font-weight: normal;
    }
    
    &.unread {
      border-left-color: $secondary-color;
      background-color: rgba($secondary-color, 0.03);
    }
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 30rpx;
    right: 30rpx;
    height: 2rpx;
    background-color: $border-color;
  }
  
  .select-box {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10rpx;
    
    .checkbox {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid $primary-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.checked {
        background-color: $primary-color;
        
        .iconfont {
          color: #fff;
          font-size: 24rpx;
        }
      }
    }
  }
  
  .notification-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    overflow: hidden;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .notification-content {
    flex: 1;
    
    .notification-type {
      font-size: 30rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .notification-message {
      font-size: 28rpx;
      color: $text-secondary;
      line-height: 1.4;
      margin-bottom: 12rpx;
    }
    
    .notification-time {
      font-size: 24rpx;
      color: $text-light;
      margin-bottom: 16rpx;
    }
    
    .notification-actions {
      display: flex;
      gap: 20rpx;
      
      .action-btn {
        padding: 10rpx 24rpx;
        font-size: 26rpx;
        border-radius: 8rpx;
        background-color: #f0f0f0;
        color: $text-secondary;
        line-height: 1.5;
        min-width: 120rpx;
        text-align: center;
      }
      
      .btn-primary {
        background-color: $primary-color;
        color: #fff;
      }
      
      .btn-default {
        background-color: #f0f0f0;
        color: $text-secondary;
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
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: $text-light;
  }
}

/* WebSocket状态指示器 */
.ws-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 30rpx 10rpx;
  font-size: 22rpx;
  color: $accent-color;
  
  &.connected {
    color: $secondary-color;
  }
  
  .ws-status-text {
    margin-right: 10rpx;
  }
  
  .ws-indicator {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: $accent-color;
    
    .connected & {
      background-color: $secondary-color;
    }
  }
}

/* 加载更多和无更多数据 */
.loading-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: $text-light;
}

/* 底部批量操作栏 */
.bottom-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .select-all {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 28rpx;
    color: $primary-color;
    
    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid $primary-color;
      border-radius: 4rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.checked {
        background-color: $primary-color;
      }
    }
  }
  
  .batch-delete {
    padding: 10rpx 24rpx;
    font-size: 26rpx;
    border-radius: 8rpx;
    background-color: $primary-color;
    color: #fff;
    min-width: 120rpx;
    text-align: center;
    
    &.disabled {
      background-color: #f0f0f0;
      color: $text-secondary;
    }
  }
}


//未读Chat消息列表样式
.chat-list {
  padding: 20rpx;
}
.chat-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #eee;
  margin-right: 24rpx;
}
.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.chat-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.chat-last-msg {
  font-size: 28rpx;
  color: #666;
  margin-top: 8rpx;
}
.unread-badge {
  min-width: 36rpx;
  height: 36rpx;
  background: #e74c3c;
  color: #fff;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  position: absolute;
  right: 0;
  top: 70%;
  transform: translateY(-50%);
  padding: 0 10rpx;
}
.time {
  font-size: 24rpx;
  color: #999;
}
</style>