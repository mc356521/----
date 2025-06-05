<template>
	<view class="chat-container">
		<!-- 聊天消息区域 -->
		<scroll-view scroll-y class="chat-messages" :scroll-top="scrollTop" @scrolltoupper="loadMoreMessages"
			:scroll-into-view="latestMessageId" :scroll-with-animation="true" enhanced show-scrollbar="false"
			@scroll="onScroll">
			<view class="loading-more" v-if="loadingMore">
				<text>加载更多消息...</text>
			</view>

			<!-- 消息列表 -->
			<block v-for="(message, msgIndex) in sortedMessages" :key="'msg-group-' + msgIndex">
				<!-- 时间分割线 -->
				<view class="time-separator" v-if="shouldShowTimeSeparator(message, msgIndex)">
					<text>{{ formatTime(message.sendTime) }}</text>
				</view>

				<!-- 消息项 -->
				<view class="message-item" :id="'msg-' + message.id" :class="{
            'self-message': message.flow === 'out',
            'system-message': message.type === 'system'
          }">

					<!-- 其他人的头像 -->
					<view class="avatar-container" v-if="message.flow !== 'out' && message.type !== 'system'">
						<image class="avatar" :src="message.avatar" mode="aspectFill"></image>
					</view>

					<!-- 自己的头像 -->
					<view class="avatar-container" v-if="message.flow === 'out' && message.type !== 'system'">
						<image class="avatar" :src="message.avatar" mode="aspectFill"></image>
					</view>
					<!-- 消息内容 -->
					<view class="message-content">
						<view class="message-sender" v-if="message.flow !== 'out' && message.type !== 'system'">
							<text>{{ message.userName }}</text>
						</view>
						<view class="message-bubble" :class="{'system-bubble': message.type === 'system'}">
							<text
								v-if="message.type === 'text' || message.type === 'system'">{{ message.content }}</text>
							<image v-if="message.type === 'image'" class="message-image" :src="message.content"
								mode="widthFix" @tap="previewImage(message.content)"></image>
							<view v-if="message.type === 'file'" class="message-file">
								<view class="file-icon">
									<text class="iconfont icon-file"></text>
								</view>
								<view class="file-info">
									<text class="file-name">{{ message.fileName }}</text>
									<text class="file-size">{{ message.fileSize }}</text>
								</view>
								<view class="file-download">
									<text class="iconfont icon-download"></text>
								</view>
							</view>
						</view>
						<view class="message-time" v-if="message.type !== 'system'">
							{{ formatMessageTime(message.sendTime) }}
						</view>
					</view>

				</view>
			</block>

			<!-- 对方正在输入提示 -->
			<view class="typing-indicator" v-if="isTyping">
				<view class="typing-avatar">
					<text class="typing-user">{{ typingUser }}</text>
				</view>
				<view class="typing-bubbles">
					<view class="typing-dot"></view>
					<view class="typing-dot"></view>
					<view class="typing-dot"></view>
				</view>
			</view>
		</scroll-view>

		<!-- 滚动到底部按钮 -->
		<view class="scroll-to-bottom" v-if="showScrollBottom" @click="scrollToBottom">
			<text class="scroll-to-bottom-icon">↓</text>
		</view>

		<!-- 聊天输入区域 -->
		<view class="chat-footer">
			<!-- 快捷回复列表 -->
			<view class="quick-replies" v-if="showQuickReplies">
				<scroll-view scroll-x class="quick-replies-scroll">
					<view class="quick-reply-item" v-for="(reply, index) in quickReplies" :key="index"
						@click="selectQuickReply(reply)">
						<text>{{ reply }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 聊天输入框 -->
			<view class="chat-input-area">
				<form @submit.prevent="sendMessage" class="input-form">
					<view class="input-container">
						<textarea class="chat-input" v-model="messageInput" placeholder="输入消息..." confirm-type="send"
							:cursor-spacing="20" :disable-default-padding="true" :show-confirm-bar="false"
							:auto-height="true" @confirm="sendMessage" @focus="onInputFocus"></textarea>
						<view class="input-actions">
							<view class="action-btn text-btn" @click="toggleQuickReplies">
								<text class="action-text">快捷</text>
							</view>
							<view class="action-btn text-btn" @click="chooseImage">
								<text class="action-text">图片</text>
							</view>
							<view class="action-btn text-btn" @click="showEmojiPicker">
								<text class="action-text">表情</text>
							</view>
							<view class="action-btn text-btn" @click="showMoreActions">
								<text class="action-text">更多</text>
							</view>
							<button class="action-btn send-btn" @click.stop="sendMessage" form-type="submit">
								<text class="action-text send-text">发送</text>
							</button>
						</view>
					</view>
				</form>
			</view>
		</view>

		<!-- 更多操作弹出层（备用实现，以防uni-popup不可用） -->
		<view class="custom-popup more-actions-popup" v-show="showCustomMoreActionsPopup">
			<view class="popup-mask" @click="hideMoreActions"></view>
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">更多操作</text>
					<view class="popup-close" @click="hideMoreActions">
						<text>关闭</text>
					</view>
				</view>
				<view class="actions-grid">
					<view class="action-grid-item" @click="handleFileUpload">
						<view class="action-icon file-action">
							<text class="action-icon-text">文件</text>
						</view>
						<text class="action-label">文件</text>
					</view>
					<view class="action-grid-item" @click="handleImageUpload">
						<view class="action-icon image-action">
							<text class="action-icon-text">图片</text>
						</view>
						<text class="action-label">图片</text>
					</view>
					<view class="action-grid-item" @click="handleVideoCall">
						<view class="action-icon video-action">
							<text class="action-icon-text">视频</text>
						</view>
						<text class="action-label">视频通话</text>
					</view>
					<view class="action-grid-item" @click="handleVoiceCall">
						<view class="action-icon voice-action">
							<text class="action-icon-text">语音</text>
						</view>
						<text class="action-label">语音通话</text>
					</view>
					<view class="action-grid-item" @click="handleLocation">
						<view class="action-icon location-action">
							<text class="action-icon-text">位置</text>
						</view>
						<text class="action-label">位置</text>
					</view>
					<view class="action-grid-item" @click="handleVoiceMessage">
						<view class="action-icon audio-action">
							<text class="action-icon-text">音频</text>
						</view>
						<text class="action-label">语音消息</text>
					</view>
					<view class="action-grid-item" @click="handlePoll">
						<view class="action-icon poll-action">
							<text class="action-icon-text">投票</text>
						</view>
						<text class="action-label">投票</text>
					</view>
					<view class="action-grid-item" @click="handleSchedule">
						<view class="action-icon schedule-action">
							<text class="action-icon-text">日程</text>
						</view>
						<text class="action-label">日程</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 表情选择器弹出层（备用实现，以防uni-popup不可用） -->
		<view class="custom-popup emoji-picker" v-show="showCustomEmojiPickerPopup">
			<view class="popup-mask" @click="hideEmojiPicker"></view>
			<view class="emoji-container">
				<view class="emoji-header">
					<text>常用表情</text>
					<view class="emoji-close" @click="hideEmojiPicker">
						<text>关闭</text>
					</view>
				</view>
				<view class="emoji-grid">
					<view class="emoji-item" v-for="(emoji, index) in emojiList" :key="index"
						@click="insertEmoji(emoji)">
						<text>{{ emoji }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		nextTick,
		defineProps,
		defineEmits,
		onMounted,
		onUnmounted
	} from 'vue';
	import api from '@/api';



	//腾讯Chat
	import TencentCloudChat from '@tencentcloud/chat';
	import {
		TUILogin,
		TUICore
	} from '@tencentcloud/tui-core';
	let options = {
		SDKAppID: uni.$SDKAppID, // 接入时需要将0替换为您的云通信应用的 SDKAppID，类型为 Number
	};
	const chat = TencentCloudChat.create(options); // SDK 实例通常用 chat 表示

	//腾讯签名
	import {
		genTestUserSig
	} from '@tencentcloud/chat-uikit-uniapp/debug/GenerateTestUserSig.js';
	// import {conference} from '../../TUIRoom/index';


	// 导入uni-popup组件
	let uniPopupAvailable = false;
	try {
		// 尝试导入uniapp的uni-popup组件
		const uniPopup = uni.requireNativePlugin('uni-popup');
		uniPopupAvailable = true;
	} catch (e) {
		console.error('导入uni-popup组件失败:', e);
		uniPopupAvailable = false;
	}

	const props = defineProps({
		teamId: {
			type: String,
			default: ''
		},
		teamName: {
			type: String,
			default: ''
		}
	});

	const emit = defineEmits(['send', 'loadMore', 'showEmojiPicker', 'showMoreActions']);


	// 数据定义
	const messages = ref([]);
	const messageInput = ref('');
	const scrollTop = ref(0);
	const loadingMore = ref(false);
	const latestMessageId = ref('');
	const currentUserId = ref('1001');
	const isTyping = ref(false);
	const typingUser = ref('');
	const showQuickReplies = ref(false);
	const showScrollBottom = ref(false);
	const moreActionsPopup = ref(null);
	const emojiPickerPopup = ref(null);
	const emojiList = ref(['😊', '😂', '😍', '🤔', '😎', '👍', '❤️', '🎉', '🔥', '👏', '😁', '🙏', '🌟', '💯', '🤝',
		'🚀'
	]);

	// 备用状态，用于自定义弹出层
	const showCustomMoreActionsPopup = ref(false);
	const showCustomEmojiPickerPopup = ref(false);

	// 计算属性
	const sortedMessages = computed(() => {
		// 确保按时间升序排序，最新的消息在最后
		return [...messages.value].sort((a, b) => {
			const timeA = new Date(a.sendTime).getTime();
			const timeB = new Date(b.sendTime).getTime();
			return timeA - timeB;
		});
	});

	// 生命周期钩子
	// onMounted(() => {
	// 	console.log('TeamChat组件已加载');
	// 	console.log('uni-popup组件可用状态:', uniPopupAvailable);

	// 	loadMessages();
	// });



	const gPre = 'trxy@saituo#us' //
	const gPre_meeting = 'trxymt@saituo#us' //临时会议，任何人都可以加入

	let tUid = ''
	let teamId = ''
	let teamName = ''
	let userInfo = {}
	async function isReady(event) {
		// let promise = chat.dismissGroup(gPre_meeting+teamId);
		// promise.then(function(imResponse) { // 解散成功
		// console.log('--------解散成功=-----');
		//   console.log(imResponse.data.groupID); // 被解散的群组 ID
		// }).catch(function(imError) {
		//   console.warn('dismissGroup error:', imError); // 解散群组失败的相关信息
		// });
		await searchGroup()
		//加载数据
		loadMessages();

	}



	//注意：请在调用 login 接口前调用此接口监听事件，避免漏掉 SDK 派发的事件。
	let onMessageReceived = function(event) {
		// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
		// event.name - TencentCloudChat.EVENT.MESSAGE_RECEIVED
		// event.data - 存储 Message 对象的数组 - [Message]
		console.log('=============接收到消息=============');
		console.log(event.data);

		// 处理接收到的消息
		event.data.forEach(msg => {
			// 创建基础消息对象
			const messageObj = {
				id: msg.ID,
				from: msg.from,
				flow: msg.flow,
				userName: msg.nick || '未知用户',
				avatar: msg.avatar,
				sendTime: new Date(msg.time * 1000), // 将时间戳转换为Date对象
				type: 'text', // 默认类型
				content: '',
				isSystemMessage: msg.isSystemMessage
			};

			// 根据消息类型处理内容
			if (msg.type === 'TIMTextElem') {
				messageObj.type = 'text';
				messageObj.content = msg.payload.text;
			} else if (msg.type === 'TIMCustomElem') {
				// 处理自定义消息（如系统消息）
				try {
					const customData = JSON.parse(msg.payload.data);
					if (customData.businessID === 'group_create') {
						messageObj.type = 'system';
						messageObj.content = `${customData.opUser} ${customData.content}`;
					}
				} catch (e) {
					console.error('解析自定义消息失败:', e);
				}
			}

			// 添加到消息列表
			messages.value.push(messageObj);

			// 按时间排序
			messages.value.sort((a, b) => {
				return new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime();
			});

			// 设置最新消息ID
			latestMessageId.value = 'msg-' + messageObj.id;

			// 滚动到底部
			nextTick(() => {
				scrollToBottom();
			});
		});
	};

	onUnmounted(async () => {
		let promise = chat.logout();
		promise.then(function(imResponse) {
			console.log(imResponse.data); // 登出成功
		}).catch(function(imError) {
			console.warn('logout error:', imError);
		});

		chat.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
		chat.off(TencentCloudChat.EVENT.SDK_READY, isReady)
	}) 

	onMounted(async () => {

		// 获取页面传递的参数
		teamId = props.teamId;
		teamName = props.teamName;
		userInfo = await getUserInfo();
		console.log('用户信息:', userInfo);
		console.log('接收到的团队参数:' + teamId, teamName);
		console.log('团队ID是:' + teamId);
		const roomId = teamId;
		if (!roomId) {
			uni.showModal({
				title: '提示',
				content: '缺少必要的团队ID参数',
				showCancel: false,
				success: () => {
					uni.navigateBack();
				}
			});
			return;
		}

		// 确保用户ID是字符串类型且不为空
		let userid = '';
		if (userInfo && userInfo.id) {
			userid = String(userInfo.id);
		}

		// 生成用户签名
		const {
			userSig
		} = genTestUserSig({
			SDKAppID: 1600089635,
			userID: userid,
			secretKey: 'e0b01fef05f7f7b644b7c374bf26ae5a9afc88853a4817fc18494fc2a1f56540'
		});
		// 设置用户名称
		let userName = '会议用户';
		if (userInfo && userInfo.realName) {
			userName = userInfo.realName;
		} else if (teamName) {
			userName = `${teamName}成员`;
		}


		chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
		chat.on(TencentCloudChat.EVENT.SDK_READY, isReady)
		tUid = userid
		currentUserId.value = tUid
		TUILogin.login({
			SDKAppID: uni.$SDKAppID,
			userID: tUid,
			userSig: userSig,
			useUploadPlugin: true, // If you need to send rich media messages, please set to true.
			framework: `vue3` // framework used vue2 / vue3
		}).catch(() => {});
		// 设置用户信息，显示用户名
		// await conference.setSelfInfo({
		//     userName: userName,
		//     avatarUrl: userInfo?.avatarUrl || ''
		// });
		console.log("用户ID是" + userid + "，签名是" + userSig);

	})

	async function searchGroup() {

		// 该接口默认只会拉取这些资料：群类型、群名称、群头像、最后一条消息的时间。
		let promise = chat.getGroupList()

		return promise.then(function(imResponse) {
			let groupList = imResponse.data.groupList
			console.log("============群组列表==========");
			console.log(groupList); // 群组列表
			let isExist = false
			groupList.forEach(group => {
				if (group.groupID == gPre_meeting + teamId) {
					isExist = true;
				}
			})
			if (!isExist) {
				console.log(`============群组不存在${isExist}`);
				createGroup(teamId, teamName)
				// joinGroup(teamId,tUid)
			}
		}).catch(function(imError) {
			console.warn('getGroupList error:', imError); // 获取群组列表失败的相关信息
		});
	}
	//创建工作群组
	async function createGroup(gId, groupName) {
		let promise = chat.createGroup({
			type: TencentCloudChat.TYPES.GRP_MEETING, //创建社群，工作群无法被搜索到
			name: groupName,
			groupID: gPre_meeting + gId,
			joinOption: TencentCloudChat.JOIN_OPTIONS_FREE_ACCESS,
			inviteOption: TencentCloudChat.TYPES.INVITE_OPTIONS_FREE_ACCESS
		});
		promise.then(function(imResponse) { // 创建成功
			console.log("-------群组创建成功-------")
			console.log(imResponse.data); // 创建的群的资料
		}).catch(function(imError) {
			console.log("-------群组创建失败-------")
			joinGroup(gId, tUid)
			console.warn('createGroup error:', imError); // 创建群组失败的相关信息
		});
	}

	async function joinGroup(gId, uid) {
		console.log(`-------加入群组中-------${gId} - ${uid}`)
		let promise = chat.joinGroup({
			groupID: gPre_meeting + gId
		});
		return promise.then(function(imResponse) {
			switch (imResponse.data.status) {
				case TencentCloudChat.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
					console.log("-------群组加入，等待管理员同意-------")
					break;
				case TencentCloudChat.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
					console.log("-------群组加入成功-------")
					console.log(imResponse.data.group); // 加入的群组资料
					break;
				case TencentCloudChat.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
					console.log("-------已在群中-------")
					break;
				default:
					break;
			}
		}).catch(function(imError) {
			console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
		});

	}

	async function getMessage() {
		// 打开某个会话时，第一次拉取消息列表，注意！第一次拉取时不要传入 nextReqMessageID
		let promise = chat.getMessageList({
			conversationID: `GROUP${gPre_meeting+teamId}`
		});
		promise.then(function(imResponse) {
			const messageList = imResponse.data.messageList; // 消息列表。
			const nextReqMessageID = imResponse.data.nextReqMessageID; // 用于续拉，分页续拉时需传入该字段。
			const isCompleted = imResponse.data
			.isCompleted; // 表示是否已经拉完所有消息。isCompleted 为 true 时，nextReqMessageID 为 ""。

			console.log("=========历史消息列表");
			console.log(messageList);

			// 清空现有消息
			messages.value = [];

			// 处理消息列表
			messageList.forEach(msg => {
				// 创建基础消息对象
				const messageObj = {
					id: msg.ID,
					from: msg.from,
					flow: msg.flow,
					userName: msg.nick || '未知用户',
					avatar: msg.avatar,
					sendTime: new Date(msg.time * 1000), // 将时间戳转换为Date对象
					type: 'text', // 默认类型
					content: '',
					isSystemMessage: msg.isSystemMessage
				};

				// 根据消息类型处理内容
				if (msg.type === 'TIMTextElem') {
					messageObj.type = 'text';
					messageObj.content = msg.payload.text;
				} else if (msg.type === 'TIMCustomElem') {
					// 处理自定义消息（如系统消息）
					try {
						const customData = JSON.parse(msg.payload.data);
						if (customData.businessID === 'group_create') {
							messageObj.type = 'system';
							messageObj.content = `${customData.opUser} ${customData.content}`;
						}
					} catch (e) {
						console.error('解析自定义消息失败:', e);
					}
				}

				// 添加到消息列表
				messages.value.push(messageObj);
			});

			// 按时间排序
			messages.value.sort((a, b) => {
				return new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime();
			});

			// 设置最新消息ID
			if (messages.value.length > 0) {
				latestMessageId.value = 'msg-' + messages.value[messages.value.length - 1].id;
			}

			// 滚动到底部
			nextTick(() => {
				scrollToBottom();
			});
		});
	}
	// 获取用户信息的函数，使用项目中已有的API模块
	async function getUserInfo() {
		try {
			// 使用API模块中的parseUserRole方法获取用户信息
			const res = await api.user.getUserProfile();

			// 检查返回结果
			if (res && res.code === 200 && res.data) {
				console.log('获取用户信息成功:', res.data);
				return res.data;
			} else {
				console.error('获取用户信息失败:', res);
				return null;
			}
		} catch (error) {
			console.error('获取用户信息出错:', error);
			return null;
		}
	}


	// 方法
	async function loadMessages() {
		getMessage()
		// 模拟加载数据，实际上这里会从父组件传递过来
	}



	function loadMoreMessages() {
		if (loadingMore.value) return;
		loadingMore.value = true;

		emit('loadMore', () => {
			// 这个回调会在父组件加载完更多消息后调用
			loadingMore.value = false;
		});
	}

	function scrollToBottom() {
		if (messages.value.length === 0) return;

		const lastMessageId = 'msg-' + messages.value[messages.value.length - 1].id;
		latestMessageId.value = lastMessageId;

		// 确保滚动到底部的多种方法
		try {
			// 直接设置很大的scrollTop值
			scrollTop.value = 99999999;

			// 使用定时器再次尝试滚动
			setTimeout(() => {
				const query = uni.createSelectorQuery();
				query.select('.chat-messages').boundingClientRect(data => {
					if (data) {
						console.log('滚动到底部，消息容器高度：', data.height);
						scrollTop.value = data.height * 3; // 设置足够大的值确保滚动到底部
					}
				}).exec();
			}, 50);

			// 最后使用scrollIntoView兜底
			if (uni.pageScrollTo) {
				setTimeout(() => {
					uni.pageScrollTo({
						selector: '#' + lastMessageId,
						duration: 0
					});
				}, 100);
			}
		} catch (e) {
			console.error('滚动到底部出错:', e);
			scrollTop.value = 999999;
		}
	}

	function sendMessage() {
		if (!messageInput.value.trim()) return;
		const messageContent = messageInput.value;
		messageInput.value = '';
		// 发送文本消息，Web 端与小程序端相同
		// 1. 创建消息实例，接口返回的实例可以上屏
		let message = chat.createTextMessage({
			to: gPre_meeting + teamId,
			conversationType: TencentCloudChat.TYPES.CONV_GROUP,
			// 消息优先级，用于群聊。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
			// 支持的枚举值：TencentCloudChat.TYPES.MSG_PRIORITY_HIGH, TencentCloudChat.TYPES.MSG_PRIORITY_NORMAL（默认）, TencentCloudChat.TYPES.MSG_PRIORITY_LOW, TencentCloudChat.TYPES.MSG_PRIORITY_LOWEST
			// priority: TencentCloudChat.TYPES.MSG_PRIORITY_NORMAL,
			payload: {
				text: messageContent
			},
			// 支持C2C消息已读回执功能，如果您发消息需要已读回执，需购买旗舰版套餐，并且创建消息时将 needReadReceipt 设置为 true
			needReadReceipt: true
			// 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
			// cloudCustomData: 'your cloud custom data'
		});
		// 2. 发送消息
		let promise = chat.sendMessage(message);
		promise.then(function(imResponse) {
			// 发送成功
			console.log(imResponse);
		}).catch(function(imError) {
			// 发送失败
			console.warn('sendMessage error:', imError);
		});



		// 隐藏快捷回复
		showQuickReplies.value = false;
		// 发送消息到父组件处理
		emit('send', {
			content: messageContent,
			type: 'text'
		});

		// 滚动到底部
		nextTick(() => {
			scrollToBottom();
		});
	}

	function chooseImage() {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];

				// 发送图片消息到父组件处理
				emit('send', {
					content: tempFilePath,
					type: 'image'
				});
			}
		});
	}

	function previewImage(url) {
		const imageUrls = messages.value
			.filter(msg => msg.type === 'image')
			.map(msg => msg.content);

		uni.previewImage({
			current: url,
			urls: imageUrls
		});
	}

	function shouldShowTimeSeparator(message, index) {
		if (index === 0) return true;

		const currentTime = new Date(message.sendTime).getTime();
		const prevTime = new Date(sortedMessages.value[index - 1].sendTime).getTime();

		// 如果与前一条消息相隔超过30分钟，显示时间分割线
		return (currentTime - prevTime) > 30 * 60 * 1000;
	}

	function formatTime(date) {
		if (!date) return '';
		if (typeof date === 'string') {
			date = new Date(date);
		}

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const timeStr = `${hours}:${minutes}`;

		if (date < today) {
			// 判断是否是昨天
			if (date >= yesterday) {
				return `昨天 ${timeStr}`;
			} else {
				// 更早的日期，显示完整日期
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${month}-${day} ${timeStr}`;
			}
		}

		return timeStr;
	}

	function formatMessageTime(date) {
		if (!date) return '';
		if (typeof date === 'string') {
			date = new Date(date);
		}

		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	function showMoreActions() {
		console.log('显示更多操作弹出层');
		if (uniPopupAvailable && moreActionsPopup.value) {
			nextTick(() => {
				moreActionsPopup.value.open();
			});
		} else {
			showCustomMoreActionsPopup.value = true;
		}
	}

	function hideMoreActions() {
		console.log('隐藏更多操作弹出层');
		if (uniPopupAvailable && moreActionsPopup.value) {
			nextTick(() => {
				moreActionsPopup.value.close();
			});
		} else {
			showCustomMoreActionsPopup.value = false;
		}
	}

	function showEmojiPicker() {
		console.log('显示表情选择器');
		if (uniPopupAvailable && emojiPickerPopup.value) {
			nextTick(() => {
				emojiPickerPopup.value.open();
			});
		} else {
			showCustomEmojiPickerPopup.value = true;
		}
	}

	function hideEmojiPicker() {
		console.log('隐藏表情选择器');
		if (uniPopupAvailable && emojiPickerPopup.value) {
			nextTick(() => {
				emojiPickerPopup.value.close();
			});
		} else {
			showCustomEmojiPickerPopup.value = false;
		}
	}

	function insertEmoji(emoji) {
		// 向聊天输入框插入表情
		messageInput.value += emoji;
		hideEmojiPicker();
	}

	// 更多操作相关方法
	function handleFileUpload() {
		uni.showToast({
			title: '文件上传功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function handleImageUpload() {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];

				emit('send', {
					type: 'image',
					content: tempFilePath
				});
			}
		});
		hideMoreActions();
	}

	function handleVideoCall() {
		uni.showToast({
			title: '视频通话功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function handleVoiceCall() {
		uni.showToast({
			title: '语音通话功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function handleLocation() {
		uni.chooseLocation({
			success: (res) => {
				emit('send', {
					type: 'text',
					content: `[位置] ${res.name}\n${res.address}`
				});
			}
		});
		hideMoreActions();
	}

	function handleVoiceMessage() {
		uni.showToast({
			title: '语音消息功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function handlePoll() {
		uni.showToast({
			title: '投票功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function handleSchedule() {
		uni.showToast({
			title: '日程功能开发中',
			icon: 'none'
		});
		hideMoreActions();
	}

	function toggleQuickReplies() {
		showQuickReplies.value = !showQuickReplies.value;
	}

	function selectQuickReply(reply) {
		messageInput.value = reply;
		showQuickReplies.value = false;
		sendMessage();
	}

	function onInputFocus() {
		// 关闭所有弹窗
		showQuickReplies.value = false;
	}

	function onScroll(e) {
		// 检测滚动位置，如果不在底部则显示滚动按钮
		const scrollHeight = e.detail.scrollHeight;
		const scrollTop = e.detail.scrollTop;
		const clientHeight = e.detail.scrollHeight - e.detail.deltaY;

		// 如果距离底部超过200px，显示滚动按钮
		showScrollBottom.value = (scrollHeight - scrollTop - clientHeight) > 200;
	}

	// 暴露方法给父组件调用
	defineExpose({
		addMessage(message) {
			console.log('添加新消息:', message);
			// 确保消息有正确的时间戳，设置为当前时间
			if (!message.sendTime) {
				message.sendTime = new Date();
			} else if (typeof message.sendTime === 'string') {
				message.sendTime = new Date(message.sendTime);
			}

			// 添加消息到数组，确保有唯一ID
			if (!message.id) {
				message.id = Date.now().toString();
			}

			// 添加到消息数组
			messages.value.push(message);

			// 排序确保按时间顺序
			messages.value.sort((a, b) => {
				return new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime();
			});

			// 设置最新消息ID，确保滚动目标正确
			latestMessageId.value = 'msg-' + message.id;

			// 立即尝试滚动到底部
			scrollTop.value = 999999;

			// 使用nextTick确保DOM已更新
			nextTick(() => {
				// 重新滚动到底部
				scrollToBottom();

				// 再次尝试滚动，确保显示
				setTimeout(() => {
					scrollTop.value = 999999;

					// 最后一次尝试，确保滚动生效
					setTimeout(() => {
						scrollToBottom();
					}, 100);
				}, 50);
			});
		},
		showTypingIndicator(user) {
			// 移除打字指示器逻辑，保持API兼容性
		},
		hideTypingIndicator() {
			// 移除打字指示器逻辑，保持API兼容性
		}
	});
</script>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		min-height: 800rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
	}

	.chat-messages {
		flex: 1;
		max-height: 800rpx;
		padding: 20rpx 30rpx;
		height: calc(100% - 160rpx);
		box-sizing: border-box;
		overflow-anchor: auto;
	}

	.loading-more {
		text-align: center;
		padding: 20rpx 0;
		font-size: 24rpx;
		color: #999999;
	}

	.message-item {
		display: flex;
		margin-bottom: 20rpx;
		width: 100%;
	}

	.self-message {
		flex-direction: row-reverse;
		justify-content: flex-start;
	}

	.avatar-container {
		width: 80rpx;
		flex-shrink: 0;
		display: flex;
		align-items: flex-start;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #f0f0f0;
	}

	.message-content {
		max-width: 70%;
		margin: 0 20rpx;
		display: flex;
		flex-direction: column;
	}

	.message-sender {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 8rpx;
	}

	.message-bubble {
		padding: 20rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		word-break: break-all;
		line-height: 1.4;
		max-width: 100%;
		display: inline-block;
	}

	.self-message .message-bubble {
		background-color: #e1f5fe;
		color: #0288d1;
		border-top-right-radius: 4rpx;
		align-self: flex-end;
	}

	.message-item:not(.self-message) .message-bubble {
		background-color: #f5f5f5;
		color: #333333;
		border-top-left-radius: 4rpx;
		align-self: flex-start;
	}

	.message-time {
		font-size: 22rpx;
		color: #999999;
		margin-top: 6rpx;
	}

	.self-message .message-time {
		text-align: right;
	}

	.message-item:not(.self-message) .message-time {
		text-align: left;
	}

	.message-image {
		width: 100%;
		max-width: 400rpx;
		border-radius: 12rpx;
	}

	.message-file {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
	}

	.file-icon {
		width: 80rpx;
		height: 80rpx;
		background-color: #bbdefb;
		border-radius: 12rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #0288d1;
	}

	.file-info {
		flex: 1;
		margin: 0 20rpx;
	}

	.file-name {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 8rpx;
	}

	.file-size {
		font-size: 24rpx;
		color: #999999;
	}

	.file-download {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #0288d1;
	}

	.system-message {
		justify-content: center;
		margin: 15rpx 0;
	}

	.system-bubble {
		background-color: rgba(0, 0, 0, 0.05) !important;
		padding: 12rpx 24rpx !important;
		border-radius: 30rpx !important;
		color: #666666 !important;
		font-size: 24rpx !important;
	}

	.time-separator {
		display: flex;
		justify-content: center;
		margin: 20rpx 0;
	}

	.time-separator text {
		font-size: 24rpx;
		color: #999;
		background-color: rgba(0, 0, 0, 0.05);
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	.typing-indicator {
		display: flex;
		align-items: flex-end;
		margin: 20rpx 0 20rpx 30rpx;
	}

	.typing-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 16rpx;
		background-color: #f0f0f0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.typing-user {
		font-size: 28rpx;
		color: #666;
		font-weight: bold;
	}

	.typing-bubbles {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		padding: 16rpx 20rpx;
	}

	.typing-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #999999;
		margin: 0 6rpx;
		animation: typing-animation 1.2s infinite ease-in-out;
	}

	.typing-dot:nth-child(1) {
		animation-delay: 0s;
	}

	.typing-dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing-animation {

		0%,
		60%,
		100% {
			transform: translateY(0);
		}

		30% {
			transform: translateY(-10rpx);
		}
	}

	.chat-footer {
		min-height: 160rpx;
		border-top: 1rpx solid #f0f0f0;
		background-color: #ffffff;
	}

	.quick-replies {
		width: 100%;
		padding: 10rpx 0;
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.quick-replies-scroll {
		white-space: nowrap;
		padding: 0 20rpx;
	}

	.quick-reply-item {
		display: inline-block;
		padding: 10rpx 30rpx;
		margin-right: 16rpx;
		background-color: #f5f5f5;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: #333333;
	}

	.quick-reply-item:active {
		background-color: #e0e0e0;
	}

	.chat-input-area {
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
	}

	.input-container {
		display: flex;
		flex-direction: column;
	}

	.chat-input {
		width: 100%;
		min-height: 80rpx;
		max-height: 120rpx;
		padding: 20rpx;
		background-color: #f5f5f5;
		border-radius: 10rpx;
		font-size: 28rpx;
		margin-bottom: 20rpx;
		border: 1rpx solid #e0e0e0;
	}

	.input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10rpx;
	}

	.action-btn {
		min-width: 80rpx;
		height: 70rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #666666;
		border-radius: 35rpx;
		margin: 0 5rpx;
	}

	.text-btn {
		background-color: #f0f0f0;
		transition: all 0.2s ease;
		padding: 0 20rpx;
	}

	.action-text {
		font-size: 28rpx;
		font-weight: 500;
	}

	.send-btn {
		background-color: #3498db;
		color: #ffffff;
		padding: 0 30rpx;
		min-width: 120rpx;
		border: none;
		outline: none;
		font-size: inherit;
		line-height: inherit;
		border-radius: 35rpx;
		height: 70rpx;
		box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.3);
		transition: all 0.2s ease;
	}

	.send-btn:active {
		transform: scale(0.95);
		background-color: #2980b9;
	}

	.send-btn .send-text {
		color: #ffffff;
		font-size: 30rpx;
		font-weight: bold;
	}

	.input-form {
		width: 100%;
	}

	.scroll-to-bottom {
		position: absolute;
		right: 30rpx;
		bottom: 180rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(52, 152, 219, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
		z-index: 100;
	}

	.scroll-to-bottom-icon {
		font-size: 40rpx;
		font-weight: bold;
	}

	/* 自定义弹出层 */
	.custom-popup {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		z-index: 999999;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.popup-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 999998;
	}

	.popup-content {
		position: relative;
		background-color: #ffffff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		padding: 40rpx 30rpx;
		max-height: 80vh;
		overflow-y: auto;
		z-index: 999999;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 0 20rpx;
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 20rpx;
	}

	.popup-title {
		font-size: 30rpx;
		font-weight: 500;
	}

	.popup-close {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #666;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.popup-close:active {
		background-color: #e0e0e0;
	}

	.actions-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.action-grid-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30rpx 0;
	}

	.action-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 16rpx;
		box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
	}

	.action-icon-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
	}

	.action-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.file-action {
		background-color: #4caf50;
	}

	.image-action {
		background-color: #2196f3;
	}

	.video-action {
		background-color: #f44336;
	}

	.voice-action {
		background-color: #ff9800;
	}

	.location-action {
		background-color: #009688;
	}

	.audio-action {
		background-color: #9c27b0;
	}

	.poll-action {
		background-color: #795548;
	}

	.schedule-action {
		background-color: #607d8b;
	}

	/* 覆盖旧的样式 */
	.more-actions-popup,
	.emoji-picker {
		display: flex;
	}

	.emoji-container {
		position: relative;
		background-color: #ffffff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		padding: 30rpx;
		height: 500rpx;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
		z-index: 999999;
	}

	.emoji-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx 0;
	}

	.emoji-item {
		width: 12.5%;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 40rpx;
		transition: all 0.2s ease;
	}

	.emoji-item:active {
		transform: scale(1.2);
		background-color: #f5f5f5;
		border-radius: 8rpx;
	}
</style>