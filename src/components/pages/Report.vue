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
                  <option v-for="grade in current_grades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-12 col-sm-6">
                <select id="current_subject_id" name="current_subject_id" required v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected>{{ current_grade_id ? 'Todas' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in current_subjects" :value="subject.id" :key="subject.id">{{ subject.name }}</option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
            </div>
          </div>
        </div><br>
        <div class="text-center text-muted" v-if="!current_grade_id"><br>
          <div class="h4">Selecione uma turma para ver o relatório.</div><br>
        </div>
        <div class="text-center text-muted" v-else-if="!current_evaluations.length"><br>
          <div class="h4">Esta turma ainda não recebeu avaliações<span v-if="current_subject_id"> nesta disciplina</span>.</div><br>
        </div>
        <div v-else>
          <super-table>
            <thead>
              <tr>
                <th style="max-width: 33vw">Aluno</th>
                <th v-for="topic in current_topics" style="min-width: 150px" :key="topic.id">{{ topic.name }}</th>
                <th class="no-wrap">Observações Gerais</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in current_students" :data-student_id="student.id" :key="student.id">
                <td style="max-width: 33vw">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                <td v-for="topic in current_topics" :key="topic.id">{{ reportStudentTopic(student.id, topic.id) }}</td>
                <td>
                  <p v-for="student_observation in current_student_observations.filter(student_observation => student_observation.student_id === student.id)" style="min-width: 250px" :key="student_observation.id"><b>{{ $store.state.users.find(user => user.id === student_observation.user_id).name }}{{ !current_subject_id ? ' - '+current_subjects.find(subject => subject.id === student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
                </td>
              </tr>
            </tbody>
          </super-table>
          <br>
          <p v-for="grade_observation in current_grade_observations" :key="grade_observation.id"><b>{{ $store.state.users.find(user => user.id === grade_observation.user_id).name }}{{ !current_subject_id ? ' - '+current_subjects.find(subject => subject.id === grade_observation.subject_id).name : '' }}:</b> {{ grade_observation.description }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
/* eslint-disable */

export default {
  name: 'Report',
  data: function() {
    return {
      current_council: {},
      current_grades: [],
      current_topics: [],
      current_topic_options: [],
      current_grade_id: '',
      current_subject_id: '',
      current_subjects: [],
      current_students: [],
      current_student_grades: [],
      current_evaluations: [],
      current_student_observations: [],
      current_grade_observations: []
    }
  },
  watch: {
    current_grade_id() {
      if (!this.current_grade_id) {
        this.current_subject_id = ''
        this.current_subjects = []
        this.current_student_grades = []
        this.current_students = []

        this.load_evaluations() // empty current_evaluation
        return
      }

      let grade_subjects = this.$store.state.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )
      this.current_subjects = this.$store.state.subjects.filter(subject =>
        grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )

      this.current_student_grades = this.$store.state.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      this.current_students = this.$store.state.students.filter(student =>
        this.current_student_grades.find(student_grade =>
          student_grade.student_id === student.id
        )
      )

      if (this.current_subject_id) {
        this.current_subject_id = ''
        // load_evaluations will be triggered by the current_subject_id watcher
      } else {
        this.load_evaluations()
      }
    },
    current_subject_id() {
      this.load_evaluations()
    }
  },
  methods: {
    load_evaluations() {
      if (!this.current_grade_id) {
        this.current_evaluations = []
        this.current_grade_observations = []
        this.current_student_observations = []
        return
      }

      this.current_evaluations = this.$store.state.evaluations.filter(evaluation =>
        evaluation.council_id === this.current_council.id &&
        evaluation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === evaluation.subject_id
        )
      )
      this.current_student_observations = this.$store.state.student_observations.filter(student_observation =>
        student_observation.council_id === this.current_council.id &&
        student_observation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === student_observation.subject_id
        )
      )
      this.current_grade_observations = this.$store.state.grade_observations.filter(grade_observation =>
        grade_observation.council_id === this.current_council.id &&
        grade_observation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === grade_observation.subject_id
        )
      )
    },
    reportStudentTopic (student_id, topic_id) {
      let topic_options = this.current_topic_options.filter(topic_option =>
        topic_option.topic_id === topic_id
      )

      let evaluations = this.current_evaluations.filter(evaluation =>
        evaluation.student_id === student_id &&
        topic_options.find(topic_option =>
          topic_option.id === evaluation.topic_option_id
        )
      )

      if (!evaluations.length) {
        return '-'
      }

      let values = evaluations.map(evaluation =>
        topic_options.find(topic_option =>
          topic_option.id === evaluation.topic_option_id
        ).value
      )

      let sum = values.reduce((a, b) => a + b)
      let avg = parseInt(sum / values.length)

      let topic_options_values = topic_options.map(topic_option => topic_option.value)

      let nearest_value = topic_options_values.reduce((prev, curr) =>
        Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev
      )

      return topic_options.find(topic_option =>
        topic_option.value === nearest_value
      ).name + ' (' + avg + '%)'
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
      return this.$store.state.students.filter(student =>
        this.studentGrade(student.id)
      ).sort((a, b) =>
        Math.sign(this.studentGrade(a.id).number - this.studentGrade(b.id).number)
      )
    },
    currentGrade () {
      if (!this.current_grade_id) {
        return undefined
      }

      return this.current_grades.find(grade =>
        grade.id === this.current_grade_id
      )
    },
    subjectsInGrade () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.$store.state.subjects.filter(subject =>
        this.$store.state.grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id &&
          grade_subject.grade_id === this.current_grade_id
        )
      )
    },
    gradeObservations () {
      if (!this.current_grade_id) {
        return undefined
      }
      return this.$store.state.grade_observations.filter(grade_observation =>
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

    this.current_council = this.$store.state.councils.find(council =>
      council.id === council_id
    )
    this.current_grades = this.$store.state.grades.filter(grade =>
      this.$store.state.council_grades.find(council_grade =>
        council_grade.grade_id === grade.id &&
        council_grade.council_id === council_id
      )
    )
    this.current_topics = this.$store.state.topics.filter(topic =>
      this.$store.state.council_topics.find(council_topic =>
        council_topic.topic_id === topic.id &&
        council_topic.council_id === council_id
      )
    )
    this.current_topic_options = this.$store.state.topic_options

    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_subjects = []
    this.current_students = []
    this.current_evaluations = []
    this.current_student_observations = []
    this.current_grade_observations = []
  }
}
</script>
