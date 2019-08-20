import Vue from 'vue'
import GradeObservationApi from '../../services/api/GradeObservation'

export default {
  namespaced: true,

  state: {
    grade_observations: []
  },

  getters: {
    getGradeObservations: state => {
      return state.grade_observations
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.grade_observations = payload
    },

    create: (state, payload) => {
      state.grade_observations.push(payload)
    },

    update: (state, payload) => {
      const index = state.grade_observations.findIndex(gradeObservation =>
        gradeObservation.id === payload.id
      )

      Vue.set(state.grade_observations, index, payload)
    },

    delete: (state, gradeObservationId) => {
      const index = state.grade_observations.findIndex(gradeObservation =>
        gradeObservation.id === gradeObservationId
      )

      Vue.delete(state.grade_observations, index)
    }
  },

  actions: {
    create: (context, gradeObservation) => {
      gradeObservation.school_id = context.rootState.school_id

      return GradeObservationApi.createGradeObservation(gradeObservation).then(gradeObservation => {
        context.commit('create', gradeObservation)
        return gradeObservation
      })
    },

    update: (context, gradeObservation) => {
      return GradeObservationApi.updateGradeObservation(gradeObservation).then(gradeObservation => {
        context.commit('update', gradeObservation)
        return gradeObservation
      })
    },

    delete: (context, gradeObservationId) => {
      return GradeObservationApi.deleteGradeObservation(gradeObservationId).then(() => {
        context.commit('delete', gradeObservationId)
      })
    },

    load: (context, filter) => {
      context.commit('setAll', [])

      return GradeObservationApi.getGradeObservations(filter).then(evaluations => {
        context.commit('setAll', evaluations)
      })
    },

    unload: (context) => {
      return context.commit('setAll', [])
    }
  }
}
