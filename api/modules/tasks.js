import request from '@/utils/request';
import config from '@/config/env/dev';

// 基础API路径
const baseApiUrl = config.baseUrl;

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回请求结果
 */
export function getTaskList(params) {
  return request({
    url: `${baseApiUrl}/tasks/list`,
    method: 'GET',
    params
  });
}

/**
 * 获取任务详情
 * @param {Number} id - 任务ID
 * @returns {Promise} 返回请求结果
 */
export function getTaskDetail(id) {
  return request({
    url: `${baseApiUrl}/tasks/${id}`,
    method: 'GET'
  });
}

/**
 * 创建任务
 * @param {Object} data - 任务数据
 * @returns {Promise} 返回请求结果
 */
export function createTask(data) {
  return request({
    url: `${baseApiUrl}/tasks`,
    method: 'POST',
    data
  });
}

/**
 * 更新任务
 * @param {Number} id - 任务ID
 * @param {Object} data - 任务数据
 * @returns {Promise} 返回请求结果
 */
export function updateTask(id, data) {
  return request({
    url: `${baseApiUrl}/tasks/${id}`,
    method: 'PUT',
    data
  });
}

/**
 * 更新任务状态
 * @param {Number} id - 任务ID
 * @param {Object} data - 包含status和可选的cancelReason
 * @returns {Promise} 返回请求结果
 * 
 * status可能的值:
 * - 'recruiting': 招募中
 * - 'ongoing': 进行中
 * - 'ended': 已结束
 * - 'completed': 已完成
 * - 'canceled': 已取消（需要提供cancelReason）
 */
export function updateTaskStatus(id, data) {
  return request({
    url: `${baseApiUrl}/tasks/${id}/status`,
    method: 'PUT',
    data
  });
}

/**
 * 删除任务
 * @param {Number} id - 任务ID
 * @returns {Promise} 返回请求结果
 */
export function deleteTask(id) {
  return request({
    url: `${baseApiUrl}/tasks/${id}`,
    method: 'DELETE'
  });
}

/**
 * 收藏/取消收藏任务
 * @param {Number} id - 任务ID
 * @param {Boolean} isFavorite - 是否收藏
 * @returns {Promise} 返回请求结果
 */
export function toggleFavoriteTask(id, isFavorite) {
  return request({
    url: `${baseApiUrl}/tasks/${id}/favorite`,
    method: isFavorite ? 'POST' : 'DELETE'
  });
}

/**
 * 申请任务
 * @param {Number} id - 任务ID
 * @returns {Promise} 返回请求结果
 */
export function applyTask(id) {
  return request({
    url: `${baseApiUrl}/tasks/${id}/apply`,
    method: 'POST'
  });
}

/**
 * 获取任务分类列表
 * @returns {Promise} 返回请求结果
 */
export function getTaskCategories() {
  return request({
    url: `${baseApiUrl}/taskCategories`,
    method: 'GET'
  });
}

/**
 * 获取奖励类型列表
 * @returns {Promise} 返回请求结果
 */
export function getRewardTypes() {
  return request({
    url: `${baseApiUrl}/rewardTypes`,
    method: 'GET'
  });
}

export default {
  getTaskList,
  getTaskDetail,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  toggleFavoriteTask,
  applyTask,
  getTaskCategories,
  getRewardTypes
};
