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
              <div class="col-sm-5 input">
                <input type="number" required min="1" placeholder="Ex.: 5" name="number" step="1" autocomplete="off">
                <label>Número</label>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-7 input">
                <select required name="grade_id" v-model="current_grade_id">
                  <option value="" disabled hidden>Turma...</option>
                  <option v-for="grade in orderedGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                </select>
                <label>Turma</label>
              </div>
              <div class="col-sm-5 input">
                <label for="student_upload_image">Imagem</label>
                <label class="btn-primary">
                  <input type="file" accept="image/jpg, image/jpeg, image/png" id="student_upload_image" hidden name="image"> Escolher imagem
                </label>
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

    <modal anchor="modal-edit" title="Editar estudante" ref="modalEdit" @close="setCurrentStudent(undefined, undefined)">
      <div class="row justify-content-center">
        <div class="col-sm-11">
          <a href="#modal-students" class="btn-warning btn-sm" @click="setCurrentStudent(undefined, current_grade_id)">
            <span class="material-icons">reply</span> Todos os alunos
          </a>
          <form action="#" data-resource="grade" @submit.prevent="studentUpdate" v-if="current_student_id">
            <br>
            <div class="row">
              <div class="col-sm-7 input">
                <input required placeholder="Ex.: João da Silva" name="name" minlength="3" autocomplete="off" :value="currentStudent.name">
                <label>Nome</label>
              </div>
              <div class="col-sm-5 input">
                <input type="number" required min="1" placeholder="Ex.: 5" name="number" step="1" autocomplete="off" :value="studentGrade(current_student_id).number">
                <label>Número</label>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-7 input">
                <label for="student_upload_image">Imagem</label>
                <label class="btn-primary">
                  <input type="file" accept="image/jpg, image/jpeg, image/png" id="student_update_image" hidden name="image"> Escolher imagem
                </label>
              </div>
              <div class="col-sm-5">
                <label>Imagem atual</label>
                <img style="max-width: 100%" :src="currentStudent.image" alt="Foto do estudante" v-if="currentStudent.image">
                <p v-else>Imagem não cadastrada</p>
              </div>
            </div>
            <button class="btn-success pull-right" type="submit">
              <span class="material-icons">check</span>  Salvar
            </button>
          </form><br>
          <hr>
          <table class="table">
            <thead>
            <tr>
              <th>Turma</th>
              <th>Ano</th>
              <th>Número</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="studentGrade in currentStudentStudentGrades" :key="studentGrade.id" :class="studentGrade.disabled_at ? 'text-muted' : ''">
              <td>
                {{ grade(studentGrade.grade_id).name }}
              </td>
              <td>
                {{ new Date(studentGrade.end_date).getFullYear() }}
              </td>
              <td>
                {{ studentGrade.number }}
              </td>
            </tr>
            </tbody>
          </table>
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
              <th style="width: 100px; text-align: center">
                <span class="material-icons">photo</span>
              </th>
              <th>Nome</th>
              <th style="max-width: 75px">Número</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id" :class="isStudentActive(student.id) ? '' : 'text-striked'">
              <td v-if="student.image" class="text-center">
                <img :src="student.image" alt="Foto do aluno" style="max-width: 100%">
              </td>
              <td v-else class="text-center">
                <span class="material-icons">person</span>
              </td>
              <td>{{ student.name }}</td>
              <td>{{ studentGrade(student.id).number }}</td>
              <td class="text-right">
                <template v-if="currentYearIsNow">
                  <button type="button" @click="studentToggle(student.id)" class="btn-success btn-sm" v-if="isStudentActive(student.id)">
                    Desabilitar
                  </button>
                  <button type="button" @click="studentToggle(student.id)" class="btn-danger btn-sm" v-else>
                    Habilitar
                  </button>
                </template>
                <a href="#modal-edit" class="btn-warning btn-sm tooltip tooltip-end" title="Editar" @click="setCurrentStudent(student.id, studentGrade(student.id).grade_id)">
                  <span class="material-icons">edit</span><span class="d-none d-md-inline"> Editar</span>
                </a>
              </td>
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
                  <span class="material-icons tooltip tooltip-right" :title="'Este estudante está na turma ' + lastGrade(student.id).name + ' (' + lastStudentGrade(student.id).start_date.slice(0, 4) + ')'" v-else>close</span>
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
import Compressor from 'compressorjs'

