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
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.grade_observations.toArray()
    },

    getAllFromAPI: () => {
      return GradeObservationApi.getGradeObservations()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(gradeObservations => {
        context.commit('setAll', gradeObservations)
      })
    },

    create: (context, gradeObservation) => {
      const db = context.rootState.db

      gradeObservation.school_id = context.rootState.school_id

      return GradeObservationApi.createGradeObservation(gradeObservation).then(gradeObservation =>
        db.grade_observations.put(gradeObservation).then(() => gradeObservation)
      ).then(gradeObservation => {
        context.commit('create', gradeObservation)
        return gradeObservation
      })
    },

    update: (context, gradeObservation) => {
      const db = context.rootState.db

      return GradeObservationApi.updateGradeObservation(gradeObservation).then(gradeObservation =>
        db.grade_observations.put(gradeObservation).then(() => gradeObservation)
      ).then(gradeObservation => {
        context.commit('update', gradeObservation)
        return gradeObservation
      })
    }
  }
}
