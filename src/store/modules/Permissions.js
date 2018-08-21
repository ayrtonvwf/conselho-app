import PermissionApi from '../../services/api/Permission'

export default {
  namespaced: true,

  state: {
    permissions: []
  },

  getters: {
    getPermissions: state => {
      return state.permissions
    },

    getOrderedPermissions: state => {
      return state.permissions.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', {ignorePunctuation: true})
      )
    }
  },

  mutations: {
    setAll: (state, payload) => {
      state.permissions = payload
    }
  },

  actions: {
    getAllFromDb: context => {
      const db = context.rootState.db

      return db.permissions.toArray()
    },

    getAllFromAPI: () => {
      return PermissionApi.getPermissions()
    },

    loadFromDb: context => {
      context.dispatch('getAllFromDb').then(permissions => {
        context.commit('setAll', permissions)
      })
    }
  }
}
