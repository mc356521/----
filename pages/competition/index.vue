<template>
  <view class="container" ref="instance">
    <!-- 顶部导航栏 -->
    <view class="sticky-header">
      <view class="header-inner">
        <text class="page-title">竞赛广场</text>
        <view class="action-buttons">
          <view class="action-btn">
            <text class="iconfont icon-search"></text>
          </view>
          <view class="action-btn">
            <text class="iconfont icon-filter"></text>
          </view>
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

    <!-- 热门竞赛 -->
    <view class="section" v-if="hotCompetitions && hotCompetitions.length > 0">
      <view class="section-header">
        <text class="section-title">热门竞赛</text>
      </view>
      <swiper 
        class="hot-swiper" 
        :indicator="false" 
        :autoplay="true" 
        :interval="3000" 
        :duration="500"
        :circular="true"
        :current="currentHotIndex"
        @change="onSwiperChange">
        <swiper-item 
          v-for="(item, index) in hotCompetitions" 
          :key="index"
          class="hot-swiper-item">
          <view 
            class="hot-item" 
            @click="viewDetail(item.id)">
            <image class="hot-img" :src="item.coverImageUrl" mode="aspectFill"></image>
            <view class="hot-overlay">
              <text class="hot-title">{{ item.title }}</text>
              <text class="hot-desc">{{ item.shortDescription }}</text>
              <view class="hot-info">
                <view class="hot-info-item">
                  <text class="iconfont icon-calendar"></text>
                  <text class="hot-date">报名截止: {{ formatDate(item.registrationDeadline) }}</text>
                </view>
                <view class="hot-info-item">
                  <text class="iconfont icon-team"></text>
                  <text class="hot-team">{{ item.teamSize }}~{{ item.teamMax }}人</text>
                </view>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="dots-container">
        <view 
          v-for="(item, index) in hotCompetitions" 
          :key="index" 
          class="dot"
          :class="{ 'active-dot': currentHotIndex === index }"
          @click="switchToSlide(index)">
        </view>
      </view>
    </view>

    <!-- 竞赛列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新竞赛</text>
      </view>
      <view class="competition-list">
        <view 
          class="competition-card" 
          v-for="(item, index) in competitionList" 
          :key="index"
          @click="viewDetail(item.id)">
          <view class="card-image-wrapper">
            <image class="card-image" :src="item.coverImageUrl" mode="aspectFill"></image>
            <view class="status-badge" :class="getStatusClass(item.status)">
              {{ item.statusText }}
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-desc">{{ item.shortDescription }}</text>
            <view class="card-tags">
              <text class="category-tag" :class="getCategoryClass(item.categoryName)">{{ item.categoryName }}</text>
              <text class="level-tag">{{ item.level }}</text>
              <text class="team-tag">
                <text class="iconfont icon-team"></text> {{ item.teamSize }}~{{ item.teamMax }}人
              </text>
            </view>
            <view class="card-footer">
              <view class="date-info">
                <text class="iconfont icon-calendar"></text>
                <text class="date-text">{{ isUpcoming(item) ? '报名开始' : '报名截止' }}: {{ formatDate(isUpcoming(item) ? item.registrationStart : item.registrationDeadline) }}</text>
              </view>
              <view class="action-btn" :class="{'disabled-btn': item.status === '1'}">
                {{ item.status === '1' ? '提醒我' : '查看详情' }}
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多提示 -->
        <view class="loading-more" v-if="competitionList.length > 0">
          <text v-if="loading">加载中...</text>
          <text v-else-if="hasMore" @click="loadMore">点击加载更多</text>
          <text v-else>没有更多竞赛了</text>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="competitionList.length === 0 && !loading">
          <text class="empty-text">暂无竞赛数据</text>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar 
      active-tab="competition" 
      @tab-change="handleTabChange" 
      @publish="showPublishOptions">
    </tab-bar>
  </view>
</template>

<script>
import TabBar from '@/components/TabBar.vue';
import api from '@/api';

