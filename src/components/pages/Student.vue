<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h1 class="content-title"><i class="material-icons">person</i>Estudantes</h1>
      </div>
      <div class="col text-right">
        <a class="btn-success btn-sm no-wrap" href="#modal-new">
          <div class="material-icons">add</div>
          Cadastrar Estudante
        </a>
        <a class="btn-primary btn-sm no-wrap" href="#modal-migrate-student-grade">
          <div class="material-icons">arrow_forward</div>
          Mudar de Turma
        </a>
      </div>
    </div>
    <article class="box">
      <div class="box-body">
        <table class="table" v-if="orderedGrades.length">
          <thead>
            <tr>
              <th>Turma</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in orderedGrades" :key="grade.id">
              <td :class="!parseInt(grade.active) ? 'text-muted' : ''">
                {{ grade.name }}
                <span class="text-muted" v-if="!parseInt(grade.active)">(invisível)</span>
              </td>
              <td class="text-right no-wrap">
                <a class="btn-success btn-sm tooltip tooltip-end" href="#modal-new" title="Cadastrar Estudante" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">add</div>
                  <span class="d-none d-md-inline">Cadastrar</span>
                </a>
                <a class="btn-primary btn-sm tooltip tooltip-end" href="#modal-students" title="Estudantes" @click="setCurrentGrade(grade.id)">
                  <div class="material-icons">person</div>
                  <span class="d-none d-md-inline">Estudantes</span>
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

    <modal anchor="modal-new" title="Cadastrar Estudante" ref="modalNew" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-12">
          <form action="#" data-resource="grade" data-success="Estudante cadastrado com sucesso" data-error="Não foi possível cadastrar o estudante" @submit.prevent="studentSave">
            <br>
            <div class="row">
              <div class="col-sm-7 input">
                <input required placeholder="Ex.: João da Silva" name="name" minlength="3" autocomplete="off">
                <label>Nome</label>
              </div>
              <div class="col-sm-2 input">
                <input type="number" required min="1" placeholder="Ex.: 5" name="number" step="1" autocomplete="off">
                <label>Número</label>
              </div>
              <div class="col-sm-3 input">
                <select required name="grade_id" v-model="current_grade_id">
                  <option value="" disabled hidden>Turma...</option>
                  <option v-for="grade in orderedGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                </select>
                <label>Turma</label>
              </div>
            </div>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button>
          </form><br>
          <br>
          <a class="btn-danger" href="#">
            <div class="material-icons">close</div> Fechar
          </a>
        </div>
      </div>
    </modal>

    <modal anchor="modal-students" :title="currentGrade ? currentGrade.name : ''" ref="modalStudents" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <div class="row">
            <div class="col-sm-6">
              <div class="input">
                <select v-model="current_year">
                  <option v-for="year of years" :key="year" :value="year">{{ year }}</option>
                </select>
                <label>Ano</label>
              </div>
            </div>
            <div class="col-sm-6 text-right">
              <br>
              <a class="btn-primary btn-sm no-wrap" href="#modal-migrate-student-grade">
                <div class="material-icons">arrow_forward</div>
                Mudar Estudantes de Turma
              </a>
            </div>
          </div>
          <table class="table" v-if="currentStudents.length">
            <thead>
            <tr>
              <th>Nome</th>
              <th>Número</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id">
              <template v-if="currentYearIsNow">
                <template v-if="!isStudentActive(student.id)">
                  <td class="text-striked">{{ student.name }}</td>
                  <td style="max-width: 75px">{{ studentGrade(student.id).number }}</td>
                  <td class="text-right">
                    <button class="btn-warning btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="studentToggle(student.id)">
                      <span class="material-icons">visibility_off</span><span class="d-none d-md-inline"> Ativar e Desativar</span>
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td>
                    <input name="name" :value="student.name" minlength="3" required autocomplete="off">
                  </td>
                  <td style="max-width: 75px">
                    <input type="number" min="1" step="1" name="number" :value="studentGrade(student.id).number" required autocomplete="off">
                  </td>
                  <td class="text-right no-wrap">
                    <button class="btn-success btn-sm tooltip tooltip-end" title="Salvar" @click="studentUpdate(student.id)">
                      <span class="material-icons">save</span><span class="d-none d-md-inline"> Salvar</span>
                    </button>
                    <button class="btn-warning btn-sm tooltip tooltip-end" title="Ativar e Desativar" @click="studentToggle(student.id)">
                      <span class="material-icons">visibility_off</span><span class="d-none d-md-inline"> Ativar e Desativar</span>
                    </button>
                  </td>
                </template>
              </template>
              <template v-else>
                <td :class="{ 'text-striked': !isStudentActive(student.id) }">{{ student.name }}</td>
                <td>{{ studentGrade(student.id).number }}</td>
              </template>
            </tr>
            </tbody>
          </table>
          <div class="text-center text-muted" v-else>
            <br><br><br>
            <div class="h4" v-if="currentYearIsNow">Ainda não há nenhum estudante cadastrado nesta turma.</div>
            <div class="h4" v-else>Não há nenhum estudante cadastrado nesta turma no ano de <b>{{ current_year }}</b></div>
            <br><br>
          </div>
          <br><a class="btn-danger" href="#">
          <div class="material-icons">close</div>  Fechar</a>
        </div>
      </div>
    </modal>

    <modal anchor="modal-migrate-student-grade" title="Mudar estudantes de turma" ref="modalMigrateStudentGrades" @close="setCurrentGrade(undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <form action="" @submit.prevent="migrateStudentGrades">
            <div class="row">
              <div class="col-sm-5">
                <p class="text-center">Origem</p>
                <div class="input">
                  <select v-model="current_grade_id">
                    <option v-for="grade of orderedGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                  </select>
                  <label>Turma</label>
                </div>
                <div class="input">
                  <select v-model="current_year">
                    <option v-for="year of years" :key="year" :value="year">{{ year }}</option>
                  </select>
                  <label>Ano</label>
                </div>
              </div>
              <div class="col-sm-2 align-self-center text-center">
                <span class="material-icons">arrow_forward</span>
              </div>
              <div class="col-sm-5">
                <p class="text-center">Destino</p>
                <div class="input">
                  <select v-model="destiny_grade_id">
                    <option v-for="grade of orderedGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                  </select>
                  <label>Turma</label>
                </div>
                <button class="btn-success pull-right" type="submit">
                  <span class="material-icons">check</span> Fazer mudança
                </button>
              </div>
            </div>
            <table class="table" v-if="currentStudents.length">
              <thead>
              <tr>
                <th class="text-center">
                  <span class="material-icons">check</span>
                </th>
                <th>Nome</th>
                <th>Número</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id">
                <td class="text-center">
                  <input type="checkbox" v-model="student_grade_ids" :value="studentGrade(student.id).id" v-if="isLastGrade(student.id)">
                  <span class="material-icons tooltip tooltip-right" title="Este estudante já está em outra turma." v-else>close</span>
                </td>
                <td :class="{ 'text-striked': !isStudentActive(student.id), 'text-muted': !isLastGrade(student.id) }">{{ student.name }}</td>
                <td>{{ studentGrade(student.id).number }}</td>
              </tr>
              </tbody>
            </table>
            <div class="text-center text-muted" v-else-if="current_grade_id">
              <br><br><br>
              <div class="h4" v-if="currentYearIsNow">Ainda não há nenhum estudante cadastrado nesta turma.</div>
              <div class="h4" v-else>Não há nenhum estudante cadastrado nesta turma no ano de <b>{{ current_year }}</b></div>
              <br><br>
            </div>
          </form>
          <br><a class="btn-danger" href="#">
          <div class="material-icons">close</div>  Fechar</a>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  name: 'Student',
  data () {
    return {
      current_grade_id: undefined,
      destiny_grade_id: undefined,
      student_grade_ids: [],
      this_year: (new Date()).getFullYear(),
      current_year: (new Date()).getFullYear()
    }
  },
  computed: {
    currentYearIsNow () {
      return this.current_year === this.this_year
    },

    years () {
      return this.$store.getters['student_grades/getStudentGrades'].reduce((accumulator, curr) => {
        const startYear = new Date(curr.start_date).getFullYear()
        const endYear = new Date(curr.end_date).getFullYear()

        if (accumulator.indexOf(startYear) === -1) {
          accumulator.push(startYear)
        }

        if (accumulator.indexOf(endYear) === -1) {
          accumulator.push(endYear)
        }

        return accumulator
      }, [this.this_year]).sort((a, b) =>
        Math.sign(b - a)
      )
    },

    orderedGrades () {
      return this.$store.getters['grades/getOrderedGrades']
    },

    currentGrade () {
      if (!this.current_grade_id) {
        return {}
      }

      const grade = this.orderedGrades.find(grade =>
        grade.id === this.current_grade_id
      )

      return grade || {}
    },

    studentGradesOfCurrentStudents () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        this.currentStudents.find(student =>
          student.id === studentGrade.student_id
        )
      )
    },

    currentStudentGrades () {
      if (!this.current_grade_id) {
        return []
      }

      const minStartDate = this.current_year + '-01-01'
      const maxEndDate = this.current_year + '-12-31'

      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        studentGrade.grade_id === this.current_grade_id &&
        studentGrade.start_date >= minStartDate &&
        studentGrade.end_date <= maxEndDate
      )
    },

    currentStudents () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['students/getStudents'].filter(student =>
        this.studentGrade(student.id)
      ).sort((a, b) =>
        Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
      )
    }
  },
  methods: {
    migrateStudentGrades () {
      if (!this.student_grade_ids.length) {
        this.$emit('notify', 'Erro!', 'Selecione ao menos um estudante para mudar de turma.', 'danger')
        return
      }

      if (!this.destiny_grade_id) {
        this.$emit('notify', 'Erro!', 'Selecione uma turma de destino!.', 'danger')
        return
      }

      this.$emit('loading')

      const studentGrades = this.currentStudentGrades.filter(studentGrade =>
        this.student_grade_ids.find(studentGradeId =>
          studentGrade.id === studentGradeId
        )
      )

      const startDate = (new Date()).toISOString().slice(0, 10)
      const endDate = this.this_year + '-12-31'

      const promises = studentGrades.map(studentGrade => {
        const newStudentGrade = {
          grade_id: this.destiny_grade_id,
          student_id: studentGrade.student_id,
          number: studentGrade.number,
          start_date: startDate,
          end_date: endDate
        }

        return this.$store.dispatch('student_grades/create', newStudentGrade)
      })

      return Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Alteração salva com sucesso!', 'success')
      }).catch(() => {
        this.$emit('notify', 'Erro!', 'Não foi possível mudar alguns alunos de turma. Tente novamente!', 'danger')
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    isLastGrade (studentId) {
      const studentStudentGrades = this.studentGradesOfCurrentStudents.filter(studentGrade =>
        studentGrade.student_id === studentId
      )

      const currentStudentGrade = this.studentGrade(studentId)

      return !studentStudentGrades.find(studentGrade =>
        studentGrade.start_date > currentStudentGrade.start_date
      )
    },

    isStudentActive (studentId) {
      const studentGrade = this.studentGrade(studentId)
      return !studentGrade.disabled_at
    },

    studentGrade (studentId) {
      return this.currentStudentGrades.find(studentGrade =>
        studentGrade.student_id === studentId
      )
    },

    setCurrentGrade (gradeId) {
      this.current_grade_id = gradeId
    },

    studentSave (event) {
      this.$emit('loading')

      const form = event.target

      const student = {
        name: form.querySelector('[name=name]').value,
        active: true
      }
      return this.$store.dispatch('students/create', student).then(student => {
        const year = (new Date()).getFullYear()

        const studentGrade = {
          grade_id: this.current_grade_id,
          number: form.querySelector('[name=number]').value,
          start_date: year + '-01-01',
          end_date: year + '-12-31',
          student_id: student.id
        }
        return this.$store.dispatch('student_grades/create', studentGrade)
      }).then(() => {
        this.$emit('notify', 'Sucesso!', 'Estudante cadastrado com sucesso!', 'success')
        form.querySelector('[name=number]').value = ''
        form.querySelector('[name=name]').value = ''
        form.querySelector('[name=name]').focus()
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível cadastrar o estudante.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    studentToggle (studentId) {
      this.$emit('loading')

      const studentGrade = this.studentGrade(studentId)
      const today = (new Date()).toISOString().slice(0, 10)
      const isActive = !studentGrade.disabled_at || studentGrade.disabled_at > today
      studentGrade.disabled_at = isActive ? today : null

      return this.$store.dispatch('student_grades/update', studentGrade).then(() => {
        let message
        if (isActive) {
          message = 'Estudante desativado com sucesso'
        } else {
          message = 'Estudante ativado com sucesso'
        }
        this.$emit('notify', 'Sucesso!', message, 'success')
      }).catch(error => {
        let message
        if (isActive) {
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

    studentUpdate (studentId) {
      const tr = document.querySelector('[data-student_id="' + studentId + '"]')

      this.$emit('loading')

      const promises = []

      let student = {
        id: studentId,
        name: tr.querySelector('[name=name]').value
      }
      promises.push(this.$store.dispatch('students/update', student))

      const studentGrade = {
        id: this.studentGrade(studentId).id,
        student_id: studentId,
        grade_id: this.current_grade_id,
        number: tr.querySelector('[name=number]').value
      }
      promises.push(this.$store.dispatch('student_grades/update', studentGrade))

      Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Aluno editado com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível editar o aluno!', 'error')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    load () {
      const required = [
        'grades',
        'student_grades',
        'students'
      ]

      const promises = required.map(module =>
        this.$store.dispatch(module + '/loadFromDb')
      )

      return Promise.all(promises)
    }
  },

  beforeCreate () {
    this.$emit('loading')
  },

  created () {
    this.current_grade_id = undefined

    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
