/**
 * API 接口管理入口文件
 * 统一导出所有API接口，方便调用
 * 
 * 使用示例:
 * import api from '@/api';
 * 
 * // 调用用户登录
 * api.user.login({...});
 * 
 * // 调用用户注册
 * api.user.register({...});
 */

/**
 * API模块集中导出
 */
import userApi from './modules/user';
import teamApi from './modules/team';
import competitionsApi from './modules/competitions';
import * as taskApplicationsApi from './modules/taskApplications';

// 导入其他模块API (示例，根据需要添加)
// import courseApi from './modules/course';
// import noticeApi from './modules/notice';

// 统一导出
export default {
  user: userApi,
  team: teamApi,
  competitions: competitionsApi,
  taskApplications: taskApplicationsApi,
  // 其他模块
  // course: courseApi,
  // notice: noticeApi
}; 