<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">任务参与者</text>
          <view class="close-icon" @click="close">
            <text class="iconfont icon-guanbi" style="font-size: 36rpx; color: #666;"></text>
          </view>
        </view>
        
        <view class="status-tabs">
          <view 
            v-for="(item, index) in statusOptions" 
            :key="index"
            :class="['status-tab', currentStatus === item.value ? 'active' : '']"
            @click="changeStatus(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
        
        <!-- 加载中状态 -->
        <view class="loading-container" v-if="loading">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
        
        <view class="participant-list" v-else-if="participants.length > 0">
          <view class="participant-item" v-for="(item, index) in participants" :key="index" @click="viewUserProfile(item.userId)">
            <view class="participant-avatar">
              <image :src="item.avatarUrl || '/static/image/default-avatar.png'" mode="aspectFill"></image>
            </view>
            <view class="participant-info">
              <view class="participant-name">{{ item.participantName }}</view>
              <view class="participant-details">
                <text>{{ item.participantMajor || '暂无专业信息' }}</text>
                <text v-if="item.participantStudentId">学号: {{ item.participantStudentId }}</text>
              </view>
            </view>
            <view class="participant-status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </view>
            <!-- 删除按钮 - 仅对已加入的参与者显示 -->
            <view 
              v-if="item.status === 'joined'" 
              class="delete-btn"
              @click.stop="confirmRemoveParticipant(item)"
            >
              <text class="iconfont icon-delete" style="font-size: 28rpx; color: #f44336;">X</text>
            </view>
          </view>
        </view>
        
        <view class="empty-state" v-else>
          <text class="empty-icon">!</text>
          <text>暂无参与者信息</text>
        </view>
        
        <view class="popup-footer">
          <uni-pagination 
            v-if="total > pageSize"
            :total="total" 
            :pageSize="pageSize" 
            :current="pageNum"
            @change="handlePageChange"
          ></uni-pagination>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import tasksApi from '@/api/modules/tasks';

