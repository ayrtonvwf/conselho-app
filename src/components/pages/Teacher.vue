<template>
  <div>
    <h1 class="content-title"><i class="material-icons">people</i>Professores</h1>
    <article class="box">
      <div class="box-header">Aguardando aprovação</div>
      <div class="box-body">
        <table class="table" v-if="$store.state.teacher_requests.length">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Turma</th>
            <th>Disciplina</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="teacher_request in $store.state.teacher_requests" :key="teacher_request.id">
            <td>{{ $store.state.users.find(user => user.id === teacher_request.user_id).name }}</td>
            <td>{{ $store.state.grades.find(grade => grade.id === teacher_request.grade_id).name }}</td>
            <td>{{ $store.state.subjects.find(subject => subject.id === teacher_request.subject_id).name }}</td>
            <td class="text-right no-wrap">
              <a class="btn-success btn-sm tooltip tooltip-end" href="#modal-accept" title="Aceitar professor" @click="setCurrentTeacherRequest(teacher_request.id)">
                <div class="material-icons">check</div>
                <span class="d-none d-md-inline">Aceitar professor</span>
              </a>
              <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-deny" title="Negar professor" @click="setCurrentTeacherRequest(teacher_request.id)">
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
              <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-grades" title="Turmas" @click="setCurrentUser(user.id)">
                <div class="material-icons">people</div>
                <span class="d-none d-md-inline">Turmas</span>
              </a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </article>

    <modal anchor="modal-grades" :title="'Turmas de '+currentUser.name" ref="modalGrades" @close="setCurrentUser(undefined)">
      <br>
      <form action="#" @submit.prevent="teacherSave" data-success="Professor salvo com sucesso!" data-error="Não foi possível cadastrar">
        <div class="row justify-content-center">
          <div class="col-12 col-md-9">
            <div class="row justify-content-center">
              <div class="input col-6 col-sm-4">
                <select id="current_grade_id" name="grade_id" required v-model="current_grade_id">
                  <option value="" selected hidden disabled>Selecione...</option>
                  <option v-for="grade in $store.state.grades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-6 col-sm-4">
                <select id="current_subject_id" name="subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in currentSubjects" :key="subject.id" :value="subject.id" :disabled="currentGradeTeachers.find(teacher => teacher.subject_id === subject.id)">
                    {{ subject.name }} {{ currentGradeTeachers.find(teacher => teacher.subject_id === subject.id) ? ' - '+ $store.state.users.find(user => currentGradeTeachers.find(teacher => teacher.subject_id === subject.id).user_id === user.id).name : '' }}
                  </option>
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
      <table class="table" v-if="currentUser && currentTeachers.length">
        <thead>
        <tr>
          <th>Turma</th>
          <th>Disciplina</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="teacher in currentTeachers" :key="teacher.id">
          <td>{{ $store.state.grades.find(grade => grade.id === teacher.grade_id).name }}</td>
          <td>{{ $store.state.subjects.find(subject => subject.id === teacher.subject_id).name }}</td>
          <td class="text-right">
            <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-remove" title="Remover" @click="setCurrentTeacher(teacher.id)">
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

    <prompt title="Aceitar professor" type="success" anchor="modal-accept" @accept="acceptTeacherRequest" accept="Aceitar" ref="promptAccept" @close="setCurrentTeacherRequest(undefined)">
      <p>Tem certeza que deseja aceitar este professor?</p>
    </prompt>

    <prompt title="Negar professor" type="danger" anchor="modal-deny" @accept="denyTeacherRequest" accept="Negar" ref="promptDeny" @close="setCurrentTeacherRequest(undefined)">
      <p>Tem certeza que deseja negar este professor?</p>
    </prompt>

    <prompt title="Remover professor" type="danger" anchor="modal-remove" @accept="removeTeacher" accept="Remover" ref="promptRemove" @close="setCurrentTeacher(undefined)">
      <p>Tem certeza que deseja remover este professor?</p>
    </prompt>
  </div>
</template>

