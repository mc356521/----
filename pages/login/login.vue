<template>
  <view class="container">
    <!-- 主内容区 -->
    <view class="content-area">
      <!-- 顶部图片 -->
      <view class="top-image">
        <image src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
               mode="aspectFill" 
               class="campus-image"></image>
      </view>
      
      <!-- 欢迎文字 -->
      <view class="welcome-text">
        <text class="welcome-title">{{isRegistering ? '注册账号' : '欢迎回来'}}</text>
        <text class="welcome-subtitle">{{isRegistering ? '创建您的校园平台账号' : '登录您的校园平台账号，开启校园新体验'}}</text>
      </view>
      
      <!-- 登录表单 -->
      <view class="login-form" v-if="!isRegistering">
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-user"></text>
            <input type="text" placeholder="学号/手机号" class="form-input" v-model="loginForm.phone" />
          </view>
        </view>
        
        <view class="input-field">
			
          <view class="input-content">
            <text class="iconfont icon-user"></text>
            <input type="text" placeholder="密码" class="form-input" v-model="loginForm.password" :password="showPassword" />
            <text class="iconfont" :class="showPassword ? 'icon-eye-slash' : 'icon-eye'" @click="togglePasswordVisibility"></text>
          </view>
        </view>
        
        <view class="remember-row">
          <view class="remember-me">
            <checkbox value="1" :checked="isRemember" @click="toggleRemember" class="remember-checkbox" color="#4A90E2" />
            <text class="remember-text">记住我</text>
          </view>
          <text class="forgot-password" @click="forgotPassword">忘记密码?</text>
        </view>
        
        <button class="login-btn" @click="handleLogin" hover-class="btn-hover">登录</button>
        <button class="register-btn" @click="toggleRegister" hover-class="register-btn-hover">注册新账号</button>
      </view>
      
      <!-- 注册表单 -->
      <view class="login-form" v-else>
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-mobile"></text>
            <input type="text" placeholder="手机号" class="form-input" v-model="registerForm.phoneNumber" />
          </view>
        </view>
        
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-lock"></text>
            <input type="text" placeholder="密码" class="form-input" v-model="registerForm.password" :password="showPassword" />
            <text class="iconfont" :class="showPassword ? 'icon-eye-slash' : 'icon-eye'" @click="togglePasswordVisibility"></text>
          </view>
        </view>
        
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-user"></text>
            <input type="text" placeholder="真实姓名" class="form-input" v-model="registerForm.realName" />
          </view>
        </view>
        
        <!-- 学校选择 -->
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-graduation"></text>
            <picker mode="multiSelector" @change="onSchoolChange" @columnchange="onSchoolColumnChange" :value="schoolMultiIndex" :range="schoolMultiArray" range-key="name" class="school-picker">
              <view class="picker-content">
                <text class="picker-text">{{selectedSchoolName || '请选择学校（省份-学校）'}}</text>
                <text class="iconfont icon-arrow-left picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>
        
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-graduation"></text>
            <input type="text" placeholder="专业" class="form-input" v-model="registerForm.major" />
          </view>
        </view>
        
        <view class="input-field">
          <view class="input-content">
            <text class="iconfont icon-graduation"></text>
            <input type="text" placeholder="学号" class="form-input" v-model="registerForm.studentTeacherId" />
          </view>
        </view>
        
        <button class="login-btn" @click="handleRegister" hover-class="btn-hover">注册</button>
        <button class="register-btn" @click="toggleRegister" hover-class="register-btn-hover">返回登录</button>
      </view>
      
      <!-- 其他登录方式 -->
      <view class="other-login" v-if="!isRegistering">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line"></view>
        </view>
        
        <view class="social-buttons">
          <view class="social-btn" @click="socialLogin('wechat')" hover-class="social-btn-hover">
            <text class="iconfont icon-weixin"></text>
          </view>
          <view class="social-btn" @click="socialLogin('qq')" hover-class="social-btn-hover">
            <text class="iconfont icon-qq"></text>
          </view>
          <view class="social-btn" @click="socialLogin('phone')" hover-class="social-btn-hover">
            <text class="iconfont icon-mobile"></text>
          </view>
        </view>
      </view>
      
      <!-- 底部文字 -->
      <view class="footer-text">
        <text class="agreement-text">{{isRegistering ? '注册即表示您同意我们的' : '登录即表示您同意我们的'}}</text>
        <text class="link-text" @click="openTerms">服务条款</text>
        <text class="agreement-text">和</text>
        <text class="link-text" @click="openPrivacy">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import api from '@/api';

