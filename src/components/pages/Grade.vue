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
                <a class="btn-warning btn-sm tooltip tooltip-end" href="#modal-edit" title="Editar informações da turma" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">edit</div>
                  <span class="d-none d-md-inline">Editar</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-students" title="Estudantes" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">person</div>
                  <span class="d-none d-md-inline">Estudantes</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-subjects" title="Disciplinas" @click="setCurrentGrade(grade.id)">
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
          <form action="#" data-resource="grade" data-success="Turma cadastrada com sucesso" data-error="Não foi possível cadastrar a turma" @submit.prevent="gradeSave">
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

    <modal anchor="modal-edit" title="Editar turma" ref="modalEdit" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Turma editada com sucesso" data-error="Não foi possível editar a turma" @submit.prevent="gradeUpdate">
            <br>
            <div class="row">
              <div class="col-sm-8 input">
                <input required :value="currentGrade.name" placeholder="Ex.: 1° Ano A" name="name" minlength="3">
                <label>Nome</label>
              </div>
              <div class="col-sm-4 input">
                <input type="number" required :value="currentGrade.level" min="1" placeholder="Ex.: 1" name="level" step="1">
                <label>
                  Nível
                  <span class="material-icons tooltip tooltip-left tooltip-start" data-tooltip="1° ano: nível 1;&#xa;2° ano: nível 2;&#xa;3° ano: nível 3;&#xa;etc">info</span>
                </label>
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-center">
                <label><br>
                  <input name="active" value="1" :checked="parseInt(currentGrade.active)" type="checkbox">Visível
                </label>
              </div>
            </div><br><a class="btn-danger" href="#">
            <div class="material-icons">close</div>  Cancelar</a>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button><br>
          </form>
        </div>
      </div>
    </modal>

    <modal anchor="modal-students" :title="'Estudantes - '+(currentGrade ? currentGrade.name : '')" ref="modalStudents" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-resource="grade" data-success="Estudante cadastrado com sucesso" data-error="Não foi possível cadastrar o estudante" @submit.prevent="studentSave">
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
              <span class="material-icons">check</span>  Salvar
            </button>
          </form><br>
          <table class="table" v-if="currentStudents.length">
            <thead>
            <tr>
              <th>Nome</th>
              <th>Número</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id">
              <template v-if="studentGrade(student.id).end_date <= new Date().toISOString().slice(0, 10)">
                <td class="text-striked">{{ student.name }}</td>
                <td style="max-width: 75px">{{ studentGrade(student.id).number }}</td>
                <td class="text-right">
                  <button class="btn-primary btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="studentToggle(student.id)">
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
                  <button class="btn-success btn-sm tooltip tooltip-end" title="Salvar" @click="studentUpdate(student.id)">
                    <div class="material-icons">save</div><span class="d-none d-md-inline"> Salvar</span>
                  </button>
                  <button class="btn-primary btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="studentToggle(student.id)">
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
    <modal anchor="modal-subjects" :title="'Disciplinas - '+(currentGrade ? currentGrade.name : '')" ref="modalSubjects">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="#" data-success="Disciplina incluída com sucesso" data-error="Não foi possível incluir a disciplina" @submit.prevent="gradeSubjectSave"><br>
            <div class="row justify-content-center">
              <div class="col-12 col-sm-6 input">
                <select required name="subject_id">
                  <option value="" disabled hidden selected>Selecione...</option>
                  <option v-for="subject in $store.state.subjects" :value="subject.id" :key="subject.id" :disabled="currentSubjects.find(current_subject => current_subject.id === subject.id)">{{ subject.name }}</option>
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
              <div class="col-6 col-md-4" v-for="subject in currentSubjects" :key="subject.id">
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
      current_grade_id: undefined
    }
  },
  computed: {
    currentGrade () {
      if (!this.current_grade_id) {
        return {}
      }

      const grade = this.$store.state.grades.find(grade =>
        grade.id === this.current_grade_id
      )

      return grade || {}
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

    currentStudentGrades () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.state.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )
    },

    currentStudents () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.state.students.filter(student =>
        this.studentGrade(student.id)
      ).sort((a, b) =>
        Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
      )
    }
  },
  methods: {
    studentGrade (student_id) {
      return this.currentStudentGrades.find(student_grade =>
        student_grade.student_id === student_id
      )
    },

    setCurrentGrade (grade_id) {
      this.current_grade_id = grade_id
    },

    gradeSave (event) {
      this.$emit('loading')

      const form = event.target

      const grade_subject_inputs = form.querySelectorAll('[name="grade_subject[]"]:checked')
      const grade_subject_ids = [].map.call(grade_subject_inputs, input => input.value)

      const save_resource = {
        resource_name: 'grade',
        data: {
          name: form.querySelector('[name=name]').value,
          level: form.querySelector('[name=level]').value,
          active: true
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(grade => {
        const promises = []

        grade_subject_ids.forEach(subject_id => {
          const save_resource = {
            resource_name: 'grade_subject',
            data: {
              subject_id: subject_id,
              grade_id: grade.id
            }
          }
          const promise = this.$store.dispatch('save_resource', save_resource)

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

    gradeUpdate (event) {
      this.$emit('loading')

      const form = event.target

      const save_resource = {
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
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    studentSave (event) {
      this.$emit('loading')

      const form = event.target

      const student_grade = {
        grade_id: this.current_grade_id,
        number: form.querySelector('[name=number]').value,
        start_date: '2018-01-01',
        end_date: '2018-12-31'
      }

      const save_resource = {
        resource_name: 'student',
        data: {
          name: form.querySelector('[name=name]').value,
          active: true
        }
      }
      return this.$store.dispatch('save_resource', save_resource).then(student => {
        student_grade.student_id = student.id

        const save_resource = {
          resource_name: 'student_grade',
          data: student_grade
        }
        return this.$store.dispatch('save_resource', save_resource)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        form.querySelector('[name=number]').value = ''
        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=name]').focus()
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    studentToggle (student_id) {
      this.$emit('loading')

      const student_grade = this.studentGrade(student_id)
      student_grade.end_date = new Date(student_grade.end_date) <= new Date() ? '2018-12-31' : new Date().toISOString().slice(0, 10)

      const save_resource = {
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

    gradeSubjectSave (event) {
      this.$emit('loading')

      const form = event.target

      const save_resource = {
        resource_name: 'grade_subject',
        data: {
          grade_id: this.current_grade_id,
          subject_id: form.querySelector('[name=subject_id]').value
        }
      }
      this.$store.dispatch('save_resource', save_resource).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        form.querySelector('[name=subject_id]').value = ''
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    studentUpdate (student_id) {
      const tr = document.querySelector('[data-student_id="' + student_id + '"]')

      this.$emit('loading')

      const promises = []

      let save_resource = {
        resource_name: 'student',
        data: {
          id: student_id,
          name: tr.querySelector('[name=name]').value
        }
      }
      promises.push(this.$store.dispatch('save_resource', save_resource))

      save_resource = {
        resource_name: 'student_grade',
        data: {
          id: this.studentGrade(student_id).id,
          student_id: student_id,
          grade_id: this.current_grade_id,
          number: tr.querySelector('[name=number]').value
        }
      }
      promises.push(this.$store.dispatch('save_resource', save_resource))

      Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Aluno editado com sucesso!', 'success')
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
  }
}
</script>
