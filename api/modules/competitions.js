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
   * 创建比赛阶段
   * @param {Object} data - 阶段信息
   * @param {Number} data.competitionId - 关联的竞赛ID
   * @param {String} data.stageName - 阶段名称
   * @param {String} data.startTime - 开始时间
   * @param {String} data.endTime - 结束时间
   * @param {String} data.description - 阶段描述
   * @param {String} data.status - 阶段状态 (pending/active/completed)
   * @param {String} data.metadata - 元数据JSON字符串，包含地点等信息
   * @returns {Promise} 请求结果Promise对象
   */
  createCompetitionStage(data) {
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
      url: '/competitionStages',
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  /**
   * 批量创建比赛阶段
   * @param {Array} stages - 阶段信息数组
   * @param {Number} competitionId - 关联的竞赛ID
   * @returns {Promise} 请求结果Promise对象
   */
  createCompetitionStages(stages, competitionId) {
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
    
    // 为每个阶段添加竞赛ID
    const stagesWithCompetitionId = stages.map(stage => ({
      ...stage,
      competitionId
    }));
    
    // 使用Promise.all同时创建多个阶段
    return Promise.all(
      stagesWithCompetitionId.map(stage => 
        this.createCompetitionStage(stage)
      )
    );
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
  },
  
  /**
   * 获取竞赛基本信息列表（用于选择）
   * @returns {Promise} 包含竞赛基本信息的Promise对象
   */
  getCompetitionsBasicInfo() {
    return request({
      url: '/competitions/basic-info',
      method: 'GET'
    });
  },
  
  /**
   * 获取竞赛阶段列表
   * @param {Number|String} competitionId - 竞赛ID
   * @returns {Promise} 请求结果Promise对象
   */
  getCompetitionStages(competitionId) {
    return request({
      url: `/competitionStages/list/${competitionId}`,
      method: 'GET'
    });
  },
  
  /**
   * 获取比赛结果
   * @param {Number|String} competitionId - 竞赛ID
   * @returns {Promise} 请求结果Promise对象
   */
  getCompetitionResults(competitionId) {
    return request({
      url: `/competitionResults/${competitionId}`,
      method: 'GET'
    });
  },
  
  /**
   * 获取竞赛报名团队数量
   * @param {Number|String} competitionId - 竞赛ID
   * @returns {Promise} 请求结果Promise对象，包含团队数量信息
   */
  getCompetitionTeamCount(competitionId) {
    return request({
      url: `/competitions/${competitionId}/team-count`,
      method: 'GET'
    });
  },
  
  /**
   * 按文件类型获取竞赛附件
   * @param {Number|String} competitionId - 竞赛ID
   * @param {String} fileType - 文件类型，默认为 'document'
   * @returns {Promise} 请求结果Promise对象，包含附件列表
   */
  getCompetitionAttachmentsByType(competitionId, fileType = 'document') {
    return request({
      url: `/competitions/attachments/list-by-type/${competitionId}`,
      method: 'GET',
      params: {
        fileType
      }
    });
  },
  
  /**
   * 获取用户参与的所有竞赛
   * @param {Number|String} userId - 用户ID，如果不传则获取当前登录用户的参赛信息
   * @returns {Promise} 请求结果Promise对象
   */
  getUserParticipatedCompetitions(userId) {
    return request({
      url: userId ? `/competitions/user/${userId}/participated` : '/competitions/user/participated',
      method: 'GET'
    });
  }
};

export default competitionsApi;