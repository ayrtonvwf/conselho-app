import Vue from 'vue'
import Vuex from 'vuex'
import db from '../assets/db'
import axios from 'axios'

import {parseObjects} from '../assets/helpers'

import CouncilGrades from './modules/CouncilGrades'
import Councils from './modules/Councils'
import CouncilTopics from './modules/CouncilTopic'
import Evaluations from './modules/Evaluations'
import GradeObservations from './modules/GradeObservations'
import Grades from './modules/Grades'
import GradeSubjects from './modules/GradeSubjects'
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

export default new Vuex.Store({
  modules: {
    council_grades: CouncilGrades,
    councils: Councils,
    council_topics: CouncilTopics,
    evaluations: Evaluations,
    grade_observations: GradeObservations,
    grades: Grades,
    grade_subjects: GradeSubjects,
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
    logged_in: undefined
  },

  mutations: {
    checkAuth: state => {
      state.token = JSON.parse(localStorage.getItem('token'))
      state.logged_in = state.token && new Date(state.token.expires_at) > new Date()
      if (state.logged_in) {
        axios.defaults.headers.common['Token'] = state.token.value
      } else {
        axios.defaults.headers.common['Token'] = undefined
      }
    }
  },

  actions: {
    loadData: context => {
      const promises = []

      promises.push(context.dispatch('users/loadFromDb'))
      promises.push(context.dispatch('grades/loadFromDb'))
      promises.push(context.dispatch('subjects/loadFromDb'))
      promises.push(context.dispatch('topic_options/loadFromDb'))
      promises.push(context.dispatch('councils/loadFromDb'))
      promises.push(context.dispatch('council_grades/loadFromDb'))
      promises.push(context.dispatch('council_topics/loadFromDb'))
      promises.push(context.dispatch('evaluations/loadFromDb'))
      promises.push(context.dispatch('grade_subjects/loadFromDb'))
      promises.push(context.dispatch('grade_observations/loadFromDb'))
      promises.push(context.dispatch('permissions/loadFromDb'))
      promises.push(context.dispatch('roles/loadFromDb'))
      promises.push(context.dispatch('role_types/loadFromDb'))
      promises.push(context.dispatch('role_type_permissions/loadFromDb'))
      promises.push(context.dispatch('schools/loadFromDb'))
      promises.push(context.dispatch('students/loadFromDb'))
      promises.push(context.dispatch('student_observations/loadFromDb'))
      promises.push(context.dispatch('student_grades/loadFromDb'))
      promises.push(context.dispatch('teachers/loadFromDb'))
      promises.push(context.dispatch('teacher_requests/loadFromDb'))
      promises.push(context.dispatch('topics/loadFromDb'))

      return Promise.all(promises)
    },

    loadFromAPI: context => {
      const state = context.state
      const db = state.db

      const promises = []

      db.tables.forEach(table => {
        const resource = table.name.slice(0, -1)
        const promise = context.dispatch('getResource', resource).then(data => {
          return table.clear().then(() => {
            return table.bulkPut(parseObjects(data))
          })
        })

        promises.push(promise)
      })

      return Promise.all(promises)
    },

    getResource: (context, name) => {
      const path = '/' + name
      return axios.get(path).then(response => {
        const responseData = response.data
        let returnData = responseData.results

        const max = parseInt(responseData.max_results_per_page)
        const total = parseInt(responseData.total_results)

        const remainingPages = Math.floor(total / max)

        if (total === max || !remainingPages) {
          return returnData
        }

        const remainingRequisitions = []
        for (let i = 1; i <= remainingPages; i++) {
          const promise = axios.get(path, {params: {page: i + 1}})
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
        promises.push(table.clear())
      })

      return Promise.all(promises)
    }
  }
})
