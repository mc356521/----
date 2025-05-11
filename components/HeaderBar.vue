<template>
  <view class="sticky-header">
    <view class="header-title">
      <view class="back-btn" @click="goBack" v-if="!isTabBarPage">
        <text class="iconfont icon-back"></text>
      </view>
      <text class="section-title">{{ title }}</text>
      <view class="header-actions">

        <view class="action-btn" @click="onSearch" v-if="showSearch">
          <text class="iconfont icon-search"></text>
        </view>
        <view class="action-btn message-btn" @click="onFilter" v-if="showFilter">
          <text class="iconfont icon-message"></text>
          <view class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
        <slot name="actions"></slot>
      </view>
    </view>
    
    <!-- 分类标签 -->
    <scroll-view scroll-x="true" class="category-scroll" v-if="categories && categories.length > 0">
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
    
    <slot></slot>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import notificationsApi from '@/api/modules/notifications';

// tabBar页面路径列表
const tabBarPages = [
  'pages/index/index',
  'pages/competition/index',
  'pages/team/list',
  'pages/profile/index'
];

// 组件属性
const props = defineProps({
  title: {
    type: String,
    default: '页面标题'
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  showAiRecommend: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  defaultCategory: {
    type: Number,
    default: 0
  }
});

// 当前选中的分类
const currentCategory = ref(props.defaultCategory);

// 未读消息数量
const unreadCount = ref(0);

// 判断当前页面是否为tabBar页面
const isTabBarPage = computed(() => {
  const pages = getCurrentPages();
  if (pages.length === 0) return true; // 默认为true，避免首页误显示返回按钮
  
  const currentPage = pages[pages.length - 1];
  const currentRoute = currentPage.route || '';
  
  return tabBarPages.includes(currentRoute);
});

// 计算HeaderBar的高度
const headerHeight = computed(() => {
  // 基础高度（标题栏）
  let height = 90; //   
  
  // 如果有分类标签，添加分类标签高度
  if (props.categories && props.categories.length > 0) {
    height += 70; // rpx，包含分类标签高度和上下padding
  }
  
  return height;
});

// 定义事件
const emit = defineEmits(['search', 'filter', 'category-change', 'ai-recommend', 'back']);

// 搜索按钮点击事件
function onSearch() {
  emit('search');
}

// 消息按钮点击事件
function onFilter() {
  uni.navigateTo({
    url: '/pages/Xiaoxi/Xiaoxi'
  });
}

// 选择分类事件
function selectCategory(index) {
  if (currentCategory.value === index) return;
  
  currentCategory.value = index;
  emit('category-change', index);
}

// 返回按钮点击事件
function goBack() {
  emit('back');
  
  // 默认返回行为
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    // 如果没有上一页，跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    });
  }
}

// 获取未读消息数量 - 从API直接获取
async function fetchUnreadCount() {
  try {
    const res = await notificationsApi.getUnreadCount();
    if (res.code === 200 && res.data !== undefined) {
      unreadCount.value = res.data;
      
      // 同步到全局状态
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.unreadNotificationCount = res.data;
        
        // 安全地更新TabBar角标
        try {
          if (app.updateMessageBadge) {
            app.updateMessageBadge();
          }
        } catch (error) {
          console.log('HeaderBar: 更新TabBar徽标失败', error);
          // 错误已处理，不再抛出
        }
      }
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
  }
}

// 从全局状态获取未读消息数量（作为备用方法）
function getUnreadMessageCount() {
  const app = getApp();
  if (app && app.globalData) {
    unreadCount.value = app.globalData.unreadNotificationCount || 0;
  }
}

// AI推荐按钮点击事件
function onAiRecommend() {
  emit('ai-recommend');
}

// 对外暴露高度属性
defineExpose({
  headerHeight,
  unreadCount,
  fetchUnreadCount, // 暴露刷新未读数方法，供父组件调用
  isTabBarPage // 暴露tabBar页面状态
});

// 获取实际的安全区域高度
let safeAreaHeight = ref(0);
let timer = null;

onMounted(() => {
  // 在不同平台上获取顶部安全区域高度
  uni.getSystemInfo({
    success: (res) => {
      if (res.safeArea && res.safeArea.top) {
        safeAreaHeight.value = res.safeArea.top;
      }
    }
  });
  
  // 首先尝试从API获取未读消息数量
  fetchUnreadCount();
  
  // 设置定时器，每隔30秒更新一次未读消息数量
  timer = setInterval(() => {
    fetchUnreadCount();
  }, 30000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style lang="scss">
@import '../config/theme.scss';

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 顶部导航栏
.sticky-header {
  position: fixed;
  top: 0rpx;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: $card-color;
  box-shadow: $shadow-sm;
  /* 确保iOS设备上也能正常固定 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  /* 添加安全区域适配 */
  padding-top: env(safe-area-inset-top); // 适配刘海屏
  width: 100%;
  
  .header-title {
    @include flex-between;
    padding: 40rpx $spacing-lg;
    
    .back-btn {
      width: 70rpx;
      height: 70rpx;
      border-radius: 50%;
      background-color: $tag-gray-bg;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10rpx;
      
      .iconfont {
        font-size: 36rpx;
        color: $text-secondary;
      }
      
      &:active {
        opacity: 0.7;
      }
    }
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-color;
      flex: 1;
    }
    
    .header-actions {
      display: flex;
      gap: $spacing-md;
      
      .action-btn {
        width: 70rpx;
        height: 70rpx;
        border-radius: 50%;
        background-color: $tag-gray-bg;
        display: flex;
        align-items: center;
        justify-content: center;
      
        .iconfont {
          font-size: 36rpx;
          color: $text-secondary;
        }
        
        &.message-btn {
          position: relative;
          
          .badge {
            position: absolute;
            top: -15rpx;
            right: -15rpx;
            min-width: 36rpx;
            height: 36rpx;
            border-radius: 18rpx;
            background-color: $danger-color;
            color: #fff;
            font-size: 22rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 8rpx;
          }
        }
        
        &.ai-recommend-btn {
          background: linear-gradient(135deg, #4facfe, #64f38c);
          
          .iconfont {
            color: #fff;
          }
        }
      }
    }
  }
  
  // 分类标签
  .category-scroll {
    width: 100%;
    white-space: nowrap;
    padding: $spacing-sm $spacing-md;
    overflow-x: auto;
    /* 隐藏滚动条但保留滚动功能 */
    &::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    
    .category-list {
      display: inline-flex;
      flex-wrap: nowrap;
      gap: 10rpx;
      padding: 0 $spacing-xs;
      
      .category-item {
        display: inline-block;
        padding: 10rpx 16rpx;
        border-radius: $border-radius-full;
        background-color: $tag-gray-bg;
        font-size: 24rpx;
        color: $text-secondary;
        transition: all 0.3s;
        
        &.active-category {
          background-color: $primary-color;
          color: $text-light;
        }
      }
    }
  }
}
</style> 