export default {
  components: {
    TabBar
  },
  data() {
    return {
      // 分类数据
      categories: ['全部竞赛', '学科竞赛', '创新创业', '科技竞赛', '文体竞赛'],
      currentCategory: 0,
      loading: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10,
      
      // 热门竞赛数据
      hotCompetitions: [],
      
      // 竞赛列表数据
      competitionList: [],
      
      // 热门竞赛轮播控制
      currentHotIndex: 0
    }
  },
  
  onLoad() {
    // 获取热门竞赛
    this.getHotCompetitions();
    // 获取最新竞赛列表
    this.getCompetitionList();
  },
  
  // 页面相关生命周期函数
  onPullDownRefresh() {
    this.onRefresh();
  },
  
  onReachBottom() {
    this.loadMore();
  },
  
  methods: {
    // 轮播切换事件
    onSwiperChange(e) {
      this.currentHotIndex = e.detail.current;
    },
    
    // 手动切换到指定轮播
    switchToSlide(index) {
      this.currentHotIndex = index;
    },
    
    // 获取热门竞赛数据
    async getHotCompetitions() {
      try {
        this.loading = true;
        const res = await api.competitions.getCompetitionsList({
          pageSize: 3,
          isHot: true
        });
        
        if (res && res.code === 200 && res.data && Array.isArray(res.data.list)) {
          this.hotCompetitions = res.data.list;
        } 
      } catch (error) {
        console.error('获取热门竞赛失败:', error);
        uni.showToast({
          title: '获取热门竞赛失败',
          icon: 'none'
        });
        // 确保错误发生时，热门竞赛仍然是一个空数组
        this.hotCompetitions = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 获取竞赛列表数据
    async getCompetitionList(reset = true) {
      try {
        if (reset) {
          this.currentPage = 1;
          this.competitionList = [];
        }
        
        if (!this.hasMore && !reset) return;
        
        this.loading = true;
        
        // 准备请求参数
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        };
        
        // 添加分类筛选
        if (this.currentCategory > 0) {
          // 根据分类索引映射到实际的分类ID
          const categoryMapping = [null, 1, 2, 3, 4]; // 全部=null, 学科竞赛=1, 创新创业=2, 科技竞赛=3, 文体竞赛=4
          params.categoryId = categoryMapping[this.currentCategory];
        }
        
        const res = await api.competitions.getCompetitionsList(params);
        
        if (res && res.code === 200 && res.data) {
          if (reset) {
            this.competitionList = Array.isArray(res.data.list) ? res.data.list : [];
          } else {
            if (Array.isArray(res.data.list)) {
              this.competitionList = [...this.competitionList, ...res.data.list];
            }
          }
          
          // 更新分页信息
          this.hasMore = res.data.hasNext || false;
          
          // 如果没有数据
          if (this.competitionList.length === 0) {
            uni.showToast({
              title: '暂无竞赛数据',
              icon: 'none'
            });
          }
        } else {
          // 接口请求失败时使用模拟数据
          console.log('获取竞赛列表失败，使用模拟数据');
          setTimeout(() => {
            this.competitionList = [
              {
                id: 1,
                title: '互联网+创新创业大赛',
                categoryName: '创新创业',
                level: '国家级',
                status: '0',
                statusText: '报名中',
                registrationDeadline: '2025-05-15T23:59:59',
                registrationStart: '2025-04-01T00:00:00',
                coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
                shortDescription: '国内顶级创新创业赛事，培养创新精神和实践能力',
                teamSize: 3,
                teamMax: 5,
                isHot: true
              },
              {
                id: 2,
                title: '全国大学生数学建模竞赛',
                categoryName: '学科竞赛',
                level: '国家级',
                status: '0',
                statusText: '报名中',
                registrationDeadline: '2025-08-20T23:59:59',
                registrationStart: '2025-07-15T00:00:00',
                coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500',
                shortDescription: '全国规模最大的数学建模竞赛',
                teamSize: 3,
                teamMax: 3,
                isHot: true
              },
              {
                id: 3,
                title: '挑战杯创业计划大赛',
                categoryName: '创新创业',
                level: '省级',
                status: '0',
                statusText: '报名中',
                registrationDeadline: '2025-06-10T23:59:59',
                registrationStart: '2025-05-01T00:00:00',
                coverImageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500',
                shortDescription: '中国大学生创业计划竞赛，侧重商业计划书',
                teamSize: 4,
                teamMax: 6,
                isHot: true
              },
              {
                id: 4,
                title: 'ACM程序设计大赛',
                categoryName: '科技竞赛',
                level: '校级',
                status: '1',
                statusText: '即将开始',
                registrationDeadline: '2025-06-01T23:59:59',
                registrationStart: '2025-05-25T00:00:00',
                coverImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
                shortDescription: '国际大学生程序设计竞赛，考验算法和编程能力',
                teamSize: 3,
                teamMax: 3,
                isHot: false
              }
            ];
          }, 300);
        }
      } catch (error) {
        console.error('获取竞赛列表失败:', error);
        uni.showToast({
          title: '获取竞赛列表失败',
          icon: 'none'
        });
        // 确保错误发生时，竞赛列表仍然是一个空数组
        if (reset) {
          this.competitionList = [];
        }
      } finally {
        this.loading = false;
      }
    },
    
    // 加载更多数据
    loadMore() {
      if (this.loading || !this.hasMore) return;
      this.currentPage++;
      this.getCompetitionList(false);
    },
    
    // 下拉刷新
    onRefresh() {
      this.getCompetitionList(true);
      this.getHotCompetitions();
      // 停止下拉刷新
      uni.stopPullDownRefresh();
    },
    
    // 获取分类对应的样式类
    getCategoryClass(category) {
      switch(category) {
        case '创新创业':
          return 'tag-orange';
        case '学科竞赛':
          return 'tag-green';
        case '科技竞赛':
          return 'tag-blue';
        case '文体竞赛':
          return 'tag-purple';
        default:
          return '';
      }
    },
    
    // 获取状态对应的样式类
    getStatusClass(status) {
      switch(status) {
        case '0':
          return 'status-active';
        case '1':
          return 'status-upcoming';
        case '2':
          return 'status-ended';
        default:
          return '';
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    },
    
    // 是否为报名前期
    isUpcoming(item) {
      return item.status === '1';
    },
    
    // 选择分类
    selectCategory(index) {
      if (this.currentCategory === index) return;
      this.currentCategory = index;
      // 根据分类重新获取数据
      this.getCompetitionList(true);
    },
    
    // 查看竞赛详情
    viewDetail(id) {
      uni.navigateTo({
        url: `/pages/competition/detail?id=${id}`
      });
    },
    
    // 处理标签切换
    handleTabChange(tab) {
      if (tab === 'home') {
        uni.switchTab({
          url: '/pages/index/index'
        });
      } else if (tab === 'team') {
        uni.switchTab({
          url: '/pages/team/list'
        });
      } else if (tab === 'profile') {
        uni.switchTab({
          url: '/pages/profile/index'
        });
      }
    },
    
    // 显示发布选项
    showPublishOptions() {
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
  }
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';

// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #9CA3AF;
$shadow-sm: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
$shadow-md: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
$border-radius-lg: 16rpx;
$border-radius-full: 100rpx;

// 分类标签颜色
$category-orange-bg: #FEF3C7;
$category-orange-text: #D97706;
$category-green-bg: #D1FAE5;
$category-green-text: #059669;
$category-blue-bg: #DBEAFE;
$category-blue-text: #2563EB;
$category-purple-bg: #EDE9FE;
$category-purple-text: #7C3AED;

// 状态标签颜色
$status-active-bg: #6B7280;
$status-upcoming-bg: #22d384;
$status-ended-bg: #EF4444;

// 混合器
@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

page {
  background-color: $background-color;
  font-family: 'Noto Sans SC', "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: 150rpx;
}

.container {
  display: flex;
  flex-direction: column;
}

// 顶部导航栏
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: $card-color;
  box-shadow: $shadow-sm;
  
  .header-inner {
    @include flex-between;
    padding: 20rpx 30rpx;
    
    .page-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-color;
    }
    
    .action-buttons {
      display: flex;
      gap: 20rpx;
      
      .action-btn {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
        background-color: #F3F4F6;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .iconfont {
          font-size: 36rpx;
          color: $text-secondary;
        }
      }
    }
  }
  
  // 分类标签滚动区域
  .category-scroll {
    width: 100%;
    white-space: nowrap;
    padding: 16rpx 20rpx;
    
    .category-list {
      display: inline-flex;
      gap: 16rpx;
      padding: 0 10rpx;
      
      .category-item {
        display: inline-block;
        padding: 13rpx 13rpx;
        border-radius: $border-radius-full;
        background-color: #F3F4F6;
        font-size: 26rpx;
        color: $text-secondary;
        transition: all 0.3s;
        
        &.active-category {
          background-color: $primary-color;
          color: $card-color;
        }
      }
    }
  }
}

// 热门竞赛滚动区域
.section {
  padding: 30rpx 0;
  
  .section-header {
    padding: 0 30rpx 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-color;
    }
  }
  
  .hot-swiper {
    width: 100%;
    height: 340rpx;
    
    .hot-swiper-item {
      display: flex;
      justify-content: center;
      padding: 0 30rpx;
      box-sizing: border-box;
      
      .hot-item {
        position: relative;
        width: 680rpx;
        height: 340rpx;
        border-radius: $border-radius-lg;
        overflow: hidden;
        box-shadow: $shadow-md;
        transition: transform 0.3s ease;
        
        &:active {
          transform: scale(0.98);
        }
        
        .hot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hot-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 20rpx;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          
          .hot-title {
            font-size: 28rpx;
            font-weight: bold;
            color: white;
            margin-bottom: 8rpx;
          }
          
          .hot-desc {
            font-size: 24rpx;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 12rpx;
            white-space: normal;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .hot-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .hot-info-item {
              @include flex-center;
              
              .iconfont {
                font-size: 22rpx;
                color: rgba(255, 255, 255, 0.8);
                margin-right: 6rpx;
              }
              
              .hot-date, .hot-team {
                font-size: 22rpx;
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }
        }
      }
    }
  }
  
  .dots-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12rpx;
    margin-top: 20rpx;
    
    .dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      background-color: #E5E7EB;
      transition: all 0.3s ease;
      opacity: 0.6;
      
      &.active-dot {
        width: 24rpx;
        height: 12rpx;
        border-radius: 6rpx;
        background-color: $primary-color;
        opacity: 1;
      }
    }
  }
}

