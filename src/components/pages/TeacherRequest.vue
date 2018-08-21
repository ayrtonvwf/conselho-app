<template>
  <div>
    <h1 class="content-title"><i class="material-icons">people</i>Turmas</h1>
    <article class="box">
      <div class="box-body"><br>
        <form action="#" @submit.prevent="teacherRequestSave" data-success="Aguardando a aprovação do supervisor!" data-error="Não foi possível cadastrar">
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
                    <option v-for="subject in currentSubjects" :key="subject.id" :value="subject.id" :disabled="currentTeachers.find(teacher => teacher.subject_id === subject.id) || currentGradeTeacherRequests.find(teacher_request => teacher_request.subject_id === subject.id)">{{ subject.name }}</option>
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
        <table class="table" v-if="currentUserTeachers.length || currentTeacherRequests.length">
          <thead>
            <tr>
              <th>Turma</th>
              <th>Disciplina</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher_request in currentTeacherRequests" :key="'teacher_request-'+teacher_request.id">
              <td>{{ getGrade(teacher_request.grade_id).name }}</td>
              <td>{{ getSubject(teacher_request.subject_id).name }}</td>
              <td class="text-muted">Aguardando aprovação</td>
              <td class="text-right no-wrap">
                <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-delete-teacher_request" title="Remover" @click="setCurrentTeacherRequest(teacher_request.id)">
                  <div class="material-icons">delete</div>
                  <span class="d-none d-md-inline">Remover</span>
                </a>
              </td>
            </tr>
            <tr v-for="teacher in currentUserTeachers" :key="'teacher-'+teacher.id">
              <td>{{ getGrade(teacher.grade_id).name }}</td>
              <td>{{ getSubject(teacher.subject_id).name }}</td>
              <td></td>
              <td class="text-right no-wrap">
                <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-delete-teacher" title="Remover">
                  <div class="material-icons">delete</div>
                  <span class="d-none d-md-inline">Remover</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Você ainda não está vinculado à nenhuma turma.</div>
          <p>Selecione uma turma e uma disciplina e clique em <b>salvar</b> para poder avaliar.</p><br>
        </div>
      </div>
    </article>

    <prompt title="Fale com o supervisor" type="danger" anchor="modal-delete-teacher">
      <p>Você não pode se desvincular desta turma, pois já recebeu a aprovação do supervisor.</p>
      <p>Caso seja realmente necessário, solicite ao supervisor que te desvincule.</p>
    </prompt>

    <prompt title="Remover solicitação" type="danger" anchor="modal-delete-teacher_request" @accept="teacherRequestDelete" accept="Remover" @close="setCurrentTeacherRequest(undefined)">
      <p>Tem certeza que deseja remover esta solicitação?</p>
    </prompt>
  </div>
</template>

<script>
export default {
  name: 'TeacherRequest',
  data () {
    return {
      current_user_id: undefined,
      current_grade_id: '',
      current_subject_id: ''
    }
  },
  computed: {
    orderedGrades () {
      return this.$store.getters['grades/getOrderedGrades']
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

    currentTeachers () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['teachers/getTeachers'].filter(teacher =>
        teacher.grade_id === this.current_grade_id
      )
    },

    currentTeacherRequests () {
      return this.$store.getters['teacher_requests/getTeacherRequests'].filter(teacherRequest =>
        teacherRequest.user_id === this.current_user_id
      )
    },

    currentGradeTeacherRequests () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentTeacherRequests.filter(teacherRequest =>
        teacherRequest.grade_id === this.current_grade_id
      )
    },

    currentUserTeachers () {
      return this.$store.getters['teachers/getTeachers'].filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    }
  },
  methods: {
    setCurrentTeacherRequest (teacherRequestId) {
      this.current_teacher_request_id = teacherRequestId
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

    teacherRequestSave () {
      this.$emit('loading')

      const teacherRequest = {
        grade_id: this.current_grade_id,
        subject_id: this.current_subject_id,
        user_id: this.current_user_id
      }
      this.$store.dispatch('teacher_requests/create', teacherRequest).then(() => {
        this.$emit('notify', 'Sucesso!', 'Requisição criada com sucesso!', 'success')
        this.current_subject_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível criar a requisição.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    teacherRequestDelete () {
      this.$emit('loading')

      this.$store.dispatch('teacher_requests/delete', this.current_teacher_request_id).then(() => {
        this.$emit('notify', 'Sucesso!', 'Requisição excluída com sucesso.', 'success')
      }).finally(() =>
        this.$emit('loaded')
      )
    }
  },
  created () {
    this.current_user_id = this.$store.state.token.user_id
    this.current_grade_id = ''
    this.current_subject_id = ''
  }
}
</script>
