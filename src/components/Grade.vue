<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">people</i>Turma</h1>
      </div>
      <div class="col text-right">
        <a class="btn-success btn-sm no-wrap" href="#modal-new">
          <div class="material-icons">add</div>
          Criar nova turma
        </a>
      </div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="grades.length">
          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in grades" :key="grade.id">
              <td :class="!parseInt(grade.active) ? 'text-muted' : ''">
                {{ grade.name }}
                <span class="text-muted" v-if="!parseInt(grade.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-students" title="Estudantes" @click="current_grade_id = grade.id">
                  <div class="material-icons">person</div>
                  <span class="d-none d-md-inline">Estudantes</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-subjects" title="Disciplinas" @click="current_grade_id = grade.id">
                  <div class="material-icons">book</div>
                  <span class="d-none d-md-inline">Disciplinas</span>
                </a>
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações da turma" @click="current_grade_id = grade.id">
                  <div class="material-icons">edit</div>
                  <span class="d-none d-md-inline">Editar</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center text-muted" v-else><br>
          <div class="h4">Ainda não há nenhuma turma cadastrada</div><br>
        </div>
      </div>
    </article>
    <div class="modal" id="modal-new">
      <div class="modal-header">Nova turma</div>
      <div class="modal-body">
        <div class="row justify-content-center">
          <div class="col-sm-11">
            <form action="#" data-resource="grade" data-success="Turma cadastrada com sucesso" data-error="Não foi possível cadastrar a turma" @submit.prevent="grade_save">
              <input type="hidden" name="active" value="1"><br>
              <div class="row">
                <div class="col-sm-8 input">
                  <input required placeholder="Ex.: 1° Ano A" name="name">
                  <label>Nome</label>
                </div>
                <div class="col-sm-4 input">
                  <input type="number" required min="1" placeholder="Ex. 1° ano: 1" name="level">
                  <label>
                    Nível

                    <div class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</div>
                  </label>
                </div>
              </div><br>
              <div class="row">
                <div class="col-6 col-md-4" v-for="subject in subjects" v-if="subject.active" :key="subject.id">
                  <label>
                    <input type="checkbox" name="grade_subject[]" :value="subject.id"> {{ subject.name }}
                  </label>
                </div>
              </div><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a>
              <button class="btn-success pull-right" type="submit">
                <div class="material-icons">check</div>  Salvar
              </button><br>
            </form>
          </div>
        </div>
      </div>
    </div><a class="modal-close" href="#"></a>
    <div class="modal" id="modal-students">
      <div class="modal-header">Estudantes - {{ current_grade ? current_grade.name : '' }}</div>
      <div class="modal-body">
        <div class="row justify-content-center">
          <div class="col-sm-11">
            <form action="#" data-resource="grade" data-success="Estudante cadastrado com sucesso" data-error="Não foi possível cadastrar o estudante" @submit.prevent="student_save">
              <input type="hidden" name="grade_id" :value="current_grade_id"><br>
              <div class="row">
                <div class="col-sm-8 input">
                  <input required placeholder="Ex.: João da Silva" name="name">
                  <label>Nome</label>
                </div>
                <div class="col-sm-4 input">
                  <input type="number" required min="1" placeholder="Ex.: 5" name="number">
                  <label>Número</label>
                </div>
              </div>
              <button class="btn-success pull-right" type="submit">
                <div class="material-icons">check</div>  Salvar
              </button>
            </form><br>
            <table class="table" v-if="current_students">
              <thead>
              <tr>
                <th>Nome</th>
                <th>Número</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in current_students" :data-student_id="student.id" :key="student.id">
                <template v-if="studentGrade(student.id).end_date <= new Date().toISOString().slice(0, 10)">
                  <td class="text-striked">{{ student.name }}</td>
                  <td style="max-width: 75px">{{ studentGrade(student.id).number }}</td>
                  <td class="text-right">
                    <button class="btn-primary btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="student_toggle(student.id)">
                      <div class="material-icons">visibility_off</div><span class="d-none d-md-inline"> Ativar e Desativar</span>
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td>
                    <input name="name" :value="student.name">
                  </td>
                  <td style="max-width: 75px">
                    <input type="number" min="1" step="1" name="number" :value="studentGrade(student.id).number">
                  </td>
                  <td class="text-right">
                    <button class="btn-success btn-sm tooltip tooltip-end" title="Salvar" @click="student_update(student.id)">
                      <div class="material-icons">save</div><span class="d-none d-md-inline"> Salvar</span>
                    </button>
                    <button class="btn-primary btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="student_toggle(student.id)">
                      <div class="material-icons">visibility_off</div><span class="d-none d-md-inline"> Ativar e Desativar</span>
                    </button>
                  </td>
                </template>
              </tr>
              </tbody>
            </table><br><a class="btn-danger" href="#">
            <div class="material-icons">close</div>  Fechar</a>
          </div>
        </div>
      </div>
    </div><a class="modal-close" href="#"></a>
    <div class="modal" id="modal-edit">
      <div class="modal-header">Editar turma</div>
      <div class="modal-body">
        <div class="row justify-content-center">
          <div class="col-sm-11">
            <form action="#" data-resource="grade" data-success="Turma editada com sucesso" data-error="Não foi possível editar a turma" @submit.prevent="grade_update" v-if="current_grade">
              <input type="hidden" name="id" :value="current_grade_id"><br>
              <div class="row">
                <div class="col-sm-8 input">
                  <input required :value="current_grade.name" placeholder="Ex.: 1° Ano A" name="name">
                  <label>Nome</label>
                </div>
                <div class="col-sm-4 input">
                  <input type="number" required :value="current_grade.level" min="1" placeholder="Ex.: 1" name="level">
                  <label>
                    Nível

                    <div class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</div>
                  </label>
                </div>
              </div>
              <div class="row">
                <div class="col-12 text-center">
                  <label><br>
                    <input name="active" value="1" :checked="parseInt(current_grade.active)" type="checkbox">Visível
                  </label>
                </div>
              </div><br><a class="btn-danger" href="#">
              <div class="material-icons">close</div>  Cancelar</a>
              <button class="btn-success pull-right" type="submit">
                <div class="material-icons">check</div>  Salvar
              </button><br>
            </form>
          </div>
        </div>
      </div>
    </div><a class="modal-close" href="#"></a>
    <div class="modal" id="modal-subjects">
      <div class="modal-header">Disciplinas - {{ current_grade ? current_grade.name : '' }}</div>
      <div class="modal-body">
        <div class="row justify-content-center">
          <div class="col-sm-11">
            <form action="#" data-success="Disciplina incluída com sucesso" data-error="Não foi possível incluir a disciplina" @submit.prevent="grade_subject_save"><br>
              <div class="row justify-content-center">
                <div class="col-12 col-sm-6 input">
                  <select required name="subject_id">
                    <option value="" disabled hidden selected>Selecione...</option>
                    <option v-for="subject in subjects" :value="subject.id" :key="subject.id" :disabled="current_subjects.find(current_subject => current_subject.id === subject.id)">{{ subject.name }}</option>
                  </select>
                  <label>Disciplina</label>
                </div>
                <div class="col-12 col-sm-3"><br class="d-none d-sm-inline">
                  <button class="btn-success" type="submit">
                    <div class="material-icons">check</div> Salvar
                  </button>
                </div>
              </div>
              <div class="row">
                <div class="col-6 col-md-4" v-for="subject in current_subjects" :key="subject.id">
                  <div class="material-icons">check</div> {{ subject.name }}
                </div>
              </div><br><a class="btn-danger" href="#">
                <div class="material-icons">close</div>  Cancelar</a><br>
            </form>
          </div>
        </div>
      </div>
    </div><a class="modal-close" href="#"></a>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Grade',
  data: function() {
    let data = this.$parent.$data
    data.current_grade_subjects = []
    data.current_student_grades = []
    data.current_students = []
    data.current_subjects = []
    data.current_grade = undefined
    return data
  },
  watch: {
    current_grade_id: function() { this.update_current() }
  },
  methods: {
    studentGrade (student_id) {
      return this.current_student_grades.find(student_grade =>
        student_grade.student_id === student_id
      )
    },
    grade_save (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target
      let grade = {
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: true
      }

      let grade_subject_inputs = form.querySelectorAll('[name="grade_subject[]"]:checked')
      let grade_subject_ids = [].map.call(grade_subject_inputs, input => input.value)

      return app.save_resource('grade', grade).then(response => {
        let save_grade_subjects = []

        grade_subject_ids.forEach(subject_id => {
          save_grade_subjects.push(app.save_resource('grade_subject', {
            subject_id: subject_id,
            grade_id: response.id
          }, true, false))
        })

        return Promise.all(save_grade_subjects)
      }).then(() => {
        return app.db.grade_subjects.toArray().then(all_data => app.grade_subjects = all_data)
      }).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    grade_update (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      document.location.hash = '' // closes the current modal

      app.loading = true

      let form = event.target
      let grade = {
        id: form.querySelector('[name=id').value,
        name: form.querySelector('[name=name]').value,
        level: form.querySelector('[name=level]').value,
        active: form.querySelector('[name=active]').checked
      }

      return app.save_resource('grade', grade).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.update_current()
        component.$forceUpdate()
      })
    },
    student_save (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      app.loading = true

      let form = event.target
      let student = {
        name: form.querySelector('[name=name]').value,
        active: true
      }

      let student_grade = {
        grade_id: form.querySelector('[name=grade_id]').value,
        number: form.querySelector('[name=number]').value,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }
      return app.save_resource('student', student).then(response => {
        student_grade.student_id = response.id
        return app.save_resource('student_grade', student_grade)
      }).then(() => {
        app.loading = false
        app.notify('Sucesso!', form.dataset.success, 'success')
        component.update_current()
        component.$forceUpdate()
      }).catch(error => {
        console.log('Error:', error)
        app.loading = false
        app.notify('Erro!', form.dataset.error, 'danger')
        component.update_current()
        component.$forceUpdate()
      })
    },
    student_toggle (student_id) {
      let component = this
      let app = this.$parent

      let student_grade = app.studentGrade(student_id)
      student_grade.end_date = new Date(student_grade.end_date) <= new Date() ? '2018-12-31' : new Date().toISOString().slice(0, 10)

      app.loading = true
      return app.save_resource('student_grade', student_grade).then(() => {
        app.notify('Sucesso!', '', 'success')
      }).catch(error => {
        app.notify('Erro!', '', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.update_current()
        component.$forceUpdate()
      })
    },
    grade_subject_save (event) {
      let component = this
      let app = this.$parent

      event.preventDefault()

      app.loading = true

      let form = event.target
      let data = {
        grade_id: app.current_grade_id,
        subject_id: form.querySelector('[name=subject_id]').value
      }

      app.save_resource('grade_subject', data).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.update_current()
        component.$forceUpdate()
      })
    },
    student_update (student_id) {
      let component = this
      let app = this.$parent

      let tr = document.querySelector('[data-student_id="' + student_id + '"]')

      let student = {
        id: student_id,
        name: tr.querySelector('[name=name]').value
      }

      if (student.name.length < 3) {
        app.notify('Erro', 'O nome do aluno precisa de ao menos 3 caracteres', 'error')
        return
      }

      let student_grade = {
        id: app.studentGrade(student_id).id,
        student_id: student_id,
        grade_id: app.current_grade_id,
        number: parseInt(tr.querySelector('[name=number]').value)
      }

      if (!student_grade.number) {
        app.notify('Erro', 'O aluno precisa de um número válido')
        return
      }

      app.loading = true
      app.save_resource('student', student).then(() => {
        return app.save_resource('student_grade', student_grade)
      }).then(() => {
        app.notify('Sucesso!', 'Aluno editado com sucesso!', 'success')
      }).catch(error => {
        app.notify('Erro!', 'Não foi possível editar o aluno!', 'error')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.update_current()
        component.$forceUpdate()
      })
    },
    update_current() {
      if (!this.current_grade_id) {
        this.current_grade_subjects = []
        this.current_student_grades = []
        this.current_students = []
        this.current_subjects = []
        this.current_grade = undefined
        return
      }

      this.current_grade = this.grades.find(grade => grade.id === this.current_grade_id)

      this.current_grade_subjects = this.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )
      this.current_subjects = this.subjects.filter(subject =>
        this.current_grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      ).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )

      this.current_student_grades = this.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )
      this.current_students = this.students.filter(student => {
        return this.studentGrade(student.id)
      }).sort((a, b) => {
        a = this.studentGrade(a.id).number
        b = this.studentGrade(b.id).number

        if (a < b) {
          return -1
        }

        if (a > b) {
          return 1
        }

        return 0
      })
    }
  },
  created: function() {
    this.current_grade_subjects = []
    this.current_student_grades = []
    this.current_students = []
    this.current_subjects = []
    this.current_grade = undefined
    this.current_grade_id = ''
    this.current_subject_id = ''
  }
}
</script>