// 竞赛列表
.competition-list {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  
  .competition-card {
    background-color: $card-color;
    border-radius: $border-radius-lg;
    overflow: hidden;
    box-shadow: $shadow-sm;
    transition: transform 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .card-image-wrapper {
      position: relative;
      height: 240rpx;
      overflow: hidden;
      
      .card-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .status-badge {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        font-size: 22rpx;
        color: white;
        
        &.status-active {
          background-color: $status-active-bg;
        }
        
        &.status-upcoming {
          background-color: $status-upcoming-bg;
        }
        
        &.status-ended {
          background-color: $status-ended-bg;
        }
      }
    }
    
    .card-content {
      padding: 24rpx;
      
      .card-title {
        font-size: 32rpx;
        font-weight: bold;
        color: $text-color;
        margin-bottom: 12rpx;
      }
      
      .card-desc {
        font-size: 24rpx;
        color: $text-secondary;
        margin-bottom: 16rpx;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
      }
      
      .card-tags {
        @include flex-center;
        gap: 16rpx;
        margin-bottom: 20rpx;
        
        .category-tag {
          padding: 4rpx 16rpx;
          border-radius: 8rpx;
          font-size: 22rpx;
          
          &.tag-orange {
            background-color: $category-orange-bg;
            color: $category-orange-text;
          }
          
          &.tag-green {
            background-color: $category-green-bg;
            color: $category-green-text;
          }
          
          &.tag-blue {
            background-color: $category-blue-bg;
            color: $category-blue-text;
          }
          
          &.tag-purple {
            background-color: $category-purple-bg;
            color: $category-purple-text;
          }
        }
        
        .level-tag, .team-tag {
          font-size: 22rpx;
          color: $text-muted;
        }
        
        .team-tag {
          @include flex-center;
          
          .iconfont {
            margin-right: 4rpx;
          }
        }
      }
      
      .card-footer {
        @include flex-between;
        
        .date-info {
          @include flex-center;
          
          .iconfont {
            font-size: 24rpx;
            color: $text-muted;
            margin-right: 6rpx;
          }
          
          .date-text {
            font-size: 24rpx;
            color: $text-muted;
          }
        }
        
        .action-btn {
          padding: 8rpx 20rpx;
          border-radius: $border-radius-full;
          background-color: $primary-color;
          color: white;
          font-size: 24rpx;
          
          &.disabled-btn {
            background-color: #E5E7EB;
            color: $text-muted;
          }
        }
      }
    }
  }
}

// 加载更多提示
.loading-more {
  text-align: center;
  padding: 30rpx 0;
  color: $text-muted;
  font-size: 26rpx;
}

// 空状态
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
  
  .empty-text {
    font-size: 28rpx;
    color: $text-muted;
  }
}
</style> 