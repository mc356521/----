<template>
  <view class="tab-bar" :class="{ 'dark-mode': isDarkMode }">
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'home' }" 
      @click="switchTab('home')"
    >
      <SvgIcon :name="activeTab === 'home' ? 'Shouyexuanzhong' : 'Shouye'"  />
      <text class="tab-text" :class="{ 'active-text': activeTab === 'home' }">首页</text>
      <view v-if="activeTab === 'home'" class="active-indicator"></view>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'competition' }" 
      @click="switchTab('competition')"
    >
      <SvgIcon :name="activeTab === 'competition' ? 'jingshaixuanzhong' : 'jingshai'"  />
      <text class="tab-text" :class="{ 'active-text': activeTab === 'competition' }">竞赛</text>
      <view v-if="activeTab === 'competition'" class="active-indicator"></view>
    </view>
 
    <view class="publish-btn-container">
      <view class="publish-btn pulse" @click="showPublishOptions">
        <SvgIcon :name="activeTab === 'publish' ? 'chuangjiantubiao' : 'chuangjiantubiao'"  />
      </view>

    </view>
    

    
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'team' }" 
      @click="switchTab('team')"
    >
      <SvgIcon :name="activeTab === 'team' ? 'duiwutubiaoxuanzhong' : 'duiwutubiao'"  />
      <text class="tab-text" :class="{ 'active-text': activeTab === 'team' }">队伍</text>
      <view v-if="activeTab === 'team'" class="active-indicator"></view>
    </view>
    <view 
      class="tab-item" 
      :class="{ active: activeTab === 'profile' }" 
      @click="switchTab('profile')"
    >
      <SvgIcon :name="activeTab === 'profile' ? 'wodexuanzhong' : 'wode'"  />
      <text class="tab-text" :class="{ 'active-text': activeTab === 'profile' }">我的</text>
      <view v-if="activeTab === 'profile'" class="active-indicator"></view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue';
import userApi from '@/api/modules/user';
import SvgIcon from '@/components/SvgIcon.vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home',
    validator: (value) => ['home', 'competition', 'schedule', 'team', 'profile'].includes(value)
  }
});

// 用户角色
const userRole = ref('');

// 获取用户角色
async function getUserRole() {
  try {
    const res = await userApi.getUserRole();
    if (res.code === 200 && res.data) {
      userRole.value = res.data;
      console.log('当前用户角色:', userRole.value);
    }
  } catch (error) {
    console.error('获取用户角色失败:', error);
  }
}

// 组件挂载时获取用户角色
onMounted(() => {
  const token = uni.getStorageSync('token');
  if (token) {
    getUserRole();
  }
});

// 根据当前页面自动判断是否使用深色模式
const isDarkMode = computed(() => {
  return false; // 不再根据页面类型使用深色模式，统一使用浅色模式
});

const emit = defineEmits(['tab-change', 'publish']);

// 切换底部标签
function switchTab(tab) {
  if (tab !== props.activeTab) {
    // 直接使用uni.switchTab进行页面切换
    const tabRoutes = {
      'home': '/pages/index/index',
      'competition': '/pages/competition/index',
      'schedule': '/pages/schedule/index',
      'team': '/pages/team/list',
      'profile': '/pages/profile/index'
    };
    
    uni.switchTab({
      url: tabRoutes[tab],
      fail: (err) => {
        console.error('切换Tab失败:', err);
        // 如果切换失败，仍然触发事件，让父组件处理
        emit('tab-change', tab);
      }
    });
  }
}

