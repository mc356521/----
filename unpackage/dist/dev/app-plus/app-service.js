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
  const devConfig = {
    // API基础路径（使用本地地址）
    // baseUrl: 'http://localhost:8080',
    // API基础路径
    baseUrl: "http://103.38.83.91:8080",
    // 超时时间
    timeout: 6e4,
    // 上传接口
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "ws://localhost:8080/ws",
    // 调试模式
    debug: true,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "development"
  };
  const testConfig = {
    // API基础路径
    baseUrl: "https://test-api.example.com",
    // 超时时间
    timeout: 45e3,
    // 上传接口
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "wss://test-api.example.com/ws",
    // 调试模式
    debug: true,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "test"
  };
  const prodConfig = {
    // API基础路径
    baseUrl: "http://103.38.83.91:8080",
    // 超时时间
    timeout: 3e4,
    // 上传接口
    uploadUrl: "/api/upload",
    // WebSocket地址
    wsUrl: "wss://api.example.com/ws",
    // 调试模式
    debug: false,
    // 版本号
    version: "1.0.0",
    // 环境名称
    env: "production"
  };
  const ENV = "development";
  const getEnv = () => {
    switch (ENV) {
      case "development":
        return devConfig;
      case "test":
        return testConfig;
      case "production":
        return prodConfig;
      default:
        return devConfig;
    }
  };
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
  const requestInterceptor = (config) => {
    const token = getToken();
    if (token) {
      config.header["Authorization"] = `Bearer ${token}`;
      if (env.debug) {
        formatAppLog("log", "at utils/request.js:49", "发送请求头Authorization:", `Bearer ${token}`);
      }
    }
    if (!config.header["Content-Type"]) {
      config.header["Content-Type"] = "application/json";
    }
    return config;
  };
  const responseInterceptor = (response) => {
    if (response.statusCode === 200) {
      if (response.config && response.config.url && (response.config.url.includes("/users/login") || response.config.url.includes("/user/login"))) {
        if (response.data && response.data.data) {
          setToken(response.data.data);
          if (env.debug) {
            formatAppLog("log", "at utils/request.js:76", "已保存token:", response.data.data);
          }
          return Promise.resolve(response.data);
        }
      }
      return Promise.resolve(response.data);
    } else {
      const errorMsg = `请求失败: ${response.statusCode}`;
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
    const config = {
      url: options.url.startsWith("http") ? options.url : env.baseUrl + options.url,
      method: options.method || "GET",
      data: options.data || {},
      params: options.params || {},
      header: options.header || {},
      timeout: options.timeout || env.timeout || 6e4
    };
    if (config.method === "GET" && Object.keys(config.params).length > 0) {
      const queryString = Object.keys(config.params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`).join("&");
      config.url = `${config.url}${config.url.includes("?") ? "&" : "?"}${queryString}`;
    }
    if (env.debug) {
      formatAppLog("log", "at utils/request.js:138", `${config.method} 请求:`, config.url);
      if (config.data && Object.keys(config.data).length > 0) {
        formatAppLog("log", "at utils/request.js:140", "请求数据:", config.data);
      }
    }
    const interceptedConfig = requestInterceptor(config);
    return new Promise((resolve, reject) => {
      uni.request({
        url: interceptedConfig.url,
        method: interceptedConfig.method,
        data: interceptedConfig.data,
        header: interceptedConfig.header,
        timeout: interceptedConfig.timeout,
        success: (res) => {
          if (env.debug) {
            formatAppLog("log", "at utils/request.js:157", "响应数据:", res);
          }
          res.config = interceptedConfig;
          responseInterceptor(res).then((data) => resolve(data)).catch((error) => reject(error));
        },
        fail: (err) => {
          if (env.debug) {
            formatAppLog("error", "at utils/request.js:170", "请求失败:", err);
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
     * 用户登录
     * @param {Object} data - 登录参数，包含phone和password
     * @returns {Promise} 请求结果Promise对象
     */
    login(data) {
      formatAppLog("log", "at api/modules/user.js:15", "登录请求参数:", data);
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
        formatAppLog("log", "at api/modules/user.js:27", "登录响应:", result);
        if (result && result.code === 200 && result.data) {
          const token = result.data;
          uni.setStorageSync("token", token);
          formatAppLog("log", "at api/modules/user.js:34", "登录成功，已保存token");
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
      formatAppLog("log", "at api/modules/user.js:57", "注册请求参数:", data);
      formatAppLog("log", "at api/modules/user.js:58", "注册请求URL:", "/users/register (将通过代理转发)");
      return request({
        url: "/users/register",
        method: "POST",
        data
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
      return request({
        url: "/team-applications",
        method: "POST",
        data
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
      return request({
        url: "/team-applications",
        method: "POST",
        data
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
     * 获取我的队伍列表
     * @returns {Promise} 请求结果Promise对象
     */
    getMyTeams() {
      return request({
        url: "/teams/my",
        method: "GET"
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
    }
  };
  const api = {
    user: userApi,
    team: teamApi,
    competitions: competitionsApi
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
  const _sfc_main$h = {
    __name: "login",
    setup(__props, { expose: __expose }) {
      __expose();
      const isRemember = vue.ref(false);
      const showPassword = vue.ref(true);
      const isRegistering = vue.ref(false);
      const loginForm = vue.reactive({
        phone: "",
        password: ""
      });
      const registerForm = vue.reactive({
        phone: "",
        password: "",
        realName: "",
        schoolId: 1,
        role: "student",
        major: "",
        studentTeacherId: ""
      });
      function toggleRegister() {
        isRegistering.value = !isRegistering.value;
      }
      function toggleRemember() {
        isRemember.value = !isRemember.value;
      }
      function togglePasswordVisibility() {
        showPassword.value = !showPassword.value;
      }
      async function handleLogin() {
        if (!loginForm.phone || !loginForm.password) {
          uni.showToast({
            title: "请输入手机号和密码",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "正在登录...",
          mask: true
        });
        try {
          formatAppLog("log", "at pages/login/login.vue:178", "正在连接登录服务器...");
          const res = await api.user.login({
            phone: loginForm.phone,
            password: loginForm.password
          });
          uni.hideLoading();
          formatAppLog("log", "at pages/login/login.vue:187", "登录响应:", res);
          if (res && res.token) {
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
          formatAppLog("error", "at pages/login/login.vue:211", "登录失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: error.message || "登录失败，请检查网络连接或服务器配置",
            icon: "none",
            duration: 3e3
          });
        }
      }
      async function handleRegister() {
        if (!registerForm.phone) {
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
          const res = await api.user.register(registerForm);
          uni.showToast({
            title: "注册成功",
            icon: "success"
          });
          isRegistering.value = false;
        } catch (error) {
          uni.showToast({
            title: error.message || "注册失败",
            icon: "none"
          });
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
      const __returned__ = { isRemember, showPassword, isRegistering, loginForm, registerForm, toggleRegister, toggleRemember, togglePasswordVisibility, handleLogin, handleRegister, forgotPassword, socialLogin, openTerms, openPrivacy, ref: vue.ref, reactive: vue.reactive, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
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
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.registerForm.phone = $event)
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $setup.registerForm.phone]
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
                  vue.createElementVNode("text", { class: "iconfont icon-idcard" }),
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/login/login.vue"]]);
  const _sfc_main$g = {
    __name: "TeamCard",
    props: {
      team: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        default: 0
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
        emit("apply", props.team.id);
      }
      const __returned__ = { props, emit, animationDelay, showHotIcon, isPulse, positions, avatars, canJoin, hasProgress, hasMaxMember, isFilled, getCurrentCount, getTotalCount, getMemberCount, goToDetail, onApplyJoin, computed: vue.computed };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
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
                      class: vue.normalizeClass(["status-tag", { "pulse": $setup.isPulse }])
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
            vue.createCommentVNode(" 职位标签 "),
            $setup.positions.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
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
              }, " 申请加入 ")) : (vue.openBlock(), vue.createElementBlock("view", {
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
  const TeamCard = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-49d62ae1"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/team/TeamCard.vue"]]);
  const _sfc_main$f = {
    __name: "TabBar",
    props: {
      activeTab: {
        type: String,
        default: "home",
        validator: (value) => ["home", "competition", "team", "profile"].includes(value)
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
            formatAppLog("log", "at components/TabBar.vue:69", "当前用户角色:", userRole.value);
          }
        } catch (error) {
          formatAppLog("error", "at components/TabBar.vue:72", "获取用户角色失败:", error);
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
            "team": "/pages/team/list",
            "profile": "/pages/profile/index"
          };
          uni.switchTab({
            url: tabRoutes[tab],
            fail: (err) => {
              formatAppLog("error", "at components/TabBar.vue:105", "切换Tab失败:", err);
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
        formatAppLog("log", "at components/TabBar.vue:133", "当前token:", token);
        if (!userRole.value) {
          formatAppLog("log", "at components/TabBar.vue:137", "开始获取用户角色...");
          userApi.getUserRole(token).then((res) => {
            formatAppLog("log", "at components/TabBar.vue:139", "获取角色成功, 完整响应:", res);
            if (res.code === 200 && res.data) {
              userRole.value = res.data;
              formatAppLog("log", "at components/TabBar.vue:142", "设置当前用户角色:", userRole.value);
              showPublishMenu();
            } else {
              formatAppLog("warn", "at components/TabBar.vue:145", "获取角色返回异常:", res);
              showPublishMenu();
            }
          }).catch((err) => {
            formatAppLog("error", "at components/TabBar.vue:149", "获取用户角色失败:", err);
            formatAppLog("error", "at components/TabBar.vue:150", "错误详情:", JSON.stringify(err));
            showPublishMenu();
          });
        } else {
          formatAppLog("log", "at components/TabBar.vue:155", "使用缓存角色信息:", userRole.value);
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
                url: "/pages/team/create?mode=recruit"
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
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
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
          ]),
          vue.createElementVNode("text", { class: "publish-text" }, "发布")
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
  const TabBar = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-89ca1f91"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/TabBar.vue"]]);
  const _sfc_main$e = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const teamList = vue.ref([]);
      const competitionsList = vue.ref([]);
      async function getCompetitionsList() {
        try {
          const res = await competitionsApi.getCompetitionsList();
          if (res.code === 200 && res.data && res.data.list) {
            competitionsList.value = res.data.list.slice(0, 3);
            formatAppLog("log", "at pages/index/index.vue:178", "获取到热门竞赛数据:", competitionsList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:181", "获取竞赛数据失败:", error);
        }
      }
      async function getTeamList() {
        try {
          const res = await teamApi.getTeamList();
          if (res.code === 200 && res.data && res.data.list) {
            teamList.value = res.data.list.slice(0, 10);
            formatAppLog("log", "at pages/index/index.vue:191", "获取到队伍列表数据:", teamList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:194", "获取队伍数据失败:", error);
        }
      }
      function navigateTo(page) {
        if (page === "competition") {
          uni.navigateTo({
            url: "/pages/competition/index"
          });
        } else {
          uni.showToast({
            title: `导航到${page}页面`,
            icon: "none"
          });
        }
      }
      function viewAll(type) {
        if (type === "competition") {
          uni.navigateTo({
            url: "/pages/competition/index"
          });
        } else {
          uni.showToast({
            title: `查看所有${type}`,
            icon: "none"
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
      function joinTeam(id) {
        uni.showModal({
          title: "申请确认",
          content: "确定要申请加入该团队吗？",
          success: function(res) {
            if (res.confirm) {
              uni.showToast({
                title: "申请已发送",
                icon: "success"
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
      vue.onMounted(() => {
        const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        formatAppLog("log", "at pages/index/index.vue:265", "状态栏高度:", statusBarHeight);
        getTeamList();
        getCompetitionsList();
      });
      const __returned__ = { teamList, competitionsList, getCompetitionsList, getTeamList, navigateTo, viewAll, viewDetail, joinTeam, goToSearch, ref: vue.ref, onMounted: vue.onMounted, get teamApi() {
        return teamApi;
      }, get competitionsApi() {
        return competitionsApi;
      }, TeamCard, TabBar };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 - 已经自动适配安全区域 "),
      vue.createElementVNode("view", { class: "custom-nav-bar" }, [
        vue.createElementVNode("view", { class: "title-section" }, [
          vue.createElementVNode("text", { class: "page-title" }, "校园任务与组队平台")
        ]),
        vue.createElementVNode("view", {
          class: "search-section",
          onClick: $setup.goToSearch
        }, [
          vue.createElementVNode("view", { class: "search-box" }, [
            vue.createElementVNode("text", { class: "iconfont icon-search" }),
            vue.createElementVNode("text", { class: "search-placeholder" }, "搜索竞赛/队伍")
          ])
        ])
      ]),
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
            "indicator-active-color": "#3B82F6",
            "indicator-color": "rgba(0, 0, 0, 0.2)"
          }, [
            vue.createElementVNode("swiper-item", null, [
              vue.createElementVNode("view", { class: "swiper-item" }, [
                vue.createElementVNode("image", {
                  src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
                  mode: "aspectFill"
                }),
                vue.createElementVNode("view", { class: "swiper-overlay" }, [
                  vue.createElementVNode("text", { class: "swiper-title" }, "互联网+创新创业大赛"),
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
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigateTo("competition"))
            }, [
              vue.createElementVNode("view", { class: "menu-icon blue" }, [
                vue.createElementVNode("text", { class: "iconfont icon-trophy" })
              ]),
              vue.createElementVNode("text", { class: "menu-text" }, "竞赛活动")
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
                  onClick: _cache[5] || (_cache[5] = ($event) => $setup.viewDetail("competition", 2)),
                  key: competition.id
                }, [
                  vue.createElementVNode("view", { class: "competition-flex" }, [
                    vue.createElementVNode("view", { class: "competition-image-container" }, [
                      vue.createElementVNode("image", {
                        class: "competition-image",
                        src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
                        mode: "aspectFill"
                      })
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
                        vue.createElementVNode(
                          "text",
                          { class: "status-tag pulse" },
                          vue.toDisplayString(competition.status),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "tag-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "tag green-tag" },
                          vue.toDisplayString(competition.category),
                          1
                          /* TEXT */
                        ),
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
                          vue.createElementVNode("text", { class: "info-text" }, "3-6人/队")
                        ])
                      ])
                    ])
                  ])
                ]);
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
            vue.createElementVNode("text", {
              class: "view-all animate__animated animate__fadeInRight",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.viewAll("team"))
            }, "查看全部")
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
                  onDetail: _cache[7] || (_cache[7] = (id) => $setup.viewDetail("team", id)),
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
      vue.createVNode($setup["TabBar"], { activeTab: "home" })
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/index/index.vue"]]);
  const _sfc_main$d = {
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
      formatAppLog("log", "at pages/team/detail.vue:223", "队伍详情页面参数:", option);
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
          formatAppLog("error", "at pages/team/detail.vue:266", "检查团队状态失败", error);
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
          title: "申请加入",
          content: "请输入您的申请理由",
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
                } else {
                  uni.showToast({
                    title: result.message || "申请提交失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                formatAppLog("error", "at pages/team/detail.vue:363", "申请失败", error);
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
                formatAppLog("error", "at pages/team/detail.vue:462", "解散队伍失败", error);
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
                formatAppLog("error", "at pages/team/detail.vue:497", "退出队伍失败", error);
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
            formatAppLog("log", "at pages/team/detail.vue:525", "获取到队伍成员:", this.teamMembers);
          } else {
            formatAppLog("log", "at pages/team/detail.vue:527", "获取队伍成员失败:", res == null ? void 0 : res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:530", "获取队伍成员出错", error);
        }
      },
      // 获取队伍详情数据
      async getTeamDetail() {
        this.isLoading = true;
        try {
          const res = await teamApi.getTeamDetail(this.teamId);
          if (res && res.code === 200 && res.data) {
            this.teamInfo = res.data;
            formatAppLog("log", "at pages/team/detail.vue:541", "获取到队伍详情:", this.teamInfo);
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
            formatAppLog("log", "at pages/team/detail.vue:559", "获取队伍详情失败:", res);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:562", "获取队伍详情出错", error);
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
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
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
                ])
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
                )
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
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 底部操作栏 "),
      vue.createElementVNode("view", { class: "footer-bar" }, [
        vue.createCommentVNode(" 情况1: 访客视角 & 队伍招募中 & 有可申请角色 "),
        !$data.isTeamMember && $data.teamInfo.status === "0" && $options.hasAvailableRoles ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "full-btn primary-btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.showApplyOptions && $options.showApplyOptions(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-user-plus" }),
          vue.createTextVNode(" 申请加入队伍 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 情况2: 访客视角 & 队伍已满员/已解散 "),
        !$data.isTeamMember && ($data.teamInfo.status === "1" || $data.teamInfo.status === "2") ? (vue.openBlock(), vue.createElementBlock(
          "button",
          {
            key: 1,
            class: "full-btn disabled-btn",
            disabled: ""
          },
          vue.toDisplayString($data.teamInfo.status === "1" ? "队伍已满员" : "队伍已解散"),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 情况3: 队长视角 "),
        $data.isTeamLeader ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "btn-group"
        }, [
          vue.createElementVNode("button", {
            class: "half-btn primary-btn",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.editTeam && $options.editTeam(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-edit" }),
            vue.createTextVNode(" 编辑队伍 ")
          ]),
          vue.createElementVNode("button", {
            class: "half-btn danger-btn",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.disbandTeam && $options.disbandTeam(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-trash" }),
            vue.createTextVNode(" 解散队伍 ")
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 情况4: 普通成员视角 "),
        $data.isTeamMember && !$data.isTeamLeader ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 3,
          class: "full-btn danger-btn",
          onClick: _cache[8] || (_cache[8] = (...args) => $options.leaveTeam && $options.leaveTeam(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-signout" }),
          vue.createTextVNode(" 退出队伍 ")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesTeamDetail = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/detail.vue"]]);
  const _sfc_main$c = {
    __name: "list",
    setup(__props, { expose: __expose }) {
      __expose();
      const categories = vue.ref(["全部队伍", "学科竞赛", "创新创业", "体育竞赛", "文艺比赛"]);
      const currentCategory = vue.ref(0);
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
          formatAppLog("log", "at pages/team/list.vue:128", "请求参数:", params);
          const res = await teamApi.getTeamList(params);
          formatAppLog("log", "at pages/team/list.vue:130", "响应结果:", res);
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
          formatAppLog("error", "at pages/team/list.vue:155", "获取团队列表出错", error);
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
        formatAppLog("log", "at pages/team/list.vue:229", "组队列表页面加载");
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
          formatAppLog("error", "at pages/team/list.vue:296", "检查团队状态失败", err);
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
      const __returned__ = { categories, currentCategory, teamData, loading, refreshing, loadingMore, noMoreData, queryParams, getTeamList, onPullDownRefresh, loadMore, selectCategory, goToTeamDetail, applyToJoin, createTeam, handleTabChange, showPublishOptions, ref: vue.ref, reactive: vue.reactive, onMounted: vue.onMounted, TeamCard, TabBar, get teamApi() {
        return teamApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "sticky-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, [
          vue.createElementVNode("text", { class: "section-title" }, "组队广场"),
          vue.createElementVNode("view", { class: "header-actions" }, [
            vue.createElementVNode("view", { class: "action-btn" }, [
              vue.createElementVNode("text", { class: "iconfont icon-search" })
            ]),
            vue.createElementVNode("view", { class: "action-btn" }, [
              vue.createElementVNode("text", { class: "iconfont icon-filter" })
            ])
          ])
        ]),
        vue.createCommentVNode(" 分类标签 "),
        vue.createElementVNode("scroll-view", {
          "scroll-x": "true",
          class: "category-scroll"
        }, [
          vue.createElementVNode("view", { class: "category-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.categories, (category, index) => {
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
        ])
      ]),
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
  const PagesTeamList = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/list.vue"]]);
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
  const _sfc_main$b = {
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-d31e1c47"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
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
  const _sfc_main$a = {
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
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
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
  const calendarItem = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-3c762a01"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/calendar-item.vue"]]);
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
  function normalizeLocale(locale, messages) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages && messages[locale]) {
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
    if (messages && Object.keys(messages).length > 0) {
      locales = Object.keys(messages);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages || {};
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
  function initVueI18n(locale, messages = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages,
        locale
      ];
      locale = options[0];
      messages = options[1];
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
      messages,
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
  const _sfc_main$9 = {
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
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
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
  const TimePicker = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-1d532b70"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/time-picker.vue"]]);
  const {
    t
  } = initVueI18n(i18nMessages);
  const _sfc_main$8 = {
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
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_calendar_item = vue.resolveComponent("calendar-item");
    const _component_time_picker = vue.resolveComponent("time-picker");
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
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
  const Calendar = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-1d379219"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/calendar.vue"]]);
  const _sfc_main$7 = {
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
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
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
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-9802168a"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue"]]);
  const _sfc_main$6 = {
    __name: "create",
    setup(__props, { expose: __expose }) {
      __expose();
      const form = vue.reactive({
        competitionId: "",
        teamName: "",
        researchDirection: "",
        description: "",
        recruitDeadline: "",
        phone: "",
        email: "",
        wechat: "",
        qq: "",
        teachers: [
          { id: "", name: "", role: "" }
        ],
        roles: [
          { name: "", count: 1, description: "", skills: [] }
        ]
      });
      const competitionList = vue.ref([
        { id: "1", title: "2025年校园创新创业大赛" },
        { id: "2", title: "人工智能应用挑战赛" },
        { id: "3", title: "软件开发马拉松" }
      ]);
      const teacherList = vue.ref([
        { id: "1", name: "张教授" },
        { id: "2", name: "李教授" },
        { id: "3", name: "王教授" },
        { id: "4", name: "刘教授" },
        { id: "5", name: "陈教授" }
      ]);
      const skillInputs = vue.reactive({});
      const selectedCompetitionName = vue.computed(() => {
        const competition = competitionList.value.find((item) => item.id === form.competitionId);
        return competition ? competition.title : "";
      });
      function goBack() {
        uni.navigateBack();
      }
      function showCompetitionPicker() {
        uni.showActionSheet({
          itemList: competitionList.value.map((item) => item.title),
          success: function(res) {
            const selectedCompetition = competitionList.value[res.tapIndex];
            form.competitionId = selectedCompetition.id;
          }
        });
      }
      function showTeacherPicker(index) {
        uni.showActionSheet({
          itemList: teacherList.value.map((item) => item.name),
          success: function(res) {
            const selectedTeacher = teacherList.value[res.tapIndex];
            form.teachers[index].id = selectedTeacher.id;
            form.teachers[index].name = selectedTeacher.name;
          }
        });
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
        if (form.teachers.length === 0) {
          addTeacher();
        }
      }
      function addRole() {
        form.roles.push({ name: "", count: 1, description: "", skills: [] });
      }
      function removeRole(index) {
        form.roles.splice(index, 1);
        if (form.roles.length === 0) {
          addRole();
        }
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
        if (!form.phone) {
          showToast("请输入手机号码");
          return false;
        }
        if (!form.email) {
          showToast("请输入电子邮箱");
          return false;
        }
        for (let i = 0; i < form.teachers.length; i++) {
          const teacher = form.teachers[i];
          if (!teacher.id || !teacher.role) {
            showToast(`请完善指导老师${i + 1}的信息`);
            return false;
          }
        }
        for (let i = 0; i < form.roles.length; i++) {
          const role = form.roles[i];
          if (!role.name || !role.count || !role.description) {
            showToast(`请完善角色${i + 1}的信息`);
            return false;
          }
        }
        return true;
      }
      function showToast(title) {
        uni.showToast({
          title,
          icon: "none"
        });
      }
      function submitTeam() {
        if (!validateForm())
          return;
        uni.showLoading({
          title: "提交中..."
        });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: "创建成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }, 2e3);
      }
      const __returned__ = { form, competitionList, teacherList, skillInputs, selectedCompetitionName, goBack, showCompetitionPicker, showTeacherPicker, formatDate, padZero, addTeacher, removeTeacher, addRole, removeRole, addSkill, removeSkill, validateForm, showToast, submitTeam, ref: vue.ref, reactive: vue.reactive, computed: vue.computed, get teamApi() {
        return teamApi;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_datetime_picker = resolveEasycom(vue.resolveDynamicComponent("uni-datetime-picker"), __easycom_0$1);
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
            vue.createElementVNode("text", { class: "iconfont icon-info section-icon" }),
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
              onClick: $setup.showCompetitionPicker
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
              vue.createElementVNode("text", { class: "iconfont icon-arrow-down select-arrow" })
            ])
          ]),
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
          vue.createCommentVNode(" 手机号码 "),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, [
              vue.createTextVNode("手机号码"),
              vue.createElementVNode("text", { class: "required" }, "*")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "number",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.phone = $event),
                placeholder: "请输入手机号码",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.form.phone]
            ])
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
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.email = $event),
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
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.wechat = $event),
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
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.form.qq = $event),
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
            vue.createElementVNode("text", { class: "iconfont icon-teacher section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "指导老师")
          ]),
          vue.createCommentVNode(" 老师列表 "),
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
                    vue.createElementVNode("text", { class: "iconfont icon-delete" })
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
                    onClick: ($event) => $setup.showTeacherPicker(index)
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
                    vue.createElementVNode("text", { class: "iconfont icon-arrow-down select-arrow" })
                  ], 8, ["onClick"])
                ]),
                vue.createCommentVNode(" 角色 "),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, [
                    vue.createTextVNode("角色"),
                    vue.createElementVNode("text", { class: "required" }, "*")
                  ]),
                  vue.withDirectives(vue.createElementVNode("input", {
                    type: "text",
                    "onUpdate:modelValue": ($event) => teacher.role = $event,
                    placeholder: "如：主指导老师",
                    class: "form-input"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vue.vModelText, teacher.role]
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 添加老师按钮 "),
          vue.createElementVNode("view", {
            class: "add-item-btn",
            onClick: $setup.addTeacher
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-add" }),
            vue.createElementVNode("text", null, "添加指导老师")
          ])
        ]),
        vue.createCommentVNode(" 招募角色部分 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "iconfont icon-team section-icon" }),
            vue.createElementVNode("text", { class: "section-title" }, "招募角色")
          ]),
          vue.createCommentVNode(" 角色列表 "),
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
                    vue.createElementVNode("text", { class: "iconfont icon-delete" })
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
                            class: "iconfont icon-close",
                            onClick: vue.withModifiers(($event) => $setup.removeSkill(index, skillIndex), ["stop"])
                          }, null, 8, ["onClick"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ]),
                  vue.createCommentVNode(" 添加技能输入框 "),
                  vue.createElementVNode("view", { class: "skill-input-box" }, [
                    vue.withDirectives(vue.createElementVNode("input", {
                      type: "text",
                      "onUpdate:modelValue": ($event) => $setup.skillInputs[index] = $event,
                      placeholder: "添加技能",
                      class: "skill-input"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vue.vModelText, $setup.skillInputs[index]]
                    ]),
                    vue.createElementVNode("view", {
                      class: "add-skill-btn",
                      onClick: ($event) => $setup.addSkill(index)
                    }, [
                      vue.createElementVNode("text", { class: "iconfont icon-add" })
                    ], 8, ["onClick"])
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 添加角色按钮 "),
          vue.createElementVNode("view", {
            class: "add-item-btn",
            onClick: $setup.addRole
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-add" }),
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
      ])
    ]);
  }
  const PagesTeamCreate = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/create.vue"]]);
  const _sfc_main$5 = {
    components: {
      TabBar
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
        currentHotIndex: 0
      };
    },
    onLoad() {
      this.getHotCompetitions();
      this.getCompetitionList();
    },
    // 页面相关生命周期函数
    onPullDownRefresh() {
      this.onRefresh();
    },
    onReachBottom() {
      this.loadMore();
    },
    methods: {
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
          formatAppLog("error", "at pages/competition/index.vue:213", "获取热门竞赛失败:", error);
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
          formatAppLog("error", "at pages/competition/index.vue:273", "获取竞赛列表失败:", error);
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
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tab_bar = vue.resolveComponent("tab-bar");
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: "container",
        ref: "instance"
      },
      [
        vue.createCommentVNode(" 顶部导航栏 "),
        vue.createElementVNode("view", { class: "sticky-header" }, [
          vue.createElementVNode("view", { class: "header-inner" }, [
            vue.createElementVNode("text", { class: "page-title" }, "竞赛广场"),
            vue.createElementVNode("view", { class: "action-buttons" }, [
              vue.createElementVNode("view", { class: "action-btn" }, [
                vue.createElementVNode("text", { class: "iconfont icon-search" })
              ]),
              vue.createElementVNode("view", { class: "action-btn" }, [
                vue.createElementVNode("text", { class: "iconfont icon-filter" })
              ])
            ])
          ]),
          vue.createCommentVNode(" 分类标签 "),
          vue.createElementVNode("scroll-view", {
            "scroll-x": "true",
            class: "category-scroll"
          }, [
            vue.createElementVNode("view", { class: "category-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.categories, (category, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: vue.normalizeClass(["category-item", $data.currentCategory === index ? "active-category" : ""]),
                    onClick: ($event) => $options.selectCategory(index)
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
          ])
        ]),
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
        ]),
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
  const PagesCompetitionIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/index.vue"]]);
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
  const _sfc_main$4 = {
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
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
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
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-09fd5285"], ["__file", "D:/Uniapp/htmlTest/赛创项目/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue"]]);
  const _sfc_main$3 = {
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesCompetitionCreate = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/create.vue"]]);
  const _sfc_main$2 = {
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
            formatAppLog("log", "at pages/competition/detail.vue:368", "竞赛详情数据:", competition.value);
          } else {
            uni.showToast({
              title: "获取竞赛详情失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/competition/detail.vue:376", "获取竞赛详情错误:", error);
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
      function switchTab(tab) {
        currentTab.value = tab;
      }
      function goBack() {
        uni.navigateBack();
      }
      const __returned__ = { competitionId, loading, currentTab, competition, competitionStages, relatedCompetitions, getCompetitionDetail, getStatusText, formatDatePeriod, updateCompetitionStages, getTagClass, getStatusBadgeClass, getActionButtonText, getRegistrationDeadline, switchTab, goBack, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get api() {
        return api;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
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
            vue.createElementVNode("view", { class: "flex-row items-center mb-4" }, [
              vue.createElementVNode("view", { class: "relative flex-1" }, [
                vue.createElementVNode("input", {
                  type: "text",
                  placeholder: "搜索队伍",
                  class: "w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm"
                }),
                vue.createElementVNode("text", { class: "iconfont icon-search search-icon" })
              ]),
              vue.createElementVNode("view", { class: "ml-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700" }, [
                vue.createElementVNode("text", { class: "iconfont icon-filter mr-1" }),
                vue.createElementVNode("text", null, "筛选")
              ])
            ]),
            vue.createCommentVNode(" 队伍列表 "),
            vue.createElementVNode("view", { class: "space-y-4" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(_ctx.teams, (team, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: index,
                    class: "team-card"
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
                        vue.toDisplayString(team.status),
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
                    vue.createElementVNode("view", { class: "flex-row items-center justify-between mt-3" }, [
                      vue.createElementVNode("view", { class: "flex-row member-avatars" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(team.avatars, (avatar, idx) => {
                            return vue.openBlock(), vue.createElementBlock("image", {
                              key: idx,
                              src: avatar,
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
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createCommentVNode(" 加载更多 "),
            vue.createElementVNode("view", { class: "text-center mt-6" }, [
              vue.createElementVNode("button", { class: "load-more-btn" }, "加载更多")
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 底部固定按钮 "),
          vue.createElementVNode("view", { class: "fixed-bottom" }, [
            vue.createElementVNode("button", { class: "team-btn" }, [
              vue.createElementVNode("text", { class: "iconfont icon-users mr-1" }),
              vue.createElementVNode("text", null, "创建队伍")
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["register-btn", { "disabled-btn": $setup.competition.statusCode === "0" || $setup.competition.statusCode === "3" }]),
              disabled: $setup.competition.statusCode === "0" || $setup.competition.statusCode === "3"
            }, vue.toDisplayString($setup.getActionButtonText()), 11, ["disabled"])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      ))
    ]);
  }
  const PagesCompetitionDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/detail.vue"]]);
  const _sfc_main$1 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      function navigateTo(page) {
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
      const __returned__ = { navigateTo, logout, handleTabChange, showPublishOptions, ref: vue.ref, TabBar };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部用户信息区 "),
      vue.createElementVNode("view", { class: "user-info-section" }, [
        vue.createElementVNode("view", { class: "user-header" }, [
          vue.createElementVNode("image", {
            class: "user-avatar",
            src: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200",
            mode: "aspectFill"
          }),
          vue.createElementVNode("view", { class: "user-details" }, [
            vue.createElementVNode("text", { class: "user-name" }, "李明"),
            vue.createElementVNode("text", { class: "user-id" }, "学号: 2023114514")
          ]),
          vue.createElementVNode("view", { class: "edit-btn" }, [
            vue.createElementVNode("text", { class: "iconfont icon-edit" })
          ])
        ]),
        vue.createElementVNode("view", { class: "user-stats" }, [
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-value" }, "4"),
            vue.createElementVNode("text", { class: "stat-label" }, "参与竞赛")
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-value" }, "2"),
            vue.createElementVNode("text", { class: "stat-label" }, "我的团队")
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-value" }, "1"),
            vue.createElementVNode("text", { class: "stat-label" }, "获得奖项")
          ])
        ])
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.navigateTo("myCompetitions"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-trophy menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的竞赛"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.navigateTo("myTeams"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-users menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的团队"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.navigateTo("myAwards"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-star menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "我的获奖"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ])
        ]),
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.navigateTo("settings"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-settings menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "账号设置"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $setup.navigateTo("feedback"))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-feedback menu-icon" }),
            vue.createElementVNode("text", { class: "menu-text" }, "意见反馈"),
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left menu-arrow" })
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $setup.navigateTo("about"))
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
  const PagesProfileIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/profile/index.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/team/detail", PagesTeamDetail);
  __definePage("pages/team/list", PagesTeamList);
  __definePage("pages/team/create", PagesTeamCreate);
  __definePage("pages/competition/index", PagesCompetitionIndex);
  __definePage("pages/competition/create", PagesCompetitionCreate);
  __definePage("pages/competition/detail", PagesCompetitionDetail);
  __definePage("pages/profile/index", PagesProfileIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:4", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:5", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:8", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:11", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/Uniapp/htmlTest/赛创项目/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
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
