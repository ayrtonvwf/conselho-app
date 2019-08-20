import Vue from 'vue'
import Vuex from 'vuex'
import db from '../assets/db'
import axios from 'axios'
import browserDetect from 'browser-detect'
import Raven from 'raven-js'

import {parseObjects} from '../assets/helpers'

import CouncilGrades from './modules/CouncilGrades'
import Councils from './modules/Councils'
import CouncilObservationTopics from './modules/CouncilObservationTopics'
import CouncilTopics from './modules/CouncilTopics'
import Evaluations from './modules/Evaluations'
import GradeObservations from './modules/GradeObservations'
import Grades from './modules/Grades'
import GradeSubjects from './modules/GradeSubjects'
import ObservationTopics from './modules/ObservationTopics'
import Permissions from './modules/Permissions'
import Roles from './modules/Roles'
import RoleTypePermissions from './modules/RoleTypePermissions'
import RoleTypes from './modules/RoleTypes'
import Schools from './modules/Schools'
import StudentGrades from './modules/StudentGrades'
import StudentObservations from './modules/StudentObservations'
import Students from './modules/Students'
import Subjects from './modules/Subjects'
import TeacherRequests from './modules/TeacherRequests'
import Teachers from './modules/Teachers'
import TopicOptions from './modules/TopicOptions'
import Topics from './modules/Topics'
import Users from './modules/Users'

Vue.use(Vuex)

const browser = browserDetect()

