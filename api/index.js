/**
 * API 接口管理入口文件
 * 统一导出所有API接口，方便调用
 */

// 导入各模块API
import userApi from './modules/user';

// 统一导出
export default {
  user: userApi
}; 