// 显示发布选项
function showPublishOptions() {
  // 检查是否登录
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再操作',
      confirmText: '去登录',
      success: function(res) {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  
  console.log('当前token:', token);
  
  // 如果还没获取到角色，先获取用户角色
  if (!userRole.value) {
    console.log('开始获取用户角色...');
    userApi.getUserRole(token).then(res => {
      console.log('获取角色成功, 完整响应:', res);
      if (res.code === 200 && res.data) {
        userRole.value = res.data;
        console.log('设置当前用户角色:', userRole.value);
        showPublishMenu();
      } else {
        console.warn('获取角色返回异常:', res);
        showPublishMenu(); // 仍然显示菜单，但不包含管理员选项
      }
    }).catch(err => {
      console.error('获取用户角色失败:', err);
      console.error('错误详情:', JSON.stringify(err));
      // 出错时也显示菜单，但不包含管理员选项
      showPublishMenu();
    });
  } else {
    console.log('使用缓存角色信息:', userRole.value);
    showPublishMenu();
  }
}

// 显示发布菜单
function showPublishMenu() {
  // 定义菜单选项和对应的操作
  const menuOptions = [];
  
  // 如果是管理员，添加创建竞赛选项
  if (userRole.value === 'admin') {
    menuOptions.push({
      text: '创建竞赛',
      action: () => {
        uni.navigateTo({
          url: '/pages/competition/create'
        });
      }
    });
  }
  
  // 添加通用选项
  menuOptions.push(
    {
      text: '创建队伍',
      action: () => {
        uni.navigateTo({
          url: '/pages/team/create'
        });
      }
    },
    {
      text: '发布任务',
      action: () => {
        uni.navigateTo({
          url: '/pages/task-square/create'
        });
      }
    },
    {
      text: '添加日程',
      action: () => {
        uni.navigateTo({
          url: '/pages/schedule/index?action=add'
        });
      }
    }
  );
  
  // 提取选项文本用于显示
  const itemList = menuOptions.map(option => option.text);
  
  uni.showActionSheet({
    itemList: itemList,
    success: function(res) {
      const tapIndex = res.tapIndex;
      
      // 执行对应的操作
      if (tapIndex >= 0 && tapIndex < menuOptions.length) {
        menuOptions[tapIndex].action();
      }
    }
  });
}

// 可用的图标数据
const tabbarData = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    iconPath: '/static/svg/home-inactive.svg',
    selectedIconPath: '/static/svg/home-active.svg',
    tab: 'home'
  },
  {
    pagePath: '/pages/competition/index',
    text: '竞赛',
    iconPath: '/static/svg/competition-inactive.svg',
    selectedIconPath: '/static/svg/competition-active.svg',
    tab: 'competition'
  },
  {
    pagePath: '', // 中间按钮特殊处理
    text: '',
    iconPath: '',
    selectedIconPath: '',
    tab: 'create'
  },
  {
    pagePath: '/pages/schedule/index',
    text: '日程',
    iconPath: '/static/svg/schedule-inactive.svg',
    selectedIconPath: '/static/svg/schedule-active.svg',
    tab: 'schedule'
  },
  {
    pagePath: '/pages/team/list',
    text: '队伍',
    iconPath: '/static/svg/team-inactive.svg',
    selectedIconPath: '/static/svg/team-active.svg',
    tab: 'team'
  },
  {
    pagePath: '/pages/profile/index',
    text: '我的',
    iconPath: '/static/svg/profile-inactive.svg',
    selectedIconPath: '/static/svg/profile-active.svg',
    tab: 'profile'
  }
];
</script>

<style lang="scss">
// 颜色变量
$primary-color: #3B82F6;
$background-color: #f8fafc;
$card-color: #ffffff;
$text-muted: #36364e;

// 动画
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// 底部导航栏
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: $card-color;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 1000; /* 提高z-index，确保显示在最上层 */
  
  /* 确保在深色页面上也能正常显示 */
  &.dark-mode {
    background-color: #222222;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.2);
    
    .tab-item {
      .iconfont, .tab-text {
        color: #b3b3b3;
      }
      
      &.active {
        .iconfont, .tab-text {
          color: $primary-color;
        }
      }
    }
    
    .publish-btn-container {
      .publish-text {
        color: #b3b3b3;
      }
    }
  }
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 100%;
    
    .iconfont {
      font-size: 44rpx;
      color: $text-muted;
    }
    
    .tab-text {
      font-size: 22rpx;
      color: $text-muted;
      margin-top: 6rpx;
      
      &.active-text {
        color: #1296db;
        font-weight: 500;
      }
    }
    
    &.active {
      .iconfont {
        color: $primary-color;
        font-weight: 500;
      }
    }
    

  }
  
  .publish-btn-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120rpx;
    position: relative;
    flex: 0 0 120rpx; /* 固定宽度，不伸缩 */
    
    .publish-btn {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: linear-gradient(to right, $primary-color, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.3);
      position: relative;
      top: -30rpx;
      
      &.pulse {
        animation: pulse 2s infinite;
      }
      
      .iconfont {
        color: white;
        font-size: 40rpx;
      }
    }
    
    .publish-text {
      font-size: 22rpx;
      color: $text-muted;
      margin-top: -16rpx;
    }
  }
}
</style> 