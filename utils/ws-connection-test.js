/**
 * WebSocket连接测试工具
 * 用于帮助排查WebSocket连接问题
 */
import { getToken } from './request';
import env from '@/config/env';

/**
 * 测试WebSocket连接
 * @returns {Promise} 测试结果Promise
 */
export function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('开始测试WebSocket连接...');
    
    // 检查配置和环境
    const token = getToken();
    if (!token) {
      console.error('未获取到有效的token，WebSocket连接将失败');
      reject('认证失败：未获取到有效的token');
      return;
    }
    
    console.log('已获取token:', token.substring(0, 10) + '...');
    
    // 获取WebSocket URL
    const wsUrl = env.wsUrl;
    if (!wsUrl) {
      console.error('未配置WebSocket URL');
      reject('配置错误：未配置WebSocket URL');
      return;
    }
    
    // 确保URL格式正确
    const url = `${wsUrl}?token=${encodeURIComponent(token)}`;
    console.log('尝试连接WebSocket:', url);
    
    // 创建WebSocket连接
    let socketTask;
    try {
      socketTask = uni.connectSocket({
        url: url,
        success: () => {
          console.log('WebSocket连接请求已发送');
        },
        fail: (err) => {
          console.error('WebSocket连接请求失败:', err);
          reject(`连接请求发送失败: ${JSON.stringify(err)}`);
        }
      });
    } catch (e) {
      console.error('创建WebSocket连接异常:', e);
      reject(`创建连接异常: ${e.message}`);
      return;
    }
    
    if (!socketTask) {
      console.error('未能创建socketTask对象');
      reject('创建socketTask失败');
      return;
    }
    
    // 设置超时
    const timeout = setTimeout(() => {
      console.error('WebSocket连接超时');
      if (socketTask) {
        try {
          socketTask.close();
        } catch (e) {
          console.error('关闭WebSocket连接失败:', e);
        }
      }
      reject('连接超时');
    }, 10000);
    
    // 设置事件处理
    socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      clearTimeout(timeout);
      
      // 连接成功后发送认证消息
      socketTask.send({
        data: JSON.stringify({
          type: 'auth',
          token: token
        }),
        success: () => {
          console.log('认证消息已发送');
        },
        fail: (err) => {
          console.error('认证消息发送失败:', err);
        }
      });
      
      // 5秒后关闭连接
      setTimeout(() => {
        console.log('测试完成，关闭连接');
        try {
          socketTask.close();
        } catch (e) {
          console.error('关闭WebSocket连接失败:', e);
        }
        resolve('WebSocket连接测试成功');
      }, 5000);
    });
    
    socketTask.onMessage((res) => {
      console.log('收到WebSocket消息:', res.data);
      try {
        const data = JSON.parse(res.data);
        if (data.error) {
          console.error('服务器返回错误:', data.error);
          reject(`服务器返回错误: ${data.error}`);
          clearTimeout(timeout);
          socketTask.close();
        }
      } catch (e) {
        console.log('消息不是JSON格式');
      }
    });
    
    socketTask.onError((err) => {
      console.error('WebSocket连接错误:', err);
      clearTimeout(timeout);
      reject(`连接错误: ${JSON.stringify(err)}`);
    });
    
    socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
      clearTimeout(timeout);
    });
  });
}

/**
 * 运行WebSocket连接测试
 */
export function runWebSocketTest() {
  console.log('======= WebSocket连接测试 =======');
  
  // 检查用户是否已登录
  const token = getToken();
  if (!token) {
    console.error('未登录状态，无法进行WebSocket连接测试');
    uni.showModal({
      title: '测试失败',
      content: '您需要先登录才能测试WebSocket连接',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  
  console.log('环境:', env.env);
  console.log('WebSocket URL:', env.wsUrl);
  
  // 获取网络状态
  uni.getNetworkType({
    success: (res) => {
      console.log('网络状态:', res.networkType);
      
      // 执行连接测试
      testWebSocketConnection()
        .then(result => {
          console.log('测试结果:', result);
          uni.showToast({
            title: '连接测试成功',
            icon: 'success'
          });
        })
        .catch(error => {
          console.error('测试失败:', error);
          uni.showModal({
            title: 'WebSocket测试失败',
            content: `错误信息: ${error}`,
            showCancel: false
          });
        });
    }
  });
}

export default {
  testWebSocketConnection,
  runWebSocketTest
}; 