<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Relatórios - {{ council.name }}</h1>
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
                <th v-for="topic in topics" style="min-width: 150px" :key="topic.id">{{ topic.name }}</th>
                <th class="no-wrap">Observações Gerais</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in current_students" :data-student_id="student.id" :key="student.id">
                <td style="max-width: 33vw">{{ studentGrade(student.id).number }} - {{ student.name }}</td>
                <td v-for="topic in topics" :key="topic.id">{{ reportStudentTopic(student.id, topic.id) }}</td>
                <td>
                  <p v-for="student_observation in current_student_observations.filter(student_observation => student_observation.student_id === student.id)" style="min-width: 250px" :key="student_observation.id"><b>{{ users.find(user => user.id === student_observation.user_id).name }}{{ !current_subject_id ? ' - '+subjects.find(subject => subject.id === student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
                </td>
              </tr>
            </tbody>
          </super-table>
          <br>
          <p v-for="grade_observation in current_grade_observations" :key="grade_observation.id"><b>{{ users.find(user => user.id === grade_observation.user_id).name }}{{ !current_subject_id ? ' - '+subjects.find(subject => subject.id === grade_observation.subject_id).name : '' }}:</b> {{ grade_observation.description }}</p>
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
      council: {}, // only the current council
      grades: [], // only the grades in council_grades
      topics: [], // only the topics in council_topics
      subjects: [],
      students: [],
      evaluations: [],
      student_observations: [],
      grade_observations: [],
      users: [],
      teachers: [],
      council_grades: [],
      student_grades: [],
      council_topics: [],
      topic_options: [],
      grade_subjects: [],

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

      let grade_subjects = this.grade_subjects.filter(grade_subject =>
        grade_subject.grade_id === this.current_grade_id
      )
      this.current_subjects = this.subjects.filter(subject =>
        grade_subjects.find(grade_subject =>
          grade_subject.subject_id === subject.id
        )
      )

      this.current_student_grades = this.student_grades.filter(student_grade =>
        student_grade.grade_id === this.current_grade_id
      )

      this.current_students = this.students.filter(student =>
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

      this.current_evaluations = this.evaluations.filter(evaluation =>
        evaluation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === evaluation.subject_id
        )
      )
      this.current_student_observations = this.student_observations.filter(student_observation =>
        student_observation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === student_observation.subject_id
        )
      )
      this.current_grade_observations = this.grade_observations.filter(grade_observation =>
        grade_observation.grade_id === this.current_grade_id && (
          !this.current_subject_id ||
          this.current_subject_id === grade_observation.subject_id
        )
      )
    },
    reportStudentTopic (student_id, topic_id) {
      let topic_options = this.topic_options.filter(topic_option =>
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
        grade_observation.council_id === this.council.id &&
        (
          !this.current_subject_id ||
          grade_observation.subject_id === this.current_subject_id
        )
      )
    }
  },
  beforeCreate() {
    this.$emit('loading')
  },
  created: function() {
    this.council = {}
    this.grades = []
    this.topics = []
    this.topic_options = []
    this.grade_subjects = []
    this.subjects = []
    this.students = []
    this.evaluations = []
    this.student_observations = []
    this.grade_observations = []
    this.users = []
    this.teachers = []
    this.student_grades = []
    this.council_grades = []
    this.council_topics = []

    this.current_grade_id = ''
    this.current_subject_id = ''
    this.current_subjects = []
    this.current_students = []
    this.current_evaluations = []

    let council_id = parseInt(this.$route.params.id)
    let db = this.$parent.db

    let promises = []
    promises.push(db.councils.get(council_id).then(council =>
      this.council = council
    ))
    promises.push(db.grades.toArray().then(grades =>
      this.grades = grades
    ))
    promises.push(db.topics.toArray().then(topics =>
      this.topics = topics
    ))
    promises.push(db.topic_options.toArray().then(topic_options =>
      this.topic_options = topic_options.sort((a, b) => Math.sign(a.value - b.value))
    ))
    promises.push(db.grade_subjects.toArray().then(grade_subjects =>
      this.grade_subjects = grade_subjects
    ))
    promises.push(db.subjects.toArray().then(subjects =>
      this.subjects = subjects
    ))
    promises.push(db.students.toArray().then(students =>
      this.students = students
    ))
    promises.push(db.evaluations.toArray().then(evaluations =>
      this.evaluations = evaluations.filter(evaluation =>
        evaluation.council_id === council_id
      )
    ))
    promises.push(db.student_observations.toArray().then(student_observations =>
      this.student_observations = student_observations.filter(student_observation =>
        student_observation.council_id === council_id
      )
    ))
    promises.push(db.grade_observations.toArray().then(grade_observations =>
      this.grade_observations = grade_observations.filter(grade_observation =>
        grade_observation.council_id === council_id
      )
    ))
    promises.push(db.users.toArray().then(users =>
      this.users = users
    ))
    promises.push(db.teachers.toArray().then(teachers =>
      this.teachers = teachers
    ))
    promises.push(db.student_grades.toArray().then(student_grades =>
      this.student_grades = student_grades
    ))
    promises.push(db.council_grades.toArray().then(council_grades =>
      this.council_grades = council_grades.filter(council_grade =>
        council_grade.council_id === council_id
      )
    ))
    promises.push(db.council_topics.toArray().then(council_topics =>
      this.council_topics = council_topics.filter(council_topic =>
        council_topic.council_id === council_id
      )
    ))

    Promise.all(promises).then(() => {
      this.topics = this.topics.filter(topic =>
        this.council_topics.find(council_topic =>
          council_topic.topic_id === topic.id
        )
      )

      this.grades = this.grades.filter(grade =>
        this.council_grades.find(council_grade =>
          council_grade.grade_id === grade.id
        )
      )
      this.$emit('loaded')
    })
  }
}
</script>
