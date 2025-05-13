<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <header-bar
      ref="headerBarRef"
      title="日程安排"
      @search="onSearch"
    ></header-bar>
    
    <!-- 导航栏占位 -->
    <view class="header-placeholder" :style="{ height: headerPlaceholderHeight }"></view>
    
    <!-- 主内容区域 -->
    <view class="content">
      <!-- 日历区域 -->
      <view class="calendar-container">
        <view class="calendar-header">
          <view class="month-title">
            <text class="current-month">{{ currentYear }}年{{ currentMonth }}月</text>
          </view>
          <view class="calendar-controls">
            <view class="control-btn" @click="prevMonth">
              <text class="icon-arrow transform-rotate-180"></text>
            </view>
            <view class="control-btn" @click="nextMonth">
              <text class="icon-arrow"></text>
            </view>
            <view class="add-btn top-add-btn" @click="addEvent">
              <text class="add-icon">+</text>
            </view>
          </view>
        </view>
        
        <!-- 星期标题 -->
        <view class="week-header">
          <view class="week-day" v-for="(day, index) in weekDays" :key="index">
            <text :class="{'weekend': index === 0 || index === 6}">{{ day }}</text>
          </view>
        </view>
        
        <!-- 日历格子 -->
        <view class="calendar-grid">
          <view 
            v-for="(date, index) in calendarDays" 
            :key="index"
            :class="[
              'calendar-day', 
              {'other-month': date.otherMonth},
              {'today': date.isToday},
              {'has-event': hasEvent(date.fullDate)},
              {'selected': selectedDate === date.fullDate}
            ]"
            @click="selectDate(date)"
          >
            <text class="day-number">{{ date.day }}</text>
            <view v-if="hasEvent(date.fullDate)" class="event-dot"></view>
          </view>
        </view>
      </view>
      
      <!-- 事件列表 -->
      <view class="events-container">
        <view class="events-header">
          <text class="events-title">{{ selectedDateFormat }}</text>
        </view>
        
        <scroll-view scroll-y class="events-list">
          <block v-if="eventsForSelectedDate.length > 0">
            <view 
              v-for="(event, index) in eventsForSelectedDate" 
              :key="index"
              class="event-item"
              :class="{'completed': event.completed}"
              @click="viewEventDetail(event)"
            >
              <view class="event-time">
                <SvgIcon name="shijian" size="18"></SvgIcon>
                <text>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</text>
              </view>
              <view class="event-content">
                <text class="event-title">{{ event.title }}</text>
                <text class="event-location" v-if="event.location">
                  <SvgIcon name="weizhi" size="14"></SvgIcon>
                  {{ event.location }}
                </text>
              </view>
              <view class="event-status" v-if="event.type">
                <text :class="['status-tag', event.type]">{{ getEventTypeText(event.type) }}</text>
              </view>
            </view>
          </block>
          
          <view v-else class="empty-state">
            <image class="empty-image" src="/static/image/empty-calendar.png" mode="aspectFit"></image>
            <text class="empty-text">今日暂无日程安排</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 底部TabBar -->
    <TabBar activeTab="schedule"></TabBar>
    
    <!-- 添加事件弹窗 -->
    <uni-popup ref="addEventPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <button class="btn cancel-btn" @click="cancelAddEvent">取消</button>
          <text class="popup-title">添加日程</text>
          <button class="btn confirm-btn" @click="confirmAddEvent">保存</button>
        </view>
        
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">标题</text>
            <input class="form-input" v-model="newEvent.title" placeholder="请输入事件标题" />
          </view>
          
          <view class="form-item">
            <text class="form-label">日期</text>
            <picker mode="date" :value="newEvent.date" @change="onDateChange">
              <view class="form-input date-picker">
                <text>{{ newEvent.date || '请选择日期' }}</text>
                <SvgIcon name="shijian" size="16"></SvgIcon>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">开始时间</text>
            <picker mode="time" :value="newEvent.startTime" @change="onStartTimeChange">
              <view class="form-input date-picker">
                <text>{{ newEvent.startTime || '请选择开始时间' }}</text>
                <SvgIcon name="shijian" size="16"></SvgIcon>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">结束时间</text>
            <picker mode="time" :value="newEvent.endTime" @change="onEndTimeChange">
              <view class="form-input date-picker">
                <text>{{ newEvent.endTime || '请选择结束时间' }}</text>
                <SvgIcon name="shijian" size="16"></SvgIcon>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label">地点</text>
            <input class="form-input" v-model="newEvent.location" placeholder="请输入地点 (选填)" />
          </view>
          
          <view class="form-item">
            <text class="form-label">类型</text>
            <view class="type-selector">
              <view 
                v-for="(text, type) in eventTypeMap" 
                :key="type"
                :class="['type-item', {'active': newEvent.type === type}, type]"
                @click="newEvent.type = type"
              >
                <text>{{ text }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import TabBar from '@/components/TabBar.vue';
import SvgIcon from '@/components/SvgIcon.vue';

// HeaderBar引用
const headerBarRef = ref(null);

// 计算HeaderBar占位高度
const headerPlaceholderHeight = computed(() => {
  if (headerBarRef.value && headerBarRef.value.headerHeight) {
    return headerBarRef.value.headerHeight + 'rpx';
  }
  return '120rpx';
});

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 日历状态
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);
const selectedDate = ref(formatDate(today));
const calendarDays = ref([]);

