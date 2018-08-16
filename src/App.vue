<style scoped>
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

<template>
  <div id="app">
    <form id="form-valid-support-helper">
      <input required>
    </form>
    <header class="header">
      <router-link class="header-button main-button" :to="{ name: 'Index' }">Conselho</router-link>
      <template v-if="$store.state.logged_in">
        <a class="header-button menu-toggle material-icons" href="#menu" v-if="$store.state.logged_in">menu</a>
        <button class="header-button material-icons" type="button" @click="sync">sync</button>

        <div class="header-pane" v-if="userHasPermission('role')">
          <button class="header-button material-icons" type="button">
            notifications
            <span class="header-button-label-red" v-if="$store.state.teacher_requests.length">{{ $store.state.teacher_requests.length }}</span>
          </button>
          <div class="header-pane-popup">
            <div class="header-pane-header"><i class="material-icons">notifications</i>Notificações</div>
            <div class="header-pane-body">
              <div v-for="(teacher_request, index) in $store.state.teacher_requests" :key="teacher_request.id">
                <hr class="margin-h-15" v-if="index">
                <router-link class="no-link" :to="{ name: 'Teacher' }">
                  <div class="header-notification-title"><b>{{ $store.state.users.find(user => user.id === teacher_request.user_id).name }}</b> aguarda sua aprovação</div>
                  <div class="header-notification-description">{{ $store.state.grades.find(grade => grade.id === teacher_request.grade_id).name }} - {{ $store.state.subjects.find(subject => subject.id === teacher_request.subject_id).name }}
                    <div class="text-muted">{{ new Date(teacher_request.created_at).toLocaleDateString('pt-BR') }}</div>
                  </div>
                </router-link>
              </div>
              <div class="text-center text-muted" v-if="!$store.state.teacher_requests.length"><br><br>
                <div class="h5">Não há notificações</div><br><br>
              </div>
            </div>
          </div>
        </div>

        <div class="header-pane">
          <button class="header-button" type="button">{{ currentUser ? currentUser.name : ''}}</button>
          <div class="header-pane-popup">
            <div class="header-pane-body text-center bg-primary text-white"><br>
              <div class="text-80"><i class="material-icons user-icon">account_circle</i></div>
              <div class="text-20">{{ currentUser ? currentUser.name : ''}}</div><br><br>
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
      <nav class="menu" id="menu" v-if="$store.state.logged_in">
        <a class="menu-close header-button material-icons" :href="'#'+$route.path">menu</a>
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
        <router-view @notify="notify" @loading="loading = true" @loaded="loading = false"></router-view>
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

// import Dexie from 'dexie'

export default {
  name: 'App',
  data() {
    return {
      notification: {},
      loading: true
    }
  },
  computed: {
    currentUser() {
      let user = this.$store.state.users.find(user =>
        user.id === this.$store.state.token.user_id
      )
      return user ? user : {}
    },
    currentRole() {
      let role = this.$store.state.roles.find(role =>
        role.user_id === this.$store.state.token.user_id
      )
      return role ? role : {}
    },
    currentRoleType() {
      let role_type = this.$store.state.role_types.find(role_type =>
        role_type.id === this.currentRole.role_type_id
      )
      return role_type ? role_type : {}
    },
    currentRoleTypePermissions() {
      return this.$store.state.role_type_permissions.filter(role_type_permission =>
        role_type_permission.role_type_id === this.currentRoleType.id
      )
    },
    currentPermissions() {
      return this.$store.state.permissions.filter(permission =>
        this.currentRoleTypePermissions.find(role_type_permission =>
          role_type_permission.permission_id === permission.id
        )
      )
    },
    activeCouncils() {
      return this.$store.state.councils.filter(council =>
        council.active &&
        new Date(council.start_date) <= new Date() &&
        new Date(council.end_date) >= new Date()
      )
    }
  },
  methods: {
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

    logout() {
      this.loading = true
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/login')
        this.loading = false
      })
    },

    userHasPermission (permission_reference) {
      if (!this.currentUser) {
        return false
      }

      return !!this.currentPermissions.find(permission =>
        permission.reference === permission_reference
      )
    },

    sync() {
      this.loading = true

      this.$store.dispatch('loadFromAPI').then(() =>
        this.$store.dispatch('loadData')
      ).catch(error => {
        this.notify('Erro', 'Ocorreu um erro durante a atualização. Tente novamente!', 'danger')
        console.log(error)
      }).finally(() =>
        this.loading = false
      )
    }
  },
  created() {
    this.$store.commit('checkAuth')

    if (!this.$store.state.logged_in && this.$route.name !== 'Login') {
      this.logout()
      return
    }

    if (this.$route.name === 'Login') {
      this.loading = false
      return
    }


    this.$store.dispatch('loadData').then(() =>
      this.loading = false
    )
  }
}
</script>
