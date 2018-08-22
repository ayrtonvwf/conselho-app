import RoleTypeApi from '../../services/api/RoleType'

export default {
  namespaced: true,

  state: {
    role_types: [],
    loaded: false
  },

  getters: {
    getRoleTypes: state => {
      return state.role_types
    },

    getOrderedRoleTypes: state => {
      return state.role_types.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.role_types = payload
    },

    setLoaded: (state, status) => {
      if (status === undefined) {
        status = true
      }
      state.loaded = status
    },

    unload: state => {
      state.loaded = false
      state.role_types = []
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.role_types.toArray()
    },

    getAllFromAPI: () => {
      return RoleTypeApi.getRoleTypes()
    },

    loadFromDb: (context, force) => {
      if (!force && context.state.loaded) {
        return
      }

      context.commit('setLoaded', false)

      context.dispatch('getAllFromDb').then(roleTypes => {
        context.commit('setAll', roleTypes)
        context.commit('setLoaded')
      })
    }
  }
}
