/**
 * 团队角色管理相关API
 */
import request from '@/utils/request';

/**
 * 获取团队的角色列表
 * @param {number} teamId - 团队ID
 * @returns {Promise} - 请求Promise
 */
const getTeamRoles = (teamId) => {
  return request({
    url: `/teamRoles/team/${teamId}`,
    method: 'GET'
  });
};

/**
 * 获取角色详情
 * @param {number} roleId - 角色ID
 * @returns {Promise} - 请求Promise
 */
const getRoleDetail = (roleId) => {
  return request({
    url: `/teamRoles/${roleId}`,
    method: 'GET'
  });
};

/**
 * 创建团队角色
 * @param {Object} roleData - 角色数据
 * @returns {Promise} - 请求Promise
 */
const createTeamRole = (roleData) => {
  return request({
    url: '/teamRoles',
    method: 'POST',
    data: roleData
  });
};

/**
 * 更新团队角色
 * @param {Object} roleData - 角色数据（包含id字段）
 * @returns {Promise} - 请求Promise
 */
const updateTeamRole = (roleData) => {
  return request({
    url: '/teamRoles',
    method: 'PUT',
    data: roleData
  });
};

/**
 * 删除团队角色
 * @param {number} roleId - 角色ID
 * @returns {Promise} - 请求Promise
 */
const deleteTeamRole = (roleId) => {
  return request({
    url: `/teamRoles/${roleId}`,
    method: 'DELETE'
  });
};

export default {
  getTeamRoles,
  getRoleDetail,
  createTeamRole,
  updateTeamRole,
  deleteTeamRole
}; 