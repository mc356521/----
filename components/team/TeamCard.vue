<template>
  <!-- 组队卡片 -->
  <view 
    class="team-item card-hover animate__animated animate__fadeInUp"
    :style="{'animation-delay': animationDelay}"
    @click="goToDetail">
    <!-- 卡片顶部 -->
    <view class="team-top">
      <view class="flex-between">
        <view>
          <view class="title-with-icon">
            <text class="team-title">{{ team.title || team.name }}</text>
            <text v-if="showHotIcon" class="iconfont icon-spark hot-icon"></text>
            <view class="view-count">
              <text class="view-text">{{ team.viewCount }}</text>
            </view>
          </view>
          <view class="tag-row">
            <text class="tag orange-tag">{{ team.competitionName }}</text>
          </view>
        </view>
        <view>
          <text class="status-tag" :class="{'pulse': isPulse}">{{ team.statusText }}</text>
          <view class="date-info">截止: {{ team.deadline || team.recruitmentDeadlineFormatted }}</view>
        </view>
      </view>
    </view>
    
    <!-- 职位标签 -->
    <view class="role-tags" v-if="positions.length > 0">
      <view 
        v-for="(position, pIndex) in positions" 
        :key="pIndex" 
        class="role-tag">
        <text class="role-name">{{ position.name }}</text>
        <text 
          class="role-count" 
          :class="{
            'success': isFilled(position),
            'warning': !isFilled(position)
          }">
          {{ getCurrentCount(position) }}/{{ getTotalCount(position) }}
        </text>
      </view>
    </view>
    
    <!-- 描述文本 -->
    <view class="team-desc">{{ team.description }}</view>
    
    <!-- 成员信息和操作 -->
    <view class="team-bottom">
      <view class="flex-center">
        <view class="team-avatars">
          <template v-if="avatars && avatars.length > 0">
            <image 
              v-for="(avatar, aIndex) in avatars.slice(0, 3)" 
              :key="aIndex" 
              :src="avatar" 
              class="team-avatar">
            </image>
          </template>
          <view v-else class="empty-avatar">
            <text class="iconfont icon-user"></text>
          </view>
        </view>
        <text class="member-count">{{ getMemberCount() }}人已加入</text>
      </view>
      <view 
        v-if="canJoin"
        class="join-btn blue-join" 
        @click.stop="onApplyJoin">
        申请加入
      </view>
      <view 
        v-else
        class="join-btn gray-join">
        已组满
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// 组件属性
const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
});

// 组件事件
const emit = defineEmits(['detail', 'apply']);

// 计算属性
const animationDelay = computed(() => `${props.index * 0.1}s`);
const showHotIcon = computed(() => {
  // 判断条件: viewCount大于100
  return props.team.viewCount && props.team.viewCount > 100;
});

const isPulse = computed(() => {
  // 状态为招募中或status等于0时
  return props.team.status === '0' || props.team.statusText === '招募中';
});

const positions = computed(() => {
  // 兼容不同的数据结构
  return props.team.positions || props.team.roles || [];
});

const avatars = computed(() => {
  // 兼容两种不同的数据结构
  if (props.team.avatars) return props.team.avatars;
  if (props.team.teamMemberAvatars) {
    // 如果是字符串，尝试分割
    if (typeof props.team.teamMemberAvatars === 'string') {
      return props.team.teamMemberAvatars.split(',').filter(avatar => 
        avatar && !avatar.includes('.pdf')
      );
    }
    // 如果是数组，直接过滤
    if (Array.isArray(props.team.teamMemberAvatars)) {
      return props.team.teamMemberAvatars.filter(avatar => 
        avatar && !avatar.includes('.pdf')
      );
    }
  }
  return [];
});

const canJoin = computed(() => {
  // 判断是否可以加入
  return props.team.status === '0' || props.team.statusText === '招募中';
});

const hasProgress = computed(() => {
  return typeof props.team.teamProgress === 'number';
});

const hasMaxMember = computed(() => {
  return props.team.maxMemberCount !== null && props.team.maxMemberCount > 0;
});

// 方法
function isFilled(position) {
  const current = getCurrentCount(position);
  const total = getTotalCount(position);
  return current >= total;
}

