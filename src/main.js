import Vue from 'vue'
import store from './store/index'
import router from './router'
import axios from 'axios'

import App from './App'

import Modal from './components/Modal'
import Prompt from './components/Prompt'
import SuperTable from './components/SuperTable'

if (location.href.indexOf('localhost') !== -1 || location.href.indexOf('127.0.0.1') !== -1 || process.env.NODE_ENV !== 'production') {
  axios.defaults.baseURL = 'http://localhost/conselho-server/'
} else {
  axios.defaults.baseURL = 'https://conselho-api.infomec.net.br/'
}
axios.defaults.headers.common['Token'] = undefined
axios.defaults.headers.common['Accept'] = 'application/json; charset=UTF-8'
axios.defaults.headers.common['Timezone'] = '-03:00'
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=UTF-8'

Vue.config.productionTip = false

Vue.component('modal', Modal)
Vue.component('prompt', Prompt)
Vue.component('super-table', SuperTable)

/* eslint-disable-next-line */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
