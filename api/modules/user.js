/**
 * 用户相关接口
 * 作为API接口模块的示例
 */
import request from '@/utils/request';
import { getToken, setToken } from '@/utils/request';

const userApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录参数，包含phone和password
   * @returns {Promise} 请求结果Promise对象
   */
  login(data) {
    console.log('登录请求参数:', data);
    return request({
      url: '/users/login',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        phone: data.phone,
        password: data.password
      }
    }).then(result => {
      console.log('登录响应:', result);
      
      // 检查响应结构
      if (result && result.code === 200 && result.data) {
        // 保存token
        const token = result.data;
        setToken(token);
        console.log('登录成功，已保存token');
        
        return {
          token: token,
          isLogin: true
        };
      }
      
      // 如果响应不符合预期，抛出错误
      if (result && result.message) {
        throw new Error(result.message);
      }
      
      return result;
    });
  },

  /**
   * 用户注册
   * @param {Object} data - 注册参数，包含手机号、密码等信息
   * @returns {Promise} 请求结果Promise对象
   */
  register(data) {
    console.log('注册请求参数:', data);
    console.log('注册请求URL:', '/users/register (将通过代理转发)');
    
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
  },
  
  /**
   * 获取用户角色
   * @param {String} token - 用户token，如不传则使用本地存储的token
   * @returns {Promise} 请求结果Promise对象，返回用户角色（student/teacher/admin）
   */
  getUserRole(token) {
    // 如果未传递token，使用本地存储的token
    const authToken = token || getToken();
    
    if (!authToken) {
      return Promise.reject(new Error('未登录'));
    }
    
    // 使用POST方法，但token作为query参数传递
    return request({
      url: `/users/role/parse?token=${encodeURIComponent(authToken)}`, // 直接在URL中添加token作为查询参数
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  /**
   * 退出登录
   * @returns {Promise} 请求结果Promise对象
   */
  logout() {
    return request({
      url: '/user/logout',
      method: 'POST'
    }).finally(() => {
      // 无论请求成功还是失败，都清除本地token
      setToken('');
    });
  },
  
  /**
   * 修改用户信息
   * @param {Object} data - 要修改的用户信息
   * @returns {Promise} 请求结果Promise对象
   */
  updateUserInfo(data) {
    return request({
      url: '/user/update',
      method: 'PUT',
      data
    });
  },
  
  /**
   * 修改密码
   * @param {Object} data - 包含旧密码和新密码
   * @returns {Promise} 请求结果Promise对象
   */
  changePassword(data) {
    return request({
      url: '/user/password',
      method: 'PUT',
      data
    });
  }
};

export default userApi; 