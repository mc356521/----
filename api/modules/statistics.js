import request from '@/utils/request';

/**
 * 获取用户参与的竞赛数量
 * @param {Number} userId - 用户ID，可选，不传则获取当前登录用户
 * @returns {Promise} - 返回请求Promise
 */
export function getParticipatedCompetitionsCount(userId) {
  return request({
    url: userId ? `/competitions/user/${userId}/participated` : '/competitions/user/participated',
    method: 'GET'
  });
}

/**
 * 获取用户的团队数量
 * @returns {Promise} - 返回请求Promise
 */
export function getTeamsCount() {
  return request({
    url: '/teams/my',
    method: 'GET'
  });
}

/**
 * 获取用户参与的任务数量
 * @returns {Promise} - 返回请求Promise
 */
export function getParticipatedTasksCount() {
  return request({
    url: '/tasks/my/participated',
    method: 'GET'
  });
}

/**
 * 获取用户创建的任务数量
 * @returns {Promise} - 返回请求Promise
 */
export function getCreatedTasksCount() {
  return request({
    url: '/tasks/my/created',
    method: 'GET'
  });
}

/**
 * 获取用户获奖记录数量
 * 基于团队获奖记录统计
 * @returns {Promise} - 返回请求Promise
 */
export async function getAwardsCount() {
  // 这个实现需要获取所有团队，然后获取每个团队的获奖记录，最后汇总
  // 由于没有直接的API，所以需要通过组合多个API请求实现
  return request({
    url: '/teams/my',
    method: 'GET'
  });
}

/**
 * 获取用户全部统计数据
 * 包括竞赛数量、团队数量、任务数量和获奖数量
 * @returns {Promise} - 返回Promise，包含所有统计数据
 */
export async function getAllStatistics() {
  try {
    // 获取参与竞赛数量
    const competitionsRes = await getParticipatedCompetitionsCount();
    const competitionsCount = competitionsRes.code === 200 && competitionsRes.data ? competitionsRes.data.length : 0;
    
    // 获取团队数量
    const teamsRes = await getTeamsCount();
    const teamsCount = teamsRes.code === 200 && teamsRes.data ? teamsRes.data.length : 0;
    
    // 获取参与的任务数量
    const participatedTasksRes = await getParticipatedTasksCount();
    const participatedTasksCount = participatedTasksRes.code === 200 && participatedTasksRes.data && participatedTasksRes.data.records ? participatedTasksRes.data.records.length : 0;
    
    // 获取创建的任务数量
    const createdTasksRes = await getCreatedTasksCount();
    const createdTasksCount = createdTasksRes.code === 200 && createdTasksRes.data && createdTasksRes.data.records ? createdTasksRes.data.records.length : 0;
    
    // 合并任务数量：任务总数 = 参与的任务 + 创建的任务
    const tasksCount = participatedTasksCount + createdTasksCount;
    console.log(`任务统计 - 参与的任务: ${participatedTasksCount}, 创建的任务: ${createdTasksCount}, 总数: ${tasksCount}`);
    
    // 获取获奖数量
    let awardsCount = 0;
    if (teamsRes.code === 200 && teamsRes.data && teamsRes.data.length > 0) {
      const teamsData = teamsRes.data;
      let allAwards = [];
      
      // 对于每个团队，获取其获奖信息
      for (const team of teamsData) {
        try {
          const competitionResultsApi = await import('@/api/modules/competitionResults');
          const awardsRes = await competitionResultsApi.default.getTeamAwards(team.id);
          
          if (awardsRes && awardsRes.code === 200 && awardsRes.data) {
            allAwards = [...allAwards, ...awardsRes.data];
          }
        } catch (error) {
          console.error(`获取团队 ${team.id} 获奖信息失败:`, error);
        }
      }
      
      awardsCount = allAwards.length;
    }
    
    return {
      competitionsCount,
      teamsCount,
      tasksCount,
      awardsCount
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return {
      competitionsCount: 0,
      teamsCount: 0,
      tasksCount: 0,
      awardsCount: 0
    };
  }
}

export default {
  getParticipatedCompetitionsCount,
  getTeamsCount,
  getParticipatedTasksCount,
  getCreatedTasksCount,
  getAwardsCount,
  getAllStatistics
}; 