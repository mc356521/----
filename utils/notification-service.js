/**
 * 通知服务工具类
 * 用于处理WebSocket接收到的通知，并提供通知管理功能
 */
import websocket from './websocket';
import { getToken } from './request';
import notificationsApi from '@/api/modules/notifications';

// 通知类型映射表
const notificationTypes = {
  'system_announcement': '系统公告',
  'team_invite': '团队邀请',
  'team_application_received': '收到队伍申请',
  'team_application_result': '队伍申请结果',
  'task_application': '任务申请',
  'task_update': '任务更新',
  'team_application': '队伍申请',
  'badge_application': '徽章申请'
};

// 通知回调函数
let notificationCallback = null;

/**
 * 初始化WebSocket通知服务
 * @param {Function} callback 接收到新通知时的回调函数
 * @returns {Boolean} 是否成功初始化
 */
function initNotificationService(callback) {
  // 保存回调函数
  if (typeof callback === 'function') {
    notificationCallback = callback;
  }
  
  // 获取当前token
  const token = getToken();
  if (!token) {
    console.warn('通知服务初始化失败: 用户未登录或无效的token');
    // 没有token不初始化WebSocket，重定向到登录页面
    setTimeout(() => {
      try {
        const pages = getCurrentPages();
        // 如果当前不在登录页面，才跳转
        if (pages.length === 0 || !pages[pages.length - 1].route.includes('login')) {
          console.log('无效的登录状态，准备跳转到登录页面');
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      } catch (e) {
        console.error('跳转到登录页面失败:', e);
      }
    }, 500);
    return false;
  }
  
  // 设置WebSocket回调
  websocket.onOpen((res) => {
    console.log('通知服务: WebSocket连接已打开', res);
    
    // 发送认证消息
    const token = getToken();
    if (token) {
      console.log('通知服务: 发送认证消息');
      websocket.send({
        type: 'auth',
        token: token
      });
    } else {
      console.warn('通知服务: 无法发送认证消息，token不存在');
    }
  });
  
  websocket.onMessage((data) => {
    console.log('通知服务: 收到WebSocket消息', data);
    
    try {
      // 尝试解析消息数据
      let message;
      if (typeof data === 'string') {
        message = JSON.parse(data);
      } else {
        message = data;
      }
      
      // 处理消息通知
      if (message.typeId || message.type) {
        const notification = parseNotification(message);
        
        // 调用回调函数
        if (notificationCallback) {
          notificationCallback(notification);
        }
      }
    } catch (e) {
      console.error('通知服务: 解析WebSocket消息失败', e);
    }
  });
  
  websocket.onClose((res) => {
    console.log('通知服务: WebSocket连接已关闭', res);
  });
  
  websocket.onError((err) => {
    console.error('通知服务: WebSocket连接错误', err);
  });
  
  // 初始化WebSocket配置
  websocket.initConfig({
    debug: true,
    autoReconnect: true,
    heartbeat: true,
    token: token // 直接在配置中设置token
  });
  
  // 连接WebSocket
  const socketTask = websocket.connect(token);
  
  // 返回初始化成功
  return !!socketTask;
}

/**
 * 解析通知数据
 * @param {Object} message WebSocket消息数据
 * @returns {Object} 格式化后的通知对象
 */
function parseNotification(message) {
  // 创建通知对象
  return {
    id: message.id || Date.now(), // 如果没有id，使用时间戳
    userId: message.userId,
    title: message.title || '',
    content: message.content || '',
    typeId: message.typeId || message.type || 'system_announcement',
    typeName: getNotificationType(message.typeId || message.type),
    category: message.category || null,
    isRead: message.isRead || false,
    createdAt: message.createdAt || new Date().toISOString(),
    relatedId: message.relatedId || null,
    relatedType: message.relatedType || null,
    dynamicData: message.dynamicData || null,
    priority: message.priority || 0,
    expireAt: message.expireAt || null,
    // UI展示用属性
    time: formatTime(message.createdAt || new Date()),
    avatar: getAvatarByType(message.typeId || message.type),
    actions: getActionsForType(message.typeId || message.type, message.relatedType, message.relatedId)
  };
}

/**
 * 根据通知类型获取头像
 * @param {String} typeId 通知类型ID
 * @returns {String} 头像URL
 */
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

/**
 * 根据通知类型返回对应的显示名称
 * @param {String} typeId 通知类型ID
 * @returns {String} 通知类型显示名称
 */
function getNotificationType(typeId) {
  return notificationTypes[typeId] || '系统通知';
}

/**
 * 根据通知类型返回对应的操作按钮
 * @param {String} typeId 通知类型ID
 * @param {String} relatedType 关联类型
 * @param {Number} relatedId 关联ID
 * @returns {Array} 操作按钮列表
 */
function getActionsForType(typeId, relatedType, relatedId) {
  if (typeId === 'system_announcement') {
    return [{ name: '查看', type: 'view', primary: true }];
  } else if (typeId === 'team_invite') {
    return [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ];
  } else if (typeId === 'team_application_received') {
    return [
      { name: '接受', type: 'accept', primary: true },
      { name: '拒绝', type: 'reject', primary: false }
    ];
  } else if (typeId.includes('task_application') || typeId.includes('team_application') || typeId.includes('badge_application')) {
    return [{ name: '查看', type: 'view', primary: true }];
  }
  
  return [{ name: '查看', type: 'view', primary: true }];
}

/**
 * 格式化时间为友好显示
 * @param {String|Date} dateStr 时间字符串或Date对象
 * @returns {String} 格式化后的时间字符串
 */
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

/**
 * 关闭通知服务
 */
function closeNotificationService() {
  websocket.close();
}

/**
 * 标记通知为已读
 * @param {Number|String} notificationId 通知ID
 */
async function markAsRead(notificationId) {
  if (!notificationId) return;
  
  try {
    // 调用API标记为已读
    await notificationsApi.markAsRead(notificationId);
    
    // 发送已读状态到WebSocket服务器
    websocket.send({
      type: 'notification_read',
      notificationId: notificationId
    });
    
    return true;
  } catch (error) {
    console.error('标记通知已读失败:', error);
    return false;
  }
}

/**
 * 标记所有通知为已读
 */
async function markAllAsRead() {
  try {
    // 调用API标记所有为已读
    await notificationsApi.markAllAsRead();
    
    // 发送全部已读状态到WebSocket服务器
    websocket.send({
      type: 'notification_read_all'
    });
    
    return true;
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    return false;
  }
}

/**
 * 获取未读通知数量
 * @returns {Promise<Number>} 未读通知数量
 */
async function getUnreadCount() {
  try {
    const res = await notificationsApi.getUnreadCount();
    if (res.code === 200 && res.data !== undefined) {
      return res.data;
    }
    return 0;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    return 0;
  }
}

export default {
  initNotificationService,
  closeNotificationService,
  markAsRead,
  markAllAsRead,
  parseNotification,
  formatTime,
  getNotificationType,
  getUnreadCount,
  getAvatarByType,
  getActionsForType
}; 