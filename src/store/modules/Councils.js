import Vue from 'vue'
import CouncilApi from '../../services/api/Council'

export default {
  namespaced: true,

  state: {
    loaded: false,
    councils: []
  },

  getters: {
    getCouncils: state => {
      return state.councils
    },

    getOrderedCouncils: state => {
      return state.councils.sort((a, b) =>
        a.start_date === b.start_date ? 0 : (a.start_date > b.start_date ? -1 : 1)
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.councils = payload
    },

    create: (state, payload) => {
      state.councils.push(payload)
    },

    update: (state, payload) => {
      const index = state.councils.findIndex(council =>
        council.id === payload.id
      )

      Vue.set(state.councils, index, payload)
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.councils = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.councils.toArray()
    },

    getAllFromAPI: () => {
      return CouncilApi.getCouncils()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(councils => {
        context.commit('setAll', councils)
        context.commit('setLoaded')
      })
    },

    create: (context, council) => {
      const db = context.rootState.db

      council.school_id = context.rootState.school_id

      return CouncilApi.createCouncil(council).then(council =>
        db.councils.put(council).then(() => council)
      ).then(council => {
        context.commit('create', council)
        return council
      })
    },

    update: (context, council) => {
      const db = context.rootState.db

      return CouncilApi.updateCouncil(council).then(council =>
        db.councils.put(council).then(() => council)
      ).then(council => {
        context.commit('update', council)
        return council
      })
    }
  }
}
