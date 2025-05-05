# 工具函数模块

本目录包含项目中使用的各种工具函数，如网络请求、日期格式化、数据处理等。

## 目录结构

```
utils/
├── request.js             # 网络请求工具
├── README.md              # 说明文档
└── ...                    # 其他工具函数
```

## 网络请求工具 (request.js)

封装了基于 uni-app 的网络请求，支持请求拦截、响应拦截、错误处理等功能。

### 基本使用

```js
import request from '@/utils/request';

// GET请求
request({
  url: '/api/data',
  method: 'GET'
}).then(res => {
  console.log('请求成功', res);
}).catch(err => {
  console.error('请求失败', err);
});

// POST请求
request({
  url: '/api/data',
  method: 'POST',
  data: {
    name: '张三',
    age: 18
  }
}).then(res => {
  console.log('请求成功', res);
}).catch(err => {
  console.error('请求失败', err);
});
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| url | String | 是 | 请求地址，如果以 http 开头则直接使用，否则会自动添加 baseUrl |
| method | String | 否 | 请求方法，默认为 GET |
| data | Object | 否 | 请求体数据，用于 POST、PUT 等方法 |
| params | Object | 否 | URL参数，用于 GET 请求 |
| header | Object | 否 | 请求头，默认会设置 Content-Type: application/json |
| timeout | Number | 否 | 超时时间，默认使用环境配置 |

### Token管理

```js
import { getToken, setToken } from '@/utils/request';

// 获取当前token
const token = getToken();

// 设置token
setToken('your-token');
``` 