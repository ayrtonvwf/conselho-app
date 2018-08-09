<template>
  <div>
    <h1 class="content-title"><i class="material-icons">people</i>Professores</h1>
    <article class="box">
      <div class="box-header">Aguardando aprovação</div>
      <div class="box-body">
        <table class="table" v-if="teacher_requests.length">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Turma</th>
            <th>Disciplina</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="teacher_request in teacher_requests" :key="teacher_request.id">
            <td>{{ users.find(user => user.id === teacher_request.user_id).name }}</td>
            <td>{{ grades.find(grade => grade.id === teacher_request.grade_id).name }}</td>
            <td>{{ subjects.find(subject => subject.id === teacher_request.subject_id).name }}</td>
            <td class="text-right no-wrap">
              <a class="btn-success btn-sm tooltip tooltip-end" href="#modal-accept" title="Aceitar professor" @click="current_teacher_request_id = teacher_request.id">
                <div class="material-icons">check</div>
                <span class="d-none d-md-inline">Aceitar professor</span>
              </a>
              <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-deny" title="Negar professor" @click="current_teacher_request_id = teacher_request.id">
                <div class="material-icons">close</div>
                <span class="d-none d-md-inline">Negar professor</span>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Nenhum professor esperando aprovação</div><br>
        </div>
      </div>
    </article>
    <article class="box">
      <div class="box-header">Todos</div>
      <div class="box-body">
        <table class="table">
          <thead>
          <tr>
            <th>Nome</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td class="text-right no-wrap">
              <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-grades" title="Turmas" @click="current_user_id = user.id">
                <div class="material-icons">people</div>
                <span class="d-none d-md-inline">Turmas</span>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </article>
    <modal anchor="modal-grades" :title="'Turmas de '+current_user.name">
      <br>
      <form action="#" @submit.prevent="teacher_save" data-success="Professor salvo com sucesso!" data-error="Não foi possível cadastrar">
        <input type="hidden" name="user_id" :value="current_user_id">
        <div class="row justify-content-center">
          <div class="col-12 col-md-9">
            <div class="row justify-content-center">
              <div class="input col-6 col-sm-4">
                <select id="current_grade_id" name="grade_id" required v-model="current_grade_id">
                  <option value="" selected hidden disabled>Selecione...</option>
                  <option v-for="grade in grades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-6 col-sm-4">
                <select id="current_subject_id" name="subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in subjects" :key="subject.id" v-if="current_grade_id && grade_subjects.find(grade_subject => grade_subject.subject_id === subject.id && grade_subject.grade_id === current_grade_id) !== undefined" :value="subject.id" :disabled="teachers.find(teacher => teacher.grade_id === current_grade_id && teacher.subject_id === subject.id) !== undefined">{{ subject.name }} {{ teachers.find(teacher => teacher.grade_id === current_grade_id && teacher.subject_id === subject.id) !== undefined ? ' - '+users.find(user => teachers.find(teacher => teacher.grade_id === current_grade_id && teacher.subject_id === subject.id).user_id === user.id).name : '' }}</option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
              <div class="col-12 col-sm-3"><br class="d-none d-sm-inline">
                <button class="btn-success" type="submit">
                  <div class="material-icons">check</div> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form><br>
      <table class="table" v-if="current_user && teachers.find(teacher => teacher.user_id === current_user.id)">
        <thead>
        <tr>
          <th>Turma</th>
          <th>Disciplina</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="teacher in teachers" v-if="teacher.user_id === current_user.id" :key="teacher.id">
          <td>{{ grades.find(grade => grade.id === teacher.grade_id).name }}</td>
          <td>{{ subjects.find(subject => subject.id === teacher.subject_id).name }}</td>
          <td class="text-right">
            <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-remove" title="Remover" @click="current_teacher_id = teacher.id">
              <div class="material-icons">delete</div>
              <span class="d-none d-md-inline">Remover</span>
            </a>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="text-center text-muted" v-else><br>
        <div class="h4">Nenhuma turma aprovada</div><br>
      </div>
    </modal>

    <prompt title="Aceitar professor" type="success" anchor="modal-accept" @accept="accept_teacher_request" accept="Aceitar">
      <p>Tem certeza que deseja aceitar este professor?</p>
    </prompt>

    <prompt title="Negar professor" type="danger" anchor="modal-deny" @accept="deny_teacher_request" accept="Negar">
      <p>Tem certeza que deseja negar este professor?</p>
    </prompt>

    <prompt title="Remover professor" type="danger" anchor="modal-remove" @accept="remove_teacher" accept="Remover">
      <p>Tem certeza que deseja remover este professor?</p>
    </prompt>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Teacher',
  data: function() {
    return {
      users: [],
      permissions: [],
      role_types: [],
      subjects: [],
      grades: [],

      roles: [],
      teachers: [],
      teacher_requests: [],
      grade_subjects: [],
      role_type_permissions: [],

      current_user_id: undefined,
      current_user: {},
      current_teachers: [],

      current_grade_id: '',
      current_subject_id: '',
      current_subjects: [],

      current_teacher_request_id: undefined, // teacher request to be accepted or denied
      current_teacher_id: undefined // teacher to be deleted
    }
  },
  watch: {
    current_user_id() {
      this.current_subjects = []
      this.current_grade_id = ''
      this.current_subject_id = ''

      if (!this.current_user_id) {
        this.current_user = {}
        this.current_teachers = []
        return
      }

      this.current_user = this.users.find(user =>
        user.id === this.current_user_id
      )

      this.current_teachers = this.teachers.filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    },
    current_grade_id() {
      this.current_subjects = []
      this.current_subject_id = ''

      if (!this.current_grade_id) {
        return
      }

      let grade_subjects = this.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )

      grade_subjects.forEach(grade_subject => {
        let subject = this.subjects.find(subject =>
          subject.id === grade_subject.subject_id
        )
        this.current_subjects.push(subject)
      })
    }
  },
  methods: {
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
    teacher_save (event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target
      let teacher = {
        grade_id: this.current_grade_id,
        subject_id: this.current_subject_id,
        user_id: this.current_user_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      app.save_resource('teacher', teacher, true, false).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        this.teachers.push(teacher)
        this.current_teachers.push(teacher)

        this.current_subject_id = ''
        this.current_grade_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    accept_teacher_request () {
      this.$emit('loading')

      let app = this.$parent

      let teacher_request = app.teacher_requests.find(teacher_request =>
        teacher_request.id === this.current_teacher_request_id
      )

      let teacher = {
        user_id: teacher_request.user_id,
        grade_id: teacher_request.grade_id,
        subject_id: teacher_request.subject_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      app.save_resource('teacher', teacher, true, false).then(() => {
        this.teachers.push(teacher)
        return app.delete_resource('teacher_request', this.current_teacher_request_id, false, false)
      }).then(() =>
        app.loadData()
      ).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor aceitado com sucesso', 'success')

        let index = this.teacher_requests.findIndex(teacher_request =>
          teacher_request.id === this.current_teacher_request_id
        )
        this.$delete(this.teacher_requests, index)
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível aceitar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    deny_teacher_request () {
      this.$emit('loading')

      let app = this.$parent

      app.delete_resource('teacher_request', this.current_teacher_request_id, false, false).then(() =>
        app.loadData()
      ).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor negado com sucesso', 'success')

        let index = this.teacher_requests.findIndex(teacher_request =>
          teacher_request.id === this.current_teacher_request_id
        )
        this.$delete(this.teacher_requests, index)
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível negar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    remove_teacher () {
      this.$emit('loading')

      let app = this.$parent

      app.delete_resource('teacher', this.current_teacher_id, false, false).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor removido com sucesso', 'success')

        let index = this.teachers.findIndex(teacher =>
          teacher.id === this.current_teacher_id
        )
        this.$delete(this.teachers, index)

        let current_index = this.current_teachers.findIndex(teacher =>
          teacher.id === this.current_teacher_id
        )
        this.$delete(this.current_teachers, current_index)
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível remover o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  beforeCreate() {
    this.$emit('loading')
  },
  created: function() {
    this.users = []
    this.role_types = []
    this.subjects = []
    this.grades = []
    this.permissions = []
    this.role_type_permissions = []

    this.roles = []
    this.teachers = []
    this.teacher_requests = []
    this.grade_subjects = []

    this.current_subjects = []
    this.current_teachers = []
    this.current_grade_id = ''
    this.current_teacher_request_id = undefined
    this.current_teacher_id = undefined
    this.current_user_id = undefined
    this.current_subject_id = ''
    this.current_user = {}

    let db = this.$parent.db
    let promises = []
    promises.push(db.permissions.toArray().then(permissions =>
      this.permissions = permissions
    ))
    promises.push(db.users.toArray().then(users =>
      this.users = users
    ))
    promises.push(db.role_types.toArray().then(role_types =>
      this.role_types = role_types
    ))
    promises.push(db.subjects.toArray().then(subjects =>
      this.subjects = subjects.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )
    ))
    promises.push(db.grades.toArray().then(grades =>
      this.grades = grades.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )
    ))

    Promise.all(promises).then(() => {
      let promises = []
      promises.push(db.roles.toArray().then(roles =>
        this.roles = roles
      ))
      promises.push(db.role_type_permissions.toArray().then(role_type_permissions =>
        this.role_type_permissions = role_type_permissions
      ))
      promises.push(db.teachers.toArray().then(teachers =>
        this.teachers = teachers
      ))
      promises.push(db.teacher_requests.toArray().then(teacher_requests =>
        this.teacher_requests = teacher_requests
      ))
      promises.push(db.grade_subjects.toArray().then(grade_subjects =>
        this.grade_subjects = grade_subjects
      ))

      return Promise.all(promises)
    }).then(() => {
      this.users = this.users.filter(user =>
        this.userHasPermission('evaluate', user.id)
      ).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )

      this.$emit('loaded')
    })
  }
}
</script>
