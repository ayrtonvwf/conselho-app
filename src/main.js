import Vue from 'vue'
import store from './store/index'
import router from './router'
import axios from 'axios'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

import App from './App'

import Modal from './components/Modal'
import Prompt from './components/Prompt'
import SuperTable from './components/SuperTable'

if (process.env.NODE_ENV === 'production') {
  Raven.config(process.env.VUE_APP_SENTRY_DSN)
    .addPlugin(RavenVue, Vue)
    .install()
}

axios.defaults.baseURL = process.env.VUE_APP_API_URL
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
