import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueElectron from 'vue-electron';
import './assets/fonts/iconfont/iconfont.css'



import App from './App'
import router from './router'
import store from './store'

// 引入自定义的文件
import '@/assets/css/global.css'

Vue.use(ElementUI);
Vue.use(VueElectron)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip =  false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

