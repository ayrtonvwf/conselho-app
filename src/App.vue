<template>
  <div id="app">
    <form id="form-valid-support-helper">
      <input required>
    </form>
    <header class="header">
      <router-link class="header-button main-button" :to="{ name: 'Index' }">Conselho</router-link>
      <template v-if="logged_in">
        <a class="header-button menu-toggle material-icons" href="#menu" v-if="logged_in">menu</a>
        <button class="header-button material-icons" type="button" @click="loadFromAPI">sync</button>

        <div class="header-pane" v-if="userHasPermission('role')">
          <button class="header-button material-icons" type="button">
            notifications
            <span class="header-button-label-red" v-if="teacher_requests.length">{{ teacher_requests.length }}</span>
          </button>
          <div class="header-pane-popup">
            <div class="header-pane-header"><i class="material-icons">notifications</i>Notificações</div>
            <div class="header-pane-body">
              <div v-for="(teacher_request, index) in teacher_requests" :key="teacher_request.id">
                <hr class="margin-h-15" v-if="index">
                <router-link class="no-link" :to="{ name: 'Teacher' }">
                  <div class="header-notification-title"><b>{{ users.find(user => user.id === teacher_request.user_id).name }}</b> aguarda sua aprovação</div>
                  <div class="header-notification-description">{{ grades.find(grade => grade.id === teacher_request.grade_id).name }} - {{ subjects.find(subject => subject.id === teacher_request.subject_id).name }}
                    <div class="text-muted">{{ new Date(teacher_request.created_at).toLocaleDateString('pt-BR') }}</div>
                  </div>
                </router-link>
              </div>
              <div class="text-center text-muted" v-if="!teacher_requests.length"><br><br>
                <div class="h5">Não há notificações</div><br><br>
              </div>
            </div>
          </div>
        </div>

        <div class="header-pane">
          <button class="header-button" type="button">{{ user ? user.name : ''}}</button>
          <div class="header-pane-popup">
            <div class="header-pane-body text-center bg-primary text-white"><br>
              <div class="text-80"><i class="material-icons user-icon">account_circle</i></div>
              <div class="text-20">{{ user ? user.name : ''}}</div><br><br>
            </div>
            <div class="header-pane-footer">
              <router-link class="btn-default btn-sm" :to="{ name: 'User' }">Usuário</router-link>
              <button class="btn-default btn-sm pull-right" type="button" @click="logout">Sair</button>
            </div>
          </div>
        </div>
      </template>
    </header>
    <div class="container">
      <nav class="menu" id="menu" v-if="logged_in">
        <a class="menu-close header-button material-icons" href="#">menu</a>
        <router-link class="menu-link" :to="{ name: 'Index' }" active-class="menu-active" exact>
          <i class="material-icons">home</i> Página Inicial
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Subject' }" v-if="userHasPermission('subject')" active-class="menu-active">
          <i class="material-icons">book</i> Disciplinas
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Topic' }" v-if="userHasPermission('topic')" active-class="menu-active">
          <i class="material-icons">list</i> Tópicos
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Grade' }" v-if="userHasPermission('grade')" active-class="menu-active">
          <i class="material-icons">people</i> Turmas
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Council' }" v-if="userHasPermission('council')" active-class="menu-active">
          <i class="material-icons">edit</i> Conselhos de Classe
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Role' }" v-if="userHasPermission('role')" active-class="menu-active">
          <i class="material-icons">supervisor_account</i> Usuários
        </router-link>
        <router-link class="menu-link" :to="{ name: 'Teacher' }" v-if="userHasPermission('teacher')" active-class="menu-active">
          <i class="material-icons">supervisor_account</i> Professores
        </router-link>
        <template v-if="userHasPermission('evaluate')">
          <router-link class="menu-link" :to="{ name: 'TeacherRequest' }" active-class="menu-active">
            <i class="material-icons">people</i> Turmas
          </router-link>
          <router-link class="menu-link" v-for="council in activeCouncils" :key='council.id' :to="{ name: 'Evaluate', params: { id: council.id } }" active-class="menu-active">
            <i class="material-icons">edit</i> {{ council.name }}
          </router-link>
        </template>
      </nav>
      <main class="content mark-required selection-primary">
        <router-view></router-view>
      </main>
    </div>
    <input class="notification-toggle notification-start-hidden" type="radio" name="notification-toggle" checked>
    <input class="notification-toggle" type="radio" name="notification-toggle" id="no-notification">
    <input class="notification-toggle" type="radio" name="notification-toggle" id="notification-shown">
    <div class="notification" :class="'notification-'+notification.style" v-if="Object.keys(notification).length > 0">
      <label class="notification-dismiss material-icons" for="no-notification">close</label>
      <div class="notification-icon material-icons" v-if="notification.icon !== undefined">{{ notification.icon }}</div>
      <div class="notification-title">{{ notification.title }}</div>{{ notification.message }}
    </div>
    <div id="loading" v-if="loading">
      <div class="material-icons">sync</div>
    </div>
  </div>
