import RoleTypeApi from '../../services/api/RoleType'

export default {
  namespaced: true,

  state: {
    role_types: []
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

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(roleTypes => {
        context.commit('setAll', roleTypes)
      })
    }
  }
}
