<template>
  <div>
    <h1 class="content-title"><i class="material-icons">people</i>Turmas</h1>
    <article class="box">
      <div class="box-body"><br>
        <form action="#" @submit.prevent="teacher_request_save" data-success="Aguardando a aprovação do supervisor!" data-error="Não foi possível cadastrar">
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
                    <option v-for="subject in current_subjects" :key="subject.id" :value="subject.id" :disabled="current_teachers.find(teacher => teacher.subject_id === subject.id) || current_teacher_requests.find(teacher_request => teacher_request.grade_id === current_grade_id && teacher_request.subject_id === subject.id)">{{ subject.name }}</option>
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
        <table class="table" v-if="current_user_teachers.length || current_teacher_requests.length">
          <thead>
            <tr>
              <th>Turma</th>
              <th>Disciplina</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher_request in current_teacher_requests" :key="'teacher_request-'+teacher_request.id">
              <td>{{ $store.state.grades.find(grade => grade.id === teacher_request.grade_id).name }}</td>
              <td>{{ $store.state.subjects.find(subject => subject.id === teacher_request.subject_id).name }}</td>
              <td class="text-muted">Aguardando aprovação</td>
              <td class="text-right no-wrap">
                <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-delete-teacher_request" title="Remover" @click="current_teacher_request_id = teacher_request.id">
                  <div class="material-icons">delete</div>
                  <span class="d-none d-md-inline">Remover</span>
                </a>
              </td>
            </tr>
            <tr v-for="teacher in current_user_teachers" :key="'teacher-'+teacher.id">
              <td>{{ $store.state.grades.find(grade => grade.id === teacher.grade_id).name }}</td>
              <td>{{ $store.state.subjects.find(subject => subject.id === teacher.subject_id).name }}</td>
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

    <prompt title="Remover solicitação" type="danger" anchor="modal-delete-teacher_request" @accept="teacher_request_delete" accept="Remover">
      <p>Tem certeza que deseja remover esta solicitação?</p>
    </prompt>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'TeacherRequest',
  data: function() {
    return {
      current_teacher_requests: [],
      current_user_teachers: [],
      current_user_id: undefined,
      current_grade_id: '',
      current_subject_id: '',
      current_subjects: [],
      current_teachers: []
    }
  },
  watch: {
    current_grade_id() {
      if (!this.current_grade_id) {
        this.current_subject_id = ''
        this.current_subjects = []
        this.current_teachers = []
        return
      }

      let grade_subjects = this.$store.state.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )

      this.current_subjects = this.$store.state.subjects.filter(subject =>
        grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )

      this.current_teachers = this.$store.state.teachers.filter(teacher =>
        teacher.grade_id === this.current_grade_id
      )
    }
  },
  methods: {
    teacher_request_save (event) {
      this.$emit('loading')

      let form = event.target

      let save_resource = {
        resource_name: 'teacher_request',
        data: {
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id
        }
      }
      this.$store.dispatch('save_resource', save_resource).then(teacher_request => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        this.current_teacher_requests.push(teacher_request)

        this.current_subject_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    teacher_request_delete() {
      this.$emit('loading')

      let delete_resource = {
        resource_name: 'teacher_request',
        id: this.current_teacher_request_id
      }
      this.$store.dispatch('delete_resource', delete_resource).then(() => {
        this.$emit('notify', 'Sucesso!', 'Desvinculado da turma com sucesso.', 'success')

        let index = this.current_teacher_requests.findIndex(teacher_request =>
          teacher_request.id === this.current_teacher_request_id
        )
        this.$delete(this.current_teacher_requests, index)
      }).finally(() =>
        this.$emit('loaded')
      )
    }
  },
  created: function () {
    this.current_user_id = this.$store.state.token.user_id
    this.current_teacher_requests = this.$store.state.teacher_requests.filter(teacher_request =>
      teacher_request.user_id === this.current_user_id
    )
    this.current_user_teachers = this.$store.state.teachers.filter(teacher =>
      teacher.user_id === this.current_user_id
    )
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_subjects = []
    this.current_teachers = []
  }
}
</script>
