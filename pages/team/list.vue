<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="header-title">
        <text class="section-title">组队广场</text>
        <view class="header-actions">
          <text class="iconfont icon-search"></text>
          <text class="iconfont icon-filter"></text>
        </view>
      </view>
      
      <!-- 分类标签 -->
      <scroll-view scroll-x="true" class="category-scroll">
        <view class="category-list">
          <view 
            v-for="(category, index) in categories" 
            :key="index" 
            class="category-item"
            :class="currentCategory === index ? 'active-category' : ''"
            @click="selectCategory(index)">
            <text>{{ category }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 组队列表 -->
    <scroll-view scroll-y="true" class="team-list">
      <!-- 使用团队卡片组件 -->
      <template v-if="teamData.data && teamData.data.list && teamData.data.list.length > 0">
        <team-card
          v-for="(team, index) in teamData.data.list"
          :key="team.id"
          :team="team"
          :index="index"
          @detail="goToTeamDetail"
          @apply="applyToJoin"
        ></team-card>
      </template>
      
      <!-- 空状态提示 -->
      <view v-else class="empty-state">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>
    
    <!-- 悬浮创建按钮 -->
    <view class="publish-btn-container">
      <view class="publish-btn pulse" @click="createTeam">
        <text class="iconfont icon-plus"></text>
      </view>
      <text class="publish-text">创建</text>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar 
      active-tab="team" 
      @tab-change="handleTabChange" 
      @publish="showPublishOptions"
    ></tab-bar>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TeamCard from '@/components/team/TeamCard.vue';
import TabBar from '@/components/TabBar.vue';

// 分类数据
const categories = ref(['全部', '学科竞赛', '创新创业', '体育竞赛', '文艺比赛']);
const currentCategory = ref(0);

// 模拟API响应数据
const teamData = ref({
  code: 200,
  message: "操作成功",
  data: {
    pageNum: 1,
    pageSize: 10,
    total: 8,
    pages: 1,
    list: [],
    hasPrevious: false,
    hasNext: false
  }
});

// 页面加载
onMounted(() => {
  console.log('组队列表页面加载');
  // 模拟API获取数据
  setTimeout(() => {
    teamData.value = {
      code: 200,
      message: "操作成功",
      data: {
        pageNum: 1,
        pageSize: 10,
        total: 8,
        pages: 1,
        list: [
          {
            "id": 8,
            "name": "创意无限",
            "competitionId": 7,
            "competitionTitle": "全国大学生广告艺术大赛",
            "competitionCategoryName": "艺术设计",
            "description": "广告大赛团队，需要平面设计和文案",
            "recruitmentDeadlineFormatted": "2023-05-01",
            "status": "0",
            "statusText": "组队中",
            "viewCount": 70,
            "leaderId": 6,
            "leaderName": "孙教授",
            "leaderAvatarUrl": null,
            "teamMemberAvatars": [],
            "currentMemberCount": 0,
            "maxMemberCount": null,
            "teamProgress": 0,
            "roles": []
          },
          {
            "id": 4,
            "name": "创客联盟",
            "competitionId": 3,
            "competitionTitle": "中国\"互联网+\"大学生创新创业大赛",
            "competitionCategoryName": "创新创业",
            "description": "互联网+创业项目，寻找市场和技术的合伙人",
            "recruitmentDeadlineFormatted": "2023-05-20",
            "status": "2",
            "statusText": "已结束",
            "viewCount": 200,
            "leaderId": 7,
            "leaderName": "周七",
            "leaderAvatarUrl": "/uploads/tasks/2023/01/03/ghi789.pdf",
            "teamMemberAvatars": [
              "/uploads/tasks/2023/01/03/ghi789.pdf"
            ],
            "currentMemberCount": 1,
            "maxMemberCount": 3,
            "teamProgress": 33,
            "roles": [
              {
                "id": 10,
                "teamId": 4,
                "name": "硬件工程师",
                "requiredCount": 2,
                "currentCount": 1,
                "recruitmentProgress": 50,
                "description": "负责电路设计和PCB绘制"
              }
            ]
          },
          {
            "id": 1,
            "name": "代码之星",
            "competitionId": 1,
            "competitionTitle": "ACM国际大学生程序设计竞赛",
            "competitionCategoryName": "程序设计",
            "description": "寻找有ACM竞赛经验的队友，目标区域赛金奖",
            "recruitmentDeadlineFormatted": "2023-04-20",
            "status": "0",
            "statusText": "组队中",
            "viewCount": 120,
            "leaderId": 1,
            "leaderName": "张三",
            "leaderAvatarUrl": "/uploads/avatars/2023/01/01/abc123.jpg,/uploads/tasks/2023/01/04/jkl012.jpg",
            "teamMemberAvatars": [
              "/uploads/avatars/2023/01/01/abc123.jpg",
              "/uploads/tasks/2023/01/04/jkl012.jpg"
            ],
            "currentMemberCount": 2,
            "maxMemberCount": 5,
            "teamProgress": 40,
            "roles": [
              {
                "id": 1,
                "teamId": 1,
                "name": "算法选手",
                "requiredCount": 3,
                "currentCount": 1,
                "recruitmentProgress": 33,
                "description": "负责解决复杂算法问题"
              }
            ]
          }
        ],
        hasPrevious: false,
        hasNext: false
      }
    };
  }, 200);
});

// 选择分类
function selectCategory(index) {
  currentCategory.value = index;
  // 根据分类筛选数据
}

// 跳转到团队详情
function goToTeamDetail(teamId) {
  uni.navigateTo({
    url: `/pages/team/detail?id=${teamId}`
  });
}

// 申请加入团队
function applyToJoin(teamId) {
  // 阻止冒泡，防止触发卡片点击事件
  uni.showModal({
    title: '申请确认',
    content: '确定要申请加入该团队吗？',
    success: function (res) {
      if (res.confirm) {
        uni.showToast({
          title: '申请已发送',
          icon: 'success'
        });
      }
    }
  });
}

// 创建团队
function createTeam() {
  uni.navigateTo({
    url: '/pages/team/create'
  });
}

// 处理标签切换
function handleTabChange(tab) {
  if (tab === 'home') {
    uni.switchTab({
      url: '/pages/index/index'
    });
  } else if (tab === 'competition') {
    uni.switchTab({
      url: '/pages/competition/index'
    });
  } else if (tab === 'profile') {
    uni.switchTab({
      url: '/pages/profile/index'
    });
  }
}

// 显示发布选项
function showPublishOptions() {
  uni.showActionSheet({
    itemList: ['发布竞赛信息', '招募队友', '发布项目展示'],
    success: function (res) {
      uni.showToast({
        title: `选择了: ${res.tapIndex}`,
        icon: 'none'
      });
    }
  });
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '../../static/animate.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #000000;
$card-color: #222222;
$text-color: #ffffff;
$text-secondary: #b3b3b3;
$text-muted: #9CA3AF;

// 动画
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// 基础样式
page {
  background-color: $background-color;
  color: $text-color;
  height: 100%;
  padding-bottom: 150rpx;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
}

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 顶部导航栏
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: $background-color;
  
  .header-title {
    @include flex-between;
    padding: 30rpx 30rpx 20rpx 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .header-actions {
      display: flex;
      gap: 30rpx;
      
      .iconfont {
        font-size: 40rpx;
        color: $text-color;
      }
    }
  }
  
  // 分类标签
  .category-scroll {
    width: 100%;
    white-space: nowrap;
    padding: 10rpx 20rpx 10rpx 30rpx;
    
    .category-list {
      display: inline-flex;
      gap: 20rpx;
      padding-right: 30rpx;
      
      .category-item {
        display: inline-block;
        padding: 12rpx 30rpx;
        border-radius: 30rpx;
        background-color: #222222;
        font-size: 24rpx;
        color: #999999;
        
        &.active-category {
          background-color: $primary-color;
          color: $text-color;
        }
      }
    }
  }
}

// 组队列表
.team-list {
  flex: 1;
  padding: 30rpx 30rpx 120rpx 30rpx;
  box-sizing: border-box;
  width: 100%;
}

// 空状态
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}

// 创建团队按钮
.publish-btn-container {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  z-index: 100;
  
  .publish-btn {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: linear-gradient(to right, #3B82F6, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.3);
  }
  
  .publish-text {
    font-size: 22rpx;
    color: $text-muted;
    margin-top: 10rpx;
  }
}
</style> 