// 响应式状态
const isRemember = ref(false);
const showPassword = ref(true);
const isRegistering = ref(false);

// 学校相关
const schools = ref([]);
const schoolMultiArray = ref([[], []]);  // 第一列为省份，第二列为学校
const schoolMultiIndex = ref([0, 0]);    // 当前选中的省份索引和学校索引
const provinces = ref([]);               // 所有省份列表
const schoolsByProvince = ref({});       // 按省份分组的学校列表

// 选中的学校名称
const selectedSchoolName = computed(() => {
  if (schoolMultiArray.value[0].length === 0 || schoolMultiArray.value[1].length === 0) {
    return '';
  }
  
  const provinceIndex = schoolMultiIndex.value[0];
  const schoolIndex = schoolMultiIndex.value[1];
  
  if (!schoolMultiArray.value[0][provinceIndex] || !schoolMultiArray.value[1][schoolIndex]) {
    return '';
  }
  
  const provinceName = schoolMultiArray.value[0][provinceIndex].name;
  const schoolName = schoolMultiArray.value[1][schoolIndex].name;
  return `${provinceName} - ${schoolName}`;
});

// 表单数据
const loginForm = reactive({
  phone: '',
  password: ''
});

const registerForm = reactive({
  phoneNumber: '',
  password: '',
  realName: '',
  schoolId: 1,
  role: 'student',
  major: '',
  studentTeacherId: ''
});

