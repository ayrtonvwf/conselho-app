<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Relatórios - {{ currentCouncil.name }}</h1>
    <article class="box">
      <div class="box-body"><br>
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="row justify-content-center">
              <div class="input col-12 col-sm-6">
                <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                  <option value="" selected hidden disabled>Selecione...</option>
                  <option v-for="grade in currentGrades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-12 col-sm-6">
                <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected>{{ current_grade_id ? 'Todas' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in currentSubjects" :value="subject.id" :key="subject.id">{{ subject.name }}</option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
            </div>
          </div>
        </div><br>
        <div class="text-center text-muted" v-if="!current_grade_id"><br>
          <div class="h4">Selecione uma turma para ver o relatório.</div><br>
        </div>
        <div class="text-center text-muted" v-else-if="!currentEvaluations.length"><br>
          <div class="h4">Esta turma ainda não recebeu avaliações<span v-if="current_subject_id"> nesta disciplina</span>.</div><br>
        </div>
        <div v-else>
          <template v-if="!current_student_id">
            <super-table>
              <thead>
                <tr>
                  <th style="max-width: 33vw">Aluno</th>
                  <th v-for="topic in currentTopics" style="min-width: 150px" :key="topic.id">{{ topic.name }}</th>
                  <th class="no-wrap">Observações Gerais</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id">
                  <td style="max-width: 33vw">
                    <a href="#" @click.prevent="current_student_id = student.id">{{ studentGrade(student.id).number }} - {{ student.name }}</a>
                  </td>
                  <td v-for="topic in currentTopics" :key="topic.id">{{ reportStudentTopic(student.id, topic.id) }}</td>
                  <td>
                    <p v-for="student_observation in currentStudentObservations.filter(studentObservation => studentObservation.student_id === student.id)" style="min-width: 250px" :key="student_observation.id"><b>{{ getUser(student_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
                  </td>
                </tr>
              </tbody>
            </super-table>
            <br>
            <p v-for="grade_observation in currentGradeObservations" :key="grade_observation.id"><b>{{ getUser(grade_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(grade_observation.subject_id).name : '' }}:</b> {{ grade_observation.description }}</p>
          </template>
          <template v-else>
            <p>
              <button class="btn-sm btn-primary" @click="current_student_id = undefined">
                <span class="material-icons">arrow_back</span>
                Voltar para a turma
              </button>
              <span class="pull-right">
                <button class="btn-sm btn-success" @click="prevStudent">
                  <span class="material-icons">chevron_left</span>
                  Estudante anterior
                </button>
                <button class="btn-sm btn-success" @click="nextStudent">
                  Próximo estudante
                  <span class="material-icons">chevron_right</span>
                </button>
              </span>
            </p>
            <br>
            <p>
              <b>{{ currentStudent.id ? studentGrade(currentStudent.id).number : '' }} - {{ currentStudent.name }}</b>
            </p>
            <super-table>
              <thead>
              <tr>
                <th style="max-width: 33vw">Matéria</th>
                <th v-for="topic in currentTopics" style="min-width: 150px" :key="topic.id">{{ topic.name }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="subject in currentSubjects" :key="subject.id">
                <td>{{ subject.name }}</td>
                <td v-for="topic in currentTopics" style="min-width: 150px" :key="topic.id">{{ reportSubjectTopic(subject.id, topic.id) }}</td>
              </tr>
              </tbody>
            </super-table>
            <p v-for="student_observation in currentStudentObservations.filter(studentObservation => studentObservation.student_id === current_student_id)" :key="student_observation.id"><b>{{ getUser(student_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
          </template>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'Report',
  data () {
    return {
      current_council_id: undefined,
      current_grade_id: '',
      current_subject_id: '',
      current_student_id: undefined
    }
  },
  computed: {
    currentCouncil () {
      const council = this.$store.getters['councils/getCouncils'].find(council =>
        council.id === this.current_council_id
      )

      return council || {}
    },

    currentCouncilGrades () {
      return this.$store.getters['council_grades/getCouncilGrades'].filter(councilGrade =>
        councilGrade.council_id === this.current_council_id
      )
    },

    currentGrades () {
      return this.$store.getters['grades/getOrderedGrades'].filter(grade =>
        this.currentCouncilGrades.find(councilGrade =>
          councilGrade.grade_id === grade.id
        )
      )
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

    currentCouncilEvaluations () {
      return this.$store.getters['evaluations/getEvaluations'].map(evaluation => {
        if (evaluation.council_id !== this.current_council_id) {
          return undefined
        }

        const topicOption = this.currentTopicOptions.find(topicOption =>
          topicOption.id === evaluation.topic_option_id
        )

        evaluation.topic_id = topicOption.topic_id
        evaluation.value = topicOption.value

        return evaluation
      }).filter(evaluation => evaluation)
    },

    currentCouncilGradeObservations () {
      return this.$store.getters['grade_observations/getGradeObservations'].filter(gradeObservation =>
        gradeObservation.council_id === this.current_council_id
      )
    },

    currentCouncilStudentObservations () {
      return this.$store.getters['student_observations/getStudentObservations'].filter(studentObservation =>
        studentObservation.council_id === this.current_council_id
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

      return this.$store.getters['student_grades/getStudentGrades'].filter(studentGrade =>
        studentGrade.grade_id === this.current_grade_id
      )
    },

    currentStudents () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['students/getStudents'].map(student => {
        const studentGrade = this.studentGrade(student.id)

        if (!studentGrade) {
          return undefined
        }

        student.grade_id = studentGrade.grade_id
        student.number = studentGrade.number
        return student
      }).filter(student => student).sort((a, b) =>
        Math.sign(a.number - b.number)
      )
    },

    currentGradeSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['grade_subjects/getGradeSubjects'].filter(gradeSubject =>
        gradeSubject.grade_id === this.current_grade_id
      )
    },

    currentSubjects () {
      if (!this.current_grade_id) {
        return []
      }

      return this.$store.getters['subjects/getOrderedSubjects'].filter(subject =>
        this.currentGradeSubjects.find(gradeSubject =>
          gradeSubject.subject_id === subject.id
        )
      )
    },

    currentGradeEvaluations () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentCouncilEvaluations.filter(evaluation =>
        evaluation.grade_id === this.current_grade_id
      )
    },

    currentEvaluations () {
      if (!this.current_grade_id) {
        return []
      }

      if (!this.current_subject_id) {
        return this.currentGradeEvaluations
      }

      return this.currentGradeEvaluations.filter(evaluation =>
        evaluation.subject_id === this.current_subject_id
      )
    },

    currentGradeObservations () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentCouncilGradeObservations.filter(gradeObservation =>
        gradeObservation.grade_id === this.current_grade_id &&
        (
          !this.current_subject_id ||
          gradeObservation.subject_id === this.current_subject_id
        )
      )
    },

    currentStudentObservations () {
      if (!this.current_grade_id) {
        return []
      }

      return this.currentCouncilStudentObservations.filter(studentObservation =>
        studentObservation.grade_id === this.current_grade_id &&
        (
          !this.current_subject_id ||
          studentObservation.subject_id === this.current_subject_id
        ) && (
          !this.current_student_id ||
          studentObservation.student_id === this.current_student_id
        )
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
    getUser (userId) {
      return this.$store.getters['users/getUsers'].find(user =>
        user.id === userId
      )
    },

    getSubject (subjectId) {
      return this.$store.getters['subjects/getSubjects'].find(subject =>
        subject.id === subjectId
      )
    },

    reportStudentTopic (studentId, topicId) {
      const topicOptions = this.currentTopicOptions.filter(topicOption =>
        topicOption.topic_id === topicId
      )

      const evaluations = this.currentEvaluations.filter(evaluation =>
        evaluation.student_id === studentId &&
        evaluation.topic_id === topicId
      )

      if (!evaluations.length) {
        return '-'
      }

      const avg = parseInt(evaluations.reduce((avg, evaluation, i, arr) => {
        return avg + evaluation.value / arr.length
      }, 0))

      const nearestTopicOption = topicOptions.reduce((prev, curr) =>
        Math.abs(curr.value - avg) < Math.abs(prev.value - avg) ? curr : prev
      )

      if (this.current_subject_id) {
        return nearestTopicOption.name
      }

      return nearestTopicOption.name + ' (' + avg + '%)'
    },

    reportSubjectTopic (subjectId, topicId) {
      const topicOptions = this.currentTopicOptions.filter(topicOption =>
        topicOption.topic_id === topicId
      )

      const evaluation = this.currentEvaluations.find(evaluation =>
        evaluation.student_id === this.current_student_id &&
        evaluation.topic_id === topicId &&
        evaluation.subject_id === subjectId
      )

      if (!evaluation) {
        return '-'
      }

      return topicOptions.find(topicOption =>
        topicOption.id === evaluation.topic_option_id
      ).name
    },

    studentGrade (studentId) {
      return this.currentStudentGrades.find(studentGrade =>
        studentGrade.student_id === studentId
      )
    },

    studentHasEvaluation (studentId) {
      return !!this.currentEvaluations.find(evaluation =>
        evaluation.student_id === studentId
      )
    },

    prevStudent () {
      const index = this.currentStudents.findIndex(student =>
        student.id === this.current_student_id
      )

      const prevStudent = this.currentStudents[index - 1]
      if (!prevStudent) {
        return
      }

      this.current_student_id = prevStudent.id
    },

    nextStudent () {
      const index = this.currentStudents.findIndex(student =>
        student.id === this.current_student_id
      )

      const nextStudent = this.currentStudents[index + 1]
      if (!nextStudent) {
        return
      }

      this.current_student_id = nextStudent.id
    },

    load () {
      const required = [
        'councils',
        'council_grades',
        'grades',
        'council_topics',
        'topics',
        'topic_options',
        'evaluations',
        'grade_observations',
        'student_observations',
        'student_grades',
        'students',
        'grade_subjects',
        'subjects',
        'users'
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
    this.current_council_id = parseInt(this.$route.params.id)
    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_student_id = undefined

    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
