<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Avaliar - {{ currentCouncil.name }}</h1>
    <article class="box">
      <div class="box-body">
        <form action="#" data-success="Avaliação salva com sucesso" data-error="Não foi possível salvar a avaliação" @submit.prevent="evaluationSave"><br>
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
              <div class="row justify-content-center">
                <div class="input col-12 col-sm-6">
                  <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                    <option value="" selected hidden disabled>Selecione...</option>
                    <option v-for="grade in currentGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
                  </select>
                  <label for="current_grade_id">Turma</label>
                </div>
                <div class="input col-12 col-sm-6">
                  <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                    <option value="" hidden disabled>{{ current_grade_id ? 'Selecione...' : 'Selecione a turma...' }}</option>
                    <option v-for="subject in currentSubjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
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
                  <th v-for="topic in currentTopics" :key="topic.id">{{ topic.name }}</th>
                  <th>Observações Gerais</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-if="currentEvaluations.length">
                <tr v-for="student in currentStudents" :key="student.id" :data-student_id="student.id" v-if="!hide_evaluated_students || !studentHasEvaluation(student.id)">
                  <template v-if="!hide_evaluated_students && !studentIsActive(student.id)">
                    <td class="text-striked">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                    <td v-for="topic in currentTopics" :key="topic.id">-</td>
                    <td>-</td>
                    <td>-</td>
                  </template>
                  <template v-else-if="studentIsActive(student.id)">
                    <td>
                      {{ studentGrade(student.id).number }} - {{ student.name }}
                      <span class="text-muted" v-if="!studentHasEvaluation(student.id)"> (não avaliado)</span>
                    </td>
                    <td v-for="topic in currentTopics" :key="topic.id">
                      <select required @change="setConfirmRedirect" :data-topic_id="topic.id" v-model="currentEvaluations.find(evaluation => evaluation.student_id === student.id && evaluation.topic_id === topic.id).topic_option_id">
                        <option v-for="topic_option in topicOptions(topic.id)" :key="topic_option.id" :value="topic_option.id">{{ topic_option.name }}</option>
                      </select>
                    </td>
                    <td>
                      <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-if="currentStudentObservations.find(student_observation => student_observation.student_id === student.id)" v-model="currentStudentObservations.find(student_observation => student_observation.student_id === student.id).description"></textarea>
                      <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-else placeholder="Conteúdos não assimilados e ações efetivadas"></textarea>
                    </td>
                    <td>
                      <a class="btn-success btn-sm tooltip tooltip-end" type="button" title="Salvar avaliação do aluno" @click="studentEvaluationSave(student.id)">
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
                <textarea class="resize-v" name="grade_observation" style="min-width: 300px" minlength="3" placeholder="Observações da turma" v-if="currentGradeObservation" v-model="currentGradeObservation.description"></textarea>
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
export default {
  name: 'Evaluate',
  data () {
    return {
      hide_evaluated_students: false,
      current_user_id: undefined,
      current_council_id: undefined,
      current_grade_id: '',
      current_subject_id: ''
    }
  },
  computed: {
    currentCouncil () {
      const council = this.$store.getters['councils/getCouncils'].find(council =>
        council.id === this.current_council_id
      )

      return council || {}
    },

    currentCouncilTopics () {
      return this.$store.getters['council_topics/getCouncilTopics'].filter(councilTopic =>
        councilTopic.council_id === this.current_council_id
      )
    },

    currentTopics () {
      return this.$store.getters['topics/getOrderedTopics'].filter(topic =>
        this.currentCouncilTopics.find(councilTopic =>
          councilTopic.topic_id === topic.id
        )
      )
    },

    currentTopicOptions () {
      return this.$store.getters['topic_options/getOrderedTopicOptions'].filter(topicOption =>
        this.currentTopics.find(topic =>
          topic.id === topicOption.topic_id
        )
      )
    },

    currentCouncilGrades () {
      return this.$store.getters['council_grades/getCouncilGrades'].filter(councilGrade =>
        councilGrade.council_id === this.current_council_id
      )
    },

    currentTeachers () {
      return this.$store.getters['teachers/getTeachers'].filter(teacher =>
        teacher.user_id === this.current_user_id
      )
    },

    currentGrades () {
      return this.$store.getters['grades/getOrderedGrades'].filter(grade =>
        this.currentTeachers.find(teacher =>
          teacher.grade_id === grade.id
        ) &&
        this.currentCouncilGrades.find(councilGrade =>
          councilGrade.grade_id === grade.id
        )
      )
    },

    currentUserStudentGrades () {
      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        this.currentGrades.find(grade =>
          grade.id === studentGrade.grade_id
        )
      )
    },

    currentUserStudents () {
      return this.$store.getters['students/getStudents'].filter(student =>
        this.currentUserStudentGrades.find(studentGrade =>
          studentGrade.student_id === student.id
        )
      ).map(student => {
        const studentGrade = this.currentUserStudentGrades.find(studentGrade =>
          studentGrade.student_id === student.id
        )

        student.grade_id = studentGrade.grade_id
        student.number = studentGrade.number

        return student
      }).sort((a, b) =>
        Math.sign(a.number - b.number)
      )
    },

    currentGradeSubjects () {
      return this.$store.getters['grade_subjects/getGradeSubjects'].filter(gradeSubject =>
        this.currentGrades.find(grade =>
          grade.id === gradeSubject.grade_id
        )
      )
    },

    currentUserSubjects () {
      return this.$store.getters['subjects/getOrderedSubjects'].filter(subject =>
        this.currentTeachers.find(teacher =>
          teacher.subject_id === subject.id
        )
      )
    },

    currentUserEvaluations () {
      return this.$store.getters['evaluations/getEvaluations'].filter(evaluation =>
        evaluation.council_id === this.current_council_id &&
        evaluation.user_id === this.current_user_id
      ).map(evaluation => {
        const topicOption = this.currentTopicOptions.find(topicOption =>
          topicOption.id === evaluation.topic_option_id
        )
        evaluation.value = topicOption.value
        evaluation.topic_id = topicOption.topic_id
        return evaluation
      })
    },

    currentUserStudentObservations () {
      return this.$store.getters['student_observations/getStudentObservations'].filter(studentObservation =>
        studentObservation.council_id === this.current_council_id &&
        studentObservation.user_id === this.current_user_id
      )
    },

    currentUserGradeObservations () {
      return this.$store.getters['grade_observations/getGradeObservations'].filter(gradeObservation =>
        gradeObservation.council_id === this.current_council_id &&
        gradeObservation.user_id === this.current_user_id
      )
    },

    currentGrade () {
      if (!this.current_grade_id) {
        return {}
      }

      return this.currentGrades.find(grade =>
        grade.id === this.current_grade_id
      )
    },

    currentStudentGrades () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentUserStudentGrades.filter(studentGrade =>
        studentGrade.grade_id === this.current_grade_id
      )
    },

    currentStudents () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentUserStudents.filter(student =>
        this.currentStudentGrades.find(studentGrade =>
          studentGrade.student_id === student.id
        )
      )
    },

    currentSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentUserSubjects.filter(subject =>
        this.currentTeachers.find(teacher =>
          teacher.grade_id === this.current_grade_id &&
          teacher.subject_id === subject.id
        )
      )
    },

    currentEvaluations () {
      if (!this.current_grade_id || !this.current_subject_id) {
        return []
      }

      const evaluations = this.currentUserEvaluations.filter(evaluation =>
        evaluation.grade_id === this.current_grade_id &&
        evaluation.subject_id === this.current_subject_id
      )

      this.currentStudents.forEach(student => {
        this.currentTopics.forEach(topic => {
          const evaluation = evaluations.find(evaluation =>
            evaluation.student_id === student.id &&
            evaluation.topic_id === topic.id
          )

          if (evaluation) {
            return
          }

          evaluations.push({
            user_id: this.current_user_id,
            council_id: this.current_council_id,
            grade_id: this.current_grade_id,
            subject_id: this.current_subject_id,
            student_id: student.id,
            topic_id: topic.id,
            topic_option_id: topic.topic_option_id
          })
        })
      })

      return evaluations
    },

    currentStudentObservations () {
      if (!this.current_grade_id || !this.current_subject_id) {
        return []
      }

      return this.currentUserStudentObservations.filter(studentObservation =>
        studentObservation.grade_id === this.current_grade_id &&
        studentObservation.subject_id === this.current_subject_id
      )
    },

    currentGradeObservation () {
      if (!this.current_grade_id || !this.current_subject_id) {
        return {}
      }

      return this.currentUserGradeObservations.find(gradeObservation =>
        gradeObservation.grade_id === this.current_grade_id &&
        gradeObservation.subject_id === this.current_subject_id
      )
    }
  },

  watch: {
    current_grade_id () {
      if (this.currentSubjects.length !== 1) {
        this.current_subject_id = ''
        return
      }

      this.current_subject_id = this.currentSubjects[0].id
    }
  },

  methods: {
    setConfirmRedirect () {
      window.onbeforeunload = event => {
        const dialogText = 'Tem certeza que deseja sair da página? Você perderá o que não foi salvo'
        event.returnValue = dialogText
        return dialogText
      }
    },

    unsetConfirmRedirect () {
      window.onbeforeunload = event => {
        const dialogText = undefined
        event.returnValue = dialogText
        return dialogText
      }
    },

    studentGrade (studentId) {
      return this.currentStudentGrades.find(studentGrade =>
        studentGrade.student_id === studentId
      )
    },

    studentHasEvaluation (studentId) {
      return !!this.currentEvaluations.find(evaluation =>
        evaluation.id &&
        evaluation.student_id === studentId
      )
    },

    studentIsActive (studentId) {
      return this.studentGrade(studentId).end_date > new Date().toISOString().slice(0, 10)
    },

    topicOptions (topicId) {
      return this.currentTopicOptions.filter(topicOption =>
        topicOption.topic_id === topicId
      )
    },

    studentEvaluationSave (studentId) {
      this.$emit('loading')

      const promises = []

      const currentStudentEvaluations = this.currentEvaluations.filter(evaluation =>
        evaluation.student_id === studentId
      )

      promises.push(this.$store.dispatch('evaluations/saveMany', currentStudentEvaluations))

      const studentObservationDescription = document.querySelector('tr[data-student_id="' + studentId + '"] textarea').value

      const previousObservation = this.currentStudentObservations.find(studentObservation =>
        studentObservation.student_id === studentId
      )

      if (!studentObservationDescription && previousObservation) {
        promises.push(this.$store.dispatch('student_observations/delete', previousObservation.id))
      } else if (studentObservationDescription) {
        const studentObservation = {
          council_id: this.current_council_id,
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          student_id: studentId,
          description: studentObservationDescription,
          id: previousObservation ? previousObservation.id : null
        }
        const action = studentObservation.id ? 'student_observations/update' : 'student_observations/create'
        promises.push(this.$store.dispatch(action, studentObservation))
      }

      return Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'A avaliação do aluno foi salva com sucesso!', 'success')
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível salvar a avaliação do aluno.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    evaluationSave (event) {
      this.$emit('loading')

      const form = event.target

      const promises = []

      const studentRows = form.querySelectorAll('[data-student_id]')
      studentRows.forEach(studentRow => {
        const studentId = parseInt(studentRow.dataset.student_id)

        const studentObservationTextarea = studentRow.querySelector('textarea')
        if (!studentObservationTextarea) {
          return
        }

        const studentObservationDescription = studentObservationTextarea.value
        if (!studentObservationDescription) {
          return
        }

        const previousObservation = this.currentStudentObservations.find(studentObservation =>
          studentObservation.student_id === studentId
        )

        const studentObservation = {
          council_id: this.current_council_id,
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          student_id: studentId,
          description: studentObservationDescription,
          id: previousObservation ? previousObservation.id : null
        }
        const action = studentObservation.id ? 'student_observations/update' : 'student_observations/create'
        promises.push(this.$store.dispatch(action, studentObservation))
      })

      const gradeObservationDescription = form.querySelector('[name=grade_observation]').value

      if (gradeObservationDescription) {
        const gradeObservation = {
          council_id: this.current_council_id,
          grade_id: this.current_grade_id,
          subject_id: this.current_subject_id,
          user_id: this.current_user_id,
          description: gradeObservationDescription,
          id: this.currentGradeObservation ? this.currentGradeObservation.id : null
        }
        const action = gradeObservation.id ? 'grade_observations/update' : 'grade_observations/create'
        promises.push(this.$store.dispatch(action, gradeObservation))
      }

      promises.push(this.$store.dispatch('evaluations/saveMany', this.currentEvaluations))

      return Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Avaliação da turma salva com sucesso!', 'success')
        this.unsetConfirmRedirect()
      }).catch(error => {
        this.$emit('notify', 'Erro!', 'Não foi possível salvar a avaliação da turma.', 'danger')
        console.log('Error:', error)
      }).finally(() => {
        this.$emit('loaded')
      })
    },

    load () {
      const required = [
        'councils',
        'council_topics',
        'topics',
        'topic_options',
        'council_grades',
        'teachers',
        'grades',
        'student_grades',
        'students',
        'grade_subjects',
        'subjects',
        'evaluations',
        'student_observations',
        'grade_observations'
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
    this.hide_evaluated_students = false
    this.current_user_id = this.$store.state.token.user_id
    this.current_council_id = parseInt(this.$route.params.id)
    this.current_grade_id = ''
    this.current_subject_id = ''

    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
