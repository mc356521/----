<template>
  <view class="calendar-container">
    <view class="empty-state" v-if="!hasEvents">
      <image class="empty-image" src="/static/image/empty-calendar.png" mode="aspectFit"></image>
      <text class="empty-text">暂无日程安排</text>
      <view class="action-btn primary" @click="createEvent">
        <text>创建日程</text>
      </view>
    </view>
    
    <view class="calendar-content" v-else>
      <!-- 日历头部控制区 -->
      <view class="calendar-header">
        <view class="calendar-title">
          <text>{{ currentYear }}年{{ currentMonth + 1 }}月</text>
        </view>
        <view class="calendar-actions">
          <view class="action-btn" @click="previousMonth">
            <text class="action-text">«</text>
          </view>
          <view class="action-btn" @click="goToday">
            <text class="action-text">今天</text>
          </view>
          <view class="action-btn" @click="nextMonth">
            <text class="action-text">»</text>
          </view>
        </view>
      </view>
      
      <!-- 星期头部 -->
      <view class="calendar-weekdays">
        <view class="weekday" v-for="(day, index) in weekdays" :key="index">
          <text>{{ day }}</text>
        </view>
      </view>
      
      <!-- 日历主体 -->
      <view class="calendar-dates">
        <view 
          class="date-cell" 
          v-for="(day, index) in days" 
          :key="index"
          :class="{
            'current-month': day.currentMonth,
            'today': day.isToday,
            'has-events': hasEventOnDate(day)
          }"
          @click="selectDate(day)"
        >
          <text class="date-number">{{ day.day }}</text>
          <view class="event-indicators" v-if="hasEventOnDate(day)">
            <view 
              class="event-dot" 
              v-for="(event, eventIndex) in getEventsForDate(day)" 
              :key="eventIndex"
              :class="'event-category-' + event.category"
              v-if="eventIndex < 3"
            ></view>
            <view class="more-events" v-if="getEventsForDate(day).length > 3">
              <text>+{{ getEventsForDate(day).length - 3 }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 选中日期的事件列表 -->
      <view class="events-section" v-if="selectedDate">
        <view class="section-header">
          <text>{{ formatSelectedDate() }}的日程</text>
          <view class="add-event-btn" @click="createEvent">
            <text class="add-icon">+</text>
          </view>
        </view>
        
        <view class="no-events" v-if="selectedDateEvents.length === 0">
          <text>当天没有日程安排</text>
        </view>
        
        <view class="events-list" v-else>
          <view 
            class="event-item" 
            v-for="(event, index) in selectedDateEvents" 
            :key="event.id"
            @click="viewEventDetail(event)"
          >
            <view class="event-time">
              <text>{{ formatEventTime(event) }}</text>
            </view>
            <view class="event-content">
              <view class="event-category" :class="'category-' + event.category">
                <text>{{ getCategoryName(event.category) }}</text>
              </view>
              <view class="event-title">
                <text>{{ event.title }}</text>
              </view>
              <view class="event-location" v-if="event.location">
                <text>{{ event.location }}</text>
              </view>
            </view>
            <view class="event-actions">
              <view class="action-btn" @click.stop="editEvent(event)">
                <text class="action-icon">✎</text>
              </view>
              <view class="action-btn" @click.stop="deleteEvent(event)">
                <text class="action-icon">×</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  teamId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['create', 'view', 'edit', 'delete']);

// 数据定义
const events = ref([]);
const currentDate = ref(new Date());
const selectedDate = ref(null);
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算属性
const hasEvents = ref(false);

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const currentMonth = computed(() => {
  return currentDate.value.getMonth();
});

const days = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  // 获取当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // 获取当月第一天是星期几
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // 获取上月天数
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  
  const days = [];
  
  // 添加上月的日期
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: daysInPreviousMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      currentMonth: false,
      isToday: false
    });
  }
  
  // 添加本月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      currentMonth: true,
      isToday: i === todayDate && month === todayMonth && year === todayYear
    });
  }
  
  // 添加下月的日期，以填满日历（总共需要42个格子，6行乘以7列）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      currentMonth: false,
      isToday: false
    });
  }
  
  return days;
});

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  
  return events.value.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.getDate() === selectedDate.value.day &&
           eventDate.getMonth() === selectedDate.value.month &&
           eventDate.getFullYear() === selectedDate.value.year;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
});

// 生命周期钩子
onMounted(() => {
  // 设置当前选中的日期为今天
  const today = new Date();
  selectedDate.value = {
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear(),
    currentMonth: true,
    isToday: true
  };
  
  // 加载事件数据
  loadEvents();
});

// 方法
function loadEvents() {
  // 模拟加载数据
  setTimeout(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    events.value = [
      {
        id: '1',
        title: '团队周会',
        startTime: new Date(year, month, day, 10, 0),
        endTime: new Date(year, month, day, 11, 30),
        location: '线上会议室',
        category: 'meeting',
        creatorId: '1002',
        creatorName: '张三'
      },
      {
        id: '2',
        title: '前端代码评审',
        startTime: new Date(year, month, day, 14, 0),
        endTime: new Date(year, month, day, 15, 0),
        location: '线上会议室',
        category: 'review',
        creatorId: '1002',
        creatorName: '张三'
      },
      {
        id: '3',
        title: '项目交付截止日期',
        startTime: new Date(year, month, day + 3, 18, 0),
        endTime: new Date(year, month, day + 3, 18, 0),
        category: 'deadline',
        creatorId: '1002',
        creatorName: '张三'
      },
      {
        id: '4',
        title: 'UI设计稿提交',
        startTime: new Date(year, month, day + 1, 12, 0),
        endTime: new Date(year, month, day + 1, 12, 0),
        category: 'task',
        creatorId: '1003',
        creatorName: '李四'
      },
      {
        id: '5',
        title: '测试计划讨论',
        startTime: new Date(year, month, day + 2, 16, 0),
        endTime: new Date(year, month, day + 2, 17, 0),
        location: '线上会议室',
        category: 'meeting',
        creatorId: '1001',
        creatorName: '我'
      }
    ];
    
    hasEvents.value = events.value.length > 0;
  }, 500);
}

