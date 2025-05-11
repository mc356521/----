/**
 * 通知API模块
 * 用于管理通知相关的接口请求
 */
import request from '@/utils/request';

/**
 * 获取通知列表
 * @param {Object} params 查询参数
 * @param {Number} params.pageNum 页码
 * @param {Number} params.pageSize 每页条数
 * @param {Boolean} params.onlyUnread 是否只查询未读通知
 * @returns {Promise} 请求Promise
 */
function getNotificationList(params = {}) {
  return request({
    url: '/notifications',
    method: 'GET',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      onlyUnread: params.onlyUnread || false
    }
  });
}

/**
 * 获取未读通知数量
 * @returns {Promise} 请求Promise
 */
function getUnreadCount() {
  return request({
    url: '/notifications/unread/count',
    method: 'GET'
  });
}

/**
 * 标记通知为已读
 * @param {Number|String} notificationId 通知ID
 * @returns {Promise} 请求Promise
 */
function markAsRead(notificationId) {
  return request({
    url: `/notifications/${notificationId}/read`,
    method: 'PUT'
  });
}

/**
 * 标记所有通知为已读
 * @returns {Promise} 请求Promise
 */
function markAllAsRead() {
  return request({
    url: '/notifications/read/all',
    method: 'PUT'
  });
}

/**
 * 删除通知
 * @param {Number|String} notificationId 通知ID
 * @returns {Promise} 请求Promise
 */
function deleteNotification(notificationId) {
  return request({
    url: `/notifications/${notificationId}`,
    method: 'DELETE'
  });
}

/**
 * 批量删除通知
 * @param {Array<Number|String>} ids 通知ID列表
 * @returns {Promise} 请求Promise
 */
function batchDeleteNotifications(ids) {
  return request({
    url: '/notifications/batch',
    method: 'DELETE',
    data: ids
  });
}

/**
 * 处理通知相关操作
 * @param {Number|String} notificationId 通知ID
 * @param {String} action 操作类型：accept/reject
 * @param {Object} data 附加数据
 * @returns {Promise} 请求Promise
 */
function handleNotificationAction(notificationId, action, data = {}) {
  return request({
    url: `/notifications/${notificationId}/action`,
    method: 'POST',
    data: {
      action,
      ...data
    }
  });
}

export default {
  getNotificationList,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  batchDeleteNotifications,
  handleNotificationAction
}; 