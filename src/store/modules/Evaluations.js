import Vue from 'vue'
import EvaluationApi from '../../services/api/Evaluation'

export default {
  namespaced: true,

  state: {
    evaluations: []
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
    }
  },

  actions: {
    create: (context, evaluation) => {
      evaluation.school_id = context.rootState.school_id

      return EvaluationApi.createEvaluation(evaluation).then(evaluation => {
        context.commit('create', evaluation)
        return evaluation
      })
    },

    update: (context, evaluation) => {
      return EvaluationApi.updateEvaluation(evaluation).then(evaluation => {
        context.commit('update', evaluation)
        return evaluation
      })
    },

    saveMany: (context, evaluations) => {
      return EvaluationApi.putEvaluations(evaluations).then(evaluations => {
        context.commit('setMany', evaluations)
      })
    },

    load: (context, filter) => {
      context.commit('setAll', [])

      return EvaluationApi.getEvaluations(filter).then(evaluations => {
        context.commit('setAll', evaluations)
      })
    },

    unload: (context) => {
      return context.commit('setAll', [])
    }
  }
}