function getCurrentCount(position) {
  return position.current || position.currentCount || 0;
}

function getTotalCount(position) {
  return position.total || position.requiredCount || 0;
}

function getMemberCount() {
  return props.team.memberCount || props.team.currentMemberCount || 0;
}

function goToDetail() {
  emit('detail', props.team.id);
}

function onApplyJoin() {
  emit('apply', props.team.id);
}
</script>

<style lang="scss">
// 颜色变量
$primary-color: #247ae4;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-color: #333333;
$text-secondary: #6B7280;
$text-muted: #344347;
$success-color: #10B981;
$warning-color: #F59E0B;
$hot-color: #F59E0B;
$shadow-sm: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
$shadow-md: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
$border-radius-lg: 16rpx;

// 动画
@keyframes sparkle {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// 混合器
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

// 卡片样式
.team-item {
  background-color: $card-color;
  border-radius: $border-radius-lg;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
  width: 100%;
  box-sizing: border-box;
  
  &.card-hover {
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .team-top {
    margin-bottom: 16rpx;
    
    .flex-between {
      @include flex-between;
      align-items: flex-start;
      flex-wrap: wrap;
      
      & > view {
        max-width: 100%;
      }
      
      .title-with-icon {
        display: flex;
        align-items: center;
        
        .team-title {
          font-size: 32rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .hot-icon {
          color: $hot-color;
          font-size: 28rpx;
          margin-left: 10rpx;
          animation: sparkle 1.5s infinite;
        }
      }
      
      .view-count {
        display: flex;
        align-items: center;
        margin-top: 6rpx;
        
        .view-text {
          color: $text-muted;
          font-size: 22rpx;
        }
      }
      
      .tag-row {
        display: flex;
        margin-top: 8rpx;
        
        .tag {
          font-size: 24rpx;
          padding: 4rpx 16rpx;
          border-radius: 8rpx;
          margin-right: 10rpx;
          
          &.orange-tag {
            background-color: #DBEAFE;
            color: #2563EB;
          }
        }
      }
      
      .status-tag {
        font-size: 24rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        background-color: #10B981;
        color: white;
        text-align: center;
        
        &.pulse {
          animation: pulse 2s infinite;
        }
      }
      
      .date-info {
        font-size: 22rpx;
        color: $text-muted;
        margin-top: 8rpx;
        text-align: right;
      }
    }
  }
  // 职位标签
  .role-tags {
    display: flex;
    flex-wrap: wrap;
    margin: 16rpx 0;
    gap: 12rpx;
    
    .role-tag {
      display: flex;
      align-items: center;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
      background-color: #F3F4F6;
      
      .role-name {
        font-size: 22rpx;
        color: $text-secondary;
      }
      
      .role-count {
        display: inline-block;
        margin-left: 8rpx;
        font-size: 22rpx;
        padding: 2rpx 8rpx;
        
        &.success {
          color: $success-color;
        }
        
        &.warning {
          color: $warning-color;
        }
      }
    }
  }
  
  .team-desc {
    font-size: 24rpx;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: 20rpx;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .team-bottom {
    @include flex-between;
    flex-wrap: wrap;
    
    .flex-center {
      @include flex-center;
      margin-bottom: 10rpx;
      
      .team-avatars {
        display: flex;
        margin-right: 10rpx;
        
        .team-avatar {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          border: 3rpx solid $card-color;
          margin-right: -16rpx;
          transition: transform 0.3s;
        }
        
        .empty-avatar {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          background-color: #F3F4F6;
          display: flex;
          justify-content: center;
          align-items: center;
          
          .iconfont {
            font-size: 24rpx;
            color: $text-muted;
          }
        }
      }
      
      .member-count {
        font-size: 22rpx;
        color: $text-muted;
        margin-left: 20rpx;
      }
      
      .max-count {
        font-size: 22rpx;
        color: $text-muted;
      }
    }
    
    .join-btn {
      padding: 8rpx 20rpx;
      border-radius: 100rpx;
      white-space: nowrap;
      font-size: 24rpx;
      text-align: center;
      
      &.blue-join {
        background-color: $primary-color;
        color: white;
      }
      
      &.gray-join {
        background-color: #E5E7EB;
        color: #9CA3AF;
      }
    }
  }
}
</style> 