export default {
  name: 'Student',
  data () {
    return {
      current_grade_id: undefined,
      destiny_grade_id: undefined,
      student_grade_ids: [],
      this_year: (new Date()).getFullYear(),
      current_year: (new Date()).getFullYear(),
      current_student_id: undefined
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

    currentStudentStudentGrades () {
      if (!this.current_student_id) {
        return []
      }

      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        studentGrade.student_id === this.current_student_id
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
    },

    currentStudent () {
      if (!this.current_student_id) {
        return {}
      }

      return this.currentStudents.find(student =>
        student.id === this.current_student_id
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

    lastGrade (studentId) {
      const lastStudentGrade = this.lastStudentGrade(studentId)
      return this.orderedGrades.find(grade =>
        grade.id === lastStudentGrade.grade_id
      )
    },

    lastStudentGrade (studentId) {
      return this.studentGradesOfCurrentStudents.reduce((latest, current) =>
        current.student_id === studentId && (
          !latest ||
          current.start_date > latest.start_date
        ) ? current : latest
      )
    },

    isLastGrade (studentId) {
      const currentStudentGrade = this.studentGrade(studentId)

      return !this.studentGradesOfCurrentStudents.find(studentGrade =>
        studentGrade.student_id === studentId &&
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

    setCurrentStudent (studentId, gradeId) {
      this.setCurrentGrade(gradeId)
      this.current_student_id = studentId
    },

    getImage (input) {
      const file = input.files[0]

      return new Promise((resolve, reject) => {
        if (!file) {
          return resolve()
        }

        return new Compressor(file, {
          quality: 0.6,
          maxWidth: 300,
          maxHeight: 300,
          success: blob => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          },
          error: error => reject(error)
        })
      })
    },

    studentSave (event) {
      this.$emit('loading')

      const form = event.target

      const student = {
        name: form.querySelector('[name=name]').value,
        active: true
      }

      const imageInput = form.querySelector('[name=image]')
      return this.getImage(imageInput).then(image =>
        this.$store.dispatch('students/create', { ...student, image })
      ).then(student => {
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

    grade (gradeId) {
      return this.orderedGrades.find(grade =>
        grade.id === gradeId
      )
    },

    studentToggle (studentId) {
      this.$emit('loading')

      const studentGrade = this.studentGrade(studentId)
      const today = new Date().toISOString().slice(0, 10)
      const now = new Date().toISOString().slice(0, 19) + '-03:00'
      const disabledAt = studentGrade.disabled_at ? new Date(studentGrade.disabled_at).toISOString().slice(0, 10) : null
      const isActive = !disabledAt || disabledAt > today
      const studentGradeUpdate = {
        ...studentGrade,
        disabled_at: isActive ? now : null
      }

      return this.$store.dispatch('student_grades/update', studentGradeUpdate).then(() => {
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

    studentUpdate (event) {
      this.$emit('loading')

      const form = event.target

      const student = {
        ...this.currentStudent,
        name: form.querySelector('[name=name]').value
      }

      const currentStudentGrade = this.studentGrade(student.id)

      const studentGrade = {
        ...currentStudentGrade,
        number: form.querySelector('[name=number]').value
      }

      const imageInput = form.querySelector('[name=image]')
      return this.getImage(imageInput).then(image =>
        student.name !== this.currentStudent.name || image
          ? this.$store.dispatch('students/update', { ...student, image })
          : null
      ).then(() =>
        studentGrade.number !== currentStudentGrade.number
          ? this.$store.dispatch('student_grades/update', studentGrade)
          : null
      ).then(() => {
        this.$emit('notify', 'Sucesso!', 'Estudante cadastrado com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível cadastrar o estudante.', 'danger')
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
