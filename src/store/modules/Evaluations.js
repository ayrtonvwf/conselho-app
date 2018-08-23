import Vue from 'vue'
import EvaluationApi from '../../services/api/Evaluation'

export default {
  namespaced: true,

  state: {
    evaluations: [],
    loaded: false
  },

  getters: {
    getEvaluations: state => {
      return state.evaluations
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.evaluations = payload
    },

    create: (state, payload) => {
      state.evaluations.push(payload)
    },

    update: (state, payload) => {
      const index = state.evaluations.findIndex(evaluation =>
        evaluation.id === payload.id
      )

      Vue.set(state.evaluations, index, payload)
    },

    setMany: (state, evaluations) => {
      evaluations.map(evaluation => {
        const index = state.evaluations.findIndex(findEvaluation =>
          findEvaluation.id === evaluation.id
        )

        if (index === -1) {
          state.evaluations.push(evaluation)
        } else {
          Vue.set(state.evaluations, index, evaluation)
        }
      })
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.evaluations = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.evaluations.toArray()
    },

    getAllFromAPI: () => {
      return EvaluationApi.getEvaluations()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(evaluations => {
        context.commit('setAll', evaluations)
        context.commit('setLoaded')
      })
    },

    create: (context, evaluation) => {
      const db = context.rootState.db

      evaluation.school_id = context.rootState.school_id

      return EvaluationApi.createEvaluation(evaluation).then(evaluation =>
        db.evaluations.put(evaluation).then(() => evaluation)
      ).then(evaluation => {
        context.commit('create', evaluation)
        return evaluation
      })
    },

    update: (context, evaluation) => {
      const db = context.rootState.db

      return EvaluationApi.updateEvaluation(evaluation).then(evaluation =>
        db.evaluations.put(evaluation).then(() => evaluation)
      ).then(evaluation => {
        context.commit('update', evaluation)
        return evaluation
      })
    },

    saveMany: (context, evaluations) => {
      const db = context.rootState.db

      const promises = evaluations.map(evaluation => {
        if (evaluation.id) {
          return EvaluationApi.updateEvaluation(evaluation)
        }

        return EvaluationApi.createEvaluation(evaluation)
      })

      return Promise.all(promises).then(evaluations =>
        db.evaluations.bulkPut(evaluations).then(() => evaluations)
      ).then(evaluations => {
        context.commit('setMany', evaluations)
      })
    }
  }
}
