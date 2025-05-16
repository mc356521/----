<script>
import notificationService from './utils/notification-service';

export default {
	globalData: {
		unreadNotificationCount: 0,
		isLoggedIn: false
	},
	
	onLaunch: function() {
		console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
		console.log('App Launch')
		
		// 检查用户是否已登录
		const token = uni.getStorageSync('token');
		// 设置全局登录状态标志
		this.globalData.isLoggedIn = !!token;
		
		if (!token) {
			console.log('用户未登录，准备跳转到登录页面');
			
			// 避免在某些特定页面（如登录页）重复跳转
			const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];
			const isLoginPage = currentPage && currentPage.route && currentPage.route.includes('login');
			
			if (!isLoginPage) {
			// 等待应用初始化完成后再跳转
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}, 300);
			}
			return; // 未登录不执行后续初始化
		}
		
		// 初始化全局通知服务
		this.initGlobalNotificationService();
		console.log('App Launch')
  
  // 检查AI推荐相关的缓存数据是否过期
  try {
    // 缓存有效时间（3小时，单位：毫秒）
    const cacheValidDuration = 12 * 60 * 60 * 1000;
    
    // 获取缓存时间
    const cachedTime = uni.getStorageSync('ai_recommend_cache_time');
    
    // 如果没有缓存时间或者缓存已过期，则清除缓存
    if(cachedTime) {
      const now = Date.now();
      const isExpired = now - Number(cachedTime) > cacheValidDuration;
      
      if(isExpired) {
        console.log('AI推荐缓存已过期，清除缓存数据。缓存时间:', new Date(Number(cachedTime)).toLocaleString());
        uni.removeStorageSync('ai_recommend_cache_time');
        uni.removeStorageSync('ai_recommended_teams');
        uni.removeStorageSync('ai_summary');
        console.log('已清除过期的AI推荐相关缓存');
      } else {
        console.log('AI推荐缓存未过期，保留缓存数据。缓存时间:', new Date(Number(cachedTime)).toLocaleString());
      }
    } else {
      console.log('未找到AI推荐缓存时间记录');
    }
    
    // 重置用户交互状态中的AI推荐点击状态
    const userInteractionState = uni.getStorageSync('userInteractionState');
    if (userInteractionState) {
      try {
        const state = JSON.parse(userInteractionState);
        state.hasClickedAiRecommend = false;
        uni.setStorageSync('userInteractionState', JSON.stringify(state));
        console.log('已重置AI推荐点击状态');
      } catch (e) {
        console.error('重置用户交互状态失败:', e);
      }
    }
  } catch (e) {
    console.error('处理AI推荐缓存失败:', e);
  }
	},
	
	onShow: function() {
		console.log('App Show')
	},
	
	onHide: function() {
		console.log('App Hide')
		// 应用关闭或进入后台时清除userInteractionState缓存
		try {
			uni.removeStorageSync('userInteractionState');
			console.log('应用关闭/隐藏，已清除userInteractionState缓存');
		} catch (e) {
			console.error('清除userInteractionState缓存失败:', e);
		}
	},
	
	methods: {
		// 初始化全局通知服务
		initGlobalNotificationService() {
			// 处理新通知的回调函数
			const handleNewNotification = (notification) => {
				console.log('App收到新通知:', notification);
				
				// 更新全局未读通知计数
				if (!notification.isRead) {
					this.globalData.unreadNotificationCount++;
				}
				
				// 显示通知提示
				uni.showToast({
					title: '收到新通知',
					icon: 'none'
				});
				
				// 更新消息页面的TabBar角标
				this.updateMessageBadge();
				
				// 触发全局事件，通知消息页面更新
				uni.$emit('newNotification', notification);
			};
			
			// 初始化通知服务
			notificationService.initNotificationService(handleNewNotification);
		},
		
		// 更新消息页面的TabBar角标
		updateMessageBadge() {
			const count = this.globalData.unreadNotificationCount;
			
			try {
				if (count > 0) {
					// 设置TabBar角标
					uni.setTabBarBadge({
						index: 4, // 消息页面的TabBar索引，根据实际情况调整
						text: count.toString()
					}).catch(err => {
						console.log('设置TabBar徽标失败，可能不在TabBar页面', err);
						// 错误已处理，不再抛出
					});
				} else {
					// 移除TabBar角标
					uni.removeTabBarBadge({
						index: 4 // 消息页面的TabBar索引，根据实际情况调整
					}).catch(err => {
						console.log('移除TabBar徽标失败，可能不在TabBar页面', err);
						// 错误已处理，不再抛出
					});
				}
			} catch (error) {
				console.log('TabBar操作失败，可能不在TabBar页面', error);
				// 错误已处理，不再抛出
			}
		},
		
		// 重置未读通知计数
		resetUnreadNotificationCount() {
			this.globalData.unreadNotificationCount = 0;
			this.updateMessageBadge();
		}
	}
}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	/* 引入图标字体 */
	@import './static/iconfont.css';
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
		/* 适配暗黑模式的颜色 */
		--color-primary: #4A90E2;
		--color-success: #07C160;
		--color-warning: #FF9900;
		--color-error: #FA5151;
		--color-white: #ffffff;
		--color-black: #000000;
		--color-grey: #999999;
		--color-light-grey: #F7F7F7;
		--color-text-main: #333333;
		--color-text-secondary: #666666;
	}

	/* 解决安全区域问题，让所有页面都自动适配状态栏高度 */
	.container {
		padding-top: var(--status-bar-height);
		box-sizing: border-box;
	}
	
	/* 处理有sticky-header的页面，让sticky-header考虑安全区域 */
	.sticky-header {
		padding-top: var(--status-bar-height);
		top: 0;
	}
	
	/* 提供一个通用的安全区域类，可以单独添加到顶部元素 */
	.safe-area-inset-top {
		padding-top: var(--status-bar-height);
	}
	
	/* 底部安全区域适配，主要用于全面屏手机的底部 */
	.safe-area-inset-bottom {
		padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0 */
		padding-bottom: env(safe-area-inset-bottom); /* iOS 11.2+ */
	}
	
	/* 导航栏自定义样式，考虑安全区域 */
	.custom-nav-bar {
		height: calc(44px + var(--status-bar-height));
		padding-top: var(--status-bar-height);
		display: flex;
		align-items: center;
		position: relative;
		z-index: 100;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}

	/* 移除按钮默认边框 */
	button {
		position: relative;
		border: none;
	}
	button::after {
		border: none;
	}
</style>
