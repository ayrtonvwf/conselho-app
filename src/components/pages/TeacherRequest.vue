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
                    <option v-for="grade in grades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                  </select>
                  <label for="current_grade_id">Turma</label>
                </div>
                <div class="input col-6 col-sm-4">
                  <select id="current_subject_id" name="subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                    <option value="" selected hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                    <option v-for="subject in current_subjects" :key="subject.id" :value="subject.id" :disabled="current_teachers.find(teacher => teacher.subject_id === subject.id) || teacher_requests.find(teacher_request => teacher_request.grade_id === current_grade_id && teacher_request.subject_id === subject.id)">{{ subject.name }}</option>
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
        <table class="table" v-if="current_user_teachers.length || teacher_requests.length">
          <thead>
            <tr>
              <th>Turma</th>
              <th>Disciplina</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher_request in teacher_requests" :key="'teacher_request-'+teacher_request.id">
              <td>{{ grades.find(grade => grade.id === teacher_request.grade_id).name }}</td>
              <td>{{ subjects.find(subject => subject.id === teacher_request.subject_id).name }}</td>
              <td class="text-muted">Aguardando aprovação</td>
              <td class="text-right no-wrap">
                <a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-delete-teacher_request" title="Remover" @click="current_teacher_request_id = teacher_request.id">
                  <div class="material-icons">delete</div>
                  <span class="d-none d-md-inline">Remover</span>
                </a>
              </td>
            </tr>
            <tr v-for="teacher in current_user_teachers" :key="'teacher-'+teacher.id">
              <td>{{ grades.find(grade => grade.id === teacher.grade_id).name }}</td>
              <td>{{ subjects.find(subject => subject.id === teacher.subject_id).name }}</td>
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
      grades: [],
      subjects: [],

      grade_subjects: [],
      teacher_requests: [], // only of the current teacher
      teachers: [],

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

      let grade_subjects = this.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )

      this.current_subjects = this.subjects.filter(subject =>
        grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )

      this.current_teachers = this.teachers.filter(teacher =>
        teacher.grade_id === this.current_grade_id
      )
    }
  },
  methods: {
    teacher_request_save (event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target

      let data = {
        grade_id: this.current_grade_id,
        subject_id: this.current_subject_id,
        user_id: this.current_user_id
      }

      app.save_resource('teacher_request', data, true, false).then(teacher_request => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')

        this.teacher_requests.push(teacher_request)

        this.current_subject_id = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    teacher_request_delete() {
      this.$parent.delete_resource('teacher_request', this.current_teacher_request_id, true, false).then(() => {
        let index = this.teacher_requests.findIndex(teacher_request =>
          teacher_request.id === this.current_teacher_request_id
        )
        this.$delete(this.teacher_requests, index)
      })
    }
  },
  beforeCreate() {
    this.$emit('loading')
  },
  created: function () {
    this.grades = []
    this.subjects = []

    this.grade_subjects = []
    this.teacher_requests = []
    this.teachers = []

    this.current_user_teachers = []

    this.current_user_id = this.$parent.token.user_id
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_subjects = []
    this.current_teachers = []

    let db = this.$parent.db
    let promises = []
    promises.push(db.grades.toArray().then(grades =>
      this.grades = grades
    ))
    promises.push(db.subjects.toArray().then(subjects =>
      this.subjects = subjects
    ))

    Promise.all(promises).then(() => {
      let promises = []
      promises.push(db.grade_subjects.toArray().then(grade_subjects =>
        this.grade_subjects = grade_subjects
      ))
      promises.push(db.teacher_requests.toArray().then(teacher_requests =>
        this.teacher_requests = teacher_requests.filter(teacher_request =>
          teacher_request.user_id === this.current_user_id
        )
      ))
      promises.push(db.teachers.toArray().then(teachers =>
        this.teachers = teachers
      ))

      return Promise.all(promises)
    }).then(() => {
      this.current_user_teachers = this.teachers.filter(teacher =>
        teacher.user_id === this.current_user_id
      )
      this.$emit('loaded')
    })
  }
}
</script>