// 事件数据（模拟数据）
const events = ref([
  {
    id: 1,
    title: '中国大学生计算机设计大赛报名',
    date: '2023-10-15',
    startTime: '09:00',
    endTime: '11:00',
    location: '信息楼B201',
    type: 'competition',
    completed: false
  },
  {
    id: 2,
    title: '团队项目讨论会',
    date: '2023-10-15',
    startTime: '14:00',
    endTime: '16:00',
    location: '图书馆研讨室',
    type: 'team',
    completed: false
  },
  {
    id: 3,
    title: '创新创业大赛初赛',
    date: '2023-10-20',
    startTime: '13:30',
    endTime: '17:30',
    location: '创新创业中心',
    type: 'competition',
    completed: false
  },
  {
    id: 4,
    title: '人工智能课程作业截止',
    date: '2023-10-18',
    startTime: '23:59',
    endTime: '23:59',
    type: 'deadline',
    completed: false
  }
]);

// 事件类型映射
const eventTypeMap = {
  'competition': '竞赛',
  'team': '团队',
  'meeting': '会议',
  'deadline': '截止',
  'other': '其他'
};

// 弹窗引用
const addEventPopup = ref(null);

// 新事件
const newEvent = ref({
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  type: 'other'
});

// 选中日期格式化显示
const selectedDateFormat = computed(() => {
  if (!selectedDate.value) return '';
  
  const date = new Date(selectedDate.value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 获取星期几
  const weekDay = weekDays[date.getDay()];
  
  return `${month}月${day}日 星期${weekDay}`;
});

// 选中日期的事件列表
const eventsForSelectedDate = computed(() => {
  return events.value.filter(event => event.date === selectedDate.value)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
});

// 生成日历数据
function generateCalendar() {
  const days = [];
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value, 0);
  
  // 获取当月第一天是星期几
  const firstDayOfWeek = firstDay.getDay();
  
  // 添加上个月的日期
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = prevMonthLastDay - firstDayOfWeek + i + 1;
    let prevMonth = currentMonth.value - 1;
    let year = currentYear.value;
    
    if (prevMonth === 0) {
      prevMonth = 12;
      year -= 1;
    }
    
    days.push({
      day,
      fullDate: formatDate(new Date(year, prevMonth - 1, day)),
      otherMonth: true,
      isToday: false
    });
  }
  
  // 添加当月的日期
  const todayStr = formatDate(today);
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, i);
    const dateStr = formatDate(date);
    
    days.push({
      day: i,
      fullDate: dateStr,
      otherMonth: false,
      isToday: dateStr === todayStr
    });
  }
  
  // 添加下个月的日期
  const remainingDays = 42 - days.length; // 6行7列的日历
  for (let i = 1; i <= remainingDays; i++) {
    let nextMonth = currentMonth.value + 1;
    let year = currentYear.value;
    
    if (nextMonth === 13) {
      nextMonth = 1;
      year += 1;
    }
    
    days.push({
      day: i,
      fullDate: formatDate(new Date(year, nextMonth - 1, i)),
      otherMonth: true,
      isToday: false
    });
  }
  
  calendarDays.value = days;
}

