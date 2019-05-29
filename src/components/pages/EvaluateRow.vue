<template>
  <tr v-if="!hideEvaluatedStudents || !evaluations.length">
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
        <select required @change="notifyDirty" :data-topic_id="topic.id" v-model="evaluations.find(evaluation => evaluation.topic_id === topic.id).topic_option_id">
          <option v-for="topic_option in topic.options" :key="topic_option.id" :value="topic_option.id">{{ topic_option.name }}</option>
        </select>
      </td>
      <td v-for="observationTopic in observationTopics" :key="'observation_topic-' + observationTopic.id">
        <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-if="studentObservations.find(student_observation => student_observation.observation_topic_id === observationTopic.id)" v-model="studentObservations.find(student_observation => student_observation.observation_topic_id === observationTopic.id).description" :placeholder="observationTopic.name"></textarea>
        <textarea class="resize-v" style="min-width: 250px; min-height: 70px" v-else :placeholder="observationTopic.name"></textarea>
      </td>
      <td>
        <a class="btn-success btn-sm tooltip tooltip-end" type="button" title="Salvar avaliação do aluno" @click="save()">
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
    evaluations: Array,
    topics: Array,
    observationTopics: Array,
    studentObservations: Array
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

      promises.push(this.$store.dispatch('evaluations/saveMany', this.evaluations))

      const saveStudentObservations = this.studentObservations.filter(studentObservation => {
        if (studentObservation.description.length < 3 && studentObservation.id) {
          promises.push(this.$store.dispatch('student_observations/delete', studentObservation.id))
          return false
        }

        return studentObservation.description.length >= 3
      })

      promises.push(this.$store.dispatch('student_observations/saveMany', saveStudentObservations))

      return Promise.all(promises).then(() => {
        this.notifyClean()
        this.$emit('saved')
      }).catch(error => {
        console.log('Error:', error)
        this.$emit('error')
      })
    }
  },

  isDirty: false
}
</script>
