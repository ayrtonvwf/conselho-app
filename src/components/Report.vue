<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Relatórios - {{ current_council.name }}</h1>
    <article class="box">
      <div class="box-body"><br>
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="row justify-content-center">
              <div class="input col-12 col-sm-6">
                <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                  <option value="" selected hidden disabled>Selecione...</option>
                  <option v-for="grade in grades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-12 col-sm-6">
                <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected>{{ current_grade_id ? 'Todas' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in subjectsInGrade" :value="subject.id" :key="subject.id">{{ subject.name }}</option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
            </div>
          </div>
        </div><br>
        <div class="text-center text-muted" v-if="!current_grade_id"><br>
          <div class="h4">Selecione uma turma para ver o relatório.</div><br>
        </div>
        <div class="text-center text-muted" v-else-if="!evaluations.length"><br>
          <div class="h4">Esta turma ainda não recebeu avaliações nesta disciplina.</div><br>
        </div>
        <div v-else>
          <div class="table">
            <table>
              <thead>
              <tr>
                <th style="max-width: 33vw">Aluno</th>
                <th v-for="topic in current_topics" style="min-width: 150px" :key="topic.id">{{ topic.name }}</th>
                <th class="no-wrap">Observações Gerais</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="student in studentsInGrade" :data-student_id="student.id" :key="student.id">
                <td style="max-width: 33vw">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                <td v-for="topic in current_topics" :key="topic.id">{{ reportStudentTopic(student.id, topic.id) }}</td>
                <td>
                  <p v-for="student_observation in current_student_observations.filter(student_observation => student_observation.student_id === student.id)" style="min-width: 250px" :key="student_observation.id"><b>{{ users.find(user => user.id === student_observation.user_id).name }}{{ !current_subject_id ? ' - '+subjects.find(subject => subject.id === student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
                </td>
              </tr>
              </tbody>
            </table>
          </div><br>
          <p v-for="grade_observation in gradeObservations" :key="grade_observation.id"><b>{{ users.find(user => user.id === grade_observation.user_id).name }}{{ !current_subject_id ? ' - '+subjects.find(subject => subject.id === grade_observation.subject_id).name : '' }}:</b> {{ grade_observation.description }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
/* eslint-disable */
import superTable from '../assets/superTable'

export default {
  name: 'Report',
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
  methods: {
    update_current() {
      if (!this.current_grade_id) {
        this.current_evaluations = []
        this.current_student_observations = []
        this.current_student_grades = []
        return
      }

      this.current_evaluations = this.evaluations.filter(evaluation =>
        evaluation.council_id === this.current_council.id &&
        evaluation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          evaluation.subject_id === this.current_subject_id
        )
      )

      this.current_student_observations = this.student_observations.filter(student_observation =>
        student_observation.council_id === this.current_council.id &&
        student_observation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          student_observation.subject_id === this.current_subject_id
        )
      )

      this.current_student_grades = this.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      setTimeout(superTable, 1000)
    },
    reportStudentTopic (student_id, topic_id) {
      let topic_options = this.ordered_topic_options.filter(topic_option => topic_option.topic_id === topic_id)

      let evaluations = this.current_evaluations.filter(evaluation =>
        evaluation.student_id === student_id &&
        topic_options.find(topic_option =>
          topic_option.id === evaluation.topic_option_id
        ) !== undefined
      )

      if (!evaluations.length) {
        return '-'
      }

      let values = evaluations.map(evaluation =>
        parseInt(topic_options.find(topic_option => topic_option.id === evaluation.topic_option_id).value)
      )

      let sum = values.reduce((a, b) => a + b)
      let avg = parseInt(sum / values.length)

      let topic_options_values = topic_options.map(topic_option => topic_option.value)

      let nearest_value = parseInt(topic_options_values.reduce(function (prev, curr) {
        return (Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev)
      }))

      return topic_options.find(topic_option => parseInt(topic_option.value) === nearest_value).name + ' (' + avg + '%)'
    },
    studentGrade (student_id) {
      return this.current_student_grades.find(student_grade =>
        student_grade.student_id === student_id
      )
    },
    studentHasEvaluation (student_id) {
      return !!this.current_evaluations.find(evaluation =>
        evaluation.student_id === student_id
      )
    }
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
  }
}
</script>
