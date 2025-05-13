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
            <SvgIcon v-if="showHotIcon" name="remen" size="20" class="hot-icon"></SvgIcon>
            <view class="view-count">
              <text class="view-text">{{ team.viewCount }}</text>
            </view>
          </view>
          <view class="tag-row">
            <text class="tag orange-tag">{{ team.competitionName }}</text>
          </view>
        </view>
        <view>
          <text class="status-tag" :class="[{'pulse': isPulse}, getStatusClass]">{{ team.statusText }}</text>
          <view class="date-info">截止: {{ team.deadline || team.recruitmentDeadlineFormatted }}</view>
        </view>
      </view>
    </view>
    
    <!-- 匹配度信息 -->
    <view class="match-info" v-if="showMatch && team.matchScore">
      <view class="match-score">
        <view class="score-bar">
          <view class="score-fill" :style="{ width: `${team.matchScore}%` }"></view>
        </view>
        <text class="score-text">匹配度 {{ team.matchScore }}%</text>
      </view>
      <view class="recommend-role" v-if="team.recommendedRole">
        <text class="role-label">推荐角色: </text>
        <text class="role-text">{{ team.recommendedRole }}</text>
      </view>
      <view class="match-reason" v-if="team.matchReason || team.recommendReason">
        <text class="reason-label">匹配理由: </text>
        <text class="reason-text">{{  team.recommendReason }}</text>
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
        <!-- 当有成员时显示头像 -->
        <view class="team-avatars" v-if="hasMembers">
          <image 
            v-for="(avatar, aIndex) in avatars.slice(0, 3)" 
            :key="aIndex" 
            :src="avatar" 
            class="team-avatar">
          </image>
        </view>
        <!-- 无成员时显示的空状态设计 -->
        <view v-else class="empty-team-state">
          <view class="empty-avatar">
            <SvgIcon name="Baominrenshu" size="20" class="avatar-icon"></SvgIcon>
          </view>
          <text class="empty-text">暂无成员</text>
        </view>
        
        <!-- 成员计数 -->
        <view class="member-count-wrapper" v-if="hasMembers">
          <text class="member-count">{{ getMemberCount() }}人已加入</text>
        </view>
      </view>
      <!-- 按钮区域 -->
      <view 
        v-if="canJoin"
        class="join-btn blue-join" 
        @click.stop="onApplyJoin">
        招募中
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
import { icons } from '@/static/svg/icons.js';
import SvgIcon from '@/components/SvgIcon.vue';

