/**
 * 团队相关接口
 */
import request from '@/utils/request';

const teamApi = {
  /**
   * 获取团队列表
   * @param {Object} params - 查询参数
   * @param {Number} params.pageNum - 页码
   * @param {Number} params.pageSize - 每页条数
   * @param {String} params.keyword - 搜索关键词
   * @param {Number} params.categoryId - 分类ID
   * @param {Number} params.competitionId - 竞赛ID
   * @param {Boolean} params.orderByViewCount - 是否按浏览量排序
   * @returns {Promise} 团队列表的Promise对象
   */
  getTeamList(params = {}) {
    return request({
      url: '/teams/list',
      method: 'GET',
      params
    });
  },
  
  /**
   * 获取团队详情
   * @param {Number} id 团队ID
   * @returns {Promise} 团队详情的Promise对象
   */
  getTeamDetail(id) {
    return request({
      url: `/teams/${id}`,
      method: 'GET'
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
      url: '/teams',
      method: 'POST',
      data
    });
  },
  
  /**
   * 申请加入团队
   * @param {Object} data - 申请数据
   * @param {Number} data.teamId - 要申请的队伍ID
   * @param {Number} data.roleId - 要申请的角色ID
   * @param {String} data.message - 申请留言
   * @returns {Promise} 申请结果的Promise对象
   */
  applyTeam(data) {
    return request({
      url: '/team-applications',
      method: 'POST',
      data
    });
  },
  
  /**
   * 获取我的申请列表
   * @param {Object} params - 查询参数
   * @param {String} params.status - 按申请状态筛选
   * @param {Number} params.pageNum - 页码
   * @param {Number} params.pageSize - 每页数量
   * @returns {Promise} 请求结果Promise对象
   */
  getMyApplications(params = {}) {
    return request({
      url: '/team-applications/list',
      method: 'GET',
      params: { ...params, role: 'applicant' }
    });
  },
  
  /**
   * 获取我收到的申请列表 (队长)
   * @param {Object} params - 查询参数
   * @param {Number} params.teamId - 按队伍ID筛选
   * @param {String} params.status - 按申请状态筛选
   * @param {Number} params.pageNum - 页码
   * @param {Number} params.pageSize - 每页数量
   * @returns {Promise} 请求结果Promise对象
   */
  getTeamApplications(params = {}) {
    return request({
      url: '/team-applications/list',
      method: 'GET',
      params: { ...params, role: 'leader' }
    });
  },
  
  /**
   * 处理队伍申请 (队长)
   * @param {Number} id - 申请ID
   * @param {Object} data - 处理数据
   * @param {String} data.status - 处理结果: "approved" 或 "rejected"
   * @param {String} data.reviewNotes - 处理备注
   * @returns {Promise} 请求结果Promise对象
   */
  handleApplication(id, data) {
    return request({
      url: `/team-applications/${id}`,
      method: 'PUT',
      data
    });
  },
  
  /**
   * 取消申请 (申请者)
   * @param {Number} id - 申请ID
   * @returns {Promise} 请求结果Promise对象
   */
  cancelApplication(id) {
    return request({
      url: `/team-applications/${id}`,
      method: 'DELETE'
    });
  },
  
  /**
   * 检查用户是否申请或加入队伍
   * @param {Number} teamId - 队伍ID
   * @returns {Promise} 请求结果Promise对象
   */
  checkTeamStatus(teamId) {
    return request({
      url: `/teams/${teamId}/has-applied`,
      method: 'GET'
    });
  },
  
  /**
   * 解散团队 (队长)
   * @param {Number} teamId - 团队ID
   * @returns {Promise} 请求结果Promise对象
   */
  disbandTeam(teamId) {
    return request({
      url: `/teams/${teamId}/dissolve`,
      method: 'POST'
    });
  },
  
  /**
   * 退出团队 (队员)
   * @param {String|Number} teamId - 团队ID
   * @returns {Promise} 请求结果Promise对象
   */
  leaveTeam(teamId) {
    return request({
      url: `/team-members/teams/${teamId}`,
      method: 'DELETE'
    });
  },
  
  /**
   * 获取我的队伍列表
   * @returns {Promise} 请求结果Promise对象
   */
  getMyTeams() {
    return request({
      url: '/teams/my',
      method: 'GET'
    });
  }
};

export default teamApi; 