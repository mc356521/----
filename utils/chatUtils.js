import {
    TUILogin
} from '@tencentcloud/tui-core';
import TencentCloudChat from '@tencentcloud/chat';
import {
    genTestUserSig
} from '@tencentcloud/chat-uikit-uniapp/debug/GenerateTestUserSig.js';

export function loginChat(userInfo) {
    const userId = uni.getStorageSync('userId') || (userInfo ? String(userInfo.id) : null);
    if (!userId) {
        console.error('loginChat: User ID is missing.');
        return Promise.reject('User ID is missing.');
    }
    console.log('Attempting to log in to Tencent IM with userId:', userId);
    // 生成用户签名
    const {
        userSig
    } = genTestUserSig({
        SDKAppID: 1600094068,
        userID: String(userId),
        secretKey: '763dc0b66ff840de47ef5ee2394ce2bce72236530f78dad5e85dc9a37866b858'
    });
    // 登录

    let promise = TUILogin.login({
        SDKAppID: uni.$SDKAppID,
        userID: String(userId),
        userSig: userSig,
        useUploadPlugin: true,
        framework: 'vue3'
    });

    promise.then((imResponse) => {
        console.log('Tencent IM login successful:', imResponse.data);
        // After successful login, update user profile
        if (userInfo && userInfo.realName) {
            console.log('Updating Tencent IM profile with:', {
                nick: userInfo.realName,
                avatar: userInfo.avatarUrl || ''
            });
            uni.$chat.updateMyProfile({
                nick: userInfo.realName,
                avatar: userInfo.avatarUrl || '',
            }).then((updateResponse) => {
                console.log('Tencent IM profile updated successfully:', updateResponse.data);
            }).catch((error) => {
                console.warn('Tencent IM profile update failed:', error);
            });
        } else {
            console.log('No user info provided to update profile, skipping.');
        }
    }).catch((imError) => {
        console.warn('Tencent IM login failed:', imError);
    });

    return promise
}

export function logoutChat() {

    let promise = uni.$chat.logout();
    promise.then(function(imResponse) {
        console.log(imResponse.data); // 登出成功
    }).catch(function(imError) {
        console.warn('logout error:', imError);
    });
    return promise;
}