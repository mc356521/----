<script>
	export default {
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
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
