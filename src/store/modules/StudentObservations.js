import Vue from 'vue'
import StudentObservationApi from '../../services/api/StudentObservation'

export default {
  namespaced: true,

  state: {
    student_observations: [],
    loaded_at: undefined
  },

  getters: {
    getStudentObservations: state => {
      return state.student_observations
    },

    getByStudent: state => studentId => {
      return state.student_observations.filter(studentObservation => studentObservation.student_id === studentId)
    },

    getLoadedAt: state => {
      return state.loaded_at
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
    },

    renewLoadedAt: (state) => {
      state.loaded_at = Date.now()
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

      return Promise.all(promises).then(() => {
        context.commit('renewLoadedAt')
      })
    },

    load: (context, filter) => {
      context.commit('setAll', [])

      return StudentObservationApi.getStudentObservations(filter).then(evaluations => {
        context.commit('setAll', evaluations)
        context.commit('renewLoadedAt')
      })
    },

    unload: context => {
      context.commit('setAll', [])
      context.commit('renewLoadedAt')
    }
  }
}
