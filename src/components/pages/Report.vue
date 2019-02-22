<template>
  <div>
    <h1 class="content-title"><i class="material-icons">edit</i>Relatórios - {{ currentCouncil.name }}</h1>
    <article class="box">
      <div class="box-body"><br>
        <div class="row justify-content-center">
          <div class="col-12">
            <div class="row justify-content-center">
              <div class="input col-12 col-sm-4">
                <select id="current_grade_id" name="current_grade_id" required v-model="current_grade_id">
                  <option value="" selected hidden disabled>Selecione...</option>
                  <option v-for="grade in currentGrades" :value="grade.id" :key="grade.id">{{ grade.name }}</option>
                </select>
                <label for="current_grade_id">Turma</label>
              </div>
              <div class="input col-12 col-sm-4">
                <select id="current_subject_id" name="current_subject_id" v-model="current_subject_id" :disabled="!current_grade_id">
                  <option value="" selected>{{ current_grade_id ? 'Todas' : 'Selecione a turma...' }}</option>
                  <option v-for="subject in currentSubjects" :value="subject.id" :key="subject.id">{{ subject.name }}</option>
                </select>
                <label for="current_subject_id">Disciplina</label>
              </div>
              <div class="input col-12 col-sm-4 text-center">
                <label><br>
                  <input type="checkbox" v-model="show_advanced_options"> Opções avançadas<br><br>
                </label>
              </div>
            </div>
            <div class="row" v-if="show_advanced_options">
              <div class="input col-12 col-sm-6 col-lg-3">
                <input id="min_evaluation" v-model="min_evaluation" type="number" min="0" max="100" step="1">
                <label for="min_evaluation">Avaliação Mínima</label>
              </div>
              <div class="input col-12 col-sm-6 col-lg-3">
                <input id="max_evaluation" v-model="max_evaluation" type="number" min="0" max="100" step="1">
                <label for="max_evaluation">Avaliação Máxima</label>
              </div>
              <div class="input col-12 col-sm-3 col-lg-2 text-center">
                <label><br>
                  <input type="checkbox" v-model="show_topics"> Tópicos<br><br>
                </label>
              </div>
              <div class="input col-12 col-sm-5 col-lg-2 text-center">
                <label><br>
                  <input type="checkbox" v-model="show_student_observations"> Observações dos Estudantes<br><br>
                </label>
              </div>
              <div class="input col-12 col-sm-4 col-lg-2 text-center">
                <label><br>
                  <input type="checkbox" v-model="show_grade_observations"> Observações da Turma<br><br>
                </label>
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-right">
                <template v-if="loaded_evaluations">
                  <button type="button" class="btn-primary" @click="current_student_id ? exportStudentCSV() : exportGradeCSV()">
                    <span class="material-icons">cloud_download</span> Baixar
                  </button>
                  <button type="button" class="btn-primary" onclick="window.print()">
                    <span class="material-icons">print</span> Imprimir
                  </button>
                </template>
                <button type="button" class="btn btn-success" @click="generateReport">
                  <span class="material-icons">check</span> Gerar relatório
                </button>
              </div>
            </div>
          </div>
        </div><br>
        <div class="text-center text-muted" v-if="!current_grade_id">
          <br>
          <div class="h4"><b>Selecione uma turma</b> para ver o relatório.</div>
          <br>
        </div>
        <div class="text-center text-muted" v-else-if="!loaded_evaluations">
          <br>
          <div class="h4">Clique em "<b>gerar relatório</b>".</div>
          <br>
        </div>
        <div class="text-center text-muted" v-else-if="!currentEvaluations.length && !currentStudentObservations.length && !currentGradeObservations.length"><br>
          <div class="h4">Esta turma ainda <b>não recebeu avaliações</b><span v-if="current_subject_id"> nesta disciplina</span>.</div><br>
        </div>
        <div v-else>
          <template v-if="!current_student_id">
            <super-table v-if="show_topics || show_student_observations">
              <thead>
                <tr>
                  <th style="max-width: 33vw">Aluno</th>
                  <th v-for="topic in currentTopics" style="min-width: 150px" :key="'topic-' + topic.id" v-if="show_topics">{{ topic.name }}</th>
                  <th v-for="observationTopic in currentObservationTopics" :key="'observation_topic-' + observationTopic.id" class="no-wrap" v-if="show_student_observations">{{ observationTopic.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in currentStudents" :data-student_id="student.id" :key="student.id" v-if="mustShowStudent(student.id)">
                  <td style="max-width: 33vw" :class="!student.active ? 'text-striked' : ''">
                    <a href="#" @click.prevent="current_student_id = student.id">{{ studentGrade(student.id).number }} - {{ student.name }}</a>
                  </td>
                  <td v-for="topic in currentTopics" :key="'topic-' + topic.id" v-if="show_topics">{{ student.active ? reportStudentTopic(student.id, topic.id) : '-' }}</td>
                  <td v-for="observationTopic in currentObservationTopics" :key="'observation_topic-' + observationTopic.id" v-if="show_student_observations">
                    <template v-if="student.active">
                      <p v-for="student_observation in currentStudentObservations.filter(studentObservation => studentObservation.student_id === student.id && studentObservation.observation_topic_id === observationTopic.id)" style="min-width: 250px" :key="student_observation.id"><b>{{ getUser(student_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
                    </template>
                    <template v-else> - </template>
                  </td>
                </tr>
              </tbody>
            </super-table>
            <br>
            <template v-if="show_grade_observations">
              <p v-for="grade_observation in currentGradeObservations" :key="grade_observation.id"><b>{{ getUser(grade_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(grade_observation.subject_id).name : '' }}:</b> {{ grade_observation.description }}</p>
            </template>
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
            <super-table v-if="show_topics">
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
            <div v-for="observationTopic in currentObservationTopics" :key="observationTopic.id" v-if="show_student_observations">
              <h4>{{ observationTopic.name }}</h4>
              <p v-for="student_observation in currentStudentObservations.filter(studentObservation => studentObservation.student_id === current_student_id && studentObservation.observation_topic_id === observationTopic.id)" :key="student_observation.id"><b>{{ getUser(student_observation.user_id).name }}{{ !current_subject_id ? ' - '+getSubject(student_observation.subject_id).name : '' }}:</b> {{ student_observation.description }}</p>
            </div>
          </template>
        </div>
      </div>
    </article>
  </div>
</template>

<style>
  @media print {
    .input {
      flex-direction: initial !important;
      flex-wrap: nowrap !important;
      width: 25% !important;
      flex: 0 0 25% !important;
    }
    label, input, select {
      height: 38px !important;
      line-height: 38px !important;
      display: inline !important;
      padding: 0 !important;
      border: none !important;
      width: auto !important;
    }
    label {
      color: black !important;
      margin-right: 5px !important;
    }
    label::after {
      color: black !important;
      content: ":" !important;
    }
    .table, table {
      position: relative !important;
      overflow: initial !important;
      width: 100% !important;
      max-width: 100% !important;
      font-size: 16px !important;
      line-height: 16px !important;
    }
    button {
      display: none !important;
    }
    td, th, .box-body {
      padding: 3px !important;
    }
    td, th {
      max-width: initial !important;
      min-width: initial !important;
      border: 1px solid gray !important;
    }
  }
</style>

<script>
import { saveAs } from 'file-saver/FileSaver'
import Papa from 'papaparse'
export default {
  name: 'Report',
  data () {
    return {
      current_council_id: undefined,
      current_grade_id: '',
      current_subject_id: '',
      current_student_id: undefined,
      current_grade_evaluations: [],
      current_grade_observations: [],
      current_student_observations: [],
      loaded_evaluations: false,
      show_advanced_options: false,
      min_evaluation: 0,
      max_evaluation: 100,
      show_topics: true,
      show_student_observations: true,
      show_grade_observations: true
    }
  },
  watch: {
    current_grade_id () {
      this.eraseEvaluations()
      this.current_subject_id = ''
    },

    current_subject_id () {
      this.eraseEvaluations()
    },

    show_advanced_options () {
      this.eraseEvaluations()
      this.min_evaluation = 0
      this.max_evaluation = 100
      this.show_topics = true
      this.show_student_observations = true
      this.show_grade_observations = true
    },

    min_evaluation () {
      this.eraseEvaluations()
    },

    max_evaluation () {
      this.eraseEvaluations()
    },

    show_topics () {
      this.eraseEvaluations()
    },

    show_student_observations () {
      this.eraseEvaluations()
    },

    show_grade_observations () {
      this.eraseEvaluations()
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
      )
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
        student.active = !studentGrade.disabled_at || new Date(studentGrade.disabled_at) > new Date(this.currentCouncil.start_date)
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

    currentEvaluations () {
      return this.current_grade_evaluations
    },

    currentGradeObservations () {
      return this.current_grade_observations
    },

    currentStudentObservations () {
      if (!this.current_student_id) {
        return this.current_student_observations
      }

      return this.current_student_observations.filter(studentObservation =>
        studentObservation.student_id === this.current_student_id
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
    exportGradeCSV () {
      const data = []
      const line = ['N', 'Estudante']

      if (this.show_topics) {
        this.currentTopics.forEach(topic => {
          line.push(topic.name)
        })
      }

      if (this.show_student_observations) {
        this.currentObservationTopics.forEach(observationTopic => {
          line.push(observationTopic.name)
        })
      }

      data.push(line)

      this.currentStudents.forEach(student => {
        const line = []
        line.push(this.studentGrade(student.id).number)
        line.push(student.name)

        if (this.show_topics) {
          this.currentTopics.forEach(topic => {
            line.push(this.reportStudentTopic(student.id, topic.id))
          })
        }

        if (this.show_student_observations) {
          this.currentObservationTopics.forEach(observationTopic => {
            const studentObservations = []
            this.currentStudentObservations.filter(studentObservation =>
              studentObservation.student_id === student.id &&
              studentObservation.observation_topic_id === observationTopic.id
            ).forEach(studentObservation => {
              const user = this.getUser(studentObservation.user_id)
              const subject = this.getSubject(studentObservation.subject_id)

              studentObservations.push(user.name + ' - ' + subject.name + ': ' + studentObservation.description)
            })
            line.push(studentObservations.join('\n'))
          })
        }
        data.push(line)
      })

      const csv = Papa.unparse(data)
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'})
      const fileName = this.currentCouncil.name + ' - ' + this.currentGrade.name + '.csv'
      saveAs(blob, fileName)
    },

    exportStudentCSV () {
      const data = []
      const line = ['Disciplina']

      if (this.show_topics) {
        this.currentTopics.forEach(topic => {
          line.push(topic.name)
        })
      }

      if (this.show_student_observations) {
        this.currentObservationTopics.forEach(observationTopic => {
          line.push(observationTopic.name)
        })
      }

      data.push(line)

      this.currentSubjects.forEach(subject => {
        const line = []
        line.push(subject.name)

        if (this.show_topics) {
          this.currentTopics.forEach(topic => {
            line.push(this.reportSubjectTopic(subject.id, topic.id))
          })
        }

        if (this.show_student_observations) {
          this.currentObservationTopics.forEach(observationTopic => {
            const studentObservations = []
            this.currentStudentObservations.filter(studentObservation =>
              studentObservation.student_id === this.current_student_id &&
              studentObservation.subject_id === subject.id &&
              studentObservation.observation_topic_id === observationTopic.id
            ).forEach(studentObservation => {
              const user = this.getUser(studentObservation.user_id)

              studentObservations.push(user.name + ': ' + studentObservation.description)
            })
            line.push(studentObservations.join('\n'))
          })
        }
        data.push(line)
      })

      const csv = Papa.unparse(data)
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'})
      const fileName = this.currentCouncil.name + ' - ' + this.currentGrade.name + ' - ' + this.currentStudent.name + '.csv'
      saveAs(blob, fileName)
    },

    mustShowStudent (studentId) {
      return this.studentHasAnyEvaluation(studentId) ||
        this.currentStudentObservations.find(studentObservation =>
          studentObservation.student_id === studentId
        )
    },

    eraseEvaluations () {
      this.loaded_evaluations = false
      this.current_grade_evaluations = []
      this.current_student_observations = []
      this.current_grade_observations = []
    },

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

    generateReport () {
      this.eraseEvaluations()

      if (!this.current_grade_id) {
        return
      }

      this.$emit('loading')

      const promises = []

      const filterData = {
        council_id: this.current_council_id,
        grade_id: this.current_grade_id
      }

      if (this.current_subject_id) {
        filterData.subject_id = this.current_subject_id
      }

      const getEvaluationConfig = {
        name: 'evaluation',
        data: filterData
      }

      const getStudentObservationConfig = {
        name: 'student_observation',
        data: filterData
      }

      const getGradeObservationConfig = {
        name: 'grade_observation',
        data: filterData
      }

      if (this.show_topics) {
        promises.push(this.$store.dispatch('getResource', getEvaluationConfig).then(evaluations => {
          this.current_grade_evaluations = evaluations.map(evaluation => {
            const topicOption = this.currentTopicOptions.find(topicOption =>
              topicOption.id === evaluation.topic_option_id
            )

            evaluation.topic_id = topicOption.topic_id
            evaluation.value = topicOption.value

            return evaluation
          })
        }))
      }

      if (this.show_student_observations) {
        promises.push(this.$store.dispatch('getResource', getStudentObservationConfig).then(studentObservations => {
          this.current_student_observations = studentObservations
        }))
      }

      if (this.show_grade_observations) {
        promises.push(this.$store.dispatch('getResource', getGradeObservationConfig).then(gradeObservations => {
          this.current_grade_observations = gradeObservations
        }))
      }

      Promise.all(promises).then(() => {
        this.loaded_evaluations = true
        this.$emit('loaded')
      })
    },

    studentHasAnyEvaluation (studentId) {
      return !!this.currentTopics.find(topic =>
        this.reportStudentTopic(studentId, topic.id) !== '-'
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

      if (avg > this.max_evaluation || avg < this.min_evaluation) {
        return '-'
      }

      return avg + ' - ' + nearestTopicOption.name
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

      const topicOption = topicOptions.find(topicOption =>
        topicOption.id === evaluation.topic_option_id
      )

      return topicOption.value + ' - ' + topicOption.name
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
        'council_observation_topics',
        'topics',
        'observation_topics',
        'topic_options',
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
    this.loaded_evaluations = false
    this.show_advanced_options = false
    this.min_evaluation = 0
    this.max_evaluation = 100
    this.show_topics = true
    this.show_student_observations = true
    this.show_grade_observations = true

    this.load().then(() => {
      this.$emit('loaded')
    })
  }
}
</script>
