<style scoped>
  #loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, .7);
    color: white;
    line-height: 100vh;
    text-align: center;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s;
  }
  #loading.show {
    opacity: 1;
    pointer-events: all;
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
  @media print {
    .header, .menu {
      display: none !important;
    }
    .content {
      padding: 0;
    }
    .table {
      overflow: initial;
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
            <span class="header-button-label-red" v-if="teacherRequests.length">{{ teacherRequests.length }}</span>
          </button>
          <div class="header-pane-popup">
            <div class="header-pane-header"><i class="material-icons">notifications</i>Notificações</div>
            <div class="header-pane-body">
              <div v-for="(teacher_request, index) in teacherRequests" :key="teacher_request.id">
                <hr class="margin-h-15" v-if="index">
                <router-link class="no-link" :to="{ name: 'Teacher' }">
                  <div class="header-notification-title"><b>{{ getUser(teacher_request.user_id).name }}</b> aguarda sua aprovação</div>
                  <div class="header-notification-description">{{ getGrade(teacher_request.grade_id).name }} - {{ getSubject(teacher_request.subject_id).name }}
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
        <router-link class="menu-link" :to="{ name: 'Student' }" v-if="userHasPermission('student')" active-class="menu-active">
          <i class="material-icons">person</i> Estudantes
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
        <button class="menu-link" v-if="installPromptEvent" @click="install">
          <i class="material-icons">cloud_download</i> Instalar
        </button>
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
    <div id="loading" :class="loading ? 'show' : ''">
      <div class="material-icons">sync</div>
      <button class="btn-default btn-sm" type="button" @click="logout" style="position: absolute; right: 20px; bottom: 20px">Sair</button>
    </div>
  </div>
</template>

<style src="../node_modules/lite-admin/dist/style.css" type="text/css"></style>
<style src="../node_modules/material-design-icons/iconfont/material-icons.css" type="text/css"></style>

<script>
export default {
  name: 'App',
  data () {
    return {
      installPromptEvent: undefined,
      notification: {},
      loading: true
    }
  },
  computed: {
    teacherRequests () {
      return this.$store.getters['teacher_requests/getTeacherRequests']
    },

    currentUser () {
      const user = this.$store.getters['users/getUsers'].find(user =>
        user.id === this.$store.state.token.user_id
      )
      return user || {}
    },

    currentRole () {
      const role = this.$store.getters['roles/getRoles'].find(role =>
        role.user_id === this.$store.state.token.user_id
      )
      return role || {}
    },

    currentRoleType () {
      const roleType = this.$store.getters['role_types/getRoleTypes'].find(roleType =>
        roleType.id === this.currentRole.role_type_id
      )
      return roleType || {}
    },

    currentRoleTypePermissions () {
      return this.$store.getters['role_type_permissions/getRoleTypePermissions'].filter(roleTypePermission =>
        roleTypePermission.role_type_id === this.currentRoleType.id
      )
    },

    currentPermissions () {
      return this.$store.getters['permissions/getPermissions'].filter(permission =>
        this.currentRoleTypePermissions.find(roleTypePermission =>
          roleTypePermission.permission_id === permission.id
        )
      )
    },

    activeCouncils () {
      return this.$store.getters['councils/getOrderedCouncils'].filter(council =>
        council.active &&
        new Date(council.start_date) <= new Date() &&
        new Date(council.end_date) >= new Date()
      )
    }
  },
  methods: {
    install () {
      this.installPromptEvent.prompt()
      // Wait for the user to respond to the prompt
      this.installPromptEvent.userChoice.then(choice => {
        console.log(choice)
        if (choice.outcome !== 'accepted') {
          this.notify(':(', 'Aplicativo não instalado!', 'error')
          return
        }
        window.addEventListener('appinstalled', event => {
          this.notify('Instalado!', 'Aplicativo instalado com sucesso!', 'success')
          this.installPromptEvent = undefined
        })
      })
    },

    getUser (userId) {
      return this.$store.getters['users/getUsers'].find(user =>
        user.id === userId
      )
    },

    getGrade (gradeId) {
      return this.$store.getters['grades/getGrades'].find(grade =>
        grade.id === gradeId
      )
    },

    getSubject (subjectId) {
      return this.$store.getters['subjects/getSubjects'].find(subject =>
        subject.id === subjectId
      )
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

      const timestamp = Date.now().toString()

      document.getElementById('no-notification').checked = true

      // it there's already a notification, delay to transition
      const startDelay = Object.keys(this.notification).length > 0 ? 500 : 0

      setTimeout(() => {
        this.notification = {
          style: style,
          icon: icon,
          title: title,
          message: message,
          timestamp: timestamp
        }

        document.getElementById('notification-shown').checked = true

        setTimeout(() => {
          if (this.notification.timestamp !== timestamp) {
            return
          }

          document.getElementById('no-notification').checked = true

          setTimeout(() => { // delay to transition
            if (this.notification.timestamp !== timestamp) {
              return
            }

            this.notification = {}
          }, 500)
        }, time)
      }, startDelay)
    },

    logout () {
      this.loading = true
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/login')
        this.loading = false
      })
    },

    userHasPermission (permissionReference) {
      if (!this.currentUser) {
        return false
      }

      return !!this.currentPermissions.find(permission =>
        permission.reference === permissionReference
      )
    },

    sync () {
      this.loading = true

      this.$store.dispatch('loadFromAPI').then(() =>
        this.$store.dispatch('loadData')
      ).catch(error => {
        if (error.status && error.status === 401) {
          this.notify('Não foi possível atualizar', 'Tente sair e entrar novamente', 'danger')
        } else {
          this.notify('Não foi possível atualizar', 'Ocorreu um erro durante a atualização. Tente novamente', 'danger')
        }
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    },

    load () {
      const required = [
        'teacher_requests',
        'users',
        'councils',
        'roles',
        'role_types',
        'role_type_permissions',
        'permissions'
      ]

      const promises = required.map(module =>
        this.$store.dispatch(module + '/loadFromDb', true)
      )

      return Promise.all(promises)
    }
  },
  created () {
    if (!window.matchMedia('(display-mode: standalone)').matches && window.navigator.standalone === false) {
      window.addEventListener('beforeinstallprompt', event => {
        // Prevent Chrome <= 67 from automatically showing the prompt
        event.preventDefault()
        // Stash the event so it can be triggered later.
        this.installPromptEvent = event
      })
    }

    this.$store.commit('checkAuth')

    if (!this.$store.state.logged_in && this.$route.name !== 'Login') {
      this.logout()
      return
    }

    if (!this.$store.state.logged_in) {
      this.loading = false
      return
    }

    this.load().then(() => {
      this.loading = false
    })
  }
}
</script>