</template>

<style src="../node_modules/lite-admin/dist/style.css" type="text/css"></style>
<style src="../node_modules/material-design-icons/iconfont/material-icons.css" type="text/css"></style>

<script>
/* eslint-disable */

import Dexie from 'dexie'

export default {
  name: 'App',
  data() {
    let data = {
      resources: [
        'council',
        'council_grade',
        'council_topic',
        'evaluation',
        'grade',
        'grade_subject',
        'grade_observation',
        'medical_report',
        'medical_report_subject',
        'permission',
        'role',
        'role_type',
        'role_type_permission',
        'school',
        'student',
        'student_observation',
        'student_grade',
        'subject',
        'teacher',
        'teacher_request',
        'topic',
        'topic_option',
        'user'
      ],

      token: undefined,
      user: {},
      current_council: {},
      notification: {},
      new_topic_options: [{default: 1}],
      updated_evaluations: '',
      logged_in: undefined,
      current_grade_id: '',
      current_subject_id: '',
      loading: true,
      hide_evaluated_students: false,
      current_user_id: undefined // the current user (teacher) being edited
    }

    data.resources.forEach(resource => {
      data[resource+'s'] = []
    })

    return data
  },
  methods: {
    // initializing methods
    setApiUrl() {
      if (location.href.indexOf('localhost') !== -1 || location.href.indexOf('127.0.0.1') !== -1) {
        this.api_url = 'http://localhost/conselho-server/'
      } else {
        this.api_url = 'https://conselho-api.infomec.net.br/'
      }
    },
    setAuthData() {
      this.token = JSON.parse(localStorage.getItem('token'))
      this.logged_in = this.token && new Date(this.token.expires_at) > new Date()
    },

    openDB() {
      let db = new Dexie('conselho')
      db.version(1).stores({
        councils: 'id',
        council_grades: 'id',
        council_topics: 'id',
        evaluations: 'id, [council_id+grade_id], [council_id+grade_id+subject_id]',
        grades: 'id',
        grade_subjects: 'id',
        grade_observations: 'id',
        medical_reports: 'id',
        medical_report_subjects: 'id',
        permissions: 'id',
        roles: 'id',
        role_types: 'id',
        role_type_permissions: 'id',
        schools: 'id',
        students: 'id',
        student_observations: 'id',
        student_grades: 'id',
        subjects: 'id',
        teachers: 'id',
        teacher_requests: 'id',
        topics: 'id',
        topic_options: 'id',
        users: 'id'
      })
      db.open().catch(error => {
        console.error('Open failed: ' + error.stack)
      })

      this.db = db
    },

    loadData() {
      if (window.localStorage.getItem('has_loaded_data')) {
        this.loadFromDB()
      } else {
        this.loadFromAPI()
      }
    },
    loadFromAPI () {
      this.loading = true

      let promises = []

      // if the process breaks, next time will be loaded from API
      window.localStorage.removeItem('has_loaded_data')

      this.resources.forEach(resource => {
        let promise = this.get_resource(resource).then(data => {
          return this.db[resource+'s'].clear().then(() => {
            return this.db[resource + 's'].bulkPut(this.parseObjects(data))
          })
        })

        promises.push(promise)
      })

      return Promise.all(promises).then(() => {
        window.localStorage.setItem('has_loaded_data', '1')
        return this.loadFromDB()
      }).catch(error => {
        this.notify('Erro!', 'Ocorreu um erro durante a atualização. Tente novamente!', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.loading = false
      })
    },
    loadFromDB() {
      this.loading = true

      let promises = []

      this.resources.forEach(resource => {
        let promise = this.db[resource+'s'].toArray().then(data => {
          this[resource + 's'] = data
        })

        promises.push(promise)
      })

      return Promise.all(promises).then(() => {
        this.user = this.users.find(user =>
          user.id === this.token.user_id
        )
      }).catch(error => {
        this.notify('Erro!', 'Ocorreu um erro durante o carregamento dos dados. Recarregue a página!', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.loading = false
      })
    },

    orderedTopicOptions(topic_id) {
      let topic_options = this.topic_options.filter(topic_option => topic_option.topic_id === topic_id)

      // order by value desc
      return topic_options.sort((a, b) => {
        a = parseInt(a.value)
        b = parseInt(b.value)

        if (a > b) {
          return -1
        }

        if (a < b) {
          return 1
        }

        return 0
      })
    },
    role_type (user_id) {
      let role = this.roles.find(role => role.user_id === user_id && parseInt(role.approved))

      if (!role) {
        return {}
      }

      return this.role_types.find(role_type => role_type.id === role.role_type_id)
    },
    userHasPermission (permission_reference, user_id) {
      if (!user_id) {
        user_id = this.user.id
      }

      let role_type = this.role_type(user_id)

      if (role_type.id === undefined) {
        return false
      }

      let permission = this.permissions.find(permission => permission.reference === permission_reference)

      return !!this.role_type_permissions.find(role_type_permission => role_type_permission.permission_id === permission.id && role_type_permission.role_type_id === role_type.id)
    },
    studentGrade (student_id) {
      return this.student_grades.find(student_grade =>
        parseInt(student_grade.grade_id) === parseInt(this.current_grade_id) &&
        parseInt(student_grade.student_id) === parseInt(student_id)
      )
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('has_loaded_data')

      this.token = undefined
      this.logged_in = false
      this.loading = true

      let promises = []

      this.resources.forEach(resource => {
        promises.push(this.db[resource+'s'].clear())
      })

      Promise.all(promises).finally(() => {
        this.$router.push('/login')
        this.loading = false
      })
    },
    get_resource(name) {
      let app = this
      return app.api_fetch(name)
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
            remaining_requisitions.push(app.api_fetch(name, 'GET', {page: i + 1}).then(remaining_response => remaining_response.json()))
          }

          return Promise.all(remaining_requisitions).then(remaining_responses => {
            remaining_responses.forEach(remaining_response_data => {
              return_data = return_data.concat(remaining_response_data.results)
            })
            return return_data
          })
        })
    },
    api_fetch (path, method, body, headers) {
      let serialize = obj => {
        let str = []
        for (let p in obj) {
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
        }
        return str.join('&')
      }

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
        body = JSON.stringify(this.parseObject(body))
      }

      if (headers === undefined) {
        headers = {}
      }

      headers = new Headers(headers)
      headers.set('Timezone', '-03:00')
      headers.set('Accept', 'application/json; charset=UTF-8')
      headers.set('Content-Type', 'application/json')
      if (!headers.has('Token') && this.token && this.token.value) {
        headers.set('Token', this.token.value)
      }

      let url = this.api_url + path
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
    delete_resource (resource_name, id, notification, reload_view) {
      if (notification === undefined) {
        notification = true
      }

      if (reload_view === undefined) {
        reload_view = true
      }

      this.loading = true

      let app = this

      return this.api_fetch(resource_name + '/' + id, 'DELETE').then(() => {
        if (reload_view) {
          let i = app[resource_name + 's'].findIndex(item => parseInt(item.id) === parseInt(id))
          app[resource_name + 's'].splice(i, 1)
        }
        return app.db[resource_name + 's'].delete(id)
      }).then(() => {
        if (notification) {
          app.loading = false
          app.notify('Sucesso!', 'Excluído com sucesso', 'success')
        }
      }).catch(() => {
        if (notification) {
          app.loading = false
          app.notify('Erro!', 'Não foi possível excluir', 'danger')
        }
      })
    },
    save_resource (resource_name, data, save_to_db, update_view, headers) {
      if (save_to_db === undefined) {
        save_to_db = true
      }
      if (save_to_db && update_view === undefined) {
        update_view = true
      }

      let path = resource_name
      let method = 'POST'

      if (data.id) {
        path += '/' + data.id
        method = 'PATCH'
      } else {
        delete data.id
      }

      let app = this

      return this.api_fetch(path, method, data, headers).then(response => {
        return response.json()
      }).then((json) => {
        if (json.id) {
          data.id = parseInt(json.id)
        }
        if (json.created_at) {
          data.created_at = json.created_at
        }
        if (json.updated_at) {
          data.updated_evaluations = json.updated_at
        }
        if (update_view && method === 'POST') {
          app[resource_name + 's'].push(data)
        } else if (update_view && (method === 'PATCH')) {
          let i = app[resource_name + 's'].findIndex(item => parseInt(item.id) === parseInt(data.id))
          if (i !== undefined) {
            app[resource_name + 's'][i] = data
          } else {
            app[resource_name + 's'].push(data)
          }
        }
        if (save_to_db) {
          return app.db[resource_name + 's'].put(data)
        }
      }).then(() => data)
    },
    notify (title, message, style, time) {
      if (time === undefined) {
        time = 5000
      }

      if (style === undefined) {
        style = 'info'
      }

      let icon
      if (style === 'success') {
        icon = 'check'
      } else if (style === 'danger') {
        icon = 'close'
      } else if (style === 'warning') {
        icon = 'warning'
      } else if (style === 'info' || style === 'primary') {
        icon = 'info'
      }

      let timestamp = Date.now().toString()

      document.getElementById('no-notification').checked = true

      let app = this

      // it there's already a notification, delay to transition
      let start_delay = Object.keys(app.notification).length > 0 ? 500 : 0

      setTimeout(() => {
        app.notification = {
          style: style,
          icon: icon,
          title: title,
          message: message,
          timestamp: timestamp
        }

        document.getElementById('notification-shown').checked = true

        setTimeout(() => {
          if (app.notification.timestamp !== timestamp) {
            return
          }

          document.getElementById('no-notification').checked = true

          setTimeout(() => { // delay to transition
            if (app.notification.timestamp !== timestamp) {
              return
            }

            app.notification = {}
          }, 500)
        }, time)
      }, start_delay)
    },
    parseObject (object) {
      let properties = Object.keys(object)
      properties.forEach(property => {
        if (object[property] === null || object[property] === undefined) {
          return
        }

        if (object[property].toString() === parseInt(object[property]).toString()) {
          object[property] = parseInt(object[property]) // "int" to int
        } else if (object[property].toString() === parseFloat(object[property]).toString()) {
          object[property] = parseFloat(object[property]) // "float" to float
        } else if (object[property] === !!object[property]) {
          object[property] = object[property] ? 1 : 0 // bool to int
        }
      })
      return object
    },
    parseObjects (object_array) {
      return object_array.map(object => this.parseObject(object))
    }
  },
  watch: {
    current_grade_id: function(new_grade_id) {
      let app = this
      if (app.$route.name !== 'Evaluation') {
        return
      }

      let teachers = app.teachers.filter(teacher =>
        teacher.user_id === app.user.id &&
        teacher.grade_id === new_grade_id
      )

      if (teachers.length === 1) {
        app.current_subject_id = teachers[0].subject_id
      } else {
        app.current_subject_id = ''
      }
    },
    current_subject_id: function() {
      let app = this
      if (app.$route.name !== 'Evaluation') {
        return
      }

      app.filter_evaluations()
    }
  },
  computed: {
    activeCouncils () {
      return this.councils.filter(council =>
        new Date(council.start_date) <= new Date() && new Date(council.end_date) >= new Date()
      )
    }
  },
  created: function() {
    this.setApiUrl()
    this.setAuthData()
    this.openDB()

    if (!this.logged_in && this.$route.name !== 'Login') {
      this.logout()
      return
    }

    this.loadData()
  }
}
</script>

<style>
  .table>table>thead, .table>table>tbody>tr>td:first-child {
    background-color: #f0f0f0;
  }
  #loading {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: rgba(0, 0, 0, .7);
    color: white;
    line-height: 100vh;
    text-align: center;
    z-index: 100;
  }
  #loading>.material-icons {
    font-size: 35px;
    animation: loading 1.5s 0s infinite linear;
  }
  @keyframes loading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
</style>
