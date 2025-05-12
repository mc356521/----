<template>
  <view class="svg-icon-container" :style="iconStyle">
    <!-- 使用编码后的base64图片作为fallback -->
    <image 
      v-if="useFallback" 
      :src="fallbackSrc" 
      mode="aspectFit" 
      class="svg-image"
      @error="handleError"
    ></image>
    <!-- 使用静态div显示SVG内容 -->
    <!-- eslint-disable vue/no-v-text-v-html-on-component -->
    <view v-else class="svg-content" v-html="svgHtml"></view>
    <!-- eslint-enable vue/no-v-text-v-html-on-component -->
  </view>
</template>

<script setup>
import { computed, ref, onMounted, watchEffect } from 'vue';
import { icons } from '@/static/svg/icons.js';

const props = defineProps({
  // 图标名称（与icons.js中的导出名称一致）
  name: {
    type: String,
    required: true
  },
  // 图标颜色（某些SVG支持颜色更改）
  color: {
    type: String,
    default: ''
  },
  // 图标大小
  size: {
    type: [Number, String],
    default: 24
  }
});

// 状态
const useFallback = ref(false);
const loadFailed = ref(false);
// 静态SVG HTML字符串，避免响应式
const svgHtml = ref('');

// 通过环境判断策略选择
const isMP = ref(false); // 是否是小程序环境

// 默认的fallback图标
const defaultFallbackIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAADCgAwAEAAAAAQAAADAAAAAA9+0L2AAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGV7hBwAAAWlJREFUaAXtmLEOAiEQRFmNhYXGyt7Ozs7a3v//BL/EeJvsBh1Fkzi8xLAMbIC5eS+XK7fbzUopxUktpRT9/S5M/K5Kpafyn+J3lW8YJZUYsUDATkACCDigEAwBCSgg4IBCMASUU0C5/DYYl+86XyxWx7lXP9p0PqyjhW1XoPYC24X8GhJQQAEHFIIhIAEFBBxQCIaABAQEnB9fYi+Pq7FX/bjO51j2a3NfxvVnc+7H8UDXe/M0D+wDSEABBxxQCIaABBQQcEAhGAISUEDAAYVgCEhAAQEHFIIhIAEFBBxQCIaABJbzQAghhGD8uUZ88uvrNe73u3k8Hubxnlc3jDGaj1k/z6ZPyONt3ufPKlR/gdmlLZsUUEABBxSCISABBQQcUAiGgAQUEHBAIRgCElBAwAGFYAhIQAEBBxSCIbCcB+ov5Dbvaxuou5yl7UJ+FQkoIAEHFIIhIAEFBBxQCIaABBQQcODvhfyYXSZ9dCWDAAAAAElFTkSuQmCC';

onMounted(() => {
  // 检测当前环境
  // #ifdef MP
  isMP.value = true;
  useFallback.value = true; // 小程序环境直接使用图片方式
  // #endif
  
  // 初始化SVG内容
  initSvgContent();
});

// 初始化SVG内容，非响应式处理
function initSvgContent() {
  try {
    const svgContent = icons[props.name];
    if (!svgContent) {
      console.error('未找到图标:', props.name);
      return;
    }
    
    // 应用颜色
    let finalSvg = svgContent;
    
    // 修改SVG的宽高属性，保持viewBox不变
    finalSvg = finalSvg.replace(/(width|height)=["']([^"']*)["']/g, '');
    
    // 颜色处理：优先使用props.color，不同情况处理
    if (props.color) {
      if (finalSvg.includes('fill=')) {
        // 替换已有的fill属性
        finalSvg = finalSvg.replace(/fill="[^"]*"/g, `fill="${props.color}"`);
      }
      
      // 处理使用currentColor的情况
      finalSvg = finalSvg.replace(/fill="currentColor"/g, `fill="${props.color}"`);
    }
    
    // 确保SVG标签有preserveAspectRatio属性，以正确缩放
    if (!finalSvg.includes('preserveAspectRatio')) {
      finalSvg = finalSvg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ');
    }
    
    // 设置为静态值，避免响应式
    svgHtml.value = finalSvg;
  } catch (e) {
    console.error('初始化SVG内容失败:', e);
    useFallback.value = true;
  }
}

// 监听props变化，更新SVG内容
watchEffect(() => {
  // 当name或color改变时更新SVG内容
  initSvgContent();
});

// 计算降级使用的图片URL
const fallbackSrc = computed(() => {
  try {
    if (loadFailed.value) {
      return defaultFallbackIcon;
    }
    
    // 尝试提取图标
    const svgString = icons[props.name];
    if (!svgString) {
      return defaultFallbackIcon;
    }
    
    // 在小程序环境下，使用静态图标或转为data:image/svg+xml,格式
    const encodedSvg = encodeURIComponent(svgString);
    return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  } catch (e) {
    console.error('生成图标URL失败:', e);
    return defaultFallbackIcon;
  }
});

// 处理图标加载失败
function handleError() {
  console.error('图标加载失败:', props.name);
  loadFailed.value = true;
}

// 计算图标样式
const iconStyle = computed(() => {
  const style = {};
  
  // 根据传入的size设置图标大小
  let sizeValue = props.size;
  
  // 处理数字格式
  if (typeof sizeValue === 'number' || !isNaN(Number(sizeValue))) {
    const size = Number(sizeValue);
    style.width = `${size}px`;
    style.height = `${size}px`;
  } 
  // 处理字符串格式
  else if (typeof sizeValue === 'string') {
    if (sizeValue.includes('rpx') || sizeValue.includes('px') || sizeValue.includes('%')) {
      style.width = sizeValue;
      style.height = sizeValue;
    } else {
      style.width = `${sizeValue}px`;
      style.height = `${sizeValue}px`;
    }
  }
  
  // 如果设置了颜色且不能在SVG中直接修改fill
  if (props.color) {
    style.color = props.color;
  }
  
  return style;
});
</script>

<style>
.svg-icon-container {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  overflow: hidden;
}

.svg-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-content svg {
  width: 100%;
  height: 100%;
}

.svg-image {
  width: 100%;
  height: 100%;
  display: block;
}
</style> 