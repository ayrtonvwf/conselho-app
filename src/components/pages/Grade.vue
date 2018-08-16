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
        <table class="table" v-if="$store.state.grades.length">
          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in $store.state.grades" :key="grade.id">
              <td :class="!parseInt(grade.active) ? 'text-muted' : ''">
                {{ grade.name }}
                <span class="text-muted" v-if="!parseInt(grade.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações da turma" @click="current_grade_id = grade.id">
                  <div class="material-icons">edit</div>
                  <span class="d-none d-md-inline">Editar</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-students" title="Estudantes" @click="current_grade_id = grade.id">
                  <div class="material-icons">person</div>
                  <span class="d-none d-md-inline">Estudantes</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-subjects" title="Disciplinas" @click="current_grade_id = grade.id">
                  <div class="material-icons">book</div>
                  <span class="d-none d-md-inline">Disciplinas</span>
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
    <modal anchor="modal-new" title="Nova turma" ref="modalNew">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-resource="grade" data-success="Turma cadastrada com sucesso" data-error="Não foi possível cadastrar a turma" @submit.prevent="grade_save">
            <input type="hidden" name="active" value="1"><br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required placeholder="Ex.: 1° Ano A" name="name" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required min="1" placeholder="Ex. 1° ano: 1" name="level" step="1">
                <label>
                  Nível

                  <div class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</div>
                </label>
              </div>
            </div><br>
            <div class="row">
              <div class="col-6 col-md-4" v-for="subject in $store.state.subjects" v-if="subject.active" :key="subject.id">
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
    </modal>
    <modal anchor="modal-edit" title="Editar turma" ref="modalEdit">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Turma editada com sucesso" data-error="Não foi possível editar a turma" @submit.prevent="grade_update">
            <br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required :value="current_grade.name" placeholder="Ex.: 1° Ano A" name="name" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required :value="current_grade.level" min="1" placeholder="Ex.: 1" name="level" step="1">
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
    </modal>
    <modal anchor="modal-students" :title="'Estudantes - '+(current_grade ? current_grade.name : '')" ref="modalStudents">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-resource="grade" data-success="Estudante cadastrado com sucesso" data-error="Não foi possível cadastrar o estudante" @submit.prevent="student_save">
            <br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required placeholder="Ex.: João da Silva" name="name" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required min="1" placeholder="Ex.: 5" name="number" step="1">
                <label>Número</label>
              </div>
            </div>
            <button class="btn-success pull-right" type="submit">
              <div class="material-icons">check</div>  Salvar
            </button>
          </form><br>
          <table class="table" v-if="current_students.length">
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
                  <input name="name" :value="student.name" minlength="3" required>
                </td>
                <td style="max-width: 75px">
                  <input type="number" min="1" step="1" name="number" :value="studentGrade(student.id).number" required>
                </td>
                <td class="text-right no-wrap">
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
          </table>
          <div class="text-center text-muted" v-else>
            <br><br><br>
            <div class="h4">Ainda não há nenhum estudante cadastrado</div>
            <br><br>
          </div>
          <br><a class="btn-danger" href="#">
          <div class="material-icons">close</div>  Fechar</a>
        </div>
      </div>
    </modal>
    <modal anchor="modal-subjects" :title="'Disciplinas - '+(current_grade ? current_grade.name : '')" ref="modalSubjects">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina incluída com sucesso" data-error="Não foi possível incluir a disciplina" @submit.prevent="grade_subject_save"><br>
            <div class="row justify-content-center">
              <div class="col-12 col-sm-6 input">
                <select required name="subject_id">
                  <option value="" disabled hidden selected>Selecione...</option>
                  <option v-for="subject in $store.state.subjects" :value="subject.id" :key="subject.id" :disabled="current_subjects.find(current_subject => current_subject.id === subject.id)">{{ subject.name }}</option>
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
    </modal>
  </div>
</template>

