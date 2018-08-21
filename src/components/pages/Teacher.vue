<template>
  <div>
    <h1 class="content-title"><i class="material-icons">people</i>Professores</h1>
    <article class="box">
      <div class="box-header">Aguardando aprovação</div>
      <div class="box-body">
        <table class="table" v-if="teacherRequests.length">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Turma</th>
              <th>Disciplina</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher_request in teacherRequests" :key="teacher_request.id">
              <td>{{ getUser(teacher_request.user_id).name }}</td>
              <td>{{ getGrade(teacher_request.grade_id).name }}</td>
              <td>{{ getSubject(teacher_request.subject_id).name }}</td>
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
            <tr v-for="user in orderedUsersWhoEvaluate" :key="user.id">
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
                  <option v-for="grade in orderedGrades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-6 col-sm-4">
                <select id="current_subject_id" name="subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in currentSubjects" :key="subject.id" :value="subject.id" :disabled="currentGradeTeachers.find(teacher => teacher.subject_id === subject.id)">
                    {{ subject.name }} {{ currentGradeTeachers.find(teacher => teacher.subject_id === subject.id) ? ' - '+ getUser(currentGradeTeachers.find(teacher => teacher.subject_id === subject.id).user_id).name : '' }}
                  </option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
              <div class="col-12 col-sm-3"><br class="d-none d-sm-inline">
                <button class="btn-success" type="submit">
                  <span class="material-icons">check</span> Salvar
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
            <td>{{ getGrade(teacher.grade_id).name }}</td>
            <td>{{ getSubject(teacher.subject_id).name }}</td>
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
      <p>Tem certeza que deseja desvincular este professor desta turma e disciplina?</p>
    </prompt>
  </div>
</template>

<script>
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
    orderedGrades () {
      return this.$store.getters['grades/getOrderedGrades']
    },

    teacherRequests () {
      return this.$store.getters['teacher_requests/getTeacherRequests']
    },

    orderedUsersWhoEvaluate () {
      return this.$store.getters['users/getOrderedUsers'].filter(user =>
        this.userHasPermission('evaluate', user.id)
      )
    },

    currentUser () {
      if (!this.current_user_id) {
        return {}
      }

      const user = this.orderedUsersWhoEvaluate.find(user =>
        user.id === this.current_user_id
      )

      return user || {}
    },

    currentTeachers () {
      if (!this.current_user_id) {
        return []
      }

      return this.$store.getters['teachers/getTeachers'].filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    },

    currentGradeSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['grade_subjects/getGradeSubjects'].filter(gradeSubject =>
        gradeSubject.grade_id === this.current_grade_id
      )
    },

    currentSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['subjects/getOrderedSubjects'].filter(subject =>
        this.currentGradeSubjects.find(gradeSubject =>
          gradeSubject.subject_id === subject.id
        )
      )
    },

    currentGradeTeachers () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['teachers/getTeachers'].filter(teacher =>
        teacher.grade_id === this.current_grade_id
      )
    }
  },
  methods: {
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

    setCurrentUser (userId) {
      this.current_user_id = userId
    },

    setCurrentGrade (gradeId) {
      this.current_grade_id = gradeId
    },

    setCurrentTeacher (teacherId) {
      this.current_teacher_id = teacherId
    },

    setCurrentTeacherRequest (teacherRequestId) {
      this.current_teacher_request_id = teacherRequestId
    },

    roleType (userId) {
      const role = this.$store.getters['roles/getRoles'].find(role =>
        role.user_id === userId &&
        parseInt(role.approved)
      )

      if (!role) {
        return {}
      }

      return this.$store.getters['role_types/getRoleTypes'].find(roleType =>
        roleType.id === role.role_type_id
      )
    },

    userHasPermission (permissionReference, userId) {
      const roleType = this.roleType(userId)

      if (!roleType.id) {
        return false
      }

      const permission = this.$store.getters['permissions/getPermissions'].find(permission =>
        permission.reference === permissionReference
      )

      return !!this.$store.getters['role_type_permissions/getRoleTypePermissions'].find(roleTypePermission =>
        roleTypePermission.permission_id === permission.id &&
        roleTypePermission.role_type_id === roleType.id
      )
    },

    teacherSave () {
      this.$emit('loading')

      const teacher = {
        grade_id: this.current_grade_id,
        subject_id: this.current_subject_id,
        user_id: this.current_user_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      this.$store.dispatch('teachers/create', teacher).then(() => {
        this.$emit('notify', 'Sucesso!', 'Professor vinculado à turma e à disciplina com sucesso!', 'success')
        this.current_subject_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível desvincular o professor.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    acceptTeacherRequest () {
      this.$emit('loading')

      const teacherRequest = this.teacherRequests.find(teacherRequest =>
        teacherRequest.id === this.current_teacher_request_id
      )

      const teacher = {
        user_id: teacherRequest.user_id,
        grade_id: teacherRequest.grade_id,
        subject_id: teacherRequest.subject_id,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      this.$store.dispatch('teachers/create', teacher).then(() => {
        return this.$store.dispatch('teacher_requests/delete', this.current_teacher_request_id)
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

      this.$store.dispatch('teacher_requests/delete', this.current_teacher_request_id).then(() => {
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

      this.$store.dispatch('teachers/delete', this.current_teacher_id).then(() => {
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
