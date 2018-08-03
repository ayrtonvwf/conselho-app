<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Avaliar - {{ current_council.name }}</h1>
    <article class="box">
      <div class="box-body">
        <form action="#" data-success="Avaliação salva com sucesso" data-error="Não foi possível salvar a avaliação" @submit="evaluation_save"><br>
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
              <div class="row justify-content-center">
                <div class="input col-12 col-sm-6">
                  <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                    <option value="" selected hidden disabled>Selecione...</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id" v-if="teachers.find(teacher => teacher.user_id === user.id && teacher.grade_id === grade.id) !== undefined">{{ grade.name }}</option>
                  </select>
                  <label for="current_grade_id">Turma</label>
                </div>
                <div class="input col-12 col-sm-6">
                  <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                    <option value="" hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                    <option v-for="subject in subjectsInGrade" :key="subject.id" v-if="grade_subjects.find(grade_subject => grade_subject.subject_id === subject.id && grade_subject.grade_id === current_grade_id && teachers.find(teacher => teacher.user_id === user.id && teacher.subject_id === subject.id && teacher.grade_id === current_grade_id))" :selected="subjectsInGrade.filter(subject => grade_subjects.find(grade_subject => grade_subject.subject_id === subject.id && teachers.find(teacher => teacher.user_id === user.id && teacher.subject_id === subject.id))).length === 1" :value="subject.id">{{ subject.name }}</option>
                  </select>
                  <label for="current_subject_id">Disciplina</label>
                </div>
              </div>
            </div>
          </div><br>
          <div v-if="current_subject_id">
            <div class="text-center">
              <label>
                <input type="checkbox" v-model="hide_evaluated_students"> Mostrar apenas alunos não avaliados
              </label>
            </div><br>
            <div class="table">
              <table>
                <thead>
                <tr>
                  <th style="max-width: 33vw">Aluno</th>
                  <th v-for="topic in current_topics" :key="topic.id">{{ topic.name }}</th>
                  <th>Observações Gerais</th>
                  <th></th>
                </tr>
                </thead>
                <tbody v-if="evaluations.length">
                <tr v-for="student in studentsInGrade" :key="student.id" :data-student_id="student.id" v-if="!hide_evaluated_students || !studentHasEvaluation(student.id)">
                  <template v-if="!hide_evaluated_students && !studentIsActive(student.id)">
                    <td class="text-striked">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                    <td v-for="topic in current_topics" :key="topic.id">-</td>
                    <td>-</td>
                    <td>-</td>
                  </template>
                  <template v-else-if="studentIsActive(student.id)">
                    <td>
                      {{ studentGrade(student.id).number }} - {{ student.name }}
                      <span class="text-muted" v-if="!studentHasEvaluation(student.id)"> (não avaliado)</span>
                    </td>
                    <td v-for="topic in current_topics" :key="topic.id">
                      <select required @change="set_confirm_redirect" :data-topic_id="topic.id" v-model="current_evaluations.find(evaluation => evaluation.student_id === student.id && evaluation.topic_id === topic.id).topic_option_id">
                        <option v-for="topic_option in topicOptions(topic.id)" :key="topic_option.id" :value="topic_option.id">{{ topic_option.name }}</option>
                      </select>
                    </td>
                    <td>
                      <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-if="student_observations.find(student_observation => student_observation.student_id === student.id && student_observation.grade_id === current_grade_id && student_observation.subject_id === current_subject_id && student_observation.council_id === current_council.id && student_observation.user_id === user.id) !== undefined" v-model="student_observations.find(student_observation => student_observation.student_id === student.id && student_observation.grade_id === current_grade_id && student_observation.subject_id === current_subject_id && student_observation.council_id === current_council.id && student_observation.user_id === user.id).description"></textarea>
                      <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-else placeholder="Conteúdos não assimilados e ações efetivadas"></textarea>
                    </td>
                    <td>
                      <a class="btn-success btn-sm tooltip tooltip-end" type="button" title="Salvar avaliação do aluno" @click="student_evaluation_save(student.id)">
                        <div class="material-icons">check</div>
                      </a>
                    </td>
                  </template>
                </tr>
                </tbody>
              </table>
            </div><br>
            <div class="row">
              <div class="col-md-8">
                <textarea class="resize-v" name="grade_observation" style="min-width: 300px" minlength="3" placeholder="Observações da turma" v-if="grade_observations.find(grade_observation => grade_observation.grade_id === current_grade_id && grade_observation.subject_id === current_subject_id && grade_observation.council_id === current_council.id && grade_observation.user_id === user.id) !== undefined" v-model="grade_observations.find(grade_observation=> grade_observation.grade_id === current_grade_id && grade_observation.subject_id === current_subject_id && grade_observation.council_id === current_council.id && grade_observation.user_id === user.id).description"></textarea>
                <textarea class="resize-v" name="grade_observation" style="min-width: 300px" minlength="3" placeholder="Observações da turma" v-else></textarea>
              </div>
              <div class="col-md-4 text-right">
                <button class="btn-lg btn-success" type="submit">
                  <div class="material-icons">check</div> Salvar
                </button>
              </div>
            </div>
          </div>
          <div class="text-center text-muted" v-else><br>
            <div class="h4">Selecione uma {{ current_grade_id ? 'disciplina' : 'turma' }} para avaliar.</div><br>
          </div>
        </form>
      </div>
    </article>
  </div>