export default {
  name: 'TaskParticipantsPopup',
  props: {
    taskId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      participants: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      currentStatus: '', // 为空时表示全部
      statusOptions: [
        { label: '全部', value: '' },
        { label: '已加入', value: 'joined' },
        { label: '进行中', value: 'in_progress' },
        { label: '已完成', value: 'completed' },
        { label: '已退出', value: 'left' },
        { label: '被踢出', value: 'kicked_out' }
      ],
      loading: false,
      popupVisible: false // 控制弹窗显示的内部状态
    }
  },
  watch: {
    // 监听taskId变化，确保每次taskId更新时都重新加载数据
    taskId: {
      handler(newVal) {
        if (newVal) {
          console.log('taskId变化，重新加载数据:', newVal);
          // 延迟执行以确保UI更新完成
          this.$nextTick(() => {
            this.loadParticipants();
          });
        }
      },
      immediate: false // 不立即触发，只在变化时触发
    }
  },
  created() {
    // 在created生命周期中设置事件监听 - 保留双重机制以确保兼容性
    uni.$on('openParticipantsPopup', this.openPopup);
    console.log('TaskParticipantsPopup组件已创建，等待触发打开事件');
  },
  beforeDestroy() {
    // 移除事件监听
    uni.$off('openParticipantsPopup', this.openPopup);
  },
  methods: {
    // 对外暴露的方法，可以直接被父组件调用
    open() {
      console.log('父组件直接调用open方法，任务ID:', this.taskId);
      this.openPopup();
    },
    // 内部打开弹窗的实现
    openPopup() {
      console.log('开始打开参与者弹窗，任务ID:', this.taskId);
      
      try {
        // 使用uni.showLoading给用户提供反馈
        uni.showLoading({
          title: '加载中...'
        });
        
        // 确保popup实例存在
        if (this.$refs.popup) {
          console.log('找到popup实例，调用open方法');
          
          // 先立即加载数据，不等待弹窗打开
          this.loadParticipants();
          
          // 然后打开弹窗
          this.$refs.popup.open('center');
        } else {
          console.error('popup实例不存在，尝试延迟打开');
          // 延迟打开以确保组件已渲染
          setTimeout(() => {
            if (this.$refs.popup) {
              this.loadParticipants();
              this.$refs.popup.open('center');
            } else {
          
            }
          }, 100);
        }
      } catch(e) {
        console.error('打开弹窗出错:', e);
        uni.showToast({
          title: '打开弹窗出错',
          icon: 'none'
        });
      } finally {
        // 隐藏loading
        setTimeout(() => {
          uni.hideLoading();
        }, 500);
      }
    },
    close() {
      this.$refs.popup.close();
    },
    changeStatus(status) {
      console.log('切换参与者状态筛选:', status);
      this.currentStatus = status;
      this.pageNum = 1; // 切换状态时重置页码
      this.loadParticipants();
    },
    handlePageChange(e) {
      this.pageNum = e.current;
      this.loadParticipants();
    },
    async loadParticipants() {
      if (!this.taskId) return;
      
      this.loading = true;
      try {
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        };
        
        // 只有当选择了特定状态时才添加status参数
        if (this.currentStatus) {
          params.status = this.currentStatus;
        }
        
        console.log('查询参与者，参数:', params);
        
        // 使用正确的API模块获取数据
        const response = await tasksApi.getTaskParticipants(this.taskId, params);
        
        if (response.code === 200 && response.data) {
          this.participants = response.data.records || [];
          this.total = response.data.total || 0;
          console.log('成功获取参与者数据，数量:', this.participants.length);
        } else {
          // 静默处理错误，不显示提示
          this.participants = [];
          this.total = 0;
          console.log('获取参与者数据失败', response.message);
        }
      } catch (error) {
        console.error('获取参与者列表失败', error);
        this.participants = [];
        this.total = 0;
        // 静默处理错误，不显示提示
      } finally {
        this.loading = false;
      }
    },
    viewUserProfile(userId) {
      if (!userId) return;
      
      // 保存参数到本地存储，确保在页面加载时能获取到
      uni.setStorageSync('viewUserParams', { userId });
      
      uni.navigateTo({
        url: `/pages/profile/view-user-info?userId=${userId}`
      });
    },
    getStatusText(status) {
      const statusMap = {
        'joined': '已加入',
        'in_progress': '进行中',
        'completed': '已完成',
        'left': '已退出',
        'kicked_out': '被踢出'
      };
      return statusMap[status] || '未知状态';
    },
    getStatusClass(status) {
      const classMap = {
        'joined': 'status-joined',
        'in_progress': 'status-progress',
        'completed': 'status-completed',
        'left': 'status-left',
        'kicked_out': 'status-kicked-out'
      };
      return classMap[status] || '';
    },
    confirmRemoveParticipant(item) {
      console.log('准备删除参与者:', item);
      uni.showModal({
        title: '确认删除',
        content: `确定要移除参与者 ${item.participantName} 吗？`,
        confirmColor: '#f44336',
        success: (res) => {
          if (res.confirm) {
            this.removeParticipant(item.userId);
          }
        }
      });
    },
    async removeParticipant(participantId) {
      try {
        uni.showLoading({ title: '处理中...' });
        
        const res = await tasksApi.removeTaskParticipant(this.taskId, participantId);
        
        if (res.code === 200) {
          uni.showToast({
            title: '已成功移除参与者',
            icon: 'success'
          });
          // 重新加载参与者列表
          this.loadParticipants();
          
          // 触发事件通知父组件刷新任务列表
          uni.$emit('refreshTaskList');
        } else {
          uni.showToast({
            title: res.message || '移除参与者失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('移除参与者错误:', error);
        uni.showToast({
          title: '移除参与者失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    }
  },
  mounted() {
    // 默认查看全部参与者
    this.currentStatus = '';
  }
}
</script>

<style lang="scss">
.popup-content {
  width: 650rpx;
  background-color: #FFFFFF;
  border-radius: 12rpx;
  max-height: 900rpx;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #EEEEEE;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-icon {
  padding: 6rpx;
}

.status-tabs {
  display: flex;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #EEEEEE;
  overflow-x: scroll;
  white-space: nowrap;
  
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
}

.status-tab {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666666;
  background-color: #F5F5F5;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    color: #FFFFFF;
    background-color: #247ae4; // 使用项目的主题色
    font-weight: bold;
  }
}

.participant-list {
  padding: 0 30rpx;
  flex: 1;
  overflow-y: auto;
  max-height: 600rpx;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #EEEEEE;
}

.participant-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
  flex-shrink: 0;
  
  image {
    width: 100%;
    height: 100%;
  }
}

.participant-info {
  flex: 1;
  min-width: 0; /* 确保不会溢出 */
}

.participant-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.participant-details {
  display: flex;
  flex-direction: column;
  font-size: 24rpx;
  color: #999999;
  
  text {
    margin-bottom: 4rpx;
  }
}

.participant-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  margin: 0 10rpx;
  white-space: nowrap;
  
  &.status-joined {
    color: #247ae4;
    background-color: rgba(36, 122, 228, 0.1);
  }
  
  &.status-progress {
    color: #FF9800;
    background-color: rgba(255, 152, 0, 0.1);
  }
  
  &.status-completed {
    color: #4CAF50;
    background-color: rgba(76, 175, 80, 0.1);
  }
  
  &.status-left {
    color: #F44336;
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  &.status-kicked-out {
    color: #FF5722;
    background-color: rgba(255, 87, 34, 0.1);
  }
}

/* 删除按钮样式 */
.delete-btn {
  margin-left: 10rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(244, 67, 54, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  
  &:active {
    background-color: rgba(244, 67, 54, 0.2);
  }
}

.empty-state {
  padding: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 28rpx;
  
  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    border: 2rpx solid #999999;
    margin-bottom: 20rpx;
    font-size: 46rpx;
    line-height: 1;
  }
}

.popup-footer {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: center;
  border-top: 1rpx solid #EEEEEE;
}

/* 添加加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(74, 144, 226, 0.2);
  border-left-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 