// 上个月
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
  generateCalendar();
}

// 下个月
function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
  generateCalendar();
}

// 选择日期
function selectDate(date) {
  selectedDate.value = date.fullDate;
}

// 检查日期是否有事件
function hasEvent(date) {
  return events.value.some(event => event.date === date);
}

// 添加事件
function addEvent() {
  // 重置表单
  newEvent.value = {
    title: '',
    date: selectedDate.value, // 默认使用当前选中日期
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'other'
  };
  
  // 打开弹窗
  addEventPopup.value.open();
}

// 日期变更
function onDateChange(e) {
  newEvent.value.date = e.detail.value;
}

// 开始时间变更
function onStartTimeChange(e) {
  const time = e.detail.value;
  newEvent.value.startTime = time;
  
  // 如果结束时间为空或早于开始时间，自动设置结束时间为开始时间后1小时
  if (!newEvent.value.endTime || newEvent.value.endTime < time) {
    const [hours, minutes] = time.split(':').map(Number);
    let endHours = hours + 1;
    if (endHours > 23) endHours = 23;
    newEvent.value.endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}

// 结束时间变更
function onEndTimeChange(e) {
  newEvent.value.endTime = e.detail.value;
}

// 取消添加事件
function cancelAddEvent() {
  addEventPopup.value.close();
}

// 确认添加事件
function confirmAddEvent() {
  // 表单验证
  if (!newEvent.value.title) {
    uni.showToast({
      title: '请输入事件标题',
      icon: 'none'
    });
    return;
  }
  
  if (!newEvent.value.date) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none'
    });
    return;
  }
  
  if (!newEvent.value.startTime) {
    uni.showToast({
      title: '请选择开始时间',
      icon: 'none'
    });
    return;
  }
  
  if (!newEvent.value.endTime) {
    uni.showToast({
      title: '请选择结束时间',
      icon: 'none'
    });
    return;
  }
  
  // 创建新事件
  const newEventObj = {
    id: events.value.length > 0 ? Math.max(...events.value.map(e => e.id)) + 1 : 1,
    title: newEvent.value.title,
    date: newEvent.value.date,
    startTime: newEvent.value.startTime,
    endTime: newEvent.value.endTime,
    location: newEvent.value.location,
    type: newEvent.value.type,
    completed: false
  };
  
  // 添加到事件列表
  events.value.push(newEventObj);
  
  // 关闭弹窗
  addEventPopup.value.close();
  
  // 提示添加成功
  uni.showToast({
    title: '添加成功',
    icon: 'success'
  });
}

// 查看事件详情
function viewEventDetail(event) {
  uni.showToast({
    title: '查看事件详情功能开发中',
    icon: 'none'
  });
}

// 搜索回调
function onSearch() {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  });
}

// 格式化日期为 yyyy-MM-dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间显示
function formatTime(time) {
  return time;
}

// 获取事件类型文本
function getEventTypeText(type) {
  const typeMap = {
    'competition': '竞赛',
    'team': '团队',
    'deadline': '截止',
    'meeting': '会议',
    'other': '其他'
  };
  return typeMap[type] || '其他';
}

// 生命周期钩子
onMounted(() => {
  generateCalendar();
});
</script>

<style lang="scss">
@import '@/config/theme.scss';

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $background-color;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}

