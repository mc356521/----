<template>
  <view class="sticky-header">
    <view class="header-title">
      <text class="section-title">{{ title }}</text>
      <view class="header-actions">
        <view class="action-btn" @click="onSearch" v-if="showSearch">
          <text class="iconfont icon-search"></text>
        </view>
        <view class="action-btn" @click="onFilter" v-if="showFilter">
          <text class="iconfont icon-filter"></text>
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
import { ref, computed, onMounted } from 'vue';

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
const emit = defineEmits(['search', 'filter', 'category-change']);

// 搜索按钮点击事件
function onSearch() {
  emit('search');
}

// 筛选按钮点击事件
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

// 对外暴露高度属性
defineExpose({
  headerHeight
});

// 获取实际的安全区域高度
let safeAreaHeight = ref(0);
onMounted(() => {
  // 在不同平台上获取顶部安全区域高度
  uni.getSystemInfo({
    success: (res) => {
      if (res.safeArea && res.safeArea.top) {
        safeAreaHeight.value = res.safeArea.top;
      }
    }
  });
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
  top: 0;
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
    padding: $spacing-md $spacing-lg;
    
    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-color;
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