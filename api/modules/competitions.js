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
  }
};

export default competitionsApi;