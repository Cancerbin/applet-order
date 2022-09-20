import App from './App'
import uView from '@/uni_modules/uview-ui';
import request from '@/utils/request.js';
import utils from '@/utils/utils.js';

// #ifndef VUE3
import Vue from 'vue'
Vue.use(uView)
Vue.config.productionTip = false
Vue.prototype.$request = request;
Vue.prototype.$utils = utils;
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif