# 校园竞赛与组队平台 - 团队模块更新

## 更新内容概览

1. 重构了团队API模块，使其符合接口文档规范
2. 优化了团队列表页面，实现了分页加载和筛选功能
3. 改进了团队详情页面，完善了用户交互和状态管理
4. 添加了团队申请功能，实现了角色申请和状态检查

## API模块更新详情

- 修复了`getTeamList`和`getTeamDetail`方法，移除了模拟数据
- 更新了申请接口`applyTeam`，符合后端API规范
- 添加了团队状态检查`checkTeamStatus`方法
- 优化了团队成员获取`getTeamMembers`方法
- 修正了团队解散`disbandTeam`和退出`leaveTeam`的API路径
- 新增了申请管理相关方法：获取申请列表、处理申请、取消申请等

## 团队列表页面更新

- 实现了从API获取真实数据，移除了模拟数据
- 添加了分页加载功能，支持下拉刷新和上拉加载更多
- 优化了分类筛选功能，可根据分类获取不同类型的团队
- 改进了团队申请流程，添加了登录状态和申请状态检查
- 优化了加载状态和空数据状态的显示

## 团队详情页面更新

- 实现了通过API获取团队详情和成员信息
- 添加了用户身份判断，区分访客、队员和队长视角
- 优化了团队角色申请流程，支持多角色选择和申请留言
- 改进了团队操作功能，包括退出团队和解散团队
- 添加了联系方式保护功能

## 使用说明

### 团队列表获取

```javascript
// 引入API模块
import teamApi from '@/api/modules/team';

// 获取团队列表
const getTeamList = async (params) => {
  const res = await teamApi.getTeamList(params);
  if (res.code === 200 && res.data) {
    // 处理团队列表数据
    const teamList = res.data.list;
    // ...
  }
};

// 示例查询参数
const queryParams = {
  pageNum: 1,
  pageSize: 10,
  keyword: '搜索关键词',
  categoryId: 1, // 分类ID
  orderByViewCount: true // 按浏览量排序
};
```

### 申请加入团队

```javascript
// 申请加入团队
const applyToTeam = async (teamId, roleId, message) => {
  const data = {
    teamId: teamId,
    roleId: roleId,
    message: message
  };
  
  const res = await teamApi.applyTeam(data);
  if (res.code === 200) {
    // 申请成功处理
  }
};
```

## 后续优化方向

1. 添加团队创建和编辑功能
2. 实现团队申请管理界面
3. 优化团队成员展示和管理
4. 添加团队聊天或消息功能
5. 完善团队与竞赛的关联功能 