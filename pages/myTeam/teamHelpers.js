// 任务相关辅助函数
export function getTasksByStatus(tasks, status) {
  return tasks.filter(task => task.status === status);
}

export function getTaskCountByStatus(tasks, status) {
  return getTasksByStatus(tasks, status).length;
}

export function isTaskOverdue(task) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today && task.status !== 'done';
}

// 团队日历相关方法
export function getCurrentMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}年${month}月`;
}

export function getRecentEvents(events, days = 3) {
  const now = new Date();
  const futureDays = new Date();
  futureDays.setDate(now.getDate() + days);
  
  return events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= now && eventDate <= futureDays;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

export function formatEventTime(event, formatDate) {
  if (event.isAllDay) {
    return '全天';
  }
  
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  const formatTimeOnly = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const isSameDay = startTime.getDate() === endTime.getDate() &&
                   startTime.getMonth() === endTime.getMonth() &&
                   startTime.getFullYear() === endTime.getFullYear();
  
  if (isSameDay) {
    return `${formatDate(startTime)} ${formatTimeOnly(startTime)}-${formatTimeOnly(endTime)}`;
  } else {
    return `${formatDate(startTime)} ${formatTimeOnly(startTime)} - ${formatDate(endTime)} ${formatTimeOnly(endTime)}`;
  }
}

// 文件相关辅助函数
export function getFileTypeShort(type) {
  switch (type) {
    case 'document':
      return '文档';
    case 'archive':
      return '压缩包';
    case 'spreadsheet':
      return '电子表格';
    default:
      return '未知';
  }
} 