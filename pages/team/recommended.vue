<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <header-bar
      ref="headerBarRef"
      title="AI智能推荐"
      :show-search="false"
      :show-filter="false"
      :show-ai-recommend="false"> 
    </header-bar>

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content-scroll" 
      :style="{ paddingTop: headerPlaceholderHeight }">
      
      <!-- AI分析摘要 -->
      <view class="ai-summary" v-if="aiSummary">
        <view class="summary-header">
          <text class="summary-title">✨ AI分析结果</text>
        </view>
        <text class="summary-content">{{ aiSummary }}</text>
      </view>
      
      <!-- 推荐队伍列表 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">为您推荐的队伍</text>
          <view class="refresh-btn" @click="refreshRecommendations">
            <text class="iconfont icon-refresh"></text>
          </view>
        </view>
        
        <view v-if="loading" class="loading-container">
          <view class="loading-circle"></view>
          <text class="loading-text">正在加载推荐...</text>
        </view>
        
        <view v-else-if="recommendedTeams.length > 0" class="team-list">
          <team-card
            v-for="(team, index) in recommendedTeams" 
            :key="team.id"
            :team="team"
            :index="index"
            :show-match="true"
            @detail="viewTeamDetail">
          </team-card>
        </view>
        
        <view v-else class="empty-state">
          <image class="empty-icon" src="/static/images/empty-data.png" mode="aspectFit"></image>
          <text class="empty-text">暂无推荐，请完善个人资料后再试</text>
          <button class="primary-btn" @click="goToProfile">完善资料</button>
        </view>
      </view>
    </scroll-view>

  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';
import teamApi from '@/api/modules/team';

// 页面状态
const loading = ref(true);
const recommendedTeams = ref([]);
const aiSummary = ref('');

// HeaderBar引用
const headerBarRef = ref(null);

// 计算HeaderBar占位高度
const headerPlaceholderHeight = computed(() => {
  if (headerBarRef.value && headerBarRef.value.headerHeight) {
    return headerBarRef.value.headerHeight + 'rpx';
  }
  return '120rpx';
});

// 获取AI智能推荐的队伍
async function getRecommendedTeams(forceRefresh = false) {
  loading.value = true;
  
  try {
    console.log('开始获取AI推荐队伍数据，强制刷新:', forceRefresh);
    
    // 检查是否有缓存以及缓存是否过期
    let cachedTeams = null;
    let cachedSummary = null;
    let cacheTime = null;
    
    try {
      cachedTeams = uni.getStorageSync('ai_recommended_teams');
      cachedSummary = uni.getStorageSync('ai_summary');
      cacheTime = uni.getStorageSync('ai_recommend_cache_time');
      
      // 调试日志
      console.log('缓存状态检查:');
      console.log('- 缓存数据存在:', !!cachedTeams);
      console.log('- 缓存时间:', cacheTime ? new Date(parseInt(cacheTime)).toLocaleString() : '无');
    } catch (e) {
      console.error('读取缓存出错:', e);
    }
    
    const currentTime = new Date().getTime();
    // 缓存有效期为24小时
    const cacheExpired = !cacheTime || isNaN(parseInt(cacheTime)) || (currentTime - parseInt(cacheTime)) > 24 * 60 * 60 * 1000;
    
    console.log('缓存是否过期:', cacheExpired);
    
    // 如果有有效缓存且不是强制刷新，直接使用缓存数据
    if (cachedTeams && !cacheExpired && !forceRefresh) {
      console.log('使用缓存的AI推荐数据');
      try {
        recommendedTeams.value = JSON.parse(cachedTeams);
        aiSummary.value = cachedSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
        console.log('成功加载缓存数据，推荐队伍数量:', recommendedTeams.value.length);
        loading.value = false;
        return;
      } catch (e) {
        console.error('解析缓存数据失败:', e);
        // 解析失败时继续获取新数据
      }
    }
    
    // 请求新数据
    console.log('请求新的AI推荐数据');
    const res = await teamApi.getRecommendedTeams();
    
    if (res.code === 200 && res.data) {
      // 为每个队伍添加匹配度信息
      const teams = res.data.recommendedTeams || [];
      recommendedTeams.value = teams.map(team => {
        return {
          ...team,
          matchScore: team.matchScore || Math.floor(Math.random() * 30) + 70, // 如果没有匹配度，随机生成70-100之间的分数
          matchReason: team.matchReason || team.recommendReason || '根据您的技能和兴趣推荐',
          recommendedRole: team.recommendedRole || ''
        };
      });
      
      aiSummary.value = res.data.aiSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
      console.log('获取到新的AI推荐队伍数据:', recommendedTeams.value.length, '个队伍');
      
      // 将数据存入本地缓存
      try {
        uni.setStorageSync('ai_recommended_teams', JSON.stringify(recommendedTeams.value));
        uni.setStorageSync('ai_summary', aiSummary.value);
        uni.setStorageSync('ai_recommend_cache_time', currentTime.toString());
        console.log('AI推荐数据缓存成功');
      } catch (e) {
        console.error('缓存AI推荐数据失败:', e);
      }
    } else {
      console.error('获取推荐数据失败:', res.message || '未知错误');
      // 检查是否有旧缓存可用作备用数据
      if (cachedTeams) {
        try {
          recommendedTeams.value = JSON.parse(cachedTeams);
          aiSummary.value = cachedSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
          console.log('使用过期缓存作为备用数据');
        } catch (e) {
          console.error('解析旧缓存失败:', e);
        }
      }
    }
  } catch (error) {
    console.error('获取AI推荐队伍失败:', error);
    
    // 尝试从缓存加载作为备用
    try {
      const cachedTeams = uni.getStorageSync('ai_recommended_teams');
      if (cachedTeams) {
        recommendedTeams.value = JSON.parse(cachedTeams);
        aiSummary.value = uni.getStorageSync('ai_summary') || '';
        console.log('由于请求失败，使用缓存作为备用数据');
      }
    } catch (e) {
      console.error('加载备用缓存失败:', e);
    }
    
    // 如果所有尝试都失败且没有数据显示错误提示
    if (recommendedTeams.value.length === 0) {
      uni.showToast({
        title: '获取推荐失败，请稍后再试',
        icon: 'none',
        duration: 2000
      });
    }
  } finally {
    // 确保无论如何都会关闭加载状态
    loading.value = false;
    console.log('AI推荐数据加载完成，显示状态更新');
  }
}

