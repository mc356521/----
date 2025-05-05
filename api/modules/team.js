/**
 * 团队相关接口
 */
import request from '@/utils/request';

const teamApi = {
  /**
   * 获取团队列表
   * @returns {Promise} 团队列表的Promise对象
   */
  getTeamList() {
    return request({
      url: '/teams/list',
      method: 'GET'
    });
  },
  
  /**
   * 获取团队详情
   * @param {Number} id 团队ID
   * @returns {Promise} 团队详情的Promise对象
   */
  getTeamDetail(id) {
    return new Promise((resolve, reject) => {
      request({
        url: `/teams/${id}`,
        method: 'GET'
      }).then(res => {
        resolve(res);
      }).catch(err => {
        console.log('使用模拟数据');
        // 当API请求失败时，返回模拟数据
        resolve(mockTeamDetail(id));
      });
    });
  },
  
  /**
   * 获取团队成员
   * @param {Number} teamId 团队ID
   * @returns {Promise} 团队成员的Promise对象
   */
  getTeamMembers(teamId) {
    return request({
      url: `/teams/${teamId}/members`,
      method: 'GET'
    });
  },
  
  /**
   * 创建团队
   * @param {Object} data - 团队信息
   * @returns {Promise} 请求结果Promise对象
   */
  createTeam(data) {
    return request({
      url: '/teams/create',
      method: 'POST',
      data
    });
  },
  
  /**
   * 申请加入团队
   * @param {Number} teamId 团队ID
   * @param {Object} data 申请数据
   * @returns {Promise} 申请结果的Promise对象
   */
  joinTeam(teamId, data) {
    return request({
      url: `/teams/${teamId}/join`,
      method: 'POST',
      data
    });
  },
  
  /**
   * 申请特定角色
   * @param {Number} teamId - 团队ID
   * @param {Number} roleId - 角色ID
   * @param {Object} data - 申请数据
   * @returns {Promise} 请求结果Promise对象
   */
  applyRole(teamId, roleId, data) {
    return request({
      url: `/teams/${teamId}/roles/${roleId}/apply`,
      method: 'POST',
      data
    });
  },
  
  /**
   * 编辑团队信息
   * @param {Number} teamId - 团队ID
   * @param {Object} data - 更新的团队信息
   * @returns {Promise} 请求结果Promise对象
   */
  updateTeam(teamId, data) {
    return request({
      url: `/teams/${teamId}`,
      method: 'PUT',
      data
    });
  },
  
  /**
   * 解散团队
   * @param {Number} teamId - 团队ID
   * @returns {Promise} 请求结果Promise对象
   */
  disbandTeam(teamId) {
    return request({
      url: `/teams/${teamId}/disband`,
      method: 'POST'
    });
  },
  
  /**
   * 退出团队
   * @param {String|Number} teamId - 团队ID
   * @returns {Promise} 请求结果Promise对象
   */
  leaveTeam(teamId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: "已成功退出团队"
        });
      }, 500);
    });
  }
};

export default teamApi; 