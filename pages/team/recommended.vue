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
            <SvgIcon name="shuaxin" size="20"/>
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
            @detail="viewTeamDetail" style="font-size: 30rpx;" >
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

<script>
import HeaderBar from '@/components/HeaderBar.vue';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';
import teamApi from '@/api/modules/team';
import SvgIcon from '@/components/SvgIcon.vue';
export default {
  components: {
    HeaderBar,
    TeamCard,
    TabBar,
    SvgIcon
  },
  
  data() {
    return {
      // 页面状态
      loading: true,
      recommendedTeams: [],
      aiSummary: '',
      
      // HeaderBar占位高度
      headerPlaceholderHeight: '120rpx',
      
      // 缓存有效时间（3小时，单位：毫秒）
      cacheValidDuration: 3 * 60 * 60 * 1000
    };
  },
  
  // 生命周期钩子 - 页面加载
  onLoad() {
    // 检查用户是否已登录
    const token = uni.getStorageSync('token');
    if (!token) {
      console.log('用户未登录，无法访问AI推荐页面');
      uni.showModal({
        title: '需要登录',
        content: '查看AI智能推荐需要先登录账号',
        confirmText: '去登录',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          } else {
            // 返回上一页
            uni.navigateBack();
          }
        }
      });
      return;
    }
    
    // 先尝试读取缓存
    const cacheLoaded = this.checkCacheAndLoad();
    
    // 如果缓存加载失败，再调用API获取
    if (!cacheLoaded) {
      this.getRecommendedTeams();
    }
  },
  
  // 页面显示时触发
  onShow() {
    // 获取HeaderBar组件引用
    if (this.$refs.headerBarRef) {
      this.updateHeaderHeight();
    }
  },
  
  methods: {
    // 更新HeaderBar占位高度
    updateHeaderHeight() {
      if (this.$refs.headerBarRef && this.$refs.headerBarRef.headerHeight) {
        this.headerPlaceholderHeight = this.$refs.headerBarRef.headerHeight + 'rpx';
      }
    },
    
    // 检查缓存数据并立即加载
    checkCacheAndLoad() {
      try {
        const cachedTeams = uni.getStorageSync('ai_recommended_teams');
        const cachedSummary = uni.getStorageSync('ai_summary');
        const cachedTime = uni.getStorageSync('ai_recommend_cache_time');
        
        // 检查缓存有效期
        const now = Date.now();
        const isExpired = !cachedTime || (now - Number(cachedTime) > this.cacheValidDuration);
        
        if (isExpired) {
          console.log('缓存已过期，需要重新获取数据。过期时间:', 
            cachedTime ? new Date(Number(cachedTime)).toLocaleString() : '无缓存时间');
          return false;
        }
        
        // 如果存在缓存数据且未过期
        if (cachedTeams) {
          try {
            const parsedTeams = JSON.parse(cachedTeams);
            // 验证数据格式
            if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
              this.recommendedTeams = parsedTeams;
              this.aiSummary = cachedSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
              this.loading = false; // 立即关闭加载状态
              console.log('组件初始化时使用缓存数据:', parsedTeams.length, '个推荐队伍，缓存时间:', new Date(Number(cachedTime)).toLocaleString());
              return true; // 表示成功加载了缓存
            }
          } catch (e) {
            console.error('初始化时解析缓存失败:', e);
          }
        } else {
          console.log('没有可用的缓存数据');
        }
      } catch (e) {
        console.error('初始检查缓存出错:', e);
      }
      
      return false; // 表示没有加载缓存或加载失败
    },

    // 获取AI智能推荐的队伍
    async getRecommendedTeams(forceRefresh = false) {
      // 如果不是强制刷新，并且已经有数据，则不再加载
      if (!forceRefresh && this.recommendedTeams.length > 0) {
        console.log('已有推荐数据，不再重复加载');
        this.loading = false;
        return;
      }
      
      this.loading = true;
      
      try {
        console.log('开始获取AI推荐队伍数据，强制刷新:', forceRefresh);
        
        // 如果不是强制刷新，尝试使用缓存
        if (!forceRefresh) {
          // 检查是否有缓存
          let cachedTeams = null;
          let cachedSummary = null;
          let cachedTime = null;
          
          try {
            cachedTeams = uni.getStorageSync('ai_recommended_teams');
            cachedSummary = uni.getStorageSync('ai_summary');
            cachedTime = uni.getStorageSync('ai_recommend_cache_time');
            
            // 检查缓存是否过期
            const now = Date.now();
            const isExpired = !cachedTime || (now - Number(cachedTime) > this.cacheValidDuration);
            
            // 调试日志
            console.log('缓存状态检查:');
            console.log('- 缓存数据存在:', !!cachedTeams);
            console.log('- 缓存时间:', cachedTime ? new Date(Number(cachedTime)).toLocaleString() : '无缓存时间');
            console.log('- 缓存是否过期:', isExpired);
            
            // 如果缓存已过期，不使用缓存
            if (isExpired) {
              console.log('缓存已过期，需要重新获取数据');
              cachedTeams = null;
            }
          } catch (e) {
            console.error('读取缓存出错:', e);
          }
          
          // 如果有缓存且未过期，直接使用缓存数据
          if (cachedTeams) {
            console.log('使用缓存的AI推荐数据');
            try {
              const parsedTeams = JSON.parse(cachedTeams);
              // 验证数据格式
              if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
                this.recommendedTeams = parsedTeams;
                this.aiSummary = cachedSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
                console.log('成功加载缓存数据，推荐队伍数量:', this.recommendedTeams.length);
                this.loading = false; // 加载缓存成功后立即关闭加载状态
                return; // 直接返回，不再继续执行
              } else {
                console.log('缓存数据格式无效，需要重新获取');
              }
            } catch (e) {
              console.error('解析缓存数据失败:', e);
              // 解析失败时继续获取新数据
            }
          }
        }
        
        // 请求新数据
        console.log('请求新的AI推荐数据');
        const res = await teamApi.getRecommendedTeams();
        
        if (res.code === 200 && res.data) {
          // 为每个队伍添加匹配度信息
          const teams = res.data.recommendedTeams || [];
          this.recommendedTeams = teams.map(team => {
            return {
              ...team,
              matchScore: team.matchScore || Math.floor(Math.random() * 30) + 70, // 如果没有匹配度，随机生成70-100之间的分数
              matchReason: team.matchReason || team.recommendReason || '根据您的技能和兴趣推荐',
              recommendedRole: team.recommendedRole || ''
            };
          });
          
          this.aiSummary = res.data.aiSummary || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
          console.log('获取到新的AI推荐队伍数据:', this.recommendedTeams.length, '个队伍');
          
          // 将数据存入本地缓存，并记录缓存时间
          try {
            // 保存推荐团队数据
            uni.setStorageSync('ai_recommended_teams', JSON.stringify(this.recommendedTeams));
            // 保存AI摘要
            uni.setStorageSync('ai_summary', this.aiSummary);
            // 保存缓存时间戳
            const currentTime = Date.now();
            uni.setStorageSync('ai_recommend_cache_time', currentTime.toString());
            
            console.log('AI推荐数据缓存成功，缓存时间:', new Date(currentTime).toLocaleString());
          } catch (e) {
            console.error('缓存AI推荐数据失败:', e);
          }
        } else {
          console.error('获取推荐数据失败:', res.message || '未知错误');
          // 检查是否有旧缓存可用作备用数据
          if (!forceRefresh) {
            try {
              const cachedTeams = uni.getStorageSync('ai_recommended_teams');
              // 不管缓存是否过期，在请求失败的情况下都尝试使用
              if (cachedTeams) {
                const parsedTeams = JSON.parse(cachedTeams);
                if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
                  this.recommendedTeams = parsedTeams;
                  this.aiSummary = uni.getStorageSync('ai_summary') || '根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队';
                  console.log('使用缓存作为备用数据');
                }
              }
            } catch (e) {
              console.error('解析缓存失败:', e);
            }
          }
        }
      } catch (error) {
        console.error('获取AI推荐队伍失败:', error);
        
        // 尝试从缓存加载作为备用，在出错情况下不考虑缓存过期
        if (!forceRefresh) {
          try {
            const cachedTeams = uni.getStorageSync('ai_recommended_teams');
            if (cachedTeams) {
              const parsedTeams = JSON.parse(cachedTeams);
              if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
                this.recommendedTeams = parsedTeams;
                this.aiSummary = uni.getStorageSync('ai_summary') || '';
                console.log('由于请求失败，使用缓存作为备用数据');
              }
            }
          } catch (e) {
            console.error('加载备用缓存失败:', e);
          }
        }
        
        // 如果所有尝试都失败且没有数据显示错误提示
        if (this.recommendedTeams.length === 0) {
          uni.showToast({
            title: '获取推荐失败，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        }
      } finally {
        // 确保无论如何都会关闭加载状态
        this.loading = false;
        console.log('AI推荐数据加载完成，显示状态更新');
      }
    },

    // 刷新推荐
    refreshRecommendations() {
  
      
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
      this.getRecommendedTeams(true)
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
    },

    // 查看团队详情
    viewTeamDetail(id) {
      uni.navigateTo({
        url: `/pages/team/detail?id=${id}`
      });
    },

    // 跳转到个人资料页
    goToProfile() {
      uni.switchTab({
        url: '/pages/profile/index'
      });
    },
    
  }
}
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
      margin-left: 20rpx;
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