import {
	TUILogin
} from '@tencentcloud/tui-core';
import TencentCloudChat from '@tencentcloud/chat';
import {
	genTestUserSig
} from '@tencentcloud/chat-uikit-uniapp/debug/GenerateTestUserSig.js';

export function loginChat() {
	const userId = uni.getStorageSync('userId')
	if(!userId){
		return
	}
	console.log('userId:', userId);
	// 生成用户签名
	const {
		userSig
	} = genTestUserSig({
		SDKAppID: 1600089635,
		userID: String(userId),
		secretKey: 'e0b01fef05f7f7b644b7c374bf26ae5a9afc88853a4817fc18494fc2a1f56540'
	});
	// 登录
	
	let promise = TUILogin.login({
			SDKAppID: uni.$SDKAppID,
			userID: String(userId),
			userSig: userSig,
			useUploadPlugin: true,
			framework: 'vue3'
		})
	return promise
}

export function logoutChat(){
	
		let promise = uni.$chat.logout();
		promise.then(function(imResponse) {
			console.log(imResponse.data); // 登出成功
		}).catch(function(imError) {
			console.warn('logout error:', imError);
		});
	
}