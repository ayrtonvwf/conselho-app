import SchoolApi from '../../services/api/School'

export default {
  namespaced: true,

  state: {
    schools: [],
    loaded: false
  },

  getters: {
    getSchools: state => {
      return state.schools
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.schools = payload
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.schools = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.schools.toArray()
    },

    getAllFromAPI: () => {
      return SchoolApi.getSchools()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      return context.dispatch('getAllFromDb').then(schools => {
        context.commit('setAll', schools)
        context.commit('setLoaded')
      })
    }
  }
}
