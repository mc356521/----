/**
 * 用户相关接口
 * 作为API接口模块的示例
 */
import request from '@/utils/request';

const userApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录参数，包含用户名和密码
   * @returns {Promise} 请求结果Promise对象
   */
  login(data) {
    return request({
      url: '/user/login',
      method: 'POST',
      data
    });
  },

  /**
   * 用户注册
   * @param {Object} data - 注册参数，包含手机号、密码等信息
   * @returns {Promise} 请求结果Promise对象
   */
  register(data) {
    return request({
      url: '/users/register',
      method: 'POST',
      data
    });
  },

  /**
   * 获取用户信息
   * @returns {Promise} 请求结果Promise对象
   */
  getUserInfo() {
    return request({
      url: '/user/info',
      method: 'GET'
    });
  }
};

export default userApi; 