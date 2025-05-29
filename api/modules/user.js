/**
 * 用户相关接口
 * 作为API接口模块的示例
 */
import request from '@/utils/request';
import { getToken, setToken } from '@/utils/request';
import { getEnv } from '@/config/env';

const userApi = {
    /**
     * 获取学校列表
     * @returns {Promise} 请求结果Promise对象
     */
    getSchools() {
        return request({
            url: '/api/schools',
            method: 'GET'
        });
    },

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
                // 保存token - 直接使用token key而不是auth_token
                const token = result.data;
                uni.setStorageSync('token', token); // 直接设置token到本地存储
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
        console.log('注册请求参数 (原始):', data);

        // 创建符合接口规范的请求数据
        const requestData = {
            phoneNumber: data.phoneNumber || data.phone, // 兼容处理，优先使用phoneNumber，如果没有则使用phone
            password: data.password,
            realName: data.realName,
            schoolId: data.schoolId || 1, // 确保有默认值
            role: data.role || 'student', // 确保有默认值
            major: data.major,
            studentTeacherId: data.studentTeacherId
        };

        // 确保数据格式符合要求
        if (typeof requestData.studentTeacherId === 'number') {
            requestData.studentTeacherId = String(requestData.studentTeacherId);
        }

        if (typeof requestData.schoolId !== 'number') {
            requestData.schoolId = Number(requestData.schoolId) || 1;
        }

        console.log('注册请求数据 (转换后):', requestData);
        console.log('注册请求URL:', '/users/register');

        return request({
            url: '/users/register',
            method: 'POST',
            data: requestData,
            header: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log('注册响应:', response);
            return response;
        }).catch(error => {
            console.error('注册请求错误:', error);
            if (error.response && error.response.data) {
                console.error('服务器错误详情:', error.response.data);
            }
            throw error;
        });
    },

    /**
     * 获取用户信息
     * @returns {Promise} 请求结果Promise对象
     */
    getUserInfo() {
        return request({
            url: '/users/info',
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + getToken()
            }
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
     * 解析用户角色
     * @param {String} token - 用户token
     * @returns {Promise} 请求结果Promise对象，返回用户角色（student/teacher/admin）
     */
    parseUserRole(token) {
        if (!token) {
            return Promise.reject(new Error('未提供token'));
        }

        return request({
            url: `/users/role/parse?token=${encodeURIComponent(token)}`,
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
    },

    /**
     * 获取用户个人资料信息
     * @returns {Promise} 用户个人资料的Promise对象
     */
    getUserProfile() {
        return request({
            url: '/users/profile',
            method: 'GET'
        });
    },

    /**
     * 更新用户个人资料
     * @param {Object} data - 更新的个人资料数据
     * @param {String} data.realName - 真实姓名
     * @param {Number} data.schoolId - 学校ID
     * @param {String} data.major - 专业
     * @param {String} data.bio - 个人简介
     * @param {Array} data.skillTags - 技能标签数组
     * @param {Array} data.awardsHistory - 获奖经历数组
     * @returns {Promise} 更新结果的Promise对象
     */
    updateUserProfile(data) {
        return request({
            url: '/users/profile',
            method: 'PUT',
            data,
            header: {
                'Content-Type': 'application/json'
            }
        });
    },

    /**
     * 上传用户头像
     * @param {String} filePath - 本地文件路径
     * @param {Function} onProgress - 上传进度回调函数
     * @returns {Promise} 上传结果的Promise对象
     */
    uploadAvatar(filePath, onProgress) {
        return new Promise((resolve, reject) => {
            const uploadTask = uni.uploadFile({
                url: getEnv().baseUrl + '/users/avatar',
                filePath: filePath,
                name: 'file',
                header: {
                    'Authorization': 'Bearer ' + getToken()
                },
                success: (res) => {
                    // 服务器返回的数据是字符串，需要转换成对象
                    let data;
                    try {
                        data = JSON.parse(res.data);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('解析响应数据失败'));
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            });

            // 监听上传进度
            if (onProgress && typeof onProgress === 'function') {
                uploadTask.onProgressUpdate((res) => {
                    onProgress(res.progress);
                });
            }
        });
    },

    /**
     * 获取所有技能标签（按分类分组）
     * @returns {Promise} 技能标签的Promise对象
     */
    getSkillTags() {
        return request({
            url: '/api/skill-tags/group-by-category',
            method: 'GET'
        });
    },

    /**
     * 获取用户勋章数据
     * @returns {Promise} 用户勋章数据的Promise对象
     */
    getUserBadges() {
        return request({
            url: '/user/honors/simple-badges',
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
    },

    /**
     * 获取用户详细勋章数据
     * @returns {Promise} 用户详细勋章数据的Promise对象
     */
    getUserBadgesDetail() {
        return request({
            url: '/user/honors/badges',
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
    }
};

export default userApi;