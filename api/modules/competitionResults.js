/**
 * 比赛结果相关接口
 */
import request from '@/utils/request';
import { getToken } from '@/utils/request';

const competitionResultsApi = {
  /**
   * 获取比赛结果列表
   * @param {Number|String} competitionId - 竞赛ID
   * @returns {Promise} 请求结果Promise对象
   */
  getCompetitionResults(competitionId) {
    // 检查是否有token
    const token = getToken();
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      
      return Promise.reject(new Error('未登录'));
    }
    
    return request({
      url: `/competitionResults/competition/${competitionId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  /**
   * 获取队伍详情
   * @param {Number|String} teamId - 队伍ID
   * @returns {Promise} 请求结果Promise对象
   */
  getTeamDetail(teamId) {
    return request({
      url: `/teams/${teamId}`,
      method: 'GET'
    });
  },
  
  /**
   * 获取团队成员
   * @param {Number|String} teamId - 团队ID
   * @returns {Promise} 团队成员的Promise对象
   */
  getTeamMembers(teamId) {
    return request({
      url: `/teams/${teamId}/members`,
      method: 'GET'
    });
  },
  
  /**
   * 获取用户的获奖记录
   * @param {Object} params - 查询参数
   * @param {Number} [params.pageNum=1] - 页码
   * @param {Number} [params.pageSize=10] - 每页记录数
   * @returns {Promise} 请求结果Promise对象
   */
  getMyAwards(params = {}) {
    const defaultParams = {
      pageNum: 1,
      pageSize: 10,
      ...params
    };
    
    // 检查是否有token
    const token = getToken();
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      
      return Promise.reject(new Error('未登录'));
    }
    
    return request({
      url: `/competitionResults/my-awards`,
      method: 'GET',
      params: defaultParams,
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default competitionResultsApi; 