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
 * 获取任务参与者列表
 * @param {Number} taskId - 任务ID
 * @param {Object} params - 查询参数，包括pageNum(页码)、pageSize(每页数量)、status(参与状态，可选)
 * @returns {Promise} 返回请求结果
 */
export function getTaskParticipants(taskId, params) {
  return request({
    url: `${baseApiUrl}/tasks/${taskId}/participants`,
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

/**
 * 获取我创建的任务列表
 * @param {Object} params - 查询参数，包括pageNum(页码)、pageSize(每页数量)、status(任务状态，可选)
 * @returns {Promise} 返回请求结果
 */
export function getMyCreatedTasks(params) {
  return request({
    url: `${baseApiUrl}/tasks/my/created`,
    method: 'GET',
    params
  });
}

/**
 * 获取我参与的任务列表
 * @param {Object} params - 查询参数，包括pageNum(页码)、pageSize(每页数量)、status(任务状态，可选)
 * @returns {Promise} 返回请求结果
 */
export function getMyParticipatedTasks(params) {
  return request({
    url: `${baseApiUrl}/tasks/my/participated`,
    method: 'GET',
    params
  });
}

/**
 * 移除任务参与者
 * @param {Number} taskId - 任务ID
 * @param {Number} participantId - 参与者用户ID 
 * @returns {Promise} 返回请求结果
 */
export function removeTaskParticipant(taskId, participantId) {
  return request({
    url: `${baseApiUrl}/tasks/${taskId}/participants/${participantId}`,
    method: 'DELETE'
  });
}

/**
 * 更新任务参与记录的状态
 * @param {Number} participationId - 参与记录ID
 * @param {Object} data - 包含status(状态)和reason(可选理由)
 * @param {Number} taskId - 任务ID
 * @returns {Promise} 返回请求结果
 * 
 * status可能的值:
 * - 'in_progress': 进行中
 * - 'completed': 已完成
 * - 'left': 已离开
 */
export function updateParticipationStatus(participationId, data, taskId) {
  // 确保数据对象中包含taskId
  const requestData = {
    ...data,
    taskId: taskId
  };
  
  return request({
    url: `${baseApiUrl}/tasks/my/participation/record/${participationId}/status`,
    method: 'PUT',
    data: requestData
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
  getRewardTypes,
  getMyCreatedTasks,
  getMyParticipatedTasks,
  getTaskParticipants,
  removeTaskParticipant,
  updateParticipationStatus
};
