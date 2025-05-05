# 配置模块

本目录包含项目的配置文件，根据不同环境提供不同的配置项。

## 目录结构

```
config/
├── env/                   # 环境配置
│   ├── index.js           # 环境配置入口文件
│   ├── dev.js             # 开发环境配置
│   ├── test.js            # 测试环境配置
│   └── prod.js            # 生产环境配置
└── README.md              # 说明文档
```

## 环境配置使用方法

```js
import { getEnv } from '@/config/env';

// 获取当前环境配置
const env = getEnv();

// 使用配置中的API地址
console.log('API地址:', env.baseUrl);
```

## 各环境说明

### 开发环境 (dev.js)

用于本地开发，通常配置为使用代理或本地服务器。

关键配置项：
- `baseUrl`: API基础路径，使用代理地址 `/api`
- `actualBaseUrl`: 实际API地址，用于调试输出
- `debug`: 调试模式，开启各种调试输出

### 测试环境 (test.js)

用于测试服务器，连接到测试环境API。

关键配置项：
- `baseUrl`: 测试服务器API地址
- `debug`: 通常为false，减少不必要的日志输出

### 生产环境 (prod.js)

用于正式生产环境，连接到生产环境API。

关键配置项：
- `baseUrl`: 生产服务器API地址
- `timeout`: 通常比开发环境短，减少用户等待时间
- `debug`: 设为false，关闭所有调试输出

## 添加新配置项

在需要添加新配置时，应同时修改所有环境的配置文件，保持结构一致。例如添加新的API地址：

```js
// 在所有环境配置中添加
{
  // 其他配置...
  newApiUrl: 'http://example.com/new-api'
}
``` 