<script>
/* eslint camelcase: 0 */
export default {
  name: 'Teacher',
  data () {
    return {
      current_user_id: undefined,
      current_grade_id: '',
      current_subject_id: '',

      // teacher request to be accepted or denied
      current_teacher_request_id: undefined,

      // teacher to be deleted
      current_teacher_id: undefined
    }
  },
  computed: {
    usersWhoEvaluate () {
      return this.$store.state.users.filter(user =>
        this.userHasPermission('evaluate', user.id)
      )
    },

    currentUser () {
      if (!this.current_user_id) {
        return {}
      }

      const user = this.usersWhoEvaluate.find(user =>
        user.id === this.current_user_id
      )

      return user || {}
    },

    currentTeachers () {
      if (!this.current_user_id) {
        return []
      }

      return this.$store.state.teachers.filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    },

    currentGradeSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.state.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )
    },

    currentSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.state.subjects.filter(subject =>
        this.currentGradeSubjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )
    },

    currentGradeTeachers () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.state.teachers.filter(teacher =>
        teacher.grade_id === this.current_grade_id
      )
    }
  },
  methods: {
    setCurrentUser (user_id) {
      this.current_user_id = user_id
    },

    setCurrentGrade (grade_id) {
      this.current_grade_id = grade_id
    },

    setCurrentTeacher (teacher_id) {
      this.current_teacher_id = teacher_id
    },

    setCurrentTeacherRequest (teacher_request_id) {
      this.current_teacher_request_id = teacher_request_id
    },

    roleType (user_id) {
      const role = this.$store.state.roles.find(role =>
        role.user_id === user_id &&
        parseInt(role.approved)
      )

      if (!role) {
        return {}
      }

      return this.$store.state.role_types.find(role_type =>
        role_type.id === role.role_type_id
      )
    },

    userHasPermission (permission_reference, user_id) {
      const role_type = this.roleType(user_id)

      if (!role_type.id) {
        return false
      }

      const permission = this.$store.state.permissions.find(permission =>
        permission.reference === permission_reference
      )

      return !!this.$store.state.role_type_permissions.find(role_type_permission =>
        role_type_permission.permission_id === permission.id &&
        role_type_permission.role_type_id === role_type.id
      )
    },

    teacherSave (event) {
      this.$emit('loading')

      const form = event.target

      const save_resource = {
        resource_name: 'teacher',
        data: {
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          start_date: '2018-01-01',
          end_date: '2018-12-31'
        }
      }

      this.$store.dispatch('save_resource', save_resource).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.current_subject_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    acceptTeacherRequest () {
      this.$emit('loading')

      const teacher_request = this.$store.state.teacher_requests.find(teacher_request =>
        teacher_request.id === this.current_teacher_request_id
      )

      const save_resource = {
        resource_name: 'teacher',
        data: {
          user_id: teacher_request.user_id,
          grade_id: teacher_request.grade_id,
          subject_id: teacher_request.subject_id,
          start_date: '2018-01-01',
          end_date: '2018-12-31'
        }
      }

      this.$store.dispatch('save_resource', save_resource).then(() => {
        const delete_resource = {
          resource_name: 'teacher_request',
          id: this.current_teacher_request_id
        }
        return this.$store.dispatch('delete_resource', delete_resource)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor aceitado com sucesso', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível aceitar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    denyTeacherRequest () {
      this.$emit('loading')

      const delete_resource = {
        resource_name: 'teacher_request',
        id: this.current_teacher_request_id
      }
      this.$store.dispatch('delete_resource', delete_resource).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor negado com sucesso', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível negar o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    removeTeacher () {
      this.$emit('loading')

      const delete_resource = {
        resource_name: 'teacher',
        id: this.current_teacher_id
      }
      this.$store.dispatch('delete_resource', delete_resource).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor removido com sucesso', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível remover o professor', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
        this.$refs.modalGrades.open()
      })
    }
  },
  created () {
    this.current_user_id = undefined
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_teacher_id = undefined
    this.current_teacher_request_id = undefined
  }
}
</script>
