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
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
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
  const devConfig = {
    // API基础路径（使用代理地址）
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
  const TOKEN_KEY = "auth_token";
  const getToken = () => {
    return uni.getStorageSync(TOKEN_KEY) || "";
  };
  const setToken = (token) => {
    uni.setStorageSync(TOKEN_KEY, token);
  };
  const requestInterceptor = (config) => {
    const token = getToken();
    if (token) {
      config.header["Authorization"] = `Bearer ${encodeURIComponent(token)}`;
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
            formatAppLog("log", "at utils/request.js:73", "已保存token:", response.data.data);
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
      formatAppLog("log", "at utils/request.js:135", `${config.method} 请求:`, config.url);
      if (config.data && Object.keys(config.data).length > 0) {
        formatAppLog("log", "at utils/request.js:137", "请求数据:", config.data);
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
            formatAppLog("log", "at utils/request.js:154", "响应数据:", res);
          }
          res.config = interceptedConfig;
          responseInterceptor(res).then((data) => resolve(data)).catch((error) => reject(error));
        },
        fail: (err) => {
          if (env.debug) {
            formatAppLog("error", "at utils/request.js:167", "请求失败:", err);
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
        if (typeof result === "string" && result.length > 20) {
          setToken(result);
          formatAppLog("log", "at api/modules/user.js:31", "登录成功，已保存token");
          return {
            token: result,
            isLogin: true
          };
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
      formatAppLog("log", "at api/modules/user.js:49", "注册请求参数:", data);
      formatAppLog("log", "at api/modules/user.js:50", "注册请求URL:", "/users/register (将通过代理转发)");
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
     * @returns {Promise} 团队列表的Promise对象
     */
    getTeamList() {
      return request({
        url: "/teams/list",
        method: "GET"
      });
    },
    /**
     * 获取团队详情
     * @param {Number} id 团队ID
     * @returns {Promise} 团队详情的Promise对象
     */
    getTeamDetail(id) {
      return new Promise((resolve, reject) => {
        request({
          url: `/teams/${id}`,
          method: "GET"
        }).then((res) => {
          resolve(res);
        }).catch((err) => {
          formatAppLog("log", "at api/modules/team.js:31", "使用模拟数据");
          resolve(mockTeamDetail(id));
        });
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
     * 创建团队
     * @param {Object} data - 团队信息
     * @returns {Promise} 请求结果Promise对象
     */
    createTeam(data) {
      return request({
        url: "/teams/create",
        method: "POST",
        data
      });
    },
    /**
     * 申请加入团队
     * @param {Number} teamId 团队ID
     * @param {Object} data 申请数据
     * @returns {Promise} 申请结果的Promise对象
     */
    joinTeam(teamId, data) {
      return request({
        url: `/teams/${teamId}/join`,
        method: "POST",
        data
      });
    },
    /**
     * 申请特定角色
     * @param {Number} teamId - 团队ID
     * @param {Number} roleId - 角色ID
     * @param {Object} data - 申请数据
     * @returns {Promise} 请求结果Promise对象
     */
    applyRole(teamId, roleId, data) {
      return request({
        url: `/teams/${teamId}/roles/${roleId}/apply`,
        method: "POST",
        data
      });
    },
    /**
     * 编辑团队信息
     * @param {Number} teamId - 团队ID
     * @param {Object} data - 更新的团队信息
     * @returns {Promise} 请求结果Promise对象
     */
    updateTeam(teamId, data) {
      return request({
        url: `/teams/${teamId}`,
        method: "PUT",
        data
      });
    },
    /**
     * 解散团队
     * @param {Number} teamId - 团队ID
     * @returns {Promise} 请求结果Promise对象
     */
    disbandTeam(teamId) {
      return request({
        url: `/teams/${teamId}/disband`,
        method: "POST"
      });
    },
    /**
     * 退出团队
     * @param {String|Number} teamId - 团队ID
     * @returns {Promise} 请求结果Promise对象
     */
    leaveTeam(teamId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: 200,
            message: "已成功退出团队"
          });
        }, 500);
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
  const _sfc_main$a = {
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
        try {
          const res = await api.user.login({
            phone: loginForm.phone,
            password: loginForm.password
          });
          uni.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/index/index"
            });
          }, 1500);
        } catch (error) {
          uni.showToast({
            title: error.message || "登录失败",
            icon: "none"
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
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
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
              vue.createElementVNode("text", { class: "iconfont icon-lock" }),
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/login/login.vue"]]);
  const _sfc_main$9 = {
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
        return props.team.status === "0" || props.team.statusText === "组队中";
      });
      const positions = vue.computed(() => {
        return props.team.positions || props.team.roles || [];
      });
      const avatars = vue.computed(() => {
        if (props.team.avatars)
          return props.team.avatars;
        if (props.team.teamMemberAvatars) {
          return props.team.teamMemberAvatars.filter(
            (avatar) => avatar && !avatar.includes(".pdf")
          );
        }
        return [];
      });
      const canJoin = vue.computed(() => {
        return props.team.status === "0" || props.team.statusText === "组队中";
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
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
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
  const TeamCard = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-49d62ae1"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/team/TeamCard.vue"]]);
  const _sfc_main$8 = {
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
              formatAppLog("error", "at components/TabBar.vue:75", "切换Tab失败:", err);
              emit("tab-change", tab);
            }
          });
        }
      }
      function showPublishOptions() {
        emit("publish");
      }
      const __returned__ = { props, emit, switchTab, showPublishOptions };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "tab-bar" }, [
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
    ]);
  }
  const TabBar = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-89ca1f91"], ["__file", "D:/Uniapp/htmlTest/赛创项目/components/TabBar.vue"]]);
  const _sfc_main$7 = {
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
            formatAppLog("log", "at pages/index/index.vue:176", "获取到热门竞赛数据:", competitionsList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:179", "获取竞赛数据失败:", error);
        }
      }
      async function getTeamList() {
        try {
          const res = await teamApi.getTeamList();
          if (res.code === 200 && res.data && res.data.list) {
            teamList.value = res.data.list.slice(0, 10);
            formatAppLog("log", "at pages/index/index.vue:189", "获取到队伍列表数据:", teamList.value);
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:192", "获取队伍数据失败:", error);
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
      function handleTabChange(tab) {
        if (tab === "competition") {
          uni.switchTab({
            url: "/pages/competition/index"
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
      function randomActivity() {
        setTimeout(randomActivity, 3e3);
      }
      vue.onMounted(() => {
        randomActivity();
        getTeamList();
        getCompetitionsList();
      });
      const __returned__ = { teamList, competitionsList, getCompetitionsList, getTeamList, navigateTo, viewAll, viewDetail, joinTeam, handleTabChange, showPublishOptions, randomActivity, ref: vue.ref, onMounted: vue.onMounted, get teamApi() {
        return teamApi;
      }, get competitionsApi() {
        return competitionsApi;
      }, TeamCard, TabBar };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 搜索框 "),
      vue.createElementVNode("view", { class: "search-container animate__animated animate__fadeInDown" }, [
        vue.createElementVNode("view", { class: "search-box-wrapper" }, [
          vue.createElementVNode("input", {
            class: "search-box",
            type: "text",
            placeholder: "搜索竞赛、项目或队伍",
            "confirm-type": "search"
          }),
          vue.createElementVNode("text", { class: "iconfont icon-search search-icon" })
        ])
      ]),
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
      ]),
      vue.createCommentVNode(" 底部导航栏 "),
      vue.createVNode($setup["TabBar"], {
        "active-tab": "home",
        onTabChange: $setup.handleTabChange,
        onPublish: $setup.showPublishOptions
      })
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/index/index.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        defaultAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
        teamId: null,
        teamInfo: {},
        teamMembers: [],
        showPhone: false,
        isLoading: true
      };
    },
    computed: {
      isTeamMember() {
        return false;
      },
      isTeamLeader() {
        return false;
      },
      hasAvailableRoles() {
        if (!this.teamInfo.roles)
          return false;
        return this.teamInfo.roles.some((role) => role.currentCount < role.requiredCount);
      }
    },
    // 页面生命周期函数
    onLoad(option) {
      formatAppLog("log", "at pages/team/detail.vue:230", "队伍详情页面参数:", option);
      if (option && option.id) {
        this.teamId = option.id;
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
      if (this.teamId) {
        this.getTeamDetail();
      }
    },
    methods: {
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
        uni.navigateTo({
          url: `/pages/competition/detail?id=1`
        });
      },
      applyRole(roleId) {
        uni.showModal({
          title: "申请加入",
          content: "确定要申请该角色吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "申请已提交",
                icon: "success"
              });
            }
          }
        });
      },
      showApplyOptions() {
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
          }
        }
      },
      editTeam() {
        uni.navigateTo({
          url: `/pages/team/edit?id=${this.teamId}`
        });
      },
      disbandTeam() {
        uni.showModal({
          title: "解散队伍",
          content: "确定要解散该队伍吗？此操作不可撤销",
          confirmColor: "#f56c6c",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "队伍已解散",
                icon: "success"
              });
            }
          }
        });
      },
      leaveTeam() {
        uni.showModal({
          title: "退出队伍",
          content: "确定要退出该队伍吗？",
          confirmColor: "#f56c6c",
          success: (res) => {
            if (res.confirm) {
              teamApi.leaveTeam(this.teamId).then(() => {
                uni.showToast({
                  title: "已退出队伍",
                  icon: "success",
                  success: () => {
                    setTimeout(() => {
                      uni.navigateBack();
                    }, 1500);
                  }
                });
              }).catch((err) => {
                uni.showToast({
                  title: "退出失败",
                  icon: "none"
                });
              });
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
            formatAppLog("log", "at pages/team/detail.vue:396", "获取到队伍成员:", this.teamMembers);
          } else {
            formatAppLog("log", "at pages/team/detail.vue:398", "获取队伍成员失败:", res == null ? void 0 : res.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:401", "获取队伍成员出错", error);
        }
      },
      // 获取队伍详情数据
      async getTeamDetail() {
        this.isLoading = true;
        try {
          const res = await teamApi.getTeamDetail(this.teamId);
          if (res && res.code === 200 && res.data) {
            this.teamInfo = res.data;
            formatAppLog("log", "at pages/team/detail.vue:412", "获取到队伍详情:", this.teamInfo);
            this.getTeamMembers();
          } else {
            uni.showToast({
              title: (res == null ? void 0 : res.message) || "获取队伍详情失败",
              icon: "none"
            });
            formatAppLog("log", "at pages/team/detail.vue:420", "获取队伍详情失败:", res);
          }
        } catch (error) {
          formatAppLog("error", "at pages/team/detail.vue:423", "获取队伍详情出错", error);
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
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
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
        !$options.isTeamMember && $data.teamInfo.status === "0" && $options.hasAvailableRoles ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "full-btn primary-btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.showApplyOptions && $options.showApplyOptions(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-user-plus" }),
          vue.createTextVNode(" 申请加入队伍 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 情况2: 访客视角 & 队伍已满员/已解散 "),
        !$options.isTeamMember && ($data.teamInfo.status === "1" || $data.teamInfo.status === "2") ? (vue.openBlock(), vue.createElementBlock(
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
        $options.isTeamLeader ? (vue.openBlock(), vue.createElementBlock("view", {
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
        $options.isTeamMember && !$options.isTeamLeader ? (vue.openBlock(), vue.createElementBlock("button", {
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
  const PagesTeamDetail = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/detail.vue"]]);
  const _sfc_main$5 = {
    __name: "list",
    setup(__props, { expose: __expose }) {
      __expose();
      const categories = vue.ref(["全部", "学科竞赛", "创新创业", "体育竞赛", "文艺比赛"]);
      const currentCategory = vue.ref(0);
      const teamData = vue.ref({
        code: 200,
        message: "操作成功",
        data: {
          pageNum: 1,
          pageSize: 10,
          total: 8,
          pages: 1,
          list: [],
          hasPrevious: false,
          hasNext: false
        }
      });
      vue.onMounted(() => {
        formatAppLog("log", "at pages/team/list.vue:91", "组队列表页面加载");
        setTimeout(() => {
          teamData.value = {
            code: 200,
            message: "操作成功",
            data: {
              pageNum: 1,
              pageSize: 10,
              total: 8,
              pages: 1,
              list: [
                {
                  "id": 8,
                  "name": "创意无限",
                  "competitionId": 7,
                  "competitionTitle": "全国大学生广告艺术大赛",
                  "competitionCategoryName": "艺术设计",
                  "description": "广告大赛团队，需要平面设计和文案",
                  "recruitmentDeadlineFormatted": "2023-05-01",
                  "status": "0",
                  "statusText": "组队中",
                  "viewCount": 70,
                  "leaderId": 6,
                  "leaderName": "孙教授",
                  "leaderAvatarUrl": null,
                  "teamMemberAvatars": [],
                  "currentMemberCount": 0,
                  "maxMemberCount": null,
                  "teamProgress": 0,
                  "roles": []
                },
                {
                  "id": 4,
                  "name": "创客联盟",
                  "competitionId": 3,
                  "competitionTitle": '中国"互联网+"大学生创新创业大赛',
                  "competitionCategoryName": "创新创业",
                  "description": "互联网+创业项目，寻找市场和技术的合伙人",
                  "recruitmentDeadlineFormatted": "2023-05-20",
                  "status": "2",
                  "statusText": "已结束",
                  "viewCount": 200,
                  "leaderId": 7,
                  "leaderName": "周七",
                  "leaderAvatarUrl": "/uploads/tasks/2023/01/03/ghi789.pdf",
                  "teamMemberAvatars": [
                    "/uploads/tasks/2023/01/03/ghi789.pdf"
                  ],
                  "currentMemberCount": 1,
                  "maxMemberCount": 3,
                  "teamProgress": 33,
                  "roles": [
                    {
                      "id": 10,
                      "teamId": 4,
                      "name": "硬件工程师",
                      "requiredCount": 2,
                      "currentCount": 1,
                      "recruitmentProgress": 50,
                      "description": "负责电路设计和PCB绘制"
                    }
                  ]
                },
                {
                  "id": 1,
                  "name": "代码之星",
                  "competitionId": 1,
                  "competitionTitle": "ACM国际大学生程序设计竞赛",
                  "competitionCategoryName": "程序设计",
                  "description": "寻找有ACM竞赛经验的队友，目标区域赛金奖",
                  "recruitmentDeadlineFormatted": "2023-04-20",
                  "status": "0",
                  "statusText": "组队中",
                  "viewCount": 120,
                  "leaderId": 1,
                  "leaderName": "张三",
                  "leaderAvatarUrl": "/uploads/avatars/2023/01/01/abc123.jpg,/uploads/tasks/2023/01/04/jkl012.jpg",
                  "teamMemberAvatars": [
                    "/uploads/avatars/2023/01/01/abc123.jpg",
                    "/uploads/tasks/2023/01/04/jkl012.jpg"
                  ],
                  "currentMemberCount": 2,
                  "maxMemberCount": 5,
                  "teamProgress": 40,
                  "roles": [
                    {
                      "id": 1,
                      "teamId": 1,
                      "name": "算法选手",
                      "requiredCount": 3,
                      "currentCount": 1,
                      "recruitmentProgress": 33,
                      "description": "负责解决复杂算法问题"
                    }
                  ]
                }
              ],
              hasPrevious: false,
              hasNext: false
            }
          };
        }, 200);
      });
      function selectCategory(index) {
        currentCategory.value = index;
      }
      function goToTeamDetail(teamId) {
        uni.navigateTo({
          url: `/pages/team/detail?id=${teamId}`
        });
      }
      function applyToJoin(teamId) {
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
          itemList: ["发布竞赛信息", "招募队友", "发布项目展示"],
          success: function(res) {
            uni.showToast({
              title: `选择了: ${res.tapIndex}`,
              icon: "none"
            });
          }
        });
      }
      const __returned__ = { categories, currentCategory, teamData, selectCategory, goToTeamDetail, applyToJoin, createTeam, handleTabChange, showPublishOptions, ref: vue.ref, onMounted: vue.onMounted, TeamCard, TabBar };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "sticky-header" }, [
        vue.createElementVNode("view", { class: "header-title" }, [
          vue.createElementVNode("text", { class: "section-title" }, "组队广场"),
          vue.createElementVNode("view", { class: "header-actions" }, [
            vue.createElementVNode("text", { class: "iconfont icon-search" }),
            vue.createElementVNode("text", { class: "iconfont icon-filter" })
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
      vue.createElementVNode("scroll-view", {
        "scroll-y": "true",
        class: "team-list"
      }, [
        vue.createCommentVNode(" 使用团队卡片组件 "),
        $setup.teamData.data && $setup.teamData.data.list && $setup.teamData.data.list.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          vue.renderList($setup.teamData.data.list, (team, index) => {
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
        )) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 空状态提示 "),
            vue.createElementVNode("view", { class: "empty-state" }, [
              vue.createElementVNode("text", { class: "empty-text" }, "加载中...")
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 悬浮创建按钮 "),
      vue.createElementVNode("view", { class: "publish-btn-container" }, [
        vue.createElementVNode("view", {
          class: "publish-btn pulse",
          onClick: $setup.createTeam
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-plus" })
        ]),
        vue.createElementVNode("text", { class: "publish-text" }, "创建")
      ]),
      vue.createCommentVNode(" 底部导航栏 "),
      vue.createVNode($setup["TabBar"], {
        "active-tab": "team",
        onTabChange: $setup.handleTabChange,
        onPublish: $setup.showPublishOptions
      })
    ]);
  }
  const PagesTeamList = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/list.vue"]]);
  const _sfc_main$4 = {
    __name: "create",
    setup(__props, { expose: __expose }) {
      __expose();
      const selectedCompetition = vue.ref(null);
      const teamName = vue.ref("");
      const teamDescription = vue.ref("");
      const positions = vue.ref([]);
      function goBack() {
        uni.navigateBack();
      }
      function showCompetitionPicker() {
        uni.showToast({
          title: "竞赛选择功能开发中",
          icon: "none"
        });
        selectedCompetition.value = {
          id: 1,
          title: "互联网+创新创业大赛"
        };
      }
      function addPosition() {
        positions.value.push({
          name: "",
          count: 1,
          requirement: ""
        });
      }
      function removePosition(index) {
        positions.value.splice(index, 1);
      }
      function submitTeam() {
        if (!selectedCompetition.value) {
          return uni.showToast({
            title: "请选择竞赛",
            icon: "none"
          });
        }
        if (!teamName.value) {
          return uni.showToast({
            title: "请输入团队名称",
            icon: "none"
          });
        }
        if (positions.value.length === 0) {
          return uni.showToast({
            title: "请至少添加一个职位",
            icon: "none"
          });
        }
        for (let i = 0; i < positions.value.length; i++) {
          const position = positions.value[i];
          if (!position.name) {
            return uni.showToast({
              title: `请填写职位${i + 1}的名称`,
              icon: "none"
            });
          }
        }
        uni.showLoading({
          title: "创建中..."
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
      const __returned__ = { selectedCompetition, teamName, teamDescription, positions, goBack, showCompetitionPicker, addPosition, removePosition, submitTeam, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container bg-gray-50" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "sticky-header" }, [
        vue.createElementVNode("view", { class: "flex-row px-4 py-3" }, [
          vue.createElementVNode("view", {
            class: "mr-3",
            onClick: $setup.goBack
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-arrow-left text-gray-600" })
          ]),
          vue.createElementVNode("text", { class: "text-xl font-bold text-gray-800" }, "创建团队")
        ])
      ]),
      vue.createCommentVNode(" 表单内容 "),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createCommentVNode(" 选择竞赛 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "选择竞赛"),
          vue.createElementVNode("view", { class: "competition-selector" }, [
            vue.createElementVNode("view", {
              class: "selected-competition",
              onClick: $setup.showCompetitionPicker
            }, [
              $setup.selectedCompetition ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "selected-text"
                },
                vue.toDisplayString($setup.selectedCompetition.title),
                1
                /* TEXT */
              )) : (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "placeholder-text"
              }, "请选择竞赛")),
              vue.createElementVNode("text", { class: "iconfont icon-arrow-right text-gray-400" })
            ])
          ])
        ]),
        vue.createCommentVNode(" 团队信息 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("text", { class: "section-title" }, "团队信息"),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "团队名称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.teamName = $event),
                placeholder: "请输入团队名称"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.teamName]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "团队介绍"),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.teamDescription = $event),
                placeholder: "请简要介绍团队情况和招募需求"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.teamDescription]
            ])
          ])
        ]),
        vue.createCommentVNode(" 职位设置 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "flex-row justify-between items-center" }, [
            vue.createElementVNode("text", { class: "section-title" }, "职位设置"),
            vue.createElementVNode("view", {
              class: "add-btn",
              onClick: $setup.addPosition
            }, [
              vue.createElementVNode("text", { class: "iconfont icon-plus text-blue-500" }),
              vue.createElementVNode("text", { class: "text-blue-500 text-sm" }, "添加职位")
            ])
          ]),
          $setup.positions.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty-tip"
          }, [
            vue.createElementVNode("text", { class: "text-gray-500 text-sm" }, "请添加招募职位")
          ])) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.positions, (position, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "position-item"
              }, [
                vue.createElementVNode("view", { class: "position-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "text-gray-800 font-medium" },
                    "职位 " + vue.toDisplayString(index + 1),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", {
                    class: "iconfont icon-delete text-gray-500",
                    onClick: ($event) => $setup.removePosition(index)
                  }, null, 8, ["onClick"])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, "职位名称"),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    type: "text",
                    "onUpdate:modelValue": ($event) => position.name = $event,
                    placeholder: "如:产品经理"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vue.vModelText, position.name]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, "招募人数"),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    type: "number",
                    "onUpdate:modelValue": ($event) => position.count = $event,
                    placeholder: "1"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vue.vModelText, position.count]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "form-label" }, "要求描述"),
                  vue.withDirectives(vue.createElementVNode("textarea", {
                    class: "form-textarea",
                    "onUpdate:modelValue": ($event) => position.requirement = $event,
                    placeholder: "描述该职位的技能要求、经验要求等"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vue.vModelText, position.requirement]
                  ])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
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
  const PagesTeamCreate = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/team/create.vue"]]);
  const _sfc_main$3 = {
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesCompetitionIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/Uniapp/htmlTest/赛创项目/pages/competition/index.vue"]]);
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
