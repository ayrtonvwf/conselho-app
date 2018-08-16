/* eslint-disable */

import Vue from 'vue'
import Vuex from 'vuex'
import db from './db'
import {parseObject, parseObjects, serialize} from './helpers'

Vue.use(Vuex)

let api_url
if (location.href.indexOf('localhost') !== -1 || location.href.indexOf('127.0.0.1') !== -1) {
  api_url = 'http://localhost/conselho-server/'
} else {
  api_url = 'https://conselho-api.infomec.net.br/'
}

export default new Vuex.Store({
  state: {
    councils: [],
    council_grades: [],
    council_topics: [],
    evaluations: [],
    grades: [],
    grade_subjects: [],
    grade_observations: [],
    medical_reports: [],
    medical_report_subjects: [],
    permissions: [],
    roles: [],
    role_types: [],
    role_type_permissions: [],
    schools: [],
    students: [],
    student_observations: [],
    student_grades: [],
    subjects: [],
    teachers: [],
    teacher_requests: [],
    topics: [],
    topic_options: [],
    users: [],

    db: db,

    api_url: api_url,
    token: {},
    logged_in: undefined
  },
  mutations: {
    checkAuth: state => {
      state.token = JSON.parse(localStorage.getItem('token'))
      state.logged_in = state.token && new Date(state.token.expires_at) > new Date()
    },
    injectData: (state, payload) => {
      Object.keys(payload).forEach((resource) =>
        state[resource] = payload[resource]
      )
    },
    pushItem: (state, {name, data}) => {
      state[name].push(data)
    },
    updateItem: (state, {name, data}) => {
      let index = state[name].findIndex(item =>
        item.id === data.id
      )

      if (index < 0) {
        throw 'Tried to update '+name+', but id '+data.id+' was not found.'
      }

      Vue.set(state[name], index, data)
    },
    deleteItem: (state, {name, id}) => {
      let index = state[name].findIndex(item =>
        item.id === id
      )

      if (index < 0) {
        throw 'Tried to delete '+name+', but id '+id+' was not found.'
      }

      Vue.delete(state[name], index)
    }
  },
  actions: {
    loadData: context => {
      let db = context.state.db

      // everything loads into this var, then put all at once in the state
      // to prevent multiple DOM updates / computed properties evaluations
      let data = {}

      let promises = []
      promises.push(
        db.users.toArray().then(users =>
          data.users = users.sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
          )
        )
      )

      promises.push(
        db.grades.toArray().then(grades =>
          data.grades = grades.sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
          )
        )
      )

      promises.push(
        db.subjects.toArray().then(subjects =>
          data.subjects = subjects.sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
          )
        )
      )

      promises.push(
        db.topic_options.toArray().then(topic_options =>
          data.topic_options = topic_options.sort((a, b) =>
            Math.sign(b.value - a.value)
          )
        )
      )

      promises.push( db.councils.toArray().then(councils => data.councils = councils) )
      promises.push( db.council_grades.toArray().then(council_grades => data.council_grades = council_grades) )
      promises.push( db.council_topics.toArray().then(council_topics => data.council_topics = council_topics) )
      promises.push( db.evaluations.toArray().then(evaluations => data.evaluations = evaluations) )
      promises.push( db.grade_subjects.toArray().then(grade_subjects => data.grade_subjects = grade_subjects) )
      promises.push( db.grade_observations.toArray().then(grade_observations => data.grade_observations = grade_observations) )
      promises.push( db.medical_reports.toArray().then(medical_reports => data.medical_reports = medical_reports) )
      promises.push( db.medical_report_subjects.toArray().then(medical_report_subjects => data.medical_report_subjects = medical_report_subjects) )
      promises.push( db.permissions.toArray().then(permissions => data.permissions = permissions) )
      promises.push( db.roles.toArray().then(roles => data.roles = roles) )
      promises.push( db.role_types.toArray().then(role_types => data.role_types = role_types) )
      promises.push( db.role_type_permissions.toArray().then(role_type_permissions => data.role_type_permissions = role_type_permissions) )
      promises.push( db.schools.toArray().then(schools => data.schools = schools) )
      promises.push( db.students.toArray().then(students => data.students = students) )
      promises.push( db.student_observations.toArray().then(student_observations => data.student_observations = student_observations) )
      promises.push( db.student_grades.toArray().then(student_grades => data.student_grades = student_grades) )
      promises.push( db.teachers.toArray().then(teachers => data.teachers = teachers) )
      promises.push( db.teacher_requests.toArray().then(teacher_requests => data.teacher_requests = teacher_requests) )
      promises.push( db.topics.toArray().then(topics => data.topics = topics) )

      return Promise.all(promises).then(() => {
        context.commit('injectData', data)
      })
    },
    loadFromAPI: context => {
      let state = context.state
      let db = state.db

      let promises = []

      // if the process breaks, next time will be loaded from API
      window.localStorage.removeItem('has_loaded_data')

      db.tables.forEach(table => {
        let resource = table.name.slice(0, -1)
        let promise = context.dispatch('get_resource', resource).then(data => {
          return table.clear().then(() => {
            return table.bulkPut(parseObjects(data))
          })
        })

        promises.push(promise)
      })

      return Promise.all(promises).then(() => {
        window.localStorage.setItem('has_loaded_data', '1')
      })
    },
    api_fetch: (context, {path, method, body, headers}) => {
      if (method === undefined) {
        method = 'GET'
      }

      if (!body) {
        body = { school_id: 1}
      } else {
        body.school_id = 1
      }

      if (method === 'GET' || method === 'DELETE') {
        if (body !== undefined) {
          path += '?' + serialize(body)
          body = undefined
        }
      } else {
        body = parseObject(body)
        body = JSON.stringify(body)
      }

      if (headers === undefined) {
        headers = {}
      }

      headers = new Headers(headers)
      headers.set('Timezone', '-03:00')
      headers.set('Accept', 'application/json; charset=UTF-8')
      headers.set('Content-Type', 'application/json')
      if (!headers.has('Token') && context.state.token && context.state.token.value) {
        headers.set('Token', context.state.token.value)
      }

      let url = context.state.api_url + path
      let options = {
        headers: headers,
        method: method,
        mode: 'cors',
        body: body
      }

      return fetch(url, options).then(response => {
        if (!response.ok) {
          throw response
        }
        return response
      })
    },
    get_resource: (context, name) => {
      return context.dispatch('api_fetch', {path: name})
        .then(response => response.json())
        .then(response_data => {
          let return_data = response_data.results

          let max = parseInt(response_data.max_results_per_page)
          let total = parseInt(response_data.total_results)

          let remaining_pages = Math.floor(total / max)

          if (total === max || !remaining_pages) {
            return return_data
          }

          let remaining_requisitions = []
          for (let i = 1; i <= remaining_pages; i++) {
            remaining_requisitions.push(context.dispatch('api_fetch', {path: name, method: 'GET', body: {page: i + 1}}).then(remaining_response =>
              remaining_response.json()
            ))
          }

          return Promise.all(remaining_requisitions).then(remaining_responses => {
            remaining_responses.forEach(remaining_response_data => {
              return_data = return_data.concat(remaining_response_data.results)
            })
            return return_data
          })
        })
    },
    db_put: (context, { name, data }) => {
      return context.state.db[name].put(data)
    },
    save_resource: (context, {resource_name, data, save_to_db, update_view, headers}) => {
      if (save_to_db !== undefined) {
        console.warn('The option "save_to_db" of the "save_resource" function is deprecated.')
      }

      if (update_view !== undefined) {
        console.warn('The option "update_view" of the "save_resource" function is deprecated.')
      }

      let path = resource_name
      let method = 'POST'

      if (data.id) {
        path += '/' + data.id
        method = 'PATCH'
      } else {
        delete data.id
      }

      return context.dispatch('api_fetch', {path: path, method: method, body: data, headers: headers}).then(response => {
        return response.json()
      }).then((json) => {
        if (json.id) {
          data.id = parseInt(json.id)
        }
        if (json.created_at) {
          data.created_at = json.created_at
        }
        if (json.updated_at) {
          data.updated_at = json.updated_at
        }

        data = parseObject(data)

        return context.state.db[resource_name + 's'].put(data)
      }).then(() => {
        let mutation = method === 'PATCH' ? 'updateItem' : 'pushItem'
        context.commit(mutation, { name: resource_name + 's', data: data })
        return data
      })
    },
    delete_resource: (context, {resource_name, id, notification, reload_view}) => {
      if (notification !== undefined) {
        console.warn('The "notification" option of the "delete_resource" is deprecated')
      }

      if (reload_view !== undefined) {
        console.warn('The "reload_view" option of the "delete_resource" is deprecated')
      }

      const options = {
        path: resource_name + '/' + id,
        method: 'DELETE'
      }
      return context.dispatch('api_fetch', options).then(() =>
        context.state.db[resource_name + 's'].delete(id)
      ).then(
        context.commit('deleteItem', { name: resource_name + 's', id: id })
      )
    },

    login: (context, {email, password}) => {
      let options = {
        path: 'user_token',
        method: 'POST',
        body: {
          email: email,
          password: password
        }
      }

      return context.dispatch('api_fetch', options).then(response =>
        response.json()
      ).then(token => {
        localStorage.setItem('token', JSON.stringify(token))
        context.commit('checkAuth')
      })
    },
    logout: context => {
      localStorage.removeItem('token')
      localStorage.removeItem('has_loaded_data')

      context.commit('checkAuth')

      let promises = []

      context.state.db.tables.forEach(table => {
        promises.push(table.clear())
      })

      return Promise.all(promises)
    }
  }
})
