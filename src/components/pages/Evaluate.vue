<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Avaliar - {{ current_council.name }}</h1>
    <article class="box">
      <div class="box-body">
        <form action="#" data-success="Avaliação salva com sucesso" data-error="Não foi possível salvar a avaliação" @submit.prevent="evaluation_save"><br>
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
              <div class="row justify-content-center">
                <div class="input col-12 col-sm-6">
                  <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                    <option value="" selected hidden disabled>Selecione...</option>
                    <option v-for="grade in current_grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
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
                  <th v-for="topic in current_topics" :key="topic.id">{{ topic.name }}</th>
                  <th>Observações Gerais</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-if="current_evaluations.length">
                <tr v-for="student in current_students" :key="student.id" :data-student_id="student.id" v-if="!hide_evaluated_students || !studentHasEvaluation(student.id)">
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
/* eslint camelcase: 0 */
export default {
  name: 'Evaluate',
  data () {
    return {
      hide_evaluated_students: false,

      current_council: {},
      current_topics_options: [],
      current_topics: [],
      current_grades: [],
      current_user_subjects: [],
      current_teachers: [],
      current_user_student_grades: [],
      current_user_students: [],
      current_user_evaluations: [],
      current_user_student_observations: [],
      current_user_grade_observations: [],

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
    current_grade_id () {
      this.current_subject_id = ''

      if (!this.current_grade_id) {
        this.current_student_grades = []
        this.current_students = []
        this.current_subjects = []
        return
      }

      this.current_student_grades = this.current_user_student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      this.current_students = this.current_user_students.filter(student =>
        this.current_student_grades.find(student_grade =>
          student_grade.student_id === student.id
        )
      )

      this.current_subjects = this.current_user_subjects.filter(subject =>
        this.current_teachers.find(teacher =>
          teacher.grade_id === this.current_grade_id &&
          teacher.subject_id === subject.id
        )
      )

      if (this.current_subjects.length === 1) {
        this.current_subject_id = this.current_subjects[0].id
      }
    },
    current_subject_id () {
      if (!this.current_subject_id) {
        this.current_evaluations = []
        this.current_student_observations = []
        this.current_grade_observation = undefined
        return
      }

      const current_evaluations = this.current_user_evaluations.filter(evaluation =>
        evaluation.grade_id === this.current_grade_id &&
        evaluation.subject_id === this.current_subject_id
      ).map(evaluation => {
        evaluation.topic_id = this.current_topics.find(topic =>
          this.current_topic_options.find(topic_option =>
            topic_option.id === evaluation.topic_option_id &&
            topic_option.topic_id === topic.id
          )
        ).id
        return evaluation
      })
      this.current_students.forEach(student => {
        this.current_topics.forEach(topic => {
          const evaluation = current_evaluations.find(evaluation =>
            evaluation.student_id === student.id &&
            evaluation.topic_id === topic.id
          )
          if (evaluation) {
            return
          }

          // create pre-current_user_evaluations
          current_evaluations.push({
            user_id: this.current_user_id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            council_id: this.current_council.id,
            topic_id: topic.id,
            student_id: student.id,
            topic_option_id: topic.topic_option_id
          })
        })
      })
      this.current_evaluations = current_evaluations

      this.current_student_observations = this.current_user_student_observations.filter(student_observation =>
        student_observation.grade_id === this.current_grade_id &&
        student_observation.subject_id === this.current_subject_id
      )

      this.current_grade_observation = this.current_user_grade_observations.find(grade_observation =>
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
      return this.current_grades.find(grade =>
        grade.id === this.current_grade_id
      )
    }
  },
  methods: {
    set_confirm_redirect () {
      window.onbeforeunload = event => {
        const dialogText = 'Tem certeza que deseja sair da página? Você perderá o que não foi salvo'
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
    topicOptions (topic_id) {
      return this.current_topic_options.filter(topic_option =>
        topic_option.topic_id === topic_id
      )
    },
    student_evaluation_save (student_id) {
      this.$emit('loading')

      const save_promises = []

      const current_user_evaluations = this.current_evaluations.filter(evaluation =>
        evaluation.student_id === student_id
      )

      current_user_evaluations.forEach(evaluation => {
        const prev_evaluation = evaluation
        const save_resource = {
          resource_name: 'evaluation',
          data: evaluation
        }
        save_promises.push(this.$store.dispatch('save_resource', save_resource).then(evaluation => {
          const current_index = this.current_evaluations.findIndex(current_evaluation =>
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
            this.current_user_evaluations.push(evaluation)
            return
          }

          const index = this.current_user_evaluations.findIndex(evaluation =>
            evaluation.id === prev_evaluation.id
          )
          this.$set(this.current_user_evaluations, index, evaluation)
        }))
      })

      const observation = document.querySelector('tr[data-student_id="' + student_id + '"] textarea').value

      if (observation.length) {
        const previous_observation = this.current_student_observations.find(existent_observation =>
          existent_observation.student_id === student_id
        )

        if (!previous_observation || previous_observation.description !== observation) {
          const save_resource = {
            resource_name: 'student_observation',
            data: {
              council_id: this.current_council.id,
              grade_id: this.current_grade_id,
              subject_id: this.current_subject_id,
              user_id: this.current_user_id,
              student_id: student_id,
              description: observation,
              id: previous_observation ? previous_observation.id : null
            }
          }
          save_promises.push(this.$store.dispatch('save_resource', save_resource).then(student_observation => {
            if (!previous_observation) {
              this.current_user_student_observations.push(student_observation)
              this.current_student_observations.push(student_observation)
              return
            }

            const index = this.current_user_student_observations.findIndex(student_observation =>
              student_observation.id === previous_observation.id
            )
            this.$set(this.current_user_student_observations, index, student_observation)

            const current_index = this.current_student_observations.findIndex(current_student_observation =>
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

      const form = event.target

      const save_promises = []

      const student_rows = form.querySelectorAll('[data-student_id]')
      student_rows.forEach(student_row => {
        let observation = student_row.querySelector('textarea')
        if (!observation || !observation.value) {
          return
        }
        observation = observation.value

        const previous_observation = this.current_student_observations.find(existent_observation =>
          existent_observation.student_id === parseInt(student_row.dataset.student_id)
        )

        if (previous_observation && previous_observation.description === observation) {
          return
        }

        const save_resource = {
          resource_name: 'student_observation',
          data: {
            council_id: this.current_council.id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            user_id: this.current_user_id,
            student_id: parseInt(student_row.dataset.student_id),
            description: observation,
            id: previous_observation ? previous_observation.id : null
          }
        }
        save_promises.push(this.$store.dispatch('save_resource', save_resource).then(student_observation => {
          if (!previous_observation) {
            this.current_user_student_observations.push(student_observation)
            this.current_student_observations.push(student_observation)
            return
          }

          const index = this.current_user_student_observations.findIndex(student_observation =>
            student_observation.id === previous_observation.id
          )
          this.$set(this.current_user_student_observations, index, student_observation)

          const current_index = this.current_student_observations.findIndex(current_student_observation =>
            current_student_observation.id === previous_observation.id
          )
          this.$set(this.current_student_observations, current_index, student_observation)
        }))
      })

      const grade_observation_description = form.querySelector('[name=grade_observation]').value

      if (grade_observation_description.length) {
        const save_resource = {
          resource_name: 'grade_observation',
          data: {
            council_id: this.current_council.id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            user_id: this.current_user_id,
            description: grade_observation_description,
            id: this.current_grade_observation ? this.current_grade_observation.id : null
          }
        }
        save_promises.push(this.$store.dispatch('save_resource', save_resource).then(grade_observation => {
          if (this.current_grade_observation) {
            const index = this.current_user_grade_observations.findIndex(grade_observation =>
              grade_observation.id === this.current_grade_observation.id
            )
            this.$set(this.current_user_grade_observations, index, grade_observation)
          } else {
            this.current_user_grade_observations.push(grade_observation)
          }

          this.current_grade_observation = grade_observation
        }))
      }

      this.current_evaluations.forEach(evaluation => {
        const prev_evaluation = evaluation
        const save_resource = {
          resource_name: 'evaluation',
          data: evaluation
        }
        save_promises.push(this.$store.dispatch('save_resource', save_resource).then(evaluation => {
          const current_index = this.current_evaluations.findIndex(evaluation =>
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
            this.current_user_evaluations.push(evaluation)
            return
          }

          const index = this.current_user_evaluations.findIndex(evaluation =>
            evaluation.id === prev_evaluation.id
          )
          this.$set(this.current_user_evaluations, index, evaluation)
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
  created () {
    const council_id = parseInt(this.$route.params.id)

    this.current_user_id = this.$store.state.token.user_id

    this.current_council = this.$store.state.councils.find(council =>
      council.id === council_id
    )
    this.hide_evaluated_students = false

    this.current_topics = this.$store.state.topics.filter(topic =>
      this.$store.state.council_topics.find(council_topic =>
        council_topic.topic_id === topic.id &&
        council_topic.council_id === council_id
      )
    )

    this.current_topic_options = this.$store.state.topic_options.filter(topic_option =>
      this.current_topics.find(topic =>
        topic.id === topic_option.topic_id
      )
    )

    this.current_teachers = this.$store.state.teachers.filter(teacher =>
      teacher.user_id === this.current_user_id
    )

    this.current_grades = this.$store.state.grades.filter(grade =>
      this.current_teachers.find(teacher =>
        teacher.grade_id === grade.id
      ) &&
      this.$store.state.council_grades.find(council_grade =>
        council_grade.grade_id === grade.id &&
        council_grade.council_id === council_id
      )
    )

    this.current_user_subjects = this.$store.state.subjects.filter(subject =>
      this.current_teachers.find(teacher =>
        teacher.subject_id === subject.id
      )
    )

    this.current_user_student_grades = this.$store.state.student_grades.filter(student_grade =>
      this.current_grades.find(grade =>
        grade.id === student_grade.grade_id
      )
    )
    this.current_user_students = this.$store.state.students.filter(student =>
      this.current_user_student_grades.find(student_grade =>
        student_grade.student_id === student.id
      )
    ).map(student => {
      const student_grade = this.current_user_student_grades.find(student_grade =>
        student_grade.student_id === student.id
      )

      student.grade_id = student_grade.grade_id
      student.number = student_grade.number

      return student
    }).sort((a, b) =>
      Math.sign(a.number - b.number)
    )

    this.current_user_evaluations = this.$store.state.evaluations.filter(evaluation =>
      evaluation.council_id === council_id &&
      evaluation.user_id === this.current_user_id
    )
    this.current_user_student_observations = this.$store.state.student_observations.filter(student_observation =>
      student_observation.council_id === council_id &&
      student_observation.user_id === this.current_user_id
    )
    this.current_user_grade_observations = this.$store.state.grade_observations.filter(grade_observation =>
      grade_observation.council_id === council_id &&
      grade_observation.user_id === this.current_user_id
    )

    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_student_grades = []
    this.current_students = []
    this.current_subjects = []
    this.current_evaluations = []
    this.current_student_observations = []
    this.current_grade_observation = undefined
  }
}
</script>