function previousMonth() {
  const date = new Date(currentDate.value);
  date.setMonth(date.getMonth() - 1);
  currentDate.value = date;
}

function nextMonth() {
  const date = new Date(currentDate.value);
  date.setMonth(date.getMonth() + 1);
  currentDate.value = date;
}

function goToday() {
  currentDate.value = new Date();
  
  const today = new Date();
  selectedDate.value = {
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear(),
    currentMonth: true,
    isToday: true
  };
}

function selectDate(day) {
  selectedDate.value = day;
}

function hasEventOnDate(day) {
  return events.value.some(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.getDate() === day.day &&
           eventDate.getMonth() === day.month &&
           eventDate.getFullYear() === day.year;
  });
}

function getEventsForDate(day) {
  return events.value.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.getDate() === day.day &&
           eventDate.getMonth() === day.month &&
           eventDate.getFullYear() === day.year;
  });
}

function formatSelectedDate() {
  if (!selectedDate.value) return '';
  
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  
  const date = new Date(selectedDate.value.year, selectedDate.value.month, selectedDate.value.day);
  const dayOfWeek = days[date.getDay()];
  
  return `${selectedDate.value.month + 1}月${selectedDate.value.day}日 ${dayOfWeek}`;
}

function formatEventTime(event) {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  if (startTime.getTime() === endTime.getTime()) {
    return formatTime(startTime);
  }
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

function getCategoryName(category) {
  const categories = {
    'meeting': '会议',
    'task': '任务',
    'deadline': '截止日期',
    'review': '评审',
    'other': '其他'
  };
  
  return categories[category] || '其他';
}

function createEvent() {
  emit('create', selectedDate.value);
}

function viewEventDetail(event) {
  emit('view', event);
}

function editEvent(event) {
  emit('edit', event);
}

function deleteEvent(event) {
  uni.showModal({
    title: '删除日程',
    content: `确定要删除"${event.title}"吗？`,
    success: function(res) {
      if (res.confirm) {
        emit('delete', event);
        
        // 模拟删除成功
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 从数组中移除
        const index = events.value.findIndex(e => e.id === event.id);
        if (index !== -1) {
          events.value.splice(index, 1);
        }
        
        // 如果删除后没有事件了，更新状态
        hasEvents.value = events.value.length > 0;
      }
    }
  });
}
</script>

<style>
.calendar-container {
  padding: 20rpx 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.action-btn {
  padding: 16rpx 30rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.action-btn.primary {
  background-color: #3498db;
  color: #ffffff;
}

.calendar-content {
  padding: 0 20rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calendar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.calendar-actions {
  display: flex;
  align-items: center;
}

.calendar-actions .action-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 50%;
  margin: 0 10rpx;
}

.action-text {
  font-size: 28rpx;
  color: #333333;
}

.calendar-weekdays {
  display: flex;
  margin-bottom: 10rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.calendar-dates {
  display: flex;
  flex-wrap: wrap;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 30rpx;
}

.date-cell {
  width: 14.28%;
  height: 120rpx;
  box-sizing: border-box;
  padding: 10rpx;
  border-right: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-cell:nth-child(7n) {
  border-right: none;
}

.date-cell:nth-last-child(-n+7) {
  border-bottom: none;
}

.date-number {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.date-cell:not(.current-month) .date-number {
  color: #cccccc;
}

.date-cell.today {
  background-color: rgba(52, 152, 219, 0.1);
}

.date-cell.today .date-number {
  background-color: #3498db;
  color: #ffffff;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.event-indicators {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.event-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin: 0 4rpx;
}

.event-category-meeting {
  background-color: #42a5f5;
}

.event-category-task {
  background-color: #66bb6a;
}

.event-category-deadline {
  background-color: #ef5350;
}

.event-category-review {
  background-color: #ab47bc;
}

.event-category-other {
  background-color: #78909c;
}

.more-events {
  font-size: 20rpx;
  color: #999999;
  margin-top: 4rpx;
}

.events-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-header text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.add-event-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: bold;
}

.no-events {
  padding: 40rpx 0;
  text-align: center;
}

.no-events text {
  font-size: 28rpx;
  color: #999999;
}

.events-list {
  padding: 20rpx 30rpx;
}

.event-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  width: 150rpx;
  font-size: 26rpx;
  color: #666666;
  padding-right: 20rpx;
}

.event-content {
  flex: 1;
}

.event-category {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-bottom: 10rpx;
  font-size: 22rpx;
}

.category-meeting {
  background-color: #e3f2fd;
  color: #42a5f5;
}

.category-task {
  background-color: #e8f5e9;
  color: #66bb6a;
}

.category-deadline {
  background-color: #ffebee;
  color: #ef5350;
}

.category-review {
  background-color: #f3e5f5;
  color: #ab47bc;
}

.category-other {
  background-color: #eceff1;
  color: #78909c;
}

.event-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}

.event-location {
  font-size: 24rpx;
  color: #999999;
}

.event-actions {
  display: flex;
  align-items: center;
}

.event-actions .action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-icon {
  font-size: 32rpx;
  color: #666666;
}
</style> 