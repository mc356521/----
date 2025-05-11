if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const test = {
    // API基础路径
    baseUrl: "http://103.38.83.91:8080",
    // 超时时间
    timeout: 1e5,
    // 上传接口
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "ws://103.38.83.91:8080/ws",
    // 调试模式
    debug: true,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "test"
  };
  const config = {
    // API基础路径
    baseUrl: "http://103.38.83.91:8080",
    // 超时时间
    timeout: 1e5,
    // 上传接口 
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "ws://103.38.83.91:8080/ws",
    // 调试模式
    debug: true,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "development"
  };
  const prod = {
    // API基础路径
    baseUrl: "http://103.38.83.91:8080",
    // 超时时间
    timeout: 1e5,
    // 上传接口
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "ws://103.38.83.91:8080/ws",
    // 调试模式
    debug: false,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "production"
  };
  const envConfigs = {
    development: config,
    test,
    production: prod
  };
  const defaultEnv = "test";
  function getEnv() {
    let currentEnv = "development";
    {
      formatAppLog("log", "at config/env/index.js:28", "当前平台:", "app");
    }
    const envConfig = envConfigs[currentEnv] || envConfigs[defaultEnv];
    envConfig.runtimePlatform = "app";
    envConfig.actualBaseUrl = envConfig.baseUrl;
    return envConfig;
  }
  const env$1 = getEnv();
  getEnv();
  const env = getEnv();
  if (env.debug) {
    formatAppLog("log", "at utils/request.js:11", "当前API环境配置:", env);
    formatAppLog("log", "at utils/request.js:12", "API基础路径:", env.baseUrl);
    if (env.actualBaseUrl) {
      formatAppLog("log", "at utils/request.js:14", "实际API地址:", env.actualBaseUrl);
    }
  }
  const TOKEN_KEY = "token";
  const getToken = () => {
    return uni.getStorageSync(TOKEN_KEY) || "";
  };
  const setToken = (token) => {
    uni.setStorageSync(TOKEN_KEY, token);
  };
  const requestInterceptor = (config2) => {
    const token = getToken();
    if (token) {
      config2.header["Authorization"] = `Bearer ${token}`;
      if (env.debug) {
        formatAppLog("log", "at utils/request.js:49", "发送请求头Authorization:", `Bearer ${token}`);
      }
    }
    if (!config2.header["Content-Type"]) {
      config2.header["Content-Type"] = "application/json";
    }
    if (env.debug) {
      formatAppLog("log", "at utils/request.js:60", "完整请求配置:", {
        url: config2.url,
        method: config2.method,
        headers: config2.header,
        data: config2.data,
        params: config2.params
      });
      if (config2.url.includes("/users/register")) {
        formatAppLog("log", "at utils/request.js:70", "注册请求完整数据:", JSON.stringify(config2.data));
        formatAppLog("log", "at utils/request.js:71", "注册请求Content-Type:", config2.header["Content-Type"]);
      }
    }
    return config2;
  };
  const responseInterceptor = (response) => {
    if (response.statusCode === 200) {
      if (response.config && response.config.url && (response.config.url.includes("/users/login") || response.config.url.includes("/user/login"))) {
        if (response.data && response.data.data && typeof response.data.data === "string") {
          setToken(response.data.data);
          if (env.debug) {
            formatAppLog("log", "at utils/request.js:93", "已保存token:", response.data.data);
          }
          return Promise.resolve(response.data);
        }
      }
      return Promise.resolve(response.data);
    } else {
      const errorMsg = `请求失败: ${response.statusCode}`;
      if (env.debug) {
        formatAppLog("error", "at utils/request.js:108", "请求失败状态码:", response.statusCode);
        formatAppLog("error", "at utils/request.js:109", "请求地址:", response.config.url);
        formatAppLog("error", "at utils/request.js:110", "请求方法:", response.config.method);
        formatAppLog("error", "at utils/request.js:111", "请求头:", response.config.header);
        formatAppLog("error", "at utils/request.js:112", "请求数据:", response.config.data);
        formatAppLog("error", "at utils/request.js:113", "响应数据:", response.data);
      }
      if (response.statusCode === 400) {
        formatAppLog("error", "at utils/request.js:118", "400错误详情:", response.data);
        formatAppLog("error", "at utils/request.js:119", "请求的原始数据:", response.config.data);
      }
      uni.showToast({
        title: errorMsg,
        icon: "none"
      });
      if (response.statusCode === 401 || response.statusCode === 403) {
        setToken("");
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
      }
      return Promise.reject(new Error(`HTTP错误: ${response.statusCode}`));
    }
  };
  const request = (options) => {
    const config2 = {
      url: options.url || "",
      method: options.method || "GET",
      data: options.data || {},
      params: options.params || {},
      header: options.header || {},
      timeout: options.timeout || env.timeout || 6e4
    };
    if (!config2.url.startsWith("http://") && !config2.url.startsWith("https://")) {
      if (!config2.url.startsWith(env.baseUrl)) {
        if (config2.url.startsWith("/") && env.baseUrl.endsWith("/")) {
          config2.url = env.baseUrl + config2.url.substring(1);
        } else if (!config2.url.startsWith("/") && !env.baseUrl.endsWith("/")) {
          config2.url = env.baseUrl + "/" + config2.url;
        } else {
          config2.url = env.baseUrl + config2.url;
        }
      }
    }
    if (config2.method === "GET" && Object.keys(config2.params).length > 0) {
      const queryString = Object.keys(config2.params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(config2.params[key])}`).join("&");
      config2.url = `${config2.url}${config2.url.includes("?") ? "&" : "?"}${queryString}`;
    }
    if (env.debug) {
      formatAppLog("log", "at utils/request.js:187", `${config2.method} 请求:`, config2.url);
      if (config2.data && Object.keys(config2.data).length > 0) {
        formatAppLog("log", "at utils/request.js:189", "请求数据:", config2.data);
      }
    }
    const interceptedConfig = requestInterceptor(config2);
    return new Promise((resolve, reject) => {
      uni.request({
        url: interceptedConfig.url,
        method: interceptedConfig.method,
        data: interceptedConfig.data,
        header: interceptedConfig.header,
        timeout: interceptedConfig.timeout,
        success: (res) => {
          if (env.debug) {
            formatAppLog("log", "at utils/request.js:206", "响应数据:", res);
          }
          res.config = interceptedConfig;
          responseInterceptor(res).then((data) => resolve(data)).catch((error) => reject(error));
        },
        fail: (err) => {
          if (env.debug) {
            formatAppLog("error", "at utils/request.js:219", "请求失败:", err);
          }
          uni.showToast({
            title: "网络错误，请检查网络连接",
            icon: "none"
          });
          reject(new Error("网络请求失败"));
        }
      });
    });
  };
  const userApi = {
    /**
     * 获取学校列表
     * @returns {Promise} 请求结果Promise对象
     */
    getSchools() {
      return request({
        url: "/api/schools",
        method: "GET"
      });
    },
    /**
     * 用户登录
     * @param {Object} data - 登录参数，包含phone和password
     * @returns {Promise} 请求结果Promise对象
     */
    login(data) {
      formatAppLog("log", "at api/modules/user.js:26", "登录请求参数:", data);
      return request({
        url: "/users/login",
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          phone: data.phone,
          password: data.password
        }
      }).then((result) => {
        formatAppLog("log", "at api/modules/user.js:38", "登录响应:", result);
        if (result && result.code === 200 && result.data) {
          const token = result.data;
          uni.setStorageSync("token", token);
          formatAppLog("log", "at api/modules/user.js:45", "登录成功，已保存token");
          return {
            token,
            isLogin: true
          };
        }
        if (result && result.message) {
          throw new Error(result.message);
        }
        return result;
      });
    },
    /**
     * 用户注册
     * @param {Object} data - 注册参数，包含手机号、密码等信息
     * @returns {Promise} 请求结果Promise对象
     */
    register(data) {
      formatAppLog("log", "at api/modules/user.js:68", "注册请求参数 (原始):", data);
      const requestData = {
        phoneNumber: data.phoneNumber || data.phone,
        // 兼容处理，优先使用phoneNumber，如果没有则使用phone
        password: data.password,
        realName: data.realName,
        schoolId: data.schoolId || 1,
        // 确保有默认值
        role: data.role || "student",
        // 确保有默认值
        major: data.major,
        studentTeacherId: data.studentTeacherId
      };
      if (typeof requestData.studentTeacherId === "number") {
        requestData.studentTeacherId = String(requestData.studentTeacherId);
      }
      if (typeof requestData.schoolId !== "number") {
        requestData.schoolId = Number(requestData.schoolId) || 1;
      }
      formatAppLog("log", "at api/modules/user.js:90", "注册请求数据 (转换后):", requestData);
      formatAppLog("log", "at api/modules/user.js:91", "注册请求URL:", "/users/register");
      return request({
        url: "/users/register",
        method: "POST",
        data: requestData,
        header: {
          "Content-Type": "application/json"
        }
      }).then((response) => {
        formatAppLog("log", "at api/modules/user.js:101", "注册响应:", response);
        return response;
      }).catch((error) => {
        formatAppLog("error", "at api/modules/user.js:104", "注册请求错误:", error);
        if (error.response && error.response.data) {
          formatAppLog("error", "at api/modules/user.js:106", "服务器错误详情:", error.response.data);
        }
        throw error;
      });
    },
    /**
     * 获取用户信息
     * @returns {Promise} 请求结果Promise对象
     */
    getUserInfo() {
      return request({
        url: "/user/info",
        method: "GET"
      });
    },
    /**
     * 获取用户角色
     * @param {String} token - 用户token，如不传则使用本地存储的token
     * @returns {Promise} 请求结果Promise对象，返回用户角色（student/teacher/admin）
     */
    getUserRole(token) {
      const authToken = token || getToken();
      if (!authToken) {
        return Promise.reject(new Error("未登录"));
      }
      return request({
        url: `/users/role/parse?token=${encodeURIComponent(authToken)}`,
        // 直接在URL中添加token作为查询参数
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
    },
    /**
     * 退出登录
     * @returns {Promise} 请求结果Promise对象
     */
    logout() {
      return request({
        url: "/user/logout",
        method: "POST"
      }).finally(() => {
        setToken("");
      });
    },
    /**
     * 修改用户信息
     * @param {Object} data - 要修改的用户信息
     * @returns {Promise} 请求结果Promise对象
     */
    updateUserInfo(data) {
      return request({
        url: "/user/update",
        method: "PUT",
        data
      });
    },
    /**
     * 修改密码
     * @param {Object} data - 包含旧密码和新密码
     * @returns {Promise} 请求结果Promise对象
     */
    changePassword(data) {
      return request({
        url: "/user/password",
        method: "PUT",
        data
      });
    },
    /**
     * 获取用户个人资料信息
     * @returns {Promise} 用户个人资料的Promise对象
     */
    getUserProfile() {
      return request({
        url: "/users/profile",
        method: "GET"
      });
    },
    /**
     * 更新用户个人资料
     * @param {Object} data - 更新的个人资料数据
     * @param {String} data.realName - 真实姓名
     * @param {Number} data.schoolId - 学校ID
     * @param {String} data.major - 专业
     * @param {String} data.bio - 个人简介
     * @param {Array} data.skillTags - 技能标签数组
     * @param {Array} data.awardsHistory - 获奖经历数组
     * @returns {Promise} 更新结果的Promise对象
     */
    updateUserProfile(data) {
      return request({
        url: "/users/profile",
        method: "PUT",
        data,
        header: {
          "Content-Type": "application/json"
        }
      });
    },
    /**
     * 获取所有技能标签（按分类分组）
     * @returns {Promise} 技能标签的Promise对象
     */
    getSkillTags() {
      return request({
        url: "/api/skill-tags/group-by-category",
        method: "GET"
      });
    }
  };
  const teamApi = {
    /**
     * 获取团队列表
     * @param {Object} params - 查询参数
     * @param {Number} params.pageNum - 页码
     * @param {Number} params.pageSize - 每页条数
     * @param {String} params.keyword - 搜索关键词
     * @param {Number} params.categoryId - 分类ID
     * @param {Number} params.competitionId - 竞赛ID
     * @param {Boolean} params.orderByViewCount - 是否按浏览量排序
     * @returns {Promise} 团队列表的Promise对象
     */
    getTeamList(params = {}) {
      return request({
        url: "/teams/list",
        method: "GET",
        params
      });
    },
    /**
     * 获取团队详情
     * @param {Number} id 团队ID
     * @returns {Promise} 团队详情的Promise对象
     */
    getTeamDetail(id) {
      return request({
        url: `/teams/${id}`,
        method: "GET"
      });
    },
    /**
     * 获取团队成员
     * @param {Number} teamId 团队ID
     * @returns {Promise} 团队成员的Promise对象
     */
    getTeamMembers(teamId) {
      return request({
        url: `/teams/${teamId}/members`,
        method: "GET"
      });
    },
    /**
      * 申请加入团队
      * @param {Object} data - 申请数据
      * @param {Number} data.teamId - 要申请的队伍ID
      * @param {Number} data.roleId - 要申请的角色ID
      * @param {String} data.message - 申请留言
      * @returns {Promise} 申请结果的Promise对象
      */
    applyTeam(data) {
      if (!data.teamId || !data.roleId || !data.message) {
        formatAppLog("error", "at api/modules/team.js:61", "申请加入团队缺少必要参数", data);
        return Promise.reject(new Error("申请加入团队缺少必要参数"));
      }
      const requestData = {
        teamId: Number(data.teamId),
        roleId: Number(data.roleId),
        message: String(data.message)
      };
      formatAppLog("log", "at api/modules/team.js:72", "申请加入团队，请求数据:", requestData);
      return request({
        url: "/team-applications",
        method: "POST",
        data: requestData,
        header: {
          "Content-Type": "application/json"
        }
      });
    },
    /**
     * 获取我的申请列表
     * @param {Object} params - 查询参数
     * @param {String} params.status - 按申请状态筛选
     * @param {Number} params.pageNum - 页码
     * @param {Number} params.pageSize - 每页数量
     * @returns {Promise} 请求结果Promise对象
     */
    getMyApplications(params = {}) {
      return request({
        url: "/team-applications/list",
        method: "GET",
        params: { ...params, role: "applicant" }
      });
    },
    /**
     * 获取我收到的申请列表 (队长)
     * @param {Object} params - 查询参数
     * @param {Number} params.teamId - 按队伍ID筛选
     * @param {String} params.status - 按申请状态筛选
     * @param {Number} params.pageNum - 页码
     * @param {Number} params.pageSize - 每页数量
     * @returns {Promise} 请求结果Promise对象
     */
    getTeamApplications(params = {}) {
      return request({
        url: "/team-applications/list",
        method: "GET",
        params: { ...params, role: "leader" }
      });
    },
    /**
     * 处理队伍申请 (队长)
     * @param {Number} id - 申请ID
     * @param {Object} data - 处理数据
     * @param {String} data.status - 处理结果: "approved" 或 "rejected"
     * @param {String} data.reviewNotes - 处理备注
     * @returns {Promise} 请求结果Promise对象
     */
    handleApplication(id, data) {
      return request({
        url: `/team-applications/${id}`,
        method: "PUT",
        data
      });
    },
    /**
     * 取消申请 (申请者)
     * @param {Number} id - 申请ID
     * @returns {Promise} 请求结果Promise对象
     */
    cancelApplication(id) {
      return request({
        url: `/team-applications/${id}`,
        method: "DELETE"
      });
    },
    /**
     * 检查用户是否申请或加入队伍
     * @param {Number} teamId - 队伍ID
     * @returns {Promise} 请求结果Promise对象
     */
    checkTeamStatus(teamId) {
      return request({
        url: `/teams/${teamId}/has-applied`,
        method: "GET"
      });
    },
    /**
     * 解散团队 (队长)
     * @param {Number} teamId - 团队ID
     * @returns {Promise} 请求结果Promise对象
     */
    disbandTeam(teamId) {
      return request({
        url: `/teams/${teamId}/dissolve`,
        method: "POST"
      });
    },
    /**
     * 退出团队 (队员)
     * @param {String|Number} teamId - 团队ID
     * @returns {Promise} 请求结果Promise对象
     */
    leaveTeam(teamId) {
      return request({
        url: `/team-members/teams/${teamId}`,
        method: "DELETE"
      });
    },
    /**
     * 创建团队
     * @param {Object} data - 团队数据
     * @param {Number} data.competitionId - 关联竞赛ID
     * @param {String} data.name - 团队名称
     * @param {String} data.description - 团队描述
     * @param {String} data.direction - 研究方向
     * @param {String} data.recruitmentDeadline - 招募截止日期
     * @param {Object} data.contactInfo - 联系方式
     * @param {Array} data.teacherIds - 指导老师ID列表
     * @param {Array} data.teacherRoles - 指导老师角色列表
     * @param {Array} data.roles - 招募角色列表
     * @returns {Promise} 创建结果的Promise对象
     */
    createTeam(data) {
      return request({
        url: "/teams",
        method: "POST",
        data
      });
    },
    /**
     * 获取我的队伍列表
     * @returns {Promise} 请求结果Promise对象
     */
    getMyTeams() {
      return request({
        url: "/teams/my",
        method: "GET"
      });
    },
    /**
     * 获取AI智能推荐的队伍
     * @param {Object} params - 查询参数
     * @param {Boolean} params.useCache - 是否使用服务器端缓存的结果
     * @returns {Promise} 智能推荐队伍的Promise对象
     */
    getRecommendedTeams(params = { useCache: true }) {
      return request({
        url: "/teams/recommend",
        method: "GET",
        params
      });
    }
  };
  const competitionsApi = {
    /**
     * 获取竞赛列表
     * @param {Object} params - 查询参数
     * @param {String} [params.pageNum] - 页码，可选
     * @param {String} [params.pageSize] - 页数大小，可选
     * @param {Array} [params.keyword] - 关键字数组，可选
     * @param {String} [params.categoryId] - 类型，可选
     * @param {String} [params.level] - 等级，可选
     * @param {Boolean} [params.isHot] - 是否热门竞赛，可选
     * @returns {Promise} 请求结果Promise对象
     */
    getCompetitionsList(params = {}) {
      return request({
        url: "/competitions/list",
        method: "GET",
        params
      });
    },
    /**
     * 获取竞赛详情
     * @param {Number|String} id - 竞赛ID
     * @returns {Promise} 请求结果Promise对象
     */
    getCompetitionDetail(id) {
      const token = getToken();
      if (!token) {
        uni.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
        return Promise.reject(new Error("未登录"));
      }
      return request({
        url: `/competitions/${id}`,
        method: "GET",
        header: {
          "Authorization": `Bearer ${token}`
        }
      });
    },
    /**
     * 创建竞赛（仅管理员可用）
     * @param {Object} data - 竞赛信息
     * @param {String} data.title - 竞赛标题
     * @param {String} data.registrationStart - 报名开始时间
     * @param {String} data.registrationDeadline - 报名截止时间
     * @param {String} data.status - 竞赛状态
     * @param {String} data.level - 竞赛级别
     * @param {String} data.organizer - 主办方
     * @param {String} data.description - 详细描述
     * @param {String} [data.shortDescription] - 简短描述
     * @param {String} [data.requirements] - 参赛要求
     * @param {Boolean} [data.isHot] - 是否热门竞赛
     * @param {Number} data.teamSize - 团队最小人数
     * @param {Number} data.teamMax - 团队最大人数
     * @param {String} [data.websiteUrl] - 竞赛官网
     * @param {Object} data.contactInfo - 联系信息
     * @param {Array} data.categoryIds - 关联的分类ID列表
     * @returns {Promise} 请求结果Promise对象
     */
    createCompetition(data) {
      const token = getToken();
      if (!token) {
        uni.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
        return Promise.reject(new Error("未登录"));
      }
      formatAppLog("log", "at api/modules/competitions.js:99", "准备创建竞赛，数据:", data);
      return request({
        url: "/competitions",
        method: "POST",
        data,
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }).then((res) => {
        formatAppLog("log", "at api/modules/competitions.js:110", "创建竞赛响应:", res);
        return res;
      }).catch((err) => {
        formatAppLog("error", "at api/modules/competitions.js:113", "创建竞赛出错:", err);
        throw err;
      });
    },
    /**
     * 获取所有竞赛分类
     * @returns {Promise} 包含所有竞赛分类的Promise对象
     */
    getCompetitionCategories() {
      return request({
        url: "/competitions/categories",
        method: "GET"
      });
    },
    /**
     * 获取竞赛基本信息列表（用于选择）
     * @returns {Promise} 包含竞赛基本信息的Promise对象
     */
    getCompetitionsBasicInfo() {
      return request({
        url: "/competitions/basic-info",
        method: "GET"
      });
    }
  };
  const baseApiUrl$1 = config.baseUrl;
  function createTaskApplication(data) {
    return request({
      url: `${baseApiUrl$1}/task-applications`,
      method: "POST",
      data
    });
  }
  function getTaskApplicationList(params) {
    return request({
      url: `${baseApiUrl$1}/task-applications/list`,
      method: "GET",
      params
    });
  }
  function updateTaskApplication(id, data) {
    return request({
      url: `${baseApiUrl$1}/task-applications/${id}`,
      method: "PUT",
      data
    });
  }
  function cancelTaskApplication(id) {
    return request({
      url: `${baseApiUrl$1}/task-applications/${id}`,
      method: "DELETE"
    });
  }
  function checkTaskApplication(taskId) {
    return request({
      url: `${baseApiUrl$1}/task-participations/check`,
      method: "GET",
      params: { taskId }
    });
  }
  function getTaskApplicationDetail(id) {
    return request({
      url: `${baseApiUrl$1}/task-applications/${id}`,
      method: "GET"
    });
  }
  const taskApplicationApi = {
    createTaskApplication,
    getTaskApplicationList,
    updateTaskApplication,
    cancelTaskApplication,
    checkTaskApplication,
    getTaskApplicationDetail
  };
  const taskApplicationsApi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    cancelTaskApplication,
    checkTaskApplication,
    createTaskApplication,
    default: taskApplicationApi,
    getTaskApplicationDetail,
    getTaskApplicationList,
    updateTaskApplication
  }, Symbol.toStringTag, { value: "Module" }));
  const api = {
    user: userApi,
    team: teamApi,
    competitions: competitionsApi,
    taskApplications: taskApplicationsApi
    // 其他模块
    // course: courseApi,
    // notice: noticeApi
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$A = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const isRemember = vue.ref(false);
      const showPassword = vue.ref(true);
      const isRegistering = vue.ref(false);
      const schools = vue.ref([]);
      const schoolMultiArray = vue.ref([[], []]);
      const schoolMultiIndex = vue.ref([0, 0]);
      const provinces = vue.ref([]);
      const schoolsByProvince = vue.ref({});
      const selectedSchoolName = vue.computed(() => {
        if (schoolMultiArray.value[0].length === 0 || schoolMultiArray.value[1].length === 0) {
          return "";
        }
        const provinceIndex = schoolMultiIndex.value[0];
        const schoolIndex = schoolMultiIndex.value[1];
        if (!schoolMultiArray.value[0][provinceIndex] || !schoolMultiArray.value[1][schoolIndex]) {
          return "";
        }
        const provinceName = schoolMultiArray.value[0][provinceIndex].name;
        const schoolName = schoolMultiArray.value[1][schoolIndex].name;
        return `${provinceName} - ${schoolName}`;
      });
      const loginForm = vue.reactive({
        phone: "",
        password: ""
      });
      const registerForm = vue.reactive({
        phoneNumber: "",
        password: "",
        realName: "",
        schoolId: 1,
        role: "student",
        major: "",
        studentTeacherId: ""
      });
      vue.onMounted(async () => {
        try {
          const result = await api.user.getSchools();
          if (result && result.data) {
            schools.value = result.data;
            const provinceMap = {};
            const schoolMap = {};
            result.data.forEach((school) => {
              if (!provinceMap[school.province]) {
                provinceMap[school.province] = {
                  id: school.province,
                  name: school.province
                };
                schoolMap[school.province] = [];
              }
              schoolMap[school.province].push(school);
            });
            provinces.value = Object.values(provinceMap);
            schoolsByProvince.value = schoolMap;
            schoolMultiArray.value[0] = provinces.value;
            if (provinces.value.length > 0) {
              const firstProvince = provinces.value[0].name;
              schoolMultiArray.value[1] = schoolsByProvince.value[firstProvince] || [];
            }
            if (registerForm.schoolId) {
              const selectedSchool = schools.value.find((school) => school.id === registerForm.schoolId);
              if (selectedSchool) {
                const provinceIndex = provinces.value.findIndex((p) => p.name === selectedSchool.province);
                if (provinceIndex !== -1) {
                  schoolMultiIndex.value[0] = provinceIndex;
                  const schoolsInProvince = schoolsByProvince.value[selectedSchool.province] || [];
                  const schoolIndex = schoolsInProvince.findIndex((s) => s.id === selectedSchool.id);
                  if (schoolIndex !== -1) {
                    schoolMultiArray.value[1] = schoolsInProvince;
                    schoolMultiIndex.value[1] = schoolIndex;
                  }
                }
              }
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:241", "获取学校列表失败:", error);
          uni.showToast({
            title: "获取学校列表失败",
            icon: "none"
          });
        }
        const token = uni.getStorageSync("token");
        const savedLoginInfo = uni.getStorageSync("loginInfo");
        if (token) {
          try {
            formatAppLog("log", "at pages/login/login.vue:256", "检测到已有token，尝试自动登录");
            uni.switchTab({
              url: "/pages/index/index"
            });
            return;
          } catch (error) {
            formatAppLog("error", "at pages/login/login.vue:263", "自动登录失败，token可能已过期:", error);
            uni.removeStorageSync("token");
          }
        }
        if (savedLoginInfo) {
          try {
            const loginInfo = JSON.parse(savedLoginInfo);
            loginForm.phone = loginInfo.phone || "";
            loginForm.password = loginInfo.password || "";
            isRemember.value = true;
          } catch (error) {
            formatAppLog("error", "at pages/login/login.vue:277", "解析保存的登录信息失败:", error);
          }
        }
      });
      function onSchoolColumnChange(e) {
        const { column, value } = e.detail;
        if (column === 0) {
          schoolMultiIndex.value[0] = value;
          schoolMultiIndex.value[1] = 0;
          const selectedProvince = schoolMultiArray.value[0][value].name;
          schoolMultiArray.value[1] = schoolsByProvince.value[selectedProvince] || [];
        } else {
          schoolMultiIndex.value[1] = value;
        }
      }
      function onSchoolChange(e) {
        const [provinceIndex, schoolIndex] = e.detail.value;
        schoolMultiIndex.value = [provinceIndex, schoolIndex];
        if (schoolMultiArray.value[1] && schoolMultiArray.value[1][schoolIndex]) {
          registerForm.schoolId = schoolMultiArray.value[1][schoolIndex].id;
        }
      }
      function toggleRegister() {
        isRegistering.value = !isRegistering.value;
      }
      function toggleRemember() {
        isRemember.value = !isRemember.value;
      }
      function togglePasswordVisibility() {
        showPassword.value = !showPassword.value;
      }
      function saveLoginInfo() {
        if (isRemember.value) {
          const loginInfo = {
            phone: loginForm.phone,
            password: loginForm.password
          };
          uni.setStorageSync("loginInfo", JSON.stringify(loginInfo));
        } else {
          uni.removeStorageSync("loginInfo");
        }
      }
      async function handleLogin() {
        if (!loginForm.phone || !loginForm.password) {
          uni.showToast({
            title: "请输入手机号和密码",
            icon: "none"
          });
          return;
        }
        uni.removeStorageSync("token");
        uni.showLoading({
          title: "正在登录...",
          mask: true
        });
        try {
          formatAppLog("log", "at pages/login/login.vue:362", "正在连接登录服务器...");
          const res = await api.user.login({
            phone: loginForm.phone,
            password: loginForm.password
          });
          uni.hideLoading();
          formatAppLog("log", "at pages/login/login.vue:371", "登录响应:", res);
          if (res && res.token) {
            uni.setStorageSync("token", res.token);
            saveLoginInfo();
            uni.showToast({
              title: "登录成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.switchTab({
                url: "/pages/index/index"
              });
            }, 1500);
          } else {
            uni.showToast({
              title: "登录失败，请检查账号密码",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:401", "登录失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: error.message || "登录失败，请检查网络连接或服务器配置",
            icon: "none",
            duration: 3e3
          });
        }
      }
      async function handleRegister() {
        if (!registerForm.phoneNumber) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return;
        }
        if (!registerForm.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        if (!registerForm.realName) {
          uni.showToast({
            title: "请输入姓名",
            icon: "none"
          });
          return;
        }
        if (!registerForm.schoolId) {
          uni.showToast({
            title: "请选择学校",
            icon: "none"
          });
          return;
        }
        if (!registerForm.major) {
          uni.showToast({
            title: "请输入专业",
            icon: "none"
          });
          return;
        }
        if (!registerForm.studentTeacherId) {
          uni.showToast({
            title: "请输入学号",
            icon: "none"
          });
          return;
        }
        try {
          uni.removeStorageSync("token");
          formatAppLog("log", "at pages/login/login.vue:469", "发送的注册数据:", JSON.stringify(registerForm));
          const res = await api.user.register(registerForm);
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          isRegistering.value = false;
        } catch (error) {
          uni.showToast({
            title: error.message || "注册失败",
            icon: "none",
            duration: 3e3
          });
          formatAppLog("error", "at pages/login/login.vue:486", "注册失败:", error);
        }
      }
      function forgotPassword() {
        uni.showToast({
          title: "忘记密码功能开发中",
          icon: "none"
        });
      }
      function socialLogin(type) {
        uni.showToast({
          title: `${type}登录功能开发中`,
          icon: "none"
        });
      }
      function openTerms() {
        uni.showToast({
          title: "服务条款",
          icon: "none"
        });
      }
      function openPrivacy() {
        uni.showToast({
          title: "隐私政策",
          icon: "none"
        });
      }
      const __returned__ = { isRemember, showPassword, isRegistering, schools, schoolMultiArray, schoolMultiIndex, provinces, schoolsByProvince, selectedSchoolName, loginForm, registerForm, onSchoolColumnChange, onSchoolChange, toggleRegister, toggleRemember, togglePasswordVisibility, saveLoginInfo, handleLogin, handleRegister, forgotPassword, socialLogin, openTerms, openPrivacy, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, computed: vue.computed, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$z(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 主内容区 "),
      vue.createElementVNode("view", { class: "content-area" }, [
        vue.createCommentVNode(" 顶部图片 "),
        vue.createElementVNode("view", { class: "top-image" }, [
          vue.createElementVNode("image", {
            src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            mode: "aspectFill",
            class: "campus-image"
          })
        ]),
        vue.createCommentVNode(" 欢迎文字 "),
        vue.createElementVNode("view", { class: "welcome-text" }, [
          vue.createElementVNode(
            "text",
            { class: "welcome-title" },
            vue.toDisplayString($setup.isRegistering ? "注册账号" : "欢迎回来"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "welcome-subtitle" },
            vue.toDisplayString($setup.isRegistering ? "创建您的校园平台账号" : "登录您的校园平台账号，开启校园新体验"),
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 登录表单 "),
        !$setup.isRegistering ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "login-form"
        }, [
          vue.createElementVNode("view", { class: "input-field" }, [
            vue.createElementVNode("view", { class: "input-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-user" }),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  placeholder: "学号/手机号",
                  class: "form-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.loginForm.phone = $event)
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.loginForm.phone]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "input-field" }, [
            vue.createElementVNode("view", { class: "input-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-user" }),
              vue.withDirectives(vue.createElementVNode("input", {
                type: "text",
                placeholder: "密码",
                class: "form-input",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.loginForm.password = $event),
                password: $setup.showPassword
              }, null, 8, ["password"]), [
                [vue.vModelText, $setup.loginForm.password]
              ]),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["iconfont", $setup.showPassword ? "icon-eye-slash" : "icon-eye"]),
                  onClick: $setup.togglePasswordVisibility
                },
                null,
                2
                /* CLASS */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "remember-row" }, [
            vue.createElementVNode("view", { class: "remember-me" }, [
              vue.createElementVNode("checkbox", {
                value: "1",
                checked: $setup.isRemember,
                onClick: $setup.toggleRemember,
                class: "remember-checkbox",
                color: "#4A90E2"
              }, null, 8, ["checked"]),
              vue.createElementVNode("text", { class: "remember-text" }, "记住我")
            ]),
            vue.createElementVNode("text", {
              class: "forgot-password",
              onClick: $setup.forgotPassword
            }, "忘记密码?")
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            onClick: $setup.handleLogin,
            "hover-class": "btn-hover"
          }, "登录"),
          vue.createElementVNode("button", {
            class: "register-btn",
            onClick: $setup.toggleRegister,
            "hover-class": "register-btn-hover"
          }, "注册新账号")
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 注册表单 "),
            vue.createElementVNode("view", { class: "login-form" }, [
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-mobile" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      placeholder: "手机号",
                      class: "form-input",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.registerForm.phoneNumber = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.registerForm.phoneNumber]
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-lock" }),
                  vue.withDirectives(vue.createElementVNode("input", {
                    type: "text",
                    placeholder: "密码",
                    class: "form-input",
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.registerForm.password = $event),
                    password: $setup.showPassword
                  }, null, 8, ["password"]), [
                    [vue.vModelText, $setup.registerForm.password]
                  ]),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["iconfont", $setup.showPassword ? "icon-eye-slash" : "icon-eye"]),
                      onClick: $setup.togglePasswordVisibility
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-user" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      placeholder: "真实姓名",
                      class: "form-input",
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.registerForm.realName = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.registerForm.realName]
                  ])
                ])
              ]),
              vue.createCommentVNode(" 学校选择 "),
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-graduation" }),
                  vue.createElementVNode("picker", {
                    mode: "multiSelector",
                    onChange: $setup.onSchoolChange,
                    onColumnchange: $setup.onSchoolColumnChange,
                    value: $setup.schoolMultiIndex,
                    range: $setup.schoolMultiArray,
                    "range-key": "name",
                    class: "school-picker"
                  }, [
                    vue.createElementVNode("view", { class: "picker-content" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "picker-text" },
                        vue.toDisplayString($setup.selectedSchoolName || "请选择学校（省份-学校）"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "iconfont icon-arrow-left picker-arrow" })
                    ])
                  ], 40, ["value", "range"])
                ])
              ]),
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-graduation" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      placeholder: "专业",
                      class: "form-input",
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.registerForm.major = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.registerForm.major]
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "input-field" }, [
                vue.createElementVNode("view", { class: "input-content" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-graduation" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      placeholder: "学号",
                      class: "form-input",
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.registerForm.studentTeacherId = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.registerForm.studentTeacherId]
                  ])
                ])
              ]),
              vue.createElementVNode("button", {
                class: "login-btn",
                onClick: $setup.handleRegister,
                "hover-class": "btn-hover"
              }, "注册"),
              vue.createElementVNode("button", {
                class: "register-btn",
                onClick: $setup.toggleRegister,
                "hover-class": "register-btn-hover"
              }, "返回登录")
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )),
        vue.createCommentVNode(" 其他登录方式 "),
        !$setup.isRegistering ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "other-login"
        }, [
          vue.createElementVNode("view", { class: "divider" }, [
            vue.createElementVNode("view", { class: "divider-line" }),
            vue.createElementVNode("text", { class: "divider-text" }, "其他登录方式"),
            vue.createElementVNode("view", { class: "divider-line" })
          ]),
          vue.createElementVNode("view", { class: "social-buttons" }, [
            vue.createElementVNode("view", {
              class: "social-btn",
              onClick: _cache[7] || (_cache[7] = ($event) => $setup.socialLogin("wechat")),
              "hover-class": "social-btn-hover"
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-weixin" })
            ]),
            vue.createElementVNode("view", {
              class: "social-btn",
              onClick: _cache[8] || (_cache[8] = ($event) => $setup.socialLogin("qq")),
              "hover-class": "social-btn-hover"
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-qq" })
            ]),
            vue.createElementVNode("view", {
              class: "social-btn",
              onClick: _cache[9] || (_cache[9] = ($event) => $setup.socialLogin("phone")),
              "hover-class": "social-btn-hover"
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-mobile" })
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 底部文字 "),
        vue.createElementVNode("view", { class: "footer-text" }, [
          vue.createElementVNode(
            "text",
            { class: "agreement-text" },
            vue.toDisplayString($setup.isRegistering ? "注册即表示您同意我们的" : "登录即表示您同意我们的"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.openTerms
          }, "服务条款"),
          vue.createElementVNode("text", { class: "agreement-text" }, "和"),
          vue.createElementVNode("text", {
            class: "link-text",
            onClick: $setup.openPrivacy
          }, "隐私政策")
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["render", _sfc_render$z], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/login/login.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config2 = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config2
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config: config2
        } = obj;
        this._animateRun(styles, config2).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config2 = {}) {
      this.animation.step(config2);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$z = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i in styles) {
          let line = this.toLine(i);
          transform += line + ":" + styles[i] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config2 = {}) {
        if (!this.animation)
          return;
        for (let i in obj) {
          try {
            if (typeof obj[i] === "object") {
              this.animation[i](...obj[i]);
            } else {
              this.animation[i](obj[i]);
            }
          } catch (e) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:148", `方法 ${i} 不存在`);
          }
        }
        this.animation.step(config2);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$y(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$y], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$y = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res = Object.assign(res, { borderRadius: this.borderRadius });
        }
        return res;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:298", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      }
    }
  };
  function _sfc_render$x(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$4);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$x], ["__scopeId", "data-v-4dd3c44b"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  const _sfc_main$x = {
    __name: "TeamCard",
    props: {
      team: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        default: 0
      },
      showMatch: {
        type: Boolean,
        default: false
      }
    },
    emits: ["detail", "apply"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const animationDelay = vue.computed(() => `${props.index * 0.1}s`);
      const showHotIcon = vue.computed(() => {
        return props.team.viewCount && props.team.viewCount > 100;
      });
      const isPulse = vue.computed(() => {
        return props.team.status === "0" || props.team.statusText === "招募中";
      });
      const getStatusClass = vue.computed(() => {
        const status = props.team.status;
        const statusText = props.team.statusText;
        if (status === "0" || statusText === "招募中") {
          return "status-recruiting";
        } else if (status === "1" || statusText === "进行中") {
          return "status-ongoing";
        } else if (status === "2" || statusText === "已完成") {
          return "status-completed";
        } else if (status === "3" || statusText === "已截止") {
          return "status-ended";
        } else {
          return "status-default";
        }
      });
      const positions = vue.computed(() => {
        return props.team.positions || props.team.roles || [];
      });
      const avatars = vue.computed(() => {
        if (props.team.avatars)
          return props.team.avatars;
        if (props.team.teamMemberAvatars) {
          if (typeof props.team.teamMemberAvatars === "string") {
            return props.team.teamMemberAvatars.split(",").filter(
              (avatar) => avatar && !avatar.includes(".pdf")
            );
          }
          if (Array.isArray(props.team.teamMemberAvatars)) {
            return props.team.teamMemberAvatars.filter(
              (avatar) => avatar && !avatar.includes(".pdf")
            );
          }
        }
        return [];
      });
      const canJoin = vue.computed(() => {
        return props.team.status === "0" || props.team.statusText === "招募中";
      });
      const hasProgress = vue.computed(() => {
        return typeof props.team.teamProgress === "number";
      });
      const hasMaxMember = vue.computed(() => {
        return props.team.maxMemberCount !== null && props.team.maxMemberCount > 0;
      });
      function isFilled(position) {
        const current = getCurrentCount(position);
        const total = getTotalCount(position);
        return current >= total;
      }
      function getCurrentCount(position) {
        return position.current || position.currentCount || 0;
      }
      function getTotalCount(position) {
        return position.total || position.requiredCount || 0;
      }
      function getMemberCount() {
        return props.team.memberCount || props.team.currentMemberCount || 0;
      }
      function goToDetail() {
        emit("detail", props.team.id);
      }
      function onApplyJoin() {
        goToDetail();
      }
      const __returned__ = { props, emit, animationDelay, showHotIcon, isPulse, getStatusClass, positions, avatars, canJoin, hasProgress, hasMaxMember, isFilled, getCurrentCount, getTotalCount, getMemberCount, goToDetail, onApplyJoin, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$w(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createCommentVNode(" 组队卡片 "),
        vue.createElementVNode(
          "view",
          {
            class: "team-item card-hover animate__animated animate__fadeInUp",
            style: vue.normalizeStyle({ "animation-delay": $setup.animationDelay }),
            onClick: $setup.goToDetail
          },
          [
            vue.createCommentVNode(" 卡片顶部 "),
            vue.createElementVNode("view", { class: "team-top" }, [
              vue.createElementVNode("view", { class: "flex-between" }, [
                vue.createElementVNode("view", null, [
                  vue.createElementVNode("view", { class: "title-with-icon" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "team-title" },
                      vue.toDisplayString($props.team.title || $props.team.name),
                      1
                      /* TEXT */
                    ),
                    $setup.showHotIcon ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "iconfont icon-spark hot-icon"
                    })) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "view-count" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "view-text" },
                        vue.toDisplayString($props.team.viewCount),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "tag-row" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "tag orange-tag" },
                      vue.toDisplayString($props.team.competitionName),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", null, [
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["status-tag", [{ "pulse": $setup.isPulse }, $setup.getStatusClass]])
                    },
                    vue.toDisplayString($props.team.statusText),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "date-info" },
                    "截止: " + vue.toDisplayString($props.team.deadline || $props.team.recruitmentDeadlineFormatted),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createCommentVNode(" 匹配度信息 "),
            $props.showMatch && $props.team.matchScore ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "match-info"
            }, [
              vue.createElementVNode("view", { class: "match-score" }, [
                vue.createElementVNode("view", { class: "score-bar" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "score-fill",
                      style: vue.normalizeStyle({ width: `${$props.team.matchScore}%` })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "score-text" },
                  "匹配度 " + vue.toDisplayString($props.team.matchScore) + "%",
                  1
                  /* TEXT */
                )
              ]),
              $props.team.recommendedRole ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "recommend-role"
              }, [
                vue.createElementVNode("text", { class: "role-label" }, "推荐角色: "),
                vue.createElementVNode(
                  "text",
                  { class: "role-text" },
                  vue.toDisplayString($props.team.recommendedRole),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              $props.team.matchReason || $props.team.recommendReason ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "match-reason"
              }, [
                vue.createElementVNode("text", { class: "reason-label" }, "匹配理由: "),
                vue.createElementVNode(
                  "text",
                  { class: "reason-text" },
                  vue.toDisplayString($props.team.recommendReason),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 职位标签 "),
            $setup.positions.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "role-tags"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.positions, (position, pIndex) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: pIndex,
                    class: "role-tag"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "role-name" },
                      vue.toDisplayString(position.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass(["role-count", {
                          "success": $setup.isFilled(position),
                          "warning": !$setup.isFilled(position)
                        }])
                      },
                      vue.toDisplayString($setup.getCurrentCount(position)) + "/" + vue.toDisplayString($setup.getTotalCount(position)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 描述文本 "),
            vue.createElementVNode(
              "view",
              { class: "team-desc" },
              vue.toDisplayString($props.team.description),
              1
              /* TEXT */
            ),
            vue.createCommentVNode(" 成员信息和操作 "),
            vue.createElementVNode("view", { class: "team-bottom" }, [
              vue.createElementVNode("view", { class: "flex-center" }, [
                vue.createElementVNode("view", { class: "team-avatars" }, [
                  $setup.avatars && $setup.avatars.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    { key: 0 },
                    vue.renderList($setup.avatars.slice(0, 3), (avatar, aIndex) => {
                      return vue.openBlock(), vue.createElementBlock("image", {
                        key: aIndex,
                        src: avatar,
                        class: "team-avatar"
                      }, null, 8, ["src"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )) : (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "empty-avatar"
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-user" })
                  ]))
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "member-count" },
                  vue.toDisplayString($setup.getMemberCount()) + "人已加入",
                  1
                  /* TEXT */
                )
              ]),
              $setup.canJoin ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "join-btn blue-join",
                onClick: vue.withModifiers($setup.onApplyJoin, ["stop"])
              }, " 招募中 ")) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "join-btn gray-join"
              }, " 已组满 "))
            ])
          ],
          4
          /* STYLE */
        )
      ],
      2112
      /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
    );
  }
  const TeamCard = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["render", _sfc_render$w], ["__scopeId", "data-v-49d62ae1"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/team/TeamCard.vue"]]);
  const _sfc_main$w = {
    __name: "TabBar",
    props: {
      activeTab: {
        type: String,
        default: "home",
        validator: (value) => ["home", "competition", "task-square", "team", "profile"].includes(value)
      }
    },
    emits: ["tab-change", "publish"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const userRole = vue.ref("");
      async function getUserRole() {
        try {
          const res = await userApi.getUserRole();
          if (res.code === 200 && res.data) {
            userRole.value = res.data;
            formatAppLog("log", "at components/TabBar.vue:70", "当前用户角色:", userRole.value);
          }
        } catch (error) {
          formatAppLog("error", "at components/TabBar.vue:73", "获取用户角色失败:", error);
        }
      }
      vue.onMounted(() => {
        const token = uni.getStorageSync("token");
        if (token) {
          getUserRole();
        }
      });
      const isDarkMode = vue.computed(() => {
        return false;
      });
      const emit = __emit;
      function switchTab(tab) {
        if (tab !== props.activeTab) {
          const tabRoutes = {
            "home": "/pages/index/index",
            "competition": "/pages/competition/index",
            "task-square": "/pages/task-square/index",
            "team": "/pages/team/list",
            "profile": "/pages/profile/index"
          };
          uni.switchTab({
            url: tabRoutes[tab],
            fail: (err) => {
              formatAppLog("error", "at components/TabBar.vue:107", "切换Tab失败:", err);
              emit("tab-change", tab);
            }
          });
        }
      }
      function showPublishOptions() {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再操作",
            confirmText: "去登录",
            success: function(res) {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        formatAppLog("log", "at components/TabBar.vue:135", "当前token:", token);
        if (!userRole.value) {
          formatAppLog("log", "at components/TabBar.vue:139", "开始获取用户角色...");
          userApi.getUserRole(token).then((res) => {
            formatAppLog("log", "at components/TabBar.vue:141", "获取角色成功, 完整响应:", res);
            if (res.code === 200 && res.data) {
              userRole.value = res.data;
              formatAppLog("log", "at components/TabBar.vue:144", "设置当前用户角色:", userRole.value);
              showPublishMenu();
            } else {
              formatAppLog("warn", "at components/TabBar.vue:147", "获取角色返回异常:", res);
              showPublishMenu();
            }
          }).catch((err) => {
            formatAppLog("error", "at components/TabBar.vue:151", "获取用户角色失败:", err);
            formatAppLog("error", "at components/TabBar.vue:152", "错误详情:", JSON.stringify(err));
            showPublishMenu();
          });
        } else {
          formatAppLog("log", "at components/TabBar.vue:157", "使用缓存角色信息:", userRole.value);
          showPublishMenu();
        }
      }
      function showPublishMenu() {
        const menuOptions = [];
        if (userRole.value === "admin") {
          menuOptions.push({
            text: "创建竞赛",
            action: () => {
              uni.navigateTo({
                url: "/pages/competition/create"
              });
            }
          });
        }
        menuOptions.push(
          {
            text: "创建队伍",
            action: () => {
              uni.navigateTo({
                url: "/pages/team/create"
              });
            }
          },
          {
            text: "发布任务",
            action: () => {
              uni.navigateTo({
                url: "/pages/task-square/create"
              });
            }
          }
        );
        const itemList = menuOptions.map((option) => option.text);
        uni.showActionSheet({
          itemList,
          success: function(res) {
            const tapIndex = res.tapIndex;
            if (tapIndex >= 0 && tapIndex < menuOptions.length) {
              menuOptions[tapIndex].action();
            }
          }
        });
      }
      const __returned__ = { props, userRole, getUserRole, isDarkMode, emit, switchTab, showPublishOptions, showPublishMenu, computed: vue.computed, ref: vue.ref, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$v(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["tab-bar", { "dark-mode": $setup.isDarkMode }])
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $props.activeTab === "home" }]),
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("home"))
          },
          [
            vue.createElementVNode("text", { class: "iconfont icon-home" }),
            vue.createElementVNode("text", { class: "tab-text" }, "首页"),
            $props.activeTab === "home" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "active-indicator"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $props.activeTab === "competition" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("competition"))
          },
          [
            vue.createElementVNode("text", { class: "iconfont icon-trophy" }),
            vue.createElementVNode("text", { class: "tab-text" }, "竞赛"),
            $props.activeTab === "competition" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "active-indicator"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode("view", { class: "publish-btn-container" }, [
          vue.createElementVNode("view", {
            class: "publish-btn pulse",
            onClick: $setup.showPublishOptions
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-plus" })
          ])
        ]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $props.activeTab === "team" }]),
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.switchTab("team"))
          },
          [
            vue.createElementVNode("text", { class: "iconfont icon-users" }),
            vue.createElementVNode("text", { class: "tab-text" }, "队伍"),
            $props.activeTab === "team" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "active-indicator"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $props.activeTab === "profile" }]),
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.switchTab("profile"))
          },
          [
            vue.createElementVNode("text", { class: "iconfont icon-user" }),
            vue.createElementVNode("text", { class: "tab-text" }, "我的"),
            $props.activeTab === "profile" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "active-indicator"
            })) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )
      ],
      2
      /* CLASS */
    );
  }
  const TabBar = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$v], ["__scopeId", "data-v-89ca1f91"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/TabBar.vue"]]);
  function getNotificationList(params = {}) {
    return request({
      url: "/notifications",
      method: "GET",
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        onlyUnread: params.onlyUnread || false
      }
    });
  }
  function getUnreadCount$1() {
    return request({
      url: "/notifications/unread/count",
      method: "GET"
    });
  }
  function markAsRead$1(notificationId) {
    return request({
      url: `/notifications/${notificationId}/read`,
      method: "PUT"
    });
  }
  function markAllAsRead$1() {
    return request({
      url: "/notifications/read/all",
      method: "PUT"
    });
  }
  function deleteNotification(notificationId) {
    return request({
      url: `/notifications/${notificationId}`,
      method: "DELETE"
    });
  }
  function batchDeleteNotifications(ids) {
    return request({
      url: "/notifications/batch",
      method: "DELETE",
      data: ids
    });
  }
  function handleNotificationAction(notificationId, action, data = {}) {
    return request({
      url: `/notifications/${notificationId}/action`,
      method: "POST",
      data: {
        action,
        ...data
      }
    });
  }
  const notificationsApi = {
    getNotificationList,
    getUnreadCount: getUnreadCount$1,
    markAsRead: markAsRead$1,
    markAllAsRead: markAllAsRead$1,
    deleteNotification,
    batchDeleteNotifications,
    handleNotificationAction
  };
  const _sfc_main$v = {
    __name: "HeaderBar",
    props: {
      title: {
        type: String,
        default: "页面标题"
      },
      showSearch: {
        type: Boolean,
        default: true
      },
      showFilter: {
        type: Boolean,
        default: true
      },
      showAiRecommend: {
        type: Boolean,
        default: false
      },
      categories: {
        type: Array,
        default: () => []
      },
      defaultCategory: {
        type: Number,
        default: 0
      }
    },
    emits: ["search", "filter", "category-change", "ai-recommend", "back"],
    setup(__props, { expose: __expose, emit: __emit }) {
      const tabBarPages = [
        "pages/index/index",
        "pages/competition/index",
        "pages/team/list",
        "pages/profile/index"
      ];
      const props = __props;
      const currentCategory = vue.ref(props.defaultCategory);
      const unreadCount = vue.ref(0);
      const isTabBarPage = vue.computed(() => {
        const pages = getCurrentPages();
        if (pages.length === 0)
          return true;
        const currentPage = pages[pages.length - 1];
        const currentRoute = currentPage.route || "";
        return tabBarPages.includes(currentRoute);
      });
      const headerHeight = vue.computed(() => {
        let height = 90;
        if (props.categories && props.categories.length > 0) {
          height += 70;
        }
        return height;
      });
      const emit = __emit;
      function onSearch() {
        emit("search");
      }
      function onFilter() {
        uni.navigateTo({
          url: "/pages/Xiaoxi/Xiaoxi"
        });
      }
      function selectCategory(index) {
        if (currentCategory.value === index)
          return;
        currentCategory.value = index;
        emit("category-change", index);
      }
      function goBack() {
        emit("back");
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.switchTab({
            url: "/pages/index/index"
          });
        }
      }
      async function fetchUnreadCount() {
        try {
          const res = await notificationsApi.getUnreadCount();
          if (res.code === 200 && res.data !== void 0) {
            unreadCount.value = res.data;
            const app = getApp();
            if (app && app.globalData) {
              app.globalData.unreadNotificationCount = res.data;
              try {
                if (app.updateMessageBadge) {
                  app.updateMessageBadge();
                }
              } catch (error) {
                formatAppLog("log", "at components/HeaderBar.vue:166", "HeaderBar: 更新TabBar徽标失败", error);
              }
            }
          }
        } catch (error) {
          formatAppLog("error", "at components/HeaderBar.vue:172", "获取未读消息数量失败:", error);
        }
      }
      function getUnreadMessageCount() {
        const app = getApp();
        if (app && app.globalData) {
          unreadCount.value = app.globalData.unreadNotificationCount || 0;
        }
      }
      function onAiRecommend() {
        emit("ai-recommend");
      }
      __expose({
        headerHeight,
        unreadCount,
        fetchUnreadCount,
        // 暴露刷新未读数方法，供父组件调用
        isTabBarPage
        // 暴露tabBar页面状态
      });
      let safeAreaHeight = vue.ref(0);
      let timer = null;
      vue.onMounted(() => {
        uni.getSystemInfo({
          success: (res) => {
            if (res.safeArea && res.safeArea.top) {
              safeAreaHeight.value = res.safeArea.top;
            }
          }
        });
        fetchUnreadCount();
        timer = setInterval(() => {
          fetchUnreadCount();
        }, 3e4);
      });
      vue.onUnmounted(() => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      });
      const __returned__ = { tabBarPages, props, currentCategory, unreadCount, isTabBarPage, headerHeight, emit, onSearch, onFilter, selectCategory, goBack, fetchUnreadCount, getUnreadMessageCount, onAiRecommend, get safeAreaHeight() {
        return safeAreaHeight;
      }, set safeAreaHeight(v) {
        safeAreaHeight = v;
      }, get timer() {
        return timer;
      }, set timer(v) {
        timer = v;
      }, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, get notificationsApi() {
        return notificationsApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$u(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "sticky-header" }, [
      vue.createElementVNode("view", { class: "header-title" }, [
        !$setup.isTabBarPage ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-back" })
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "text",
          { class: "section-title" },
          vue.toDisplayString($props.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "header-actions" }, [
          $props.showSearch ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "action-btn",
            onClick: $setup.onSearch
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-search" })
          ])) : vue.createCommentVNode("v-if", true),
          $props.showFilter ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "action-btn message-btn",
            onClick: $setup.onFilter
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-message" }),
            $setup.unreadCount > 0 ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: "badge"
              },
              vue.toDisplayString($setup.unreadCount > 99 ? "99+" : $setup.unreadCount),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ])) : vue.createCommentVNode("v-if", true),
          vue.renderSlot(_ctx.$slots, "actions", {}, void 0, true)
        ])
      ]),
      vue.createCommentVNode(" 分类标签 "),
      $props.categories && $props.categories.length > 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        "scroll-x": "true",
        class: "category-scroll"
      }, [
        vue.createElementVNode("view", { class: "category-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($props.categories, (category, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["category-item", $setup.currentCategory === index ? "active-category" : ""]),
                onClick: ($event) => $setup.selectCategory(index)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(category),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
    ]);
  }
  const HeaderBar = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$u], ["__scopeId", "data-v-965d9a70"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/HeaderBar.vue"]]);
  const getStoredState = () => {
    try {
      const storedState = uni.getStorageSync("userInteractionState");
      return storedState ? JSON.parse(storedState) : null;
    } catch (e) {
      formatAppLog("error", "at store/index.js:10", "读取本地存储失败", e);
      return null;
    }
  };
  const saveStateToStorage = (state2) => {
    try {
      uni.setStorageSync("userInteractionState", JSON.stringify(state2));
    } catch (e) {
      formatAppLog("error", "at store/index.js:20", "存储状态失败", e);
    }
  };
  const initialState = getStoredState() || {
    // 记录用户是否已经点击过AI智能推荐
    hasClickedAiRecommend: false
    // 可以添加更多全局状态...
  };
  const state = vue.reactive(initialState);
  const updateState = (key, value) => {
    if (key in state) {
      state[key] = value;
      saveStateToStorage(state);
    }
  };
  const getState = (key) => {
    return key in state ? state[key] : null;
  };
  const clearState = () => {
    Object.keys(state).forEach((key) => {
      state[key] = initialState[key];
    });
    uni.removeStorageSync("userInteractionState");
  };
  const resetAiRecommendState = () => {
    state.hasClickedAiRecommend = false;
    saveStateToStorage(state);
    formatAppLog("log", "at store/index.js:59", "已重置AI推荐状态，下次将显示分析动画");
  };
  const store = {
    state,
    updateState,
    getState,
    clearState,
    resetAiRecommendState
  };
  const _sfc_main$u = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const headerBarRef = vue.ref(null);
      const headerPlaceholderHeight = vue.computed(() => {
        if (headerBarRef.value && headerBarRef.value.headerHeight) {
          return headerBarRef.value.headerHeight + "rpx";
        }
        return "120rpx";
      });
      const teamList = vue.ref([]);
      const competitionsList = vue.ref([]);
      const recommendedTeams = vue.ref([]);
      const aiSummary = vue.ref("");
      const showApplyModal = vue.ref(false);
      const applyTeamId = vue.ref(null);
      const applyMessage = vue.ref("希望加入您的团队，请审核");
      const selectedRoleId = vue.ref(null);
      const availableRoles = vue.ref([]);
      const loadingRoles = vue.ref(false);
      const aiRecommendPopup = vue.ref(null);
      const aiAnalyzing = vue.ref(false);
      const aiAnalyzingTexts = [
        "正在分析您的个人资料...",
        "正在匹配与您技能相符的队伍...",
        "正在计算兴趣匹配度...",
        "正在生成个性化推荐..."
      ];
      let aiAnalyzingTimer = null;
      const currentTextIndex = vue.ref(0);
      async function getCompetitionsList() {
        try {
          const res = await competitionsApi.getCompetitionsList({
            isHot: true,
            pageSize: 3
            // 只获取3个热门竞赛
          });
          if (res.code === 200 && res.data && res.data.list) {
            competitionsList.value = res.data.list;
            formatAppLog("log", "at pages/index/index.vue:327", "获取到热门竞赛数据:", competitionsList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:330", "获取竞赛数据失败:", error);
        }
      }
      async function getTeamList() {
        try {
          const res = await teamApi.getTeamList();
          if (res.code === 200 && res.data && res.data.list) {
            teamList.value = res.data.list.slice(0, 10);
            formatAppLog("log", "at pages/index/index.vue:340", "获取到队伍列表数据:", teamList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:344", "获取队伍数据失败:", error);
        }
      }
      async function getRecommendedTeams() {
        try {
          if (recommendedTeams.value && recommendedTeams.value.length > 0) {
            formatAppLog("log", "at pages/index/index.vue:353", "使用缓存的AI推荐队伍数据:", recommendedTeams.value);
            return;
          }
          const res = await teamApi.getRecommendedTeams();
          if (res.code === 200 && res.data) {
            const teams = res.data.recommendedTeams || [];
            recommendedTeams.value = teams.map((team) => {
              return {
                ...team,
                matchScore: team.matchScore || Math.floor(Math.random() * 30) + 70,
                // 如果没有匹配度，随机生成70-100之间的分数
                matchReason: team.matchReason || team.recommendReason || "根据您的技能和兴趣推荐",
                recommendedRole: team.recommendedRole || ""
              };
            });
            aiSummary.value = res.data.aiSummary || "根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队";
            formatAppLog("log", "at pages/index/index.vue:371", "获取到AI推荐队伍数据:", recommendedTeams.value);
            try {
              uni.setStorageSync("ai_recommended_teams", JSON.stringify(recommendedTeams.value));
              uni.setStorageSync("ai_summary", aiSummary.value);
            } catch (e) {
              formatAppLog("error", "at pages/index/index.vue:378", "缓存AI推荐数据失败:", e);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:382", "获取AI推荐队伍失败:", error);
          try {
            const cachedTeams = uni.getStorageSync("ai_recommended_teams");
            const cachedSummary = uni.getStorageSync("ai_summary");
            if (cachedTeams) {
              recommendedTeams.value = JSON.parse(cachedTeams);
              aiSummary.value = cachedSummary || "";
              formatAppLog("log", "at pages/index/index.vue:390", "从缓存加载AI推荐队伍数据:", recommendedTeams.value);
            }
          } catch (e) {
            formatAppLog("error", "at pages/index/index.vue:393", "读取缓存AI推荐数据失败:", e);
          }
        }
      }
      function navigateTo(page) {
        if (page === "competition") {
          uni.navigateTo({
            url: "/pages/competition/index"
          });
        } else if (page === "task-square") {
          uni.switchTab({
            url: "/pages/task-square/index"
          });
        } else if (page === "recommend") {
          navigateToAiRecommend();
        } else {
          uni.showToast({
            title: `导航到${page}页面`,
            icon: "none"
          });
        }
      }
      function navigateToAiRecommend() {
        uni.navigateTo({
          url: "/pages/team/recommended"
        });
      }
      function viewAll(type) {
        if (type === "competition") {
          uni.navigateTo({
            url: "/pages/competition/index"
          });
        } else if (type === "recommend") {
          uni.navigateTo({
            url: "/pages/team/recommended"
            // 假设有个推荐队伍页面
          });
        } else {
          uni.navigateTo({
            url: "/pages/team/list"
          });
        }
      }
      function viewDetail(type, id) {
        if (type === "competition") {
          uni.navigateTo({
            url: `/pages/competition/detail?id=${id}`
          });
        } else {
          uni.navigateTo({
            url: `/pages/team/detail?id=${id}`
          });
        }
      }
      async function joinTeam(id) {
        try {
          loadingRoles.value = true;
          applyTeamId.value = id;
          const checkRes = await teamApi.checkTeamStatus(id);
          if (checkRes.code === 200 && checkRes.data) {
            if (checkRes.data.isApplied) {
              uni.showToast({
                title: "您已经申请过该队伍",
                icon: "none"
              });
              return;
            }
            if (checkRes.data.isMember) {
              uni.showToast({
                title: "您已经是该队伍成员",
                icon: "none"
              });
              return;
            }
          }
          const teamDetail = await teamApi.getTeamDetail(id);
          if (teamDetail.code !== 200 || !teamDetail.data) {
            uni.showToast({
              title: "获取队伍信息失败",
              icon: "none"
            });
            return;
          }
          availableRoles.value = teamDetail.data.roles || [];
          if (availableRoles.value.length === 0) {
            uni.showToast({
              title: "该队伍暂无可申请的角色",
              icon: "none"
            });
            return;
          }
          if (availableRoles.value[0]) {
            selectedRoleId.value = availableRoles.value[0].id;
          }
          showApplyModal.value = true;
        } catch (error) {
          uni.showToast({
            title: "操作失败，请稍后重试",
            icon: "none"
          });
          formatAppLog("error", "at pages/index/index.vue:514", "获取队伍角色失败:", error);
        } finally {
          loadingRoles.value = false;
        }
      }
      async function submitApplication() {
        if (!selectedRoleId.value) {
          uni.showToast({
            title: "请选择申请角色",
            icon: "none"
          });
          return;
        }
        if (!applyMessage.value.trim()) {
          uni.showToast({
            title: "请输入申请留言",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: "提交中..."
          });
          const selectedRole = availableRoles.value.find((role) => role.id === selectedRoleId.value);
          if (selectedRole && selectedRole.count <= selectedRole.filled) {
            uni.hideLoading();
            uni.showToast({
              title: "该角色已满员",
              icon: "none"
            });
            return;
          }
          const applyData = {
            teamId: Number(applyTeamId.value),
            // 确保是数字类型
            roleId: Number(selectedRoleId.value),
            // 确保是数字类型
            message: applyMessage.value.trim()
          };
          formatAppLog("log", "at pages/index/index.vue:562", "申请加入队伍:", applyData);
          const applyRes = await teamApi.applyTeam(applyData);
          uni.hideLoading();
          if (applyRes.code === 200) {
            uni.showToast({
              title: "申请已发送",
              icon: "success"
            });
            resetApplyForm();
            showApplyModal.value = false;
          } else {
            uni.showToast({
              title: applyRes.message || "申请失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/index/index.vue:585", "申请加入队伍失败:", error);
          uni.showToast({
            title: error.message || "申请提交失败，请稍后重试",
            icon: "none"
          });
        }
      }
      function resetApplyForm() {
        showApplyModal.value = false;
        applyTeamId.value = null;
        selectedRoleId.value = null;
        applyMessage.value = "希望加入您的团队，请审核";
        availableRoles.value = [];
      }
      function goToSearch() {
        uni.navigateTo({
          url: "/pages/search/index"
        });
      }
      function getStatusClass(status) {
        switch (status) {
          case "0":
            return "status-not-started";
          case "1":
            return "status-recruiting";
          case "2":
            return "status-ongoing";
          case "3":
            return "status-ended";
          default:
            return "";
        }
      }
      vue.watch(showApplyModal, (newVal) => {
        const popup = uni.createSelectorQuery().in(vue.getCurrentInstance()).select(".uni-popup");
        if (popup) {
          setTimeout(() => {
            popup.node((res) => {
              if (res && res.node) {
                if (newVal) {
                  res.node.open && res.node.open();
                } else {
                  res.node.close && res.node.close();
                }
              }
            }).exec();
          }, 0);
        }
      });
      function showAiRecommendPopup() {
        const hasClickedAiRecommend = store.getState("hasClickedAiRecommend");
        if (hasClickedAiRecommend) {
          formatAppLog("log", "at pages/index/index.vue:652", "用户已点击过AI推荐，直接跳转到推荐页面");
          navigateToAiRecommend();
          return;
        }
        formatAppLog("log", "at pages/index/index.vue:657", "用户首次点击AI推荐，显示分析动画");
        aiAnalyzing.value = true;
        currentTextIndex.value = 0;
        try {
          if (aiRecommendPopup.value) {
            aiRecommendPopup.value.open();
          } else {
            formatAppLog("error", "at pages/index/index.vue:668", "AI推荐弹窗引用获取失败");
            uni.showToast({
              title: "正在分析中...",
              icon: "loading",
              mask: true,
              duration: 2e3
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:677", "打开AI弹窗失败:", error);
          uni.showLoading({
            title: aiAnalyzingTexts[0],
            mask: true
          });
        }
        if (aiAnalyzingTimer) {
          clearInterval(aiAnalyzingTimer);
          aiAnalyzingTimer = null;
        }
        aiAnalyzingTimer = setInterval(() => {
          currentTextIndex.value = (currentTextIndex.value + 1) % aiAnalyzingTexts.length;
          if (!aiRecommendPopup.value || !aiRecommendPopup.value.showPopup) {
            uni.showLoading({
              title: aiAnalyzingTexts[currentTextIndex.value],
              mask: true
            });
          }
          if (currentTextIndex.value === aiAnalyzingTexts.length - 1) {
            setTimeout(() => {
              clearInterval(aiAnalyzingTimer);
              aiAnalyzingTimer = null;
              uni.hideLoading();
              try {
                if (aiRecommendPopup.value) {
                  aiRecommendPopup.value.close();
                }
              } catch (error) {
                formatAppLog("error", "at pages/index/index.vue:715", "关闭AI弹窗失败:", error);
              }
              store.updateState("hasClickedAiRecommend", true);
              uni.showToast({
                title: "分析完成",
                icon: "success",
                duration: 1e3
              });
              setTimeout(() => {
                navigateToAiRecommend();
              }, 1e3);
            }, 1500);
          }
        }, 1500);
      }
      function closeAiRecommendPopup() {
        formatAppLog("log", "at pages/index/index.vue:739", "关闭AI推荐弹窗");
        if (aiAnalyzingTimer) {
          clearInterval(aiAnalyzingTimer);
          aiAnalyzingTimer = null;
        }
        uni.hideLoading();
        aiAnalyzing.value = false;
        currentTextIndex.value = 0;
      }
      function viewRecommendedTeam(id) {
        closeAiRecommendPopup();
        viewDetail("team", id);
      }
      function resetAiRecommendForTesting() {
        formatAppLog("log", "at pages/index/index.vue:768", "重置AI推荐状态（开发测试用）");
        store.resetAiRecommendState();
        aiAnalyzing.value = false;
        currentTextIndex.value = 0;
        if (aiAnalyzingTimer) {
          clearInterval(aiAnalyzingTimer);
          aiAnalyzingTimer = null;
        }
        uni.showToast({
          title: "已重置AI推荐状态",
          icon: "success",
          duration: 1500
        });
      }
      vue.onMounted(() => {
        const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        formatAppLog("log", "at pages/index/index.vue:793", "状态栏高度:", statusBarHeight);
        vue.nextTick(() => {
          try {
            const instance = vue.getCurrentInstance();
            if (instance && instance.proxy) {
              aiRecommendPopup.value = instance.proxy.$refs.aiRecommendPopup;
              formatAppLog("log", "at pages/index/index.vue:802", "获取到弹窗引用:", aiRecommendPopup.value ? "成功" : "失败");
            } else {
              formatAppLog("error", "at pages/index/index.vue:804", "获取getCurrentInstance()失败或无proxy属性");
            }
          } catch (e) {
            formatAppLog("error", "at pages/index/index.vue:807", "获取弹窗引用出错:", e);
          }
        });
        setTimeout(() => {
          if (!aiRecommendPopup.value) {
            try {
              const instance = vue.getCurrentInstance();
              if (instance && instance.proxy) {
                aiRecommendPopup.value = instance.proxy.$refs.aiRecommendPopup;
                formatAppLog("log", "at pages/index/index.vue:818", "延迟获取到弹窗引用:", aiRecommendPopup.value ? "成功" : "失败");
              }
            } catch (e) {
              formatAppLog("error", "at pages/index/index.vue:821", "延迟获取弹窗引用出错:", e);
            }
          }
        }, 300);
        const hasClickedAiRecommend = store.getState("hasClickedAiRecommend");
        formatAppLog("log", "at pages/index/index.vue:828", "用户是否已点击过AI推荐:", hasClickedAiRecommend ? "是" : "否");
        if (!hasClickedAiRecommend) {
          aiAnalyzing.value = false;
          currentTextIndex.value = 0;
          if (aiAnalyzingTimer) {
            clearInterval(aiAnalyzingTimer);
            aiAnalyzingTimer = null;
          }
        }
        Promise.all([
          getTeamList(),
          getCompetitionsList(),
          getRecommendedTeams()
          // 提前预加载AI推荐数据
        ]).then(() => {
          formatAppLog("log", "at pages/index/index.vue:846", "所有数据加载完成");
        }).catch((err) => {
          formatAppLog("error", "at pages/index/index.vue:848", "数据加载出错:", err);
        });
      });
      const __returned__ = { headerBarRef, headerPlaceholderHeight, teamList, competitionsList, recommendedTeams, aiSummary, showApplyModal, applyTeamId, applyMessage, selectedRoleId, availableRoles, loadingRoles, aiRecommendPopup, aiAnalyzing, aiAnalyzingTexts, get aiAnalyzingTimer() {
        return aiAnalyzingTimer;
      }, set aiAnalyzingTimer(v) {
        aiAnalyzingTimer = v;
      }, currentTextIndex, getCompetitionsList, getTeamList, getRecommendedTeams, navigateTo, navigateToAiRecommend, viewAll, viewDetail, joinTeam, submitApplication, resetApplyForm, goToSearch, getStatusClass, showAiRecommendPopup, closeAiRecommendPopup, viewRecommendedTeam, resetAiRecommendForTesting, ref: vue.ref, onMounted: vue.onMounted, watch: vue.watch, getCurrentInstance: vue.getCurrentInstance, computed: vue.computed, nextTick: vue.nextTick, get teamApi() {
        return teamApi;
      }, get competitionsApi() {
        return competitionsApi;
      }, TeamCard, TabBar, HeaderBar, get api() {
        return api;
      }, get store() {
        return store;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$t(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createVNode(
        $setup["HeaderBar"],
        {
          ref: "headerBarRef",
          title: "校园任务与组队平台",
          "show-ai-recommend": true,
          onSearch: $setup.goToSearch,
          onAiRecommend: $setup.navigateToAiRecommend
        },
        null,
        512
        /* NEED_PATCH */
      ),
      vue.createCommentVNode(" 页面内容 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content-scroll"
      }, [
        vue.createCommentVNode(" 轮播图 "),
        vue.createElementVNode("view", { class: "swiper-container" }, [
          vue.createElementVNode("swiper", {
            class: "swiper animate__animated animate__fadeIn",
            circular: "",
            autoplay: "",
            interval: "3000",
            duration: "500",
            "indicator-dots": "",
            "indicator-active-color": "#247ae4",
            "indicator-color": "rgba(0, 0, 0, 0.2)"
          }, [
            vue.createElementVNode("swiper-item", null, [
              vue.createElementVNode("view", { class: "swiper-item" }, [
                vue.createElementVNode("image", {
                  src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
                  mode: "aspectFill"
                }),
                vue.createElementVNode("view", { class: "swiper-overlay" }, [
                  vue.createElementVNode("text", { class: "swiper-title" }, "中国大学生计算机设计大赛(第18届)"),
                  vue.createElementVNode("view", { class: "swiper-date" }, [
                    vue.createElementVNode("text", { class: "iconfont icon-calendar date-icon" }),
                    vue.createElementVNode("text", { class: "date-text" }, "报名截止：5月15日")
                  ])
                ])
              ])
            ]),
            vue.createElementVNode("swiper-item", null, [
              vue.createElementVNode("view", { class: "swiper-item" }, [
                vue.createElementVNode("image", {
                  src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
                  mode: "aspectFill"
                }),
                vue.createElementVNode("view", { class: "swiper-overlay" }, [
                  vue.createElementVNode("text", { class: "swiper-title" }, "挑战杯创业计划大赛"),
                  vue.createElementVNode("view", { class: "swiper-date" }, [
                    vue.createElementVNode("text", { class: "iconfont icon-calendar date-icon" }),
                    vue.createElementVNode("text", { class: "date-text" }, "报名截止：6月10日")
                  ])
                ])
              ])
            ]),
            vue.createElementVNode("swiper-item", null, [
              vue.createElementVNode("view", { class: "swiper-item" }, [
                vue.createElementVNode("image", {
                  src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
                  mode: "aspectFill"
                }),
                vue.createElementVNode("view", { class: "swiper-overlay" }, [
                  vue.createElementVNode("text", { class: "swiper-title" }, "创青春创业大赛"),
                  vue.createElementVNode("view", { class: "swiper-date" }, [
                    vue.createElementVNode("text", { class: "iconfont icon-calendar date-icon" }),
                    vue.createElementVNode("text", { class: "date-text" }, "报名截止：7月5日")
                  ])
                ])
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 功能图标入口 "),
        vue.createElementVNode("view", { class: "menu-container" }, [
          vue.createElementVNode("view", { class: "menu-grid" }, [
            vue.createElementVNode("view", {
              class: "menu-item animate__animated animate__fadeInUp",
              style: { "animation-delay": "0.1s" },
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigateTo("task-square"))
            }, [
              vue.createElementVNode("view", { class: "menu-icon blue" }, [
                vue.createElementVNode("text", { class: "iconfont icon-trophy" })
              ]),
              vue.createElementVNode("text", { class: "menu-text" }, "校园委托")
            ]),
            vue.createElementVNode("view", {
              class: "menu-item animate__animated animate__fadeInUp",
              style: { "animation-delay": "0.2s" },
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.navigateTo("findPartner"))
            }, [
              vue.createElementVNode("view", { class: "menu-icon green" }, [
                vue.createElementVNode("text", { class: "iconfont icon-users" })
              ]),
              vue.createElementVNode("text", { class: "menu-text" }, "寻找队友")
            ]),
            vue.createElementVNode("view", {
              class: "menu-item animate__animated animate__fadeInUp",
              style: { "animation-delay": "0.3s" },
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.navigateTo("project"))
            }, [
              vue.createElementVNode("view", { class: "menu-icon purple" }, [
                vue.createElementVNode("text", { class: "iconfont icon-project" })
              ]),
              vue.createElementVNode("text", { class: "menu-text" }, "项目展示")
            ]),
            vue.createElementVNode("view", {
              class: "menu-item animate__animated animate__fadeInUp",
              style: { "animation-delay": "0.4s" },
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.navigateTo("schedule"))
            }, [
              vue.createElementVNode("view", { class: "menu-icon orange" }, [
                vue.createElementVNode("text", { class: "iconfont icon-calendar" })
              ]),
              vue.createElementVNode("text", { class: "menu-text" }, "日程安排")
            ])
          ])
        ]),
        vue.createCommentVNode(" 热门竞赛 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "section-title animate__animated animate__fadeInLeft" }, "热门竞赛"),
            vue.createElementVNode("text", {
              class: "view-all animate__animated animate__fadeInRight",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.viewAll("competition"))
            }, "查看全部")
          ]),
          vue.createElementVNode("view", { class: "competition-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.competitionsList, (competition) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "competition-item card-hover animate__animated animate__fadeInUp",
                  style: { "animation-delay": "0.1s" },
                  onClick: ($event) => $setup.viewDetail("competition", competition.id),
                  key: competition.id
                }, [
                  vue.createElementVNode("view", { class: "competition-flex" }, [
                    vue.createElementVNode("view", { class: "competition-image-container" }, [
                      vue.createElementVNode("image", {
                        class: "competition-image",
                        src: competition.coverImageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
                        mode: "aspectFill"
                      }, null, 8, ["src"])
                    ]),
                    vue.createElementVNode("view", { class: "competition-content" }, [
                      vue.createElementVNode("view", { class: "flex-between" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "competition-title" },
                          vue.toDisplayString(competition.title),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "status-wrapper" }, [
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["status-tag pulse", $setup.getStatusClass(competition.status)])
                            },
                            vue.toDisplayString(competition.statusText),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ]),
                      vue.createElementVNode("view", { class: "tag-row" }, [
                        competition.categoryNames && competition.categoryNames.length > 0 ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "tag green-tag"
                          },
                          vue.toDisplayString(competition.categoryNames[0]),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true),
                        vue.createElementVNode(
                          "text",
                          { class: "tag gray-tag" },
                          vue.toDisplayString(competition.level),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "competition-info" }, [
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "iconfont icon-clock" }),
                          vue.createElementVNode(
                            "text",
                            { class: "info-text" },
                            "报名截止: " + vue.toDisplayString(competition.registrationDeadlineFormatted),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "info-item" }, [
                          vue.createElementVNode("text", { class: "iconfont icon-team" }),
                          vue.createElementVNode(
                            "text",
                            { class: "info-text" },
                            vue.toDisplayString(competition.teamSize) + "-" + vue.toDisplayString(competition.teamMax) + "人/队",
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ])
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 推荐队伍 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "section-title animate__animated animate__fadeInLeft" }, "热门队伍"),
            vue.createElementVNode(
              "view",
              {
                class: "ai-recommend-btn",
                onClick: $setup.showAiRecommendPopup,
                onLongpress: $setup.resetAiRecommendForTesting
              },
              [
                vue.createElementVNode("text", { class: "iconfont icon-ai" }),
                vue.createElementVNode("text", { class: "ai-text" }, "AI智能推荐")
              ],
              32
              /* NEED_HYDRATION */
            )
          ]),
          vue.createElementVNode("view", { class: "team-list" }, [
            vue.createCommentVNode(" 使用团队卡片组件 "),
            $setup.teamList.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              vue.renderList($setup.teamList, (team, index) => {
                return vue.openBlock(), vue.createBlock($setup["TeamCard"], {
                  key: team.id,
                  team,
                  index,
                  onDetail: _cache[5] || (_cache[5] = (id) => $setup.viewDetail("team", id)),
                  onApply: $setup.joinTeam
                }, null, 8, ["team", "index"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "empty-state"
            }, [
              vue.createElementVNode("text", { class: "empty-text" }, "加载中...")
            ]))
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部TabBar - 由自定义组件处理 "),
      vue.createVNode($setup["TabBar"], { activeTab: "home" }),
      vue.createCommentVNode(" 申请加入弹窗 "),
      vue.createVNode(_component_uni_popup, {
        ref: "applyPopup",
        type: "center",
        show: $setup.showApplyModal,
        onChange: _cache[9] || (_cache[9] = (e) => {
          if (!e.show)
            $setup.resetApplyForm();
        })
      }, {
        default: vue.withCtx(() => [
          vue.createElementVNode("view", { class: "apply-popup" }, [
            vue.createElementVNode("view", { class: "popup-header" }, [
              vue.createElementVNode("text", { class: "popup-title" }, "申请加入团队"),
              vue.createElementVNode("text", {
                class: "close-icon",
                onClick: _cache[6] || (_cache[6] = ($event) => $setup.showApplyModal = false)
              }, "×")
            ]),
            vue.createElementVNode("view", { class: "popup-content" }, [
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "申请角色"),
                vue.createElementVNode("view", { class: "role-select" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.availableRoles, (role) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: role.id,
                        class: vue.normalizeClass(["role-option", $setup.selectedRoleId === role.id ? "role-selected" : ""]),
                        onClick: ($event) => $setup.selectedRoleId = role.id
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "role-name" },
                          vue.toDisplayString(role.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "role-count" },
                          vue.toDisplayString(role.filled) + "/" + vue.toDisplayString(role.count) + "人",
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, [
                  vue.createTextVNode("申请留言 "),
                  vue.createElementVNode("text", { class: "required" }, "*")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "textarea",
                  {
                    class: "message-input",
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.applyMessage = $event),
                    placeholder: "请输入申请留言",
                    maxlength: "100"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.applyMessage]
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "char-count" },
                  vue.toDisplayString($setup.applyMessage.length) + "/100",
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "popup-footer" }, [
              vue.createElementVNode("button", {
                class: "cancel-btn",
                onClick: _cache[8] || (_cache[8] = ($event) => $setup.showApplyModal = false)
              }, "取消"),
              vue.createElementVNode("button", {
                class: "submit-btn",
                onClick: $setup.submitApplication,
                disabled: !$setup.applyMessage
              }, "提交申请", 8, ["disabled"])
            ])
          ])
        ]),
        _: 1
        /* STABLE */
      }, 8, ["show"]),
      vue.createCommentVNode(" 添加AI推荐弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "aiRecommendPopup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "ai-popup" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("text", { class: "popup-title" }, "AI智能推荐"),
                vue.createElementVNode("text", {
                  class: "close-icon",
                  onClick: $setup.closeAiRecommendPopup
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "popup-content" }, [
                vue.createCommentVNode(" 分析中动画 "),
                $setup.aiAnalyzing ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "ai-analyzing"
                }, [
                  vue.createElementVNode("view", { class: "ai-icon-container" }, [
                    vue.createElementVNode("text", { class: "iconfont icon-ai ai-icon" })
                  ]),
                  vue.createElementVNode("view", { class: "analyzing-text" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.aiAnalyzingTexts[$setup.currentTextIndex]),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "loading-dots" }, [
                    vue.createElementVNode("view", { class: "dot" }),
                    vue.createElementVNode("view", { class: "dot" }),
                    vue.createElementVNode("view", { class: "dot" })
                  ])
                ])) : (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  [
                    vue.createCommentVNode(" 推荐结果 "),
                    vue.createElementVNode("view", null, [
                      vue.createCommentVNode(" AI分析摘要 "),
                      $setup.aiSummary ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "ai-summary"
                      }, [
                        vue.createElementVNode("view", { class: "summary-header" }, [
                          vue.createElementVNode("text", { class: "summary-title" }, "✨ AI分析结果")
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "summary-content" },
                          vue.toDisplayString($setup.aiSummary),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true),
                      vue.createCommentVNode(" 推荐队伍列表 "),
                      vue.createElementVNode("scroll-view", {
                        class: "recommend-teams-scroll",
                        "scroll-y": ""
                      }, [
                        $setup.recommendedTeams.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "recommend-teams"
                        }, [
                          (vue.openBlock(true), vue.createElementBlock(
                            vue.Fragment,
                            null,
                            vue.renderList($setup.recommendedTeams.slice(0, 3), (team, index) => {
                              return vue.openBlock(), vue.createBlock($setup["TeamCard"], {
                                key: team.id,
                                team,
                                index,
                                "show-match": true,
                                onDetail: $setup.viewRecommendedTeam,
                                onApply: $setup.joinTeam
                              }, null, 8, ["team", "index"]);
                            }),
                            128
                            /* KEYED_FRAGMENT */
                          ))
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "empty-recommend"
                        }, [
                          vue.createElementVNode("text", null, "暂无推荐结果，请完善个人资料后再试")
                        ]))
                      ])
                    ])
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                ))
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$t], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/index/index.vue"]]);
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en$1 = {
    "uni-load-more.contentdown": "Pull up to show more",
    "uni-load-more.contentrefresh": "loading...",
    "uni-load-more.contentnomore": "No more data"
  };
  const zhHans$1 = {
    "uni-load-more.contentdown": "上拉显示更多",
    "uni-load-more.contentrefresh": "正在加载...",
    "uni-load-more.contentnomore": "没有更多数据了"
  };
  const zhHant$1 = {
    "uni-load-more.contentdown": "上拉顯示更多",
    "uni-load-more.contentrefresh": "正在加載...",
    "uni-load-more.contentnomore": "沒有更多數據了"
  };
  const messages = {
    en: en$1,
    "zh-Hans": zhHans$1,
    "zh-Hant": zhHant$1
  };
  let platform;
  setTimeout(() => {
    platform = uni.getSystemInfoSync().platform;
  }, 16);
  const {
    t: t$2
  } = initVueI18n(messages);
  const _sfc_main$t = {
    name: "UniLoadMore",
    emits: ["clickLoadMore"],
    props: {
      status: {
        // 上拉的状态：more-loading前；loading-loading中；noMore-没有更多了
        type: String,
        default: "more"
      },
      showIcon: {
        type: Boolean,
        default: true
      },
      iconType: {
        type: String,
        default: "auto"
      },
      iconSize: {
        type: Number,
        default: 24
      },
      color: {
        type: String,
        default: "#777777"
      },
      contentText: {
        type: Object,
        default() {
          return {
            contentdown: "",
            contentrefresh: "",
            contentnomore: ""
          };
        }
      },
      showText: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        webviewHide: false,
        platform,
        imgBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzlBMzU3OTlEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzlBMzU3OUFEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDOUEzNTc5N0Q5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDOUEzNTc5OEQ5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt+ALSwAAA6CSURBVHja1FsLkFZVHb98LM+F5bHL8khA1iSeiyQBCRM+YGqKUnnJTDLGI0BGZlKDIU2MMglUiDApEZvSsZnQtBRJtKwQNKQMFYeRDR10WOLd8ljYXdh+v8v5fR3Od+797t1dnOnO/Ofce77z+J//+b/P+ZqtXbs2sJ9MJhNUV1cHJ06cCJo3bx7EPc2aNcvpy7pWrVoF+/fvDyoqKoI2bdoE9fX1F7TjN8a+EXBn/fkfvw942Tf+wYMHg9mzZwfjxo0LDhw4EPa1x2MbFw/fOGfPng1qa2tzcCkILsLDydq2bRsunpOTMM7TD/W/tZDZhPdeKD+yGxHhdu3aBV27dg3OnDlzMVANMheLAO3btw8KCwuDmpoaX5OxbgUIMEq7K8IcPnw4KCsrC/r37x8cP378/4cAXAB3vqSkJMuiDhTkw+XcuXNhOWbMmKBly5YhUT8xArhyFvP0BfwRsAuwxJZJsm/nzp2DTp06he/OU+cZ64K6o0ePBkOHDg2GDx8e6gEbJ5Q/NHNuAJQ1hgBeHUDlR7nVTkY8rQAvAi4z34vR/mPs1FoRsaCgIJThI0eOBC1atEiFGGV+5MiRoS45efJkqFjJFXV1dQuA012m2WcwTw98fy6CqBdsaiIO4CScrGPHjvk4odhavPquRtFWXEC25VgkREKOCh/qDSq+vn37htzD/mZTOmOc5U7zKzBPEedygWshcDyWvs30igAbU+6oyMgJBCFhwQE0fccxN60Ay9iebbjoDh06hMowjQxT4fXq1SskArmHZpkArvixp/kWzHdMeArExSJEaiXIjjRjRJ4DaAGWpibLzXN3Fm1vA5teBgh3j1Rv3bp1YgKwPdmf2p9zcyNYYgPKMfY0T5f5nNYdw158nJ8QawW4CLKwiOBSEgO/hok2eBydR+3dYH+PLxA5J8Vv0KBBwenTp0P2JWAx6+yFEBfs8lMY+y0SWMBNI9E4ThKi58VKTg3FQZS1RQF1cz27eC0QHMu+3E0SkUowjhVt5VdaWhp07949ZHv2Qd1EjDXM2cla1M0nl3GxAs3J9yREzyTdFVKVFOaE9qRA8GM0WebRuo9JGZKA7Mv2SeS/Z8+eoQ9BArMfFrLGo6jvxbhHbJZnKX2Rzz1O7QhJJ9Cs2ZMaWIyq/zhdeqPNfIoHd58clIQD+JSXl4dKlyIAuBdVXZwFVWKspSSoxE++h8x4k3uCnEhE4I5KwRiFWGOU0QWKiCYLbdoRMRKAu2kQ9vkfLU6dOhX06NEjlH+yMRZSinnuyWnYosVcji8CEA/6Cg2JF+IIUBqnGKUTCNwtwBN4f89RiK1R96DEgO2o0NDmtEdvVFdVVYV+P3UAPUEs6GFwV3PHmXkD4vh74iDFJysVI/MlaQhwKeBNTLYX5VuA8T4/gZxA4MRGFxDB6R7OmYPfyykGRJbyie+XnGYnQIC/coH9+vULiYrxrkL9ZA9+0ykaHIfEpM7ge8TiJ2CsHYwyMfafAF1yCGBHYIbCVDjDjKt7BeB51D+LgQa6OkG7IDYEEtvQ7lnXLKLtLdLuJBpE4gPUXcW2+PkZwOex+4cGDhwYDBkyRL7/HFcEwUGPo/8uWRUpYnfxGHco8HkewLHLyYmAawAPuIFZxhOpDfJQ8gbUv41yORAptMWBNr6oqMhWird5+u+iHmBb2nhjDV7HWBNQTgK8y11l5NetWzc5ULscAtSj7nbNI0skhWeUZCc0W4nyH/jO4Vz0u1IeYhbk4AiwM6tjxIWByHsoZ9qcIBPJd/y+DwPfBESOmCa/QF3WiZHucLlEDpNxcNhmheEOPgdQNx6/VZFQzFZ5TN08AHXQt2Ii3EdyFuUsPtTcGPhW5iMiCNELvz+Gdn9huG4HUJaW/w3g0wxV0XaG7arG2WeKiUWYM4Y7GO5ezshTARbbWGw/DvXkpp/ivVvE0JVoMxN4rpGzJMhE5Pl+xlATsDIqikP9F9D2z3h9nOksEUFhK+qO4rcPkoalMQ/HqJLIyb3F3JdjrCcw1yZ8joyJLR5gCo54etlag7qIoeNh1N1BRYj3DTFJ0elotxPlVzkGuYAmL0VSJVGAJA41c4Z6A3BzTLfn0HYwYKEI6CUAMzZEWvLsIcQOo1AmmyyM72nHJCfYsogflGV6jEk9vyQZXSuq6w4c16NsGcGZbwOPr+H1RkOk2LEzjNepxQkihHSCQ4ynAYNRx2zMKV92CQMWqj8J0BRE8EShxRFN6YrfCRhC0x3r/Zm4IbQCcmJoV0kMamllccR6FjHqUC5F2R/wS2dcymOlfAKOS4KmzQb5cpNC2MC7JhVn5wjXoJ44rYhLh8n0eXOCorJxa7POjbSlCGVczr34/RsAmrcvo9s+wGp3tzVhntxiXiJ4nvEYb4FJkf0O8HocAePmLvCxnL0AORraVekJk6TYjDabRVXfRE2lCN1h6ZQRN1+InUbsCpKwoBZHh0dODN9JBCUffItXxEavTQkUtnfTVAplCWL3JISz29h4NjotnuSsQKJCk8dF+kJR6RARjrqFVmfPnj3ZbK8cIJ0msd6jgHPGtfVTQ8VLmlvh4mct9sobRmPic0DyDQQnx/NlfYUgyz59+oScsH379pAwXABD32nTpoUHIToESeI5mnbE/UqDdyLcafEBf2MCqgC7NwxIbMREJQ0g4D4sfJwnD+AmRrII05cfMWJE+L1169bQr+fip06dGp4oJ83lmYd5wj/EmMa4TaHivo4EeCguYZBnkB5g2aWA69OIEnUHOaGysjIYMGBAMGnSpODYsWPZwCpFmm4lNq+4gSLQA7jcX8DwtjEyRC8wjabnXEx9kfWnTJkSJkAo90xpJVV+FmcVNeYAF5zWngS4C4O91MBxmAv8blLEpbjI5sz9MTdAhcgkCT1RO8mZkAjfiYpTEvStAS53Uw1vAiUGgZ3GpuQEYvoiBqlIan7kSDHnTwJQFNiPu0+5VxCVYhcZIjNrdXUDdp+Eq5AZ3Gkg8QAyVZRZIk4Tl4QAbF9cXJxNYZMAtAokgs4BrNxEpCtteXg7DDTMDKYNSuQdKsnJBek7HxewvxaosWxLYXtw+cJp18217wql4aKCfBNoEu0O5VU+PhctJ0YeXD4C6JQpyrlpSLTojpGGGN5YwNziChdIZLk4lvLcFJ9jMX3QdiImY9bmGQU+TRUL5CHITTRlgF8D9ouD1MfmLoEPl5xokIumZ2cfgMpHt47IW9N64Hsh7wQYYjyIugWuF5fCqYncXRd5vPMWyizzvhi/32+nvG0dZc9vR6fZOu0md5e+uC408FvKSIOZwXlGvxPv95izA2Vtvg1xKFWARI+vMX66HUhpQQb643uW1bSjuTWyw2SBvDrBvjFic1eGGlz5esq3ko9uSIlBRqPuFcCv8F4WIcN12nVaBd0SaYwI6PDDImR11JkqgHcPmQssjxIn6bUshygDFJUTxPMpHk+jfjPgupgdnYV2R/g7xSjtpah8RJBewhwf0gGK6XI92u4wXFEU40afJ4DN4h5LcAd+40HI3JgJecuT0c062W0i2hQJUTcxan3/CMW1PF2K6bbA+Daz4xRs1D3Br1Cm0OihKCqizW78/nXAF/G5TXrEcVzaNMH6CyMswqsAHqDyDLEyou8lwOXnKF8DjI6KjV3KzMBiXkDH8ij/H214J5A596ekrZ3F0zXlWeL7+P5eUrNo3/QwC15uxthuzidy7DzKRwEDaAViiDgKbTbz7CJnzo0bN7pIfIiid8SuPwn25o3QCmpnyjlZkyxPP8EomCJzrGb7GJMx7tNsq4MT2xMUYaiErZOluTzKsnz3gwCeCZyVRZJfYplNEokEjwrPtxlxjeYAk+F1F74VAzPxQRNYYdtpOUvWs8J1sGhBJMNsb7igN8plJs1eSmLIhLKE4rvaCX27gOhLpLOsIzJ7qn/i+wZzcvSOZ23/du8TZjwV8zHIXoP4R3ifBxiFz1dcVpa3aPntPE+c6TmIWE9EtcMmAcPdWAhYhAXxcLOQi9L1WhD1Sc8p1d2oL7XGiRKp8F4A2i8K/nfI+y/gsTDJ/YC/8+AD5Uh04KHiGl+cIFPnBDDrPMjwRGkLXyxO4VGbfQWnDH2v0bVWE3C9QOXlepbgjEfIJQI6XDG3z5ahD9cw2pS78ipB85wyScNTvsVzlzzhL8/jRrnmVjfFJK/m3m4nj9vbgQTguT8XZTjsm672R5uJKEaQmBI/c58gyus8ZDagLpEVSJBIyHp4jn++xqPV71OgQgJYEWOtZ/haxRtKmWOBu8xdBLftWltsY84zE6WIEy/eIOWL+BaayMx+KHtL7EAkqdNDLiEXmEMUHniedtJqg9HmZtfvt26vNi0BdG3Ft3g8ZOf7PAu59TxtzivLNIekyi+wD1i8CuUiD9FXAa8C+/xS3JPmZnomyc7H+fb4/Se0bk41Fel621r4cgVxbq91V4jVqwB7HTe2M7jgB+QWHavZkDRPmZcASoZEmBx6i75bGjPcMdL4/VKGFAGWZkGzPG0XAbdL9A81G5LOmUnC9hHKJeO7dcUMjblSl12867ElFTtaGl20xvvLGPdVz/8TVuU7y0x1PG7vtNg24oz9Uo/Z412++VFWI7Fcog9tu9Lm6gvRmIPv9x1xmQAu6RDkXtbOtlGEmpgD5Nvnyc0dcv0EE6cfdi1HmhMf9wDF3k3gtRvEedhxjpgfqPb9PU9iEJHnyOUA7bQUXh6kq/D7l2iTjWv7XOD530BDr8jIrus+srXjt4MzumJMHuTsBa63YKE1+RR5lBjEikCCnWKWiHdzOgKO+nRIBAF88za/IFmJ3eMZov4CYxGBabcpGL8EYx+SeMXJeRwHNsV/h+vdxeuhEpN3ZyNY78Gm2fknJxVGhyjixPiQvVkNzT1elD9Py/aTAL64Hb9vcYmC9zfdXdT/C1LeGbg4rnBaAihDFJH12W5ulfNCNe/xTsP3bp8ikzJs5BF+5PNfAQYAPaseTdsEcaYAAAAASUVORK5CYII="
      };
    },
    computed: {
      iconSnowWidth() {
        return (Math.floor(this.iconSize / 24) || 1) * 2;
      },
      contentdownText() {
        return this.contentText.contentdown || t$2("uni-load-more.contentdown");
      },
      contentrefreshText() {
        return this.contentText.contentrefresh || t$2("uni-load-more.contentrefresh");
      },
      contentnomoreText() {
        return this.contentText.contentnomore || t$2("uni-load-more.contentnomore");
      }
    },
    mounted() {
      var pages = getCurrentPages();
      var page = pages[pages.length - 1];
      var currentWebview = page.$getAppWebview();
      currentWebview.addEventListener("hide", () => {
        this.webviewHide = true;
      });
      currentWebview.addEventListener("show", () => {
        this.webviewHide = false;
      });
    },
    methods: {
      onClick() {
        this.$emit("clickLoadMore", {
          detail: {
            status: this.status
          }
        });
      }
    }
  };
  function _sfc_render$s(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "uni-load-more",
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data.webviewHide && ($props.iconType === "circle" || $props.iconType === "auto" && $data.platform === "android") && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--android-MP"
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )) : !$data.webviewHide && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--ios-H5"
        },
        [
          vue.createElementVNode("image", {
            src: $data.imgBase64,
            mode: "widthFix"
          }, null, 8, ["src"])
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showText ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 2,
          class: "uni-load-more__text",
          style: vue.normalizeStyle({ color: $props.color })
        },
        vue.toDisplayString($props.status === "more" ? $options.contentdownText : $props.status === "loading" ? $options.contentrefreshText : $options.contentnomoreText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$s], ["__scopeId", "data-v-9245e42c"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue"]]);
  const _imports_0$3 = "/static/empty-task.png";
  const defaultAvatar$1 = "https://via.placeholder.com/100";
  const mainCategoryCount = 4;
  const _sfc_main$s = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const categories = vue.ref([
        { id: 0, name: "全部" }
      ]);
      const statusOptions = [
        { label: "全部", value: "" },
        { label: "招募中", value: "recruiting" },
        { label: "进行中", value: "ongoing" },
        { label: "已完成", value: "completed" },
        { label: "已取消", value: "canceled" }
      ];
      const activeCategoryId = vue.ref(0);
      const activeStatus = vue.ref("");
      const taskList = vue.ref([]);
      const page = vue.ref(1);
      const pageSize = vue.ref(10);
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const noMore = vue.ref(false);
      const loadingText = vue.ref({
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "已经到底啦"
      });
      const isCategoryExpanded = vue.ref(false);
      const headerHeight = vue.computed(() => {
        const baseHeight = 300;
        if (isCategoryExpanded.value) {
          const moreCount = getMoreCategories().length;
          const rows = Math.ceil(moreCount / 4);
          return baseHeight + rows * 80 + 30 + "rpx";
        }
        return baseHeight + "rpx";
      });
      vue.onMounted(() => {
        loadingText.value = {
          contentdown: "上拉显示更多",
          contentrefresh: "正在加载...",
          contentnomore: "已经到底啦"
        };
        getTaskCategories2();
        getTaskList();
      });
      async function getTaskCategories2() {
        try {
          const res = await request({
            url: "/taskCategories",
            method: "GET"
          });
          if (res.code === 200 && res.data && Array.isArray(res.data)) {
            const allCategories = [{ id: 0, name: "全部" }, ...res.data];
            categories.value = allCategories;
          } else {
            formatAppLog("error", "at pages/task-square/index.vue:239", "获取任务分类失败:", res);
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/index.vue:242", "获取任务分类异常:", error);
          uni.showToast({
            title: "获取分类失败",
            icon: "none"
          });
        }
      }
      async function getTaskList() {
        if (!refreshing.value) {
          loading.value = true;
        }
        try {
          const params = {
            pageNum: page.value,
            pageSize: pageSize.value
          };
          if (activeCategoryId.value !== 0) {
            params.categoryId = activeCategoryId.value;
          }
          if (activeStatus.value) {
            params.status = activeStatus.value;
          }
          const res = await request({
            url: "/tasks/list",
            method: "GET",
            params
          });
          if (res.code === 200 && res.data) {
            if (page.value === 1) {
              taskList.value = res.data.records || [];
              if (refreshing.value) {
                uni.showToast({
                  title: "刷新成功",
                  icon: "success",
                  duration: 1500
                });
              }
            } else {
              taskList.value = [...taskList.value, ...res.data.records || []];
              if (res.data.records && res.data.records.length > 0) {
                uni.showToast({
                  title: `加载了${res.data.records.length}条新数据`,
                  icon: "none",
                  duration: 1500
                });
              }
            }
            if (res.data.current >= res.data.pages || !res.data.records || res.data.records.length === 0) {
              noMore.value = true;
            } else {
              noMore.value = false;
            }
          } else {
            formatAppLog("error", "at pages/task-square/index.vue:313", "获取任务列表失败:", res);
            uni.showToast({
              title: "获取任务列表失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/index.vue:320", "获取任务列表异常:", error);
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
          if (refreshing.value) {
            refreshing.value = false;
            uni.stopPullDownRefresh();
          }
        }
      }
      function onRefresh() {
        if (loading.value)
          return;
        refreshing.value = true;
        page.value = 1;
        noMore.value = false;
        getTaskList();
      }
      function formatDate(dateStr) {
        if (!dateStr)
          return "";
        try {
          const date = new Date(dateStr);
          return `${date.getMonth() + 1}月${date.getDate()}日`;
        } catch (e) {
          return dateStr;
        }
      }
      function selectCategory(categoryId) {
        if (activeCategoryId.value === categoryId) {
          return;
        }
        activeCategoryId.value = categoryId;
        page.value = 1;
        noMore.value = false;
        taskList.value = [];
        getTaskList();
      }
      function selectStatus(status) {
        if (activeStatus.value === status)
          return;
        activeStatus.value = status;
        page.value = 1;
        noMore.value = false;
        taskList.value = [];
        getTaskList();
      }
      function loadMore() {
        if (loading.value || refreshing.value || noMore.value)
          return;
        uni.showToast({
          title: "加载更多数据...",
          icon: "none",
          duration: 800
        });
        page.value++;
        getTaskList();
      }
      function getCategoryClass(category) {
        switch (category) {
          case "问卷调查":
            return "tag-blue";
          case "数据收集":
            return "tag-green";
          case "实验参与":
            return "tag-purple";
          case "校园活动":
            return "tag-orange";
          case "学术研究":
            return "tag-pink";
          case "志愿服务":
            return "tag-green";
          case "竞赛协助":
            return "tag-yellow";
          case "技术支持":
            return "tag-blue";
          default:
            return "tag-blue";
        }
      }
      function getStatusClass(status) {
        switch (status) {
          case "recruiting":
            return "status-recruiting";
          case "ongoing":
            return "status-ongoing";
          case "completed":
            return "status-ended";
          case "canceled":
            return "status-canceled";
          default:
            return "status-recruiting";
        }
      }
      function getRewardClass(type) {
        switch (type) {
          case "现金":
            return "reward-orange";
          case "学分":
            return "reward-blue";
          case "志愿服务":
            return "reward-green";
          case "证书":
            return "reward-yellow";
          case "礼品":
            return "reward-purple";
          default:
            return "reward-gray";
        }
      }
      function viewTaskDetail(id) {
        uni.navigateTo({
          url: `/pages/task-square/detail?id=${id}`
        });
      }
      function createTask2() {
        uni.navigateTo({
          url: "/pages/task-square/create"
        });
      }
      function onSearch() {
        uni.navigateTo({
          url: "/pages/task-square/search"
        });
      }
      function onNotification() {
        uni.navigateTo({
          url: "/pages/notification/index"
        });
      }
      function goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.switchTab({
            url: "/pages/index/index"
          });
        }
      }
      function getSelectedCategoryName() {
        const selectedCategory = categories.value.find((item) => item.id === activeCategoryId.value);
        return selectedCategory ? selectedCategory.name : "全部";
      }
      function toggleCategoryExpand() {
        isCategoryExpanded.value = !isCategoryExpanded.value;
      }
      function getMainCategories() {
        return categories.value.slice(0, mainCategoryCount);
      }
      function getMoreCategories() {
        return categories.value.slice(mainCategoryCount);
      }
      function hasMoreCategories() {
        return categories.value.length > mainCategoryCount;
      }
      const __returned__ = { defaultAvatar: defaultAvatar$1, categories, statusOptions, activeCategoryId, activeStatus, taskList, page, pageSize, loading, refreshing, noMore, loadingText, isCategoryExpanded, mainCategoryCount, headerHeight, getTaskCategories: getTaskCategories2, getTaskList, onRefresh, formatDate, selectCategory, selectStatus, loadMore, getCategoryClass, getStatusClass, getRewardClass, viewTaskDetail, createTask: createTask2, onSearch, onNotification, goBack, getSelectedCategoryName, toggleCategoryExpand, getMainCategories, getMoreCategories, hasMoreCategories, ref: vue.ref, onMounted: vue.onMounted, reactive: vue.reactive, computed: vue.computed, get request() {
        return request;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$r(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部固定区域 "),
      vue.createElementVNode(
        "view",
        {
          class: "header-fixed",
          style: vue.normalizeStyle({ height: $setup.headerHeight })
        },
        [
          vue.createElementVNode("view", { class: "header-bar" }, [
            vue.createElementVNode("view", {
              class: "back-btn",
              onClick: $setup.goBack
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-back" })
            ]),
            vue.createElementVNode("view", { class: "header-title" }, "任务广场"),
            vue.createElementVNode("view", { class: "header-actions" }, [
              vue.createElementVNode("view", {
                class: "action-btn",
                onClick: $setup.onSearch
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-search" })
              ]),
              vue.createElementVNode("view", {
                class: "action-btn",
                onClick: $setup.onNotification
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-notification" })
              ])
            ])
          ]),
          vue.createCommentVNode(" 分类和筛选区域 "),
          vue.createElementVNode("view", { class: "filter-container" }, [
            vue.createCommentVNode(" 分类标签 "),
            vue.createElementVNode("view", { class: "category-section" }, [
              vue.createElementVNode("view", { class: "main-categories" }, [
                vue.createCommentVNode(" 默认显示的主要分类 "),
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.getMainCategories(), (item) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.id,
                      class: vue.normalizeClass(["category-tag", $setup.activeCategoryId === item.id ? "category-tag-active" : ""]),
                      onClick: ($event) => $setup.selectCategory(item.id)
                    }, vue.toDisplayString(item.name), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                vue.createCommentVNode(" 更多按钮 "),
                $setup.hasMoreCategories() ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "more-btn",
                  onClick: $setup.toggleCategoryExpand
                }, [
                  vue.createTextVNode(
                    vue.toDisplayString($setup.isCategoryExpanded ? "收起" : "更多") + " ",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["iconfont", $setup.isCategoryExpanded ? "icon-arrow-up" : "icon-arrow-down"])
                    },
                    null,
                    2
                    /* CLASS */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createCommentVNode(" 展开的更多分类 "),
              $setup.isCategoryExpanded ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "more-categories-container"
              }, [
                vue.createElementVNode("view", { class: "more-categories" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.getMoreCategories(), (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: item.id,
                        class: vue.normalizeClass(["category-tag", $setup.activeCategoryId === item.id ? "category-tag-active" : ""]),
                        onClick: ($event) => $setup.selectCategory(item.id)
                      }, vue.toDisplayString(item.name), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createCommentVNode(" 状态筛选标签 "),
            vue.createElementVNode("view", { class: "divider" }),
            vue.createElementVNode("scroll-view", {
              "scroll-x": "",
              class: "status-scroll",
              "show-scrollbar": "false"
            }, [
              vue.createElementVNode("view", { class: "status-container" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.statusOptions, (item, index) => {
                    return vue.createElementVNode("view", {
                      key: index,
                      class: vue.normalizeClass(["status-filter-tag", $setup.activeStatus === item.value ? "status-filter-active" : ""]),
                      onClick: ($event) => $setup.selectStatus(item.value)
                    }, vue.toDisplayString(item.label), 11, ["onClick"]);
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ])
          ])
        ],
        4
        /* STYLE */
      ),
      vue.createCommentVNode(" 任务列表 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "tasks-scroll",
        style: vue.normalizeStyle({ "padding-top": $setup.headerHeight }),
        onScrolltolower: $setup.loadMore,
        onRefresherrefresh: $setup.onRefresh,
        "refresher-enabled": "true",
        "refresher-triggered": $setup.refreshing,
        "refresher-background": "#f5f5f5"
      }, [
        vue.createElementVNode("view", { class: "tasks-container" }, [
          vue.createCommentVNode(" 顶部刷新提示 "),
          $setup.refreshing ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "refresh-tip"
          }, [
            vue.createElementVNode("text", { class: "refresh-text" }, "正在刷新数据...")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 任务卡片 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.taskList, (task) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "task-card",
                key: task.id,
                onClick: ($event) => $setup.viewTaskDetail(task.id)
              }, [
                vue.createElementVNode("view", { class: "task-header" }, [
                  vue.createElementVNode("view", null, [
                    vue.createElementVNode(
                      "view",
                      { class: "task-title" },
                      vue.toDisplayString(task.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "task-tags" }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["task-tag", $setup.getCategoryClass(task.categoryName)])
                        },
                        vue.toDisplayString(task.categoryName),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["task-status-tag", $setup.getStatusClass(task.status)])
                        },
                        vue.toDisplayString(task.statusText),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "task-deadline" },
                        "截止: " + vue.toDisplayString($setup.formatDate(task.deadline)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["task-reward", $setup.getRewardClass(task.rewardTypeName)])
                    },
                    [
                      task.rewardTypeName === "现金" ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 0 },
                        "¥" + vue.toDisplayString(task.rewardAmount),
                        1
                        /* TEXT */
                      )) : task.rewardTypeName === "学分" ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 1 },
                        vue.toDisplayString(task.rewardAmount) + "学分",
                        1
                        /* TEXT */
                      )) : (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 2 },
                        vue.toDisplayString(task.rewardTypeName),
                        1
                        /* TEXT */
                      ))
                    ],
                    2
                    /* CLASS */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "task-desc" },
                  vue.toDisplayString(task.shortDescription),
                  1
                  /* TEXT */
                ),
                task.location ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "task-location"
                }, [
                  vue.createElementVNode("text", { class: "iconfont icon-location" }),
                  vue.createElementVNode(
                    "text",
                    { class: "location-text" },
                    vue.toDisplayString(task.location),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "task-footer" }, [
                  vue.createElementVNode("view", { class: "task-publisher" }, [
                    vue.createElementVNode("image", {
                      class: "publisher-avatar",
                      src: task.creatorAvatarUrl || $setup.defaultAvatar,
                      mode: "aspectFill"
                    }, null, 8, ["src"]),
                    vue.createElementVNode(
                      "text",
                      { class: "publisher-info" },
                      vue.toDisplayString(task.creatorName) + " · " + vue.toDisplayString(task.creatorMajor),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "task-stats" }, [
                    vue.createElementVNode("text", { class: "stat-item" }, [
                      vue.createElementVNode("text", { class: "iconfont icon-view" }),
                      vue.createTextVNode(
                        " " + vue.toDisplayString(task.viewCount),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("text", { class: "stat-item" }, [
                      vue.createElementVNode("text", { class: "iconfont icon-user" }),
                      vue.createTextVNode(
                        " " + vue.toDisplayString(task.currentParticipants) + "/" + vue.toDisplayString(task.maxParticipants),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 空数据状态 "),
          $setup.taskList.length === 0 && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty-state"
          }, [
            vue.createElementVNode("image", {
              class: "empty-image",
              src: _imports_0$3,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无任务数据")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 加载状态 "),
          $setup.loading && !$setup.refreshing ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "loading-more"
          }, [
            vue.createVNode(_component_uni_load_more, {
              status: "loading",
              contentText: $setup.loadingText
            }, null, 8, ["contentText"])
          ])) : vue.createCommentVNode("v-if", true),
          $setup.noMore && !$setup.loading && $setup.taskList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "no-more"
          }, [
            vue.createVNode(_component_uni_load_more, {
              status: "noMore",
              contentText: $setup.loadingText
            }, null, 8, ["contentText"])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 底部安全区域 "),
          vue.createElementVNode("view", { class: "safe-area-bottom" })
        ])
      ], 44, ["refresher-triggered"]),
      vue.createCommentVNode(" 悬浮发布按钮 "),
      vue.createElementVNode("view", {
        class: "float-btn",
        onClick: $setup.createTask
      }, [
        vue.createElementVNode("text", { class: "iconfont icon-plus" })
      ])
    ]);
  }
  const PagesTaskSquareIndex = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$r], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/task-square/index.vue"]]);
  const defaultAvatar = "https://via.placeholder.com/100";
  const _sfc_main$r = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      const taskId = vue.ref(null);
      const isFavorite = vue.ref(false);
      const viewCounted = vue.ref(false);
      const favoriteCount = vue.ref(0);
      const isAlreadyApplied = vue.ref(false);
      const taskDetail = vue.ref({
        id: 0,
        title: "",
        description: "",
        requirements: "",
        contactInfo: "",
        categoryId: 0,
        categoryName: "",
        creatorId: 0,
        creatorName: "",
        creatorAvatarUrl: "",
        creatorMajor: "",
        rewardTypeId: 0,
        rewardTypeName: "",
        rewardAmount: 0,
        createdAt: "",
        deadline: "",
        status: "recruiting",
        maxParticipants: 0,
        currentParticipants: 0,
        viewCount: 0,
        location: ""
      });
      const contactInfo = vue.computed(() => {
        if (!taskDetail.value.contactInfo)
          return null;
        try {
          let contactData;
          if (typeof taskDetail.value.contactInfo === "string") {
            contactData = JSON.parse(taskDetail.value.contactInfo);
          } else {
            contactData = taskDetail.value.contactInfo;
          }
          return contactData;
        } catch (e) {
          formatAppLog("error", "at pages/task-square/detail.vue:178", "解析联系方式失败:", e);
          return null;
        }
      });
      const validContacts = vue.computed(() => {
        if (!contactInfo.value)
          return [];
        return Object.entries(contactInfo.value).filter(([key, value]) => value && value.toString().trim() !== "").map(([key, value]) => ({ key, value }));
      });
      const isApplyDisabled = vue.computed(() => {
        if (isAlreadyApplied.value) {
          return true;
        }
        if (taskDetail.value.status !== "recruiting") {
          return true;
        }
        if (taskDetail.value.currentParticipants >= taskDetail.value.maxParticipants) {
          return true;
        }
        return false;
      });
      vue.onMounted(() => {
        getTaskIdAndLoadDetail();
      });
      function getTaskIdAndLoadDetail() {
        try {
          let id = null;
          const pages = getCurrentPages();
          if (pages && pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            if (currentPage.options && currentPage.options.id) {
              id = currentPage.options.id;
            } else if (currentPage.$page && currentPage.$page.fullPath) {
              const fullPath = currentPage.$page.fullPath;
              const queryIndex = fullPath.indexOf("?");
              if (queryIndex > -1) {
                const queryPart = fullPath.substring(queryIndex + 1);
                const queryParams = queryPart.split("&");
                for (let param of queryParams) {
                  const [key, value] = param.split("=");
                  if (key === "id" && value) {
                    id = value;
                    break;
                  }
                }
              }
            } else if (currentPage.__displayReporter && currentPage.__displayReporter.query) {
              id = currentPage.__displayReporter.query.id;
            }
          }
          if (id) {
            taskId.value = id;
            getTaskDetail(id);
          } else {
            uni.showToast({
              title: "无法获取任务信息",
              icon: "none"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/detail.vue:273", "获取任务ID出错:", error);
          uni.showToast({
            title: "加载任务详情失败",
            icon: "none"
          });
        }
      }
      __expose({
        onLoad(options) {
          if (options && options.id) {
            taskId.value = options.id;
            getTaskDetail(options.id);
          }
        }
      });
      async function getTaskDetail(id) {
        if (!id) {
          uni.showToast({
            title: "任务ID无效",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const res = await request({
            url: `/tasks/${id}`,
            method: "GET"
          });
          if (res.code === 200 && res.data) {
            taskDetail.value = res.data;
            checkIfAlreadyApplied(id);
            if (taskDetail.value.title) {
              uni.setNavigationBarTitle({
                title: "任务详情"
              });
            }
          } else {
            formatAppLog("error", "at pages/task-square/detail.vue:325", "获取任务详情失败:", res);
            uni.showToast({
              title: "获取任务详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/detail.vue:334", "获取任务详情异常:", error);
        } finally {
          uni.hideLoading();
        }
      }
      function formatDeadline(dateStr) {
        if (!dateStr)
          return "";
        try {
          const date = new Date(dateStr);
          const now = /* @__PURE__ */ new Date();
          const days = ["日", "一", "二", "三", "四", "五", "六"];
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const timeStr = `${hours}:${minutes}`;
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekday = days[date.getDay()];
            return `${month}月${day}日 周${weekday} ${timeStr}`;
          } else {
            return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
          }
        } catch (e) {
          return dateStr;
        }
      }
      function formatTimeAgo(dateStr) {
        if (!dateStr)
          return "";
        try {
          const date = new Date(dateStr);
          const now = /* @__PURE__ */ new Date();
          const diff = now.getTime() - date.getTime();
          const minute = 60 * 1e3;
          const hour = 60 * minute;
          const day = 24 * hour;
          const week = 7 * day;
          const month = 30 * day;
          if (diff < minute) {
            return "刚刚";
          } else if (diff < hour) {
            return Math.floor(diff / minute) + "分钟前";
          } else if (diff < day) {
            return Math.floor(diff / hour) + "小时前";
          } else if (diff < week) {
            return Math.floor(diff / day) + "天前";
          } else if (diff < month) {
            return Math.floor(diff / week) + "周前";
          } else {
            return Math.floor(diff / month) + "个月前";
          }
        } catch (e) {
          return dateStr;
        }
      }
      function getStatusText(status) {
        switch (status) {
          case "recruiting":
            return "招募中";
          case "ongoing":
            return "进行中";
          case "completed":
            return "已完成";
          case "ended":
            return "已结束";
          case "canceled":
            return "已取消";
          default:
            return "未知状态";
        }
      }
      function getStatusClass(status) {
        switch (status) {
          case "recruiting":
            return "status-recruiting";
          case "ongoing":
            return "status-ongoing";
          case "completed":
            return "status-completed";
          case "ended":
            return "status-ended";
          case "canceled":
            return "status-canceled";
          default:
            return "";
        }
      }
      function getRewardTypeText(type) {
        switch (type) {
          case "现金":
            return "报酬";
          case "学分":
            return "学分奖励";
          case "志愿服务":
            return "志愿时长";
          case "证书":
            return "证书奖励";
          default:
            return "奖励";
        }
      }
      function getRewardClass(type) {
        switch (type) {
          case "现金":
            return "reward-orange";
          case "学分":
            return "reward-blue";
          case "志愿服务":
            return "reward-green";
          case "证书":
            return "reward-yellow";
          default:
            return "";
        }
      }
      function getContactTypeText(type) {
        switch (type) {
          case "phone":
            return "电话";
          case "wechat":
            return "微信";
          case "qq":
            return "QQ";
          case "email":
            return "邮箱";
          default:
            return type;
        }
      }
      function copyContactInfo(value) {
        uni.setClipboardData({
          data: value,
          success: () => {
            uni.showToast({
              title: "复制成功",
              icon: "success"
            });
          }
        });
      }
      function getApplyButtonText() {
        if (isAlreadyApplied.value) {
          return "已申请";
        }
        if (taskDetail.value.status === "recruiting") {
          if (taskDetail.value.currentParticipants >= taskDetail.value.maxParticipants) {
            return "名额已满";
          }
          return "立即申请";
        } else if (taskDetail.value.status === "ongoing") {
          return "进行中";
        } else if (taskDetail.value.status === "completed") {
          return "已完成";
        } else if (taskDetail.value.status === "ended") {
          return "已结束";
        } else if (taskDetail.value.status === "canceled") {
          return "已取消";
        }
        return "立即申请";
      }
      function goBack() {
        uni.navigateBack();
      }
      async function toggleFavorite() {
        if (!taskId.value)
          return;
      }
      async function checkIfAlreadyApplied(taskId2) {
        try {
          const response = await api.taskApplications.checkTaskApplication(taskId2);
          if (response.code === 200 && response.data) {
            isAlreadyApplied.value = response.data.participated || false;
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/detail.vue:561", "检查申请状态失败:", error);
          isAlreadyApplied.value = false;
        }
      }
      async function applyTask() {
        if (isApplyDisabled.value)
          return;
        uni.showModal({
          title: "申请任务",
          content: "确定要申请该任务吗？",
          editable: true,
          placeholderText: "可选择填写申请理由（如有特长、经验等）",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "提交申请中..."
                });
                const response = await api.taskApplications.createTaskApplication({
                  taskId: taskId.value,
                  message: res.content || "我对这个任务很感兴趣，希望能参与。",
                  status: "pending"
                  // 添加状态字段，表示申请待处理
                });
                uni.hideLoading();
                if (response.code === 200) {
                  uni.showToast({
                    title: "申请成功，等待审核",
                    icon: "success"
                  });
                  isAlreadyApplied.value = true;
                  setTimeout(() => {
                    uni.navigateTo({
                      url: "/pages/application/application"
                    });
                  }, 1500);
                } else {
                  uni.showToast({
                    title: response.message || "申请失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                uni.hideLoading();
                formatAppLog("error", "at pages/task-square/detail.vue:615", "申请任务失败:", error);
                uni.showToast({
                  title: "申请失败，请稍后重试",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      async function updateTaskStatus(status, cancelReason = "") {
        if (!taskId.value)
          return;
        if (status === "canceled" && !cancelReason) {
          uni.showModal({
            title: "取消任务",
            content: "确定要取消该任务吗？",
            editable: true,
            placeholderText: "请填写取消原因",
            success: async (res) => {
              if (res.confirm && res.content) {
                doUpdateTaskStatus(status, res.content);
              } else if (res.confirm) {
                uni.showToast({
                  title: "取消原因不能为空",
                  icon: "none"
                });
              }
            }
          });
          return;
        }
        const statusTextMap = {
          recruiting: "招募中",
          ongoing: "进行中",
          completed: "已完成",
          ended: "已结束",
          canceled: "已取消"
        };
        uni.showModal({
          title: `更改状态为"${statusTextMap[status] || status}"`,
          content: `确定要将任务状态更改为"${statusTextMap[status] || status}"吗？`,
          success: async (res) => {
            if (res.confirm) {
              doUpdateTaskStatus(status, cancelReason);
            }
          }
        });
      }
      async function doUpdateTaskStatus(status, cancelReason = "") {
        try {
          uni.showLoading({
            title: "更新中..."
          });
          const data = { status };
          if (status === "canceled") {
            data.cancelReason = cancelReason;
          }
          const response = await api.tasks.updateTaskStatus(taskId.value, data);
          uni.hideLoading();
          if (response.code === 200) {
            uni.showToast({
              title: "状态更新成功",
              icon: "success"
            });
            getTaskDetail(taskId.value);
          } else {
            uni.showToast({
              title: response.message || "更新失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/task-square/detail.vue:704", "更新任务状态失败:", error);
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
        }
      }
      const __returned__ = { defaultAvatar, taskId, isFavorite, viewCounted, favoriteCount, isAlreadyApplied, taskDetail, contactInfo, validContacts, isApplyDisabled, getTaskIdAndLoadDetail, getTaskDetail, formatDeadline, formatTimeAgo, getStatusText, getStatusClass, getRewardTypeText, getRewardClass, getContactTypeText, copyContactInfo, getApplyButtonText, goBack, toggleFavorite, checkIfAlreadyApplied, applyTask, updateTaskStatus, doUpdateTaskStatus, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, reactive: vue.reactive, get request() {
        return request;
      }, get api() {
        return api;
      }, HeaderBar };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$q(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 - 使用HeaderBar组件 "),
      vue.createVNode($setup["HeaderBar"], {
        title: "任务详情",
        "show-search": false,
        "show-filter": false,
        onBack: $setup.goBack
      }),
      vue.createCommentVNode(" 任务详情内容 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "content-scroll"
      }, [
        vue.createCommentVNode(" 顶部基本信息卡片 "),
        vue.createElementVNode("view", { class: "top-info-card" }, [
          vue.createCommentVNode(" 任务标题和状态 "),
          vue.createElementVNode("view", { class: "title-status-row" }, [
            vue.createElementVNode(
              "text",
              { class: "task-title" },
              vue.toDisplayString($setup.taskDetail.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["task-status-tag", $setup.getStatusClass($setup.taskDetail.status)])
              },
              vue.toDisplayString($setup.taskDetail.statusText),
              3
              /* TEXT, CLASS */
            )
          ]),
          vue.createCommentVNode(" 发布者信息 "),
          vue.createElementVNode("view", { class: "publisher-info-row" }, [
            vue.createElementVNode("image", {
              class: "publisher-avatar",
              src: $setup.taskDetail.creatorAvatarUrl || $setup.defaultAvatar,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "publisher-text" }, [
              vue.createElementVNode(
                "text",
                { class: "publisher-name" },
                vue.toDisplayString($setup.taskDetail.creatorName),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "publisher-extra" },
                vue.toDisplayString($setup.taskDetail.creatorMajor) + " · " + vue.toDisplayString($setup.formatTimeAgo($setup.taskDetail.createdAt)) + "发布",
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 任务详情卡片 "),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "card-title" }, "任务详情"),
          vue.createElementVNode("view", { class: "card-content description-content" }, [
            vue.createElementVNode(
              "text",
              { class: "description-text" },
              vue.toDisplayString($setup.taskDetail.description),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 任务需求卡片 "),
        $setup.taskDetail.requirements ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "card-title" }, "任务要求"),
          vue.createElementVNode("view", { class: "card-content description-content" }, [
            vue.createElementVNode(
              "text",
              { class: "description-text" },
              vue.toDisplayString($setup.taskDetail.requirements),
              1
              /* TEXT */
            )
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 任务信息网格 "),
        vue.createElementVNode("view", { class: "info-grid" }, [
          vue.createCommentVNode(" 时间信息 "),
          vue.createElementVNode("view", { class: "info-grid-item" }, [
            vue.createElementVNode("text", { class: "grid-item-label" }, "时间"),
            vue.createElementVNode("view", { class: "grid-item-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-clock" }),
              vue.createElementVNode(
                "text",
                { class: "grid-item-value" },
                vue.toDisplayString($setup.formatDeadline($setup.taskDetail.deadline)),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createCommentVNode(" 地点信息 "),
          $setup.taskDetail.location ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "info-grid-item"
          }, [
            vue.createElementVNode("text", { class: "grid-item-label" }, "地点"),
            vue.createElementVNode("view", { class: "grid-item-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-location" }),
              vue.createElementVNode(
                "text",
                { class: "grid-item-value" },
                vue.toDisplayString($setup.taskDetail.location),
                1
                /* TEXT */
              )
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 奖励信息 "),
          vue.createElementVNode("view", { class: "info-grid-item" }, [
            vue.createElementVNode(
              "text",
              { class: "grid-item-label" },
              vue.toDisplayString($setup.getRewardTypeText($setup.taskDetail.rewardTypeName)),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "grid-item-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-reward" }),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["grid-item-value reward-text", $setup.getRewardClass($setup.taskDetail.rewardTypeName)])
                },
                [
                  $setup.taskDetail.rewardTypeName === "现金" ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 0 },
                    "¥" + vue.toDisplayString($setup.taskDetail.rewardAmount),
                    1
                    /* TEXT */
                  )) : $setup.taskDetail.rewardTypeName === "学分" ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 1 },
                    vue.toDisplayString($setup.taskDetail.rewardAmount) + " 学分",
                    1
                    /* TEXT */
                  )) : (vue.openBlock(), vue.createElementBlock(
                    "text",
                    { key: 2 },
                    vue.toDisplayString($setup.taskDetail.rewardTypeName),
                    1
                    /* TEXT */
                  ))
                ],
                2
                /* CLASS */
              )
            ])
          ]),
          vue.createCommentVNode(" 参与人数 "),
          vue.createElementVNode("view", { class: "info-grid-item" }, [
            vue.createElementVNode("text", { class: "grid-item-label" }, "参与人数"),
            vue.createElementVNode("view", { class: "grid-item-content" }, [
              vue.createElementVNode("text", { class: "iconfont icon-user" }),
              vue.createElementVNode(
                "text",
                { class: "grid-item-value" },
                vue.toDisplayString($setup.taskDetail.currentParticipants) + "/" + vue.toDisplayString($setup.taskDetail.maxParticipants) + " 人",
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 联系方式卡片 "),
        $setup.validContacts.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "card-title" }, "联系方式"),
          vue.createElementVNode("view", { class: "contact-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.validContacts, (contact) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "contact-item",
                  key: contact.key,
                  onClick: ($event) => $setup.copyContactInfo(contact.value)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "contact-type" },
                    vue.toDisplayString($setup.getContactTypeText(contact.key)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "contact-value-container" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "contact-value" },
                      vue.toDisplayString(contact.value),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-hint" }, "点击复制")
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 底部操作栏 "),
      vue.createElementVNode("view", { class: "bottom-actions" }, [
        vue.createElementVNode("view", {
          class: "action-btn favorite",
          onClick: $setup.toggleFavorite
        }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["iconfont", $setup.isFavorite ? "icon-star-filled" : "icon-star"])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($setup.isFavorite ? "已收藏" : "收藏"),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["apply-btn", { "disabled-btn": $setup.isApplyDisabled }]),
          disabled: $setup.isApplyDisabled,
          onClick: $setup.applyTask
        }, vue.toDisplayString($setup.getApplyButtonText()), 11, ["disabled"])
      ])
    ]);
  }
  const PagesTaskSquareDetail = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$q], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/task-square/detail.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$q = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$p(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$p], ["__scopeId", "data-v-d31e1c47"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  function obj2strClass(obj) {
    let classess = "";
    for (let key in obj) {
      const val = obj[key];
      if (val) {
        classess += `${key} `;
      }
    }
    return classess;
  }
  function obj2strStyle(obj) {
    let style = "";
    for (let key in obj) {
      const val = obj[key];
      style += `${key}:${val};`;
    }
    return style;
  }
  const _sfc_main$p = {
    name: "uni-easyinput",
    emits: [
      "click",
      "iconClick",
      "update:modelValue",
      "input",
      "focus",
      "blur",
      "confirm",
      "clear",
      "eyes",
      "change",
      "keyboardheightchange"
    ],
    model: {
      prop: "modelValue",
      event: "update:modelValue"
    },
    options: {
      virtualHost: true
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      },
      formItem: {
        from: "uniFormItem",
        default: null
      }
    },
    props: {
      name: String,
      value: [Number, String],
      modelValue: [Number, String],
      type: {
        type: String,
        default: "text"
      },
      clearable: {
        type: Boolean,
        default: true
      },
      autoHeight: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: " "
      },
      placeholderStyle: String,
      focus: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      maxlength: {
        type: [Number, String],
        default: 140
      },
      confirmType: {
        type: String,
        default: "done"
      },
      clearSize: {
        type: [Number, String],
        default: 24
      },
      inputBorder: {
        type: Boolean,
        default: true
      },
      prefixIcon: {
        type: String,
        default: ""
      },
      suffixIcon: {
        type: String,
        default: ""
      },
      trim: {
        type: [Boolean, String],
        default: false
      },
      cursorSpacing: {
        type: Number,
        default: 0
      },
      passwordIcon: {
        type: Boolean,
        default: true
      },
      adjustPosition: {
        type: Boolean,
        default: true
      },
      primaryColor: {
        type: String,
        default: "#2979ff"
      },
      styles: {
        type: Object,
        default() {
          return {
            color: "#333",
            backgroundColor: "#fff",
            disableColor: "#F7F6F6",
            borderColor: "#e5e5e5"
          };
        }
      },
      errorMessage: {
        type: [String, Boolean],
        default: ""
      }
    },
    data() {
      return {
        focused: false,
        val: "",
        showMsg: "",
        border: false,
        isFirstBorder: false,
        showClearIcon: false,
        showPassword: false,
        focusShow: false,
        localMsg: "",
        isEnter: false
        // 用于判断当前是否是使用回车操作
      };
    },
    computed: {
      // 输入框内是否有值
      isVal() {
        const val = this.val;
        if (val || val === 0) {
          return true;
        }
        return false;
      },
      msg() {
        return this.localMsg || this.errorMessage;
      },
      // 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，用户可以传入字符串数值
      inputMaxlength() {
        return Number(this.maxlength);
      },
      // 处理外层样式的style
      boxStyle() {
        return `color:${this.inputBorder && this.msg ? "#e43d33" : this.styles.color};`;
      },
      // input 内容的类和样式处理
      inputContentClass() {
        return obj2strClass({
          "is-input-border": this.inputBorder,
          "is-input-error-border": this.inputBorder && this.msg,
          "is-textarea": this.type === "textarea",
          "is-disabled": this.disabled,
          "is-focused": this.focusShow
        });
      },
      inputContentStyle() {
        const focusColor = this.focusShow ? this.primaryColor : this.styles.borderColor;
        const borderColor = this.inputBorder && this.msg ? "#dd524d" : focusColor;
        return obj2strStyle({
          "border-color": borderColor || "#e5e5e5",
          "background-color": this.disabled ? this.styles.disableColor : this.styles.backgroundColor
        });
      },
      // input右侧样式
      inputStyle() {
        const paddingRight = this.type === "password" || this.clearable || this.prefixIcon ? "" : "10px";
        return obj2strStyle({
          "padding-right": paddingRight,
          "padding-left": this.prefixIcon ? "" : "10px"
        });
      }
    },
    watch: {
      value(newVal) {
        this.val = newVal;
      },
      modelValue(newVal) {
        this.val = newVal;
      },
      focus(newVal) {
        this.$nextTick(() => {
          this.focused = this.focus;
          this.focusShow = this.focus;
        });
      }
    },
    created() {
      this.init();
      if (this.form && this.formItem) {
        this.$watch("formItem.errMsg", (newVal) => {
          this.localMsg = newVal;
        });
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.focused = this.focus;
        this.focusShow = this.focus;
      });
    },
    methods: {
      /**
       * 初始化变量值
       */
      init() {
        if (this.value || this.value === 0) {
          this.val = this.value;
        } else if (this.modelValue || this.modelValue === 0 || this.modelValue === "") {
          this.val = this.modelValue;
        } else {
          this.val = null;
        }
      },
      /**
       * 点击图标时触发
       * @param {Object} type
       */
      onClickIcon(type) {
        this.$emit("iconClick", type);
      },
      /**
       * 显示隐藏内容，密码框时生效
       */
      onEyes() {
        this.showPassword = !this.showPassword;
        this.$emit("eyes", this.showPassword);
      },
      /**
       * 输入时触发
       * @param {Object} event
       */
      onInput(event) {
        let value = event.detail.value;
        if (this.trim) {
          if (typeof this.trim === "boolean" && this.trim) {
            value = this.trimStr(value);
          }
          if (typeof this.trim === "string") {
            value = this.trimStr(value, this.trim);
          }
        }
        if (this.errMsg)
          this.errMsg = "";
        this.val = value;
        this.$emit("input", value);
        this.$emit("update:modelValue", value);
      },
      /**
       * 外部调用方法
       * 获取焦点时触发
       * @param {Object} event
       */
      onFocus() {
        this.$nextTick(() => {
          this.focused = true;
        });
        this.$emit("focus", null);
      },
      _Focus(event) {
        this.focusShow = true;
        this.$emit("focus", event);
      },
      /**
       * 外部调用方法
       * 失去焦点时触发
       * @param {Object} event
       */
      onBlur() {
        this.focused = false;
        this.$emit("blur", null);
      },
      _Blur(event) {
        event.detail.value;
        this.focusShow = false;
        this.$emit("blur", event);
        if (this.isEnter === false) {
          this.$emit("change", this.val);
        }
        if (this.form && this.formItem) {
          const { validateTrigger } = this.form;
          if (validateTrigger === "blur") {
            this.formItem.onFieldChange();
          }
        }
      },
      /**
       * 按下键盘的发送键
       * @param {Object} e
       */
      onConfirm(e) {
        this.$emit("confirm", this.val);
        this.isEnter = true;
        this.$emit("change", this.val);
        this.$nextTick(() => {
          this.isEnter = false;
        });
      },
      /**
       * 清理内容
       * @param {Object} event
       */
      onClear(event) {
        this.val = "";
        this.$emit("input", "");
        this.$emit("update:modelValue", "");
        this.$emit("clear");
      },
      /**
       * 键盘高度发生变化的时候触发此事件
       * 兼容性：微信小程序2.7.0+、App 3.1.0+
       * @param {Object} event
       */
      onkeyboardheightchange(event) {
        this.$emit("keyboardheightchange", event);
      },
      /**
       * 去除空格
       */
      trimStr(str, pos = "both") {
        if (pos === "both") {
          return str.trim();
        } else if (pos === "left") {
          return str.trimLeft();
        } else if (pos === "right") {
          return str.trimRight();
        } else if (pos === "start") {
          return str.trimStart();
        } else if (pos === "end") {
          return str.trimEnd();
        } else if (pos === "all") {
          return str.replace(/\s+/g, "");
        } else if (pos === "none") {
          return str;
        }
        return str;
      }
    }
  };
  function _sfc_render$o(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-easyinput", { "uni-easyinput-error": $options.msg }]),
        style: vue.normalizeStyle($options.boxStyle)
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-easyinput__content", $options.inputContentClass]),
            style: vue.normalizeStyle($options.inputContentStyle)
          },
          [
            $props.prefixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 0,
              class: "content-clear-icon",
              type: $props.prefixIcon,
              color: "#c0c4cc",
              onClick: _cache[0] || (_cache[0] = ($event) => $options.onClickIcon("prefix")),
              size: "22"
            }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true),
            vue.renderSlot(_ctx.$slots, "left", {}, void 0, true),
            $props.type === "textarea" ? (vue.openBlock(), vue.createElementBlock("textarea", {
              key: 1,
              class: vue.normalizeClass(["uni-easyinput__content-textarea", { "input-padding": $props.inputBorder }]),
              name: $props.name,
              value: $data.val,
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              disabled: $props.disabled,
              "placeholder-class": "uni-easyinput__placeholder-class",
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              autoHeight: $props.autoHeight,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onInput && $options.onInput(...args)),
              onBlur: _cache[2] || (_cache[2] = (...args) => $options._Blur && $options._Blur(...args)),
              onFocus: _cache[3] || (_cache[3] = (...args) => $options._Focus && $options._Focus(...args)),
              onConfirm: _cache[4] || (_cache[4] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[5] || (_cache[5] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 42, ["name", "value", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "autoHeight", "cursor-spacing", "adjust-position"])) : (vue.openBlock(), vue.createElementBlock("input", {
              key: 2,
              type: $props.type === "password" ? "text" : $props.type,
              class: "uni-easyinput__content-input",
              style: vue.normalizeStyle($options.inputStyle),
              name: $props.name,
              value: $data.val,
              password: !$data.showPassword && $props.type === "password",
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              "placeholder-class": "uni-easyinput__placeholder-class",
              disabled: $props.disabled,
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              confirmType: $props.confirmType,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onFocus: _cache[6] || (_cache[6] = (...args) => $options._Focus && $options._Focus(...args)),
              onBlur: _cache[7] || (_cache[7] = (...args) => $options._Blur && $options._Blur(...args)),
              onInput: _cache[8] || (_cache[8] = (...args) => $options.onInput && $options.onInput(...args)),
              onConfirm: _cache[9] || (_cache[9] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[10] || (_cache[10] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 44, ["type", "name", "value", "password", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "confirmType", "cursor-spacing", "adjust-position"])),
            $props.type === "password" && $props.passwordIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 3 },
              [
                vue.createCommentVNode(" 开启密码时显示小眼睛 "),
                $options.isVal ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: $data.showPassword ? "eye-slash-filled" : "eye-filled",
                  size: 22,
                  color: $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onEyes
                }, null, 8, ["class", "type", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true),
            $props.suffixIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 4 },
              [
                $props.suffixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: "content-clear-icon",
                  type: $props.suffixIcon,
                  color: "#c0c4cc",
                  onClick: _cache[11] || (_cache[11] = ($event) => $options.onClickIcon("suffix")),
                  size: "22"
                }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 5 },
              [
                $props.clearable && $options.isVal && !$props.disabled && $props.type !== "textarea" ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: "clear",
                  size: $props.clearSize,
                  color: $options.msg ? "#dd524d" : $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onClear
                }, null, 8, ["class", "size", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )),
            vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$o], ["__scopeId", "data-v-09fd5285"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue"]]);
  const _sfc_main$o = {
    name: "uniFormsItem",
    options: {
      virtualHost: true
    },
    provide() {
      return {
        uniFormItem: this
      };
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      }
    },
    props: {
      // 表单校验规则
      rules: {
        type: Array,
        default() {
          return null;
        }
      },
      // 表单域的属性名，在使用校验规则时必填
      name: {
        type: [String, Array],
        default: ""
      },
      required: {
        type: Boolean,
        default: false
      },
      label: {
        type: String,
        default: ""
      },
      // label的宽度
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: ""
      },
      // 强制显示错误信息
      errorMessage: {
        type: [String, Boolean],
        default: ""
      },
      // 1.4.0 弃用，统一使用 form 的校验时机
      // validateTrigger: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 弃用，统一使用 form 的label 位置
      // labelPosition: {
      // 	type: String,
      // 	default: ''
      // },
      // 1.4.0 以下属性已经废弃，请使用  #label 插槽代替
      leftIcon: String,
      iconColor: {
        type: String,
        default: "#606266"
      }
    },
    data() {
      return {
        errMsg: "",
        userRules: null,
        localLabelAlign: "left",
        localLabelWidth: "70px",
        localLabelPos: "left",
        border: false,
        isFirstBorder: false
      };
    },
    computed: {
      // 处理错误信息
      msg() {
        return this.errorMessage || this.errMsg;
      }
    },
    watch: {
      // 规则发生变化通知子组件更新
      "form.formRules"(val) {
        this.init();
      },
      "form.labelWidth"(val) {
        this.localLabelWidth = this._labelWidthUnit(val);
      },
      "form.labelPosition"(val) {
        this.localLabelPos = this._labelPosition();
      },
      "form.labelAlign"(val) {
      }
    },
    created() {
      this.init(true);
      if (this.name && this.form) {
        this.$watch(
          () => {
            const val = this.form._getDataValue(this.name, this.form.localData);
            return val;
          },
          (value, oldVal) => {
            const isEqual2 = this.form._isEqual(value, oldVal);
            if (!isEqual2) {
              const val = this.itemSetValue(value);
              this.onFieldChange(val, false);
            }
          },
          {
            immediate: false
          }
        );
      }
    },
    unmounted() {
      this.__isUnmounted = true;
      this.unInit();
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules = null) {
        this.userRules = rules;
        this.init(false);
      },
      // 兼容老版本表单组件
      setValue() {
      },
      /**
       * 外部调用方法
       * 校验数据
       * @param {any} value 需要校验的数据
       * @param {boolean} 是否立即校验
       * @return {Array|null} 校验内容
       */
      async onFieldChange(value, formtrigger = true) {
        const {
          formData,
          localData,
          errShowType,
          validateCheck,
          validateTrigger,
          _isRequiredField,
          _realName
        } = this.form;
        const name = _realName(this.name);
        if (!value) {
          value = this.form.formData[name];
        }
        const ruleLen = this.itemRules.rules && this.itemRules.rules.length;
        if (!this.validator || !ruleLen || ruleLen === 0)
          return;
        const isRequiredField2 = _isRequiredField(this.itemRules.rules || []);
        let result = null;
        if (validateTrigger === "bind" || formtrigger) {
          result = await this.validator.validateUpdate(
            {
              [name]: value
            },
            formData
          );
          if (!isRequiredField2 && (value === void 0 || value === "")) {
            result = null;
          }
          if (result && result.errorMessage) {
            if (errShowType === "undertext") {
              this.errMsg = !result ? "" : result.errorMessage;
            }
            if (errShowType === "toast") {
              uni.showToast({
                title: result.errorMessage || "校验错误",
                icon: "none"
              });
            }
            if (errShowType === "modal") {
              uni.showModal({
                title: "提示",
                content: result.errorMessage || "校验错误"
              });
            }
          } else {
            this.errMsg = "";
          }
          validateCheck(result ? result : null);
        } else {
          this.errMsg = "";
        }
        return result ? result : null;
      },
      /**
       * 初始组件数据
       */
      init(type = false) {
        const {
          validator,
          formRules,
          childrens,
          formData,
          localData,
          _realName,
          labelWidth,
          _getDataValue,
          _setDataValue
        } = this.form || {};
        this.localLabelAlign = this._justifyContent();
        this.localLabelWidth = this._labelWidthUnit(labelWidth);
        this.localLabelPos = this._labelPosition();
        this.form && type && childrens.push(this);
        if (!validator || !formRules)
          return;
        if (!this.form.isFirstBorder) {
          this.form.isFirstBorder = true;
          this.isFirstBorder = true;
        }
        if (this.group) {
          if (!this.group.isFirstBorder) {
            this.group.isFirstBorder = true;
            this.isFirstBorder = true;
          }
        }
        this.border = this.form.border;
        const name = _realName(this.name);
        const itemRule = this.userRules || this.rules;
        if (typeof formRules === "object" && itemRule) {
          formRules[name] = {
            rules: itemRule
          };
          validator.updateSchema(formRules);
        }
        const itemRules = formRules[name] || {};
        this.itemRules = itemRules;
        this.validator = validator;
        this.itemSetValue(_getDataValue(this.name, localData));
      },
      unInit() {
        if (this.form) {
          const {
            childrens,
            formData,
            _realName
          } = this.form;
          childrens.forEach((item, index) => {
            if (item === this) {
              this.form.childrens.splice(index, 1);
              delete formData[_realName(item.name)];
            }
          });
        }
      },
      // 设置item 的值
      itemSetValue(value) {
        const name = this.form._realName(this.name);
        const rules = this.itemRules.rules || [];
        const val = this.form._getValue(name, value, rules);
        this.form._setDataValue(name, this.form.formData, val);
        return val;
      },
      /**
       * 移除该表单项的校验结果
       */
      clearValidate() {
        this.errMsg = "";
      },
      // 是否显示星号
      _isRequired() {
        return this.required;
      },
      // 处理对齐方式
      _justifyContent() {
        if (this.form) {
          const {
            labelAlign
          } = this.form;
          let labelAli = this.labelAlign ? this.labelAlign : labelAlign;
          if (labelAli === "left")
            return "flex-start";
          if (labelAli === "center")
            return "center";
          if (labelAli === "right")
            return "flex-end";
        }
        return "flex-start";
      },
      // 处理 label宽度单位 ,继承父元素的值
      _labelWidthUnit(labelWidth) {
        return this.num2px(this.labelWidth ? this.labelWidth : labelWidth || (this.label ? 70 : "auto"));
      },
      // 处理 label 位置
      _labelPosition() {
        if (this.form)
          return this.form.labelPosition || "left";
        return "left";
      },
      /**
       * 触发时机
       * @param {Object} rule 当前规则内时机
       * @param {Object} itemRlue 当前组件时机
       * @param {Object} parentRule 父组件时机
       */
      isTrigger(rule, itemRlue, parentRule) {
        if (rule === "submit" || !rule) {
          if (rule === void 0) {
            if (itemRlue !== "bind") {
              if (!itemRlue) {
                return parentRule === "" ? "bind" : "submit";
              }
              return "submit";
            }
            return "bind";
          }
          return "submit";
        }
        return "bind";
      },
      num2px(num) {
        if (typeof num === "number") {
          return `${num}px`;
        }
        return num;
      }
    }
  };
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-forms-item", ["is-direction-" + $data.localLabelPos, $data.border ? "uni-forms-item--border" : "", $data.border && $data.isFirstBorder ? "is-first-border" : ""]])
      },
      [
        vue.renderSlot(_ctx.$slots, "label", {}, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__label", { "no-label": !$props.label && !$props.required }]),
              style: vue.normalizeStyle({ width: $data.localLabelWidth, justifyContent: $data.localLabelAlign })
            },
            [
              $props.required ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "is-required"
              }, "*")) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($props.label),
                1
                /* TEXT */
              )
            ],
            6
            /* CLASS, STYLE */
          )
        ], true),
        vue.createElementVNode("view", { class: "uni-forms-item__content" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-forms-item__error", { "msg--active": $options.msg }])
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($options.msg),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$n], ["__scopeId", "data-v-462874dd"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue"]]);
  let Calendar$1 = class Calendar {
    constructor({
      selected,
      startDate,
      endDate,
      range
    } = {}) {
      this.date = this.getDateObj(/* @__PURE__ */ new Date());
      this.selected = selected || [];
      this.startDate = startDate;
      this.endDate = endDate;
      this.range = range;
      this.cleanMultipleStatus();
      this.weeks = {};
      this.lastHover = false;
    }
    /**
     * 设置日期
     * @param {Object} date
     */
    setDate(date) {
      const selectDate = this.getDateObj(date);
      this.getWeeks(selectDate.fullDate);
    }
    /**
     * 清理多选状态
     */
    cleanMultipleStatus() {
      this.multipleStatus = {
        before: "",
        after: "",
        data: []
      };
    }
    setStartDate(startDate) {
      this.startDate = startDate;
    }
    setEndDate(endDate) {
      this.endDate = endDate;
    }
    getPreMonthObj(date) {
      date = fixIosDateFormat(date);
      date = new Date(date);
      const oldMonth = date.getMonth();
      date.setMonth(oldMonth - 1);
      const newMonth = date.getMonth();
      if (oldMonth !== 0 && newMonth - oldMonth === 0) {
        date.setMonth(newMonth - 1);
      }
      return this.getDateObj(date);
    }
    getNextMonthObj(date) {
      date = fixIosDateFormat(date);
      date = new Date(date);
      const oldMonth = date.getMonth();
      date.setMonth(oldMonth + 1);
      const newMonth = date.getMonth();
      if (newMonth - oldMonth > 1) {
        date.setMonth(newMonth - 1);
      }
      return this.getDateObj(date);
    }
    /**
     * 获取指定格式Date对象
     */
    getDateObj(date) {
      date = fixIosDateFormat(date);
      date = new Date(date);
      return {
        fullDate: getDate(date),
        year: date.getFullYear(),
        month: addZero(date.getMonth() + 1),
        date: addZero(date.getDate()),
        day: date.getDay()
      };
    }
    /**
     * 获取上一个月日期集合
     */
    getPreMonthDays(amount, dateObj) {
      const result = [];
      for (let i = amount - 1; i >= 0; i--) {
        const month = dateObj.month - 1;
        result.push({
          date: new Date(dateObj.year, month, -i).getDate(),
          month,
          disable: true
        });
      }
      return result;
    }
    /**
     * 获取本月日期集合
     */
    getCurrentMonthDays(amount, dateObj) {
      const result = [];
      const fullDate = this.date.fullDate;
      for (let i = 1; i <= amount; i++) {
        const currentDate = `${dateObj.year}-${dateObj.month}-${addZero(i)}`;
        const isToday = fullDate === currentDate;
        const info = this.selected && this.selected.find((item) => {
          if (this.dateEqual(currentDate, item.date)) {
            return item;
          }
        });
        if (this.startDate) {
          dateCompare(this.startDate, currentDate);
        }
        if (this.endDate) {
          dateCompare(currentDate, this.endDate);
        }
        let multiples = this.multipleStatus.data;
        let multiplesStatus = -1;
        if (this.range && multiples) {
          multiplesStatus = multiples.findIndex((item) => {
            return this.dateEqual(item, currentDate);
          });
        }
        const checked = multiplesStatus !== -1;
        result.push({
          fullDate: currentDate,
          year: dateObj.year,
          date: i,
          multiple: this.range ? checked : false,
          beforeMultiple: this.isLogicBefore(currentDate, this.multipleStatus.before, this.multipleStatus.after),
          afterMultiple: this.isLogicAfter(currentDate, this.multipleStatus.before, this.multipleStatus.after),
          month: dateObj.month,
          disable: this.startDate && !dateCompare(this.startDate, currentDate) || this.endDate && !dateCompare(
            currentDate,
            this.endDate
          ),
          isToday,
          userChecked: false,
          extraInfo: info
        });
      }
      return result;
    }
    /**
     * 获取下一个月日期集合
     */
    _getNextMonthDays(amount, dateObj) {
      const result = [];
      const month = dateObj.month + 1;
      for (let i = 1; i <= amount; i++) {
        result.push({
          date: i,
          month,
          disable: true
        });
      }
      return result;
    }
    /**
     * 获取当前日期详情
     * @param {Object} date
     */
    getInfo(date) {
      if (!date) {
        date = /* @__PURE__ */ new Date();
      }
      return this.calendar.find((item) => item.fullDate === this.getDateObj(date).fullDate);
    }
    /**
     * 比较时间是否相等
     */
    dateEqual(before, after) {
      before = new Date(fixIosDateFormat(before));
      after = new Date(fixIosDateFormat(after));
      return before.valueOf() === after.valueOf();
    }
    /**
     *  比较真实起始日期
     */
    isLogicBefore(currentDate, before, after) {
      let logicBefore = before;
      if (before && after) {
        logicBefore = dateCompare(before, after) ? before : after;
      }
      return this.dateEqual(logicBefore, currentDate);
    }
    isLogicAfter(currentDate, before, after) {
      let logicAfter = after;
      if (before && after) {
        logicAfter = dateCompare(before, after) ? after : before;
      }
      return this.dateEqual(logicAfter, currentDate);
    }
    /**
     * 获取日期范围内所有日期
     * @param {Object} begin
     * @param {Object} end
     */
    geDateAll(begin, end) {
      var arr = [];
      var ab = begin.split("-");
      var ae = end.split("-");
      var db = /* @__PURE__ */ new Date();
      db.setFullYear(ab[0], ab[1] - 1, ab[2]);
      var de = /* @__PURE__ */ new Date();
      de.setFullYear(ae[0], ae[1] - 1, ae[2]);
      var unixDb = db.getTime() - 24 * 60 * 60 * 1e3;
      var unixDe = de.getTime() - 24 * 60 * 60 * 1e3;
      for (var k = unixDb; k <= unixDe; ) {
        k = k + 24 * 60 * 60 * 1e3;
        arr.push(this.getDateObj(new Date(parseInt(k))).fullDate);
      }
      return arr;
    }
    /**
     *  获取多选状态
     */
    setMultiple(fullDate) {
      if (!this.range)
        return;
      let {
        before,
        after
      } = this.multipleStatus;
      if (before && after) {
        if (!this.lastHover) {
          this.lastHover = true;
          return;
        }
        this.multipleStatus.before = fullDate;
        this.multipleStatus.after = "";
        this.multipleStatus.data = [];
        this.multipleStatus.fulldate = "";
        this.lastHover = false;
      } else {
        if (!before) {
          this.multipleStatus.before = fullDate;
          this.multipleStatus.after = void 0;
          this.lastHover = false;
        } else {
          this.multipleStatus.after = fullDate;
          if (dateCompare(this.multipleStatus.before, this.multipleStatus.after)) {
            this.multipleStatus.data = this.geDateAll(this.multipleStatus.before, this.multipleStatus.after);
          } else {
            this.multipleStatus.data = this.geDateAll(this.multipleStatus.after, this.multipleStatus.before);
          }
          this.lastHover = true;
        }
      }
      this.getWeeks(fullDate);
    }
    /**
     *  鼠标 hover 更新多选状态
     */
    setHoverMultiple(fullDate) {
      if (!this.range || this.lastHover)
        return;
      const {
        before
      } = this.multipleStatus;
      if (!before) {
        this.multipleStatus.before = fullDate;
      } else {
        this.multipleStatus.after = fullDate;
        if (dateCompare(this.multipleStatus.before, this.multipleStatus.after)) {
          this.multipleStatus.data = this.geDateAll(this.multipleStatus.before, this.multipleStatus.after);
        } else {
          this.multipleStatus.data = this.geDateAll(this.multipleStatus.after, this.multipleStatus.before);
        }
      }
      this.getWeeks(fullDate);
    }
    /**
     * 更新默认值多选状态
     */
    setDefaultMultiple(before, after) {
      this.multipleStatus.before = before;
      this.multipleStatus.after = after;
      if (before && after) {
        if (dateCompare(before, after)) {
          this.multipleStatus.data = this.geDateAll(before, after);
          this.getWeeks(after);
        } else {
          this.multipleStatus.data = this.geDateAll(after, before);
          this.getWeeks(before);
        }
      }
    }
    /**
     * 获取每周数据
     * @param {Object} dateData
     */
    getWeeks(dateData) {
      const {
        year,
        month
      } = this.getDateObj(dateData);
      const preMonthDayAmount = new Date(year, month - 1, 1).getDay();
      const preMonthDays = this.getPreMonthDays(preMonthDayAmount, this.getDateObj(dateData));
      const currentMonthDayAmount = new Date(year, month, 0).getDate();
      const currentMonthDays = this.getCurrentMonthDays(currentMonthDayAmount, this.getDateObj(dateData));
      const nextMonthDayAmount = 42 - preMonthDayAmount - currentMonthDayAmount;
      const nextMonthDays = this._getNextMonthDays(nextMonthDayAmount, this.getDateObj(dateData));
      const calendarDays = [...preMonthDays, ...currentMonthDays, ...nextMonthDays];
      const weeks = new Array(6);
      for (let i = 0; i < calendarDays.length; i++) {
        const index = Math.floor(i / 7);
        if (!weeks[index]) {
          weeks[index] = new Array(7);
        }
        weeks[index][i % 7] = calendarDays[i];
      }
      this.calendar = calendarDays;
      this.weeks = weeks;
    }
  };
  function getDateTime(date, hideSecond) {
    return `${getDate(date)} ${getTime(date, hideSecond)}`;
  }
  function getDate(date) {
    date = fixIosDateFormat(date);
    date = new Date(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${addZero(month)}-${addZero(day)}`;
  }
  function getTime(date, hideSecond) {
    date = fixIosDateFormat(date);
    date = new Date(date);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return hideSecond ? `${addZero(hour)}:${addZero(minute)}` : `${addZero(hour)}:${addZero(minute)}:${addZero(second)}`;
  }
  function addZero(num) {
    if (num < 10) {
      num = `0${num}`;
    }
    return num;
  }
  function getDefaultSecond(hideSecond) {
    return hideSecond ? "00:00" : "00:00:00";
  }
  function dateCompare(startDate, endDate) {
    startDate = new Date(fixIosDateFormat(startDate));
    endDate = new Date(fixIosDateFormat(endDate));
    return startDate <= endDate;
  }
  function checkDate(date) {
    const dateReg = /((19|20)\d{2})(-|\/)\d{1,2}(-|\/)\d{1,2}/g;
    return date.match(dateReg);
  }
  const dateTimeReg = /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])( [0-5]?[0-9]:[0-5]?[0-9](:[0-5]?[0-9])?)?$/;
  function fixIosDateFormat(value) {
    if (typeof value === "string" && dateTimeReg.test(value)) {
      value = value.replace(/-/g, "/");
    }
    return value;
  }
  const _sfc_main$n = {
    props: {
      weeks: {
        type: Object,
        default() {
          return {};
        }
      },
      calendar: {
        type: Object,
        default: () => {
          return {};
        }
      },
      selected: {
        type: Array,
        default: () => {
          return [];
        }
      },
      checkHover: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      choiceDate(weeks) {
        this.$emit("change", weeks);
      },
      handleMousemove(weeks) {
        this.$emit("handleMouse", weeks);
      }
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-calendar-item__weeks-box", {
          "uni-calendar-item--disable": $props.weeks.disable,
          "uni-calendar-item--before-checked-x": $props.weeks.beforeMultiple,
          "uni-calendar-item--multiple": $props.weeks.multiple,
          "uni-calendar-item--after-checked-x": $props.weeks.afterMultiple
        }]),
        onClick: _cache[0] || (_cache[0] = ($event) => $options.choiceDate($props.weeks)),
        onMouseenter: _cache[1] || (_cache[1] = ($event) => $options.handleMousemove($props.weeks))
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-calendar-item__weeks-box-item", {
              "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && ($props.calendar.userChecked || !$props.checkHover),
              "uni-calendar-item--checked-range-text": $props.checkHover,
              "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
              "uni-calendar-item--multiple": $props.weeks.multiple,
              "uni-calendar-item--after-checked": $props.weeks.afterMultiple,
              "uni-calendar-item--disable": $props.weeks.disable
            }])
          },
          [
            $props.selected && $props.weeks.extraInfo ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "uni-calendar-item__weeks-box-circle"
            })) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "text",
              { class: "uni-calendar-item__weeks-box-text uni-calendar-item__weeks-box-text-disable uni-calendar-item--checked-text" },
              vue.toDisplayString($props.weeks.date),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass({ "uni-calendar-item--today": $props.weeks.isToday })
          },
          null,
          2
          /* CLASS */
        )
      ],
      34
      /* CLASS, NEED_HYDRATION */
    );
  }
  const calendarItem = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$m], ["__scopeId", "data-v-3c762a01"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/calendar-item.vue"]]);
  const en = {
    "uni-datetime-picker.selectDate": "select date",
    "uni-datetime-picker.selectTime": "select time",
    "uni-datetime-picker.selectDateTime": "select date and time",
    "uni-datetime-picker.startDate": "start date",
    "uni-datetime-picker.endDate": "end date",
    "uni-datetime-picker.startTime": "start time",
    "uni-datetime-picker.endTime": "end time",
    "uni-datetime-picker.ok": "ok",
    "uni-datetime-picker.clear": "clear",
    "uni-datetime-picker.cancel": "cancel",
    "uni-datetime-picker.year": "-",
    "uni-datetime-picker.month": "",
    "uni-calender.MON": "MON",
    "uni-calender.TUE": "TUE",
    "uni-calender.WED": "WED",
    "uni-calender.THU": "THU",
    "uni-calender.FRI": "FRI",
    "uni-calender.SAT": "SAT",
    "uni-calender.SUN": "SUN",
    "uni-calender.confirm": "confirm"
  };
  const zhHans = {
    "uni-datetime-picker.selectDate": "选择日期",
    "uni-datetime-picker.selectTime": "选择时间",
    "uni-datetime-picker.selectDateTime": "选择日期时间",
    "uni-datetime-picker.startDate": "开始日期",
    "uni-datetime-picker.endDate": "结束日期",
    "uni-datetime-picker.startTime": "开始时间",
    "uni-datetime-picker.endTime": "结束时间",
    "uni-datetime-picker.ok": "确定",
    "uni-datetime-picker.clear": "清除",
    "uni-datetime-picker.cancel": "取消",
    "uni-datetime-picker.year": "年",
    "uni-datetime-picker.month": "月",
    "uni-calender.SUN": "日",
    "uni-calender.MON": "一",
    "uni-calender.TUE": "二",
    "uni-calender.WED": "三",
    "uni-calender.THU": "四",
    "uni-calender.FRI": "五",
    "uni-calender.SAT": "六",
    "uni-calender.confirm": "确认"
  };
  const zhHant = {
    "uni-datetime-picker.selectDate": "選擇日期",
    "uni-datetime-picker.selectTime": "選擇時間",
    "uni-datetime-picker.selectDateTime": "選擇日期時間",
    "uni-datetime-picker.startDate": "開始日期",
    "uni-datetime-picker.endDate": "結束日期",
    "uni-datetime-picker.startTime": "開始时间",
    "uni-datetime-picker.endTime": "結束时间",
    "uni-datetime-picker.ok": "確定",
    "uni-datetime-picker.clear": "清除",
    "uni-datetime-picker.cancel": "取消",
    "uni-datetime-picker.year": "年",
    "uni-datetime-picker.month": "月",
    "uni-calender.SUN": "日",
    "uni-calender.MON": "一",
    "uni-calender.TUE": "二",
    "uni-calender.WED": "三",
    "uni-calender.THU": "四",
    "uni-calender.FRI": "五",
    "uni-calender.SAT": "六",
    "uni-calender.confirm": "確認"
  };
  const i18nMessages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  const {
    t: t$1
  } = initVueI18n(i18nMessages);
  const _sfc_main$m = {
    name: "UniDatetimePicker",
    data() {
      return {
        indicatorStyle: `height: 50px;`,
        visible: false,
        fixNvueBug: {},
        dateShow: true,
        timeShow: true,
        title: "日期和时间",
        // 输入框当前时间
        time: "",
        // 当前的年月日时分秒
        year: 1920,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        // 起始时间
        startYear: 1920,
        startMonth: 1,
        startDay: 1,
        startHour: 0,
        startMinute: 0,
        startSecond: 0,
        // 结束时间
        endYear: 2120,
        endMonth: 12,
        endDay: 31,
        endHour: 23,
        endMinute: 59,
        endSecond: 59
      };
    },
    options: {
      virtualHost: true
    },
    props: {
      type: {
        type: String,
        default: "datetime"
      },
      value: {
        type: [String, Number],
        default: ""
      },
      modelValue: {
        type: [String, Number],
        default: ""
      },
      start: {
        type: [Number, String],
        default: ""
      },
      end: {
        type: [Number, String],
        default: ""
      },
      returnType: {
        type: String,
        default: "string"
      },
      disabled: {
        type: [Boolean, String],
        default: false
      },
      border: {
        type: [Boolean, String],
        default: true
      },
      hideSecond: {
        type: [Boolean, String],
        default: false
      }
    },
    watch: {
      modelValue: {
        handler(newVal) {
          if (newVal) {
            this.parseValue(fixIosDateFormat(newVal));
            this.initTime(false);
          } else {
            this.time = "";
            this.parseValue(Date.now());
          }
        },
        immediate: true
      },
      type: {
        handler(newValue) {
          if (newValue === "date") {
            this.dateShow = true;
            this.timeShow = false;
            this.title = "日期";
          } else if (newValue === "time") {
            this.dateShow = false;
            this.timeShow = true;
            this.title = "时间";
          } else {
            this.dateShow = true;
            this.timeShow = true;
            this.title = "日期和时间";
          }
        },
        immediate: true
      },
      start: {
        handler(newVal) {
          this.parseDatetimeRange(fixIosDateFormat(newVal), "start");
        },
        immediate: true
      },
      end: {
        handler(newVal) {
          this.parseDatetimeRange(fixIosDateFormat(newVal), "end");
        },
        immediate: true
      },
      // 月、日、时、分、秒可选范围变化后，检查当前值是否在范围内，不在则当前值重置为可选范围第一项
      months(newVal) {
        this.checkValue("month", this.month, newVal);
      },
      days(newVal) {
        this.checkValue("day", this.day, newVal);
      },
      hours(newVal) {
        this.checkValue("hour", this.hour, newVal);
      },
      minutes(newVal) {
        this.checkValue("minute", this.minute, newVal);
      },
      seconds(newVal) {
        this.checkValue("second", this.second, newVal);
      }
    },
    computed: {
      // 当前年、月、日、时、分、秒选择范围
      years() {
        return this.getCurrentRange("year");
      },
      months() {
        return this.getCurrentRange("month");
      },
      days() {
        return this.getCurrentRange("day");
      },
      hours() {
        return this.getCurrentRange("hour");
      },
      minutes() {
        return this.getCurrentRange("minute");
      },
      seconds() {
        return this.getCurrentRange("second");
      },
      // picker 当前值数组
      ymd() {
        return [this.year - this.minYear, this.month - this.minMonth, this.day - this.minDay];
      },
      hms() {
        return [this.hour - this.minHour, this.minute - this.minMinute, this.second - this.minSecond];
      },
      // 当前 date 是 start
      currentDateIsStart() {
        return this.year === this.startYear && this.month === this.startMonth && this.day === this.startDay;
      },
      // 当前 date 是 end
      currentDateIsEnd() {
        return this.year === this.endYear && this.month === this.endMonth && this.day === this.endDay;
      },
      // 当前年、月、日、时、分、秒的最小值和最大值
      minYear() {
        return this.startYear;
      },
      maxYear() {
        return this.endYear;
      },
      minMonth() {
        if (this.year === this.startYear) {
          return this.startMonth;
        } else {
          return 1;
        }
      },
      maxMonth() {
        if (this.year === this.endYear) {
          return this.endMonth;
        } else {
          return 12;
        }
      },
      minDay() {
        if (this.year === this.startYear && this.month === this.startMonth) {
          return this.startDay;
        } else {
          return 1;
        }
      },
      maxDay() {
        if (this.year === this.endYear && this.month === this.endMonth) {
          return this.endDay;
        } else {
          return this.daysInMonth(this.year, this.month);
        }
      },
      minHour() {
        if (this.type === "datetime") {
          if (this.currentDateIsStart) {
            return this.startHour;
          } else {
            return 0;
          }
        }
        if (this.type === "time") {
          return this.startHour;
        }
      },
      maxHour() {
        if (this.type === "datetime") {
          if (this.currentDateIsEnd) {
            return this.endHour;
          } else {
            return 23;
          }
        }
        if (this.type === "time") {
          return this.endHour;
        }
      },
      minMinute() {
        if (this.type === "datetime") {
          if (this.currentDateIsStart && this.hour === this.startHour) {
            return this.startMinute;
          } else {
            return 0;
          }
        }
        if (this.type === "time") {
          if (this.hour === this.startHour) {
            return this.startMinute;
          } else {
            return 0;
          }
        }
      },
      maxMinute() {
        if (this.type === "datetime") {
          if (this.currentDateIsEnd && this.hour === this.endHour) {
            return this.endMinute;
          } else {
            return 59;
          }
        }
        if (this.type === "time") {
          if (this.hour === this.endHour) {
            return this.endMinute;
          } else {
            return 59;
          }
        }
      },
      minSecond() {
        if (this.type === "datetime") {
          if (this.currentDateIsStart && this.hour === this.startHour && this.minute === this.startMinute) {
            return this.startSecond;
          } else {
            return 0;
          }
        }
        if (this.type === "time") {
          if (this.hour === this.startHour && this.minute === this.startMinute) {
            return this.startSecond;
          } else {
            return 0;
          }
        }
      },
      maxSecond() {
        if (this.type === "datetime") {
          if (this.currentDateIsEnd && this.hour === this.endHour && this.minute === this.endMinute) {
            return this.endSecond;
          } else {
            return 59;
          }
        }
        if (this.type === "time") {
          if (this.hour === this.endHour && this.minute === this.endMinute) {
            return this.endSecond;
          } else {
            return 59;
          }
        }
      },
      /**
       * for i18n
       */
      selectTimeText() {
        return t$1("uni-datetime-picker.selectTime");
      },
      okText() {
        return t$1("uni-datetime-picker.ok");
      },
      clearText() {
        return t$1("uni-datetime-picker.clear");
      },
      cancelText() {
        return t$1("uni-datetime-picker.cancel");
      }
    },
    mounted() {
    },
    methods: {
      /**
       * @param {Object} item
       * 小于 10 在前面加个 0
       */
      lessThanTen(item) {
        return item < 10 ? "0" + item : item;
      },
      /**
       * 解析时分秒字符串，例如：00:00:00
       * @param {String} timeString
       */
      parseTimeType(timeString) {
        if (timeString) {
          let timeArr = timeString.split(":");
          this.hour = Number(timeArr[0]);
          this.minute = Number(timeArr[1]);
          this.second = Number(timeArr[2]);
        }
      },
      /**
       * 解析选择器初始值，类型可以是字符串、时间戳，例如：2000-10-02、'08:30:00'、 1610695109000
       * @param {String | Number} datetime
       */
      initPickerValue(datetime) {
        let defaultValue = null;
        if (datetime) {
          defaultValue = this.compareValueWithStartAndEnd(datetime, this.start, this.end);
        } else {
          defaultValue = Date.now();
          defaultValue = this.compareValueWithStartAndEnd(defaultValue, this.start, this.end);
        }
        this.parseValue(defaultValue);
      },
      /**
       * 初始值规则：
       * - 用户设置初始值 value
       * 	- 设置了起始时间 start、终止时间 end，并 start < value < end，初始值为 value， 否则初始值为 start
       * 	- 只设置了起始时间 start，并 start < value，初始值为 value，否则初始值为 start
       * 	- 只设置了终止时间 end，并 value < end，初始值为 value，否则初始值为 end
       * 	- 无起始终止时间，则初始值为 value
       * - 无初始值 value，则初始值为当前本地时间 Date.now()
       * @param {Object} value
       * @param {Object} dateBase
       */
      compareValueWithStartAndEnd(value, start, end) {
        let winner = null;
        value = this.superTimeStamp(value);
        start = this.superTimeStamp(start);
        end = this.superTimeStamp(end);
        if (start && end) {
          if (value < start) {
            winner = new Date(start);
          } else if (value > end) {
            winner = new Date(end);
          } else {
            winner = new Date(value);
          }
        } else if (start && !end) {
          winner = start <= value ? new Date(value) : new Date(start);
        } else if (!start && end) {
          winner = value <= end ? new Date(value) : new Date(end);
        } else {
          winner = new Date(value);
        }
        return winner;
      },
      /**
       * 转换为可比较的时间戳，接受日期、时分秒、时间戳
       * @param {Object} value
       */
      superTimeStamp(value) {
        let dateBase = "";
        if (this.type === "time" && value && typeof value === "string") {
          const now = /* @__PURE__ */ new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const day = now.getDate();
          dateBase = year + "/" + month + "/" + day + " ";
        }
        if (Number(value)) {
          value = parseInt(value);
          dateBase = 0;
        }
        return this.createTimeStamp(dateBase + value);
      },
      /**
       * 解析默认值 value，字符串、时间戳
       * @param {Object} defaultTime
       */
      parseValue(value) {
        if (!value) {
          return;
        }
        if (this.type === "time" && typeof value === "string") {
          this.parseTimeType(value);
        } else {
          let defaultDate = null;
          defaultDate = new Date(value);
          if (this.type !== "time") {
            this.year = defaultDate.getFullYear();
            this.month = defaultDate.getMonth() + 1;
            this.day = defaultDate.getDate();
          }
          if (this.type !== "date") {
            this.hour = defaultDate.getHours();
            this.minute = defaultDate.getMinutes();
            this.second = defaultDate.getSeconds();
          }
        }
        if (this.hideSecond) {
          this.second = 0;
        }
      },
      /**
       * 解析可选择时间范围 start、end，年月日字符串、时间戳
       * @param {Object} defaultTime
       */
      parseDatetimeRange(point, pointType) {
        if (!point) {
          if (pointType === "start") {
            this.startYear = 1920;
            this.startMonth = 1;
            this.startDay = 1;
            this.startHour = 0;
            this.startMinute = 0;
            this.startSecond = 0;
          }
          if (pointType === "end") {
            this.endYear = 2120;
            this.endMonth = 12;
            this.endDay = 31;
            this.endHour = 23;
            this.endMinute = 59;
            this.endSecond = 59;
          }
          return;
        }
        if (this.type === "time") {
          const pointArr = point.split(":");
          this[pointType + "Hour"] = Number(pointArr[0]);
          this[pointType + "Minute"] = Number(pointArr[1]);
          this[pointType + "Second"] = Number(pointArr[2]);
        } else {
          if (!point) {
            pointType === "start" ? this.startYear = this.year - 60 : this.endYear = this.year + 60;
            return;
          }
          if (Number(point)) {
            point = parseInt(point);
          }
          const hasTime = /[0-9]:[0-9]/;
          if (this.type === "datetime" && pointType === "end" && typeof point === "string" && !hasTime.test(
            point
          )) {
            point = point + " 23:59:59";
          }
          const pointDate = new Date(point);
          this[pointType + "Year"] = pointDate.getFullYear();
          this[pointType + "Month"] = pointDate.getMonth() + 1;
          this[pointType + "Day"] = pointDate.getDate();
          if (this.type === "datetime") {
            this[pointType + "Hour"] = pointDate.getHours();
            this[pointType + "Minute"] = pointDate.getMinutes();
            this[pointType + "Second"] = pointDate.getSeconds();
          }
        }
      },
      // 获取 年、月、日、时、分、秒 当前可选范围
      getCurrentRange(value) {
        const range = [];
        for (let i = this["min" + this.capitalize(value)]; i <= this["max" + this.capitalize(value)]; i++) {
          range.push(i);
        }
        return range;
      },
      // 字符串首字母大写
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
      // 检查当前值是否在范围内，不在则当前值重置为可选范围第一项
      checkValue(name, value, values) {
        if (values.indexOf(value) === -1) {
          this[name] = values[0];
        }
      },
      // 每个月的实际天数
      daysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
      },
      /**
       * 生成时间戳
       * @param {Object} time
       */
      createTimeStamp(time) {
        if (!time)
          return;
        if (typeof time === "number") {
          return time;
        } else {
          time = time.replace(/-/g, "/");
          if (this.type === "date") {
            time = time + " 00:00:00";
          }
          return Date.parse(time);
        }
      },
      /**
       * 生成日期或时间的字符串
       */
      createDomSting() {
        const yymmdd = this.year + "-" + this.lessThanTen(this.month) + "-" + this.lessThanTen(this.day);
        let hhmmss = this.lessThanTen(this.hour) + ":" + this.lessThanTen(this.minute);
        if (!this.hideSecond) {
          hhmmss = hhmmss + ":" + this.lessThanTen(this.second);
        }
        if (this.type === "date") {
          return yymmdd;
        } else if (this.type === "time") {
          return hhmmss;
        } else {
          return yymmdd + " " + hhmmss;
        }
      },
      /**
       * 初始化返回值，并抛出 change 事件
       */
      initTime(emit = true) {
        this.time = this.createDomSting();
        if (!emit)
          return;
        if (this.returnType === "timestamp" && this.type !== "time") {
          this.$emit("change", this.createTimeStamp(this.time));
          this.$emit("input", this.createTimeStamp(this.time));
          this.$emit("update:modelValue", this.createTimeStamp(this.time));
        } else {
          this.$emit("change", this.time);
          this.$emit("input", this.time);
          this.$emit("update:modelValue", this.time);
        }
      },
      /**
       * 用户选择日期或时间更新 data
       * @param {Object} e
       */
      bindDateChange(e) {
        const val = e.detail.value;
        this.year = this.years[val[0]];
        this.month = this.months[val[1]];
        this.day = this.days[val[2]];
      },
      bindTimeChange(e) {
        const val = e.detail.value;
        this.hour = this.hours[val[0]];
        this.minute = this.minutes[val[1]];
        this.second = this.seconds[val[2]];
      },
      /**
       * 初始化弹出层
       */
      initTimePicker() {
        if (this.disabled)
          return;
        const value = fixIosDateFormat(this.time);
        this.initPickerValue(value);
        this.visible = !this.visible;
      },
      /**
       * 触发或关闭弹框
       */
      tiggerTimePicker(e) {
        this.visible = !this.visible;
      },
      /**
       * 用户点击“清空”按钮，清空当前值
       */
      clearTime() {
        this.time = "";
        this.$emit("change", this.time);
        this.$emit("input", this.time);
        this.$emit("update:modelValue", this.time);
        this.tiggerTimePicker();
      },
      /**
       * 用户点击“确定”按钮
       */
      setTime() {
        this.initTime();
        this.tiggerTimePicker();
      }
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-datetime-picker" }, [
      vue.createElementVNode("view", {
        onClick: _cache[0] || (_cache[0] = (...args) => $options.initTimePicker && $options.initTimePicker(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-datetime-picker-timebox-pointer", { "uni-datetime-picker-disabled": $props.disabled, "uni-datetime-picker-timebox": $props.border }])
            },
            [
              vue.createElementVNode(
                "text",
                { class: "uni-datetime-picker-text" },
                vue.toDisplayString($data.time),
                1
                /* TEXT */
              ),
              !$data.time ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-datetime-picker-time"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-datetime-picker-text" },
                  vue.toDisplayString($options.selectTimeText),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )
        ], true)
      ]),
      $data.visible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        id: "mask",
        class: "uni-datetime-picker-mask",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.tiggerTimePicker && $options.tiggerTimePicker(...args))
      })) : vue.createCommentVNode("v-if", true),
      $data.visible ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          class: vue.normalizeClass(["uni-datetime-picker-popup", [$data.dateShow && $data.timeShow ? "" : "fix-nvue-height"]]),
          style: vue.normalizeStyle($data.fixNvueBug)
        },
        [
          vue.createElementVNode("view", { class: "uni-title" }, [
            vue.createElementVNode(
              "text",
              { class: "uni-datetime-picker-text" },
              vue.toDisplayString($options.selectTimeText),
              1
              /* TEXT */
            )
          ]),
          $data.dateShow ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-datetime-picker__container-box"
          }, [
            vue.createElementVNode("picker-view", {
              class: "uni-datetime-picker-view",
              "indicator-style": $data.indicatorStyle,
              value: $options.ymd,
              onChange: _cache[2] || (_cache[2] = (...args) => $options.bindDateChange && $options.bindDateChange(...args))
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.years, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.months, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.days, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ], 40, ["indicator-style", "value"]),
            vue.createCommentVNode(" 兼容 nvue 不支持伪类 "),
            vue.createElementVNode("text", { class: "uni-datetime-picker-sign sign-left" }, "-"),
            vue.createElementVNode("text", { class: "uni-datetime-picker-sign sign-right" }, "-")
          ])) : vue.createCommentVNode("v-if", true),
          $data.timeShow ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "uni-datetime-picker__container-box"
          }, [
            vue.createElementVNode("picker-view", {
              class: vue.normalizeClass(["uni-datetime-picker-view", [$props.hideSecond ? "time-hide-second" : ""]]),
              "indicator-style": $data.indicatorStyle,
              value: $options.hms,
              onChange: _cache[3] || (_cache[3] = (...args) => $options.bindTimeChange && $options.bindTimeChange(...args))
            }, [
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.hours, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("picker-view-column", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.minutes, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              !$props.hideSecond ? (vue.openBlock(), vue.createElementBlock("picker-view-column", { key: 0 }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($options.seconds, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "uni-datetime-picker-item",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "uni-datetime-picker-item" },
                        vue.toDisplayString($options.lessThanTen(item)),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true)
            ], 42, ["indicator-style", "value"]),
            vue.createCommentVNode(" 兼容 nvue 不支持伪类 "),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["uni-datetime-picker-sign", [$props.hideSecond ? "sign-center" : "sign-left"]])
              },
              ":",
              2
              /* CLASS */
            ),
            !$props.hideSecond ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "uni-datetime-picker-sign sign-right"
            }, ":")) : vue.createCommentVNode("v-if", true)
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "uni-datetime-picker-btn" }, [
            vue.createElementVNode("view", {
              onClick: _cache[4] || (_cache[4] = (...args) => $options.clearTime && $options.clearTime(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-datetime-picker-btn-text" },
                vue.toDisplayString($options.clearText),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "uni-datetime-picker-btn-group" }, [
              vue.createElementVNode("view", {
                class: "uni-datetime-picker-cancel",
                onClick: _cache[5] || (_cache[5] = (...args) => $options.tiggerTimePicker && $options.tiggerTimePicker(...args))
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-datetime-picker-btn-text" },
                  vue.toDisplayString($options.cancelText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                onClick: _cache[6] || (_cache[6] = (...args) => $options.setTime && $options.setTime(...args))
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-datetime-picker-btn-text" },
                  vue.toDisplayString($options.okText),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ],
        6
        /* CLASS, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const TimePicker = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$l], ["__scopeId", "data-v-1d532b70"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/time-picker.vue"]]);
  const {
    t
  } = initVueI18n(i18nMessages);
  const _sfc_main$l = {
    components: {
      calendarItem,
      timePicker: TimePicker
    },
    options: {
      virtualHost: true
    },
    props: {
      date: {
        type: String,
        default: ""
      },
      defTime: {
        type: [String, Object],
        default: ""
      },
      selectableTimes: {
        type: [Object],
        default() {
          return {};
        }
      },
      selected: {
        type: Array,
        default() {
          return [];
        }
      },
      startDate: {
        type: String,
        default: ""
      },
      endDate: {
        type: String,
        default: ""
      },
      startPlaceholder: {
        type: String,
        default: ""
      },
      endPlaceholder: {
        type: String,
        default: ""
      },
      range: {
        type: Boolean,
        default: false
      },
      hasTime: {
        type: Boolean,
        default: false
      },
      insert: {
        type: Boolean,
        default: true
      },
      showMonth: {
        type: Boolean,
        default: true
      },
      clearDate: {
        type: Boolean,
        default: true
      },
      checkHover: {
        type: Boolean,
        default: true
      },
      hideSecond: {
        type: [Boolean],
        default: false
      },
      pleStatus: {
        type: Object,
        default() {
          return {
            before: "",
            after: "",
            data: [],
            fulldate: ""
          };
        }
      },
      defaultValue: {
        type: [String, Object, Array],
        default: ""
      }
    },
    data() {
      return {
        show: false,
        weeks: [],
        calendar: {},
        nowDate: {},
        aniMaskShow: false,
        firstEnter: true,
        time: "",
        timeRange: {
          startTime: "",
          endTime: ""
        },
        tempSingleDate: "",
        tempRange: {
          before: "",
          after: ""
        }
      };
    },
    watch: {
      date: {
        immediate: true,
        handler(newVal) {
          if (!this.range) {
            this.tempSingleDate = newVal;
            setTimeout(() => {
              this.init(newVal);
            }, 100);
          }
        }
      },
      defTime: {
        immediate: true,
        handler(newVal) {
          if (!this.range) {
            this.time = newVal;
          } else {
            this.timeRange.startTime = newVal.start;
            this.timeRange.endTime = newVal.end;
          }
        }
      },
      startDate(val) {
        if (!this.cale) {
          return;
        }
        this.cale.setStartDate(val);
        this.cale.setDate(this.nowDate.fullDate);
        this.weeks = this.cale.weeks;
      },
      endDate(val) {
        if (!this.cale) {
          return;
        }
        this.cale.setEndDate(val);
        this.cale.setDate(this.nowDate.fullDate);
        this.weeks = this.cale.weeks;
      },
      selected(newVal) {
        if (!this.cale) {
          return;
        }
        this.cale.setSelectInfo(this.nowDate.fullDate, newVal);
        this.weeks = this.cale.weeks;
      },
      pleStatus: {
        immediate: true,
        handler(newVal) {
          const {
            before,
            after,
            fulldate,
            which
          } = newVal;
          this.tempRange.before = before;
          this.tempRange.after = after;
          setTimeout(() => {
            if (fulldate) {
              this.cale.setHoverMultiple(fulldate);
              if (before && after) {
                this.cale.lastHover = true;
                if (this.rangeWithinMonth(after, before))
                  return;
                this.setDate(before);
              } else {
                this.cale.setMultiple(fulldate);
                this.setDate(this.nowDate.fullDate);
                this.calendar.fullDate = "";
                this.cale.lastHover = false;
              }
            } else {
              if (!this.cale) {
                return;
              }
              this.cale.setDefaultMultiple(before, after);
              if (which === "left" && before) {
                this.setDate(before);
                this.weeks = this.cale.weeks;
              } else if (after) {
                this.setDate(after);
                this.weeks = this.cale.weeks;
              }
              this.cale.lastHover = true;
            }
          }, 16);
        }
      }
    },
    computed: {
      timepickerStartTime() {
        const activeDate = this.range ? this.tempRange.before : this.calendar.fullDate;
        return activeDate === this.startDate ? this.selectableTimes.start : "";
      },
      timepickerEndTime() {
        const activeDate = this.range ? this.tempRange.after : this.calendar.fullDate;
        return activeDate === this.endDate ? this.selectableTimes.end : "";
      },
      /**
       * for i18n
       */
      selectDateText() {
        return t("uni-datetime-picker.selectDate");
      },
      startDateText() {
        return this.startPlaceholder || t("uni-datetime-picker.startDate");
      },
      endDateText() {
        return this.endPlaceholder || t("uni-datetime-picker.endDate");
      },
      okText() {
        return t("uni-datetime-picker.ok");
      },
      yearText() {
        return t("uni-datetime-picker.year");
      },
      monthText() {
        return t("uni-datetime-picker.month");
      },
      MONText() {
        return t("uni-calender.MON");
      },
      TUEText() {
        return t("uni-calender.TUE");
      },
      WEDText() {
        return t("uni-calender.WED");
      },
      THUText() {
        return t("uni-calender.THU");
      },
      FRIText() {
        return t("uni-calender.FRI");
      },
      SATText() {
        return t("uni-calender.SAT");
      },
      SUNText() {
        return t("uni-calender.SUN");
      },
      confirmText() {
        return t("uni-calender.confirm");
      }
    },
    created() {
      this.cale = new Calendar$1({
        selected: this.selected,
        startDate: this.startDate,
        endDate: this.endDate,
        range: this.range
      });
      this.init(this.date);
    },
    methods: {
      leaveCale() {
        this.firstEnter = true;
      },
      handleMouse(weeks) {
        if (weeks.disable)
          return;
        if (this.cale.lastHover)
          return;
        let {
          before,
          after
        } = this.cale.multipleStatus;
        if (!before)
          return;
        this.calendar = weeks;
        this.cale.setHoverMultiple(this.calendar.fullDate);
        this.weeks = this.cale.weeks;
        if (this.firstEnter) {
          this.$emit("firstEnterCale", this.cale.multipleStatus);
          this.firstEnter = false;
        }
      },
      rangeWithinMonth(A, B) {
        const [yearA, monthA] = A.split("-");
        const [yearB, monthB] = B.split("-");
        return yearA === yearB && monthA === monthB;
      },
      // 蒙版点击事件
      maskClick() {
        this.close();
        this.$emit("maskClose");
      },
      clearCalender() {
        if (this.range) {
          this.timeRange.startTime = "";
          this.timeRange.endTime = "";
          this.tempRange.before = "";
          this.tempRange.after = "";
          this.cale.multipleStatus.before = "";
          this.cale.multipleStatus.after = "";
          this.cale.multipleStatus.data = [];
          this.cale.lastHover = false;
        } else {
          this.time = "";
          this.tempSingleDate = "";
        }
        this.calendar.fullDate = "";
        this.setDate(/* @__PURE__ */ new Date());
      },
      bindDateChange(e) {
        const value = e.detail.value + "-1";
        this.setDate(value);
      },
      /**
       * 初始化日期显示
       * @param {Object} date
       */
      init(date) {
        if (!this.cale) {
          return;
        }
        this.cale.setDate(date || /* @__PURE__ */ new Date());
        this.weeks = this.cale.weeks;
        this.nowDate = this.cale.getInfo(date);
        this.calendar = {
          ...this.nowDate
        };
        if (!date) {
          this.calendar.fullDate = "";
          if (this.defaultValue && !this.range) {
            const defaultDate = new Date(this.defaultValue);
            const fullDate = getDate(defaultDate);
            const year = defaultDate.getFullYear();
            const month = defaultDate.getMonth() + 1;
            const date2 = defaultDate.getDate();
            const day = defaultDate.getDay();
            this.calendar = {
              fullDate,
              year,
              month,
              date: date2,
              day
            }, this.tempSingleDate = fullDate;
            this.time = getTime(defaultDate, this.hideSecond);
          }
        }
      },
      /**
       * 打开日历弹窗
       */
      open() {
        if (this.clearDate && !this.insert) {
          this.cale.cleanMultipleStatus();
          this.init(this.date);
        }
        this.show = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.aniMaskShow = true;
          }, 50);
        });
      },
      /**
       * 关闭日历弹窗
       */
      close() {
        this.aniMaskShow = false;
        this.$nextTick(() => {
          setTimeout(() => {
            this.show = false;
            this.$emit("close");
          }, 300);
        });
      },
      /**
       * 确认按钮
       */
      confirm() {
        this.setEmit("confirm");
        this.close();
      },
      /**
       * 变化触发
       */
      change(isSingleChange) {
        if (!this.insert && !isSingleChange)
          return;
        this.setEmit("change");
      },
      /**
       * 选择月份触发
       */
      monthSwitch() {
        let {
          year,
          month
        } = this.nowDate;
        this.$emit("monthSwitch", {
          year,
          month: Number(month)
        });
      },
      /**
       * 派发事件
       * @param {Object} name
       */
      setEmit(name) {
        if (!this.range) {
          if (!this.calendar.fullDate) {
            this.calendar = this.cale.getInfo(/* @__PURE__ */ new Date());
            this.tempSingleDate = this.calendar.fullDate;
          }
          if (this.hasTime && !this.time) {
            this.time = getTime(/* @__PURE__ */ new Date(), this.hideSecond);
          }
        }
        let {
          year,
          month,
          date,
          fullDate,
          extraInfo
        } = this.calendar;
        this.$emit(name, {
          range: this.cale.multipleStatus,
          year,
          month,
          date,
          time: this.time,
          timeRange: this.timeRange,
          fulldate: fullDate,
          extraInfo: extraInfo || {}
        });
      },
      /**
       * 选择天触发
       * @param {Object} weeks
       */
      choiceDate(weeks) {
        if (weeks.disable)
          return;
        this.calendar = weeks;
        this.calendar.userChecked = true;
        this.cale.setMultiple(this.calendar.fullDate, true);
        this.weeks = this.cale.weeks;
        this.tempSingleDate = this.calendar.fullDate;
        const beforeDate = new Date(this.cale.multipleStatus.before).getTime();
        const afterDate = new Date(this.cale.multipleStatus.after).getTime();
        if (beforeDate > afterDate && afterDate) {
          this.tempRange.before = this.cale.multipleStatus.after;
          this.tempRange.after = this.cale.multipleStatus.before;
        } else {
          this.tempRange.before = this.cale.multipleStatus.before;
          this.tempRange.after = this.cale.multipleStatus.after;
        }
        this.change(true);
      },
      changeMonth(type) {
        let newDate;
        if (type === "pre") {
          newDate = this.cale.getPreMonthObj(this.nowDate.fullDate).fullDate;
        } else if (type === "next") {
          newDate = this.cale.getNextMonthObj(this.nowDate.fullDate).fullDate;
        }
        this.setDate(newDate);
        this.monthSwitch();
      },
      /**
       * 设置日期
       * @param {Object} date
       */
      setDate(date) {
        this.cale.setDate(date);
        this.weeks = this.cale.weeks;
        this.nowDate = this.cale.getInfo(date);
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_calendar_item = vue.resolveComponent("calendar-item");
    const _component_time_picker = vue.resolveComponent("time-picker");
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "uni-calendar",
        onMouseleave: _cache[9] || (_cache[9] = (...args) => $options.leaveCale && $options.leaveCale(...args))
      },
      [
        !$props.insert && $data.show ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["uni-calendar__mask", { "uni-calendar--mask-show": $data.aniMaskShow }]),
            onClick: _cache[0] || (_cache[0] = (...args) => $options.maskClick && $options.maskClick(...args))
          },
          null,
          2
          /* CLASS */
        )) : vue.createCommentVNode("v-if", true),
        $props.insert || $data.show ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: vue.normalizeClass(["uni-calendar__content", { "uni-calendar--fixed": !$props.insert, "uni-calendar--ani-show": $data.aniMaskShow, "uni-calendar__content-mobile": $data.aniMaskShow }])
          },
          [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["uni-calendar__header", { "uni-calendar__header-mobile": !$props.insert }])
              },
              [
                vue.createElementVNode("view", {
                  class: "uni-calendar__header-btn-box",
                  onClick: _cache[1] || (_cache[1] = vue.withModifiers(($event) => $options.changeMonth("pre"), ["stop"]))
                }, [
                  vue.createElementVNode("view", { class: "uni-calendar__header-btn uni-calendar--left" })
                ]),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $props.date,
                  fields: "month",
                  onChange: _cache[2] || (_cache[2] = (...args) => $options.bindDateChange && $options.bindDateChange(...args))
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__header-text" },
                    vue.toDisplayString(($data.nowDate.year || "") + $options.yearText + ($data.nowDate.month || "") + $options.monthText),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"]),
                vue.createElementVNode("view", {
                  class: "uni-calendar__header-btn-box",
                  onClick: _cache[3] || (_cache[3] = vue.withModifiers(($event) => $options.changeMonth("next"), ["stop"]))
                }, [
                  vue.createElementVNode("view", { class: "uni-calendar__header-btn uni-calendar--right" })
                ]),
                !$props.insert ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "dialog-close",
                  onClick: _cache[4] || (_cache[4] = (...args) => $options.maskClick && $options.maskClick(...args))
                }, [
                  vue.createElementVNode("view", {
                    class: "dialog-close-plus",
                    "data-id": "close"
                  }),
                  vue.createElementVNode("view", {
                    class: "dialog-close-plus dialog-close-rotate",
                    "data-id": "close"
                  })
                ])) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode("view", { class: "uni-calendar__box" }, [
              $props.showMonth ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-calendar__box-bg"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__box-bg-text" },
                  vue.toDisplayString($data.nowDate.month),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", {
                class: "uni-calendar__weeks",
                style: { "padding-bottom": "7px" }
              }, [
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.SUNText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.MONText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.TUEText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.WEDText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.THUText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.FRIText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "uni-calendar__weeks-day-text" },
                    vue.toDisplayString($options.SATText),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.weeks, (item, weekIndex) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "uni-calendar__weeks",
                    key: weekIndex
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(item, (weeks, weeksIndex) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: "uni-calendar__weeks-item",
                          key: weeksIndex
                        }, [
                          vue.createVNode(_component_calendar_item, {
                            class: "uni-calendar-item--hook",
                            weeks,
                            calendar: $data.calendar,
                            selected: $props.selected,
                            checkHover: $props.range,
                            onChange: $options.choiceDate,
                            onHandleMouse: $options.handleMouse
                          }, null, 8, ["weeks", "calendar", "selected", "checkHover", "onChange", "onHandleMouse"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            !$props.insert && !$props.range && $props.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "uni-date-changed uni-calendar--fixed-top",
              style: { "padding": "0 80px" }
            }, [
              vue.createElementVNode(
                "view",
                { class: "uni-date-changed--time-date" },
                vue.toDisplayString($data.tempSingleDate ? $data.tempSingleDate : $options.selectDateText),
                1
                /* TEXT */
              ),
              vue.createVNode(_component_time_picker, {
                type: "time",
                start: $options.timepickerStartTime,
                end: $options.timepickerEndTime,
                modelValue: $data.time,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.time = $event),
                disabled: !$data.tempSingleDate,
                border: false,
                "hide-second": $props.hideSecond,
                class: "time-picker-style"
              }, null, 8, ["start", "end", "modelValue", "disabled", "hide-second"])
            ])) : vue.createCommentVNode("v-if", true),
            !$props.insert && $props.range && $props.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "uni-date-changed uni-calendar--fixed-top"
            }, [
              vue.createElementVNode("view", { class: "uni-date-changed--time-start" }, [
                vue.createElementVNode(
                  "view",
                  { class: "uni-date-changed--time-date" },
                  vue.toDisplayString($data.tempRange.before ? $data.tempRange.before : $options.startDateText),
                  1
                  /* TEXT */
                ),
                vue.createVNode(_component_time_picker, {
                  type: "time",
                  start: $options.timepickerStartTime,
                  modelValue: $data.timeRange.startTime,
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.timeRange.startTime = $event),
                  border: false,
                  "hide-second": $props.hideSecond,
                  disabled: !$data.tempRange.before,
                  class: "time-picker-style"
                }, null, 8, ["start", "modelValue", "hide-second", "disabled"])
              ]),
              vue.createElementVNode("view", { style: { "line-height": "50px" } }, [
                vue.createVNode(_component_uni_icons, {
                  type: "arrowthinright",
                  color: "#999"
                })
              ]),
              vue.createElementVNode("view", { class: "uni-date-changed--time-end" }, [
                vue.createElementVNode(
                  "view",
                  { class: "uni-date-changed--time-date" },
                  vue.toDisplayString($data.tempRange.after ? $data.tempRange.after : $options.endDateText),
                  1
                  /* TEXT */
                ),
                vue.createVNode(_component_time_picker, {
                  type: "time",
                  end: $options.timepickerEndTime,
                  modelValue: $data.timeRange.endTime,
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.timeRange.endTime = $event),
                  border: false,
                  "hide-second": $props.hideSecond,
                  disabled: !$data.tempRange.after,
                  class: "time-picker-style"
                }, null, 8, ["end", "modelValue", "hide-second", "disabled"])
              ])
            ])) : vue.createCommentVNode("v-if", true),
            !$props.insert ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "uni-date-changed uni-date-btn--ok"
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: "uni-datetime-picker--btn",
                  onClick: _cache[8] || (_cache[8] = (...args) => $options.confirm && $options.confirm(...args))
                },
                vue.toDisplayString($options.confirmText),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )) : vue.createCommentVNode("v-if", true)
      ],
      32
      /* NEED_HYDRATION */
    );
  }
  const Calendar = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-1d379219"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/calendar.vue"]]);
  const _sfc_main$k = {
    name: "UniDatetimePicker",
    options: {
      virtualHost: true
    },
    components: {
      Calendar,
      TimePicker
    },
    data() {
      return {
        isRange: false,
        hasTime: false,
        displayValue: "",
        inputDate: "",
        calendarDate: "",
        pickerTime: "",
        calendarRange: {
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        },
        displayRangeValue: {
          startDate: "",
          endDate: ""
        },
        tempRange: {
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        },
        // 左右日历同步数据
        startMultipleStatus: {
          before: "",
          after: "",
          data: [],
          fulldate: ""
        },
        endMultipleStatus: {
          before: "",
          after: "",
          data: [],
          fulldate: ""
        },
        pickerVisible: false,
        pickerPositionStyle: null,
        isEmitValue: false,
        isPhone: false,
        isFirstShow: true,
        i18nT: () => {
        }
      };
    },
    props: {
      type: {
        type: String,
        default: "datetime"
      },
      value: {
        type: [String, Number, Array, Date],
        default: ""
      },
      modelValue: {
        type: [String, Number, Array, Date],
        default: ""
      },
      start: {
        type: [Number, String],
        default: ""
      },
      end: {
        type: [Number, String],
        default: ""
      },
      returnType: {
        type: String,
        default: "string"
      },
      placeholder: {
        type: String,
        default: ""
      },
      startPlaceholder: {
        type: String,
        default: ""
      },
      endPlaceholder: {
        type: String,
        default: ""
      },
      rangeSeparator: {
        type: String,
        default: "-"
      },
      border: {
        type: [Boolean],
        default: true
      },
      disabled: {
        type: [Boolean],
        default: false
      },
      clearIcon: {
        type: [Boolean],
        default: true
      },
      hideSecond: {
        type: [Boolean],
        default: false
      },
      defaultValue: {
        type: [String, Object, Array],
        default: ""
      }
    },
    watch: {
      type: {
        immediate: true,
        handler(newVal) {
          this.hasTime = newVal.indexOf("time") !== -1;
          this.isRange = newVal.indexOf("range") !== -1;
        }
      },
      modelValue: {
        immediate: true,
        handler(newVal) {
          if (this.isEmitValue) {
            this.isEmitValue = false;
            return;
          }
          this.initPicker(newVal);
        }
      },
      start: {
        immediate: true,
        handler(newVal) {
          if (!newVal)
            return;
          this.calendarRange.startDate = getDate(newVal);
          if (this.hasTime) {
            this.calendarRange.startTime = getTime(newVal);
          }
        }
      },
      end: {
        immediate: true,
        handler(newVal) {
          if (!newVal)
            return;
          this.calendarRange.endDate = getDate(newVal);
          if (this.hasTime) {
            this.calendarRange.endTime = getTime(newVal, this.hideSecond);
          }
        }
      }
    },
    computed: {
      timepickerStartTime() {
        const activeDate = this.isRange ? this.tempRange.startDate : this.inputDate;
        return activeDate === this.calendarRange.startDate ? this.calendarRange.startTime : "";
      },
      timepickerEndTime() {
        const activeDate = this.isRange ? this.tempRange.endDate : this.inputDate;
        return activeDate === this.calendarRange.endDate ? this.calendarRange.endTime : "";
      },
      mobileCalendarTime() {
        const timeRange = {
          start: this.tempRange.startTime,
          end: this.tempRange.endTime
        };
        return this.isRange ? timeRange : this.pickerTime;
      },
      mobSelectableTime() {
        return {
          start: this.calendarRange.startTime,
          end: this.calendarRange.endTime
        };
      },
      datePopupWidth() {
        return this.isRange ? 653 : 301;
      },
      /**
       * for i18n
       */
      singlePlaceholderText() {
        return this.placeholder || (this.type === "date" ? this.selectDateText : this.selectDateTimeText);
      },
      startPlaceholderText() {
        return this.startPlaceholder || this.startDateText;
      },
      endPlaceholderText() {
        return this.endPlaceholder || this.endDateText;
      },
      selectDateText() {
        return this.i18nT("uni-datetime-picker.selectDate");
      },
      selectDateTimeText() {
        return this.i18nT("uni-datetime-picker.selectDateTime");
      },
      selectTimeText() {
        return this.i18nT("uni-datetime-picker.selectTime");
      },
      startDateText() {
        return this.startPlaceholder || this.i18nT("uni-datetime-picker.startDate");
      },
      startTimeText() {
        return this.i18nT("uni-datetime-picker.startTime");
      },
      endDateText() {
        return this.endPlaceholder || this.i18nT("uni-datetime-picker.endDate");
      },
      endTimeText() {
        return this.i18nT("uni-datetime-picker.endTime");
      },
      okText() {
        return this.i18nT("uni-datetime-picker.ok");
      },
      clearText() {
        return this.i18nT("uni-datetime-picker.clear");
      },
      showClearIcon() {
        return this.clearIcon && !this.disabled && (this.displayValue || this.displayRangeValue.startDate && this.displayRangeValue.endDate);
      }
    },
    created() {
      this.initI18nT();
      this.platform();
    },
    methods: {
      initI18nT() {
        const vueI18n = initVueI18n(i18nMessages);
        this.i18nT = vueI18n.t;
      },
      initPicker(newVal) {
        if (!newVal && !this.defaultValue || Array.isArray(newVal) && !newVal.length) {
          this.$nextTick(() => {
            this.clear(false);
          });
          return;
        }
        if (!Array.isArray(newVal) && !this.isRange) {
          if (newVal) {
            this.displayValue = this.inputDate = this.calendarDate = getDate(newVal);
            if (this.hasTime) {
              this.pickerTime = getTime(newVal, this.hideSecond);
              this.displayValue = `${this.displayValue} ${this.pickerTime}`;
            }
          } else if (this.defaultValue) {
            this.inputDate = this.calendarDate = getDate(this.defaultValue);
            if (this.hasTime) {
              this.pickerTime = getTime(this.defaultValue, this.hideSecond);
            }
          }
        } else {
          const [before, after] = newVal;
          if (!before && !after)
            return;
          const beforeDate = getDate(before);
          const beforeTime = getTime(before, this.hideSecond);
          const afterDate = getDate(after);
          const afterTime = getTime(after, this.hideSecond);
          const startDate = beforeDate;
          const endDate = afterDate;
          this.displayRangeValue.startDate = this.tempRange.startDate = startDate;
          this.displayRangeValue.endDate = this.tempRange.endDate = endDate;
          if (this.hasTime) {
            this.displayRangeValue.startDate = `${beforeDate} ${beforeTime}`;
            this.displayRangeValue.endDate = `${afterDate} ${afterTime}`;
            this.tempRange.startTime = beforeTime;
            this.tempRange.endTime = afterTime;
          }
          const defaultRange = {
            before: beforeDate,
            after: afterDate
          };
          this.startMultipleStatus = Object.assign({}, this.startMultipleStatus, defaultRange, {
            which: "right"
          });
          this.endMultipleStatus = Object.assign({}, this.endMultipleStatus, defaultRange, {
            which: "left"
          });
        }
      },
      updateLeftCale(e) {
        const left = this.$refs.left;
        left.cale.setHoverMultiple(e.after);
        left.setDate(this.$refs.left.nowDate.fullDate);
      },
      updateRightCale(e) {
        const right = this.$refs.right;
        right.cale.setHoverMultiple(e.after);
        right.setDate(this.$refs.right.nowDate.fullDate);
      },
      platform() {
        if (typeof navigator !== "undefined") {
          this.isPhone = navigator.userAgent.toLowerCase().indexOf("mobile") !== -1;
          return;
        }
        const {
          windowWidth
        } = uni.getSystemInfoSync();
        this.isPhone = windowWidth <= 500;
        this.windowWidth = windowWidth;
      },
      show() {
        this.$emit("show");
        if (this.disabled) {
          return;
        }
        this.platform();
        if (this.isPhone) {
          setTimeout(() => {
            this.$refs.mobile.open();
          }, 0);
          return;
        }
        this.pickerPositionStyle = {
          top: "10px"
        };
        const dateEditor = uni.createSelectorQuery().in(this).select(".uni-date-editor");
        dateEditor.boundingClientRect((rect) => {
          if (this.windowWidth - rect.left < this.datePopupWidth) {
            this.pickerPositionStyle.right = 0;
          }
        }).exec();
        setTimeout(() => {
          this.pickerVisible = !this.pickerVisible;
          if (!this.isPhone && this.isRange && this.isFirstShow) {
            this.isFirstShow = false;
            const {
              startDate,
              endDate
            } = this.calendarRange;
            if (startDate && endDate) {
              if (this.diffDate(startDate, endDate) < 30) {
                this.$refs.right.changeMonth("pre");
              }
            } else {
              if (this.isPhone) {
                this.$refs.right.cale.lastHover = false;
              }
            }
          }
        }, 50);
      },
      close() {
        setTimeout(() => {
          this.pickerVisible = false;
          this.$emit("maskClick", this.value);
          this.$refs.mobile && this.$refs.mobile.close();
        }, 20);
      },
      setEmit(value) {
        if (this.returnType === "timestamp" || this.returnType === "date") {
          if (!Array.isArray(value)) {
            if (!this.hasTime) {
              value = value + " 00:00:00";
            }
            value = this.createTimestamp(value);
            if (this.returnType === "date") {
              value = new Date(value);
            }
          } else {
            if (!this.hasTime) {
              value[0] = value[0] + " 00:00:00";
              value[1] = value[1] + " 00:00:00";
            }
            value[0] = this.createTimestamp(value[0]);
            value[1] = this.createTimestamp(value[1]);
            if (this.returnType === "date") {
              value[0] = new Date(value[0]);
              value[1] = new Date(value[1]);
            }
          }
        }
        this.$emit("update:modelValue", value);
        this.$emit("input", value);
        this.$emit("change", value);
        this.isEmitValue = true;
      },
      createTimestamp(date) {
        date = fixIosDateFormat(date);
        return Date.parse(new Date(date));
      },
      singleChange(e) {
        this.calendarDate = this.inputDate = e.fulldate;
        if (this.hasTime)
          return;
        this.confirmSingleChange();
      },
      confirmSingleChange() {
        if (!checkDate(this.inputDate)) {
          const now = /* @__PURE__ */ new Date();
          this.calendarDate = this.inputDate = getDate(now);
          this.pickerTime = getTime(now, this.hideSecond);
        }
        let startLaterInputDate = false;
        let startDate, startTime;
        if (this.start) {
          let startString = this.start;
          if (typeof this.start === "number") {
            startString = getDateTime(this.start, this.hideSecond);
          }
          [startDate, startTime] = startString.split(" ");
          if (this.start && !dateCompare(startDate, this.inputDate)) {
            startLaterInputDate = true;
            this.inputDate = startDate;
          }
        }
        let endEarlierInputDate = false;
        let endDate, endTime;
        if (this.end) {
          let endString = this.end;
          if (typeof this.end === "number") {
            endString = getDateTime(this.end, this.hideSecond);
          }
          [endDate, endTime] = endString.split(" ");
          if (this.end && !dateCompare(this.inputDate, endDate)) {
            endEarlierInputDate = true;
            this.inputDate = endDate;
          }
        }
        if (this.hasTime) {
          if (startLaterInputDate) {
            this.pickerTime = startTime || getDefaultSecond(this.hideSecond);
          }
          if (endEarlierInputDate) {
            this.pickerTime = endTime || getDefaultSecond(this.hideSecond);
          }
          if (!this.pickerTime) {
            this.pickerTime = getTime(Date.now(), this.hideSecond);
          }
          this.displayValue = `${this.inputDate} ${this.pickerTime}`;
        } else {
          this.displayValue = this.inputDate;
        }
        this.setEmit(this.displayValue);
        this.pickerVisible = false;
      },
      leftChange(e) {
        const {
          before,
          after
        } = e.range;
        this.rangeChange(before, after);
        const obj = {
          before: e.range.before,
          after: e.range.after,
          data: e.range.data,
          fulldate: e.fulldate
        };
        this.startMultipleStatus = Object.assign({}, this.startMultipleStatus, obj);
        this.$emit("calendarClick", e);
      },
      rightChange(e) {
        const {
          before,
          after
        } = e.range;
        this.rangeChange(before, after);
        const obj = {
          before: e.range.before,
          after: e.range.after,
          data: e.range.data,
          fulldate: e.fulldate
        };
        this.endMultipleStatus = Object.assign({}, this.endMultipleStatus, obj);
        this.$emit("calendarClick", e);
      },
      mobileChange(e) {
        if (this.isRange) {
          const {
            before,
            after
          } = e.range;
          if (!before) {
            return;
          }
          this.handleStartAndEnd(before, after, true);
          if (this.hasTime) {
            const {
              startTime,
              endTime
            } = e.timeRange;
            this.tempRange.startTime = startTime;
            this.tempRange.endTime = endTime;
          }
          this.confirmRangeChange();
        } else {
          if (this.hasTime) {
            this.displayValue = e.fulldate + " " + e.time;
          } else {
            this.displayValue = e.fulldate;
          }
          this.setEmit(this.displayValue);
        }
        this.$refs.mobile.close();
      },
      rangeChange(before, after) {
        if (!(before && after))
          return;
        this.handleStartAndEnd(before, after, true);
        if (this.hasTime)
          return;
        this.confirmRangeChange();
      },
      confirmRangeChange() {
        if (!this.tempRange.startDate || !this.tempRange.endDate) {
          this.pickerVisible = false;
          return;
        }
        if (!checkDate(this.tempRange.startDate)) {
          this.tempRange.startDate = getDate(Date.now());
        }
        if (!checkDate(this.tempRange.endDate)) {
          this.tempRange.endDate = getDate(Date.now());
        }
        let start, end;
        let startDateLaterRangeStartDate = false;
        let startDateLaterRangeEndDate = false;
        let startDate, startTime;
        if (this.start) {
          let startString = this.start;
          if (typeof this.start === "number") {
            startString = getDateTime(this.start, this.hideSecond);
          }
          [startDate, startTime] = startString.split(" ");
          if (this.start && !dateCompare(this.start, this.tempRange.startDate)) {
            startDateLaterRangeStartDate = true;
            this.tempRange.startDate = startDate;
          }
          if (this.start && !dateCompare(this.start, this.tempRange.endDate)) {
            startDateLaterRangeEndDate = true;
            this.tempRange.endDate = startDate;
          }
        }
        let endDateEarlierRangeStartDate = false;
        let endDateEarlierRangeEndDate = false;
        let endDate, endTime;
        if (this.end) {
          let endString = this.end;
          if (typeof this.end === "number") {
            endString = getDateTime(this.end, this.hideSecond);
          }
          [endDate, endTime] = endString.split(" ");
          if (this.end && !dateCompare(this.tempRange.startDate, this.end)) {
            endDateEarlierRangeStartDate = true;
            this.tempRange.startDate = endDate;
          }
          if (this.end && !dateCompare(this.tempRange.endDate, this.end)) {
            endDateEarlierRangeEndDate = true;
            this.tempRange.endDate = endDate;
          }
        }
        if (!this.hasTime) {
          start = this.displayRangeValue.startDate = this.tempRange.startDate;
          end = this.displayRangeValue.endDate = this.tempRange.endDate;
        } else {
          if (startDateLaterRangeStartDate) {
            this.tempRange.startTime = startTime || getDefaultSecond(this.hideSecond);
          } else if (endDateEarlierRangeStartDate) {
            this.tempRange.startTime = endTime || getDefaultSecond(this.hideSecond);
          }
          if (!this.tempRange.startTime) {
            this.tempRange.startTime = getTime(Date.now(), this.hideSecond);
          }
          if (startDateLaterRangeEndDate) {
            this.tempRange.endTime = startTime || getDefaultSecond(this.hideSecond);
          } else if (endDateEarlierRangeEndDate) {
            this.tempRange.endTime = endTime || getDefaultSecond(this.hideSecond);
          }
          if (!this.tempRange.endTime) {
            this.tempRange.endTime = getTime(Date.now(), this.hideSecond);
          }
          start = this.displayRangeValue.startDate = `${this.tempRange.startDate} ${this.tempRange.startTime}`;
          end = this.displayRangeValue.endDate = `${this.tempRange.endDate} ${this.tempRange.endTime}`;
        }
        if (!dateCompare(start, end)) {
          [start, end] = [end, start];
        }
        this.displayRangeValue.startDate = start;
        this.displayRangeValue.endDate = end;
        const displayRange = [start, end];
        this.setEmit(displayRange);
        this.pickerVisible = false;
      },
      handleStartAndEnd(before, after, temp = false) {
        if (!before)
          return;
        if (!after)
          after = before;
        const type = temp ? "tempRange" : "range";
        const isStartEarlierEnd = dateCompare(before, after);
        this[type].startDate = isStartEarlierEnd ? before : after;
        this[type].endDate = isStartEarlierEnd ? after : before;
      },
      /**
       * 比较时间大小
       */
      dateCompare(startDate, endDate) {
        startDate = new Date(startDate.replace("-", "/").replace("-", "/"));
        endDate = new Date(endDate.replace("-", "/").replace("-", "/"));
        return startDate <= endDate;
      },
      /**
       * 比较时间差
       */
      diffDate(startDate, endDate) {
        startDate = new Date(startDate.replace("-", "/").replace("-", "/"));
        endDate = new Date(endDate.replace("-", "/").replace("-", "/"));
        const diff = (endDate - startDate) / (24 * 60 * 60 * 1e3);
        return Math.abs(diff);
      },
      clear(needEmit = true) {
        if (!this.isRange) {
          this.displayValue = "";
          this.inputDate = "";
          this.pickerTime = "";
          if (this.isPhone) {
            this.$refs.mobile && this.$refs.mobile.clearCalender();
          } else {
            this.$refs.pcSingle && this.$refs.pcSingle.clearCalender();
          }
          if (needEmit) {
            this.$emit("change", "");
            this.$emit("input", "");
            this.$emit("update:modelValue", "");
          }
        } else {
          this.displayRangeValue.startDate = "";
          this.displayRangeValue.endDate = "";
          this.tempRange.startDate = "";
          this.tempRange.startTime = "";
          this.tempRange.endDate = "";
          this.tempRange.endTime = "";
          if (this.isPhone) {
            this.$refs.mobile && this.$refs.mobile.clearCalender();
          } else {
            this.$refs.left && this.$refs.left.clearCalender();
            this.$refs.right && this.$refs.right.clearCalender();
            this.$refs.right && this.$refs.right.changeMonth("next");
          }
          if (needEmit) {
            this.$emit("change", []);
            this.$emit("input", []);
            this.$emit("update:modelValue", []);
          }
        }
      },
      calendarClick(e) {
        this.$emit("calendarClick", e);
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    const _component_time_picker = vue.resolveComponent("time-picker");
    const _component_Calendar = vue.resolveComponent("Calendar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-date" }, [
      vue.createElementVNode("view", {
        class: "uni-date-editor",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.show && $options.show(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["uni-date-editor--x", { "uni-date-editor--x__disabled": $props.disabled, "uni-date-x--border": $props.border }])
            },
            [
              !$data.isRange ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-date-x uni-date-single"
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "icon-calendar",
                  type: "calendar",
                  color: "#c0c4cc",
                  size: "22"
                }),
                vue.createElementVNode(
                  "view",
                  { class: "uni-date__x-input" },
                  vue.toDisplayString($data.displayValue || $options.singlePlaceholderText),
                  1
                  /* TEXT */
                )
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "uni-date-x uni-date-range"
              }, [
                vue.createVNode(_component_uni_icons, {
                  class: "icon-calendar",
                  type: "calendar",
                  color: "#c0c4cc",
                  size: "22"
                }),
                vue.createElementVNode(
                  "view",
                  { class: "uni-date__x-input text-center" },
                  vue.toDisplayString($data.displayRangeValue.startDate || $options.startPlaceholderText),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "range-separator" },
                  vue.toDisplayString($props.rangeSeparator),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "uni-date__x-input text-center" },
                  vue.toDisplayString($data.displayRangeValue.endDate || $options.endPlaceholderText),
                  1
                  /* TEXT */
                )
              ])),
              $options.showClearIcon ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "uni-date__icon-clear",
                onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.clear && $options.clear(...args), ["stop"]))
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "clear",
                  color: "#c0c4cc",
                  size: "22"
                })
              ])) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          )
        ], true)
      ]),
      vue.withDirectives(vue.createElementVNode(
        "view",
        {
          class: "uni-date-mask--pc",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.close && $options.close(...args))
        },
        null,
        512
        /* NEED_PATCH */
      ), [
        [vue.vShow, $data.pickerVisible]
      ]),
      !$data.isPhone ? vue.withDirectives((vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          ref: "datePicker",
          class: "uni-date-picker__container"
        },
        [
          !$data.isRange ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: "uni-date-single--x",
              style: vue.normalizeStyle($data.pickerPositionStyle)
            },
            [
              vue.createElementVNode("view", { class: "uni-popper__arrow" }),
              $data.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-date-changed popup-x-header"
              }, [
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "uni-date__input text-center",
                  type: "text",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.inputDate = $event),
                  placeholder: $options.selectDateText
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, $data.inputDate]
                ]),
                vue.createVNode(_component_time_picker, {
                  type: "time",
                  modelValue: $data.pickerTime,
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.pickerTime = $event),
                  border: false,
                  disabled: !$data.inputDate,
                  start: $options.timepickerStartTime,
                  end: $options.timepickerEndTime,
                  hideSecond: $props.hideSecond,
                  style: { "width": "100%" }
                }, {
                  default: vue.withCtx(() => [
                    vue.withDirectives(vue.createElementVNode("input", {
                      class: "uni-date__input text-center",
                      type: "text",
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.pickerTime = $event),
                      placeholder: $options.selectTimeText,
                      disabled: !$data.inputDate
                    }, null, 8, ["placeholder", "disabled"]), [
                      [vue.vModelText, $data.pickerTime]
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["modelValue", "disabled", "start", "end", "hideSecond"])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createVNode(_component_Calendar, {
                ref: "pcSingle",
                showMonth: false,
                "start-date": $data.calendarRange.startDate,
                "end-date": $data.calendarRange.endDate,
                date: $data.calendarDate,
                onChange: $options.singleChange,
                "default-value": $props.defaultValue,
                style: { "padding": "0 8px" }
              }, null, 8, ["start-date", "end-date", "date", "onChange", "default-value"]),
              $data.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "popup-x-footer"
              }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: "confirm-text",
                    onClick: _cache[6] || (_cache[6] = (...args) => $options.confirmSingleChange && $options.confirmSingleChange(...args))
                  },
                  vue.toDisplayString($options.okText),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ],
            4
            /* STYLE */
          )) : (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: "uni-date-range--x",
              style: vue.normalizeStyle($data.pickerPositionStyle)
            },
            [
              vue.createElementVNode("view", { class: "uni-popper__arrow" }),
              $data.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "popup-x-header uni-date-changed"
              }, [
                vue.createElementVNode("view", { class: "popup-x-header--datetime" }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "uni-date__input uni-date-range__input",
                    type: "text",
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.tempRange.startDate = $event),
                    placeholder: $options.startDateText
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, $data.tempRange.startDate]
                  ]),
                  vue.createVNode(_component_time_picker, {
                    type: "time",
                    modelValue: $data.tempRange.startTime,
                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.tempRange.startTime = $event),
                    start: $options.timepickerStartTime,
                    border: false,
                    disabled: !$data.tempRange.startDate,
                    hideSecond: $props.hideSecond
                  }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode("input", {
                        class: "uni-date__input uni-date-range__input",
                        type: "text",
                        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.tempRange.startTime = $event),
                        placeholder: $options.startTimeText,
                        disabled: !$data.tempRange.startDate
                      }, null, 8, ["placeholder", "disabled"]), [
                        [vue.vModelText, $data.tempRange.startTime]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["modelValue", "start", "disabled", "hideSecond"])
                ]),
                vue.createVNode(_component_uni_icons, {
                  type: "arrowthinright",
                  color: "#999",
                  style: { "line-height": "40px" }
                }),
                vue.createElementVNode("view", { class: "popup-x-header--datetime" }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "uni-date__input uni-date-range__input",
                    type: "text",
                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.tempRange.endDate = $event),
                    placeholder: $options.endDateText
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, $data.tempRange.endDate]
                  ]),
                  vue.createVNode(_component_time_picker, {
                    type: "time",
                    modelValue: $data.tempRange.endTime,
                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $data.tempRange.endTime = $event),
                    end: $options.timepickerEndTime,
                    border: false,
                    disabled: !$data.tempRange.endDate,
                    hideSecond: $props.hideSecond
                  }, {
                    default: vue.withCtx(() => [
                      vue.withDirectives(vue.createElementVNode("input", {
                        class: "uni-date__input uni-date-range__input",
                        type: "text",
                        "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.tempRange.endTime = $event),
                        placeholder: $options.endTimeText,
                        disabled: !$data.tempRange.endDate
                      }, null, 8, ["placeholder", "disabled"]), [
                        [vue.vModelText, $data.tempRange.endTime]
                      ])
                    ]),
                    _: 1
                    /* STABLE */
                  }, 8, ["modelValue", "end", "disabled", "hideSecond"])
                ])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "popup-x-body" }, [
                vue.createVNode(_component_Calendar, {
                  ref: "left",
                  showMonth: false,
                  "start-date": $data.calendarRange.startDate,
                  "end-date": $data.calendarRange.endDate,
                  range: true,
                  pleStatus: $data.endMultipleStatus,
                  onChange: $options.leftChange,
                  onFirstEnterCale: $options.updateRightCale,
                  style: { "padding": "0 8px" }
                }, null, 8, ["start-date", "end-date", "pleStatus", "onChange", "onFirstEnterCale"]),
                vue.createVNode(_component_Calendar, {
                  ref: "right",
                  showMonth: false,
                  "start-date": $data.calendarRange.startDate,
                  "end-date": $data.calendarRange.endDate,
                  range: true,
                  onChange: $options.rightChange,
                  pleStatus: $data.startMultipleStatus,
                  onFirstEnterCale: $options.updateLeftCale,
                  style: { "padding": "0 8px", "border-left": "1px solid #F1F1F1" }
                }, null, 8, ["start-date", "end-date", "onChange", "pleStatus", "onFirstEnterCale"])
              ]),
              $data.hasTime ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "popup-x-footer"
              }, [
                vue.createElementVNode(
                  "text",
                  {
                    onClick: _cache[13] || (_cache[13] = (...args) => $options.clear && $options.clear(...args))
                  },
                  vue.toDisplayString($options.clearText),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: "confirm-text",
                    onClick: _cache[14] || (_cache[14] = (...args) => $options.confirmRangeChange && $options.confirmRangeChange(...args))
                  },
                  vue.toDisplayString($options.okText),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ],
            4
            /* STYLE */
          ))
        ],
        512
        /* NEED_PATCH */
      )), [
        [vue.vShow, $data.pickerVisible]
      ]) : vue.createCommentVNode("v-if", true),
      $data.isPhone ? (vue.openBlock(), vue.createBlock(_component_Calendar, {
        key: 1,
        ref: "mobile",
        clearDate: false,
        date: $data.calendarDate,
        defTime: $options.mobileCalendarTime,
        "start-date": $data.calendarRange.startDate,
        "end-date": $data.calendarRange.endDate,
        selectableTimes: $options.mobSelectableTime,
        startPlaceholder: $props.startPlaceholder,
        endPlaceholder: $props.endPlaceholder,
        "default-value": $props.defaultValue,
        pleStatus: $data.endMultipleStatus,
        showMonth: false,
        range: $data.isRange,
        hasTime: $data.hasTime,
        insert: false,
        hideSecond: $props.hideSecond,
        onConfirm: $options.mobileChange,
        onMaskClose: $options.close,
        onChange: $options.calendarClick
      }, null, 8, ["date", "defTime", "start-date", "end-date", "selectableTimes", "startPlaceholder", "endPlaceholder", "default-value", "pleStatus", "range", "hasTime", "hideSecond", "onConfirm", "onMaskClose", "onChange"])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-9802168a"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue"]]);
  const _sfc_main$j = {
    name: "UniNumberBox",
    emits: ["change", "input", "update:modelValue", "blur", "focus"],
    props: {
      value: {
        type: [Number, String],
        default: 1
      },
      modelValue: {
        type: [Number, String],
        default: 1
      },
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100
      },
      step: {
        type: Number,
        default: 1
      },
      background: {
        type: String,
        default: "#f5f5f5"
      },
      color: {
        type: String,
        default: "#333"
      },
      disabled: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 40
      }
    },
    data() {
      return {
        inputValue: 0
      };
    },
    watch: {
      value(val) {
        this.inputValue = +val;
      },
      modelValue(val) {
        this.inputValue = +val;
      }
    },
    computed: {
      widthWithPx() {
        return this.width + "px";
      }
    },
    created() {
      if (this.value === 1) {
        this.inputValue = +this.modelValue;
      }
      if (this.modelValue === 1) {
        this.inputValue = +this.value;
      }
    },
    methods: {
      _calcValue(type) {
        if (this.disabled) {
          return;
        }
        const scale = this._getDecimalScale();
        let value = this.inputValue * scale;
        let step = this.step * scale;
        if (type === "minus") {
          value -= step;
          if (value < this.min * scale) {
            return;
          }
          if (value > this.max * scale) {
            value = this.max * scale;
          }
        }
        if (type === "plus") {
          value += step;
          if (value > this.max * scale) {
            return;
          }
          if (value < this.min * scale) {
            value = this.min * scale;
          }
        }
        this.inputValue = (value / scale).toFixed(String(scale).length - 1);
        this.$emit("input", +this.inputValue);
        this.$emit("update:modelValue", +this.inputValue);
        this.$emit("change", +this.inputValue);
      },
      _getDecimalScale() {
        let scale = 1;
        if (~~this.step !== this.step) {
          scale = Math.pow(10, String(this.step).split(".")[1].length);
        }
        return scale;
      },
      _onBlur(event) {
        this.$emit("blur", event);
        let value = event.detail.value;
        if (isNaN(value)) {
          this.inputValue = this.value;
          return;
        }
        value = +value;
        if (value > this.max) {
          value = this.max;
        } else if (value < this.min) {
          value = this.min;
        }
        const scale = this._getDecimalScale();
        this.inputValue = value.toFixed(String(scale).length - 1);
        this.$emit("input", +this.inputValue);
        this.$emit("update:modelValue", +this.inputValue);
        this.$emit("change", +this.inputValue);
      },
      _onFocus(event) {
        this.$emit("focus", event);
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-numbox" }, [
      vue.createElementVNode(
        "view",
        {
          onClick: _cache[0] || (_cache[0] = ($event) => $options._calcValue("minus")),
          class: "uni-numbox__minus uni-numbox-btns",
          style: vue.normalizeStyle({ background: $props.background })
        },
        [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-numbox--text", { "uni-numbox--disabled": $data.inputValue <= $props.min || $props.disabled }]),
              style: vue.normalizeStyle({ color: $props.color })
            },
            "-",
            6
            /* CLASS, STYLE */
          )
        ],
        4
        /* STYLE */
      ),
      vue.withDirectives(vue.createElementVNode("input", {
        disabled: $props.disabled,
        onFocus: _cache[1] || (_cache[1] = (...args) => $options._onFocus && $options._onFocus(...args)),
        onBlur: _cache[2] || (_cache[2] = (...args) => $options._onBlur && $options._onBlur(...args)),
        class: "uni-numbox__value",
        type: $props.step < 1 ? "digit" : "number",
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.inputValue = $event),
        style: vue.normalizeStyle({ background: $props.background, color: $props.color, width: $options.widthWithPx })
      }, null, 44, ["disabled", "type"]), [
        [vue.vModelDynamic, $data.inputValue]
      ]),
      vue.createElementVNode(
        "view",
        {
          onClick: _cache[4] || (_cache[4] = ($event) => $options._calcValue("plus")),
          class: "uni-numbox__plus uni-numbox-btns",
          style: vue.normalizeStyle({ background: $props.background })
        },
        [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-numbox--text", { "uni-numbox--disabled": $data.inputValue >= $props.max || $props.disabled }]),
              style: vue.normalizeStyle({ color: $props.color })
            },
            "+",
            6
            /* CLASS, STYLE */
          )
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-7ae2ee72"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue"]]);
  var pattern = {
    email: /^\S+?@\S+?\.\S+?$/,
    idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    url: new RegExp(
      "^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$",
      "i"
    )
  };
  const FORMAT_MAPPING = {
    "int": "integer",
    "bool": "boolean",
    "double": "number",
    "long": "number",
    "password": "string"
    // "fileurls": 'array'
  };
  function formatMessage(args, resources = "") {
    var defaultMessage = ["label"];
    defaultMessage.forEach((item) => {
      if (args[item] === void 0) {
        args[item] = "";
      }
    });
    let str = resources;
    for (let key in args) {
      let reg = new RegExp("{" + key + "}");
      str = str.replace(reg, args[key]);
    }
    return str;
  }
  function isEmptyValue(value, type) {
    if (value === void 0 || value === null) {
      return true;
    }
    if (typeof value === "string" && !value) {
      return true;
    }
    if (Array.isArray(value) && !value.length) {
      return true;
    }
    if (type === "object" && !Object.keys(value).length) {
      return true;
    }
    return false;
  }
  const types = {
    integer(value) {
      return types.number(value) && parseInt(value, 10) === value;
    },
    string(value) {
      return typeof value === "string";
    },
    number(value) {
      if (isNaN(value)) {
        return false;
      }
      return typeof value === "number";
    },
    "boolean": function(value) {
      return typeof value === "boolean";
    },
    "float": function(value) {
      return types.number(value) && !types.integer(value);
    },
    array(value) {
      return Array.isArray(value);
    },
    object(value) {
      return typeof value === "object" && !types.array(value);
    },
    date(value) {
      return value instanceof Date;
    },
    timestamp(value) {
      if (!this.integer(value) || Math.abs(value).toString().length > 16) {
        return false;
      }
      return true;
    },
    file(value) {
      return typeof value.url === "string";
    },
    email(value) {
      return typeof value === "string" && !!value.match(pattern.email) && value.length < 255;
    },
    url(value) {
      return typeof value === "string" && !!value.match(pattern.url);
    },
    pattern(reg, value) {
      try {
        return new RegExp(reg).test(value);
      } catch (e) {
        return false;
      }
    },
    method(value) {
      return typeof value === "function";
    },
    idcard(value) {
      return typeof value === "string" && !!value.match(pattern.idcard);
    },
    "url-https"(value) {
      return this.url(value) && value.startsWith("https://");
    },
    "url-scheme"(value) {
      return value.startsWith("://");
    },
    "url-web"(value) {
      return false;
    }
  };
  class RuleValidator {
    constructor(message) {
      this._message = message;
    }
    async validateRule(fieldKey, fieldValue, value, data, allData) {
      var result = null;
      let rules = fieldValue.rules;
      let hasRequired = rules.findIndex((item) => {
        return item.required;
      });
      if (hasRequired < 0) {
        if (value === null || value === void 0) {
          return result;
        }
        if (typeof value === "string" && !value.length) {
          return result;
        }
      }
      var message = this._message;
      if (rules === void 0) {
        return message["default"];
      }
      for (var i = 0; i < rules.length; i++) {
        let rule = rules[i];
        let vt = this._getValidateType(rule);
        Object.assign(rule, {
          label: fieldValue.label || `["${fieldKey}"]`
        });
        if (RuleValidatorHelper[vt]) {
          result = RuleValidatorHelper[vt](rule, value, message);
          if (result != null) {
            break;
          }
        }
        if (rule.validateExpr) {
          let now = Date.now();
          let resultExpr = rule.validateExpr(value, allData, now);
          if (resultExpr === false) {
            result = this._getMessage(rule, rule.errorMessage || this._message["default"]);
            break;
          }
        }
        if (rule.validateFunction) {
          result = await this.validateFunction(rule, value, data, allData, vt);
          if (result !== null) {
            break;
          }
        }
      }
      if (result !== null) {
        result = message.TAG + result;
      }
      return result;
    }
    async validateFunction(rule, value, data, allData, vt) {
      let result = null;
      try {
        let callbackMessage = null;
        const res = await rule.validateFunction(rule, value, allData || data, (message) => {
          callbackMessage = message;
        });
        if (callbackMessage || typeof res === "string" && res || res === false) {
          result = this._getMessage(rule, callbackMessage || res, vt);
        }
      } catch (e) {
        result = this._getMessage(rule, e.message, vt);
      }
      return result;
    }
    _getMessage(rule, message, vt) {
      return formatMessage(rule, message || rule.errorMessage || this._message[vt] || message["default"]);
    }
    _getValidateType(rule) {
      var result = "";
      if (rule.required) {
        result = "required";
      } else if (rule.format) {
        result = "format";
      } else if (rule.arrayType) {
        result = "arrayTypeFormat";
      } else if (rule.range) {
        result = "range";
      } else if (rule.maximum !== void 0 || rule.minimum !== void 0) {
        result = "rangeNumber";
      } else if (rule.maxLength !== void 0 || rule.minLength !== void 0) {
        result = "rangeLength";
      } else if (rule.pattern) {
        result = "pattern";
      } else if (rule.validateFunction) {
        result = "validateFunction";
      }
      return result;
    }
  }
  const RuleValidatorHelper = {
    required(rule, value, message) {
      if (rule.required && isEmptyValue(value, rule.format || typeof value)) {
        return formatMessage(rule, rule.errorMessage || message.required);
      }
      return null;
    },
    range(rule, value, message) {
      const {
        range,
        errorMessage
      } = rule;
      let list = new Array(range.length);
      for (let i = 0; i < range.length; i++) {
        const item = range[i];
        if (types.object(item) && item.value !== void 0) {
          list[i] = item.value;
        } else {
          list[i] = item;
        }
      }
      let result = false;
      if (Array.isArray(value)) {
        result = new Set(value.concat(list)).size === list.length;
      } else {
        if (list.indexOf(value) > -1) {
          result = true;
        }
      }
      if (!result) {
        return formatMessage(rule, errorMessage || message["enum"]);
      }
      return null;
    },
    rangeNumber(rule, value, message) {
      if (!types.number(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let {
        minimum,
        maximum,
        exclusiveMinimum,
        exclusiveMaximum
      } = rule;
      let min = exclusiveMinimum ? value <= minimum : value < minimum;
      let max = exclusiveMaximum ? value >= maximum : value > maximum;
      if (minimum !== void 0 && min) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMinimum ? "exclusiveMinimum" : "minimum"]);
      } else if (maximum !== void 0 && max) {
        return formatMessage(rule, rule.errorMessage || message["number"][exclusiveMaximum ? "exclusiveMaximum" : "maximum"]);
      } else if (minimum !== void 0 && maximum !== void 0 && (min || max)) {
        return formatMessage(rule, rule.errorMessage || message["number"].range);
      }
      return null;
    },
    rangeLength(rule, value, message) {
      if (!types.string(value) && !types.array(value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      let min = rule.minLength;
      let max = rule.maxLength;
      let val = value.length;
      if (min !== void 0 && val < min) {
        return formatMessage(rule, rule.errorMessage || message["length"].minLength);
      } else if (max !== void 0 && val > max) {
        return formatMessage(rule, rule.errorMessage || message["length"].maxLength);
      } else if (min !== void 0 && max !== void 0 && (val < min || val > max)) {
        return formatMessage(rule, rule.errorMessage || message["length"].range);
      }
      return null;
    },
    pattern(rule, value, message) {
      if (!types["pattern"](rule.pattern, value)) {
        return formatMessage(rule, rule.errorMessage || message.pattern.mismatch);
      }
      return null;
    },
    format(rule, value, message) {
      var customTypes = Object.keys(types);
      var format = FORMAT_MAPPING[rule.format] ? FORMAT_MAPPING[rule.format] : rule.format || rule.arrayType;
      if (customTypes.indexOf(format) > -1) {
        if (!types[format](value)) {
          return formatMessage(rule, rule.errorMessage || message.typeError);
        }
      }
      return null;
    },
    arrayTypeFormat(rule, value, message) {
      if (!Array.isArray(value)) {
        return formatMessage(rule, rule.errorMessage || message.typeError);
      }
      for (let i = 0; i < value.length; i++) {
        const element = value[i];
        let formatResult = this.format(rule, element, message);
        if (formatResult !== null) {
          return formatResult;
        }
      }
      return null;
    }
  };
  class SchemaValidator extends RuleValidator {
    constructor(schema, options) {
      super(SchemaValidator.message);
      this._schema = schema;
      this._options = options || null;
    }
    updateSchema(schema) {
      this._schema = schema;
    }
    async validate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async validateAll(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidate(data, true, allData);
      }
      return result;
    }
    async validateUpdate(data, allData) {
      let result = this._checkFieldInSchema(data);
      if (!result) {
        result = await this.invokeValidateUpdate(data, false, allData);
      }
      return result.length ? result[0] : null;
    }
    async invokeValidate(data, all, allData) {
      let result = [];
      let schema = this._schema;
      for (let key in schema) {
        let value = schema[key];
        let errorMessage = await this.validateRule(key, value, data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    async invokeValidateUpdate(data, all, allData) {
      let result = [];
      for (let key in data) {
        let errorMessage = await this.validateRule(key, this._schema[key], data[key], data, allData);
        if (errorMessage != null) {
          result.push({
            key,
            errorMessage
          });
          if (!all)
            break;
        }
      }
      return result;
    }
    _checkFieldInSchema(data) {
      var keys = Object.keys(data);
      var keys2 = Object.keys(this._schema);
      if (new Set(keys.concat(keys2)).size === keys2.length) {
        return "";
      }
      var noExistFields = keys.filter((key) => {
        return keys2.indexOf(key) < 0;
      });
      var errorMessage = formatMessage({
        field: JSON.stringify(noExistFields)
      }, SchemaValidator.message.TAG + SchemaValidator.message["defaultInvalid"]);
      return [{
        key: "invalid",
        errorMessage
      }];
    }
  }
  function Message() {
    return {
      TAG: "",
      default: "验证错误",
      defaultInvalid: "提交的字段{field}在数据库中并不存在",
      validateFunction: "验证无效",
      required: "{label}必填",
      "enum": "{label}超出范围",
      timestamp: "{label}格式无效",
      whitespace: "{label}不能为空",
      typeError: "{label}类型无效",
      date: {
        format: "{label}日期{value}格式无效",
        parse: "{label}日期无法解析,{value}无效",
        invalid: "{label}日期{value}无效"
      },
      length: {
        minLength: "{label}长度不能少于{minLength}",
        maxLength: "{label}长度不能超过{maxLength}",
        range: "{label}必须介于{minLength}和{maxLength}之间"
      },
      number: {
        minimum: "{label}不能小于{minimum}",
        maximum: "{label}不能大于{maximum}",
        exclusiveMinimum: "{label}不能小于等于{minimum}",
        exclusiveMaximum: "{label}不能大于等于{maximum}",
        range: "{label}必须介于{minimum}and{maximum}之间"
      },
      pattern: {
        mismatch: "{label}格式不匹配"
      }
    };
  }
  SchemaValidator.message = new Message();
  const deepCopy = (val) => {
    return JSON.parse(JSON.stringify(val));
  };
  const typeFilter = (format) => {
    return format === "int" || format === "double" || format === "number" || format === "timestamp";
  };
  const getValue = (key, value, rules) => {
    const isRuleNumType = rules.find((val) => val.format && typeFilter(val.format));
    const isRuleBoolType = rules.find((val) => val.format && val.format === "boolean" || val.format === "bool");
    if (!!isRuleNumType) {
      if (!value && value !== 0) {
        value = null;
      } else {
        value = isNumber(Number(value)) ? Number(value) : value;
      }
    }
    if (!!isRuleBoolType) {
      value = isBoolean(value) ? value : false;
    }
    return value;
  };
  const setDataValue = (field, formdata, value) => {
    formdata[field] = value;
    return value || "";
  };
  const getDataValue = (field, data) => {
    return objGet(data, field);
  };
  const realName = (name, data = {}) => {
    const base_name = _basePath(name);
    if (typeof base_name === "object" && Array.isArray(base_name) && base_name.length > 1) {
      const realname = base_name.reduce((a, b) => a += `#${b}`, "_formdata_");
      return realname;
    }
    return base_name[0] || name;
  };
  const isRealName = (name) => {
    const reg = /^_formdata_#*/;
    return reg.test(name);
  };
  const rawData = (object = {}, name) => {
    let newData = JSON.parse(JSON.stringify(object));
    let formData = {};
    for (let i in newData) {
      let path = name2arr(i);
      objSet(formData, path, newData[i]);
    }
    return formData;
  };
  const name2arr = (name) => {
    let field = name.replace("_formdata_#", "");
    field = field.split("#").map((v) => isNumber(v) ? Number(v) : v);
    return field;
  };
  const objSet = (object, path, value) => {
    if (typeof object !== "object")
      return object;
    _basePath(path).reduce((o, k, i, _) => {
      if (i === _.length - 1) {
        o[k] = value;
        return null;
      } else if (k in o) {
        return o[k];
      } else {
        o[k] = /^[0-9]{1,}$/.test(_[i + 1]) ? [] : {};
        return o[k];
      }
    }, object);
    return object;
  };
  function _basePath(path) {
    if (Array.isArray(path))
      return path;
    return path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
  }
  const objGet = (object, path, defaultVal = "undefined") => {
    let newPath = _basePath(path);
    let val = newPath.reduce((o, k) => {
      return (o || {})[k];
    }, object);
    return !val || val !== void 0 ? val : defaultVal;
  };
  const isNumber = (num) => {
    return !isNaN(Number(num));
  };
  const isBoolean = (bool) => {
    return typeof bool === "boolean";
  };
  const isRequiredField = (rules) => {
    let isNoField = false;
    for (let i = 0; i < rules.length; i++) {
      const ruleData = rules[i];
      if (ruleData.required) {
        isNoField = true;
        break;
      }
    }
    return isNoField;
  };
  const isEqual = (a, b) => {
    if (a === b) {
      return a !== 0 || 1 / a === 1 / b;
    }
    if (a == null || b == null) {
      return a === b;
    }
    var classNameA = toString.call(a), classNameB = toString.call(b);
    if (classNameA !== classNameB) {
      return false;
    }
    switch (classNameA) {
      case "[object RegExp]":
      case "[object String]":
        return "" + a === "" + b;
      case "[object Number]":
        if (+a !== +a) {
          return +b !== +b;
        }
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case "[object Date]":
      case "[object Boolean]":
        return +a === +b;
    }
    if (classNameA == "[object Object]") {
      var propsA = Object.getOwnPropertyNames(a), propsB = Object.getOwnPropertyNames(b);
      if (propsA.length != propsB.length) {
        return false;
      }
      for (var i = 0; i < propsA.length; i++) {
        var propName = propsA[i];
        if (a[propName] !== b[propName]) {
          return false;
        }
      }
      return true;
    }
    if (classNameA == "[object Array]") {
      if (a.toString() == b.toString()) {
        return true;
      }
      return false;
    }
  };
  const _sfc_main$i = {
    name: "uniForms",
    emits: ["validate", "submit"],
    options: {
      virtualHost: true
    },
    props: {
      // 即将弃用
      value: {
        type: Object,
        default() {
          return null;
        }
      },
      // vue3 替换 value 属性
      modelValue: {
        type: Object,
        default() {
          return null;
        }
      },
      // 1.4.0 开始将不支持 v-model ，且废弃 value 和 modelValue
      model: {
        type: Object,
        default() {
          return null;
        }
      },
      // 表单校验规则
      rules: {
        type: Object,
        default() {
          return {};
        }
      },
      //校验错误信息提示方式 默认 undertext 取值 [undertext|toast|modal]
      errShowType: {
        type: String,
        default: "undertext"
      },
      // 校验触发器方式 默认 bind 取值 [bind|submit]
      validateTrigger: {
        type: String,
        default: "submit"
      },
      // label 位置，默认 left 取值  top/left
      labelPosition: {
        type: String,
        default: "left"
      },
      // label 宽度
      labelWidth: {
        type: [String, Number],
        default: ""
      },
      // label 居中方式，默认 left 取值 left/center/right
      labelAlign: {
        type: String,
        default: "left"
      },
      border: {
        type: Boolean,
        default: false
      }
    },
    provide() {
      return {
        uniForm: this
      };
    },
    data() {
      return {
        // 表单本地值的记录，不应该与传如的值进行关联
        formData: {},
        formRules: {}
      };
    },
    computed: {
      // 计算数据源变化的
      localData() {
        const localVal = this.model || this.modelValue || this.value;
        if (localVal) {
          return deepCopy(localVal);
        }
        return {};
      }
    },
    watch: {
      // 监听数据变化 ,暂时不使用，需要单独赋值
      // localData: {},
      // 监听规则变化
      rules: {
        handler: function(val, oldVal) {
          this.setRules(val);
        },
        deep: true,
        immediate: true
      }
    },
    created() {
      let getbinddata = getApp().$vm.$.appContext.config.globalProperties.binddata;
      if (!getbinddata) {
        getApp().$vm.$.appContext.config.globalProperties.binddata = function(name, value, formName) {
          if (formName) {
            this.$refs[formName].setValue(name, value);
          } else {
            let formVm;
            for (let i in this.$refs) {
              const vm = this.$refs[i];
              if (vm && vm.$options && vm.$options.name === "uniForms") {
                formVm = vm;
                break;
              }
            }
            if (!formVm)
              return formatAppLog("error", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:182", "当前 uni-froms 组件缺少 ref 属性");
            formVm.setValue(name, value);
          }
        };
      }
      this.childrens = [];
      this.inputChildrens = [];
      this.setRules(this.rules);
    },
    methods: {
      /**
       * 外部调用方法
       * 设置规则 ，主要用于小程序自定义检验规则
       * @param {Array} rules 规则源数据
       */
      setRules(rules) {
        this.formRules = Object.assign({}, this.formRules, rules);
        this.validator = new SchemaValidator(rules);
      },
      /**
       * 外部调用方法
       * 设置数据，用于设置表单数据，公开给用户使用 ， 不支持在动态表单中使用
       * @param {Object} key
       * @param {Object} value
       */
      setValue(key, value) {
        let example = this.childrens.find((child) => child.name === key);
        if (!example)
          return null;
        this.formData[key] = getValue(key, value, this.formRules[key] && this.formRules[key].rules || []);
        return example.onFieldChange(this.formData[key]);
      },
      /**
       * 外部调用方法
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      validate(keepitem, callback) {
        return this.checkAll(this.formData, keepitem, callback);
      },
      /**
       * 外部调用方法
       * 部分表单校验
       * @param {Array|String} props 需要校验的字段
       * @param {Function} 回调函数
       */
      validateField(props = [], callback) {
        props = [].concat(props);
        let invalidFields = {};
        this.childrens.forEach((item) => {
          const name = realName(item.name);
          if (props.indexOf(name) !== -1) {
            invalidFields = Object.assign({}, invalidFields, {
              [name]: this.formData[name]
            });
          }
        });
        return this.checkAll(invalidFields, [], callback);
      },
      /**
       * 外部调用方法
       * 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
       * @param {Array|String} props 需要移除校验的字段 ，不填为所有
       */
      clearValidate(props = []) {
        props = [].concat(props);
        this.childrens.forEach((item) => {
          if (props.length === 0) {
            item.errMsg = "";
          } else {
            const name = realName(item.name);
            if (props.indexOf(name) !== -1) {
              item.errMsg = "";
            }
          }
        });
      },
      /**
       * 外部调用方法 ，即将废弃
       * 手动提交校验表单
       * 对整个表单进行校验的方法，参数为一个回调函数。
       * @param {Array} keepitem 保留不参与校验的字段
       * @param {type} callback 方法回调
       */
      submit(keepitem, callback, type) {
        for (let i in this.dataValue) {
          const itemData = this.childrens.find((v) => v.name === i);
          if (itemData) {
            if (this.formData[i] === void 0) {
              this.formData[i] = this._getValue(i, this.dataValue[i]);
            }
          }
        }
        if (!type) {
          formatAppLog("warn", "at uni_modules/uni-forms/components/uni-forms/uni-forms.vue:289", "submit 方法即将废弃，请使用validate方法代替！");
        }
        return this.checkAll(this.formData, keepitem, callback, "submit");
      },
      // 校验所有
      async checkAll(invalidFields, keepitem, callback, type) {
        if (!this.validator)
          return;
        let childrens = [];
        for (let i in invalidFields) {
          const item = this.childrens.find((v) => realName(v.name) === i);
          if (item) {
            childrens.push(item);
          }
        }
        if (!callback && typeof keepitem === "function") {
          callback = keepitem;
        }
        let promise;
        if (!callback && typeof callback !== "function" && Promise) {
          promise = new Promise((resolve, reject) => {
            callback = function(valid, invalidFields2) {
              !valid ? resolve(invalidFields2) : reject(valid);
            };
          });
        }
        let results = [];
        let tempFormData = JSON.parse(JSON.stringify(invalidFields));
        for (let i in childrens) {
          const child = childrens[i];
          let name = realName(child.name);
          const result = await child.onFieldChange(tempFormData[name]);
          if (result) {
            results.push(result);
            if (this.errShowType === "toast" || this.errShowType === "modal")
              break;
          }
        }
        if (Array.isArray(results)) {
          if (results.length === 0)
            results = null;
        }
        if (Array.isArray(keepitem)) {
          keepitem.forEach((v) => {
            let vName = realName(v);
            let value = getDataValue(v, this.localData);
            if (value !== void 0) {
              tempFormData[vName] = value;
            }
          });
        }
        if (type === "submit") {
          this.$emit("submit", {
            detail: {
              value: tempFormData,
              errors: results
            }
          });
        } else {
          this.$emit("validate", results);
        }
        let resetFormData = {};
        resetFormData = rawData(tempFormData, this.name);
        callback && typeof callback === "function" && callback(results, resetFormData);
        if (promise && callback) {
          return promise;
        } else {
          return null;
        }
      },
      /**
       * 返回validate事件
       * @param {Object} result
       */
      validateCheck(result) {
        this.$emit("validate", result);
      },
      _getValue: getValue,
      _isRequiredField: isRequiredField,
      _setDataValue: setDataValue,
      _getDataValue: getDataValue,
      _realName: realName,
      _isRealName: isRealName,
      _isEqual: isEqual
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-forms" }, [
      vue.createElementVNode("form", null, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ])
    ]);
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-9a1e3c32"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-forms/components/uni-forms/uni-forms.vue"]]);
  const baseApiUrl = config.baseUrl;
  function createTask(data) {
    return request({
      url: `${baseApiUrl}/tasks`,
      method: "POST",
      data
    });
  }
  function getTaskCategories() {
    return request({
      url: `${baseApiUrl}/taskCategories`,
      method: "GET"
    });
  }
  function getRewardTypes() {
    return request({
      url: `${baseApiUrl}/rewardTypes`,
      method: "GET"
    });
  }
  const _sfc_main$h = {
    __name: "create",
    setup(__props, { expose: __expose }) {
      __expose();
      const formData = vue.reactive({
        title: "",
        description: "",
        categoryId: "",
        requirements: "",
        rewardTypeId: 1,
        rewardAmount: "",
        deadline: "",
        maxParticipants: 1,
        location: "",
        contactInfo: {
          qq: "",
          wechat: "",
          email: ""
        }
      });
      const categories = vue.ref([]);
      const rewardTypes = vue.ref([]);
      const steps = [
        { title: "基本信息", validate: ["title", "categoryId", "description", "requirements"] },
        { title: "任务设置", validate: ["deadline", "location", "maxParticipants", "rewardTypeId", "rewardAmount"] },
        { title: "联系方式", validate: [] },
        { title: "确认提交", validate: [] }
      ];
      const currentStep = vue.ref(0);
      vue.onMounted(async () => {
        try {
          const categoriesRes = await getTaskCategories();
          if (categoriesRes.code === 200) {
            categories.value = categoriesRes.data;
          } else {
            categories.value = [
              { id: 1, name: "问卷调查", iconUrl: "/icons/survey.png" },
              { id: 2, name: "数据收集", iconUrl: "/icons/data.png" },
              { id: 3, name: "实验参与", iconUrl: "/icons/experiment.png" },
              { id: 4, name: "校园活动", iconUrl: "/icons/activity.png" },
              { id: 5, name: "学术研究", iconUrl: "/icons/research.png" },
              { id: 6, name: "志愿服务", iconUrl: "/icons/volunteer.png" },
              { id: 7, name: "实习兼职", iconUrl: "/icons/internship.png" },
              { id: 8, name: "竞赛协助", iconUrl: "/icons/competition.png" },
              { id: 9, name: "技术支持", iconUrl: "/icons/tech.png" },
              { id: 10, name: "其他", iconUrl: "/icons/other.png" }
            ];
          }
          const rewardTypesRes = await getRewardTypes();
          if (rewardTypesRes.code === 200) {
            rewardTypes.value = rewardTypesRes.data;
          } else {
            rewardTypes.value = [
              { id: 1, name: "现金", unit: "元" },
              { id: 2, name: "学分", unit: "分" },
              { id: 3, name: "志愿服务", unit: "小时" },
              { id: 4, name: "实习机会", unit: "天" },
              { id: 5, name: "礼品", unit: "件" },
              { id: 6, name: "证书", unit: "张" }
            ];
          }
        } catch (error) {
          formatAppLog("error", "at pages/task-square/create.vue:321", "获取数据失败", error);
          categories.value = [
            { id: 1, name: "问卷调查", iconUrl: "/icons/survey.png" },
            { id: 2, name: "数据收集", iconUrl: "/icons/data.png" },
            { id: 3, name: "实验参与", iconUrl: "/icons/experiment.png" },
            { id: 4, name: "校园活动", iconUrl: "/icons/activity.png" },
            { id: 5, name: "学术研究", iconUrl: "/icons/research.png" },
            { id: 6, name: "志愿服务", iconUrl: "/icons/volunteer.png" },
            { id: 7, name: "实习兼职", iconUrl: "/icons/internship.png" },
            { id: 8, name: "竞赛协助", iconUrl: "/icons/competition.png" },
            { id: 9, name: "技术支持", iconUrl: "/icons/tech.png" },
            { id: 10, name: "其他", iconUrl: "/icons/other.png" }
          ];
          rewardTypes.value = [
            { id: 1, name: "现金", unit: "元" },
            { id: 2, name: "学分", unit: "分" },
            { id: 3, name: "志愿服务", unit: "小时" },
            { id: 4, name: "实习机会", unit: "天" },
            { id: 5, name: "礼品", unit: "件" },
            { id: 6, name: "证书", unit: "张" }
          ];
          uni.showToast({
            title: "获取数据失败，使用默认配置",
            icon: "none"
          });
        }
      });
      const rules = {
        title: {
          rules: [
            { required: true, errorMessage: "请输入任务标题" }
          ]
        },
        categoryId: {
          rules: [
            { required: true, errorMessage: "请选择任务类别" }
          ]
        },
        description: {
          rules: [
            { required: true, errorMessage: "请输入任务描述" },
            { minLength: 20, errorMessage: "任务描述至少20个字符" }
          ]
        },
        requirements: {
          rules: [
            { required: true, errorMessage: "请输入任务需求" }
          ]
        },
        deadline: {
          rules: [
            { required: true, errorMessage: "请选择截止日期" }
          ]
        },
        location: {
          rules: [
            { required: true, errorMessage: "请输入任务地点" }
          ]
        },
        rewardAmount: {
          rules: [
            { required: true, errorMessage: "请输入报酬金额" }
          ]
        },
        maxParticipants: {
          rules: [
            { required: true, errorMessage: "请输入最大参与人数" }
          ]
        }
      };
      const taskForm = vue.ref(null);
      const minDate = vue.computed(() => {
        const today = /* @__PURE__ */ new Date();
        return today.toISOString().split("T")[0];
      });
      const maxDate = vue.computed(() => {
        const today = /* @__PURE__ */ new Date();
        const maxDate2 = new Date(today.setFullYear(today.getFullYear() + 1));
        return maxDate2.toISOString().split("T")[0];
      });
      function selectCategory(categoryId) {
        formData.categoryId = categoryId;
      }
      function selectRewardType(typeId) {
        formData.rewardTypeId = typeId;
      }
      function onDateChange(e) {
        formData.deadline = e;
      }
      function getCategoryName(categoryId) {
        const category = categories.value.find((item) => item.id === categoryId);
        return category ? category.name : "";
      }
      function getRewardTypeName(rewardTypeId) {
        const rewardType = rewardTypes.value.find((item) => item.id === rewardTypeId);
        return rewardType ? rewardType.name : "";
      }
      function getRewardUnit(rewardTypeId) {
        const rewardType = rewardTypes.value.find((item) => item.id === rewardTypeId);
        return rewardType ? rewardType.unit : "";
      }
      function formatDate(dateStr) {
        if (!dateStr)
          return "";
        try {
          const date = new Date(dateStr);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        } catch (e) {
          return dateStr;
        }
      }
      async function nextStep() {
        const currentValidateFields = steps[currentStep.value].validate;
        if (currentValidateFields.length > 0) {
          try {
            await taskForm.value.validateField(currentValidateFields);
            currentStep.value++;
          } catch (error) {
            uni.showToast({
              title: "请完成必填项",
              icon: "none"
            });
          }
        } else {
          currentStep.value++;
        }
      }
      function prevStep() {
        if (currentStep.value > 0) {
          currentStep.value--;
        }
      }
      function goToStep(step) {
        if (step < currentStep.value) {
          currentStep.value = step;
        }
      }
      function previewTask() {
        taskForm.value.validate().then((res) => {
          uni.showToast({
            title: "预览功能开发中",
            icon: "none"
          });
        }).catch((err) => {
          formatAppLog("log", "at pages/task-square/create.vue:502", "表单错误：", err);
        });
      }
      async function submitForm() {
        try {
          await taskForm.value.validate();
          formatAppLog("log", "at pages/task-square/create.vue:511", "表单数据：", formData);
          uni.showLoading({
            title: "提交中..."
          });
          const submitData = {
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            requirements: formData.requirements,
            rewardTypeId: formData.rewardTypeId,
            rewardAmount: Number(formData.rewardAmount),
            deadline: formatDateTime(formData.deadline),
            maxParticipants: Number(formData.maxParticipants),
            location: formData.location,
            contactInfo: formData.contactInfo
          };
          formatAppLog("log", "at pages/task-square/create.vue:532", "提交数据：", JSON.stringify(submitData, null, 2));
          const response = await createTask(submitData);
          uni.hideLoading();
          if (response.code === 200) {
            uni.showModal({
              title: "发布成功",
              content: "任务已成功发布",
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  uni.navigateBack();
                }
              }
            });
          } else {
            let errorMessage = response.message || "发布失败";
            if (response.message && response.message.includes("LocalDateTime")) {
              errorMessage = "日期格式错误，请重新选择截止日期";
            }
            uni.showModal({
              title: "提交失败",
              content: errorMessage,
              showCancel: false
            });
          }
        } catch (err) {
          uni.hideLoading();
          formatAppLog("log", "at pages/task-square/create.vue:568", "表单错误：", err);
          uni.showToast({
            title: "表单验证失败，请检查输入",
            icon: "none"
          });
        }
      }
      function formatDateTime(dateTimeStr) {
        if (!dateTimeStr)
          return "";
        if (dateTimeStr.length <= 10) {
          return `${dateTimeStr}T23:59:59`;
        }
        const date = new Date(dateTimeStr);
        return date.toISOString().replace(".000Z", "");
      }
      function goBack() {
        uni.showModal({
          title: "提示",
          content: "是否放弃编辑？",
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      }
      const __returned__ = { formData, categories, rewardTypes, steps, currentStep, rules, taskForm, minDate, maxDate, selectCategory, selectRewardType, onDateChange, getCategoryName, getRewardTypeName, getRewardUnit, formatDate, nextStep, prevStep, goToStep, previewTask, submitForm, formatDateTime, goBack, ref: vue.ref, reactive: vue.reactive, computed: vue.computed, onMounted: vue.onMounted, get getTaskCategories() {
        return getTaskCategories;
      }, get getRewardTypes() {
        return getRewardTypes;
      }, get createTask() {
        return createTask;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_easyinput = resolveEasycom(vue.resolveDynamicComponent("uni-easyinput"), __easycom_0);
    const _component_uni_forms_item = resolveEasycom(vue.resolveDynamicComponent("uni-forms-item"), __easycom_1$1);
    const _component_uni_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("uni-datetime-picker"), __easycom_1);
    const _component_uni_number_box = resolveEasycom(vue.resolveDynamicComponent("uni-number-box"), __easycom_3);
    const _component_uni_forms = resolveEasycom(vue.resolveDynamicComponent("uni-forms"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "navbar" }, [
          vue.createElementVNode("view", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-back" })
          ]),
          vue.createElementVNode("view", { class: "title" }, "发布任务"),
          vue.createElementVNode("view", { class: "right-btns" }, [
            vue.createElementVNode("view", {
              class: "preview-btn",
              onClick: $setup.previewTask
            }, "预览")
          ])
        ]),
        vue.createCommentVNode(" 步骤指示器 "),
        vue.createElementVNode("view", { class: "steps-indicator" }, [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.steps, (step, index) => {
              return vue.createElementVNode("view", {
                key: index,
                class: vue.normalizeClass(["step-item", $setup.currentStep >= index ? "step-active" : ""]),
                onClick: ($event) => $setup.goToStep(index)
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "step-circle" },
                  vue.toDisplayString(index + 1),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "step-text" },
                  vue.toDisplayString(step.title),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 表单内容 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "form-scroll"
      }, [
        vue.createVNode(_component_uni_forms, {
          ref: "taskForm",
          modelValue: $setup.formData,
          rules: $setup.rules,
          "label-position": "top",
          "label-width": "80px"
        }, {
          default: vue.withCtx(() => [
            vue.createCommentVNode(" 步骤1：基本信息 "),
            vue.withDirectives(vue.createElementVNode(
              "view",
              { class: "form-section" },
              [
                vue.createElementVNode("view", { class: "section-title" }, "基本信息"),
                vue.createCommentVNode(" 任务标题 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "title",
                  label: "任务标题"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.title,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.formData.title = $event),
                      placeholder: "请输入任务标题（15字以内）",
                      maxlength: "15"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 任务类别 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "categoryId",
                  label: "任务类别"
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "category-tags" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.categories, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.id,
                            class: vue.normalizeClass(["category-tag", $setup.formData.categoryId === item.id ? "category-tag-active" : ""]),
                            onClick: ($event) => $setup.selectCategory(item.id)
                          }, vue.toDisplayString(item.name), 11, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 任务描述 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "description",
                  label: "任务描述"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.description,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.formData.description = $event),
                      type: "textarea",
                      placeholder: "请详细描述任务内容、要求等信息",
                      maxlength: "500",
                      autoHeight: true,
                      inputBorder: true
                    }, null, 8, ["modelValue"]),
                    vue.createElementVNode(
                      "text",
                      { class: "text-count" },
                      vue.toDisplayString($setup.formData.description.length) + "/500",
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 任务需求 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "requirements",
                  label: "任务需求"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.requirements,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.formData.requirements = $event),
                      type: "textarea",
                      placeholder: "请详细描述任务需要的能力、条件等",
                      maxlength: "300",
                      autoHeight: true,
                      inputBorder: true
                    }, null, 8, ["modelValue"]),
                    vue.createElementVNode(
                      "text",
                      { class: "text-count" },
                      vue.toDisplayString($setup.formData.requirements.length) + "/300",
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 1
                  /* STABLE */
                })
              ],
              512
              /* NEED_PATCH */
            ), [
              [vue.vShow, $setup.currentStep === 0]
            ]),
            vue.createCommentVNode(" 步骤2：任务设置 "),
            vue.withDirectives(vue.createElementVNode(
              "view",
              { class: "form-section" },
              [
                vue.createElementVNode("view", { class: "section-title" }, "任务设置"),
                vue.createCommentVNode(" 截止日期 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "deadline",
                  label: "截止日期"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_datetime_picker, {
                      modelValue: $setup.formData.deadline,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.formData.deadline = $event),
                      type: "datetime",
                      start: $setup.minDate,
                      end: $setup.maxDate,
                      format: "yyyy-MM-dd HH:mm",
                      onChange: $setup.onDateChange
                    }, null, 8, ["modelValue", "start", "end"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 任务地点 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "location",
                  label: "任务地点"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.location,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.formData.location = $event),
                      placeholder: "请输入任务地点"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 最大参与人数 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "maxParticipants",
                  label: "参与人数",
                  class: "nowrap-label"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_number_box, {
                      modelValue: $setup.formData.maxParticipants,
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.formData.maxParticipants = $event),
                      min: 1,
                      max: 100
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 任务报酬 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "rewardTypeId",
                  label: "报酬类型"
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "reward-types" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.rewardTypes, (item) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: item.id,
                            class: vue.normalizeClass(["reward-type-tag", $setup.formData.rewardTypeId === item.id ? "reward-type-active" : ""]),
                            onClick: ($event) => $setup.selectRewardType(item.id)
                          }, vue.toDisplayString(item.name), 11, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createCommentVNode(" 报酬金额 "),
                vue.createVNode(_component_uni_forms_item, {
                  name: "rewardAmount",
                  label: "报酬金额"
                }, {
                  default: vue.withCtx(() => {
                    var _a;
                    return [
                      vue.createElementVNode("view", { class: "money-input-container" }, [
                        vue.withDirectives(vue.createElementVNode(
                          "input",
                          {
                            type: "number",
                            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.formData.rewardAmount = $event),
                            placeholder: "请输入数量",
                            maxlength: "10",
                            class: "money-field"
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vue.vModelText, $setup.formData.rewardAmount]
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "money-unit" },
                          vue.toDisplayString(((_a = $setup.rewardTypes.find((item) => item.id === $setup.formData.rewardTypeId)) == null ? void 0 : _a.unit) || "元"),
                          1
                          /* TEXT */
                        )
                      ])
                    ];
                  }),
                  _: 1
                  /* STABLE */
                })
              ],
              512
              /* NEED_PATCH */
            ), [
              [vue.vShow, $setup.currentStep === 1]
            ]),
            vue.createCommentVNode(" 步骤3：联系方式 "),
            vue.withDirectives(vue.createElementVNode(
              "view",
              { class: "form-section" },
              [
                vue.createElementVNode("view", { class: "section-title" }, "联系方式"),
                vue.createVNode(_component_uni_forms_item, {
                  name: "contactInfo.qq",
                  label: "联系QQ"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.contactInfo.qq,
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.formData.contactInfo.qq = $event),
                      placeholder: "请输入联系QQ(选填)"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createVNode(_component_uni_forms_item, {
                  name: "contactInfo.wechat",
                  label: "联系微信"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.contactInfo.wechat,
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.formData.contactInfo.wechat = $event),
                      placeholder: "请输入微信号(选填)"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                }),
                vue.createVNode(_component_uni_forms_item, {
                  name: "contactInfo.email",
                  label: "联系邮箱"
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_uni_easyinput, {
                      modelValue: $setup.formData.contactInfo.email,
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.formData.contactInfo.email = $event),
                      placeholder: "请输入电子邮箱(选填)"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                  /* STABLE */
                })
              ],
              512
              /* NEED_PATCH */
            ), [
              [vue.vShow, $setup.currentStep === 2]
            ]),
            vue.createCommentVNode(" 步骤4：确认提交 "),
            vue.withDirectives(vue.createElementVNode(
              "view",
              { class: "form-section review-section" },
              [
                vue.createElementVNode("view", { class: "section-title" }, "确认信息"),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "任务标题："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.formData.title),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "任务类别："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.getCategoryName($setup.formData.categoryId)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "截止日期："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.formatDate($setup.formData.deadline)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "任务地点："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.formData.location),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "最大参与人数："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.formData.maxParticipants) + " 人",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "报酬类型："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.getRewardTypeName($setup.formData.rewardTypeId)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-item" }, [
                  vue.createElementVNode("text", { class: "review-label" }, "报酬金额："),
                  vue.createElementVNode(
                    "text",
                    { class: "review-value" },
                    vue.toDisplayString($setup.formData.rewardAmount) + " " + vue.toDisplayString($setup.getRewardUnit($setup.formData.rewardTypeId)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-info" }, [
                  vue.createElementVNode("text", null, '请确认以上信息无误，点击"提交"按钮发布任务')
                ])
              ],
              512
              /* NEED_PATCH */
            ), [
              [vue.vShow, $setup.currentStep === 3]
            ])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue"])
      ]),
      vue.createCommentVNode(" 底部导航按钮 "),
      vue.createElementVNode("view", { class: "step-actions" }, [
        $setup.currentStep > 0 ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "prev-btn",
          onClick: $setup.prevStep
        }, "上一步")) : vue.createCommentVNode("v-if", true),
        $setup.currentStep < $setup.steps.length - 1 ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 1,
          class: "next-btn",
          onClick: $setup.nextStep
        }, "下一步")) : vue.createCommentVNode("v-if", true),
        $setup.currentStep === $setup.steps.length - 1 ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 2,
          class: "submit-btn",
          onClick: $setup.submitForm
        }, "提交")) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesTaskSquareCreate = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/task-square/create.vue"]]);
  const _sfc_main$g = {
    data() {
      return {
        defaultAvatar: "/static/images/default-avatar.png",
        teamId: null,
        teamInfo: {},
        teamMembers: [],
        showPhone: false,
        isLoading: true,
        userInfo: null,
        hasApplied: false,
        // 是否已申请加入
        isTeamMember: false,
        // 是否是团队成员
        isTeamLeader: false,
        // 是否是团队队长
        applyLoading: false
        // 申请按钮加载状态
      };
    },
    computed: {
      hasAvailableRoles() {
        if (!this.teamInfo.roles)
          return false;
        return this.teamInfo.roles.some((role) => role.currentCount < role.requiredCount);
      }
    },
    // 页面生命周期函数
    onLoad(option) {
      formatAppLog("log", "at pages/team/detail.vue:193", "队伍详情页面参数:", option);
      if (option && option.id) {
        this.teamId = option.id;
        this.getUserInfo();
        this.getTeamDetail();
      } else {
        uni.showToast({
          title: "队伍ID不能为空",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    onShow() {
      this.getUserInfo();
      if (this.teamId) {
        this.checkTeamStatus();
      }
    },
    methods: {
      // 获取当前用户信息
      getUserInfo() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
        }
      },
      // 检查用户与团队的关系状态
      async checkTeamStatus() {
        if (!this.userInfo || !this.userInfo.userId)
          return;
        try {
          const res = await teamApi.checkTeamStatus(this.teamId);
          if (res.code === 200) {
            this.hasApplied = res.data === true;
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:236", "检查团队状态失败", error);
        }
      },
      getStatusClass(status) {
        switch (status) {
          case "0":
            return "status-recruiting";
          case "1":
            return "status-filled";
          case "2":
            return "status-disbanded";
          default:
            return "status-recruiting";
        }
      },
      getStatusIcon(status) {
        switch (status) {
          case "0":
            return "icon-check-circle";
          case "1":
            return "icon-hourglass";
          case "2":
            return "icon-times-circle";
          default:
            return "icon-check-circle";
        }
      },
      hidePhone(phone) {
        if (!phone)
          return "";
        return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
      },
      togglePhone() {
        this.showPhone = !this.showPhone;
      },
      copyText(text) {
        uni.setClipboardData({
          data: text,
          success: () => {
            uni.showToast({
              title: "复制成功",
              icon: "success"
            });
          }
        });
      },
      goBack() {
        uni.navigateBack();
      },
      goToCompetition(competitionId) {
        if (!competitionId)
          return;
        uni.navigateTo({
          url: `/pages/competition/detail?id=${competitionId}`
        });
      },
      async applyRole(roleId) {
        if (this.hasApplied) {
          uni.showToast({
            title: "您已申请或已加入该团队",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "申请加入理由",
          content: "",
          editable: true,
          placeholderText: "我希望加入团队参与...",
          success: async (res) => {
            if (res.confirm) {
              const message = res.content || "希望能加入团队，与大家一起学习成长。";
              this.applyLoading = true;
              try {
                const applyData = {
                  teamId: this.teamId,
                  roleId,
                  message
                };
                const result = await teamApi.applyTeam(applyData);
                if (result.code === 200) {
                  uni.showToast({
                    title: "申请已提交",
                    icon: "success"
                  });
                  this.hasApplied = true;
                  setTimeout(() => {
                    uni.showModal({
                      title: "申请已提交",
                      content: "您可以在申请管理中查看申请状态",
                      confirmText: "查看申请",
                      cancelText: "稍后再看",
                      success: (res2) => {
                        if (res2.confirm) {
                          uni.navigateTo({
                            url: "/pages/team/applications"
                          });
                        }
                      }
                    });
                  }, 1500);
                } else {
                  uni.showToast({
                    title: result.message || "申请提交失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                formatAppLog("error", "at pages/team/detail.vue:350", "申请失败", error);
                uni.showToast({
                  title: "网络异常，请稍后重试",
                  icon: "none"
                });
              } finally {
                this.applyLoading = false;
              }
            }
          }
        });
      },
      showApplyOptions() {
        if (!this.userInfo || !this.userInfo.userId) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再申请加入团队",
            confirmText: "去登录",
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        if (this.hasApplied) {
          uni.showToast({
            title: "您已申请或已加入该团队",
            icon: "none"
          });
          return;
        }
        if (this.teamInfo.roles && this.teamInfo.roles.length > 0) {
          const availableRoles = this.teamInfo.roles.filter((role) => role.currentCount < role.requiredCount);
          if (availableRoles.length > 1) {
            const itemList = availableRoles.map((role) => `${role.name}（${role.currentCount}/${role.requiredCount}）`);
            uni.showActionSheet({
              itemList,
              success: (res) => {
                this.applyRole(availableRoles[res.tapIndex].id);
              }
            });
          } else if (availableRoles.length === 1) {
            this.applyRole(availableRoles[0].id);
          } else {
            uni.showToast({
              title: "当前没有可申请的角色",
              icon: "none"
            });
          }
        } else {
          uni.showToast({
            title: "当前没有可申请的角色",
            icon: "none"
          });
        }
      },
      editTeam() {
        uni.navigateTo({
          url: `/pages/team/edit?id=${this.teamId}`
        });
      },
      async disbandTeam() {
        uni.showModal({
          title: "解散队伍",
          content: "确定要解散该队伍吗？此操作不可撤销",
          confirmColor: "#f56c6c",
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await teamApi.disbandTeam(this.teamId);
                if (result.code === 200) {
                  uni.showToast({
                    title: "队伍已解散",
                    icon: "success"
                  });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: result.message || "解散队伍失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                formatAppLog("error", "at pages/team/detail.vue:449", "解散队伍失败", error);
                uni.showToast({
                  title: "网络异常，请稍后重试",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      async leaveTeam() {
        uni.showModal({
          title: "退出队伍",
          content: "确定要退出该队伍吗？",
          confirmColor: "#f56c6c",
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await teamApi.leaveTeam(this.teamId);
                if (result.code === 200) {
                  uni.showToast({
                    title: "已退出队伍",
                    icon: "success"
                  });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: result.message || "退出失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                formatAppLog("error", "at pages/team/detail.vue:484", "退出队伍失败", error);
                uni.showToast({
                  title: "网络异常，请稍后重试",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      // 获取队伍成员数据
      async getTeamMembers() {
        try {
          const res = await teamApi.getTeamMembers(this.teamId);
          if (res && res.code === 200 && res.data) {
            this.teamMembers = res.data;
            if (this.userInfo && this.userInfo.userId) {
              const currentUserId = this.userInfo.userId;
              const isMember = this.teamMembers.some((member) => member.userId === currentUserId);
              const isLeader = isMember && this.teamMembers.some((member) => member.userId === currentUserId && member.isLeader);
              this.isTeamMember = isMember;
              this.isTeamLeader = isLeader;
            }
            formatAppLog("log", "at pages/team/detail.vue:512", "获取到队伍成员:", this.teamMembers);
          } else {
            formatAppLog("log", "at pages/team/detail.vue:514", "获取队伍成员失败:", res == null ? void 0 : res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:517", "获取队伍成员出错", error);
        }
      },
      // 获取队伍详情数据
      async getTeamDetail() {
        this.isLoading = true;
        try {
          const res = await teamApi.getTeamDetail(this.teamId);
          if (res && res.code === 200 && res.data) {
            this.teamInfo = res.data;
            formatAppLog("log", "at pages/team/detail.vue:528", "获取到队伍详情:", this.teamInfo);
            if (this.userInfo && this.userInfo.userId && this.teamInfo.leaderId === this.userInfo.userId) {
              this.isTeamLeader = true;
              this.isTeamMember = true;
            }
            this.getTeamMembers();
            this.checkTeamStatus();
          } else {
            uni.showToast({
              title: (res == null ? void 0 : res.message) || "获取队伍详情失败",
              icon: "none"
            });
            formatAppLog("log", "at pages/team/detail.vue:546", "获取队伍详情失败:", res);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:549", "获取队伍详情出错", error);
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "top-bar" }, [
        vue.createElementVNode("view", { class: "flex-between px-4 py-3" }, [
          vue.createElementVNode("view", {
            class: "back-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
          ]),
          vue.createElementVNode(
            "text",
            { class: "page-title" },
            vue.toDisplayString($data.teamInfo.name || "队伍详情"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "header-actions" }, [
            vue.createElementVNode("text", { class: "iconfont icon-star mr-3" }),
            vue.createElementVNode("text", { class: "iconfont icon-share" })
          ])
        ])
      ]),
      vue.createCommentVNode(" 队伍基本信息 "),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "flex-between mb-3" }, [
          vue.createElementVNode("view", {
            class: "competition-link",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.goToCompetition($data.teamInfo.competitionId))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-trophy mr-1 blue-text" }),
            vue.createElementVNode(
              "view",
              { class: "blue-text" },
              "关联竞赛：" + vue.toDisplayString($data.teamInfo.competitionName),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "leader-info" }, [
          vue.createElementVNode("image", {
            class: "leader-avatar",
            src: $data.teamInfo.leaderAvatarUrl || $data.defaultAvatar
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "leader-detail" }, [
            vue.createElementVNode(
              "text",
              { class: "leader-name" },
              "队长：" + vue.toDisplayString($data.teamInfo.leaderName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "leader-major" },
              vue.toDisplayString($data.teamInfo.leaderMajor || "未设置专业"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["status-tag", $options.getStatusClass($data.teamInfo.status)])
            },
            [
              vue.createCommentVNode(' 		  <text class="iconfont" :class="getStatusIcon(teamInfo.status)"></text> '),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.teamInfo.statusText),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        $data.teamInfo.direction ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "research-direction"
        }, [
          vue.createElementVNode("text", { class: "section-title" }, "队伍方向"),
          vue.createElementVNode(
            "text",
            { class: "desc-text" },
            vue.toDisplayString($data.teamInfo.direction),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "team-desc-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "队伍描述"),
          vue.createElementVNode(
            "text",
            { class: "desc-text" },
            vue.toDisplayString($data.teamInfo.description),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "team-meta" }, [
          vue.createElementVNode(
            "text",
            { class: "meta-item" },
            "组队截止：" + vue.toDisplayString($data.teamInfo.recruitmentDeadlineFormatted),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "view-count" }, [
            vue.createElementVNode("text", { class: "iconfont icon-eye" }),
            vue.createElementVNode(
              "text",
              null,
              "浏览次数：" + vue.toDisplayString($data.teamInfo.viewCount),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 招募角色 "),
      vue.createElementVNode("view", { class: "section-card" }, [
        vue.createElementVNode("text", { class: "section-header" }, "招募角色"),
        vue.createElementVNode("view", { class: "role-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.teamInfo.roles, (role) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["role-card", { "role-filled": role.currentCount >= role.requiredCount }]),
                  key: role.id
                },
                [
                  vue.createElementVNode("view", { class: "flex-between mb-2" }, [
                    vue.createElementVNode("view", null, [
                      vue.createElementVNode(
                        "text",
                        { class: "role-title" },
                        vue.toDisplayString(role.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "role-count" },
                        "需求：" + vue.toDisplayString(role.requiredCount) + "人 / 已招募：" + vue.toDisplayString(role.currentCount) + "人",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["role-status-tag", role.currentCount >= role.requiredCount ? "filled-tag" : "recruiting-tag"])
                      },
                      vue.toDisplayString(role.currentCount >= role.requiredCount ? "已满员" : "招募中"),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "role-desc" },
                    vue.toDisplayString(role.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "skill-section" }, [
                    vue.createElementVNode("text", { class: "skill-header" }, "技能要求:"),
                    vue.createElementVNode("view", { class: "skill-tags" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(role.skillRequirements, (skill, index) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              class: "skill-tag",
                              key: index
                            },
                            vue.toDisplayString(skill),
                            1
                            /* TEXT */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  vue.createElementVNode("button", {
                    class: vue.normalizeClass(["apply-btn", role.currentCount >= role.requiredCount ? "disabled-btn" : "active-btn"]),
                    disabled: role.currentCount >= role.requiredCount,
                    onClick: ($event) => $options.applyRole(role.id)
                  }, [
                    role.currentCount < role.requiredCount ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "iconfont icon-paper-plane"
                    })) : vue.createCommentVNode("v-if", true),
                    vue.createTextVNode(" 申请加入 ")
                  ], 10, ["disabled", "onClick"])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 队伍成员 "),
      $data.teamMembers.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "info-card"
      }, [
        vue.createElementVNode(
          "text",
          { class: "section-header" },
          "队伍成员 (" + vue.toDisplayString($data.teamMembers.length) + ")",
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "member-grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.teamMembers, (member, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "member-item",
                key: index
              }, [
                vue.createElementVNode("image", {
                  class: vue.normalizeClass(["member-avatar", { "leader-border2": member.isLeader }]),
                  src: member.userAvatarUrl || $data.defaultAvatar
                }, null, 10, ["src"]),
                vue.createElementVNode("text", { class: "member-name" }, [
                  vue.createTextVNode(
                    vue.toDisplayString(member.userName) + " ",
                    1
                    /* TEXT */
                  ),
                  member.roleName ? (vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: 0,
                      class: "member-role"
                    },
                    "(" + vue.toDisplayString(member.roleName) + ")",
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true),
                  member.isLeader ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "leader-label"
                  }, "(队长)")) : vue.createCommentVNode("v-if", true)
                ]),
                member.userMajor ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "member-major"
                  },
                  vue.toDisplayString(member.userMajor),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 指导老师 "),
      $data.teamInfo.teachers && $data.teamInfo.teachers.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "info-card"
      }, [
        vue.createElementVNode("text", { class: "section-header" }, "指导老师"),
        vue.createElementVNode("view", { class: "member-grid" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.teamInfo.teachers, (teacher, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "member-item",
                key: index
              }, [
                vue.createElementVNode("image", {
                  class: "member-avatar",
                  src: teacher.avatarUrl || $data.defaultAvatar
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  { class: "member-name" },
                  vue.toDisplayString(teacher.name),
                  1
                  /* TEXT */
                ),
                teacher.major ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "teacher-major"
                  },
                  vue.toDisplayString(teacher.major),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 联系方式 "),
      $data.teamInfo.contactInfo ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "info-card"
      }, [
        vue.createElementVNode("text", { class: "section-header" }, "联系方式"),
        vue.createElementVNode("view", { class: "contact-list" }, [
          $data.teamInfo.contactInfo.wechat ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "contact-item"
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-weixin contact-icon wechat-color" }),
            vue.createElementVNode(
              "text",
              { class: "contact-text" },
              "微信：" + vue.toDisplayString($data.teamInfo.contactInfo.wechat),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "copy-btn",
              onClick: _cache[2] || (_cache[2] = ($event) => $options.copyText($data.teamInfo.contactInfo.wechat))
            }, "复制")
          ])) : vue.createCommentVNode("v-if", true),
          $data.teamInfo.contactInfo.phone ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "contact-item"
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-phone contact-icon phone-color" }),
            vue.createElementVNode(
              "text",
              { class: "contact-text" },
              "电话：" + vue.toDisplayString($data.showPhone ? $data.teamInfo.contactInfo.phone : $options.hidePhone($data.teamInfo.contactInfo.phone)),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: "copy-btn",
                onClick: _cache[3] || (_cache[3] = (...args) => $options.togglePhone && $options.togglePhone(...args))
              },
              vue.toDisplayString($data.showPhone ? "隐藏" : "查看"),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.teamInfo.contactInfo.qq ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "contact-item"
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-qq contact-icon qq-color" }),
            vue.createElementVNode(
              "text",
              { class: "contact-text" },
              "QQ群：" + vue.toDisplayString($data.teamInfo.contactInfo.qq),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "copy-btn",
              onClick: _cache[4] || (_cache[4] = ($event) => $options.copyText($data.teamInfo.contactInfo.qq))
            }, "复制")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTeamDetail = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/detail.vue"]]);
  const _sfc_main$f = {
    __name: "list",
    setup(__props, { expose: __expose }) {
      __expose();
      const categories = vue.ref(["全部队伍", "学科竞赛", "创新创业", "体育竞赛", "文艺比赛"]);
      const currentCategory = vue.ref(0);
      const headerBarRef = vue.ref(null);
      const headerPlaceholderHeight = vue.computed(() => {
        if (headerBarRef.value && headerBarRef.value.headerHeight) {
          return headerBarRef.value.headerHeight + "rpx";
        }
        return categories.value && categories.value.length > 0 ? "200rpx" : "120rpx";
      });
      const teamData = vue.reactive({
        pageNum: 1,
        pageSize: 10,
        total: 0,
        pages: 0,
        list: [],
        hasPrevious: false,
        hasNext: false
      });
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const loadingMore = vue.ref(false);
      const noMoreData = vue.ref(false);
      const queryParams = vue.reactive({
        pageNum: 1,
        pageSize: 10,
        keyword: "",
        orderByViewCount: false
      });
      async function getTeamList(refresh = false) {
        if (refresh) {
          queryParams.pageNum = 1;
          refreshing.value = true;
        } else {
          loading.value = true;
        }
        try {
          const params = {};
          Object.keys(queryParams).forEach((key) => {
            if (queryParams[key] !== null && queryParams[key] !== void 0 && queryParams[key] !== "") {
              params[key] = queryParams[key];
            }
          });
          formatAppLog("log", "at pages/team/list.vue:136", "请求参数:", params);
          const res = await teamApi.getTeamList(params);
          formatAppLog("log", "at pages/team/list.vue:138", "响应结果:", res);
          if (res.code === 200 && res.data) {
            if (refresh) {
              teamData.list = res.data.list || [];
            } else {
              teamData.list = [...teamData.list, ...res.data.list || []];
            }
            teamData.pageNum = res.data.pageNum;
            teamData.pageSize = res.data.pageSize;
            teamData.total = res.data.total;
            teamData.pages = res.data.pages;
            teamData.hasPrevious = res.data.hasPrevious;
            teamData.hasNext = res.data.hasNext;
            noMoreData.value = !res.data.hasNext;
          } else {
            uni.showToast({
              title: (res == null ? void 0 : res.message) || "获取团队列表失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/list.vue:163", "获取团队列表出错", error);
          if (error.statusCode === 401 || error.statusCode === 403) {
            uni.showModal({
              title: "登录已过期",
              content: "请重新登录后查看",
              confirmText: "去登录",
              success: function(res) {
                if (res.confirm) {
                  uni.removeStorageSync("token");
                  uni.navigateTo({
                    url: "/pages/login/login"
                  });
                }
              }
            });
          } else {
            uni.showToast({
              title: "网络异常，请稍后重试",
              icon: "none"
            });
          }
        } finally {
          loading.value = false;
          refreshing.value = false;
          loadingMore.value = false;
        }
      }
      function onPullDownRefresh() {
        getTeamList(true).then(() => {
          uni.stopPullDownRefresh();
        });
      }
      function loadMore() {
        if (loadingMore.value || noMoreData.value)
          return;
        if (!teamData.hasNext) {
          noMoreData.value = true;
          return;
        }
        loadingMore.value = true;
        queryParams.pageNum += 1;
        getTeamList();
      }
      function selectCategory(index) {
        if (currentCategory.value === index)
          return;
        currentCategory.value = index;
        if (index === 0) {
          delete queryParams.categoryId;
        } else {
          queryParams.categoryId = index;
        }
        getTeamList(true);
      }
      vue.onMounted(() => {
        formatAppLog("log", "at pages/team/list.vue:237", "组队列表页面加载");
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "提示",
            content: "请先登录后查看团队列表",
            confirmText: "去登录",
            success: function(res) {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        getTeamList();
      });
      function goToTeamDetail(teamId) {
        uni.navigateTo({
          url: `/pages/team/detail?id=${teamId}`
        });
      }
      function applyToJoin(teamId) {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showModal({
            title: "提示",
            content: "请先登录后再申请加入团队",
            confirmText: "去登录",
            success: function(res) {
              if (res.confirm) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
              }
            }
          });
          return;
        }
        teamApi.checkTeamStatus(teamId).then((res) => {
          if (res.code === 200) {
            if (res.data === true) {
              uni.showToast({
                title: "您已申请或已加入该团队",
                icon: "none"
              });
            } else {
              uni.navigateTo({
                url: `/pages/team/detail?id=${teamId}`
              });
            }
          }
        }).catch((err) => {
          formatAppLog("error", "at pages/team/list.vue:304", "检查团队状态失败", err);
          uni.navigateTo({
            url: `/pages/team/detail?id=${teamId}`
          });
        });
      }
      function createTeam() {
        uni.navigateTo({
          url: "/pages/team/create"
        });
      }
      function handleTabChange(tab) {
        if (tab === "home") {
          uni.switchTab({
            url: "/pages/index/index"
          });
        } else if (tab === "competition") {
          uni.switchTab({
            url: "/pages/competition/index"
          });
        } else if (tab === "profile") {
          uni.switchTab({
            url: "/pages/profile/index"
          });
        }
      }
      function showPublishOptions() {
        uni.showActionSheet({
          itemList: ["创建新团队", "招募队友", "发布项目展示"],
          success: function(res) {
            if (res.tapIndex === 0) {
              createTeam();
            } else {
              uni.showToast({
                title: `选择了: ${res.tapIndex}`,
                icon: "none"
              });
            }
          }
        });
      }
      function goToSearch() {
        uni.navigateTo({
          url: "/pages/search/index"
        });
      }
      function showFilterOptions() {
        uni.showActionSheet({
          itemList: ["最新发布", "热门团队", "即将截止"],
          success: function(res) {
            uni.showToast({
              title: `选择了筛选: ${res.tapIndex}`,
              icon: "none"
            });
          }
        });
      }
      const __returned__ = { categories, currentCategory, headerBarRef, headerPlaceholderHeight, teamData, loading, refreshing, loadingMore, noMoreData, queryParams, getTeamList, onPullDownRefresh, loadMore, selectCategory, goToTeamDetail, applyToJoin, createTeam, handleTabChange, showPublishOptions, goToSearch, showFilterOptions, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, computed: vue.computed, TeamCard, TabBar, HeaderBar, get teamApi() {
        return teamApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createVNode($setup["HeaderBar"], {
        ref: "headerBarRef",
        title: "组队广场",
        categories: $setup.categories,
        "default-category": $setup.currentCategory,
        "show-filter": "true",
        onSearch: $setup.goToSearch,
        onFilter: $setup.showFilterOptions,
        onCategoryChange: $setup.selectCategory
      }, null, 8, ["categories", "default-category"]),
      vue.createCommentVNode(" 导航栏占位 "),
      vue.createElementVNode(
        "view",
        {
          class: "header-placeholder",
          style: vue.normalizeStyle({ height: $setup.headerPlaceholderHeight })
        },
        null,
        4
        /* STYLE */
      ),
      vue.createCommentVNode(" 组队列表 "),
      vue.createElementVNode(
        "scroll-view",
        {
          "scroll-y": "true",
          class: "team-list",
          onScrolltolower: $setup.loadMore
        },
        [
          vue.createCommentVNode(" 使用团队卡片组件 "),
          $setup.teamData.list && $setup.teamData.list.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            { key: 0 },
            vue.renderList($setup.teamData.list, (team, index) => {
              return vue.openBlock(), vue.createBlock($setup["TeamCard"], {
                key: team.id,
                team,
                index,
                onDetail: $setup.goToTeamDetail,
                onApply: $setup.applyToJoin
              }, null, 8, ["team", "index"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )) : $setup.loading ? (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: 1 },
            [
              vue.createCommentVNode(" 加载中状态 "),
              vue.createElementVNode("view", { class: "loading-state" }, [
                vue.createElementVNode("view", { class: "loading-spinner" }),
                vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )) : (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            { key: 2 },
            [
              vue.createCommentVNode(" 空状态提示 "),
              vue.createElementVNode("view", { class: "empty-state" }, [
                vue.createElementVNode("text", { class: "empty-text" }, "暂无团队数据")
              ])
            ],
            2112
            /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
          )),
          vue.createCommentVNode(" 加载更多提示 "),
          $setup.teamData.list && $setup.teamData.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "load-more"
          }, [
            $setup.loadingMore ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "正在加载更多...")) : $setup.teamData.hasNext ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              onClick: $setup.loadMore
            }, "点击加载更多")) : (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "— 没有更多数据了 —"))
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      ),
      vue.createCommentVNode(" 底部导航栏 "),
      vue.createVNode($setup["TabBar"], {
        "active-tab": "team",
        onTabChange: $setup.handleTabChange,
        onPublish: $setup.showPublishOptions
      })
    ]);
  }
  const PagesTeamList = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/list.vue"]]);
  const _sfc_main$e = {
    __name: "create",
    setup(__props, { expose: __expose }) {
      __expose();
      const competitionPopup = vue.ref(null);
      const teacherPopup = vue.ref(null);
      const skillPopup = vue.ref(null);
      const baseUrl = config.baseUrl;
      const form = vue.reactive({
        competitionId: "",
        teamName: "",
        researchDirection: "",
        description: "",
        recruitDeadline: "",
        email: "",
        wechat: "",
        qq: "",
        teachers: [],
        roles: []
      });
      const competitionList = vue.ref([]);
      const filteredCompetitionList = vue.ref([]);
      const competitionCategories = vue.ref([]);
      const selectedCategoryId = vue.ref(0);
      const teacherList = vue.ref([]);
      const filteredTeacherList = vue.ref([]);
      const teacherMajors = vue.ref([]);
      const selectedMajorId = vue.ref(0);
      const currentTeacherIndex = vue.ref(null);
      const skillTags = vue.ref({});
      const skillCategories = vue.ref([]);
      const selectedSkillCategory = vue.ref("全部");
      const currentRoleIndex = vue.ref(null);
      const skillSearchKey = vue.ref("");
      const filteredSkillTags = vue.ref([]);
      const skillInputs = vue.reactive({});
      const teacherSearchKey = vue.ref("");
      const selectedCompetitionName = vue.computed(() => {
        const competition = competitionList.value.find((item) => item.id === form.competitionId);
        return competition ? competition.title : "";
      });
      async function getCompetitionsBasicInfo() {
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const selectedId = form.competitionId;
          let tempCompetition = null;
          if (selectedId) {
            tempCompetition = competitionList.value.find((item) => item.id === selectedId);
          }
          const res = await competitionsApi.getCompetitionsBasicInfo();
          if (res && res.code === 200 && res.data) {
            const apiHasSelectedCompetition = res.data.some((item) => item.id === selectedId);
            if (selectedId && !apiHasSelectedCompetition && tempCompetition) {
              competitionList.value = [...res.data, tempCompetition];
            } else {
              competitionList.value = res.data;
            }
            filteredCompetitionList.value = [...competitionList.value];
            const categories = /* @__PURE__ */ new Map();
            categories.set(0, { id: 0, name: "全部分类" });
            res.data.forEach((item) => {
              if (!categories.has(item.categoryId)) {
                categories.set(item.categoryId, {
                  id: item.categoryId,
                  name: item.categoryName
                });
              }
            });
            competitionCategories.value = Array.from(categories.values());
            formatAppLog("log", "at pages/team/create.vue:573", "API请求结果:", res.data);
            formatAppLog("log", "at pages/team/create.vue:574", "处理后的竞赛列表:", competitionList.value);
            formatAppLog("log", "at pages/team/create.vue:575", "当前选中竞赛ID:", selectedId);
          } else {
            showToast("获取竞赛列表失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/create.vue:580", "获取竞赛列表失败:", error);
          showToast("获取竞赛列表失败");
        } finally {
          uni.hideLoading();
        }
      }
      async function getTeachersList() {
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const res = await uni.request({
            url: `${baseUrl}/api/teachers/list`,
            method: "GET"
          });
          if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
            teacherList.value = res.data.data;
            filteredTeacherList.value = [...res.data.data];
            const majors = /* @__PURE__ */ new Map();
            majors.set(0, { id: 0, name: "全部专业" });
            res.data.data.forEach((item) => {
              if (item.major && !majors.has(item.major)) {
                majors.set(item.major, {
                  id: item.major,
                  name: item.major
                });
              }
            });
            teacherMajors.value = Array.from(majors.values());
          } else {
            showToast("获取教师列表失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/create.vue:622", "获取教师列表失败:", error);
          showToast("获取教师列表失败");
        } finally {
          uni.hideLoading();
        }
      }
      function filterCompetitionsByCategory(categoryId) {
        selectedCategoryId.value = categoryId;
        if (categoryId === 0) {
          filteredCompetitionList.value = [...competitionList.value];
        } else {
          filteredCompetitionList.value = competitionList.value.filter((item) => item.categoryId === categoryId);
        }
      }
      function filterTeachersByMajor(majorId) {
        selectedMajorId.value = majorId;
        teacherSearchKey.value = "";
        if (majorId === 0) {
          filteredTeacherList.value = [...teacherList.value];
        } else {
          filteredTeacherList.value = teacherList.value.filter((item) => item.major === majorId);
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      function showCompetitionModal() {
        competitionPopup.value.open();
      }
      function closeCompetitionModal() {
        competitionPopup.value.close();
      }
      function selectCompetition(competition) {
        form.competitionId = competition.id;
      }
      function confirmCompetitionSelection() {
        closeCompetitionModal();
      }
      function showTeacherModal(index) {
        teacherPopup.value.open();
        currentTeacherIndex.value = index;
      }
      function closeTeacherModal() {
        teacherPopup.value.close();
        teacherSearchKey.value = "";
        filterTeachersByMajor(selectedMajorId.value);
      }
      function selectTeacher(teacher) {
        if (isTeacherAlreadySelected(teacher.id)) {
          uni.showToast({
            title: "该教师已被选择",
            icon: "none"
          });
          return;
        }
        form.teachers[currentTeacherIndex.value].id = teacher.id;
        form.teachers[currentTeacherIndex.value].name = teacher.name;
      }
      function confirmTeacherSelection() {
        closeTeacherModal();
      }
      function formatDate(timestamp) {
        if (!timestamp)
          return "";
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
      }
      function padZero(num) {
        return num < 10 ? `0${num}` : num;
      }
      function addTeacher() {
        form.teachers.push({ id: "", name: "", role: "" });
      }
      function removeTeacher(index) {
        form.teachers.splice(index, 1);
      }
      function addRole() {
        form.roles.push({
          name: "",
          count: 1,
          description: "",
          skills: []
        });
      }
      function removeRole(index) {
        form.roles.splice(index, 1);
      }
      function addSkill(roleIndex) {
        const skill = skillInputs[roleIndex];
        if (skill && skill.trim()) {
          if (!form.roles[roleIndex].skills) {
            form.roles[roleIndex].skills = [];
          }
          form.roles[roleIndex].skills.push(skill.trim());
          skillInputs[roleIndex] = "";
        }
      }
      function removeSkill(roleIndex, skillIndex) {
        form.roles[roleIndex].skills.splice(skillIndex, 1);
      }
      function validateForm() {
        if (!form.competitionId) {
          showToast("请选择关联竞赛");
          return false;
        }
        if (!form.teamName) {
          showToast("请输入团队名称");
          return false;
        }
        if (!form.researchDirection) {
          showToast("请输入研究方向");
          return false;
        }
        if (!form.description) {
          showToast("请输入团队描述");
          return false;
        }
        if (!form.recruitDeadline) {
          showToast("请选择招募截止日期");
          return false;
        }
        if (!form.email) {
          showToast("请输入电子邮箱");
          return false;
        }
        for (let i = 0; i < form.teachers.length; i++) {
          const teacher = form.teachers[i];
          if (!teacher.id) {
            showToast(`请完善指导老师${i + 1}的信息`);
            return false;
          }
        }
        if (form.roles.length === 0) {
          showToast("请至少添加一个招募角色");
          return false;
        }
        return true;
      }
      function showToast(title) {
        uni.showToast({
          title,
          icon: "none"
        });
      }
      async function submitTeam() {
        if (!validateForm())
          return;
        uni.showLoading({
          title: "提交中..."
        });
        try {
          const apiData = {
            competitionId: form.competitionId,
            name: form.teamName,
            description: form.description,
            direction: form.researchDirection,
            recruitmentDeadline: new Date(form.recruitDeadline).toISOString(),
            // 联系方式
            contactInfo: {
              phone: form.phone || "",
              email: form.email || "",
              wechat: form.wechat || "",
              qq: form.qq || ""
            },
            // 指导老师
            teacherIds: form.teachers.map((teacher) => teacher.id),
            teacherRoles: form.teachers.map((teacher) => teacher.role),
            // 角色要求
            roles: form.roles.map((role) => ({
              name: role.name,
              requiredCount: parseInt(role.count) || 1,
              description: role.description,
              skillRequirements: role.skills || []
            }))
          };
          formatAppLog("log", "at pages/team/create.vue:868", "提交数据:", apiData);
          const res = await teamApi.createTeam(apiData);
          formatAppLog("log", "at pages/team/create.vue:872", res);
          uni.hideLoading();
          if (res.code === 200) {
            uni.showToast({
              title: "创建成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            showToast(res.message || "创建失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/create.vue:888", "创建团队失败:", error);
          uni.hideLoading();
          showToast("创建失败，请稍后重试");
        }
      }
      vue.onMounted(async () => {
        const pages = getCurrentPages();
        const page = pages[pages.length - 1];
        if (page.$page && page.$page.options) {
          const { competitionId, competitionName } = page.$page.options;
          if (competitionId) {
            formatAppLog("log", "at pages/team/create.vue:904", "从URL获取到竞赛ID:", competitionId);
            formatAppLog("log", "at pages/team/create.vue:905", "从URL获取到竞赛名称:", competitionName);
            form.competitionId = competitionId;
            if (competitionName) {
              const decodedName = decodeURIComponent(competitionName);
              formatAppLog("log", "at pages/team/create.vue:914", "解码后的竞赛名称:", decodedName);
              const tempCompetition = {
                id: competitionId,
                title: decodedName,
                categoryId: 0,
                categoryName: "未分类"
              };
              competitionList.value.push(tempCompetition);
              filteredCompetitionList.value = [...competitionList.value];
              formatAppLog("log", "at pages/team/create.vue:927", "已添加临时竞赛对象:", tempCompetition);
              formatAppLog("log", "at pages/team/create.vue:928", "当前竞赛列表:", competitionList.value);
            }
          }
        }
        await getCompetitionsBasicInfo();
        await getTeachersList();
        await getSkillTags();
        await vue.nextTick();
        formatAppLog("log", "at pages/team/create.vue:940", "竞赛选择组件:", competitionPopup.value);
      });
      function getCategoryClass(categoryId) {
        switch (categoryId) {
          case 1:
            return "category-programming";
          case 2:
            return "category-math";
          case 3:
            return "category-electronics";
          case 4:
            return "category-robotics";
          case 5:
            return "category-innovation";
          default:
            return "";
        }
      }
      function isTeacherAlreadySelected(teacherId) {
        if (currentTeacherIndex.value !== null && form.teachers[currentTeacherIndex.value].id === teacherId) {
          return false;
        }
        return form.teachers.some((teacher) => teacher.id === teacherId && teacher.id !== "");
      }
      function searchTeachers() {
        if (!teacherSearchKey.value.trim()) {
          filterTeachersByMajor(selectedMajorId.value);
          return;
        }
        const keyword = teacherSearchKey.value.toLowerCase().trim();
        let baseList = selectedMajorId.value === 0 ? teacherList.value : teacherList.value.filter((item) => item.major === selectedMajorId.value);
        filteredTeacherList.value = baseList.filter(
          (item) => item.name.toLowerCase().includes(keyword)
        );
      }
      function clearTeacherSearch() {
        teacherSearchKey.value = "";
        filterTeachersByMajor(selectedMajorId.value);
      }
      function showSkillModal(roleIndex) {
        skillPopup.value.open();
        currentRoleIndex.value = roleIndex;
      }
      function closeSkillModal() {
        skillPopup.value.close();
        skillSearchKey.value = "";
        filterSkillsByCategory(selectedSkillCategory.value);
      }
      async function getSkillTags() {
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const res = await uni.request({
            url: `${baseUrl}/api/skill-tags/group-by-category`,
            method: "GET"
          });
          if (res && res.statusCode === 200 && res.data && res.data.code === 200) {
            skillTags.value = res.data.data;
            const categories = ["全部", ...Object.keys(res.data.data)];
            skillCategories.value = categories;
            const allTags = [];
            Object.entries(res.data.data).forEach(([category, tags]) => {
              tags.forEach((tag) => {
                allTags.push({
                  ...tag,
                  category
                });
              });
            });
            filteredSkillTags.value = allTags;
            formatAppLog("log", "at pages/team/create.vue:1045", "所有技能标签:", allTags);
            formatAppLog("log", "at pages/team/create.vue:1046", "分类:", categories);
          } else {
            showToast("获取技能标签失败");
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/create.vue:1051", "获取技能标签失败:", error);
          showToast("获取技能标签失败");
        } finally {
          uni.hideLoading();
        }
      }
      function filterSkillsByCategory(category) {
        selectedSkillCategory.value = category;
        skillSearchKey.value = "";
        formatAppLog("log", "at pages/team/create.vue:1063", "筛选分类:", category);
        formatAppLog("log", "at pages/team/create.vue:1064", "所有技能标签数据:", skillTags.value);
        if (category === "全部") {
          const allTags = [];
          Object.entries(skillTags.value).forEach(([cat, tags]) => {
            tags.forEach((tag) => {
              allTags.push({
                ...tag,
                category: cat
              });
            });
          });
          filteredSkillTags.value = allTags;
        } else {
          const categoryTags = skillTags.value[category] || [];
          filteredSkillTags.value = categoryTags.map((tag) => ({
            ...tag,
            category
          }));
        }
        formatAppLog("log", "at pages/team/create.vue:1087", "筛选后的技能标签:", filteredSkillTags.value);
      }
      function confirmSkillSelection() {
        closeSkillModal();
      }
      function isSkillSelected(tagName) {
        const role = form.roles[currentRoleIndex.value];
        return role.skills.includes(tagName);
      }
      function isSkillAlreadySelected(tagName) {
        const role = form.roles[currentRoleIndex.value];
        if (role.skills.includes(tagName)) {
          return false;
        }
        for (let i = 0; i < form.roles.length; i++) {
          if (i !== currentRoleIndex.value && form.roles[i].skills.includes(tagName)) {
            return true;
          }
        }
        return false;
      }
      function toggleSkillSelection(skill) {
        const role = form.roles[currentRoleIndex.value];
        if (isSkillSelected(skill.tagName)) {
          role.skills = role.skills.filter((item) => item !== skill.tagName);
        } else {
          role.skills.push(skill.tagName);
        }
      }
      function searchSkills() {
        formatAppLog("log", "at pages/team/create.vue:1131", "搜索技能:", skillSearchKey.value);
        if (!skillSearchKey.value.trim()) {
          filterSkillsByCategory(selectedSkillCategory.value);
          return;
        }
        const keyword = skillSearchKey.value.toLowerCase().trim();
        let baseList = [];
        if (selectedSkillCategory.value === "全部") {
          Object.entries(skillTags.value).forEach(([category, tags]) => {
            tags.forEach((tag) => {
              baseList.push({
                ...tag,
                category
              });
            });
          });
        } else {
          const categoryTags = skillTags.value[selectedSkillCategory.value] || [];
          baseList = categoryTags.map((tag) => ({
            ...tag,
            category: selectedSkillCategory.value
          }));
        }
        filteredSkillTags.value = baseList.filter(
          (item) => item.tagName.toLowerCase().includes(keyword) || item.description && item.description.toLowerCase().includes(keyword)
        );
        formatAppLog("log", "at pages/team/create.vue:1169", "搜索结果:", filteredSkillTags.value);
      }
      function clearSkillSearch() {
        skillSearchKey.value = "";
        filterSkillsByCategory(selectedSkillCategory.value);
      }
      function getSelectedSkillsCount() {
        if (currentRoleIndex.value === null)
          return 0;
        const role = form.roles[currentRoleIndex.value];
        return role.skills ? role.skills.length : 0;
      }
      const __returned__ = { competitionPopup, teacherPopup, skillPopup, baseUrl, form, competitionList, filteredCompetitionList, competitionCategories, selectedCategoryId, teacherList, filteredTeacherList, teacherMajors, selectedMajorId, currentTeacherIndex, skillTags, skillCategories, selectedSkillCategory, currentRoleIndex, skillSearchKey, filteredSkillTags, skillInputs, teacherSearchKey, selectedCompetitionName, getCompetitionsBasicInfo, getTeachersList, filterCompetitionsByCategory, filterTeachersByMajor, goBack, showCompetitionModal, closeCompetitionModal, selectCompetition, confirmCompetitionSelection, showTeacherModal, closeTeacherModal, selectTeacher, confirmTeacherSelection, formatDate, padZero, addTeacher, removeTeacher, addRole, removeRole, addSkill, removeSkill, validateForm, showToast, submitTeam, getCategoryClass, isTeacherAlreadySelected, searchTeachers, clearTeacherSearch, showSkillModal, closeSkillModal, getSkillTags, filterSkillsByCategory, confirmSkillSelection, isSkillSelected, isSkillAlreadySelected, toggleSkillSelection, searchSkills, clearSkillSearch, getSelectedSkillsCount, ref: vue.ref, reactive: vue.reactive, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick, get teamApi() {
        return teamApi;
      }, get competitionsApi() {
        return competitionsApi;
      }, get dev() {
        return config;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$3);
    const _component_uni_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("uni-datetime-picker"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "sticky-header" }, [
        vue.createElementVNode("view", { class: "nav-bar" }, [
          vue.createElementVNode("view", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
          ]),
          vue.createElementVNode("text", { class: "page-title" }, "创建团队"),
          vue.createElementVNode("view", { class: "help-btn" }, [
            vue.createElementVNode("text", { class: "iconfont icon-help" })
          ])
        ])
      ]),
      vue.createCommentVNode(" 表单内容 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "form-content"
      }, [
        vue.createCommentVNode(" 基本信息部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-trophy section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "基本信息")
          ]),
          vue.createCommentVNode(" 竞赛选择 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("关联竞赛"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", {
              class: "select-box",
              onClick: $setup.showCompetitionModal
            }, [
              $setup.form.competitionId ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "select-text"
                },
                vue.toDisplayString($setup.selectedCompetitionName),
                1
                /* TEXT */
              )) : (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "placeholder-text"
              }, "请选择竞赛")),
              vue.createElementVNode("text", { class: "iconfont icon-arrow-left select-arrow" })
            ])
          ]),
          vue.createCommentVNode(" 竞赛选择弹窗 "),
          vue.createVNode(
            _component_uni_popup,
            {
              ref: "competitionPopup",
              type: "bottom"
            },
            {
              default: vue.withCtx(() => [
                vue.createElementVNode("view", { class: "popup-container" }, [
                  vue.createElementVNode("view", { class: "popup-header" }, [
                    vue.createElementVNode("text", { class: "popup-title" }, "选择竞赛"),
                    vue.createElementVNode("text", {
                      class: "popup-close",
                      onClick: $setup.closeCompetitionModal
                    }, "关闭")
                  ]),
                  vue.createCommentVNode(" 分类选择 "),
                  vue.createElementVNode("scroll-view", {
                    "scroll-x": "true",
                    class: "category-scroll"
                  }, [
                    vue.createElementVNode("view", { class: "category-list" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList($setup.competitionCategories, (category) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: category.id,
                            class: vue.normalizeClass(["category-tag", { "active-category": $setup.selectedCategoryId === category.id }]),
                            onClick: ($event) => $setup.filterCompetitionsByCategory(category.id)
                          }, [
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(category.name),
                              1
                              /* TEXT */
                            )
                          ], 10, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]),
                  vue.createCommentVNode(" 竞赛列表 "),
                  vue.createElementVNode("scroll-view", {
                    "scroll-y": "true",
                    class: "competitions-list"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.filteredCompetitionList, (competition) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: competition.id,
                          class: vue.normalizeClass(["competition-item", { "active-competition": $setup.form.competitionId === competition.id }]),
                          onClick: ($event) => $setup.selectCompetition(competition)
                        }, [
                          vue.createElementVNode("view", { class: "competition-info" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "competition-title" },
                              vue.toDisplayString(competition.title),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              {
                                class: vue.normalizeClass(["competition-category", $setup.getCategoryClass(competition.categoryId)])
                              },
                              vue.toDisplayString(competition.categoryName),
                              3
                              /* TEXT, CLASS */
                            )
                          ]),
                          competition.isHot === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 0,
                            class: "hot-tag"
                          }, "热门")) : vue.createCommentVNode("v-if", true),
                          $setup.form.competitionId === competition.id ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 1,
                            class: "iconfont icon-check"
                          })) : vue.createCommentVNode("v-if", true)
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    $setup.filteredCompetitionList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "empty-tip"
                    }, [
                      vue.createElementVNode("text", null, "该分类下暂无竞赛")
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createElementVNode("view", { class: "popup-footer" }, [
                    vue.createElementVNode("button", {
                      class: "confirm-btn",
                      onClick: $setup.confirmCompetitionSelection
                    }, "确定")
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            },
            512
            /* NEED_PATCH */
          ),
          vue.createCommentVNode(" 团队名称 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("团队名称"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.teamName = $event),
                placeholder: "请输入团队名称",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.teamName]
            ])
          ]),
          vue.createCommentVNode(" 研究方向 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("研究方向"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.researchDirection = $event),
                placeholder: "请输入研究方向",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.researchDirection]
            ])
          ]),
          vue.createCommentVNode(" 团队描述 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("团队描述"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.description = $event),
                placeholder: "请简要描述团队情况和目标",
                class: "form-textarea"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.description]
            ])
          ])
        ]),
        vue.createCommentVNode(" 招募信息部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-calendar section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "招募信息")
          ]),
          vue.createCommentVNode(" 招募截止日期 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("招募截止日期"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "date-picker-box" }, [
              vue.createVNode(_component_uni_datetime_picker, {
                type: "datetime",
                modelValue: $setup.form.recruitDeadline,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.recruitDeadline = $event),
                "clear-icon": false,
                "return-type": "timestamp"
              }, {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", { class: "picker-view" }, [
                    $setup.form.recruitDeadline ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "select-text"
                      },
                      vue.toDisplayString($setup.formatDate($setup.form.recruitDeadline)),
                      1
                      /* TEXT */
                    )) : (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "placeholder-text"
                    }, "请选择截止日期")),
                    vue.createElementVNode("text", { class: "iconfont icon-calendar picker-icon" })
                  ])
                ]),
                _: 1
                /* STABLE */
              }, 8, ["modelValue"])
            ])
          ])
        ]),
        vue.createCommentVNode(" 联系方式部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-phone section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "联系方式")
          ]),
          vue.createCommentVNode(" 电子邮箱 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("电子邮箱"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.email = $event),
                placeholder: "请输入电子邮箱",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.email]
            ])
          ]),
          vue.createCommentVNode(" 微信 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "微信"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.wechat = $event),
                placeholder: "请输入微信号",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.wechat]
            ])
          ]),
          vue.createCommentVNode(" QQ "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "QQ"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.qq = $event),
                placeholder: "请输入QQ号",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.qq]
            ])
          ])
        ]),
        vue.createCommentVNode(" 指导老师部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-graduation section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "指导老师")
          ]),
          vue.createCommentVNode(" 老师列表 "),
          $setup.form.teachers.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.form.teachers, (teacher, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "teacher-item"
                }, [
                  vue.createElementVNode("view", { class: "item-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "item-title" },
                      "指导老师 " + vue.toDisplayString(index + 1),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: ($event) => $setup.removeTeacher(index)
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-trash" })
                    ], 8, ["onClick"])
                  ]),
                  vue.createCommentVNode(" 选择老师 "),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "form-label" }, [
                      vue.createTextVNode("选择老师"),
                      vue.createElementVNode("text", { class: "required" }, "*")
                    ]),
                    vue.createElementVNode("view", {
                      class: "select-box",
                      onClick: ($event) => $setup.showTeacherModal(index)
                    }, [
                      teacher.name ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "select-text"
                        },
                        vue.toDisplayString(teacher.name),
                        1
                        /* TEXT */
                      )) : (vue.openBlock(), vue.createElementBlock("text", {
                        key: 1,
                        class: "placeholder-text"
                      }, "请选择老师")),
                      vue.createElementVNode("text", { class: "iconfont icon-arrow-left select-arrow" })
                    ], 8, ["onClick"])
                  ]),
                  vue.createCommentVNode(" 角色 "),
                  vue.createCommentVNode(' <view class="form-item">\n              <text class="form-label">角色<text class="required">*</text></text>\n              <input \n                type="text" \n                v-model="teacher.role" \n                placeholder="如：主指导老师" \n                class="form-input" \n              />\n            </view> ')
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 添加老师按钮 "),
          vue.createElementVNode("view", {
            class: "add-item-btn",
            onClick: $setup.addTeacher
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-plus" }),
            vue.createElementVNode("text", null, "添加指导老师")
          ])
        ]),
        vue.createCommentVNode(" 教师选择弹窗 "),
        vue.createVNode(
          _component_uni_popup,
          {
            ref: "teacherPopup",
            type: "bottom"
          },
          {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { class: "popup-container" }, [
                vue.createElementVNode("view", { class: "popup-header" }, [
                  vue.createElementVNode("text", { class: "popup-title" }, "选择指导老师"),
                  vue.createElementVNode("text", {
                    class: "popup-close",
                    onClick: $setup.closeTeacherModal
                  }, "关闭")
                ]),
                vue.createCommentVNode(" 搜索框 "),
                vue.createElementVNode("view", { class: "search-box" }, [
                  vue.createElementVNode("view", { class: "search-input-wrapper" }, [
                    vue.createElementVNode("text", { class: "iconfont icon-search" }),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "text",
                        "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.teacherSearchKey = $event),
                        placeholder: "搜索教师姓名",
                        class: "search-input",
                        onInput: $setup.searchTeachers
                      },
                      null,
                      544
                      /* NEED_HYDRATION, NEED_PATCH */
                    ), [
                      [vue.vModelText, $setup.teacherSearchKey]
                    ]),
                    $setup.teacherSearchKey ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "iconfont icon-times-circle clear-btn",
                      onClick: $setup.clearTeacherSearch
                    })) : vue.createCommentVNode("v-if", true)
                  ])
                ]),
                vue.createCommentVNode(" 专业分类 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-x": "true",
                  class: "category-scroll"
                }, [
                  vue.createElementVNode("view", { class: "category-list" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($setup.teacherMajors, (major) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: major.id,
                          class: vue.normalizeClass(["category-tag", { "active-category": $setup.selectedMajorId === major.id }]),
                          onClick: ($event) => $setup.filterTeachersByMajor(major.id)
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(major.name),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]),
                vue.createCommentVNode(" 教师列表 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-y": "true",
                  class: "competitions-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.filteredTeacherList, (teacher) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: teacher.id,
                        class: vue.normalizeClass(["teacher-item-select", {
                          "active-teacher": $setup.currentTeacherIndex !== null && $setup.form.teachers[$setup.currentTeacherIndex].id === teacher.id,
                          "disabled-teacher": $setup.isTeacherAlreadySelected(teacher.id)
                        }]),
                        onClick: ($event) => $setup.selectTeacher(teacher)
                      }, [
                        vue.createElementVNode("view", { class: "teacher-info" }, [
                          vue.createElementVNode("image", {
                            class: "teacher-avatar",
                            src: teacher.avatarUrl,
                            mode: "aspectFill"
                          }, null, 8, ["src"]),
                          vue.createElementVNode("view", { class: "teacher-detail" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "teacher-name" },
                              vue.toDisplayString(teacher.name),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "teacher-major" },
                              vue.toDisplayString(teacher.major),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "teacher-status" }, [
                          $setup.isTeacherAlreadySelected(teacher.id) ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 0,
                            class: "selected-tag"
                          }, "已选择")) : $setup.currentTeacherIndex !== null && $setup.form.teachers[$setup.currentTeacherIndex].id === teacher.id ? (vue.openBlock(), vue.createElementBlock("text", {
                            key: 1,
                            class: "iconfont icon-check"
                          })) : vue.createCommentVNode("v-if", true)
                        ])
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  $setup.filteredTeacherList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "empty-tip"
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.teacherSearchKey ? "没有找到相关教师" : "该专业下暂无教师"),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "popup-footer" }, [
                  vue.createElementVNode("button", {
                    class: "confirm-btn",
                    onClick: $setup.confirmTeacherSelection
                  }, "确定")
                ])
              ])
            ]),
            _: 1
            /* STABLE */
          },
          512
          /* NEED_PATCH */
        ),
        vue.createCommentVNode(" 招募角色部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-team section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "招募角色")
          ]),
          vue.createCommentVNode(" 角色列表 "),
          $setup.form.roles.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.form.roles, (role, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "role-item"
                }, [
                  vue.createElementVNode("view", { class: "item-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "item-title" },
                      "角色 " + vue.toDisplayString(index + 1),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "delete-btn",
                      onClick: ($event) => $setup.removeRole(index)
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-trash" })
                    ], 8, ["onClick"])
                  ]),
                  vue.createCommentVNode(" 角色名称 "),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "form-label" }, [
                      vue.createTextVNode("角色名称"),
                      vue.createElementVNode("text", { class: "required" }, "*")
                    ]),
                    vue.withDirectives(vue.createElementVNode("input", {
                      type: "text",
                      "onUpdate:modelValue": ($event) => role.name = $event,
                      placeholder: "如：算法工程师",
                      class: "form-input"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vue.vModelText, role.name]
                    ])
                  ]),
                  vue.createCommentVNode(" 招募人数 "),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "form-label" }, [
                      vue.createTextVNode("招募人数"),
                      vue.createElementVNode("text", { class: "required" }, "*")
                    ]),
                    vue.withDirectives(vue.createElementVNode("input", {
                      type: "number",
                      "onUpdate:modelValue": ($event) => role.count = $event,
                      placeholder: "请输入招募人数",
                      class: "form-input"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vue.vModelText, role.count]
                    ])
                  ]),
                  vue.createCommentVNode(" 角色描述 "),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "form-label" }, [
                      vue.createTextVNode("角色描述"),
                      vue.createElementVNode("text", { class: "required" }, "*")
                    ]),
                    vue.withDirectives(vue.createElementVNode("textarea", {
                      "onUpdate:modelValue": ($event) => role.description = $event,
                      placeholder: "请描述该角色的职责",
                      class: "form-textarea"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vue.vModelText, role.description]
                    ])
                  ]),
                  vue.createCommentVNode(" 技能要求 "),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "form-label" }, "技能要求"),
                    vue.createCommentVNode(" 已添加的技能标签 "),
                    vue.createElementVNode("view", { class: "skill-tags" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(role.skills, (skill, skillIndex) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: skillIndex,
                            class: "skill-tag"
                          }, [
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(skill),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("text", {
                              class: "iconfont icon-times-circle",
                              onClick: vue.withModifiers(($event) => $setup.removeSkill(index, skillIndex), ["stop"])
                            }, null, 8, ["onClick"])
                          ]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    vue.createCommentVNode(" 添加技能按钮 "),
                    vue.createElementVNode("view", {
                      class: "skill-select-btn",
                      onClick: ($event) => $setup.showSkillModal(index)
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-tag" }),
                      vue.createElementVNode("text", null, "选择技能标签"),
                      vue.createElementVNode("text", { class: "iconfont icon-arrow-right" })
                    ], 8, ["onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 添加角色按钮 "),
          vue.createElementVNode("view", {
            class: "add-item-btn",
            onClick: $setup.addRole
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-plus" }),
            vue.createElementVNode("text", null, "添加招募角色")
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部提交按钮 "),
      vue.createElementVNode("view", { class: "submit-bar" }, [
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: $setup.submitTeam
        }, "创建团队")
      ]),
      vue.createCommentVNode(" 技能标签选择弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "skillPopup",
          type: "bottom"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "popup-container" }, [
              vue.createElementVNode("view", { class: "popup-header" }, [
                vue.createElementVNode("text", { class: "popup-title" }, "选择技能标签"),
                vue.createElementVNode("text", {
                  class: "popup-close",
                  onClick: $setup.closeSkillModal
                }, "关闭")
              ]),
              vue.createCommentVNode(" 搜索框 "),
              vue.createElementVNode("view", { class: "search-box" }, [
                vue.createElementVNode("view", { class: "search-input-wrapper" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-search" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.skillSearchKey = $event),
                      placeholder: "搜索技能标签",
                      class: "search-input",
                      onInput: $setup.searchSkills
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.skillSearchKey]
                  ]),
                  $setup.skillSearchKey ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "iconfont icon-times-circle clear-btn",
                    onClick: $setup.clearSkillSearch
                  })) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createCommentVNode(" 技能分类 "),
              vue.createElementVNode("scroll-view", {
                "scroll-x": "true",
                class: "category-scroll"
              }, [
                vue.createElementVNode("view", { class: "category-list" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.skillCategories, (category) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: category,
                        class: vue.normalizeClass(["category-tag", { "active-category": $setup.selectedSkillCategory === category }]),
                        onClick: ($event) => $setup.filterSkillsByCategory(category)
                      }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(category),
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              vue.createCommentVNode(" 技能列表 "),
              vue.createElementVNode("scroll-view", {
                "scroll-y": "true",
                class: "competitions-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.filteredSkillTags, (skill) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: skill.id,
                      class: vue.normalizeClass(["skill-item-select", {
                        "active-skill": $setup.isSkillSelected(skill.tagName),
                        "disabled-skill": $setup.isSkillAlreadySelected(skill.tagName)
                      }]),
                      onClick: ($event) => $setup.toggleSkillSelection(skill)
                    }, [
                      vue.createElementVNode("view", { class: "skill-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "skill-name" },
                          vue.toDisplayString(skill.tagName),
                          1
                          /* TEXT */
                        ),
                        skill.description ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: 0,
                            class: "skill-desc"
                          },
                          vue.toDisplayString(skill.description),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode("view", { class: "skill-check" }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["selection-indicator", { "selected": $setup.isSkillSelected(skill.tagName) }])
                          },
                          vue.toDisplayString($setup.isSkillSelected(skill.tagName) ? "已选" : "选择"),
                          3
                          /* TEXT, CLASS */
                        )
                      ])
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                $setup.filteredSkillTags.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "empty-tip"
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.skillSearchKey ? "没有找到相关技能" : "该分类下暂无技能标签"),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "popup-footer" }, [
                vue.createElementVNode("view", { class: "selected-count" }, [
                  vue.createTextVNode(" 已选: "),
                  vue.createElementVNode(
                    "text",
                    { class: "count-highlight" },
                    vue.toDisplayString($setup.getSelectedSkillsCount()),
                    1
                    /* TEXT */
                  ),
                  vue.createTextVNode(" 个技能 ")
                ]),
                vue.createElementVNode("button", {
                  class: "confirm-btn",
                  onClick: $setup.confirmSkillSelection
                }, "确定")
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesTeamCreate = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/create.vue"]]);
  const _imports_0$2 = "/static/images/empty-data.png";
  const _sfc_main$d = {
    __name: "recommended",
    setup(__props, { expose: __expose }) {
      __expose();
      const loading = vue.ref(true);
      const recommendedTeams = vue.ref([]);
      const aiSummary = vue.ref("");
      const headerBarRef = vue.ref(null);
      const headerPlaceholderHeight = vue.computed(() => {
        if (headerBarRef.value && headerBarRef.value.headerHeight) {
          return headerBarRef.value.headerHeight + "rpx";
        }
        return "120rpx";
      });
      async function getRecommendedTeams(forceRefresh = false) {
        loading.value = true;
        try {
          formatAppLog("log", "at pages/team/recommended.vue:88", "开始获取AI推荐队伍数据，强制刷新:", forceRefresh);
          let cachedTeams = null;
          let cachedSummary = null;
          let cacheTime = null;
          try {
            cachedTeams = uni.getStorageSync("ai_recommended_teams");
            cachedSummary = uni.getStorageSync("ai_summary");
            cacheTime = uni.getStorageSync("ai_recommend_cache_time");
            formatAppLog("log", "at pages/team/recommended.vue:101", "缓存状态检查:");
            formatAppLog("log", "at pages/team/recommended.vue:102", "- 缓存数据存在:", !!cachedTeams);
            formatAppLog("log", "at pages/team/recommended.vue:103", "- 缓存时间:", cacheTime ? new Date(parseInt(cacheTime)).toLocaleString() : "无");
          } catch (e) {
            formatAppLog("error", "at pages/team/recommended.vue:105", "读取缓存出错:", e);
          }
          const currentTime = (/* @__PURE__ */ new Date()).getTime();
          const cacheExpired = !cacheTime || isNaN(parseInt(cacheTime)) || currentTime - parseInt(cacheTime) > 24 * 60 * 60 * 1e3;
          formatAppLog("log", "at pages/team/recommended.vue:112", "缓存是否过期:", cacheExpired);
          if (cachedTeams && !cacheExpired && !forceRefresh) {
            formatAppLog("log", "at pages/team/recommended.vue:116", "使用缓存的AI推荐数据");
            try {
              recommendedTeams.value = JSON.parse(cachedTeams);
              aiSummary.value = cachedSummary || "根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队";
              formatAppLog("log", "at pages/team/recommended.vue:120", "成功加载缓存数据，推荐队伍数量:", recommendedTeams.value.length);
              loading.value = false;
              return;
            } catch (e) {
              formatAppLog("error", "at pages/team/recommended.vue:124", "解析缓存数据失败:", e);
            }
          }
          formatAppLog("log", "at pages/team/recommended.vue:130", "请求新的AI推荐数据");
          const res = await teamApi.getRecommendedTeams();
          if (res.code === 200 && res.data) {
            const teams = res.data.recommendedTeams || [];
            recommendedTeams.value = teams.map((team) => {
              return {
                ...team,
                matchScore: team.matchScore || Math.floor(Math.random() * 30) + 70,
                // 如果没有匹配度，随机生成70-100之间的分数
                matchReason: team.matchReason || team.recommendReason || "根据您的技能和兴趣推荐",
                recommendedRole: team.recommendedRole || ""
              };
            });
            aiSummary.value = res.data.aiSummary || "根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队";
            formatAppLog("log", "at pages/team/recommended.vue:146", "获取到新的AI推荐队伍数据:", recommendedTeams.value.length, "个队伍");
            try {
              uni.setStorageSync("ai_recommended_teams", JSON.stringify(recommendedTeams.value));
              uni.setStorageSync("ai_summary", aiSummary.value);
              uni.setStorageSync("ai_recommend_cache_time", currentTime.toString());
              formatAppLog("log", "at pages/team/recommended.vue:153", "AI推荐数据缓存成功");
            } catch (e) {
              formatAppLog("error", "at pages/team/recommended.vue:155", "缓存AI推荐数据失败:", e);
            }
          } else {
            formatAppLog("error", "at pages/team/recommended.vue:158", "获取推荐数据失败:", res.message || "未知错误");
            if (cachedTeams) {
              try {
                recommendedTeams.value = JSON.parse(cachedTeams);
                aiSummary.value = cachedSummary || "根据您的专业、技能和兴趣，我们为您推荐了以下最匹配的团队";
                formatAppLog("log", "at pages/team/recommended.vue:164", "使用过期缓存作为备用数据");
              } catch (e) {
                formatAppLog("error", "at pages/team/recommended.vue:166", "解析旧缓存失败:", e);
              }
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/recommended.vue:171", "获取AI推荐队伍失败:", error);
          try {
            const cachedTeams = uni.getStorageSync("ai_recommended_teams");
            if (cachedTeams) {
              recommendedTeams.value = JSON.parse(cachedTeams);
              aiSummary.value = uni.getStorageSync("ai_summary") || "";
              formatAppLog("log", "at pages/team/recommended.vue:179", "由于请求失败，使用缓存作为备用数据");
            }
          } catch (e) {
            formatAppLog("error", "at pages/team/recommended.vue:182", "加载备用缓存失败:", e);
          }
          if (recommendedTeams.value.length === 0) {
            uni.showToast({
              title: "获取推荐失败，请稍后再试",
              icon: "none",
              duration: 2e3
            });
          }
        } finally {
          loading.value = false;
          formatAppLog("log", "at pages/team/recommended.vue:196", "AI推荐数据加载完成，显示状态更新");
        }
      }
      function refreshRecommendations() {
        uni.showLoading({
          title: "刷新推荐中..."
        });
        try {
          uni.removeStorageSync("ai_recommended_teams");
          uni.removeStorageSync("ai_summary");
          uni.removeStorageSync("ai_recommend_cache_time");
          formatAppLog("log", "at pages/team/recommended.vue:212", "已清除AI推荐缓存，准备获取新数据");
        } catch (e) {
          formatAppLog("error", "at pages/team/recommended.vue:214", "清除缓存失败:", e);
        }
        getRecommendedTeams(true).then(() => {
          formatAppLog("log", "at pages/team/recommended.vue:220", "推荐刷新完成");
        }).catch((err) => {
          formatAppLog("error", "at pages/team/recommended.vue:223", "推荐刷新出错:", err);
        }).finally(() => {
          uni.hideLoading();
          uni.showToast({
            title: "推荐已更新",
            icon: "success"
          });
        });
      }
      function viewTeamDetail(id) {
        uni.navigateTo({
          url: `/pages/team/detail?id=${id}`
        });
      }
      function goToProfile() {
        uni.switchTab({
          url: "/pages/profile/index"
        });
      }
      vue.onMounted(() => {
        getRecommendedTeams();
      });
      const __returned__ = { loading, recommendedTeams, aiSummary, headerBarRef, headerPlaceholderHeight, getRecommendedTeams, refreshRecommendations, viewTeamDetail, goToProfile, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, HeaderBar, TeamCard, TabBar, get teamApi() {
        return teamApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createVNode(
        $setup["HeaderBar"],
        {
          ref: "headerBarRef",
          title: "AI智能推荐",
          "show-search": false,
          "show-filter": false,
          "show-ai-recommend": false
        },
        null,
        512
        /* NEED_PATCH */
      ),
      vue.createCommentVNode(" 页面内容 "),
      vue.createElementVNode(
        "scroll-view",
        {
          "scroll-y": "",
          class: "content-scroll",
          style: vue.normalizeStyle({ paddingTop: $setup.headerPlaceholderHeight })
        },
        [
          vue.createCommentVNode(" AI分析摘要 "),
          $setup.aiSummary ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "ai-summary"
          }, [
            vue.createElementVNode("view", { class: "summary-header" }, [
              vue.createElementVNode("text", { class: "summary-title" }, "✨ AI分析结果")
            ]),
            vue.createElementVNode(
              "text",
              { class: "summary-content" },
              vue.toDisplayString($setup.aiSummary),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 推荐队伍列表 "),
          vue.createElementVNode("view", { class: "section" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "为您推荐的队伍"),
              vue.createElementVNode("view", {
                class: "refresh-btn",
                onClick: $setup.refreshRecommendations
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-refresh" })
              ])
            ]),
            $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "loading-container"
            }, [
              vue.createElementVNode("view", { class: "loading-circle" }),
              vue.createElementVNode("text", { class: "loading-text" }, "正在加载推荐...")
            ])) : $setup.recommendedTeams.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "team-list"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.recommendedTeams, (team, index) => {
                  return vue.openBlock(), vue.createBlock($setup["TeamCard"], {
                    key: team.id,
                    team,
                    index,
                    "show-match": true,
                    onDetail: $setup.viewTeamDetail
                  }, null, 8, ["team", "index"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "empty-state"
            }, [
              vue.createElementVNode("image", {
                class: "empty-icon",
                src: _imports_0$2,
                mode: "aspectFit"
              }),
              vue.createElementVNode("text", { class: "empty-text" }, "暂无推荐，请完善个人资料后再试"),
              vue.createElementVNode("button", {
                class: "primary-btn",
                onClick: $setup.goToProfile
              }, "完善资料")
            ]))
          ])
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const PagesTeamRecommended = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/recommended.vue"]]);
  const _sfc_main$c = {
    components: {
      TabBar,
      HeaderBar
    },
    data() {
      return {
        // 分类数据
        categories: ["全部竞赛", "学科竞赛", "创新创业", "科技竞赛", "文体竞赛"],
        currentCategory: 0,
        loading: false,
        hasMore: true,
        currentPage: 1,
        pageSize: 10,
        // 热门竞赛数据
        hotCompetitions: [],
        // 竞赛列表数据
        competitionList: [],
        // 热门竞赛轮播控制
        currentHotIndex: 0,
        // HeaderBar占位高度
        headerPlaceholderHeight: "200rpx"
      };
    },
    onLoad() {
      this.getHotCompetitions();
      this.getCompetitionList();
      this.updateHeaderHeight();
    },
    mounted() {
      setTimeout(() => {
        this.updateHeaderHeight();
      }, 300);
    },
    // 页面相关生命周期函数
    onPullDownRefresh() {
      this.onRefresh();
    },
    onReachBottom() {
      this.loadMore();
    },
    methods: {
      // 更新HeaderBar占位高度
      updateHeaderHeight() {
        const headerBarRef = this.$refs.headerBarRef;
        if (headerBarRef && headerBarRef.headerHeight) {
          this.headerPlaceholderHeight = headerBarRef.headerHeight + "rpx";
        } else {
          this.headerPlaceholderHeight = this.categories.length > 0 ? "200rpx" : "120rpx";
        }
      },
      // 轮播切换事件
      onSwiperChange(e) {
        this.currentHotIndex = e.detail.current;
      },
      // 手动切换到指定轮播
      switchToSlide(index) {
        this.currentHotIndex = index;
      },
      // 获取热门竞赛数据
      async getHotCompetitions() {
        try {
          this.loading = true;
          const res = await api.competitions.getCompetitionsList({
            pageSize: 3,
            isHot: true
          });
          if (res && res.code === 200 && res.data && Array.isArray(res.data.list)) {
            this.hotCompetitions = res.data.list;
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/index.vue:227", "获取热门竞赛失败:", error);
          uni.showToast({
            title: "获取热门竞赛失败",
            icon: "none"
          });
          this.hotCompetitions = [];
        } finally {
          this.loading = false;
        }
      },
      // 获取竞赛列表数据
      async getCompetitionList(reset = true) {
        try {
          if (reset) {
            this.currentPage = 1;
            this.competitionList = [];
          }
          if (!this.hasMore && !reset)
            return;
          this.loading = true;
          const params = {
            pageNum: this.currentPage,
            pageSize: this.pageSize
          };
          if (this.currentCategory > 0) {
            const categoryMapping = [null, 1, 2, 3, 4];
            params.categoryId = categoryMapping[this.currentCategory];
          }
          const res = await api.competitions.getCompetitionsList(params);
          if (res && res.code === 200 && res.data) {
            if (reset) {
              this.competitionList = Array.isArray(res.data.list) ? res.data.list : [];
            } else {
              if (Array.isArray(res.data.list)) {
                this.competitionList = [...this.competitionList, ...res.data.list];
              }
            }
            this.hasMore = res.data.hasNext || false;
            if (this.competitionList.length === 0) {
              uni.showToast({
                title: "暂无竞赛数据",
                icon: "none"
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/index.vue:287", "获取竞赛列表失败:", error);
          uni.showToast({
            title: "获取竞赛列表失败",
            icon: "none"
          });
          if (reset) {
            this.competitionList = [];
          }
        } finally {
          this.loading = false;
        }
      },
      // 加载更多数据
      loadMore() {
        if (this.loading || !this.hasMore)
          return;
        this.currentPage++;
        this.getCompetitionList(false);
      },
      // 下拉刷新
      onRefresh() {
        this.getCompetitionList(true);
        this.getHotCompetitions();
        uni.stopPullDownRefresh();
      },
      // 获取分类对应的样式类
      getCategoryClass(category) {
        switch (category) {
          case "创新创业":
            return "tag-orange";
          case "学科竞赛":
            return "tag-green";
          case "科技竞赛":
            return "tag-blue";
          case "文体竞赛":
            return "tag-purple";
          default:
            return "";
        }
      },
      // 获取状态对应的样式类
      getStatusClass(status) {
        switch (status) {
          case "0":
            return "status-upcoming";
          case "1":
            return "status-active";
          case "2":
            return "status-ongoing";
          case "3":
            return "status-ended";
          default:
            return "";
        }
      },
      // 格式化日期
      formatDate(dateString) {
        if (!dateString)
          return "";
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
      },
      // 是否为报名前期（未开始）
      isUpcoming(item) {
        return item.status === "0";
      },
      // 选择分类
      selectCategory(index) {
        if (this.currentCategory === index)
          return;
        this.currentCategory = index;
        this.getCompetitionList(true);
      },
      // 查看竞赛详情
      viewDetail(id) {
        uni.navigateTo({
          url: `/pages/competition/detail?id=${id}`
        });
      },
      // 处理标签切换
      handleTabChange(tab) {
        if (tab === "home") {
          uni.switchTab({
            url: "/pages/index/index"
          });
        } else if (tab === "team") {
          uni.switchTab({
            url: "/pages/team/list"
          });
        } else if (tab === "profile") {
          uni.switchTab({
            url: "/pages/profile/index"
          });
        }
      },
      goToNotification() {
        uni.navigateTo({
          url: "/pages/Xiaoxi/Xiaoxi"
        });
      },
      // 跳转到搜索页面
      goToSearch() {
        uni.navigateTo({
          url: "/pages/search/index"
        });
      },
      // 显示发布选项
      showPublishOptions() {
        uni.showActionSheet({
          itemList: ["发布竞赛信息", "招募队友", "发布项目展示"],
          success: function(res) {
            uni.showToast({
              title: `选择了: ${res.tapIndex}`,
              icon: "none"
            });
          }
        });
      },
      // 获取操作按钮文本
      getActionText(status) {
        switch (status) {
          case "0":
            return "提醒我";
          case "1":
          case "2":
            return "查看详情";
          case "3":
            return "查看结果";
          default:
            return "查看详情";
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_header_bar = vue.resolveComponent("header-bar");
    const _component_tab_bar = vue.resolveComponent("tab-bar");
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "container",
        ref: "instance"
      },
      [
        vue.createCommentVNode(" 顶部导航栏 "),
        vue.createVNode(_component_header_bar, {
          ref: "headerBarRef",
          title: "竞赛广场",
          categories: $data.categories,
          "default-category": $data.currentCategory,
          "show-filter": "true",
          onSearch: $options.goToSearch,
          onFilter: $options.goToNotification,
          onCategoryChange: $options.selectCategory
        }, null, 8, ["categories", "default-category", "onSearch", "onFilter", "onCategoryChange"]),
        vue.createCommentVNode(" 导航栏占位 "),
        vue.createElementVNode(
          "view",
          {
            class: "header-placeholder",
            style: vue.normalizeStyle({ height: $data.headerPlaceholderHeight })
          },
          null,
          4
          /* STYLE */
        ),
        vue.createCommentVNode(" 竞赛内容区域 "),
        vue.createElementVNode(
          "scroll-view",
          {
            "scroll-y": "true",
            class: "competition-content",
            onScrolltolower: _cache[2] || (_cache[2] = (...args) => $options.loadMore && $options.loadMore(...args))
          },
          [
            vue.createCommentVNode(" 热门竞赛 "),
            $data.hotCompetitions && $data.hotCompetitions.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode("text", { class: "section-title" }, "热门竞赛")
              ]),
              vue.createElementVNode("swiper", {
                class: "hot-swiper",
                indicator: false,
                autoplay: true,
                interval: 3e3,
                duration: 500,
                circular: true,
                current: $data.currentHotIndex,
                onChange: _cache[0] || (_cache[0] = (...args) => $options.onSwiperChange && $options.onSwiperChange(...args))
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.hotCompetitions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("swiper-item", {
                      key: index,
                      class: "hot-swiper-item"
                    }, [
                      vue.createElementVNode("view", {
                        class: "hot-item",
                        onClick: ($event) => $options.viewDetail(item.id)
                      }, [
                        vue.createElementVNode("image", {
                          class: "hot-img",
                          src: item.coverImageUrl,
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode("view", { class: "hot-overlay" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "hot-title" },
                            vue.toDisplayString(item.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "hot-desc" },
                            vue.toDisplayString(item.shortDescription),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("view", { class: "hot-info" }, [
                            vue.createElementVNode("view", { class: "hot-info-item" }, [
                              vue.createElementVNode("text", { class: "iconfont icon-calendar" }),
                              vue.createElementVNode(
                                "text",
                                { class: "hot-date" },
                                "报名截止: " + vue.toDisplayString($options.formatDate(item.registrationDeadline)),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode("view", { class: "hot-info-item" }, [
                              vue.createElementVNode("text", { class: "iconfont icon-team" }),
                              vue.createElementVNode(
                                "text",
                                { class: "hot-team" },
                                vue.toDisplayString(item.teamSize) + "~" + vue.toDisplayString(item.teamMax) + "人",
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ])
                      ], 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ], 40, ["current"]),
              vue.createElementVNode("view", { class: "dots-container" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.hotCompetitions, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: vue.normalizeClass(["dot", { "active-dot": $data.currentHotIndex === index }]),
                      onClick: ($event) => $options.switchToSlide(index)
                    }, null, 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 竞赛列表 "),
            vue.createElementVNode("view", { class: "section" }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode("text", { class: "section-title" }, "最新竞赛")
              ]),
              vue.createElementVNode("view", { class: "competition-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.competitionList, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "competition-card",
                      key: index,
                      onClick: ($event) => $options.viewDetail(item.id)
                    }, [
                      vue.createElementVNode("view", { class: "card-image-wrapper" }, [
                        vue.createElementVNode("image", {
                          class: "card-image",
                          src: item.coverImageUrl,
                          mode: "aspectFill"
                        }, null, 8, ["src"]),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["status-badge", $options.getStatusClass(item.status)])
                          },
                          vue.toDisplayString(item.statusText),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "card-content" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "card-title" },
                          vue.toDisplayString(item.title),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "card-desc" },
                          vue.toDisplayString(item.shortDescription),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "card-tags" }, [
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["category-tag", $options.getCategoryClass(item.categoryName)])
                            },
                            vue.toDisplayString(item.categoryName),
                            3
                            /* TEXT, CLASS */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "level-tag" },
                            vue.toDisplayString(item.level),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode("text", { class: "team-tag" }, [
                            vue.createElementVNode("text", { class: "iconfont icon-team" }),
                            vue.createTextVNode(
                              " " + vue.toDisplayString(item.teamSize) + "~" + vue.toDisplayString(item.teamMax) + "人 ",
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        vue.createElementVNode("view", { class: "card-footer" }, [
                          vue.createElementVNode("view", { class: "date-info" }, [
                            vue.createElementVNode("text", { class: "iconfont icon-calendar" }),
                            vue.createElementVNode(
                              "text",
                              { class: "date-text" },
                              vue.toDisplayString($options.isUpcoming(item) ? "报名开始" : "报名截止") + ": " + vue.toDisplayString($options.formatDate($options.isUpcoming(item) ? item.registrationStart : item.registrationDeadline)),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createElementVNode(
                            "view",
                            {
                              class: vue.normalizeClass(["action-btn", { "disabled-btn": item.status === "0" || item.status === "3" }])
                            },
                            vue.toDisplayString($options.getActionText(item.status)),
                            3
                            /* TEXT, CLASS */
                          )
                        ])
                      ])
                    ], 8, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                vue.createCommentVNode(" 加载更多提示 "),
                $data.competitionList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "loading-more"
                }, [
                  $data.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : $data.hasMore ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    onClick: _cache[1] || (_cache[1] = (...args) => $options.loadMore && $options.loadMore(...args))
                  }, "点击加载更多")) : (vue.openBlock(), vue.createElementBlock("text", { key: 2 }, "没有更多竞赛了"))
                ])) : vue.createCommentVNode("v-if", true),
                vue.createCommentVNode(" 空状态 "),
                $data.competitionList.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "empty-state"
                }, [
                  vue.createElementVNode("text", { class: "empty-text" }, "暂无竞赛数据")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ])
          ],
          32
          /* NEED_HYDRATION */
        ),
        vue.createCommentVNode(" 底部导航栏 "),
        vue.createVNode(_component_tab_bar, {
          "active-tab": "competition",
          onTabChange: $options.handleTabChange,
          onPublish: $options.showPublishOptions
        }, null, 8, ["onTabChange", "onPublish"])
      ],
      512
      /* NEED_PATCH */
    );
  }
  const PagesCompetitionIndex = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/index.vue"]]);
  const _sfc_main$b = {
    __name: "create",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.reactive({
        title: "",
        categoryId: null,
        level: "",
        shortDescription: "",
        description: "",
        requirements: "",
        registrationStart: "",
        registrationEnd: "",
        teamMin: "",
        teamMax: "",
        isHot: false,
        websiteUrl: "",
        name: "",
        contactQQ: "",
        contactEmail: "",
        coverUrl: "",
        coverFile: null,
        attachments: []
      });
      const categoryOptions = vue.ref([]);
      const levelOptions = ["国家级", "省级", "市级", "校级"];
      vue.onMounted(async () => {
        await checkAdminRole();
        await loadCategories();
      });
      async function loadCategories() {
        try {
          const res = await competitionsApi.getCompetitionCategories();
          if (res.code === 200 && res.data && Array.isArray(res.data)) {
            categoryOptions.value = res.data.map((item) => ({
              label: item.name,
              value: item.id,
              icon: getIconForCategory(item.name),
              id: item.id
            }));
          } else {
            formatAppLog("error", "at pages/competition/create.vue:350", "获取分类失败:", res);
            setDefaultCategories();
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/create.vue:354", "获取分类出错:", error);
          setDefaultCategories();
        }
      }
      function getIconForCategory(name) {
        const iconMap = {
          "计算机类": "iconfont icon-computer",
          "设计类": "iconfont icon-palette",
          "创新创业": "iconfont icon-lightbulb",
          "学科竞赛": "iconfont icon-book",
          "科技竞赛": "iconfont icon-chip",
          "文化艺术": "iconfont icon-palette",
          "体育竞赛": "iconfont icon-running"
        };
        return iconMap[name] || "iconfont icon-more";
      }
      function setDefaultCategories() {
        categoryOptions.value = [
          { label: "创新创业", value: 2, icon: "iconfont icon-lightbulb", id: 2 },
          { label: "学科竞赛", value: 1, icon: "iconfont icon-book", id: 1 },
          { label: "科技竞赛", value: 3, icon: "iconfont icon-chip", id: 3 },
          { label: "文化艺术", value: 4, icon: "iconfont icon-palette", id: 4 },
          { label: "体育竞赛", value: 5, icon: "iconfont icon-running", id: 5 },
          { label: "其他", value: 6, icon: "iconfont icon-more", id: 6 }
        ];
      }
      async function checkAdminRole() {
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            redirectNoPermission();
            return;
          }
          const res = await userApi.getUserRole(token);
          if (res.code !== 200 || res.data !== "admin") {
            redirectNoPermission();
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/create.vue:400", "获取角色失败:", error);
          redirectNoPermission();
        }
      }
      function redirectNoPermission() {
        uni.showToast({
          title: "只有管理员才能发布竞赛",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
      function goBack() {
        uni.navigateBack();
      }
      function saveDraft() {
        if (!form.title) {
          return uni.showToast({
            title: "请输入竞赛标题",
            icon: "none"
          });
        }
        saveCompetition(0);
      }
      function uploadCover() {
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            form.coverUrl = res.tempFilePaths[0];
            form.coverFile = res.tempFiles[0];
          }
        });
      }
      function uploadAttachment() {
        uni.chooseFile({
          count: 5,
          type: "all",
          extension: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip"],
          success: (res) => {
            const files = res.tempFiles.map((file) => ({
              name: file.name || "未命名文件",
              path: file.path,
              size: file.size,
              file
              // 保存文件对象
            }));
            form.attachments = [...form.attachments, ...files];
          }
        });
      }
      function removeFile(index) {
        form.attachments.splice(index, 1);
      }
      function publishCompetition() {
        if (!validateForm())
          return;
        saveCompetition(1);
      }
      function validateForm() {
        if (!form.title) {
          showError("请输入竞赛标题");
          return false;
        }
        if (!form.categoryId) {
          showError("请选择竞赛分类");
          return false;
        }
        if (!form.level) {
          showError("请选择竞赛级别");
          return false;
        }
        if (!form.shortDescription) {
          showError("请填写竞赛简介");
          return false;
        }
        if (!form.description) {
          showError("请填写竞赛介绍");
          return false;
        }
        if (!form.requirements) {
          showError("请填写参赛要求");
          return false;
        }
        if (!form.registrationStart || !form.registrationEnd) {
          showError("请选择竞赛时间");
          return false;
        }
        if (!form.teamMin || !form.teamMax) {
          showError("请填写团队人数");
          return false;
        }
        if (!form.name || !form.contactEmail) {
          showError("请填写联系方式");
          return false;
        }
        if (!form.coverUrl) {
          showError("请上传竞赛封面");
          return false;
        }
        return true;
      }
      function showError(message) {
        uni.showToast({
          title: message,
          icon: "none"
        });
      }
      async function saveCompetition(status) {
        const competitionData = {
          title: form.title,
          categoryId: form.categoryId,
          level: form.level,
          shortDescription: form.shortDescription,
          description: form.description,
          requirements: form.requirements,
          registrationStart: form.registrationStart + "T00:00:00",
          registrationDeadline: form.registrationEnd + "T23:59:59",
          teamSize: parseInt(form.teamMin) || 1,
          teamMax: parseInt(form.teamMax) || 5,
          status: status.toString(),
          // 0: 草稿, 1: 已发布
          organizer: "主办方名称",
          // 这里可以添加主办方输入字段
          websiteUrl: form.websiteUrl,
          contactInfo: {
            email: form.contactEmail,
            qq: form.contactQQ,
            name: form.name
          }
        };
        uni.showLoading({
          title: status === 0 ? "保存中..." : "发布中..."
        });
        try {
          const formData = new FormData();
          formData.append("competitionData", JSON.stringify(competitionData));
          if (form.coverFile) {
            formData.append("coverImage", form.coverFile);
          }
          form.attachments.forEach((attachment, index) => {
            if (attachment.file) {
              formData.append("attachmentFiles", attachment.file);
            }
          });
          const token = uni.getStorageSync("token");
          const res = await new Promise((resolve, reject) => {
            uni.uploadFile({
              url: "http://localhost:8080/competitions/with-files",
              files: form.attachments.map((item) => ({
                name: "attachmentFiles",
                file: item.file
              })),
              filePath: form.coverUrl,
              name: "coverImage",
              formData: {
                "competitionData": JSON.stringify(competitionData)
              },
              header: {
                "Authorization": "Bearer " + token
              },
              success: (uploadRes) => {
                let result;
                try {
                  result = JSON.parse(uploadRes.data);
                } catch (e) {
                  result = { code: -1, message: "返回数据解析失败" };
                }
                resolve(result);
              },
              fail: (err) => {
                reject(err);
              }
            });
          });
          if (res.code === 200) {
            uni.showToast({
              title: status === 0 ? "保存成功" : "发布成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "操作失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/create.vue:669", "操作失败:", error);
          uni.showToast({
            title: "操作失败，请重试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
      const __returned__ = { form, categoryOptions, levelOptions, loadCategories, getIconForCategory, setDefaultCategories, checkAdminRole, redirectNoPermission, goBack, saveDraft, uploadCover, uploadAttachment, removeFile, publishCompetition, validateForm, showError, saveCompetition, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, get competitionsApi() {
        return competitionsApi;
      }, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_easyinput = resolveEasycom(vue.resolveDynamicComponent("uni-easyinput"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "sticky-header" }, [
        vue.createElementVNode("view", { class: "nav-bar" }, [
          vue.createElementVNode("view", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
          ]),
          vue.createElementVNode("text", { class: "page-title" }, "发布竞赛"),
          vue.createElementVNode("view", {
            class: "draft-btn",
            onClick: $setup.saveDraft
          }, "草稿箱")
        ])
      ]),
      vue.createCommentVNode(" 表单内容 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "form-content"
      }, [
        vue.createCommentVNode(" 竞赛基本信息 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "基本信息"),
          vue.createCommentVNode(" 竞赛标题 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛标题"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createVNode(_component_uni_easyinput, {
              type: "text",
              modelValue: $setup.form.title,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.title = $event),
              placeholder: "请输入竞赛名称（5-50字",
              clearable: false
            }, null, 8, ["modelValue"])
          ]),
          vue.createCommentVNode(" 竞赛分类 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛分类"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "category-grid" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.categoryOptions, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: vue.normalizeClass(["category-item", { "category-active": $setup.form.categoryId === item.id }]),
                    onClick: ($event) => $setup.form.categoryId = item.id
                  }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass(["category-icon", item.icon])
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(item.label),
                      1
                      /* TEXT */
                    )
                  ], 10, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createCommentVNode(" 竞赛级别 "),
          vue.createElementVNode("view", null, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛级别"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("scroll-view", {
              class: "level-scroll",
              "scroll-x": ""
            }, [
              vue.createElementVNode("view", { class: "level-list" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.levelOptions, (level, index) => {
                    return vue.createElementVNode("view", {
                      key: index,
                      class: vue.normalizeClass(["level-item", { "level-active": $setup.form.level === level }]),
                      onClick: ($event) => $setup.form.level = level
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(level),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ])
          ])
        ]),
        vue.createCommentVNode(" 竞赛详情 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "竞赛详情"),
          vue.createCommentVNode(" 竞赛简介 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛简介"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.shortDescription = $event),
                placeholder: "请填写竞赛简介（10-30个字）",
                class: "form-textarea",
                maxlength: "140"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.shortDescription]
            ])
          ]),
          vue.createCommentVNode(" 竞赛介绍 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛介绍"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.description = $event),
                placeholder: "请详细描述竞赛背景、目的和意义（50-1000字）",
                class: "form-textarea",
                maxlength: "2000"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.description]
            ])
          ]),
          vue.createCommentVNode(" 参赛要求 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "参赛要求"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.requirements = $event),
                placeholder: "请说明参赛资格、人数限制等要求（20-500字）",
                class: "form-textarea form-textarea-medium",
                maxlength: "1000"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.requirements]
            ])
          ])
        ]),
        vue.createCommentVNode(" 竞赛时间和团队信息 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "时间与团队"),
          vue.createCommentVNode(" 竞赛时间 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛时间"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "time-grid" }, [
              vue.createElementVNode("view", { class: "time-column" }, [
                vue.createElementVNode("text", { class: "time-label" }, "报名开始时间"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $setup.form.registrationStart,
                  onChange: _cache[4] || (_cache[4] = (e) => $setup.form.registrationStart = e.detail.value),
                  class: "date-picker"
                }, [
                  vue.createElementVNode("view", { class: "picker-view" }, [
                    $setup.form.registrationStart ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      { key: 0 },
                      vue.toDisplayString($setup.form.registrationStart),
                      1
                      /* TEXT */
                    )) : (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "placeholder-text"
                    }, "选择日期"))
                  ])
                ], 40, ["value"])
              ]),
              vue.createElementVNode("view", { class: "time-column" }, [
                vue.createElementVNode("text", { class: "time-label" }, "报名截止时间"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $setup.form.registrationEnd,
                  onChange: _cache[5] || (_cache[5] = (e) => $setup.form.registrationEnd = e.detail.value),
                  class: "date-picker"
                }, [
                  vue.createElementVNode("view", { class: "picker-view" }, [
                    $setup.form.registrationEnd ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      { key: 0 },
                      vue.toDisplayString($setup.form.registrationEnd),
                      1
                      /* TEXT */
                    )) : (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "placeholder-text"
                    }, "选择日期"))
                  ])
                ], 40, ["value"])
              ])
            ])
          ]),
          vue.createCommentVNode(" 团队人数 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "团队人数"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "time-grid" }, [
              vue.createElementVNode("view", { class: "time-column" }, [
                vue.createElementVNode("text", { class: "time-label" }, "最少人数"),
                vue.createVNode(_component_uni_easyinput, {
                  type: "number",
                  modelValue: $setup.form.teamMin,
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.teamMin = $event),
                  placeholder: "输入人数",
                  clearable: false
                }, null, 8, ["modelValue"])
              ]),
              vue.createElementVNode("view", { class: "time-column" }, [
                vue.createElementVNode("text", { class: "time-label" }, "最多人数"),
                vue.createVNode(_component_uni_easyinput, {
                  type: "number",
                  modelValue: $setup.form.teamMax,
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.form.teamMax = $event),
                  placeholder: "输入人数",
                  clearable: false
                }, null, 8, ["modelValue"])
              ])
            ])
          ]),
          vue.createCommentVNode(" 是否设为热门 "),
          vue.createElementVNode("view", { class: "hot-toggle" }, [
            vue.createElementVNode("view", { class: "hot-info" }, [
              vue.createElementVNode("text", { class: "hot-title" }, "设为热门竞赛"),
              vue.createElementVNode("text", { class: "hot-desc" }, "热门竞赛将在首页和竞赛列表优先展示")
            ]),
            vue.createElementVNode("switch", {
              checked: $setup.form.isHot,
              onChange: _cache[8] || (_cache[8] = (e) => $setup.form.isHot = e.detail.value),
              color: "#00aaff"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createCommentVNode(" 联系方式与附件 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "联系方式与附件"),
          vue.createCommentVNode(" 官方网站 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "官方网站（可选）")
            ]),
            vue.createVNode(_component_uni_easyinput, {
              type: "text",
              modelValue: $setup.form.websiteUrl,
              "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.form.websiteUrl = $event),
              placeholder: "输入网站",
              clearable: false
            }, null, 8, ["modelValue"])
          ]),
          vue.createCommentVNode(" 联系方式 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "联系方式"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", { class: "contact-grid" }, [
              vue.createElementVNode("view", { class: "contact-row" }, [
                vue.createElementVNode("view", { class: "contact-input" }, [
                  vue.createElementVNode("text", { class: "contact-icon iconfont icon-user" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $setup.form.name = $event),
                      placeholder: "联系人"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.name]
                  ])
                ]),
                vue.createElementVNode("view", { class: "contact-input" }, [
                  vue.createElementVNode("text", { class: "contact-icon iconfont icon-qq" }),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.form.contactQQ = $event),
                      placeholder: "QQ群"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.form.contactQQ]
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "contact-input contact-email" }, [
                vue.createElementVNode("text", { class: "contact-icon iconfont icon-email" }),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "text",
                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $setup.form.contactEmail = $event),
                    placeholder: "联系邮箱"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.form.contactEmail]
                ])
              ])
            ])
          ]),
          vue.createCommentVNode(" 上传封面 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛封面"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.createElementVNode("view", {
              class: "upload-box",
              onClick: $setup.uploadCover
            }, [
              !$setup.form.coverUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-placeholder"
              }, [
                vue.createElementVNode("text", { class: "upload-icon iconfont icon-image" }),
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传或拖拽图片至此处"),
                vue.createElementVNode("text", { class: "upload-tip" }, "建议尺寸：800x400，文件大小不超过2MB")
              ])) : (vue.openBlock(), vue.createElementBlock("image", {
                key: 1,
                src: $setup.form.coverUrl,
                mode: "aspectFill",
                class: "cover-image"
              }, null, 8, ["src"]))
            ])
          ]),
          vue.createCommentVNode(" 上传附件 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("view", { class: "form-label" }, [
              vue.createElementVNode("text", null, "竞赛附件（可选）")
            ]),
            vue.createElementVNode("view", {
              class: "upload-box",
              onClick: $setup.uploadAttachment
            }, [
              $setup.form.attachments.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-placeholder"
              }, [
                vue.createElementVNode("text", { class: "upload-icon iconfont icon-file" }),
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传或拖拽文件至此处"),
                vue.createElementVNode("text", { class: "upload-tip" }, "支持PDF、Word、PPT等格式，单个文件不超过10MB")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "file-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.form.attachments, (file, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "file-item"
                    }, [
                      vue.createElementVNode("text", { class: "file-icon iconfont icon-file" }),
                      vue.createElementVNode(
                        "text",
                        { class: "file-name" },
                        vue.toDisplayString(file.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", {
                        class: "delete-icon iconfont icon-close",
                        onClick: vue.withModifiers(($event) => $setup.removeFile(index), ["stop"])
                      }, null, 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]))
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部操作按钮 "),
      vue.createElementVNode("view", { class: "action-bar" }, [
        vue.createElementVNode("view", { class: "action-grid" }, [
          vue.createElementVNode("button", {
            class: "draft-button",
            onClick: $setup.saveDraft
          }, "保存草稿"),
          vue.createElementVNode("button", {
            class: "publish-button",
            onClick: $setup.publishCompetition
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-send" }),
            vue.createElementVNode("text", null, "发布竞赛")
          ])
        ])
      ])
    ]);
  }
  const PagesCompetitionCreate = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/create.vue"]]);
  const _sfc_main$a = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const competitionId = vue.ref(null);
      const loading = vue.ref(false);
      const currentTab = vue.ref("details");
      const competition = vue.ref({
        id: null,
        title: "",
        category: "",
        level: "国家级",
        status: "",
        // 可能的值: '未开始', '报名中', '进行中', '已截止'
        statusCode: "",
        // 状态码: "0"=未开始, "1"=报名中, "2"=进行中, "3"=已截止
        image: "",
        registrationPeriod: "",
        registrationStart: "",
        registrationDeadline: "",
        competitionPeriod: "",
        location: "线上初赛 + 线下决赛",
        teamRequirement: "",
        description: "",
        shortDescription: "",
        requirements: "",
        organizer: {
          name: "",
          description: "",
          logo: ""
        },
        contactInfo: {
          phone: "",
          email: ""
        },
        teamSize: 0,
        teamMax: 0,
        websiteUrl: "",
        viewCount: 0,
        attachments: [],
        categoryNames: [],
        coverImageUrl: ""
      });
      const competitionStages = vue.ref([
        {
          title: "报名阶段",
          period: "",
          description: "在此阶段，参赛团队需完成在线报名，提交团队基本信息和项目概述。报名成功后，团队可以开始准备初赛材料。",
          status: "进行中",
          active: true
        },
        {
          title: "初赛阶段",
          period: "",
          description: "各参赛团队需提交商业计划书和项目PPT。评审委员会将对所有参赛项目进行评审，选拔优秀项目进入复赛。",
          status: "未开始",
          active: false
        },
        {
          title: "复赛阶段",
          period: "",
          description: "入围复赛的团队将进行现场路演和答辩。评委将从项目创新性、商业模式、团队能力等多方面进行评估。",
          status: "未开始",
          active: false
        },
        {
          title: "总决赛",
          period: "",
          description: "决赛将在北京举行，入围团队将进行最终路演和展示。评审团将评选出金、银、铜奖项目，并举行颁奖典礼。",
          status: "未开始",
          active: false
        }
      ]);
      const relatedCompetitions = vue.ref([
        {
          title: "挑战杯创业计划大赛",
          image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500",
          deadline: "6月10日"
        },
        {
          title: "创青春创业大赛",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500",
          deadline: "7月5日"
        }
      ]);
      const teams = vue.ref([]);
      const teamsLoading = vue.ref(false);
      const teamsCurrentPage = vue.ref(1);
      const teamsPageSize = vue.ref(10);
      const teamsHasMore = vue.ref(true);
      const searchText = vue.ref("");
      async function getCompetitionDetail(id) {
        loading.value = true;
        try {
          const res = await api.competitions.getCompetitionDetail(id);
          if (res && res.code === 200 && res.data) {
            const data = res.data;
            competition.value = {
              ...competition.value,
              id: data.id,
              title: data.title,
              category: data.categoryNames && data.categoryNames.length > 0 ? data.categoryNames[0] : "",
              level: data.level || "国家级",
              status: getStatusText(data.status),
              statusCode: data.status,
              image: data.coverImageUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
              registrationStart: data.registrationStart,
              registrationDeadline: data.registrationDeadline,
              registrationPeriod: formatDatePeriod(data.registrationStart, data.registrationDeadline),
              description: data.description || data.shortDescription || "",
              shortDescription: data.shortDescription || "",
              requirements: data.requirements || "",
              teamRequirement: `${data.teamSize}~${data.teamMax}人/队`,
              teamSize: data.teamSize,
              teamMax: data.teamMax,
              organizer: {
                name: data.organizer || "未知主办方",
                description: "",
                logo: ""
              },
              contactInfo: data.contactInfo || {
                phone: "暂无联系方式",
                email: ""
              },
              websiteUrl: data.websiteUrl || "",
              viewCount: data.viewCount || 0,
              attachments: data.attachments || [],
              categoryNames: data.categoryNames || [],
              coverImageUrl: data.coverImageUrl || ""
            };
            updateCompetitionStages(data);
            formatAppLog("log", "at pages/competition/detail.vue:410", "竞赛详情数据:", competition.value);
          } else {
            uni.showToast({
              title: "获取竞赛详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/detail.vue:418", "获取竞赛详情错误:", error);
          uni.showToast({
            title: "获取竞赛详情失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      function getStatusText(status) {
        switch (status) {
          case "0":
            return "未开始";
          case "1":
            return "报名中";
          case "2":
            return "进行中";
          case "3":
            return "已截止";
          default:
            return "未知状态";
        }
      }
      function formatDatePeriod(startDate, endDate) {
        if (!startDate || !endDate)
          return "";
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        };
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
      function updateCompetitionStages(data) {
        if (data.registrationStart && data.registrationDeadline) {
          competitionStages.value[0].period = formatDatePeriod(data.registrationStart, data.registrationDeadline);
          const now = /* @__PURE__ */ new Date();
          const regStartDate = new Date(data.registrationStart);
          const regEndDate = new Date(data.registrationDeadline);
          if (now < regStartDate) {
            competitionStages.value[0].status = "未开始";
            competitionStages.value[0].active = false;
          } else if (now >= regStartDate && now <= regEndDate) {
            competitionStages.value[0].status = "进行中";
            competitionStages.value[0].active = true;
          } else {
            competitionStages.value[0].status = "已结束";
            competitionStages.value[0].active = false;
          }
          if (data.status === "2") {
            competitionStages.value[1].active = true;
            competitionStages.value[1].status = "进行中";
            competitionStages.value[0].status = "已结束";
          } else if (data.status === "3") {
            competitionStages.value[0].status = "已结束";
            competitionStages.value[1].status = "已结束";
            competitionStages.value[2].status = "已结束";
            competitionStages.value[3].status = "已结束";
          }
        }
      }
      async function getCompetitionTeams(refresh = true) {
        if (refresh) {
          teamsCurrentPage.value = 1;
          teams.value = [];
        }
        if (!teamsHasMore.value && !refresh)
          return;
        teamsLoading.value = true;
        try {
          const res = await api.team.getTeamList({
            pageNum: teamsCurrentPage.value,
            pageSize: teamsPageSize.value,
            competitionId: competitionId.value
          });
          if (res.code === 200 && res.data) {
            const teamList = res.data.list || [];
            const processedTeams = teamList.map((team) => {
              let avatars = [];
              if (team.teamMemberAvatars) {
                if (typeof team.teamMemberAvatars === "string") {
                  avatars = team.teamMemberAvatars.split(",").filter((avatar) => avatar);
                } else if (Array.isArray(team.teamMemberAvatars)) {
                  avatars = team.teamMemberAvatars.filter((avatar) => avatar);
                }
              }
              let statusColor = "#6B7280";
              if (team.status === "0" || team.statusText === "招募中") {
                statusColor = "#2563EB";
              } else if (team.status === "1" || team.statusText === "进行中") {
                statusColor = "#10B981";
              } else if (team.status === "2" || team.statusText === "已完成") {
                statusColor = "#059669";
              }
              const memberCount = team.memberCount || team.currentMemberCount || 0;
              const maxMemberCount = team.maxMemberCount || 0;
              const remainingCount = Math.max(0, maxMemberCount - memberCount);
              const facultyColor = getRandomColor(team.faculty || team.direction || "");
              let roles = [];
              if (team.roles && team.roles.length > 0) {
                roles = team.roles.map((role) => ({
                  id: role.id || 0,
                  name: role.name || "未知角色",
                  description: role.description || "",
                  currentCount: role.currentCount || 0,
                  requiredCount: role.requiredCount || 1,
                  isFilled: (role.currentCount || 0) >= (role.requiredCount || 1)
                }));
              }
              return {
                ...team,
                avatars: avatars.slice(0, 3),
                // 最多显示3个头像
                statusColor,
                memberCount,
                remainingCount,
                actionText: team.status === "0" ? "申请加入" : "查看详情",
                facultyColor,
                faculty: team.direction || "未知方向",
                // 使用研究方向作为院系显示
                roles
              };
            });
            if (refresh) {
              teams.value = processedTeams;
            } else {
              teams.value = [...teams.value, ...processedTeams];
            }
            teamsHasMore.value = res.data.hasNext || false;
            if (teams.value.length === 0 && !refresh) {
              uni.showToast({
                title: "没有更多团队了",
                icon: "none"
              });
            }
          } else {
            if (refresh) {
              uni.showToast({
                title: "暂无参赛队伍",
                icon: "none"
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/detail.vue:591", "获取竞赛队伍列表失败:", error);
          uni.showToast({
            title: "获取队伍列表失败",
            icon: "none"
          });
        } finally {
          teamsLoading.value = false;
        }
      }
      function getRandomColor(str) {
        const colors = [
          "#2563EB",
          // 蓝色
          "#10B981",
          // 绿色
          "#8B5CF6",
          // 紫色
          "#EC4899",
          // 粉色
          "#F59E0B",
          // 橙色
          "#EF4444"
          // 红色
        ];
        let hash = 0;
        if (str.length === 0)
          return colors[0];
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
          hash = hash & hash;
        }
        hash = Math.abs(hash) % colors.length;
        return colors[hash];
      }
      function loadMoreTeams() {
        if (teamsLoading.value || !teamsHasMore.value)
          return;
        teamsCurrentPage.value++;
        getCompetitionTeams(false);
      }
      function switchTab(tab) {
        currentTab.value = tab;
        if (tab === "teams" && teams.value.length === 0) {
          getCompetitionTeams();
        }
      }
      function viewTeamDetail(teamId) {
        uni.navigateTo({
          url: `/pages/team/detail?id=${teamId}`
        });
      }
      vue.onMounted(() => {
        const pages = getCurrentPages();
        const page = pages[pages.length - 1];
        if (page.$page && page.$page.options) {
          competitionId.value = page.$page.options.id;
          if (competitionId.value) {
            getCompetitionDetail(competitionId.value).finally(() => {
              uni.hideLoading();
            });
          } else {
            uni.hideLoading();
            uni.showToast({
              title: "竞赛ID不存在",
              icon: "none"
            });
          }
        } else {
          uni.hideLoading();
        }
      });
      function getTagClass(category) {
        switch (category) {
          case "创新创业":
            return "orange-tag";
          case "学科竞赛":
            return "green-tag";
          case "科技竞赛":
            return "blue-tag";
          case "文体竞赛":
            return "purple-tag";
          default:
            return "gray-tag";
        }
      }
      function getStatusBadgeClass(status) {
        switch (status) {
          case "未开始":
            return "status-badge bg-gray-500";
          case "报名中":
            return "status-badge bg-green-500";
          case "进行中":
            return "status-badge bg-blue-500";
          case "已截止":
            return "status-badge bg-gray-500";
          default:
            return "status-badge bg-gray-500";
        }
      }
      function getActionButtonText() {
        switch (competition.value.status) {
          case "未开始":
            return "提醒我";
          case "报名中":
            return "寻找队伍";
          case "进行中":
            return "查看队伍";
          case "已截止":
            return "查看结果";
          default:
            return "了解详情";
        }
      }
      function getRegistrationDeadline() {
        if (competition.value.registrationDeadline) {
          const date = new Date(competition.value.registrationDeadline);
          return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }
        if (competition.value.registrationPeriod) {
          const periodParts = competition.value.registrationPeriod.split(" - ");
          return periodParts.length > 1 ? periodParts[1] : competition.value.registrationPeriod;
        }
        return "暂无截止日期";
      }
      function goBack() {
        uni.navigateBack();
      }
      function clearSearch() {
        searchText.value = "";
      }
      function toggleFilter() {
        formatAppLog("log", "at pages/competition/detail.vue:751", "打开筛选选项");
      }
      function createTeam() {
        uni.navigateTo({
          url: `/pages/team/create?competitionId=${competition.value.id}&competitionName=${encodeURIComponent(competition.value.title)}`
        });
      }
      function handleActionButton() {
        const buttonText = getActionButtonText();
        switch (buttonText) {
          case "寻找队伍":
          case "查看队伍":
            currentTab.value = "teams";
            if (teams.value.length === 0) {
              getCompetitionTeams();
            }
            uni.pageScrollTo({
              selector: ".tab-active",
              duration: 300
            });
            break;
          case "提醒我":
            uni.showToast({
              title: "已设置提醒",
              icon: "success"
            });
            break;
          case "查看结果":
            uni.showToast({
              title: "比赛结果即将公布",
              icon: "none"
            });
            break;
          default:
            uni.showToast({
              title: "功能开发中",
              icon: "none"
            });
        }
      }
      const __returned__ = { competitionId, loading, currentTab, competition, competitionStages, relatedCompetitions, teams, teamsLoading, teamsCurrentPage, teamsPageSize, teamsHasMore, searchText, getCompetitionDetail, getStatusText, formatDatePeriod, updateCompetitionStages, getCompetitionTeams, getRandomColor, loadMoreTeams, switchTab, viewTeamDetail, getTagClass, getStatusBadgeClass, getActionButtonText, getRegistrationDeadline, goBack, clearSearch, toggleFilter, createTeam, handleActionButton, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 加载中状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "spinner" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 顶部导航栏 "),
          vue.createElementVNode("view", { class: "sticky-header" }, [
            vue.createElementVNode("view", { class: "flex-row px-4 py-3" }, [
              vue.createElementVNode("view", {
                class: "mr-3",
                onClick: $setup.goBack
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-arrow-left text-gray-600" })
              ]),
              vue.createElementVNode("text", { class: "text-xl font-bold text-gray-800" }, "竞赛详情"),
              vue.createElementVNode("view", { class: "ml-auto flex-row space-x-3" }, [
                vue.createElementVNode("view", { class: "p-2 rounded-full bg-gray-100" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-bookmark-outline text-gray-600" })
                ]),
                vue.createElementVNode("view", { class: "p-2 rounded-full bg-gray-100" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-share text-gray-600" })
                ])
              ])
            ])
          ]),
          vue.createCommentVNode(" 竞赛封面 "),
          vue.createElementVNode("view", { class: "relative" }, [
            vue.createElementVNode("image", {
              class: "cover-image",
              src: $setup.competition.image,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "cover-overlay" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass($setup.getStatusBadgeClass($setup.competition.status))
                },
                vue.toDisplayString($setup.competition.status),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode(
                "text",
                { class: "text-white text-2xl font-bold" },
                vue.toDisplayString($setup.competition.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "flex-row items-center mt-1 space-x-2" }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["category-tag", $setup.getTagClass($setup.competition.category)])
                  },
                  vue.toDisplayString($setup.competition.category),
                  3
                  /* TEXT, CLASS */
                )
              ])
            ])
          ]),
          vue.createCommentVNode(" 关键信息 "),
          vue.createElementVNode("view", { class: "bg-white p-4 shadow-sm" }, [
            vue.createElementVNode("view", { class: "flex-row justify-between items-center" }, [
              vue.createElementVNode("view", { class: "flex-row items-center space-x-2" }, [
                vue.createElementVNode("text", { class: "iconfont icon-calendar info-icon" }),
                vue.createElementVNode(
                  "text",
                  { class: "text-sm text-gray-700" },
                  "报名截止: " + vue.toDisplayString($setup.getRegistrationDeadline()),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "flex-row items-center space-x-2" }, [
                vue.createElementVNode("text", { class: "iconfont icon-users info-icon" }),
                vue.createElementVNode(
                  "text",
                  { class: "text-sm text-gray-700" },
                  vue.toDisplayString($setup.competition.teamRequirement),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "flex-row justify-between items-center mt-3" }, [
              vue.createElementVNode("view", {
                class: "flex-row items-center space-x-2",
                style: { "width": "60%" }
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-university info-icon" }),
                vue.createElementVNode(
                  "text",
                  { class: "text-sm text-gray-700" },
                  "主办方: " + vue.toDisplayString($setup.competition.organizer.name),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "flex-row items-center space-x-2" }, [
                vue.createElementVNode("text", { class: "iconfont icon-trophy info-icon" }),
                vue.createElementVNode(
                  "text",
                  { class: "text-sm text-gray-700" },
                  vue.toDisplayString($setup.competition.level),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createCommentVNode(" 标签页导航 "),
          vue.createElementVNode("view", { class: "bg-white mt-2 shadow-sm" }, [
            vue.createElementVNode("view", { class: "flex-row border-b" }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["flex-1 py-3 text-center text-sm font-medium", $setup.currentTab === "details" ? "tab-active" : "text-gray-500"]),
                  onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("details"))
                },
                "竞赛详情",
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["flex-1 py-3 text-center text-sm font-medium", $setup.currentTab === "schedule" ? "tab-active" : "text-gray-500"]),
                  onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("schedule"))
                },
                "赛程安排",
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["flex-1 py-3 text-center text-sm font-medium", $setup.currentTab === "teams" ? "tab-active" : "text-gray-500"]),
                  onClick: _cache[2] || (_cache[2] = ($event) => $setup.switchTab("teams"))
                },
                "参赛队伍",
                2
                /* CLASS */
              )
            ])
          ]),
          vue.createCommentVNode(" 竞赛详情内容 "),
          $setup.currentTab === "details" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "bg-white p-4 mt-2 shadow-sm"
          }, [
            vue.createElementVNode("view", { class: "font-bold text-lg text-gray-800 mb-3" }, "竞赛简介"),
            vue.createElementVNode(
              "text",
              { class: "text-gray-700 text-sm leading-relaxed" },
              vue.toDisplayString($setup.competition.description),
              1
              /* TEXT */
            ),
            $setup.competition.requirements ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "font-bold text-lg text-gray-800 mt-6 mb-3"
            }, "参赛要求")) : vue.createCommentVNode("v-if", true),
            $setup.competition.requirements ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "text-gray-700 text-sm leading-relaxed"
              },
              vue.toDisplayString($setup.competition.requirements),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "text-gray-700 text-sm space-y-2 list-disc pl-5 mt-6"
            }, [
              vue.createElementVNode("view", { class: "list-item" }, "参赛项目须为本校在校生，允许跨校组队"),
              vue.createElementVNode(
                "view",
                { class: "list-item" },
                "参赛团队成员" + vue.toDisplayString($setup.competition.teamRequirement),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "list-item" }, "参赛项目需具有创新性、可行性和商业价值"),
              vue.createElementVNode("view", { class: "list-item" }, "参赛项目需提交商业计划书和路演PPT"),
              vue.createElementVNode("view", { class: "list-item" }, "参赛项目需在报名截止前完成在线提交")
            ])),
            vue.createElementVNode("view", { class: "font-bold text-lg text-gray-800 mt-6 mb-3" }, "联系方式"),
            vue.createElementVNode("view", { class: "space-y-2 text-sm text-gray-700" }, [
              $setup.competition.contactInfo.phone ? (vue.openBlock(), vue.createElementBlock(
                "text",
                { key: 0 },
                "联系电话：" + vue.toDisplayString($setup.competition.contactInfo.phone),
                1
                /* TEXT */
              )) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "联系人：竞赛组委会")),
              $setup.competition.contactInfo.email ? (vue.openBlock(), vue.createElementBlock(
                "view",
                { key: 2 },
                "邮箱：" + vue.toDisplayString($setup.competition.contactInfo.email),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true),
              $setup.competition.websiteUrl ? (vue.openBlock(), vue.createElementBlock(
                "view",
                { key: 3 },
                "官网：" + vue.toDisplayString($setup.competition.websiteUrl),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createCommentVNode(" 附件列表 "),
            $setup.competition.attachments && $setup.competition.attachments.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 3,
              class: "mt-6"
            }, [
              vue.createElementVNode("view", { class: "font-bold text-lg text-gray-800 mb-3" }, "相关资料"),
              vue.createElementVNode("view", null, "无"),
              vue.createElementVNode("view", { class: "space-y-3" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.competition.attachments, (attachment, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "flex-row items-center p-3 bg-gray-50 rounded-lg"
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-file text-blue-500 mr-2" }),
                      vue.createElementVNode(
                        "text",
                        { class: "flex-1 text-sm text-gray-700" },
                        vue.toDisplayString(attachment.fileName),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "px-3 py-1 bg-blue-500 rounded-full" }, [
                        vue.createElementVNode("text", { class: "text-xs text-white" }, "下载")
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 相关竞赛 - 移动到详情标签页内 "),
            vue.createElementVNode("view", { class: "mt-6" }, [
              vue.createElementVNode("view", { class: "font-bold text-lg text-gray-800 mb-3" }, "相关竞赛"),
              vue.createElementVNode("view", { class: "related-grid" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.relatedCompetitions, (relatedComp, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "related-card"
                    }, [
                      vue.createElementVNode("view", { class: "related-image-container" }, [
                        vue.createElementVNode("image", {
                          src: relatedComp.image,
                          class: "related-image"
                        }, null, 8, ["src"])
                      ]),
                      vue.createElementVNode("view", { class: "p-3" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "font-bold text-sm text-gray-800" },
                          vue.toDisplayString(relatedComp.title),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "flex-row items-center mt-1" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "text-xs text-gray-500" },
                            "报名截止: " + vue.toDisplayString(relatedComp.deadline),
                            1
                            /* TEXT */
                          )
                        ])
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 赛程安排内容 "),
          $setup.currentTab === "schedule" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "bg-white p-4 mt-2 shadow-sm"
          }, [
            vue.createElementVNode("view", { class: "relative" }, [
              vue.createCommentVNode(" 时间轴 "),
              vue.createElementVNode("view", { class: "timeline-line" }),
              vue.createCommentVNode(" 阶段列表 "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.competitionStages, (stage, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "timeline-item"
                  }, [
                    vue.createElementVNode("view", { class: "timeline-dot-container" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["timeline-dot", stage.active ? "active-dot" : ""])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            { class: "timeline-dot-text" },
                            vue.toDisplayString(index + 1),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["timeline-content", stage.active ? "active-content" : ""])
                      },
                      [
                        vue.createElementVNode("view", { class: "flex-row justify-between items-center mb-2" }, [
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["font-bold", stage.active ? "text-blue-800" : "text-gray-700"])
                            },
                            vue.toDisplayString(stage.title),
                            3
                            /* TEXT, CLASS */
                          ),
                          vue.createElementVNode(
                            "text",
                            {
                              class: vue.normalizeClass(["status-text", stage.active ? "active-status" : "inactive-status"])
                            },
                            vue.toDisplayString(stage.status),
                            3
                            /* TEXT, CLASS */
                          )
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "text-sm text-gray-700 mb-2" },
                          vue.toDisplayString(stage.period),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "text-xs text-gray-600" },
                          vue.toDisplayString(stage.description),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 参赛队伍内容 "),
          $setup.currentTab === "teams" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "bg-white p-4 mt-2 shadow-sm"
          }, [
            vue.createCommentVNode(" 搜索和筛选 "),
            vue.createElementVNode("view", { class: "search-filter-container" }, [
              vue.createElementVNode("view", { class: "search-box" }, [
                vue.createElementVNode("text", { class: "iconfont icon-search search-icon" }),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "text",
                    placeholder: "搜索队伍",
                    class: "search-input",
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.searchText = $event)
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.searchText]
                ]),
                $setup.searchText ? (vue.openBlock(), vue.createElementBlock("text", {
                  key: 0,
                  class: "iconfont icon-close-circle clear-icon",
                  onClick: $setup.clearSearch
                })) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", {
                class: "filter-btn",
                onClick: $setup.toggleFilter
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-filter filter-icon" }),
                vue.createElementVNode("text", { class: "filter-text" }, "筛选")
              ])
            ]),
            vue.createCommentVNode(" 队伍列表 "),
            $setup.teams.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "space-y-4"
            }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.teams, (team) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: team.id,
                    class: "team-card",
                    onClick: ($event) => $setup.viewTeamDetail(team.id)
                  }, [
                    vue.createElementVNode("view", { class: "flex-row justify-between items-start" }, [
                      vue.createElementVNode("view", null, [
                        vue.createElementVNode(
                          "text",
                          { class: "font-bold text-gray-800" },
                          vue.toDisplayString(team.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("view", { class: "flex-row items-center mt-1" }, [
                          vue.createElementVNode(
                            "text",
                            {
                              class: "faculty-tag",
                              style: vue.normalizeStyle({ backgroundColor: team.facultyColor + "20", color: team.facultyColor })
                            },
                            vue.toDisplayString(team.faculty),
                            5
                            /* TEXT, STYLE */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "text-xs text-gray-500" },
                            vue.toDisplayString(team.memberCount) + "人团队",
                            1
                            /* TEXT */
                          )
                        ])
                      ]),
                      vue.createElementVNode(
                        "view",
                        {
                          class: "team-status",
                          style: vue.normalizeStyle({ backgroundColor: team.statusColor + "20", color: team.statusColor })
                        },
                        vue.toDisplayString(team.statusText),
                        5
                        /* TEXT, STYLE */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "text-sm text-gray-600 mt-3" },
                      "项目简介：" + vue.toDisplayString(team.description),
                      1
                      /* TEXT */
                    ),
                    vue.createCommentVNode(" 角色标签 "),
                    team.roles && team.roles.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "role-tags mt-3"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(team.roles, (role, roleIndex) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              key: roleIndex,
                              class: vue.normalizeClass(["role-tag", role.isFilled ? "role-filled" : "role-recruiting"])
                            },
                            [
                              vue.createElementVNode(
                                "text",
                                { class: "role-name" },
                                vue.toDisplayString(role.name),
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "role-count" },
                                vue.toDisplayString(role.currentCount || 0) + "/" + vue.toDisplayString(role.requiredCount || 1),
                                1
                                /* TEXT */
                              )
                            ],
                            2
                            /* CLASS */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "flex-row items-center justify-between mt-3" }, [
                      vue.createElementVNode("view", { class: "flex-row member-avatars" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(team.avatars, (avatar, idx) => {
                            return vue.openBlock(), vue.createElementBlock("image", {
                              key: idx,
                              src: avatar || "/static/images/default-avatar.png",
                              class: "member-avatar"
                            }, null, 8, ["src"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        )),
                        team.remainingCount > 0 ? (vue.openBlock(), vue.createElementBlock(
                          "view",
                          {
                            key: 0,
                            class: "member-avatar-more"
                          },
                          "+" + vue.toDisplayString(team.remainingCount),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "text-blue-500 text-sm" },
                        vue.toDisplayString(team.actionText),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : !$setup.teamsLoading ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createCommentVNode(" 空状态 "),
                vue.createElementVNode("view", { class: "empty-state" }, [
                  vue.createElementVNode("text", { class: "text-gray-500" }, "暂无参赛队伍")
                ])
              ],
              2112
              /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 加载状态 "),
            $setup.teamsLoading ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "loading-state"
            }, [
              vue.createElementVNode("view", { class: "spinner-sm" }),
              vue.createElementVNode("text", { class: "text-sm text-gray-500 ml-2" }, "加载中...")
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 加载更多 "),
            $setup.teams.length > 0 && $setup.teamsHasMore ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 3,
              class: "text-center mt-6"
            }, [
              vue.createElementVNode("button", {
                class: "load-more-btn",
                onClick: $setup.loadMoreTeams
              }, "加载更多")
            ])) : vue.createCommentVNode("v-if", true)
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 底部固定按钮 "),
          vue.createElementVNode("view", { class: "fixed-bottom" }, [
            vue.createElementVNode("button", {
              class: "team-btn",
              onClick: $setup.createTeam
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-users mr-1" }),
              vue.createElementVNode("text", null, "创建队伍")
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["register-btn", { "disabled-btn": $setup.competition.statusCode === "0" || $setup.competition.statusCode === "3" }]),
              disabled: $setup.competition.statusCode === "0" || $setup.competition.statusCode === "3",
              onClick: $setup.handleActionButton
            }, vue.toDisplayString($setup.getActionButtonText()), 11, ["disabled"])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const PagesCompetitionDetail = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/detail.vue"]]);
  const _sfc_main$9 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        realName: "加载中...",
        phoneNumber: "",
        schoolId: null,
        schoolName: "",
        role: "",
        isVerified: false,
        creditScore: 0,
        major: "",
        studentTeacherId: "加载中...",
        avatarUrl: null,
        bio: "",
        skillTags: [],
        awardsHistory: []
      });
      const loading = vue.ref(true);
      async function getUserProfile() {
        try {
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            formatAppLog("log", "at pages/profile/index.vue:141", "个人中心页获取到用户资料:", userInfo.value);
          } else {
            formatAppLog("error", "at pages/profile/index.vue:143", "获取用户资料失败:", res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/index.vue:146", "获取用户资料失败:", error);
        } finally {
          loading.value = false;
        }
      }
      function navigateTo(page) {
        if (page === "applications") {
          uni.navigateTo({
            url: "/pages/application/application"
          });
          return;
        }
        uni.showToast({
          title: `跳转到${page}`,
          icon: "none"
        });
      }
      function logout() {
        uni.showModal({
          title: "退出确认",
          content: "确定要退出登录吗？",
          success: function(res) {
            if (res.confirm) {
              store.clearState();
              try {
                uni.removeStorageSync("userInteractionState");
                uni.removeStorageSync("_DC_STAT_UUID");
                uni.removeStorageSync("ai_recommend_cache_time");
                uni.removeStorageSync("ai_recommended_teams");
                uni.removeStorageSync("ai_summary");
                uni.removeStorageSync("token");
                const keys = uni.getStorageInfoSync().keys;
                formatAppLog("log", "at pages/profile/index.vue:189", "准备清除所有缓存:", keys);
                keys.forEach((key) => {
                  try {
                    uni.removeStorageSync(key);
                    formatAppLog("log", "at pages/profile/index.vue:194", "已清除缓存:", key);
                  } catch (e) {
                    formatAppLog("error", "at pages/profile/index.vue:196", "清除缓存失败:", key, e);
                  }
                });
                formatAppLog("log", "at pages/profile/index.vue:200", "所有缓存已清除");
              } catch (e) {
                formatAppLog("error", "at pages/profile/index.vue:202", "清除缓存出错:", e);
              }
              uni.showToast({
                title: "已退出登录",
                icon: "success",
                success: () => {
                  setTimeout(() => {
                    uni.redirectTo({
                      url: "/pages/login/login"
                    });
                  }, 1500);
                }
              });
            }
          }
        });
      }
      function goToNotification() {
        uni.navigateTo({
          url: "/pages/Xiaoxi/Xiaoxi"
        });
      }
      function goToUserInfo() {
        uni.navigateTo({
          url: "/pages/profile/user-info"
        });
      }
      function handleTabChange(tab) {
        if (tab === "home") {
          uni.switchTab({
            url: "/pages/index/index"
          });
        } else if (tab === "competition") {
          uni.switchTab({
            url: "/pages/competition/index"
          });
        } else if (tab === "team") {
          uni.switchTab({
            url: "/pages/team/list"
          });
        }
      }
      function showPublishOptions() {
        uni.showActionSheet({
          itemList: ["发布竞赛信息", "招募队友", "发布项目展示"],
          success: function(res) {
            uni.showToast({
              title: `选择了: ${res.tapIndex}`,
              icon: "none"
            });
          }
        });
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, loading, getUserProfile, navigateTo, logout, goToNotification, goToUserInfo, handleTabChange, showPublishOptions, ref: vue.ref, onMounted: vue.onMounted, TabBar, get userApi() {
        return userApi;
      }, get store() {
        return store;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部用户信息区 "),
      vue.createElementVNode("view", { class: "user-info-section" }, [
        vue.createCommentVNode(" 加载中显示 "),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-circle" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          vue.createElementVNode("view", { class: "user-header" }, [
            vue.createElementVNode("view", {
              class: "user-info-clickable",
              onClick: $setup.goToUserInfo
            }, [
              vue.createElementVNode("image", {
                class: "user-avatar",
                src: $setup.userInfo.avatarUrl || "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "user-details" }, [
                vue.createElementVNode(
                  "text",
                  { class: "user-name" },
                  vue.toDisplayString($setup.userInfo.realName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "user-id" },
                  "学号: " + vue.toDisplayString($setup.userInfo.studentTeacherId),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "user-school" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "school-name" },
                    vue.toDisplayString($setup.userInfo.schoolName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "major-name" },
                    vue.toDisplayString($setup.userInfo.major),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", {
              class: "edit-btn",
              onClick: $setup.goToUserInfo
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-edit" })
            ])
          ]),
          vue.createElementVNode("view", { class: "user-stats" }, [
            vue.createElementVNode("view", {
              class: "stat-item",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigateTo("myCompetitions"))
            }, [
              vue.createElementVNode("text", { class: "stat-value" }, "4"),
              vue.createElementVNode("text", { class: "stat-label" }, "参与竞赛")
            ]),
            vue.createElementVNode("view", {
              class: "stat-item",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.navigateTo("myTeams"))
            }, [
              vue.createElementVNode("text", { class: "stat-value" }, "2"),
              vue.createElementVNode("text", { class: "stat-label" }, "我的团队")
            ]),
            vue.createElementVNode("view", {
              class: "stat-item",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.navigateTo("myAwards"))
            }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($setup.userInfo.awardsHistory ? $setup.userInfo.awardsHistory.length : 0),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "获得奖项")
            ]),
            vue.createElementVNode("view", {
              class: "stat-item",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.navigateTo("settings"))
            }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value credit-score" },
                vue.toDisplayString($setup.userInfo.creditScore),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "信用分")
            ])
          ])
        ]))
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $setup.navigateTo("myCompetitions"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-trophy menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的竞赛"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $setup.navigateTo("myTeams"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-users menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的团队"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[6] || (_cache[6] = ($event) => $setup.navigateTo("myAwards"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-star menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的获奖"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[7] || (_cache[7] = ($event) => $setup.navigateTo("applications"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-paper-plane menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "申请管理"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[8] || (_cache[8] = ($event) => $setup.navigateTo("settings"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-settings menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "账号设置"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[9] || (_cache[9] = ($event) => $setup.navigateTo("feedback"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-feedback menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "意见反馈"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[10] || (_cache[10] = ($event) => $setup.navigateTo("about"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-info-circle menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ])
        ])
      ]),
      vue.createCommentVNode(" 注销按钮 "),
      vue.createElementVNode("view", {
        class: "logout-btn",
        onClick: $setup.logout
      }, [
        vue.createElementVNode("text", null, "退出登录")
      ]),
      vue.createCommentVNode(" 底部导航栏 "),
      vue.createVNode($setup["TabBar"], {
        "active-tab": "profile",
        onTabChange: $setup.handleTabChange,
        onPublish: $setup.showPublishOptions
      })
    ]);
  }
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/index.vue"]]);
  const _sfc_main$8 = {
    __name: "user-info",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        realName: "",
        phoneNumber: "",
        schoolId: null,
        schoolName: "",
        role: "",
        isVerified: false,
        creditScore: 0,
        major: "",
        studentTeacherId: "",
        avatarUrl: null,
        bio: "",
        skillTags: [],
        awardsHistory: []
      });
      const loading = vue.ref(true);
      const isRefreshing = vue.ref(false);
      async function getUserProfile() {
        try {
          loading.value = true;
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            formatAppLog("log", "at pages/profile/user-info.vue:182", "获取到用户资料:", userInfo.value);
          } else {
            uni.showToast({
              title: res.message || "获取资料失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/user-info.vue:190", "获取用户资料失败:", error);
          uni.showToast({
            title: "获取个人资料失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      async function refreshUserInfo() {
        if (isRefreshing.value)
          return;
        isRefreshing.value = true;
        uni.showToast({
          title: "正在刷新...",
          icon: "none",
          duration: 1e3
        });
        try {
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            uni.showToast({
              title: "刷新成功",
              icon: "success",
              duration: 1e3
            });
          } else {
            uni.showToast({
              title: res.message || "刷新失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/user-info.vue:228", "刷新用户资料失败:", error);
          uni.showToast({
            title: "刷新失败",
            icon: "none"
          });
        } finally {
          isRefreshing.value = false;
        }
      }
      function changeAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: function(res) {
            res.tempFilePaths[0];
            uni.showToast({
              title: "头像上传功能开发中",
              icon: "none"
            });
          }
        });
      }
      function editBasicInfo() {
        uni.navigateTo({
          url: "/pages/profile/edit-basic-info"
        });
      }
      function editBio() {
        uni.navigateTo({
          url: "/pages/profile/edit-bio"
        });
      }
      function editSkills() {
        uni.navigateTo({
          url: "/pages/profile/edit-skills"
        });
      }
      function editAwards() {
        uni.navigateTo({
          url: "/pages/profile/edit-awards"
        });
      }
      function goBack() {
        uni.navigateBack();
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, loading, isRefreshing, getUserProfile, refreshUserInfo, changeAvatar, editBasicInfo, editBio, editSkills, editAwards, goBack, ref: vue.ref, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "个人资料"),
        vue.createElementVNode("view", { class: "right-placeholder" })
      ]),
      vue.createCommentVNode(" 加载中显示 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-circle" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 个人资料内容 "),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "content-scroll"
          }, [
            vue.createCommentVNode(" 头像区域 "),
            vue.createElementVNode("view", { class: "avatar-section" }, [
              vue.createElementVNode("image", {
                class: "avatar",
                src: $setup.userInfo.avatarUrl || "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", {
                class: "change-avatar-btn",
                onClick: $setup.changeAvatar
              }, [
                vue.createElementVNode("text", null, "更换头像")
              ])
            ]),
            vue.createCommentVNode(" 基本信息卡片 "),
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode("text", { class: "card-title" }, "基本信息"),
                vue.createElementVNode("view", {
                  class: "edit-btn",
                  onClick: $setup.editBasicInfo
                }, [
                  vue.createElementVNode("text", { class: "iconfont icon-edit" }),
                  vue.createElementVNode("text", { class: "edit-text" }, "编辑")
                ])
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "姓名"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.realName),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "手机号"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.phoneNumber),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "学号"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.studentTeacherId),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "学校"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.schoolName),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "专业"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.major),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "角色"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value" },
                  vue.toDisplayString($setup.userInfo.role === "student" ? "学生" : $setup.userInfo.role === "teacher" ? "教师" : "管理员"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-item" }, [
                vue.createElementVNode("text", { class: "item-label" }, "信用分"),
                vue.createElementVNode(
                  "text",
                  { class: "item-value credit-score" },
                  vue.toDisplayString($setup.userInfo.creditScore),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createCommentVNode(" 个人简介卡片 "),
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode("text", { class: "card-title" }, "个人简介"),
                vue.createElementVNode("view", {
                  class: "edit-btn",
                  onClick: $setup.editBio
                }, [
                  vue.createElementVNode("text", { class: "iconfont icon-edit" }),
                  vue.createElementVNode("text", { class: "edit-text" }, "编辑")
                ])
              ]),
              vue.createElementVNode("view", { class: "bio-content" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($setup.userInfo.bio || "暂无个人简介，点击右上角编辑添加"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createCommentVNode(" 技能标签卡片 "),
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode("text", { class: "card-title" }, "技能标签"),
                vue.createElementVNode("view", {
                  class: "edit-btn",
                  onClick: $setup.editSkills
                }, [
                  vue.createElementVNode("text", { class: "iconfont icon-edit" }),
                  vue.createElementVNode("text", { class: "edit-text" }, "编辑")
                ])
              ]),
              vue.createElementVNode("view", { class: "skills-container" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.userInfo.skillTags, (skill, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "skill-tag",
                      key: index
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(skill),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                !$setup.userInfo.skillTags || $setup.userInfo.skillTags.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "empty-skills"
                }, [
                  vue.createElementVNode("text", null, "暂无技能标签，点击右上角编辑添加")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createCommentVNode(" 获奖经历卡片 "),
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode("text", { class: "card-title" }, "获奖经历"),
                vue.createElementVNode("view", {
                  class: "edit-btn",
                  onClick: $setup.editAwards
                }, [
                  vue.createElementVNode("text", { class: "iconfont icon-edit" }),
                  vue.createElementVNode("text", { class: "edit-text" }, "编辑")
                ])
              ]),
              vue.createElementVNode("view", { class: "awards-container" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.userInfo.awardsHistory, (award, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "award-item",
                      key: index
                    }, [
                      vue.createElementVNode("view", { class: "award-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "award-name" },
                          vue.toDisplayString(award.awardName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "award-level" },
                          vue.toDisplayString(award.level),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "award-detail" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "award-org" },
                          vue.toDisplayString(award.organization),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "award-time" },
                          vue.toDisplayString(award.awardTime),
                          1
                          /* TEXT */
                        )
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                !$setup.userInfo.awardsHistory || $setup.userInfo.awardsHistory.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "empty-awards"
                }, [
                  vue.createElementVNode("text", null, "暂无获奖经历，点击右上角编辑添加")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 悬浮刷新按钮 "),
      vue.createElementVNode("view", {
        class: "refresh-btn",
        onClick: $setup.refreshUserInfo
      }, [
        vue.createElementVNode(
          "text",
          {
            class: vue.normalizeClass(["iconfont icon-refresh", { "refreshing": $setup.isRefreshing }])
          },
          null,
          2
          /* CLASS */
        )
      ])
    ]);
  }
  const PagesProfileUserInfo = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/user-info.vue"]]);
  const _sfc_main$7 = {
    __name: "edit-basic-info",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        realName: "",
        phoneNumber: "",
        schoolId: null,
        schoolName: "",
        major: "",
        studentTeacherId: ""
      });
      const loading = vue.ref(true);
      const schoolOptions = vue.ref([]);
      const selectedSchoolIndex = vue.computed(() => {
        if (!userInfo.value.schoolId || schoolOptions.value.length === 0)
          return 0;
        const index = schoolOptions.value.findIndex((school) => school.id === userInfo.value.schoolId);
        return index >= 0 ? index : 0;
      });
      const selectedSchoolName = vue.computed(() => {
        return userInfo.value.schoolName || "请选择学校";
      });
      async function getUserProfile() {
        try {
          loading.value = true;
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            formatAppLog("log", "at pages/profile/edit-basic-info.vue:105", "获取到用户资料:", userInfo.value);
            await getSchools();
          } else {
            uni.showToast({
              title: res.message || "获取资料失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-basic-info.vue:114", "获取用户资料失败:", error);
          uni.showToast({
            title: "获取个人资料失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      async function getSchools() {
        try {
          const res = await userApi.getSchools();
          if (res.code === 200 && res.data) {
            schoolOptions.value = res.data;
          } else {
            formatAppLog("error", "at pages/profile/edit-basic-info.vue:131", "获取学校列表失败:", res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-basic-info.vue:134", "获取学校列表失败:", error);
        }
      }
      function onSchoolChange(e) {
        const index = e.detail.value;
        if (index >= 0 && index < schoolOptions.value.length) {
          const selectedSchool = schoolOptions.value[index];
          userInfo.value.schoolId = selectedSchool.id;
          userInfo.value.schoolName = selectedSchool.name;
        }
      }
      async function saveChanges() {
        if (!userInfo.value.realName || userInfo.value.realName.trim() === "") {
          uni.showToast({
            title: "姓名不能为空",
            icon: "none"
          });
          return;
        }
        if (!userInfo.value.schoolId) {
          uni.showToast({
            title: "请选择学校",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({
            title: "保存中..."
          });
          const updateData = {
            realName: userInfo.value.realName,
            schoolId: userInfo.value.schoolId,
            major: userInfo.value.major,
            bio: userInfo.value.bio,
            skillTags: userInfo.value.skillTags || [],
            awardsHistory: userInfo.value.awardsHistory || []
          };
          const res = await userApi.updateUserProfile(updateData);
          if (res.code === 200) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "保存失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-basic-info.vue:198", "保存用户资料失败:", error);
          uni.showToast({
            title: "保存失败，请稍后再试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, loading, schoolOptions, selectedSchoolIndex, selectedSchoolName, getUserProfile, getSchools, onSchoolChange, saveChanges, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "编辑基本信息"),
        vue.createElementVNode("view", {
          class: "save-btn",
          onClick: $setup.saveChanges
        }, [
          vue.createElementVNode("text", null, "保存")
        ])
      ]),
      vue.createCommentVNode(" 加载中显示 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-circle" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 编辑表单 "),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "content-scroll"
          }, [
            vue.createElementVNode("view", { class: "form-section" }, [
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "姓名"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "form-input",
                    type: "text",
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.userInfo.realName = $event),
                    placeholder: "请输入真实姓名",
                    maxlength: "20"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.userInfo.realName]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "学校"),
                vue.createElementVNode("picker", {
                  class: "form-picker",
                  range: $setup.schoolOptions,
                  "range-key": "name",
                  value: $setup.selectedSchoolIndex,
                  onChange: $setup.onSchoolChange
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-text" },
                    vue.toDisplayString($setup.selectedSchoolName || "请选择学校"),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode("text", { class: "form-label" }, "专业"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    class: "form-input",
                    type: "text",
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.userInfo.major = $event),
                    placeholder: "请输入专业",
                    maxlength: "30"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.userInfo.major]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item form-item-last" }, [
                vue.createElementVNode("text", { class: "form-label" }, "手机号"),
                vue.createElementVNode(
                  "view",
                  { class: "form-text" },
                  vue.toDisplayString($setup.userInfo.phoneNumber || "未设置"),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("text", { class: "form-tip" }, "注意：学号和角色信息不可修改")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesProfileEditBasicInfo = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/edit-basic-info.vue"]]);
  const _sfc_main$6 = {
    __name: "edit-bio",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        bio: "",
        realName: "",
        schoolId: null,
        major: "",
        skillTags: [],
        awardsHistory: []
      });
      const loading = vue.ref(true);
      async function getUserProfile() {
        try {
          loading.value = true;
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            formatAppLog("log", "at pages/profile/edit-bio.vue:83", "获取到用户资料:", userInfo.value);
          } else {
            uni.showToast({
              title: res.message || "获取资料失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-bio.vue:91", "获取用户资料失败:", error);
          uni.showToast({
            title: "获取个人资料失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      async function saveChanges() {
        try {
          uni.showLoading({
            title: "保存中..."
          });
          const updateData = {
            realName: userInfo.value.realName,
            schoolId: userInfo.value.schoolId,
            major: userInfo.value.major,
            bio: userInfo.value.bio,
            skillTags: userInfo.value.skillTags || [],
            awardsHistory: userInfo.value.awardsHistory || []
          };
          const res = await userApi.updateUserProfile(updateData);
          if (res.code === 200) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "保存失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-bio.vue:135", "保存用户资料失败:", error);
          uni.showToast({
            title: "保存失败，请稍后再试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, loading, getUserProfile, saveChanges, goBack, ref: vue.ref, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "编辑个人简介"),
        vue.createElementVNode("view", {
          class: "save-btn",
          onClick: $setup.saveChanges
        }, [
          vue.createElementVNode("text", null, "保存")
        ])
      ]),
      vue.createCommentVNode(" 加载中显示 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-circle" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 编辑表单 "),
          vue.createElementVNode("view", { class: "content-scroll" }, [
            vue.createElementVNode("view", { class: "form-section" }, [
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  class: "bio-textarea",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.userInfo.bio = $event),
                  placeholder: "请输入您的个人简介，介绍自己的专业背景、技术特长、研究方向等（1000字以内）",
                  maxlength: "1000",
                  "auto-height": ""
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.userInfo.bio]
              ]),
              vue.createElementVNode(
                "view",
                { class: "text-count" },
                vue.toDisplayString($setup.userInfo.bio ? $setup.userInfo.bio.length : 0) + "/1000",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "tip-section" }, [
              vue.createElementVNode("text", { class: "tip-title" }, "写一个好的个人简介"),
              vue.createElementVNode("view", { class: "tip-list" }, [
                vue.createElementVNode("view", { class: "tip-item" }, [
                  vue.createElementVNode("text", { class: "dot" }, "•"),
                  vue.createElementVNode("text", { class: "tip-text" }, "介绍您的学习背景和专业领域")
                ]),
                vue.createElementVNode("view", { class: "tip-item" }, [
                  vue.createElementVNode("text", { class: "dot" }, "•"),
                  vue.createElementVNode("text", { class: "tip-text" }, "突出您的核心技能和特长")
                ]),
                vue.createElementVNode("view", { class: "tip-item" }, [
                  vue.createElementVNode("text", { class: "dot" }, "•"),
                  vue.createElementVNode("text", { class: "tip-text" }, "分享您的研究兴趣或项目经验")
                ]),
                vue.createElementVNode("view", { class: "tip-item" }, [
                  vue.createElementVNode("text", { class: "dot" }, "•"),
                  vue.createElementVNode("text", { class: "tip-text" }, "提及您期望的团队合作方式")
                ])
              ])
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesProfileEditBio = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/edit-bio.vue"]]);
  const _sfc_main$5 = {
    __name: "edit-skills",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        skillTags: [],
        realName: "",
        schoolId: null,
        major: "",
        bio: "",
        awardsHistory: []
      });
      const selectedTags = vue.ref([]);
      const skillCategories = vue.ref({});
      const currentCategory = vue.ref("");
      const loading = vue.ref(true);
      async function getUserProfile() {
        try {
          loading.value = true;
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            if (userInfo.value.skillTags && Array.isArray(userInfo.value.skillTags)) {
              selectedTags.value = [...userInfo.value.skillTags];
            }
            formatAppLog("log", "at pages/profile/edit-skills.vue:110", "获取到用户资料:", userInfo.value);
            await getSkillTags();
          } else {
            uni.showToast({
              title: res.message || "获取资料失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-skills.vue:119", "获取用户资料失败:", error);
          uni.showToast({
            title: "获取个人资料失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      async function getSkillTags() {
        try {
          const res = await userApi.getSkillTags();
          if (res.code === 200 && res.data) {
            skillCategories.value = res.data;
            const categories = Object.keys(res.data);
            if (categories.length > 0) {
              currentCategory.value = categories[0];
            }
            formatAppLog("log", "at pages/profile/edit-skills.vue:140", "获取技能标签成功:", skillCategories.value);
          } else {
            formatAppLog("error", "at pages/profile/edit-skills.vue:142", "获取技能标签失败:", res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-skills.vue:145", "获取技能标签失败:", error);
        }
      }
      function changeCategory(category) {
        currentCategory.value = category;
      }
      function isTagSelected(tagName) {
        return selectedTags.value.includes(tagName);
      }
      function toggleTag(tagName) {
        const index = selectedTags.value.indexOf(tagName);
        if (index === -1) {
          if (selectedTags.value.length >= 10) {
            uni.showToast({
              title: "最多只能选择10个标签",
              icon: "none"
            });
            return;
          }
          selectedTags.value.push(tagName);
        } else {
          removeTag(index);
        }
      }
      function removeTag(index) {
        selectedTags.value.splice(index, 1);
      }
      async function saveChanges() {
        try {
          uni.showLoading({
            title: "保存中..."
          });
          const updateData = {
            realName: userInfo.value.realName,
            schoolId: userInfo.value.schoolId,
            major: userInfo.value.major,
            bio: userInfo.value.bio,
            skillTags: selectedTags.value,
            awardsHistory: userInfo.value.awardsHistory || []
          };
          const res = await userApi.updateUserProfile(updateData);
          if (res.code === 200) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "保存失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-skills.vue:216", "保存用户资料失败:", error);
          uni.showToast({
            title: "保存失败，请稍后再试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, selectedTags, skillCategories, currentCategory, loading, getUserProfile, getSkillTags, changeCategory, isTagSelected, toggleTag, removeTag, saveChanges, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "编辑技能标签"),
        vue.createElementVNode("view", {
          class: "save-btn",
          onClick: $setup.saveChanges
        }, [
          vue.createElementVNode("text", null, "保存")
        ])
      ]),
      vue.createCommentVNode(" 加载中显示 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-circle" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 编辑内容 "),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "content-scroll"
          }, [
            vue.createCommentVNode(" 已选标签区域 "),
            vue.createElementVNode("view", { class: "selected-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, "已选择的标签"),
              vue.createElementVNode("view", { class: "selected-tags" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.selectedTags, (tag, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: "tag selected-tag"
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(tag),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", {
                        class: "remove-icon",
                        onClick: ($event) => $setup.removeTag(index)
                      }, "×", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                )),
                $setup.selectedTags.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "empty-tips"
                }, [
                  vue.createElementVNode("text", null, "尚未选择任何标签，请从下方分类中选择")
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createCommentVNode(" 标签分类区域 "),
            vue.createElementVNode("view", { class: "categories-section" }, [
              vue.createElementVNode("view", { class: "section-title" }, "选择技能标签"),
              vue.createElementVNode("view", { class: "categories-tab" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(Object.keys($setup.skillCategories), (category, cIndex) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: cIndex,
                      class: vue.normalizeClass(["category-tab", { active: $setup.currentCategory === category }]),
                      onClick: ($event) => $setup.changeCategory(category)
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(category),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createCommentVNode(" 当前分类的标签列表 "),
              vue.createElementVNode("view", { class: "tag-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.skillCategories[$setup.currentCategory], (tag, tIndex) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: tIndex,
                      class: vue.normalizeClass(["tag", { active: $setup.isTagSelected(tag.tagName) }]),
                      onClick: ($event) => $setup.toggleTag(tag.tagName)
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(tag.tagName),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createCommentVNode(" 提示信息 "),
            vue.createElementVNode("view", { class: "tips-section" }, [
              vue.createElementVNode("text", { class: "tip-text" }, "提示：精确的技能标签有助于AI更准确地为您推荐合适的团队")
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesProfileEditSkills = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/edit-skills.vue"]]);
  const _sfc_main$4 = {
    __name: "edit-awards",
    setup(__props, { expose: __expose }) {
      __expose();
      const userInfo = vue.ref({
        awardsHistory: [],
        realName: "",
        schoolId: null,
        major: "",
        bio: "",
        skillTags: []
      });
      const awardsList = vue.ref([]);
      const levelOptions = ["国家级", "省级", "市级", "校级", "院级", "其他"];
      const levelIndex = vue.ref(0);
      const editingAward = vue.ref({
        awardName: "",
        level: "",
        organization: "",
        awardTime: ""
      });
      const isEditing = vue.ref(false);
      const editingIndex = vue.ref(-1);
      const loading = vue.ref(true);
      const awardPopup = vue.ref(null);
      async function getUserProfile() {
        try {
          loading.value = true;
          const res = await userApi.getUserProfile();
          if (res.code === 200 && res.data) {
            userInfo.value = res.data;
            if (userInfo.value.awardsHistory && Array.isArray(userInfo.value.awardsHistory)) {
              awardsList.value = [...userInfo.value.awardsHistory];
            }
            formatAppLog("log", "at pages/profile/edit-awards.vue:176", "获取到用户资料:", userInfo.value);
          } else {
            uni.showToast({
              title: res.message || "获取资料失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-awards.vue:184", "获取用户资料失败:", error);
          uni.showToast({
            title: "获取个人资料失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      function editAward(index) {
        if (index >= 0 && index < awardsList.value.length) {
          isEditing.value = true;
          editingIndex.value = index;
          editingAward.value = { ...awardsList.value[index] };
          const level = editingAward.value.level;
          const idx = levelOptions.indexOf(level);
          levelIndex.value = idx >= 0 ? idx : 0;
          showPopup();
        }
      }
      function deleteAward(index) {
        uni.showModal({
          title: "删除确认",
          content: "确定要删除这条获奖记录吗？",
          success: function(res) {
            if (res.confirm) {
              awardsList.value.splice(index, 1);
              uni.showToast({
                title: "已删除",
                icon: "success"
              });
            }
          }
        });
      }
      function showAwardForm(index) {
        if (index === null) {
          isEditing.value = false;
          editingIndex.value = -1;
          editingAward.value = {
            awardName: "",
            level: levelOptions[0],
            organization: "",
            awardTime: ""
          };
          levelIndex.value = 0;
        }
        showPopup();
      }
      function showPopup() {
        if (awardPopup.value) {
          awardPopup.value.open();
        }
      }
      function closeAwardForm() {
        if (awardPopup.value) {
          awardPopup.value.close();
        }
      }
      function onLevelChange(e) {
        const index = e.detail.value;
        levelIndex.value = index;
        editingAward.value.level = levelOptions[index];
      }
      function onDateChange(e) {
        editingAward.value.awardTime = e.detail.value;
      }
      function confirmAwardEdit() {
        if (!editingAward.value.awardName || editingAward.value.awardName.trim() === "") {
          uni.showToast({
            title: "请输入奖项名称",
            icon: "none"
          });
          return;
        }
        if (!editingAward.value.level) {
          uni.showToast({
            title: "请选择获奖级别",
            icon: "none"
          });
          return;
        }
        if (!editingAward.value.organization || editingAward.value.organization.trim() === "") {
          uni.showToast({
            title: "请输入颁发机构",
            icon: "none"
          });
          return;
        }
        if (!editingAward.value.awardTime) {
          uni.showToast({
            title: "请选择获奖时间",
            icon: "none"
          });
          return;
        }
        if (isEditing.value && editingIndex.value >= 0) {
          awardsList.value[editingIndex.value] = { ...editingAward.value };
        } else {
          awardsList.value.push({ ...editingAward.value });
        }
        closeAwardForm();
        uni.showToast({
          title: isEditing.value ? "修改成功" : "添加成功",
          icon: "success"
        });
      }
      async function saveChanges() {
        try {
          uni.showLoading({
            title: "保存中..."
          });
          const updateData = {
            realName: userInfo.value.realName,
            schoolId: userInfo.value.schoolId,
            major: userInfo.value.major,
            bio: userInfo.value.bio,
            skillTags: userInfo.value.skillTags || [],
            awardsHistory: awardsList.value
          };
          const res = await userApi.updateUserProfile(updateData);
          if (res.code === 200) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "保存失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/edit-awards.vue:355", "保存用户资料失败:", error);
          uni.showToast({
            title: "保存失败，请稍后再试",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      vue.onMounted(() => {
        getUserProfile();
      });
      const __returned__ = { userInfo, awardsList, levelOptions, levelIndex, editingAward, isEditing, editingIndex, loading, awardPopup, getUserProfile, editAward, deleteAward, showAwardForm, showPopup, closeAwardForm, onLevelChange, onDateChange, confirmAwardEdit, saveChanges, goBack, ref: vue.ref, onMounted: vue.onMounted, get userApi() {
        return userApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0$3);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "back-btn",
          onClick: $setup.goBack
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
        ]),
        vue.createElementVNode("text", { class: "header-title" }, "编辑获奖经历"),
        vue.createElementVNode("view", {
          class: "save-btn",
          onClick: $setup.saveChanges
        }, [
          vue.createElementVNode("text", null, "保存")
        ])
      ]),
      vue.createCommentVNode(" 加载中显示 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-container"
      }, [
        vue.createElementVNode("view", { class: "loading-circle" }),
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 编辑内容 "),
          vue.createElementVNode("scroll-view", {
            "scroll-y": "",
            class: "content-scroll"
          }, [
            vue.createCommentVNode(" 获奖列表 "),
            vue.createElementVNode("view", { class: "awards-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.awardsList, (award, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "award-item"
                  }, [
                    vue.createElementVNode("view", { class: "award-content" }, [
                      vue.createElementVNode("view", { class: "award-header" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "award-name" },
                          vue.toDisplayString(award.awardName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "award-level" },
                          vue.toDisplayString(award.level),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "award-detail" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "award-org" },
                          vue.toDisplayString(award.organization),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "award-time" },
                          vue.toDisplayString(award.awardTime),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    vue.createElementVNode("view", { class: "award-actions" }, [
                      vue.createElementVNode("view", {
                        class: "action-btn edit-btn",
                        onClick: ($event) => $setup.editAward(index)
                      }, [
                        vue.createElementVNode("text", { class: "iconfont icon-edit" })
                      ], 8, ["onClick"]),
                      vue.createElementVNode("view", {
                        class: "action-btn delete-btn",
                        onClick: ($event) => $setup.deleteAward(index)
                      }, [
                        vue.createElementVNode("text", { class: "iconfont icon-trash" })
                      ], 8, ["onClick"])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createCommentVNode(" 没有获奖记录时显示 "),
              $setup.awardsList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty-state"
              }, [
                vue.createElementVNode("text", null, "暂无获奖记录，点击下方添加按钮添加")
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createCommentVNode(" 添加按钮 "),
            vue.createElementVNode("view", {
              class: "add-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.showAwardForm(null))
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-plus" }),
              vue.createElementVNode("text", { class: "add-text" }, "添加获奖经历")
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 获奖经历编辑弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "awardPopup",
          type: "center"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "award-form" }, [
              vue.createElementVNode("view", { class: "form-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-title" },
                  vue.toDisplayString($setup.isEditing ? "编辑获奖经历" : "添加获奖经历"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "close-icon",
                  onClick: $setup.closeAwardForm
                }, "×")
              ]),
              vue.createElementVNode("view", { class: "form-body" }, [
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, [
                    vue.createTextVNode("奖项名称"),
                    vue.createElementVNode("text", { class: "required" }, "*")
                  ]),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "form-input",
                      type: "text",
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.editingAward.awardName = $event),
                      placeholder: "请输入奖项名称",
                      maxlength: "50"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.editingAward.awardName]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, [
                    vue.createTextVNode("获奖级别"),
                    vue.createElementVNode("text", { class: "required" }, "*")
                  ]),
                  vue.createElementVNode("picker", {
                    class: "form-picker",
                    range: $setup.levelOptions,
                    value: $setup.levelIndex,
                    onChange: $setup.onLevelChange
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-text" },
                      vue.toDisplayString($setup.editingAward.level || "请选择获奖级别"),
                      1
                      /* TEXT */
                    )
                  ], 40, ["value"])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, [
                    vue.createTextVNode("颁发机构"),
                    vue.createElementVNode("text", { class: "required" }, "*")
                  ]),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      class: "form-input",
                      type: "text",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.editingAward.organization = $event),
                      placeholder: "请输入颁发机构",
                      maxlength: "50"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.editingAward.organization]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, [
                    vue.createTextVNode("获奖时间"),
                    vue.createElementVNode("text", { class: "required" }, "*")
                  ]),
                  vue.createElementVNode("picker", {
                    class: "form-picker",
                    mode: "date",
                    fields: "month",
                    value: $setup.editingAward.awardTime,
                    onChange: $setup.onDateChange
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "picker-text" },
                      vue.toDisplayString($setup.editingAward.awardTime || "请选择获奖时间"),
                      1
                      /* TEXT */
                    )
                  ], 40, ["value"])
                ])
              ]),
              vue.createElementVNode("view", { class: "form-footer" }, [
                vue.createElementVNode("button", {
                  class: "cancel-btn",
                  onClick: $setup.closeAwardForm
                }, "取消"),
                vue.createElementVNode("button", {
                  class: "confirm-btn",
                  onClick: $setup.confirmAwardEdit
                }, "确认")
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesProfileEditAwards = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/edit-awards.vue"]]);
  const wsConfig = {
    url: env$1.wsUrl || "ws://localhost:8080/ws",
    // 使用环境配置中的WebSocket地址
    token: "",
    // 身份验证token
    debug: env$1.debug || false,
    // 是否开启调试模式
    autoReconnect: true,
    // 是否自动重连
    reconnectInterval: 5e3,
    // 重连间隔时间（毫秒）
    maxReconnectTimes: 5,
    // 最大重连次数
    heartbeat: true,
    // 是否发送心跳包
    heartbeatInterval: 3e4,
    // 心跳间隔时间（毫秒）
    heartbeatContent: "ping"
    // 心跳包内容
  };
  let socketTask = null;
  let isConnected = false;
  let reconnectCount = 0;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let messageCallback = null;
  let openCallback = null;
  let closeCallback = null;
  let errorCallback = null;
  function initConfig(options = {}) {
    Object.assign(wsConfig, options);
    log("WebSocket配置已初始化");
  }
  function connect(token) {
    if (isConnected && socketTask) {
      log("WebSocket已连接，无需重复连接");
      return socketTask;
    }
    if (token) {
      wsConfig.token = token;
    }
    const url = `${wsConfig.url}${wsConfig.token ? `?token=${wsConfig.token}` : ""}`;
    log(`正在连接WebSocket: ${url}`);
    try {
      socketTask = uni.connectSocket({
        url,
        success: () => {
          log("WebSocket连接创建成功");
        },
        fail: (err) => {
          log("WebSocket连接创建失败", err);
          handleError(err);
        },
        complete: () => {
        }
      });
      socketTask.onOpen((res) => {
        isConnected = true;
        reconnectCount = 0;
        log("WebSocket连接已打开", res);
        if (wsConfig.heartbeat) {
          startHeartbeat();
        }
        if (openCallback) {
          openCallback(res);
        }
      });
      socketTask.onMessage((res) => {
        log("收到WebSocket消息", res.data);
        if (res.data === "pong" && wsConfig.heartbeat) {
          return;
        }
        if (messageCallback) {
          messageCallback(res.data);
        }
      });
      socketTask.onClose((res) => {
        isConnected = false;
        socketTask = null;
        log("WebSocket连接已关闭", res);
        clearTimeout(heartbeatTimer);
        if (closeCallback) {
          closeCallback(res);
        }
        if (wsConfig.autoReconnect) {
          reconnect();
        }
      });
      socketTask.onError((err) => {
        log("WebSocket连接错误", err);
        if (errorCallback) {
          errorCallback(err);
        }
      });
      return socketTask;
    } catch (e) {
      formatAppLog("error", "at utils/websocket.js:139", "创建WebSocket连接异常", e);
      return null;
    }
  }
  function send(data) {
    if (!isConnected || !socketTask) {
      log("WebSocket未连接，无法发送消息");
      return false;
    }
    let sendData = data;
    if (typeof data === "object" && !(data instanceof ArrayBuffer) && data !== null) {
      sendData = JSON.stringify(data);
    }
    log("发送WebSocket消息", sendData);
    socketTask.send({
      data: sendData,
      success: () => {
        log("WebSocket消息发送成功");
      },
      fail: (err) => {
        log("WebSocket消息发送失败", err);
      }
    });
    return true;
  }
  function close(code = 1e3, reason = "主动关闭连接") {
    if (!socketTask || !isConnected) {
      log("WebSocket未连接，无法关闭");
      return false;
    }
    clearTimeout(reconnectTimer);
    clearTimeout(heartbeatTimer);
    log(`正在关闭WebSocket连接: code=${code}, reason=${reason}`);
    socketTask.close({
      code,
      reason,
      success: () => {
        log("WebSocket连接已关闭");
        isConnected = false;
        socketTask = null;
      },
      fail: (err) => {
        log("WebSocket关闭失败", err);
      }
    });
    return true;
  }
  function onMessage(callback) {
    if (typeof callback === "function") {
      messageCallback = callback;
    }
  }
  function onOpen(callback) {
    if (typeof callback === "function") {
      openCallback = callback;
    }
  }
  function onClose(callback) {
    if (typeof callback === "function") {
      closeCallback = callback;
    }
  }
  function onError(callback) {
    if (typeof callback === "function") {
      errorCallback = callback;
    }
  }
  function reconnect() {
    if (reconnectCount >= wsConfig.maxReconnectTimes) {
      log(`WebSocket重连次数已达上限(${wsConfig.maxReconnectTimes}次)，停止重连`);
      return;
    }
    reconnectCount++;
    log(`WebSocket ${reconnectCount}秒后尝试第${reconnectCount}次重连...`);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      log(`正在进行第${reconnectCount}次重连...`);
      connect();
    }, wsConfig.reconnectInterval);
  }
  function startHeartbeat() {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = setTimeout(() => {
      if (isConnected) {
        log("发送心跳包", wsConfig.heartbeatContent);
        send(wsConfig.heartbeatContent);
      }
      startHeartbeat();
    }, wsConfig.heartbeatInterval);
  }
  function handleError(err) {
    formatAppLog("error", "at utils/websocket.js:295", "WebSocket错误:", err);
  }
  function log(message, data) {
    if (wsConfig.debug) {
      if (data) {
        formatAppLog("log", "at utils/websocket.js:306", `[WebSocket] ${message}`, data);
      } else {
        formatAppLog("log", "at utils/websocket.js:308", `[WebSocket] ${message}`);
      }
    }
  }
  function isSocketConnected() {
    return isConnected;
  }
  function getSocketTask() {
    return socketTask;
  }
  const websocket = {
    initConfig,
    connect,
    send,
    close,
    onMessage,
    onOpen,
    onClose,
    onError,
    isConnected: isSocketConnected,
    getSocketTask
  };
  const notificationTypes = {
    "system_announcement": "系统公告",
    "team_invite": "团队邀请",
    "team_application_received": "收到队伍申请",
    "team_application_result": "队伍申请结果",
    "task_application": "任务申请",
    "task_update": "任务更新",
    "team_application": "队伍申请",
    "badge_application": "徽章申请"
  };
  let notificationCallback = null;
  function initNotificationService(callback) {
    if (typeof callback === "function") {
      notificationCallback = callback;
    }
    websocket.onOpen((res) => {
      formatAppLog("log", "at utils/notification-service.js:36", "通知服务: WebSocket连接已打开", res);
      const token = getToken();
      if (token) {
        websocket.send({
          type: "auth",
          token
        });
      }
    });
    websocket.onMessage((data) => {
      formatAppLog("log", "at utils/notification-service.js:49", "通知服务: 收到WebSocket消息", data);
      try {
        let message;
        if (typeof data === "string") {
          message = JSON.parse(data);
        } else {
          message = data;
        }
        if (message.typeId || message.type) {
          const notification = parseNotification(message);
          if (notificationCallback) {
            notificationCallback(notification);
          }
        }
      } catch (e) {
        formatAppLog("error", "at utils/notification-service.js:70", "通知服务: 解析WebSocket消息失败", e);
      }
    });
    websocket.onClose((res) => {
      formatAppLog("log", "at utils/notification-service.js:75", "通知服务: WebSocket连接已关闭", res);
    });
    websocket.onError((err) => {
      formatAppLog("error", "at utils/notification-service.js:79", "通知服务: WebSocket连接错误", err);
    });
    websocket.initConfig({
      debug: true,
      autoReconnect: true,
      heartbeat: true
    });
    websocket.connect(getToken());
  }
  function parseNotification(message) {
    return {
      id: message.id || Date.now(),
      // 如果没有id，使用时间戳
      userId: message.userId,
      title: message.title || "",
      content: message.content || "",
      typeId: message.typeId || message.type || "system_announcement",
      typeName: getNotificationType(message.typeId || message.type),
      category: message.category || null,
      isRead: message.isRead || false,
      createdAt: message.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      relatedId: message.relatedId || null,
      relatedType: message.relatedType || null,
      dynamicData: message.dynamicData || null,
      priority: message.priority || 0,
      expireAt: message.expireAt || null,
      // UI展示用属性
      time: formatTime(message.createdAt || /* @__PURE__ */ new Date()),
      avatar: getAvatarByType(message.typeId || message.type),
      actions: getActionsForType(message.typeId || message.type, message.relatedType, message.relatedId)
    };
  }
  function getAvatarByType(typeId) {
    const avatarMap = {
      "system_announcement": "/static/avatars/system.png",
      "team_application_received": "/static/avatars/team.png",
      "team_invite": "/static/avatars/team.png",
      "task_application": "/static/avatars/task.png",
      "task_update": "/static/avatars/task.png",
      "badge_application": "/static/avatars/badge.png",
      "friend_request": "/static/avatars/user.png"
    };
    return avatarMap[typeId] || "/static/avatars/system.png";
  }
  function getNotificationType(typeId) {
    return notificationTypes[typeId] || "系统通知";
  }
  function getActionsForType(typeId, relatedType, relatedId) {
    if (typeId === "system_announcement") {
      return [{ name: "查看", type: "view", primary: true }];
    } else if (typeId === "team_invite") {
      return [
        { name: "接受", type: "accept", primary: true },
        { name: "拒绝", type: "reject", primary: false }
      ];
    } else if (typeId === "team_application_received") {
      return [
        { name: "接受", type: "accept", primary: true },
        { name: "拒绝", type: "reject", primary: false }
      ];
    } else if (typeId.includes("task_application") || typeId.includes("team_application") || typeId.includes("badge_application")) {
      return [{ name: "查看", type: "view", primary: true }];
    }
    return [{ name: "查看", type: "view", primary: true }];
  }
  function formatTime(dateStr) {
    try {
      const date = new Date(dateStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 60 * 1e3) {
        return "刚刚";
      } else if (diff < 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 1e3)) + "分钟前";
      } else if (diff < 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (60 * 60 * 1e3)) + "小时前";
      } else if (diff < 30 * 24 * 60 * 60 * 1e3) {
        return Math.floor(diff / (24 * 60 * 60 * 1e3)) + "天前";
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      formatAppLog("error", "at utils/notification-service.js:211", "格式化时间错误", e);
      return dateStr;
    }
  }
  function closeNotificationService() {
    websocket.close();
  }
  async function markAsRead(notificationId) {
    if (!notificationId)
      return;
    try {
      await notificationsApi.markAsRead(notificationId);
      websocket.send({
        type: "notification_read",
        notificationId
      });
      return true;
    } catch (error) {
      formatAppLog("error", "at utils/notification-service.js:242", "标记通知已读失败:", error);
      return false;
    }
  }
  async function markAllAsRead() {
    try {
      await notificationsApi.markAllAsRead();
      websocket.send({
        type: "notification_read_all"
      });
      return true;
    } catch (error) {
      formatAppLog("error", "at utils/notification-service.js:262", "标记所有通知已读失败:", error);
      return false;
    }
  }
  async function getUnreadCount() {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.code === 200 && res.data !== void 0) {
        return res.data;
      }
      return 0;
    } catch (error) {
      formatAppLog("error", "at utils/notification-service.js:279", "获取未读通知数量失败:", error);
      return 0;
    }
  }
  const notificationService = {
    initNotificationService,
    closeNotificationService,
    markAsRead,
    markAllAsRead,
    parseNotification,
    formatTime,
    getNotificationType,
    getUnreadCount,
    getAvatarByType,
    getActionsForType
  };
  const _imports_0$1 = "/static/empty-notification.png";
  const _sfc_main$3 = {
    __name: "Xiaoxi",
    setup(__props, { expose: __expose }) {
      __expose();
      const app = getApp();
      const wsConnected = vue.ref(false);
      const activeTab = vue.ref("unread");
      const unreadCount = vue.ref(0);
      const unreadNotifications = vue.ref([]);
      const readNotifications = vue.ref([]);
      const pagination = vue.ref({
        current: 1,
        size: 10,
        total: 0,
        pages: 0
      });
      const loading = vue.ref(false);
      const refreshing = vue.ref(false);
      const hasMore = vue.ref(true);
      const isEditMode = vue.ref(false);
      const selectedItems = vue.ref([]);
      const isAllSelected = vue.computed(() => {
        const currentList = activeTab.value === "unread" ? unreadNotifications.value : readNotifications.value;
        return currentList.length > 0 && selectedItems.value.length === currentList.length;
      });
      function toggleEditMode() {
        isEditMode.value = !isEditMode.value;
        if (!isEditMode.value) {
          selectedItems.value = [];
        }
      }
      function toggleSelectItem(id) {
        const index = selectedItems.value.indexOf(id);
        if (index === -1) {
          selectedItems.value.push(id);
        } else {
          selectedItems.value.splice(index, 1);
        }
      }
      function toggleSelectAll() {
        const currentList = activeTab.value === "unread" ? unreadNotifications.value : readNotifications.value;
        if (isAllSelected.value) {
          selectedItems.value = [];
        } else {
          selectedItems.value = currentList.map((item) => item.id);
        }
      }
      function confirmBatchDelete() {
        if (selectedItems.value.length === 0) {
          uni.showToast({
            title: "请先选择要删除的通知",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "删除通知",
          content: `确定要删除选中的${selectedItems.value.length}条通知吗？`,
          success: (res) => {
            if (res.confirm) {
              batchDeleteNotifications2(selectedItems.value);
              toggleEditMode();
            }
          }
        });
      }
      function handleNewNotification(notification) {
        formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:263", "收到新通知", notification);
        const newNotification = {
          id: notification.id,
          type: notification.typeName,
          message: notification.content || notification.title,
          time: notification.time,
          avatar: getAvatarByType2(notification.typeId),
          read: notification.isRead,
          actions: notification.actions,
          // 保存原始数据，用于后续处理
          originalData: notification
        };
        if (!notification.isRead) {
          unreadNotifications.value.unshift(newNotification);
          unreadCount.value++;
        }
        readNotifications.value.unshift(newNotification);
        uni.showToast({
          title: "收到新通知",
          icon: "none"
        });
      }
      function getAvatarByType2(typeId) {
        const avatarMap = {
          "system_announcement": "/static/avatars/system.png",
          "team_application_received": "/static/avatars/team.png",
          "team_invite": "/static/avatars/team.png",
          "task_application": "/static/avatars/task.png",
          "task_update": "/static/avatars/task.png",
          "badge_application": "/static/avatars/badge.png",
          "friend_request": "/static/avatars/user.png"
        };
        return avatarMap[typeId] || "/static/avatars/system.png";
      }
      async function markAllAsRead2() {
        try {
          loading.value = true;
          const res = await notificationsApi.markAllAsRead();
          if (res.code === 200) {
            unreadNotifications.value.forEach((item) => {
              const index = readNotifications.value.findIndex((n) => n.id === item.id);
              if (index !== -1) {
                readNotifications.value[index].read = true;
              }
            });
            unreadNotifications.value = [];
            unreadCount.value = 0;
            if (app && app.resetUnreadNotificationCount) {
              app.resetUnreadNotificationCount();
            }
            uni.showToast({
              title: "已全部标记为已读",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: res.message || "操作失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:344", "标记全部已读失败:", error);
          uni.showToast({
            title: "操作失败，请稍后重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      function handleAction(type, id) {
        const notification = (activeTab.value === "unread" ? unreadNotifications.value : readNotifications.value).find((item) => item.id === id);
        if (!notification)
          return;
        if (type === "accept") {
          uni.showModal({
            title: "接受申请",
            content: `确定接受此${notification.type}？`,
            success: async function(res) {
              var _a, _b;
              if (res.confirm) {
                try {
                  loading.value = true;
                  const apiRes = await notificationsApi.handleNotificationAction(id, "accept", {
                    relatedId: (_a = notification.originalData) == null ? void 0 : _a.relatedId,
                    relatedType: (_b = notification.originalData) == null ? void 0 : _b.relatedType
                  });
                  if (apiRes.code === 200) {
                    removeNotification(id);
                    uni.showToast({
                      title: "已接受",
                      icon: "success"
                    });
                  } else {
                    uni.showToast({
                      title: apiRes.message || "操作失败",
                      icon: "none"
                    });
                  }
                } catch (error) {
                  formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:392", "接受操作失败:", error);
                  uni.showToast({
                    title: "操作失败，请稍后重试",
                    icon: "none"
                  });
                } finally {
                  loading.value = false;
                }
              }
            }
          });
        } else if (type === "reject") {
          uni.showModal({
            title: "拒绝申请",
            content: `确定拒绝此${notification.type}？`,
            success: async function(res) {
              var _a, _b;
              if (res.confirm) {
                try {
                  loading.value = true;
                  const apiRes = await notificationsApi.handleNotificationAction(id, "reject", {
                    relatedId: (_a = notification.originalData) == null ? void 0 : _a.relatedId,
                    relatedType: (_b = notification.originalData) == null ? void 0 : _b.relatedType
                  });
                  if (apiRes.code === 200) {
                    removeNotification(id);
                    uni.showToast({
                      title: "已拒绝",
                      icon: "none"
                    });
                  } else {
                    uni.showToast({
                      title: apiRes.message || "操作失败",
                      icon: "none"
                    });
                  }
                } catch (error) {
                  formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:433", "拒绝操作失败:", error);
                  uni.showToast({
                    title: "操作失败，请稍后重试",
                    icon: "none"
                  });
                } finally {
                  loading.value = false;
                }
              }
            }
          });
        } else if (type === "view") {
          navigateToDetail(notification);
          removeNotification(id);
        }
      }
      const importantNotificationTypes = [
        "system_announcement",
        // 系统公告
        "team_invite",
        // 团队邀请
        "task_application"
        // 任务申请
      ];
      function readNotificationAloud(notification) {
        if (!notification || !notification.originalData || !importantNotificationTypes.includes(notification.originalData.typeId)) {
          return;
        }
        const content = `${notification.type}：${notification.message}`;
        if (window.speechSynthesis) {
          const speech = new SpeechSynthesisUtterance();
          speech.text = content;
          speech.lang = "zh-CN";
          speech.volume = 0.7;
          speech.rate = 1;
          speech.pitch = 1;
          window.speechSynthesis.speak(speech);
        }
      }
      function navigateToDetail(notification) {
        if (!notification || !notification.originalData)
          return;
        markNotificationAsRead(notification.id);
        readNotificationAloud(notification);
        const typeId = notification.originalData.typeId;
        const relatedId = notification.originalData.relatedId;
        formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:499", "准备导航，通知类型:", typeId, "关联ID:", relatedId);
        if (typeId === "team_invite" || typeId.includes("team_application")) {
          if (typeId === "team_application_received") {
            formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:506", "收到队伍申请，正在跳转到待我处理标签页");
            const url = `/pages/application/application?tab=1&type=team&id=${relatedId}`;
            formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:508", "跳转URL:", url);
            uni.navigateTo({
              url,
              success: function() {
                formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:512", "跳转成功");
              },
              fail: function(err) {
                formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:515", "跳转失败:", err);
              }
            });
          } else if (typeId === "team_application_result") {
            uni.navigateTo({
              url: `/pages/application/application?tab=0&type=team&id=${relatedId}`
            });
          } else {
            uni.navigateTo({
              url: `/pages/application/application?tab=0&type=team&id=${relatedId}`
            });
          }
        } else if (typeId.includes("task_application") || typeId.includes("task_update")) {
          uni.navigateTo({
            url: `/pages/application/application?type=task&id=${relatedId}`
          });
        } else if (typeId === "system_announcement") {
          uni.navigateTo({
            url: `/pages/notification/detail?id=${notification.id}`
          });
        } else if (typeId === "badge_application") {
          uni.navigateTo({
            url: `/pages/application/application?type=badge&id=${relatedId}`
          });
        } else {
          uni.navigateTo({
            url: `/pages/application/application`
          });
        }
      }
      function handleNotificationView(notification, index) {
        if (notification.read)
          return;
        notification.isReading = true;
        notification.viewStartTime = Date.now();
        notification.viewTimer = setTimeout(() => {
          markNotificationAsRead(notification.id);
        }, 2e3);
      }
      function handleNotificationLeave(notification) {
        notification.isReading = false;
        if (notification.viewTimer) {
          clearTimeout(notification.viewTimer);
          notification.viewTimer = null;
        }
        if (notification.read)
          return;
        if (notification.viewStartTime && Date.now() - notification.viewStartTime > 1e3) {
          markNotificationAsRead(notification.id);
        }
      }
      function isNotificationVisible(element) {
        if (!element)
          return false;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top >= 0 && rect.bottom <= windowHeight && rect.height > 0;
      }
      function handleScroll() {
        if (isEditMode.value)
          return;
        const notifications = activeTab.value === "unread" ? unreadNotifications.value : readNotifications.value;
        const notificationElements = document.querySelectorAll(".notification-item");
        notificationElements.forEach((element, index) => {
          if (index < notifications.length && isNotificationVisible(element)) {
            const notification = notifications[index];
            if (!notification.read && !notification.scrollTimer) {
              notification.scrollTimer = setTimeout(() => {
                markNotificationAsRead(notification.id);
                notification.scrollTimer = null;
              }, 3e3);
            }
          }
        });
      }
      async function markNotificationAsRead(id) {
        const unreadIndex = unreadNotifications.value.findIndex((item) => item.id === id);
        if (unreadIndex === -1) {
          return;
        }
        try {
          if (unreadIndex !== -1) {
            const notification = unreadNotifications.value.splice(unreadIndex, 1)[0];
            notification.read = true;
            readNotifications.value.unshift(notification);
            unreadCount.value--;
            if (app && app.globalData) {
              app.globalData.unreadNotificationCount = Math.max(0, app.globalData.unreadNotificationCount - 1);
              if (app.updateMessageBadge) {
                app.updateMessageBadge();
              }
            }
          }
          await notificationsApi.markAsRead(id);
        } catch (error) {
          formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:665", "标记已读失败:", error);
        }
      }
      function monitorWebSocketStatus() {
        const statusTimer = setInterval(() => {
          wsConnected.value = websocket.isConnected();
        }, 5e3);
        vue.onUnmounted(() => {
          clearInterval(statusTimer);
        });
      }
      async function loadNotifications(refresh = false) {
        if (loading.value)
          return;
        try {
          loading.value = true;
          if (refresh) {
            pagination.value.current = 1;
            refreshing.value = true;
          }
          const res = await notificationsApi.getNotificationList({
            pageNum: pagination.value.current,
            pageSize: pagination.value.size,
            onlyUnread: activeTab.value === "unread",
            // 未读标签页只请求未读通知
            onlyRead: activeTab.value === "read"
            // 已读标签页只请求已读通知
          });
          if (res.code === 200 && res.data) {
            const notifications = (res.data.records || []).map((item) => {
              return {
                id: item.id,
                type: item.typeName,
                message: item.content || item.title,
                time: formatTime2(item.createdAt),
                avatar: getAvatarByType2(item.typeId),
                read: item.isRead,
                // 确保正确映射已读状态
                actions: getActionsForNotification(item),
                originalData: item,
                // 添加UI状态属性
                isReading: false,
                viewStartTime: null,
                viewTimer: null,
                scrollTimer: null
              };
            });
            pagination.value = {
              current: res.data.current,
              size: res.data.size,
              total: res.data.total,
              pages: res.data.pages
            };
            hasMore.value = pagination.value.current < pagination.value.pages;
            if (refresh) {
              if (activeTab.value === "unread") {
                unreadNotifications.value = notifications.filter((item) => !item.read);
              } else if (activeTab.value === "read") {
                readNotifications.value = notifications.filter((item) => item.read);
              }
            } else {
              if (activeTab.value === "unread") {
                const newUnread = notifications.filter((item) => !item.read);
                unreadNotifications.value = [...unreadNotifications.value, ...newUnread];
              } else if (activeTab.value === "read") {
                const newRead = notifications.filter((item) => item.read);
                readNotifications.value = [...readNotifications.value, ...newRead];
              }
            }
            if (activeTab.value === "unread" || refresh) {
              unreadCount.value = activeTab.value === "unread" ? unreadNotifications.value.length : notifications.filter((item) => !item.read).length;
              if (app && app.globalData) {
                app.globalData.unreadNotificationCount = unreadCount.value;
                updateTabBarBadge(unreadCount.value);
              }
            }
          } else {
            uni.showToast({
              title: res.message || "获取通知失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:778", "获取通知列表失败:", error);
          uni.showToast({
            title: "获取通知失败",
            icon: "none"
          });
        } finally {
          loading.value = false;
          refreshing.value = false;
        }
      }
      function updateTabBarBadge(count) {
        if (!app || !app.updateMessageBadge)
          return;
        try {
          app.updateMessageBadge();
        } catch (error) {
          try {
            if (count > 0) {
              uni.setTabBarBadge({
                index: 4,
                // 消息页面的TabBar索引，根据实际情况调整
                text: count.toString()
              }).catch((err) => {
                formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:804", "设置TabBar徽标失败，可能不在TabBar页面", err);
              });
            } else {
              uni.removeTabBarBadge({
                index: 4
              }).catch((err) => {
                formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:811", "移除TabBar徽标失败，可能不在TabBar页面", err);
              });
            }
          } catch (e) {
            formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:816", "TabBar操作失败，可能不在TabBar页面");
          }
        }
      }
      function getActionsForNotification(notification) {
        if (notification.typeId.includes("team_application") && !notification.isRead) {
          return [
            { name: "接受", type: "accept", primary: true },
            { name: "拒绝", type: "reject", primary: false }
          ];
        } else if (notification.typeId === "team_invite" && !notification.isRead) {
          return [
            { name: "接受", type: "accept", primary: true },
            { name: "拒绝", type: "reject", primary: false }
          ];
        } else {
          return [{ name: "查看", type: "view", primary: true }];
        }
      }
      function formatTime2(dateStr) {
        try {
          const date = new Date(dateStr);
          const now = /* @__PURE__ */ new Date();
          const diff = now - date;
          if (diff < 60 * 1e3) {
            return "刚刚";
          } else if (diff < 60 * 60 * 1e3) {
            return Math.floor(diff / (60 * 1e3)) + "分钟前";
          } else if (diff < 24 * 60 * 60 * 1e3) {
            return Math.floor(diff / (60 * 60 * 1e3)) + "小时前";
          } else if (diff < 30 * 24 * 60 * 60 * 1e3) {
            return Math.floor(diff / (24 * 60 * 60 * 1e3)) + "天前";
          } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:869", "格式化时间错误", e);
          return dateStr;
        }
      }
      function switchTab(tab) {
        if (activeTab.value === tab)
          return;
        activeTab.value = tab;
        loadNotifications(true);
      }
      function onRefresh() {
        loadNotifications(true);
      }
      function loadMore() {
        if (loading.value || !hasMore.value)
          return;
        pagination.value.current++;
        loadNotifications(false);
      }
      async function batchDeleteNotifications2(ids) {
        if (!ids || ids.length === 0)
          return;
        try {
          loading.value = true;
          const res = await notificationsApi.batchDeleteNotifications(ids);
          if (res.code === 200) {
            ids.forEach((id) => {
              const unreadIndex = unreadNotifications.value.findIndex((item) => item.id === id);
              if (unreadIndex !== -1) {
                unreadNotifications.value.splice(unreadIndex, 1);
                unreadCount.value--;
              }
              const readIndex = readNotifications.value.findIndex((item) => item.id === id);
              if (readIndex !== -1) {
                readNotifications.value.splice(readIndex, 1);
              }
            });
            if (app && app.globalData) {
              app.globalData.unreadNotificationCount = unreadCount.value;
              if (app.updateMessageBadge) {
                app.updateMessageBadge();
              }
            }
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: res.message || "删除失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/Xiaoxi/Xiaoxi.vue:943", "批量删除通知失败:", error);
          uni.showToast({
            title: "操作失败，请稍后重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      }
      vue.onMounted(() => {
        loadNotifications(true);
        monitorWebSocketStatus();
        const scrollView = document.querySelector(".notification-list");
        if (scrollView) {
          scrollView.addEventListener("scroll", handleScroll);
        }
        listenForNewNotifications();
        formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:970", "通知页面加载完成");
      });
      function listenForNewNotifications() {
        uni.$on("newNotification", (notification) => {
          formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:977", "消息页面接收到新通知:", notification);
          addNewNotificationToUI(notification);
        });
      }
      function addNewNotificationToUI(notification) {
        if (!notification)
          return;
        const newNotification = {
          id: notification.id,
          type: notification.typeName,
          message: notification.content || notification.title,
          time: notification.time || formatTime2(notification.createdAt || /* @__PURE__ */ new Date()),
          avatar: getAvatarByType2(notification.typeId),
          read: notification.isRead || false,
          actions: notification.actions || getActionsForNotification(notification),
          // 保存原始数据，用于后续处理
          originalData: notification,
          // UI状态属性
          isReading: false,
          viewStartTime: null,
          viewTimer: null,
          scrollTimer: null
        };
        if (!newNotification.read) {
          const existingIndex = unreadNotifications.value.findIndex((item) => item.id === newNotification.id);
          if (existingIndex === -1) {
            unreadNotifications.value.unshift(newNotification);
            unreadCount.value++;
          }
        } else {
          const existingIndex = readNotifications.value.findIndex((item) => item.id === newNotification.id);
          if (existingIndex === -1) {
            readNotifications.value.unshift(newNotification);
          }
        }
        playNotificationSound();
      }
      function playNotificationSound() {
        try {
          const audio = uni.createInnerAudioContext();
          audio.src = "/static/sounds/notification.mp3";
          audio.play();
        } catch (error) {
          formatAppLog("log", "at pages/Xiaoxi/Xiaoxi.vue:1034", "播放通知提示音失败", error);
        }
      }
      vue.onUnmounted(() => {
        const scrollView = document.querySelector(".notification-list");
        if (scrollView) {
          scrollView.removeEventListener("scroll", handleScroll);
        }
        const allNotifications = [...unreadNotifications.value, ...readNotifications.value];
        allNotifications.forEach((notification) => {
          if (notification.viewTimer)
            clearTimeout(notification.viewTimer);
          if (notification.scrollTimer)
            clearTimeout(notification.scrollTimer);
        });
        uni.$off("newNotification");
      });
      const __returned__ = { app, wsConnected, activeTab, unreadCount, unreadNotifications, readNotifications, pagination, loading, refreshing, hasMore, isEditMode, selectedItems, isAllSelected, toggleEditMode, toggleSelectItem, toggleSelectAll, confirmBatchDelete, handleNewNotification, getAvatarByType: getAvatarByType2, markAllAsRead: markAllAsRead2, handleAction, importantNotificationTypes, readNotificationAloud, navigateToDetail, handleNotificationView, handleNotificationLeave, isNotificationVisible, handleScroll, markNotificationAsRead, monitorWebSocketStatus, loadNotifications, updateTabBarBadge, getActionsForNotification, formatTime: formatTime2, switchTab, onRefresh, loadMore, batchDeleteNotifications: batchDeleteNotifications2, listenForNewNotifications, addNewNotificationToUI, playNotificationSound, ref: vue.ref, onMounted: vue.onMounted, onUnmounted: vue.onUnmounted, computed: vue.computed, get notificationService() {
        return notificationService;
      }, get websocket() {
        return websocket;
      }, get notificationsApi() {
        return notificationsApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "navbar" }, [
          vue.createElementVNode("view", { class: "title" }, "通知"),
          vue.createElementVNode("view", { class: "actions" }, [
            !$setup.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "mark-read",
              onClick: $setup.markAllAsRead
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-check" }),
              vue.createElementVNode("text", { class: "mark-text" }, "全部标记为已读")
            ])) : vue.createCommentVNode("v-if", true),
            !$setup.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "edit-btn",
              onClick: $setup.toggleEditMode
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-edit" }),
              vue.createElementVNode("text", { class: "edit-text" }, "编辑")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "edit-actions"
            }, [
              vue.createElementVNode("view", {
                class: "cancel-btn",
                onClick: $setup.toggleEditMode
              }, [
                vue.createElementVNode("text", null, "取消")
              ]),
              vue.createElementVNode("view", {
                class: "delete-btn",
                onClick: $setup.confirmBatchDelete
              }, [
                vue.createElementVNode("text", { class: "iconfont icon-delete" }),
                vue.createElementVNode("text", null, "删除")
              ])
            ]))
          ])
        ]),
        vue.createCommentVNode(" WebSocket连接状态指示器 "),
        vue.createCommentVNode(` <view class="ws-status" :class="{ 'connected': wsConnected }">
        <text class="ws-status-text">{{ wsConnected ? '实时消息已连接' : '实时消息未连接' }}</text>
        <view class="ws-indicator"></view>
      </view> `)
      ]),
      vue.createCommentVNode(" 标签页 "),
      vue.createElementVNode("view", { class: "tabs" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", $setup.activeTab === "unread" ? "tab-active" : ""]),
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("unread"))
          },
          [
            vue.createElementVNode("text", null, "未读"),
            $setup.unreadCount > 0 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "badge"
              },
              vue.toDisplayString($setup.unreadCount),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", $setup.activeTab === "read" ? "tab-active" : ""]),
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("read"))
          },
          [
            vue.createElementVNode("text", null, "已读")
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createCommentVNode(" 通知列表 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "notification-list",
        "refresher-enabled": "",
        "refresher-triggered": $setup.refreshing,
        onRefresherrefresh: $setup.onRefresh,
        onScrolltolower: $setup.loadMore
      }, [
        vue.createCommentVNode(" 未读通知列表 "),
        $setup.activeTab === "unread" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.unreadNotifications, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["notification-item unread", {
                  "item-selected": $setup.isEditMode && $setup.selectedItems.includes(item.id),
                  "reading": item.isReading
                }]),
                key: index,
                onMouseenter: ($event) => !$setup.isEditMode && $setup.handleNotificationView(item, index),
                onMouseleave: ($event) => !$setup.isEditMode && $setup.handleNotificationLeave(item),
                onTouchstart: ($event) => !$setup.isEditMode && $setup.handleNotificationView(item, index),
                onTouchend: ($event) => !$setup.isEditMode && $setup.handleNotificationLeave(item)
              }, [
                $setup.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "select-box",
                  onClick: vue.withModifiers(($event) => $setup.toggleSelectItem(item.id), ["stop"])
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["checkbox", { "checked": $setup.selectedItems.includes(item.id) }])
                    },
                    [
                      $setup.selectedItems.includes(item.id) ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "iconfont icon-check"
                      })) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  )
                ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "notification-avatar" }, [
                  vue.createElementVNode("image", {
                    src: item.avatar || "/static/default-avatar.png",
                    mode: "aspectFill"
                  }, null, 8, ["src"])
                ]),
                vue.createElementVNode("view", {
                  class: "notification-content",
                  onClick: ($event) => $setup.isEditMode ? $setup.toggleSelectItem(item.id) : $setup.navigateToDetail(item)
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "notification-type" },
                    vue.toDisplayString(item.type),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "notification-message" },
                    vue.toDisplayString(item.message),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "notification-time" },
                    vue.toDisplayString(item.time),
                    1
                    /* TEXT */
                  ),
                  vue.createCommentVNode(" 操作按钮 "),
                  !$setup.isEditMode && item.actions ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "notification-actions"
                  }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(item.actions, (action, idx) => {
                        return vue.openBlock(), vue.createElementBlock("button", {
                          key: idx,
                          class: vue.normalizeClass(["action-btn", action.primary ? "btn-primary" : "btn-default"]),
                          onClick: vue.withModifiers(($event) => $setup.handleAction(action.type, item.id), ["stop"])
                        }, vue.toDisplayString(action.name), 11, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])) : vue.createCommentVNode("v-if", true)
                ], 8, ["onClick"])
              ], 42, ["onMouseenter", "onMouseleave", "onTouchstart", "onTouchend"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 已读通知列表 "),
        $setup.activeTab === "read" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.readNotifications, (item, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["notification-item read", {
                    "item-selected": $setup.isEditMode && $setup.selectedItems.includes(item.id)
                  }]),
                  key: index
                },
                [
                  $setup.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "select-box",
                    onClick: vue.withModifiers(($event) => $setup.toggleSelectItem(item.id), ["stop"])
                  }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["checkbox", { "checked": $setup.selectedItems.includes(item.id) }])
                      },
                      [
                        $setup.selectedItems.includes(item.id) ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "iconfont icon-check"
                        })) : vue.createCommentVNode("v-if", true)
                      ],
                      2
                      /* CLASS */
                    )
                  ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "notification-avatar" }, [
                    vue.createElementVNode("image", {
                      src: item.avatar || "/static/default-avatar.png",
                      mode: "aspectFill"
                    }, null, 8, ["src"])
                  ]),
                  vue.createElementVNode("view", {
                    class: "notification-content",
                    onClick: ($event) => $setup.isEditMode ? $setup.toggleSelectItem(item.id) : $setup.navigateToDetail(item)
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "notification-type" },
                      vue.toDisplayString(item.type),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "notification-message" },
                      vue.toDisplayString(item.message),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "notification-time" },
                      vue.toDisplayString(item.time),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 加载更多 "),
        $setup.loading && !$setup.refreshing ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "loading-more"
        }, [
          vue.createElementVNode("text", null, "加载中...")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 无更多数据 "),
        !$setup.loading && !$setup.hasMore && ($setup.activeTab === "unread" ? $setup.unreadNotifications.length > 0 : $setup.readNotifications.length > 0) ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "no-more"
        }, [
          vue.createElementVNode("text", null, "没有更多了")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 无通知状态 "),
        !$setup.loading && ($setup.activeTab === "unread" && $setup.unreadNotifications.length === 0) || $setup.activeTab === "read" && $setup.readNotifications.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "empty-state"
        }, [
          vue.createElementVNode("image", {
            class: "empty-image",
            src: _imports_0$1,
            mode: "aspectFit"
          }),
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            "暂无" + vue.toDisplayString($setup.activeTab === "unread" ? "未读" : "已读") + "通知",
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ], 40, ["refresher-triggered"]),
      vue.createCommentVNode(" 底部批量操作栏 "),
      $setup.isEditMode ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "bottom-action-bar"
      }, [
        vue.createElementVNode("view", {
          class: "select-all",
          onClick: $setup.toggleSelectAll
        }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["checkbox", { "checked": $setup.isAllSelected }])
            },
            [
              $setup.isAllSelected ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "iconfont icon-check"
              })) : vue.createCommentVNode("v-if", true)
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode("text", null, "全选")
        ]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["batch-delete", { "disabled": $setup.selectedItems.length === 0 }]),
            onClick: $setup.confirmBatchDelete
          },
          [
            vue.createElementVNode(
              "text",
              null,
              "删除(" + vue.toDisplayString($setup.selectedItems.length) + ")",
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesXiaoxiXiaoxi = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/Xiaoxi/Xiaoxi.vue"]]);
  const _imports_0 = "/static/images/empty.png";
  const _sfc_main$2 = {
    __name: "application",
    setup(__props, { expose: __expose }) {
      __expose();
      const baseApiUrl2 = config.baseUrl;
      const refreshing = vue.ref(false);
      const loading = vue.ref(false);
      const hasNoMore = vue.ref(false);
      const currentPage = vue.ref(1);
      const pageSize = vue.ref(10);
      const loadMoreText = {
        contentdown: "上拉显示更多",
        contentrefresh: "正在加载...",
        contentnomore: "已经到底啦"
      };
      const currentRole = vue.ref("applicant");
      const tabs = vue.ref([
        { name: "我发起的", badge: 0, role: "applicant" },
        { name: "待我处理", badge: 0, role: "creator" }
      ]);
      const currentTab = vue.ref(0);
      const applicationTypes = vue.ref([
        { label: "全部", value: "all" },
        { label: "任务申请", value: "task" },
        { label: "队伍申请", value: "team" },
        { label: "徽章申请", value: "badge" }
      ]);
      const getApplicationTypes = vue.computed(() => {
        if (currentTab.value === 1) {
          return applicationTypes.value.filter((type) => type.value !== "badge");
        }
        return applicationTypes.value;
      });
      const statusTypes = vue.ref([
        { label: "全部", value: "all" },
        { label: "待处理", value: "pending" },
        { label: "已通过", value: "approved" },
        { label: "已拒绝", value: "rejected" },
        { label: "已取消", value: "canceled" }
      ]);
      const pendingStatusTypes = vue.ref([
        { label: "全部", value: "all" },
        { label: "未处理", value: "pending" },
        { label: "已处理", value: "processed" }
        // 特殊值，表示已处理的所有状态
      ]);
      const selectedType = vue.ref("all");
      const selectedStatus = vue.ref("all");
      const applications = vue.ref([]);
      const filteredApplications = vue.computed(() => {
        const list = applications.value.map((item) => {
          let statusText = "";
          switch (item.status) {
            case "pending":
              statusText = "待处理";
              break;
            case "approved":
              statusText = "已通过";
              break;
            case "rejected":
              statusText = "已拒绝";
              break;
            case "canceled":
              statusText = "已取消";
              break;
            case "returned":
              statusText = "已退回";
              break;
            default:
              statusText = "未知状态";
          }
          return {
            ...item,
            statusText
          };
        });
        let filtered = list;
        if (selectedStatus.value !== "all") {
          if (selectedStatus.value === "processed") {
            filtered = filtered.filter(
              (item) => item.status === "approved" || item.status === "rejected" || item.status === "canceled"
            );
          } else {
            filtered = filtered.filter((item) => item.status === selectedStatus.value);
          }
        }
        if (selectedType.value !== "all") {
          filtered = filtered.filter((item) => item.type === selectedType.value);
        }
        return filtered;
      });
      vue.onMounted(() => {
        let query = {};
        if (uni.getSystemInfoSync().platform === "h5") {
          query = getQueryParams();
        } else {
          const instance = vue.getCurrentInstance();
          if (instance && instance.proxy && instance.proxy.$mp && instance.proxy.$mp.query) {
            query = instance.proxy.$mp.query;
          }
        }
        handleUrlParams(query);
        loadBadgeCount();
        loadApplications(true);
      });
      function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split("&");
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i].split("=");
          params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
        }
        return params;
      }
      function handleUrlParams(query) {
        formatAppLog("log", "at pages/application/application.vue:333", "处理URL参数:", query);
        if (query.tab !== void 0) {
          const tabIndex = parseInt(query.tab);
          if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.value.length) {
            switchTab(tabIndex);
          }
        }
        if (query.type) {
          const type = query.type;
          if (["task", "team", "badge", "all"].includes(type)) {
            selectedType.value = type;
          }
        }
        if (query.id) {
          targetApplicationId.value = query.id;
        }
      }
      const targetApplicationId = vue.ref(null);
      function scrollToApplication() {
        if (!targetApplicationId.value)
          return;
        setTimeout(() => {
          const selector = `.application-card[data-id="${targetApplicationId.value}"]`;
          const query = uni.createSelectorQuery();
          query.select(selector).boundingClientRect();
          query.selectViewport().scrollOffset();
          query.exec((res) => {
            if (res[0]) {
              uni.pageScrollTo({
                scrollTop: res[1].scrollTop + res[0].top - 100,
                // 减去一些偏移，让元素不要太靠近顶部
                duration: 300
              });
              highlightApplication(targetApplicationId.value);
            }
          });
          targetApplicationId.value = null;
        }, 500);
      }
      function highlightApplication(id) {
        const element = document.querySelector(`.application-card[data-id="${id}"]`);
        if (!element)
          return;
        element.classList.add("highlight-application");
        setTimeout(() => {
          element.classList.remove("highlight-application");
        }, 3e3);
      }
      function getCardTitle(item) {
        if (!item || !item.type)
          return "申请";
        if (item.type === "task") {
          return item.taskTitle || "任务申请";
        } else if (item.type === "team") {
          return item.teamName || "队伍申请";
        } else if (item.type === "badge") {
          return item.badgeTitle || "徽章申请";
        }
        return "申请";
      }
      function getTypeClass(type) {
        if (type === "task")
          return "task-type";
        if (type === "team")
          return "team-type";
        if (type === "badge")
          return "badge-type";
        return "";
      }
      function getApplicationClass(type) {
        if (!type)
          return "card-task";
        if (type === "task")
          return "card-task";
        if (type === "team")
          return "card-team";
        if (type === "badge")
          return "card-badge";
        return "card-task";
      }
      async function loadApplications(isRefresh = false) {
        if (isRefresh) {
          currentPage.value = 1;
          hasNoMore.value = false;
          applications.value = [];
        }
        if (loading.value)
          return;
        loading.value = true;
        try {
          if (currentTab.value === 0) {
            currentRole.value = "applicant";
          } else if (currentTab.value === 1) {
            currentRole.value = "creator";
          }
          if (selectedType.value === "all" || selectedType.value === "task") {
            await loadTaskApplications(isRefresh);
          }
          if (selectedType.value === "all" || selectedType.value === "team") {
            await loadTeamApplications(isRefresh);
          }
          if ((selectedType.value === "all" || selectedType.value === "badge") && currentTab.value === 0) {
            await loadBadgeApplications(isRefresh);
          }
          formatAppLog("log", "at pages/application/application.vue:468", "加载完成的应用列表数据：", applications.value);
          if (targetApplicationId.value) {
            scrollToApplication();
          }
        } catch (error) {
          formatAppLog("error", "at pages/application/application.vue:476", "获取申请列表失败:", error);
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none"
          });
        } finally {
          loading.value = false;
          if (refreshing.value) {
            refreshing.value = false;
          }
        }
      }
      async function loadTaskApplications(isRefresh) {
        try {
          const params = {
            pageNum: currentPage.value,
            pageSize: pageSize.value
          };
          if (selectedStatus.value !== "all" && selectedStatus.value !== "processed") {
            params.status = selectedStatus.value;
          }
          params.role = currentRole.value;
          const res = await taskApplicationApi.getTaskApplicationList(params);
          if (res && res.code === 200 && res.data) {
            const taskList = (res.data.list || []).map((item) => ({
              ...item,
              type: "task"
              // 确保每个任务申请都有type字段
            }));
            if (isRefresh) {
              if (selectedType.value === "task") {
                applications.value = taskList;
              } else if (selectedType.value === "all") {
                applications.value = taskList;
              }
            } else {
              applications.value = [...applications.value, ...taskList];
            }
            if (selectedType.value === "task") {
              hasNoMore.value = !res.data.hasNext;
            }
            formatAppLog("log", "at pages/application/application.vue:535", "任务申请列表:", taskList);
          }
        } catch (error) {
          formatAppLog("error", "at pages/application/application.vue:538", "获取任务申请列表失败:", error);
          uni.showToast({
            title: "获取任务申请失败",
            icon: "none"
          });
        }
      }
      async function loadTeamApplications(isRefresh) {
        try {
          const params = {
            pageNum: currentPage.value,
            pageSize: pageSize.value
          };
          if (selectedStatus.value !== "all" && selectedStatus.value !== "processed") {
            params.status = selectedStatus.value;
          }
          let res;
          if (currentRole.value === "applicant") {
            res = await teamApi.getMyApplications(params);
          } else if (currentRole.value === "creator" || currentRole.value === "leader") {
            res = await teamApi.getTeamApplications(params);
          }
          if (res && res.code === 200 && res.data) {
            const teamList = (res.data.list || []).map((item) => ({
              ...item,
              type: "team"
              // 确保每个队伍申请都有type字段
            }));
            if (isRefresh) {
              if (selectedType.value === "team") {
                applications.value = teamList;
              } else if (selectedType.value === "all") {
                applications.value = [...applications.value, ...teamList];
              }
            } else {
              applications.value = [...applications.value, ...teamList];
            }
            if (selectedType.value === "team") {
              hasNoMore.value = !res.data.hasNext;
            }
            formatAppLog("log", "at pages/application/application.vue:594", "队伍申请列表:", teamList);
          }
        } catch (error) {
          formatAppLog("error", "at pages/application/application.vue:597", "获取队伍申请列表失败:", error);
          uni.showToast({
            title: "获取队伍申请失败",
            icon: "none"
          });
        }
      }
      async function loadBadgeApplications(isRefresh) {
        try {
          const params = {
            pageNum: currentPage.value,
            pageSize: pageSize.value
          };
          if (selectedStatus.value !== "all" && selectedStatus.value !== "processed") {
            params.status = selectedStatus.value;
          }
          let res;
          try {
            res = await uni.request({
              url: `${baseApiUrl2}/badge/approvals/my-applications`,
              method: "GET",
              data: params,
              header: {
                "Authorization": `Bearer ${uni.getStorageSync("token")}`
              }
            });
          } catch (error) {
            formatAppLog("error", "at pages/application/application.vue:630", "徽章申请请求失败:", error);
            res = {
              statusCode: 500,
              data: null
            };
          }
          if (res.statusCode === 200 && res.data && res.data.code === 200) {
            const badgeList = (res.data.data.records || []).map((item) => ({
              ...item,
              id: item.approvalId,
              type: "badge",
              status: item.currentStatus,
              appliedAt: item.createdAt,
              reviewedAt: item.updatedAt,
              message: item.reviewMessage,
              reviewNotes: item.adminFeedback,
              // 为了适配显示格式，添加一些字段
              badgeTitle: "徽章申请 " + (item.requestedBadge ? `#${item.requestedBadge}` : ""),
              applicantName: item.applicantType === "team" ? "团队申请" : "个人申请"
            }));
            if (isRefresh) {
              if (selectedType.value === "badge") {
                applications.value = badgeList;
              } else if (selectedType.value === "all") {
                applications.value = [...applications.value, ...badgeList];
              }
            } else {
              applications.value = [...applications.value, ...badgeList];
            }
            if (selectedType.value === "badge") {
              const totalPages = Math.ceil(res.data.data.total / pageSize.value);
              hasNoMore.value = currentPage.value >= totalPages;
            }
            formatAppLog("log", "at pages/application/application.vue:676", "徽章申请列表:", badgeList);
          }
        } catch (error) {
          formatAppLog("error", "at pages/application/application.vue:679", "获取徽章申请列表失败:", error);
          uni.showToast({
            title: "获取徽章申请失败",
            icon: "none"
          });
        }
      }
      async function loadBadgeCount() {
        try {
          const taskParams = { status: "pending", role: "creator", pageSize: 1 };
          const taskRes = await taskApplicationApi.getTaskApplicationList(taskParams);
          const teamParams = { status: "pending", pageSize: 1 };
          const teamRes = await teamApi.getTeamApplications(teamParams);
          let totalPending = 0;
          if (taskRes && taskRes.code === 200 && taskRes.data && taskRes.data.pendingCount !== void 0) {
            totalPending += taskRes.data.pendingCount;
          }
          if (teamRes && teamRes.code === 200 && teamRes.data) {
            if (teamRes.data.pendingCount !== void 0) {
              totalPending += teamRes.data.pendingCount;
            } else if (teamRes.data.total !== void 0) {
              totalPending += teamRes.data.total;
            } else {
              const pendingCount = (teamRes.data.list || []).filter((item) => item.status === "pending").length;
              totalPending += pendingCount;
            }
          }
          formatAppLog("log", "at pages/application/application.vue:718", "更新待处理数量角标:", totalPending);
          tabs.value[1].badge = totalPending;
        } catch (error) {
          formatAppLog("error", "at pages/application/application.vue:724", "获取待处理数量失败:", error);
        }
      }
      function onRefresh() {
        refreshing.value = true;
        loadBadgeCount();
        loadApplications(true);
      }
      function loadMore() {
        if (loading.value || hasNoMore.value)
          return;
        currentPage.value++;
        loadApplications(false);
      }
      function switchTab(index) {
        if (currentTab.value === index)
          return;
        currentTab.value = index;
        selectedStatus.value = "all";
        if (index === 1 && selectedType.value === "badge") {
          selectedType.value = "all";
        }
        if (index === 0) {
          currentRole.value = "applicant";
        } else if (index === 1) {
          currentRole.value = "creator";
        }
        loadApplications(true);
      }
      function selectType(type) {
        if (selectedType.value === type)
          return;
        if (currentTab.value === 1 && type === "badge") {
          uni.showToast({
            title: "待处理列表中不包含徽章申请",
            icon: "none"
          });
          return;
        }
        selectedType.value = type;
        currentPage.value = 1;
        hasNoMore.value = false;
        applications.value = [];
        loadApplications(true);
      }
      function selectStatus(status) {
        if (selectedStatus.value === status)
          return;
        selectedStatus.value = status;
        loadApplications(true);
      }
      function getStatusClass(status) {
        switch (status) {
          case "pending":
            return "status-pending";
          case "approved":
            return "status-approved";
          case "rejected":
            return "status-rejected";
          case "canceled":
            return "status-canceled";
          default:
            return "";
        }
      }
      function formatDateTime(dateTimeStr) {
        if (!dateTimeStr)
          return "-";
        try {
          const date = new Date(dateTimeStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
          return dateTimeStr;
        }
      }
      async function handleApplication(id, action, type) {
        if (!id || !type) {
          uni.showToast({
            title: "参数错误",
            icon: "none"
          });
          return;
        }
        if (type === "badge") {
          uni.showToast({
            title: "徽章申请处理功能开发中",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: action === "approved" ? "通过申请" : "拒绝申请",
          content: action === "approved" ? "确定通过该申请吗？" : "确定拒绝该申请吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "处理中..."
                });
                let result;
                if (type === "task") {
                  result = await taskApplicationApi.updateTaskApplication(id, {
                    status: action,
                    reviewNotes: action === "approved" ? "申请已通过" : "申请已拒绝"
                  });
                } else if (type === "team") {
                  result = await teamApi.handleApplication(id, {
                    status: action,
                    reviewNotes: action === "approved" ? "申请已通过" : "申请已拒绝"
                  });
                } else {
                  throw new Error("未知的申请类型");
                }
                uni.hideLoading();
                if (result && result.code === 200 && result.data && result.data.success) {
                  uni.showToast({
                    title: action === "approved" ? "已通过申请" : "已拒绝申请",
                    icon: "success"
                  });
                  loadApplications(true);
                  loadBadgeCount();
                } else {
                  uni.showToast({
                    title: (result == null ? void 0 : result.message) || "操作失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                uni.hideLoading();
                formatAppLog("error", "at pages/application/application.vue:898", "处理申请失败:", error);
                uni.showToast({
                  title: "网络异常，请稍后重试",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      async function cancelApplication(id, type) {
        if (!id || !type) {
          uni.showToast({
            title: "参数错误",
            icon: "none"
          });
          return;
        }
        if (type === "badge") {
          uni.showToast({
            title: "徽章申请取消功能开发中",
            icon: "none"
          });
          return;
        }
        uni.showModal({
          title: "取消申请",
          content: "确定要取消该申请吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "处理中..."
                });
                let result;
                if (type === "task") {
                  result = await taskApplicationApi.cancelTaskApplication(id);
                } else if (type === "team") {
                  result = await teamApi.cancelApplication(id);
                } else {
                  throw new Error("未知的申请类型");
                }
                uni.hideLoading();
                if (result && result.code === 200 && result.data && result.data.success) {
                  uni.showToast({
                    title: "已取消申请",
                    icon: "success"
                  });
                  loadApplications(true);
                  loadBadgeCount();
                } else {
                  uni.showToast({
                    title: (result == null ? void 0 : result.message) || "操作失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                uni.hideLoading();
                formatAppLog("error", "at pages/application/application.vue:968", "取消申请失败:", error);
                uni.showToast({
                  title: "网络异常，请稍后重试",
                  icon: "none"
                });
              }
            }
          }
        });
      }
      function createApplication() {
        if (selectedType.value === "team") {
          uni.navigateTo({
            url: "/pages/team/list"
          });
        } else if (selectedType.value === "badge") {
          uni.navigateTo({
            url: "/pages/badge/apply"
            // 假设有一个徽章申请页面
          });
        } else {
          uni.navigateTo({
            url: "/pages/task-square/index"
          });
        }
      }
      function viewDetail(item) {
        if (item.type === "task") {
          uni.navigateTo({
            url: `/pages/task-square/detail?id=${item.taskId}`
          });
        } else if (item.type === "team") {
          uni.navigateTo({
            url: `/pages/team/detail?id=${item.teamId}`
          });
        } else if (item.type === "badge") {
          uni.showToast({
            title: "徽章申请详情功能开发中",
            icon: "none"
          });
        }
      }
      function goBack() {
        uni.navigateBack();
      }
      const __returned__ = { baseApiUrl: baseApiUrl2, refreshing, loading, hasNoMore, currentPage, pageSize, loadMoreText, currentRole, tabs, currentTab, applicationTypes, getApplicationTypes, statusTypes, pendingStatusTypes, selectedType, selectedStatus, applications, filteredApplications, getQueryParams, handleUrlParams, targetApplicationId, scrollToApplication, highlightApplication, getCardTitle, getTypeClass, getApplicationClass, loadApplications, loadTaskApplications, loadTeamApplications, loadBadgeApplications, loadBadgeCount, onRefresh, loadMore, switchTab, selectType, selectStatus, getStatusClass, formatDateTime, handleApplication, cancelApplication, createApplication, viewDetail, goBack, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, getCurrentInstance: vue.getCurrentInstance, get taskApplicationApi() {
        return taskApplicationApi;
      }, get teamApi() {
        return teamApi;
      }, get config() {
        return config;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "application-container" }, [
      vue.createCommentVNode(" 固定区域 "),
      vue.createElementVNode("view", { class: "fixed-area" }, [
        vue.createCommentVNode(" 顶部导航栏 "),
        vue.createElementVNode("view", { class: "nav-bar" }, [
          vue.createElementVNode("view", {
            class: "back-btn",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left" })
          ]),
          vue.createElementVNode("text", { class: "page-title" }, "申请管理"),
          vue.createElementVNode("view", { class: "placeholder-right" })
        ]),
        vue.createCommentVNode(" 标签页 "),
        vue.createElementVNode("view", { class: "tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.tabs, (tab, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["tab", { active: $setup.currentTab === index }]),
                onClick: ($event) => $setup.switchTab(index)
              }, [
                vue.createTextVNode(
                  vue.toDisplayString(tab.name) + " ",
                  1
                  /* TEXT */
                ),
                tab.badge && tab.badge > 0 ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "badge"
                  },
                  vue.toDisplayString(tab.badge),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createCommentVNode(" 分类筛选 "),
        vue.createElementVNode("view", { class: "filter-tabs" }, [
          vue.createElementVNode("view", { class: "filter-options" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.getApplicationTypes, (type, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: vue.normalizeClass(["filter-tab", { active: $setup.selectedType === type.value }]),
                  onClick: ($event) => $setup.selectType(type.value)
                }, vue.toDisplayString(type.label), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 状态筛选标签 "),
        vue.createElementVNode("view", { class: "filter-tabs status-tabs" }, [
          vue.createElementVNode("view", { class: "filter-options" }, [
            vue.createCommentVNode(" 待处理标签页使用简化的状态筛选 "),
            $setup.currentTab === 1 ? (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              vue.renderList($setup.pendingStatusTypes, (status, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: vue.normalizeClass(["filter-tab", { active: $setup.selectedStatus === status.value }]),
                  onClick: ($event) => $setup.selectStatus(status.value)
                }, vue.toDisplayString(status.label), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                vue.createCommentVNode(" 其他标签页使用完整的状态筛选 "),
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.statusTypes, (status, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: index,
                      class: vue.normalizeClass(["filter-tab", { active: $setup.selectedStatus === status.value }]),
                      onClick: ($event) => $setup.selectStatus(status.value)
                    }, vue.toDisplayString(status.label), 11, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ],
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createCommentVNode(" 申请列表内容 "),
      vue.createElementVNode("scroll-view", {
        class: "application-list",
        "scroll-y": "",
        "refresher-enabled": "",
        onRefresherrefresh: $setup.onRefresh,
        "refresher-triggered": $setup.refreshing,
        onScrolltolower: $setup.loadMore
      }, [
        vue.createCommentVNode(" 任务申请卡片 "),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.filteredApplications, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["application-card", [$setup.getApplicationClass(item.type), $setup.getStatusClass(item.status)]]),
              "data-id": item.id
            }, [
              vue.createCommentVNode(" 状态角标 - 右上角 "),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["status-corner", $setup.getStatusClass(item.status)])
                },
                vue.toDisplayString(item.statusText),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode("view", { class: "card-content" }, [
                vue.createElementVNode("view", { class: "card-title" }, [
                  vue.createTextVNode(
                    vue.toDisplayString($setup.getCardTitle(item)) + " ",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["type-tag", $setup.getTypeClass(item.type)])
                    },
                    vue.toDisplayString(item.type === "task" ? "任务" : item.type === "team" ? "队伍" : item.type === "badge" ? "徽章" : "未知"),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createCommentVNode(" 如果当前角色是创建者，显示申请人信息 "),
                vue.createElementVNode("view", { class: "card-info" }, [
                  $setup.currentRole === "creator" || $setup.currentRole === "leader" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "info-item"
                  }, [
                    vue.createElementVNode("text", { class: "info-label" }, "申请人："),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(item.applicantName) + " " + vue.toDisplayString(item.applicantMajor ? "· " + item.applicantMajor : ""),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  item.type === "team" && item.roleName ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "info-item"
                  }, [
                    vue.createElementVNode("text", { class: "info-label" }, "申请角色："),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(item.roleName),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "info-label" }, "申请时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString($setup.formatDateTime(item.appliedAt)),
                      1
                      /* TEXT */
                    )
                  ]),
                  item.message ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 2,
                    class: "info-item"
                  }, [
                    vue.createElementVNode("text", { class: "info-label" }, "申请理由："),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(item.message),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  item.reviewNotes && item.status !== "pending" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 3,
                    class: "info-item"
                  }, [
                    vue.createElementVNode("text", { class: "info-label" }, "审核备注："),
                    vue.createElementVNode(
                      "text",
                      { class: "info-value" },
                      vue.toDisplayString(item.reviewNotes),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ]),
              vue.createCommentVNode(" 操作按钮: 创建者角色可批准/拒绝，申请者角色可取消申请 "),
              ($setup.currentRole === "creator" || $setup.currentRole === "leader") && item.status === "pending" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "card-footer"
              }, [
                vue.createElementVNode("view", { class: "btn-group" }, [
                  vue.createElementVNode("button", {
                    class: "btn btn-approve",
                    onClick: vue.withModifiers(($event) => $setup.handleApplication(item.id, "approved", item.type), ["stop"])
                  }, "通过", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "btn btn-reject",
                    onClick: vue.withModifiers(($event) => $setup.handleApplication(item.id, "rejected", item.type), ["stop"])
                  }, "拒绝", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "btn btn-detail",
                    onClick: vue.withModifiers(($event) => $setup.viewDetail(item), ["stop"])
                  }, "查看详情", 8, ["onClick"])
                ])
              ])) : $setup.currentRole === "applicant" && item.status === "pending" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "card-footer"
              }, [
                vue.createElementVNode("view", { class: "btn-group" }, [
                  vue.createElementVNode("button", {
                    class: "btn btn-reject",
                    onClick: vue.withModifiers(($event) => $setup.cancelApplication(item.id, item.type), ["stop"])
                  }, "取消申请", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "btn btn-detail",
                    onClick: vue.withModifiers(($event) => $setup.viewDetail(item), ["stop"])
                  }, "查看详情", 8, ["onClick"])
                ])
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "card-footer"
              }, [
                vue.createElementVNode("view", { class: "btn-group" }, [
                  vue.createElementVNode("button", {
                    class: "btn btn-detail",
                    onClick: vue.withModifiers(($event) => $setup.viewDetail(item), ["stop"])
                  }, "查看详情", 8, ["onClick"])
                ]),
                item.reviewedAt ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "process-time"
                  },
                  "处理时间：" + vue.toDisplayString($setup.formatDateTime(item.reviewedAt)),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]))
            ], 10, ["data-id"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        vue.createCommentVNode(" 空状态 "),
        $setup.filteredApplications.length === 0 && !$setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("image", {
            class: "empty-image",
            src: _imports_0,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无申请记录")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 加载状态 "),
        $setup.loading && !$setup.refreshing ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-more"
        }, [
          vue.createVNode(_component_uni_load_more, {
            status: "loading",
            contentText: $setup.loadMoreText
          })
        ])) : vue.createCommentVNode("v-if", true),
        $setup.hasNoMore && !$setup.loading && $setup.filteredApplications.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "no-more"
        }, [
          vue.createVNode(_component_uni_load_more, {
            status: "noMore",
            contentText: $setup.loadMoreText
          })
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 底部安全区域 "),
        vue.createElementVNode("view", { class: "safe-area-bottom" })
      ], 40, ["refresher-triggered"])
    ]);
  }
  const PagesApplicationApplication = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/application/application.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        // 环境配置
        env: env$1,
        // 连接设置
        serverUrl: env$1.wsUrl || "ws://localhost:8080/ws",
        token: getToken() || "",
        debug: env$1.debug || true,
        autoReconnect: true,
        heartbeat: true,
        // 连接状态
        isConnected: false,
        // 消息发送
        messageTypes: ["普通消息", "聊天消息", "认证消息"],
        messageTypeIndex: 0,
        receiverId: "",
        messageContent: "",
        // 消息记录
        messages: [],
        scrollTop: 0
      };
    },
    // 页面加载时初始化
    onLoad() {
      this.setupWebSocketCallbacks();
      this.addMessage("系统", `环境: ${this.env.env || "未知"}`);
      this.addMessage("系统", `API地址: ${this.env.baseUrl || "未设置"}`);
      this.addMessage("系统", `WebSocket地址: ${this.env.wsUrl || "未设置"}`);
      this.addMessage("系统", `Token: ${this.token ? "已设置" : "未设置"}`);
    },
    // 页面卸载时断开连接
    onUnload() {
      this.disconnectWebSocket();
    },
    methods: {
      // 设置WebSocket回调函数
      setupWebSocketCallbacks() {
        websocket.onOpen((res) => {
          this.isConnected = true;
          this.addMessage("系统", `WebSocket连接已打开`);
        });
        websocket.onClose((res) => {
          this.isConnected = false;
          this.addMessage("系统", `WebSocket连接已关闭: ${res.code || ""} ${res.reason || ""}`);
        });
        websocket.onError((err) => {
          this.addMessage("错误", `WebSocket连接错误: ${err.errMsg || JSON.stringify(err)}`);
        });
        websocket.onMessage((data) => {
          let message = data;
          try {
            if (typeof data === "string") {
              message = JSON.parse(data);
              message = JSON.stringify(message, null, 2);
            }
          } catch (e) {
          }
          this.addMessage("接收", message);
        });
      },
      // 连接WebSocket
      connectWebSocket() {
        if (this.isConnected) {
          uni.showToast({
            title: "WebSocket已连接",
            icon: "none"
          });
          return;
        }
        websocket.initConfig({
          url: this.serverUrl,
          token: this.token,
          debug: this.debug,
          autoReconnect: this.autoReconnect,
          heartbeat: this.heartbeat
        });
        websocket.connect();
        this.addMessage("系统", "正在连接WebSocket...");
      },
      // 断开WebSocket连接
      disconnectWebSocket() {
        if (!this.isConnected) {
          uni.showToast({
            title: "WebSocket未连接",
            icon: "none"
          });
          return;
        }
        websocket.close();
        this.addMessage("系统", "正在断开WebSocket连接...");
      },
      // 发送消息
      sendMessage() {
        if (!this.isConnected) {
          uni.showToast({
            title: "WebSocket未连接",
            icon: "none"
          });
          return;
        }
        if (!this.messageContent) {
          uni.showToast({
            title: "消息内容不能为空",
            icon: "none"
          });
          return;
        }
        let message;
        switch (this.messageTypeIndex) {
          case 0:
            message = this.messageContent;
            break;
          case 1:
            message = {
              type: "chat",
              to: this.receiverId,
              content: this.messageContent,
              timestamp: Date.now()
            };
            break;
          case 2:
            message = {
              type: "auth",
              token: this.token || this.messageContent
            };
            break;
        }
        const success = websocket.send(message);
        if (success) {
          this.addMessage("发送", typeof message === "object" ? JSON.stringify(message, null, 2) : message);
          this.messageContent = "";
        } else {
          uni.showToast({
            title: "消息发送失败",
            icon: "none"
          });
        }
      },
      // 添加消息到记录
      addMessage(type, content) {
        const now = /* @__PURE__ */ new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        let typeText = "";
        switch (type) {
          case "系统":
            typeText = "系统消息";
            break;
          case "发送":
            typeText = "发送消息";
            break;
          case "接收":
            typeText = "接收消息";
            break;
          case "错误":
            typeText = "错误消息";
            break;
          default:
            typeText = type;
        }
        this.messages.push({
          type,
          typeText,
          content,
          time
        });
        if (this.messages.length > 100) {
          this.messages.shift();
        }
        this.$nextTick(() => {
          this.scrollTop = 9999999;
        });
      },
      // 清空消息记录
      clearMessages() {
        this.messages = [];
      },
      // 调试模式切换
      onDebugChange(e) {
        this.debug = e.detail.value;
      },
      // 自动重连切换
      onAutoReconnectChange(e) {
        this.autoReconnect = e.detail.value;
      },
      // 心跳检测切换
      onHeartbeatChange(e) {
        this.heartbeat = e.detail.value;
      },
      // 消息类型切换
      onMessageTypeChange(e) {
        this.messageTypeIndex = e.detail.value;
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部状态栏 "),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["status-bar", [$data.isConnected ? "connected" : "disconnected"]])
        },
        [
          vue.createElementVNode(
            "text",
            { class: "status-text" },
            "WebSocket状态: " + vue.toDisplayString($data.isConnected ? "已连接" : "未连接"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "status-indicator" })
        ],
        2
        /* CLASS */
      ),
      vue.createCommentVNode(" 环境信息 "),
      vue.createElementVNode("view", { class: "env-info" }, [
        vue.createElementVNode(
          "text",
          { class: "env-title" },
          "当前环境: " + vue.toDisplayString($data.env.env),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "env-detail" },
          "API地址: " + vue.toDisplayString($data.env.baseUrl),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "env-detail" },
          "WebSocket地址: " + vue.toDisplayString($data.env.wsUrl),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 连接设置区域 "),
      vue.createElementVNode("view", { class: "connection-settings" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "服务器地址"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.serverUrl = $event),
              placeholder: "ws://服务器地址/ws"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.serverUrl]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "Token"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "input",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.token = $event),
              placeholder: "可选，身份验证token"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.token]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item checkbox-item" }, [
          vue.createElementVNode("text", { class: "label" }, "调试模式"),
          vue.createElementVNode("switch", {
            checked: $data.debug,
            onChange: _cache[2] || (_cache[2] = (...args) => $options.onDebugChange && $options.onDebugChange(...args)),
            color: "#4CAF50"
          }, null, 40, ["checked"])
        ]),
        vue.createElementVNode("view", { class: "form-item checkbox-item" }, [
          vue.createElementVNode("text", { class: "label" }, "自动重连"),
          vue.createElementVNode("switch", {
            checked: $data.autoReconnect,
            onChange: _cache[3] || (_cache[3] = (...args) => $options.onAutoReconnectChange && $options.onAutoReconnectChange(...args)),
            color: "#4CAF50"
          }, null, 40, ["checked"])
        ]),
        vue.createElementVNode("view", { class: "form-item checkbox-item" }, [
          vue.createElementVNode("text", { class: "label" }, "心跳检测"),
          vue.createElementVNode("switch", {
            checked: $data.heartbeat,
            onChange: _cache[4] || (_cache[4] = (...args) => $options.onHeartbeatChange && $options.onHeartbeatChange(...args)),
            color: "#4CAF50"
          }, null, 40, ["checked"])
        ]),
        vue.createCommentVNode(" 连接按钮 "),
        vue.createElementVNode("view", { class: "button-group" }, [
          vue.createElementVNode("button", {
            class: "btn connect-btn",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.connectWebSocket && $options.connectWebSocket(...args)),
            disabled: $data.isConnected
          }, "连接", 8, ["disabled"]),
          vue.createElementVNode("button", {
            class: "btn disconnect-btn",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.disconnectWebSocket && $options.disconnectWebSocket(...args)),
            disabled: !$data.isConnected
          }, "断开", 8, ["disabled"])
        ])
      ]),
      vue.createCommentVNode(" 消息发送区域 "),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["message-sender", { "disabled": !$data.isConnected }])
        },
        [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "消息类型"),
            vue.createElementVNode("picker", {
              onChange: _cache[7] || (_cache[7] = (...args) => $options.onMessageTypeChange && $options.onMessageTypeChange(...args)),
              value: $data.messageTypeIndex,
              range: $data.messageTypes
            }, [
              vue.createElementVNode(
                "view",
                { class: "picker" },
                vue.toDisplayString($data.messageTypes[$data.messageTypeIndex]),
                1
                /* TEXT */
              )
            ], 40, ["value", "range"])
          ]),
          $data.messageTypeIndex === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "form-item"
          }, [
            vue.createElementVNode("text", { class: "label" }, "接收者ID"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.receiverId = $event),
                placeholder: "接收者ID"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.receiverId]
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "消息内容"),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "textarea",
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.messageContent = $event),
                placeholder: "请输入消息内容"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.messageContent]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "btn send-btn",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
            disabled: !$data.isConnected || !$data.messageContent
          }, "发送消息", 8, ["disabled"])
        ],
        2
        /* CLASS */
      ),
      vue.createCommentVNode(" 消息记录区域 "),
      vue.createElementVNode("view", { class: "message-log" }, [
        vue.createElementVNode("view", { class: "log-header" }, [
          vue.createElementVNode("text", { class: "log-title" }, "消息记录"),
          vue.createElementVNode("button", {
            class: "btn clear-btn",
            onClick: _cache[11] || (_cache[11] = (...args) => $options.clearMessages && $options.clearMessages(...args))
          }, "清空")
        ]),
        vue.createElementVNode("scroll-view", {
          class: "log-content",
          "scroll-y": "",
          "scroll-top": $data.scrollTop
        }, [
          $data.messages.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-log"
          }, [
            vue.createElementVNode("text", null, "暂无消息记录")
          ])) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.messages, (msg, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: index,
                  class: vue.normalizeClass(["message-item", msg.type])
                },
                [
                  vue.createElementVNode("view", { class: "message-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "message-type" },
                      vue.toDisplayString(msg.typeText),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "message-time" },
                      vue.toDisplayString(msg.time),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "message-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "message-text" },
                      vue.toDisplayString(msg.content),
                      1
                      /* TEXT */
                    )
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 8, ["scroll-top"])
      ])
    ]);
  }
  const PagesWebsocketTestIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/websocket-test/index.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/task-square/index", PagesTaskSquareIndex);
  __definePage("pages/task-square/detail", PagesTaskSquareDetail);
  __definePage("pages/task-square/create", PagesTaskSquareCreate);
  __definePage("pages/team/detail", PagesTeamDetail);
  __definePage("pages/team/list", PagesTeamList);
  __definePage("pages/team/create", PagesTeamCreate);
  __definePage("pages/team/recommended", PagesTeamRecommended);
  __definePage("pages/competition/index", PagesCompetitionIndex);
  __definePage("pages/competition/create", PagesCompetitionCreate);
  __definePage("pages/competition/detail", PagesCompetitionDetail);
  __definePage("pages/profile/index", PagesProfileIndex);
  __definePage("pages/profile/user-info", PagesProfileUserInfo);
  __definePage("pages/profile/edit-basic-info", PagesProfileEditBasicInfo);
  __definePage("pages/profile/edit-bio", PagesProfileEditBio);
  __definePage("pages/profile/edit-skills", PagesProfileEditSkills);
  __definePage("pages/profile/edit-awards", PagesProfileEditAwards);
  __definePage("pages/Xiaoxi/Xiaoxi", PagesXiaoxiXiaoxi);
  __definePage("pages/application/application", PagesApplicationApplication);
  __definePage("pages/websocket-test/index", PagesWebsocketTestIndex);
  const _sfc_main = {
    globalData: {
      unreadNotificationCount: 0
    },
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:10", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:11", "App Launch");
      this.initGlobalNotificationService();
      formatAppLog("log", "at App.vue:14", "App Launch");
      try {
        uni.removeStorageSync("ai_recommend_cache_time");
        uni.removeStorageSync("ai_recommended_teams");
        uni.removeStorageSync("ai_summary");
        formatAppLog("log", "at App.vue:21", "应用启动时已清除AI推荐相关缓存");
        const userInteractionState = uni.getStorageSync("userInteractionState");
        if (userInteractionState) {
          try {
            const state2 = JSON.parse(userInteractionState);
            state2.hasClickedAiRecommend = false;
            uni.setStorageSync("userInteractionState", JSON.stringify(state2));
            formatAppLog("log", "at App.vue:30", "已重置AI推荐点击状态");
          } catch (e) {
            formatAppLog("error", "at App.vue:32", "重置用户交互状态失败:", e);
          }
        }
      } catch (e) {
        formatAppLog("error", "at App.vue:36", "清除AI推荐缓存失败:", e);
      }
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:41", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:45", "App Hide");
    },
    methods: {
      // 初始化全局通知服务
      initGlobalNotificationService() {
        const handleNewNotification = (notification) => {
          formatAppLog("log", "at App.vue:53", "App收到新通知:", notification);
          if (!notification.isRead) {
            this.globalData.unreadNotificationCount++;
          }
          uni.showToast({
            title: "收到新通知",
            icon: "none"
          });
          this.updateMessageBadge();
          uni.$emit("newNotification", notification);
        };
        notificationService.initNotificationService(handleNewNotification);
      },
      // 更新消息页面的TabBar角标
      updateMessageBadge() {
        const count = this.globalData.unreadNotificationCount;
        try {
          if (count > 0) {
            uni.setTabBarBadge({
              index: 4,
              // 消息页面的TabBar索引，根据实际情况调整
              text: count.toString()
            }).catch((err) => {
              formatAppLog("log", "at App.vue:88", "设置TabBar徽标失败，可能不在TabBar页面", err);
            });
          } else {
            uni.removeTabBarBadge({
              index: 4
              // 消息页面的TabBar索引，根据实际情况调整
            }).catch((err) => {
              formatAppLog("log", "at App.vue:96", "移除TabBar徽标失败，可能不在TabBar页面", err);
            });
          }
        } catch (error) {
          formatAppLog("log", "at App.vue:101", "TabBar操作失败，可能不在TabBar页面", error);
        }
      },
      // 重置未读通知计数
      resetUnreadNotificationCount() {
        this.globalData.unreadNotificationCount = 0;
        this.updateMessageBadge();
      }
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/Uniapp/htmlTest/赛创项目/App.vue"]]);
  getEnv();
  function createApp() {
    const app = vue.createVueApp(App);
    app.config.globalProperties.$store = store;
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