<script>
/* eslint camelcase: 0 */
export default {
  name: 'Grade',
  data () {
    return {
      current_grade_id: undefined,
      current_grade: {},
      current_grade_subjects: [],
      current_student_grades: [],
      current_students: [],
      current_subjects: []
    }
  },
  watch: {
    current_grade_id () {
      if (!this.current_grade_id) {
        this.current_grade = {}
        this.current_grade_subjects = []
        this.current_student_grades = []
        this.current_students = []
        this.current_subjects = []
        return
      }

      this.current_grade = this.$store.state.grades.find(grade =>
        grade.id === this.current_grade_id
      )

      this.current_grade_subjects = this.$store.state.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )
      this.current_subjects = this.$store.state.subjects.filter(subject =>
        this.current_grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )

      this.current_student_grades = this.$store.state.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )
      this.current_students = this.$store.state.students.filter(student =>
        this.studentGrade(student.id)
      ).sort((a, b) =>
        Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
      )
    }
  },
  methods: {
    studentGrade (student_id) {
      return this.current_student_grades.find(student_grade =>
        student_grade.student_id === student_id
      )
    },

    grade_save (event) {
      this.$emit('loading')

      let form = event.target

      let grade_subject_inputs = form.querySelectorAll('[name="grade_subject[]"]:checked')
      let grade_subject_ids = [].map.call(grade_subject_inputs, input => input.value)

      let save_resource = {
        resource_name: 'grade',
        data: {
          name: form.querySelector('[name=name]').value,
          level: form.querySelector('[name=level]').value,
          active: true
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(grade => {
        let promises = []

        grade_subject_ids.forEach(subject_id => {
          let save_resource = {
            resource_name: 'grade_subject',
            data: {
              subject_id: subject_id,
              grade_id: grade.id
            }
          }
          let promise = this.$store.dispatch('save_resource', save_resource)

          promises.push(promise)
        })

        return Promise.all(promises)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=level]').value = ''
        grade_subject_inputs.forEach(input => {
          input.checked = false
        })
        this.$refs.modalNew.close()
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    grade_update (event) {
      this.$emit('loading')

      let form = event.target

      let save_resource = {
        resource_name: 'grade',
        data: {
          id: this.current_grade_id,
          name: form.querySelector('[name=name]').value,
          level: form.querySelector('[name=level]').value,
          active: form.querySelector('[name=active]').checked
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(grade => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.$refs.modalEdit.close()
        this.current_grade = grade
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    student_save (event) {
      this.$emit('loading')

      let form = event.target

      let student_grade = {
        grade_id: this.current_grade_id,
        number: form.querySelector('[name=number]').value,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      let save_resource = {
        resource_name: 'student',
        data: {
          name: form.querySelector('[name=name]').value,
          active: true
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(student => {
        this.current_students.push(student)
        student_grade.student_id = student.id

        let save_resource = {
          resource_name: 'student_grade',
          data: student_grade
        }
        return this.$store.dispatch('save_resource', save_resource)
      }).then(student_grade => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.current_student_grades.push(student_grade)
        this.current_students = this.current_students.sort((a, b) =>
          Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
        )
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    student_toggle (student_id) {
      this.$emit('loading')

      let student_grade = this.studentGrade(student_id)
      student_grade.end_date = new Date(student_grade.end_date) <= new Date() ? '2018-12-31' : new Date().toISOString().slice(0, 10)

      let save_resource = {
        resource_name: 'student_grade',
        data: student_grade
      }
      return this.$store.dispatch('save_resource', save_resource).then(student_grade => {
        let message
        if (student_grade.end_date === '2018-12-31') {
          message = 'Estudante desativado com sucesso'
        } else {
          message = 'Estudante ativado com sucesso'
        }
        this.$emit('notify', 'Sucesso!', message, 'success')

        let index = this.current_student_grades.findIndex(find_student_grade =>
          find_student_grade.id === student_grade.id
        )
        this.$set(this.current_student_grades, index, student_grade)
      }).catch(error => {
        let message
        if (student_grade.end_date === '2018-12-31') {
          message = 'Não foi possível desativar o estudante'
        } else {
          message = 'Não foi possível ativar o estudante'
        }
        this.$emit('notify', 'Erro!', message, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    grade_subject_save (event) {
      this.$emit('loading')

      let form = event.target

      let save_resource = {
        resource_name: 'grade_subject',
        data: {
          grade_id: this.current_grade_id,
          subject_id: form.querySelector('[name=subject_id]').value
        }
      }
      this.$store.dispatch('save_resource', save_resource).then(grade_subject => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        this.current_grade_subjects.push(grade_subject)
        let subject = this.$store.state.subjects.find(subject =>
          subject.id === grade_subject.subject_id
        )
        this.current_subjects.push(subject)
        form.querySelector('[name=subject_id]').value = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    student_update (student_id) {
      let tr = document.querySelector('[data-student_id="' + student_id + '"]')

      this.$emit('loading')

      let promises = []

      let save_resource = {
        resource_name: 'student',
        data: {
          id: student_id,
          name: tr.querySelector('[name=name]').value
        }
      }
      promises.push(this.$store.dispatch('save_resource', save_resource).then(student => {
        let index = this.current_students.findIndex(find_student =>
          find_student.id === student.id
        )
        this.$set(this.current_students, index, student)
      }))

      save_resource = {
        resource_name: 'student_grade',
        data: {
          id: this.studentGrade(student_id).id,
          student_id: student_id,
          grade_id: this.current_grade_id,
          number: tr.querySelector('[name=number]').value
        }
      }
      promises.push(this.$store.dispatch('save_resource', save_resource).then(student_grade => {
        let index = this.current_student_grades.findIndex(find_student_grade =>
          find_student_grade.id === student_grade.id
        )
        this.$set(this.current_student_grades, index, student_grade)
      }))

      Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Aluno editado com sucesso!', 'success')
        this.current_students = this.current_students.sort((a, b) =>
          Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
        )
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar o aluno!', 'error')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  created () {
    this.current_grade_id = undefined
    this.current_grade = {}
    this.current_grade_subjects = []
    this.current_student_grades = []
    this.current_students = []
    this.current_subjects = []
  }
}
</script>