// 在组件挂载时获取学校列表并检查缓存的登录信息
onMounted(async () => {
  try {
    // 获取学校列表
    const result = await api.user.getSchools();
    if (result && result.data) {
      schools.value = result.data;
      
      // 按省份分组学校
      const provinceMap = {};
      const schoolMap = {};
      
      // 提取所有不同的省份
      result.data.forEach(school => {
        if (!provinceMap[school.province]) {
          provinceMap[school.province] = {
            id: school.province,
            name: school.province
          };
          schoolMap[school.province] = [];
        }
        
        schoolMap[school.province].push(school);
      });
      
      // 转换为数组
      provinces.value = Object.values(provinceMap);
      schoolsByProvince.value = schoolMap;
      
      // 初始化多列选择器数据
      schoolMultiArray.value[0] = provinces.value;
      
      // 如果有省份，则初始化第二列为第一个省份的学校
      if (provinces.value.length > 0) {
        const firstProvince = provinces.value[0].name;
        schoolMultiArray.value[1] = schoolsByProvince.value[firstProvince] || [];
      }
      
      // 如果已经有默认学校ID，则查找对应的省份和学校索引
      if (registerForm.schoolId) {
        const selectedSchool = schools.value.find(school => school.id === registerForm.schoolId);
        if (selectedSchool) {
          const provinceIndex = provinces.value.findIndex(p => p.name === selectedSchool.province);
          if (provinceIndex !== -1) {
            schoolMultiIndex.value[0] = provinceIndex;
            const schoolsInProvince = schoolsByProvince.value[selectedSchool.province] || [];
            const schoolIndex = schoolsInProvince.findIndex(s => s.id === selectedSchool.id);
            if (schoolIndex !== -1) {
              schoolMultiArray.value[1] = schoolsInProvince;
              schoolMultiIndex.value[1] = schoolIndex;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('获取学校列表失败:', error);
    uni.showToast({
      title: '获取学校列表失败',
      icon: 'none'
    });
  }
  
  // 检查是否已经登录以及是否记住登录
  const token = uni.getStorageSync('token');
  const savedLoginInfo = uni.getStorageSync('loginInfo');
  
  if (token) {
    // 已有token，检查token是否有效
    try {
      // 这里可以添加验证token的API调用
      console.log('检测到已有token，尝试自动登录');
      // 直接跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
      return;
    } catch (error) {
      console.error('自动登录失败，token可能已过期:', error);
      // token无效，清除存储并继续正常登录流程
      uni.removeStorageSync('token');
    }
  }
  
  // 如果有保存的登录信息，则填充表单
  if (savedLoginInfo) {
    try {
      const loginInfo = JSON.parse(savedLoginInfo);
      loginForm.phone = loginInfo.phone || '';
      loginForm.password = loginInfo.password || '';
      isRemember.value = true;
    } catch (error) {
      console.error('解析保存的登录信息失败:', error);
    }
  }
});

// 学校列选择变化处理
function onSchoolColumnChange(e) {
  const { column, value } = e.detail;
  
  // 如果是第一列（省份）变化
  if (column === 0) {
    // 更新省份索引
    schoolMultiIndex.value[0] = value;
    // 重置学校索引
    schoolMultiIndex.value[1] = 0;
    
    // 更新第二列（学校）数据
    const selectedProvince = schoolMultiArray.value[0][value].name;
    schoolMultiArray.value[1] = schoolsByProvince.value[selectedProvince] || [];
  } else {
    // 第二列（学校）变化，只更新学校索引
    schoolMultiIndex.value[1] = value;
  }
}

// 学校选择变化处理
function onSchoolChange(e) {
  const [provinceIndex, schoolIndex] = e.detail.value;
  schoolMultiIndex.value = [provinceIndex, schoolIndex];
  
  // 更新注册表单中的学校ID
  if (schoolMultiArray.value[1] && schoolMultiArray.value[1][schoolIndex]) {
    registerForm.schoolId = schoolMultiArray.value[1][schoolIndex].id;
  }
}

// 切换登录/注册
function toggleRegister() {
  isRegistering.value = !isRegistering.value;
}

// 方法
function toggleRemember() {
  isRemember.value = !isRemember.value;
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// 保存登录信息
function saveLoginInfo() {
  if (isRemember.value) {
    // 保存登录信息到本地存储
    const loginInfo = {
      phone: loginForm.phone,
      password: loginForm.password
    };
    uni.setStorageSync('loginInfo', JSON.stringify(loginInfo));
  } else {
    // 如果取消"记住我"，则清除已保存的登录信息
    uni.removeStorageSync('loginInfo');
  }
}

// 登录
async function handleLogin() {
  if (!loginForm.phone || !loginForm.password) {
    uni.showToast({
      title: '请输入手机号和密码',
      icon: 'none'
    });
    return;
  }
  
  // 清除可能存在的无效token
  uni.removeStorageSync('token');
  
  // 显示加载指示器
  uni.showLoading({
    title: '正在登录...',
    mask: true
  });
  
  try {
    console.log('正在连接登录服务器...');
    const res = await api.user.login({
      phone: loginForm.phone,
      password: loginForm.password
    });
    
    // 关闭加载指示器
    uni.hideLoading();
    
    console.log('登录响应:', res);
    
    // 检查登录结果
    if (res && res.token) {
      // 登录成功，保存token到本地存储
      uni.setStorageSync('token', res.token);
      
      // 如果选择了"记住我"，保存登录信息
      saveLoginInfo();
      
      // 登录成功的情况
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
    
      // 登录成功，跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } else {
      // 登录失败但没有明确错误信息
      uni.showToast({
        title: '登录失败，请检查账号密码',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    
    // 关闭加载指示器
    uni.hideLoading();
    
    uni.showToast({
      title: error.message || '登录失败，请检查网络连接或服务器配置',
      icon: 'none',
      duration: 3000
    });
  }
}

// 注册
async function handleRegister() {
  // 表单验证
  if (!registerForm.phoneNumber) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.realName) {
    uni.showToast({
      title: '请输入姓名',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.schoolId) {
    uni.showToast({
      title: '请选择学校',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.major) {
    uni.showToast({
      title: '请输入专业',
      icon: 'none'
    });
    return;
  }
  
  if (!registerForm.studentTeacherId) {
    uni.showToast({
      title: '请输入学号',
      icon: 'none'
    });
    return;
  }
  
  try {
    // 清除可能存在的无效token
    uni.removeStorageSync('token');
    
    console.log('发送的注册数据:', JSON.stringify(registerForm));
    
    const res = await api.user.register(registerForm);
    
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    });
    
    // 注册成功，切换回登录页
    isRegistering.value = false;
  } catch (error) {
    uni.showToast({
      title: error.message || '注册失败',
      icon: 'none',
      duration: 3000
    });
    console.error('注册失败:', error);
  }
}

function forgotPassword() {
  uni.showToast({
    title: '忘记密码功能开发中',
    icon: 'none'
  });
}

function socialLogin(type) {
  uni.showToast({
    title: `${type}登录功能开发中`,
    icon: 'none'
  });
}

function openTerms() {
  uni.showToast({
    title: '服务条款',
    icon: 'none'
  });
}

function openPrivacy() {
  uni.showToast({
    title: '隐私政策',
    icon: 'none'
  });
}
</script>

<style>
@import '../../static/iconfont.css';

/* 自定义样式 */
.picker-arrow {
  transform: rotate(-90deg);
  display: inline-block;
}

page {
  background-color: #F8FAFC;
  width: 100%;
  height: 100%;
}

.container {
  width: 100%;
  min-height: 100vh;
}

.content-area {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  min-height: 100vh;
}

.top-image {
  margin-top: 30rpx;
  margin-bottom: 60rpx;
}

.campus-image {
  width: 100%;
  height: 300rpx;
  border-radius: 20rpx;
  box-shadow: 0 5rpx 15rpx rgba(0,0,0,0.1);
}

.welcome-text {
  margin-bottom: 50rpx;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.welcome-subtitle {
  font-size: 28rpx;
  color: #999999;
  display: block;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-field {
  margin-bottom: 30rpx;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 10rpx;
  transition: all 0.3s;
}

.input-field:focus-within {
  border-bottom: 1px solid #4A90E2;
}

.input-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.iconfont {
  font-size: 36rpx;
  color: #999999;
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-checkbox {
  transform: scale(0.8);
}

.remember-text {
  font-size: 24rpx;
  color: #666666;
  margin-left: 10rpx;
}

.forgot-password {
  font-size: 24rpx;
  color: #4A90E2;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #4A90E2;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.btn-hover {
  background-color: #3A7BC8;
  transform: scale(0.98);
}

.register-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background-color: #FFFFFF;
  color: #4A90E2;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  text-align: center;
  border: 1px solid #4A90E2;
  margin-bottom: 20rpx;
}

.register-btn-hover {
  background-color: rgba(74, 144, 226, 0.1);
  transform: scale(0.98);
}

.other-login {
  margin-top: 40rpx;
  margin-bottom: 20rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #E2E8F0;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #999999;
}

.social-buttons {
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.social-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 30rpx;
  transition: all 0.3s;
}

.social-btn-hover {
  background-color: #E8E8E8;
  transform: scale(0.95);
}

.social-btn .iconfont {
  font-size: 40rpx;
  color: #333;
  margin-right: 0;
}

.social-btn .icon-weixin {
  color: #07C160;
}

.social-btn .icon-qq {
  color: #4A90E2;
}

.footer-text {
  margin-top: auto;
  text-align: center;
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.agreement-text, .link-text {
  font-size: 22rpx;
  color: #999999;
}

.link-text {
  color: #4A90E2;
}

.school-picker {
  flex: 1;
  height: 80rpx;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

.picker-content .iconfont {
  color: #999999;
  font-size: 24rpx;
  margin-left: 10rpx;
}

.picker-arrow {
  transform: rotate(-90deg);
  display: inline-block;
}
</style> 