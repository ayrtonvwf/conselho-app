<template>
  <tr v-if="loaded && !hideEvaluatedStudents" :style="disabled ? 'opacity: 0.7' : ''">
    <template v-if="!hideEvaluatedStudents && !student.active">
      <td class="text-striked text-center">
        <img :src="student.image" alt="Foto do aluno" style="max-width: 100%" v-if="student.image">
        {{ studentGrade.number }} - {{ student.name }}
      </td>
      <td v-for="topic in topics" :key="'topic-' + topic.id">-</td>
      <td v-for="observationTopic in observationTopics" :key="'observation_topic-' + observationTopic.id">-</td>
      <td>-</td>
    </template>
    <template v-else-if="student.active">
      <td class="text-center">
        <img :src="student.image" alt="Foto do aluno" style="max-width: 100%" v-if="student.image">
        {{ student.number }} - {{ student.name }}
        <span class="text-muted" v-if="!evaluations.length"> (não avaliado)</span>
      </td>
      <td v-for="topic in topics" :key="'topic-' + topic.id">
        <select required @change="notifyDirty" :data-topic_id="topic.id" v-model="currentEvaluations.find(evaluation => evaluation.topic_id === topic.id).topic_option_id" :disabled="disabled">
          <option v-for="topic_option in topic.options" :key="topic_option.id" :value="topic_option.id">{{ topic_option.name }}</option>
        </select>
      </td>
      <td v-for="observationTopic in observationTopics" :key="'observation_topic-' + observationTopic.id">
        <textarea class="resize-v" style="min-width: 250px; min-height: 70px" :placeholder="disabled ? 'Há outro aluno sendo avaliado' : observationTopic.name"
          @change="notifyDirty" :disabled="disabled"
          v-model="currentStudentObservations.find(currentStudentObservation =>
            currentStudentObservation.observation_topic_id === observationTopic.id
          ).description"
        ></textarea>
      </td>
      <td>
        <a class="btn-success btn-sm tooltip tooltip-end" type="button" :title="disabled ? 'Salve a avaliação do aluno anterior antes de começar a avaliar este' : 'Salvar avaliação do aluno'" @click="save()" :disabled="disabled">
          <div class="material-icons">check</div>
        </a>
      </td>
    </template>
  </tr>
</template>

<script>
export default {
  name: 'EvaluateRow',

  props: {
    student: Object,
    hideEvaluatedStudents: Boolean,
    topics: Array,
    topicOptions: Array,
    observationTopics: Array,
    baseObservation: Object,
    userId: Number,
    councilId: Number,
    gradeId: Number,
    subjectId: Number,
    disabled: Boolean
  },

  data: () => {
    return {
      loaded: false,
      currentStudentObservations: [],
      currentEvaluations: []
    }
  },

  computed: {
    studentObservations: function () {
      return this.$store.getters['student_observations/getByStudent'](this.student.id)
    },

    evaluations: function () {
      return this.$store.getters['evaluations/getByStudent'](this.student.id).map(evaluation => {
        const topicOption = this.topicOptions.find(topicOption =>
          topicOption.id === evaluation.topic_option_id
        )

        return {
          ...evaluation,
          value: topicOption.value,
          topic_id: topicOption.topic_id
        }
      })
    }
  },

  methods: {
    notifyDirty () {
      if (this.$options.isDirty) {
        return
      }

      this.$emit('dirty')
      this.$options.isDirty = true
    },

    notifyClean () {
      this.$emit('clean')
      this.$options.isDirty = false
    },

    save () {
      this.$emit('saving')

      const promises = []

      promises.push(this.$store.dispatch('evaluations/saveMany', this.currentEvaluations))

      const saveStudentObservations = this.currentStudentObservations.filter(studentObservation => {
        if (studentObservation.description.length < 3 && studentObservation.id) {
          promises.push(this.$store.dispatch('student_observations/delete', studentObservation.id))
          return false
        }

        return studentObservation.description.length >= 3
      })

      promises.push(this.$store.dispatch('student_observations/saveMany', saveStudentObservations))

      return Promise.all(promises).then(() => {
        this.load()
        this.notifyClean()
        this.$emit('saved')
      }).catch(error => {
        console.log('Error:', error)
        this.$emit('error')
      })
    },

    load () {
      this.currentStudentObservations = this.observationTopics.map(observationTopic => {
        const studentObservation = this.studentObservations.find(studentObservation =>
          studentObservation.observation_topic_id === observationTopic.id
        )

        return studentObservation || {
          user_id: this.userId,
          council_id: this.councilId,
          grade_id: this.gradeId,
          subject_id: this.subjectId,
          student_id: this.student.id,
          observation_topic_id: observationTopic.id,
          description: ''
        }
      })

      this.currentEvaluations = this.topics.map(topic => {
        const evaluation = this.evaluations.find(evaluation =>
          evaluation.topic_id === topic.id
        )

        return evaluation || {
          user_id: this.userId,
          council_id: this.councilId,
          grade_id: this.gradeId,
          subject_id: this.subjectId,
          student_id: this.student.id,
          topic_id: topic.id,
          topic_option_id: topic.topic_option_id
        }
      })

      this.loaded = true
    }
  },

  created () {
    this.load()
  },

  isDirty: false
}
</script>