// 此外，建议将refreshRecommendations函数也优化，确保功能稳定：

function refreshRecommendations() {
  uni.showLoading({
    title: '刷新推荐中...'
  });
  
  // 清除缓存
  try {
    uni.removeStorageSync('ai_recommended_teams');
    uni.removeStorageSync('ai_summary');
    uni.removeStorageSync('ai_recommend_cache_time');
    console.log('已清除AI推荐缓存，准备获取新数据');
  } catch (e) {
    console.error('清除缓存失败:', e);
  }
  
  // 强制刷新，重新获取推荐
  getRecommendedTeams(true)
    .then(() => {
      console.log('推荐刷新完成');
    })
    .catch(err => {
      console.error('推荐刷新出错:', err);
    })
    .finally(() => {
      uni.hideLoading();
      uni.showToast({
        title: '推荐已更新',
        icon: 'success'
      });
    });
}

// 查看团队详情
function viewTeamDetail(id) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${id}`
  });
}

// 跳转到个人资料页
function goToProfile() {
  uni.switchTab({
    url: '/pages/profile/index'
  });
}

onMounted(() => {
  getRecommendedTeams();
});
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '@/config/theme.scss';

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.content-scroll {
  flex: 1;
  box-sizing: border-box;
  padding: 20rpx;
}

// AI分析摘要
.ai-summary {
  padding: 30rpx 30rpx 30rpx 30rpx;
  background-color: rgba(#247ae4, 0.05);
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  .summary-header {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .summary-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #247ae4;
  }
  
  .summary-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
  }
}

.section {
  margin-bottom: 30rpx;
  
  .section-header {
    @include flex-between;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .refresh-btn {
      padding: 10rpx 20rpx;
      border-radius: 100rpx;
      background-color: rgba(#247ae4, 0.1);
      
      .iconfont {
        font-size: 32rpx;
        color: #247ae4;
      }
    }
  }
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .primary-btn {
    padding: 20rpx 60rpx;
    background-color: #247ae4;
    color: #fff;
    border-radius: 100rpx;
    font-size: 28rpx;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-circle {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 6rpx solid rgba(#247ae4, 0.1);
    border-top-color: #247ae4;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #666;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 