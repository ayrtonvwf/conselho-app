<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Avaliar - {{ council.name }}</h1>
    <article class="box">
      <div class="box-body">
        <form action="#" data-success="Avaliação salva com sucesso" data-error="Não foi possível salvar a avaliação" @submit.prevent="evaluation_save"><br>
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
              <div class="row justify-content-center">
                <div class="input col-12 col-sm-6">
                  <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                    <option value="" selected hidden disabled>Selecione...</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                  </select>
                  <label for="current_grade_id">Turma</label>
                </div>
                <div class="input col-12 col-sm-6">
                  <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                    <option value="" hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                    <option v-for="subject in current_subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
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
            <super-table>
              <thead>
                <tr>
                  <th style="max-width: 33vw">Aluno</th>
                  <th v-for="topic in topics" :key="topic.id">{{ topic.name }}</th>
                  <th>Observações Gerais</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-if="current_evaluations.length">
                <tr v-for="student in current_students" :key="student.id" :data-student_id="student.id" v-if="!hide_evaluated_students || !studentHasEvaluation(student.id)">
                  <template v-if="!hide_evaluated_students && !studentIsActive(student.id)">
                    <td class="text-striked">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                    <td v-for="topic in topics" :key="topic.id">-</td>
                    <td>-</td>
                    <td>-</td>
                  </template>
                  <template v-else-if="studentIsActive(student.id)">
                    <td>
                      {{ studentGrade(student.id).number }} - {{ student.name }}
                      <span class="text-muted" v-if="!studentHasEvaluation(student.id)"> (não avaliado)</span>
                    </td>
                    <td v-for="topic in topics" :key="topic.id">
                      <select required @change="set_confirm_redirect" :data-topic_id="topic.id" v-model="current_evaluations.find(evaluation => evaluation.student_id === student.id && evaluation.topic_id === topic.id).topic_option_id">
                        <option v-for="topic_option in topicOptions(topic.id)" :key="topic_option.id" :value="topic_option.id">{{ topic_option.name }}</option>
                      </select>
                    </td>
                    <td>
                      <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-if="current_student_observations.find(student_observation => student_observation.student_id === student.id)" v-model="current_student_observations.find(student_observation => student_observation.student_id === student.id).description"></textarea>
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
            </super-table>
            <br>
            <div class="row">
              <div class="col-md-8">
                <textarea class="resize-v" name="grade_observation" style="min-width: 300px" minlength="3" placeholder="Observações da turma" v-if="current_grade_observation" v-model="current_grade_observation.description"></textarea>
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
            <div class="h4">Selecione uma <b>{{ current_grade_id ? 'disciplina' : 'turma' }}</b> para avaliar.</div><br>
          </div>
        </form>
      </div>
    </article>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'Evaluate',
  data: function() {
    return {
      council: {},
      council_topics: [],
      council_grades: [],
      topics: [], // only the ones in the council
      grades: [], // only related to the current user and in the council
      subjects: [], // only related to the current user
      teachers: [], // only related to the current user,
      students: [], // only related to the current user
      evaluations: [], // only related to the current user and in the council
      student_observations: [], // only related to the current user and in the council
      grade_observations: [], // only related to the current user and in the council
      grade_subjects: [],
      student_grades: [],
      topic_options: [],

      hide_evaluated_students: false,

      current_user_id: undefined,
      current_grade_id: '',
      current_subject_id: '',
      current_student_grades: [],
      current_students: [],
      current_subjects: [],
      current_evaluations: [],
      current_student_observations: [],
      current_grade_observation: undefined
    }
  },
  watch: {
    current_grade_id() {
      this.current_subject_id = ''

      if (!this.current_grade_id) {
        this.current_students = []
        this.current_subjects = []
        return
      }

      this.current_student_grades = this.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      this.current_students = this.students.filter(student =>
        this.current_student_grades.find(student_grade =>
          student_grade.student_id === student.id
        )
      )

      this.current_subjects = this.subjects.filter(subject =>
        this.teachers.find(teacher =>
          teacher.grade_id === this.current_grade_id &&
          teacher.subject_id === subject.id
        )
      )

      if (this.current_subjects.length === 1) {
        this.current_subject_id = this.current_subjects[0].id
      }
    },
    current_subject_id() {
      if (!this.current_subject_id) {
        this.current_evaluations = []
        this.current_student_observations = []
        this.current_grade_observation = undefined
        return
      }

      let evaluations = this.evaluations.filter(evaluation =>
        evaluation.grade_id === this.current_grade_id &&
        evaluation.subject_id === this.current_subject_id
      )
      this.current_students.forEach(student => {
        this.topics.forEach(topic => {
          let evaluation = evaluations.find(evaluation =>
            evaluation.student_id === student.id &&
            evaluation.topic_id === topic.id
          )
          if (evaluation) {
            return
          }

          // create pre-evaluations
          evaluations.push({
            user_id: this.current_user_id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            council_id: this.council.id,
            topic_id: topic.id,
            student_id: student.id,
            topic_option_id: topic.topic_option_id
          })
        })
      })
      this.current_evaluations = evaluations

      this.current_student_observations = this.student_observations.filter(student_observation =>
        student_observation.grade_id === this.current_grade_id &&
        student_observation.subject_id === this.current_subject_id
      )

      this.current_grade_observation = this.grade_observations.find(grade_observation =>
        grade_observation.grade_id === this.current_grade_id &&
        grade_observation.subject_id === this.current_subject_id
      )
    }
  },
  computed: {
    currentGrade () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.grades.find(grade => parseInt(grade.id) === parseInt(this.current_grade_id))
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
      return this.topic_options.filter(topic_option => topic_option.topic_id === topic_id)
    },
    student_evaluation_save (student_id) {
      this.$emit('loading')

      let app = this.$parent

      let save_promises = []

      let evaluations = this.current_evaluations.filter(evaluation =>
        evaluation.student_id === student_id
      )

      evaluations.forEach(evaluation => {
        let prev_evaluation = evaluation
        save_promises.push(app.save_resource('evaluation', evaluation, true, false).then(evaluation => {
          let current_index = this.current_evaluations.findIndex(current_evaluation =>
            (
              prev_evaluation.id &&
              current_evaluation.id === prev_evaluation.id
            ) || (
              current_evaluation.topic_id === prev_evaluation.topic_id &&
              current_evaluation.student_id === prev_evaluation.student_id
            )
          )
          this.$set(this.current_evaluations, current_index, evaluation)

          if (!prev_evaluation.id) {
            this.evaluations.push(evaluation)
            return
          }

          let index = this.evaluations.findIndex(evaluation =>
            evaluation.id === prev_evaluation.id
          )
          this.$set(this.evaluations, index, evaluation)
        }))
      })

      let observation = document.querySelector('tr[data-student_id="' + student_id + '"] textarea').value

      if (observation.length) {
        let previous_observation = this.current_student_observations.find(existent_observation =>
          existent_observation.student_id === student_id
        )

        if (!previous_observation || previous_observation.description !== observation) {
          let student_observation = {
            council_id: this.council.id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            user_id: this.current_user_id,
            student_id: student_id,
            description: observation,
            id: previous_observation ? previous_observation.id : null
          }
          save_promises.push(app.save_resource('student_observation', student_observation, true, false).then(student_observation => {
            if (!previous_observation) {
              this.student_observations.push(student_observation)
              this.current_student_observations.push(student_observation)
              return
            }

            let index = this.student_observations.findIndex(student_observation =>
              student_observation.id === previous_observation.id
            )
            this.$set(this.student_observations, index, student_observation)

            let current_index = this.current_student_observations.findIndex(current_student_observation =>
              current_student_observation.id === previous_observation.id
            )
            this.$set(this.current_student_observations, current_index, student_observation)
          }))
        }
      }

      return Promise.all(save_promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'A avaliação do aluno foi salva com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível salvar a avaliação do aluno', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },
    evaluation_save (event) {
      this.$emit('loading')

      let app = this.$parent

      let form = event.target

      let save_promises = []

      let student_rows = form.querySelectorAll('[data-student_id]')
      student_rows.forEach(student_row => {
        let observation = student_row.querySelector('textarea')
        if (!observation || !observation.value) {
          return
        }
        observation = observation.value

        let previous_observation = this.current_student_observations.find(existent_observation =>
          existent_observation.student_id === parseInt(student_row.dataset.student_id)
        )

        if (previous_observation && previous_observation.description === student_observation) {
          return
        }

        let student_observation = {
          council_id: this.council.id,
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          student_id: parseInt(student_row.dataset.student_id),
          description: observation,
          id: previous_observation ? previous_observation.id : null
        }
        save_promises.push(app.save_resource('student_observation', student_observation, true, false).then(student_observation => {
          if (!previous_observation) {
            this.student_observations.push(student_observation)
            this.current_student_observations.push(student_observation)
            return
          }

          let index = this.student_observations.findIndex(student_observation =>
            student_observation.id === previous_observation.id
          )
          this.$set(this.student_observations, index, student_observation)

          let current_index = this.current_student_observations.findIndex(current_student_observation =>
            current_student_observation.id === previous_observation.id
          )
          this.$set(this.current_student_observations, current_index, student_observation)
        }))
      })

      let grade_observation_description = form.querySelector('[name=grade_observation]').value

      if (grade_observation_description.length) {
        let grade_observation = {
          council_id: this.council.id,
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          description: grade_observation_description,
          id: this.current_grade_observation ? this.current_grade_observation.id : null
        }
        save_promises.push(app.save_resource('grade_observation', grade_observation, true, false).then(grade_observation => {
          if (this.current_grade_observation) {
            let index = this.grade_observations.findIndex(grade_observation =>
              grade_observation.id === this.current_grade_observation.id
            )
            this.$set(this.grade_observations, index, grade_observation)
          } else {
            this.grade_observations.push(grade_observation)
          }

          this.current_grade_observation = grade_observation
        }))
      }

      this.current_evaluations.forEach(evaluation => {
        let prev_evaluation = evaluation
        save_promises.push(app.save_resource('evaluation', evaluation, true, false).then(evaluation => {
          let current_index = this.current_evaluations.findIndex(evaluation =>
            (
              prev_evaluation.id &&
              evaluation.id === prev_evaluation.id
            ) || (
              evaluation.topic_id === prev_evaluation.topic_id &&
              evaluation.student_id === prev_evaluation.student_id
            )
          )
          this.$set(this.current_evaluations, current_index, evaluation)

          if (!prev_evaluation.id) {
            this.evaluations.push(evaluation)
            return
          }

          let index = this.evaluations.findIndex(evaluation =>
            evaluation.id === prev_evaluation.id
          )
          this.$set(this.evaluations, index, evaluation)
        }))
      })

      return Promise.all(save_promises).then(() => {
        this.$emit('notify', 'Sucesso!', form.dataset.success, 'success')
        window.onbeforeunload = undefined
      }).catch(error => {
        this.$emit('notify', 'Erro!', form.dataset.error, 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },
  beforeCreate() {
    this.$emit('loading')
  },
  created: function() {
    this.council = {}
    this.council_topics = []
    this.council_grades = []
    this.topics = []
    this.grades = []
    this.subjects = []
    this.teachers = []
    this.students = []
    this.evaluations = []
    this.student_observations = []
    this.grade_observations = []
    this.grade_subjects = []
    this.student_grades = []
    this.topic_options = []

    this.hide_evaluated_students = false

    this.current_user_id = this.$parent.token.user_id
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_student_grades = []
    this.current_students = []
    this.current_subjects = []
    this.current_evaluations = []
    this.current_student_observations = []
    this.current_grade_observation = undefined

    let council_id = parseInt(this.$route.params.id)
    let db = this.$parent.db
    let promises = []
    promises.push(db.councils.get(council_id).then(council =>
      this.council = council
    ))
    promises.push(db.council_topics.toArray().then(council_topics =>
      this.council_topics = council_topics.filter(council_topic =>
        council_topic.council_id === council_id
      )
    ))
    promises.push(db.council_grades.toArray().then(council_grades =>
      this.council_grades = council_grades.filter(council_grade =>
        council_grade.council_id === council_id
      )
    ))
    promises.push(db.topics.toArray().then(topics =>
      this.topics = topics
    ))
    promises.push(db.grades.toArray().then(grades =>
      this.grades = grades
    ))
    promises.push(db.subjects.toArray().then(subjects =>
      this.subjects = subjects
    ))
    promises.push(db.teachers.toArray().then(teachers =>
      this.teachers = teachers.filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    ))
    promises.push(db.students.toArray().then(students =>
      this.students = students
    ))
    promises.push(db.evaluations.toArray().then(evaluations =>
      this.evaluations = evaluations.filter(evaluation =>
        evaluation.council_id === council_id &&
        evaluation.user_id === this.current_user_id
      )
    ))
    promises.push(db.student_observations.toArray().then(student_observations =>
      this.student_observations = student_observations.filter(student_observation =>
        student_observation.council_id === council_id &&
        student_observation.user_id === this.current_user_id
      )
    ))
    promises.push(db.grade_observations.toArray().then(grade_observations =>
      this.grade_observations = grade_observations.filter(grade_observation =>
        grade_observation.council_id === council_id &&
        grade_observation.user_id === this.current_user_id
      )
    ))
    promises.push(db.grade_subjects.toArray().then(grade_subjects =>
      this.grade_subjects = grade_subjects
    ))
    promises.push(db.student_grades.toArray().then(student_grades =>
      this.student_grades = student_grades
    ))
    promises.push(db.topic_options.toArray().then(topic_options =>
      this.topic_options = topic_options
    ))

    Promise.all(promises).then(() => {
      this.topics = this.topics.filter(topic =>
        this.council_topics.find(council_topic =>
          council_topic.topic_id === topic.id // only topics in this council
        )
      )

      this.topic_options = this.topic_options.filter(topic_option =>
        this.topics.find(topic =>
          topic.id === topic_option.topic_id // only topic_options of the topics in this council
        )
      ).sort((a, b) =>
        Math.sign(a.value - b.value)
      )

      this.grades = this.grades.filter(grade =>
        this.council_grades.find(council_grade =>
          council_grade.grade_id === grade.id // only the grades in the council
        ) &&
        this.teachers.find(teacher =>
          teacher.grade_id === grade.id // only the grades that the user teaches to
        )
      ).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )

      this.subjects = this.subjects.filter(subject =>
        this.teachers.find(teacher =>
          teacher.subject_id === subject.id &&
          this.grades.find(grade =>
            grade.id === teacher.grade_id // only subjects that the user teaches to some grade
          )
        )
      ).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )

      this.grade_subjects = this.grade_subjects.filter(grade_subject =>
        this.grades.find(grade =>
          grade.id === grade_subject.grade_id
        ) &&
        this.subjects.find(subject =>
          subject.id === grade_subject.subject_id // only grade_subjects from grades and subjects that the user teaches
        )
      )

      this.student_grades = this.student_grades.filter(student_grade =>
        this.grades.find(grade =>
          grade.id === student_grade.grade_id // only student_grades of grades that the user teaches to
        )
      ).sort((a, b) => Math.sign(a.number - b.number))

      this.students = this.students.filter(student =>
        this.student_grades.find(student_grade =>
          student_grade.student_id === student.id  // only student in grades that the user teaches to
        )
      ).sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { ignorePunctuation: true })
      )

      this.$emit('loaded')
    })
  }
}
</script>
