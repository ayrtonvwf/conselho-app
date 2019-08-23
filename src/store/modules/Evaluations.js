import Vue from 'vue'
import EvaluationApi from '../../services/api/Evaluation'

export default {
  namespaced: true,

  state: {
    evaluations: [],
    filter: {},
    loaded_at: undefined
  },

  getters: {
    getEvaluations: state => {
      return state.evaluations
    },

    getByStudent: state => studentId => {
      return state.evaluations.filter(evaluation => evaluation.student_id === studentId)
    },

    getLoadedAt: state => {
      return state.loaded_at
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

    renewLoadedAt: (state) => {
      state.loaded_at = Date.now()
    },

    setFilter: (state, filter) => {
      state.filter = filter
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
        evaluations.forEach(evaluation => {
          if (evaluation.updated_at) {
            context.commit('update', evaluation)
          } else {
            context.commit('create', evaluation)
          }
        })
        context.commit('renewLoadedAt')
      })
    },

    load: (context, filter) => {
      context.commit('setAll', [])
      context.commit('setFilter', filter)

      return EvaluationApi.getEvaluations(filter).then(evaluations => {
        context.commit('setAll', evaluations)
        context.commit('renewLoadedAt')
      })
    },

    unload: (context) => {
      context.commit('setAll', [])
      context.commit('renewLoadedAt')
    },

    reload: (context) => {
      return context.dispatch('load', context.state.filter)
    }
  }
}
