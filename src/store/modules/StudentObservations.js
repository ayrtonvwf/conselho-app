import Vue from 'vue'
import StudentObservationApi from '../../services/api/StudentObservation'

export default {
  namespaced: true,

  state: {
    student_observations: []
  },

  getters: {
    getStudentObservations: state => {
      return state.student_observations
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.student_observations = payload
    },

    setMany: (state, studentObservations) => {
      studentObservations.map(studentObservation => {
        const index = state.student_observations.findIndex(findStudentObservation =>
          findStudentObservation.id === studentObservation.id
        )

        if (index === -1) {
          state.student_observations.push(studentObservation)
        } else {
          Vue.set(state.student_observations, index, studentObservation)
        }
      })
    },

    create: (state, payload) => {
      state.student_observations.push(payload)
    },

    update: (state, payload) => {
      const index = state.student_observations.findIndex(studentObservation =>
        studentObservation.id === payload.id
      )

      Vue.set(state.student_observations, index, payload)
    },

    delete: (state, studentObservationId) => {
      const index = state.student_observations.findIndex(studentObservation =>
        studentObservation.id === studentObservationId
      )

      Vue.delete(state.student_observations, index)
    }
  },

  actions: {
    create: (context, studentObservation) => {
      studentObservation.school_id = context.rootState.school_id

      return StudentObservationApi.createStudentObservation(studentObservation).then(studentObservation => {
        context.commit('create', studentObservation)
        return studentObservation
      })
    },

    update: (context, studentObservation) => {
      return StudentObservationApi.updateStudentObservation(studentObservation).then(studentObservation => {
        context.commit('update', studentObservation)
        return studentObservation
      })
    },

    delete: (context, studentObservationId) => {
      return StudentObservationApi.deleteStudentObservation(studentObservationId).then(() => {
        context.commit('delete', studentObservationId)
      })
    },

    saveMany: (context, studentObservations) => {
      const promises = studentObservations.map(studentObservation => {
        studentObservation.school_id = context.rootState.school_id

        return studentObservation.id
          ? StudentObservationApi.updateStudentObservation(studentObservation).then(studentObservation => {
            context.commit('update', studentObservation)
            return studentObservation
          })
          : StudentObservationApi.createStudentObservation(studentObservation).then(studentObservation => {
            context.commit('create', studentObservation)
            return studentObservation
          })
      })

      return Promise.all(promises)
    },

    load: (context, filter) => {
      context.commit('setAll', [])

      return StudentObservationApi.getStudentObservations(filter).then(evaluations => {
        context.commit('setAll', evaluations)
      })
    },

    unload: context => {
      context.commit('setAll', [])
    }
  }
}
