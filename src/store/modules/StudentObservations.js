import Vue from 'vue'
import StudentObservationApi from '../../services/api/StudentObservation'

export default {
  namespaced: true,

  state: {
    student_observations: [],
    loaded: false
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
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.student_observations = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.student_observations.toArray()
    },

    getAllFromAPI: () => {
      return StudentObservationApi.getStudentObservations()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(studentObservations => {
        context.commit('setAll', studentObservations)
        context.commit('setLoaded')
      })
    },

    create: (context, studentObservation) => {
      const db = context.rootState.db

      studentObservation.school_id = context.rootState.school_id

      return StudentObservationApi.createStudentObservation(studentObservation).then(studentObservation =>
        db.student_observations.put(studentObservation).then(() => studentObservation)
      ).then(studentObservation => {
        context.commit('create', studentObservation)
        return studentObservation
      })
    },

    update: (context, studentObservation) => {
      const db = context.rootState.db

      return StudentObservationApi.updateStudentObservation(studentObservation).then(studentObservation =>
        db.student_observations.put(studentObservation).then(() => studentObservation)
      ).then(studentObservation => {
        context.commit('update', studentObservation)
        return studentObservation
      })
    },

    delete: (context, studentObservationId) => {
      const db = context.rootState.db

      return StudentObservationApi.deleteStudentObservation(studentObservationId).then(() =>
        db.student_observations.delete(studentObservationId)
      ).then(() => {
        context.commit('delete', studentObservationId)
      })
    },

    saveMany: (context, studentObservations) => {
      const db = context.rootState.db

      const promises = studentObservations.map(studentObservation => {
        if (studentObservation.id) {
          return StudentObservationApi.updateStudentObservation(studentObservation)
        }

        return StudentObservationApi.createStudentObservation(studentObservation)
      })

      return Promise.all(promises).then(studentObservations =>
        db.student_observations.bulkPut(studentObservations).then(() => studentObservations)
      ).then(studentObservations => {
        context.commit('setMany', studentObservations)
      })
    }
  }
}