// 组件属性
const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  showMatch: {
    type: Boolean,
    default: false
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

// 获取状态样式类
const getStatusClass = computed(() => {
  const status = props.team.status;
  const statusText = props.team.statusText;
  
  if (status === '0' || statusText === '招募中') {
    return 'status-recruiting';
  } else if (status === '1' || statusText === '进行中') {
    return 'status-ongoing';
  } else if (status === '2' || statusText === '已完成') {
    return 'status-completed';
  } else if (status === '3' || statusText === '已截止') {
    return 'status-ended';
  } else {
    return 'status-default';
  }
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

// 检查是否有成员加入
const hasMembers = computed(() => {
  return getMemberCount() > 0 && avatars.value.length > 0;
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
  // 直接调用详情页跳转函数，不再触发apply事件
  goToDetail();
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
  0% { opacity: 1; filter: drop-shadow(0 0 2rpx #e74d15); }
  25% { opacity: 0.9; filter: drop-shadow(0 0 5rpx #e74d15); transform: scale(1.05); }
  50% { opacity: 0.8; filter: drop-shadow(0 0 10rpx #e74d15); transform: scale(1.1); }
  75% { opacity: 0.9; filter: drop-shadow(0 0 5rpx #e74d15); transform: scale(1.05); }
  100% { opacity: 1; filter: drop-shadow(0 0 2rpx #e74d15); }
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
          font-size: 33rpx;
          font-weight: bold;
          color: $text-color;
        }
        
        .hot-icon {
          width: 32rpx;
          height: 32rpx;
          margin-left: 10rpx;
          animation: sparkle 2s infinite;
          filter: drop-shadow(0 0 5rpx #e74d15);
        }
      }
      
      .view-count {
        display: flex;
        align-items: center;
        margin-top: 6rpx;
        
        .view-text {
          color: $text-muted;
          font-size: 24rpx;
        }
      }
      
      .tag-row {
        display: flex;
        margin-top: 8rpx;
        
        .tag {
          font-size: 26rpx;
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
        font-size: 26rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        margin-left: 35rpx;
        text-align: center;
        
        &.pulse {
          animation: pulse 2s infinite;
        }
        
        &.status-default {
          background-color: #10B981;
          color: white;
        }
        
        &.status-recruiting {
          background-color: #DBEAFE;
          color: #2563EB;
        }
        
        &.status-ongoing {
          background-color: #DEF7EC;
          color: #10B981;
        }
        
        &.status-completed {
          background-color: #D1FAE5;
          color: #059669;
        }
        
        &.status-ended {
          background-color: #FEE2E2;
          color: #EF4444;
        }
      }
      
      .date-info {
        font-size: 24rpx;
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
        font-size: 25rpx;
        color: $text-secondary;
      }
      
      .role-count {
        display: inline-block;
        margin-left: 8rpx;
        font-size: 25rpx;
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
    font-size: 26rpx;
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
      }
      
      // 新增：无成员时的空状态设计
      .empty-team-state {
        @include flex-center;
        background-color: rgba($primary-color, 0.05);
        padding: 4rpx 16rpx;
        border-radius: 100rpx;
        
        .empty-avatar {
          width: 36rpx;
          height: 36rpx;
          border-radius: 50%;
          background-color: rgba($primary-color, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 8rpx;
          
          .avatar-icon {
            width: 24rpx;
            height: 24rpx;
            color: $primary-color;
          }
        }
        
        .empty-text {
          font-size: 24rpx;
          color: $primary-color;
        }
      }
      
      // 增强成员计数样式
      .member-count-wrapper {
        display: flex;
        align-items: center;
        
        .member-count {
          font-size: 24rpx;
          color: $text-muted;
          margin-left: 10rpx;
        }
        
        .max-count {
          font-size: 24rpx;
          color: $text-muted;
        }
      }
    }
    
    .join-btn {
      padding: 10rpx 35rpx;
      border-radius: 100rpx;
      white-space: nowrap;
      font-size: 26rpx;
	    margin-right: 10rpx;
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

// 匹配度信息
.match-info {
  padding: 12rpx 24rpx;
  background-color: rgba($primary-color, 0.05);
  margin-bottom: 16rpx;
  border-radius: 8rpx;
  
  .match-score {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
    
    .score-bar {
      flex: 1;
      height: 10rpx;
      background-color: rgba($text-muted, 0.2);
      border-radius: 5rpx;
      overflow: hidden;
      margin-right: 12rpx;
      
      .score-fill {
        height: 100%;
        background: linear-gradient(to right, #4facfe, #00f2fe);
        border-radius: 5rpx;
      }
    }
    
    .score-text {
      font-size: 26rpx;
      color: $primary-color;
      font-weight: bold;
      white-space: nowrap;
    }
  }
  
  .recommend-role {
    font-size: 26rpx;
    line-height: 1.4;
    margin-bottom: 8rpx;
    
    .role-label {
      color: $text-color;
      font-weight: 500;
    }
    
    .role-text {
      color: $primary-color;
      font-weight: 500;
      background-color: rgba($primary-color, 0.1);
      padding: 2rpx 10rpx;
      border-radius: 4rpx;
      margin-left: 4rpx;
    }
  }
  
  .match-reason {
    font-size: 26rpx;
    line-height: 1.4;
    
    .reason-label {
      color: $text-color;
      font-weight: 500;
    }
    
    .reason-text {
      color: $text-secondary;
    }
  }
}
</style> 