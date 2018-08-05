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
                    <option v-for="subject in subjects" :key="subject.id" v-if="current_grade_id && grade_subjects.find(grade_subject => grade_subject.subject_id === subject.id && grade_subject.grade_id === current_grade_id) !== undefined" :value="subject.id" :disabled="teachers.find(teacher => teacher.grade_id === current_grade_id && teacher.subject_id === subject.id) !== undefined">{{ subject.name }}</option>
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
        <table class="table" v-if="teachers.find(teacher => teacher.user_id === user.id) !== undefined || teacher_requests.find(teacher_request => teacher_request.user_id === user_id) !== undefined">
          <thead>
          <tr>
            <th>Turma</th>
            <th>Disciplina</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="teacher_request in teacher_requests" :key="teacher_request.id" v-if="teacher_request.user_id === user.id">
            <td>{{ grades.find(grade => grade.id === teacher_request.grade_id).name }}</td>
            <td>{{ subjects.find(subject => subject.id === teacher_request.subject_id).name }}</td>
            <td class="text-muted">Aguardando aprovação</td>
            <td class="text-right no-wrap"><a class="btn-danger btn-sm tooltip tooltip-end" :href="'#modal-delete-teacher_request-'+teacher_request.id" title="Remover">
              <div class="material-icons">delete</div><span class="d-none d-md-inline"> Remover</span></a></td>
          </tr>
          <tr v-for="teacher in teachers" :key="teacher.id" v-if="teacher.user_id === user.id">
            <td>{{ grades.find(grade => grade.id === teacher.grade_id).name }}</td>
            <td>{{ subjects.find(subject => subject.id === teacher.subject_id).name }}</td>
            <td></td>
            <td class="text-right no-wrap"><a class="btn-danger btn-sm tooltip tooltip-end" href="#modal-delete-teacher" title="Remover">
              <div class="material-icons">delete</div><span class="d-none d-md-inline"> Remover</span></a></td>
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

    <prompt v-for="teacher_request in teacher_requests" :key="teacher_request.id" title="Remover solicitação" type="danger" :anchor="'modal-delete-teacher_request-'+teacher_request.id" @accept="teacher_request_delete(teacher_request.id)" accept="Remover">
      <p>Tem certeza que deseja remover esta solicitação?</p>
    </prompt>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'TeacherRequest',
  data: function() {
    return this.$parent.$data
  },
  methods: {
    teacher_request_save (event) {
      event.preventDefault()

      let app = this.$parent

      app.loading = true

      let form = event.target
      let data = {
        grade_id: form.querySelector('[name=grade_id]').value,
        subject_id: form.querySelector('[name=subject_id]').value,
        user_id: app.user.id
      }

      app.save_resource('teacher_request', data).then(() => {
        app.loading = false
        app.current_grade_id = ''
        app.current_subject_id = ''
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.loading = false
        console.log('Error:', error)
        app.notify('Erro!', form.dataset.error, 'danger')
      })
    },
    teacher_request_delete (teacher_request_id) {
      this.$parent.delete_resource('teacher_request', teacher_request_id)
    }
  },
  created: function () {
    this.current_grade_id = ''
    this.current_subject_id = ''
  }
}
</script>
