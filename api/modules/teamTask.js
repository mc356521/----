/**
 * 团队任务相关接口
 */
import request from '@/utils/request';

const teamTaskApi = {
    /**
     * 创建团队任务
     * @param {Object} data - 任务数据
     * @param {Number} data.teamId - 所属团队ID
     * @param {String} data.title - 任务标题
     * @param {String} data.description - 任务描述
     * @param {String} data.priority - 优先级：高、中、低
     * @param {String} data.dueDate - 截止日期
     * @param {Number} data.assigneeId - 负责人ID（可选）
     * @returns {Promise} 创建结果的Promise对象
     */
    createTeamTask(data) {
        return request({
            url: '/api/team-tasks',
            method: 'POST',
            data
        });
    },

    /**
     * 更新团队任务
     * @param {Object} data - 更新数据
     * @param {Number} data.id - 任务ID
     * @param {String} data.title - 更新后的标题
     * @param {String} data.description - 更新后的描述
     * @param {String} data.priority - 更新后的优先级
     * @param {String} data.dueDate - 更新后的截止日期
     * @param {String} data.status - 更新后的状态
     * @param {Number} data.progress - 更新后的进度
     * @returns {Promise} 更新结果的Promise对象
     */
    updateTeamTask(data) {
        return request({
            url: '/api/team-tasks',
            method: 'PUT',
            data
        });
    },

    /**
     * 删除团队任务
     * @param {Number} taskId - 要删除的任务ID
     * @returns {Promise} 删除结果的Promise对象
     */
    deleteTeamTask(taskId) {
        return request({
            url: `/api/team-tasks/${taskId}`,
            method: 'DELETE'
        });
    },

    /**
     * 获取团队任务列表
     * @param {Number} teamId - 团队ID
     * @returns {Promise} 团队任务列表的Promise对象
     */
    getTeamTaskList(teamId) {
        return request({
            url: `/api/team-tasks/team/${teamId}`,
            method: 'GET'
        });
    },

    /**
     * 获取任务详情
     * @param {Number} taskId - 任务ID
     * @returns {Promise} 任务详情的Promise对象
     */
    getTaskDetail(taskId) {
        return request({
            url: `/api/team-tasks/${taskId}`,
            method: 'GET'
        });
    },

    /**
     * 用户认领任务
     * @param {Number} taskId - 要认领的任务ID
     * @returns {Promise} 认领结果的Promise对象
     */
    claimTask(taskId) {
        return request({
            url: `/api/team-tasks/claim/${taskId}`,
            method: 'POST'
        });
    },

    /**
     * 获取当前用户负责的任务列表
     * @returns {Promise} 用户负责的任务列表的Promise对象
     */
    getMyTasks() {
        return request({
            url: '/api/team-tasks/my-tasks',
            method: 'GET'
        });
    }
};

export default teamTaskApi;