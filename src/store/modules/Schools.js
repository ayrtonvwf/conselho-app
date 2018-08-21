import SchoolApi from '../../services/api/School'

export default {
  namespaced: true,

  state: {
    schools: []
  },

  getters: {
    getSchools: state => {
      return state.schools
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.schools = payload
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

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(schools => {
        context.commit('setAll', schools)
      })
    }
  }
}