</template>

<script>
/* eslint-disable */
import superTable from '../assets/superTable'

export default {
  name: 'Evaluate',
  data: function() {
    let data = this.$parent.$data
    let council_id = parseInt(this.$route.params.id)
    data.current_council = data.councils.find(council => council.id === council_id)
    data.current_evaluations = []
    data.current_student_observations = []
    data.current_student_grades = []
    data.current_topics = data.topics.filter(topic =>
      data.council_topics.find(council_topic =>
        council_topic.topic_id === topic.id &&
        council_topic.council_id === data.current_council.id
      ) !== undefined
    )
    data.ordered_topic_options = data.topic_options.sort((a, b) => Math.sign(parseInt(a.value) - parseInt(b.value)))
    return data
  },
  watch: {
    current_grade_id: function() { this.update_current() },
    current_subject_id: function() { this.update_current() }
  },
  computed: {
    studentsInGrade () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.students
        .filter(student => this.studentGrade(student.id) !== undefined)
        .sort((a, b) => {
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
    },
    currentGrade () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.grades.find(grade => parseInt(grade.id) === parseInt(this.current_grade_id))
    },
    subjectsInGrade () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.subjects.filter(subject =>
        this.grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id &&
          grade_subject.grade_id === this.current_grade_id
        )
      )
    },
    gradeObservations () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.grade_observations.filter(grade_observation =>
        grade_observation.grade_id === this.current_grade_id &&
        grade_observation.council_id === this.current_council.id &&
        (
          !this.current_subject_id ||
          grade_observation.subject_id === this.current_subject_id
        )
      )
    }
  },
  methods: {
    set_confirm_redirect() {
      window.onbeforeunload = event => {
        let dialogText = 'Tem certeza que deseja sair da página? Você perderá o que não foi salvo'
        event.returnValue = dialogText
        return dialogText
      }
    },
    update_current() {
      if (!this.current_grade_id || !this.current_subject_id) {
        this.current_evaluations = []
        this.current_student_observations = []
        this.current_student_grades = []
        return
      }

      this.current_student_observations = this.student_observations.filter(student_observation =>
        student_observation.council_id === this.current_council.id &&
        student_observation.grade_id === this.current_grade_id &&
        student_observation.subject_id === this.current_subject_id &&
        student_observation.user_id === this.user.id
      )

      this.current_student_grades = this.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      let evaluations = this.evaluations.filter(evaluation =>
        evaluation.council_id === this.current_council.id &&
        evaluation.grade_id === this.current_grade_id &&
        evaluation.subject_id === this.current_subject_id &&
        evaluation.user_id === this.user.id
      ).map(evaluation => {
        let topic_option = this.topic_options.find(topic_option =>
          topic_option.id === evaluation.topic_option_id
        )
        evaluation.topic_id = topic_option.topic_id
        return evaluation
      })

      let missing_evaluations = []

      this.studentsInGrade.forEach(student => {
        this.current_topics.forEach(topic => {
          let evaluation = evaluations.find(evaluation =>
            evaluation.student_id === student.id &&
            evaluation.topic_id === topic.id
          )
          if (evaluation) {
            return
          }
          missing_evaluations.push({
            student_id: student.id,
            topic_id: topic.id,
            topic_option_id: topic.topic_option_id,
            council_id: this.current_council.id,
            user_id: this.user.id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id
          })
        })
      })

      this.current_evaluations = evaluations.concat(missing_evaluations)

      setTimeout(superTable, 1000)
    },
    studentGrade (student_id) {
      return this.current_student_grades.find(student_grade =>
        student_grade.student_id === student_id
      )
    },
    studentHasEvaluation (student_id) {
      return !!this.current_evaluations.find(evaluation =>
        evaluation.id &&
        evaluation.student_id === student_id
      )
    },
    studentIsActive (student_id) {
      return this.studentGrade(student_id).end_date > new Date().toISOString().slice(0, 10)
    },
    topicOptions(topic_id) {
      return this.ordered_topic_options.filter(topic_option => topic_option.topic_id === topic_id)
    },
    student_evaluation_save (student_id) {
      let component = this
      let app = this.$parent

      app.loading = true

      let save_promises = []

      let evaluations = component.current_evaluations.filter(evaluation => evaluation.student_id === student_id)

      evaluations.forEach(evaluation => {
        save_promises.push(app.save_resource('evaluation', evaluation, true, false))
      })

      let student_observation = document.querySelector('tr[data-student_id="' + student_id + '"] textarea').value

      if (student_observation.length) {
        let previous_observation = component.current_student_observations.find(existent_observation =>
          existent_observation.student_id === student_id
        )

        if (!previous_observation || previous_observation.description !== student_observation) {
          save_promises.push(app.save_resource('student_observation', {
            council_id: app.current_council.id,
            grade_id: app.current_grade_id,
            subject_id: app.current_subject_id,
            user_id: app.user.id,
            student_id: student_id,
            description: student_observation,
            id: previous_observation ? previous_observation.id : null
          }))
        }
      }

      return Promise.all(save_promises).then(() => {
        app.notify('Sucesso!', 'A avaliação do aluno foi salva com sucesso!', 'success')
      }).catch(error => {
        app.notify('Erro!', 'Não foi possível salvar a avaliação do aluno', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    },
    evaluation_save (event) {
      event.preventDefault()

      let component = this
      let app = this.$parent

      let form = event.target

      let evaluations = component.current_evaluations
      let student_observations = []

      let student_rows = form.querySelectorAll('[data-student_id]')
      student_rows.forEach(student_row => {
        let student_observation = student_row.querySelector('textarea')
        if (!student_observation || !student_observation.value) {
          return
        }
        student_observation = student_observation.value

        let previous_observation = component.current_student_observations.find(existent_observation =>
          existent_observation.student_id === parseInt(student_row.dataset.student_id)
        )

        if (previous_observation && previous_observation.description === student_observation) {
          return
        }

        student_observations.push({
          council_id: app.current_council.id,
          grade_id: app.current_grade_id,
          subject_id: app.current_subject_id,
          user_id: app.user.id,
          student_id: parseInt(student_row.dataset.student_id),
          description: student_observation,
          id: previous_observation ? previous_observation.id : null
        })
      })

      let grade_observation_description = form.querySelector('[name=grade_observation]').value

      app.loading = true

      let save_promises = []

      if (grade_observation_description.length) {
        let previous_grade_observation = app.grade_observations.find(grade_observation =>
          grade_observation.council_id === app.current_council.id &&
          grade_observation.grade_id === app.current_grade_id &&
          grade_observation.subject_id === app.current_subject_id &&
          grade_observation.user_id === app.user.id
        )

        if (!previous_grade_observation || !previous_grade_observation.description === grade_observation_description) {
          save_promises.push(app.save_resource('grade_observation', {
            council_id: app.current_council.id,
            grade_id: app.current_grade_id,
            subject_id: app.current_subject_id,
            user_id: app.user.id,
            description: grade_observation_description,
            id: previous_grade_observation ? previous_grade_observation.id : null
          }))
        }
      }

      evaluations.forEach(evaluation => {
        save_promises.push(app.save_resource('evaluation', evaluation, true, false))
      })
      student_observations.forEach(student_observation => {
        save_promises.push(app.save_resource('student_observation', student_observation))
      })

      return Promise.all(save_promises).then(() => {
        app.notify('Sucesso!', form.dataset.success, 'success')
        window.onbeforeunload = undefined
      }).catch(error => {
        app.notify('Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        app.loading = false
        component.$forceUpdate()
      })
    }
  },
  created: function() {
    let council_id = parseInt(this.$route.params.id)
    this.current_council = this.councils.find(council => council.id === council_id)
    this.current_evaluations = []
    this.current_student_observations = []
    this.current_student_grades = []
    this.current_topics = this.topics.filter(topic =>
      this.council_topics.find(council_topic =>
        council_topic.topic_id === topic.id &&
        council_topic.council_id === this.current_council.id
      ) !== undefined
    )
    this.ordered_topic_options = this.topic_options.sort((a, b) => Math.sign(parseInt(a.value) - parseInt(b.value)))

    this.current_grade_id = ''
    this.current_subject_id = ''
    this.hide_evaluated_students = false
  }
}
</script>
