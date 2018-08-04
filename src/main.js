/* eslint-disable */

import Vue from 'vue'
import App from './App'
import Modal from './components/Modal'
import Prompt from './components/Prompt'
import SuperTable from './components/SuperTable'
import router from './router'

Vue.config.productionTip = false

Vue.component('modal', Modal)
Vue.component('prompt', Prompt)
Vue.component('super-table', SuperTable)

let app = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