.calendar-container {
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.month-title {
  font-size: 34rpx;
  font-weight: bold;
  color: $text-color;
}

.calendar-controls {
  display: flex;
  gap: 20rpx;
}

.control-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: $tag-gray-bg;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:active {
    background-color: rgba($primary-color, 0.1);
  }
}

.icon-arrow {
  width: 16rpx;
  height: 16rpx;
  border-top: 4rpx solid $text-secondary;
  border-right: 4rpx solid $text-secondary;
  transform: rotate(45deg);
}

.transform-rotate-180 {
  transform: rotate(-135deg);
}

.week-header {
  display: flex;
  margin-bottom: 10rpx;
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: $text-secondary;
  padding: 10rpx 0;
  
  .weekend {
    color: $danger-color;
  }
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &.other-month {
    .day-number {
      color: $text-muted;
    }
  }
  
  &.today {
    .day-number {
      background-color: $primary-color;
      color: white;
      width: 56rpx;
      height: 56rpx;
      line-height: 56rpx;
      text-align: center;
      border-radius: 28rpx;
    }
  }
  
  &.has-event {
    .event-dot {
      width: 8rpx;
      height: 8rpx;
      background-color: $primary-color;
      border-radius: 4rpx;
      position: absolute;
      bottom: 8rpx;
    }
  }
  
  &.selected {
    background-color: rgba($primary-color, 0.1);
    border-radius: 8rpx;
  }
}

.day-number {
  font-size: 28rpx;
  color: $text-color;
}

.events-container {
  flex: 1;
  background-color: $card-color;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid $border-color;
}

.events-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-color;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: $primary-color;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  
  .add-icon {
    font-size: 28rpx;
    color: white;
  }
  
  .add-text {
    font-size: 24rpx;
    color: white;
  }
}

.events-list {
  flex: 1;
}

.event-item {
  background-color: $background-color;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  &.completed {
    opacity: 0.6;
  }
}

.event-time {
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.event-content {
  margin-bottom: 10rpx;
}

.event-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 8rpx;
}

.event-location {
  font-size: 24rpx;
  color: $text-secondary;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.event-status {
  display: flex;
  justify-content: flex-end;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  
  &.competition {
    background-color: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  &.team {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
  
  &.deadline {
    background-color: rgba($danger-color, 0.1);
    color: $danger-color;
  }
  
  &.meeting {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }
  
  &.other {
    background-color: rgba($text-secondary, 0.1);
    color: $text-secondary;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
}

/* 弹窗样式 */
.popup-content {
  background-color: $card-color;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  color: $text-color;
}

.form-content {
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  height: 80rpx;
  border-radius: 8rpx;
  border: 1rpx solid $border-color;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: $background-color;
  width: 100%;
  box-sizing: border-box;
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-item {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  background-color: $background-color;
  color: $text-secondary;
  border: 1rpx solid $border-color;
  margin-bottom: 10rpx;
  
  &.active {
    background-color: rgba($text-secondary, 0.1);
    color: $text-secondary;
    border-color: $text-secondary;
    
    &.competition {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
      border-color: $primary-color;
    }
    
    &.team {
      background-color: rgba($success-color, 0.1);
      color: $success-color;
      border-color: $success-color;
    }
    
    &.deadline {
      background-color: rgba($danger-color, 0.1);
      color: $danger-color;
      border-color: $danger-color;
    }
    
    &.meeting {
      background-color: rgba($warning-color, 0.1);
      color: $warning-color;
      border-color: $warning-color;
    }
  }
}

.btn {
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 30rpx;
}

.cancel-btn {
  background-color: transparent;
  color: $text-secondary;
  border: none;
  font-size: 30rpx;
}

.confirm-btn {
  background-color: $primary-color;
  color: white;
  border-radius: 10rpx;
  font-size: 30rpx;
}

.top-add-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: $primary-color;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10rpx;
  
  .add-icon {
    color: white;
    font-size: 32rpx;
    font-weight: bold;
  }
}
</style>