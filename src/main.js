import Vue from 'vue'
import store from './store/index'
import router from './router'
import axios from 'axios'
import VueCordova from 'vue-cordova'

import App from './App'

import Modal from './components/Modal'
import Prompt from './components/Prompt'
import SuperTable from './components/SuperTable'

axios.defaults.baseURL = process.env.NODE_ENV !== 'production' ? 'http://localhost/conselho-server/' : 'https://conselho-api.infomec.net.br/'
axios.defaults.headers.common['Token'] = undefined
axios.defaults.headers.common['Accept'] = 'application/json; charset=UTF-8'
axios.defaults.headers.common['Timezone'] = '-03:00'
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=UTF-8'

Vue.config.productionTip = false

Vue.use(VueCordova)

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
