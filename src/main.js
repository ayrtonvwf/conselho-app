import Vue from 'vue'
import store from './assets/store'
import router from './router'

import App from './App'

import Modal from './components/Modal'
import Prompt from './components/Prompt'
import SuperTable from './components/SuperTable'

Vue.config.productionTip = false

Vue.component('modal', Modal)
Vue.component('prompt', Prompt)
Vue.component('super-table', SuperTable)

/* eslint-disable-next-line */
let app = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
