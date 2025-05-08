/**
 * 竞赛相关接口
 */
import request from '@/utils/request';
import { getToken } from '@/utils/request';

const competitionsApi = {
  /**
   * 获取竞赛列表
   * @param {Object} params - 查询参数
   * @param {String} [params.pageNum] - 页码，可选
   * @param {String} [params.pageSize] - 页数大小，可选
   * @param {Array} [params.keyword] - 关键字数组，可选
   * @param {String} [params.categoryId] - 类型，可选
   * @param {String} [params.level] - 等级，可选
   * @param {Boolean} [params.isHot] - 是否热门竞赛，可选
   * @returns {Promise} 请求结果Promise对象
   */
  getCompetitionsList(params = {}) {
    return request({
      url: '/competitions/list',
      method: 'GET',
      params
    });
  },
  
  /**
   * 获取竞赛详情
   * @param {Number|String} id - 竞赛ID
   * @returns {Promise} 请求结果Promise对象
   */
  getCompetitionDetail(id) {
    // 检查是否有token
    const token = getToken();
    if (!token) {
      // 如果没有token，提示用户登录
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      
      // 可选：跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      
      return Promise.reject(new Error('未登录'));
    }
    
    return request({
      url: `/competitions/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  /**
   * 创建竞赛（仅管理员可用）
   * @param {Object} data - 竞赛信息
   * @param {String} data.title - 竞赛标题
   * @param {String} data.registrationStart - 报名开始时间
   * @param {String} data.registrationDeadline - 报名截止时间
   * @param {String} data.status - 竞赛状态
   * @param {String} data.level - 竞赛级别
   * @param {String} data.organizer - 主办方
   * @param {String} data.description - 详细描述
   * @param {String} [data.shortDescription] - 简短描述
   * @param {String} [data.requirements] - 参赛要求
   * @param {Boolean} [data.isHot] - 是否热门竞赛
   * @param {Number} data.teamSize - 团队最小人数
   * @param {Number} data.teamMax - 团队最大人数
   * @param {String} [data.websiteUrl] - 竞赛官网
   * @param {Object} data.contactInfo - 联系信息
   * @param {Array} data.categoryIds - 关联的分类ID列表
   * @returns {Promise} 请求结果Promise对象
   */
  createCompetition(data) {
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
    
    console.log('准备创建竞赛，数据:', data);
    
    return request({
      url: '/competitions',
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      console.log('创建竞赛响应:', res);
      return res;
    }).catch(err => {
      console.error('创建竞赛出错:', err);
      throw err;
    });
  },
  
  /**
   * 获取所有竞赛分类
   * @returns {Promise} 包含所有竞赛分类的Promise对象
   */
  getCompetitionCategories() {
    return request({
      url: '/competitions/categories',
      method: 'GET'
    });
  }
};

export default competitionsApi;