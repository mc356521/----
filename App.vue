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
