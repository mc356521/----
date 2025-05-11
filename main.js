import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { getEnv } from '@/config/env'
import store from './store'

const env = getEnv()

export function createApp() {
  const app = createSSRApp(App)
  // 将store挂载到全局属性
  app.config.globalProperties.$store = store
  return {
    app
  }
}
// #endif