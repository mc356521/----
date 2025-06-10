/**
 * 导航相关工具函数
 */

/**
 * 跳转到用户资料页面
 * @param {String|Number} userId - 用户ID
 * @param {Object} extraParams - 额外的参数
 */
export function navigateToUserProfile(userId, extraParams = {}) {
    if (!userId) {
        uni.showToast({
            title: '无法获取用户ID',
            icon: 'none'
        });
        return;
    }

    // 将参数保存到本地存储，确保在移动端也能获取
    const params = { userId, ...extraParams };
    uni.setStorageSync('viewUserParams', params);

    // 跳转到用户资料页面
    uni.navigateTo({
        url: `/pages/profile/view-user-info?userId=${userId}`,
        fail: (err) => {
            console.error('跳转到用户资料页面失败:', err);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
}

/**
 * 跳转到任务详情页面
 * @param {String|Number} taskId - 任务ID
 * @param {Object} extraParams - 额外的参数
 */
export function navigateToTaskDetail(taskId, extraParams = {}) {
    if (!taskId) {
        uni.showToast({
            title: '无法获取任务ID',
            icon: 'none'
        });
        return;
    }

    // 将参数保存到本地存储，确保在移动端也能获取
    const params = { taskId, ...extraParams };
    uni.setStorageSync('viewTaskParams', params);

    // 跳转到任务详情页面
    uni.navigateTo({
        url: `/pages/task-square/detail?taskId=${taskId}`,
        fail: (err) => {
            console.error('跳转到任务详情页面失败:', err);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
}

/**
 * 跳转到团队详情页面
 * @param {String|Number} teamId - 团队ID
 * @param {Object} extraParams - 额外的参数
 */
export function navigateToTeamDetail(teamId, extraParams = {}) {
    if (!teamId) {
        uni.showToast({
            title: '无法获取团队ID',
            icon: 'none'
        });
        return;
    }

    // 将参数保存到本地存储，确保在移动端也能获取
    const params = { teamId, ...extraParams };
    uni.setStorageSync('viewTeamParams', params);

    // 跳转到团队详情页面
    uni.navigateTo({
        url: `/pages/team/detail?teamId=${teamId}`,
        fail: (err) => {
            console.error('跳转到团队详情页面失败:', err);
            uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
            });
        }
    });
}

// 导出所有导航函数
export default {
    navigateToUserProfile,
    navigateToTaskDetail,
    navigateToTeamDetail
};