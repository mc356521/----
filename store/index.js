// 用于管理全局状态的简单存储
import { reactive } from 'vue'

// 尝试从本地存储获取已存储的状态
const getStoredState = () => {
    try {
        const storedState = uni.getStorageSync('userInteractionState')
        return storedState ? JSON.parse(storedState) : null
    } catch (e) {
        console.error('读取本地存储失败', e)
        return null
    }
}

// 存储状态到本地存储
const saveStateToStorage = (state) => {
    try {
        // 过滤掉不需要持久化的状态
        const { hasAnalyzedInSession, ...stateToPersist } = state;
        uni.setStorageSync('userInteractionState', JSON.stringify(stateToPersist));
    } catch (e) {
        console.error('存储状态失败', e)
    }
}

// 初始状态，如果本地存储中有数据则使用，否则使用默认值
const initialState = getStoredState() || {}

// 为state添加非持久化（会话期间）的初始状态
initialState.hasAnalyzedInSession = false;

// 创建响应式状态对象
export const state = reactive(initialState)

// 更新状态并保存到本地存储
export const updateState = (key, value) => {
    if (key in state) {
        state[key] = value
        saveStateToStorage(state)
    }
}

// 提供方法获取状态
export const getState = (key) => {
    return key in state ? state[key] : null
}

// 清除所有状态（例如用户登出时）
export const clearState = () => {
    Object.keys(state).forEach(key => {
        state[key] = initialState[key]
    })
    uni.removeStorageSync('userInteractionState')
}

export default {
    state,
    updateState,
    getState,
    clearState
}