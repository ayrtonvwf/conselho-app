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
                  <th style="max-width: 33vw" class="text-center">Aluno</th>
                  <th v-for="topic in currentTopics" :key="topic.id">{{ topic.name }}</th>
                  <th v-for="observationTopic in currentObservationTopics" :key="observationTopic.id">{{ observationTopic.name }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-if="currentTopics.length && currentTopicOptions.length" :key="loaded_at">
                <evaluate-row v-for="student in currentStudents" :key="student.id" :student="student"
                  :hide-evaluated-students="hide_evaluated_students" :topic-options="currentTopicOptions"
                  :topics="currentTopics" :observation-topics="currentObservationTopics" :user-id="current_user_id"
                  :council-id="current_council_id" :grade-id="current_grade_id" :subject-id="current_subject_id"
                  @dirty="setDirty(student.id)" @clean="setClean(student.id)" @saving="setSaving" @saved="setSaved"
                  @error="setError" :disabled="dirty_student_id && dirty_student_id !== student.id" />
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
      current_subject_id: '',
      current_year: (new Date()).getFullYear(),
      dirty_student_id: undefined,
      loaded_at: undefined
    }
  },
  computed: {
    // loadedAt () {
    //   return this.$store.getters['student_observations/getLoadedAt'] + this.$store.getters['evaluations/getLoadedAt']
    // },

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

    currentCouncilObservationTopics () {
      return this.$store.getters['council_observation_topics/getCouncilObservationTopics'].filter(councilObservationTopic =>
        councilObservationTopic.council_id === this.current_council_id
      )
    },

    currentTopics () {
      return this.$store.getters['topics/getOrderedTopics'].filter(topic =>
        this.currentCouncilTopics.find(councilTopic =>
          councilTopic.topic_id === topic.id
        )
      ).map(topic => {
        topic.options = this.$store.getters['topic_options/getOrderedTopicOptions'].filter(topicOption =>
          topicOption.topic_id === topic.id
        )
        return topic
      })
    },

    currentObservationTopics () {
      return this.$store.getters['observation_topics/getOrderedObservationTopics'].filter(observationTopic =>
        this.currentCouncilObservationTopics.find(councilObservationTopic =>
          councilObservationTopic.observation_topic_id === observationTopic.id
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
      const minStartDate = this.current_year + '-01-01'
      const maxEndDate = this.current_year + '-12-31'

      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        studentGrade.start_date >= minStartDate &&
        studentGrade.end_date <= maxEndDate &&
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

        student.active = studentGrade.end_date || studentGrade.end_date > new Date().toISOString().slice(0, 10)
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

    currentGradeObservation () {
      if (!this.current_grade_id || !this.current_subject_id) {
        return {}
      }

      const gradeObservations = this.$store.getters['grade_observations/getGradeObservations']

      return gradeObservations.length ? gradeObservations[0] : {}
    }
  },

  watch: {
    current_grade_id () {
      if (this.currentSubjects.length !== 1) {
        this.current_subject_id = ''
        return
      }

      this.current_subject_id = this.currentSubjects[0].id
    },

    current_subject_id () {
      this.$emit('loading')

      if (this.current_subject_id === '') {
        return Promise.all([
          this.$store.dispatch('evaluations/unload'),
          this.$store.dispatch('student_observations/unload'),
          this.$store.dispatch('grade_observations/unload')
        ]).then(() => {
          this.$emit('loaded')
        })
      }

      const filter = {
        user_id: this.current_user_id,
        council_id: this.current_council_id,
        grade_id: this.current_grade_id,
        subject_id: this.current_subject_id
      }

      return Promise.all([
        this.$store.dispatch('evaluations/load', filter),
        this.$store.dispatch('student_observations/load', filter),
        this.$store.dispatch('grade_observations/load', filter)
      ]).then(() => {
        this.loaded_at = Date.now()
      }).catch(() => {
        this.$emit('notify', 'Erro ao carregar as avaliações', 'Tente novamente', 'danger')
        this.current_subject_id = ''
      }).finally(() => {
        this.$emit('loaded')
      })
    }
  },

  methods: {
    setSaving () {
      this.$emit('loading')
    },

    setSaved () {
      this.$store.dispatch('evaluations/reload').then(() => {
        this.$emit('loaded')
        this.$emit('notify', 'Sucesso!', 'Avaliação do estudante salva com sucesso!', 'success')
        this.loaded_at = Date.now()
      })
    },

    setError () {
      this.$emit('loaded')
      this.$emit('notify', 'Erro!', 'Não foi possível salvar a avaliação do estudante. Tente novamente!', 'danger')
    },

    setDirty (studentId) {
      this.dirty_student_id = studentId
      this.enableConfirmRedirect()
    },

    setClean () {
      this.dirty_student_id = undefined
      this.disableConfirmRedirect()
    },

    enableConfirmRedirect () {
      window.onbeforeunload = event => {
        const dialogText = 'Tem certeza que deseja sair da página? Você perderá o que não foi salvo'
        event.returnValue = dialogText
        return dialogText
      }
    },

    disableConfirmRedirect () {
      window.onbeforeunload = event => {
        const dialogText = undefined
        event.returnValue = dialogText
        return dialogText
      }
      window.onbeforeunload = undefined
    },

    evaluationSave (event) {
      this.$emit('loading')

      const form = event.target

      const promises = []

      const gradeObservationDescription = form.querySelector('[name=grade_observation]').value

      if (!gradeObservationDescription && this.currentGradeObservation) {
        promises.push(this.$store.dispatch('grade_observations/delete', this.currentGradeObservation.id))
      } else if (gradeObservationDescription) {
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

      return Promise.all(promises).then(() => {
        this.$emit('notify', 'Sucesso!', 'Avaliação da turma salva com sucesso!', 'success')
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
        'council_observation_topics',
        'topics',
        'observation_topics',
        'topic_options',
        'council_grades',
        'teachers',
        'grades',
        'student_grades',
        'students',
        'grade_subjects',
        'subjects'
      ]

      const promises = required.map(module =>
        this.$store.dispatch(module + '/loadFromDb')
      )

      return Promise.all(promises)
    },

    resetContent () {
      this.hide_evaluated_students = false
      this.current_user_id = this.$store.state.token.user_id
      this.current_council_id = parseInt(this.$route.params.id)
      this.current_grade_id = ''
      this.current_subject_id = ''

      this.load().then(() => {
        this.$emit('loaded')
      })
    }
  },

  beforeRouteUpdate (to, from, next) {
    next()
    this.$emit('loading')
    this.resetContent()
  },

  beforeCreate () {
    this.$emit('loading')
  },

  created () {
    this.resetContent()
  }
}
</script>
