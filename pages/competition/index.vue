<template>
  <view class="container" ref="instance">
    <!-- 顶部导航栏 -->
    <header-bar
      ref="headerBarRef"
      title="竞赛广场"
      :categories="categories"
      :default-category="currentCategory"
      show-filter="true"
      @search="goToSearch"
      @filter="goToNotification"
      @category-change="selectCategory"
    ></header-bar>
    
    <!-- 导航栏占位 -->
    <view class="header-placeholder" :style="{ height: headerPlaceholderHeight }"></view>

    <!-- 竞赛内容区域 -->
    <scroll-view scroll-y="true" class="competition-content" @scrolltolower="loadMore">
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
                    <text class="hot-date">报名截止: {{ formatDate(item.registrationDeadline) }}</text>
                  </view>
                  <view class="hot-info-item">
                       <SvgIcon name="Baominrenshulunbotu" ></SvgIcon>
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
                <text class="level-tag">
                  <SvgIcon name="dengji" size="18" style="padding-bottom: 15rpx;"/>
                  {{ item.level }}
                </text>
                <text class="team-tag">
                  <SvgIcon name="baomingrhenshu2" size="20" style="padding-bottom: 10rpx;" />
                  {{ item.participantCount || 0 }}人已报名
                </text>
              </view>
              <view class="card-footer">
                <view class="date-info">
                  <text class="date-text">{{ isUpcoming(item) ? '报名开始' : '报名截止' }}: {{ formatDate(isUpcoming(item) ? item.registrationStart : item.registrationDeadline) }}</text>
                </view>
                <view class="action-btn" :class="{'disabled-btn': item.status === '0' || item.status === '3'}">
                  {{ getActionText(item.status) }}
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
    </scroll-view>
    
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
import HeaderBar from '@/components/HeaderBar.vue';
import { icons } from '@/static/svg/icons.js';
import SvgIcon from '@/components/SvgIcon.vue';
export default {
  components: {
    TabBar,
    HeaderBar,
    SvgIcon
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
      currentHotIndex: 0,
      
      // HeaderBar占位高度
      headerPlaceholderHeight: '200rpx',
      
      // 导入SVG图标
      icons: icons
    }
  },
  
  onLoad() {
    // 获取热门竞赛
    this.getHotCompetitions();
    // 获取最新竞赛列表
    this.getCompetitionList();
    // 计算HeaderBar高度
    this.updateHeaderHeight();
  },
  
  mounted() {
    // 获取HeaderBar组件引用
    setTimeout(() => {
      this.updateHeaderHeight();
    }, 300);
  },
  
  // 页面相关生命周期函数
  onPullDownRefresh() {
    this.onRefresh();
  },
  
  onReachBottom() {
    this.loadMore();
  },
  
  methods: {
    // 更新HeaderBar占位高度
    updateHeaderHeight() {
      const headerBarRef = this.$refs.headerBarRef;
      if (headerBarRef && headerBarRef.headerHeight) {
        this.headerPlaceholderHeight = headerBarRef.headerHeight + 'rpx';
      } else {
        // 根据是否有分类决定高度
        this.headerPlaceholderHeight = this.categories.length > 0 ? '200rpx' : '120rpx';
      }
    },
    
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
          return 'status-upcoming';  // 未开始 - 灰色
        case '1':
          return 'status-active';    // 报名中 - 绿色
        case '2':
          return 'status-ongoing';   // 进行中 - 蓝色
        case '3':
          return 'status-ended';     // 已截止 - 灰色
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
    
    // 是否为报名前期（未开始）
    isUpcoming(item) {
      return item.status === '0';
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
    goToNotification() {
      uni.navigateTo({
        url: '/pages/Xiaoxi/Xiaoxi'
      });
    },
    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/search/index'
      });
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
    },
    
    // 获取操作按钮文本
    getActionText(status) {
      switch(status) {
        case '0':
          return '提醒我';
        case '1':
        case '2':
          return '查看详情';
        case '3':
          return '查看结果';
        default:
          return '查看详情';
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../static/iconfont.css';
@import '@/config/theme.scss';

// 颜色变量
$primary-color: #247ae4;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #344347;
$text-muted2: #d6d6d6;
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
$status-active-bg: #10b981;    // 报名中 - 绿色
$status-upcoming-bg: #6b7280;  // 未开始 - 灰色
$status-ongoing-bg: #2679cc;   // 进行中 - 蓝色  
$status-ended-bg: #6b7280;     // 已截止 - 灰色
$status-color-bg: #2679cc;     // 底部按钮 - 蓝色

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
  min-height: 100vh;
}

// HeaderBar占位区域
.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

// 竞赛内容区域
.competition-content {
  flex: 1;
  padding: 60rpx 30rpx 150rpx 30rpx;
  box-sizing: border-box;
  width: 100%;
}

// 热门竞赛滚动区域
.section {
  padding-bottom: 30rpx;
  
  .section-header {
    padding: 0 0 20rpx 0;
    
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
  padding: 0;
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
        
        &.status-ongoing {
          background-color: $status-ongoing-bg;
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
        flex-wrap: wrap;
        margin-bottom: 20rpx;
        .category-tag {
          padding: 4rpx 0rpx;
          border-radius: 6rpx;
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
          @include flex-center;
          font-size: 25rpx;
          color: $text-muted;
          margin-right: 26rpx;
          .icon-image {
            width: 30rpx;
            height: 30rpx;
            margin-right: 6rpx;
          }
          .icon-image2 {
            width: 30rpx;
            height: 30rpx;
        
            margin-right: 6rpx;
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
          @include flex-center;
          padding: 8rpx 20rpx;
          border-radius: $border-radius-full;
          background-color: $status-color-bg;
          color: rgb(255, 255, 255);
          font-size: 24rpx;
          
          .btn-icon {
            width: 24rpx;
            height: 24rpx;
            margin-right: 6rpx;
          }
          
          &.disabled-btn {
            background-color: #e5e7eb;
            color: #9ca3af;
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