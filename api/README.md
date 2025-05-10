# API 接口模块

本目录包含项目的所有API接口封装，采用模块化管理方式。

## 目录结构

```
api/
├── index.js              # API入口文件，统一导出
├── README.md             # 说明文档
└── modules/              # 各模块API
    ├── user.js           # 用户相关API
    ├── team.js           # 团队相关API
    └── ...               # 其他模块API
```

## 使用方法

### 导入API

```js
import api from '@/api';
```

### 调用用户模块API

```js
// 用户登录
api.user.login({
  phone: '13812345678',  // 使用phone字段，不是phoneNumber
  password: '123456'
}).then(res => {
  console.log('登录成功', res);
}).catch(err => {
  console.error('登录失败', err);
});

// 用户注册
api.user.register({
  phoneNumber: '13812345678',
  password: '123456',
  realName: '张三',
  schoolId: 1,
  role: 'student',
  major: '计算机科学',
  studentTeacherId: '2021001'
}).then(res => {
  console.log('注册成功', res);
}).catch(err => {
  console.error('注册失败', err);
});

// 获取用户信息
api.user.getUserInfo().then(res => {
  console.log('用户信息', res);
}).catch(err => {
  console.error('获取失败', err);
});
```

### 调用团队模块API

```js
// 获取组队列表
api.team.getTeamList().then(res => {
  console.log('组队列表', res);
}).catch(err => {
  console.error('获取组队列表失败', err);
});

// 获取团队详情
api.team.getTeamDetail('teamId').then(res => {
  console.log('团队详情', res);
}).catch(err => {
  console.error('获取团队详情失败', err);
});

// 创建团队
api.team.createTeam({
  name: '团队名称',
  description: '团队描述',
  // 其他团队信息
}).then(res => {
  console.log('创建团队成功', res);
}).catch(err => {
  console.error('创建团队失败', err);
});

// 加入团队
api.team.joinTeam('teamId').then(res => {
  console.log('加入团队成功', res);
}).catch(err => {
  console.error('加入团队失败', err);
});

// 退出团队
api.team.leaveTeam('teamId').then(res => {
  console.log('退出团队成功', res);
}).catch(err => {
  console.error('退出团队失败', err);
});
```

## 添加新模块

1. 在 `modules` 目录下创建新的模块文件，如 `course.js`
2. 在新模块中编写API方法
3. 在 `index.js` 中导入并导出新模块

## 模块模板

```js
/**
 * 模块名称相关接口
 */
import request from '@/utils/request';

const moduleApi = {
  /**
   * 方法名称
   * @param {Object} data - 参数说明
   * @returns {Promise} 请求结果Promise对象
   */
  methodName(data) {
    return request({
      url: '/path/to/api',
      method: 'POST', // 或 GET, PUT, DELETE 等
      data
    });
  }
};

export default moduleApi;
```