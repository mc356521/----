import request from '@/utils/request';
import config from '@/config/env/dev';

// 基础API路径
const baseApiUrl = config.baseUrl;

/**
 * 创建任务申请
 * @param {Object} data - 包含taskId、message和status的对象
 * @returns {Promise} 返回请求结果
 */
export function createTaskApplication(data) {
  return request({
    url: `${baseApiUrl}/task-applications`,
    method: 'POST',
    data
  });
}

/**
 * 获取任务申请列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回请求结果
 * 
 * 查询参数示例:
 * {
 *   role: 'applicant', // 'applicant'(默认) 或 'creator'
 *   status: 'pending', // 可选: 'pending', 'approved', 'rejected', 'canceled'
 *   taskId: 123, // 可选: 按任务ID筛选
 *   pageNum: 1, // 页码，默认1
 *   pageSize: 10 // 每页数量，默认10
 * }
 */
export function getTaskApplicationList(params) {
  return request({
    url: `${baseApiUrl}/task-applications/list`,
    method: 'GET',
    params
  });
}

/**
 * 处理申请（批准/拒绝/取消）
 * @param {Number} id - 申请ID
 * @param {Object} data - 处理数据，包含status和reviewNotes
 * @returns {Promise} 返回请求结果
 * 
 * status可能的值:
 * - 'approved': 批准申请
 * - 'rejected': 拒绝申请
 * - 'canceled': 取消申请
 */
export function updateTaskApplication(id, data) {
  return request({
    url: `${baseApiUrl}/task-applications/${id}`,
    method: 'PUT',
    data
  });
}

/**
 * 取消任务申请
 * @param {Number} id - 任务申请ID
 * @returns {Promise} 返回请求结果
 */
export function cancelTaskApplication(id) {
  return request({
    url: `${baseApiUrl}/task-applications/${id}`,
    method: 'DELETE'
  });
}

/**
 * 检查用户是否已申请任务
 * @param {Number} taskId - 任务ID
 * @returns {Promise} 返回请求结果，包含是否已申请的信息
 */
export function checkTaskApplication(taskId) {
  return request({
    url: `${baseApiUrl}/task-participations/check`,
    method: 'GET',
    params: { taskId }
  });
}

/**
 * 获取申请详情
 * @param {Number} id - 申请ID
 * @returns {Promise} 返回请求结果
 */
export function getTaskApplicationDetail(id) {
  return request({
    url: `${baseApiUrl}/task-applications/${id}`,
    method: 'GET'
  });
}

export default {
  createTaskApplication,
  getTaskApplicationList,
  updateTaskApplication,
  cancelTaskApplication,
  checkTaskApplication,
  getTaskApplicationDetail
}; 