export default new Vuex.Store({
  modules: {
    council_grades: CouncilGrades,
    councils: Councils,
    council_observation_topics: CouncilObservationTopics,
    council_topics: CouncilTopics,
    evaluations: Evaluations,
    grade_observations: GradeObservations,
    grades: Grades,
    grade_subjects: GradeSubjects,
    observation_topics: ObservationTopics,
    permissions: Permissions,
    roles: Roles,
    role_type_permissions: RoleTypePermissions,
    role_types: RoleTypes,
    schools: Schools,
    student_grades: StudentGrades,
    student_observations: StudentObservations,
    students: Students,
    subjects: Subjects,
    teacher_requests: TeacherRequests,
    teachers: Teachers,
    topic_options: TopicOptions,
    topics: Topics,
    users: Users
  },

  state: {
    school_id: 1,
    db: db,
    token: {},
    logged_in: undefined,
    browser: {
      ...browser,
      playStore: browser.os.startsWith('Android'),
      iTunes: browser.os.startsWith('Mac'),
      support: (
        (browser.name === 'chrome' && browser.versionNumber >= 60) ||
        (browser.name === 'firefox' && browser.versionNumber >= 30) ||
        (browser.name === 'edge' && browser.versionNumber >= 14) ||
        (browser.name === 'ie' && browser.version >= 11) ||
        (browser.name === 'opera' && browser.version >= 43)
      ),
      readableName () {
        switch (browser.name) {
          case 'chrome' : return 'Google Chrome'
          case 'firefox' : return 'Firefox'
          case 'edge' : return 'Edge'
          case 'ie' : return 'Internet Explorer'
          case 'opera': return 'Ópera'
        }
      },
      updateLink () {
        if (!browser) {
          return undefined
        }

        switch (browser.name) {
          case 'chrome':
            if (browser.playStore) {
              return 'https://play.google.com/store/apps/details?id=com.android.chrome'
            }
            if (browser.iTunes) {
              return 'https://itunes.apple.com/us/app/google-chrome/id535886823'
            }
            return 'https://www.google.com/chrome'
          case 'firefox':
            if (browser.playStore) {
              return 'https://play.google.com/store/apps/details?id=org.mozilla.firefox'
            }
            if (browser.iTunes) {
              return 'https://itunes.apple.com/ca/app/firefox-web-browser/id989804926'
            }
            return 'https://www.mozilla.org/pt-BR/firefox/new'
          case 'edge':
            if (browser.playStore) {
              return 'https://play.google.com/store/apps/details?id=com.microsoft.emmx'
            }
            if (browser.iTunes) {
              return 'https://itunes.apple.com/us/app/microsoft-edge/id1288723196?mt=8'
            }
            return 'https://www.microsoft.com/en-us/download/details.aspx?id=48126#4baacbe7-a8a1-8091-5597-393c6b9ace67'
          case 'ie':
            return 'https://www.microsoft.com/en-us/download/details.aspx?id=48126#4baacbe7-a8a1-8091-5597-393c6b9ace67'
          case 'opera':
            if (browser.playStore) {
              return 'https://play.google.com/store/apps/details?id=com.opera.browser'
            }
            return 'https://www.opera.com'
        }
      }
    }
  },

  mutations: {
    checkAuth: state => {
      state.token = JSON.parse(localStorage.getItem('token'))
      state.logged_in = state.token && new Date(state.token.expires_at) > new Date()
      if (state.logged_in) {
        Raven.setUserContext({ id: state.token.user_id })
        axios.defaults.headers.common['Token'] = state.token.value
      } else {
        Raven.setUserContext({ id: undefined })
        axios.defaults.headers.common['Token'] = undefined
      }
    }
  },

  actions: {
    loadData: context => {
      const db = context.state.db
      const promises = []

      db.tables.forEach(table => {
        promises.push(context.dispatch(table.name + '/loadFromDb'))
      })

      return Promise.all(promises)
    },

    loadFromAPI: context => {
      const state = context.state
      const db = state.db

      const ignoreTables = ['evaluations', 'student_observations', 'grade_observations']

      const promises = []

      db.tables.forEach(table => {
        if (ignoreTables.indexOf(table.name) !== -1) {
          return // will be loaded only if the user cant see the report
        }

        const resource = table.name.slice(0, -1)
        const promise = context.dispatch('getResource', resource).then(data => {
          return table.clear().then(() => {
            return table.bulkPut(parseObjects(data))
          })
        })

        promises.push(promise)
      })

      return Promise.all(promises).then(() => {
        const promises = [
          context.dispatch('roles/loadFromDb'),
          context.dispatch('role_types/loadFromDb'),
          context.dispatch('role_type_permissions/loadFromDb'),
          context.dispatch('permissions/loadFromDb')
        ]
        return Promise.all(promises)
      })
    },

    getResource: (context, payload) => {
      const name = payload.name ? payload.name : payload
      const data = payload.data ? payload.data : {}
      const path = '/' + name

      data.school_id = 1

      return axios.get(path, {params: data}).then(response => {
        const responseData = response.data
        let returnData = parseObjects(responseData.results)

        const max = parseInt(responseData.max_results_per_page)
        const total = parseInt(responseData.total_results)

        const remainingPages = Math.floor(total / max)

        if (total === max || !remainingPages) {
          return returnData
        }

        const remainingRequisitions = []
        for (let i = 1; i <= remainingPages; i++) {
          data.page = i + 1
          const promise = axios.get(path, {params: JSON.parse(JSON.stringify(data))})
          remainingRequisitions.push(promise)
        }

        return Promise.all(remainingRequisitions).then(remainingResponses => {
          remainingResponses.forEach(remainingResponse => {
            returnData = returnData.concat(remainingResponse.data.results)
          })
          return returnData
        })
      })
    },

    login: (context, {email, password}) => {
      const data = {
        email: email,
        password: password
      }

      return axios.post('/user_token', data).then(response => {
        localStorage.setItem('token', JSON.stringify(response.data))
        context.commit('checkAuth')
      })
    },

    logout: context => {
      localStorage.removeItem('token')

      context.commit('checkAuth')

      const promises = []

      context.state.db.tables.forEach(table => {
        const promise = table.clear().then(() => {
          context.commit(table.name + '/unload')
        })
        promises.push(promise)
      })

      return Promise.all(promises)
    }
  }
})
