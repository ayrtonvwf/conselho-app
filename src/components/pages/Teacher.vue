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
          <tr v-for="user in usersWhoEvaluate" :key="user.id">
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
    <modal anchor="modal-grades" :title="'Turmas de '+(current_user ? current_user.name : '')">
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
    let data = this.$parent.$data
    data.current_teacher_request_id = undefined
    data.current_teacher_id = undefined
    data.current_user_id = undefined
    data.current_user = undefined
    return data
  },
  watch: {
    current_user_id: function() { this.update_current() }
  },
  computed: {
    orderedUsers () {
      return this.users.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true }))
    },
    usersWhoEvaluate() {
      return this.orderedUsers.filter(user => this.userHasPermission('evaluate', user.id))
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
      event.preventDefault()

      let component = this
      let app = this.$parent

      app.loading = true

      let form = event.target
      let data = {
        grade_id: form.querySelector('[name=grade_id]').value,
        subject_id: form.querySelector('[name=subject_id]').value,
        user_id: form.querySelector('[name=user_id]').value,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      app.save_resource('teacher', data).then(() => {
        app.current_subject_id = ''
        app.current_grade_id = ''
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    accept_teacher_request () {
      let component = this
      let app = this.$parent

      app.loading = true

      let teacher_request = app.teacher_requests.find(teacher_request => teacher_request.id === component.current_teacher_request_id)

      let teacher = {
        user_id: teacher_request.user_id,
        grade_id: teacher_request.grade_id,
        subject_id: teacher_request.subject_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }
      app.save_resource('teacher', teacher).then(() => {
        return app.delete_resource('teacher_request', component.current_teacher_request_id)
      }).then(() => {
        app.notify('Sucesso!', 'Professor aceitado com sucesso', 'success')
      }).catch(error => {
        app.notify('Erro!', 'Não foi possível aceitar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    deny_teacher_request () {
      let component = this
      let app = this.$parent

      app.loading = true

      app.delete_resource('teacher_request', component.current_teacher_request_id).then(() => {
        app.notify('Sucesso!', 'Professor negado com sucesso', 'success')
      }).catch(error => {
        app.notify('Erro!', 'Não foi possível negar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    remove_teacher () {
      let component = this
      let app = this.$parent

      app.loading = true

      app.delete_resource('teacher', component.current_teacher_id).then(() => {
        app.notify('Sucesso!', 'Professor removido com sucesso', 'success')
      }).catch(error => {
        app.notify('Erro!', 'Não foi possível remover o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    update_current() {
      if (!this.current_user_id) {
        this.current_user = undefined
        return

      }
      this.current_user = this.users.find(user => user.id === this.current_user_id)
    }
  },
  created: function() {
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_teacher_request_id = undefined
    this.current_teacher_id = undefined
    this.current_user_id = undefined
    this.current_user = undefined
  }
}
</script>
